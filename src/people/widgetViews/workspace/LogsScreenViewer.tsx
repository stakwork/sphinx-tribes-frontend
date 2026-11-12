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

const LogText = styled.pre`
  margin: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
  font-family: inherit;
`;

const LogToggleButton = styled.button`
  margin-top: 8px;
  padding: 0;
  border: none;
  background: transparent;
  color: #9ad1ff;
  cursor: pointer;
  font: inherit;

  &:hover {
    color: #c8e6ff;
    text-decoration: underline;
  }
`;

const LOG_RAW_PREVIEW_CHAR_LIMIT = 2000;

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

const stringifyLogEvent = (event: SSEEvent): string => {
  try {
    return JSON.stringify(event, null, 2);
  } catch {
    return String(event);
  }
};

const getRawPreview = (raw: string): { text: string; truncated: boolean; hiddenCount: number } => {
  if (raw.length <= LOG_RAW_PREVIEW_CHAR_LIMIT) {
    return { text: raw, truncated: false, hiddenCount: 0 };
  }

  return {
    text: raw.slice(0, LOG_RAW_PREVIEW_CHAR_LIMIT),
    truncated: true,
    hiddenCount: raw.length - LOG_RAW_PREVIEW_CHAR_LIMIT
  };
};

const getCollapsedLogText = (event: SSEEvent): { text: string; truncated: boolean } => {
  const rawPreview = getRawPreview(event.raw || '');
  const lines = [`event_type: ${event.event_type}`, `id: ${event.id}`, `raw: ${rawPreview.text}`];

  if (rawPreview.truncated) {
    lines.push(`... raw payload truncated. ${rawPreview.hiddenCount} characters hidden.`);
  }

  return {
    text: lines.join('\n'),
    truncated: rawPreview.truncated
  };
};

const LogEntry: React.FC<{ log: SSEMessage }> = ({ log }) => {
  const [expanded, setExpanded] = useState(false);
  const collapsedLog = getCollapsedLogText(log.event);
  const visibleLogText = expanded ? stringifyLogEvent(log.event) : collapsedLog.text;

  return (
    <LogItem>
      <LogText>{visibleLogText}</LogText>
      {collapsedLog.truncated && (
        <LogToggleButton onClick={() => setExpanded((current) => !current)}>
          {expanded ? 'Show less' : 'View full details'}
        </LogToggleButton>
      )}
    </LogItem>
  );
};

const LogsScreenViewer: React.FC<LogsScreenViewerProps> = ({ sseLogs }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const logText = sseLogs.map((log) => stringifyLogEvent(log.event)).join('\n');
    navigator.clipboard.writeText(logText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <CodeViewer>
      <CopyButton onClick={copyToClipboard}>
        {copied ? <MaterialIcon icon="check" /> : <MaterialIcon icon="content_copy" />}
      </CopyButton>
      {sseLogs.length > 0 ? (
        sseLogs.map((log) => <LogEntry key={log.id} log={log} />)
      ) : (
        <LogItem>No logs available.</LogItem>
      )}
    </CodeViewer>
  );
};

export default LogsScreenViewer;
