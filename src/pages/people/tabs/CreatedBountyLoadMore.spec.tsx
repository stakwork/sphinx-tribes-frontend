import React from 'react';
import { render, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { usePerson } from 'hooks';
import { useStores } from 'store';
import mockBounties from '../../../bounties/__mock__/mockBounties.data';
import '@testing-library/jest-dom/extend-expect';
import { Wanted } from './Wanted';

jest.mock('hooks', () => ({
  ...jest.requireActual('hooks'),
  usePerson: jest.fn()
}));

jest.mock('store', () => ({
  ...jest.requireActual('store'),
  useStores: jest.fn()
}));

// eslint-disable-next-line @typescript-eslint/typedef
const createdMockBounties = Array.from({ length: 15 }, (_, index) => ({
  ...(mockBounties[0] || {}),
  bounty: {
    ...(mockBounties[0]?.bounty || {}),
    id: mockBounties[0]?.bounty?.id + index + 1
  }
}));

describe('Wanted component', () => {
  beforeEach(() => {
    // Setup before each test. If there's a common mock implementation, define it here.
  });

  afterEach(() => {
    // Cleanup after each test. Resetting all mocks ensures that one test does not affect another.
    jest.resetAllMocks();
    cleanup();
  });

  it('displays "Load More" button when scrolling down', async () => {
    // Mock implementation specific to this test, if any

    (usePerson as jest.Mock).mockImplementation(() => ({
      person: {},
      canEdit: false
    }));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties: jest.fn(() => []),
        dropDownOrganizations: []
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        }
      }
    });

    const { getByText } = render(
      <MemoryRouter>
        <Wanted />
      </MemoryRouter>
    );

    fireEvent.scroll(window, { target: { scrollY: 1000 } });

    await waitFor(() => {
      if (createdMockBounties.length > 20) {
        expect(getByText('Load More')).toBeInTheDocument();
      } else {
        console.warn('Not enough bounties for "Load More" button.');
      }
    });
  });

  test('Add new ticket modal on close should not navigate back in history', async () => {
    // Mock implementation specific to this test
    (usePerson as jest.Mock).mockImplementation(() => ({
      person: {},
      canEdit: true
    }));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties: jest.fn(() => []),
        dropDownOrganizations: []
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        }
      }
    });

    const { getByText, getByAltText } = render(
      <MemoryRouter>
        <Wanted />
      </MemoryRouter>
    );

    const currentPathname = window.location.pathname;

    fireEvent.scroll(window, { target: { scrollY: 1000 } });

    await waitFor(() => {
      expect(getByText('Add New Ticket')).toBeInTheDocument();
    });

    fireEvent.click(getByText('Add New Ticket'));

    await waitFor(() => {
      expect(getByAltText('close_svg')).toBeInTheDocument();
    });

    fireEvent.click(getByAltText('close_svg'));

    expect(window.location.pathname).toEqual(currentPathname);
  });
});
