import { logger } from './logger';
import { cacheService } from './cache';

class WebSocketService {
  constructor() {
    this.clients = new Map();
    this.subscriptions = new Map();
    this.reconnectAttempts = new Map();
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // 1 second
  }

  async initialize() {
    try {
      // Initialize WebSocket server
      this.setupWebSocketServer();
      logger.info('WebSocket service initialized successfully');
    } catch (error) {
      logger.error('Error initializing WebSocket service:', error);
      throw error;
    }
  }

  setupWebSocketServer() {
    // Implement WebSocket server setup
  }

  async handleConnection(socket) {
    const clientId = this.generateClientId();
    this.clients.set(clientId, socket);

    socket.on('message', async (message) => {
      await this.handleMessage(clientId, message);
    });

    socket.on('close', () => {
      this.handleDisconnection(clientId);
    });

    socket.on('error', (error) => {
      this.handleError(clientId, error);
    });

    return clientId;
  }

  async handleMessage(clientId, message) {
    try {
      const data = JSON.parse(message);
      const { type, payload } = data;

      switch (type) {
        case 'subscribe':
          await this.handleSubscribe(clientId, payload);
          break;
        case 'unsubscribe':
          await this.handleUnsubscribe(clientId, payload);
          break;
        case 'ping':
          await this.handlePing(clientId);
          break;
        default:
          logger.warn(`Unknown message type: ${type}`);
      }
    } catch (error) {
      logger.error('Error handling WebSocket message:', error);
      this.sendError(clientId, 'Invalid message format');
    }
  }

  async handleSubscribe(clientId, channels) {
    for (const channel of channels) {
      if (!this.subscriptions.has(channel)) {
        this.subscriptions.set(channel, new Set());
      }
      this.subscriptions.get(channel).add(clientId);
    }
  }

  async handleUnsubscribe(clientId, channels) {
    for (const channel of channels) {
      const subscribers = this.subscriptions.get(channel);
      if (subscribers) {
        subscribers.delete(clientId);
      }
    }
  }

  async handlePing(clientId) {
    this.sendToClient(clientId, { type: 'pong' });
  }

  handleDisconnection(clientId) {
    this.clients.delete(clientId);
    this.removeClientFromSubscriptions(clientId);
    this.reconnectAttempts.delete(clientId);
  }

  handleError(clientId, error) {
    logger.error(`WebSocket error for client ${clientId}:`, error);
    this.handleDisconnection(clientId);
  }

  removeClientFromSubscriptions(clientId) {
    for (const [channel, subscribers] of this.subscriptions.entries()) {
      subscribers.delete(clientId);
      if (subscribers.size === 0) {
        this.subscriptions.delete(channel);
      }
    }
  }

  async broadcast(channel, data) {
    const subscribers = this.subscriptions.get(channel);
    if (!subscribers) return;

    const message = {
      type: 'broadcast',
      channel,
      data,
      timestamp: new Date().toISOString(),
    };

    for (const clientId of subscribers) {
      await this.sendToClient(clientId, message);
    }
  }

  async sendToClient(clientId, data) {
    const socket = this.clients.get(clientId);
    if (!socket) return;

    try {
      socket.send(JSON.stringify(data));
    } catch (error) {
      logger.error(`Error sending message to client ${clientId}:`, error);
      this.handleDisconnection(clientId);
    }
  }

  sendError(clientId, message) {
    this.sendToClient(clientId, {
      type: 'error',
      message,
      timestamp: new Date().toISOString(),
    });
  }

  generateClientId() {
    return Math.random().toString(36).substring(2, 15);
  }

  async notifyInvoiceUpdate(invoice) {
    await this.broadcast('invoices', {
      action: 'update',
      invoice,
    });
  }

  async notifyPaymentReceived(payment) {
    await this.broadcast('payments', {
      action: 'received',
      payment,
    });
  }

  async notifyNewMessage(message) {
    await this.broadcast('messages', {
      action: 'new',
      message,
    });
  }

  async notifyProjectUpdate(project) {
    await this.broadcast('projects', {
      action: 'update',
      project,
    });
  }

  async notifyClientUpdate(client) {
    await this.broadcast('clients', {
      action: 'update',
      client,
    });
  }

  async notifySystemAlert(alert) {
    await this.broadcast('alerts', {
      action: 'new',
      alert,
    });
  }

  async notifyUserStatus(userId, status) {
    await this.broadcast('users', {
      action: 'status',
      userId,
      status,
    });
  }

  async notifyTaskUpdate(task) {
    await this.broadcast('tasks', {
      action: 'update',
      task,
    });
  }

  async notifyTimeEntryUpdate(timeEntry) {
    await this.broadcast('timeEntries', {
      action: 'update',
      timeEntry,
    });
  }

  async notifyExpenseUpdate(expense) {
    await this.broadcast('expenses', {
      action: 'update',
      expense,
    });
  }

  async notifyReportGeneration(report) {
    await this.broadcast('reports', {
      action: 'generated',
      report,
    });
  }

  async notifySystemMetrics(metrics) {
    await this.broadcast('metrics', {
      action: 'update',
      metrics,
    });
  }

  async notifySecurityAlert(alert) {
    await this.broadcast('security', {
      action: 'alert',
      alert,
    });
  }

  async notifyComplianceUpdate(update) {
    await this.broadcast('compliance', {
      action: 'update',
      update,
    });
  }

  async notifyAuditLogEntry(entry) {
    await this.broadcast('audit', {
      action: 'new',
      entry,
    });
  }
}

export const webSocketService = new WebSocketService(); 