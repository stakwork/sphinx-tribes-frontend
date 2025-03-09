import { v4 as uuidv4 } from 'uuid';
import { getHost } from './host';

export const URL = (() => {
  const isCodespaces = window.location.hostname.includes('app.github.dev');

  if (isCodespaces) {
    return `wss://${getHost()}/websocket`;
  }

  if (getHost().includes('people-test.sphinx.chat')) {
    return `wss://${getHost()}/websocket`;
  }

  return process.env.NODE_ENV !== 'development'
    ? `wss://${getHost()}/websocket`
    : `ws://${getHost()}/websocket`;
})();

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

let socket: WebSocket | null = null;
let lastActiveTime: number = Date.now();
const STALE_THRESHOLD = 5 * 60 * 1000;

export const updateLastActiveTime = (): void => {
  lastActiveTime = Date.now();
  localStorage.setItem('websocket_last_active', lastActiveTime.toString());
};

export const createSocketInstance = (): WebSocket => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    const webssocketToken = localStorage.getItem('websocket_token');
    let uniqueID = webssocketToken;

    if (uniqueID === null || uniqueID === '') {
      uniqueID = uuidv4();
      localStorage.setItem('websocket_token', uniqueID!);
    }

    if (socket) {
      try {
        socket.close();
      } catch (e) {
        console.error('Error closing existing socket:', e);
      }
    }

    socket = new WebSocket(`${URL}?uniqueId=${uniqueID}`);

    updateLastActiveTime();

    socket.onclose = () => {
      console.log('WebSocket connection closed from index');
      setTimeout(createSocketInstance, 500);
    };
    socket.onerror = (error: any) => {
      console.error('WebSocket error:', error);
      setTimeout(createSocketInstance, 1000);
    };
  }

  return socket;
};

export const checkSocketFreshness = (): boolean => {
  const now = Date.now();
  const storedTime = localStorage.getItem('websocket_last_active');
  if (storedTime) {
    lastActiveTime = parseInt(storedTime, 10);
  }

  const isFresh = now - lastActiveTime < STALE_THRESHOLD;

  if (!isFresh || !socket || socket.readyState !== WebSocket.OPEN) {
    console.log('Socket connection stale or not open, reconnecting...');
    createSocketInstance();
    return false;
  }

  return true;
};

export const getSocketInstance = (): WebSocket => {
  if (!socket) {
    throw new Error('Socket instance not created. Call createSocketInstance first.');
  }

  checkSocketFreshness();

  return socket;
};
