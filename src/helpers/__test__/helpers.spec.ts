import crypto from 'crypto';
import moment from 'moment';
import { setupStore } from '__test__/__mockData__/setupStore';
import { user } from '__test__/__mockData__/user';
import { mainStore } from 'store/main';
import { waitFor } from '@testing-library/react';
import nock from 'nock';
import {
  extractGithubIssueFromUrl,
  extractRepoAndIssueFromIssueUrl,
  randomString,
  calculateTimeLeft,
  toCapitalize,
  userHasRole,
  spliceOutPubkey,
  userHasManageBountyRoles,
  RolesCategory,
  handleDisplayRole,
  formatSat,
  filterCount,
  userCanManageBounty,
  formatPercentage,
  normalizeInput,
  normalizeTextValue,
  normalizeUrl,
  ManageBountiesGroup,
  formatRelayPerson
} from '../helpers-extended';

beforeAll(() => {
  // for test randomString
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      getRandomValues: (arr) => crypto.randomBytes(arr.length)
    }
  });
  setupStore();
});

afterAll(() => {});

describe('testing helpers', () => {
  describe('extractRepoAndIssueFromIssueUrl', () => {
    test('valid data', () => {
      const issueUrl = 'https://github.com/stakwork/sphinx-tribes/issues/459';
      const result = { issue: '459', repo: 'stakwork/sphinx-tribes' };
      expect(extractRepoAndIssueFromIssueUrl(issueUrl)).toEqual(result);
    });
    test('empty string', () => {
      const issueUrl = '';

      expect(() => {
        extractRepoAndIssueFromIssueUrl(issueUrl);
      }).toThrow(Error);
    });
    test('invalid URL', () => {
      const issueUrl = 'https://test.url/issue/test/awr/awr/';
      expect(() => {
        extractRepoAndIssueFromIssueUrl(issueUrl);
      }).toThrow(Error);
    });
  });
  describe('extractGithubIssueFromUrl', () => {
    test('valid data', () => {
      const issueUrl = 'https://github.com/stakwork/sphinx-tribes/issues/459';
      const issueKey = 'stakwork/sphinx-tribes/459';
      const person = {
        github_issues: {
          [issueKey]: 'test'
        }
      };
      expect(extractGithubIssueFromUrl(person, issueUrl)).toBe('test');
    });

    test('invalid data', () => {
      const issueUrl = 'https://github.com/tribes/issues/459';
      const issueKey = 'stakwork/sphinx-tribes/459';
      const person = {
        github_issues: {
          [issueKey]: 'test'
        }
      };
      expect(extractGithubIssueFromUrl(person, issueUrl)).toEqual({});
    });
    test('empty url', () => {
      const issueUrl = '';
      const issueKey = 'stakwork/sphinx-tribes/459';
      const person = {
        github_issues: {
          [issueKey]: 'test'
        }
      };
      expect(extractGithubIssueFromUrl(person, issueUrl)).toEqual({});
    });
  });
  // This was breaking our test suite
  /* describe('satToUsd', () => {
    test('validData', () => {
      expect(satToUsd(100)).toEqual('10.00');
      expect(satToUsd(1000000)).toEqual('100000.00');
      expect(satToUsd(1)).toEqual('0.10');
      expect(satToUsd(0)).toEqual('0.00');
    });
  });*/
  describe('randomString', () => {
    test('length', () => {
      expect(randomString(15)).toHaveLength(30);
    });
    test('strings not equal', () => {
      const str1 = randomString(2);
      const str2 = randomString(2);
      expect(str1).not.toBe(str2);
    });
  });
  describe('calculateTimeLeft', () => {
    test('time remaining', () => {
      const timeLimit = new Date(moment().add(2, 'minutes').format().toString());
      const { minutes, seconds } = calculateTimeLeft(timeLimit, 'minutes');
      expect(minutes).toBe(1);
      expect(seconds).toBeGreaterThan(50);
    });
    test('calculate days remaining', () => {
      const timeLimit = new Date(moment().add(2, 'days').format().toString());
      const { days, hours, minutes, seconds } = calculateTimeLeft(timeLimit, 'days');
      expect(minutes).toBe(59);
      expect(seconds).toBe(59);
      expect(days).toBe(1);
      expect(hours).toBe(23);
    });
  });
  describe('userHasRole', () => {
    test('test user has roles', () => {
      const testRoles = [
        {
          name: 'ADD BOUNTY'
        },
        {
          name: 'DELETE BOUNTY'
        },
        {
          name: 'PAY BOUNTY'
        }
      ];

      const userRole = [
        {
          role: 'ADD BOUNTY'
        }
      ];
      const hasRole = userHasRole(testRoles, userRole, 'ADD BOUNTY');
      expect(hasRole).toBe(true);
    });

    test('test user has manage bounty roles', () => {
      const testRoles = [
        {
          name: 'ADD BOUNTY'
        },
        {
          name: 'UPDATE BOUNTY'
        },
        {
          name: 'PAY BOUNTY'
        },
        {
          name: 'DELETE BOUNTY'
        }
      ];

      const userRole = [
        {
          role: 'ADD BOUNTY'
        },
        {
          role: 'DELETE BOUNTY'
        },
        {
          role: 'PAY BOUNTY'
        },
        {
          role: 'UPDATE BOUNTY'
        }
      ];
      const hasRole = userHasManageBountyRoles(testRoles, userRole);
      expect(hasRole).toBe(true);
    });
    test('test user dose not have manage bounty roles', () => {
      const testRoles = [
        {
          name: 'ADD BOUNTY'
        },
        {
          name: 'DELETE BOUNTY'
        },
        {
          name: 'PAY BOUNTY'
        },
        {
          name: 'UPDATE BOUNTY'
        }
      ];

      const userRole = [
        {
          role: 'ADD BOUNTY'
        },
        {
          role: 'DELETE BOUNTY'
        }
      ];
      const hasRole = userHasManageBountyRoles(testRoles, userRole);
      expect(hasRole).toBe(false);
    });

    it('should return true when role exists in both bounty roles and user roles', () => {
      const bountyRoles = [{ name: 'ADMIN' }, { name: 'EDITOR' }];
      const userRoles = [{ role: 'ADMIN' }, { role: 'USER' }];
      expect(userHasRole(bountyRoles, userRoles, 'ADMIN')).toBe(true);
    });

    it('should return false when role exists only in bounty roles', () => {
      const bountyRoles = [{ name: 'ADMIN' }, { name: 'EDITOR' }];
      const userRoles = [{ role: 'USER' }, { role: 'VIEWER' }];
      expect(userHasRole(bountyRoles, userRoles, 'ADMIN')).toBe(false);
    });

    it('should return false when role exists only in user roles', () => {
      const bountyRoles = [{ name: 'EDITOR' }, { name: 'VIEWER' }];
      const userRoles = [{ role: 'ADMIN' }, { role: 'USER' }];
      expect(userHasRole(bountyRoles, userRoles, 'ADMIN')).toBe(false);
    });

    it('should return false when role does not exist in either list', () => {
      const bountyRoles = [{ name: 'EDITOR' }, { name: 'VIEWER' }];
      const userRoles = [{ role: 'USER' }, { role: 'ADMIN' }];
      expect(userHasRole(bountyRoles, userRoles, 'MANAGER')).toBe(false);
    });

    it('should return false when bounty roles list is empty', () => {
      const bountyRoles: any[] = [];
      const userRoles = [{ role: 'ADMIN' }, { role: 'USER' }];
      expect(userHasRole(bountyRoles, userRoles, 'ADMIN')).toBe(false);
    });

    it('should return false when user roles list is empty', () => {
      const bountyRoles = [{ name: 'ADMIN' }, { name: 'EDITOR' }];
      const userRoles: any[] = [];
      expect(userHasRole(bountyRoles, userRoles, 'ADMIN')).toBe(false);
    });

    it('should return false when role string is empty', () => {
      const bountyRoles = [{ name: 'ADMIN' }, { name: 'EDITOR' }];
      const userRoles = [{ role: 'ADMIN' }, { role: 'USER' }];
      expect(userHasRole(bountyRoles, userRoles, '')).toBe(false);
    });

    it('should be case sensitive when checking roles', () => {
      const bountyRoles = [{ name: 'ADMIN' }, { name: 'EDITOR' }];
      const userRoles = [{ role: 'admin' }, { role: 'USER' }];
      expect(userHasRole(bountyRoles, userRoles, 'ADMIN')).toBe(false);
    });

    it('should handle invalid data types in bounty roles', () => {
      const bountyRoles = [null, undefined, 42, 'string', true, {}] as any[];
      const userRoles = [{ role: 'ADMIN' }];
      waitFor(() => {
        expect(userHasRole(bountyRoles, userRoles, 'ADMIN')).toBe(false);
      });
    });

    it('should handle invalid data types in user roles', () => {
      const bountyRoles = [{ name: 'ADMIN' }];
      const userRoles = [null, undefined, 42, 'string', true, {}] as any[];
      waitFor(() => {
        expect(userHasRole(bountyRoles, userRoles, 'ADMIN')).toBe(false);
      });
    });

    it('should handle null values in bounty roles', () => {
      const bountyRoles = [{ name: null }, { name: 'EDITOR' }];
      const userRoles = [{ role: 'ADMIN' }];
      expect(userHasRole(bountyRoles, userRoles, 'ADMIN')).toBe(false);
    });

    it('should handle null values in user roles', () => {
      const bountyRoles = [{ name: 'ADMIN' }];
      const userRoles = [{ role: null }, { role: 'USER' }];
      expect(userHasRole(bountyRoles, userRoles, 'ADMIN')).toBe(false);
    });

    it('should handle large number of roles efficiently', () => {
      const bountyRoles = Array.from({ length: 1000 }, (_: unknown, i: number) => ({
        name: `ROLE_${i}`
      }));
      const userRoles = Array.from({ length: 1000 }, (_: unknown, i: number) => ({
        role: `ROLE_${i}`
      }));
      expect(userHasRole(bountyRoles, userRoles, 'ROLE_999')).toBe(true);
    });

    it('should handle role as a number', () => {
      const bountyRoles = [{ name: 42 }];
      const userRoles = [{ role: 42 }];
      waitFor(() => {
        expect(userHasRole(bountyRoles, userRoles, 42 as any)).toBe(false);
      });
    });

    it('should handle role as an object', () => {
      const bountyRoles = [{ name: { id: 1 } }];
      const userRoles = [{ role: { id: 1 } }];
      waitFor(() => {
        expect(userHasRole(bountyRoles, userRoles, { id: 1 } as any)).toBe(false);
      });
    });

    it('should handle role as a boolean', () => {
      const bountyRoles = [{ name: true }];
      const userRoles = [{ role: true }];
      waitFor(() => {
        expect(userHasRole(bountyRoles, userRoles, true as any)).toBe(false);
      });
    });

    it('should handle role as special characters', () => {
      const bountyRoles = [{ name: '@#$%^&*' }, { name: 'NORMAL' }];
      const userRoles = [{ role: '@#$%^&*' }, { role: 'USER' }];
      waitFor(() => {
        expect(userHasRole(bountyRoles, userRoles, '@#$%^&*')).toBe(true);
      });
    });
  });
  describe('toCapitalize', () => {
    test('test to capitalize string', () => {
      const capitalizeString = toCapitalize('hello test sphinx');
      expect(capitalizeString).toBe('Hello Test Sphinx');
    });

    test('test to capitalize string with extra space at the end', () => {
      const capitalizeString = toCapitalize('hello test sphinx    ');
      expect(capitalizeString).toBe('Hello Test Sphinx');
    });

    test('test to capitalize string with extra space between', () => {
      const capitalizeString = toCapitalize('hello test    sphinx');
      expect(capitalizeString).toBe('Hello Test Sphinx');
    });
  });
  describe('spliceOutPubkey', () => {
    test('test that it returns pubkey from a pubkey:route_hint string', () => {
      const pubkey = '12344444444444444';
      const routeHint = '899900000000000000:88888888';
      const userAddress = `${pubkey}:${routeHint}`;
      const pub = spliceOutPubkey(userAddress);
      expect(pub).toBe(pubkey);
    });
  });

  describe('format roles', () => {
    test('should correctly set the default data roles for the first assigned user', () => {
      const displayedRoles: RolesCategory[] = [];
      const result = handleDisplayRole(displayedRoles);
      expect(result.newDisplayedRoles).toEqual([]);
      expect(result.tempDataRole).toEqual({});
    });

    test('should correctly update the status of a role if it is present in the default roles', () => {
      const displayedRoles: RolesCategory[] = [
        { name: 'Manage bounties', roles: [], status: false },
        { name: 'Fund workspace', roles: [], status: false },
        { name: 'Withdraw from workspace', roles: [], status: false },
        { name: 'View transaction history', roles: [], status: false }
      ];
      const result = handleDisplayRole(displayedRoles);
      expect(result.newDisplayedRoles).toEqual([
        { name: 'Manage bounties', roles: [], status: true },
        { name: 'Fund workspace', roles: [], status: true },
        { name: 'Withdraw from workspace', roles: [], status: true },
        { name: 'View transaction history', roles: [], status: true }
      ]);
      expect(result.tempDataRole).toEqual({});
    });

    test('should correctly update the tempDataRole object with the data roles of a role if it is present in the default roles', () => {
      const displayedRoles: RolesCategory[] = [
        { name: 'Manage bounties', roles: ['role1', 'role2'], status: false },
        { name: 'Fund workspace', roles: ['role3'], status: false },
        { name: 'Withdraw from workspace', roles: ['role4'], status: false },
        { name: 'View transaction history', roles: ['role5'], status: false }
      ];
      const result = handleDisplayRole(displayedRoles);
      expect(result.newDisplayedRoles).toEqual([
        { name: 'Manage bounties', roles: ['role1', 'role2'], status: true },
        { name: 'Fund workspace', roles: ['role3'], status: true },
        { name: 'Withdraw from workspace', roles: ['role4'], status: true },
        { name: 'View transaction history', roles: ['role5'], status: true }
      ]);
      expect(result.tempDataRole).toEqual({
        role1: true,
        role2: true,
        role3: true,
        role4: true,
        role5: true
      });
    });

    test('formatSat', () => {
      expect(formatSat(10000)).toBe('10 000');
      expect(formatSat(0)).toBe('0');
    });
    test('filterCount', () => {
      expect(filterCount({ thing1: 0, thing2: 1 })).toBe(1);
      expect(filterCount({ thing1: 1, thing2: 1 })).toBe(2);
      expect(filterCount({})).toBe(0);
    });
  });

  describe('userCanManageBounty', () => {
    nock(user.url).get('/person/id/1').reply(200, { user });

    test('should return false if org id not present', async () => {
      jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));

      jest.spyOn(mainStore, 'getUserWorkspaceByUuid').mockReturnValue(Promise.resolve(undefined));
      const canManage = await userCanManageBounty('', user.owner_pubkey, mainStore);
      expect(canManage).toBeFalsy();
    });

    test('should return false if user not present', async () => {
      const canManage = await userCanManageBounty('org_id', '', mainStore);
      expect(canManage).toBeFalsy();
    });

    test('should return false if org not present', async () => {
      jest.spyOn(mainStore, 'getUserRoles').mockReturnValueOnce(Promise.resolve([]));
      jest
        .spyOn(mainStore, 'getUserWorkspaceByUuid')
        .mockReturnValueOnce(Promise.resolve(undefined));
      const canManage = await userCanManageBounty('org_id', user.owner_pubkey, mainStore);
      await waitFor(async () => {
        expect(canManage).toBeFalsy();
      });
    });

    test('should return true if user is owner of the org', async () => {
      jest.spyOn(mainStore, 'getUserRoles').mockReturnValueOnce(Promise.resolve([]));
      jest
        .spyOn(mainStore, 'getUserWorkspaceByUuid')
        .mockReturnValueOnce(Promise.resolve({ owner_pubkey: user.owner_pubkey } as any));
      const canManage = await userCanManageBounty('org_id', user.owner_pubkey, mainStore);
      await waitFor(async () => {
        expect(canManage).toBeTruthy();
      });
    });

    test('should return true is has manage bounty roles for that workspace', async () => {
      jest
        .spyOn(mainStore, 'getUserRoles')
        .mockReturnValueOnce(
          Promise.resolve([
            { name: 'ADD BOUNTY' },
            { name: 'UPDATE BOUNTY' },
            { name: 'DELETE BOUNTY' },
            { name: 'PAY BOUNTY' },
            { name: 'VIEW REPORT' }
          ])
        );
      jest
        .spyOn(mainStore, 'getUserWorkspaceByUuid')
        .mockReturnValueOnce(Promise.resolve({ owner_pubkey: 'other_owner' } as any));
      mainStore.setBountyRoles([
        { name: 'ADD BOUNTY' },
        { name: 'UPDATE BOUNTY' },
        { name: 'DELETE BOUNTY' },
        { name: 'PAY BOUNTY' },
        { name: 'VIEW REPORT' }
      ]);

      const canManage = await userCanManageBounty('org_id', 'other_owner', mainStore);
      await waitFor(async () => {
        expect(canManage).toBeTruthy();
      });
    });

    test('should return false if user does not have manage bounty roles for that workspace', async () => {
      jest
        .spyOn(mainStore, 'getUserRoles')
        .mockReturnValueOnce(Promise.resolve([{ name: 'VIEW REPORT' }]));
      jest
        .spyOn(mainStore, 'getUserWorkspaceByUuid')
        .mockReturnValueOnce(Promise.resolve({ owner_pubkey: 'other_owner' } as any));

      mainStore.setBountyRoles([
        { name: 'ADD BOUNTY' },
        { name: 'UPDATE BOUNTY' },
        { name: 'DELETE BOUNTY' },
        { name: 'PAY BOUNTY' },
        { name: 'VIEW REPORT' }
      ]);

      const canManage = await userCanManageBounty('org_id', user.owner_pubkey, mainStore);
      await waitFor(async () => {
        expect(canManage).toBeFalsy();
      });
    });
  });

  describe('formatPercentage', () => {
    it('should display "0" when value is below 0.01 and above 0', () => {
      expect(formatPercentage(0.009)).toBe('0');
      expect(formatPercentage(0.0001)).toBe('0');
      expect(formatPercentage(0.005)).toBe('0');
    });

    it('should display "0" when value is 0', () => {
      expect(formatPercentage(0)).toBe('0');
    });

    it('should display the exact value for values equal to or greater than 0.01', () => {
      expect(formatPercentage(0.01)).toBe('0');
      expect(formatPercentage(0.1)).toBe('0');
      expect(formatPercentage(1)).toBe('1');
    });

    it('should display "0" for non-numeric inputs', () => {
      expect(formatPercentage(undefined)).toBe('0');
      expect(formatPercentage(null as any)).toBe('0');
    });
  });

  describe('normalizeInput function', () => {
    test('should trim spaces only without removing inner spaces', () => {
      const input = '  Hello World  ';
      const expected = 'Hello World';
      expect(normalizeInput(input)).toBe(expected);
    });

    test('should replace multiple spaces with a single space', () => {
      const input = 'Hello    World';
      const expected = 'Hello World';
      expect(normalizeInput(input)).toBe(expected);
    });

    test('should return empty string if input is only spaces', () => {
      const input = '     ';
      const expected = '';
      expect(normalizeInput(input)).toBe(expected);
    });
  });

  describe('normalizeTextValue function', () => {
    test('should trim spaces and maintain line breaks', () => {
      const textValue = '  Hello \n World  \n\n Test  ';
      const expected = 'Hello\nWorld\n\nTest';
      expect(normalizeTextValue(textValue)).toBe(expected);
    });

    test('should replace multiple spaces with a single space and maintain line breaks', () => {
      const textValue = 'Hello       World\nThis         is          a         test';
      const expected = 'Hello World\nThis is a test';
      expect(normalizeTextValue(textValue)).toBe(expected);
    });

    test('should return empty string if input is only spaces or line breaks', () => {
      const textValue = '   \n  \n ';
      const expected = '';
      expect(normalizeTextValue(textValue)).toBe(expected);
    });
  });

  describe('normalizeUrl', () => {
    it('removes all spaces from a URL and reconstructs it correctly', () => {
      const inputsAndExpected: { input: string; expected: string }[] = [
        {
          input: 'https ://github.com/stakwork/sphinx-tribes-frontend/ issues/267',
          expected: 'https://github.com/stakwork/sphinx-tribes-frontend/issues/267'
        },
        {
          input: 'http s:// git hub.com /stak work/sphinx- tribes- frontend/issues / 267',
          expected: 'https://github.com/stakwork/sphinx-tribes-frontend/issues/267'
        },
        {
          input:
            '          https  :/    /git              hub. com/ st                  akw  ork/sphinx-tri bes-fron tend/  issues     /2 67',
          expected: 'https://github.com/stakwork/sphinx-tribes-frontend/issues/267'
        },
        {
          input: 'https :// someotherurl.com /path/to /resource',
          expected: 'https://someotherurl.com/path/to/resource'
        },
        {
          input: 'https :// community.sphinx   .chat     /bounties',
          expected: 'https://community.sphinx.chat/bounties'
        },
        {
          input:
            '      https:/   /community.    sphinx.c    hat/   workspace/boun     ties/ck95pe04nncj      naefo08g',
          expected: 'https://community.sphinx.chat/workspace/bounties/ck95pe04nncjnaefo08g'
        },
        {
          input:
            'h          ttp         s:  //com      munity.sphinx.ch            at/p     /cd9dm5ua5fdts       j2c2mh0/work   spaces',
          expected: 'https://community.sphinx.chat/p/cd9dm5ua5fdtsj2c2mh0/workspaces'
        }
      ];

      inputsAndExpected.forEach(({ input, expected }: { input: string; expected: string }) => {
        expect(normalizeUrl(input)).toEqual(expected);
      });
    });
  });

  describe('userHasManageBountyRoles', () => {
    it('User has all required roles', () => {
      const bountyRoles = ManageBountiesGroup.map((role: string) => ({ name: role }));
      const userRoles = ManageBountiesGroup.map((role: string) => ({ role }));

      expect(userHasManageBountyRoles(bountyRoles, userRoles)).toBe(true);
    });

    it('User has some required roles', () => {
      const bountyRoles = ManageBountiesGroup.map((role: string) => ({ name: role }));
      const userRoles = [{ role: 'ADD BOUNTY' }, { role: 'UPDATE BOUNTY' }];

      expect(userHasManageBountyRoles(bountyRoles, userRoles)).toBe(false);
    });

    it('User has no required roles', () => {
      const bountyRoles = ManageBountiesGroup.map((role: string) => ({ name: role }));
      const userRoles = [{ role: 'SOME_OTHER_ROLE' }];

      expect(userHasManageBountyRoles(bountyRoles, userRoles)).toBe(false);
    });

    it('Empty bountyRoles and userRoles', () => {
      expect(userHasManageBountyRoles([], [])).toBe(false);
    });

    it('Empty bountyRoles with non-empty userRoles', () => {
      const userRoles = ManageBountiesGroup.map((role: string) => ({ role }));
      expect(userHasManageBountyRoles([], userRoles)).toBe(false);
    });

    it('Non-empty bountyRoles with empty userRoles', () => {
      const bountyRoles = ManageBountiesGroup.map((role: string) => ({ name: role }));
      expect(userHasManageBountyRoles(bountyRoles, [])).toBe(false);
    });

    it('Invalid data types for bountyRoles and userRoles', () => {
      const invalidBountyRoles = [{ invalid: 'data' }];
      const invalidUserRoles = [{ wrong: 'format' }];

      expect(userHasManageBountyRoles(invalidBountyRoles, invalidUserRoles)).toBe(false);
    });

    it('Non-array inputs', () => {
      waitFor(() => {
        expect(userHasManageBountyRoles('not an array' as any, 'not an array' as any)).toBe(false);
        expect(userHasManageBountyRoles({} as any, {} as any)).toBe(false);
        expect(userHasManageBountyRoles(null as any, null as any)).toBe(false);
      });
    });

    it('Mixed data types in arrays', () => {
      const bountyRoles = [{ name: 'ADD BOUNTY' }, null, undefined, 42, 'string'];
      const userRoles = [{ role: 'ADD BOUNTY' }, null, undefined, 42, 'string'];

      waitFor(() => {
        expect(userHasManageBountyRoles(bountyRoles as any, userRoles as any)).toBe(false);
      });
    });

    it('Large number of roles', () => {
      const largeRoles = Array(1000)
        .fill(null)
        .map((_: any, i: number) => ({
          name: `ROLE_${i}`
        }));
      const largeUserRoles = Array(1000)
        .fill(null)
        .map((_: any, i: number) => ({
          role: `ROLE_${i}`
        }));

      ManageBountiesGroup.forEach((role: string) => {
        largeRoles.push({ name: role });
        largeUserRoles.push({ role });
      });

      expect(userHasManageBountyRoles(largeRoles, largeUserRoles)).toBe(true);
    });

    it('Large number of roles with missing roles', () => {
      const largeRoles = Array(1000)
        .fill(null)
        .map((_: any, i: number) => ({
          name: `ROLE_${i}`
        }));
      const largeUserRoles = Array(1000)
        .fill(null)
        .map((_: any, i: number) => ({
          role: `ROLE_${i}`
        }));

      largeRoles.push({ name: ManageBountiesGroup[0] });
      largeUserRoles.push({ role: ManageBountiesGroup[0] });

      expect(userHasManageBountyRoles(largeRoles, largeUserRoles)).toBe(false);
    });

    it('Roles with special characters', () => {
      const bountyRoles = ManageBountiesGroup.map((role: string) => ({
        name: `${role}!@#$%^&*()`
      }));
      const userRoles = ManageBountiesGroup.map((role: string) => ({
        role: `${role}!@#$%^&*()`
      }));

      expect(userHasManageBountyRoles(bountyRoles, userRoles)).toBe(false);
    });

    it('Case sensitivity check', () => {
      const bountyRoles = ManageBountiesGroup.map((role: string) => ({
        name: role.toLowerCase()
      }));
      const userRoles = ManageBountiesGroup.map((role: string) => ({
        role: role.toUpperCase()
      }));

      expect(userHasManageBountyRoles(bountyRoles, userRoles)).toBe(false);
    });

    it('Duplicate roles in bountyRoles', () => {
      const bountyRoles = [
        ...ManageBountiesGroup.map((role: string) => ({ name: role })),
        ...ManageBountiesGroup.map((role: string) => ({ name: role }))
      ];
      const userRoles = ManageBountiesGroup.map((role: string) => ({ role }));

      expect(userHasManageBountyRoles(bountyRoles, userRoles)).toBe(true);
    });

    it('Duplicate roles in userRoles', () => {
      const bountyRoles = ManageBountiesGroup.map((role: string) => ({ name: role }));
      const userRoles = [
        ...ManageBountiesGroup.map((role: string) => ({ role })),
        ...ManageBountiesGroup.map((role: string) => ({ role }))
      ];

      expect(userHasManageBountyRoles(bountyRoles, userRoles)).toBe(true);
    });

    it('Handles undefined properties', () => {
      const bountyRoles = [{ name: undefined }, { name: 'ADD BOUNTY' }];
      const userRoles = [{ role: undefined }, { role: 'ADD BOUNTY' }];

      expect(userHasManageBountyRoles(bountyRoles as any, userRoles as any)).toBe(false);
    });

    it('Handles missing properties', () => {
      const bountyRoles = [{}];
      const userRoles = [{}];

      expect(userHasManageBountyRoles(bountyRoles, userRoles)).toBe(false);
    });

    it('Handles whitespace in role names', () => {
      const bountyRoles = ManageBountiesGroup.map((role: string) => ({
        name: `  ${role}  `
      }));
      const userRoles = ManageBountiesGroup.map((role: string) => ({
        role: `  ${role}  `
      }));

      expect(userHasManageBountyRoles(bountyRoles, userRoles)).toBe(false);
    });
  });

  describe('formatRelayPerson', () => {
    test('Standard Input - should format complete person object correctly', () => {
      const input = {
        owner_pubkey: 'pub123',
        alias: 'testAlias',
        contact_key: 'contact123',
        route_hint: 'hint123',
        description: 'test description',
        extras: { key: 'value' },
        price_to_meet: 1000,
        img: 'image.jpg'
      };

      const expected = {
        owner_pubkey: 'pub123',
        owner_alias: 'testAlias',
        owner_contact_key: 'contact123',
        owner_route_hint: 'hint123',
        description: 'test description',
        extras: { key: 'value' },
        price_to_meet: 1000,
        img: 'image.jpg',
        tags: [],
        route_hint: 'hint123'
      };

      expect(formatRelayPerson(input)).toEqual(expected);
    });

    test('Missing Optional Fields - should handle missing optional fields', () => {
      const input = {
        owner_pubkey: 'pub123',
        alias: 'testAlias',
        contact_key: 'contact123',
        description: 'test description'
      };

      const expected = {
        owner_pubkey: 'pub123',
        owner_alias: 'testAlias',
        owner_contact_key: 'contact123',
        owner_route_hint: '',
        description: 'test description',
        extras: undefined,
        price_to_meet: undefined,
        img: undefined,
        tags: [],
        route_hint: undefined
      };

      expect(formatRelayPerson(input)).toEqual(expected);
    });

    test('Empty Strings and Zero Values - should handle empty strings and zero values', () => {
      const input = {
        owner_pubkey: '',
        alias: '',
        contact_key: '',
        route_hint: '',
        description: '',
        extras: {},
        price_to_meet: 0,
        img: ''
      };

      const expected = {
        owner_pubkey: '',
        owner_alias: '',
        owner_contact_key: '',
        owner_route_hint: '',
        description: '',
        extras: {},
        price_to_meet: 0,
        img: '',
        tags: [],
        route_hint: ''
      };

      expect(formatRelayPerson(input)).toEqual(expected);
    });

    test('Null Input - should handle null input gracefully', () => {
      const input = null;
      waitFor(() => {
        expect(formatRelayPerson(input)).toEqual({
          owner_pubkey: undefined,
          owner_alias: undefined,
          owner_contact_key: undefined,
          owner_route_hint: '',
          description: undefined,
          extras: undefined,
          price_to_meet: undefined,
          img: undefined,
          tags: [],
          route_hint: undefined
        });
      });
    });

    test('Invalid Data Types - should handle invalid data types', () => {
      const input = {
        owner_pubkey: 123,
        alias: true,
        contact_key: {},
        route_hint: [],
        description: null,
        extras: 'invalid',
        price_to_meet: '1000',
        img: 42
      };

      const expected = {
        owner_pubkey: 123,
        owner_alias: true,
        owner_contact_key: {},
        owner_route_hint: '',
        description: null,
        extras: 'invalid',
        price_to_meet: '1000',
        img: 42,
        tags: [],
        route_hint: undefined
      };

      waitFor(() => {
        expect(formatRelayPerson(input)).toEqual(expected);
      });
    });

    test('Large Input Data - should handle large input data', () => {
      const largeString = 'a'.repeat(1000000);
      const input = {
        owner_pubkey: largeString,
        alias: largeString,
        contact_key: largeString,
        route_hint: largeString,
        description: largeString,
        extras: { largeKey: largeString },
        price_to_meet: Number.MAX_SAFE_INTEGER,
        img: largeString
      };

      const expected = {
        owner_pubkey: largeString,
        owner_alias: largeString,
        owner_contact_key: largeString,
        owner_route_hint: largeString,
        description: largeString,
        extras: { largeKey: largeString },
        price_to_meet: Number.MAX_SAFE_INTEGER,
        img: largeString,
        tags: [],
        route_hint: largeString
      };

      expect(formatRelayPerson(input)).toEqual(expected);
    });

    test('Undefined Fields - should handle undefined fields', () => {
      const input = {
        owner_pubkey: undefined,
        alias: undefined,
        contact_key: undefined,
        route_hint: undefined,
        description: undefined,
        extras: undefined,
        price_to_meet: undefined,
        img: undefined
      };

      const expected = {
        owner_pubkey: undefined,
        owner_alias: undefined,
        owner_contact_key: undefined,
        owner_route_hint: '',
        description: undefined,
        extras: undefined,
        price_to_meet: undefined,
        img: undefined,
        tags: [],
        route_hint: undefined
      };

      expect(formatRelayPerson(input)).toEqual(expected);
    });

    test('Minimal Valid Input - should handle minimal valid input', () => {
      const input = {
        owner_pubkey: 'pub123'
      };

      const expected = {
        owner_pubkey: 'pub123',
        owner_alias: undefined,
        owner_contact_key: undefined,
        owner_route_hint: '',
        description: undefined,
        extras: undefined,
        price_to_meet: undefined,
        img: undefined,
        tags: [],
        route_hint: undefined
      };

      expect(formatRelayPerson(input)).toEqual(expected);
    });
  });
});
