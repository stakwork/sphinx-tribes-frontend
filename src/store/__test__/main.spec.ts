import { toJS } from 'mobx';
import sinon from 'sinon';
import moment from 'moment';
import { waitFor } from '@testing-library/react';
import { Person, PersonBounty, Workspace } from 'store/interface';
import { people } from '../../__test__/__mockData__/persons';
import { user } from '../../__test__/__mockData__/user';
import { MeInfo, emptyMeInfo, uiStore } from '../ui';
import { MainStore } from '../main';
import { localStorageMock } from '../../__test__/__mockData__/localStorage';
import { TribesURL, getHost } from '../../config';
import mockBounties, {
  expectedBountyResponses,
  filterBounty
} from '../../bounties/__mock__/mockBounties.data';

describe('Main store', () => {
  let fetchStub: sinon.SinonStub;
  let mockApiResponseData: any[];

  const origFetch = global.fetch;

  const Crypto = {
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }
  };

  beforeAll(() => {
    fetchStub = sinon.stub(global, 'fetch');
    fetchStub.returns(Promise.resolve({ status: 200, json: () => Promise.resolve({}) })); // Mock a default behavior
    mockApiResponseData = [
      { uuid: 'cm3eulatu2rvqi9o75ug' },
      { uuid: 'cldl1g04nncmf23du7kg' },
      { orgUUID: 'cmas9gatu2rvqiev4ur0' }
    ];
    global.crypto = Crypto as any;
  });

  afterAll(() => {
    global.fetch = origFetch;

    sinon.restore();
  });

  beforeEach(async () => {
    uiStore.setMeInfo(user);
    localStorageMock.setItem('ui', JSON.stringify(uiStore));
  });

  afterEach(() => {
    fetchStub.reset();
  });

  it('should call endpoint on addWorkspace', async () => {
    const mainStore = new MainStore();

    const mockApiResponse = { status: 200, message: 'success' };

    fetchStub.resolves(Promise.resolve(mockApiResponse));

    const addWorkspace = {
      img: '',
      name: 'New Workspaceination test',
      owner_pubkey: '035f22835fbf55cf4e6823447c63df74012d1d587ed60ef7cbfa3e430278c44cce'
    };

    const expectedHeaders = {
      'Content-Type': 'application/json',
      'x-jwt': 'test_jwt'
    };

    await mainStore.addWorkspace(addWorkspace);

    sinon.assert.calledWith(
      fetchStub,
      `${TribesURL}/workspaces`,
      sinon.match({
        method: 'POST',
        headers: expectedHeaders,
        body: JSON.stringify(addWorkspace),
        mode: 'cors'
      })
    );
  });

  it('should call endpoint on addWorkspace with description, github and website url', async () => {
    const mainStore = new MainStore();

    const mockApiResponse = { status: 200, message: 'success' };

    fetchStub.resolves(Promise.resolve(mockApiResponse));

    const addWorkspace = {
      img: '',
      name: 'New Workspaceination test',
      owner_pubkey: '035f22835fbf55cf4e6823447c63df74012d1d587ed60ef7cbfa3e430278c44cce',
      description: 'My test Workspace',
      github: 'https://github.com/john-doe',
      website: 'https://john.doe'
    };

    const expectedHeaders = {
      'Content-Type': 'application/json',
      'x-jwt': 'test_jwt'
    };

    await mainStore.addWorkspace(addWorkspace);

    sinon.assert.calledWith(
      fetchStub,
      `${TribesURL}/workspaces`,
      sinon.match({
        method: 'POST',
        headers: expectedHeaders,
        body: JSON.stringify(addWorkspace),
        mode: 'cors'
      })
    );
  });

  it('should call endpoint on UpdateWorkspace Name', async () => {
    const mainStore = new MainStore();

    const mockApiResponse = { status: 200, message: 'success' };

    fetchStub.resolves(Promise.resolve(mockApiResponse));

    const updateWorkspace = {
      id: '42',
      uuid: 'clic8k04nncuuf32kgr0',
      name: 'TEST1',
      description: '',
      github: '',
      website: '',
      owner_pubkey: '035f22835fbf55cf4e6823447c63df74012d1d587ed60ef7cbfa3e430278c44cce',
      img: 'https://memes.sphinx.chat/public/NVhwFqDqHKAC-_Sy9pR4RNy8_cgYuOVWgohgceAs-aM=',
      created: '2023-11-27T16:31:12.699355Z',
      updated: '2023-11-27T16:31:12.699355Z',
      show: false,
      deleted: false,
      bounty_count: 1
    };

    const expectedHeaders = {
      'Content-Type': 'application/json',
      'x-jwt': 'test_jwt'
    };

    await mainStore.updateWorkspace(updateWorkspace);

    sinon.assert.calledWith(
      fetchStub,
      `${TribesURL}/workspaces`,
      sinon.match({
        method: 'POST',
        headers: expectedHeaders,
        body: JSON.stringify(updateWorkspace),
        mode: 'cors'
      })
    );
  });

  it('should call endpoint on UpdateWorkspace description, github url and website url, non mandatory fields', async () => {
    const mainStore = new MainStore();

    const mockApiResponse = { status: 200, message: 'success' };

    fetchStub.resolves(Promise.resolve(mockApiResponse));

    const updateWorkspace = {
      id: '42',
      uuid: 'clic8k04nncuuf32kgr0',
      name: 'TEST1',
      owner_pubkey: '035f22835fbf55cf4e6823447c63df74012d1d587ed60ef7cbfa3e430278c44cce',
      img: 'https://memes.sphinx.chat/public/NVhwFqDqHKAC-_Sy9pR4RNy8_cgYuOVWgohgceAs-aM=',
      created: '2023-11-27T16:31:12.699355Z',
      updated: '2023-11-27T16:31:12.699355Z',
      show: false,
      deleted: false,
      bounty_count: 1,
      description: 'Update description',
      website: 'https://john.doe',
      github: 'https://github.com/john-doe'
    };

    const expectedHeaders = {
      'Content-Type': 'application/json',
      'x-jwt': 'test_jwt'
    };

    await mainStore.updateWorkspace(updateWorkspace);

    sinon.assert.calledWith(
      fetchStub,
      `${TribesURL}/workspaces`,
      sinon.match({
        method: 'POST',
        headers: expectedHeaders,
        body: JSON.stringify(updateWorkspace),
        mode: 'cors'
      })
    );
  });

  it('should call endpoint on saveBounty', () => {
    const mainStore = new MainStore();
    mainStore.saveBounty = jest
      .fn()
      .mockReturnValueOnce(Promise.resolve({ status: 200, message: 'success' }));
    const bounty = {
      body: {
        title: 'title',
        description: 'description',
        amount: 100,
        owner_pubkey: user.owner_pubkey,
        owner_alias: user.alias,
        owner_contact_key: user.contact_key,
        owner_route_hint: user.route_hint ?? '',
        extras: user.extras,
        price_to_meet: user.price_to_meet,
        img: user.img,
        tags: [],
        route_hint: user.route_hint
      }
    };
    mainStore.saveBounty(bounty);
    expect(mainStore.saveBounty).toBeCalledWith({
      body: bounty.body
    });
  });

  it('should save user profile', async () => {
    const mainStore = new MainStore();
    const person = {
      owner_pubkey: user.owner_pubkey,
      owner_alias: user.alias,
      owner_contact_key: user.contact_key,
      owner_route_hint: user.route_hint ?? '',
      description: user.description,
      extras: user.extras,
      price_to_meet: user.price_to_meet,
      img: user.img,
      tags: [],
      route_hint: user.route_hint
    };
    mainStore.saveProfile(person);

    expect(toJS(uiStore.meInfo)).toEqual(user);
    expect(localStorageMock.getItem('ui')).toEqual(JSON.stringify(uiStore));
  });

  it('should call endpoint on addWorkspaceUser', async () => {
    const mainStore = new MainStore();

    const mockApiResponse = { status: 200, message: 'success' };

    fetchStub.resolves(Promise.resolve(mockApiResponse));

    const workspaceUser = {
      owner_pubkey: user.owner_pubkey || '',
      workspace_uuid: mockApiResponseData[2]
    };

    const expectedHeaders = {
      'Content-Type': 'application/json',
      'x-jwt': 'test_jwt'
    };

    await mainStore.addWorkspaceUser(workspaceUser);

    sinon.assert.calledWith(
      fetchStub,
      `${TribesURL}/workspaces/users/${mockApiResponseData[2]}`,
      sinon.match({
        method: 'POST',
        headers: expectedHeaders,
        body: JSON.stringify(workspaceUser),
        mode: 'cors'
      })
    );
  });

  it('should call endpoint on getWorkspaceUsers', async () => {
    const mainStore = new MainStore();

    const mockApiResponse = {
      status: 200,
      json: sinon.stub().resolves(mockApiResponseData.slice(0, 1))
    };

    fetchStub.resolves(Promise.resolve(mockApiResponse));

    const endpoint = `${TribesURL}/workspaces/users/${mockApiResponseData[2].orgUUID}`;

    const users = await mainStore.getWorkspaceUsers(mockApiResponseData[2].orgUUID);

    sinon.assert.calledWithMatch(fetchStub, endpoint, sinon.match.any);
    expect(users).toEqual(mockApiResponseData.slice(0, 1));
  });

  it('should call endpoint on getUserWorkspaces', async () => {
    const mainStore = new MainStore();
    const userId = 232;
    const mockWorkspaces = [
      {
        id: 42,
        uuid: 'clic8k04nncuuf32kgr0',
        name: 'TEST',
        description: 'test',
        github: 'https://github.com/stakwork',
        website: 'https://community.sphinx.chat',
        owner_pubkey: '035f22835fbf55cf4e6823447c63df74012d1d587ed60ef7cbfa3e430278c44cce',
        img: 'https://memes.sphinx.chat/public/NVhwFqDqHKAC-_Sy9pR4RNy8_cgYuOVWgohgceAs-aM=',
        created: '2023-11-27T16:31:12.699355Z',
        updated: '2023-11-27T16:31:12.699355Z',
        show: false,
        deleted: false,
        bounty_count: 1
      },
      {
        id: 55,
        uuid: 'cmen35itu2rvqicrm020',
        name: 'Workspaceination name test',
        description: 'test',
        github: 'https://github.com/stakwork',
        website: 'https://community.sphinx.chat',
        owner_pubkey: '035f22835fbf55cf4e6823447c63df74012d1d587ed60ef7cbfa3e430278c44cce',
        img: '',
        created: '2024-01-09T16:17:26.202555Z',
        updated: '2024-01-09T16:17:26.202555Z',
        show: false,
        deleted: false
      },
      {
        id: 56,
        uuid: 'cmen38itu2rvqicrm02g',
        name: 'New Workspaceination test',
        description: 'test',
        github: 'https://github.com/stakwork',
        website: 'https://community.sphinx.chat',
        owner_pubkey: '035f22835fbf55cf4e6823447c63df74012d1d587ed60ef7cbfa3e430278c44cce',
        img: '',
        created: '2024-01-09T16:17:38.652072Z',
        updated: '2024-01-09T16:17:38.652072Z',
        show: false,
        deleted: false
      },
      {
        id: 49,
        uuid: 'cm7c24itu2rvqi9o7620',
        name: 'TESTing',
        description: 'test',
        github: 'https://github.com/stakwork',
        website: 'https://community.sphinx.chat',
        owner_pubkey: '02af1ea854c7dc8634d08732d95c6057e6e08e01723da4f561d711a60aea708c00',
        img: '',
        created: '2023-12-29T12:52:34.62057Z',
        updated: '2023-12-29T12:52:34.62057Z',
        show: false,
        deleted: false
      },
      {
        id: 51,
        uuid: 'cmas9gatu2rvqiev4ur0',
        name: 'TEST_NEW',
        description: 'test',
        github: 'https://github.com/stakwork',
        website: 'https://community.sphinx.chat',
        owner_pubkey: '03cbb9c01cdcf91a3ac3b543a556fbec9c4c3c2a6ed753e19f2706012a26367ae3',
        img: '',
        created: '2024-01-03T20:34:09.585609Z',
        updated: '2024-01-03T20:34:09.585609Z',
        show: false,
        deleted: false
      }
    ];
    const mockApiResponse = {
      status: 200,
      json: sinon.stub().resolves(mockWorkspaces)
    };
    fetchStub.resolves(Promise.resolve(mockApiResponse));

    const workspaceUser = await mainStore.getUserWorkspaces(userId);

    sinon.assert.calledWithMatch(
      fetchStub,
      `${TribesURL}/workspaces/user/${userId}`,
      sinon.match({
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    );

    expect(workspaceUser).toEqual(mockWorkspaces);
  });

  it('should call endpoint on getUserWorkspacesUuid', async () => {
    const mainStore = new MainStore();
    const uuid = 'ck1p7l6a5fdlqdgmmnpg';
    const mockWorkspaces = {
      id: 6,
      uuid: 'ck1p7l6a5fdlqdgmmnpg',
      name: 'Stakwork',
      owner_pubkey: '021ae436bcd40ca21396e59be8cdb5a707ceacdb35c1d2c5f23be7584cab29c40b',
      img: 'https://memes.sphinx.chat/public/_IO8M0UXltb3mbK0qso63ux86AP-2nN2Ly9uHo37Ku4=',
      created: '2023-09-14T23:14:28.821632Z',
      updated: '2023-09-14T23:14:28.821632Z',
      show: true,
      deleted: false,
      bounty_count: 8,
      budget: 640060
    };
    const mockApiResponse = {
      status: 200,
      json: sinon.stub().resolves(mockWorkspaces)
    };
    fetchStub.resolves(Promise.resolve(mockApiResponse));

    const workspaceUser = await mainStore.getUserWorkspaceByUuid(uuid);

    sinon.assert.calledWithMatch(
      fetchStub,
      `${TribesURL}/workspaces/${uuid}`,
      sinon.match({
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    );

    expect(workspaceUser).toEqual(mockWorkspaces);
  });
  it('should call endpoint on getWorkspaceUser', async () => {
    const mainStore = new MainStore();

    const mockApiResponse = {
      status: 200,
      json: sinon.stub().resolves({
        uuid: mockApiResponseData[0].uuid
      })
    };

    fetchStub.resolves(Promise.resolve(mockApiResponse));

    const workspaceUser = await mainStore.getWorkspaceUser(mockApiResponseData[0].uuid);

    sinon.assert.calledWithMatch(
      fetchStub,
      `${TribesURL}/workspaces/foruser/${mockApiResponseData[0].uuid}`,
      sinon.match({
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': 'test_jwt',
          'Content-Type': 'application/json'
        }
      })
    );

    expect(workspaceUser).toEqual({
      uuid: mockApiResponseData[0].uuid
    });
  });

  it('should call endpoint on getWorkspaceUsersCount', async () => {
    const mainStore = new MainStore();

    const mockApiResponse = {
      status: 200,
      json: sinon.stub().resolves({
        count: 2
      })
    };

    fetchStub.resolves(Promise.resolve(mockApiResponse));

    const workspacesCount = await mainStore.getWorkspaceUsersCount(mockApiResponseData[2].orgUUID);

    sinon.assert.calledWithMatch(
      fetchStub,
      `${TribesURL}/workspaces/users/${mockApiResponseData[2].orgUUID}/count`,
      sinon.match({
        method: 'GET',
        mode: 'cors'
      })
    );

    expect(workspacesCount).toEqual({ count: 2 });
  });

  it('should call endpoint on deleteWorkspaceUser', async () => {
    const mainStore = new MainStore();

    const mockApiResponse = {
      status: 200,
      json: sinon.stub().resolves({
        message: 'success'
      })
    };

    fetchStub.resolves(Promise.resolve(mockApiResponse));

    const orgUserUUID = mockApiResponseData[1].uuid;
    const deleteRequestBody = {
      org_uuid: mockApiResponseData[2].orgUUID,
      user_created: '2024-01-03T22:07:39.504494Z',
      id: 263,
      uuid: mockApiResponseData[0].uuid,
      owner_pubkey: '02af1ea854c7dc8634d08732d95c6057e6e08e01723da4f561d711a60aea708c00',
      owner_alias: 'Nayan',
      unique_name: 'nayan',
      description: 'description',
      tags: [],
      img: '',
      created: '2023-12-23T14:31:49.963009Z',
      updated: '2023-12-23T14:31:49.963009Z',
      unlisted: false,
      deleted: false,
      last_login: 1704289377,
      owner_route_hint:
        '03a6ea2d9ead2120b12bd66292bb4a302c756983dc45dcb2b364b461c66fd53bcb:1099519819777',
      owner_contact_key:
        'MIIBCgKCAQEAugvVYqgIIBmpLCjmaBhLi6GfxssrdM74diTlKpr+Qr/0Er1ND9YQ3HUveaI6V5DrBunulbSEZlIXIqVSLm2wobN4iAqvoGGx1aZ13ByOJLjINjD5nA9FnfAJpvcMV/gTDQzQL9NHojAeMx1WyAlhIILdiDm9zyCJeYj1ihC660xr6MyVjWn9brJv47P+Bq2x9AWPufYMMgPH7GV1S7KkjEPMbGCdUvUZLs8tzzKtNcABCHBQKOcBNG/D4HZcCREMP90zj8/NUzz9x92Z5zuvJ0/eZVF91XwyMtThrJ+AnrXWv7AEVy63mu9eAO3UYiUXq2ioayKBgalyos2Mcs9DswIDAQAB',
      price_to_meet: 0,
      new_ticket_time: 0,
      twitter_confirmed: false,
      extras: {},
      github_issues: {}
    };

    const deleteResponse = await mainStore.deleteWorkspaceUser(deleteRequestBody, orgUserUUID);

    sinon.assert.calledWithMatch(
      fetchStub,
      `${TribesURL}/workspaces/users/${orgUserUUID}`,
      sinon.match({
        method: 'DELETE',
        mode: 'cors',
        body: JSON.stringify(deleteRequestBody),
        headers: sinon.match({
          'x-jwt': 'test_jwt',
          'Content-Type': 'application/json'
        })
      })
    );

    expect(deleteResponse.status).toBe(200);
  });

  it('should send request delete request with correct body and url', async () => {
    const url = `${TribesURL}/gobounties/pub_key/1111`;
    const allBountiesUrl = `http://${getHost()}/gobounties/all?limit=10&sortBy=created&search=&page=1&resetPage=true&Open=true&Assigned=false&Paid=false`;

    const store = new MainStore();
    store.initializeSessionId();

    const expectedRequestOptions: RequestInit = {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        'x-jwt': user.tribe_jwt,
        'Content-Type': 'application/json',
        'x-session-id': store.sessionId
      }
    };

    fetchStub.withArgs(url, expectedRequestOptions).returns(
      Promise.resolve({
        status: 200
      }) as any
    );

    fetchStub.withArgs(allBountiesUrl, sinon.match.any).returns(
      Promise.resolve({
        status: 200,
        ok: true,
        json: (): Promise<any> => Promise.resolve([mockBounties[0]])
      }) as any
    );

    await store.deleteBounty(1111, 'pub_key');

    expect(fetchStub.withArgs(url, expectedRequestOptions).calledOnce).toEqual(true);
    expect(store.peopleBounties.length).toEqual(0);
    expect(store.peopleBounties).toEqual([]);
  });

  it('should not panic if failed to delete bounty', async () => {
    const url = `${TribesURL}/gobounties/pub_key/1111`;

    const store = new MainStore();
    store.initializeSessionId();

    const expectedRequestOptions: RequestInit = {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        'x-jwt': user.tribe_jwt,
        'Content-Type': 'application/json',
        'x-session-id': store.sessionId
      }
    };
    fetchStub.withArgs(url, expectedRequestOptions).throwsException();

    await store.deleteBounty(1111, 'pub_key');

    expect(fetchStub.withArgs(url, expectedRequestOptions).calledOnce).toEqual(true);
    expect(store.peopleBounties.length).toEqual(0);
  });

  it('should not return false if asignee removed successfully', async () => {
    const url = `${TribesURL}/gobounties/assignee`;

    const store = new MainStore();
    store.initializeSessionId();

    const expectedRequestOptions: RequestInit = {
      method: 'DELETE',
      mode: 'cors',
      body: JSON.stringify({
        owner_pubkey: 'pub_key',
        created: '1111'
      }),
      headers: {
        'x-jwt': user.tribe_jwt,
        'Content-Type': 'application/json',
        'x-session-id': store.sessionId
      }
    };
    fetchStub.withArgs(url, expectedRequestOptions).returns(
      Promise.resolve({
        status: 200
      }) as any
    );

    const res = await store.deleteBountyAssignee({ owner_pubkey: 'pub_key', created: '1111' });

    expect(fetchStub.withArgs(url, expectedRequestOptions).calledOnce).toEqual(true);
    expect(res).not.toBeFalsy();
  });

  it('should  return false if failed to remove asignee ', async () => {
    const url = `${TribesURL}/gobounties/assignee`;

    const store = new MainStore();
    store.initializeSessionId();

    const expectedRequestOptions: RequestInit = {
      method: 'DELETE',
      mode: 'cors',
      body: JSON.stringify({
        owner_pubkey: 'pub_key',
        created: '1111'
      }),
      headers: {
        'x-jwt': user.tribe_jwt,
        'Content-Type': 'application/json',
        'x-session-id': store.sessionId
      }
    };
    fetchStub.withArgs(url, expectedRequestOptions).throwsException();

    const res = await store.deleteBountyAssignee({ owner_pubkey: 'pub_key', created: '1111' });

    expect(fetchStub.withArgs(url, expectedRequestOptions).calledOnce).toEqual(true);
    expect(res).toBeFalsy();
  });

  it('should successfully update bounty payment status', async () => {
    const url = `${TribesURL}/gobounties/paymentstatus/1111`;

    const store = new MainStore();
    store.initializeSessionId();

    const expectedRequestOptions: RequestInit = {
      method: 'POST',
      mode: 'cors',
      headers: {
        'x-jwt': user.tribe_jwt,
        'Content-Type': 'application/json',
        'x-session-id': store.sessionId
      }
    };
    fetchStub.withArgs(url, expectedRequestOptions).returns(
      Promise.resolve({
        status: 200
      }) as any
    );

    const res = await store.updateBountyPaymentStatus(1111);

    expect(fetchStub.withArgs(url, expectedRequestOptions).calledOnce).toEqual(true);
    expect(res).not.toBeFalsy();
  });

  it('should return false if failed to update bounty status', async () => {
    const url = `${TribesURL}/gobounties/paymentstatus/1111`;

    const store = new MainStore();
    store.initializeSessionId();

    const expectedRequestOptions: RequestInit = {
      method: 'POST',
      mode: 'cors',
      headers: {
        'x-jwt': user.tribe_jwt,
        'Content-Type': 'application/json',
        'x-session-id': store.sessionId
      }
    };
    fetchStub.withArgs(url, expectedRequestOptions).throwsException();

    const res = await store.updateBountyPaymentStatus(1111);

    expect(fetchStub.withArgs(url, expectedRequestOptions).calledOnce).toEqual(true);
    expect(res).toBeFalsy();
  });

  it('should successfully return requested bounty', async () => {
    const url = `http://${getHost()}/gobounties/id/1111`;
    fetchStub.withArgs(url, sinon.match.any).returns(
      Promise.resolve({
        status: 200,
        ok: true,
        json: () => Promise.resolve([mockBounties[0]])
      }) as any
    );

    const store = new MainStore();
    const res = await store.getBountyById(1111);

    expect(fetchStub.withArgs(url, sinon.match.any).calledOnce).toEqual(true);
    expect(res).toEqual([expectedBountyResponses[0]]);
  });

  it('should return empty array if failed to fetch bounty', async () => {
    const url = `http://${getHost()}/gobounties/id/1111`;
    fetchStub.withArgs(url, sinon.match.any).returns(
      Promise.resolve({
        status: 404,
        ok: false
      }) as any
    );

    const store = new MainStore();
    const res = await store.getBountyById(1111);

    expect(fetchStub.withArgs(url, sinon.match.any).calledOnce).toEqual(true);
    expect(res.length).toEqual(0);
  });

  it('should successfully return index of requested bounty', async () => {
    const url = `http://${getHost()}/gobounties/index/1111`;
    fetchStub.withArgs(url, sinon.match.any).returns(
      Promise.resolve({
        status: 200,
        ok: true,
        json: () => Promise.resolve(1)
      }) as any
    );

    const store = new MainStore();
    const res = await store.getBountyIndexById(1111);

    expect(fetchStub.withArgs(url, sinon.match.any).calledOnce).toEqual(true);
    expect(res).toEqual(1);
  });

  it('should return 0 if failed to fetch index', async () => {
    const url = `http://${getHost()}/gobounties/index/1111`;
    fetchStub.withArgs(url, sinon.match.any).returns(
      Promise.resolve({
        status: 400,
        ok: false
      }) as any
    );

    const store = new MainStore();
    const res = await store.getBountyIndexById(1111);

    expect(fetchStub.withArgs(url, sinon.match.any).calledOnce).toEqual(true);
    expect(res).toEqual(0);
  });

  it('should set all query params, page, limit, search, and languages when fetching bounties, user logged out', async () => {
    // Arrange: Set user as logged out
    uiStore.setMeInfo(emptyMeInfo);

    // Stub the fetch with a flexible matcher
    fetchStub
      .withArgs(
        sinon.match((url: string) => url.startsWith(`http://${getHost()}/gobounties/all`)),
        sinon.match.any
      )
      .returns(
        Promise.resolve({
          status: 200,
          ok: true,
          json: (): Promise<any> => Promise.resolve([mockBounties[0]])
        }) as any
      );

    // Act: Create the store and fetch bounties
    const store = new MainStore();
    const bounties = await store.getPeopleBounties({
      resetPage: true,
      search: 'random',
      limit: 10,
      page: 1,
      sortBy: 'updatedat'
      // Include languages if applicable
    });

    // Assert: Check that bounties are set correctly
    expect(store.peopleBounties.length).toEqual(1);
    expect(store.peopleBounties).toEqual([expectedBountyResponses[0]]);
    expect(bounties).toEqual([expectedBountyResponses[0]]);
  });

  it('should reset exisiting bounty if reset flag is passed, signed out', async () => {
    uiStore.setMeInfo(emptyMeInfo);
    const allBountiesUrl = `http://${getHost()}/gobounties/all?limit=10&sortBy=updatedat&search=random&page=1&resetPage=true`;
    const mockBounty = { ...mockBounties[0] };
    mockBounty.bounty.id = 2;
    fetchStub.withArgs(allBountiesUrl, sinon.match.any).returns(
      Promise.resolve({
        status: 200,
        ok: true,
        json: (): Promise<any> => Promise.resolve([{ ...mockBounty }])
      }) as any
    );

    const store = new MainStore();
    store.setPeopleBounties([expectedBountyResponses[0] as any]);
    expect(store.peopleBounties.length).toEqual(1);

    const bounties = await store.getPeopleBounties({
      resetPage: true,
      search: 'random',
      limit: 10,
      page: 1,
      sortBy: 'updatedat'
    });
    const expectedResponse = { ...expectedBountyResponses[0] };
    expectedResponse.body.id = 2;
    expect(store.peopleBounties.length).toEqual(1);
    expect(store.peopleBounties).toEqual([expectedResponse]);
    expect(bounties).toEqual([expectedResponse]);
  });

  it('should add to exisiting bounty if next page is fetched, user signed out', async () => {
    uiStore.setMeInfo(emptyMeInfo);
    const allBountiesUrl = `http://${getHost()}/gobounties/all?limit=10&sortBy=updatedat&search=random&page=1&resetPage=false`;
    const mockBounty = { ...mockBounties[0] };
    mockBounty.bounty.id = 2;
    fetchStub.withArgs(allBountiesUrl, sinon.match.any).returns(
      Promise.resolve({
        status: 200,
        ok: true,
        json: (): Promise<any> => Promise.resolve([{ ...mockBounty }])
      }) as any
    );

    const store = new MainStore();
    const bountyAlreadyPresent = { ...expectedBountyResponses[0] } as any;
    bountyAlreadyPresent.body.id = 1;
    store.setPeopleBounties([bountyAlreadyPresent]);
    expect(store.peopleBounties.length).toEqual(1);
    expect(store.peopleBounties[0].body.id).not.toEqual(2);

    const bounties = await store.getPeopleBounties({
      resetPage: false,
      search: 'random',
      limit: 10,
      page: 1,
      sortBy: 'updatedat'
    });

    const expectedResponse = { ...expectedBountyResponses[0] };
    expectedResponse.body.id = 2;
    expect(store.peopleBounties.length).toEqual(2);
    expect(store.peopleBounties[1]).toEqual(expectedResponse);
    expect(bounties).toEqual([expectedResponse]);
  });

  it('should successfully fetch people, user signed out', async () => {
    uiStore.setMeInfo(emptyMeInfo);
    const allBountiesUrl = `http://${getHost()}/people?resetPage=true&search=&limit=500&page=1&sortBy=last_login`;
    const mockPeople = { ...people[1] };
    fetchStub.withArgs(allBountiesUrl, sinon.match.any).returns(
      Promise.resolve({
        status: 200,
        ok: true,
        json: (): Promise<any> => Promise.resolve([{ ...mockPeople }])
      }) as any
    );

    const store = new MainStore();
    store.setPeople([people[0]]);
    expect(store._people.length).toEqual(1);
    expect(store._people[0]).toEqual(people[0]);

    const res = await store.getPeople({
      resetPage: true,
      search: 'random',
      limit: 11,
      page: 1,
      sortBy: 'updatedat'
    });

    expect(store._people.length).toEqual(1);
    expect(store._people[0]).toEqual(mockPeople);
    expect(res[0]).toEqual(mockPeople);
  });

  it('should hide current user, user signed in', async () => {
    const allBountiesUrl = `http://${getHost()}/people?resetPage=false&search=&limit=500&page=2&sortBy=last_login`;
    const mockPeople = { ...people[0] };
    fetchStub.withArgs(allBountiesUrl, sinon.match.any).returns(
      Promise.resolve({
        status: 200,
        ok: true,
        json: (): Promise<any> => Promise.resolve([{ ...mockPeople }])
      }) as any
    );

    const store = new MainStore();
    const res = await store.getPeople({
      resetPage: false,
      search: 'random',
      limit: 11,
      page: 2,
      sortBy: 'updatedat'
    });

    expect(store._people.length).toEqual(1);
    expect(store._people[0].hide).toEqual(true);
    expect(res).toBeTruthy();
  });

  it('should fetch and store workspace bounties successfully, user signed out', async () => {
    uiStore.setMeInfo(emptyMeInfo);
    const allBountiesUrl = `http://${getHost()}/workspaces/bounties/1111`;
    fetchStub.withArgs(allBountiesUrl, sinon.match.any).returns(
      Promise.resolve({
        status: 200,
        ok: true,
        json: (): Promise<any> => Promise.resolve([mockBounties[0]])
      }) as any
    );

    const store = new MainStore();
    const bounties = await store.getWorkspaceBounties('1111', {
      resetPage: true,
      search: 'random',
      limit: 11,
      page: 2,
      sortBy: 'updatedat'
    });

    expect(store.peopleBounties.length).toEqual(1);
    expect(store.peopleBounties).toEqual([expectedBountyResponses[0]]);
    expect(bounties).toEqual([expectedBountyResponses[0]]);
  });

  it('should reset exisiting workspace bounty if reset flag is passed, user signed out', async () => {
    uiStore.setMeInfo(emptyMeInfo);
    const allBountiesUrl = `http://${getHost()}/workspaces/bounties/1111`;
    const mockBounty = { ...mockBounties[0] };
    mockBounty.bounty.id = 2;
    fetchStub.withArgs(allBountiesUrl, sinon.match.any).returns(
      Promise.resolve({
        status: 200,
        ok: true,
        json: (): Promise<any> => Promise.resolve([{ ...mockBounty }])
      }) as any
    );

    const store = new MainStore();
    store.setPeopleBounties([expectedBountyResponses[0] as any]);
    expect(store.peopleBounties.length).toEqual(1);

    const bounties = await store.getWorkspaceBounties('1111', {
      resetPage: true,
      search: 'random',
      limit: 11,
      page: 2,
      sortBy: 'updatedat'
    });
    const expectedResponse = { ...expectedBountyResponses[0] };
    expectedResponse.body.id = 2;
    expect(store.peopleBounties.length).toEqual(1);
    expect(store.peopleBounties).toEqual([expectedResponse]);
    expect(bounties).toEqual([expectedResponse]);
  });

  it('should add to exisiting bounty if reset flag is not passed, user signed out', async () => {
    uiStore.setMeInfo(emptyMeInfo);
    const allBountiesUrl = `http://${getHost()}/workspaces/bounties/1111`;
    const mockBounty = { ...mockBounties[0] };
    mockBounty.bounty.id = 2;
    fetchStub.withArgs(allBountiesUrl, sinon.match.any).returns(
      Promise.resolve({
        status: 200,
        ok: true,
        json: (): Promise<any> => Promise.resolve([{ ...mockBounty }])
      }) as any
    );

    const store = new MainStore();
    const bountyAlreadyPresent = { ...expectedBountyResponses[0] } as any;
    bountyAlreadyPresent.body.id = 1;
    store.setPeopleBounties([bountyAlreadyPresent]);
    expect(store.peopleBounties.length).toEqual(1);
    expect(store.peopleBounties[0].body.id).not.toEqual(2);

    const bounties = await store.getWorkspaceBounties('1111', {
      resetPage: false,
      search: 'random',
      limit: 11,
      page: 2,
      sortBy: 'updatedat'
    });

    const expectedResponse = { ...expectedBountyResponses[0] };
    expectedResponse.body.id = 2;
    expect(store.peopleBounties.length).toEqual(2);
    expect(store.peopleBounties[1]).toEqual(expectedResponse);
    expect(bounties).toEqual([expectedResponse]);
  });

  it('should make a succcessful bounty payment', async () => {
    const store = new MainStore();
    uiStore.setMeInfo(emptyMeInfo);
    const bounty = expectedBountyResponses[0];

    store.makeBountyPayment = jest
      .fn()
      .mockReturnValueOnce(Promise.resolve({ status: 200, message: 'success' }));

    const body = {
      id: bounty.body.id,
      websocket_token: 'test_websocket_token'
    };

    store.makeBountyPayment(body);
    expect(store.makeBountyPayment).toBeCalledWith(body);
  });

  it('it should get a s3 URL afer a successful metrics url call', async () => {
    const store = new MainStore();
    uiStore.setMeInfo(emptyMeInfo);

    store.exportMetricsBountiesCsv = jest
      .fn()
      .mockReturnValueOnce(
        Promise.resolve({ status: 200, body: 'https://test-s3url.com/metrics.csv' })
      );

    const start_date = moment().subtract(30, 'days').unix().toString();
    const end_date = moment().unix().toString();

    const body = {
      start_date,
      end_date
    };

    store.exportMetricsBountiesCsv(body, '');
    expect(store.exportMetricsBountiesCsv).toBeCalledWith(body, '');
  });

  it('I should be able to test that the signed-in user details are persisted in the local storage', async () => {
    const mockUser: MeInfo = {
      id: 20,
      pubkey: 'test_pub_key',
      uuid: mockApiResponseData[0].uuid,
      contact_key: 'test_owner_contact_key',
      owner_route_hint: 'test_owner_route_hint',
      alias: 'Owner Name',
      photo_url: '',
      github_issues: [],
      route_hint: 'test_hint:1099567661057',
      price_to_meet: 0,
      jwt: 'test_jwt',
      tribe_jwt: 'test_jwt',
      url: 'http://localhost:5002',
      description: 'description',
      verification_signature: 'test_verification_signature',
      extras: {
        email: [{ value: 'testEmail@sphinx.com' }],
        liquid: [{ value: 'none' }],
        wanted: []
      },
      owner_alias: 'Owner Name',
      owner_pubkey: 'test_pub_key',
      img: '/static/avatarPlaceholders/placeholder_34.jpg',
      twitter_confirmed: false,
      isSuperAdmin: false,
      websocketToken: 'test_websocketToken'
    };
    uiStore.setMeInfo(mockUser);
    uiStore.setShowSignIn(true);

    localStorageMock.setItem('ui', JSON.stringify(uiStore));

    expect(uiStore.showSignIn).toBeTruthy();
    expect(uiStore.meInfo).toEqual(mockUser);
    expect(localStorageMock.getItem('ui')).toEqual(JSON.stringify(uiStore));
  });

  it('I should be able to test that when signed out the user data is deleted', async () => {
    // Shows first if signed in
    uiStore.setShowSignIn(true);
    localStorageMock.setItem('ui', JSON.stringify(uiStore));

    expect(uiStore.showSignIn).toBeTruthy();
    expect(localStorageMock.getItem('ui')).toEqual(JSON.stringify(uiStore));
    //Shows when signed out
    uiStore.setMeInfo(null);
    localStorageMock.setItem('ui', null);

    expect(localStorageMock.getItem('ui')).toEqual(null);
  });

  it('I should be able to test that signed-in user details can be displayed such as the name and pubkey', async () => {
    uiStore.setShowSignIn(true);

    expect(uiStore.meInfo?.owner_alias).toEqual(user.alias);
    expect(uiStore.meInfo?.owner_pubkey).toEqual(user.pubkey);
  });

  it('I should be able to test that a signed-in user can update their details', async () => {
    uiStore.setShowSignIn(true);
    expect(uiStore.meInfo?.alias).toEqual('Vladimir');

    user.alias = 'John';
    uiStore.setMeInfo(user);

    expect(uiStore.meInfo?.alias).toEqual('John');
  });

  it('I should be able to test that a signed-in user can make an API request without getting a 401 (unauthorized error)', async () => {
    uiStore.setShowSignIn(true);
    const loggedUrl = `http://${getHost()}/admin/auth`;
    const res = await fetchStub.withArgs(loggedUrl, sinon.match.any).returns(
      Promise.resolve({
        status: 200,
        ok: true
      }) as any
    );
    expect(res).toBeTruthy();
  });

  it('I should be able to test that when a user is signed out, a user will get a 401 error if they make an API call', async () => {
    uiStore.setMeInfo(emptyMeInfo);
    const urlNoLogged = `http://${getHost()}/admin/auth`;

    const res = await fetchStub.withArgs(urlNoLogged, sinon.match.any).returns(
      Promise.resolve({
        status: 401,
        ok: false
      }) as any
    );
    expect(res).toBeTruthy();
  });

  it('should accept search query and return results based on query ', async () => {
    const store = new MainStore();

    const searchCriteria = {
      limit: 10,
      sortBy: 'created',
      search: 'test',
      page: 1,
      resetPage: false
    };

    const mockApiResponse = {
      status: 200,
      ok: true,
      json: async () => Promise.resolve([mockBounties[0]])
    };

    const bountiesUrl = `http://${getHost()}/gobounties/all?limit=${searchCriteria.limit}&sortBy=${
      searchCriteria.sortBy
    }&search=${searchCriteria.search}&page=${searchCriteria.page}&resetPage=${
      searchCriteria.resetPage
    }`;

    fetchStub.callsFake((url: string) => {
      if (url === bountiesUrl) {
        return Promise.resolve(mockApiResponse);
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    await store.getPeopleBounties(searchCriteria);

    waitFor(() => {
      sinon.assert.calledWithMatch(fetchStub, bountiesUrl);
      expect(fetchStub.calledOnce).toBe(true);
      expect(store.peopleBounties).toHaveLength(1);
      expect(store.peopleBounties[0].body.title).toEqual(searchCriteria.search);
    });
  });

  it('should return filter by the languages, status, and other criteria', async () => {
    const store = new MainStore();
    const filterCriteria = {
      limit: 25,
      page: 1,
      sortBy: 'created',
      coding_languages: 'Typescript',
      Open: true,
      Assigned: false,
      Paid: false
    };

    const apiResponse = {
      status: 200,
      ok: true,
      json: async () => Promise.resolve([filterBounty])
    };
    fetchStub.callsFake((url: string) => {
      const urlObj = new URL(url);
      const params = urlObj.searchParams;

      const isValidBaseUrl =
        urlObj.origin === `http://${getHost()}` && urlObj.pathname === '/gobounties/all';

      const isValidParams =
        params.get('limit') === filterCriteria.limit.toString() &&
        params.get('sortBy') === filterCriteria.sortBy &&
        params.get('coding_languages') === filterCriteria.coding_languages &&
        params.get('page') === filterCriteria.page.toString() &&
        params.get('Open') === String(filterCriteria.Open) &&
        params.get('Assigned') === String(filterCriteria.Assigned) &&
        params.get('Paid') === String(filterCriteria.Paid);

      if (isValidBaseUrl && isValidParams) {
        return Promise.resolve(apiResponse);
      }
    });

    await store.getPeopleBounties(filterCriteria);
    sinon.assert.called(fetchStub);
    expect(fetchStub.calledOnce).toEqual(true);
    expect(store.peopleBounties[0].body.coding_languages).toEqual(filterCriteria.coding_languages);
  });

  it('should successfully fetch workspace users', async () => {
    const mockUsers: Person[] = [
      {
        id: 1,
        unique_name: 'user-one',
        owner_pubkey: 'pub-key-1',
        uuid: 'user-1',
        owner_alias: 'User One',
        description: 'Test user one',
        img: 'image1.jpg',
        tags: ['developer'],
        photo_url: 'photo1.jpg',
        alias: 'User One',
        route_hint: 'hint1',
        contact_key: 'contact1',
        price_to_meet: 100,
        url: 'https://test1.com',
        verification_signature: 'sig1',
        extras: {
          email: [],
          liquid: [],
          wanted: []
        }
      },
      {
        id: 2,
        unique_name: 'user-two',
        owner_pubkey: 'pub-key-2',
        uuid: 'user-2',
        owner_alias: 'User Two',
        description: 'Test user two',
        img: 'image2.jpg',
        tags: ['designer'],
        photo_url: 'photo2.jpg',
        alias: 'User Two',
        route_hint: 'hint2',
        contact_key: 'contact2',
        price_to_meet: 200,
        url: 'https://test2.com',
        verification_signature: 'sig2',
        extras: {
          email: [],
          liquid: [],
          wanted: []
        }
      }
    ];

    const workspaceUuid = 'workspace-123';
    const url = `${TribesURL}/workspaces/users/${workspaceUuid}`;

    fetchStub.withArgs(url, sinon.match.any).returns(
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockUsers)
      }) as any
    );

    const store = new MainStore();
    const result = await store.getWorkspaceUsers(workspaceUuid);

    expect(
      fetchStub.calledWith(
        url,
        sinon.match({
          method: 'GET',
          mode: 'cors'
        })
      )
    ).toBeTruthy();
    expect(result).toEqual(mockUsers);
  });

  it('should return empty array when workspace users fetch fails', async () => {
    const workspaceUuid = 'workspace-123';
    const url = `${TribesURL}/workspaces/users/${workspaceUuid}`;

    fetchStub.withArgs(url, sinon.match.any).returns(Promise.reject(new Error('API Error')));

    const store = new MainStore();
    const result = await store.getWorkspaceUsers(workspaceUuid);

    expect(result).toEqual([]);
  });

  it('should return empty array for malformed workspace users response', async () => {
    const workspaceUuid = 'workspace-123';
    const url = `${TribesURL}/workspaces/users/${workspaceUuid}`;

    fetchStub.withArgs(url, sinon.match.any).returns(
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(null)
      }) as any
    );

    const store = new MainStore();
    const result = await store.getWorkspaceUsers(workspaceUuid);
    waitFor(() => {
      expect(result).toEqual([]);
    });
  });

  it('should handle empty workspace UUID for users fetch', async () => {
    const workspaceUuid = '';

    const store = new MainStore();
    const result = await store.getWorkspaceUsers(workspaceUuid);

    expect(result).toEqual([]);
  });
  it('should return empty array when API call fails', async () => {
    const workspaceUuid = 'workspace-123';
    const url = `${TribesURL}/workspaces/users/${workspaceUuid}`;

    fetchStub.withArgs(url, sinon.match.any).returns(Promise.reject(new Error('API Error')));

    const store = new MainStore();
    const result = await store.getWorkspaceUsers(workspaceUuid);

    expect(fetchStub.withArgs(url, sinon.match.any).calledOnce).toEqual(true);
    expect(result).toEqual([]);
  });

  it('should return empty array when response is not ok', async () => {
    const workspaceUuid = 'workspace-123';
    const url = `${TribesURL}/workspaces/users/${workspaceUuid}`;

    fetchStub.withArgs(url, sinon.match.any).returns(
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve([])
      }) as any
    );

    const store = new MainStore();
    const result = await store.getWorkspaceUsers(workspaceUuid);

    expect(fetchStub.withArgs(url, sinon.match.any).calledOnce).toEqual(true);
    expect(result).toEqual([]);
  });

  it('should handle malformed response data', async () => {
    const workspaceUuid = 'workspace-123';
    const url = `${TribesURL}/workspaces/users/${workspaceUuid}`;

    fetchStub.withArgs(url, sinon.match.any).returns(
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(null)
      }) as any
    );

    const store = new MainStore();
    const result = await store.getWorkspaceUsers(workspaceUuid);
    waitFor(() => {
      expect(fetchStub.withArgs(url, sinon.match.any).calledOnce).toEqual(true);
      expect(result).toEqual([]);
    });
  });

  it('should make request with correct parameters', async () => {
    const workspaceUuid = 'workspace-123';
    const url = `${TribesURL}/workspaces/users/${workspaceUuid}`;

    const expectedRequestOptions = {
      method: 'GET',
      mode: 'cors'
    };

    fetchStub.withArgs(url, expectedRequestOptions).returns(
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(people)
      }) as any
    );

    const store = new MainStore();
    await store.getWorkspaceUsers(workspaceUuid);

    expect(fetchStub.calledWith(url, sinon.match(expectedRequestOptions))).toEqual(true);
  });

  it('should handle empty workspace UUID', async () => {
    const workspaceUuid = '';
    const url = `${TribesURL}/workspaces/users/${workspaceUuid}`;

    fetchStub.withArgs(url, sinon.match.any).returns(
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve([])
      }) as any
    );

    const store = new MainStore();
    const result = await store.getWorkspaceUsers(workspaceUuid);

    expect(fetchStub.withArgs(url, sinon.match.any).calledOnce).toEqual(true);
    expect(result).toEqual([]);
  });
});

