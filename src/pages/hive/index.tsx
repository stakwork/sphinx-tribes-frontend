import React, { useEffect, useState, useCallback } from 'react';
import { useStores } from 'store';
import styled from 'styled-components';
import { EuiLoadingSpinner } from '@elastic/eui';
import NoResults from 'people/utils/NoResults';
import {
  WorkspaceHeadWrap,
  WorkspaceContainer,
  ButtonIconLeft,
  IconImg,
  WorkspaceActionWrap,
  WorkspaceData,
  WorkspaceImg,
  WorkspaceText,
  WorkspaceWrap,
  Container
} from 'people/widgetViews/WorkspaceView';
import { Workspace } from 'store/interface';
import WorkspaceBudget from 'people/widgetViews/workspace/WorkspaceBudget';
import AdminAccessDenied from '../superadmin/accessDenied';
import avatarIcon from '../../public/static/profile_avatar.svg';

const Wrap = styled.body`
  height: 100%; /* Set a fixed height for the container */
  width: 70vw;
  overflow-y: auto; /* Enable vertical scrolling */
  align-items: center;
  margin: 0px auto;
  padding: 4rem 0;

  @media only screen and (max-width: 800px) {
    padding: 1.25rem;
    width: 90vw;
  }

  @media only screen and (max-width: 600px) {
    padding: 1rem;
    width: 95vw;
  }
`;

const LoaderContainer = styled.div`
  height: 100%;
  width: 100vw;
  display: flex;
  flex-direction: column;
  //   margin: 0px auto;
  justify-content: center;
  align-items: center;
`;

export const Hive = () => {
  //Todo: Remove all comments when metrcis development is done
  const { main, ui } = useStores();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setIsLoading] = useState(false);

  const user_pubkey = ui.meInfo?.owner_pubkey;

  const getIsSuperAdmin = useCallback(async () => {
    const isSuperAdmin = await main.getSuperAdmin();
    setIsSuperAdmin(isSuperAdmin);
  }, [main]);

  const getUserWorkspaces = useCallback(async () => {
    setIsLoading(true);
    if (ui.selectedPerson) {
      await main.getUserWorkspaces(ui.selectedPerson);
    }
    setIsLoading(false);
  }, [main, ui.selectedPerson]);

  useEffect(() => {
    getIsSuperAdmin();
    getUserWorkspaces();
  }, [getIsSuperAdmin, getUserWorkspaces]);

  // renders org as list item
  const workspaceUi = (space: any, key: number) => {
    const btnDisabled = (!space.bounty_count && space.bount_count !== 0) || !space.uuid;
    return (
      <WorkspaceWrap key={key}>
        <WorkspaceData className="org-data">
          <WorkspaceImg src={space.img || avatarIcon} />
          <WorkspaceBudget org={space} user_pubkey={user_pubkey ?? ''} />
          <WorkspaceActionWrap>
            <ButtonIconLeft
              disabled={btnDisabled}
              onClick={() => window.open(`/workspace/${space.uuid}/activities`, '_target')}
            >
              View Activities
              <IconImg src="/static/open_in_new_grey.svg" alt="open_in_new_tab" />
            </ButtonIconLeft>
          </WorkspaceActionWrap>
        </WorkspaceData>
      </WorkspaceWrap>
    );
  };

  // renders list of orgs with header
  const renderWorkspaces = () => {
    if (main.workspaces.length) {
      return (
        <div className="workspaces">
          <WorkspaceHeadWrap>
            <WorkspaceText>Workspaces</WorkspaceText>
          </WorkspaceHeadWrap>
          <WorkspaceContainer>
            {main.workspaces.map((space: Workspace, i: number) => workspaceUi(space, i))}
          </WorkspaceContainer>
        </div>
      );
    } else {
      return (
        <Container>
          <NoResults />
        </Container>
      );
    }
  };

  return (
    <Wrap>
      <Container>
        {loading && (
          <LoaderContainer>
            <EuiLoadingSpinner size="l" />
          </LoaderContainer>
        )}
        {!isSuperAdmin ? <AdminAccessDenied /> : <>{renderWorkspaces()}</>}
      </Container>
    </Wrap>
  );
};
