import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ErrorText, SwitcherButton, SwitcherContainer } from 'people/widgetViews/workspace/style';
import { renderMarkdown } from 'people/utils/RenderMarkdown';
import { snippetStore } from 'store/snippetStore';
import { colors } from '../../../config/colors';
import { normalizeTextValue } from '../../../helpers';
import type { Props } from './propsType';
import { SnippetDropdown } from './SnippetDropDown';

interface styledProps {
  color?: any;
  borderColor?: string;
  characterError?: boolean;
}

const InputOuterBox = styled.div<styledProps>`
  position: relative;
  margin-bottom: 0px;
  .inputText {
    width: 100%;
    font-size: 14px;
    color: ${(p: any) => p.color && p.color.pureBlack};
    border: 2px solid ${(p: any) => p.borderColor && p.borderColor};
    border-radius: 4px;
    outline: none;
    padding-left: 16px;
    padding-top: 16px;
    resize: none;
    color: #3c3f41;
    font-weight: 500;
    letter-spacing: 0.01em;
    :active {
      border: 1px solid ${(p: any) => p.color.blue2 && p.color.blue2} !important;
    }
    :focus-visible {
      border: 2px solid
        ${(p: any) => (p.color.blue2 && p.characterError ? p.borderColor : p.color.blue2)} !important;
    }
  }
  textarea::placeholder {
    position: relative;
    top: 14px;
    font-style: italic;
    font-size: 12px;
    color: #999;
  }
`;
export default function TextAreaInputNew({
  error,
  label,
  value,
  handleChange,
  handleBlur,
  handleFocus,
  isFocused,
  placeholder,
  style,
  labelStyle,
  name,
  testId,
  setColor,
  workspaceid
}: Props) {
  let labeltext = label;
  const [characterError, setCharacterError] = useState(false);
  if (error || characterError) labeltext = `${labeltext}*`;

  const color = colors['light'];
  const [isError, setIsError] = useState<boolean>(false);
  const [textValue, setTextValue] = useState(value);
  const [showPlaceholder, setShowPlaceholder] = useState(!textValue);
  const [activeMode, setActiveMode] = useState<'preview' | 'edit'>('edit');

  useEffect(() => {
    setTextValue(value);
    setShowPlaceholder(!value);
  }, [value]);

  useEffect(() => {
    if (textValue) {
      setIsError(false);
      setShowPlaceholder(false);
    } else {
      setShowPlaceholder(true);
    }
  }, [textValue]);

  useEffect(() => {
    if (workspaceid) {
      snippetStore.loadSnippets(workspaceid);
    }
  }, [workspaceid]);

  const snippets = snippetStore.getAllSnippets();

  const filteredSnippets = snippets.map((p: any) => ({
    value: p.id,
    label: p.title,
    snippet: p.snippet
  }));

  const handleSnippetSelect = (snippet: string) => {
    const newValue = value ? `${value}\n${snippet}` : snippet;
    handleChange(newValue);
    setTextValue(newValue);
  };

  return (
    <div data-testid="text-area-input-new-component">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
        <SnippetDropdown items={filteredSnippets} onSelect={handleSnippetSelect} />
        <SwitcherContainer>
          <SwitcherButton
            isActive={activeMode === 'preview'}
            onClick={() => setActiveMode('preview')}
          >
            Preview
          </SwitcherButton>
          <SwitcherButton isActive={activeMode === 'edit'} onClick={() => setActiveMode('edit')}>
            Edit
          </SwitcherButton>
        </SwitcherContainer>
      </div>

      <InputOuterBox
        color={color}
        borderColor={characterError || isError ? color.red2 : color.grayish.G600}
        characterError={characterError}
      >
        {activeMode === 'edit' ? (
          <textarea
            className="inputText"
            placeholder={showPlaceholder ? placeholder : ''}
            id={name}
            data-testid={testId}
            value={textValue || ''}
            onFocus={() => {
              handleFocus();
              setShowPlaceholder(false);
            }}
            onBlur={() => {
              handleBlur();
              if (error) {
                setIsError(true);
              }
              if (!textValue) {
                setShowPlaceholder(true);
              } else {
                const trimmedAndSingleSpacedValue = normalizeTextValue(textValue);
                setTextValue(trimmedAndSingleSpacedValue);
                handleChange(trimmedAndSingleSpacedValue);
              }
            }}
            onChange={(e: any) => {
              const newVal = e.target.value.trimStart();
              if (name === 'description') {
                const isExceeding = newVal.length > 120;
                handleChange(newVal);
                setTextValue(newVal);
                setCharacterError(isExceeding);
                setColor && setColor(isExceeding, name);
              } else {
                handleChange(newVal);
                setTextValue(newVal);
              }
            }}
            style={{
              height: label === 'Deliverables' ? '137px' : '175px',
              ...style
            }}
          />
        ) : (
          <div className="p-4 border-solid">{renderMarkdown(value)}</div>
        )}

        <label
          htmlFor={name}
          className="text"
          onClick={handleFocus}
          style={{
            position: 'absolute',
            left: 16,
            top:
              isFocused && !isFocused[label]
                ? textValue === undefined || textValue === ''
                  ? 10
                  : -9
                : -9,
            fontSize: isFocused && !isFocused[label] ? (textValue === undefined ? 14 : 12) : 12,
            color: color.grayish.G300,
            background: color.pureWhite,
            fontFamily: 'Barlow',
            fontWeight: '500',
            transition: 'all 0.5s',
            ...labelStyle
          }}
        >
          {labeltext}
        </label>
        {characterError ? <ErrorText>Description is too long</ErrorText> : null}
      </InputOuterBox>
    </div>
  );
}