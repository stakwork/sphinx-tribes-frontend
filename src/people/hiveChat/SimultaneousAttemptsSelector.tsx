import React, { useState } from 'react';
import styled from 'styled-components';
import MaterialIcon from '@material/react-material-icon';

interface SimultaneousAttemptsSelectorProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 12px;
  position: relative;
  background-color: #f7f9fc;
  border-radius: 8px;
  padding: 2px 8px;
  border: 1px solid #e0e4e8;
  transition: all 0.2s ease;

  &:hover {
    background-color: #eef2f7;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  }

  &:focus-within {
    border-color: #4285f4;
    box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
  }
`;

const Label = styled.span`
  font-size: 12px;
  color: #5f6368;
  white-space: nowrap;
  font-weight: 500;
  user-select: none;
  display: none;

  @media (min-width: 768px) {
    display: block;
  }
`;

const Dropdown = styled.select`
  padding: 6px 10px;
  border: 2px solid transparent;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  font-weight: 500;
  color: #3c4043;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 45px;
  appearance: none;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

  &:hover {
    background-color: #f5f8ff;
  }

  &:focus {
    outline: none;
    border-color: #4285f4;
    box-shadow: 0 1px 3px rgba(66, 133, 244, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: #f1f3f4;
    color: #9aa0a6;
  }
`;

const Icon = styled(MaterialIcon)`
  font-size: 18px;
  color: #4285f4;
  margin-right: -2px;
`;

const DropdownWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const ArrowIcon = styled(MaterialIcon)`
  font-size: 16px;
  color: #5f6368;
  position: absolute;
  right: 6px;
  pointer-events: none;
`;

const Tooltip = styled.div<{ visible: boolean }>`
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%) translateY(${(props) => (props.visible ? '0' : '5px')});
  background-color: rgba(32, 33, 36, 0.9);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};
  opacity: ${(props) => (props.visible ? 1 : 0)};
  transition: all 0.2s ease;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  max-width: 250px;
  text-align: center;

  &:after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: rgba(32, 33, 36, 0.9) transparent transparent transparent;
  }
`;

const SimultaneousAttemptsSelector: React.FC<SimultaneousAttemptsSelectorProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <Container onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
      <Tooltip visible={showTooltip}>Number of simultaneous attempts</Tooltip>
      <Icon icon="tune" />
      <Label>Parallelism</Label>
      <DropdownWrapper>
        <Dropdown
          value={value}
          onChange={handleChange}
          disabled={disabled}
          title="Simultaneous Attempts"
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
        </Dropdown>
        <ArrowIcon icon="arrow_drop_down" />
      </DropdownWrapper>
    </Container>
  );
};

export default SimultaneousAttemptsSelector;
