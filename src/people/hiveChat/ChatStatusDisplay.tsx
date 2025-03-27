import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import { formatDistanceToNow } from 'date-fns';

const StatusContainer = styled.div<{ isError: boolean }>`
  position: relative;
  bottom: 0;
  left: 0;
  margin-top: 10px;
  border-radius: 8px;
  max-width: 70%;
  padding: 12px 16px;
  background-color: #f2f3f5;
  border-left: 5px solid ${(props) => (props.isError ? '#e53935' : '#2196f3')};
  font-size: 14px;
  word-wrap: break-word;
  white-space: pre-wrap;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StatusText = styled.div`
  color: #424242;
  display: flex;
  flex-direction: column;
  max-width: 90%;
`;

const TimeStamp = styled.span`
  color: #757575;
  font-size: 12px;
  margin-top: 4px;
  white-space: nowrap;
`;

interface ChatStatusDisplayProps {
  chatStatus: { status: string; message: string; updatedAt: string };
}

const ChatStatusDisplay: React.FC<ChatStatusDisplayProps> = observer(({ chatStatus }) => {
  if (!chatStatus) return null;

  const isError = chatStatus.status === 'error';
  const formattedTime = formatDistanceToNow(new Date(chatStatus.updatedAt), { addSuffix: true });

  return (
    <StatusContainer isError={isError}>
      <StatusText>
        <span>Hive: {chatStatus.message}</span>
        <TimeStamp>Last Update: {formattedTime}</TimeStamp>
      </StatusText>
    </StatusContainer>
  );
});

export default ChatStatusDisplay;