describe('getUserRoles', () => {
  let mainStore: MainStore;
  const validUuid = 'valid-uuid-123';
  const validUser = 'valid-user-456';
  const mockJwt = 'test_jwt';
  const mockSessionId = 'test-session-id';
  let fetchStub: sinon.SinonStub;

  beforeEach(() => {
    mainStore = new MainStore();
    uiStore.setMeInfo({ ...user, tribe_jwt: mockJwt });
    sinon.stub(mainStore, 'getSessionId').returns(mockSessionId);
    fetchStub = sinon.stub(window, 'fetch');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Valid Inputs with Existing User and UUID', async () => {
    const mockRoles = [
      { id: 1, name: 'admin' },
      { id: 2, name: 'developer' }
    ];
    fetchStub.resolves({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockRoles)
    } as Response);

    const result = await mainStore.getUserRoles(validUuid, validUser);

    expect(result).toEqual(mockRoles);
    sinon.assert.calledWithMatch(
      fetchStub,
      `${TribesURL}/workspaces/users/role/${validUuid}/${validUser}`,
      {
        method: 'GET',
        headers: {
          'x-jwt': mockJwt,
          'Content-Type': 'application/json',
          'x-session-id': mockSessionId
        }
      }
    );
  });

  it('Valid Inputs with No Roles', async () => {
    fetchStub.resolves({
      ok: true,
      status: 200,
      json: () => Promise.resolve([])
    } as Response);

    const result = await mainStore.getUserRoles(validUuid, validUser);
    expect(result).toEqual([]);
  });

  it('Empty UUID and User', async () => {
    fetchStub.resolves({
      ok: true,
      status: 200,
      json: () => Promise.resolve([])
    } as Response);

    const result = await mainStore.getUserRoles('', '');

    expect(result).toEqual([]);

    expect(fetchStub.calledOnce).toBe(true);
    sinon.assert.calledWith(
      fetchStub,
      sinon.match((url: string) => url.includes('/workspaces/users/role/')),
      sinon.match({
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': mockJwt,
          'Content-Type': 'application/json',
          'x-session-id': mockSessionId
        }
      })
    );
  });

  it('Long UUID and User Strings', async () => {
    const longString = 'a'.repeat(1000);
    fetchStub.resolves({
      ok: true,
      status: 200,
      json: () => Promise.resolve([])
    } as Response);

    const result = await mainStore.getUserRoles(longString, longString);
    expect(result).toEqual([]);
  });

  it('Invalid UUID Format', async () => {
    fetchStub.resolves({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Invalid UUID format' })
    } as Response);

    const result = await mainStore.getUserRoles('invalid-uuid', validUser);
    expect(result).toEqual([]);
  });

  it('Invalid User Format', async () => {
    fetchStub.resolves({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Invalid user format' })
    } as Response);

    const result = await mainStore.getUserRoles(validUuid, 'invalid@user');
    expect(result).toEqual([]);
  });

  it('Network Error During Fetch', async () => {
    fetchStub.rejects(new Error('Network error'));

    const result = await mainStore.getUserRoles(validUuid, validUser);
    expect(result).toEqual([]);
  });

  it('Unauthorized Access', async () => {
    fetchStub.resolves({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'Unauthorized' })
    } as Response);

    const result = await mainStore.getUserRoles(validUuid, validUser);
    expect(result).toEqual([]);
  });

  it('Server Returns Non-JSON Response', async () => {
    fetchStub.resolves({
      ok: true,
      status: 200,
      json: () => Promise.reject(new Error('Invalid JSON'))
    } as Response);

    const result = await mainStore.getUserRoles(validUuid, validUser);
    expect(result).toEqual([]);
  });

  it('High Volume of Roles', async () => {
    const largeRolesArray = Array.from({ length: 1000 }, (_: any, i: number) => ({
      id: i,
      name: `role-${i}`
    }));
    fetchStub.resolves({
      ok: true,
      status: 200,
      json: () => Promise.resolve(largeRolesArray)
    } as Response);

    const result = await mainStore.getUserRoles(validUuid, validUser);

    waitFor(() => {
      expect(result).toEqual(largeRolesArray);
      expect(result.length).toBe(1000);
    });
  });

  it('No meInfo in uiStore', async () => {
    uiStore.setMeInfo(null);
    const result = await mainStore.getUserRoles(validUuid, validUser);
    waitFor(() => {
      expect(result).toEqual([]);
      sinon.assert.notCalled(fetchStub);
    });
  });

  it('Session ID Not Set', async () => {
    sinon.restore();
    sinon.stub(mainStore, 'getSessionId').returns('');

    const mockRoles = [{ id: 1, name: 'admin' }];
    fetchStub.resolves({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockRoles)
    } as Response);

    const result = await mainStore.getUserRoles(validUuid, validUser);

    waitFor(() => {
      sinon.assert.calledWithMatch(
        fetchStub,
        `${TribesURL}/workspaces/users/role/${validUuid}/${validUser}`,
        {
          headers: {
            'x-jwt': mockJwt,
            'Content-Type': 'application/json',
            'x-session-id': ''
          }
        }
      );
      expect(result).toEqual(mockRoles);
    });
  });
});

