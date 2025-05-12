import React, { useCallback, useEffect } from 'react';
/* eslint-disable func-style */
import '@material/react-material-icon/dist/material-icon.css';
import history from 'config/history';
import { withProviders } from 'providers';
import { Router } from 'react-router-dom';
import { uiStore } from 'store/ui';
import './App.css';
import { ThemeProvider, createTheme } from '@mui/system';
import { usePostHog } from 'posthog-js/react';
import { ModeDispatcher } from './config/ModeDispatcher';
import { Pages } from './pages';
import { appEnv } from './config/env';
import { mainStore } from './store/main';

let exchangeRateInterval: any = null;

const theme = createTheme({
  spacing: 8
});

function App() {
  const posthog = usePostHog();
  const getUserWorkspaces = useCallback(async () => {
    if (uiStore.selectedPerson !== 0) {
      await mainStore.getUserWorkspaces(uiStore.selectedPerson);
    } else {
      await mainStore.getUserWorkspaces(uiStore.meInfo?.id || 0);
    }

    // this is to make sure the workspaces dropdown on bounty page
    // is always for the user
    if (uiStore.meInfo?.id) {
      await mainStore.getUserDropdownWorkspaces(uiStore.meInfo?.id);
    }
  }, [uiStore.selectedPerson]);

  useEffect(() => {
    getUserWorkspaces();
  }, [getUserWorkspaces]);

  const getBountyRoles = useCallback(async () => {
    await mainStore.getRoles();
    await mainStore.getPeopleBounties();
  }, []);

  useEffect(() => {
    getBountyRoles();
  }, []);

  useEffect(() => {
    // get usd/sat exchange rate every 100 second;
    mainStore.getUsdToSatsExchangeRate();

    exchangeRateInterval = setInterval(() => {
      mainStore.getUsdToSatsExchangeRate();
    }, 100000);

    return function cleanup() {
      clearInterval(exchangeRateInterval);
    };
  }, []);

  const setPosthog = useCallback(() => {
    //Posthog user opens the page
    if (!appEnv.isTests) {
      if (uiStore.meInfo?.id) {
        posthog?.identify(uiStore.meInfo.owner_alias, {
          name: uiStore.meInfo.owner_alias,
          pubkey: uiStore.meInfo.pubkey
        });
      } else {
        posthog?.identify(mainStore.sessionId, {});
      }
      if (posthog) {
        console.log('got posthog');
        const sessionId = posthog.get_session_id();
        console.log('session id: ', sessionId);
        mainStore.setSessionId(sessionId);
      } else {
        console.log('posthog not availible');
      }
    }
  }, [posthog]);

  useEffect(() => {
    setPosthog();
  }, [setPosthog]);

  return (
    <ThemeProvider theme={theme} data-testid="app-component">
      <Router history={history}>
        <ModeDispatcher>{(mode: any) => <Pages mode={mode} />}</ModeDispatcher>
      </Router>
    </ThemeProvider>
  );
}

export default withProviders(App);
