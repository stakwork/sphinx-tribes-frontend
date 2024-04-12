import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WidgetSwitchViewer from '../WidgetSwitchViewer';
import * as storeModule from '../../../store';

jest.mock('../../../store', () => ({
  ...jest.requireActual('../../../store'),
  useStores: jest.fn()
}));

describe('WidgetSwitchViewer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (storeModule.useStores as jest.Mock).mockReturnValue({
      main: {
        getSpecificWorkspaceBounties: jest.fn(() => Promise.resolve()),
        peopleBounties: [],
        peopleOffers: [],
        peoplePosts: []
      }
    });
  });

  test('should display No results when there are no active list items with filter of languages', () => {
    render(
      <WidgetSwitchViewer
        selectedWidget="bounties"
        currentItems={0}
        totalBounties={0}
        languageString="Typescript"
      />
    );
    expect(screen.getByText(/No results/i)).toBeInTheDocument();
  });

  test('Load more functionality for workspace bounties', async () => {
    const org_uuid = 'clf6qmo4nncmf23du7ng';
    render(
      <WidgetSwitchViewer
        uuid={org_uuid}
        selectedWidget="bounties"
        currentItems={10}
        totalBounties={0}
        WorkspaceTotalBounties={20}
        languageString="Typescript"
        orgQueryLimit={0}
      />
    );

    fireEvent.click(screen.getByText(/Load More/i));

    await waitFor(() => {
      expect(
        (storeModule.useStores as jest.Mock)().main.getSpecificWorkspaceBounties
      ).toHaveBeenCalledWith(org_uuid, expect.any(Object));
    });
  });
});