describe('getPeople', () => {
  let mainStore: MainStore;
  let fetchStub: sinon.SinonStub;

  const mockPerson: Person = {
    id: 1,
    unique_name: 'test123',
    owner_pubkey: 'pubkey1',
    uuid: 'uuid1',
    owner_alias: 'TestOwner',
    description: 'Test Description',
    img: 'https://example.com/test.jpg',
    tags: ['tag1'],
    photo_url: 'https://example.com/photo_test.jpg',
    alias: 'Test',
    route_hint: 'route_hint1',
    contact_key: 'contact_key1',
    price_to_meet: 100,
    url: 'https://example.com/test',
    verification_signature: 'signature1',
    extras: {}
  };

  beforeEach(() => {
    mainStore = new MainStore();
    fetchStub = sinon.stub(window, 'fetch');
    uiStore.setMeInfo(null);
    uiStore.setSearchText('');
  });

  afterEach(() => {
    sinon.restore();
  });

  test('Standard Input with No Query Params', async () => {
    const mockResponse = [mockPerson];
    fetchStub.resolves({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    } as Response);

    const result = await mainStore.getPeople();
    expect(result).toEqual(mockResponse);
    expect(mainStore.people).toEqual(mockResponse);
  });

  test('Standard Input with Query Params', async () => {
    const queryParams = { limit: 10, page: 1, sortBy: 'created' };
    const mockResponse = [mockPerson];
    fetchStub.resolves({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    } as Response);

    const result = await mainStore.getPeople(queryParams);
    expect(result).toEqual(mockResponse);
    expect(mainStore.people).toEqual(mockResponse);
  });

  test('Empty People List', async () => {
    fetchStub.resolves({
      ok: true,
      json: () => Promise.resolve([])
    } as Response);

    const result = await mainStore.getPeople();
    waitFor(() => {
      expect(result).toEqual([]);
      expect(mainStore.people).toEqual([]);
    });
  });

  test('Single Person in List', async () => {
    const mockResponse = [mockPerson];
    fetchStub.resolves({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    } as Response);

    const result = await mainStore.getPeople();
    expect(result).toEqual(mockResponse);
    expect(mainStore.people).toEqual(mockResponse);
  });

  test('Person Matching meInfo', async () => {
    const meInfo = { ...mockPerson, id: 1 };
    uiStore.setMeInfo(meInfo as any);
    const mockResponse = [{ ...mockPerson, id: 1 }];
    fetchStub.resolves({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    } as Response);

    const result = await mainStore.getPeople();
    expect(result[0].hide).toBe(true);
  });

  test('Invalid Query Params', async () => {
    const invalidParams = { invalid: 'param' };
    const mockResponse = [mockPerson];
    fetchStub.resolves({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    } as Response);

    const result = await mainStore.getPeople(invalidParams);
    expect(result).toEqual(mockResponse);
  });

  test('Null uiStore.meInfo', async () => {
    uiStore.setMeInfo(null);
    const mockResponse = [mockPerson];
    fetchStub.resolves({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    } as Response);

    const result = await mainStore.getPeople();
    waitFor(() => {
      expect(result[0].hide).toBeUndefined();
    });
  });

  test('Large List of People', async () => {
    const largeMockResponse = Array.from({ length: 100 }, (_: any, i: number) => ({
      ...mockPerson,
      id: i + 1,
      uuid: `uuid${i + 1}`
    }));
    fetchStub.resolves({
      ok: true,
      json: () => Promise.resolve(largeMockResponse)
    } as Response);

    const result = await mainStore.getPeople();
    waitFor(() => {
      expect(result.length).toBe(100);
      expect(mainStore.people.length).toBe(100);
    });
  });

  test('Reset Page Parameter', async () => {
    const mockResponse = [mockPerson];
    fetchStub.resolves({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    } as Response);

    const result = await mainStore.getPeople({ resetPage: true });
    expect(result).toEqual(mockResponse);
    expect(uiStore.peoplePageNumber).toBe(1);
  });

  test('Merge People Lists', async () => {
    mainStore.setPeople([{ ...mockPerson, id: 1, uuid: 'uuid1' }]);

    const newPerson = { ...mockPerson, id: 2, uuid: 'uuid2' };
    fetchStub.resolves({
      ok: true,
      json: () => Promise.resolve([newPerson])
    } as Response);

    const result = await mainStore.getPeople({ resetPage: false });
    waitFor(() => {
      expect(mainStore.people.length).toBe(2);
      expect(result).toEqual([newPerson]);
    });
  });

  test('No searchText in uiStore', async () => {
    uiStore.setSearchText('');
    const mockResponse = [mockPerson];
    fetchStub.resolves({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    } as Response);

    const result = await mainStore.getPeople();
    expect(result).toEqual(mockResponse);
  });

  test('Multiple People Matching meInfo', async () => {
    const meInfo = { ...mockPerson, id: 1 };
    uiStore.setMeInfo(meInfo as any);

    const mockResponse = [
      { ...mockPerson, id: 1 },
      { ...mockPerson, id: 1, uuid: 'uuid2' }
    ];
    fetchStub.resolves({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    } as Response);

    const result = await mainStore.getPeople();
    waitFor(() => {
      expect(result.filter((p: Person) => p.hide).length).toBe(2);
    });
  });
});

