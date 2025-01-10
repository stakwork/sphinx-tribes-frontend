import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const PanelWrapper = styled.div<{ collapsed: boolean }>`
  position: fixed;
  bottom: 0;
  left: 49%;
  width: 77%;
  height: ${(props: any) => (props.collapsed ? '8vh' : '30vh')};
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
  font-size: 14px;
  font-weight: 600;
  margin: 0;
`;

const StatusIndicator = styled.div<{ status: string }>`
  display: flex;
  align-items: center;

  .circle {
    margin-left: 8px;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    background-color: ${(props: any) =>
      props.status === 'disconnected'
        ? '#EF4444'
        : props.status === 'connected'
        ? '#10B981'
        : '#F59E0B'};
    color: white;
    text-transform: capitalize;
  }
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

const ContentArea = styled.div`
  padding: 16px;
  overflow-y: auto;
  flex-grow: 1;
  background-color: #1a202c;
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

interface LogEntry {
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

const StakworkLogsPanel = ({ swwfLinks }: { swwfLinks: Record<string, string> }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

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
        const message = data?.message?.message;
        if (message) {
          setLogs((prev: any) => [
            ...prev,
            { timestamp: new Date().toISOString(), projectId, ticketUUID, message }
          ]);
        }
      };

      ws.onerror = () => {
        setConnections((prev: any) =>
          prev.map((conn: Connection) =>
            conn.projectId === projectId ? { ...conn, status: 'error' } : conn
          )
        );
      };

      ws.onclose = () => {
        setConnections((prev: any) =>
          prev.map((conn: Connection) =>
            conn.projectId === projectId ? { ...conn, status: 'disconnected' } : conn
          )
        );
      };

      setConnections((prev: any) => [
        ...prev,
        { projectId, ticketUUID, websocket: ws, status: 'connected' }
      ]);

      return ws;
    };

    const connectionsMap = new Map(connections.map((conn: Connection) => [conn.projectId, conn]));
    Object.entries(swwfLinks).forEach(([ticketUUID, projectId]: [string, string]) => {
      if (!connectionsMap.has(projectId)) {
        connectToLogWebSocket(projectId, ticketUUID);
      }
    });

    return () => {
      connections.forEach((conn: Connection) => conn.websocket?.close());
    };
  }, [connections, swwfLinks]);

  const overallStatus = connections.some((conn: Connection) => conn.status === 'connected')
    ? 'connected'
    : connections.some((conn: Connection) => conn.status === 'error')
    ? 'error'
    : 'disconnected';

  return (
    <PanelWrapper collapsed={collapsed}>
      <Header>
        <Title>Stakwork Project Logs</Title>
        <StatusIndicator status={overallStatus}>
          <div className="circle">{overallStatus}</div>
        </StatusIndicator>
        <CollapseButton onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? 'Expand' : 'Collapse'}
        </CollapseButton>
      </Header>
      {!collapsed && (
        <ContentArea>
          {logs.length ? (
            logs.map((log: LogEntry, index: number) => (
              <div key={index}>
                [{log.timestamp}] {log.projectId}: {log.message}
              </div>
            ))
          ) : (
            <PlaceholderText>Waiting for logs...</PlaceholderText>
          )}
        </ContentArea>
      )}
      <Footer>Active Connections: {connections.length}</Footer>
    </PanelWrapper>
  );
};

export default StakworkLogsPanel;
