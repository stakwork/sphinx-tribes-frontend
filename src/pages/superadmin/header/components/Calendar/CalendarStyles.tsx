import styled from 'styled-components';

export const Section = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 8px;
  align-self: stretch;
  margin-right: 35px;
  z-index: 999;
  margin-bottom: 8px;
`;

export const MainContainer = styled.div`
  position: absolute;
  z-index: 999;
  right: -51px;
  top: 40px;
  display: flex;
  width: 375px;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  border-radius: 6px;
  background: #fff;
  margin: 100px;
  box-shadow: 0px 4px 20px 0px rgba(0, 0, 0, 0.25);
`;

export const HeaderDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;
  gap: 16px;
  width: 375px;
`;
// height: ${from || to ? '580px' : '180px'};

export const FormDiv = styled.div`
  display: flex;
  justify-content: space-between;
  align-self: stretch;
  align-items: center;
  gap: 25px;
`;
type FormProps = {
  value?: string | Date;
  focused?: boolean;
};
export const FormInput = styled.input<FormProps>`
  display: flex;
  width: 113px;
  height: 40px;
  padding: 8px 16px;
  justify-content: center;
  align-items: center;
  gap: 6px;
  border-radius: 6px;
  outline: none;
  background: var(--White, #fff);
  color: var(--Placeholder-Text, var(--Disabled-Icon-color, #b0b7bc));
  text-align: center;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 0px;
  color: ${(props: any) =>
    props.focused
      ? 'var(--Placeholder-Text, var(--Disabled-Icon-color, #5078f2))'
      : 'var(--Placeholder-Text, var(--Disabled-Icon-color, #b0b7bc))'};

  border: ${(props: any) => (props.focused ? '1px solid #5078f2' : '1px solid #b0b7bc')};
  &::placeholder {
    color: ${(props: any) =>
      props.focused
        ? 'var(--Placeholder-Text, var(--Disabled-Icon-color, #5078f2))'
        : 'var(--Placeholder-Text, var(--Disabled-Icon-color, #b0b7bc))'};
  }
`;
type BtnProps = {
  color: string;
};
export const Button = styled.button<BtnProps>`
  background-color: transparent;
  width: 54px;
  height: 40px;
  color: ${(props: any) => props.color};
  text-align: center;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0.1px;
  outline: none;
  border: none;
  font-family: Barlow;
`;

export const Para = styled.p`
  color: var(--Text-2, var(--Hover-Icon-Color, #3c3f41));
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 18px;
`;

export const FlexDiv = styled.div`
  padding: 28px 0px 0px 28px;
`;

export const Formator = styled.div`
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 8px;
`;
