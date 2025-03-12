import React from 'react';
import styled from 'styled-components';
import { ModelOption, ModelSelector } from './modelSelector';

interface ThinkingModeToggleProps {
  isBuild: 'Chat' | 'Build';
  setIsBuild: React.Dispatch<React.SetStateAction<'Chat' | 'Build'>>;
  selectedModel: ModelOption;
  setSelectedModel: React.Dispatch<React.SetStateAction<ModelOption>>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  isCompact?: boolean;
}

const ToggleContainer = styled.div<{ isCompact?: boolean }>`
  display: flex;
  background-color: white;
  border-radius: 6px;
  padding: 4px;
  width: fit-content;
  align-items: center;
  gap: ${(props) => (props.isCompact ? '4px' : '8px')};
`;

const ToggleButton = styled.button<{ isActive: boolean; isCompact?: boolean }>`
  padding: ${(props) => (props.isCompact ? '6px 10px' : '8px 16px')};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: ${(props) => (props.isCompact ? '14px' : '16px')};
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;

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

const ToggleWrapper = styled.div<{ isCompact?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${(props) => (props.isCompact ? '6px' : '10px')};
  flex-wrap: ${(props) => (props.isCompact ? 'wrap' : 'nowrap')};
  justify-content: ${(props) => (props.isCompact ? 'center' : 'flex-start')};
`;

const ThinkingModeToggle: React.FC<ThinkingModeToggleProps> = ({
  isBuild,
  setIsBuild,
  selectedModel,
  setSelectedModel,
  handleKeyDown,
  isCompact = false
}) => (
    <ToggleWrapper isCompact={isCompact}>
      <ToggleContainer
        tabIndex={0}
        onKeyDown={handleKeyDown}
        role="radiogroup"
        aria-label="Toggle Thinking Mode"
        isCompact={isCompact}
      >
        <ToggleButton
          isActive={isBuild === 'Build'}
          onClick={() => setIsBuild('Build')}
          tabIndex={0}
          role="radio"
          aria-checked={isBuild === 'Build'}
          isCompact={isCompact}
        >
          {isCompact ? 'B' : 'Build'}
        </ToggleButton>
        <ToggleButton
          isActive={isBuild === 'Chat'}
          onClick={() => setIsBuild('Chat')}
          tabIndex={0}
          role="radio"
          aria-checked={isBuild === 'Chat'}
          isCompact={isCompact}
        >
          {isCompact ? 'C' : 'Chat'}
        </ToggleButton>
      </ToggleContainer>
      <ModelSelector
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        isCompact={isCompact}
      />
    </ToggleWrapper>
  );

export default ThinkingModeToggle;
