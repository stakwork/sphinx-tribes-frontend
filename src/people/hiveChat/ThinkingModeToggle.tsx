import React from 'react';
import styled from 'styled-components';
import { useFeatureFlag } from '../../hooks/useFeatureFlag';
import { ModelOption, ModelSelector } from './modelSelector';

interface ThinkingModeToggleProps {
  isBuild: 'Chat' | 'Build';
  setIsBuild: React.Dispatch<React.SetStateAction<'Chat' | 'Build'>>;
  selectedModel: ModelOption;
  setSelectedModel: React.Dispatch<React.SetStateAction<ModelOption>>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

const ToggleContainer = styled.div`
  display: flex;
  background-color: white;
  border-radius: 6px;
  padding: 4px;
  width: fit-content;
`;

const ToggleButton = styled.button<{ isActive: boolean }>`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;

  ${({ isActive }) =>
    isActive
      ? `
   background-color: #007bff;
   color: white;
   box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);
 `
      : `
   background-color: transparent;
   color: #333;
   &:hover {
     background-color: rgba(0, 123, 255, 0.1);
   }
 `}
`;

const ThinkingModeToggle: React.FC<ThinkingModeToggleProps> = ({
  isBuild,
  setIsBuild,
  selectedModel,
  setSelectedModel,
  handleKeyDown
}) => {
  const { isEnabled: isChatToggleEnabled } = useFeatureFlag('chat_toggle');
  const { isEnabled: isModelSelectorEnabled } = useFeatureFlag('chat_model');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {isChatToggleEnabled && (
        <ToggleContainer
          tabIndex={0}
          onKeyDown={handleKeyDown}
          role="radiogroup"
          aria-label="Toggle Thinking Mode"
        >
          <ToggleButton
            isActive={isBuild === 'Build'}
            onClick={() => setIsBuild('Build')}
            tabIndex={0}
            role="radio"
            aria-checked={isBuild === 'Build'}
          >
            Build
          </ToggleButton>
          <ToggleButton
            isActive={isBuild === 'Chat'}
            onClick={() => setIsBuild('Chat')}
            tabIndex={0}
            role="radio"
            aria-checked={isBuild === 'Chat'}
          >
            Chat
          </ToggleButton>
        </ToggleContainer>
      )}
      {isModelSelectorEnabled && (
        <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
      )}
    </div>
  );
};

export default ThinkingModeToggle;
