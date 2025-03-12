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

export const ActionArtifactRenderer: React.FC<ActionArtifactRendererProps> = observer(
  ({ messageId, chatId, websocketSessionId }) => {
    const { chat } = useStores();
    const [isSending, setIsSending] = useState(false);

    const artifacts = chat.getMessageArtifacts(messageId);

    const actionArtifact = artifacts.find(
      (a: Artifact) => a.type === 'action' && chat.isActionContent(a.content)
    );

    if (!actionArtifact || !chat.isActionContent(actionArtifact.content)) {
      return null;
    }

    const content = actionArtifact.content as ActionContent;

    const hasButtonOptions =
      content.options &&
      content.options.some(
        (option) => option.action_type === 'button' || option.action_type === 'chat'
      );

    if (!hasButtonOptions) {
      return null;
    }

    const handleButtonClick = async (option: Option) => {
      if (isSending) return;
      setIsSending(true);

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

        await chatService.sendActionResponse(payload);
      } catch (error) {
        console.error('Error sending action response:', error);
      } finally {
        setIsSending(false);
      }
    };

    return (
      <ActionContainer>
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
            disabled={isSending}
          />
        </ActionBubble>
      </ActionContainer>
    );
  }
);