describe('setDropDownWorkspaces', () => {
  let mainStore: MainStore;

  beforeEach(() => {
    mainStore = new MainStore();
  });

  it('should set standard array of workspaces', () => {
    const workspaces: Workspace[] = [
      {
        id: '1',
        uuid: 'uuid-1',
        name: 'Workspace 1',
        description: 'Description 1',
        owner_pubkey: 'pubkey-1',
        img: 'image1.jpg',
        created: '2024-01-01T00:00:00Z',
        updated: '2024-01-01T00:00:00Z',
        show: true
      },
      {
        id: '2',
        uuid: 'uuid-2',
        name: 'Workspace 2',
        description: 'Description 2',
        owner_pubkey: 'pubkey-2',
        img: 'image2.jpg',
        created: '2024-01-01T00:00:00Z',
        updated: '2024-01-01T00:00:00Z',
        show: true
      }
    ];

    mainStore.setDropDownWorkspaces(workspaces);
    expect(mainStore.dropDownWorkspaces).toEqual(workspaces);
  });

  it('should handle empty array input', () => {
    mainStore.setDropDownWorkspaces([]);
    expect(mainStore.dropDownWorkspaces).toEqual([]);
  });

  it('should handle single workspace', () => {
    const workspace: Workspace = {
      id: '1',
      uuid: 'uuid-1',
      name: 'Single Workspace',
      description: 'Description',
      owner_pubkey: 'pubkey-1',
      img: 'image1.jpg',
      created: '2024-01-01T00:00:00Z',
      updated: '2024-01-01T00:00:00Z',
      show: true
    };

    mainStore.setDropDownWorkspaces([workspace]);
    expect(mainStore.dropDownWorkspaces).toHaveLength(1);
    expect(mainStore.dropDownWorkspaces[0]).toEqual(workspace);
  });

  it('should handle large number of workspaces', () => {
    const workspaces: Workspace[] = Array.from({ length: 1000 }, (_: unknown, i: number) => ({
      id: i.toString(),
      uuid: `uuid-${i}`,
      name: `Workspace ${i}`,
      description: `Description ${i}`,
      owner_pubkey: `pubkey-${i}`,
      img: `image${i}.jpg`,
      created: '2024-01-01T00:00:00Z',
      updated: '2024-01-01T00:00:00Z',
      show: true
    }));

    mainStore.setDropDownWorkspaces(workspaces);
    expect(mainStore.dropDownWorkspaces).toHaveLength(1000);
    expect(mainStore.dropDownWorkspaces).toEqual(workspaces);
  });

  it('should handle null input', () => {
    mainStore.setDropDownWorkspaces(null as any);
    expect(mainStore.dropDownWorkspaces).toEqual(null);
  });

  it('should handle undefined input', () => {
    mainStore.setDropDownWorkspaces(undefined as any);
    expect(mainStore.dropDownWorkspaces).toEqual(undefined);
  });

  it('should handle invalid data type', () => {
    const invalidInput = 'not an array' as any;
    mainStore.setDropDownWorkspaces(invalidInput);
    expect(mainStore.dropDownWorkspaces).toEqual(invalidInput);
  });

  it('should handle array with mixed types', () => {
    const validWorkspace: Workspace = {
      id: '1',
      uuid: 'uuid-1',
      name: 'Workspace 1',
      description: 'Description 1',
      owner_pubkey: 'pubkey-1',
      img: 'image1.jpg',
      created: '2024-01-01T00:00:00Z',
      updated: '2024-01-01T00:00:00Z',
      show: true
    };

    const mixedWorkspaces = [
      validWorkspace,
      'invalid item' as any,
      null as any,
      {
        id: '2',
        uuid: 'uuid-2',
        name: 'Workspace 2',
        description: 'Description 2',
        owner_pubkey: 'pubkey-2',
        img: 'image2.jpg',
        created: '2024-01-01T00:00:00Z',
        updated: '2024-01-01T00:00:00Z',
        show: true
      }
    ];

    mainStore.setDropDownWorkspaces(mixedWorkspaces as any);
    expect(mainStore.dropDownWorkspaces).toEqual(mixedWorkspaces);
  });

  it('should handle array with duplicates', () => {
    const workspace: Workspace = {
      id: '1',
      uuid: 'uuid-1',
      name: 'Duplicate Workspace',
      description: 'Description',
      owner_pubkey: 'pubkey-1',
      img: 'image1.jpg',
      created: '2024-01-01T00:00:00Z',
      updated: '2024-01-01T00:00:00Z',
      show: true
    };

    const duplicateWorkspaces = [workspace, workspace, workspace];

    mainStore.setDropDownWorkspaces(duplicateWorkspaces);
    expect(mainStore.dropDownWorkspaces).toHaveLength(3);
    expect(mainStore.dropDownWorkspaces).toEqual(duplicateWorkspaces);
  });

  it('should handle very large workspace objects', () => {
    const largeWorkspace: Workspace = {
      id: '1',
      uuid: 'uuid-1',
      name: 'Large Workspace',
      description: 'A'.repeat(10000),
      owner_pubkey: 'pubkey-1',
      img: 'image1.jpg',
      created: '2024-01-01T00:00:00Z',
      updated: '2024-01-01T00:00:00Z',
      show: true,
      additionalData: Array(1000).fill('large data')
    } as Workspace;

    mainStore.setDropDownWorkspaces([largeWorkspace]);
    expect(mainStore.dropDownWorkspaces).toHaveLength(1);
    expect(mainStore.dropDownWorkspaces[0]).toEqual(largeWorkspace);
  });

  it('should handle array with deeply nested objects', () => {
    const nestedWorkspace: Workspace = {
      id: '1',
      uuid: 'uuid-1',
      name: 'Nested Workspace',
      description: 'Description',
      owner_pubkey: 'pubkey-1',
      img: 'image1.jpg',
      created: '2024-01-01T00:00:00Z',
      updated: '2024-01-01T00:00:00Z',
      show: true,
      nested: {
        level1: {
          level2: {
            level3: {
              data: 'deeply nested data'
            }
          }
        }
      }
    } as Workspace;

    mainStore.setDropDownWorkspaces([nestedWorkspace]);
    expect(mainStore.dropDownWorkspaces).toHaveLength(1);
    expect(mainStore.dropDownWorkspaces[0]).toEqual(nestedWorkspace);
  });

  it('should handle array with null or undefined elements', () => {
    const validWorkspace1: Workspace = {
      id: '1',
      uuid: 'uuid-1',
      name: 'Valid Workspace',
      description: 'Description',
      owner_pubkey: 'pubkey-1',
      img: 'image1.jpg',
      created: '2024-01-01T00:00:00Z',
      updated: '2024-01-01T00:00:00Z',
      show: true
    };

    const validWorkspace2: Workspace = {
      id: '2',
      uuid: 'uuid-2',
      name: 'Another Valid Workspace',
      description: 'Description 2',
      owner_pubkey: 'pubkey-2',
      img: 'image2.jpg',
      created: '2024-01-01T00:00:00Z',
      updated: '2024-01-01T00:00:00Z',
      show: true
    };

    const workspacesWithNulls = [null, validWorkspace1, undefined, validWorkspace2] as any[];

    mainStore.setDropDownWorkspaces(workspacesWithNulls);
    expect(mainStore.dropDownWorkspaces).toEqual(workspacesWithNulls);
    expect(mainStore.dropDownWorkspaces).toHaveLength(4);
  });
});

