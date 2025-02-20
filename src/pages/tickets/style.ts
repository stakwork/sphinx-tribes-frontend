import styled from 'styled-components';

interface EditPopoverContentProps {
  bottom?: string;
  transform?: string;
}

interface EditPopoverTailProps {
  bottom?: string;
  left?: string;
}

interface BountyOptionsWrapProps {
  $collapsed?: boolean; // Using $ prefix to avoid DOM attribute warning
}

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

export const WorkspaceMissionBody = styled.div<{ collapsed: boolean }>`
  display: flex;
  flex-direction: column;
  background: var(--Search-bar-background, #f2f3f5);
  height: 100vh;
  overflow-y: scroll;
  overflow-x: hidden;
  margin-left: ${({ collapsed }: { collapsed: boolean }) => (collapsed ? '50px' : '250px')};
  transition: margin-left 0.3s ease-in-out;
`;

export const FeatureBody = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--Search-bar-background, #f2f3f5);
  height: 100vh;
  overflow-y: scroll;
  overflow-x: hidden;
`;

export const WorkspaceFeatureBody = styled.div<{ collapsed: boolean }>`
  display: flex;
  flex-direction: column;
  background: var(--Search-bar-background, #f2f3f5);
  height: 100vh;
  overflow-y: scroll;
  overflow-x: hidden;
  margin-left: ${({ collapsed }: { collapsed: boolean }) => (collapsed ? '50px' : '250px')};
  transition: margin-left 0.3s ease-in-out;
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
  padding: 20px 50px;
  width: 90%;
  margin: 0 auto;
  align-items: left;
  justify-content: center;
  padding-bottom: 0px;
  background: #fff;
  margintop: 20px;
  border-radius: 6px;

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
  width: 85%;
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

export const VerticalGrayLine = styled.div`
  width: 2px;
  height: 90%;
  background-color: #edecec;
  content: '';
  margin: 10px 20px;
`;

export const HorizontalGrayLine = styled.div`
  width: 100%;
  height: 2px;
  background-color: #edecec;
  content: '';
  margin: 10px 0px;
`;

export const FieldWrap = styled.div`
  margin-bottom: 30px;
  width: 98%;
`;

export const Label = styled.h5`
  font-size: 1.1rem;
  font-weight: bolder;
`;

export const Data = styled.div`
  border: 1px solid #dde1e5;
  background-color: #fff;
  caret-color: #618aff;
  min-height: 50px;
  border-radius: 5px;
  padding: 20px 30px;
  position: relative;
  display: flex;
  flex-direction: column;

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

export const BountyOptionsWrap = styled.div<BountyOptionsWrapProps>`
  position: absolute;
  margin-left: ${({ $collapsed }: BountyOptionsWrapProps) => ($collapsed ? '58%' : '63%')};
  margin-bottom: 1% !important;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: margin-left 0.3s ease-in-out;

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
  color: #5f6368;
  padding: 0;
  margin: 0;
  margin-top: 15px;
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

export const EditPopover = styled.div`
  position: relative;
  display: inline-block;
  z-index: 1000;
`;

export const ConvertToBountyPopover = styled.div`
  position: relative;
  display: inline-block;
  z-index: 1000;
  left: 158px;
`;

export const EditPopoverContent = styled.div<EditPopoverContentProps>`
  position: absolute;
  bottom: ${({ bottom }: { bottom?: string }) => bottom ?? '-50px'};
  left: -30%;
  transform: ${({ transform }: { transform?: string }) => transform ?? 'translateX(-80%)'};
  width: 120px;
  background: #fff;
  box-shadow: 0px 4px 20px 0px rgba(0, 0, 0, 0.25);
  border-radius: 6px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const BountyPopoverContent = styled.div<EditPopoverContentProps>`
  position: absolute;
  bottom: ${({ bottom }: { bottom?: string }) => bottom ?? '-30px'};
  left: -30%;
  transform: ${({ transform }: { transform?: string }) => transform ?? 'translateX(-80%)'};
  width: 175px;
  background: #fff;
  box-shadow: 0px 4px 20px 0px rgba(0, 0, 0, 0.25);
  border-radius: 6px;
  padding: 8px 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

export const EditPopoverTail = styled.div<EditPopoverTailProps>`
  position: absolute;
  bottom: ${({ bottom }: { bottom?: string }) => bottom ?? '-16px'};
  left: ${({ left }: { left?: string }) => left ?? '-20px'};
  transform: translateX(60%) rotate(45deg);
  width: 16px;
  height: 16px;
  background: #fff;
  box-shadow: -3px -3px 5px -3px rgba(0, 0, 0, 0.25);
  z-index: 1;
`;

export const EditPopoverText = styled.span`
  font-family: 'Barlow', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
`;

export const BountyPopoverText = styled.span`
  font-family: 'Barlow', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    font-weight: 700;
  }
`;

export const FeatureOptionsWrap = styled.div`
  right: 6px;
  top: 4px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  margin-left: auto;

  .MaterialIcon {
    font-style: normal;
    font-weight: 900;
    font-size: 2rem;
  }

  button {
    border: 0.5px solid #000000;
    font-size: 0.8rem;
    font-weight: 700;
    border-radius: 5px;
    padding: 2px 10px;
  }
`;

export const PhaseLabel = styled.h5`
  font-size: 1.1rem;
  font-weight: bolder;
`;

export const LabelValue = styled.span`
  font-weight: normal;
`;

export const StyledLink = styled.a`
  color: #648dff;
  text-decoration: none;
  cursor: pointer;
  margin-left: 20px;

  &:hover {
    text-decoration: underline;
  }
`;

export const AddTicketButton = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
  margin-bottom: 60px;

  button {
    transition: background-color 0.2s ease;
    width: auto;
    min-width: 100px;

    &[color='primary'] {
      background-color: #618aff;

      &:hover {
        background-color: #7599ff;
      }

      &:active {
        background-color: #4b7bff;
      }
    }
  }
`;

export const TicketContainer = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
`;

export const TicketHeader = styled.div`
  font-weight: bold;
  font-size: 20px;
  margin-bottom: 10px;
`;

export const TicketTextArea = styled.textarea`
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
  resize: vertical;
  min-height: 300px;

  ::placeholder {
    color: #b0b7bc;
    font-family: 'Barlow';
    font-size: 15px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
  }
  :focus {
    border: 2px solid #82b4ff;
  }
`;

export const TicketInput = styled.input`
  width: 25%;
  padding: 9px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  color: #333;

  &:focus {
    outline: none;
    border-color: #49c998;
  }
`;

export const TicketHeaderInputWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
`;

export const WorkspaceFieldWrap = styled.div`
  margin-bottom: 10px;
  margin-top: 10px;
  width: 98%;
`;

export const BountiesHeader = styled.div`
  height: 80px;
  width: 72%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
`;
