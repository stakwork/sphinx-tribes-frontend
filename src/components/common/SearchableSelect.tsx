import React from 'react';
import styled from 'styled-components';
import Select from 'react-select';
import { SelProps } from 'components/interfaces';

const S = styled(Select)`
  background: #ffffff00;
  border: 1px solid #e0e0e0;
  color: #000;
  box-sizing: border-box;
  box-shadow: none;
  border: none !important;
  user-select: none;
  font-size: 12px;
  border-width: 0px !important;

  div {
    border-width: 0px !important;
    border: none !important;
  }

  button {
    background: #ffffff !important;
    background-color: #ffffff !important;
  }
`;
export default function SearchableSelect(props: SelProps) {
  const { options, onChange, onInputChange, value, style, loading } = props;

  const opts = options
    ? options.map((o: any) => ({
        ...o,
        value: o.value,
        label: o.label
      }))
    : [];

  return (
    <div id="dropdown-wrapper" style={{ position: 'relative', ...style }}>
      <S
        options={opts}
        isLoading={loading}
        placeholder={'Type to search...'}
        isClearable={true}
        isSearchable={true}
        value={value}
        onChange={onChange}
        onInputChange={onInputChange}
        className={'searchable-select-input'}
        menuPortalTarget={document.getElementById('dropdown-wrapper')}
        menuPosition={'fixed'}
        styles={{
          menuPortal: (styles: any) => ({ ...styles, zIndex: '100' })
        }}
      />
    </div>
  );
}