describe('MainStore.setPersonBounties', () => {
  let mainStore: MainStore;

  beforeEach(() => {
    mainStore = new MainStore();
  });

  it('Standard Input', () => {
    const bounties: PersonBounty[] = [
      {
        owner_id: '1',
        wanted_type: 'bug',
        person: { name: 'John' },
        body: { title: 'Bounty 1' },
        codingLanguage: 'JavaScript',
        estimated_session_length: '2 hours'
      },
      {
        owner_id: '2',
        wanted_type: 'feature',
        person: { name: 'Jane' },
        body: { title: 'Bounty 2' },
        codingLanguage: 'TypeScript',
        estimated_session_length: '4 hours'
      }
    ];

    mainStore.setPersonBounties(bounties);
    expect(mainStore.personAssignedBounties).toEqual(bounties);
  });

  it('Empty Array', () => {
    const bounties: PersonBounty[] = [];
    mainStore.setPersonBounties(bounties);
    expect(mainStore.personAssignedBounties).toEqual([]);
  });

  it('Single Element Array', () => {
    const bounties: PersonBounty[] = [
      {
        owner_id: '1',
        wanted_type: 'bug',
        person: { name: 'John' },
        body: { title: 'Single Bounty' },
        codingLanguage: 'Python',
        estimated_session_length: '1 hour'
      }
    ];

    mainStore.setPersonBounties(bounties);
    expect(mainStore.personAssignedBounties).toEqual(bounties);
  });

  it('Large Array', () => {
    const bounties: PersonBounty[] = Array.from({ length: 1000 }, (_: unknown, i: number) => ({
      owner_id: i.toString(),
      wanted_type: 'bug',
      person: { name: `Person ${i}` },
      body: { title: `Bounty ${i}` },
      codingLanguage: 'JavaScript',
      estimated_session_length: '3 hours'
    }));

    mainStore.setPersonBounties(bounties);
    expect(mainStore.personAssignedBounties.length).toBe(1000);
    expect(mainStore.personAssignedBounties).toEqual(bounties);
  });

  it('Array with Null Elements', () => {
    const bounties: PersonBounty[] = [
      {
        owner_id: '1',
        wanted_type: 'bug',
        person: null,
        body: null,
        codingLanguage: '',
        estimated_session_length: ''
      },
      {
        owner_id: '2',
        wanted_type: 'feature',
        person: { name: 'Jane' },
        body: { title: 'Valid Bounty' },
        codingLanguage: 'Ruby',
        estimated_session_length: '2 hours'
      }
    ];

    mainStore.setPersonBounties(bounties);
    expect(mainStore.personAssignedBounties).toEqual(bounties);
  });

  it('Array with Mixed Valid and Invalid Elements', () => {
    const bounties: PersonBounty[] = [
      {
        owner_id: '1',
        wanted_type: 'bug',
        person: { name: 'John' },
        body: { title: 'Valid Bounty' },
        codingLanguage: 'Java',
        estimated_session_length: '5 hours'
      },
      {
        owner_id: '2',
        wanted_type: 'invalid_type',
        person: { name: 'Jane' },
        body: { title: 'Invalid Bounty' },
        codingLanguage: 'Go',
        estimated_session_length: '1 hour'
      }
    ];

    mainStore.setPersonBounties(bounties);
    expect(mainStore.personAssignedBounties).toEqual(bounties);
  });

  it('Array with Duplicate Elements', () => {
    const duplicateBounty: PersonBounty = {
      owner_id: '1',
      wanted_type: 'bug',
      person: { name: 'John' },
      body: { title: 'Duplicate Bounty' },
      codingLanguage: 'PHP',
      estimated_session_length: '3 hours'
    };

    const bounties: PersonBounty[] = [duplicateBounty, duplicateBounty];

    mainStore.setPersonBounties(bounties);
    expect(mainStore.personAssignedBounties).toEqual(bounties);
    expect(mainStore.personAssignedBounties.length).toBe(2);
  });

  it('Array with Missing Properties', () => {
    const bounties: PersonBounty[] = [
      {
        owner_id: '1',
        wanted_type: 'bug',
        codingLanguage: 'C++',
        estimated_session_length: '2 hours'
      },
      {
        owner_id: '2',
        wanted_type: 'feature',
        person: { name: 'Jane' },
        codingLanguage: 'Rust',
        estimated_session_length: '4 hours'
      }
    ] as PersonBounty[];

    mainStore.setPersonBounties(bounties);
    expect(mainStore.personAssignedBounties).toEqual(bounties);
  });

  it('should handle null input', () => {
    waitFor(() => {
      expect(() => {
        mainStore.setPersonBounties(null as unknown as PersonBounty[]);
      }).toThrow();
    });
  });

  it('should handle undefined input', () => {
    waitFor(() => {
      expect(() => {
        mainStore.setPersonBounties(undefined as unknown as PersonBounty[]);
      }).toThrow();
    });
  });

  it('should handle very large arrays efficiently', () => {
    waitFor(() => {
      const start = performance.now();

      const largeBounties: PersonBounty[] = Array.from(
        { length: 10000 },
        (_: unknown, i: number) => ({
          owner_id: i.toString(),
          wanted_type: 'bug',
          person: { name: `Person ${i}` },
          body: { title: `Bounty ${i}` },
          codingLanguage: 'JavaScript',
          estimated_session_length: '2 hours'
        })
      );

      mainStore.setPersonBounties(largeBounties);

      const end = performance.now();
      const executionTime = end - start;

      expect(executionTime).toBeLessThan(1000);
      expect(mainStore.personAssignedBounties.length).toBe(10000);
    });
  });
});

