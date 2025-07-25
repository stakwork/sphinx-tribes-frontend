import React, { useState, useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import { formatDistanceToNow } from 'date-fns';

const StatusContainer = styled.div<{ isError: boolean }>`
  width: 100%;
  padding: 12px 16px;
  background-color: ${(props) => (props.isError ? '#FFF6F6' : '#F0F7FF')};
  border: 1px solid ${(props) => (props.isError ? '#e53935' : '#2196f3')};
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  margin-top: auto;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
`;

const StatusHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const StatusTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StatusText = styled.div<{ expanded: boolean }>`
  color: #424242;
  word-wrap: break-word;
  white-space: pre-wrap;
  width: 100%;
  margin-top: ${(props) => (props.expanded ? '10px' : '0')};
  line-height: 1.5;
  transition: all 0.2s ease;
`;

const TimeStamp = styled.span`
  color: #757575;
  font-size: 12px;
  margin-left: auto;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #2196f3;
  cursor: pointer;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;

  &:hover {
    background-color: rgba(33, 150, 243, 0.08);
  }
`;

const MessageContent = styled.div<{ expanded: boolean }>`
  overflow-wrap: break-word;
  max-height: ${(props) => (props.expanded ? '300px' : '1.5em')};
  overflow-y: ${(props) => (props.expanded ? 'auto' : 'hidden')};
  position: relative;
  transition: max-height 0.3s ease;
  padding-right: ${(props) => (props.expanded ? '10px' : '0')};

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
`;

const Fade = styled.div<{ show: boolean; isError: boolean }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px;
  background: linear-gradient(
    to bottom,
    transparent,
    ${(props) => (props.isError ? '#FFF6F6' : '#F0F7FF')}
  );
  pointer-events: none;
  display: ${(props) => (props.show ? 'block' : 'none')};
`;

const IconWrapper = styled.span<{ isError: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => (props.isError ? '#e53935' : '#2196f3')};
`;

interface ChatStatusDisplayProps {
  chatStatus: {
    status: string;
    message: string;
    updatedAt: string;
  };
  onClear?: () => void;
}

const ChatStatusDisplay: React.FC<ChatStatusDisplayProps> = observer(({ chatStatus, onClear }) => {
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [needsExpansion, setNeedsExpansion] = useState(false);

  if (!chatStatus?.message) return null;

  const isError = chatStatus.status === 'error';
  const formattedTime = formatDistanceToNow(new Date(chatStatus.updatedAt), { addSuffix: true });

  useEffect(() => {
    if (contentRef.current) {
      setNeedsExpansion(contentRef.current.scrollHeight > contentRef.current.clientHeight);
    }
  }, [chatStatus.message]);

  const toggleExpansion = () => {
    setExpanded(!expanded);
  };

  return (
    <StatusContainer isError={isError}>
      <StatusHeader>
        <StatusTitle>
          <IconWrapper isError={isError}>{isError ? '⚠️' : 'ℹ️'}</IconWrapper>
          <strong>Hive:</strong>
        </StatusTitle>

        <TimeStamp>{formattedTime}</TimeStamp>

        {needsExpansion && (
          <ToggleButton onClick={toggleExpansion}>
            {expanded ? 'Show less' : 'Show more'}
          </ToggleButton>
        )}

        {onClear && <ToggleButton onClick={onClear}>Clear</ToggleButton>}
      </StatusHeader>

      <StatusText expanded={expanded}>
        <MessageContent ref={contentRef} expanded={expanded}>
          {chatStatus.message}
          <Fade show={!expanded && needsExpansion} isError={isError} />
        </MessageContent>
      </StatusText>
    </StatusContainer>
  );
});

export default ChatStatusDisplay;
