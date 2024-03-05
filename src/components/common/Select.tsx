import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { SelProps } from 'components/interfaces';
import { colors } from '../../config/colors';

interface styleProps {
  color?: any;
  isFocused?: any;
  hasContent?: any;
  isOpen?: boolean;
}
interface dropDownOption {
  value: string;
  label: string;
  description?: string;
}

const StyledLabel = styled.label<styleProps>`
  position: absolute;
  pointer-events: none;
  left: 15px;
  top: ${(props: styleProps) => (props.isFocused || props.hasContent ? '-10px' : '10px')};
  background-color: ${(props: styleProps) =>
    props.isFocused || props.hasContent ? 'white' : 'transparent'};
  transition:
    top 0.2s ease,
    font-size 0.2s ease,
    background-color 0.2s ease;
  font-size: ${(props: styleProps) => (props.isFocused || props.hasContent ? '14px' : '14px')};
  color: #b0b7bb;
  font-weight: 500;
  font-family: Barlow;
`;

const DropdownContainer = styled.div`
  margin-top: 1px;
  margin-bottom: 14px;
  position: relative;
`;

const DropdownTrigger = styled.button<styleProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${colors.light.pureWhite};
  border: 1.5px solid
    ${(props: styleProps) => (props.isOpen ? colors.light.blue2 : colors.light.grayish.G750)};
  color: ${colors.light.pureBlack};
  padding: 8px 16px;
  width: 100%;
  cursor: pointer;
  &:focus {
    outline: none;
  }
  &:hover svg {
    stroke: ${colors.light.pureBlack}; // Change icon color on hover
  }
  height: 40px;
  border-radius: 3px;
  font-size: 14px;
  font-family: Barlow;
  font-weight: 500;
`;

const DropdownOptions = styled.div<styleProps>`
  position: absolute;
  width: 100%;
  background: ${colors.light.pureWhite};
  border-left: 1px solid ${colors.light.blue2};
  border-right: 1px solid ${colors.light.blue2};
  border-bottom: 1px solid ${colors.light.blue2};
  box-sizing: border-box;
  z-index: 1000;
  transition:
    max-height 0.15s ease-in-out,
    opacity 0.15s ease-in-out;
  max-height: ${(props: styleProps) => (props.isOpen ? '150px' : '0')};
  opacity: ${(props: styleProps) => (props.isOpen ? '1' : '0')};
  overflow-y: auto;
  border-bottom-left-radius: 3px;
  border-bottom-right-radius: 3px;
`;

const Option = styled.div`
  padding: 4.5px 16px;
  cursor: pointer;
  font-family: Barlow;
  font-size: 14px;
  &:hover {
    background-color: #e0ecff;
  }
`;

const DropdownIcon = ({ color = '#b0b7bb' }: any) => (
  <svg width="12" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M1 1L7 7L13 1"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function CustomSelect(props: SelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(props.value);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleScrollOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', handleScrollOutside, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScrollOutside, true);
    };
  }, [isOpen, dropdownRef]);

  const handleSelect = (value: string) => {
    setIsFocused(true);
    setSelectedValue(value);
    setIsOpen(false);
    props.onChange(value);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <DropdownContainer ref={dropdownRef} style={{ ...props.style }} data-testid={props.testId}>
      <StyledLabel isFocused={isFocused} hasContent={props.value}>
        {props.placeholder}
      </StyledLabel>

      <DropdownTrigger isOpen={isOpen} onClick={toggleDropdown}>
        <span>{props.options.find((o: dropDownOption) => o.value === selectedValue)?.label}</span>
        {!selectedValue && <DropdownIcon color={isFocused ? colors.light.pureBlack : '#b0b7bb'} />}
      </DropdownTrigger>

      <DropdownOptions isOpen={isOpen}>
        {props.options.map((option: dropDownOption) => (
          <Option key={option.value} onClick={() => handleSelect(option.value)}>
            <div>{option.label}</div>
            {option.description && (
              <div style={{ fontSize: '12px', color: colors.light.grayish.G500 }}>
                {option.description}
              </div>
            )}
          </Option>
        ))}
      </DropdownOptions>
    </DropdownContainer>
  );
}
