import MaterialIcon from '@material/react-material-icon';
import React, { CSSProperties, ComponentProps, useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react-lite';
import { colors } from '../../config/colors';
import { useStores } from '../../store';

let debounceValue = '';
let inDebounce;
function debounce(func: any, delay: any) {
  clearTimeout(inDebounce);
  inDebounce = setTimeout(() => {
    func();
  }, delay);
}
interface InputProps {
  border?: string;
  borderHover?: string;
  borderActive?: string;
  borderRadius?: string;
  TextColor?: string;
  TextColorHover?: string;
  iconColor?: string;
  iconColorHover?: string;
  color?: any;
  width?: string;
  height?: string;
  marginLeft?: string;
}

const Container = styled.div<InputProps>`
  .SearchText {
    width: ${(p: any) => (p.width ? p.width : 'auto')};
    height: ${(p: any) => (p.height ? p.height : '35px')};
    background: ${(p: any) => p.color && p.color.grayish.G600} !important;
    border: ${(p: any) => (p.border ? p.border : `1px solid ${p.color.pureBlack}`)};
    box-sizing: border-box;
    border-radius: ${(p: any) => (p.borderRadius ? p.borderRadius : '200px')};
    margin-left: ${(p: any) => (p.marginLeft ? p.marginLeft : '0px')};
    padding-left: 20px;
    padding-right: 30px;
    font-style: normal;
    font-weight: 500;
    font-family: 'Barlow';
    font-size: 16px;
    line-height: 14px;
    transition: all 0.4s;
    &::placeholder {
      color: ${(p: any) => (p.TextColor ? p.TextColor : `${p.color.grayish.G65}`)};
      font-family: 'Barlow';
      font-style: normal;
      font-weight: 400;
      font-size: 16px;
      line-height: 19px;
    }
    &:focus {
      border: ${(p: any) => (p.borderActive ? p.borderActive : `1px solid ${p.color.pureBlack}`)};
      outline: none;
      caret-color: ${(p: any) => p.color && p.color.light_blue100};
      &::placeholder {
        color: ${(p: any) => (p.TextColorHover ? p.TextColorHover : `${p.color.grayish.G65}`)};
      }
    }
    &:focus-within {
      background: ${(p: any) => p.color && p.color.grayish.G950} !important;
    }
  }

  .SearchIcon {
    color: ${(p: any) => (p.iconColor ? p.iconColor : `${p.color.pureBlack}`)};
  }

  &:hover {
    .SearchIcon {
      color: ${(p: any) => p.iconColorHover ?? p.color.pureBlack};
    }
    .SearchText {
      border: ${(p: any) => (p.borderHover ? p.borderHover : `1px solid ${p.color.pureBlack}`)};
      &:focus {
        border: ${(p: any) => (p.borderActive ? p.borderActive : `1px solid ${p.color.pureBlack}`)};
        outline: none;
        caret-color: ${(p: any) => p.color && p.color.light_blue100};
      }
      &::placeholder {
        color: ${(p: any) => (p.TextColorHover ? p.TextColorHover : `${p.color.grayish.G65}`)};
      }
    }
  }
  &:active {
    .SearchText {
      border: ${(p: any) => (p.borderActive ? p.borderActive : `1px solid ${p.color.pureBlack}`)};
      outline: none;
      caret-color: ${(p: any) => p.color && p.color.light_blue100};
    }
  }
`;

type SearchTextInputProps = ComponentProps<'input'> &
  InputProps & {
    onChange: (v: string) => void;
    iconStyle?: CSSProperties;
  };

function SearchBar({
  border,
  borderActive,
  borderHover,
  borderRadius,
  TextColor,
  TextColorHover,
  iconColorHover,
  iconColor,
  onChange,
  iconStyle = {},
  width,
  height,
  marginLeft,
  ...props
}: SearchTextInputProps & InputProps) {
  const color = colors['light'];
  const { ui } = useStores();
  const [searchValue, setSearchValue] = useState(ui.searchText || '');
  const [, setExpand] = useState(ui.searchText ? true : false);

  function doDelayedValueUpdate() {
    onChange(debounceValue);
  }

  function erase() {
    setSearchValue('');
    onChange('');
  }

  return (
    <Container
      style={{ position: 'relative' }}
      border={border}
      borderActive={borderActive}
      borderHover={borderHover}
      borderRadius={borderRadius}
      TextColor={TextColor}
      TextColorHover={TextColorHover}
      iconColorHover={iconColorHover}
      iconColor={iconColor}
      color={color}
      width={width}
      height={height}
      marginLeft={marginLeft}
    >
      <label htmlFor="search" hidden>
        Search
      </label>
      <input
        id="search"
        className="SearchText"
        {...props}
        onFocus={() => setExpand(true)}
        onBlur={() => {
          if (!ui.searchText) setExpand(false);
        }}
        value={searchValue}
        onChange={(e: any) => {
          setSearchValue(e.target.value);
          debounceValue = e.target.value;
          debounce(doDelayedValueUpdate, 300);
        }}
        placeholder={props.placeholder}
        style={{ ...props.style }}
        aria-autocomplete="list"
        aria-expanded={searchValue.length > 0}
      />
      {searchValue ? (
        <MaterialIcon
          icon="close"
          role="button"
          aria-label="Clear search"
          tabIndex={0}
          onClick={() => erase()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              erase();
            }
          }}
          style={{
            position: 'absolute',
            color: color.grayish.G300,
            cursor: 'pointer',
            top: 9,
            right: 9,
            fontSize: 22,
            userSelect: 'none',
            ...iconStyle
          }}
        />
      ) : (
        <MaterialIcon
          className="SearchIcon"
          icon="search"
          style={{
            position: 'absolute',
            top: 9,
            right: 9,
            fontSize: 22,
            userSelect: 'none',
            pointerEvents: 'none',
            ...iconStyle
          }}
        />
      )}
    </Container>
  );
}
export default observer(SearchBar);
