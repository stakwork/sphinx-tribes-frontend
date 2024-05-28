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
  overflow-y: scroll;
  overflow-x: hidden;
`;

export const FeatureBody = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--Search-bar-background, #f2f3f5);
  height: 100vh;
  overflow-y: scroll;
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
  display: flex;
  justify-content: space-between;
  padding: 40px 50px;
  width: 60%;
  margin: 0 auto;
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

export const FeatureDataWrap = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px 50px;
  width: 60%;
  margin: 0 auto;
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

export const DataWrap2 = styled.div`
  padding: 0px;
  display: flex;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: left;
  justify-content: center;
  @media only screen and (max-width: 900px) {
    width: 90%;
    padding: 30px 40px;
    flex-direction: column;
  }

  @media only screen and (max-width: 500px) {
    width: 90%;
    padding: 20px 10px;
    flex-direction: column;
  }
`;

export const LeftSection = styled.div`
  width: 60%;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Aligns content to the left */

  @media only screen and (max-width: 900px) {
    width: 100%;
    align-items: center; /* Centers content on smaller screens */
  }
`;

export const RightSection = styled.div`
  width: 40%;
  display: flex;
  flex-direction: column;
  align-items: flex-end; /* Aligns content to the right */

  @media only screen and (max-width: 900px) {
    width: 100%;
    align-items: center; /* Centers content on smaller screens */
  }
`;

export const FieldWrap = styled.div`
  margin-bottom: 30px;
  width: 95%;
`;

export const Label = styled.h5`
  font-size: 1.1rem;
  font-weight: bolder;
`;

export const Data = styled.div`
  border: 2px solid #dde1e5;
  caret-color: #618aff;
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
    font-size: 1.3rem;
    color: #36454f;
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

export const UserStoryOptionWrap = styled.div`
  position: absolute;
  top: 2px;
  right: 2px;
  display: inline-block;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;

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

export const PageContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const PaginationImg = styled.img`
  cursor: pointer;
`;

export const FlexDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2px;

  .euiPopover__anchor {
    margin-top: 6px !important;
  }
`;

export const FeatureLink = styled.a`
  text-decoration: none;
  color: #000;
`;

export const StyledList = styled.ul`
  padding: 0;
  margin-top: 10px;
`;

export const StyledListElement = styled.li`
  display: flex;
  align-items: center;
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
  margin: 5px;
  background: ${(props: any) => (props.active ? 'var(--Active-blue, #618AFF)' : 'white')};
  color: ${(props: any) => (props.active ? 'white' : 'black')};
`;

export const ImgText = styled.h3`
  color: #b0b7bc;
  text-align: center;
  font-family: 'Barlow';
  font-size: 1.875rem;
  font-style: normal;
  font-weight: 800;
  line-height: 1.0625rem;
  letter-spacing: 0.01875rem;
  text-transform: uppercase;
  opacity: 0.5;
  margin-bottom: 0;
`;
export const InputField = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 25px;
  gap: 25px;
`;

export const Input = styled.input`
  border: 1px solid #ccc;
  max-height: 30px;
  border-radius: 5px;
  padding: 10px 20px;
  position: relative;
  caret-color: #618aff;
  color: #3c3f41;
  font-family: 'Barlow';
  font-size: 1rem;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
  width: 80%;

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
