import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`;

const InputField = styled.input`
  width: 100%;
  padding: 6px 8px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
`;

const DropdownContent = styled.div`
  display: ${(props: { isOpen: boolean }) => (props.isOpen ? 'block' : 'none')};
  position: absolute;
  background-color: #f9f9f9;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 4px 4px;
`;

const DropdownItem = styled.div`
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  color: black;
  cursor: pointer;

  &:hover {
    background-color: #f1f1f1;
  }
`;

const Arrow = styled.span`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
`;

interface DropdownProps {
  items: Array<{ value: string; label: string; snippet: string }>;
  onSelect: (snippet: string) => void;
}

// eslint-disable-next-line @typescript-eslint/typedef
export const SnippetDropdown: React.FC<DropdownProps> = ({ items, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleItemClick = (label: string, snippet: string) => {
    setInputValue(label);
    onSelect(snippet);
    setIsOpen(false);
  };

  return (
    <DropdownContainer ref={dropdownRef}>
      <InputField
        type="text"
        value={inputValue}
        readOnly
        onClick={() => setIsOpen(!isOpen)}
        placeholder="Select a snippet"
      />
      <Arrow>{isOpen ? '▲' : '▼'}</Arrow>
      <DropdownContent isOpen={isOpen}>
        {items.map((item: any) => (
          <DropdownItem key={item.value} onClick={() => handleItemClick(item.label, item.snippet)}>
            {item.label}
          </DropdownItem>
        ))}
      </DropdownContent>
    </DropdownContainer>
  );
};
