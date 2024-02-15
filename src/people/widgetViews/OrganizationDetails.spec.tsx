import '@testing-library/jest-dom';
import { act, render, within } from '@testing-library/react';
import { person } from '__test__/__mockData__/persons';
import { user } from '__test__/__mockData__/user';
import nock from 'nock';
import React from 'react';
import { Organization, PaymentHistory, mainStore } from 'store/main';
import OrganizationDetails from './OrganizationDetails';

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

const invoiceDetails = [
    {
      "id": 740,
      "amount": 10,
      "bounty_id": 0,
      "payment_type": "withdraw",
      "org_uuid": "cn6pq4qtu2rj3nhh5kkg",
      "sender_pubkey": "029a49ce2ec0885bd5edb09dbc4e4f700529dd76a7d19baab1656da61d909304c1",
      "receiver_pubkey": "",
      "created": "2024-02-15T05:24:13.021248Z",
      "updated": "2024-02-15T05:24:13.021248Z",
      "status": true,
      "sender_name": "hitesh",
      "receiver_name": "",
      "sender_img": "https://memes.sphinx.chat/public/o6xp_Ai9IdFEKMPNYE_QDF2MPoWHWuXn0pdlNgi12Gk=",
      "receiver_img": ""
    },
    {
      "id": 739,
      "amount": 100,
      "bounty_id": 0,
      "payment_type": "deposit",
      "org_uuid": "cn6pq4qtu2rj3nhh5kkg",
      "sender_pubkey": "029a49ce2ec0885bd5edb09dbc4e4f700529dd76a7d19baab1656da61d909304c1",
      "receiver_pubkey": "",
      "created": "2024-02-15T05:22:33.451Z",
      "updated": "2024-02-15T05:22:33.451Z",
      "status": true,
      "sender_name": "hitesh",
      "receiver_name": "",
      "sender_img": "https://memes.sphinx.chat/public/o6xp_Ai9IdFEKMPNYE_QDF2MPoWHWuXn0pdlNgi12Gk=",
      "receiver_img": ""
    },
    {
      "id": 740,
      "amount": 10,
      "bounty_id": 0,
      "payment_type": "withdraw",
      "org_uuid": "cn6pq4qtu2rj3nhh5kkg",
      "sender_pubkey": "029a49ce2ec0885bd5edb09dbc4e4f700529dd76a7d19baab1656da61d909304c1",
      "receiver_pubkey": "",
      "created": "2024-02-15T05:24:13.021248Z",
      "updated": "2024-02-15T05:24:13.021248Z",
      "status": true,
      "sender_name": "hitesh",
      "receiver_name": "receiver 3",
      "sender_img": "https://memes.sphinx.chat/public/o6xp_Ai9IdFEKMPNYE_QDF2MPoWHWuXn0pdlNgi12Gk=",
      "receiver_img": ""
    },
    {
      "id": 740,
      "amount": 10,
      "bounty_id": 0,
      "payment_type": "payment",
      "org_uuid": "cn6pq4qtu2rj3nhh5kkg",
      "sender_pubkey": "029a49ce2ec0885bd5edb09dbc4e4f700529dd76a7d19baab1656da61d909304c1",
      "receiver_pubkey": "",
      "created": "2024-02-15T05:24:13.021248Z",
      "updated": "2024-02-15T05:24:13.021248Z",
      "status": true,
      "sender_name": "hitesh",
      "receiver_name": "receiver 3",
      "sender_img": "https://memes.sphinx.chat/public/o6xp_Ai9IdFEKMPNYE_QDF2MPoWHWuXn0pdlNgi12Gk=",
      "receiver_img": ""
    },
  ] as PaymentHistory[]

/**
 * @jest-environment jsdom
 */
