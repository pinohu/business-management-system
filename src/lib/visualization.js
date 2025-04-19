import { logger } from './logger';
import { cacheService } from './cache';

class VisualizationService {
  constructor() {
    this.cacheKey = 'visualization:';
    this.cacheTTL = 3600; // 1 hour
    this.chartTypes = {
      line: 'line',
      bar: 'bar',
      pie: 'pie',
      scatter: 'scatter',
      area: 'area',
      radar: 'radar',
      gauge: 'gauge',
      heatmap: 'heatmap',
      treemap: 'treemap',
      sunburst: 'sunburst',
    };
  }

  async initialize() {
    try {
      await this.setupVisualizationHandlers();
      logger.info('Visualization service initialized successfully');
    } catch (error) {
      logger.error('Error initializing visualization service:', error);
      throw error;
    }
  }

  async setupVisualizationHandlers() {
    // Setup visualization handlers for different chart types
  }

  async createChart(data, options) {
    try {
      const cacheKey = `${this.cacheKey}chart:${JSON.stringify(options)}`;
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) return cachedData;

      const chart = await this.generateChart(data, options);
      await cacheService.set(cacheKey, chart, this.cacheTTL);
      return chart;
    } catch (error) {
      logger.error('Error creating chart:', error);
      throw error;
    }
  }

  async createDashboard(data, options) {
    try {
      const cacheKey = `${this.cacheKey}dashboard:${JSON.stringify(options)}`;
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) return cachedData;

      const dashboard = await this.generateDashboard(data, options);
      await cacheService.set(cacheKey, dashboard, this.cacheTTL);
      return dashboard;
    } catch (error) {
      logger.error('Error creating dashboard:', error);
      throw error;
    }
  }

  async createReport(data, options) {
    try {
      const cacheKey = `${this.cacheKey}report:${JSON.stringify(options)}`;
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) return cachedData;

      const report = await this.generateReport(data, options);
      await cacheService.set(cacheKey, report, this.cacheTTL);
      return report;
    } catch (error) {
      logger.error('Error creating report:', error);
      throw error;
    }
  }

  async generateChart(data, options) {
    const {
      type = this.chartTypes.line,
      title,
      description,
      xAxis,
      yAxis,
      series,
      colors,
      animations,
      interactions,
      tooltips,
      legend,
      grid,
      theme,
    } = options;

    return {
      type,
      title,
      description,
      data: {
        labels: data.labels,
        datasets: data.datasets.map((dataset, index) => ({
          ...dataset,
          borderColor: colors?.[index] || this.getDefaultColor(index),
          backgroundColor: this.getBackgroundColor(colors?.[index] || this.getDefaultColor(index)),
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: animations || {
          duration: 1000,
          easing: 'easeInOutQuart',
        },
        interaction: interactions || {
          mode: 'index',
          intersect: false,
        },
        tooltips: tooltips || {
          enabled: true,
          mode: 'index',
          intersect: false,
        },
        legend: legend || {
          display: true,
          position: 'top',
        },
        grid: grid || {
          display: true,
          drawBorder: true,
          drawOnChartArea: true,
        },
        scales: {
          x: {
            ...xAxis,
            grid: {
              display: grid?.display || true,
            },
          },
          y: {
            ...yAxis,
            grid: {
              display: grid?.display || true,
            },
          },
        },
        theme: theme || 'light',
      },
    };
  }

  async generateDashboard(data, options) {
    const {
      title,
      description,
      layout,
      charts,
      filters,
      refreshInterval,
      theme,
    } = options;

    return {
      title,
      description,
      layout: layout || 'grid',
      charts: await Promise.all(
        charts.map(chart => this.createChart(data[chart.dataKey], chart.options))
      ),
      filters: filters || [],
      refreshInterval: refreshInterval || 300000, // 5 minutes
      theme: theme || 'light',
    };
  }

  async generateReport(data, options) {
    const {
      title,
      description,
      sections,
      charts,
      tables,
      filters,
      exportOptions,
      theme,
    } = options;

    return {
      title,
      description,
      sections: await Promise.all(
        sections.map(section => this.generateReportSection(section, data))
      ),
      charts: await Promise.all(
        charts.map(chart => this.createChart(data[chart.dataKey], chart.options))
      ),
      tables: await Promise.all(
        tables.map(table => this.generateTable(data[table.dataKey], table.options))
      ),
      filters: filters || [],
      exportOptions: exportOptions || ['pdf', 'excel', 'csv'],
      theme: theme || 'light',
    };
  }

  async generateReportSection(section, data) {
    return {
      title: section.title,
      description: section.description,
      content: await this.generateSectionContent(section, data),
      charts: await Promise.all(
        (section.charts || []).map(chart =>
          this.createChart(data[chart.dataKey], chart.options)
        )
      ),
      tables: await Promise.all(
        (section.tables || []).map(table =>
          this.generateTable(data[table.dataKey], table.options)
        )
      ),
    };
  }

  async generateTable(data, options) {
    const {
      columns,
      sorting,
      filtering,
      pagination,
      selection,
      export,
      theme,
    } = options;

    return {
      columns: columns || Object.keys(data[0] || {}),
      data: data || [],
      options: {
        sorting: sorting || {
          enabled: true,
          multiSort: true,
        },
        filtering: filtering || {
          enabled: true,
          caseInsensitive: true,
        },
        pagination: pagination || {
          enabled: true,
          pageSize: 10,
        },
        selection: selection || {
          enabled: false,
          multiSelect: false,
        },
        export: export || {
          enabled: true,
          formats: ['csv', 'excel'],
        },
        theme: theme || 'light',
      },
    };
  }

  async generateSectionContent(section, data) {
    // Implement section content generation based on section type
    return {
      type: section.type,
      content: data[section.dataKey] || [],
    };
  }

  getDefaultColor(index) {
    const colors = [
      '#4a90e2',
      '#50e3c2',
      '#f5a623',
      '#7ed321',
      '#bd10e0',
      '#9013fe',
      '#417505',
      '#9b9b9b',
    ];
    return colors[index % colors.length];
  }

  getBackgroundColor(color) {
    // Implement background color generation with opacity
    return color + '40'; // 25% opacity
  }

  // Specific chart creation methods
  async createIncomeChart(data) {
    return this.createChart(data, {
      type: this.chartTypes.line,
      title: 'Income Overview',
      description: 'Monthly income trends and projections',
      xAxis: {
        type: 'time',
        time: {
          unit: 'month',
        },
      },
      yAxis: {
        beginAtZero: true,
        ticks: {
          callback: value => `$${value.toLocaleString()}`,
        },
      },
      series: [
        {
          label: 'Actual Income',
          data: data.actual,
        },
        {
          label: 'Projected Income',
          data: data.projected,
        },
      ],
    });
  }

  async createClientDistributionChart(data) {
    return this.createChart(data, {
      type: this.chartTypes.pie,
      title: 'Client Distribution',
      description: 'Distribution of clients by industry',
      series: [
        {
          label: 'Clients by Industry',
          data: data.industries,
        },
      ],
    });
  }

  async createProjectStatusChart(data) {
    return this.createChart(data, {
      type: this.chartTypes.bar,
      title: 'Project Status',
      description: 'Current status of all projects',
      xAxis: {
        type: 'category',
        categories: ['Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled'],
      },
      yAxis: {
        beginAtZero: true,
      },
      series: [
        {
          label: 'Number of Projects',
          data: data.statuses,
        },
      ],
    });
  }

  async createInvoiceStatusChart(data) {
    return this.createChart(data, {
      type: this.chartTypes.bar,
      title: 'Invoice Status',
      description: 'Current status of all invoices',
      xAxis: {
        type: 'category',
        categories: ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'],
      },
      yAxis: {
        beginAtZero: true,
        ticks: {
          callback: value => `$${value.toLocaleString()}`,
        },
      },
      series: [
        {
          label: 'Invoice Amount',
          data: data.statuses,
        },
      ],
    });
  }

  async createTimeTrackingChart(data) {
    return this.createChart(data, {
      type: this.chartTypes.area,
      title: 'Time Tracking',
      description: 'Hours tracked by project',
      xAxis: {
        type: 'category',
        categories: data.projects,
      },
      yAxis: {
        beginAtZero: true,
        title: 'Hours',
      },
      series: [
        {
          label: 'Hours Tracked',
          data: data.hours,
        },
      ],
    });
  }

  async createExpenseDistributionChart(data) {
    return this.createChart(data, {
      type: this.chartTypes.pie,
      title: 'Expense Distribution',
      description: 'Distribution of expenses by category',
      series: [
        {
          label: 'Expenses by Category',
          data: data.categories,
        },
      ],
    });
  }

  async createPerformanceMetricsChart(data) {
    return this.createChart(data, {
      type: this.chartTypes.radar,
      title: 'Performance Metrics',
      description: 'Key performance indicators',
      scales: {
        r: {
          beginAtZero: true,
          ticks: {
            stepSize: 20,
          },
        },
      },
      series: [
        {
          label: 'Current Performance',
          data: data.current,
        },
        {
          label: 'Target Performance',
          data: data.target,
        },
      ],
    });
  }
}

export const visualizationService = new VisualizationService(); 