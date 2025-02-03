import { FetchMock } from 'jest-fetch-mock';

interface TestNode {
  alias?: string;
  external_ip: string;
  adminToken: string;
  pubkey: string;
  routeHint: string;
}

interface TestMockResponse {
  status: number;
  body: string;
  error?: Error;
}

interface TestCase {
  name: string;
  nodes: TestNode[];
  mockResponses: TestMockResponse[];
  expectedErrors: string[];
}

// Helper function definition
async function postV2UsersToTribe(nodes: TestNode[]): Promise<void> {
  for (const node of nodes) {
    const botUrl = `${node.external_ip}/signed_timestamp`;
    const tribesUrl = 'http://localhost:13000';

    try {
      const res = await fetch(botUrl, {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'x-admin-token': node.adminToken }
      });

      const resJson = await res.json();
      const profileUrl = `${tribesUrl}/person?token=${resJson.sig}`;

      const node_alias: string = node.alias === 'alice' ? 'raph' : 'evan';

      await fetch(profileUrl, {
        method: 'POST',
        body: JSON.stringify({
          owner_alias: node_alias,
          owner_pubkey: node.pubkey,
          owner_route_hint: node.routeHint,
          owner_contact_key: node.pubkey,
          description: 'V2 Description',
          img: '',
          tags: [],
          price_to_meet: 0,
          extras: {},
          new_ticket_time: 0
        })
      });
    } catch (error) {
      console.log(`Error creating user on bounty platform: ${JSON.stringify(error)}`);
    }
  }
}

describe('postV2UsersToTribe', () => {
  let fetchMock: FetchMock;
  let consoleOutput: string[] = [];

  beforeEach((): void => {
    fetchMock = global.fetch as unknown as FetchMock;
    fetchMock.resetMocks();

    consoleOutput = [];
    jest.spyOn(console, 'log').mockImplementation((msg: string): void => {
      consoleOutput.push(msg);
    });
  });

  afterEach((): void => {
    jest.restoreAllMocks();
  });

  const testCases: TestCase[] = [
    {
      name: "Single Node with Alias 'alice'",
      nodes: [{
        alias: 'alice',
        external_ip: 'http://example.com',
        adminToken: 'validToken',
        pubkey: 'pubkey1',
        routeHint: 'routeHint1'
      }],
      mockResponses: [
        { status: 200, body: JSON.stringify({ sig: 'validSig' }) },
        { status: 200, body: '{}' }
      ],
      expectedErrors: []
    },
    {
      name: "Single Node with Alias Other Than 'alice'",
      nodes: [{
        alias: 'bob',
        external_ip: 'http://example.com',
        adminToken: 'validToken',
        pubkey: 'pubkey2',
        routeHint: 'routeHint2'
      }],
      mockResponses: [
        { status: 200, body: JSON.stringify({ sig: 'validSig' }) },
        { status: 200, body: '{}' }
      ],
      expectedErrors: []
    },
    {
      name: 'Empty Nodes List',
      nodes: [],
      mockResponses: [],
      expectedErrors: []
    },
    {
      name: 'Node with Missing Alias',
      nodes: [{
        external_ip: 'http://example.com',
        adminToken: 'validToken',
        pubkey: 'pubkey3',
        routeHint: 'routeHint3'
      }],
      mockResponses: [
        { status: 200, body: JSON.stringify({ sig: 'validSig' }) },
        { status: 200, body: '{}' }
      ],
      expectedErrors: []
    },
    {
      name: 'Invalid Admin Token',
      nodes: [{
        alias: 'alice',
        external_ip: 'http://example.com',
        adminToken: 'invalidToken',
        pubkey: 'pubkey4',
        routeHint: 'routeHint4'
      }],
      mockResponses: [
        { status: 401, body: JSON.stringify({ error: 'Unauthorized' }), error: new Error('Unauthorized') }
      ],
      expectedErrors: ['Error creating user on bounty platform: {"error":"Unauthorized"}']
    },
    {
      name: 'Network Failure on Bot URL',
      nodes: [{
        alias: 'alice',
        external_ip: 'http://example.com',
        adminToken: 'validToken',
        pubkey: 'pubkey5',
        routeHint: 'routeHint5'
      }],
      mockResponses: [
        { status: 500, body: '', error: new Error('network error') }
      ],
      expectedErrors: ['Error creating user on bounty platform: "network error"']
    },
    {
      name: 'Invalid JSON Response from Bot URL',
      nodes: [{
        alias: 'alice',
        external_ip: 'http://example.com',
        adminToken: 'validToken',
        pubkey: 'pubkey6',
        routeHint: 'routeHint6'
      }],
      mockResponses: [
        { status: 200, body: 'invalid json' }
      ],
      expectedErrors: ['Error creating user on bounty platform']
    }
  ];

  testCases.forEach(({ name, nodes, mockResponses, expectedErrors }: TestCase): void => {
    it(name, async (): Promise<void> => {
      mockResponses.forEach(({ status, body, error }: TestMockResponse): void => {
        if (error) {
          fetchMock.mockRejectOnce(error);
        } else {
          fetchMock.mockResponseOnce(body, { status });
        }
      });

      await postV2UsersToTribe(nodes);

      expectedErrors.forEach((expectedError: string): void => {
        expect(consoleOutput).toContain(expectedError);
      });

      expect(fetchMock).toHaveBeenCalledTimes(mockResponses.length);
    });
  });
});
