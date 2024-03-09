import { render, act } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { Organization } from 'store/main';
import OrgTicket from '../org/OrgTickets';

jest.mock('rehype-raw', () => null);
jest.mock('remark-gfm', () => null);

const mockOrganization: Organization = {
  id: '1',
  uuid: 'abc123',
  name: 'Tech Innovators Inc.',
  description: 'A cutting-edge technology company focusing on innovation.',
  github: 'https://github.com/techinnovators',
  website: 'https://www.techinnovators.com',
  owner_pubkey: 'xyz456',
  img: 'https://example.com/logo.png',
  created: '2024-03-08T12:00:00Z',
  updated: '2024-03-08T12:00:00Z',
  show: true,
  bounty_count: 10,
  budget: 100000,
  deleted: false
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn(),
    goBack: jest.fn()
  }),
  useParams: () => ({
    uuid: 'ck95pe04nncjnaefo08g',
    bountyId: '1239'
  })
}));

jest.mock('mobx-react-lite', () => ({
  observer: jest.fn((component: React.FC) => component)
}));

jest.mock('../../../store', () => ({
  useStores: jest.fn(() => ({
    main: {
      getUserOrganizationByUuid: jest.fn().mockReturnValue([mockOrganization]),
      getTribesByOwner: jest.fn(),
      getTotalOrgBounties: jest.fn().mockReturnValue(10),
      setBountiesStatus: jest.fn(),
      setBountyLanguages: jest.fn()
    },
    ui: {
      meInfo: {},
      toasts: [],
      setToasts: jest.fn()
    }
  }))
}));

beforeAll(() => {
  nock.disableNetConnect();
});

describe('Organization Ticket', () => {
  it('Component renders correctly', () => {
    act(() => {
      const { container } = render(<OrgTicket />);

      console.log(container.innerHTML);
    });
  });
});
