import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useFeatureFlag } from '../../../hooks/useFeatureFlag';

const PanelWrapper = styled.div<{ collapsed: boolean }>`
  position: fixed;
  bottom: 0;
  left: 49%;
  width: 77%;
  height: ${(props: any) => (props.collapsed ? '12vh' : '30vh')};
  max-height: 50vh;
  background-color: #111827;
  color: white;
  z-index: 50;
  border-top: 1px solid #1f2937;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.2);
  transition: height 0.3s ease;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: #1f2937;
  border-bottom: 1px solid #374151;
`;

const Title = styled.h2`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
`;

const CollapseButton = styled.button`
  padding: 4px 8px;
  font-size: 12px;
  background-color: #374151;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #4b5563;
  }
`;

const ContentArea = styled.div<{ collapsed: boolean }>`
  padding: ${(props: any) => (props.collapsed ? '8px' : '16px')};
  overflow-y: ${(props: any) => (props.collapsed ? 'hidden' : 'auto')};
  flex-grow: 1;
  background-color: #1a202c;
  display: ${(props: any) => (props.collapsed ? 'flex' : 'block')};
  align-items: ${(props: any) => (props.collapsed ? 'center' : 'unset')};
  color: ${(props: any) => (props.collapsed ? '#9ca3af' : 'inherit')};
`;

const PlaceholderText = styled.p`
  margin: 0;
  color: #9ca3af;
  font-style: italic;
`;

const Footer = styled.div`
  display: flex;
  color: #6b7a8d;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: #1f2937;
  border-top: 1px solid #374151;
`;

export interface LogEntry {
  timestamp: string;
  projectId: string;
  ticketUUID: string;
  message: string;
}

interface Connection {
  projectId: string;
  ticketUUID: string;
  websocket: WebSocket;
  status: 'disconnected' | 'connected' | 'error';
}

interface StakworkLogsPanelProps {
  swwfLinks: Record<string, string>;
  logs: LogEntry[];
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>;
}

const StakworkLogsPanel = ({ swwfLinks, logs, setLogs }: StakworkLogsPanelProps) => {
  const [collapsed, setCollapsed] = useState(true);
  const [connections, setConnections] = useState<Connection[]>([]);
  const { isEnabled: isVerboseLoggingEnabled } = useFeatureFlag('verbose_logging_sw');

  if (isVerboseLoggingEnabled) {
    console.log('TicketBuilder Phase planner', logs);
  }

  useEffect(() => {
    const connectToLogWebSocket = (projectId: string, ticketUUID: string) => {
      const ws = new WebSocket('wss://jobs.stakwork.com/cable?channel=ProjectLogChannel');

      ws.onopen = () => {
        const command = {
          command: 'subscribe',
          identifier: JSON.stringify({ channel: 'ProjectLogChannel', id: projectId })
        };
        ws.send(JSON.stringify(command));
      };

      ws.onmessage = (event: any) => {
        const data = JSON.parse(event.data);
        if (data.type === 'ping') return;

        if (isVerboseLoggingEnabled) {
          console.log('TicketBuilder Phase planner data', data);
        }

        const messageData = data?.message;
        if (
          messageData &&
          (messageData.type === 'on_step_start' || messageData.type === 'on_step_complete')
        ) {
          setLogs((prev: LogEntry[]) => [
            {
              timestamp: new Date().toISOString(),
              projectId,
              ticketUUID,
              message: messageData.message
            },
            ...prev
          ]);
        }
      };

      ws.onerror = () => {
        setConnections((prev: Connection[]) =>
          prev.map((conn: Connection) =>
            conn.projectId === projectId ? { ...conn, status: 'error' } : conn
          )
        );
      };

      ws.onclose = () => {
        setConnections((prev: Connection[]) =>
          prev.map((conn: Connection) =>
            conn.projectId === projectId ? { ...conn, status: 'disconnected' } : conn
          )
        );
      };

      setConnections((prev: Connection[]) => [
        ...prev,
        { projectId, ticketUUID, websocket: ws, status: 'connected' }
      ]);
    };

    Object.entries(swwfLinks).forEach(([ticketUUID, projectId]: [string, string]) => {
      if (!connections.some((conn: Connection) => conn.projectId === projectId)) {
        connectToLogWebSocket(projectId, ticketUUID);
      }
    });

    return () => {
      connections.forEach((conn: Connection) => {
        if (!Object.values(swwfLinks).includes(conn.projectId)) {
          conn.websocket.close();
        }
      });
    };
  }, [connections, swwfLinks, isVerboseLoggingEnabled, setLogs]);

  return (
    <PanelWrapper collapsed={collapsed}>
      <Header>
        <Title>Hive - Chain of Thought</Title>
        <CollapseButton onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? 'Expand' : 'Collapse'}
        </CollapseButton>
      </Header>
      <ContentArea collapsed={collapsed}>
        {collapsed ? (
          logs.length ? (
            <div>
              [{logs[0].timestamp}] {logs[0].projectId}: {logs[0].message}
            </div>
          ) : (
            <PlaceholderText>Waiting for logs...</PlaceholderText>
          )
        ) : logs.length ? (
          logs.map((log: LogEntry, index: number) => (
            <div key={index}>
              [{log.timestamp}] {log.projectId}: {log.message}
            </div>
          ))
        ) : (
          <PlaceholderText>Waiting for logs...</PlaceholderText>
        )}
      </ContentArea>
      <Footer>Active Connections: {connections.length}</Footer>
    </PanelWrapper>
  );
};

export default StakworkLogsPanel;
