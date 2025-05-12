import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { PeoplePage } from './PeoplePage';
import { PersonPage } from './PersonPage';

export const People = () => {
  const { path } = useRouteMatch();

  return (
    <Switch data-testid="people-component">
      <Route path={`${path}:uuid/`}>
        <PersonPage />
      </Route>
      <Route path={`${path}`}>
        <PeoplePage />
      </Route>
    </Switch>
  );
};
