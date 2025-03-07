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
}

const ActionContainer = styled.div<{ isExpanded: boolean }>`
  margin: 8px 0;
  max-width: ${(props) => (props.isExpanded ? '70%' : 'auto')};
  align-self: flex-start;
  width: ${(props) => (props.isExpanded ? '70%' : 'auto')};
`;

const ActionBubble = styled.div`
  background-color: #f2f3f5;
  color: #202124;
  border-radius: 16px;
  padding: 12px 16px;
  word-wrap: break-word;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const TextInput = styled.textarea`
  width: 100%;
  margin-top: 8px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: vertical;
  min-height: 60px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #4285f4;
  }
`;

const ButtonsRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SendButton = styled(Button)`
  background-color: #4285f4;
  color: white;

  &:hover:not(:disabled) {
    background-color: #3367d6;
  }
`;

const CancelButton = styled(Button)`
  background-color: #e4e7eb;
  color: #5f6368;

  &:hover:not(:disabled) {
    background-color: #dadce0;
  }
`;

export const ActionArtifactRenderer: React.FC<ActionArtifactRendererProps> = observer(
  ({ messageId, chatId }) => {
    const { chat } = useStores();
    const [selectedOption, setSelectedOption] = useState<Option | null>(null);
    const [responseText, setResponseText] = useState('');
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
      content.options && content.options.some((option) => option.action_type === 'button');

    if (!hasButtonOptions) {
      return null;
    }

    const handleSendResponse = async (option: Option, message: string) => {
      if (!message.trim()) return;

      setIsSending(true);

      try {
        const sourceWebsocketId = localStorage.getItem('websocket_token') || '';

        await chatService.sendActionResponse({
          action_webhook: option.webhook,
          chatId,
          messageId,
          message,
          sourceWebsocketId
        });

        setSelectedOption(null);
        setResponseText('');
      } catch (error) {
        console.error('Error sending action response:', error);
      } finally {
        setIsSending(false);
      }
    };

    const handleButtonClick = (option: Option) => {
      setSelectedOption(option);

      if (option.option_response !== 'textbox') {
        handleSendResponse(option, option.option_response);
      }
    };

    const handleCancel = () => {
      setSelectedOption(null);
      setResponseText('');
    };

    return (
      <ActionContainer isExpanded={selectedOption?.option_response === 'textbox'}>
        <ActionBubble>
          {renderMarkdown(content.actionText, {
            codeBlockBackground: '#282c34',
            textColor: '#abb2bf',
            bubbleTextColor: '',
            borderColor: '#444',
            codeBlockFont: 'Courier New'
          })}

          {!selectedOption ? (
            <ActionButtons
              options={content.options}
              onButtonClick={handleButtonClick}
              disabled={isSending}
            />
          ) : selectedOption.option_response === 'textbox' ? (
            <>
              <TextInput
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Type your response..."
                disabled={isSending}
              />
              <ButtonsRow>
                <CancelButton onClick={handleCancel} disabled={isSending}>
                  Cancel
                </CancelButton>
                <SendButton
                  onClick={() => handleSendResponse(selectedOption, responseText)}
                  disabled={!responseText.trim() || isSending}
                >
                  Send
                </SendButton>
              </ButtonsRow>
            </>
          ) : null}
        </ActionBubble>
      </ActionContainer>
    );
  }
);
