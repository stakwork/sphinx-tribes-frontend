import { describe, it, expect, beforeEach } from '@jest/globals';

global.fetch = jest.fn();

const mockNodes = [
  {
    external_ip: 'http://valid-ip-1',
    alias: 'testAlias1',
    authToken: 'validToken1'
  },
  {
    external_ip: 'http://valid-ip-2',
    alias: 'testAlias2',
    authToken: 'validToken2'
  }
];

async function postAllUsersToTribe(nodes: any[]) {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    try {
      await fetch(`${node.external_ip}/profile`, {
        method: 'POST',
        body: JSON.stringify({
          price_to_meet: 0,
          description: `Testing out how this works by ${node.alias}`,
          owner_alias: `${node.alias}`,
          img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQR9dAUM-b34F_a6DMw8D6fQ_Y0LUIAVzvfCw&usqp=CAU'
        }),
        headers: { 'x-user-token': `${node.authToken}` }
      });
    } catch (error) {
      console.log(`Error creating user on bounty platform: ${JSON.stringify(error)}`);
    }
  }
}

describe('postAllUsersToTribe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Successfully posts multiple users', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;

    await postAllUsersToTribe(mockNodes);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenNthCalledWith(1, 'http://valid-ip-1/profile', expect.any(Object));
    expect(mockFetch).toHaveBeenNthCalledWith(2, 'http://valid-ip-2/profile', expect.any(Object));
  });

  it('Handles empty nodes array', async () => {
    const mockFetch = jest.fn();
    global.fetch = mockFetch;

    await postAllUsersToTribe([]);

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('Handles node with missing properties', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;

    const incompleteNode = [{ external_ip: 'http://valid-ip' }];
    await postAllUsersToTribe(incompleteNode);

    expect(mockFetch).toHaveBeenCalledWith(
      'http://valid-ip/profile',
      expect.objectContaining({
        body: expect.stringContaining('undefined')
      })
    );
  });

  it('Handles fetch failure', async () => {
    const mockError = new Error('Network error');
    const mockFetch = jest.fn().mockRejectedValue(mockError);
    global.fetch = mockFetch;
    const consoleSpy = jest.spyOn(console, 'log');

    await postAllUsersToTribe(mockNodes);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error creating user on bounty platform')
    );
  });

  it('Handles large number of nodes', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;

    const largeNodeArray = Array(100)
      .fill(null)
      .map((_: any, index: number) => ({
        external_ip: `http://valid-ip-${index}`,
        alias: `testAlias${index}`,
        authToken: `validToken${index}`
      }));

    await postAllUsersToTribe(largeNodeArray);

    expect(mockFetch).toHaveBeenCalledTimes(100);
  });

  it('Validates request payload structure', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;

    await postAllUsersToTribe([mockNodes[0]]);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('price_to_meet'),
        headers: expect.objectContaining({
          'x-user-token': expect.any(String)
        })
      })
    );
  });

  it('Handles special characters in alias', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;

    const nodeWithSpecialChars = [
      {
        external_ip: 'http://valid-ip',
        alias: 'test@#$%^&*()_+',
        authToken: 'validToken'
      }
    ];

    await postAllUsersToTribe(nodeWithSpecialChars);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining('test@#$%^&*()_+')
      })
    );
  });

  it('Handles invalid external_ip format', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;

    const nodeWithInvalidIP = [
      {
        external_ip: 'invalid-url',
        alias: 'testAlias',
        authToken: 'validToken'
      }
    ];

    await postAllUsersToTribe(nodeWithInvalidIP);

    expect(mockFetch).toHaveBeenCalledWith('invalid-url/profile', expect.any(Object));
  });

  it('Handles concurrent requests', async () => {
    const mockFetch = jest
      .fn()
      .mockImplementation(
        () => new Promise((resolve: any) => setTimeout(resolve, Math.random() * 100))
      );
    global.fetch = mockFetch;

    await postAllUsersToTribe(mockNodes);

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('Maintains request order', async () => {
    const calls: number[] = [];
    const mockFetch = jest.fn().mockImplementation((url: string) => {
      const index = parseInt(url.split('-')[2]);
      calls.push(index);
      return Promise.resolve({ ok: true });
    });
    global.fetch = mockFetch;

    await postAllUsersToTribe([
      { external_ip: 'http://valid-ip-1', alias: 'test1', authToken: 'token1' },
      { external_ip: 'http://valid-ip-2', alias: 'test2', authToken: 'token2' }
    ]);

    expect(calls).toEqual([1, 2]);
  });
});
