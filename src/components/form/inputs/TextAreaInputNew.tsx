import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { colors } from '../../../config/colors';
import type { Props } from './propsType';

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
const ErrorText = styled.p`
  font-size: 11px;
  color: #ff8f80;
  z-index: 999;
  top: 75px;
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
  setColor
}: Props) {
  let labeltext = label;
  if (error) labeltext = `${labeltext}*`;
  const color = colors['light'];
  const [isError, setIsError] = useState<boolean>(false);
  const [textValue, setTextValue] = useState(value);
  const [showPlaceholder, setShowPlaceholder] = useState(!textValue);
  const [characterError, setCharacterError] = useState(false);

  useEffect(() => {
    if (textValue) {
      setIsError(false);
      setShowPlaceholder(false);
    } else {
      setShowPlaceholder(true);
    }
  }, [textValue]);

  return (
    <InputOuterBox
      color={color}
      borderColor={characterError || isError ? color.red2 : color.grayish.G600}
      characterError={characterError}
    >
      <textarea
        className="inputText"
        placeholder={showPlaceholder ? placeholder : ''} //displays the placeholder only when the textValue is empty
        id={'text'}
        value={textValue}
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
          }
        }}
        onChange={(e: any) => {
          const newVal = e.target.value;
          if (name === 'org_description') {
            if (newVal.length <= 120) {
              handleChange(newVal);
              setTextValue(newVal);
              setCharacterError(false);
              setColor && setColor(false, name);
            } else {
              setCharacterError(true);
              setColor && setColor(true, name);
            }
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
      <label
        htmlFor={'text'}
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
  );
}
