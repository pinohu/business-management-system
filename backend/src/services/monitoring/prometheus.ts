import { Registry, Counter, Gauge, Histogram } from 'prom-client';
import { DatabaseMonitor } from './database';
import { logger } from '../../utils/logger';

export class PrometheusMetrics {
    private static instance: PrometheusMetrics;
    private registry: Registry;
    private dbMonitor: DatabaseMonitor;

    // Database metrics
    private dbConnections: Gauge;
    private dbSlowQueries: Counter;
    private dbQueryDuration: Histogram;
    private dbPoolUtilization: Gauge;
    private dbErrors: Counter;

    // Application metrics
    private httpRequests: Counter;
    private httpRequestDuration: Histogram;
    private httpErrors: Counter;
    private activeUsers: Gauge;

    private constructor() {
        this.registry = new Registry();
        this.dbMonitor = DatabaseMonitor.getInstance();

        // Initialize database metrics
        this.dbConnections = new Gauge({
            name: 'db_connections_total',
            help: 'Total number of database connections',
            labelNames: ['state']
        });

        this.dbSlowQueries = new Counter({
            name: 'db_slow_queries_total',
            help: 'Total number of slow database queries'
        });

        this.dbQueryDuration = new Histogram({
            name: 'db_query_duration_seconds',
            help: 'Database query duration in seconds',
            buckets: [0.1, 0.5, 1, 2, 5]
        });

        this.dbPoolUtilization = new Gauge({
            name: 'db_pool_utilization',
            help: 'Database connection pool utilization'
        });

        this.dbErrors = new Counter({
            name: 'db_errors_total',
            help: 'Total number of database errors',
            labelNames: ['type']
        });

        // Initialize application metrics
        this.httpRequests = new Counter({
            name: 'http_requests_total',
            help: 'Total number of HTTP requests',
            labelNames: ['method', 'route', 'status']
        });

        this.httpRequestDuration = new Histogram({
            name: 'http_request_duration_seconds',
            help: 'HTTP request duration in seconds',
            buckets: [0.1, 0.5, 1, 2, 5]
        });

        this.httpErrors = new Counter({
            name: 'http_errors_total',
            help: 'Total number of HTTP errors',
            labelNames: ['type']
        });

        this.activeUsers = new Gauge({
            name: 'active_users',
            help: 'Number of active users'
        });

        // Register all metrics
        this.registry.registerMetric(this.dbConnections);
        this.registry.registerMetric(this.dbSlowQueries);
        this.registry.registerMetric(this.dbQueryDuration);
        this.registry.registerMetric(this.dbPoolUtilization);
        this.registry.registerMetric(this.dbErrors);
        this.registry.registerMetric(this.httpRequests);
        this.registry.registerMetric(this.httpRequestDuration);
        this.registry.registerMetric(this.httpErrors);
        this.registry.registerMetric(this.activeUsers);
    }

    public static getInstance(): PrometheusMetrics {
        if (!PrometheusMetrics.instance) {
            PrometheusMetrics.instance = new PrometheusMetrics();
        }
        return PrometheusMetrics.instance;
    }

    public async collectMetrics(): Promise<string> {
        try {
            // Collect database metrics
            const dbMetrics = await this.dbMonitor.getCurrentMetrics();
            if (dbMetrics) {
                this.dbConnections.set({ state: 'active' }, dbMetrics.activeConnections);
                this.dbSlowQueries.inc(dbMetrics.slowQueries);
                this.dbPoolUtilization.set(dbMetrics.activeConnections / dbMetrics.poolSize);
            }

            return await this.registry.metrics();
        } catch (error) {
            logger.error('Error collecting Prometheus metrics:', error);
            return '';
        }
    }

    // Database metric methods
    public recordQueryDuration(duration: number): void {
        this.dbQueryDuration.observe(duration);
    }

    public recordDbError(type: string): void {
        this.dbErrors.inc({ type });
    }

    // HTTP metric methods
    public recordHttpRequest(method: string, route: string, status: number): void {
        this.httpRequests.inc({ method, route, status: status.toString() });
    }

    public recordHttpRequestDuration(duration: number): void {
        this.httpRequestDuration.observe(duration);
    }

    public recordHttpError(type: string): void {
        this.httpErrors.inc({ type });
    }

    // User metric methods
    public setActiveUsers(count: number): void {
        this.activeUsers.set(count);
    }
}
