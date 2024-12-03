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
  budget_success: 'budget_success',
  ticket_update: 'ticket_update'
};

let socket: WebSocket | null = null;

export const createSocketInstance = (): WebSocket => {
  if (!socket || !socket.OPEN) {
    socket = new WebSocket(URL);
  }
  return socket;
};

export const getSocketInstance = (): WebSocket => {
  if (!socket) {
    throw new Error('Socket instance not created. Call createSocketInstance first.');
  }
  return socket;
};
