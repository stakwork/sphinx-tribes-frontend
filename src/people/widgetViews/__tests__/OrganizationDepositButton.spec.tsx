import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Workspace } from 'store/main';
import { MemoryRouter } from 'react-router-dom';
import WorkspaceDetails from '../WorkspaceDetails';

jest.mock('remark-gfm', () => () => {});

jest.mock('rehype-raw', () => () => {});

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
  owner_pubkey: 'clrqpq84nncuuf32kh2g',
  img: 'https://memes.sphinx.chat/public/3bt5n-7mGLgC6jGBBwKwLyZdJY6IUVZke8p2nLUsPhU=',
  created: '2023-12-12T00:44:25.83042Z',
  updated: '2023-12-12T01:12:39.970648Z',
  deleted: false
};

describe('Workspace Details component', () => {
  const closeFn = jest.fn();
  const resetWorkspaceFn = jest.fn();
  const getWorkspaceFn = jest.fn();

  it('Renders Deposit Modal', async () => {
    const { getByText, container } = render(
      <MemoryRouter>
        <WorkspaceDetails
          close={closeFn}
          getWorkspaces={getWorkspaceFn}
          org={workspace}
          resetWorkspace={resetWorkspaceFn}
        />
      </MemoryRouter>
    );
    const depositButton = getByText('Deposit');
    fireEvent.click(screen.getByText('Deposit'));
    waitFor(() => expect(getByText('Amount (in sats)')));
  });

  it('Test that USD conversion are visible', async () => {
    const { getByTestId, container } = render(
      <MemoryRouter>
        <WorkspaceDetails
          close={closeFn}
          getWorkspaces={getWorkspaceFn}
          org={workspace}
          resetWorkspace={resetWorkspaceFn}
        />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText('Deposit'));
    waitFor(() => expect(getByTestId('usd-amount')));
  });

  it('User can input an amount for sats', async () => {
    const { getByText, getByTestId, container } = render(
      <MemoryRouter>
        <WorkspaceDetails
          close={closeFn}
          getWorkspaces={getWorkspaceFn}
          org={workspace}
          resetWorkspace={resetWorkspaceFn}
        />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText('Deposit'));
    waitFor(() => {
      const satInput = getByTestId('input-amount');
      fireEvent.change(satInput, { target: { value: '10000' } });
      expect(satInput).toBe('10000');
    });
  });

  it('Test that generate invoice button creates an invoice', async () => {
    const { getByText, getByTestId, container } = render(
      <MemoryRouter>
        <WorkspaceDetails
          close={closeFn}
          getWorkspaces={getWorkspaceFn}
          org={workspace}
          resetWorkspace={resetWorkspaceFn}
        />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText('Deposit'));
    waitFor(() => {
      const satInput = getByTestId('input-amount');
      fireEvent.change(satInput, { target: { value: '10' } });
    });
    waitFor(() => {
      const generateInvoiceButton = getByTestId('generate-button');
      fireEvent.click(generateInvoiceButton);
    });
    waitFor(() => {
      const qrCode = getByTestId('qr-code');
      expect(qrCode).toBeInTheDocument();
    });
  });

  it('Invoice is displayed in a QR code', async () => {
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
    fireEvent.click(screen.getByText('Deposit'));
    waitFor(() => {
      const satInput = getByTestId('input-amount');
      fireEvent.change(satInput, { target: { value: '10' } });
    });
    waitFor(() => {
      const generateInvoiceButton = getByTestId('generate-button');
      fireEvent.click(generateInvoiceButton);
    });
    waitFor(() => {
      const qrCode = getByTestId('qr-code');
      expect(qrCode).toBeInTheDocument();
    });
  });

  it('Copy button copies invoice', async () => {
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
    fireEvent.click(screen.getByText('Deposit'));
    waitFor(() => {
      const satInput = getByTestId('input-amount');
      fireEvent.change(satInput, { target: { value: '10' } });
    });
    waitFor(() => {
      const generateInvoiceButton = getByTestId('generate-button');
      fireEvent.click(generateInvoiceButton);
    });
    waitFor(() => {
      const copyButton = getByTestId('copy-btn');
      fireEvent.click(copyButton);
      expect(screen.getByText('COPIED')).toBeInTheDocument();
    });
  });
});
