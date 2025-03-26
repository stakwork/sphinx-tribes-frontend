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

const ActionBubble = styled.div<{ animate: boolean }>`
  background-color: #f2f3f5;
  padding: 12px 16px;
  border-radius: 12px;
  color: #202124;
  font-size: 14px;
  line-height: 1.4;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;

  ${({ animate }) =>
    animate &&
    `
    animation: pulseAttention 2.5s infinite ease-in-out;
    position: relative;
    
    &:after {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border-radius: 14px;
      z-index: -1;
      border: 2px solid #4285f4;
      opacity: 0;
      animation: borderPulse 2.5s infinite ease-in-out;
    }
    
    @media (prefers-reduced-motion: reduce) {
      animation: none;
      
      &:after {
        animation: none;
        opacity: 0.5;
      }
    }
    
    @keyframes pulseAttention {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.01);
      }
      100% {
        transform: scale(1);
      }
    }
    
    @keyframes borderPulse {
      0% {
        opacity: 0.2;
      }
      50% {
        opacity: 0.6;
      }
      100% {
        opacity: 0.2;
      }
    }
  `}

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  }
`;

export const ActionArtifactRenderer: React.FC<ActionArtifactRendererProps> = observer(
  ({ messageId, chatId, websocketSessionId, setIsActionSend }) => {
    const { chat } = useStores();
    const [isSending, setIsSending] = useState(false);
    const [isActionCompleted, setIsActionCompleted] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [selectedOption, setSelectedOption] = useState<Option | null>(null);

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
      setHasInteracted(true);
      setSelectedOption(option);

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
        setIsActionSend(false);
      }
    };

    const shouldAnimate =
      (hasButtonOptions || hasChatOptions) && !hasInteracted && !isActionCompleted && !isSending;

    return (
      <ActionContainer>
        {(hasButtonOptions || content.actionText) && (
          <ActionBubble
            animate={shouldAnimate}
            onMouseEnter={() => setHasInteracted(true)}
            onFocus={() => setHasInteracted(true)}
          >
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
              selectedOption={selectedOption}
            />
          </ActionBubble>
        )}
      </ActionContainer>
    );
  }
);
