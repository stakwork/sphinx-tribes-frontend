/* eslint-disable @typescript-eslint/typedef */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams } from 'react-router-dom';
import hljs from 'highlight.js';
import { ChatMessage, Artifact, TextContent } from 'store/interface';
import { useStores } from 'store';
import { createSocketInstance } from 'config/socket';
import SidebarComponent from 'components/common/SidebarComponent.tsx';
import { SOCKET_MSG } from 'config/socket';
import styled from 'styled-components';
import { EuiLoadingSpinner } from '@elastic/eui';
import MaterialIcon from '@material/react-material-icon';
import { chatHistoryStore } from 'store/chat.ts';
import { renderMarkdown } from '../utils/RenderMarkdown.tsx';
import { UploadModal } from '../../components/UploadModal';
import { useFeatureFlag, useBrowserTabTitle } from '../../hooks';
import VisualScreenViewer from '../widgetViews/workspace/VisualScreenViewer.tsx';
import { ModelOption } from './modelSelector.tsx';
import { ActionArtifactRenderer } from './ActionArtifactRenderer';
import ThinkingModeToggle from './ThinkingModeToggle.tsx';
import ResizableDivider from './Resizer.tsx';

interface RouteParams {
  uuid: string;
  chatId: string;
}

interface MessageBubbleProps {
  isUser: boolean;
}

interface SendButtonProps {
  disabled: boolean;
  theme?: { isCompact?: boolean };
}

interface LogEntry {
  timestamp: string;
  projectId: string;
  chatId: string;
  message: string;
}

interface TabButtonProps {
  active: boolean;
  chatSectionWidth?: number;
  tabCount?: number;
}

const Container = styled.div<{ collapsed: boolean }>`
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 0 25px 0 35px;
  overflow: hidden;
  background: var(--Search-bar-background, #f2f3f5);
  margin-left: ${({ collapsed }: { collapsed: boolean }) => (collapsed ? '50px' : '250px')};
  transition: margin-left 0.3s ease-in-out;
`;

const ChatBodyWrapper = styled.div`
  display: flex;
  flex-direction: row;
  padding: 0 !important;
  flex: 1;
  position: relative;
  overflow: hidden;
  width: 100%;
`;

const ViewerSection = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 60px !important;
  overflow: hidden;
  transition: width 0.1s ease;
  min-width: 0;
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => (props.theme?.isCompact ? '5px' : '10px')};
  padding: ${(props) => (props.theme?.isCompact ? '12px 8px 8px 0' : '16px 10px 8px 0')};
  border-radius: 8px 8px 0 0;
  flex-wrap: ${(props) => (props.theme?.isCompact ? 'wrap' : 'nowrap')};
  transition: all 0.2s ease;
`;

const ChatSection = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.1s ease;
  min-width: 0;
  * {
    transition:
      font-size 0.2s ease,
      padding 0.2s ease,
      margin 0.2s ease;
  }
`;

const ViewerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-radius: 8px 8px 0 0;
`;

const ChatBody = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 5px 60px 0 !important;
  flex: 1;
  overflow: hidden;
  width: 100%;
  min-width: 0;
`;

const SaveTitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

const Title = styled.h2`
  font-size: 1.1rem;
  font-weight: 500;
  color: #5f6368;
  margin: 0;
  flex-grow: 1;
`;

const TitleInput = styled.input`
  font-size: ${(props) => (props.theme?.isCompact ? '0.9rem' : '1.1rem')};
  font-weight: 500;
  color: #5f6368;
  border: 2px solid #e4e7eb;
  padding: ${(props) => (props.theme?.isCompact ? '2px 6px' : '4px 8px')};
  width: 100%;
  max-width: ${(props) => (props.theme?.isCompact ? '150px' : '400px')};
  border-radius: 4px;
  background: white;
  transition: all 0.2s ease;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;

  &:hover {
    border-color: #848484;
  }

  &:focus {
    border-color: #4285f4;
    outline: none;
    max-width: ${(props) => (props.theme?.isCompact ? '200px' : '400px')};
  }
`;

const ChatHistory = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  display: flex;
  flex-direction: column;
  background: white;
  margin: 1px 0;
  border-radius: 8px;
  min-height: 0;
  width: 100%;
  max-width: 100%;
`;

const HiveThoughts = styled.h6`
  margin-top: 20px;
