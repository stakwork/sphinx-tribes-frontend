import React from 'react';
import styled from 'styled-components';
import { Option } from '../../store/interface';

interface ActionButtonsProps {
  options: Option[];
  onButtonClick: (option: Option) => void;
  disabled?: boolean;
  selectedOption?: Option | null;
}

const ButtonsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const ActionButton = styled.button<{ primary?: boolean; selected?: boolean }>`
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  background-color: ${(props) => {
    if (props.disabled) {
      return props.selected ? '#7baaf7' : '#5a5a5a';
    }
    return props.selected ? '#4285f4' : '#5a5a5a';
  }};
  color: ${(props) => (props.primary || props.selected ? 'white' : '#e8eaed')};

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background-color: ${(props) => (props.selected ? '#3b78e7' : '#3d3d3d')};
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
  selectedOption
}) => (
  <ButtonsContainer data-testid="action-buttons-component">
    {options
      .filter((option) => option.action_type === 'button')
      .map((option, index) => {
        const isSelected = Boolean(
          selectedOption &&
            option.option_label === selectedOption.option_label &&
            option.webhook === selectedOption.webhook
        );

        return (
          <ActionButton
            key={index}
            primary={false}
            selected={isSelected}
            onClick={() => onButtonClick(option)}
            disabled={disabled}
          >
            {option.option_label}
          </ActionButton>
        );
      })}
  </ButtonsContainer>
);
