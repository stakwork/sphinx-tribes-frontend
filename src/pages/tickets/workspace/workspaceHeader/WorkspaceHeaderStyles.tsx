import styled from 'styled-components';
import { colors } from 'config/colors';
import checkboxImage from './Icons/checkboxImage.svg';

interface styledProps {
  color?: any;
}

export const UrlButtonContainer = styled.div`
  width: 180px;
  display: flex;
  gap: 8px;
  margin-left: 0px;
`;

export const FillContainer = styled.div`
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-bottom: 1px solid var(--Input-BG-1, #f2f3f5);
`;

export const Filters = styled.div`
  display: flex;
  width: 1366px;
  padding: 10px 130px;
  justify-content: center;
  align-items: center;
  gap: 198px;
  align-self: stretch;
  background: #fff;
  margin-left: auto;
  margin-right: auto;
`;
export const FiltersRight = styled.span`
  display: flex;
  height: 40px;
  padding-right: 122px;
  align-items: flex-start;
  gap: 52px;
  flex: 1 0 0;
  width: 1366px;
`;

export const SkillContainer = styled.span`
  align-items: center;
  display: flex;
  position: relative;
  width: 85px;
  gap: 2px;
`;

export const InnerContainer = styled.span`
  padding: 7px 0px;
  justify-content: center;
  align-items: center;
  display: flex;
  width: 80px;
  gap: 2px;
`;

export const SkillInnerContainer = styled.span`
  justify-content: center;
  align-items: center;
  display: flex;
  width: 75px;
  gap: 2px;
`;
export const Formatter = styled.span`
  padding-top: 8px;
`;

export const Button = styled.button`
  border-radius: 6px;
  background: var(--Primary-Green, #49c998);
  box-shadow: 0px 2px 10px 0px rgba(73, 201, 152, 0.5);
  border: none;
  display: flex;
  width: 144px;
  height: 40px;
  padding: 8px 16px;
  justify-content: flex-end;
  align-items: center;
  gap: 6px;
  color: var(--White, #fff);
  text-align: center;
  font-family: Barlow;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 0px; /* 0% */
  letter-spacing: 0.14px;
`;

export const UrlButton = styled.button`
  border-radius: 4px;
  margin-right: auto;
  border: 1px solid #dde1e5;
  background: #ffffff;
  display: flex;
  width: 85px;
  height: 28px;
  padding: 8px 16px;
  justify-content: center;
  align-items: center;
  gap: 8px;
  color: var(--Black, #5f6368);
  text-align: center;
  font-family: 'Barlow';
  font-size: 13px;
  font-style: normal;
  font-weight: 500;
  line-height: 0px; /* 0% */
  letter-spacing: 0.14px;
`;

export const FilterLabel = styled.label`
  color: var(--Main-bottom-icons, #5f6368);
  font-family: Barlow;
  font-size: 15px;
  font-style: normal;
  font-weight: 500;
  line-height: 17px;
  letter-spacing: 0.15px;
`;
export const CompanyNameAndLink = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const CompanyLabel = styled.p`
  color: var(--Text-2, #3c3f41);
  font-family: Barlow;
  font-size: 28px;
  font-style: normal;
  font-weight: 700;
  margin: 2px;
  display: flex;
  align-items: center;
`;
export const ImageContainer = styled.img`
  width: 72px;
  height: 72px;
  border-radius: 66px;
`;

