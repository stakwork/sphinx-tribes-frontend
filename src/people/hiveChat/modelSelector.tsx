/* eslint-disable @typescript-eslint/typedef */
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

export interface ModelOption {
  label: string;
  value: string;
}

export interface ModelSelectorProps {
  selectedModel: ModelOption;
  onModelChange: (model: ModelOption) => void;
  isCompact?: boolean;
}

const DropdownContainer = styled.div<{ isCompact?: boolean }>`
  position: relative;
  width: ${(props) => (props.isCompact ? '130px' : '200px')};
  transition: width 0.2s ease;
`;

const DropdownHeader = styled.div<{ isCompact?: boolean }>`
  background-color: white;
  border: 1px solid grey;
  border-radius: 4px;
  padding: ${(props) => (props.isCompact ? '6px 8px' : '10px')};
  font-size: ${(props) => (props.isCompact ? '12px' : '14px')};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DropdownList = styled.ul<{ isCompact?: boolean }>`
  background-color: white;
  border: 1px solid grey;
  border-top: none;
  border-radius: 0 0 4px 4px;
  margin: 0;
  padding: 0;
  list-style: none;
  position: absolute;
  width: 100%;
  max-height: 150px;
  overflow-y: auto;
  z-index: 1000;
`;

const DropdownListItem = styled.li<{ isCompact?: boolean }>`
  padding: ${(props) => (props.isCompact ? '6px 8px' : '10px')};
  font-size: ${(props) => (props.isCompact ? '12px' : '14px')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const Arrow = styled.span`
  display: inline-block;
  flex-shrink: 0;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid grey;
  margin-left: 10px;
`;

const formatModelLabel = (label: string, isCompact: boolean): string => {
  if (!isCompact) return label;

  if (label === 'Open AI - 4o') {
    return 'gpt-4o';
  }
  if (label === 'Open AI - 03 Mini') {
    return 'o3-mini';
  }
  if (label === 'Claude 3.5 Sonnet') {
    return 'sonnet-3.5';
  }

  return label;
};

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  isCompact = false
}) => {
  const modelOptions: ModelOption[] = [
    {
      label: 'Open AI - 4o',
      value: 'gpt-4o'
    },
    {
      label: 'Open AI - 03 Mini',
      value: 'o3-mini'
    },
    {
      label: 'Claude 3.5 Sonnet',
      value: 'claude-3-5-sonnet-latest'
    }
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      try {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      } catch (err) {
        console.error('Error handling click outside:', err);
        setError(err instanceof Error ? err : new Error('Unexpected error'));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleItemClick = (option: ModelOption) => {
    try {
      onModelChange(option);
      setIsOpen(false);
    } catch (err) {
      console.error('Error handling item click:', err);
      setError(err instanceof Error ? err : new Error('Unexpected error'));
    }
  };

  const toggleDropdown = () => {
    try {
      setIsOpen(!isOpen);
    } catch (err) {
      console.error('Error toggling dropdown:', err);
      setError(err instanceof Error ? err : new Error('Unexpected error'));
    }
  };

  if (error) {
    return (
      <div style={{ color: 'red', padding: isCompact ? '4px' : '10px', border: '1px solid red' }}>
        Something went wrong: {error.message}
      </div>
    );
  }

  return (
    <DropdownContainer ref={containerRef} isCompact={isCompact}>
      <DropdownHeader onClick={toggleDropdown} isCompact={isCompact}>
        <span>{formatModelLabel(selectedModel.label, isCompact)}</span>
        <Arrow />
      </DropdownHeader>
      {isOpen && (
        <DropdownList isCompact={isCompact}>
          {modelOptions.map((option) => (
            <DropdownListItem
              key={option.value}
              onClick={() => handleItemClick(option)}
              isCompact={isCompact}
            >
              {formatModelLabel(option.label, isCompact)}
            </DropdownListItem>
          ))}
        </DropdownList>
      )}
    </DropdownContainer>
  );
};
