import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useStores } from 'store';
import WidgetSwitchViewer from '../WidgetSwitchViewer';

jest.mock('hooks', () => ({
  useIsMobile: jest.fn()
}));

jest.mock('store', () => ({
  useStores: jest.fn()
}));

describe('WidgetSwitchViewer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should display No results when there are no active list items with filter of languages', () => {
    // Mock return value for the store hook
    (useStores as jest.Mock).mockReturnValue({
      main: {
        peopleBounties: [],
        peopleOffers: [],
        peoplePosts: []
      }
    });

    // Render the component with a selected widget and empty lists
    render(<WidgetSwitchViewer selectedWidget="wanted" currentItems={0} totalBounties={0} languageString="Typescript"/>);

    // Assert that <NoResults /> is present in the document
    expect(screen.getByText(/No results/i)).toBeInTheDocument();
  });

  // Additional tests for different conditions can be added here
});
