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
import Activities from '../people/widgetViews/workspace/Activities/Activities';
import WorkspaceTicketView from '../people/widgetViews/workspace/WorkspaceTicketView';
import WorkspaceTicketCreateView from '../people/widgetViews/workspace/WorkspaceTicketCreateView.tsx';
import { HiveChatView } from '../people/hiveChat/index';
import WorkSpacePlanner from '../people/WorkSpacePlanner/index';
import HiveFeaturesView from '../people/widgetViews/workspace/HiveFeaturesView/HiveFeaturesView.tsx';
import FeatureBacklogView from '../people/widgetViews/workspace/FeatureBacklogView/FeatureBacklogView.tsx';
import HiveBuildView from '../people/hiveBuild';
import DailyBountyPage from './DailyBountyPage/index';
import Body from './tribes/Body';
import Header from './tribes/Header';
import { MainLayout } from './MainLayout';
import { Modals } from './Modals';
import { People } from './people';
import { TicketsPage } from './tickets';
import { WorkspaceTicketsPage } from './tickets/workspace';
import { LeaderboardPage } from './leaderboard';
import { SuperAdmin } from './superadmin/index';
import BountiesLandingPage from './BountiesLandingPage';

const modeDispatchPages: Record<AppMode, () => React.ReactElement> = {
  community: () => (
    <>
      <TokenRefresh />
      <Switch>
        <Route exact path="/bounties">
          <MainLayout header={<PeopleHeader />}>
            <TicketsPage />
          </MainLayout>
        </Route>

        <Route exact path={['/h', '/']}>
          <BountiesLandingPage />
        </Route>

        <Route path="/">
          <MainLayout header={<PeopleHeader />}>
            <Switch>
              <Route path="/dailyBounty">
                <DailyBountyPage />
              </Route>
              <Route path={['/t/', '/tickets', '/bounty/:bountyId', '/b/']}>
                <TicketsPage />
              </Route>
              <Route path="/p/">
                <People />
              </Route>
              <Route
                path={['/workspace/bounties/:uuid', '/workspace/bounties/:uuid/bounty/:bountyId']}
                exact
              >
                <WorkspaceTicketsPage />
              </Route>
              <Route path="/workspace/:workspaceId/ticket/:ticketId">
                <WorkspaceTicketView />
              </Route>
              <Route path="/workspace/:workspaceId/ticket">
                <WorkspaceTicketCreateView />
              </Route>
              <Route path="/workspace/:uuid/planner">
                <WorkSpacePlanner />
              </Route>
              <Route path="/workspace/:uuid/activities">
                <Activities />
              </Route>
              <Route path="/workspace/:workspace_uuid/feature_backlog">
                <FeatureBacklogView />
              </Route>
              <Route path="/workspace/:workspace_uuid/feature/:feature_uuid">
                <HiveFeaturesView />
              </Route>
              <Route path="/workspace/:uuid/hivechat/:chatId">
                <HiveChatView />
              </Route>
              <Route path="/hivechat/:uuid/build">
                <HiveBuildView />
              </Route>
              <Route path="/workspace/:uuid">
                <WorkspaceMission />
              </Route>
              <Route path="/feature/:feature_uuid/phase/:phase_uuid/planner">
                <PhasePlannerView />
              </Route>
              <Route path="/feature/:feature_uuid/stories/:socket_id?">
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
            </Switch>
          </MainLayout>
        </Route>
      </Switch>
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
