import styled from 'styled-components';

export const Body = styled.div`
  flex: 1;
  height: calc(100vh - 60px);
  width: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const WorkspaceBody = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--Search-bar-background, #f2f3f5);
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
`;

export const FeatureBody = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--Search-bar-background, #f2f3f5);
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
`;

export const Header = styled.div`
  height: 130px;
  width: 65%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
`;

export const Leftheader = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: center;
`;

export const HeaderWrap = styled.div`
  display: flex;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
`;

export const DataWrap = styled.div`
  padding: 40px 50px;
  display: flex;
  width: 50%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: left;
  justify-content: center;

  @media only screen and (max-width: 900px) {
    width: 90%;
    padding: 30px 40px;
  }

  @media only screen and (max-width: 500px) {
    width: 90%;
    padding: 20px 10px;
  }
`;

export const FieldWrap = styled.div`
  margin-bottom: 30px;
`;

export const Label = styled.h5`
  font-size: 1.12rem;
  font-weight: bolder;
`;

export const Data = styled.div`
  border: 1px solid #ccc;
  min-height: 50px;
  border-radius: 5px;
  padding: 20px 30px;
  position: relative;
  display: flex;
  flex-direction: column;
  white-space: pre-wrap;

  .MaterialIcon {
    font-style: normal;
    font-weight: 900;
    font-size: 1.4rem;
    color: #000000;
  }
`;

export const OptionsWrap = styled.div`
  position: absolute;
  right: 6px;
  top: 4px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;

  button {
    border: 0.5px solid #000000;
    font-size: 0.8rem;
    font-weight: 700;
    border-radius: 5px;
    padding: 2px 10px;
  }
`;

export const TextArea = styled.textarea`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: 2px solid #dde1e5;
  outline: none;
  caret-color: #618aff;
  color: #3c3f41;
  font-family: 'Barlow';
  font-size: 1rem;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
  width: 100%;
  resize: none;
  min-height: 5.9375rem;

  ::placeholder {
    color: #b0b7bc;
    font-family: 'Barlow';
    font-size: 13px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
  }
  :focus {
    border: 2px solid #82b4ff;
  }
`;

export const ButtonWrap = styled.div`
  margin-left: auto;
  margin-top: 10px;
  display: flex;
  gap: 15px;
`;

interface ButtonProps {
  color?: string;
}
export const ActionButton = styled.button<ButtonProps>`
  padding: 5px 20px;
  border-radius: 5px;
  background: ${(p: any) => {
    if (p.color === 'primary') {
      return 'rgb(97, 138, 255)';
    }
  }};
  color: ${(p: any) => {
    if (p.color === 'primary') {
      return '#FFF';
    }
  }};
  border: ${(p: any) => {
    if (p.color === 'primary') {
      return '1px solid rgb(97, 138, 255)';
    } else {
      return '1px solid #636363';
    }
  }};
`;

export const FeatureLabel = styled.p`
  color: var(--Text-2, #3c3f41);
  font-family: Barlow;
  font-size: 28px;
  font-style: normal;
  font-weight: 700;
  margin: 2px;
  display: flex;
  align-items: center;
`;

export const FeatureName = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const Backdrop = styled.div`
  position: fixed;
  z-index: 1;
  background: rgba(0, 0, 0, 70%);
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

export const Spacer = styled.div`
  display: flex;
  min-height: 10px;
  min-width: 100%;
  height: 10px;
  width: 100%;
`;
