import { v4 as uuidv4 } from 'uuid';
import { getHost } from './host';

export const URL = (() => {
  const isCodespaces = window.location.hostname.includes('app.github.dev');

  if (isCodespaces) {
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

export const createSocketInstance = (): WebSocket => {
  if (!socket || !socket.OPEN) {
    socket = new WebSocket(URL);
    // get socket from localStorage
    const webssocketToken = localStorage.getItem('websocket_token');
    let uniqueID = webssocketToken;

    if (uniqueID === null || uniqueID === '') {
      uniqueID = uuidv4();
      localStorage.setItem('websocket_token', uniqueID!);
    }

    socket = new WebSocket(`${URL}?uniqueId=${uniqueID}`);

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

export const getSocketInstance = (): WebSocket => {
  if (!socket) {
    throw new Error('Socket instance not created. Call createSocketInstance first.');
  }
  return socket;
};
