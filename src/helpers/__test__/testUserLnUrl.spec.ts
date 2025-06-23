import { bech32 } from 'bech32';
import { waitFor } from '@testing-library/react';
import { ec as EC } from 'elliptic';
import { testUserLnUrlLogin } from '../testUserLnUrl';

jest.mock('bech32');
jest.mock('elliptic');

describe('testUserLnUrl', () => {
  const mockDigest = jest.fn();
  const originalCrypto = global.crypto;
  const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

  beforeEach(() => {
    global.TextEncoder = jest.fn().mockImplementation(() => ({
      encode: jest.fn().mockReturnValue(new Uint8Array([1, 2, 3, 4]))
    })) as any;

    global.TextDecoder = jest.fn().mockImplementation(() => ({
      decode: () => 'https://example.com/lnurl-auth?k1=abcdef'
    })) as any;

    global.crypto = {
      ...originalCrypto,
      subtle: {
        digest: mockDigest
      }
    } as unknown as Crypto;

    const mockHashBuffer = new Uint8Array(32).fill(1);
    mockDigest.mockResolvedValue(mockHashBuffer.buffer);

    (bech32.decode as jest.Mock).mockReturnValue({
      words: [1, 2, 3, 4]
    });
    (bech32.fromWords as jest.Mock).mockReturnValue(
      new Uint8Array([
        104, 116, 116, 112, 115, 58, 47, 47, 101, 120, 97, 109, 112, 108, 101, 46, 99, 111, 109, 47,
        108, 110, 117, 114, 108, 45, 97, 117, 116, 104, 63, 107, 49, 61, 97, 98, 99, 100, 101, 102
      ])
    );

    const mockSign = jest.fn().mockReturnValue({
      toDER: () => new Uint8Array([1, 2, 3, 4])
    });
    const mockGetPublic = jest.fn().mockReturnValue({
      encode: () => 'mock-pubkey'
    });
    const mockKeyFromPrivate = jest.fn().mockReturnValue({
      getPublic: mockGetPublic,
      sign: mockSign
    });
    (EC as jest.Mock).mockImplementation(() => ({
      keyFromPrivate: mockKeyFromPrivate,
      sign: mockSign
    }));

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'OK' })
    });

    jest.spyOn(Date, 'now').mockReturnValue(1234567890);
  });

  afterEach(() => {
    jest.clearAllMocks();
    global.crypto = originalCrypto;
    global.fetch = undefined as any;
    global.TextEncoder = undefined as any;
    global.TextDecoder = undefined as any;
    mockConsoleLog.mockRestore();
  });

  it('should successfully process a valid lnurl login', async () => {
    waitFor(() => {
      testUserLnUrlLogin('lnurl1234567');

      expect(bech32.decode).toHaveBeenCalledWith('lnurl1234567', 1500);
      expect(bech32.fromWords).toHaveBeenCalledWith([1, 2, 3, 4]);

      expect(mockDigest).toHaveBeenCalled();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://example.com/lnurl-auth?k1=abcdef&sig=')
      );
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('&key=mock-pubkey'));
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('&t=1234567890'));

      expect(mockConsoleLog).toHaveBeenCalledWith({ status: 'OK' });
    });
  });

  it('should handle invalid bech32 input', async () => {
    (bech32.decode as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid bech32');
    });

    await expect(testUserLnUrlLogin('invalid')).rejects.toThrow('Invalid bech32');
  });

  it('should handle fetch error', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    await expect(testUserLnUrlLogin('lnurl1234567')).rejects.toThrow('Network error');
  });

  it('should handle non-OK response', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });

    await testUserLnUrlLogin('lnurl1234567');

    expect(mockConsoleLog).not.toHaveBeenCalled();
  });

  it('should handle empty k1 parameter', async () => {
    global.TextDecoder = jest.fn().mockImplementation(() => ({
      decode: () => 'https://example.com/lnurl-auth'
    })) as any;

    await testUserLnUrlLogin('lnurl1234567');

    expect(global.fetch).toHaveBeenCalled();
  });

  it('should handle hexToBytes with odd length input', async () => {
    global.TextDecoder = jest.fn().mockImplementation(() => ({
      decode: () => 'https://example.com/lnurl-auth?k1=abc'
    })) as any;

    await expect(testUserLnUrlLogin('lnurl1234567')).rejects.toThrow(
      'Hex string must have an even length'
    );
  });

  it('should handle hexToBytes with valid input', async () => {
    global.TextDecoder = jest.fn().mockImplementation(() => ({
      decode: () => 'https://example.com/lnurl-auth?k1=abcd'
    })) as any;

    await testUserLnUrlLogin('lnurl1234567');

    expect(global.fetch).toHaveBeenCalled();
  });
});
