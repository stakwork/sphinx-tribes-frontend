/* eslint-disable no-dupe-else-if */
import { uniqBy } from 'lodash';
import memo from 'memo-decorator';
import { action, makeAutoObservable, observable } from 'mobx';
import { persist } from 'mobx-persist';
import { Phase, Repository } from 'people/widgetViews/workspace/interface';
import posthog from 'posthog-js';
import api from '../api';
import { getHostIncludingDockerHosts } from '../config/host';
import { TribesURL } from '../config/host';
import { convertLocaleToNumber, randomString } from '../helpers';
import { getUserAvatarPlaceholder } from './lib';
import { uiStore } from './ui';
import {
  BountyStatus,
  Tribe,
  Bot,
  QueryParams,
  Person,
  PersonPost,
  PersonBounty,
  PersonOffer,
  ClaimOnLiquid,
  LnAuthData,
  LnInvoice,
  Workspace,
  CreateWorkspaceInput,
  WorkspaceUser,
  BountyRoles,
  PaymentHistory,
  BudgetHistory,
  InvoiceDetails,
  InvoiceError,
  FilterStatusCount,
  BudgetWithdrawSuccess,
  BountyMetrics,
  defaultBountyStatus,
  defaultWorkspaceBountyStatus,
  queryLimit,
  orgQuerLimit,
  paginationQueryLimit,
  peopleQueryLimit,
  queryLimitTribes,
  Feature,
  featureLimit,
  CreateFeatureInput,
  FeatureStory,
  UpdateFeatureStoryInput,
  CreateFeatureStoryInput,
  TicketPayload,
  Ticket,
  CodeGraph,
  CreateBountyResponse,
  FeatureFlag,
  FeaturedBounty,
  ConnectionCodesListResponse,
  IActivity,
  INewActivity,
  QuickBountiesResponse,
  QuickTicketsResponse,
  BulkConversionResponse,
  BulkTicketToBountyRequest,
  FeatureCall,
  FeatureStatus,
  ChatWorkflow,
  ApiResponse,
  CodeSpaceMap,
  EnvVar
} from './interface';

function makeTorSaveURL(host: string, key: string) {
  return `sphinx.chat://?action=save&host=${host}&key=${key}`;
}

function makeQueryParams(limit: number, queryParams?: QueryParams): string {
  const adaptedParams = {
    ...queryParams,
    limit: String(limit),
    ...(queryParams?.resetPage ? { resetPage: String(queryParams.resetPage) } : {}),
    ...(queryParams?.page ? { page: String(queryParams.page) } : {}),
    ...(queryParams?.languages ? { languages: queryParams.languages } : {})
  } as Record<string, string>;

  const searchParams = new URLSearchParams(adaptedParams);

  return searchParams.toString();
}

export class MainStore {
  // [x: string]: any;
  tribes: Tribe[] = [];
  ownerTribes: Tribe[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  async getTribes(queryParams?: any): Promise<Tribe[]> {
    let ta = [...uiStore.tags];

    //make tags string for querys
    ta = ta.filter((f: any) => f.checked);
    let tags = '';
    if (ta && ta.length) {
      ta.forEach((o: any, i: any) => {
        tags += o.label;
        if (ta.length - 1 !== i) {
          tags += ',';
        }
      });
    }
    queryParams = { ...queryParams, search: uiStore.searchText, tags };

    const query = makeQueryParams(queryLimitTribes, {
      ...queryParams,
      sortBy: 'last_active=0, last_active',
      direction: 'desc'
    });
    const ts = await api.get(`tribes?${query}`);

    this.tribes = this.doPageListMerger(
      this.tribes,
      ts,
      (n: any) => uiStore.setTribesPageNumber(n),
      queryParams
    );

    return ts;
  }

  bots: Bot[] = [];
  myBots: Bot[] = [];

  async getBots(uniqueName?: string, queryParams?: any): Promise<any> {
    const query = makeQueryParams(100, queryParams);
    const b = await api.get(`bots?${query}`);

    const info = uiStore.meInfo;

    if (uniqueName) {
      b.forEach((t: Bot, i: number) => {
        if (t.unique_name === uniqueName) {
          b.splice(i, 1);
          b.unshift(t);
        }
      });
    }

    const hideBots = ['pleaseprovidedocumentation', 'example'];

    // hide test bots and set images
    b &&
      b.forEach((bb: any, i: any) => {
        if (bb.unique_name === 'btc') {
          // bb.img = "/static/bots_bitcoin.png";
          b.splice(i, 1);
          b.unshift(bb);
        }
        if (bb.unique_name === 'bet') {
          // bb.img = "/static/bots_betting.png";
          b.splice(i, 1);
          b.unshift(bb);
        }
        if (bb.unique_name === 'hello' || bb.unique_name === 'welcome') {
          // bb.img = "/static/bots_welcome.png";
          b.splice(i, 1);
          b.unshift(bb);
        }
        if (
          bb.unique_name &&
          (bb.unique_name.includes('test') || hideBots.includes(bb.unique_name))
        ) {
          // hide all test bots
          bb.hide = true;
        }

        if (bb.owner_pubkey === info?.owner_pubkey) {
          // hide my own bots
          bb.hide = true;
        }
      });

    this.bots = b;
    return b;
  }

  async getMyBots(): Promise<any> {
    if (!uiStore.meInfo) return null;

    const info = uiStore.meInfo;
    try {
      let relayB: any = await this.fetchFromRelay('bots');

      relayB = await relayB.json();
      const relayMyBots = relayB?.response?.bots || [];

      // merge tribe server stuff
      const tribeServerBots = await api.get(`bots/owner/${info.owner_pubkey}`);

      // merge data from tribe server, it has more than relay
      const mergedBots = relayMyBots.map((b: any) => {
        const thisBot = tribeServerBots.find((f: any) => f.uuid === b.uuid);
        return {
          ...b,
          ...thisBot
        };
      });

      this.myBots = mergedBots;

      return mergedBots;
    } catch (e) {
      console.log('Error getMyBots', e);
    }
  }

  async fetchFromRelay(path: string): Promise<any> {
    if (!uiStore.meInfo) return null;

    const info = uiStore.meInfo;
    const URL = info.url.startsWith('http') ? info.url : `https://${info.url}`;

    const r: any = await fetch(`${URL}/${path}`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'x-jwt': info.jwt,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-session-id': this.getSessionId()
      }
    });