`;

const MessageBubble = styled.div<MessageBubbleProps>`
  max-width: 90%;
  margin: 12px 0;
  padding: 0 20px;
  border-radius: 16px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  align-self: ${(props) => (props.isUser ? 'flex-end' : 'flex-start')};
  background-color: ${(props) => (props.isUser ? '#808080' : '#F2F3F5')};
  color: ${(props) => (props.isUser ? 'white' : '#202124')};
  position: relative;
  width: auto;
  min-width: 0;
`;

const InputContainer = styled.div`
  display: flex;
  gap: ${(props) => (props.theme.isCompact ? '6px' : '12px')};
  padding: ${(props) => (props.theme.isCompact ? '8px 0' : '16px 0')};
  border-radius: 0 0 8px 8px;
  position: sticky;
  bottom: 0;
  margin: 0;
  width: 100%;
  min-width: 0;
  transition: padding 0.2s ease;
`;

const InputWrapper = styled.div<{ isCompact: boolean }>`
  display: flex;
  flex-grow: 1;
  border: ${(props) => (props.isCompact ? '2px solid #848484' : 'none')};
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    border-color: #4285f4;
  }

  &:focus-within {
    border-color: #4285f4;
  }
`;

const CompactTextArea = styled.textarea<{ isCompact: boolean }>`
  flex-grow: 1;
  padding: 12px;
  border: ${(props) => (props.isCompact ? 'none' : '2px solid #848484')};
  border-radius: ${(props) => (props.isCompact ? '0' : '8px')};
  resize: none;
  min-height: 24px;
  max-height: 150px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 0;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${(props) => (props.isCompact ? 'transparent' : '#4285f4')};
  }

  &:focus {
    outline: none;
    border-color: ${(props) => (props.isCompact ? 'transparent' : '#4285f4')};
  }
`;

const CompactButton = styled.button<{ disabled: boolean; isCompact: boolean }>`
  padding: ${(props) => (props.isCompact ? '8px' : '8px 24px')};
  background-color: ${(props) => (props.disabled ? '#e4e7eb' : '#4285f4')};
  color: ${(props) => (props.disabled ? '#9aa0a6' : 'white')};
  border: none;
  border-radius: ${(props) => (props.isCompact ? '0' : '8px')};
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  font-weight: 500;
  align-self: center;
  height: ${(props) => (props.isCompact ? '100%' : 'fit-content')};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background-color: #3367d6;
  }
`;

const CompactAttachButton = styled.button<{ disabled: boolean; isCompact: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${(props) => (props.isCompact ? '8px' : '8px 8px 8px 16px')};
  background: ${(props) => (props.isCompact ? 'transparent' : 'transparent')};
  border: ${(props) => (props.isCompact ? 'none' : '1px solid #5f6368')};
  border-radius: ${(props) => (props.isCompact ? '0' : '8px')};
  color: #5f6368;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  height: ${(props) => (props.isCompact ? '100%' : 'fit-content')};
  align-self: center;

  &:hover:not(:disabled) {
    background: ${(props) =>
      props.isCompact ? 'rgba(95, 99, 104, 0.05)' : 'rgba(95, 99, 104, 0.1)'};
  }

  &:disabled {
    opacity: 0.6;
    border-color: ${(props) => (props.isCompact ? 'transparent' : '#e4e7eb')};
    color: #9aa0a6;
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

const CompactSaveButton = styled(SendButton)`
  padding: ${(props) => (props.theme?.isCompact ? '4px 8px' : '8px 16px')};
  font-size: ${(props) => (props.theme?.isCompact ? '0.8rem' : '0.9rem')};
  margin: 0;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const AttachIcon = styled(MaterialIcon)`
  font-size: 16px;
  margin-right: 2px;
`;

const TabContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-left: 10px;
`;

const TabButton = styled.button<TabButtonProps>`
  padding: ${(props) => {
    const tabCount = props.tabCount || 1;
    const viewerWidth = window.innerWidth * ((100 - (props.chatSectionWidth || 30) - 1) / 100);
    const isNarrow = viewerWidth / tabCount < 130;
    return isNarrow ? '8px 10px' : '10px 16px';
  }};
  border: ${({ active }) => (!active ? 'none' : '1px solid #ddd')};
  background: ${({ active }) => (active ? '#808080' : '#f9f9f9')};
  color: ${({ active }) => (active ? 'white' : '#333')};
  font-weight: 700;
  font-family: Barlow;
  font-size: ${(props) => {
    const tabCount = props.tabCount || 1;
    const viewerWidth = window.innerWidth * ((100 - (props.chatSectionWidth || 30) - 1) / 100);
    const isNarrow = viewerWidth / tabCount < 130;
    return isNarrow ? '14px' : '16px';
  }};
  cursor: pointer;
  transition:
    background 0.3s,
    color 0.3s;
  border-radius: 8px 8px 0 0;
  margin-right: 4px;
  min-width: ${(props) => {
    const tabCount = props.tabCount || 1;
    const viewerWidth = window.innerWidth * ((100 - (props.chatSectionWidth || 30) - 1) / 100);
    const isNarrow = viewerWidth / tabCount < 130;
    return isNarrow ? '80px' : '120px';
  }};
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    background: ${({ active }) => (active ? '#808080' : '#e6e6e6')};
    color: ${({ active }) => (active ? 'white' : '#1e1f25')};
  }
`;

const CopyButton = styled.button<{ $isUser?: boolean }>`
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${(props) => (props.$isUser ? 'rgba(255,255,255,0.7)' : '#5f6368')};
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${(props) => (props.$isUser ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.1)')};
    color: ${(props) => (props.$isUser ? 'white' : '#202124')};
    border-radius: 50%;
  }
