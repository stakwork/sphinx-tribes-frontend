import React from 'react';
import '@testing-library/jest-dom';
import { screen, render, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { TabsPages } from '..';

describe('TabsPages Component', () => {
  test('Test that clicking on the profile and view the title sections for org, badges, bounties, assigned', async () => {
    render(
      <MemoryRouter initialEntries={['/p/1234/workspaces']}>
        <Route path="/p/:uuid/" component={TabsPages} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Workspaces')).toBeInTheDocument();
      expect(screen.getByText('Badges')).toBeInTheDocument();
      expect(screen.getByText('Bounties')).toBeInTheDocument();
      expect(screen.getByText('Assigned Bounties')).toBeInTheDocument();
    });
  });

  test('tablist and tabs have expected a11y roles and state attributes', async () => {
    render(
      <MemoryRouter initialEntries={['/p/1234/workspaces']}>
        <Route path="/p/:uuid/" component={TabsPages} />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByRole('tablist')).toBeInTheDocument());
    const tablist = screen.getByRole('tablist', { name: 'Profile content tabs' });
    const tabs = screen.getAllByRole('tab');

    expect(tablist).toBeInTheDocument();
    expect(tabs.length).toBeGreaterThan(1);
    expect(tabs.filter((tab) => tab.getAttribute('aria-selected') === 'true').length).toBe(1);

    tabs.forEach((tab) => {
      expect(tab).toHaveAttribute('role', 'tab');
      expect(tab).toHaveAttribute('aria-controls');
      expect(tab).toHaveAttribute('id');
      expect(tab).toHaveAttribute('tabindex');
      expect(tab).toHaveAttribute('aria-selected');
    });

    const selectedTab = screen.getByRole('tab', { name: 'Workspaces' });
    const tabpanel = screen.getByRole('tabpanel');
    expect(selectedTab).toHaveAttribute('aria-selected', 'true');
    expect(tabpanel).toHaveAttribute('aria-labelledby', selectedTab.id);
    expect(selectedTab).toHaveAttribute('aria-controls', tabpanel.id);
  });

  test.each([
    ['workspaces', 'Workspaces'],
    ['badges', 'Badges'],
    ['bounties', 'Bounties'],
    ['assigned', 'Assigned Bounties']
  ])('tab and tabpanel are linked for %s route', (route, label) => {
    render(
      <MemoryRouter initialEntries={[`/p/1234/${route}`]}>
        <Route path="/p/:uuid/" component={TabsPages} />
      </MemoryRouter>
    );

    const selectedTab = screen.getByRole('tab', { name: label });
    const tabpanel = screen.getByRole('tabpanel');

    expect(selectedTab.getAttribute('aria-selected')).toBe('true');
    expect(tabpanel).toHaveAttribute('aria-labelledby', selectedTab.id);
    expect(selectedTab).toHaveAttribute('aria-controls', tabpanel.id);
  });

  test('keyboard navigation activates adjacent tabs', async () => {
    render(
      <MemoryRouter initialEntries={['/p/1234/workspaces']}>
        <Route path="/p/:uuid/" component={TabsPages} />
      </MemoryRouter>
    );

    const workspacesTab = screen.getByRole('tab', { name: 'Workspaces' });
    workspacesTab.focus();

    fireEvent.keyDown(workspacesTab, { key: 'ArrowRight' });

    const badgesTab = screen.getByRole('tab', { name: 'Badges' });
    await waitFor(() => expect(badgesTab).toHaveFocus());
    expect(badgesTab).toHaveAttribute('aria-selected', 'true');
  });
});