describe('OrganizationDetails', () => {
  jest.setTimeout(20000);
  nock.disableNetConnect();
  nock(user.url).get('/person/id/1').reply(200, { user });
  nock(user.url).get('/ask').reply(200, {});

  it('Should render history button on organization page', async () => {
    jest.spyOn(mainStore, 'getPersonAssignedBounties').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'pollOrgBudgetInvoices').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'organizationInvoiceCount').mockReturnValue(Promise.resolve(0));
    jest.spyOn(mainStore, 'getOrganizationUsers').mockReturnValue(Promise.resolve([person]));
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest
      .spyOn(mainStore, 'getOrganizationBudget')
      .mockReturnValue(Promise.resolve({ total_budget: 10000 }));
    jest.spyOn(mainStore, 'getPaymentHistories').mockReturnValue(Promise.resolve(invoiceDetails));
    const closeFn = jest.fn();
    const resetOrgFn = jest.fn();
    const getOrgFn = jest.fn();
    await act(async () => {
      const { getByTestId } = render(
        <OrganizationDetails
          close={closeFn}
          getOrganizations={getOrgFn}
          org={organization}
          resetOrg={resetOrgFn}
        />
      );
      getByTestId('organization-view-transaction-history-button').click();
      getByTestId('payment-history-transaction-0');
      getByTestId('payment-history-transaction-1');
    });
  });

  it('Should open history modal on click button', async () => {
    jest.spyOn(mainStore, 'getPersonAssignedBounties').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'pollOrgBudgetInvoices').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'organizationInvoiceCount').mockReturnValue(Promise.resolve(0));
    jest.spyOn(mainStore, 'getOrganizationUsers').mockReturnValue(Promise.resolve([person]));
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest
      .spyOn(mainStore, 'getOrganizationBudget')
      .mockReturnValue(Promise.resolve({ total_budget: 10000 }));
    jest.spyOn(mainStore, 'getPaymentHistories').mockReturnValue(Promise.resolve(invoiceDetails));
    const closeFn = jest.fn();
    const resetOrgFn = jest.fn();
    const getOrgFn = jest.fn();
    await act(async () => {
      const { getByTestId } = render(
        <OrganizationDetails
          close={closeFn}
          getOrganizations={getOrgFn}
          org={organization}
          resetOrg={resetOrgFn}
        />
      );
      getByTestId('organization-view-transaction-history-button').click();
      getByTestId('payment-history-transaction-0');
      getByTestId('payment-history-modal');
    });
  });

  it('Should render correct number of transaction in history modal', async () => {
    jest.spyOn(mainStore, 'getPersonAssignedBounties').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'pollOrgBudgetInvoices').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'organizationInvoiceCount').mockReturnValue(Promise.resolve(0));
    jest.spyOn(mainStore, 'getOrganizationUsers').mockReturnValue(Promise.resolve([person]));
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest
      .spyOn(mainStore, 'getOrganizationBudget')
      .mockReturnValue(Promise.resolve({ total_budget: 10000 }));
    jest.spyOn(mainStore, 'getPaymentHistories').mockReturnValue(Promise.resolve(invoiceDetails));
    const closeFn = jest.fn();
    const resetOrgFn = jest.fn();
    const getOrgFn = jest.fn();
    await act(async () => {
      const { getByTestId } = render(
        <OrganizationDetails
          close={closeFn}
          getOrganizations={getOrgFn}
          org={organization}
          resetOrg={resetOrgFn}
        />
      );
      getByTestId('organization-view-transaction-history-button').click();
      getByTestId('payment-history-transaction-0');
      getByTestId('payment-history-transaction-1');
    });
  });

  it('Should render correct status of a transaction', async () => {
    jest.spyOn(mainStore, 'getPersonAssignedBounties').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'pollOrgBudgetInvoices').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'organizationInvoiceCount').mockReturnValue(Promise.resolve(0));
    jest.spyOn(mainStore, 'getOrganizationUsers').mockReturnValue(Promise.resolve([person]));
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest
      .spyOn(mainStore, 'getOrganizationBudget')
      .mockReturnValue(Promise.resolve({ total_budget: 10000 }));
    jest.spyOn(mainStore, 'getPaymentHistories').mockReturnValue(Promise.resolve(invoiceDetails));
    const closeFn = jest.fn();
    const resetOrgFn = jest.fn();
    const getOrgFn = jest.fn();
    await act(async () => {
      const { getByText,getByTestId } = render(
        <OrganizationDetails
          close={closeFn}
          getOrganizations={getOrgFn}
          org={organization}
          resetOrg={resetOrgFn}
        />
      );
      getByTestId('organization-view-transaction-history-button').click();

    expect(within(getByTestId('payment-history-transaction-0')).getByTestId(
        'payment-history-transaction-type'
        ).innerHTML).toBe(
          'Withdraw'
        );

      expect(within(getByTestId('payment-history-transaction-1')).getByTestId(
        'payment-history-transaction-type'
        ).innerHTML).toBe(
          'Deposit'
        );

      expect(getByText(organization.name)).toBeInTheDocument();
    });
  });

  it('Should render correct transaction amount of a transaction', async () => {
    jest.spyOn(mainStore, 'getPersonAssignedBounties').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'pollOrgBudgetInvoices').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'organizationInvoiceCount').mockReturnValue(Promise.resolve(0));
    jest.spyOn(mainStore, 'getOrganizationUsers').mockReturnValue(Promise.resolve([person]));
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest
      .spyOn(mainStore, 'getOrganizationBudget')
      .mockReturnValue(Promise.resolve({ total_budget: 10000 }));
    jest.spyOn(mainStore, 'getPaymentHistories').mockReturnValue(Promise.resolve(invoiceDetails));
    const closeFn = jest.fn();
    const resetOrgFn = jest.fn();
    const getOrgFn = jest.fn();
    await act(async () => {
      const { getByTestId } = render(
        <OrganizationDetails
          close={closeFn}
          getOrganizations={getOrgFn}
          org={organization}
          resetOrg={resetOrgFn}
        />
      );
      getByTestId('organization-view-transaction-history-button').click();

    expect(within(getByTestId('payment-history-transaction-0')).getByTestId(
        'payment-history-transaction-amount'
        ).innerHTML).toContain(
          '10 sats'
        );
        expect(within(getByTestId('payment-history-transaction-0')).getByTestId(
          'payment-history-transaction-amount'
          ).innerHTML).toContain(
            '90 sats'
          );
    });
  });

  it('Should render correct sender of a transaction', async () => {
    jest.spyOn(mainStore, 'getPersonAssignedBounties').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'pollOrgBudgetInvoices').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'organizationInvoiceCount').mockReturnValue(Promise.resolve(0));
    jest.spyOn(mainStore, 'getOrganizationUsers').mockReturnValue(Promise.resolve([person]));
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest
      .spyOn(mainStore, 'getOrganizationBudget')
      .mockReturnValue(Promise.resolve({ total_budget: 10000 }));
    jest.spyOn(mainStore, 'getPaymentHistories').mockReturnValue(Promise.resolve(invoiceDetails));
    const closeFn = jest.fn();
    const resetOrgFn = jest.fn();
    const getOrgFn = jest.fn();
    await act(async () => {
      const { getByTestId } = render(
        <OrganizationDetails
          close={closeFn}
          getOrganizations={getOrgFn}
          org={organization}
          resetOrg={resetOrgFn}
        />
      );
      getByTestId('organization-view-transaction-history-button').click();

    expect(within(getByTestId('payment-history-transaction-0')).getByTestId(
        'payment-history-transaction-sender'
        ).innerHTML).toContain(
          'Hitesh'
        );
    });
  });

  it('Should render correct receiver of a transaction', async () => {
    jest.spyOn(mainStore, 'getPersonAssignedBounties').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'pollOrgBudgetInvoices').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'organizationInvoiceCount').mockReturnValue(Promise.resolve(0));
    jest.spyOn(mainStore, 'getOrganizationUsers').mockReturnValue(Promise.resolve([person]));
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest
      .spyOn(mainStore, 'getOrganizationBudget')
      .mockReturnValue(Promise.resolve({ total_budget: 10000 }));
    jest.spyOn(mainStore, 'getPaymentHistories').mockReturnValue(Promise.resolve(invoiceDetails));
    const closeFn = jest.fn();
    const resetOrgFn = jest.fn();
    const getOrgFn = jest.fn();
    await act(async () => {
      const { getByTestId } = render(
        <OrganizationDetails
          close={closeFn}
          getOrganizations={getOrgFn}
          org={organization}
          resetOrg={resetOrgFn}
        />
      );
      getByTestId('organization-view-transaction-history-button').click();

    expect(within(getByTestId('payment-history-transaction-0')).getByTestId(
        'payment-history-transaction-receiver'
        ).innerHTML).toContain(
          'Receiver 3'
        );
    });
  });
  it.only('Should redirect to correct url on selecting a transaction', async () => {
    jest.spyOn(mainStore, 'getPersonAssignedBounties').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'pollOrgBudgetInvoices').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'organizationInvoiceCount').mockReturnValue(Promise.resolve(0));
    jest.spyOn(mainStore, 'getOrganizationUsers').mockReturnValue(Promise.resolve([person]));
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest
      .spyOn(mainStore, 'getOrganizationBudget')
      .mockReturnValue(Promise.resolve({ total_budget: 10000 }));
    jest.spyOn(mainStore, 'getPaymentHistories').mockReturnValue(Promise.resolve(invoiceDetails));
    const closeFn = jest.fn();
    const resetOrgFn = jest.fn();
    const getOrgFn = jest.fn();
    const opeWindowFn = jest.fn();
    global.open = opeWindowFn
    await act(async () => {
      const { getByTestId } = render(
        <OrganizationDetails
          close={closeFn}
          getOrganizations={getOrgFn}
          org={organization}
          resetOrg={resetOrgFn}
        />
      );
      getByTestId('organization-view-transaction-history-button').click();

    within(getByTestId('payment-history-transaction-0')).getByTestId(
        'payment-history-transaction-link'
        ).click()
        expect(opeWindowFn).toBeCalled();
  });

  it('Should render all types of filter in history modal ', async () => {
    jest.spyOn(mainStore, 'getPersonAssignedBounties').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'pollOrgBudgetInvoices').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'organizationInvoiceCount').mockReturnValue(Promise.resolve(0));
    jest.spyOn(mainStore, 'getOrganizationUsers').mockReturnValue(Promise.resolve([person]));
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest
      .spyOn(mainStore, 'getOrganizationBudget')
      .mockReturnValue(Promise.resolve({ total_budget: 10000 }));
    jest.spyOn(mainStore, 'getPaymentHistories').mockReturnValue(Promise.resolve(invoiceDetails));
    const closeFn = jest.fn();
    const resetOrgFn = jest.fn();
    const getOrgFn = jest.fn();
    await act(async () => {
      const { getByTestId } = render(
        <OrganizationDetails
          close={closeFn}
          getOrganizations={getOrgFn}
          org={organization}
          resetOrg={resetOrgFn}
        />
      );
      getByTestId('organization-view-transaction-history-button').click();
      getByTestId('payment-history-filter-type-payment');
      getByTestId('payment-history-filter-type-deposit');
      getByTestId('payment-history-filter-type-withdraw');
    });
  });
  it('Should render transaction according to the selected filter', async () => {
    jest.spyOn(mainStore, 'getPersonAssignedBounties').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'pollOrgBudgetInvoices').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'organizationInvoiceCount').mockReturnValue(Promise.resolve(0));
    jest.spyOn(mainStore, 'getOrganizationUsers').mockReturnValue(Promise.resolve([person]));
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest
      .spyOn(mainStore, 'getOrganizationBudget')
      .mockReturnValue(Promise.resolve({ total_budget: 10000 }));
    jest.spyOn(mainStore, 'getPaymentHistories').mockReturnValue(Promise.resolve(invoiceDetails));
    const closeFn = jest.fn();
    const resetOrgFn = jest.fn();
    const getOrgFn = jest.fn();
    await act(async () => {
      const { getByTestId } = render(
        <OrganizationDetails
          close={closeFn}
          getOrganizations={getOrgFn}
          org={organization}
          resetOrg={resetOrgFn}
        />
      );
      getByTestId('organization-view-transaction-history-button').click();
      within(getByTestId('payment-history-filter-type-payment')).getByLabelText('Payment').click();
      within(getByTestId('payment-history-filter-type-payment')).getByLabelText('Deposit').click();

      getByTestId('payment-history-filter-type-deposit');
      getByTestId('payment-history-filter-type-withdraw');
    });
  });
  
  it('Should open history modal on click button', async () => {
    jest.spyOn(mainStore, 'getPersonAssignedBounties').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'pollOrgBudgetInvoices').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'organizationInvoiceCount').mockReturnValue(Promise.resolve(0));
    jest.spyOn(mainStore, 'getOrganizationUsers').mockReturnValue(Promise.resolve([person]));
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest
      .spyOn(mainStore, 'getOrganizationBudget')
      .mockReturnValue(Promise.resolve({ total_budget: 10000 }));
    jest.spyOn(mainStore, 'getPaymentHistories').mockReturnValue(Promise.resolve(invoiceDetails));
    const closeFn = jest.fn();
    const resetOrgFn = jest.fn();
    const getOrgFn = jest.fn();
    await act(async () => {
      const { getByText,getByTestId } = render(
        <OrganizationDetails
          close={closeFn}
          getOrganizations={getOrgFn}
          org={organization}
          resetOrg={resetOrgFn}
        />
      );
      getByTestId('organization-view-transaction-history-button').click();
      getByTestId('payment-history-transaction-0');

    expect(within(getByTestId('payment-history-transaction-0')).getByTestId(
        'payment-history-transaction-type'
        ).innerHTML).toBe(
          'Withdraw'
        );

      getByTestId('payment-history-transaction-1');
      expect(within(getByTestId('payment-history-transaction-1')).getByTestId(
        'payment-history-transaction-type'
        ).innerHTML).toBe(
          'Deposit'
        );

      expect(getByText(organization.name)).toBeInTheDocument();
    });
  });
  

});