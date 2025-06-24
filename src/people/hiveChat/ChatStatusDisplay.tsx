import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import { formatDistanceToNow } from 'date-fns';

const StatusContainer = styled.div<{ isError: boolean }>`
  width: 100%;
  padding: 12px 16px;
  background-color: #f2f3f5;
  border: 1px solid ${(props) => (props.isError ? '#e53935' : '#2196f3')};
  display: flex;
  align-items: center;
  border-radius: 8px;
  margin-top: auto;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
`;

const StatusText = styled.div`
  color: #424242;
  display: flex;
  gap: 10px;
  word-wrap: break-word;
  white-space: pre-wrap;
  max-width: 100%;
`;

interface ChatStatusDisplayProps {
  chatStatus: { status: string; message: string; updatedAt: string };
}

const ChatStatusDisplay: React.FC<ChatStatusDisplayProps> = observer(({ chatStatus }) => {
  if (!chatStatus) return null;

  const isError = chatStatus.status === 'error';
  const formattedTime = formatDistanceToNow(new Date(chatStatus.updatedAt), { addSuffix: true });

  return (
    <StatusContainer isError={isError} data-testid="chat-status-display-component">
      <StatusText>
        <strong>Hive:</strong> {chatStatus.message} Last Update: {formattedTime}
      </StatusText>
    </StatusContainer>
  );
});

export default ChatStatusDisplay;
