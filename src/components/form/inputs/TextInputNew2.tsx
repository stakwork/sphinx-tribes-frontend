import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { colors } from '../../../config/colors';
import type { Props } from './propsType';

interface styledProps {
  color?: any;
  borderColor?: string;
  characterError?: boolean;
}
const ErrorText = styled.p`
  font-size: 11px;
  color: #ff8f80;
  z-index: 999;
  top: 75px;
`;
const InputOuterBox = styled.div<styledProps>`
  position: relative;
  margin-bottom: 32px;
  .inputText {
    height: 40px;
    width: 100%;
    font-size: 14px;
    color: ${(p: any) => p.color && p.color.pureBlack};
    border: 2px solid ${(p: any) => p.borderColor && p.borderColor};
    border-radius: 4px;
    outline: none;
    padding-left: 16px;
    color: ${(p: any) => p.color && p.color.text2};
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
`;
export default function TextInputNew({
  error,
  label,
  value,
  handleChange,
  handleBlur,
  handleFocus,
  isFocused,
  labelStyle,
  name,
  setColor,
  testId
}: Props) {
  let labeltext = label;
  if (error) labeltext = `${labeltext}*`;
  const color = colors['light'];
  const [isError, setIsError] = useState<boolean>(false);
  const [textValue, setTextValue] = useState(value);
  const [characterError, setCharacterError] = useState(false);

  useEffect(() => {
    if (textValue) {
      setIsError(false);
    }
  }, [textValue]);

  return (
    <InputOuterBox
      color={color}
      borderColor={characterError || isError ? color.red2 : color.grayish.G600}
      characterError={characterError}
    >
      <input
        className="inputText"
        id={'text'}
        type={'text'}
        value={textValue}
        onFocus={handleFocus}
        onBlur={() => {
          handleBlur();
          if (error) {
            setIsError(true);
          }
        }}
        data-testid={testId}
        onChange={(e: any) => {
          const newVal = e.target.value;
          if (name === 'name') {
            if (newVal.length <= 20) {
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
      />
      <label
        htmlFor={'text'}
        className="text"
        onClick={handleFocus}
        style={{
          position: 'absolute',
          left: 16,
          top: isFocused && !isFocused[label] ? (textValue === undefined ? 10 : -9) : -9,
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
      {characterError ? <ErrorText>name is too long</ErrorText> : null}
    </InputOuterBox>
  );
}
