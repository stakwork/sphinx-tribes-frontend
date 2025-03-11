import React from 'react';
import { render, screen } from '@testing-library/react';
import { useStores } from '../../../store';
import NoResults from '../NoResults';

// Mock the store hook
jest.mock('../../store', () => ({
  useStores: jest.fn()
}));

// Mock PageLoadSpinner component
jest.mock('./PageLoadSpinner', () => function MockPageLoadSpinner({ show }: { show: boolean }) {
    return <div data-testid="page-load-spinner" data-show={show}>Loading...</div>;
  });

describe('NoResults', () => {
  const mockUseStores = useStores as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const testCases = [
    {
      name: 'Test Case 1: Search Text Present (Simple)',
      mockStores: { ui: { searchText: 'foo' } },
      loadedProp: false,
      expectedRendered: 'noResults'
    },
    {
      name: 'Test Case 2: Loaded Is True Without Search Text',
      mockStores: { ui: { searchText: '' } },
      loadedProp: true,
      expectedRendered: 'noResults'
    },
    {
      name: 'Test Case 3: Neither Search Text nor Loaded Flag Set',
      mockStores: { ui: { searchText: '' } },
      loadedProp: false,
      expectedRendered: 'spinner'
    },
    {
      name: 'Test Case 4: Both Search Text and Loaded True',
      mockStores: { ui: { searchText: 'bar' } },
      loadedProp: true,
      expectedRendered: 'noResults'
    },
    {
      name: 'Test Case 5: No UI Object in Context with Loaded False',
      mockStores: { ui: null },
      loadedProp: false,
      expectedRendered: 'spinner'
    },
    {
      name: 'Test Case 6a: UI Provided with Search Text as an Empty String and Loaded False',
      mockStores: { ui: { searchText: '' } },
      loadedProp: false,
      expectedRendered: 'spinner'
    },
    {
      name: 'Test Case 6b: UI Provided with Search Text as an Empty String and Loaded True',
      mockStores: { ui: { searchText: '' } },
      loadedProp: true,
      expectedRendered: 'noResults'
    },
    {
      name: 'Test Case 7: UI is Explicitly Null with Loaded False',
      mockStores: { ui: null },
      loadedProp: false,
      expectedRendered: 'spinner'
    }
  ];

  testCases.forEach(({ name, mockStores, loadedProp, expectedRendered }) => {
    it(name, () => {
      mockUseStores.mockReturnValue(mockStores);

      render(<NoResults loaded={loadedProp} />);

      if (expectedRendered === 'noResults') {
        expect(screen.getByText('No results')).toBeInTheDocument();
        expect(screen.queryByTestId('page-load-spinner')).not.toBeInTheDocument();
      } else {
        expect(screen.queryByText('No results')).not.toBeInTheDocument();
        const spinner = screen.getByTestId('page-load-spinner');
        expect(spinner).toBeInTheDocument();
        expect(spinner.getAttribute('data-show')).toBe('true');
      }
    });
  });
}); 