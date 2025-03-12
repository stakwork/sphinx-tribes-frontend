import { render, waitFor } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import TokenRefresh from '../TokenRefresh.tsx';

const extractIsTokenExpiring = () => {
  const component = render(<TokenRefresh />);

  const instance = component.container.firstChild as any;

  return (token: any) =>
    instance?.isTokenExpiring?.(token) ?? {
      expired: true,
      message: 'Error: Could not access isTokenExpiring function'
    };
};

describe('TokenRefresh Component', () => {
  let originalAtob: (input: string) => string;
  let isTokenExpiring: (token: any) => { expired: boolean; message: string };

  beforeAll(() => {
    originalAtob = global.atob;
    isTokenExpiring = extractIsTokenExpiring();
  });

  afterAll(() => {
    global.atob = originalAtob;
  });

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => 1000000000000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createMockJWT = (payload: any): string => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = 'mock_signature';
    return `${header}.${encodedPayload}.${signature}`;
  };

  describe('isTokenExpiring Function', () => {
    it('Valid Token Not Expiring Soon', () => {
      const currentTime = Math.floor(Date.now() / 1000);
      const token = createMockJWT({ exp: currentTime + 7200 });
      const result = isTokenExpiring(token);
      waitFor(() => {
        expect(result).toEqual({
          expired: false,
          message: 'Token is valid and not expiring soon'
        });
      });
    });

    it('Already Expired Token', () => {
      const currentTime = Math.floor(Date.now() / 1000);
      const token = createMockJWT({ exp: currentTime - 3600 });
      const result = isTokenExpiring(token);
      waitFor(() => {
        expect(result).toEqual({
          expired: true,
          message: 'Token has already expired'
        });
      });
    });

    it('Token Expiring Within One Hour (Generic Case)', () => {
      const currentTime = Math.floor(Date.now() / 1000);
      const token = createMockJWT({ exp: currentTime + 1800 });
      const result = isTokenExpiring(token);
      waitFor(() => {
        expect(result).toEqual({
          expired: true,
          message: 'Token will expire within an hour'
        });
      });
    });

    it('Token Expiring Exactly At the One-Hour Threshold', () => {
      const currentTime = Math.floor(Date.now() / 1000);
      const token = createMockJWT({ exp: currentTime + 3600 });
      const result = isTokenExpiring(token);
      waitFor(() => {
        expect(result).toEqual({
          expired: true,
          message: 'Token will expire within an hour'
        });
      });
    });

    it('Token That Expires Exactly At the Current Time', () => {
      const currentTime = Math.floor(Date.now() / 1000);
      const token = createMockJWT({ exp: currentTime });
      const result = isTokenExpiring(token);
      waitFor(() => {
        expect(result).toEqual({
          expired: true,
          message: 'Token has already expired'
        });
      });
    });

    it('Token with No exp Field', () => {
      const token = createMockJWT({ someOtherField: 'value' });
      const result = isTokenExpiring(token);
      waitFor(() => {
        expect(result).toEqual({
          expired: true,
          message: 'Error decoding token: Token does not contain an expiration time'
        });
      });
    });

    it('Malformed JWT Token (Incorrect Number of Parts)', () => {
      const token = 'invalid.token';
      const result = isTokenExpiring(token);
      waitFor(() => {
        expect(result).toEqual({
          expired: true,
          message: 'Error decoding token: Invalid JWT token'
        });
      });
    });

    it('Token of the Wrong Data Type (Non-string Input)', () => {
      const token = null;
      const result = isTokenExpiring(token);
      waitFor(() => {
        expect(result).toEqual({
          expired: true,
          message: expect.stringContaining('Error decoding token:')
        });
      });
    });

    it('Token with Invalid Base64 Payload (Corrupt Payload) - Option A', () => {
      global.atob = jest.fn().mockImplementation(() => {
        throw new Error('Invalid character');
      });

      const token = 'header.invalid_base64.signature';
      const result = isTokenExpiring(token);
      waitFor(() => {
        expect(result).toEqual({
          expired: true,
          message: expect.stringContaining('Error decoding token:')
        });
      });
    });

    it('Token with Invalid Base64 Payload (Corrupt Payload) - Option B', () => {
      global.atob = jest.fn().mockReturnValue('not-json');

      const token = 'header.payload.signature';
      const result = isTokenExpiring(token);
      waitFor(() => {
        expect(result).toEqual({
          expired: true,
          message: expect.stringContaining('Error decoding token:')
        });
      });
    });
  });
});
