import React from 'react';
import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { useStores } from '../../../store';
import { SuperAdmin } from '../index.tsx';

jest.mock('../../../store', () => ({
  useStores: jest.fn()
}));

class MockIntersectionObserver {
  constructor() {
    ('');
  }
  observe() {
    ('');
  }
  disconnect() {
    ('');
  }
}

beforeAll(() => {
  // @ts-ignore
  window.IntersectionObserver = MockIntersectionObserver;
});

afterAll(() => {
  // @ts-ignore
  delete window.IntersectionObserver;
});

describe('SuperAdmin component', () => {
  it('renders admin page when user is admin', async () => {
    (useStores as jest.Mock).mockImplementation(() => ({
      main: {
        getSuperAdmin: async () => true,
        getBountiesCountByRange: jest.fn().mockResolvedValue(10)
      }
    }));

    let component;
    await act(async () => {
      component = render(<SuperAdmin />);
    });

    const { queryByText } = component;

    await waitFor(() => {
      expect(queryByText('Bounties')).toBeInTheDocument();
      expect(queryByText('Satoshis')).toBeInTheDocument();
    });

    expect(queryByText('Access Denied')).not.toBeInTheDocument();
  });

  it('renders access denied component when user is not admin', async () => {
    (useStores as jest.Mock).mockImplementation(() => ({
      main: {
        getSuperAdmin: async () => false,
        getBountiesCountByRange: jest.fn().mockResolvedValue(0)
      }
    }));

    let component;
    await act(async () => {
      component = render(<SuperAdmin />);
    });

    const { queryByText } = component;

    expect(queryByText('Bounties')).not.toBeInTheDocument();
    expect(queryByText('Satoshis')).not.toBeInTheDocument();
    expect(queryByText('Access Denied')).toBeInTheDocument();
  });
});