export const CompanyDescription = styled.div`
  max-width: 403px;
  text-align: right;
  color: var(--Main-bottom-icons, #5f6368);
  font-family: Barlow;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
`;
export const RightHeader = styled.div`
  max-width: 593px;
  display: flex;
  gap: 46px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const SoryByContainer = styled.span`
  padding: 10px 0px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const NumberOfBounties = styled.div`
  height: 23px;
  padding: 1.5px 983.492px 1.5px 10px;
  align-items: center;
  flex-shrink: 0;
  margin: 23px 133px;
  width: 1366px;
  margin-left: auto;
  margin-right: auto;
`;
export const BountyNumber = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 11px;
`;
export const PrimaryText = styled.p`
  color: var(--Primary-Text-1, var(--Press-Icon-Color, #292c33));
  font-family: Barlow;
  font-size: 15px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
`;
export const SecondaryText = styled.p`
  color: var(--Main-bottom-icons, #5f6368);
  font-family: Barlow;
  font-size: 15px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`;
export const Img = styled.img`
  padding-bottom: 10px;
`;

export const SkillFilter = styled.div`
  width: 480px;
  height: 280px;
  background-color: white;
  position: absolute;
  top: 50px;
  z-index: 999;
  border-radius: 0px 0px 6px 6px;
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  border-left: 1px solid rgba(0, 0, 0, 0.1);
  background: #fff;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.12);

  /* border-top: 3px solid var(--Primary-blue, #618AFF);
  border-top-height: 20px; */

  ::after {
    content: '';
    position: absolute;
    left: 0;
    right: 380px;
    top: 0;
    height: 3px;
    background: var(--Primary-blue, #618aff);
  }
`;
export const InternalContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 30px;
  padding: 24px 20px 28px 20px;
`;

export const EuiPopOverCheckboxRight = styled.div<styledProps>`
  height: auto;
  user-select: none;
  &.CheckboxOuter > div {
    height: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    column-gap: 56px;
    justify-content: center;
    .euiCheckboxGroup__item {
      .euiCheckbox__square {
        top: 5px;
        border: 1px solid ${(p: any) => p?.color && p?.color?.grayish.G500};
        border-radius: 2px;
      }
      .euiCheckbox__input + .euiCheckbox__square {
        background: ${(p: any) => p?.color && p?.color?.pureWhite} no-repeat center;
      }
      .euiCheckbox__input:checked + .euiCheckbox__square {
        border: 1px solid ${(p: any) => p?.color && p?.color?.blue1};
        background: ${(p: any) => p?.color && p?.color?.blue1} no-repeat center;
        background-size: contain;
        background-image: url(${checkboxImage});
      }
      .euiCheckbox__label {
        font-family: 'Barlow';
        font-style: normal;
        font-weight: 500;
        font-size: 13px;
        line-height: 18px;
        color: ${(p: any) => p?.color && p?.color?.grayish.G50};
        &:hover {
          color: ${(p: any) => p?.color && p?.color?.grayish.G05};
        }
      }
      input.euiCheckbox__input:checked ~ label {
        color: ${(p: any) => p?.color && p?.color?.blue1};
      }
    }
  }
`;

export const DropDownButton = styled.button`
  border: none;
  background-color: transparent;
  padding-top: 5px;
`;

export const FiltersLeft = styled.span`
  display: flex;
  height: 40px;
  align-items: flex-start;
`;

export const EuiPopOverCheckbox = styled.div<styledProps>`
  width: 147px;
  height: auto;
  padding: 15px 18px;
  border-right: 1px solid ${(p: any) => p.color && p.color.grayish.G700};
  user-select: none;
  .leftBoxHeading {
    font-family: 'Barlow';
    font-style: normal;
    font-weight: 700;
    font-size: 12px;
    line-height: 32px;
    text-transform: uppercase;
    color: ${(p: any) => p.color && p.color.grayish.G100};
    margin-bottom: 10px;
  }

  &.CheckboxOuter > div {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;

    .euiCheckboxGroup__item {
      .euiCheckbox__square {
        top: 5px;
        border: 1px solid ${(p: any) => p?.color && p?.color?.grayish.G500};
        border-radius: 2px;
      }
      .euiCheckbox__input + .euiCheckbox__square {
        background: ${(p: any) => p?.color && p?.color?.pureWhite} no-repeat center;
      }
      .euiCheckbox__input:checked + .euiCheckbox__square {
        border: 1px solid ${(p: any) => p?.color && p?.color?.blue1};
        background: ${(p: any) => p?.color && p?.color?.blue1} no-repeat center;
        background-size: contain;
        background-image: url(${checkboxImage});
      }
      .euiCheckbox__label {
        font-family: 'Barlow';
        font-style: normal;
        font-weight: 500;
        font-size: 13px;
        line-height: 16px;
        color: ${(p: any) => p?.color && p?.color?.grayish.G50};
        &:hover {
          color: ${(p: any) => p?.color && p?.color?.grayish.G05};
        }
      }
      input.euiCheckbox__input:checked ~ label {
        color: ${(p: any) => p?.color && p?.color?.grayish.G05};
      }
    }
  }
`;

export const NewStatusContainer = styled.div``;

export const StatusContainer = styled.div<styledProps>`
  width: 70px;
  height: 48px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-left: 19px;
  cursor: pointer;
  user-select: none;
  .filterStatusIconContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 48px;
    width: 38px;
    .materialStatusIcon {
      color: ${(p: any) => p.color && p.color.grayish.G200};
      cursor: pointer;
      font-size: 18px;
      margin-top: 5px;
    }
  }
  .statusText {
    font-family: 'Barlow';
    font-style: normal;
    font-weight: 500;
    font-size: 15px;
    line-height: 17px;
    letter-spacing: 0.15px;
    display: flex;
    align-items: center;
    color: ${(p: any) => p.color && p.color.grayish.G200};
  }
  &:hover {
    .filterStatusIconContainer {
      .materialStatusIcon {
        color: ${(p: any) => p.color && p.color.grayish.G50} !important;
        cursor: pointer;
        font-size: 18px;
        margin-top: 5px;
      }
    }
    .statusText {
      color: ${(p: any) => p.color && p.color.grayish.G50};
    }
  }
  &:active {
    .filterStatusIconContainer {
      .materialStatusIcon {
        color: ${(p: any) => p.color && p.color.grayish.G10} !important;
        cursor: pointer;
        font-size: 18px;
        margin-top: 5px;
      }
    }
    .statusText {
      color: ${(p: any) => p.color && p.color.grayish.G10};
    }
  }
`;

export const FilterCount = styled.div<styledProps>`
  height: 20px;
  width: 20px;
  border-radius: 50%;
  margin-left: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: -5px;
  background: ${(p: any) => p?.color && p.color.blue1};
  .filterCountText {
    font-family: 'Barlow';
    font-style: normal;
    font-weight: 500;
    font-size: 13px;
    display: flex;
    align-items: center;
    text-align: center;
    color: ${(p: any) => p.color && p.color.pureWhite};
  }
`;

export const SkillTextContainer = styled.div<styledProps>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  user-select: none;
  .filterStatusIconContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 48px;
    width: 34px;
    .materialStatusIcon {
      color: ${(p: any) => p.color && p.color.grayish.G200};
      cursor: pointer;
      font-size: 18px;
      margin-top: 3px;
    }
  }
  .skillText {
    font-family: 'Barlow';
    font-style: normal;
    font-weight: 500;
    font-size: 15px;
    line-height: 17px;
    letter-spacing: 0.15px;
    display: flex;
    align-items: center;
    color: ${(p: any) => p.color && p.color.grayish.G200};
  }
  &:hover {
    .filterStatusIconContainer {
      .materialStatusIcon {
        color: ${(p: any) => p.color && p.color.grayish.G50} !important;
        cursor: pointer;
        font-size: 18px;
        margin-top: 3px;
      }
    }
    .skillText {
      color: ${(p: any) => p.color && p.color.grayish.G50};
    }
  }
  &:active {
    .filterStatusIconContainer {
      .materialStatusIcon {
        color: ${(p: any) => p.color && p.color.grayish.G10} !important;
        cursor: pointer;
        font-size: 18px;
        margin-top: 3px;
      }
    }
    .skillText {
      color: ${(p: any) => p.color && p.color.grayish.G10};
    }
  }
`;

export const BountyHeaderContent = styled.div`
  max-width: 403px;
  text-align: right;
  color: ${colors.dark.pureBlack};
  font-family: Barlow;
  font-size: 30px;
  font-style: normal;
  font-weight: 700;
  letter-spacing: 0.8px;
  line-height: 20px;
`;

export const DraftButton = styled.button`
  border-radius: 6px;
  background: var(--Primary-Blue, #608aff);
  box-shadow: 0px 2px 10px 0px rgba(96, 138, 255, 0.5);
  border: none;
  display: flex;
  width: auto;
  height: 40px;
  padding: 8px 16px;
  justify-content: flex-end;
  align-items: center;
  color: var(--White, #fff);
  text-align: center;
  font-family: Barlow;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 0px;
  letter-spacing: 0.14px;
  cursor: pointer;

  &:hover {
    background: #4a75f2;
  }

  &:active {
    transform: scale(0.98);
  }
`;
