/* eslint-disable @typescript-eslint/typedef */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useHistory, useParams } from 'react-router-dom';
import { Chat, ChatMessage } from 'store/interface';
import { useStores } from 'store';
import styled from 'styled-components';
import { EuiLoadingSpinner } from '@elastic/eui';
import MaterialIcon from '@material/react-material-icon';
import { mainStore } from '../../store/main.ts';
import { ModelOption, ModelSelector } from '../hiveChat/modelSelector.tsx';
import { createSocketInstance, SOCKET_MSG } from '../../config/socket.ts';

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

const Select = styled.select`
  padding: 15px 10px;
  margin-right: 10px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #ccc;
  background-color: #fff;
  cursor: pointer;
`;

const connectToLogWebSocket = (
  projectId: string,
  chatId: string,
  setLogs: (update: (prevLogs: LogEntry[]) => LogEntry[]) => void
) => {
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

    const messageData = data?.message;

    if (
      messageData &&
      (messageData.type === 'on_step_start' || messageData.type === 'on_step_complete')
    ) {
      setLogs((prevLogs: LogEntry[]) => [
        ...prevLogs,
        { timestamp: new Date().toISOString(), projectId, chatId, message: messageData.message }
      ]);
    }
  };

  ws.onerror = (error: any) => console.error('WebSocket error123:', error);

  return ws;
};

export const HiveBuildView: React.FC = observer(() => {
  const { uuid, chatId } = useParams<RouteParams>();
  const { chat, ui } = useStores();
  const [chats, setChats] = React.useState<Chat[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [websocketSessionId, setWebsocketSessionId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isChainVisible, setIsChainVisible] = useState(false);
  const [lastLogLine, setLastLogLine] = useState('');
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const [selectedChatId, setSelectedChatId] = useState(chatId);
  const [selectedModel, setSelectedModel] = useState<ModelOption>({
    label: 'Open AI - 4o',
    value: 'gpt-4o'
  });
  const history = useHistory();

  const title = 'Build with Hive';

  const handleBackClick = () => {
    history.push(`/workspace/${uuid}`);
  };

  useEffect(() => {
    const initializeChat = async () => {
      setLoading(true);
      try {
        if (selectedChatId) {
          await chat.loadChatHistory(selectedChatId);
        }
      } catch (err) {
        console.error('Error initializing chat:', err);
        setError('Failed to load chat history');
      } finally {
        setLoading(false);
      }
    };

    initializeChat();
  }, [selectedChatId, chat]);

  const messages = chat.chatMessages[selectedChatId] || [];

  const refreshChatHistory = useCallback(async () => {
    try {
      await chat.loadChatHistory(selectedChatId);
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
    // eslint-disable-next-line prefer-const
    let socket = createSocketInstance();

    socket.onmessage = async (event: MessageEvent) => {
      console.log('Raw websocket message received:', event.data);

      try {
        const data = JSON.parse(event.data);
        console.log('Parsed websocket message:', data);

        if (data.msg === SOCKET_MSG.user_connect) {
          const sessionId = data.body;
          setWebsocketSessionId(sessionId);
          console.log(`Websocket Session ID: ${sessionId}`);
        } else if (data.action === 'swrun' && data.message) {
          const match = data.message.match(/\/projects\/([^/]+)/);
          if (match && match[1]) {
            const projectID = match[1];
            setProjectId(projectID);
            console.log(`Project ID: ${projectID}`);
            setIsChainVisible(true);
            setLogs([]);
            setLastLogLine('');
          }
        } else if (data.action === 'message' && data.chatMessage) {
          chat.addMessage(data.chatMessage);
          setIsChainVisible(false);
          setLogs([]);
          setLastLogLine('');
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
  }, [ui, refreshChatHistory, selectedChatId, chat]);

  useEffect(() => {
    const ws = connectToLogWebSocket(projectId, chatId, setLogs);

    return () => {
      ws.close();
    };
  }, [projectId, selectedChatId]);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      let socketId = websocketSessionId;
      if (socketId === '') {
        socketId = localStorage.getItem('websocket_token') || '';
      }

      const sentMessage = await chat.sendMessage(
        selectedChatId,
        message,
        selectedModel.value,
        socketId,
        uuid,
        undefined
      );

      await mainStore.createStakworkProject(message);

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
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (logs.length > 0) {
      setLastLogLine(logs[logs.length - 1]?.message || '');
    }
  }, [logs]);

  useEffect(() => {
    const loadChats = async () => {
      try {
        const workspaceChats = await chat.getWorkspaceChats(uuid);
        if (workspaceChats && workspaceChats.length > 0) {
          const sortedChats = workspaceChats
            .filter((chat: Chat) => chat && chat.id)
            .sort((a: Chat, b: Chat) => {
              const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
              const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
              return dateB - dateA;
            });
          setChats(sortedChats);
        }
      } catch (error) {
        console.error('Error loading chats:', error);
        ui.setToasts([
          {
            title: 'Error',
            color: 'danger',
            text: 'Failed to load chats.'
          }
        ]);
      }
    };
    loadChats();
  }, [uuid, chat, ui]);

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
        <Select value={selectedChatId} onChange={(e) => setSelectedChatId(e.target.value)}>
          {chats.map((chat) => (
            <option key={chat.id} value={chat.id}>
              {chat.id}
            </option>
          ))}
        </Select>
        <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
      </Header>
      <ChatBody>
        <ChatHistory ref={chatHistoryRef}>
          <MessageBubble isUser={false}>What would you like to build?</MessageBubble>
          {messages.map((msg: ChatMessage) => (
            <MessageBubble key={msg.id} isUser={msg.role === 'user'}>
              {msg.message}
            </MessageBubble>
          ))}
          {isChainVisible && (
            <MessageBubble isUser={false}>
              <p>
                {lastLogLine
                  ? lastLogLine
                  : `Hi ${ui.meInfo?.owner_alias}, I'm on it. Let me generate a PR.`}
              </p>
            </MessageBubble>
          )}
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
