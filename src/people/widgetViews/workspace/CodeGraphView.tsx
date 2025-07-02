import React, { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useStores } from 'store';
import SidebarComponent from 'components/common/SidebarComponent';
import ActivitiesHeader from './Activities/header';
import { useBrowserTabTitle } from 'hooks';
import { EuiLoadingSpinner } from '@elastic/eui';
import { Body } from 'pages/tickets/style';
import { FullNoBudgetWrap, FullNoBudgetText } from './style';
import MaterialIcon from '@material/react-material-icon';
import { userHasRole } from 'helpers';

const MainContainer = styled.div<{ collapsed: boolean }>`
  flex-grow: 1;
  transition:
    margin-left 0.3s ease-in-out,
    width 0.3s ease-in-out;
  margin-left: ${({ collapsed }) => (collapsed ? '50px' : '250px')};
  overflow: hidden;
`;

const ContentContainer = styled.div`
  padding: 2rem;
  background-color: #f8f9fa;
  height: calc(100vh - 120px);
  overflow-y: auto;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: 1rem;
`;

interface WorkspaceParams {
  workspaceId: string;
}

const CodeGraphView: React.FC = observer(() => {
  const { workspaceId } = useParams<WorkspaceParams>();
  const { ui, main } = useStores();
  const [collapsed, setCollapsed] = useState(false);
  const [workspaceData, setWorkspaceData] = useState<any>(null);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [permissionsChecked, setPermissionsChecked] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  useBrowserTabTitle('Code Graph');

  useEffect(() => {
    const handleCollapseChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ collapsed: boolean }>;
      setCollapsed(customEvent.detail.collapsed);
    };
    window.addEventListener('sidebarCollapse', handleCollapseChange as EventListener);
    return () => {
      window.removeEventListener('sidebarCollapse', handleCollapseChange as EventListener);
    };
  }, []);

  const checkPermissions = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const data = await main.getUserWorkspaceByUuid(workspaceId);
      setWorkspaceData(data);
      if (ui.meInfo?.owner_pubkey) {
        const roles = await main.getUserRoles(workspaceId, ui.meInfo.owner_pubkey);
        setUserRoles(roles);
      }
    } catch (error) {
      console.error('Error fetching workspace data:', error);
    } finally {
      setPermissionsChecked(true);
      setLoading(false);
    }
  }, [workspaceId, main, ui.meInfo]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const editWorkspaceDisabled = React.useMemo(() => {
    if (!ui.meInfo) return true;
    if (!workspaceData?.owner_pubkey) return false;
    const isWorkspaceAdmin = workspaceData.owner_pubkey === ui.meInfo.owner_pubkey;
    return (
      !isWorkspaceAdmin &&
      !userHasRole(main.bountyRoles, userRoles, 'EDIT ORGANIZATION') &&
      !userHasRole(main.bountyRoles, userRoles, 'ADD USER') &&
      !userHasRole(main.bountyRoles, userRoles, 'VIEW REPORT')
    );
  }, [workspaceData, ui.meInfo, userRoles, main.bountyRoles]);

  if (loading || !permissionsChecked) {
    return (
      <Body style={{ justifyContent: 'center', alignItems: 'center' }}>
        <EuiLoadingSpinner size="xl" />
      </Body>
    );
  }

  if (editWorkspaceDisabled) {
    return (
      <FullNoBudgetWrap>
        <MaterialIcon icon={'lock'} style={{ fontSize: 30, cursor: 'pointer', color: '#ccc' }} />
        <FullNoBudgetText>
          You have restricted permissions and you are unable to view this page. Reach out to the
          workspace admin to get them updated.
        </FullNoBudgetText>
      </FullNoBudgetWrap>
    );
  }

  return (
    <>
      <SidebarComponent uuid={workspaceId} />
      <MainContainer collapsed={collapsed}>
        <ActivitiesHeader uuid={workspaceId} />
        <ContentContainer>
          <Title>Code Graph</Title>
          <p>This is the Code Graph page. Content will be added here.</p>
        </ContentContainer>
      </MainContainer>
    </>
  );
});

export default CodeGraphView;
