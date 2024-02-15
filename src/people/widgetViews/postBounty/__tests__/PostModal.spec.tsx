import '@testing-library/jest-dom';
import nock from 'nock';
import { setupStore } from '../../../../__test__/__mockData__/setupStore';
import { user } from '../../../../__test__/__mockData__/user';
import { mockUsehistory } from '../../../../__test__/__mockFn__/useHistory';
import { localStorageMock } from '../../../../__test__/__mockData__/localStorage';

beforeAll(() => {
  nock.disableNetConnect();
  setupStore();
  mockUsehistory();
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
});

describe('Post bounty modal', () => {
  nock(user.url).get('/person/id/1').reply(200, {});

  test('placeholder', () => { });
});
