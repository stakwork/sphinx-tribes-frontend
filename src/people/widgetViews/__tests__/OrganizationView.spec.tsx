import '@testing-library/jest-dom';
import React from 'react';
import {
  fireEvent,
  queryAllByText,
  queryByText,
  render,
  screen,
  waitFor
} from '@testing-library/react';
import { setupStore } from '__test__/__mockData__/setupStore';
import { mockUsehistory } from '__test__/__mockFn__/useHistory';
import nock from 'nock';
import { user } from '__test__/__mockData__/user';
import { person } from '__test__/__mockData__/persons';
import { Organization } from 'store/main';
import { uiStore } from 'store/ui';
import { mainStore } from '../../../store/main';
import OrganizationView from '../OrganizationView';

beforeAll(() => {
  nock.disableNetConnect();
  setupStore();
  mockUsehistory();
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useRouteMatch: () => ({ url: '', path: '' })
}));

const organizations: Organization[] = [
  {
    bounty_count: 0,
    created: '2024-01-03T20:34:09.585609Z',
    deleted: false,
    id: '51',
    img: '',
    name: 'TEST_NEW',
    owner_pubkey: '03cbb9c01cdcf91a3ac3b543a556fbec9c4c3c2a6ed753e19f2706012a26367ae3',
    show: false,
    updated: '2024-01-03T20:34:09.585609Z',
    uuid: 'cmas9gatu2rvqiev4ur0'
  },
  {
    bounty_count: 0,
    created: '2024-01-03T20:34:09.585609Z',
    deleted: false,
    id: '52',
    img: '',
    name: 'TEST_SECOND',
    owner_pubkey: '03cbb9c01cdcf91a3ac3b543a556fbec9c4c3c2a6ed753e19f2706012a26367ae3',
    show: false,
    updated: '2024-01-03T20:34:09.585609Z',
    uuid: 'cmas9gatu2rvqiev4ur0'
  }
];

describe('OrganizationView Component', () => {
  nock(user.url).get('/person/id/1').reply(200, {});
  it('renders organization names correctly', async () => {
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'getOrganizationUser').mockReturnValue(Promise.resolve(person as any));
    mainStore.setOrganizations(organizations);

    render(<OrganizationView person={person} />);

    const organizationName = screen.getByText(organizations[0].name);
    const secondOrganization = screen.getByText(organizations[1].name);
    expect(organizationName).toBeInTheDocument();
    expect(secondOrganization).toBeInTheDocument();
  });

  it('renders view bounties button correctly', async () => {
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'getOrganizationUser').mockReturnValue(Promise.resolve(person as any));
    mainStore.setOrganizations([organizations[0]]);

    render(<OrganizationView person={person} />);

    const viewBountiesBtn = screen.getByRole('button', {
      name: 'View Bounties open_in_new_tab'
    });
    expect(viewBountiesBtn).toBeInTheDocument();
  });

  it('should not render manage bounties button if user does not have access', async () => {
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'getOrganizationUser').mockReturnValue(Promise.resolve({} as any));
    mainStore.setOrganizations([organizations[0]]);

    render(<OrganizationView person={person} />);

    const manageButton = screen.queryAllByRole('button', { name: 'Manage' });
    expect(manageButton.length).toBe(0);
  });

  it('renders manage bounties button if user is owner correctly', async () => {
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'getOrganizationUser').mockReturnValue(Promise.resolve(person as any));
    const userOrg = {
      ...organizations[0],
      owner_pubkey: person.owner_pubkey
    };
    mainStore.setOrganizations([userOrg]);

    render(<OrganizationView person={person} />);

    const manageButton = screen.getByRole('button', { name: 'Manage' });
    expect(manageButton).toBeInTheDocument();
  });

  it('test owner can view all the organizations which is a part of', async () => {
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'getOrganizationUser').mockReturnValue(Promise.resolve(person as any));
    mainStore.setOrganizations(organizations);

    render(<OrganizationView person={person} />);

    organizations.forEach((org: Organization) => {
      const organizationName = screen.getByText(org.name);
      expect(organizationName).toBeInTheDocument();
    });
  });

  it('clicking on "manage" takes me to the organization admin page in the same window', async () => {
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'getOrganizationUser').mockReturnValue(Promise.resolve(person as any));
    mainStore.setOrganizations(organizations);
    uiStore.setMeInfo({
      pubkey: person.owner_pubkey,
      owner_pubkey: person.owner_pubkey,
      photo_url: '',
      alias: 'hhh',
      img: '',
      route_hint: '',
      contact_key: 'xxxxx',
      price_to_meet: 0,
      jwt: 'yyyyy',
      tribe_jwt: '',
      url: '',
      description: 'desc',
      verification_signature: '',
      extras: {},
      isSuperAdmin: false
    });

    const { getByText, queryAllByText, queryByText } = render(<OrganizationView person={person} />);

    await waitFor(() => queryAllByText('Manage'));

    fireEvent.click(queryAllByText('Manage')[0]);

    await waitFor(() => queryByText(organizations[0].name));

    expect(getByText(organizations[0].name)).toBeInTheDocument();
  });

  it('test clicking on "View bounties" takes me to the organization overview page if there are bounties', async () => {
    const _organizations = JSON.parse(JSON.stringify(organizations));
    _organizations[0].bounty_count = 100;
    const mockWindowOpen = jest.spyOn(window, 'open').mockImplementation(jest.fn());
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'getOrganizationUser').mockReturnValue(Promise.resolve(person as any));
    mainStore.setOrganizations(_organizations);

    render(<OrganizationView person={person} />);

    const firstBtn = screen.getAllByText('View Bounties')[0];
    fireEvent.click(firstBtn);

    expect(firstBtn).not.toBeDisabled();
    expect(mockWindowOpen).toHaveBeenCalledWith(
      `/org/bounties/${_organizations[0].uuid}`,
      '_target'
    );
    mockWindowOpen.mockRestore();
  });

  it('test if there are no bounties, the "View bounties" button should be greyed and unclickable', async () => {
    const _organizations = JSON.parse(JSON.stringify(organizations));
    _organizations[0].bounty_count = 0;

    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'getOrganizationUser').mockReturnValue(Promise.resolve(person as any));
    mainStore.setOrganizations(_organizations);

    render(<OrganizationView person={person} />);

    const firstBtn = screen.getAllByText('View Bounties')[0];
    expect(firstBtn).toBeDisabled();
  });

  it('test owner can click on "add organization" and a pop-up appears to guide through the add organization flow', async () => {
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'getOrganizationUser').mockReturnValue(Promise.resolve(person as any));
    mainStore.setOrganizations(organizations);

    render(<OrganizationView person={person} />);

    fireEvent.click(screen.getByText('Add Organization'));
    expect(screen.getByText('Add New Organization')).toBeInTheDocument();
  });

  it('test if there are no organizations, the "No organization yet" image is displayed', async () => {
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'getOrganizationUser').mockReturnValue(Promise.resolve(person as any));
    mainStore.setOrganizations([]);

    const { container } = render(<OrganizationView person={person} />);

    const emptyResult = container.querySelector('div[src="/static/no_org.png"]');
    expect(emptyResult).toBeInTheDocument();
  });
});