    return r;
  }

  async sendAudioData(body: {
    audioLink: string;
    featureUUID: string;
    source: string;
    examples: string[];
  }): Promise<any> {
    try {
      const info = uiStore.meInfo;
      if (!info) return null;

      const response = await fetch(`${TribesURL}/features/brief/send`, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(body),
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      if (!response.ok) {
        console.error('Error in sendAudioData API call', response.statusText);
        return null;
      }

      return response.json();
    } catch (error) {
      console.error('Error sending audio data:', error);
      return false;
    }
  }

  async getTribesByOwner(pubkey: string): Promise<Tribe[]> {
    const ts = await api.get(`tribes_by_owner/${pubkey}?all=true`);
    this.ownerTribes = ts;
    return ts;
  }

  async getTribeByUn(un: string): Promise<Tribe> {
    const t = await api.get(`tribe_by_un/${un}`);
    // put got on top
    // if already exists, delete
    const tribesClone = [...this.tribes];
    const dupIndex = tribesClone.findIndex((f: any) => f.uuid === t.uuid);
    if (dupIndex > -1) {
      tribesClone.splice(dupIndex, 1);
    }

    this.tribes = [t, ...tribesClone];
    return t;
  }

  async getSingleTribeByUn(un: string): Promise<Tribe> {
    const t = await api.get(`tribe_by_un/${un}`);
    return t;
  }

  async getGithubIssueData(owner: string, repo: string, issue: string): Promise<any> {
    const data = await api.get(`github_issue/${owner}/${repo}/${issue}`);
    const { title, description, assignee, status } = data && data;

    // if no title, the github issue isnt real
    if (!title && !status && !description && !assignee) return null;
    return data;
  }

  async getOpenGithubIssues(): Promise<any> {
    try {
      const openIssues = await api.get(`github_issue/status/open`);
      if (openIssues) {
        uiStore.setOpenGithubIssues(openIssues);
      }
      return openIssues;
    } catch (e) {
      console.log('Error getOpenGithubIssues: ', e);
    }
  }

  isTorSave() {
    let result = false;
    if (uiStore?.meInfo?.url?.includes('.onion')) result = true;
    return result;
  }

  async makeBot(payload: any): Promise<any> {
    const [r, error] = await this.doCallToRelay('POST', `bot`, payload);
    if (error) throw error;
    if (!r) return; // tor user will return here

    const b = await r.json();

    // const mybots = await this.getMyBots();

    return b?.response;
  }

  async updateBot(payload: any): Promise<any> {
    const [r, error] = await this.doCallToRelay('PUT', `bot`, payload);
    if (error) throw error;
    if (!r) return; // tor user will return here
    return r;
  }

  async deleteBot(id: string): Promise<any> {
    try {
      const [r, error] = await this.doCallToRelay('DELETE', `bot/${id}`, null);
      if (error) throw error;
      if (!r) return; // tor user will return here
      return r;
    } catch (e) {
      console.log('Error deleteBot: ', e);
    }
  }

  async awardBadge(
    userPubkey: string,
    badgeName: string,
    badgeIcon: string,
    memo: string,
    amount?: number
  ): Promise<any> {
    const URL = 'https://liquid.sphinx.chat';
    let error;

    const info = uiStore.meInfo as any;
    if (!info) {
      error = new Error('Youre not logged in');
      return [null, error];
    }

    const headers = {
      'x-jwt': info.jwt,
      'Content-Type': 'application/json',
      'x-session-id': this.getSessionId()
    };

    try {
      // 1. get user liquid address
      const userLiquidAddress = await api.get(`liquidAddressByPubkey/${userPubkey}`, {
        signal: AbortSignal.timeout(2000)
      });

      if (!userLiquidAddress) {
        throw new Error('No Liquid Address tied to user account');
      }

      // 2. get password for login, login to "token" aliased as "tt"
      const res0 = await fetch(`${URL}/login`, {
        method: 'POST',
        signal: AbortSignal.timeout(2000),
        body: JSON.stringify({
          pwd: 'password i got from user'
        }),
        headers
      });

      const j = await res0.json();
      const tt = j.token || this.lnToken || '';

      // 3. first create the badge
      const res1 = await fetch(`${URL}/issue?token=${tt}`, {
        method: 'POST',
        signal: AbortSignal.timeout(2000),
        body: JSON.stringify({
          name: badgeName,
          icon: badgeIcon,
          amount: amount || 1
        }),
        headers
      });

      const createdBadge = await res1.json();

      // 4. then transfer it
      const res2 = await fetch(`${URL}/transfer?token=${tt}`, {
        method: 'POST',
        signal: AbortSignal.timeout(2000),
        body: JSON.stringify({
          asset: createdBadge.id,
          to: userLiquidAddress,
          amount: amount || 1,
          memo: memo || '1'
        }),
        headers
      });

      const transferredBadge = await res2.json();

      return transferredBadge;
    } catch (e) {
      console.log('Error awardBadge: ', e);
    }
  }

  async getBadgeList(): Promise<any> {
    try {
      const URL = 'https://liquid.sphinx.chat';

      const l = await fetch(`${URL}/list?limit=100000`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000)
      });

      const badgelist = await l.json();

      uiStore.setBadgeList(badgelist);
      return badgelist;
    } catch (e) {
      console.log('Error getBadgeList: ', e);
    }
  }

  async getBalances(pubkey: any): Promise<any> {
    try {
      const URL = 'https://liquid.sphinx.chat';

      const b = await fetch(`${URL}/balances?pubkey=${pubkey}&limit=100000`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000)
      });

      const balances = await b.json();

      return balances;
    } catch (e) {
      console.log('Error getBalances: ', e);
    }
  }

  async postToCache(payload: any): Promise<void> {
    await api.post('save', payload, {
      'Content-Type': 'application/json',
      'x-session-id': this.getSessionId()
    });
    return;
  }

  async getTorSaveURL(method: string, path: string, body: any): Promise<string> {
    const key = randomString(15);
    const gotHost = getHostIncludingDockerHosts();

    // make price to meet an integer
    if (body.price_to_meet) body.price_to_meet = parseInt(body.price_to_meet);

    const data = JSON.stringify({
      host: gotHost,
      ...body
    });

    let torSaveURL = '';

    try {
      await this.postToCache({
        key,
        body: data,
        path,
        method
      });
      torSaveURL = makeTorSaveURL(gotHost, key);
    } catch (e) {
      console.log('Error postToCache getTorSaveURL: ', e);
    }

    return torSaveURL;
  }

  async getPeopleByNameAliasPubkey(alias: string): Promise<Person[]> {
    const smallQueryLimit = 10;
    const query = makeQueryParams(smallQueryLimit, {
      search: alias.toLowerCase(),
      sortBy: 'owner_alias'
    });
    const ps = await api.get(`people/search?${query}`);
    return ps;
  }

  getUserAvatarPlaceholder(ownerId: string) {
    return getUserAvatarPlaceholder(ownerId);
  }

  @persist('list')
  _people: Person[] = [];

  get people() {
    return this._people.map((person: Person) => ({
      ...person,
      img: person.img || this.getUserAvatarPlaceholder(person.owner_pubkey)
    }));
  }

  set people(people: Person[]) {
    this._people = uniqBy(people, 'uuid');
  }

  setPeople(p: Person[]) {
    if (!Array.isArray(p)) {
      throw new TypeError('Input must be an array of Person objects.');
    }

    for (const person of p) {
      if (typeof person !== 'object' || person === null || !('id' in person)) {
        throw new TypeError('Each item in the array must be a valid Person object.');
      }
    }
    this._people = p;
  }

  async getPeople(queryParams?: any): Promise<Person[]> {
    const params = { ...queryParams, search: uiStore.searchText };
    const ps = await this.fetchPeople(uiStore.searchText, queryParams);

    if (uiStore.meInfo) {
      const index = ps.findIndex((f: any) => f.id === uiStore.meInfo?.id);
      if (index > -1) {
        // add 'hide' property to me in people list
        ps[index].hide = true;
      }
    }

    // for search always reset page
    if (params && params.resetPage) {
      this.people = ps;
      uiStore.setPeoplePageNumber(1);
    } else {
      // all other cases, merge
      this.people = this.doPageListMerger(
        this.people,
        ps,
        (n: any) => uiStore.setPeoplePageNumber(n),
        params
      );
    }

    return ps;
  }

  @memo({
    resolver: (...args: any[]) => JSON.stringify({ args }),
    cache: new Map()
  })
  private async fetchPeople(search: string, queryParams?: any): Promise<Person[]> {
    const params = { ...queryParams, search };
    const query = makeQueryParams(peopleQueryLimit, {
      ...params,
      sortBy: 'last_login'
    });
    const ps = await api.get(`people?${query}`);
    return ps;
  }

  decodeListJSON(li: any): Promise<any[]> {
    if (li?.length) {
      li.forEach((o: any, i: any) => {
        li[i].body = JSON.parse(o.body);
        li[i].person = JSON.parse(o.person);
      });
    }
    return li;
  }

  @persist('list')
  peoplePosts: PersonPost[] = [];

  async getPeoplePosts(queryParams?: any): Promise<PersonPost[]> {
    queryParams = { ...queryParams, search: uiStore.searchText };

    const query = makeQueryParams(queryLimit, {
      ...queryParams,
      sortBy: 'created'
    });
    try {
      let ps = await this.fetchPeoplePosts(`people/posts?${query}`);
      ps = this.decodeListJSON(ps);

      // for search always reset page
      if (queryParams && queryParams.resetPage) {
        this.peoplePosts = ps;
        uiStore.setPeoplePostsPageNumber(1);
      } else {
        // all other cases, merge
        this.peoplePosts = this.doPageListMerger(
          this.peoplePosts,
          ps,
          (n: any) => uiStore.setPeoplePostsPageNumber(n),
          queryParams
        );
      }
      return ps;
    } catch (e) {
      console.log('fetch failed getPeoplePosts: ', e);
      return [];
    }
  }

  @memo({
    resolver: (...args: any[]) => JSON.stringify({ args }),
    cache: new Map()
  })
  private async fetchPeoplePosts(query: string) {
    return await api.get(query);
  }

  @persist('list')
  peopleBounties: PersonBounty[] = [];
  @action setPeopleBounties(bounties: PersonBounty[]) {
    this.peopleBounties = bounties;
  }

  @persist('list')
  phaseBounties: PersonBounty[] = [];
  @action setPhaseBounties(bounties: PersonBounty[]) {
    this.phaseBounties = bounties;
  }

  @persist('object')
  bountiesStatus: BountyStatus = defaultBountyStatus;
  @action setBountiesStatus(status: BountyStatus) {
    this.bountiesStatus = status;
  }

  @persist('object')
  workspaceBountiesStatus: BountyStatus = defaultWorkspaceBountyStatus;
  @action setWorkspaceBountiesStatus(status: BountyStatus) {
    this.workspaceBountiesStatus = status;
  }

  @persist('object')
  bountyLanguages = '';
  @action setBountyLanguages(languages: string) {
    this.bountyLanguages = languages;
  }

  getWantedsPrevParams?: QueryParams = {};
  async getPeopleBounties(params: any = {}): Promise<PersonBounty[]> {
    let queryParams: QueryParams = {
      limit: queryLimit,
      sortBy: 'created',
      search: uiStore.searchText ?? '',
      page: 1,
      resetPage: false,
      ...params
    };

    if (params) {
      this.getWantedsPrevParams = queryParams;
    }

    let newParams = {};
    if (params?.Pending === 'true' || params?.Pending === true) {
      if (params?.Paid === 'false' || params?.Paid === false) {
        newParams = {
          page: 1,
          resetPage: true,
          Open: false,
          Assigned: false,
          Paid: false,
          Completed: true,
          Pending: false,
          Failed: false,
          languageString: '',
          direction: 'desc',
          search: uiStore.searchText ?? ''
        };
      }
    }

    queryParams = {
      ...((params.Pending === 'true' || params.Pending === true) &&
      (params.Paid === 'false' || params.Paid === false)
        ? newParams
        : params),
      search: uiStore.searchText ?? ''
    };

    const query2 = makeQueryParams(queryLimit, params ? queryParams : this.getWantedsPrevParams);

    try {
      const ps2 = await api.get(`gobounties/all?${query2}`);

      const ps3: any[] = [];

      if (ps2) {
        for (let i = 0; i < ps2.length; i++) {
          const bounty = { ...ps2[i].bounty };

          // Check if `payment_pending` should be true based on `Pending` query param
          if (params.Pending && bounty.payment_pending === true) {
            continue; // Skip this bounty if `payment_pending` is false
          }
          if (params.Completed && bounty.payment_pending === false) {
            continue;
          }

          let assignee;
          let organization;
          const owner = { ...ps2[i].owner };

          if (bounty.assignee) {
            assignee = { ...ps2[i].assignee };
          }

          if (bounty.org_uuid) {
            organization = { ...ps2[i].organization };
          }

          ps3.push({
            body: { ...bounty, assignee: assignee || '' },
            person: { ...owner, wanteds: [] },
            organization: { ...organization }
          });
        }
      }

      if (queryParams && queryParams.resetPage) {
        this.setPeopleBounties(ps3);
        uiStore.setPeopleBountiesPageNumber(1);
      } else {
        const wanteds = this.doPageListMerger(
          this.peopleBounties,
          ps3,
          (n: any) => uiStore.setPeopleBountiesPageNumber(n),
          queryParams,
          'bounties'
        );
        this.setPeopleBounties(wanteds);
      }
      return ps3;
    } catch (e) {
      console.log('fetch failed getPeopleBounties: ', e);
      return [];
    }
  }

  async getPhaseBounties(
    feature_uuid: string,
    phase_uuid: string,
    params?: QueryParams
  ): Promise<PersonBounty[] | number> {
    const queryParams: QueryParams = {
      limit: queryLimit,
      sortBy: 'created',
      search: uiStore.searchText ?? '',
      page: 1,
      resetPage: true,
      ...params
    };

    if (params) {
      // save previous params
      this.getWantedsPrevParams = queryParams;
    }

    // if we don't pass the params, we should use previous params for invalidate query
    const query2 = makeQueryParams(queryLimit, queryParams);

    try {
      if (!uiStore.meInfo) return 0;
      const info = uiStore.meInfo;

      const response = await fetch(
        `${TribesURL}/features/${feature_uuid}/phase/${phase_uuid}/bounty?${query2}`,
        {
          method: 'GET',
          mode: 'cors',
          headers: {
            'x-jwt': info.tribe_jwt,
            'Content-Type': 'application/json',
            'x-session-id': this.getSessionId()
          }
        }
      );

      if (!response.ok) {
        console.log('fetch failed getPhaseBounties: ', response.statusText);
        return [];
      }

      const ps2 = await response.json();
      const ps3: any[] = [];

      if (ps2) {
        for (let i = 0; i < ps2.length; i++) {
          const bounty = { ...ps2[i].bounty };
          let assignee;
          let organization;
          const owner = { ...ps2[i].owner };

          if (bounty.assignee) {
            assignee = { ...ps2[i].assignee };
          }

          if (bounty.org_uuid) {
            organization = { ...ps2[i].organization };
          }

          ps3.push({
            body: { ...bounty, assignee: assignee || '' },
            person: { ...owner, wanteds: [] },
            organization: { ...organization }
          });
        }
      }

      // for search always reset page
      if (queryParams && queryParams.resetPage) {
        this.setPhaseBounties(ps3);
        uiStore.setPeopleBountiesPageNumber(1);
      } else {
        // all other cases, merge
        const wanteds = this.doPageListMerger(
          this.peopleBounties,
          ps3,
          (n: any) => uiStore.setPeopleBountiesPageNumber(n),
          queryParams,
          'bounties'
        );
        this.setPhaseBounties(wanteds);
      }

      return ps3;
    } catch (e) {
      console.log('fetch failed getPhaseBounties: ', e);
      return [];
    }
  }

  async getTotalPhaseBountyCount(
    feature_uuid: string,
    phase_uuid: string,
    open: boolean,
    assigned: boolean,
    paid: boolean
  ): Promise<number> {
    try {
      if (!uiStore.meInfo) return 0;
      const info = uiStore.meInfo;

      const response = await fetch(
        `${TribesURL}/features/${feature_uuid}/phase/${phase_uuid}/bounty/count?Open=${open}&Assigned=${assigned}&Paid=${paid}`,
        {
          method: 'GET',
          mode: 'cors',
          headers: {
            'x-jwt': info.tribe_jwt,
            'Content-Type': 'application/json',
            'x-session-id': this.getSessionId()
          }
        }
      );

      if (!response.ok) {
        console.log('fetch failed getTotalPhaseBountyCount: ', response.statusText);
        return 0;
      }

      const count = await response.json();

      return count;
    } catch (e) {
      console.log('fetch failed getTotalPhaseBountyCount: ', e);
      return 0;
    }
  }

  personAssignedBounties: PersonBounty[] = [];

  @action setPersonBounties(bounties: PersonBounty[]) {
    this.personAssignedBounties = bounties;
  }

  async getPersonAssignedBounties(queryParams?: any, uuid?: string): Promise<PersonBounty[]> {
    queryParams = { ...queryParams, ...(uiStore.searchText ? { search: uiStore.searchText } : {}) };

    const query = makeQueryParams(paginationQueryLimit, {
      sortBy: 'created',
      ...queryParams,
      direction: 'DESC'
    });

    try {
      const ps2 = await api.get(`people/wanteds/assigned/${uuid}?${query}`);
      const ps3: any[] = [];

      if (ps2 && ps2.length) {
        for (let i = 0; i < ps2.length; i++) {
          const bounty = { ...ps2[i].bounty };
          let assignee;
          let organization;
          const owner = { ...ps2[i].owner };

          if (bounty.assignee) {
            assignee = { ...ps2[i].assignee };
          }

          if (bounty.org_uuid) {
            organization = { ...ps2[i].organization };
          }

          ps3.push({
            body: { ...bounty, assignee: assignee || '' },
            person: { ...owner, wanteds: [] },
            organization: { ...organization }
          });
        }
      }

      return ps3;
    } catch (e) {
      console.log('fetch failed getPersonAssignedBounties: ', e);
      return [];
    }
  }

  createdBounties: PersonBounty[] = [];
  @action setCreatedBounties(bounties: PersonBounty[]) {
    this.createdBounties = bounties;
  }

  async getPersonCreatedBounties(queryParams?: any, uuid?: string): Promise<PersonBounty[]> {
    queryParams = { ...queryParams, ...(uiStore.searchText ? { search: uiStore.searchText } : {}) };

    const query = makeQueryParams(paginationQueryLimit, {
      ...queryParams,
      sortBy: 'created',
      direction: 'DESC'
    });

    try {
      const ps2 = await api.get(`people/wanteds/created/${uuid}?${query}`);
      const ps3: any[] = [];

      if (ps2 && ps2.length) {
        for (let i = 0; i < ps2.length; i++) {
          const bounty = { ...ps2[i].bounty };

          let shouldInclude = false;

          // Determine inclusion based on `Paid` and other criteria
          if (queryParams.Paid) {
            // If `Paid` is true in queryParams, include only paid bounties
            if (bounty.paid) {
              shouldInclude = true;
            }
          } else {
            // If `Paid` is not true, filter unpaid bounties
            if (!bounty.paid && !bounty.completed) {
              shouldInclude = true;
            } else if (queryParams.Pending && !bounty.completed && !bounty.paid) {
              shouldInclude = true;
            }
          }

          if (shouldInclude) {
            let assignee;
            let organization;
            const owner = { ...ps2[i].owner };

            if (bounty.assignee) {
              assignee = { ...ps2[i].assignee };
            }

            if (bounty.org_uuid) {
              organization = { ...ps2[i].organization };
            }

            ps3.push({
              body: { ...bounty, assignee: assignee || '' },
              person: { ...owner, wanteds: [] },
              organization: { ...organization }
            });
          }
        }
      }

      this.setCreatedBounties(ps3);
      console.log(ps3, 'ps3');
      return ps3;
    } catch (e) {
      console.log('fetch failed getPersonCreatedBounties: ', e);
      return [];
    }
  }

  async getBountyById(id: number, unlockCode?: string | null): Promise<PersonBounty[]> {
    try {
      let endpoint = `gobounties/id/${id}`;
      if (unlockCode) {
        endpoint += `?unlock=${unlockCode}`;
      }

      const ps2 = await api.get(endpoint);
      const ps3: any[] = [];

      if (ps2 && ps2.length) {
        for (let i = 0; i < ps2.length; i++) {
          const bounty = { ...ps2[i].bounty };
          let assignee;
          let organization;
          const owner = { ...ps2[i].owner };

          if (bounty.assignee) {
            assignee = { ...ps2[i].assignee };
          }

          if (bounty.org_uuid) {
            organization = { ...ps2[i].organization };
          }

          ps3.push({
            body: { ...bounty, assignee: assignee || '' },
            person: { ...owner, wanteds: [] },
            organization: { ...organization }
          });
        }
      }

      return ps3;
    } catch (e) {
      console.log('fetch failed getBountyById: ', e);
      return [];
    }
  }

  async getBountyIndexById(id: number): Promise<number> {
    try {
      const req = await api.get(`gobounties/index/${id}`);
      return req;
    } catch (e) {
      console.log('fetch failed getBountyIndexById: ', e);
      return 0;
    }
  }

  async getBountyByCreated(created: number, unlockCode?: string | null): Promise<PersonBounty[]> {
    try {
      let endpoint = `gobounties/created/${created}`;
      if (unlockCode) {
        endpoint += `?unlock=${unlockCode}`;
      }

      const ps2 = await api.get(endpoint);
      const ps3: any[] = [];

      if (ps2 && ps2.length) {
        for (let i = 0; i < ps2.length; i++) {
          const bounty = { ...ps2[i].bounty };
          let assignee;
          let organization;
          const owner = { ...ps2[i].owner };

          if (bounty.assignee) {
            assignee = { ...ps2[i].assignee };
          }

          if (bounty.org_uuid) {
            organization = { ...ps2[i].organization };
          }

          ps3.push({
            body: { ...bounty, assignee: assignee || '' },
            person: { ...owner, wanteds: [] },
            organization: { ...organization }
          });
        }
      }

      return ps3;
    } catch (e) {
      console.log('fetch failed getBountyById: ', e);
      return [];
    }
  }

  getWantedsSpecWorkspacePrevParams?: QueryParams = {};
  async getSpecificWorkspaceBounties(uuid: string, params: any = {}): Promise<PersonBounty[]> {
    let queryParams: QueryParams = {
      limit: queryLimit,
      sortBy: 'created',
      search: uiStore.searchText ?? '',
      page: 1,
      resetPage: false,
      ...params
    };

    if (params) {
      this.getWantedsSpecWorkspacePrevParams = queryParams;
    }

    let newParams = {};
    if (params?.Pending === 'true' || params?.Pending === true) {
      if (params?.Paid === 'false' || params?.Paid === false) {
        newParams = {
          page: 1,
          resetPage: true,
          Open: false,
          Assigned: false,
          Paid: false,
          Completed: true,
          Pending: false,
          Failed: false,
          languageString: '',
          direction: 'desc'
        };
      }
    }

    queryParams =
      (params.Pending === 'true' || params.Pending === true) &&
      (params.Paid === 'false' || params.Paid === false)
        ? newParams
        : params;

    const query2 = makeQueryParams(
      queryLimit,
      params ? queryParams : this.getWantedsSpecWorkspacePrevParams
    );

    try {
      const ps2 = await api.get(`workspaces/bounties/${uuid}?${query2}`);
      const ps3: any[] = [];

      if (ps2) {
        for (let i = 0; i < ps2.length; i++) {
          const bounty = { ...ps2[i].bounty };

          // Check if `payment_pending` should be true based on `Pending` query param
          if (params.Pending && bounty.payment_pending === true) {
            continue; // Skip this bounty if `payment_pending` is false
          }
          if (params.Completed && bounty.payment_pending === false) {
            continue;
          }

          let assignee;
          let organization;
          const owner = { ...ps2[i].owner };

          if (bounty.assignee) {
            assignee = { ...ps2[i].assignee };
          }

          if (bounty.org_uuid) {
            organization = { ...ps2[i].organization };
          }

          ps3.push({
            body: { ...bounty, assignee: assignee || '' },
            person: { ...owner, wanteds: [] },
            organization: { ...organization }
          });
        }
      }

      if (queryParams && queryParams.resetPage) {
        this.setPeopleBounties(ps3);
        uiStore.setPeopleBountiesPageNumber(1);
      } else {
        const wanteds = this.doPageListMerger(
          this.peopleBounties,
          ps3,
          (n: any) => uiStore.setPeopleBountiesPageNumber(n),
          queryParams,
          'bounties'
        );
        this.setPeopleBounties(wanteds);
      }

      return ps3;
    } catch (e) {
      console.log('fetch failed getSpecificWorkspaceBounties: ', e);
      return [];
    }
  }

  async getWorkspaceBounties(uuid: string, queryParams?: any): Promise<PersonBounty[]> {
    queryParams = { ...queryParams, search: uiStore.searchText };
    try {
      const ps2 = await api.get(`workspaces/bounties/${uuid}`);
      const ps3: any[] = [];

      if (ps2 && ps2.length) {
        for (let i = 0; i < ps2.length; i++) {
          const bounty = { ...ps2[i].bounty };
          let assignee;
          let organization;
          const owner = { ...ps2[i].owner };

          if (bounty.assignee) {
            assignee = { ...ps2[i].assignee };
          }

          if (bounty.org_uuid) {
            organization = { ...ps2[i].organization };
          }

          ps3.push({
            body: { ...bounty, assignee: assignee || '' },
            person: { ...owner, wanteds: [] },
            organization: { ...organization }
          });
        }
      }

      // for search always reset page
      if (queryParams && queryParams.resetPage) {
        this.setPeopleBounties(ps3);
        uiStore.setPeopleBountiesPageNumber(1);
      } else {
        // all other cases, merge
        const wanteds = this.doPageListMerger(
          this.peopleBounties,
          ps3,
          (n: any) => uiStore.setPeopleBountiesPageNumber(n),
          queryParams,
          'bounties'
        );

        this.setPeopleBounties(wanteds);
      }
      return ps3;
    } catch (e) {
      console.log('fetch failed getWorkspaceBounties: ', e);
      return [];
    }
  }

  getWantedsTotalWorkspacePrevParams?: QueryParams = {};
  async getTotalWorkspaceBounties(uuid: string, params?: any): Promise<number> {
    const queryParams: QueryParams = {
      limit: queryLimit,
      sortBy: 'created',
      search: '',
      page: 1,
      resetPage: false,
      ...params
    };

    // if we don't pass the params, we should use previous params for invalidate query
    const query2 = makeQueryParams(orgQuerLimit, params ? queryParams : undefined);
    try {
      const ps2 = await api.get(`workspaces/bounties/${uuid}?${query2}`);
      const ps3: any[] = [];

      if (ps2 && ps2.length) {
        for (let i = 0; i < ps2.length; i++) {
          const bounty = { ...ps2[i].bounty };
          let assignee;
          let organization;
          const owner = { ...ps2[i].owner };

          if (bounty.assignee) {
            assignee = { ...ps2[i].assignee };
          }

          if (bounty.org_uuid) {
            organization = { ...ps2[i].organization };
          }
          if (bounty.org_uuid === uuid) {
            ps3.push({
              body: { ...bounty, assignee: assignee || '' },
              person: { ...owner, wanteds: [] },
              organization: { ...organization }
            });
          }
        }
      }

      // for search always reset page
      if (queryParams && queryParams.resetPage) {
        this.setPeopleBounties(ps3);
        uiStore.setPeopleBountiesPageNumber(1);
      } else {
        // all other cases, merge
        const wanteds = this.doPageListMerger(
          this.peopleBounties,
          ps3,
          (n: any) => uiStore.setPeopleBountiesPageNumber(n),
          queryParams,
          'bounties'
        );

        this.setPeopleBounties(wanteds);
      }
      return ps3.length;
    } catch (e) {
      console.log('fetch failed getWorkspaceBounties: ', e);
      return 0;
    }
  }

  async getBountyCount(personKey: string, tabType: string): Promise<number> {
    try {
      const count = await api.get(`gobounties/count/${personKey}/${tabType}`);
      return count;
    } catch (e) {
      console.log('fetch failed getBountyCount: ', e);
      return 0;
    }
  }

  async getTotalBountyCount(
    open: boolean,
    assigned: boolean,
    paid: boolean,
    pending: boolean,
    failed: boolean
  ): Promise<number> {
    try {
      const count = await api.get(
        `gobounties/count?Open=${open}&Assigned=${assigned}&Paid=${paid}&Pending=${pending}&Failed=${failed}`
      );
      return await count;
    } catch (e) {
      console.log('fetch failed getTotalBountyCount: ', e);
      return 0;
    }
  }

  @persist('list')
  peopleOffers: PersonOffer[] = [];

  async getPeopleOffers(queryParams?: any): Promise<PersonOffer[]> {
    queryParams = { ...queryParams, search: uiStore.searchText };

    const query = makeQueryParams(queryLimit, {
      ...queryParams,
      sortBy: 'created'
    });
    try {
      let ps = await api.get(`people/offers?${query}`);
      ps = this.decodeListJSON(ps);

      // for search always reset page
      if (queryParams && queryParams.resetPage) {
        this.peopleOffers = ps;
        uiStore.setPeopleOffersPageNumber(1);
      } else {
        // all other cases, merge
        this.peopleOffers = this.doPageListMerger(
          this.peopleOffers,
          ps,
          (n: any) => uiStore.setPeopleOffersPageNumber(n),
          queryParams
        );
      }

      return ps;
    } catch (e) {
      console.log('fetch failed getPeopleOffers: ', e);
      return [];
    }
  }

  doPageListMerger(
    currentList: any[],
    newList: any[],
    setPage: (any) => void,
    queryParams?: any,
    type?: string
  ) {
    if (!newList || !newList.length) {
      if (queryParams.search) {
        // if search and no results, return nothing
        return [];
      } else {
        return currentList;
      }
    }

    if (queryParams && queryParams.resetPage) {
      setPage(1);
      return newList;
    }

    if (queryParams?.page) setPage(queryParams.page);
    const l = [...currentList, ...newList];

    const set = new Set();
    if (type === 'bounties') {
      const uniqueArray = l.filter((item: any) => {
        if (item.body && item.body.id && !set.has(item.body.id)) {
          set.add(item.body.id);
          return true;
        }
        return false;
      }, set);
      return uniqueArray;
    }

    return l;
  }

  @persist('list')
  _activePerson: Person[] = [];

  get activePerson() {
    return this._activePerson.map((person: Person) => ({
      ...person,
      img: person.img || this.getUserAvatarPlaceholder(person.owner_pubkey)
    }));
  }

  set activePerson(p: Person[]) {
    this._activePerson = p;
  }

  setActivePerson(p: Person) {
    this._activePerson = [p];
  }

  @memo()
  async getPersonByPubkey(pubkey: string): Promise<Person> {
    const p = await api.get(`person/${pubkey}`);
    return p;
  }

  @memo()
  async getPersonByUuid(uuid: string): Promise<Person> {
    const p = await api.get(`person/uuid/${uuid}`);
    return p;
  }

  async getPersonById(id: number): Promise<Person> {
    const p = await api.get(`person/id/${id}`);
    this.setActivePerson(p);
    return p;
  }

  async getPersonByGithubName(github: string): Promise<Person> {
    const p = await api.get(`person/githubname/${github}`);
    return p;
  }

  // this method merges the relay self data with the db self data, they each hold different data

  async getSelf(me: any) {
    const self = me || uiStore.meInfo;
    if (self) {
      const p = await api.get(`person/${self.owner_pubkey}`);

      // get request for super_admin_array.
      const getSuperAdmin = async () => {
        try {
          const response = await api.get(`admin_pubkeys`);
          const admin_keys = response?.pubkeys;
          if (admin_keys !== null) {
            return !!admin_keys.find((value: any) => value === self.owner_pubkey);
          } else {
            return false;
          }
        } catch (error) {
          return false;
        }
      };

      const isSuperAdmin = await getSuperAdmin();
      const updateSelf = { ...self, ...p, isSuperAdmin: isSuperAdmin };
      uiStore.setMeInfo(updateSelf);
    }
  }

  async claimBadgeOnLiquid(body: ClaimOnLiquid): Promise<any> {
    try {
      const [r, error] = await this.doCallToRelay('POST', 'claim_on_liquid', body);
      if (error) throw error;
      if (!r) return; // tor user will return here

      return r;
    } catch (e) {
      console.log('Error claimBadgeOnLiquid: ', e);
    }
  }

  async sendBadgeOnLiquid(body: ClaimOnLiquid): Promise<any> {
    try {
      const [r, error] = await this.doCallToRelay('POST', 'claim_on_liquid', body);
      if (error) throw error;
      if (!r) return; // tor user will return here

      return r;
    } catch (e) {
      console.log('Error sendBadgeOnLiquid: ', e);
    }
  }

  async refreshJwt(signal?: AbortSignal) {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;

      console.log('Refreshing token ====');
      const r: any = await fetch(`${TribesURL}/refresh_jwt`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        signal
      });

      const j = await r.json();

      if (this.lnToken) {
        this.lnToken = j.jwt;
        return j;
      }

      return j;
    } catch (e) {
      console.log('Error refreshJwt: ', e);
      // could not refresh jwt, logout!
      return null;
    }
  }

  async getUsdToSatsExchangeRate() {
    try {
      // get rate for 1 USD
      const res: any = await fetch('https://blockchain.info/tobtc?currency=USD&value=1', {
        method: 'GET'
      });
      const j = await res.json();
      // 1 bitcoin is 1 million satoshis
      const satoshisInABitcoin = 0.00000001;
      const exchangeRate = j / satoshisInABitcoin;

      uiStore.setUsdToSatsExchangeRate(exchangeRate);

      return exchangeRate;
    } catch (e) {
      console.log('Error getUsdToSatsExchangeRate: ', e);
      // could not refresh jwt, logout!
      return null;
    }
  }

  async deleteProfile() {
    try {
      const info = uiStore.meInfo;
      let request = 'profile';
      if (this.lnToken) request = `person/${info?.id}`;

      const [r, error] = await this.doCallToRelay('DELETE', request, info);
      if (error) throw error;
      if (!r) return; // tor user will return here

      uiStore.setMeInfo(null);
      uiStore.setSelectingPerson(0);
      uiStore.setSelectedPerson(0);

      const j = await r.json();
      return j;
    } catch (e) {
      console.log('Error deleteProfile: ', e);
      // could not delete profile!
      return null;
    }
  }

  async saveProfile(body: any) {
    if (!uiStore.meInfo) return null;
    const info = uiStore.meInfo;
    if (!body) return; // avoid saving bad state

    if (body.price_to_meet) body.price_to_meet = parseInt(body.price_to_meet); // must be an int
    try {
      const r = await this.saveBountyPerson(body);
      if (!r) {
        uiStore.setToasts([
          {
            id: '1',
            title: 'Profile saving failed'
          }
        ]);
        return;
      }
      // first time profile makers will need this on first login
      if (r.status === 200) {
        const p = await r.json();
        const updateSelf = { ...info, ...p };
        uiStore.setMeInfo(updateSelf);
        this.getSelf(updateSelf);

        uiStore.setToasts([
          {
            id: '2',
            title: 'Saved.'
          }
        ]);
      }
    } catch (e) {
      uiStore.setToasts([
        {
          id: '1',
          title: 'Failed to save profile'
        }
      ]);
      console.log('Error saveProfile: ', e);
    }
  }

  async updateProfile(body: any) {
    if (!uiStore.meInfo) return null;
    const info = uiStore.meInfo;
    if (!body) return; // avoid saving bad state

    if (body.price_to_meet) body.price_to_meet = parseInt(body.price_to_meet); // must be an int
    try {
      const r = await this.updateBountyPerson(body);
      if (!r) {
        uiStore.setToasts([
          {
            id: '1',
            title: 'Profile update failed'
          }
        ]);
        return;
      }
      // first time profile makers will need this on first login
      if (r.status === 200) {
        const p = await r.json();
        const updateSelf = { ...info, ...p };
        uiStore.setMeInfo(updateSelf);
        this.getSelf(updateSelf);

        uiStore.setToasts([
          {
            id: '2',
            title: 'Saved.'
          }
        ]);
      }
    } catch (e) {
      uiStore.setToasts([
        {
          id: '1',
          title: 'Failed to update profile'
        }
      ]);
      console.log('Error updateProfile: ', e);
    }
  }

  async saveBountyPerson(body: any): Promise<Response | undefined> {
    if (!uiStore.meInfo) return undefined;
    const info = uiStore.meInfo;
    if (!body) return; // avoid saving bad state

    const r = await fetch(`${TribesURL}/person`, {
      method: 'POST',
      body: JSON.stringify({
        ...body
      }),
      mode: 'cors',
      headers: {
        'x-jwt': info.tribe_jwt,
        'Content-Type': 'application/json',
        'x-session-id': this.getSessionId()
      }
    });

    return r;
  }

  async updateBountyPerson(body: any): Promise<Response | undefined> {
    if (!uiStore.meInfo) return undefined;
    const info = uiStore.meInfo;
    if (!body) return; // avoid saving bad state

    const r = await fetch(`${TribesURL}/person`, {
      method: 'PUT',
      body: JSON.stringify({
        ...body
      }),
      mode: 'cors',
      headers: {
        'x-jwt': info.tribe_jwt,
        'Content-Type': 'application/json',
        'x-session-id': this.getSessionId()
      }
    });

    return r;
  }

  async saveBounty(body: any): Promise<void> {
    const info = uiStore.meInfo as any;
    if (!info && !body) {
      console.log('Youre not logged in');
      return;
    }

    if (!body.coding_languages || !body.coding_languages.length) {
      body.coding_languages = [];
    } else {
      const languages: string[] = [];
      body.coding_languages.forEach((lang: any) => {
        languages.push(lang.value);
      });

      body.coding_languages = languages;
    }

    if (body.isStakable !== undefined) {
      body.is_stakable = body.isStakable;
      delete body.isStakable;
    }

    if (body.stakeMin !== undefined) {
      body.stake_min = convertLocaleToNumber(body.stakeMin);
      delete body.stakeMin;
    }

    body.max_stakers = body.max_stakers || 1;

    // eslint-disable-next-line no-useless-catch
    try {
      const request = `gobounties?token=${info?.tribe_jwt}`;
      //TODO: add some sort of authentication
      const response = await fetch(`${TribesURL}/${request}`, {
        method: 'POST',
        body: JSON.stringify({
          ...body
        }),
        mode: 'cors',
        headers: {
          'x-jwt': info?.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      if (response?.status) {
        this.getPeopleBounties({
          resetPage: true,
          ...this.bountiesStatus,
          languages: this.bountyLanguages
        });
      }
    } catch (e) {
      throw e;
    }
  }

  async deleteBounty(created: number, owner_pubkey: string): Promise<void> {
    const info = uiStore.meInfo as any;
    if (!info) {
      console.log('Youre not logged in');
      return;
    }

    try {
      const request = `gobounties/${owner_pubkey}/${created}`;
      //TODO: add some sort of authentication
      const response = await fetch(`${TribesURL}/${request}`, {
        method: 'DELETE',
        mode: 'cors',
        headers: {
          'x-jwt': info?.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });
      if (response.status) {
        await this.getPeopleBounties({
          resetPage: true,
          ...this.bountiesStatus,
          languages: this.bountyLanguages
        });
      }
      return;
    } catch (e) {
      console.log(e);
    }
  }

  // this method is used whenever changing data from the frontend,
  // forks between tor users and non-tor
  async doCallToRelay(method: string, path: string, body: any): Promise<any> {
    let error: any = null;

    const info = uiStore.meInfo as any;
    const URL = info.url.startsWith('http') ? info.url : `https://${info.url}`;
    if (!info) {
      error = new Error('Youre not logged in');
      return [null, error];
    }

    if (this.lnToken) {
      const response = await fetch(`${URL}/${path}`, {
        method: method,
        body: JSON.stringify({
          ...body
        }),
        mode: 'cors',
        headers: {
          'x-jwt': info.jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return [response, error];
    } else {
      // fork between tor users non authentiacted and not
      if (this.isTorSave() || info.url.startsWith('http://')) {
        this.submitFormViaApp(method, path, body);
        return [null, null];
      }

      const response = await fetch(`${URL}/${path}`, {
        method: method,
        body: JSON.stringify({
          // use docker host (tribes.sphinx), because relay will post to it
          host: getHostIncludingDockerHosts(),
          ...body
        }),
        headers: {
          'x-jwt': info.jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return [response, error];
    }
  }

  async submitFormViaApp(method: string, path: string, body: any) {
    try {
      const torSaveURL = await this.getTorSaveURL(method, path, body);
      uiStore.setTorFormBodyQR(torSaveURL);
    } catch (e) {
      console.log('Error submitFormViaApp: ', e);
    }
  }

  async setExtrasPropertyAndSave(
    extrasName: string,
    propertyName: string,
    created: number,
    newPropertyValue: any
  ): Promise<any> {
    if (uiStore.meInfo) {
      const clonedMeInfo = { ...uiStore.meInfo };
      const clonedExtras = clonedMeInfo?.extras;
      const clonedEx: any = clonedExtras && clonedExtras[extrasName];
      const targetIndex = clonedEx?.findIndex((f: any) => f.created === created);

      if (clonedEx && (targetIndex || targetIndex === 0) && targetIndex > -1) {
        try {
          clonedEx[targetIndex][propertyName] = newPropertyValue;
          clonedMeInfo.extras[extrasName] = clonedEx;
          await this.saveProfile(clonedMeInfo);
          return [clonedEx, targetIndex];
        } catch (e) {
          console.log('Error setExtrasPropertyAndSave', e);
        }
      }

      return [null, null];
    }
  }

  // function to update many value in wanted array of object
  async setExtrasMultipleProperty(
    dataObject: object,
    extrasName: string,
    created: number
  ): Promise<any> {
    if (uiStore.meInfo) {
      const clonedMeInfo = { ...uiStore.meInfo };
      const clonedExtras = clonedMeInfo?.extras;
      const clonedEx: any = clonedExtras && clonedExtras[extrasName];
      const targetIndex = clonedEx?.findIndex((f: any) => f.created === created);

      if (clonedEx && (targetIndex || targetIndex === 0) && targetIndex > -1) {
        try {
          clonedEx[targetIndex] = { ...clonedEx?.[targetIndex], ...dataObject };
          clonedMeInfo.extras[extrasName] = clonedEx;
          await this.saveProfile(clonedMeInfo);
          return [clonedEx, targetIndex];
        } catch (e) {
          console.log('Error setExtrasMultipleProperty', e);
        }
      }

      return [null, null];
    }
  }

  async deleteFavorite() {
    const body: any = {};

    if (!body) return; // avoid saving bad state

    const info = uiStore.meInfo as any;
    if (!info) return;
    try {
      const URL = info.url.startsWith('http') ? info.url : `https://${info.url}`;
      const r = await fetch(`${URL}/profile`, {
        method: 'POST',
        body: JSON.stringify({
          // use docker host (tribes.sphinx), because relay will post to it
          host: getHostIncludingDockerHosts(),
          ...body,
          price_to_meet: parseInt(body.price_to_meet)
        }),
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      if (!r.ok) {
        return alert('Failed to save data');
      }

      uiStore.setToasts([
        {
          id: '1',
          title: 'Added to favorites.'
        }
      ]);
    } catch (e) {
      console.log('Error deleteFavorite', e);
    }
  }

  async getBountyHeaderData() {
    try {
      const data = await api.get('people/wanteds/header');
      return data;
    } catch (e) {
      console.log('Error getBountyHeaderData', e);
      return '';
    }
  }

  @persist
  activeWorkspace = '';
  setActiveWorkspace(org: string) {
    this.activeWorkspace = org;
  }

  async getWorkspaceNextBountyByCreated(org_uuid: string, created: number): Promise<number> {
    try {
      const workspaceBountiesStatus =
        JSON.parse(localStorage.getItem('workspaceBountyStatus') || `{}`) || defaultBountyStatus;
      const params = { languages: this.bountyLanguages, ...workspaceBountiesStatus };

      const queryParams: QueryParams = {
        limit: queryLimit,
        sortBy: 'created',
        search: uiStore.searchText ?? '',
        page: 1,
        resetPage: false,
        ...params
      };

      // if we don't pass the params, we should use previous params for invalidate query
      const query = makeQueryParams(queryLimit, queryParams);

      const bounty = await api.get(`gobounties/workspace/next/${org_uuid}/${created}?${query}`);
      return bounty;
    } catch (e) {
      console.log('fetch failed getWorkspaceNextBountyById: ', e);
      return 0;
    }
  }

  async getWorkspacePreviousBountyByCreated(org_uuid: string, created: number): Promise<number> {
    try {
      const workspaceBountiesStatus =
        JSON.parse(localStorage.getItem('workspaceBountyStatus') || `{}`) || defaultBountyStatus;
      const params = { languages: this.bountyLanguages, ...workspaceBountiesStatus };

      const queryParams: QueryParams = {
        limit: queryLimit,
        sortBy: 'created',
        search: uiStore.searchText ?? '',
        page: 1,
        resetPage: false,
        ...params
      };

      // if we don't pass the params, we should use previous params for invalidate query
      const query = makeQueryParams(queryLimit, queryParams);

      const bounty = await api.get(`gobounties/workspace/previous/${org_uuid}/${created}?${query}`);
      return bounty;
    } catch (e) {
      console.log('fetch failed getWorkspacePreviousBountyById: ', e);
      return 0;
    }
  }

  async getNextBountyByCreated(created: string): Promise<number> {
    try {
      const params = { languages: this.bountyLanguages, ...this.bountiesStatus };

      const queryParams: QueryParams = {
        limit: queryLimit,
        sortBy: 'created',
        search: uiStore.searchText ?? '',
        page: 1,
        resetPage: false,
        ...params
      };

      // if we don't pass the params, we should use previous params for invalidate query
      const query = makeQueryParams(queryLimit, queryParams);

      const bounty = await api.get(`gobounties/next/${created}?${query}`);
      return bounty;
    } catch (e) {
      console.log('fetch failed getBountyCount: ', e);
      return 0;
    }
  }

  async getPreviousBountyByCreated(created: string): Promise<number> {
    try {
      const params = { languages: this.bountyLanguages, ...this.bountiesStatus };

      const queryParams: QueryParams = {
        limit: queryLimit,
        sortBy: 'created',
        search: uiStore.searchText ?? '',
        page: 1,
        resetPage: false,
        ...params
      };

      // if we don't pass the params, we should use previous params for invalidate query
      const query = makeQueryParams(queryLimit, queryParams);
      const bounty = await api.get(`gobounties/previous/${created}?${query}`);
      return bounty;
    } catch (e) {
      console.log('fetch failed getBountyCount: ', e);
      return 0;
    }
  }

  @observable
  lnauth: LnAuthData = { encode: '', k1: '' };

  @action setLnAuth(lnData: LnAuthData) {
    this.lnauth = lnData;
  }

  @persist('object')
  @observable
  lnToken = '';

  @action setLnToken(token: string) {
    this.lnToken = token;
  }

  @persist('object')
  @observable
  isSuperAdmin = false;

  @action setIsSuperAdmin(isAdmin: boolean) {
    this.isSuperAdmin = isAdmin;
  }

  @action async getSuperAdmin(): Promise<boolean> {
    try {
      if (!uiStore.meInfo) return false;
      const info = uiStore.meInfo;
      const r: any = await fetch(`${TribesURL}/admin/auth`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      if (r.status !== 200) {
        this.setIsSuperAdmin(false);
        return false;
      }
      this.setIsSuperAdmin(true);
      return true;
    } catch (e) {
      console.log('Error getSuperAdmin', e);
      return false;
    }
  }

  @action async getLnAuth(): Promise<LnAuthData> {
    try {
      const data = await api.get(`lnauth?socketKey=${uiStore.websocketToken}`);
      this.setLnAuth(data);
      return data;
    } catch (e) {
      console.log('Error getLnAuth', e);
      return { encode: '', k1: '' };
    }
  }

  @observable
  sessionId = '';

  @action setSessionId(id: string) {
    this.sessionId = id;
  }

  @action getSessionId() {
    return this.initializeSessionId();
  }

  initializeSessionId() {
    //let sessionId = sessionStorage.getItem('sphinx_session_id');
    const session_id = posthog.get_session_id();
    sessionStorage.setItem('sphinx_session_id', session_id);

    //if (!sessionId) {
    //  sessionId = posthog.get_session_id();
    //  sessionStorage.setItem('sphinx_session_id', sessionId);
    //}

    this.setSessionId(session_id);
    return session_id;
  }

  @persist('object')
  @observable
  keysendInvoice = '';

  @action setKeysendInvoice(invoice: string) {
    this.keysendInvoice = invoice;
  }

  @persist('object')
  @observable
  assignInvoice = '';

  @action setAssignInvoice(invoice: string) {
    this.assignInvoice = invoice;
  }

  @observable
  budgetInvoice = '';

  @action setBudgetInvoice(invoice: string) {
    this.budgetInvoice = invoice;
  }

  async getLnInvoice(body: {
    amount: number;
    memo: string;
    owner_pubkey: string;
    user_pubkey: string;
    created: string;
    type: 'KEYSEND' | 'ASSIGN';
    assigned_hours?: number;
    commitment_fee?: number;
    bounty_expires?: string;
    route_hint?: string;
  }): Promise<LnInvoice> {
    try {
      const data = await api.post(
        'invoices',
        {
          amount: body.amount.toString(),
          memo: body.memo,
          owner_pubkey: body.owner_pubkey,
          user_pubkey: body.user_pubkey,
          created: body.created,
          type: body.type,
          assigned_hours: body.assigned_hours,
          commitment_fee: body.commitment_fee,
          bounty_expires: body.bounty_expires,
          websocket_token: uiStore.meInfo?.websocketToken,
          route_hint: body.route_hint
        },
        {
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      );
      return data;
    } catch (e) {
      console.log('Error getLnInvoice', e);
      return { success: false, response: { invoice: '' } };
    }
  }

  async getBudgetInvoice(body: {
    amount: number;
    workspace_uuid: string;
    sender_pubkey: string;
    payment_type: string;
  }): Promise<LnInvoice> {
    try {
      const data = await api.post(
        'budgetinvoices',
        {
          amount: body.amount,
          workspace_uuid: body.workspace_uuid,
          sender_pubkey: body.sender_pubkey,
          payment_type: body.payment_type
        },
        {
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      );
      return data;
    } catch (e) {
      return { success: false, response: { invoice: '' } };
    }
  }

  @action async deleteBountyAssignee(body: {
    owner_pubkey: string;
    created: string;
  }): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const r: any = await fetch(`${TribesURL}/gobounties/assignee`, {
        method: 'DELETE',
        mode: 'cors',
        body: JSON.stringify({
          ...body
        }),
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r;
    } catch (e) {
      console.log('Error deleteBountyAssignee', e);
      return false;
    }
  }

  @observable
  workspaces: Workspace[] = [];

  @action setWorkspaces(workspaces: Workspace[]) {
    this.workspaces = workspaces;
  }

  @observable
  dropDownWorkspaces: Workspace[] = [];

  @action setDropdownWorkspaces(workspaces: Workspace[]) {
    this.dropDownWorkspaces = workspaces;
  }

  @action async getUserWorkspaces(id: number): Promise<Workspace[]> {
    try {
      const info = uiStore;
      if (!info.selectedPerson && !uiStore.meInfo?.id) return [];

      const r: any = await fetch(`${TribesURL}/workspaces/user/${id}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      const data = await r.json();
      this.setWorkspaces(data);
      return await data;
    } catch (e) {
      console.log('Error getUserWorkspaces', e);
      return [];
    }
  }

  @action async getUserDropdownWorkspaces(id: number): Promise<Workspace[]> {
    try {
      const info = uiStore;
      if (!info.selectedPerson && !uiStore.meInfo?.id) return [];

      const r: any = await fetch(`${TribesURL}/workspaces/user/dropdown/${id}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      const data = await r.json();
      this.setDropdownWorkspaces(data);
      return await data;
    } catch (e) {
      console.log('Error getUserDropdownWorkspaces', e);
      return [];
    }
  }

  async getUserWorkspaceByUuid(uuid: string): Promise<Workspace | undefined> {
    try {
      const r: any = await fetch(`${TribesURL}/workspaces/${uuid}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      const data = await r.json();
      return await data;
    } catch (e) {
      console.log('Error getWorkspaceByUuid', e);
      return undefined;
    }
  }

  @action async addWorkspace(body: CreateWorkspaceInput): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const r: any = await fetch(`${TribesURL}/workspaces`, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify({
          ...body
        }),
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r;
    } catch (e) {
      console.log('Error addWorkspace', e);
      return false;
    }
  }

  async uploadFile(body: FormData): Promise<null | Response> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;

      // Inspect FormData
      const entries = Array.from(body.entries());
      for (const [key, value] of entries) {
        console.log(`${key}:`, value);
        if (value instanceof File) {
          console.log(`File name: ${value.name}, Size: ${value.size}, Type: ${value.type}`);
          const reader = new FileReader();
          reader.onload = () => {
            console.log(`File content:`, reader.result);
          };
          reader.onerror = () => {
            console.log(`Error reading file:`, reader.error);
          };
          reader.readAsText(value);
        }
      }

      const r: any = await fetch(`${TribesURL}/meme_upload`, {
        method: 'POST',
        mode: 'cors',
        body,
        headers: {
          'x-jwt': info.tribe_jwt
        }
      });

      return r;
    } catch (e) {
      console.log('Error uploading file', e);
      return null;
    }
  }

  async updateWorkspace(body: Workspace): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const r: any = await fetch(`${TribesURL}/workspaces`, {
        method: 'POST',

        mode: 'cors',
        body: JSON.stringify({
          ...body
        }),
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r;
    } catch (e) {
      console.log('Error addWorkspace', e);
      return false;
    }
  }

  async getWorkspaceUsersCount(uuid: string): Promise<number> {
    try {
      const r: any = await fetch(`${TribesURL}/workspaces/users/${uuid}/count`, {
        method: 'GET',
        mode: 'cors'
      });

      return r.json();
    } catch (e) {
      console.log('Error getWorkspaceUsersCount', e);
      return 0;
    }
  }

  async getWorkspaceUsers(uuid: string): Promise<Person[]> {
    try {
      const r: any = await fetch(`${TribesURL}/workspaces/users/${uuid}`, {
        method: 'GET',
        mode: 'cors'
      });

      return r.json();
    } catch (e) {
      console.log('Error getWorkspaceUsers', e);
      return [];
    }
  }

  async getWorkspaceUser(uuid: string): Promise<WorkspaceUser | undefined> {
    try {
      if (!uiStore.meInfo) return undefined;
      const info = uiStore.meInfo;
      const r: any = await fetch(`${TribesURL}/workspaces/foruser/${uuid}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      const user = await r.json();
      return user;
    } catch (e) {
      console.log('Error getWorkspaceUser', e);
      return undefined;
    }
  }

  async getAdminWorkspaces(): Promise<Workspace[]> {
    try {
      if (!uiStore.meInfo) return [];
      const info = uiStore.meInfo;
      const r: any = await fetch(`${TribesURL}/metrics/workspaces`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      const workspaces = await r.json();
      return workspaces;
    } catch (e) {
      console.log('Error getAdminWorkspaces', e);
      return [];
    }
  }

  @action async addWorkspaceUser(body: {
    owner_pubkey: string;
    workspace_uuid: string;
  }): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const r: any = await fetch(`${TribesURL}/workspaces/users/${body.workspace_uuid}`, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify({
          ...body
        }),
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r;
    } catch (e) {
      console.log('Error addWorkspaceUser', e);
      return false;
    }
  }

  @action async deleteWorkspaceUser(body: any, uuid: string): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const r: any = await fetch(`${TribesURL}/workspaces/users/${uuid}`, {
        method: 'DELETE',
        mode: 'cors',
        body: JSON.stringify({
          ...body
        }),
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r;
    } catch (e) {
      console.log('Error deleteWorkspaceUser', e);
      return false;
    }
  }

  @observable
  bountyRoles: BountyRoles[] = [];

  @action setBountyRoles(roles: BountyRoles[]) {
    this.bountyRoles = roles;
  }

  async getRoles(): Promise<BountyRoles[]> {
    try {
      if (!uiStore.meInfo) return [];
      const info = uiStore.meInfo;
      const r: any = await fetch(`${TribesURL}/workspaces/bounty/roles`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      const roles = await r.json();
      this.setBountyRoles(roles);

      return roles;
    } catch (e) {
      console.log('Error getRoles', e);
      return [];
    }
  }

  async getUserRoles(uuid: string, user: string): Promise<any[]> {
    try {
      if (!uiStore.meInfo) return [];
      const info = uiStore.meInfo;

      const r: Response = await fetch(`${TribesURL}/workspaces/users/role/${uuid}/${user}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      if (!r.ok) {
        console.error(`Fetch failed with status: ${r.status}`);
        return [];
      }

      try {
        return await r.json();
      } catch (jsonError) {
        console.error('JSON Parsing Error:', jsonError);
        return [];
      }
    } catch (e) {
      console.log('Error getUserRoles', e);
      return [];
    }
  }

  async addUserRoles(body: any, uuid: string, user: string): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const r: any = await fetch(`${TribesURL}/workspaces/users/role/${uuid}/${user}`, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(body),
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r;
    } catch (e) {
      console.log('Error addUserRoles', e);
      return false;
    }
  }

  async updateBountyPaymentStatus(created: number): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const r: any = await fetch(`${TribesURL}/gobounties/paymentstatus/${created}`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r;
    } catch (e) {
      console.log('Error updateBountyPaymentStatus', e);
      return false;
    }
  }

  async updateBountyCompletedStatus(created: number): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const r: any = await fetch(`${TribesURL}/gobounties/completedstatus/${created}`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r;
    } catch (e) {
      console.log('Error updateBountyPaymentStatus', e);
      return false;
    }
  }

  async getWorkspaceBudget(uuid: string): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const r: any = await fetch(`${TribesURL}/workspaces/budget/${uuid}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });
      return r.json();
    } catch (e) {
      console.log('Error getWorkspaceBudget', e);
      return false;
    }
  }

  async makeBountyPayment(body: { id: number; websocket_token: string }): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;

      const r: any = await fetch(`${TribesURL}/gobounties/pay/${body.id}`, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(body),
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r;
    } catch (e) {
      console.log('Error makeBountyPayment', e);
      return false;
    }
  }

  async getBountyPenndingPaymentStatus(id: number): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;

      const r: any = await fetch(`${TribesURL}/gobounties/payment/status/${id}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });
      return r.json();
    } catch (e) {
      console.log('Error getBountyPenndingPaymentStatus', e);
      return false;
    }
  }

  async updateBountyPenndingPaymentStatus(body: {
    id: number;
    websocket_token: string;
  }): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;

      const r: any = await fetch(`${TribesURL}/gobounties/payment/status/${body.id}`, {
        method: 'PUT',
        mode: 'cors',
        body: JSON.stringify(body),
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r.json();
    } catch (e) {
      console.log('Error updateBountyPenndingPaymentStatus', e);
      return false;
    }
  }

  async getPaymentHistories(uuid: string, page: number, limit: number): Promise<PaymentHistory[]> {
    try {
      if (!uiStore.meInfo) return [];
      const info = uiStore.meInfo;
      const r: any = await fetch(
        `${TribesURL}/workspaces/payments/${uuid}?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          mode: 'cors',
          headers: {
            'x-jwt': info.tribe_jwt,
            'Content-Type': 'application/json',
            'x-session-id': this.getSessionId()
          }
        }
      );

      const data = await r.json();
      return data;
    } catch (e) {
      console.log('Error getPaymentHistories', e);
      return [];
    }
  }

  async getBudgettHistories(uuid: string): Promise<BudgetHistory[]> {
    try {
      if (!uiStore.meInfo) return [];
      const info = uiStore.meInfo;
      const r: any = await fetch(`${TribesURL}/workspaces/budget/history/${uuid}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r.json();
    } catch (e) {
      console.log('Error gettHistories', e);
      return [];
    }
  }

  async getInvoiceDetails(payment_request: string): Promise<InvoiceDetails | InvoiceError> {
    try {
      const r: any = await fetch(`${TribesURL}/gobounties/invoice/${payment_request}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });
      return r.json();
    } catch (e) {
      console.error('Error getInvoiceDetails', e);
      return {
        success: false,
        error: 'Could not get invoice data'
      };
    }
  }

  async getBountyPaymentById(bounty_id: number): Promise<PaymentHistory | null> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const r: any = await fetch(`${TribesURL}/gobounties/payment/${bounty_id}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });
      return r.json();
    } catch (e) {
      console.error('Error getBountyPaymentById', e);
      return null;
    }
  }

  async getFilterStatusCount(): Promise<FilterStatusCount> {
    try {
      const r: any = await fetch(`${TribesURL}/gobounties/filter/count`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });
      return r.json();
    } catch (e) {
      console.error('Error getFilterStatusCount', e);
      return {
        paid: 0,
        assigned: 0,
        open: 0
      };
    }
  }

  async withdrawBountyBudget(body: {
    websocket_token?: string;
    payment_request: string;
    workspace_uuid: string;
  }): Promise<BudgetWithdrawSuccess | InvoiceError> {
    try {
      if (!uiStore.meInfo)
        return {
          success: false,
          error: 'Cannot make request'
        };
      const info = uiStore.meInfo;

      const r: any = await fetch(`${TribesURL}/gobounties/budget/withdraw`, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(body),
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });
      return r.json();
    } catch (e) {
      console.error('Error withdrawBountyBudget', e);
      return {
        success: false,
        error: 'Error occured while withdrawing budget'
      };
    }
  }

  async getLastWithdrawal(workspace_uuid: string): Promise<number> {
    try {
      if (!uiStore.meInfo) return 0;
      const info = uiStore.meInfo;

      const r: any = await fetch(`${TribesURL}/workspaces/${workspace_uuid}/lastwithdrawal`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });
      return r.json();
    } catch (e) {
      console.error('Error getLastWithdrawal', e);
      return 0;
    }
  }

  async pollInvoice(payment_request: string): Promise<InvoiceDetails | undefined> {
    try {
      if (!uiStore.meInfo) return undefined;
      const info = uiStore.meInfo;

      const r: any = await fetch(`${TribesURL}/poll/invoice/${payment_request}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });
      return r.json();
    } catch (e) {
      console.error('Error pollInvoice', e);
    }
  }

  async pollWorkspaceBudgetInvoices(org_uuid: string): Promise<any> {
    try {
      if (!uiStore.meInfo) return undefined;
      const info = uiStore.meInfo;

      const r: any = await fetch(`${TribesURL}/workspaces/poll/invoices/${org_uuid}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });
      return r;
    } catch (e) {
      console.error('Error pollInvoice', e);
    }
  }

  async pollAllUserWorkspaceBudget(): Promise<any> {
    try {
      if (!uiStore.meInfo) return undefined;
      const info = uiStore.meInfo;

      const r: any = await fetch(`${TribesURL}/workspaces/poll/user/invoices`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });
      return r;
    } catch (e) {
      console.error('Error  pollAllUserWorkspaceBudget', e);
    }
  }

  async workspaceInvoiceCount(workspace_uuid: string): Promise<any> {
    try {
      if (!uiStore.meInfo) return 0;
      const info = uiStore.meInfo;
      const r: any = await fetch(`${TribesURL}/workspaces/invoices/count/${workspace_uuid}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r.json();
    } catch (e) {
      console.error('Error pollInvoice', e);
    }
  }

  async allUserWorkspaceInvoiceCount(): Promise<any> {
    try {
      if (!uiStore.meInfo) return 0;
      const info = uiStore.meInfo;
      const r: any = await fetch(`${TribesURL}/workspaces/user/invoices/count`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r.json();
    } catch (e) {
      console.error('Error pollInvoice', e);
    }
  }

  async workspaceDelete(org_uuid: string): Promise<any> {
    try {
      if (!uiStore.meInfo) return 0;
      const info = uiStore.meInfo;
      const r: any = await fetch(`${TribesURL}/workspaces/delete/${org_uuid}`, {
        method: 'DELETE',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r;
    } catch (e) {
      console.error('workspaceDelete', e);
    }
  }

  async workspaceUpdateMission(body: {
    uuid: string;
    owner_pubkey: string;
    mission: string;
  }): Promise<any> {
    try {
      if (!uiStore.meInfo) return 0;
      const info = uiStore.meInfo;
      const r: any = await fetch(`${TribesURL}/workspaces/mission`, {
        method: 'POST',
        body: JSON.stringify(body),
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r;
    } catch (e) {
      console.error('workspaceUpdateMission', e);
    }
  }

  async workspaceUpdateSchematic(body: {
    uuid: string;
    owner_pubkey: string;
    schematic_url: string;
    schematic_img: string;
  }): Promise<any> {
    try {
      if (!uiStore.meInfo) return 0;
      const info = uiStore.meInfo;
      const r: any = await fetch(`${TribesURL}/workspaces/schematicurl`, {
        method: 'POST',
        body: JSON.stringify(body),
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r;
    } catch (e) {
      console.error('workspaceUpdateSchematic', e);
    }
  }

  async workspaceUpdateTactics(body: {
    uuid: string;
    owner_pubkey: string;
    tactics: string;
  }): Promise<any> {
    try {
      if (!uiStore.meInfo) return 0;
      const info = uiStore.meInfo;
      const r: any = await fetch(`${TribesURL}/workspaces/tactics`, {
        method: 'POST',
        body: JSON.stringify(body),
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r;
    } catch (e) {
      console.error('workspaceUpdateMTactic', e);
    }
  }

  async updateWorkspacePayments(workspace_uuid: string): Promise<any> {
    try {
      if (!uiStore.meInfo) return {};
      const info = uiStore.meInfo;
      const r: any = await fetch(`${TribesURL}/workspaces/${workspace_uuid}/payments`, {
        method: 'PUT',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r;
    } catch (e) {
      console.error('updateWorkspacePayments', e);
    }
  }

  async addFeatureStory(body: CreateFeatureStoryInput): Promise<any> {
    try {
      if (!uiStore.meInfo) return {};
      const info = uiStore.meInfo;
      const r: any = await fetch(`${TribesURL}/features/story`, {
        method: 'POST',
        body: JSON.stringify(body),
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r;
    } catch (e) {
      console.error('addWorkspaceFeature', e);
    }
  }

  async updateFeatureStoryPriority(body: UpdateFeatureStoryInput): Promise<any> {
    try {
      if (!uiStore.meInfo) return {};
      const info = uiStore.meInfo;
      const r: any = await fetch(`${TribesURL}/features/story`, {
        method: 'POST',
        body: JSON.stringify(body),
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r;
    } catch (e) {
      console.error('updateFeatureStoryPriority', e);
    }
  }

  async getFeatureStories(uuid: string): Promise<FeatureStory[] | undefined> {
    try {
      if (!uiStore.meInfo) return undefined;
      const info = uiStore.meInfo;

      const r: any = await fetch(`${TribesURL}/features/${uuid}/story`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r.json();
    } catch (e) {
      console.error('getFeaturesByUuid', e);
      return undefined;
    }
  }

  async deleteFeatureStory(
    feature_uuid: string,
    uuid: string
  ): Promise<FeatureStory[] | undefined> {
    try {
      if (!uiStore.meInfo) return undefined;
      const info = uiStore.meInfo;

      const r: any = await fetch(`${TribesURL}/features/${feature_uuid}/story/${uuid}`, {
        method: 'DELETE',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r.json();
    } catch (e) {
      console.error('getFeaturesByUuid', e);
      return undefined;
    }
  }

  async addWorkspaceFeature(body: CreateFeatureInput): Promise<any> {
    try {
      if (!uiStore.meInfo) return {};
      const info = uiStore.meInfo;
      const r: any = await fetch(`${TribesURL}/features`, {
        method: 'POST',
        body: JSON.stringify(body),
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r;
    } catch (e) {
      console.error('addWorkspaceFeature', e);
    }
  }

  async getWorkspaceFeatures(uuid: string, params: QueryParams): Promise<Feature[]> {
    try {
      if (!uiStore.meInfo) return [];
      const info = uiStore.meInfo;

      const queryParams: QueryParams = {
        sortBy: 'priority',
        limit: featureLimit,
        direction: 'asc',
        search: '',
        page: 1,
        resetPage: false,
        ...params
      };

      // if we don't pass the params, we should use previous params for invalidate query
      const query = makeQueryParams(featureLimit, queryParams);

      const r: any = await fetch(`${TribesURL}/features/forworkspace/${uuid}?${query}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r.json();
    } catch (e) {
      console.error('getWorkspaceFeatures', e);
      return [];
    }
  }

  async getWorkspaceFeaturesCount(uuid: string): Promise<number> {
    try {
      if (!uiStore.meInfo) return 0;
      const info = uiStore.meInfo;

      const r: any = await fetch(`${TribesURL}/features/workspace/count/${uuid}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r.json();
    } catch (e) {
      console.error('getWorkspaceFeaturesCount', e);
      return 0;
    }
  }

  async getFeaturesByUuid(uuid: string): Promise<Feature | undefined> {
    try {
      if (!uiStore.meInfo) return undefined;
      const info = uiStore.meInfo;

      const r: any = await fetch(`${TribesURL}/features/${uuid}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r.json();
    } catch (e) {
      console.error('getFeaturesByUuid', e);
      return undefined;
    }
  }

  async sendStories(body: {
    productBrief: string;
    featureName: string | undefined;
    description: string | undefined;
    examples: any[];
    webhook_url: string;
    featureUUID: string;
    sourceWebsocketId: string;
  }): Promise<any> {
    try {
      const info = uiStore.meInfo;
      if (!info) return null;

      const response = await fetch(`${TribesURL}/features/stories/send`, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(body),
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      if (!response.ok) {
        console.error('Error in sendStories API call', response.statusText);
        return null;
      }

      const result = await response.json();

      return result;
    } catch (error) {
      console.error('Error sending stories:', error);
      return false;
    }
  }

  async getBountyMetrics(
    start_date: string,
    end_date: string,
    workspace: string
  ): Promise<BountyMetrics | undefined> {
    try {
      if (!uiStore.meInfo) return undefined;
      const info = uiStore.meInfo;

      const body = {
        start_date,
        end_date
      };

      const r: any = await fetch(`${TribesURL}/metrics/bounty_stats?workspace=${workspace}`, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(body),
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r.json();
    } catch (e) {
      console.error('getBountyMetrics', e);
      return undefined;
    }
  }

  async getProviderList(
    date_range: {
      start_date: string;
      end_date: string;
    },
    params?: QueryParams
  ): Promise<any | undefined> {
    try {
      if (!uiStore.meInfo) return undefined;
      const info = uiStore.meInfo;

      const queryParams: QueryParams = {
        ...params
      };

      const query = makeQueryParams(5, queryParams);

      const body = {
        start_date: date_range.start_date,
        end_date: date_range.end_date
      };

      const r: any = await fetch(`${TribesURL}/metrics/bounties/providers?${query}`, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(body),
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r.json();
    } catch (e) {
      console.error('getProviderList', e);
      return undefined;
    }
  }

  async getBountiesByRange(
    date_range: {
      start_date: string;
      end_date: string;
    },
    params?: QueryParams
  ): Promise<any | undefined> {
    try {
      if (!uiStore.meInfo) return undefined;
      const info = uiStore.meInfo;

      const queryParams: QueryParams = {
        ...params
      };

      // if we don't pass the params, we should use previous params for invalidate query
      const query = makeQueryParams(20, queryParams);

      const body = {
        start_date: date_range.start_date,
        end_date: date_range.end_date
      };

      const r: any = await fetch(`${TribesURL}/metrics/bounties?${query}`, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(body),
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r.json();
    } catch (e) {
      console.error('getBountyMetrics', e);
      return undefined;
    }
  }

  async getBountiesCountByRange(
    start_date: string,
    end_date: string,
    queryParams?: QueryParams
  ): Promise<number> {
    try {
      if (!uiStore.meInfo) return 0;
      const info = uiStore.meInfo;

      const body = {
        start_date,
        end_date
      };

      const query = makeQueryParams(0, {
        ...queryParams
      });

      const r: any = await fetch(`${TribesURL}/metrics/bounties/count?${query}`, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(body),
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r.json();
    } catch (e) {
      console.error('getBountyMetrics', e);
      return 0;
    }
  }

  async exportMetricsBountiesCsv(
    date_range: {
      start_date: string;
      end_date: string;
    },
    workspace: string
  ): Promise<string | undefined> {
    try {
      if (!uiStore.meInfo) return undefined;
      const info = uiStore.meInfo;

      const body = {
        start_date: date_range.start_date,
        end_date: date_range.end_date
      };

      const r: any = await fetch(`${TribesURL}/metrics/csv?workspace=${workspace}`, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(body),
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r.json();
    } catch (e) {
      console.error('exportMetricsBountiesCsv', e);
      return undefined;
    }
  }

  async getIsAdmin(): Promise<any> {
    try {
      if (!uiStore.meInfo) return false;
      const info = uiStore.meInfo;
      const r: any = await fetch(`${TribesURL}/admin/auth`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      if (r.status === 200) {
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error pollInvoice', e);
    }
  }

  async updateFeatureStatus(uuid: string, status: FeatureStatus): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const response = await fetch(`${TribesURL}/features/${uuid}/status`, {
        method: 'PUT',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (e) {
      console.log('Error updateFeatureStatus', e);
      return null;
    }
  }

  async getRepositories(workspace_uuid: string): Promise<any> {
    try {
      if (!uiStore.meInfo) return [];
      const info = uiStore.meInfo;
      const response = await fetch(`${TribesURL}/workspaces/repositories/${workspace_uuid}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (e) {
      console.log('Error getRepositories', e);
      return [];
    }
  }
  async createOrUpdateRepository1(repo: Repository): Promise<any> {
    try {
      if (!uiStore.meInfo) return [];
      const info = uiStore.meInfo;
      const response = await fetch(`${TribesURL}/workspaces/repositories`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        },
        body: JSON.stringify(repo)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (e) {
      console.log('Error createOrUpdateRepository', e);
      return null;
    }
  }

  async createOrUpdateRepository(repo: Repository): Promise<any> {
    try {
      if (!uiStore.meInfo) return [];
      const info = uiStore.meInfo;

      const url = `${TribesURL}/workspaces/repositories`;
      const method = 'POST';
      const mode = 'cors';
      const headers = {
        'x-jwt': info.tribe_jwt,
        'Content-Type': 'application/json',
        'x-session-id': this.getSessionId()
      };
      const body = JSON.stringify(repo);

      // Log the request details
      console.log('Request details:', { url, method, mode, headers, body });

      const response = await fetch(url, { method, mode, headers, body });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (e) {
      console.log('Error createOrUpdateRepository', e);
      return null;
    }
  }

  async deleteRepository(workspace_uuid: string, repository_uuid: string): Promise<any> {
    try {
      if (!uiStore.meInfo) return [];
      const info = uiStore.meInfo;
      const response = await fetch(
        `${TribesURL}/workspaces/${workspace_uuid}/repository/${repository_uuid}`,
        {
          method: 'DELETE',
          mode: 'cors',
          headers: {
            'x-jwt': info.tribe_jwt,
            'Content-Type': 'application/json',
            'x-session-id': this.getSessionId()
          }
        }
      );

      console.log('response', response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (e) {
      console.log('Error deleteRepository', e);
      return null;
    }
  }

  async getFeaturePhases(feature_uuid: string): Promise<Phase[]> {
    try {
      if (!uiStore.meInfo) return [];
      const info = uiStore.meInfo;
      const response = await fetch(`${TribesURL}/features/${feature_uuid}/phase`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (e) {
      console.log('Error getRepositories', e);
      return [];
    }
  }

  async getFeaturePhaseByUUID(
    feature_uuid: string,
    phase_uuid: string
  ): Promise<Phase | undefined> {
    try {
      if (!uiStore.meInfo) return undefined;
      const info = uiStore.meInfo;

      const r: any = await fetch(`${TribesURL}/features/${feature_uuid}/phase/${phase_uuid}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r.json();
    } catch (e) {
      console.error('getFeaturePhaseByUUID', e);
      return undefined;
    }
  }

  async getTicketDataByPhase(
    feature_uuid: string,
    phase_uuid: string
  ): Promise<Ticket[] | undefined> {
    try {
      if (!uiStore.meInfo) return undefined;
      const info = uiStore.meInfo;

      const r: any = await fetch(
        `${TribesURL}/bounties/ticket/feature/${feature_uuid}/phase/${phase_uuid}`,
        {
          method: 'GET',
          mode: 'cors',
          headers: {
            'x-jwt': info.tribe_jwt,
            'Content-Type': 'application/json',
            'x-session-id': this.getSessionId()
          }
        }
      );

      return r.json();
    } catch (e) {
      console.error('getFeaturePhaseByUUID', e);
      return undefined;
    }
  }

  async createOrUpdatePhase(phase: Phase): Promise<any> {
    try {
      if (!uiStore.meInfo) return [];
      const info = uiStore.meInfo;

      const url = `${TribesURL}/features/phase`;
      const method = 'POST';
      const mode = 'cors';
      const headers = {
        'x-jwt': info.tribe_jwt,
        'Content-Type': 'application/json',
        'x-session-id': this.getSessionId()
      };
      const body = JSON.stringify(phase);

      const response = await fetch(url, { method, mode, headers, body });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (e) {
      console.log('Error createOrUpdatePhase', e);
      return null;
    }
  }

  async deletePhase(feature_uuid: string, phase_uuid: string): Promise<any> {
    try {
      if (!uiStore.meInfo) return [];
      const info = uiStore.meInfo;
      const response = await fetch(`${TribesURL}/features/${feature_uuid}/phase/${phase_uuid}`, {
        method: 'DELETE',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (e) {
      console.log('Error deletePhase', e);
      return null;
    }
  }

  async createUpdateTicket(ticketPayload: {
    metadata: {
      source: string;
      id: string;
    };
    ticket: Ticket;
  }): Promise<any> {
    try {
      if (!uiStore.meInfo) return [];
      const info = uiStore.meInfo;

      const response = await fetch(`${TribesURL}/bounties/ticket/${ticketPayload.ticket.uuid}`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        },
        body: JSON.stringify(ticketPayload)
      });

      if (!response.ok) {
        throw new Error('Failed to create ticket');
      }

      const data = await response.json();
      return data;
    } catch (e) {
      console.log('Error creating ticket', e);
      return 406;
    }
  }

  async updateTicketSequence(ticketPayload: { ticket: Ticket }): Promise<any> {
    try {
      if (!uiStore.meInfo) return [];
      const info = uiStore.meInfo;

      const response = await fetch(
        `${TribesURL}/bounties/ticket/${ticketPayload.ticket.ticket_group}/sequence`,
        {
          method: 'POST',
          mode: 'cors',
          headers: {
            'x-jwt': info.tribe_jwt,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(ticketPayload)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create ticket');
      }

      const data = await response.json();
      console.log('data', data);
      return data;
    } catch (e) {
      console.log('Error creating ticket', e);
      return 406;
    }
  }

  async sendTicketForReview(payload: TicketPayload): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;

      const response = await fetch(`${TribesURL}/bounties/ticket/review/send`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to send ticket for review');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending ticket for review:', error);
      return null;
    }
  }

  async getTicketDetails(uuid: string): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;

      const response = await fetch(`${TribesURL}/bounties/ticket/${uuid}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ticket details');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      return null;
    }
  }

  async getTicketsByGroup(groupId: string): Promise<Ticket[]> {
    try {
      if (!uiStore.meInfo) return [];
      const info = uiStore.meInfo;

      const response = await fetch(`${TribesURL}/bounties/ticket/group/${groupId}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tickets by group');
      }

      const data = await response.json();
      return data.map((ticket: Ticket) => ({
        ...ticket,
        uuid: ticket.UUID || ticket.uuid
      }));
    } catch (error) {
      console.error('Error fetching tickets by group:', error);
      return [];
    }
  }

  async createConnectionCodes({
    users_number,
    sats_amount,
    pubkey,
    route_hint
  }: {
    users_number: number;
    sats_amount?: number;
    pubkey?: string;
    route_hint?: string;
  }): Promise<number> {
    try {
      if (!uiStore.meInfo) return 406;
      const info = uiStore.meInfo;

      const data = {
        number: users_number,
        pubkey: pubkey,
        route_hint,
        sats_amount
      };

      const body = JSON.stringify(data);

      const response = await fetch(`${TribesURL}/connectioncodes`, {
        method: 'POST',
        mode: 'cors',
        body: body,
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return response.status;
    } catch (e) {
      console.log('Error createConnectionCodes', e);
      return 406;
    }
  }

  async getInviteCodes(page: number, limit: number): Promise<ConnectionCodesListResponse> {
    try {
      if (!uiStore.meInfo) return { success: false, data: { codes: [], total: 0 } };
      const info = uiStore.meInfo;

      const response = await fetch(
        `${TribesURL}/connectioncodes/list?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          mode: 'cors',
          headers: {
            'x-jwt': info.tribe_jwt,
            'Content-Type': 'application/json',
            'x-session-id': this.getSessionId()
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ConnectionCodesListResponse = await response.json();
      return data;
    } catch (e) {
      console.log('Error getInviteCodes', e);
      return { success: false, data: { codes: [], total: 0 } };
    }
  }

  async getWorkspaceCodeGraph(workspace_uuid: string): Promise<CodeGraph | null> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const response = await fetch(`${TribesURL}/workspaces/${workspace_uuid}/codegraph`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (e) {
      console.log('Error getWorkspaceCodeGraph', e);
      return null;
    }
  }

  async createOrUpdateCodeGraph(codeGraph: CodeGraph): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const response = await fetch(`${TribesURL}/workspaces/codegraph`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        },
        body: JSON.stringify(codeGraph)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (e) {
      console.log('Error createOrUpdateCodeGraph', e);
      return null;
    }
  }

  async deleteCodeGraph(
    workspace_uuid: string,
    codegraph_uuid: string
  ): Promise<FeatureCall | null> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const response = await fetch(
        `${TribesURL}/workspaces/${workspace_uuid}/codegraph/${codegraph_uuid}`,
        {
          method: 'DELETE',
          mode: 'cors',
          headers: {
            'x-jwt': info.tribe_jwt,
            'Content-Type': 'application/json',
            'x-session-id': this.getSessionId()
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (e) {
      console.log('Error deleteCodeGraph', e);
      return null;
    }
  }

  async getWorkspaceFeatureCall(workspace_uuid: string): Promise<FeatureCall | null> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const response = await fetch(`${TribesURL}/features/call/${workspace_uuid}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (e) {
      console.log('Error getWorkspaceFeatureCall', e);
      return null;
    }
  }

  async createOrUpdateFeatureCall(featureCall: FeatureCall): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const response = await fetch(`${TribesURL}/features/call`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        },
        body: JSON.stringify(featureCall)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (e) {
      console.log('Error createOrUpdateFeatureCall', e);
      return null;
    }
  }

  async deleteFeatureCall(workspace_uuid: string): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const response = await fetch(`${TribesURL}/features/call/${workspace_uuid}`, {
        method: 'DELETE',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (e) {
      console.log('Error deleteFeatureCall', e);
      return null;
    }
  }

  async createBountyFromTicket(ticketUuid: string): Promise<CreateBountyResponse | null> {
    try {
      const info = uiStore.meInfo;
      if (!info) return null;

      const response = await fetch(`${TribesURL}/bounties/ticket/${ticketUuid}/bounty`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to create bounty');
      }

      return response.json();
    } catch (error) {
      console.error('Error creating bounty:', error);
      return null;
    }
  }

  async getFeatureFlags(): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const r: any = await fetch(`${TribesURL}/feature-flags`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      const data = await r.json();
      console.log('data', data);
      return data;
    } catch (e) {
      console.log('Error getFeatureFlags', e);
      return null;
    }
  }

  async updateFeatureFlag(uuid: string, enabled: boolean): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const r: any = await fetch(`${TribesURL}/feature-flags/${uuid}`, {
        method: 'PUT',
        mode: 'cors',
        body: JSON.stringify({ enabled }),
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r;
    } catch (e) {
      console.log('Error updateFeatureFlag', e);
      return null;
    }
  }

  async createFeatureFlag(
    data: Omit<FeatureFlag, 'uuid' | 'endpoints'> & { endpoints: string[] }
  ): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const r: any = await fetch(`${TribesURL}/feature-flags`, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(data),
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r.json();
    } catch (e) {
      console.log('Error createFeatureFlag', e);
      return null;
    }
  }

  async deleteFeatureFlag(uuid: string): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const r: any = await fetch(`${TribesURL}/feature-flags/${uuid}`, {
        method: 'DELETE',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r.json();
    } catch (e) {
      console.log('Error deleteFeatureFlag', e);
      return null;
    }
  }

  async getTotalWorkspaceBountyCount(
    uuid: string,
    open: boolean,
    assigned: boolean,
    paid: boolean,
    pending: boolean,
    failed: boolean
  ): Promise<number> {
    try {
      const count = await api.get(
        `workspaces/bounties/${uuid}/count?Open=${open}&Assigned=${assigned}&Paid=${paid}&Pending=${pending}&Failed=${failed}`
      );
      return await count;
    } catch (e) {
      console.log('fetch failed getTotalWorkspaceBountyCount: ', e);
      return 0;
    }
  }

  async updateFeatureFlagDetails(
    uuid: string,
    data: Omit<FeatureFlag, 'uuid' | 'endpoints'> & { endpoints: string[] }
  ): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const r: any = await fetch(`${TribesURL}/feature-flags/${uuid}`, {
        method: 'PUT',
        mode: 'cors',
        body: JSON.stringify(data),
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      return r.json();
    } catch (e) {
      console.log('Error updateFeatureFlagDetails', e);
      return null;
    }
  }

  async deleteTicket(uuid: string): Promise<boolean> {
    try {
      if (!uiStore.meInfo) return false;
      const info = uiStore.meInfo;

      const response = await fetch(`${TribesURL}/bounties/ticket/${uuid}`, {
        method: 'DELETE',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete ticket');
      }

      return true;
    } catch (error) {
      console.error('Error deleting ticket:', error);
      return false;
    }
  }

  async fetchFeaturedBounties(): Promise<FeaturedBounty[] | []> {
    try {
      if (!uiStore.meInfo) return [];
      const info = uiStore.meInfo;

      const response = await fetch(`${TribesURL}/gobounties/featured/all`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt || '',
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch featured bounties');
      }

      const responseData = await response.json();

      return responseData;
    } catch (error) {
      console.error('Error fetching featured bounties:', error);
      return [];
    }
  }

  async addFeaturedBounty(bounty: {
    bountyId: string;
    url: string;
    title?: string;
  }): Promise<boolean> {
    try {
      if (!uiStore.meInfo) return false;
      const info = uiStore.meInfo;

      const response = await fetch(`${TribesURL}/gobounties/featured/create`, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(bounty),
        headers: {
          'x-jwt': info.tribe_jwt || '',
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      if (!response.ok) {
        throw new Error('Failed to add featured bounty');
      }

      return true;
    } catch (error) {
      console.error('Error adding featured bounty:', error);
      return false;
    }
  }

  async deleteFeaturedBounty(bountyId: string): Promise<boolean> {
    try {
      if (!uiStore.meInfo) return false;
      const info = uiStore.meInfo;

      const response = await fetch(`${TribesURL}/gobounties/featured/delete/${bountyId}`, {
        method: 'DELETE',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt || '',
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete featured bounty');
      }

      return true;
    } catch (error) {
      console.error('Error deleting featured bounty:', error);
      return false;
    }
  }

  async createSnippet(workspaceUUID: string, title: string, snippet: string): Promise<boolean> {
    try {
      const response = await fetch(`${TribesURL}/snippet/create?workspace_uuid=${workspaceUUID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-jwt': uiStore.meInfo?.tribe_jwt || '',
          'x-session-id': this.getSessionId() || ''
        },
        body: JSON.stringify({ title, snippet })
      });

      if (!response.ok) throw new Error('Failed to create snippet');
      return true;
    } catch (error) {
      console.error('Error creating snippet:', error);
      return false;
    }
  }

  async getSnippetsByWorkspace(workspaceUUID: string): Promise<any[]> {
    try {
      if (!uiStore.meInfo) return [];
      const response = await fetch(`${TribesURL}/snippet/workspace/${workspaceUUID}`, {
        method: 'GET',
        headers: {
          'x-jwt': uiStore.meInfo?.tribe_jwt || '',
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId() || ''
        }
      });

      if (!response.ok) throw new Error('Failed to fetch snippets by workspace');
      return await response.json();
    } catch (error) {
      console.error('Error fetching snippets by workspace:', error);
      return [];
    }
  }

  async getSnippetByID(id: string): Promise<any | null> {
    try {
      if (!uiStore.meInfo) return null;
      const response = await fetch(`${TribesURL}/snippet/${id}`, {
        method: 'GET',
        headers: {
          'x-jwt': uiStore.meInfo?.tribe_jwt || '',
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId() || ''
        }
      });

      if (!response.ok) throw new Error('Failed to fetch snippet by ID');
      return await response.json();
    } catch (error) {
      console.error('Error fetching snippet by ID:', error);
      return null;
    }
  }

  async updateSnippet(id: string, title: string, snippet: string): Promise<boolean> {
    try {
      if (!uiStore.meInfo) return false;
      const response = await fetch(`${TribesURL}/snippet/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-jwt': uiStore.meInfo?.tribe_jwt || '',
          'x-session-id': this.getSessionId() || ''
        },
        body: JSON.stringify({ title, snippet })
      });

      if (!response.ok) throw new Error('Failed to update snippet');
      return true;
    } catch (error) {
      console.error('Error updating snippet:', error);
      return false;
    }
  }

  async deleteSnippet(id: string): Promise<boolean> {
    try {
      if (!uiStore.meInfo) return false;
      const response = await fetch(`${TribesURL}/snippet/${id}`, {
        method: 'DELETE',
        headers: {
          'x-jwt': uiStore.meInfo?.tribe_jwt || '',
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId() || ''
        }
      });

      if (!response.ok) throw new Error('Failed to delete snippet');
      return true;
    } catch (error) {
      console.error('Error deleting snippet:', error);
      return false;
    }
  }

  async fetchWorkspaceActivities(workspace: string): Promise<IActivity[]> {
    try {
      const response = await fetch(`${TribesURL}/activities/workspace/${workspace}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': uiStore.meInfo?.tribe_jwt || '',
          'Content-Type': 'application/json',
          'x-session-id': this.sessionId || ''
        }
      });
      if (!response.ok) throw new Error('Failed to fetch activities');
      return await response.json();
    } catch (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
  }

  async createActivity(newActivity: INewActivity): Promise<IActivity | null> {
    try {
      const response = await fetch(`${TribesURL}/activities`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'x-jwt': uiStore.meInfo?.tribe_jwt || '',
          'Content-Type': 'application/json',
          'x-session-id': this.sessionId || ''
        },
        body: JSON.stringify(newActivity)
      });
      if (!response.ok) throw new Error('Failed to create activity');
      return await response.json();
    } catch (error) {
      console.error('Error creating activity:', error);
      return null;
    }
  }

  async updateActivity(
    id: string,
    updates: Partial<Omit<IActivity, 'id' | 'threadId' | 'sequence'>>
  ): Promise<boolean> {
    try {
      const response = await fetch(`${TribesURL}/activities/${id}`, {
        method: 'PUT',
        mode: 'cors',
        headers: {
          'x-jwt': uiStore.meInfo?.tribe_jwt || '',
          'Content-Type': 'application/json',
          'x-session-id': this.sessionId || ''
        },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update activity');
      return true;
    } catch (error) {
      console.error('Error updating activity:', error);
      return false;
    }
  }

  async deleteActivity(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${TribesURL}/activities/${id}`, {
        method: 'DELETE',
        mode: 'cors',
        headers: {
          'x-jwt': uiStore.meInfo?.tribe_jwt || '',
          'Content-Type': 'application/json',
          'x-session-id': this.sessionId || ''
        }
      });
      if (!response.ok) throw new Error('Failed to delete activity');
      return true;
    } catch (error) {
      console.error('Error deleting activity:', error);
      return false;
    }
  }

  async createThreadResponse(
    activity_id: string,
    activity: INewActivity
  ): Promise<IActivity | null> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const response = await fetch(`${TribesURL}/activities/thread?source_id=${activity_id}`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt || '',
          'Content-Type': 'application/json',
          'x-session-id': this.sessionId || ''
        },
        body: JSON.stringify(activity)
      });

      if (!response.ok) throw new Error('Failed to create thread response');
      return await response.json();
    } catch (error) {
      console.error('Error creating thread response:', error);
      return null;
    }
  }

  async fetchQuickBounties(featureUUID: string): Promise<QuickBountiesResponse | null> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;

      const response = await fetch(`${TribesURL}/features/${featureUUID}/quick-bounties`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt || '',
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quick bounties');
      }

      const responseData: QuickBountiesResponse = await response.json();
      return responseData;
    } catch (error) {
      console.error('Error fetching quick bounties:', error);
      return null;
    }
  }

  async fetchQuickTickets(featureUUID: string): Promise<QuickTicketsResponse | null> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;

      const response = await fetch(`${TribesURL}/features/${featureUUID}/quick-tickets`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt || '',
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quick tickets');
      }

      const responseData: QuickTicketsResponse = await response.json();
      return responseData;
    } catch (error) {
      console.error('Error fetching quick tickets:', error);
      return null;
    }
  }

  async convertTicketsToBounties(
    payload: BulkTicketToBountyRequest
  ): Promise<BulkConversionResponse | null> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;

      const response = await fetch(`${TribesURL}/bounties/ticket/bounty/bulk`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt || '',
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to convert tickets to bounties');
      }

      const responseData: BulkConversionResponse = await response.json();
      return responseData;
    } catch (error) {
      console.error('Error converting tickets to bounties:', error);
      return null;
    }
  }

  async createStakworkProject(chatQuestion: string): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const response = await fetch(`${TribesURL}/hivechat/send/build`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt || '',
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        },
        body: JSON.stringify({
          question: chatQuestion
        })
      });

      if (!response.ok) {
        throw new Error(
          `Failed to create Stakwork project: ${response.status} ${response.statusText}`
        );
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error('Error creating Stakwork project:', error);
      return null;
    }
  }

  async sendPhasePlan(payload: {
    feature_id: string;
    phase_id: string;
    ticket_group_ids: string[];
    source_websocket: string;
    request_uuid: string;
  }): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;

      const response = await fetch(`${TribesURL}/bounties/ticket/plan/send`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to send phase plan');
      }

      return response.json();
    } catch (error) {
      console.error('Error sending phase plan:', error);
      return null;
    }
  }

  async getFeatureCalls(workspace_uuid: string): Promise<any> {
    try {
      if (!uiStore.meInfo) {
        throw new Error('No user info found');
      }

      const response = await fetch(`${TribesURL}/features/call/${workspace_uuid}`, {
        method: 'GET',
        headers: {
          'x-jwt': uiStore.meInfo.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('No permission');
        }
        if (response.status === 404) {
          throw new Error('Feature call not configured');
        }
        throw new Error('Unable to load feature call');
      }

      const data = await response.json();
      if (!data?.url) {
        throw new Error('Feature call not configured');
      }

      // Validate URL format
      try {
        new URL(data.url);
      } catch (e) {
        throw new Error('Invalid URL format');
      }

      return data;
    } catch (error) {
      console.error('Error in getFeatureCalls:', error);
      throw error;
    }
  }

  async createFeatureCall(workspace_uuid: string): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;

      const response = await fetch(`${TribesURL}/features/call`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        },
        body: JSON.stringify({ workspace_uuid })
      });

      if (!response.ok) {
        console.error('Error in createFeatureCall API call', response.statusText);
        return null;
      }

      return response.json();
    } catch (error) {
      console.error('Error creating feature call:', error);
      return null;
    }
  }

  async getWorkspaceChatWorkflow(workspace_uuid: string): Promise<ChatWorkflow | null> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const response = await fetch(`${TribesURL}/hivechat/chatworkflow/${workspace_uuid}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<ChatWorkflow> = await response.json();
      return result.data;
    } catch (e) {
      console.error('Error getWorkspaceChatWorkflow:', e);
      return null;
    }
  }

  async createOrUpdateChatWorkflow(chatWorkflow: ChatWorkflow): Promise<ChatWorkflow | null> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;

      const url = new URL(chatWorkflow.url);
      const pathParts = url.pathname.split('/');
      const stackworkId = pathParts[pathParts.length - 1];

      const payload = {
        workspaceId: chatWorkflow.workspaceId,
        url: chatWorkflow.url,
        stackworkId
      };

      const response = await fetch(`${TribesURL}/hivechat/chatworkflow`, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(payload),
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<ChatWorkflow> = await response.json();
      return result.data;
    } catch (e) {
      console.error('Error createOrUpdateChatWorkflow:', e);
      throw e;
    }
  }

  async deleteChatWorkflow(workspace_uuid: string): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const response = await fetch(`${TribesURL}/hivechat/chatworkflow/${workspace_uuid}`, {
        method: 'DELETE',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (e) {
      console.log('Error deleteChatWorkflow', e);
      return null;
    }
  }

  async getAllSSEMessages(chat_id: string): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const response = await fetch(`${TribesURL}/hivechat/sse/all/${chat_id}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (e) {
      console.log('Error deleteChatWorkflow', e);
      return null;
    }
  }

  async getCodeSpace(workspace_uuid: string): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const response = await fetch(
        `${TribesURL}/codespace/workspaces/${workspace_uuid}/user/${info.pubkey}`,
        {
          method: 'GET',
          mode: 'cors',
          headers: {
            'x-jwt': info.tribe_jwt,
            'Content-Type': 'application/json',
            'x-session-id': this.getSessionId()
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (e) {
      console.log('Error deleteChatWorkflow', e);
      return null;
    }
  }
  // Update body type to allow githubPat
  async createCodeSpace(
    body: Omit<CodeSpaceMap, 'id' | 'createdAt' | 'updatedAt'> & {
      username?: string;
      githubPat?: string;
      baseBranch?: string;
      poolAPIKey?: string;
    }
  ): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const response = await fetch(`${TribesURL}/codespace/workspaces`, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(body),
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (e) {
      console.log('Error deleteChatWorkflow', e);
      return null;
    }
  }
  // Update body type to CodeSpaceMap including optional githubPat
  async updateCodeSpace(body: CodeSpaceMap, id: string): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const response = await fetch(`${TribesURL}/codespace/workspaces/${id}`, {
        method: 'PUT',
        mode: 'cors',
        body: JSON.stringify(body),
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (e) {
      console.log('Error deleteChatWorkflow', e);
      return null;
    }
  }
  async deleteCodeSpace(id: string): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const response = await fetch(`${TribesURL}/codespace/workspaces/${id}`, {
        method: 'DELETE',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (e) {
      console.log('Error deleteChatWorkflow', e);
      return null;
    }
  }

  async refreshCodeSpace(workspaceId: string): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;

      const response = await fetch(`${TribesURL}/workspaces/codegraph/refresh/${workspaceId}`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (e) {
      console.log('Error refreshCodeSpace', e);
      return null;
    }
  }

  async checkBountyStakeStatus(bountyId: number): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const response = await fetch(
        `${TribesURL}/gobounties/stake/stakeprocessing/bounty/${bountyId}`,
        {
          method: 'GET',
          mode: 'cors',
          headers: {
            'x-jwt': info.tribe_jwt,
            'Content-Type': 'application/json',
            'x-session-id': this.getSessionId()
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (e) {
      console.log('Error checkBountyStakeStatus', e);
      return null;
    }
  }

  async generateStakeInvoice(
    bountyId: number,
    amount: number,
    senderPubKey: string,
    workspaceUuid: string
  ): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const response = await fetch(`${TribesURL}/gobounties/process_stake/${bountyId}`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        },
        body: JSON.stringify({
          amount,
          sender_pubkey: senderPubKey,
          workspace_uuid: workspaceUuid,
          payment_type: 'stake',
          is_stake: true
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (e) {
      console.log('Error generateStakeInvoice', e);
      return null;
    }
  }

  /**
   * Fetch environment variables for a workspace
   */
  async getWorkspaceEnvVars(workspace_uuid: string): Promise<any> {
    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const response = await fetch(`${TribesURL}/workspaces/${workspace_uuid}/env_vars`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (e) {
      console.log('Error getWorkspaceEnvVars', e);
      return null;
    }
  }

  /**
   * Update environment variables for a workspace
   * Only send new/changed values (not masked/unchanged)
   */
  async updateWorkspaceEnvVars(workspace_uuid: string, envVars: EnvVar[]): Promise<any> {
    // Only send name/value (ignore masked/_edited)
    const payload = {
      env_vars: envVars.map(({ name, value }) => ({ name, value }))
    };

    try {
      if (!uiStore.meInfo) return null;
      const info = uiStore.meInfo;
      const response = await fetch(`${TribesURL}/workspaces/${workspace_uuid}/env_vars`, {
        method: 'PUT',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json',
          'x-session-id': this.getSessionId()
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (e) {
      console.log('Error updateWorkspaceEnvVars', e);
      return null;
    }
  }
}

export const mainStore = new MainStore();
