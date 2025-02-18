import { v4 as uuidv4 } from 'uuid';
import { getHost } from './host';

export const URL =
  process.env.NODE_ENV !== 'development'
    ? `wss://${getHost()}/websocket`
    : `ws://${getHost()}/websocket`;

export const SOCKET_MSG = {
  keysend_error: 'keysend_error',
  keysend_failed: 'keysend_failed',
  keysend_pending: 'keysend_pending',
  keysend_success: 'keysend_success',
  invoice_success: 'invoice_success',
  payment_success: 'payment_success',
  assign_success: 'assign_success',
  lnauth_success: 'lnauth_success',
  user_connect: 'user_connect',
  budget_success: 'budget_success'
};

class WebSocketManager {
  public socket: WebSocket | null = null;
  private sessionId: string | null = null;
  private lastActiveTime: number = Date.now();
  private readonly STALE_THRESHOLD = 5 * 60 * 1000;
  private reconnectInterval: number = 3 * 1000;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeFromStorage();
    this.setupVisibilityHandler();
    this.connect();
    this.startStaleCheck();
  }

  private initializeFromStorage() {
    this.sessionId = localStorage.getItem('websocket_token') || uuidv4();
    localStorage.setItem('websocket_token', this.sessionId);
  }

  private setupVisibilityHandler() {
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('focus', this.checkConnectionFreshness);
  }

  private handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      this.checkConnectionFreshness();
    }
  };

  private checkConnectionFreshness = () => {
    const now = Date.now();
    if (now - this.lastActiveTime > this.STALE_THRESHOLD) {
      console.warn('WebSocket connection stale, reconnecting...');
      this.reconnect();
    }
  };

  private startStaleCheck() {
    setInterval(() => {
      this.checkConnectionFreshness();
    }, this.STALE_THRESHOLD);
  }

  private updateLastActive() {
    this.lastActiveTime = Date.now();
    localStorage.setItem('websocket_last_active', this.lastActiveTime.toString());
  }

  public connect() {
    if (this.socket) {
      this.socket.close();
    }

    this.socket = new WebSocket(`${URL}?uniqueId=${this.sessionId}`);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.updateLastActive();
    };

    this.socket.onmessage = (event: MessageEvent) => {
      this.updateLastActive();
      try {
        const data = JSON.parse(event.data);
        if (data.msg === SOCKET_MSG.user_connect) {
          this.sessionId = data.body || this.sessionId;
          localStorage.setItem('websocket_token', this.sessionId as string);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    this.socket.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
      this.scheduleReconnect();
    };

    this.socket.onclose = () => {
      console.warn('WebSocket disconnected, attempting reconnect...');
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.reconnectTimeout = setTimeout(() => this.reconnect(), this.reconnectInterval);
  }

  public reconnect() {
    console.log('Reconnecting WebSocket...');
    this.connect();
  }
}

export const websocketManager = new WebSocketManager();
