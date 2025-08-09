```
import React, { FC } from 'react';
import { create } from 'mobx-persist';
import { configure } from 'mobx';
import { leaderboardStore } from '../pages/leaderboard/store';
import { appEnv } from '../config/env';
import { uiStore } from './ui';
import { mainStore } from './main';
import { modalsVisibilityStore } from './modals';
import { chatHistoryStore } from './chat';

(() => {
  if (appEnv.isTests) {
    return;
  }
  const hydrate = create({ storage: localStorage });

  function hydrateAll() {
    Promise.all([hydrate('main', mainStore), hydrate('ui', uiStore)]).then(() => {
      mainStore.initializeSessionId();
      uiStore.setReady(true);
    });
  }
  hydrateAll();

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      hydrateAll();
    }
  });
})();

configure({});
const Context = React.createContext({
  ui: uiStore,
  main: mainStore,
  modals: modalsVisibilityStore,
  leaderboard: leaderboardStore,
  chat: chatHistoryStore
});

export const WithStores = ({ children }: any) => (
  <Context.Provider data-testid="with-stores-component"
    value={{
      ui: uiStore,
      main: mainStore,
      modals: modalsVisibilityStore,
      leaderboard: leaderboardStore,
      chat: chatHistoryStore
    }}
  >
    {children}
  </Context.Provider>
);

// eslint-disable-next-line @typescript-eslint/ban-types
export function withStores<T extends Object>(Component: FC<T>) {
  // eslint-disable-next-line react/display-name
  return function (props: T) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return (
      <Context.Provider data-testid="with-stores-component"
        value={{
          ui: uiStore,
          main: mainStore,
          modals: modalsVisibilityStore,
          leaderboard: leaderboardStore,
          chat: chatHistoryStore
        }}
      >
        <Component {...props} />
      </Context.Provider>
    );
  };
}

export const useStores = () => React.useContext(Context);
```