`;

const connectToLogWebSocket = (
  projectId: string,
  chatId: string,
  setLogs: (update: (prevLogs: LogEntry[]) => LogEntry[]) => void,
  isVerboseLoggingEnabled: boolean
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

    if (isVerboseLoggingEnabled) {
      console.log('Hive Chat Data message', data);
    }

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

const highlightCode = (code: string): string => {
  return hljs.highlightAuto(code).value;
};

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
  // const history = useHistory();
  const [isUpdatingTitle, setIsUpdatingTitle] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [collapsed, setCollapsed] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isChainVisible, setIsChainVisible] = useState(false);
  const [lastLogLine, setLastLogLine] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isBuild, setIsBuild] = useState<'Chat' | 'Build'>('Chat');
  const [actionArtifact, setActionArtifact] = useState<Artifact>();
  const [visualArtifact, setVisualArtifact] = useState<Artifact[]>();
  const [textArtifact, setTextArtifact] = useState<Artifact[]>();
  const [codeArtifact, setCodeArtifacts] = useState<Artifact[]>();
  const [pdfUrl, setPdfUrl] = useState('');
  const { isEnabled: isVerboseLoggingEnabled } = useFeatureFlag('verbose_logging_sw');
  const { isEnabled: isArtifactLoggingEnabled } = useFeatureFlag('log_artefact');
  const [selectedModel, setSelectedModel] = useState<ModelOption>({
    label: 'Open AI - 4o',
    value: 'gpt-4o'
  });
  const [artifactTab, setArtifactTab] = useState<'visual' | 'code' | 'text'>('code');
  useBrowserTabTitle('Hive Chat');
  const [chatSectionWidth, setChatSectionWidth] = useState(() => {
    const savedWidth = localStorage.getItem('hiveChatSectionWidth');
    return savedWidth ? parseInt(savedWidth, 10) : 30;
  });
  const isNarrowChat = chatSectionWidth < 30;

  if (isVerboseLoggingEnabled) {
    console.log('Hive Chat logs', logs);
  }

  const refreshChatHistory = useCallback(async () => {
    try {
      await chat.loadChatHistory(chatId);
      const selectedChat = chat.getChat(chatId);
      if (selectedChat?.title) {
        setTitle(selectedChat.title);
      }
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
    const refreshChatOnFocus = async () => {
      try {
        if (document.visibilityState === 'visible') {
          await refreshChatHistory();
        }
      } catch (error) {
        console.error('Error refreshing chat history on focus:', error);
      }
    };

    window.addEventListener('visibilitychange', refreshChatOnFocus);
    window.addEventListener('focus', refreshChatOnFocus);

    return () => {
      window.removeEventListener('visibilitychange', refreshChatOnFocus);
      window.removeEventListener('focus', refreshChatOnFocus);
    };
  }, [refreshChatHistory]);

  const updateChatTitle = async (
    chatId: string,
    uuid: string,
    newTitle: string,
    setIsUpdatingTitle: (status: boolean) => void
  ): Promise<void> => {
    if (!chatId || !uuid || !newTitle.trim()) return;

    setIsUpdatingTitle(true);
    try {
      chatHistoryStore.updateChatTitle(chatId, newTitle);
      ui.setToasts([
        {
          title: 'Success',
          text: 'Chat Title Updated'
        }
      ]);
    } catch (error) {
      console.error('Error updating chat title:', error);
      ui.setToasts([
        {
          title: 'Error',
          color: 'danger',
          text: 'Failed to update chat title'
        }
      ]);
    } finally {
      setIsUpdatingTitle(false);
    }
  };

  useEffect(() => {
    const handleCollapseChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ collapsed: boolean }>;
      setCollapsed(customEvent.detail.collapsed);
    };

    window.addEventListener('sidebarCollapse', handleCollapseChange as EventListener);

    return () => {
      window.removeEventListener('sidebarCollapse', handleCollapseChange as EventListener);
    };
  }, []);

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

  const onTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = event.target.value;
    setTitle(newTitle);
    setIsEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    try {
      await updateChatTitle(chatId, uuid, title, setIsUpdatingTitle);
      setIsEditingTitle(false);
    } catch (error) {
      console.error('Error saving title:', error);
    }
  };

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
  }, [ui, refreshChatHistory, chatId, chat]);

  useEffect(() => {
    const ws = connectToLogWebSocket(projectId, chatId, setLogs, isVerboseLoggingEnabled);

    return () => {
      ws.close();
    };
  }, [projectId, chatId, isVerboseLoggingEnabled]);

  useEffect(() => {
    if (logs.length > 0) {
      setLastLogLine(logs[logs.length - 1]?.message || '');
    }
  }, [logs]);

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
    const logArtifacts = async () => {
      if (chatId && isArtifactLoggingEnabled) {
        const res = await chat.loadArtifactsForChat(chatId);
        console.log('Artifacts for that chat', res);
        setActionArtifact({} as Artifact);
        const screenArtifacts = res?.filter(
          (artifact) =>
            artifact &&
            artifact.type === 'visual' &&
            artifact.content &&
            'visual_type' in artifact.content &&
            artifact.content.visual_type === 'screen'
        );

        if (screenArtifacts) {
          setVisualArtifact(screenArtifacts);
        }

        const codeArtifacts = res?.filter(
          (artifact) =>
            artifact &&
            artifact.type === 'text' &&
            artifact.content &&
            'text_type' in artifact.content &&
            artifact.content.text_type === 'code'
        );

        const isTextContent = (content: any): content is TextContent => {
          return content && typeof content.text_type === 'string' && 'language' in content;
        };

        codeArtifacts.forEach((artifact) => {
          if (isTextContent(artifact.content)) {
            artifact.content.content = highlightCode(artifact.content.content);
          }
        });

        if (codeArtifacts) {
          setCodeArtifacts(codeArtifacts);
        }

        const textArtifacts = res?.filter(
          (artifact) =>
            artifact &&
            artifact.type === 'text' &&
            artifact.content &&
            'text_type' in artifact.content &&
            artifact.content.text_type !== 'code'
        );

        if (textArtifacts) {
          setTextArtifact(textArtifacts);
        }

        const systemMessages = messages?.filter((msg) => msg.role !== 'user');
        const lastSystemMessageId =
          systemMessages?.length > 0 ? systemMessages[systemMessages.length - 1].id : null;

        if (lastSystemMessageId) {
          const artifacts = chat.getMessageArtifacts(lastSystemMessageId);
          for (const artifact of artifacts) {
            if (artifact.type === 'action' && chat.isActionContent(artifact.content)) {
              setActionArtifact(artifact);
            }
          }
        }
      }
    };
    logArtifacts();
  }, [chat, chatId, isArtifactLoggingEnabled, messages]);

  useEffect(() => {
    const processArtifacts = () => {
      if (chatHistoryRef.current) {
        chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
      }
    };

    processArtifacts();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (chatHistoryRef.current) {
        chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
      }
    };
    handleResize();

    const currentChatHistoryRef = chatHistoryRef.current;

    if (currentChatHistoryRef) {
      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(currentChatHistoryRef);

      return () => {
        resizeObserver.unobserve(currentChatHistoryRef);
        resizeObserver.disconnect();
      };
    }
  }, [chatSectionWidth]);

  useEffect(() => {
    const handleResizeComplete = () => {
      if (chatHistoryRef.current) {
        chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
      }
    };

    window.addEventListener('resizeComplete', handleResizeComplete);

    return () => {
      window.removeEventListener('resizeComplete', handleResizeComplete);
    };
  }, []);

  const handleUploadComplete = (url: string) => {
    setPdfUrl(url);
    setMessage((prevMessage: string) => {
      const pdfLink = `\n[PDF Document](${url})`;
      return prevMessage + pdfLink;
    });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      let socketId = websocketSessionId;
      if (socketId === '') {
        socketId = localStorage.getItem('websocket_token') || '';
      }

      const sentMessage = await chat.sendMessage(
        chatId,
        message,
        selectedModel.value,
        socketId,
        uuid,
        isBuild,
        undefined,
        pdfUrl,
        actionArtifact
      );

      if (sentMessage) {
        chat.addMessage(sentMessage);
        setMessage('');
        setPdfUrl('');

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
      setMessage('');
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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        setIsBuild((prev) => {
          const newMode = prev === 'Chat' ? 'Build' : 'Chat';

          setTimeout(() => {
            const buttonToFocus = document.querySelector(
              `[role="radio"][aria-checked="true"]`
            ) as HTMLElement;
            if (buttonToFocus) {
              buttonToFocus.focus();
            }
          }, 0);

          return newMode;
        });
      }

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsBuild((prev) => (prev === 'Chat' ? 'Build' : 'Chat'));
      }
    },
    [setIsBuild]
  );

  const showArtifactView =
    (visualArtifact && visualArtifact.length > 0) || (codeArtifact && codeArtifact.length > 0);

  if (loading) {
    return (
      <Container collapsed={collapsed}>
        <LoadingContainer>
          <EuiLoadingSpinner size="l" />
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container collapsed={collapsed}>
        <Title>Error: {error}</Title>
      </Container>
    );
  }

  return (
    <>
      <SidebarComponent uuid={uuid} defaultCollapsed />
      <Container collapsed={collapsed}>
        <ChatBodyWrapper>
          <ChatSection style={{ width: `${chatSectionWidth}%` }}>
            <ChatHeader theme={{ isCompact: isNarrowChat }}>
              <SaveTitleContainer>
                <TitleInput
                  value={title}
                  onChange={onTitleChange}
                  placeholder={isNarrowChat ? 'Title...' : 'Enter chat title...'}
                  disabled={isUpdatingTitle}
                  theme={{ isCompact: isNarrowChat }}
                  style={{
                    cursor: isUpdatingTitle ? 'not-allowed' : 'text'
                  }}
                />
                {isEditingTitle && (
                  <CompactSaveButton
                    onClick={handleSaveTitle}
                    disabled={isUpdatingTitle}
                    theme={{ isCompact: isNarrowChat }}
                  >
                    Save
                  </CompactSaveButton>
                )}
              </SaveTitleContainer>

              {!showArtifactView ? (
                <ThinkingModeToggle
                  isBuild={isBuild}
                  setIsBuild={setIsBuild}
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                  handleKeyDown={handleKeyDown}
                  isCompact={isNarrowChat}
                />
              ) : null}
            </ChatHeader>

            <ChatBody>
              <ChatHistory ref={chatHistoryRef}>
                {messages.map((msg: ChatMessage) => (
                  <React.Fragment key={msg.id}>
                    <MessageBubble isUser={msg.role === 'user'}>
                      {renderMarkdown(msg.message, {
                        codeBlockBackground: '#282c34',
                        textColor: '#abb2bf',
                        bubbleTextColor: msg.role === 'user' ? 'white' : '',
                        borderColor: '#444',
                        codeBlockFont: 'Courier New'
                      })}
                      {msg.role !== 'user' && (
                        <CopyButton
                          onClick={() => {
                            navigator.clipboard.writeText(msg.message);
                            const button = document.getElementById(`copy-${msg.id}`);
                            if (button) {
                              button.textContent = 'done';
                              setTimeout(() => {
                                button.textContent = 'content_copy';
                              }, 2000);
                            }
                          }}
                        >
                          <MaterialIcon
                            id={`copy-${msg.id}`}
                            icon="content_copy"
                            style={{ fontSize: '16px' }}
                          />
                        </CopyButton>
                      )}
                    </MessageBubble>

                    <ActionArtifactRenderer
                      messageId={msg.id}
                      chatId={chatId}
                      websocketSessionId={websocketSessionId}
                    />
                  </React.Fragment>
                ))}
                {isChainVisible && (
                  <MessageBubble isUser={false}>
                    <HiveThoughts>Hive - Chain of Thought</HiveThoughts>
                    <p>
                      {lastLogLine
                        ? lastLogLine
                        : `Hi ${ui.meInfo?.owner_alias}, I've got your message. Let me have a think.`}
                    </p>
                  </MessageBubble>
                )}
              </ChatHistory>
              <InputContainer theme={{ isCompact: isNarrowChat }}>
                {isNarrowChat ? (
                  <InputWrapper isCompact={true}>
                    <CompactTextArea
                      value={message}
                      onChange={handleMessageChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      disabled={isSending}
                      isCompact={true}
                    />
                    <CompactAttachButton
                      onClick={() => setIsUploadModalOpen(true)}
                      disabled={isSending}
                      isCompact={true}
                    >
                      <AttachIcon icon="attach_file" />
                    </CompactAttachButton>
                    <CompactButton
                      onClick={handleSendMessage}
                      disabled={!message.trim() || isSending}
                      isCompact={true}
                    >
                      <MaterialIcon icon="send" style={{ fontSize: '18px' }} />
                    </CompactButton>
                  </InputWrapper>
                ) : (
                  <>
                    <CompactTextArea
                      value={message}
                      onChange={handleMessageChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      disabled={isSending}
                      isCompact={false}
                    />
                    <CompactAttachButton
                      onClick={() => setIsUploadModalOpen(true)}
                      disabled={isSending}
                      isCompact={false}
                    >
                      Attach
                      <AttachIcon icon="attach_file" />
                    </CompactAttachButton>
                    <CompactButton
                      onClick={handleSendMessage}
                      disabled={!message.trim() || isSending}
                      isCompact={false}
                    >
                      Send
                    </CompactButton>
                  </>
                )}
              </InputContainer>
            </ChatBody>
          </ChatSection>
          {showArtifactView ? (
            <>
              <ResizableDivider
                initialLeftWidth={chatSectionWidth}
                minLeftWidth={20}
                maxLeftWidth={80}
                onChange={setChatSectionWidth}
                onResizeEnd={() => {
                  localStorage.setItem('hiveChatSectionWidth', chatSectionWidth.toString());
                }}
              />
              <ViewerSection style={{ width: `${100 - chatSectionWidth - 1}%` }}>
                <ViewerHeader>
                  <TabContainer>
                    {(() => {
                      let tabCount = 0;
                      if (codeArtifact && codeArtifact?.length > 0) tabCount++;
                      if (visualArtifact && visualArtifact?.length > 0) tabCount++;
                      if (textArtifact && textArtifact?.length > 0) tabCount++;

                      return (
                        <>
                          {codeArtifact && codeArtifact?.length > 0 && (
                            <TabButton
                              active={artifactTab === 'code'}
                              onClick={() => setArtifactTab('code')}
                              chatSectionWidth={chatSectionWidth}
                              tabCount={tabCount}
                            >
                              Code
                            </TabButton>
                          )}
                          {visualArtifact && visualArtifact?.length > 0 && (
                            <TabButton
                              active={artifactTab === 'visual'}
                              onClick={() => setArtifactTab('visual')}
                              chatSectionWidth={chatSectionWidth}
                              tabCount={tabCount}
                            >
                              Screen
                            </TabButton>
                          )}
                          {textArtifact && textArtifact?.length > 0 && (
                            <TabButton
                              active={artifactTab === 'text'}
                              onClick={() => setArtifactTab('text')}
                              chatSectionWidth={chatSectionWidth}
                              tabCount={tabCount}
                            >
                              Text
                            </TabButton>
                          )}
                        </>
                      );
                    })()}
                  </TabContainer>

                  <ThinkingModeToggle
                    isBuild={isBuild}
                    setIsBuild={setIsBuild}
                    selectedModel={selectedModel}
                    setSelectedModel={setSelectedModel}
                    handleKeyDown={handleKeyDown}
                    isCompact={100 - chatSectionWidth < 50}
                  />
                </ViewerHeader>

                <VisualScreenViewer
                  visualArtifact={visualArtifact ?? []}
                  codeArtifact={codeArtifact ?? []}
                  textArtifact={textArtifact ?? []}
                  activeTab={artifactTab}
                />
              </ViewerSection>
            </>
          ) : null}
        </ChatBodyWrapper>
        {isUploadModalOpen && (
          <UploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onUploadComplete={handleUploadComplete}
          />
        )}
      </Container>
    </>
  );
});

export default HiveChatView;
