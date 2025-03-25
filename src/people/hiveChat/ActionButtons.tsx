import React from 'react';
import styled from 'styled-components';
import { Option } from '../../store/interface';

interface ActionButtonsProps {
  options: Option[];
  onButtonClick: (option: Option) => void;
  disabled?: boolean;
  selectedOptionId?: string;
}

const ButtonsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const ActionButton = styled.button<{ primary?: boolean; selected?: boolean; disabled?: boolean }>`
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  background-color: ${(props) => {
    if (props.disabled) {
      return props.selected ? 'rgba(66, 133, 244, 0.5)' : '#a0a0a0';
    }
    return props.selected ? '#4285f4' : '#2d2d2d';
  }};
  color: ${(props) => (props.primary || props.selected ? 'white' : '#e8eaed')};

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background-color: ${(props) => {
      if (props.selected) return 'rgba(66, 133, 244, 0.8)';
      return props.primary ? '#3b78e7' : '#3d3d3d';
    }};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: none;
  }

  &:disabled {
    opacity: ${(props) => (props.selected ? 0.8 : 0.5)};
    cursor: not-allowed;
    transform: none;
  }
`;

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  options,
  onButtonClick,
  disabled = false,
  selectedOptionId
}) => (
  <ButtonsContainer>
    {options
      .filter((option) => option.action_type === 'button')
      .map((option, index) => (
        <ActionButton
          key={index}
          primary={true}
          selected={selectedOptionId === option.webhook}
          onClick={() => onButtonClick(option)}
          disabled={disabled}
        >
          {option.option_label}
        </ActionButton>
      ))}
  </ButtonsContainer>
);
