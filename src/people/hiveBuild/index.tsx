/* eslint-disable @typescript-eslint/typedef */
import React, { useEffect, useState, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useHistory, useParams } from 'react-router-dom';
import { ChatMessage } from 'store/interface';
import { useStores } from 'store';
import styled from 'styled-components';
import { EuiLoadingSpinner } from '@elastic/eui';
import MaterialIcon from '@material/react-material-icon';
import { mainStore } from '../../store/main.ts';

interface RouteParams {
  uuid: string;
  chatId: string;
}

interface MessageBubbleProps {
  isUser: boolean;
}

interface SendButtonProps {
  disabled: boolean;
}

interface LogEntry {
  timestamp: string;
  projectId: string;
  chatId: string;
  message: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 0 20px;
  overflow: hidden;
  background: var(--Search-bar-background, #f2f3f5);
`;

const ChatBody = styled.div`
  display: flex;
  flex-direction: column;
  padding: 3px 60px 75px !important;
  flex: 1;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 16px 20px;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Title = styled.h2`
  font-size: 1.1rem;
  font-weight: 500;
  color: #5f6368;
  margin: 0;
  flex-grow: 1;
`;

const ChatHistory = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  background: white;
  margin: 1px 0;
  border-radius: 8px;
  min-height: 0;
`;

const MessageBubble = styled.div<MessageBubbleProps>`
  max-width: 70%;
  margin: 12px 0;
  padding: 20px 20px;
  border-radius: 16px;
  word-wrap: break-word;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  align-self: ${(props) => (props.isUser ? 'flex-end' : 'flex-start')};

  background-color: ${(props) => (props.isUser ? '#808080' : '#F2F3F5')};
  color: ${(props) => (props.isUser ? 'white' : '#202124')};
`;

const InputContainer = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-radius: 0 0 8px 8px;
  position: sticky;
  bottom: 0;
  margin: 0;
`;

const TextArea = styled.textarea`
  flex-grow: 1;
  padding: 12px;
  border: 2px solid #848484;
  border-radius: 8px;
  resize: none;
  min-height: 24px;
  max-height: 150px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 0;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: #4285f4;
  }

  &:focus {
    outline: none;
    border-color: #4285f4;
  }
`;

const SendButton = styled.button<{ disabled: boolean }>`
  padding: 8px 24px;
  background-color: ${(props: SendButtonProps) => (props.disabled ? '#e4e7eb' : '#4285f4')};
  color: ${(props: SendButtonProps) => (props.disabled ? '#9aa0a6' : 'white')};
  border: none;
  border-radius: 8px;
  cursor: ${(props: SendButtonProps) => (props.disabled ? 'not-allowed' : 'pointer')};
  font-weight: 500;
  align-self: center;
  height: fit-content;
  transition: background-color 0.2s;
  margin-bottom: 13px;
  margin: 0;

  &:hover:not(:disabled) {
    background-color: #3367d6;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

export const HiveBuildView: React.FC = observer(() => {
  const { uuid } = useParams<RouteParams>();
  const { chat, ui } = useStores();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const history = useHistory();

  const chatId = 'this is random id';
  const title = 'Build with Hive';

  const handleBackClick = () => {
    history.push(`/workspace/${uuid}`);
  };

  useEffect(() => {
    const initializeChat = async () => {
      setLoading(true);
      try {
        if (chatId) {
          await chat.loadChatHistory(chatId);
        }
      } catch (err) {
        console.error('Error initializing chat:', err);
        setError('Failed to load chat history');
      } finally {
        setLoading(false);
      }
    };

    initializeChat();
  }, [chatId, chat]);

  const messages = chat.chatMessages[chatId] || [];

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    const timestamp = new Date().toISOString();

    try {
      chat.addMessage({
        id: Date.now().toString(),
        chatId: chatId,
        message,
        role: 'user',
        timestamp,
        status: 'sent',
        source: 'user',
        workspaceUUID: uuid
      });

      await mainStore.createStakworkProject(message);
      setMessage('');

      chat.addMessage({
        id: (Date.now() + 1).toString(),
        chatId: chatId,
        message: "I'm on it. Let me generate a PR.",
        role: 'assistant',
        timestamp,
        status: 'sent',
        source: 'agent',
        workspaceUUID: uuid
      });

      await fetch('/api/generate-pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: message, uuid })
      });
    } catch (error) {
      console.error('Error sending message:', error);
      ui.setToasts([
        {
          title: 'Error',
          color: 'danger',
          text: 'Failed to send message'
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <EuiLoadingSpinner size="l" />
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Title>Error: {error}</Title>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <MaterialIcon
          onClick={handleBackClick}
          icon="arrow_back"
          style={{ fontSize: 25, cursor: 'pointer', color: '#5f6368' }}
        />
        <Title>{title}</Title>
      </Header>
      <ChatBody>
        <ChatHistory ref={chatHistoryRef}>
          <MessageBubble isUser={false}>What would you like to build?</MessageBubble>
          {messages.map((msg: ChatMessage) => (
            <MessageBubble key={msg.id} isUser={msg.role === 'user'}>
              {msg.message}
            </MessageBubble>
          ))}
        </ChatHistory>
        <InputContainer>
          <TextArea
            value={message}
            onChange={handleMessageChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isSending}
          />
          <SendButton onClick={handleSendMessage} disabled={!message.trim() || isSending}>
            Send
          </SendButton>
        </InputContainer>
      </ChatBody>
    </Container>
  );
});

export default HiveBuildView;
