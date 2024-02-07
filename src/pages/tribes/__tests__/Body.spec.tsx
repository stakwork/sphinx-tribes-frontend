import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useStores } from 'store';
import { useFuse } from 'hooks';
import Body from '../Body';

jest.mock('hooks', () => ({
  ...jest.requireActual('hooks'),
  useIsMobile: jest.fn(),
  useScreenWidth: jest.fn(),
  useFuse: jest.fn()
}));

jest.mock('store', () => ({
  useStores: jest.fn()
}));

describe('Tribes Body Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should display No results when there are no tribes on search', async () => {
    // Mock return value for the store hook
    (useStores as jest.Mock).mockReturnValue({
      main: {
        tribes: [],
        getTribes: jest.fn()
      },
      ui: {
        peoplePageNumber: 1,
        searchText: 'abc',
        tags: []
      }
    });

    (useFuse as jest.Mock).mockReturnValue([]);

    // Render the component with a selected widget and empty lists
    render(<Body />);

    await waitFor(() => {
      expect(screen.getByText(/No results/i)).toBeInTheDocument();
    });
  });
});
