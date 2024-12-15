import React from 'react';
/* eslint-disable func-style */
import '@material/react-material-icon/dist/material-icon.css';
import { AppMode } from 'config';
import { Route, Switch } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import WorkspaceMission from 'people/widgetViews/WorkspaceMission';
import WorkspaceFeature from 'people/widgetViews/WorkspaceFeature';
import PeopleHeader from '../people/main/Header';
import TokenRefresh from '../people/utils/TokenRefresh';
import GenerateStoriesView from '../people/widgetViews/GenerateStoriesView';
import PhasePlannerView from '../people/widgetViews/PhasePlannerView';
import { HiveChatView } from '../people/hiveChat/index';
import Body from './tribes/Body';
import Header from './tribes/Header';
import { MainLayout } from './MainLayout';
import { Modals } from './Modals';
import { People } from './people';
import { TicketsPage } from './tickets';
import { WorkspaceTicketsPage } from './tickets/workspace';
import { LeaderboardPage } from './leaderboard';
import { SuperAdmin } from './superadmin/index';

const modeDispatchPages: Record<AppMode, () => React.ReactElement> = {
  community: () => (
    <>
      <TokenRefresh />
      <MainLayout header={<PeopleHeader />}>
        <Switch>
          <Route path={['/bounties', '/t/', '/tickets', '/bounty/:bountyId', '/b/']}>
            <TicketsPage />
          </Route>
          <Route path="/p/">
            <People />
          </Route>
          <Route path="/workspace/bounties/:uuid">
            <WorkspaceTicketsPage />
          </Route>
          <Route path="/workspace/:uuid/hivechat/:chatId">
            <HiveChatView />
          </Route>
          <Route path="/workspace/:uuid">
            <WorkspaceMission />
          </Route>
          <Route path="/feature/:feature_uuid/phase/:phase_uuid/planner">
            <PhasePlannerView />
          </Route>
          <Route path="/feature/:feature_uuid/stories">
            <GenerateStoriesView />
          </Route>
          <Route path="/feature/:feature_uuid">
            <WorkspaceFeature />
          </Route>
          <Route path="/leaderboard">
            <LeaderboardPage />
          </Route>
          <Route path="/admin">
            <SuperAdmin />
          </Route>
          <Route path="*">
            <TicketsPage />
          </Route>
        </Switch>
      </MainLayout>
    </>
  ),
  people: () => <></>,
  tribes: () => (
    <MainLayout header={<Header />}>
      <Body />
    </MainLayout>
  )
};

export const Pages = observer(({ mode }: { mode: AppMode }) => (
  <>
    {modeDispatchPages[mode]()}
    <Modals />
  </>
));
