import SidebarComponent from 'components/common/SidebarComponent';
import React from 'react';
import { useParams } from 'react-router-dom';
import { MainContainer } from 'pages/superadmin/header/components/Calendar/CalendarStyles';
import { HiveChatHistoryView } from './HiveChatHistoryView';

export function HiveChatHistory() {
  const { workspaceId } = useParams<{ workspaceId: string }>();

  return (
    <main>
      <SidebarComponent uuid={workspaceId} />
      <MainContainer>
        <HiveChatHistoryView />
      </MainContainer>
    </main>
  );
}
