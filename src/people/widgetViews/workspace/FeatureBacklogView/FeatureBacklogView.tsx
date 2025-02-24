import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import MaterialIcon from '@material/react-material-icon';
import styled from 'styled-components';
import { useParams, useHistory } from 'react-router-dom';
import SidebarComponent from 'components/common/SidebarComponent';
import ActivitiesHeader from '../HiveFeaturesView/header';

const MainContainer = styled.div`
  flex-grow: 1;
  transition:
    margin-left 0.3s ease-in-out,
    width 0.3s ease-in-out;
  overflow: hidden;
`;

const BacklogContainer = styled.div<{ collapsed: boolean }>`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  padding: 3.5rem;
  background-color: #f8f9fa;
  height: calc(100vh - 120px);
  overflow-y: auto;
  margin-top: 50px;
  margin-left: ${({ collapsed }: { collapsed: boolean }) => (collapsed ? '50px' : '250px')};
  transition: margin-left 0.3s ease-in-out;
`;

export const FeatureHeadNameWrap = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 35rem;
  gap: 0.8rem;
  width: 80rem;
  @media only screen and (max-width: 500px) {
    margin-bottom: 20px;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 500;
`;

const FeatureBacklogView = observer(() => {
  const params = useParams<{
    uuid?: string;
    workspace_uuid?: string;
  }>();

  const workspaceUuid = params.workspace_uuid ?? '';
  const [collapsed, setCollapsed] = useState(false);
  const history = useHistory();

  React.useEffect(() => {
    const handleCollapseChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ collapsed: boolean }>;
      setCollapsed(customEvent.detail.collapsed);
    };

    window.addEventListener('sidebarCollapse', handleCollapseChange as EventListener);

    return () => {
      window.removeEventListener('sidebarCollapse', handleCollapseChange as EventListener);
    };
  }, []);

  return (
    <MainContainer>
      <SidebarComponent uuid={workspaceUuid} />
      <ActivitiesHeader uuid={workspaceUuid} collapsed={collapsed} />
      <BacklogContainer collapsed={collapsed}>
        <FeatureHeadNameWrap>
          <MaterialIcon
            onClick={() => history.goBack()}
            icon={'arrow_back'}
            style={{
              fontSize: 25,
              cursor: 'pointer'
            }}
          />
          <Title>Feature Backlog</Title>
        </FeatureHeadNameWrap>
      </BacklogContainer>
    </MainContainer>
  );
});

export default FeatureBacklogView;
