import React from 'react';
import '@testing-library/jest-dom';
import { screen, render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { TabsPages } from '..';

describe('TabsPages Component', () => {
  test('Test that clicking on the profile and view the title sections for org, badges, bounties, assigned', async () => {
    render(
      <MemoryRouter initialEntries={['/p/1234/workspaces']}>
        <Route path="/p/:uuid/workspaces" component={TabsPages} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Workspaces')).toBeInTheDocument();
      expect(screen.getByText('Badges')).toBeInTheDocument();
      expect(screen.getByText('Bounties')).toBeInTheDocument();
      expect(screen.getByText('Assigned Bounties')).toBeInTheDocument();
    });
  });
});
