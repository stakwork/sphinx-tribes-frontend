import styled from 'styled-components';
import checkboxImage from './Icons/checkboxImage.svg';

const PopoverCheckbox = styled.div<{ color?: any }>`
  margin-right: 3px;
  overflow-y: scroll;
  display: flex;
  align-items: center;
  &.CheckboxOuter > div {
    height: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    .euiCheckboxGroup__item {
      margin-top: 0px;
      display: flex;
      align-items: center;
      .euiCheckbox__square {
        border: 1px solid ${(p: any) => p?.color && p?.color?.grayish.G500};
        border-radius: 2px;
      }
      .euiCheckbox__input + .euiCheckbox__square {
        background: ${(p: any) => p?.color && p?.color?.pureWhite} no-repeat center;
      }
      .euiCheckbox__input:checked + .euiCheckbox__square {
        border: 1px solid ${(p: any) => p?.color && p?.color?.blue1};
        background: ${(p: any) => p?.color && p?.color?.blue1} no-repeat center;
        background-image: url(${checkboxImage});
      }
      .euiCheckbox__label {
        font-family: 'Barlow';
        font-style: normal;
        font-weight: 500;
        font-size: 13px;
        line-height: 16px;
        color: ${(p: any) => p?.color && p?.color?.grayish.G50};
        margin-top: 2px;
      }
      input.euiCheckbox__input:checked ~ label {
        color: black;
        font-weight: 600;
      }
    }
  }
`;

export default PopoverCheckbox;
