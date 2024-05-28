import '@testing-library/jest-dom';
import { act, render, waitFor, within, screen, fireEvent } from '@testing-library/react';
import { people, person } from '__test__/__mockData__/persons';
import { user } from '__test__/__mockData__/user';
import nock from 'nock';
import React from 'react';
import { Workspace, PaymentHistory } from 'store/interface';
import { mainStore } from 'store/main';
import { uiStore } from 'store/ui';
import * as LighningDecoder from 'light-bolt11-decoder';
import { BrowserRouter as Router, MemoryRouter } from 'react-router-dom';
import WorkspaceDetails from '../WorkspaceDetails';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useRouteMatch: () => ({ url: '', path: '' })
}));

jest.mock('light-bolt11-decoder', () => ({
  ...jest.requireActual('light-bolt11-decoder'),
  decode: jest.fn()
}));

const workspace: Workspace = {
  id: 'clrqpq84nncuuf32kh2g',
  name: 'test workspace',
  description: 'test',
  github: 'https://github.com/stakwork',
  website: 'https://community.sphinx.chat',
  show: true,
  uuid: 'c360e930-f94d-4c07-9980-69fc428a994e',
  bounty_count: 1,
  budget: 100000,
  owner_pubkey: user.pubkey!,
  img: 'https://memes.sphinx.chat/public/3bt5n-7mGLgC6jGBBwKwLyZdJY6IUVZke8p2nLUsPhU=',
  created: '2023-12-12T00:44:25.83042Z',
  updated: '2023-12-12T01:12:39.970648Z',
  deleted: false
};

const orgUser: Workspace = {
  id: 'clrqpq84nncuuf32kh2g',
  name: 'test workspace',
  description: 'test',
  github: 'https://github.com/stakwork',
  website: 'https://community.sphinx.chat',
  show: true,
  uuid: 'clu80datu2rjujsmim40',
  bounty_count: 1,
  budget: 10000,
  owner_pubkey: user.pubkey!,
  img: 'https://memes.sphinx.chat/public/3bt5n-7mGLgC6jGBBwKwLyZdJY6IUVZke8p2nLUsPhU=',
  created: '2023-12-12T00:44:25.83042Z',
  updated: '2023-12-12T01:12:39.970648Z',
  deleted: false
};

const roles = [
  {
    name: 'VIEW REPORT'
  }
];

const invoiceDetails = [
  {
    id: 1,
    amount: 10,
    bounty_id: 0,
    payment_type: 'withdraw',
    org_uuid: 'cn6pq4qtu2rj3nhh5kkg',
    sender_pubkey: '029a49ce2ec0885bd5edb09dbc4e4f700529dd76a7d19baab1656da61d909304c1',
    receiver_pubkey: '',
    created: '2024-02-15T05:24:13.021248Z',
    updated: '2024-02-15T05:24:13.021248Z',
    status: true,
    sender_name: 'test sender 1',
    receiver_name: '',
    sender_img: 'https://memes.sphinx.chat/public/o6xp_Ai9IdFEKMPNYE_QDF2MPoWHWuXn0pdlNgi12Gk=',
    receiver_img: ''
  },
  {
    id: 2,
    amount: 100,
    bounty_id: 0,
    payment_type: 'deposit',
    org_uuid: 'cn6pq4qtu2rj3nhh5kkg',
    sender_pubkey: '029a49ce2ec0885bd5edb09dbc4e4f700529dd76a7d19baab1656da61d909304c1',
    receiver_pubkey: '',
    created: '2024-02-15T05:22:33.451Z',
    updated: '2024-02-15T05:22:33.451Z',
    status: true,
    sender_name: 'test sender 2',
    receiver_name: '',
    sender_img: 'https://memes.sphinx.chat/public/o6xp_Ai9IdFEKMPNYE_QDF2MPoWHWuXn0pdlNgi12Gk=',
    receiver_img: ''
  },
  {
    id: 3,
    amount: 10,
    bounty_id: 0,
    payment_type: 'withdraw',
    org_uuid: 'cn6pq4qtu2rj3nhh5kkg',
    sender_pubkey: '029a49ce2ec0885bd5edb09dbc4e4f700529dd76a7d19baab1656da61d909304c1',
    receiver_pubkey: '',
    created: '2024-02-15T05:24:13.021248Z',
    updated: '2024-02-15T05:24:13.021248Z',
    status: true,
    sender_name: 'test sender 3',
    receiver_name: 'receiver 3',
    sender_img: 'https://memes.sphinx.chat/public/o6xp_Ai9IdFEKMPNYE_QDF2MPoWHWuXn0pdlNgi12Gk=',
    receiver_img: ''
  },
  {
    id: 4,
    amount: 10,
    bounty_id: 0,
    payment_type: 'payment',
    workspace_uuid: 'cn6pq4qtu2rj3nhh5kkg',
    sender_pubkey: '029a49ce2ec0885bd5edb09dbc4e4f700529dd76a7d19baab1656da61d909304c1',
    receiver_pubkey: '',
    created: '2024-02-15T05:24:13.021248Z',
    updated: '2024-02-15T05:24:13.021248Z',
    status: true,
    sender_name: 'test sender 4',
    receiver_name: 'receiver 4',
    sender_img: 'https://memes.sphinx.chat/public/o6xp_Ai9IdFEKMPNYE_QDF2MPoWHWuXn0pdlNgi12Gk=',
    receiver_img: ''
  }
] as PaymentHistory[];

