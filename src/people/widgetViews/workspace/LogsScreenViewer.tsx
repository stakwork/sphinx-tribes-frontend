import React, { useState } from 'react';
import styled from 'styled-components';
import MaterialIcon from '@material/react-material-icon';

const CodeViewer = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  border: 1px solid #ddd;
  background-color: #1e1e1e;
  color: white;
  padding: 12px;
  min-height: 65vh;
  max-height: 80vh;
  z-index: 0;
  position: relative;
`;

const CopyButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
  transition: color 0.3s;

  &:hover {
    color: #aaa;
  }
`;

const LogItem = styled.div`
  padding: 8px;
  border-bottom: 1px solid #444;
`;

interface SSEEvent {
  event_type: string;
  id: string;
  raw: string;
}

interface SSEMessage {
  id: string;
  created_at: string;
  updated_at: string;
  event: SSEEvent;
  chat_id: string;
  from: string;
  to: string;
  status: string;
}

interface LogsScreenViewerProps {
  sseLogs: SSEMessage[];
}

const LogsScreenViewer: React.FC<LogsScreenViewerProps> = ({ sseLogs }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const logText = sseLogs.map((log) => JSON.stringify(log.event)).join('\n');
    navigator.clipboard.writeText(logText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <CodeViewer data-testid="logs-screen-viewer-component">
      <CopyButton onClick={copyToClipboard}>
        {copied ? <MaterialIcon icon="check" /> : <MaterialIcon icon="content_copy" />}
      </CopyButton>
      {sseLogs.length > 0 ? (
        sseLogs.map((log) => <LogItem key={log.id}>{JSON.stringify(log.event)}</LogItem>)
      ) : (
        <LogItem>No logs available.</LogItem>
      )}
    </CodeViewer>
  );
};

export default LogsScreenViewer;
