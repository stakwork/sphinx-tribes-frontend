import { waitFor } from '@testing-library/react';
import { createSocketInstance } from 'config/socket';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid')
}));

describe('createSocketInstance', () => {
  let mockWebSocket: jest.Mock;
  let mockLocalStorage: { [key: string]: string | null };

  beforeEach(() => {
    mockWebSocket = jest.fn(() => ({
      onclose: null,
      onerror: null,
      OPEN: true
    }));
    global.WebSocket = mockWebSocket as any;

    mockLocalStorage = {};
    Storage.prototype.getItem = jest.fn((key: string) => mockLocalStorage[key] || null);
    Storage.prototype.setItem = jest.fn((key: string, value: string) => {
      mockLocalStorage[key] = value;
    });

    jest.resetModules();
  });

  test('Standard Socket Creation', () => {
    mockLocalStorage['websocket_token'] = 'existing-token';
    const socket = createSocketInstance();

    expect(mockWebSocket).toHaveBeenCalledWith(expect.stringContaining('?uniqueId=existing-token'));
    expect(socket).toBeDefined();
    expect(socket.onclose).toBeDefined();
    expect(socket.onerror).toBeDefined();
  });

  test('Reusing Existing Socket', () => {
    const socket1 = createSocketInstance();
    const firstCallCount = mockWebSocket.mock.calls.length;

    const socket2 = createSocketInstance();

    expect(socket1).toBe(socket2);
    expect(mockWebSocket.mock.calls.length).toBe(firstCallCount);
  });

  test('Empty LocalStorage Token', () => {
    mockLocalStorage['websocket_token'] = '';
    createSocketInstance();

    waitFor(() => {
      expect(uuidv4).toHaveBeenCalled();
      expect(mockWebSocket).toHaveBeenCalledWith(expect.stringContaining('?uniqueId=mock-uuid'));
      expect(mockLocalStorage['websocket_token']).toBe('mock-uuid');
    });
  });

  test('Null LocalStorage Token', () => {
    mockLocalStorage['websocket_token'] = null;
    createSocketInstance();

    waitFor(() => {
      expect(uuidv4).toHaveBeenCalled();
      expect(mockWebSocket).toHaveBeenCalledWith(expect.stringContaining('?uniqueId=mock-uuid'));

      expect(mockLocalStorage['websocket_token']).toBe('mock-uuid');
    });
  });

  test('URL Construction Based on Environment', () => {
    const originalEnv = process.env.NODE_ENV;

    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'production',
      configurable: true
    });
    createSocketInstance();
    waitFor(() => {
      expect(mockWebSocket).toHaveBeenCalledWith(expect.stringContaining('wss://'));
    });

    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      configurable: true
    });
    createSocketInstance();
    waitFor(() => {
      expect(mockWebSocket).toHaveBeenCalledWith(expect.stringContaining('ws://'));
    });

    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      configurable: true
    });
  });
});
