import React, { useEffect, useState, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useHistory, useParams } from 'react-router-dom';
import { ChatMessage } from 'store/interface';
import { useStores } from 'store';
import { createSocketInstance } from 'config/socket';
import { SOCKET_MSG } from 'config/socket';
import styled from 'styled-components';
import { EuiLoadingSpinner } from '@elastic/eui';
import MaterialIcon from '@material/react-material-icon';
import { renderMarkdown } from '../utils/RenderMarkdown.tsx';

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

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 40px);
  padding: 20px;
  overflow-y: scroll;
  overflow-x: hidden;
  background: var(--Search-bar-background, #f2f3f5);
`;

const ChatBody = styled.div`
  display: flex;
  flex-direction: column;
  padding: 15px 60px !important;
  height: calc(100vh - 40px);
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

const TitleInput = styled.input`
  font-size: 1.1rem;
  font-weight: 500;
  color: #5f6368;
  border: 2px solid #e4e7eb;
  padding: 4px 8px;
  width: 400px;
  border-radius: 4px;
  background: white;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: #848484;
  }

  &:focus {
    border-color: #4285f4;
    outline: none;
  }
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
`;

const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 70%;
  margin: 12px 0;
  padding: 12px 16px;
  border-radius: 12px;
  background-color: ${(props: MessageBubbleProps) => (props.isUser ? '#808080' : '#F2F3F5')};
  color: ${(props: MessageBubbleProps) => (props.isUser ? 'white' : '#202124')};
  align-self: ${(props: MessageBubbleProps) => (props.isUser ? 'flex-end' : 'flex-start')};
  word-wrap: break-word;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  margin-left: ${(props: MessageBubbleProps) => (props.isUser ? 'auto' : '0')};
  margin-right: ${(props: MessageBubbleProps) => (props.isUser ? '0' : 'auto')};
`;

const InputContainer = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-radius: 0 0 8px 8px;
  margin-top: 15px;
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
  align-self: flex-end;
  transition: background-color 0.2s;
  margin-bottom: 13px;

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

export const HiveChatView: React.FC = observer(() => {
  const { uuid, chatId } = useParams<RouteParams>();
  const { chat, ui } = useStores();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [websocketSessionId, setWebsocketSessionId] = useState('');
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState('Talk to Hive - Chat');
  const history = useHistory();
  const socketRef = useRef<WebSocket | null>(null);

  const handleBackClick = () => {
    history.push(`/workspace/${uuid}`);
  };

  const refreshChatHistory = useCallback(async () => {
    try {
      await chat.loadChatHistory(chatId);
      if (chatHistoryRef.current) {
        chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
      }
    } catch (error) {
      console.error('Error refreshing chat history:', error);
      ui.setToasts([
        {
          title: 'Error',
          color: 'danger',
          text: 'Failed to refresh chat history'
        }
      ]);
    }
  }, [chat, chatId, ui]);

  useEffect(() => {
    const initializeChat = async () => {
      setLoading(true);
      try {
        if (chatId) {
          await chat.loadChatHistory(chatId);

          const currentChat = chat.getChat(chatId);
          if (currentChat?.title) {
            setTitle(currentChat.title);
          }
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

  useEffect(() => {
    const socket = createSocketInstance();
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('Socket connected in Hive Chat');
    };

    socket.onmessage = async (event: MessageEvent) => {
      console.log('Raw websocket message received:', event.data);

      try {
        const data = JSON.parse(event.data);
        console.log('Parsed websocket message:', data);

        if (data.msg === SOCKET_MSG.user_connect) {
          const sessionId = data.body;
          setWebsocketSessionId(sessionId);
          console.log(`Websocket Session ID: ${sessionId}`);
          await refreshChatHistory();
        } else if (data.action === 'message' && data.chatMessage) {
          chat.addMessage(data.chatMessage);
          await refreshChatHistory();
        } else if (data.action === 'process' && data.chatMessage) {
          chat.updateMessage(data.chatMessage.id, data.chatMessage);
          await refreshChatHistory();
        }
      } catch (error) {
        console.error('Error processing websocket message:', error);
      }
    };

    socket.onclose = () => {
      console.log('Socket disconnected in Hive Chat');
    };

    socket.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
      ui.setToasts([
        {
          title: 'Connection Error',
          color: 'danger',
          text: 'Failed to connect to chat server'
        }
      ]);
    };

    return () => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    };
  }, [ui, refreshChatHistory, chatId, chat]);

  useEffect(() => {
    const loadInitialChat = async () => {
      setLoading(true);
      try {
        await refreshChatHistory();
      } catch (err) {
        console.error('Error loading initial chat:', err);
        setError('Failed to load chat history');
      } finally {
        setLoading(false);
      }
    };

    if (chatId) {
      loadInitialChat();
    }
  }, [chatId, refreshChatHistory]);

  const messages = chat.chatMessages[chatId];

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      const sentMessage = await chat.sendMessage(chatId, message, websocketSessionId, uuid);
      if (sentMessage) {
        chat.addMessage(sentMessage);
        setMessage('');
        const textarea = document.querySelector('textarea');
        if (textarea) {
          textarea.style.height = '60px';
        }
        if (chatHistoryRef.current) {
          chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
      }
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
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTitleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
  };

  const handleTitleBlur = async () => {
    try {
      const updatedChat = await chat.updateChat(chatId, title);
      if (updatedChat) {
        ui.setToasts([
          {
            title: 'Success',
            color: 'success',
            text: 'Chat title updated successfully'
          }
        ]);
      } else {
        throw new Error('Failed to update chat title');
      }
    } catch (error) {
      console.error('Error updating chat title:', error);
      ui.setToasts([
        {
          title: 'Error',
          color: 'danger',
          text: 'Failed to update chat title'
        }
      ]);
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
          style={{
            fontSize: 25,
            cursor: 'pointer',
            color: '#5f6368'
          }}
        />
        <TitleInput
          value={title}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          placeholder="Enter chat title..."
        />
      </Header>
      <ChatBody>
        <ChatHistory ref={chatHistoryRef}>
          {messages.map((msg: ChatMessage) => (
            <MessageBubble key={msg.id} isUser={msg.role === 'user'}>
              {renderMarkdown(msg.message, {
                codeBlockBackground: '#282c34',
                textColor: '#abb2bf',
                borderColor: '#444',
                codeBlockFont: 'Courier New'
              })}
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

export default HiveChatView;
