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

const LOG_PREVIEW_CHAR_LIMIT = 2000;

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

const getLogPreview = (logText: string): { text: string; truncated: boolean } => {
  if (logText.length <= LOG_PREVIEW_CHAR_LIMIT) {
    return { text: logText, truncated: false };
  }

  const hiddenCharacterCount = logText.length - LOG_PREVIEW_CHAR_LIMIT;

  return {
    text: `${logText.slice(
      0,
      LOG_PREVIEW_CHAR_LIMIT
    )}\n\n... log truncated. ${hiddenCharacterCount} characters hidden.`,
    truncated: true
  };
};

const LogEntry: React.FC<{ log: SSEMessage }> = ({ log }) => {
  const [expanded, setExpanded] = useState(false);
  const fullLogText = stringifyLogEvent(log.event);
  const preview = getLogPreview(fullLogText);
  const visibleLogText = expanded || !preview.truncated ? fullLogText : preview.text;

  return (
    <LogItem>
      <LogText>{visibleLogText}</LogText>
      {preview.truncated && (
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
