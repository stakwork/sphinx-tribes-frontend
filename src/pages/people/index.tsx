import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { useBrowserTabTitle } from '../../hooks';
import { PeoplePage } from './PeoplePage';
import { PersonPage } from './PersonPage';

export const People = () => {
  const { path } = useRouteMatch();
  useBrowserTabTitle('People');

  return (
    <Switch>
      <Route path={`${path}:uuid/`}>
        <PersonPage />
      </Route>
      <Route path={`${path}`}>
        <PeoplePage />
      </Route>
    </Switch>
  );
};
