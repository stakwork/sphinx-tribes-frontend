import React from 'react';
import styled from 'styled-components';
import { Option } from '../../store/interface';

interface ActionButtonsProps {
  options: Option[];
  onButtonClick: (option: Option) => void;
  disabled?: boolean;
}

const ButtonsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const ActionButton = styled.button<{ primary?: boolean }>`
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  /* Different styles for primary (blue) and secondary (dark) buttons */
  background-color: ${(props) => (props.primary ? '#4285f4' : '#2d2d2d')};
  color: ${(props) => (props.primary ? 'white' : '#e8eaed')};

  /* Hover effects */
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background-color: ${(props) => (props.primary ? '#3b78e7' : '#3d3d3d')};
  }

  /* Active/Click effects */
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: none;
  }

  /* Disabled state */
  &:disabled {
    background-color: #e0e0e0;
    color: #9e9e9e;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const FeedbackButton = styled(ActionButton)`
  background-color: transparent;
  border: 1px solid #4285f4;
  color: #4285f4;

  &:hover:not(:disabled) {
    background-color: rgba(66, 133, 244, 0.08);
    border-color: #3b78e7;
    color: #3b78e7;
  }

  &:active:not(:disabled) {
    background-color: rgba(66, 133, 244, 0.16);
  }

  &:disabled {
    border-color: #e0e0e0;
    color: #9e9e9e;
    background-color: transparent;
  }
`;

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  options,
  onButtonClick,
  disabled = false
}) => (
  <ButtonsContainer>
    {options.map((option, index) => {
      if (option.option_label === 'Give me feedback') {
        return (
          <FeedbackButton key={index} onClick={() => onButtonClick(option)} disabled={disabled}>
            {option.option_label}
          </FeedbackButton>
        );
      }
      return (
        <ActionButton
          key={index}
          primary={option.action_type === 'button'}
          onClick={() => onButtonClick(option)}
          disabled={disabled}
        >
          {option.option_label}
        </ActionButton>
      );
    })}
  </ButtonsContainer>
);
