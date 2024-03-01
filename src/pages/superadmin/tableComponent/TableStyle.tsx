import styled, { css } from 'styled-components';

type FreezeProps = {
  freeze: boolean;
};

type styledProps = {
  color?: any;
};

const applyFreezeHeaderStyles = ({ freeze = false }: FreezeProps) =>
  freeze &&
  css`
    position: fixed;
    top: 124px;
    left: 0;
    padding: 0 2.5rem 0 1rem;
    background-color: #fff;
    z-index: 99999999;
    width: 100%;
    border-radius: 0;
    box-shadow: none;
  `;

const applyFreezeTableHeaderStyles = ({ freeze = false }: FreezeProps) =>
  freeze &&
  css`
    position: sticky;
    top: 50px;
    left: 0;
    width: 100%;
    background-color: #fff;
    z-index: 99999999;
    box-shadow:
      inset 0 1px 0 #ddd,
      inset 0 -1px 0 #ddd;
  `;

export const TableContainer = styled.div`
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

export const HeaderContainer = styled.div<FreezeProps>`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding-right: 40px;
  padding-left: 20px;
  ${applyFreezeHeaderStyles}
`;

export const PaginatonSection = styled.div`
  background-color: #fff;
  height: 150px;
  flex-shrink: 0;
  align-self: stretch;
  border-radius: 8px;
  padding: 1em;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const TableRow = styled.tr<FreezeProps>`
  border: 1px solid #ddd;
  &:nth-child(even) {
    background-color: #f9f9f9;
  }
  ${applyFreezeTableHeaderStyles}
`;

export const TableDataRow = styled.tr`
  height: 80px;
  border: 1px solid #ddd;
  &:nth-child(odd) {
    background-color: #f9f9f9;
  }
`;

export const TableData = styled.td`
  text-align: left;
  white-space: wrap;
  font-size: 14px;
  width: 350.588px;
  padding-left: 50px;
  color: var(--Primary-Text-1, var(--Press-Icon-Color, #292c33));
  font-family: Barlow;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`;

export const BountyData = styled.td`
  text-align: left;
  white-space: wrap;
  font-size: 14px;
  padding-left: 50px;
  width: 350.588px;
  color: var(--Primary-Text-1, var(--Press-Icon-Color, #292c33));
  font-family: Barlow;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  cursor: pointer;
  &:hover {
    color: var(--Primary-Text-1, var(--Press-Icon-Color, #000000));
  }
`;

export const TableDataAlternative = styled.td`
  padding-left: 50px;
  text-align: left;
  color: var(--Primary-Text-1, var(--Press-Icon-Color, #292c33));
  font-family: Barlow;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
`;

export const TableDataCenter = styled.td`
  padding: 12px;
  text-align: center;
  white-space: wrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
  font-size: 14px;
  padding-right: 2em;
  padding-left: 2em;
`;

export const TableData2 = styled.td`
  white-space: wrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
  display: flex;
  justify-content: end;
`;

export const TableData3 = styled.td`
  padding-right: 35px;
`;

export const TableHeaderData = styled.th`
  padding: 12px;
  text-align: left;
  padding-left: 52px;
  color: var(--Main-bottom-icons, #5f6368);
  font-family: Barlow;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  letter-spacing: 0.72px;
  text-transform: uppercase;
`;

export const TableHeaderDataAlternative = styled.th`
  padding: 12px;
  text-align: left;
  padding-left: 52px;
  color: var(--Main-bottom-icons, #5f6368);
  font-family: Barlow;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  letter-spacing: 0.72px;
  text-transform: uppercase;
`;

export const TableHeaderDataCenter = styled.th`
  padding: 12px;
  text-align: center;
  color: var(--Main-bottom-icons, #5f6368);
  font-family: Barlow;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  letter-spacing: 0.72px;
  text-transform: uppercase;
`;

export const TableHeaderDataRight = styled.th`
  padding: 12px;
  text-align: right;
  padding-right: 40px;
  color: var(--Main-bottom-icons, #5f6368);
  font-family: Barlow;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  letter-spacing: 0.72px;
  text-transform: uppercase;
`;

export const BountyHeader = styled.div`
  background: #fff;
  display: flex;
  height: 66px;
  justify-content: space-between;
  text-align: center;
  align-items: center;
  gap: 10px;
  padding-left: 32px;
  padding-right: 47px;
`;

export const Options = styled.div`
  height: 20px;
  font-size: 15px;
  cursor: pointer;
  outline: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 20px;
  padding-right: 2px;
`;