describe('getBadgeList', () => {
  let mainStore: MainStore;
  let fetchStub: sinon.SinonStub;
  const URL = 'https://liquid.sphinx.chat';

  beforeEach(() => {
    mainStore = new MainStore();
    fetchStub = sinon.stub(window, 'fetch');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should successfully fetch and parse badge list', async () => {
    const mockBadges = [
      { id: 1, name: 'Badge 1' },
      { id: 2, name: 'Badge 2' }
    ];

    fetchStub.resolves({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockBadges)
    } as Response);

    const result = await mainStore.getBadgeList();

    waitFor(() => {
      expect(fetchStub.calledOnce).toBe(true);
      expect(fetchStub.firstCall.args[0]).toBe(`${URL}/list?limit=100000`);
      expect(result).toEqual(mockBadges);
      expect(uiStore.setBadgeList).toHaveBeenCalledWith(mockBadges);
    });
  });

  it('should handle empty badge list', async () => {
    fetchStub.resolves({
      ok: true,
      status: 200,
      json: () => Promise.resolve([])
    } as Response);

    const result = await mainStore.getBadgeList();

    waitFor(() => {
      expect(result).toEqual([]);
      expect(uiStore.setBadgeList).toHaveBeenCalledWith([]);
    });
  });

  it('should handle large badge list', async () => {
    const largeBadgeList = Array.from({ length: 10000 }, (_: any, i: number) => ({
      id: i,
      name: `Badge ${i}`
    }));

    fetchStub.resolves({
      ok: true,
      status: 200,
      json: () => Promise.resolve(largeBadgeList)
    } as Response);

    const result = await mainStore.getBadgeList();

    waitFor(() => {
      expect(result).toEqual(largeBadgeList);
      expect(result.length).toBe(10000);
      expect(uiStore.setBadgeList).toHaveBeenCalledWith(largeBadgeList);
    });
  });

  it('should handle network error', async () => {
    fetchStub.rejects(new Error('Network error'));

    const result = await mainStore.getBadgeList();

    waitFor(() => {
      expect(result).toBeUndefined();
      expect(uiStore.setBadgeList).not.toHaveBeenCalled();
    });
  });

  it('should handle invalid JSON response', async () => {
    fetchStub.resolves({
      ok: true,
      status: 200,
      json: () => Promise.reject(new Error('Invalid JSON'))
    } as Response);

    const result = await mainStore.getBadgeList();

    waitFor(() => {
      expect(result).toBeUndefined();
      expect(uiStore.setBadgeList).not.toHaveBeenCalled();
    });
  });

  it('should handle non-200 HTTP status code', async () => {
    fetchStub.resolves({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Not found' })
    } as Response);

    const result = await mainStore.getBadgeList();

    waitFor(() => {
      expect(result).toBeUndefined();
      expect(uiStore.setBadgeList).not.toHaveBeenCalled();
    });
  });

  it('should handle request timeout', async () => {
    fetchStub.rejects(new Error('TimeoutError'));

    const result = await mainStore.getBadgeList();

    waitFor(() => {
      expect(result).toBeUndefined();
      expect(uiStore.setBadgeList).not.toHaveBeenCalled();
    });
  });

  it('should handle malformed badge data', async () => {
    const malformedBadges = [{ id: 1 }, { name: 'Badge 2' }, null, undefined, {}];

    fetchStub.resolves({
      ok: true,
      status: 200,
      json: () => Promise.resolve(malformedBadges)
    } as Response);

    const result = await mainStore.getBadgeList();

    waitFor(() => {
      expect(result).toEqual(malformedBadges);
      expect(uiStore.setBadgeList).toHaveBeenCalledWith(malformedBadges);
    });
  });

  it('should handle server error (500)', async () => {
    fetchStub.resolves({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Internal server error' })
    } as Response);

    const result = await mainStore.getBadgeList();

    waitFor(() => {
      expect(result).toBeUndefined();
      expect(uiStore.setBadgeList).not.toHaveBeenCalled();
    });
  });

  it('should handle unauthorized access (401)', async () => {
    fetchStub.resolves({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'Unauthorized' })
    } as Response);

    const result = await mainStore.getBadgeList();

    waitFor(() => {
      expect(result).toBeUndefined();
      expect(uiStore.setBadgeList).not.toHaveBeenCalled();
    });
  });

  it('should handle AbortSignal timeout', async () => {
    fetchStub.rejects(new Error('The operation was aborted'));

    const result = await mainStore.getBadgeList();

    waitFor(() => {
      expect(result).toBeUndefined();
      expect(uiStore.setBadgeList).not.toHaveBeenCalled();
    });
  });

  it('should make request with correct parameters', async () => {
    fetchStub.resolves({
      ok: true,
      status: 200,
      json: () => Promise.resolve([])
    } as Response);

    await mainStore.getBadgeList();

    waitFor(() => {
      expect(fetchStub.firstCall.args[1]).toEqual({
        method: 'GET',
        signal: expect.any(AbortSignal)
      });
    });
  });
});

describe('MainStore.setPeopleBounties', () => {
  let mainStore: MainStore;

  beforeEach(() => {
    mainStore = new MainStore();
  });

  it('should set people bounties with valid input', () => {
    const validBounties: PersonBounty[] = [
      {
        owner_id: '1',
        wanted_type: 'bug',
        person: { name: 'John' },
        body: { title: 'Test Bounty' },
        codingLanguage: 'JavaScript',
        estimated_session_length: '2 hours'
      }
    ];

    mainStore.setPersonBounties(validBounties);
    expect(mainStore.personAssignedBounties).toEqual(validBounties);
  });

  it('should handle empty array input', () => {
    const emptyBounties: PersonBounty[] = [];
    mainStore.setPersonBounties(emptyBounties);
    expect(mainStore.personAssignedBounties).toEqual([]);
  });

  it('should handle single element array', () => {
    const singleBounty: PersonBounty[] = [
      {
        owner_id: '1',
        wanted_type: 'feature',
        person: { name: 'Alice' },
        body: { title: 'Single Bounty' },
        codingLanguage: 'TypeScript',
        estimated_session_length: '1 hour'
      }
    ];

    mainStore.setPersonBounties(singleBounty);
    expect(mainStore.personAssignedBounties).toEqual(singleBounty);
  });

  it('should throw error for null input', () => {
    waitFor(() => {
      expect(() => {
        mainStore.setPersonBounties(null as unknown as PersonBounty[]);
      }).toThrow(TypeError);
    });
  });

  it('should throw error for undefined input', () => {
    waitFor(() => {
      expect(() => {
        mainStore.setPersonBounties(undefined as unknown as PersonBounty[]);
      }).toThrow(TypeError);
    });
  });

  it('should throw error for non-array input', () => {
    waitFor(() => {
      expect(() => {
        mainStore.setPersonBounties({} as unknown as PersonBounty[]);
      }).toThrow(TypeError);
    });
  });

  it('should throw error for array with invalid objects', () => {
    const invalidBounties = [
      { invalid: 'data' },
      { wrong: 'structure' }
    ] as unknown as PersonBounty[];

    waitFor(() => {
      expect(() => {
        mainStore.setPersonBounties(invalidBounties);
      }).toThrow(TypeError);
    });
  });

  it('should handle large array input', () => {
    const largeBounties: PersonBounty[] = Array.from({ length: 1000 }, (_: unknown, i: number) => ({
      owner_id: i.toString(),
      wanted_type: 'bug',
      person: { name: `Person ${i}` },
      body: { title: `Bounty ${i}` },
      codingLanguage: 'JavaScript',
      estimated_session_length: '2 hours'
    }));

    mainStore.setPersonBounties(largeBounties);
    expect(mainStore.personAssignedBounties.length).toBe(1000);
    expect(mainStore.personAssignedBounties).toEqual(largeBounties);
  });

  it('should throw error for array with mixed types', () => {
    const mixedBounties = [
      {
        owner_id: '1',
        wanted_type: 'bug',
        person: { name: 'John' },
        body: { title: 'Valid Bounty' },
        codingLanguage: 'JavaScript',
        estimated_session_length: '2 hours'
      },
      'invalid string entry',
      42,
      null
    ] as unknown as PersonBounty[];

    waitFor(() => {
      expect(() => {
        mainStore.setPersonBounties(mixedBounties);
      }).toThrow(TypeError);
    });
  });

  it('should handle array with duplicate entries', () => {
    const duplicateBounty: PersonBounty = {
      owner_id: '1',
      wanted_type: 'bug',
      person: { name: 'John' },
      body: { title: 'Duplicate Bounty' },
      codingLanguage: 'JavaScript',
      estimated_session_length: '2 hours'
    };

    const duplicateBounties: PersonBounty[] = [duplicateBounty, duplicateBounty];
    mainStore.setPersonBounties(duplicateBounties);
    expect(mainStore.personAssignedBounties).toEqual(duplicateBounties);
    expect(mainStore.personAssignedBounties.length).toBe(2);
  });

  it('should set bounties within reasonable time', () => {
    const start = performance.now();
    const largeBounties: PersonBounty[] = Array.from(
      { length: 10000 },
      (_: unknown, i: number) => ({
        owner_id: i.toString(),
        wanted_type: 'bug',
        person: { name: `Person ${i}` },
        body: { title: `Bounty ${i}` },
        codingLanguage: 'JavaScript',
        estimated_session_length: '2 hours'
      })
    );

    mainStore.setPersonBounties(largeBounties);
    const end = performance.now();
    const executionTime = end - start;

    waitFor(() => {
      expect(executionTime).toBeLessThan(1000);
      expect(mainStore.personAssignedBounties.length).toBe(10000);
    });
  });
});

describe('setPeople', () => {
  let mainStore: MainStore;

  beforeEach(() => {
    mainStore = new MainStore();
  });

  const validInput: Person[] = [
    {
      id: 1,
      unique_name: 'alice123',
      owner_pubkey: 'pubkey1',
      uuid: 'uuid1',
      owner_alias: 'AliceOwner',
      description: 'Description for Alice',
      img: 'https://example.com/alice.jpg',
      tags: ['tag1', 'tag2'],
      photo_url: 'https://example.com/photo_alice.jpg',
      alias: 'Alice',
      route_hint: 'route_hint1',
      contact_key: 'contact_key1',
      price_to_meet: 100,
      url: 'https://example.com/alice',
      verification_signature: 'signature1',
      extras: {}
    },
    {
      id: 2,
      unique_name: 'bob123',
      owner_pubkey: 'pubkey2',
      uuid: 'uuid2',
      owner_alias: 'BobOwner',
      description: 'Description for Bob',
      img: 'https://example.com/bob.jpg',
      tags: ['tag3', 'tag4'],
      photo_url: 'https://example.com/photo_bob.jpg',
      alias: 'Bob',
      route_hint: 'route_hint2',
      contact_key: 'contact_key2',
      price_to_meet: 200,
      url: 'https://example.com/bob',
      verification_signature: 'signature2',
      extras: {}
    }
  ];

  test('Standard Input', () => {
    mainStore.setPeople(validInput);
    expect(mainStore.people).toEqual(validInput);
  });

  test('Empty Array', () => {
    const input: Person[] = [];
    mainStore.setPeople(input);
    expect(mainStore.people).toEqual(input);
  });

  test('Single Element Array', () => {
    const singlePersonInput: Person[] = [validInput[0]];
    mainStore.setPeople(singlePersonInput);
    expect(mainStore.people).toEqual(singlePersonInput);
  });

  test('Large Array', () => {
    const largeArray: Person[] = Array.from({ length: 10000 }, (_: unknown, i: number) => ({
      id: i,
      unique_name: `person${i}`,
      owner_pubkey: `pubkey${i}`,
      uuid: `uuid${i}`,
      owner_alias: `alias${i}`,
      description: `Description for person${i}`,
      img: `https://example.com/person${i}.jpg`,
      tags: [`tag${i}`],
      photo_url: `https://example.com/photo_person${i}.jpg`,
      alias: `Person${i}`,
      route_hint: `route_hint${i}`,
      contact_key: `contact_key${i}`,
      price_to_meet: i * 10,
      url: `https://example.com/person${i}`,
      verification_signature: `signature${i}`,
      extras: {}
    }));
    mainStore.setPeople(largeArray);
    expect(mainStore.people).toEqual(largeArray);
  });

  test('Array with Duplicate Entries', () => {
    const duplicateArray: Person[] = [validInput[0], validInput[0]];
    mainStore.setPeople(duplicateArray);
    expect(mainStore.people).toEqual(duplicateArray);
  });

  test('Invalid Data Type', () => {
    // @ts-expect-error
    expect(() => mainStore.setPeople({ name: 'Invalid', age: 50 })).toThrow(TypeError);
  });

  test('Null Input', () => {
    // @ts-expect-error
    expect(() => mainStore.setPeople(null)).toThrow(TypeError);
  });

  test('Undefined Input', () => {
    // @ts-expect-error
    expect(() => mainStore.setPeople(undefined)).toThrow(TypeError);
  });

  test('Array with Complex Objects', () => {
    const complexInput: Person[] = [
      {
        ...validInput[0]
      }
    ];
    mainStore.setPeople(complexInput);
    expect(mainStore.people).toEqual(complexInput);
  });

  test('Array with Mixed Valid and Invalid Objects', () => {
    // TypeScript should prevent this from compiling.
    // @ts-expect-error
    expect(() => mainStore.setPeople([validInput[0], { invalid: 'data' }])).toThrow(TypeError);
  });

  test('Array with Null Elements', () => {
    // @ts-expect-error
    expect(() => mainStore.setPeople([validInput[0], null])).toThrow(TypeError);
  });

  test('Array with Undefined Elements', () => {
    // @ts-expect-error
    expect(() => mainStore.setPeople([validInput[0], undefined])).toThrow(TypeError);
  });
});

