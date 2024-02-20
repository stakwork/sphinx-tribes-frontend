import React from 'react';
import { ThemeProvider, createTheme } from '@mui/system';
import { Router } from 'react-router-dom';
import history from '../../config/history';
import { withProviders } from '../../providers';
import { MOCK_ENVIRONMENT_HOOKS } from './constants';
import { useMockBountyData } from './useMockBountyData';
import { useMockBountyRoleData } from './useMockBountyRoleData';
import { useMockDropdownOrganizationData } from './useMockDropdownOrganizationData';
import { useMockOrganizationsData } from './useMockOrganizationsData';
import { useMockUsdToSatExchangeRate } from './useMockUsdToSatExchangeRate';
import { useMockSelfProfileStore } from './useMockSelfProfileStore';

export function MockStoreEnvironment({
  children,
  hooks = []
}: {
  children: React.ReactNode;
  hooks: MOCK_ENVIRONMENT_HOOKS[];
}) {
  const theme = createTheme({
    spacing: 8
  });
  useMockBountyData({ enabled: hooks.includes(MOCK_ENVIRONMENT_HOOKS.BOUNTY_DATA) });
  useMockBountyRoleData({ enabled: hooks.includes(MOCK_ENVIRONMENT_HOOKS.BOUNTY_ROES) });
  useMockDropdownOrganizationData({
    enabled: hooks.includes(MOCK_ENVIRONMENT_HOOKS.DROPDOWN_ORGANIZATION_DATA)
  });
  useMockOrganizationsData({ enabled: hooks.includes(MOCK_ENVIRONMENT_HOOKS.ORGANIZATION_DATA) });
  useMockUsdToSatExchangeRate({
    enabled: hooks.includes(MOCK_ENVIRONMENT_HOOKS.USD_TO_SAT_EXCHANGE_RATE)
  });
  useMockSelfProfileStore({ enabled: hooks.includes(MOCK_ENVIRONMENT_HOOKS.SELF_PROFILE_STORE) });

  return (
    <ThemeProvider theme={theme}>
      <Router history={history}>{children}</Router>
    </ThemeProvider>
  );
}

export default withProviders(MockStoreEnvironment);