export const DateFilterWrapper = styled.div<styledProps>`
  width: 130px;
  height: 20px;
  display: flex;
  gap: 5px;
  flex-direction: row;
  justify-content: center;
  align-items: center !important;
  margin-left: 19px;
  user-select: none;
  .image {
    display: flex;
    justify-content: space-between;
    gap: 5px;
    align-items: center;
    width: 36px;
    .materialIconImage {
      color: ${(p: any) => p.color && p.color.grayish.G200};
      cursor: pointer;
      font-size: 18px;
      margin-top: 4px;
    }
  }
  .filterText {
    color: ${(p: any) => p.color && p.color.grayish.G200};
    font-family: Barlow;
    font-size: 15px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    margin-left: 2px;
  }
  &:hover {
    .image {
      .materialIconImage {
        color: ${(p: any) => p.color && p.color.grayish.G50} !important;
        cursor: pointer;
        font-size: 18px;
        margin-top: 4px;
      }
    }
    .filterText {
      color: ${(p: any) => p.color && p.color.grayish.G50};
    }
  }
  &:active {
    .image {
      .materialIconImage {
        color: ${(p: any) => p.color && p.color.grayish.G10} !important;
        cursor: pointer;
        font-size: 18px;
        margin-top: 4px;
      }
    }
    .filterText {
      color: ${(p: any) => p.color && p.color.grayish.G10};
    }
  }
`;

export const DateFilterContent = styled.div<styledProps>`
  width: 100%;
  height: 100%;
  padding: 15px 18px;
  user-select: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 5px;
`;

export const StyledSelect2 = styled.select`
  color: var(--Text-2, var(--Hover-Icon-Color, #3c3f41));
  font-family: Barlow;
  font-size: 15px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  border-radius: 4px;
  cursor: pointer;
  outline: none;
  width: 45px;
  border: none;
  height: 20px;
`;

export const LeadingTitle = styled.h2`
  color: var(--Primary-Text-1, var(--Press-Icon-Color, #292c33));

  font-family: Barlow;
  font-size: 15px;
  font-style: normal;
  font-weight: 600;
  display: flex;
  gap: 6px;
  line-height: normal;
  margin-top: 15px;
`;

export const AlternativeTitle = styled.h2`
  color: var(--Main-bottom-icons, #5f6368);
  font-family: Barlow;
  font-size: 15px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`;

export const Label = styled.label`
  margin-top: 7px;
  color: var(--Main-bottom-icons, var(--Hover-Icon-Color, #5f6368));
  font-family: Barlow;
  font-size: 15px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  margin-left: 15px;
`;

export const FlexDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;

  .euiPopover__anchor {
    margin-top: 6px !important;
  }
`;

interface PaginationButtonsProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active: boolean;
}

export const PaginationButtons = styled.button<PaginationButtonsProps>`
  border-radius: 3px;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  outline: none;
  border: none;
  text-align: center;
  margin: 10px;
  background: ${(props: any) => (props.active ? 'var(--Active-blue, #618AFF)' : 'white')};
  color: ${(props: any) => (props.active ? 'white' : 'black')};
`;

export const PageContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const BoxImage = styled.div`
  display: flex;
  width: 162px;
  align-items: center;
  text-align: center;
  gap: 6px;
`;

export const Paragraph = styled.div`
  margin-top: 2px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 200px;
`;

export const PaginationImg = styled.img`
  cursor: pointer;
`;

export const ProviderContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const ProvidersListContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem 1.875rem;
  max-height: 16rem;
  overflow-y: auto;
`;

export const ProviderContianer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

export const ProviderInfo = styled.div`
  display: flex;
  align-items: center;
  opacity: 1;
`;

export const ProviderImg = styled.img`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  margin-right: 0.63rem;
  object-fit: cover;
`;

export const Providername = styled.p`
  color: #3c3f41;
  font-family: 'Barlow';
  font-size: 0.8125rem;
  font-style: normal;
  font-weight: 500;
  line-height: 1rem;
  margin-bottom: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
`;

export const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 1rem;
  height: 1rem;
`;

export const HorizontalGrayLine = styled.div`
  width: 100%;
  height: 2px;
  background-color: #edecec;
  content: '';
  margin: auto;
`;

export const FooterContainer = styled.div`
  display: flex;
  padding: 1.125rem 1.875rem;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const ClearButton = styled.button`
  width: 112px;
  padding: 8px 16px;
  height: 40px;
  justify-content: center;
  align-items: center;
  gap: 6px;
  border-radius: 6px;
  border: 1px solid var(--Input-Outline-1, #d0d5d8);
  background: var(--White, #fff);
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.06);
  margin-right: 10px;
`;

export const ClearText = styled.p`
  color: var(--Main-bottom-icons, #5f6368);
  text-align: center;
  font-family: 'Barlow', sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 0px; /* 0% */
  letter-spacing: 0.14px;
  margin-top: 10px;
`;

export const ApplyButton = styled.button`
  display: flex;
  width: 112px;
  height: 40px;
  padding: 8px 16px;
  justify-content: center;
  align-items: center;
  gap: 6px;
  border: none;
  outline: none;
  border-radius: 6px;
  background: var(--Primary-blue, #618aff);
  box-shadow: 0px 2px 10px 0px rgba(97, 138, 255, 0.5);
  color: white;
`;
