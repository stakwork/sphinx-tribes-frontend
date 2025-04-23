import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Select } from '../../common';
import { colors } from '../../../config/colors';
import type { Props } from './propsType';

interface styledProps {
  color?: any;
}

const OuterContainer = styled.div<styledProps>`
  box-shadow: 0px 1px 2px ${(p: any) => p.color && p.color.black100} !important ;
  margin-top: 10px;
`;
export default function SelectInput({ label, options, value, handleChange, testId }: Props) {
  const color = colors['light'];
  const [active, setActive] = useState<boolean>(false);
  const [isSelectOpen, setIsSelectOpen] = useState<boolean>(false);

  useEffect(() => {
    if (active === false) {
      setIsSelectOpen(false);
    }
  }, [isSelectOpen, active]);

  return (
    <OuterContainer color={color} data-testid="select-input-component">
      <Select
        isOpen={isSelectOpen}
        testId={testId}
        name={'first'}
        selectStyle={{
          border: 'none',
          fontFamily: 'Barlow',
          fontWeight: '500',
          fontSize: '14px',
          color: '#3C3F41',
          letterSpacing: '0.01em'
        }}
        options={options}
        value={value}
        placeholder={label}
        handleActive={setActive}
        onChange={(e: any) => {
          handleChange(e);
          setActive(false);
        }}
      />
    </OuterContainer>
  );
}
