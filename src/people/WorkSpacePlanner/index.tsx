import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams } from 'react-router-dom';
import { EuiLoadingSpinner } from '@elastic/eui';
import styled from 'styled-components';
import { useStores } from '../../store';
import { colors } from '../../config';
import { WorkspacePlannerHeader } from './WorkspacePlannerHeader';

const PlannerContainer = styled.div`
  padding: 0;
  height: calc(100vh - 65px);
  background: ${colors.light.grayish.G950};
  overflow-y: auto;
`;

const ContentArea = styled.div`
  width: 90%;
  margin: 20px auto;
  background: white;
  border-radius: 8px;
  min-height: 500px;
  text-align: center;
  padding: 20px;
`;

const WorkspacePlanner = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const { main } = useStores();
  const [loading, setLoading] = useState(true);
  const [workspaceData, setWorkspaceData] = useState<any>(null);

  useEffect(() => {
    const fetchWorkspaceData = async () => {
      if (!uuid) return;
      const data = await main.getUserWorkspaceByUuid(uuid);
      setWorkspaceData(data);
      setLoading(false);
    };

    fetchWorkspaceData();
  }, [main, uuid]);

  if (loading) {
    return (
      <PlannerContainer style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <EuiLoadingSpinner size="xl" />
      </PlannerContainer>
    );
  }

  return (
    <PlannerContainer>
      <WorkspacePlannerHeader workspace_uuid={uuid} workspaceData={workspaceData} />
      <ContentArea>
        <h1>Welcome to the new Workspace Planner</h1>
      </ContentArea>
    </PlannerContainer>
  );
};

export default observer(WorkspacePlanner);
