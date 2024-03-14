import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter as Router } from 'react-router-dom';
import { act, render, fireEvent, waitFor } from '@testing-library/react';
import { person } from '__test__/__mockData__/persons';
import { user } from '__test__/__mockData__/user';
import nock from 'nock';
import React from 'react';
import { Organization, mainStore } from 'store/main';
import OrganizationDetails from '../OrganizationDetails';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useRouteMatch: () => ({ url: '', path: '' })
}));

const organization: Organization = {
  id: 'clrqpq84nncuuf32kh2g',
  name: 'test organization',
  description: 'test',
  github: 'https://github.com/stakwork',
  website: 'https://community.sphinx.chat',
  show: true,
  uuid: 'c360e930-f94d-4c07-9980-69fc428a994e',
  bounty_count: 1,
  budget: 100000,
  owner_pubkey: 'clrqpq84nncuuf32kh2g',
  img: 'https://memes.sphinx.chat/public/3bt5n-7mGLgC6jGBBwKwLyZdJY6IUVZke8p2nLUsPhU=',
  created: '2023-12-12T00:44:25.83042Z',
  updated: '2023-12-12T01:12:39.970648Z',
  deleted: false
};

/**
 * @jest-environment jsdom
 */
describe('OrganizationDetails', () => {
  jest.setTimeout(20000);
  //nock.disableNetConnect();
  nock(user.url).get('/person/id/1').reply(200, { user });
  nock(user.url).get('/ask').reply(200, {});

  it('Add User button shows Add User modal', async () => {
    const props: {
      close: jest.Mock;
      org: Organization | undefined;
      resetOrg: jest.Mock;
      getOrganizations: jest.Mock;
      openAddUserModal: jest.Mock;
    } = {
      close: jest.fn(),
      org: {
        id: '51',
        name: 'TEST_NEW',
        owner_pubkey: '03cbb9c01cdcf91a3ac3b543a556fbec9c4c3c2a6ed753e19f2706012a26367ae3',
        uuid: 'cmas9gatu2rvqiev4ur0',
        created: '2024-01-03T20:34:09.585609Z',
        updated: '2024-01-03T20:34:09.585609Z',
        deleted: false,
        description: '',
        github: '',
        img: '',
        website: '',
        show: false
      },
      resetOrg: jest.fn(),
      getOrganizations: jest.fn(),
      openAddUserModal: jest.fn()
    };

    const spyOpenAddUserModal = jest.spyOn(props, 'openAddUserModal');

    const { getByText } = render(
      <Router>
        <OrganizationDetails {...props} />
      </Router>
    );

    (async () => {
      await waitFor(() => {
        const addUserButton = getByText('Add User');
        expect(addUserButton).toBeInTheDocument();
        fireEvent.click(addUserButton);
        expect(spyOpenAddUserModal).toHaveBeenCalledTimes(1);
      });
    })();
  });
  it('render organization name', async () => {
    jest.spyOn(mainStore, 'getPersonAssignedBounties').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'pollOrgBudgetInvoices').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'organizationInvoiceCount').mockReturnValue(Promise.resolve(0));
    jest.spyOn(mainStore, 'getOrganizationUsers').mockReturnValue(Promise.resolve([person]));
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest
      .spyOn(mainStore, 'getOrganizationBudget')
      .mockReturnValue(Promise.resolve({ total_budget: 10000 }));
    jest.spyOn(mainStore, 'getPaymentHistories').mockReturnValue(Promise.resolve([]));
    const closeFn = jest.fn();
    const resetOrgFn = jest.fn();
    const getOrgFn = jest.fn();
    await act(async () => {
      const { getByText } = render(
        <OrganizationDetails
          close={closeFn}
          getOrganizations={getOrgFn}
          org={organization}
          resetOrg={resetOrgFn}
        />
      );

      expect(getByText(organization.name)).toBeInTheDocument();
    });
  });

  it('render Deposit, withdraw, edit, view bounties and history buttons', async () => {
    mainStore.setBountyRoles([
      { name: 'EDIT ORGANIZATION' },
      { name: 'VIEW REPORT' },
      { name: 'ADD BUDGET' },
      { name: 'WITHDRAW BUDGET' }
    ]);
    jest.spyOn(mainStore, 'getPersonAssignedBounties').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'pollOrgBudgetInvoices').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'organizationInvoiceCount').mockReturnValue(Promise.resolve(0));
    jest.spyOn(mainStore, 'getOrganizationUsers').mockReturnValue(Promise.resolve([person]));
    jest
      .spyOn(mainStore, 'getUserRoles')
      .mockReturnValue(
        Promise.resolve([
          { name: 'EDIT ORGANIZATION' },
          { name: 'VIEW REPORT' },
          { name: 'ADD BUDGET' },
          { name: 'WITHDRAW BUDGET' }
        ])
      );
    jest
      .spyOn(mainStore, 'getOrganizationBudget')
      .mockReturnValue(Promise.resolve({ total_budget: 10000 }));
    jest.spyOn(mainStore, 'getPaymentHistories').mockReturnValue(Promise.resolve([]));
    const closeFn = jest.fn();
    const resetOrgFn = jest.fn();
    const getOrgFn = jest.fn();
    await act(async () => {
      const { getByRole } = render(
        <OrganizationDetails
          close={closeFn}
          getOrganizations={getOrgFn}
          org={organization}
          resetOrg={resetOrgFn}
        />
      );

      const depositBtn = getByRole('button', { name: 'Deposit' });
      const withdrawBtn = getByRole('button', { name: 'Withdraw' });
      const historyBtn = getByRole('button', { name: 'History' });
      const editBtn = getByRole('button', { name: 'Edit' });
      const bountiesBtn = getByRole('button', { name: 'View Bounties open_in_new' });
      expect(depositBtn).toBeInTheDocument();
      expect(withdrawBtn).toBeInTheDocument();
      expect(historyBtn).toBeInTheDocument();
      expect(editBtn).toBeInTheDocument();
      expect(bountiesBtn).toBeInTheDocument();
    });
  });

  it('should disable edit and add user button if user is not admin', async () => {
    jest.spyOn(mainStore, 'getPersonAssignedBounties').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'pollOrgBudgetInvoices').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'organizationInvoiceCount').mockReturnValue(Promise.resolve(0));
    jest.spyOn(mainStore, 'getOrganizationUsers').mockReturnValue(Promise.resolve([person]));
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest
      .spyOn(mainStore, 'getOrganizationBudget')
      .mockReturnValue(Promise.resolve({ total_budget: 10000 }));
    jest.spyOn(mainStore, 'getPaymentHistories').mockReturnValue(Promise.resolve([]));
    const closeFn = jest.fn();
    const resetOrgFn = jest.fn();
    const getOrgFn = jest.fn();
    await act(async () => {
      const { getByRole } = render(
        <OrganizationDetails
          close={closeFn}
          getOrganizations={getOrgFn}
          org={organization}
          resetOrg={resetOrgFn}
        />
      );

      const editBtn = getByRole('button', { name: 'Edit' });
      const addUsersBtn = getByRole('button', { name: 'Add User' });

      expect(editBtn).toBeDisabled();
      expect(addUsersBtn).toBeDisabled();
    });
  });

  it('should disable view bounties button if organization doesnt have any bounty', async () => {
    jest.spyOn(mainStore, 'getPersonAssignedBounties').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'pollOrgBudgetInvoices').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'organizationInvoiceCount').mockReturnValue(Promise.resolve(0));
    jest.spyOn(mainStore, 'getOrganizationUsers').mockReturnValue(Promise.resolve([person]));
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest
      .spyOn(mainStore, 'getOrganizationBudget')
      .mockReturnValue(Promise.resolve({ total_budget: 10000 }));
    jest.spyOn(mainStore, 'getPaymentHistories').mockReturnValue(Promise.resolve([]));
    const closeFn = jest.fn();
    const resetOrgFn = jest.fn();
    const getOrgFn = jest.fn();
    await act(async () => {
      const { getByRole } = render(
        <OrganizationDetails
          close={closeFn}
          getOrganizations={getOrgFn}
          org={{ ...organization, bounty_count: 0 }}
          resetOrg={resetOrgFn}
        />
      );

      const viewBountiesBtn = getByRole('button', { name: 'View Bounties open_in_new' });

      expect(viewBountiesBtn).toBeDisabled();
    });
  });

  it('should disable history and withdraw button if user is not admin', async () => {
    mainStore.setBountyRoles([
      { name: 'EDIT ORGANIZATION' },
      { name: 'VIEW REPORT' },
      { name: 'ADD BUDGET' },
      { name: 'WITHDRAW BUDGET' }
    ]);
    jest.spyOn(mainStore, 'getPersonAssignedBounties').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'pollOrgBudgetInvoices').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'organizationInvoiceCount').mockReturnValue(Promise.resolve(0));
    jest.spyOn(mainStore, 'getOrganizationUsers').mockReturnValue(Promise.resolve([person]));
    jest
      .spyOn(mainStore, 'getUserRoles')
      .mockReturnValue(Promise.resolve([{ name: 'EDIT ORGANIZATION' }, { name: 'ADD BUDGET' }]));
    jest
      .spyOn(mainStore, 'getOrganizationBudget')
      .mockReturnValue(Promise.resolve({ total_budget: 10000 }));
    jest.spyOn(mainStore, 'getPaymentHistories').mockReturnValue(Promise.resolve([]));
    const closeFn = jest.fn();
    const resetOrgFn = jest.fn();
    const getOrgFn = jest.fn();
    await act(async () => {
      const { getByRole } = render(
        <OrganizationDetails
          close={closeFn}
          getOrganizations={getOrgFn}
          org={organization}
          resetOrg={resetOrgFn}
        />
      );

      const withdrawBtn = getByRole('button', { name: 'Withdraw' });
      const historyBtn = getByRole('button', { name: 'History' });

      expect(withdrawBtn).toBeDisabled();
      expect(historyBtn).toBeDisabled();
    });
  });
});
