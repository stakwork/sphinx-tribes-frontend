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
        getSpecificOrganizationBounties: jest.fn(() => Promise.resolve()),
        peopleBounties: [],
        peopleOffers: [],
        peoplePosts: []
      }
    });
  });

  test('should display No results when there are no active list items with filter of languages', () => {
    render(
      <WidgetSwitchViewer
        selectedWidget="wanted"
        currentItems={0}
        totalBounties={0}
        languageString="Typescript"
      />
    );
    expect(screen.getByText(/No results/i)).toBeInTheDocument();
  });

  test('Load more functionality for organization bounties', async () => {
    const org_uuid = 'clf6qmo4nncmf23du7ng';
    render(
      <WidgetSwitchViewer
        uuid={org_uuid}
        selectedWidget="wanted"
        currentItems={10}
        totalBounties={0}
        OrgTotalBounties={20}
        languageString="Typescript"
        orgQueryLimit={0}
      />
    );

    fireEvent.click(screen.getByText(/Load More/i));

    await waitFor(() => {
      expect(
        (storeModule.useStores as jest.Mock)().main.getSpecificOrganizationBounties
      ).toHaveBeenCalledWith(org_uuid, expect.any(Object));
    });
  });
});