let closeFn;
let resetWorkspaceFn;
let getWorkspaceFn;

beforeEach(() => {
  jest.spyOn(mainStore, 'getPersonAssignedBounties').mockReturnValue(Promise.resolve([]));
  jest.spyOn(mainStore, 'pollWorkspaceBudgetInvoices').mockReturnValue(Promise.resolve([]));
  jest.spyOn(mainStore, 'workspaceInvoiceCount').mockReturnValue(Promise.resolve(0));
  jest.spyOn(mainStore, 'getWorkspaceUsers').mockReturnValue(Promise.resolve(people));
  jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve(roles));
  mainStore.bountyRoles = roles;
  uiStore.setMeInfo(user);
  jest
    .spyOn(mainStore, 'getWorkspaceBudget')
    .mockReturnValue(Promise.resolve({ total_budget: 10000 }));
  jest.spyOn(mainStore, 'getPaymentHistories').mockReturnValue(Promise.resolve(invoiceDetails));
  resetWorkspaceFn = jest.fn();
  closeFn = jest.fn();
  getWorkspaceFn = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});
describe('WorkspaceDetails', () => {
  jest.setTimeout(20000);
  nock.disableNetConnect();
  nock(user.url).get('/person/id/1').reply(200, { user });
  nock(user.url).get('/ask').reply(200, {});

  it('Should render history button on workspace page', async () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <WorkspaceDetails
          close={closeFn}
          getWorkspaces={getWorkspaceFn}
          org={workspace}
          resetWorkspace={resetWorkspaceFn}
        />
      </MemoryRouter>
    );
    expect(getByTestId('workspace-view-transaction-history-button')).toBeInTheDocument();
  });

  it('Should open history modal on click button', () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <WorkspaceDetails
          close={closeFn}
          getWorkspaces={getWorkspaceFn}
          org={workspace}
          resetWorkspace={resetWorkspaceFn}
        />
      </MemoryRouter>
    );

    fireEvent.click(getByTestId('workspace-view-transaction-history-button'));
    const modal = getByTestId('payment-history-modal');
    expect(modal).toBeInTheDocument();
  });

  it('Should render correct number of transaction in history modal', async () => {
    await act(async () => {
      const { getByTestId } = render(
        <MemoryRouter>
          <WorkspaceDetails
            close={closeFn}
            getWorkspaces={getWorkspaceFn}
            org={workspace}
            resetWorkspace={resetWorkspaceFn}
          />
        </MemoryRouter>
      );
      fireEvent.click(getByTestId('workspace-view-transaction-history-button'));
      waitFor(() => {
        const modal = getByTestId('payment-history-modal');
        expect(modal).toBeInTheDocument();
      });
      for (let i = 0; i < invoiceDetails.length; i++) {
        waitFor(() => {
          getByTestId(`payment-history-transaction-${i}`);
        });
      }
    });
  });

  it('Should render correct status of a transaction', async () => {
    await act(async () => {
      const { getByTestId } = render(
        <MemoryRouter>
          <WorkspaceDetails
            close={closeFn}
            getWorkspaces={getWorkspaceFn}
            org={workspace}
            resetWorkspace={resetWorkspaceFn}
          />
        </MemoryRouter>
      );
      getByTestId('workspace-view-transaction-history-button').click();
      await waitFor(async () => getByTestId('payment-history-modal'));
      await waitFor(async () => getByTestId(`payment-history-transaction-0`));
      expect(
        within(getByTestId('payment-history-transaction-0')).getByTestId(
          'payment-history-transaction-type'
        ).innerHTML
      ).toBe('withdraw');

      expect(
        within(getByTestId('payment-history-transaction-1')).getByTestId(
          'payment-history-transaction-type'
        ).innerHTML
      ).toBe('deposit');
      expect(
        within(getByTestId('payment-history-transaction-3')).getByTestId(
          'payment-history-transaction-type'
        ).innerHTML
      ).toBe('payment');
    });
  });

  it('Should render correct transaction amount of a transaction', async () => {
    await act(async () => {
      const { getByTestId } = render(
        <MemoryRouter>
          <WorkspaceDetails
            close={closeFn}
            getWorkspaces={getWorkspaceFn}
            org={workspace}
            resetWorkspace={resetWorkspaceFn}
          />
        </MemoryRouter>
      );
      getByTestId('workspace-view-transaction-history-button').click();
      await waitFor(() => getByTestId('payment-history-modal'));
      await waitFor(() => getByTestId(`payment-history-transaction-0`));

      expect(
        within(getByTestId('payment-history-transaction-0')).getByTestId(
          'payment-history-transaction-amount'
        )
      ).toHaveTextContent(`${invoiceDetails[0].amount} sats`);
      expect(
        within(getByTestId('payment-history-transaction-1')).getByTestId(
          'payment-history-transaction-amount'
        )
      ).toHaveTextContent(`${invoiceDetails[1].amount} sats`);
    });
  });

  it('Should render correct sender of a transaction', async () => {
    await act(async () => {
      const { getByTestId } = render(
        <MemoryRouter>
          <WorkspaceDetails
            close={closeFn}
            getWorkspaces={getWorkspaceFn}
            org={workspace}
            resetWorkspace={resetWorkspaceFn}
          />
        </MemoryRouter>
      );
      getByTestId('workspace-view-transaction-history-button').click();
      await waitFor(() => getByTestId('payment-history-modal'));
      await waitFor(() => getByTestId(`payment-history-transaction-0`));

      expect(
        within(getByTestId('payment-history-transaction-0')).getByTestId(
          'payment-history-transaction-sender'
        ).innerHTML
      ).toContain(invoiceDetails[0].sender_name);
    });
  });

  it('Should render correct receiver of a transaction', async () => {
    await act(async () => {
      const { getByTestId } = render(
        <MemoryRouter>
          <WorkspaceDetails
            close={closeFn}
            getWorkspaces={getWorkspaceFn}
            org={workspace}
            resetWorkspace={resetWorkspaceFn}
          />
        </MemoryRouter>
      );
      getByTestId('workspace-view-transaction-history-button').click();
      await waitFor(() => getByTestId('payment-history-modal'));
      expect(
        within(getByTestId('payment-history-transaction-3')).getByTestId(
          'payment-history-transaction-receiver'
        ).innerHTML
      ).toContain(invoiceDetails[3].receiver_name);
    });
  });

  it('Should redirect to correct url on selecting a transaction', async () => {
    const opeWindowFn = jest.fn();
    global.open = opeWindowFn;
    await act(async () => {
      const { getByTestId } = render(
        <MemoryRouter>
          <WorkspaceDetails
            close={closeFn}
            getWorkspaces={getWorkspaceFn}
            org={workspace}
            resetWorkspace={resetWorkspaceFn}
          />
        </MemoryRouter>
      );
      getByTestId('workspace-view-transaction-history-button').click();
      await waitFor(() => getByTestId('payment-history-modal'));
      within(getByTestId('payment-history-transaction-3'))
        .getByTestId('payment-history-transaction-link')
        .click();
      expect(opeWindowFn).toBeCalledWith(`/bounty/${invoiceDetails[3].bounty_id}`, '_blank');
    });
  });

  it('Should render all types of filter in history modal ', async () => {
    await act(async () => {
      const { getByTestId } = render(
        <MemoryRouter>
          <WorkspaceDetails
            close={closeFn}
            getWorkspaces={getWorkspaceFn}
            org={workspace}
            resetWorkspace={resetWorkspaceFn}
          />
        </MemoryRouter>
      );
      getByTestId('workspace-view-transaction-history-button').click();
      await waitFor(() => getByTestId('payment-history-modal'));
      getByTestId('payment-history-filter-type-payment');
      getByTestId('payment-history-filter-type-deposit');
      getByTestId('payment-history-filter-type-withdraw');
    });
  });

  it('Should render transaction according to the selected filter', async () => {
    await act(async () => {
      const { getByTestId } = render(
        <MemoryRouter>
          <WorkspaceDetails
            close={closeFn}
            getWorkspaces={getWorkspaceFn}
            org={workspace}
            resetWorkspace={resetWorkspaceFn}
          />
        </MemoryRouter>
      );
      getByTestId('workspace-view-transaction-history-button').click();
      await waitFor(() => getByTestId('payment-history-modal'));
      within(getByTestId('payment-history-filter-type-payment')).getByLabelText('Payments').click();
      within(getByTestId('payment-history-filter-type-deposit')).getByLabelText('Deposit').click();

      getByTestId('payment-history-filter-type-deposit');
      getByTestId('payment-history-filter-type-withdraw');
    });
  });

  it('Should renders settings and delete buttons', async () => {
    render(
      <MemoryRouter>
        <WorkspaceDetails
          close={closeFn}
          getWorkspaces={getWorkspaceFn}
          org={orgUser}
          resetWorkspace={resetWorkspaceFn}
        />
      </MemoryRouter>
    );
    waitFor(async () => {
      const settingButton = await screen.findByTestId('settings-icon');
      expect(settingButton).toBeInTheDocument();

      const deleteButton = await screen.findByTestId('delete-icon');
      expect(deleteButton).toBeInTheDocument();
    });
  });

  it('Should renders manage org, manage bounties, fund org, withdraw from org, view txn history, update members, user profile of member, close modal "X" button, and update roles button', async () => {
    act(async () => {
      render(
        <MemoryRouter>
          <WorkspaceDetails
            close={closeFn}
            getWorkspaces={getWorkspaceFn}
            org={orgUser}
            resetWorkspace={resetWorkspaceFn}
          />
        </MemoryRouter>
      );
      await waitFor(async () => {
        // Test for Edit View Button
        const editButton = await screen.findByTestId('edit-button');
        expect(editButton).toBeInTheDocument();

        // Test for Manage Bounties View Button
        const viewBounty = await screen.findByTestId('view-bounties');
        expect(viewBounty).toBeInTheDocument();

        // Test for Transaction History View Button
        const HistoryButton = await screen.findByTestId('history-button');
        expect(HistoryButton).toBeInTheDocument();

        // Test for Withdrawal Button
        const withdrawButton = await screen.findByTestId('withdrawal-button');
        expect(withdrawButton).toBeInTheDocument();

        // Test for Deposit Button
        const depositButton = await screen.findByTestId('deposit-button');
        expect(depositButton).toBeInTheDocument();

        // Verify Transaction History Text is Present
        const txnHistory = await screen.getByText(/CURRENT BUDGET/i);
        expect(txnHistory).toBeInTheDocument();

        // Verify Budget Display
        const Budget = await screen.getByText(/10,000/i);
        expect(Budget).toBeInTheDocument();

        // Test for Adding a User Button
        const addUserButton = await screen.findByTestId('add-user');
        expect(addUserButton).toBeInTheDocument();

        // Verify User Profile Display
        const imageIcon = await screen.findByTestId('avatarIcon');
        expect(imageIcon).toBeInTheDocument();

        const name = await screen.findByTestId('user_alias');
        expect(name).toBeInTheDocument();

        const userPubkey = await screen.findByTestId('user_pubkey');
        expect(userPubkey).toBeInTheDocument();

        // Test for Opening Settings
        const settingButton = await screen.findByTestId('settings-icon');
        fireEvent.click(settingButton);

        // Test for Updating Roles Button
        const updateRoleButton = await screen.findByRole('button', { name: /Updates roles/i });
        expect(updateRoleButton).toBeInTheDocument();

        // Test for Closing Modal
        const closeButton = await screen.findByTestId('close-btn');
        expect(closeButton).toBeInTheDocument();
      });
    });
  });

  it('Allows selecting and deselecting user roles', async () => {
    act(async () => {
      render(
        <MemoryRouter>
          <WorkspaceDetails
            close={closeFn}
            getWorkspaces={getWorkspaceFn}
            org={orgUser}
            resetWorkspace={resetWorkspaceFn}
          />
        </MemoryRouter>
      );

      await waitFor(async () => {
        const settingButton = await screen.findByTestId('settings-icon');
        fireEvent.click(settingButton);

        // Verify the roles section is present
        const rolePresent = await screen.getByText(/User Roles/i);
        expect(rolePresent).toBeInTheDocument();

        // Find and interact with a specific role checkbox
        const roleCheckbox = await screen.findByLabelText('Manage bounties');
        expect(roleCheckbox).not.toBeChecked();

        // Select the role
        fireEvent.click(roleCheckbox);
        expect(roleCheckbox).toBeChecked();

        // Deselect the role
        fireEvent.click(roleCheckbox);
        expect(roleCheckbox).not.toBeChecked();
      });
    });
  });

  it('Saves roles and shows a success notification upon clicking "update roles"', async () => {
    act(async () => {
      const addToast = jest.fn();
      render(
        <MemoryRouter>
          <WorkspaceDetails
            close={closeFn}
            getWorkspaces={getWorkspaceFn}
            org={orgUser}
            resetWorkspace={resetWorkspaceFn}
          />
        </MemoryRouter>
      );

      await waitFor(async () => {
        const updateRoleButton = await screen.findByRole('button', { name: /Updates roles/i });
        fireEvent.click(updateRoleButton);

        expect(addToast).toHaveBeenCalledWith('Roles Updated Successfully', 'success');
      });
    });
  });

  it('Delete user and shows a success notification upon clicking "Delete Button"', async () => {
    act(async () => {
      const addToast = jest.fn();
      render(
        <MemoryRouter>
          <WorkspaceDetails
            close={closeFn}
            getWorkspaces={getWorkspaceFn}
            org={orgUser}
            resetWorkspace={resetWorkspaceFn}
          />
        </MemoryRouter>
      );

      await waitFor(async () => {
        const updateRoleButton = await screen.findByRole('button', { name: /Delete/i });
        fireEvent.click(updateRoleButton);

        expect(addToast).toHaveBeenCalledWith('User deleted successfully', 'success');
      });
    });
  });

  it('Test that withdraw modal is rendered', async () => {
    await act(async () => {
      const { getByTestId } = render(
        <MemoryRouter>
          <WorkspaceDetails
            close={closeFn}
            getWorkspaces={getWorkspaceFn}
            org={workspace}
            resetWorkspace={resetWorkspaceFn}
          />
        </MemoryRouter>
      );

      const withdrawBtn = getByTestId('workspace-withdraw-budget-button');
      expect(withdrawBtn).toBeInTheDocument();

      fireEvent.click(withdrawBtn);

      await waitFor(() => {
        const modal = getByTestId('testid-modal');
        expect(modal).toBeInTheDocument();

        expect(within(modal).getByText('Withdraw')).toBeInTheDocument();
        expect(within(modal).getByText('Paste your invoice')).toBeInTheDocument();
        expect(within(modal).getByTestId('withdrawInvoiceInput')).toBeInTheDocument();
      });
    });
  });

  it('Test that user is able to post an invoice and can pays the invoice correctly', async () => {
    const mockedDecode = LighningDecoder.decode as jest.MockedFunction<
      typeof LighningDecoder.decode
    >;
    mockedDecode.mockReturnValue({
      sections: [{ value: 1 }, { value: 2 }, { value: 1000000 }]
    });

    jest.spyOn(mainStore, 'withdrawBountyBudget').mockResolvedValue({
      success: true,
      response: {
        success: true,
        response: {
          payment_request: ''
        }
      }
    });

    await act(async () => {
      const { getByTestId } = render(
        <MemoryRouter>
          <WorkspaceDetails
            close={closeFn}
            getWorkspaces={getWorkspaceFn}
            org={workspace}
            resetWorkspace={resetWorkspaceFn}
          />
        </MemoryRouter>
      );

      const withdrawBtn = getByTestId('workspace-withdraw-budget-button');
      expect(withdrawBtn).toBeInTheDocument();

      fireEvent.click(withdrawBtn);

      const modal = await waitFor(() => getByTestId('testid-modal'));

      await waitFor(() => {
        const invoice =
          'lnbc20u1p3y0x3hpp5743k2g0fsqqxj7n8qzuhns5gmkk4djeejk3wkp64ppevgekvc0jsdqcve5kzar2v9nr5gpqd4hkuetesp5ez2g297jduwc20t6lmqlsg3man0vf2jfd8ar9fh8fhn2g8yttfkqxqy9gcqcqzys9qrsgqrzjqtx3k77yrrav9hye7zar2rtqlfkytl094dsp0ms5majzth6gt7ca6uhdkxl983uywgqqqqlgqqqvx5qqjqrzjqd98kxkpyw0l9tyy8r8q57k7zpy9zjmh6sez752wj6gcumqnj3yxzhdsmg6qq56utgqqqqqqqqqqqeqqjq7jd56882gtxhrjm03c93aacyfy306m4fq0tskf83c0nmet8zc2lxyyg3saz8x6vwcp26xnrlagf9semau3qm2glysp7sv95693fphvsp54l567';

        expect(modal).toBeInTheDocument();

        //  Test that user is able to post an invoice
        fireEvent.change(within(modal).getByTestId('withdrawInvoiceInput'), {
          target: { value: invoice }
        });
      });

      await waitFor(() => {
        const confirmBtn = within(modal).getByText('Confirm');

        // Test invoice is correct
        expect(confirmBtn).not.toBeDisabled();
        fireEvent.click(confirmBtn);
      });

      await waitFor(() => {
        expect(within(modal).getByText('You are about to withdraw')).toBeInTheDocument();
        expect(within(modal).getByTestId('WithdrawAmount')).toHaveTextContent('1,000 SATS');
      });

      //  Test that confirm pays the invoice
      const confirmPayBtn = within(modal).getByText('Withdraw');
      expect(confirmPayBtn).not.toBeDisabled();
      fireEvent.click(confirmPayBtn);

      await waitFor(() => {
        expect(within(modal).getByText('Successfully Withdraw')).toBeInTheDocument();
      });
    });
  });

  it('Test that error message appears if insufficient funds to withdraw', async () => {
    const mockedDecode = LighningDecoder.decode as jest.MockedFunction<
      typeof LighningDecoder.decode
    >;
    mockedDecode.mockReturnValue({
      sections: [{ value: 1 }, { value: 2 }, { value: 1000000 }]
    });

    jest.spyOn(mainStore, 'withdrawBountyBudget').mockResolvedValue({
      success: false,
      error: 'Workspace budget is not enough to withdraw the amount'
    });

    await act(async () => {
      const { getByTestId } = render(
        <MemoryRouter>
          <WorkspaceDetails
            close={closeFn}
            getWorkspaces={getWorkspaceFn}
            org={workspace}
            resetWorkspace={resetWorkspaceFn}
          />
        </MemoryRouter>
      );

      const withdrawBtn = getByTestId('workspace-withdraw-budget-button');
      expect(withdrawBtn).toBeInTheDocument();

      fireEvent.click(withdrawBtn);

      const modal = await waitFor(() => getByTestId('testid-modal'));

      const invoice =
        'lnbc20u1p3y0x3hpp5743k2g0fsqqxj7n8qzuhns5gmkk4djeejk3wkp64ppevgekvc0jsdqcve5kzar2v9nr5gpqd4hkuetesp5ez2g297jduwc20t6lmqlsg3man0vf2jfd8ar9fh8fhn2g8yttfkqxqy9gcqcqzys9qrsgqrzjqtx3k77yrrav9hye7zar2rtqlfkytl094dsp0ms5majzth6gt7ca6uhdkxl983uywgqqqqlgqqqvx5qqjqrzjqd98kxkpyw0l9tyy8r8q57k7zpy9zjmh6sez752wj6gcumqnj3yxzhdsmg6qq56utgqqqqqqqqqqqeqqjq7jd56882gtxhrjm03c93aacyfy306m4fq0tskf83c0nmet8zc2lxyyg3saz8x6vwcp26xnrlagf9semau3qm2glysp7sv95693fphvsp54l567';

      expect(modal).toBeInTheDocument();

      //  Test that user is able to post an invoice
      fireEvent.change(within(modal).getByTestId('withdrawInvoiceInput'), {
        target: { value: invoice }
      });

      await waitFor(() => {
        const confirmBtn = within(modal).getByText('Confirm');
        fireEvent.click(confirmBtn);
      });

      await waitFor(() => {
        expect(within(modal).getByText('You are about to withdraw')).toBeInTheDocument();
        expect(within(modal).getByTestId('WithdrawAmount')).toHaveTextContent('1,000 SATS');
      });

      const confirmPayBtn = within(modal).getByText('Withdraw');
      expect(confirmPayBtn).not.toBeDisabled();
      fireEvent.click(confirmPayBtn);

      await waitFor(() => {
        expect(
          within(modal).getByText('Workspace budget is not enough to withdraw the amount')
        ).toBeInTheDocument();
      });
    });
  });

  it('Add User button shows Add User modal', async () => {
    const props: {
      close: jest.Mock;
      org: Workspace | undefined;
      resetWorkspace: jest.Mock;
      getWorkspaces: jest.Mock;
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
      resetWorkspace: jest.fn(),
      getWorkspaces: jest.fn(),
      openAddUserModal: jest.fn()
    };

    const spyOpenAddUserModal = jest.spyOn(props, 'openAddUserModal');

    const { getByText } = render(
      <Router>
        <WorkspaceDetails {...props} />
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

  it('render workspace name', async () => {
    jest.spyOn(mainStore, 'getPersonAssignedBounties').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'pollWorkspaceBudgetInvoices').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'workspaceInvoiceCount').mockReturnValue(Promise.resolve(0));
    jest.spyOn(mainStore, 'getWorkspaceUsers').mockReturnValue(Promise.resolve([person]));
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest
      .spyOn(mainStore, 'getWorkspaceBudget')
      .mockReturnValue(Promise.resolve({ total_budget: 10000 }));
    jest.spyOn(mainStore, 'getPaymentHistories').mockReturnValue(Promise.resolve([]));
    const closeFn = jest.fn();
    const resetWorkspaceFn = jest.fn();
    const getWorkspaceFn = jest.fn();
    await act(async () => {
      const { getByText } = render(
        <MemoryRouter>
          <WorkspaceDetails
            close={closeFn}
            getWorkspaces={getWorkspaceFn}
            org={workspace}
            resetWorkspace={resetWorkspaceFn}
          />
        </MemoryRouter>
      );

      expect(getByText(workspace.name)).toBeInTheDocument();
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
    jest.spyOn(mainStore, 'pollWorkspaceBudgetInvoices').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'workspaceInvoiceCount').mockReturnValue(Promise.resolve(0));
    jest.spyOn(mainStore, 'getWorkspaceUsers').mockReturnValue(Promise.resolve([person]));
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
      .spyOn(mainStore, 'getWorkspaceBudget')
      .mockReturnValue(Promise.resolve({ total_budget: 10000 }));
    jest.spyOn(mainStore, 'getPaymentHistories').mockReturnValue(Promise.resolve([]));
    const closeFn = jest.fn();
    const resetWorkspaceFn = jest.fn();
    const getWorkspaceFn = jest.fn();
    await act(async () => {
      const { getByRole } = render(
        <MemoryRouter>
          <WorkspaceDetails
            close={closeFn}
            getWorkspaces={getWorkspaceFn}
            org={workspace}
            resetWorkspace={resetWorkspaceFn}
          />
        </MemoryRouter>
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
    jest.spyOn(mainStore, 'pollWorkspaceBudgetInvoices').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'workspaceInvoiceCount').mockReturnValue(Promise.resolve(0));
    jest.spyOn(mainStore, 'getWorkspaceUsers').mockReturnValue(Promise.resolve([person]));
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest
      .spyOn(mainStore, 'getWorkspaceBudget')
      .mockReturnValue(Promise.resolve({ total_budget: 10000 }));
    jest.spyOn(mainStore, 'getPaymentHistories').mockReturnValue(Promise.resolve([]));
    const closeFn = jest.fn();
    const resetWorkspaceFn = jest.fn();
    const getWorkspaceFn = jest.fn();
    act(async () => {
      const { getByRole } = render(
        <MemoryRouter>
          <WorkspaceDetails
            close={closeFn}
            getWorkspaces={getWorkspaceFn}
            org={workspace}
            resetWorkspace={resetWorkspaceFn}
          />
        </MemoryRouter>
      );

      await waitFor(() => {
        const editBtn = getByRole('button', { name: 'Edit' });
        const addUsersBtn = getByRole('button', { name: 'Add User' });

        expect(editBtn).toBeDisabled();
        expect(addUsersBtn).toBeDisabled();
      });
    });
  });

  it('should disable view bounties button if workspace doesnt have any bounty', async () => {
    jest.spyOn(mainStore, 'getPersonAssignedBounties').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'pollWorkspaceBudgetInvoices').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'workspaceInvoiceCount').mockReturnValue(Promise.resolve(0));
    jest.spyOn(mainStore, 'getWorkspaceUsers').mockReturnValue(Promise.resolve([person]));
    jest.spyOn(mainStore, 'getUserRoles').mockReturnValue(Promise.resolve([]));
    jest
      .spyOn(mainStore, 'getWorkspaceBudget')
      .mockReturnValue(Promise.resolve({ total_budget: 10000 }));
    jest.spyOn(mainStore, 'getPaymentHistories').mockReturnValue(Promise.resolve([]));
    const closeFn = jest.fn();
    const resetWorkspaceFn = jest.fn();
    const getWorkspaceFn = jest.fn();
    act(async () => {
      const { getByRole } = render(
        <MemoryRouter>
          <WorkspaceDetails
            close={closeFn}
            getWorkspaces={getWorkspaceFn}
            org={{ ...workspace, bounty_count: 0 }}
            resetWorkspace={resetWorkspaceFn}
          />
        </MemoryRouter>
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
    jest.spyOn(mainStore, 'pollWorkspaceBudgetInvoices').mockReturnValue(Promise.resolve([]));
    jest.spyOn(mainStore, 'workspaceInvoiceCount').mockReturnValue(Promise.resolve(0));
    jest.spyOn(mainStore, 'getWorkspaceUsers').mockReturnValue(Promise.resolve([person]));
    jest
      .spyOn(mainStore, 'getUserRoles')
      .mockReturnValue(Promise.resolve([{ name: 'EDIT ORGANIZATION' }, { name: 'ADD BUDGET' }]));
    jest
      .spyOn(mainStore, 'getWorkspaceBudget')
      .mockReturnValue(Promise.resolve({ total_budget: 10000 }));
    jest.spyOn(mainStore, 'getPaymentHistories').mockReturnValue(Promise.resolve([]));
    const closeFn = jest.fn();
    const resetWorkspaceFn = jest.fn();
    const getWorkspaceFn = jest.fn();
    act(async () => {
      const { getByRole } = render(
        <MemoryRouter>
          <WorkspaceDetails
            close={closeFn}
            getWorkspaces={getWorkspaceFn}
            org={workspace}
            resetWorkspace={resetWorkspaceFn}
          />
        </MemoryRouter>
      );
      await waitFor(() => {
        const withdrawBtn = getByRole('button', { name: 'Withdraw' });
        const historyBtn = getByRole('button', { name: 'History' });

        expect(withdrawBtn).toBeDisabled();
        expect(historyBtn).toBeDisabled();
      });
    });
  });
});
