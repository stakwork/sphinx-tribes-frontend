import React from 'react';
import styled from 'styled-components';
import { TextInputProps } from 'components/interfaces';
import { colors } from '../../config/colors';
import { FieldText } from '../form/inputs/index';

const StyledLabel = styled.span`
  font-family: Barlow;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  display: flex;
  margin-bottom: 4px;
`;

export default function TextInput({
  label,
  value,
  onChange,
  handleBlur,
  handleFocus,
  readOnly,
  prepend,
  style
}: TextInputProps) {
  const color = colors['light'];
  return (
    <div data-testid="text-input-component">
      <StyledLabel>{label}</StyledLabel>
      <FieldText
        color={color}
        name="first"
        value={value || ''}
        readOnly={readOnly || false}
        onChange={(e: any) => onChange(e.target.value)}
        onBlur={handleBlur}
        onFocus={handleFocus}
        prepend={prepend}
        style={style}
      />
    </div>
  );
}