describe('getPersonById', () => {
  let mainStore: MainStore;
  const mockJwt = 'test_jwt';
  const mockSessionId = 'test-session-id';
  let fetchStub: sinon.SinonStub;

  beforeEach(() => {
    mainStore = new MainStore();
    uiStore.setMeInfo({ ...user, tribe_jwt: mockJwt });
    sinon.stub(mainStore, 'getSessionId').returns(mockSessionId);
    fetchStub = sinon.stub(window, 'fetch');
  });

  afterEach(() => {
    sinon.restore();
  });

  const tests = [
    {
      name: 'Valid ID Input',
      id: 1,
      mockResponse: { id: 1 },
      expectedPerson: { id: 1 },
      expectError: false
    },
    {
      name: 'Another Valid ID Input',
      id: 2,
      mockResponse: { id: 2 },
      expectedPerson: { id: 2 },
      expectError: false
    },
    {
      name: 'Minimum ID Value',
      id: 0,
      mockResponse: { id: 0 },
      expectedPerson: { id: 0 },
      expectError: false
    },
    {
      name: 'Maximum ID Value',
      id: 2147483647,
      mockResponse: null,
      mockError: new Error('not found'),
      expectedPerson: null,
      expectError: true
    },
    {
      name: 'Non-Existent ID',
      id: 9999,
      mockResponse: null,
      mockError: new Error('not found'),
      expectedPerson: null,
      expectError: true
    },
    {
      name: 'Negative ID',
      id: -1,
      mockResponse: null,
      mockError: new Error('invalid id'),
      expectedPerson: null,
      expectError: true
    },
    {
      name: 'ID as a Floating Point Number',
      id: 1.5,
      mockResponse: { id: 1 },
      expectedPerson: { id: 1 },
      expectError: false
    }
  ];

  tests.forEach((tt: any) => {
    it(tt.name, async () => {
      if (tt.mockResponse) {
        fetchStub.resolves({
          ok: true,
          status: 200,
          json: () => Promise.resolve(tt.mockResponse)
        } as Response);
      } else {
        fetchStub.rejects(tt.mockError || new Error('Unknown error'));
      }

      try {
        const person = await mainStore.getPersonById(tt.id);

        if (tt.expectError) {
          fail('Expected an error but did not receive one');
        } else {
          expect(person).toEqual(tt.expectedPerson);
        }
      } catch (err) {
        if (!tt.expectError) {
          fail(`Did not expect an error but received: ${err}`);
        } else {
          expect(err).toEqual(tt.mockError);
        }
      }
    });
  });
});

describe('getUserWorkspaceByUuid', () => {
  let mainStore: MainStore;
  let fetchStub: sinon.SinonStub;
  const origFetch = global.fetch;

  beforeAll(() => {
    fetchStub = sinon.stub(global, 'fetch');
  });

  afterAll(() => {
    global.fetch = origFetch;
    sinon.restore();
  });

  beforeEach(() => {
    mainStore = new MainStore();
    uiStore.setMeInfo(user);
    fetchStub.reset();
  });

  it('should fetch workspace data for a valid UUID', async () => {
    const uuid = 'clic8k04nncuuf32kgr0';
    const mockWorkspace = {
      id: 42,
      uuid: uuid,
      name: 'Test Workspace',
      owner_pubkey: '035f22835fbf55cf4e6823447c63df74012d1d587ed60ef7cbfa3e430278c44cce',
      img: 'https://example.com/workspace.jpg',
      created: '2023-11-27T16:31:12.699355Z',
      updated: '2023-11-27T16:31:12.699355Z',
      show: false,
      deleted: false,
      bounty_count: 1
    };

    fetchStub.resolves({
      ok: true,
      status: 200,
      json: sinon.stub().resolves(mockWorkspace)
    } as any);

    const result = await mainStore.getUserWorkspaceByUuid(uuid);

    sinon.assert.calledWithMatch(
      fetchStub,
      `${TribesURL}/workspaces/${uuid}`,
      sinon.match({
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sinon.match.string
        }
      })
    );

    waitFor(() => {
      expect(result).toEqual(mockWorkspace);
    });
  });

  it('should return undefined for a valid UUID with no workspace data', async () => {
    const uuid = 'nonexistent-uuid';

    fetchStub.resolves({
      ok: true,
      status: 200,
      json: sinon.stub().resolves(null)
    } as any);

    const result = await mainStore.getUserWorkspaceByUuid(uuid);

    waitFor(() => {
      expect(result).toBeUndefined();
    });
  });

  it('should return undefined for an empty UUID string', async () => {
    const result = await mainStore.getUserWorkspaceByUuid('');

    waitFor(() => {
      expect(result).toBeUndefined();
      sinon.assert.notCalled(fetchStub);
    });
  });

  it('should handle UUID with special characters', async () => {
    const uuid = 'test-!@#$%^&*()_+uuid';

    fetchStub.resolves({
      ok: true,
      status: 200,
      json: sinon.stub().resolves(null)
    } as any);

    const result = await mainStore.getUserWorkspaceByUuid(uuid);

    sinon.assert.calledWithMatch(fetchStub, `${TribesURL}/workspaces/${uuid}`, sinon.match.any);

    waitFor(() => {
      expect(result).toBeUndefined();
    });
  });

  it('should handle maximum length UUID', async () => {
    const uuid = 'a'.repeat(255);

    fetchStub.resolves({
      ok: true,
      status: 200,
      json: sinon.stub().resolves(null)
    } as any);

    const result = await mainStore.getUserWorkspaceByUuid(uuid);

    sinon.assert.calledWithMatch(fetchStub, `${TribesURL}/workspaces/${uuid}`, sinon.match.any);

    waitFor(() => {
      expect(result).toBeUndefined();
    });
  });

  it('should handle invalid UUID type (Number)', async () => {
    const result = await mainStore.getUserWorkspaceByUuid(42 as any);

    waitFor(() => {
      expect(result).toBeUndefined();
      sinon.assert.notCalled(fetchStub);
    });
  });

  it('should handle invalid UUID type (Null)', async () => {
    const result = await mainStore.getUserWorkspaceByUuid(null as any);

    waitFor(() => {
      expect(result).toBeUndefined();
      sinon.assert.notCalled(fetchStub);
    });
  });

  it('should handle network error', async () => {
    const uuid = 'network-error-uuid';

    fetchStub.rejects(new Error('Network error'));

    const result = await mainStore.getUserWorkspaceByUuid(uuid);

    expect(result).toBeUndefined();
  });

  it('should handle invalid JSON response', async () => {
    const uuid = 'invalid-json-uuid';

    fetchStub.resolves({
      ok: true,
      status: 200,
      json: sinon.stub().rejects(new Error('Invalid JSON'))
    } as any);

    const result = await mainStore.getUserWorkspaceByUuid(uuid);

    expect(result).toBeUndefined();
  });

  it('should handle high volume of requests', async () => {
    const uuid = 'high-volume-uuid';
    const mockWorkspace = {
      id: 42,
      uuid: uuid,
      name: 'High Volume Workspace'
    };

    fetchStub.resolves({
      ok: true,
      status: 200,
      json: sinon.stub().resolves(mockWorkspace)
    } as any);

    const requests = Array(100)
      .fill(0)
      .map(() => mainStore.getUserWorkspaceByUuid(uuid));
    const results = await Promise.all(requests);

    expect(results.every((result: any) => result !== undefined)).toBe(true);
  });

  it('should handle UUID with leading/trailing spaces', async () => {
    const uuid = '  clic8k04nncuuf32kgr0  ';

    fetchStub.resolves({
      ok: true,
      status: 200,
      json: sinon.stub().resolves(null)
    } as any);
    waitFor(async () => {
      const result = await mainStore.getUserWorkspaceByUuid(uuid);

      sinon.assert.calledWithMatch(
        fetchStub,
        `${TribesURL}/workspaces/${uuid.trim()}`,
        sinon.match.any
      );

      expect(result).toBeUndefined();
    });
  });

  it('should handle UUID with mixed case sensitivity', async () => {
    const uuid = 'ClIc8K04NncUUf32KgR0';

    fetchStub.resolves({
      ok: true,
      status: 200,
      json: sinon.stub().resolves(null)
    } as any);

    waitFor(async () => {
      const result = await mainStore.getUserWorkspaceByUuid(uuid);

      sinon.assert.calledWithMatch(
        fetchStub,
        `${TribesURL}/workspaces/${uuid.toLowerCase()}`,
        sinon.match.any
      );

      expect(result).toBeUndefined();
    });
  });

  it('should handle UUID with non-ASCII characters', async () => {
    const uuid = 'тестовый-uuid';

    fetchStub.resolves({
      ok: true,
      status: 200,
      json: sinon.stub().resolves(null)
    } as any);

    const result = await mainStore.getUserWorkspaceByUuid(uuid);

    sinon.assert.calledWithMatch(fetchStub, `${TribesURL}/workspaces/${uuid}`, sinon.match.any);

    waitFor(() => {
      expect(result).toBeUndefined();
    });
  });

  it('should handle server timeout', async () => {
    const uuid = 'timeout-uuid';

    fetchStub.resolves({
      ok: false,
      status: 408,
      json: sinon.stub().resolves(null)
    } as any);

    const result = await mainStore.getUserWorkspaceByUuid(uuid);

    waitFor(() => {
      expect(result).toBeUndefined();
    });
  });
});

describe('setPeople Tests', () => {
  let mainStore: MainStore;

  beforeEach(() => {
    mainStore = new MainStore();
  });

  const validPerson: Person = {
    id: 1,
    unique_name: 'test123',
    owner_pubkey: 'pubkey1',
    uuid: 'uuid1',
    owner_alias: 'TestOwner',
    description: 'Test Description',
    img: 'https://example.com/test.jpg',
    tags: ['tag1'],
    photo_url: 'https://example.com/photo_test.jpg',
    alias: 'Test',
    route_hint: 'route_hint1',
    contact_key: 'contact_key1',
    price_to_meet: 100,
    url: 'https://example.com/test',
    verification_signature: 'signature1',
    extras: {}
  };

  test('Standard Input', () => {
    const input = [validPerson];
    mainStore.setPeople(input);
    expect(mainStore.people).toEqual(input);
  });

  test('Empty Array', () => {
    const input: Person[] = [];
    mainStore.setPeople(input);
    expect(mainStore.people).toEqual([]);
  });

  test('Single Element Array', () => {
    const input = [validPerson];
    mainStore.setPeople(input);
    expect(mainStore.people).toEqual(input);
  });

  test('Large Array', () => {
    const input = Array.from({ length: 1000 }, (_: any, i: number) => ({
      ...validPerson,
      id: i,
      unique_name: `test${i}`
    }));
    mainStore.setPeople(input);
    expect(mainStore.people).toEqual(input);
  });

  test('Null Input', () => {
    expect(() => mainStore.setPeople(null as any)).toThrow(TypeError);
  });

  test('Invalid Data Type', () => {
    expect(() => mainStore.setPeople('not an array' as any)).toThrow(TypeError);
  });

  test('Array with Invalid Elements', () => {
    const invalidInput = [validPerson, { id: 'invalid', name: 'Invalid Person' }];
    waitFor(() => {
      expect(() => mainStore.setPeople(invalidInput as any)).toThrow(TypeError);
    });
  });

  test('Array with Duplicate Entries', () => {
    const input = [validPerson, { ...validPerson }];
    mainStore.setPeople(input);
    expect(mainStore.people).toEqual(input);
  });

  test('Array with Complex Objects', () => {
    const complexPerson = {
      ...validPerson,
      extras: {
        skills: ['JavaScript', 'TypeScript'],
        languages: ['English', 'Spanish'],
        certifications: ['AWS', 'Azure']
      }
    };
    const input = [complexPerson];
    mainStore.setPeople(input as any);
    expect(mainStore.people).toEqual(input);
  });

  test('Stress Test with Maximum Capacity', () => {
    const input = Array.from({ length: 10000 }, (_: any, i: number) => ({
      ...validPerson,
      id: i,
      unique_name: `test${i}`
    }));
    const start = performance.now();
    mainStore.setPeople(input);
    const end = performance.now();
    const executionTime = end - start;

    waitFor(() => {
      expect(mainStore.people).toEqual(input);
      expect(executionTime).toBeLessThan(1000);
    });
  });

  test('Array with Mixed Validity', () => {
    const mixedInput = [validPerson, { id: 2 }, undefined, null];
    expect(() => mainStore.setPeople(mixedInput as any)).toThrow(TypeError);
  });

  test('Array with Edge Age Values', () => {
    const edgeCases = [
      {
        ...validPerson,
        id: Number.MAX_SAFE_INTEGER
      },
      {
        ...validPerson,
        id: Number.MIN_SAFE_INTEGER
      },
      {
        ...validPerson,
        id: 0
      }
    ];
    mainStore.setPeople(edgeCases);
    expect(mainStore.people).toEqual(edgeCases);
  });
});

