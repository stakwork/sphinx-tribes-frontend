import React from 'react';
import OrganizationDetails from '../OrganizationDetails';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Organization } from 'store/main';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useRouteMatch: jest.fn(() => ({ url: '', path: '' }))
}));

jest.mock('remark-gfm', () => () => {});

jest.mock('rehype-raw', () => () => {});

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

describe('Organization Details component', () => {
  const closeFn = jest.fn();
  const resetOrgFn = jest.fn();
  const getOrgFn = jest.fn();

  it('Renders Deposit Modal', async () => {
    const { getByText, container } = render(
      <OrganizationDetails
        close={closeFn}
        getOrganizations={getOrgFn}
        org={organization}
        resetOrg={resetOrgFn}
      />
    );
    const depositButton = getByText('Deposit');
    fireEvent.click(screen.getByText('Deposit'));
    waitFor(() => expect(getByText('Amount (in sats)')));
  });

  it('Test that USD conversion are visible', async () => {
    const { getByTestId, container } = render(
      <OrganizationDetails
        close={closeFn}
        getOrganizations={getOrgFn}
        org={organization}
        resetOrg={resetOrgFn}
      />
    );
    fireEvent.click(screen.getByText('Deposit'));
    waitFor(() => expect(getByTestId('usd-amount')));
  });

  it('User can input an amount for sats', async () => {
    const { getByText, getByTestId, container } = render(
      <OrganizationDetails
        close={closeFn}
        getOrganizations={getOrgFn}
        org={organization}
        resetOrg={resetOrgFn}
      />
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
      <OrganizationDetails
        close={closeFn}
        getOrganizations={getOrgFn}
        org={organization}
        resetOrg={resetOrgFn}
      />
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
      <OrganizationDetails
        close={closeFn}
        getOrganizations={getOrgFn}
        org={organization}
        resetOrg={resetOrgFn}
      />
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
      <OrganizationDetails
        close={closeFn}
        getOrganizations={getOrgFn}
        org={organization}
        resetOrg={resetOrgFn}
      />
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
      const copyButton = getByTestId('copy-button');
      fireEvent.click(copyButton);
      expect(screen.getByText('COPIED')).toBeInTheDocument();
    });
  });
});
