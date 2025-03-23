import React, { useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react-lite';
import { renderMarkdown } from '../utils/RenderMarkdown.tsx';
import { ActionContent, Artifact, Option } from '../../store/interface';
import { useStores } from '../../store';
import { chatService } from '../../services/index';
import { ActionButtons } from './ActionButtons';

interface ActionArtifactRendererProps {
  messageId: string;
  chatId: string;
  websocketSessionId: string;
  setIsActionSend: (b: boolean) => void;
}

const ActionContainer = styled.div`
  margin: 8px 0;
  max-width: 70%;
  align-self: flex-start;
  width: 70%;
`;

const ActionBubble = styled.div`
  background-color: #f2f3f5;
  padding: 12px 16px;
  border-radius: 12px;
  color: #202124;
  font-size: 14px;
  line-height: 1.4;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const AnimatedContainer = styled.div<{ isAnimating: boolean }>`
  margin: 8px 0;
  max-width: 70%;
  align-self: flex-start;
  width: 70%;

  @media (prefers-reduced-motion: no-preference) {
    animation: ${(props) =>
      props.isAnimating ? 'pulseAttention 2s ease-in-out infinite' : 'none'};
  }

  @keyframes pulseAttention {
    0% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(var(--primary-rgb), 0.2);
    }
    50% {
      transform: scale(1.02);
      box-shadow: 0 0 0 10px rgba(var(--primary-rgb), 0);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(var(--primary-rgb), 0);
    }
  }
`;

export const ActionArtifactRenderer: React.FC<ActionArtifactRendererProps> = observer(
  ({ messageId, chatId, websocketSessionId, setIsActionSend }) => {
    const { chat } = useStores();
    const [isSending, setIsSending] = useState(false);
    const [isActionCompleted, setIsActionCompleted] = useState(false);
    const [isAnimating, setIsAnimating] = useState(true);

    const artifacts = chat.getMessageArtifacts(messageId);

    const actionArtifact = artifacts.find(
      (a: Artifact) => a.type === 'action' && chat.isActionContent(a.content)
    );

    if (!actionArtifact || !chat.isActionContent(actionArtifact.content)) {
      return null;
    }

    const content = actionArtifact.content as ActionContent;

    const hasButtonOptions =
      content.options && content.options.some((option) => option.action_type === 'button');

    const hasChatOptions =
      content.options && content.options.some((option) => option.action_type === 'chat');

    if (!hasButtonOptions && !hasChatOptions) {
      return null;
    }

    const handleButtonClick = async (option: Option) => {
      if (isSending || isActionCompleted) return;
      setIsSending(true);
      setIsActionSend(true);

      try {
        const payload = {
          action_webhook: option.webhook,
          chatId: chatId,
          messageId: messageId,
          message: option.option_response === 'textbox' ? '' : option.option_response,
          sourceWebsocketId: websocketSessionId
        };

        if (option.action_type === 'chat' || option.option_response === 'textbox') {
          localStorage.setItem('active_webhook', option.webhook);
          return;
        }

        const response = await chatService.sendActionResponse(payload);
        console.log('Action response:', response);
        if (response && response.success) {
          setIsActionCompleted(true);
        }
      } catch (error) {
        console.error('Error sending action response:', error);
      } finally {
        setIsSending(false);
      }
    };

    const handleInteraction = () => {
      setIsAnimating(false);
    };

    return (
      <AnimatedContainer
        isAnimating={isAnimating}
        onClick={handleInteraction}
        onKeyDown={handleInteraction}
        role="button"
        tabIndex={0}
      >
        <ActionContainer>
          {(hasButtonOptions || content.actionText) && (
            <ActionBubble>
              {content.actionText &&
                renderMarkdown(content.actionText, {
                  codeBlockBackground: '#282c34',
                  textColor: '#abb2bf',
                  bubbleTextColor: '',
                  borderColor: '#444',
                  codeBlockFont: 'Courier New'
                })}

              <ActionButtons
                options={content.options}
                onButtonClick={handleButtonClick}
                disabled={isSending || isActionCompleted}
              />
            </ActionBubble>
          )}
        </ActionContainer>
      </AnimatedContainer>
    );
  }
);