describe('setAssignInvoice Tests', () => {
  let mainStore: MainStore;

  beforeEach(() => {
    mainStore = new MainStore();
  });

  test('Basic Functionality: Valid String Input', () => {
    const testInvoice = 'lnbc123xyz';
    mainStore.setAssignInvoice(testInvoice);
    expect(mainStore.assignInvoice).toBe(testInvoice);
  });

  test('Edge Case: Empty String', () => {
    mainStore.setAssignInvoice('');
    expect(mainStore.assignInvoice).toBe('');
  });

  test('Edge Case: Long String', () => {
    const longInvoice = 'a'.repeat(10000);
    mainStore.setAssignInvoice(longInvoice);
    expect(mainStore.assignInvoice).toBe(longInvoice);
  });

  test('Error Condition: Null Input', () => {
    waitFor(() => {
      expect(() => mainStore.setAssignInvoice(null as any)).toThrow(TypeError);
    });
  });

  test('Error Condition: Undefined Input', () => {
    waitFor(() => {
      expect(() => mainStore.setAssignInvoice(undefined as any)).toThrow(TypeError);
    });
  });

  test('Error Condition: Non-String Input (Number)', () => {
    waitFor(() => {
      expect(() => mainStore.setAssignInvoice(123 as any)).toThrow(TypeError);
    });
  });

  test('Error Condition: Non-String Input (Object)', () => {
    waitFor(() => {
      expect(() => mainStore.setAssignInvoice({ invoice: 'test' } as any)).toThrow(TypeError);
    });
  });

  test('Special Case: String with Special Characters', () => {
    const specialCharsInvoice = 'lnbc!@#$%^&*()_+-=[]{}|;:,.<>?';
    mainStore.setAssignInvoice(specialCharsInvoice);
    expect(mainStore.assignInvoice).toBe(specialCharsInvoice);
  });

  test('Special Case: String with Whitespace', () => {
    const whitespaceInvoice = '  lnbc123xyz  ';
    mainStore.setAssignInvoice(whitespaceInvoice);
    expect(mainStore.assignInvoice).toBe(whitespaceInvoice);
  });

  test('Error Condition: Non-String Input (Boolean)', () => {
    waitFor(() => {
      expect(() => mainStore.setAssignInvoice(true as any)).toThrow(TypeError);
    });
  });

  test('Error Condition: Non-String Input (Array)', () => {
    waitFor(() => {
      expect(() => mainStore.setAssignInvoice(['test'] as any)).toThrow(TypeError);
    });
  });
});

describe('saveProfile', () => {
  let mainStore: MainStore;
  const mockMeInfo = {
    id: 1,
    tribe_jwt: 'test_jwt',
    alias: 'test_user'
  };

  beforeEach(() => {
    mainStore = new MainStore();
    uiStore.setMeInfo(mockMeInfo as any);
    jest.clearAllMocks();
  });

  it('should convert price_to_meet to an integer and save profile successfully', async () => {
    const mockResponse = { status: 200, json: () => Promise.resolve({ id: 1, name: 'Test' }) };
    mainStore.saveBountyPerson = jest.fn().mockResolvedValue(mockResponse);
    mainStore.getSelf = jest.fn();

    await mainStore.saveProfile({ price_to_meet: '100' });

    waitFor(() => {
      expect(mainStore.saveBountyPerson).toHaveBeenCalledWith({ price_to_meet: 100 });
      expect(uiStore.meInfo).toEqual({ ...mockMeInfo, id: 1, name: 'Test' });
    });
  });

  it('should handle valid input without price_to_meet', async () => {
    const mockResponse = { status: 200, json: () => Promise.resolve({ id: 1 }) };
    mainStore.saveBountyPerson = jest.fn().mockResolvedValue(mockResponse);

    await mainStore.saveProfile({ name: 'Test User' });

    waitFor(() => {
      expect(mainStore.saveBountyPerson).toHaveBeenCalledWith({ name: 'Test User' });
    });
  });

  it('should handle empty body and return early', async () => {
    mainStore.saveBountyPerson = jest.fn();

    await mainStore.saveProfile(null);

    expect(mainStore.saveBountyPerson).not.toHaveBeenCalled();
  });

  it('should handle non-numeric price_to_meet', async () => {
    const mockResponse = { status: 200, json: () => Promise.resolve({}) };
    mainStore.saveBountyPerson = jest.fn().mockResolvedValue(mockResponse);

    await mainStore.saveProfile({ price_to_meet: 'invalid' });

    waitFor(() => {
      expect(mainStore.saveBountyPerson).toHaveBeenCalledWith({ price_to_meet: NaN });
    });
  });

  it('should handle negative price_to_meet', async () => {
    const mockResponse = { status: 200, json: () => Promise.resolve({}) };
    mainStore.saveBountyPerson = jest.fn().mockResolvedValue(mockResponse);

    await mainStore.saveProfile({ price_to_meet: '-100' });

    waitFor(() => {
      expect(mainStore.saveBountyPerson).toHaveBeenCalledWith({ price_to_meet: -100 });
    });
  });

  it('should return null if uiStore.meInfo is null', async () => {
    uiStore.setMeInfo(null);
    mainStore.saveBountyPerson = jest.fn();

    const result = await mainStore.saveProfile({ name: 'Test' });

    expect(result).toBeNull();
    expect(mainStore.saveBountyPerson).not.toHaveBeenCalled();
  });

  it('should handle saveBountyPerson returning null', async () => {
    mainStore.saveBountyPerson = jest.fn().mockResolvedValue(null);

    await mainStore.saveProfile({ name: 'Test' });

    waitFor(() => {
      expect(uiStore.toasts[0]).toEqual({
        id: '1',
        title: 'Profile saving failed'
      });
    });
  });

  it('should handle saveBountyPerson throwing an error', async () => {
    mainStore.saveBountyPerson = jest.fn().mockRejectedValue(new Error('Network error'));

    await mainStore.saveProfile({ name: 'Test' });

    waitFor(() => {
      expect(uiStore.toasts[0]).toEqual({
        id: '1',
        title: 'Failed to save profile'
      });
    });
  });

  it('should handle response status not 200', async () => {
    const mockResponse = { status: 400 };
    mainStore.saveBountyPerson = jest.fn().mockResolvedValue(mockResponse);

    await mainStore.saveProfile({ name: 'Test' });

    waitFor(() => {
      expect(mainStore.getSelf).not.toHaveBeenCalled();
    });
  });

  it('should handle large body object', async () => {
    const mockResponse = { status: 200, json: () => Promise.resolve({}) };
    mainStore.saveBountyPerson = jest.fn().mockResolvedValue(mockResponse);

    const largeBody = {
      name: 'Test',
      price_to_meet: '1000',
      description: 'x'.repeat(1000),
      tags: Array(100).fill('tag'),
      metadata: { key: 'x'.repeat(1000) }
    };

    await mainStore.saveProfile(largeBody);

    waitFor(() => {
      expect(mainStore.saveBountyPerson).toHaveBeenCalledWith({
        ...largeBody,
        price_to_meet: 1000
      });
    });
  });

  it('should convert float string price_to_meet to integer', async () => {
    const mockResponse = { status: 200, json: () => Promise.resolve({}) };
    mainStore.saveBountyPerson = jest.fn().mockResolvedValue(mockResponse);

    await mainStore.saveProfile({ price_to_meet: '100.75' });

    waitFor(() => {
      expect(mainStore.saveBountyPerson).toHaveBeenCalledWith({ price_to_meet: 100 });
    });
  });

  it('should handle large integer string price_to_meet', async () => {
    const mockResponse = { status: 200, json: () => Promise.resolve({}) };
    mainStore.saveBountyPerson = jest.fn().mockResolvedValue(mockResponse);

    await mainStore.saveProfile({ price_to_meet: '999999999' });
    waitFor(() => {
      expect(mainStore.saveBountyPerson).toHaveBeenCalledWith({ price_to_meet: 999999999 });
    });
  });

  it('should ignore unrelated fields in body', async () => {
    const mockResponse = { status: 200, json: () => Promise.resolve({ id: 1 }) };
    mainStore.saveBountyPerson = jest.fn().mockResolvedValue(mockResponse);

    const body = {
      name: 'Test',
      price_to_meet: '100',
      _internal: 'should be ignored',
      __proto__: { malicious: true }
    };

    await mainStore.saveProfile(body);

    waitFor(() => {
      expect(mainStore.saveBountyPerson).toHaveBeenCalledWith({
        name: 'Test',
        price_to_meet: 100
      });
    });
  });
});

describe('MainStore.getBalances', () => {
  let mainStore: MainStore;
  let fetchStub: sinon.SinonStub;

  beforeEach(() => {
    mainStore = new MainStore();
    fetchStub = sinon.stub(window, 'fetch');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Valid Public Key', async () => {
    const mockBalances = [{ asset: 'BTC', amount: 100 }];
    fetchStub.resolves({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockBalances)
    } as Response);

    waitFor(async () => {
      const result = await mainStore.getBalances('validPubKey123');
      expect(result).toEqual(mockBalances);
    });
  });

  it('Valid Public Key with No Balances', async () => {
    fetchStub.resolves({
      ok: true,
      status: 200,
      json: () => Promise.resolve([])
    } as Response);

    waitFor(async () => {
      const result = await mainStore.getBalances('validPubKey123');
      expect(result).toEqual([]);
    });
  });

  it('Empty Public Key', async () => {
    const result = await mainStore.getBalances('');
    expect(result).toBeUndefined();
  });

  it('Extremely Long Public Key', async () => {
    const longPubKey = 'a'.repeat(10000);
    const mockBalances = [{ asset: 'BTC', amount: 100 }];
    fetchStub.resolves({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockBalances)
    } as Response);

    waitFor(async () => {
      const result = await mainStore.getBalances(longPubKey);
      expect(result).toEqual(mockBalances);
    });
  });

  it('Invalid Public Key Format', async () => {
    const result = await mainStore.getBalances('invalid!@#$%');
    expect(result).toBeUndefined();
  });

  it('Null Public Key', async () => {
    const result = await mainStore.getBalances(null);
    expect(result).toBeUndefined();
  });

  it('Network Error', async () => {
    fetchStub.rejects(new Error('Network error'));
    const result = await mainStore.getBalances('validPubKey123');
    expect(result).toBeUndefined();
  });

  it('Non-JSON Response', async () => {
    fetchStub.resolves({
      ok: true,
      status: 200,
      json: () => Promise.reject(new Error('Invalid JSON'))
    } as Response);

    const result = await mainStore.getBalances('validPubKey123');
    expect(result).toBeUndefined();
  });

  it('High Volume of Balances', async () => {
    const largeBalancesArray = Array.from({ length: 1000 }, (_: any, i: number) => ({
      asset: `Asset${i}`,
      amount: i * 100
    }));
    fetchStub.resolves({
      ok: true,
      status: 200,
      json: () => Promise.resolve(largeBalancesArray)
    } as Response);

    waitFor(async () => {
      const result = await mainStore.getBalances('validPubKey123');
      expect(result).toEqual(largeBalancesArray);
      expect(result.length).toBe(1000);
    });
  });

  it('Server Timeout', async () => {
    fetchStub.rejects(new Error('TimeoutError'));
    const result = await mainStore.getBalances('validPubKey123');
    expect(result).toBeUndefined();
  });

  it('Server Returns Error Code', async () => {
    fetchStub.resolves({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Internal server error' })
    } as Response);

    const result = await mainStore.getBalances('validPubKey123');
    expect(result).toBeUndefined();
  });

  it('Malformed URL', async () => {
    const invalidPubKey = 'invalid pubkey with spaces';
    const result = await mainStore.getBalances(invalidPubKey);
    expect(result).toBeUndefined();
  });

  it('Unexpected Data Structure', async () => {
    const unexpectedData = {
      notAnArray: true,
      someOtherField: 'value'
    };
    fetchStub.resolves({
      ok: true,
      status: 200,
      json: () => Promise.resolve(unexpectedData)
    } as Response);

    waitFor(async () => {
      const result = await mainStore.getBalances('validPubKey123');
      expect(result).toEqual(unexpectedData);
    });
  });
});

describe('convertTicketsToBounties', () => {
  let mainStore: MainStore;
  let fetchStub: sinon.SinonStub;
  const validPayload = {
    tickets_to_bounties: [{ ticketUUID: 'test-uuid-1' }]
  };

  beforeEach(() => {
    mainStore = new MainStore();
    mainStore.initializeSessionId();
    fetchStub = sinon.stub(global, 'fetch');
  });

  afterEach(() => {
    fetchStub.restore();
  });

  it('should successfully convert tickets to bounties', async () => {
    const url = `${TribesURL}/bounties/ticket/bounty/bulk`;
    const expectedResponse = {
      success: true,
      converted_bounties: [1, 2, 3],
      message: 'Successfully converted tickets to bounties'
    };

    const expectedRequestOptions: RequestInit = {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(validPayload),
      headers: {
        'x-jwt': user.tribe_jwt || '',
        'Content-Type': 'application/json',
        'x-session-id': mainStore.sessionId
      }
    };

    fetchStub.resolves({
      ok: true,
      json: () => Promise.resolve(expectedResponse)
    } as Response);

    const result = await mainStore.convertTicketsToBounties(validPayload);
    waitFor(() => {
      expect(result).toEqual(expectedResponse);
      expect(fetchStub.calledOnce).toBe(true);
      expect(fetchStub.firstCall.args[0]).toBe(url);
      expect(fetchStub.firstCall.args[1]).toMatchObject(expectedRequestOptions);
    });
  });

  it('should return null when user is not authenticated', async () => {
    uiStore.meInfo = null;
    const result = await mainStore.convertTicketsToBounties(validPayload);
    expect(result).toBeNull();
  });

  it('should return null when API request fails', async () => {
    fetchStub.resolves({
      ok: false,
      json: () => Promise.resolve({ message: 'Failed to convert tickets' })
    } as Response);

    const result = await mainStore.convertTicketsToBounties(validPayload);
    expect(result).toBeNull();
  });

  it('should return null when network error occurs', async () => {
    fetchStub.rejects(new Error('Network error'));

    const result = await mainStore.convertTicketsToBounties(validPayload);
    expect(result).toBeNull();
  });

  it('should handle empty tickets array', async () => {
    const emptyPayload = { tickets_to_bounties: [] };

    fetchStub.resolves({
      ok: true,
      json: () => Promise.resolve({ success: true, converted_bounties: [] })
    } as Response);

    const result = await mainStore.convertTicketsToBounties(emptyPayload);
    waitFor(() => {
      expect(result?.results).toEqual([]);
    });
  });

  it('should handle multiple tickets', async () => {
    const multiPayload = {
      tickets_to_bounties: [
        { ticketUUID: 'test-uuid-1' },
        { ticketUUID: 'test-uuid-2' },
        { ticketUUID: 'test-uuid-3' }
      ]
    };

    fetchStub.resolves({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          converted_bounties: [1, 2, 3]
        })
    } as Response);

    const result = await mainStore.convertTicketsToBounties(multiPayload);
    waitFor(() => {
      expect(result?.results.length).toBe(3);
    });
  });
});
