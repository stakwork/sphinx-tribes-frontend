import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import MaterialIcon from '@material/react-material-icon';

interface SimultaneousAttemptsSelectorProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  margin-right: 12px;
`;

const DropdownButton = styled.button<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 8px 8px 16px;
  background: transparent;
  border: 1px solid #5f6368;
  border-radius: 8px;
  color: #5f6368;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  height: fit-content;
  align-self: center;

  &:hover:not(:disabled) {
    background: rgba(95, 99, 104, 0.1);
    border-color: #4285f4;
  }

  &:disabled {
    opacity: 0.6;
    border-color: #e4e7eb;
    color: #9aa0a6;
  }
`;

const Icon = styled(MaterialIcon)`
  font-size: 16px;
  margin-right: 4px;
`;

const NumberText = styled.span`
  font-size: 14px;
  margin-right: 4px;
`;

const ArrowIcon = styled(MaterialIcon)`
  font-size: 16px;
`;

const DropdownMenu = styled.div<{ visible: boolean }>`
  position: absolute;
  bottom: calc(100% + 4px);
  left: 0;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};
  transform: translateY(${(props) => (props.visible ? '0' : '10px')});
  transition: all 0.2s ease;
  width: 100%;
  min-width: 120px;
`;

const MenuItem = styled.div<{ active?: boolean }>`
  padding: 10px 16px;
  color: #3c4043;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.1s ease;
  background-color: ${(props) => (props.active ? '#f1f3f6' : 'transparent')};
  display: flex;
  align-items: center;

  &:hover {
    background-color: #f5f8ff;
  }
`;

const Checkmark = styled(MaterialIcon)`
  margin-left: auto;
  font-size: 18px;
  color: #4285f4;
`;

const Tooltip = styled.div<{ visible: boolean; top: number; left: number }>`
  position: fixed;
  left: ${(props) => props.left}px;
  top: ${(props) => props.top}px;
  background: rgba(31, 41, 55, 0.95);
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  max-width: 200px;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  pointer-events: none;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 1000;
  transform: translateX(-50%) translateY(-100%) translateY(-8px);

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: -8px;
    transform: translateX(-50%);
    border-width: 8px 8px 0 8px;
    border-style: solid;
    border-color: rgba(31, 41, 55, 0.95) transparent transparent transparent;
  }
`;

const SimultaneousAttemptsSelector: React.FC<SimultaneousAttemptsSelectorProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSelect = (selectedValue: number) => {
    if (!disabled) {
      onChange(selectedValue);
      setShowMenu(false);
    }
  };

  const toggleMenu = () => {
    if (!disabled) {
      setShowMenu(!showMenu);
    }
  };

  const handleMouseEnter = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top - 8,
        left: rect.left + rect.width / 2
      });
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showMenu &&
        !event
          .composedPath()
          .some((el) => el instanceof Element && el.classList.contains('dropdown-area'))
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  return (
    <Container>
      <DropdownButton
        ref={buttonRef}
        onClick={toggleMenu}
        disabled={disabled}
        className="dropdown-area"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Icon icon="layers" />
        <NumberText>{value}</NumberText>
        <ArrowIcon icon="arrow_drop_down" />
      </DropdownButton>

      {showTooltip && (
        <Tooltip visible={showTooltip} top={tooltipPosition.top} left={tooltipPosition.left}>
          Attempts
        </Tooltip>
      )}

      <DropdownMenu visible={showMenu} className="dropdown-area">
        <MenuItem active={value === 1} onClick={() => handleSelect(1)}>
          1 version
          {value === 1 && <Checkmark icon="check" />}
        </MenuItem>
        <MenuItem active={value === 2} onClick={() => handleSelect(2)}>
          2 versions
          {value === 2 && <Checkmark icon="check" />}
        </MenuItem>
        <MenuItem active={value === 3} onClick={() => handleSelect(3)}>
          3 versions
          {value === 3 && <Checkmark icon="check" />}
        </MenuItem>
      </DropdownMenu>
    </Container>
  );
};

export default SimultaneousAttemptsSelector;
