import styled from 'styled-components';
import { Button } from 'components/common';
import { EuiPanel, EuiTabbedContent, EuiModalFooter } from '@elastic/eui';

interface SmallBtnProps {
  selected: boolean;
}

interface UserProps {
  inactive: boolean;
}

interface BudgetColorProps {
  background: string;
  borderColor: string;
}

interface BudgetHeaderProps {
  color: string;
}

export const ModalTitle = styled.h3`
  font-size: 1.2rem;
`;

export const CheckUl = styled.ul`
  list-style: none;
  padding: 0;
  margin-bottom: 20px;
`;

export const CheckLi = styled.li`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  margin-bottom: 10px;
`;

export const Check = styled.input`
  width: 20px;
  height: 20px;
  border-radius: 5px;
  padding: 0px;
  margin-right: 10px;
`;

export const CheckLabel = styled.label`
  padding: 0px;
  margin: 0px;
`;

export const ViewBounty = styled.p`
  padding: 0px;
  margin: 0px;
  cursor: pointer;
  font-size: 0.9rem;
  color: green;
  font-size: bold;
`;

export const Container = styled.div`
  width: 100%;
  min-height: 100%;
  background: white;
  z-index: 100;
`;

export const HeadWrap = styled.div`
  display: flex;
  align-items: center;
  padding: 25px 10px;
  padding-right: 40px;
  border-bottom: 1px solid #ebedef;
  @media only screen and (max-width: 800px) {
    padding: 15px 0px;
  }
  @media only screen and (max-width: 700px) {
    padding: 12px 0px;
  }
  @media only screen and (max-width: 500px) {
    padding: 0px;
    padding-bottom: 15px;
    flex-direction: column;
    align-items: start;
    padding: 20px 30px;
  }
`;

export const FeatureHeadWrap = styled.div`
  display: flex;
  align-items: center;
  padding: 30px 50px;
  padding-right: 40px;
  border-bottom: 1px solid #ebedef;
  @media only screen and (max-width: 800px) {
    padding: 15px 15px;
  }
  @media only screen and (max-width: 700px) {
    padding: 12px 10px;
  }
  @media only screen and (max-width: 500px) {
    padding: 0px;
    padding-bottom: 15px;
    flex-direction: column;
    align-items: start;
    padding: 20px 30px;
  }
`;

export const HeadNameWrap = styled.div`
  display: flex;
  align-items: center;
  @media only screen and (max-width: 500px) {
    margin-bottom: 20px;
  }
`;

export const WorkspaceImg = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-left: 15px;
  @media only screen and (max-width: 700px) {
    width: 42px;
    height: 42px;
  }
  @media only screen and (max-width: 500px) {
    width: 38px;
    height: 38px;
  }
  @media only screen and (max-width: 470px) {
    width: 35px;
    height: 35px;
  }
`;

export const WorkspaceName = styled.h3`
  padding: 0px;
  margin: 0px;
  font-size: 1.5rem;
  color: #3c3f41;
  margin-left: 25px;
  font-weight: 700;
  margin-left: 20px;
  @media only screen and (max-width: 800px) {
    font-size: 1.05rem;
  }
  @media only screen and (max-width: 700px) {
    font-size: 1rem;
  }
  @media only screen and (max-width: 600px) {
    font-size: 0.9rem;
  }
  @media only screen and (max-width: 470px) {
    font-size: 0.8rem;
  }
`;

export const HeadButtonWrap = styled.div<{ forSmallScreen: boolean }>`
  margin-left: auto;
  display: flex;
  flex-direction: row;
  gap: 15px;
  @media only screen and (max-width: 700px) {
    gap: 10px;
    margin-left: auto;
  }
  @media only screen and (max-width: 500px) {
    gap: 8px;
    margin-left: 0px;
    width: 100vw;
    margin-left: ${(p: any) => (p.forSmallScreen ? '50px' : '0px')};
    flex-wrap: wrap;
    display: flex;
  }
  @media only screen and (max-width: 470px) {
    gap: 6px;
  }
`;

export const DetailsWrap = styled.div`
  width: 100%;
  min-height: 100%;
  padding: 0px 20px;
`;

export const ActionWrap = styled.div`
  display: flex;
  align-items: center;
  padding: 30px 40px;
  padding-left: 55px;
  @media only screen and (max-width: 700px) {
    padding: 25px 0px;
  }
  @media only screen and (max-width: 500px) {
    flex-direction: column;
    width: 100%;
    padding: 20px 30px;
  }
`;

export const ActionHeader = styled.h3`
  font-size: 1.3rem;
  font-weight: bolder;
`;

export const BalanceImg = styled.img`
  width: 22px;
  height: 22px;
  margin-left: 5px;
  @media only screen and (max-width: 700px) {
    width: 20px;
    height: 18px;
  }
  @media only screen and (max-width: 500px) {
    width: 18px;
    height: 18px;
  }
`;

export const BalanceAmountImg = styled.img`
  width: 15px;
  height: 15px;
  margin-right: 6px;
  @media only screen and (max-width: 700px) {
    width: 13px;
    height: 13px;
  }
`;

export const BudgetWrap = styled.div`
  padding: 25px 40px;
  padding-left: 55px;
  padding-top: 0px;
  width: 100%;
  display: flex;
  flex-direction: column;
  @media only screen and (max-width: 700px) {
    width: 100%;
    padding: 22px 0px;
  }
  @media only screen and (max-width: 500px) {
    width: 100%;
    padding: 20px 0px;
    padding-top: 0;
  }
`;

export const NoBudgetWrap = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  border: 1px solid #ebedef;
`;

export const FullNoBudgetWrap = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  min-width: 100%;
  min-height: 90%;
  align-items: center;
  justify-content: center;
`;

export const BudgetStatsWrap = styled.div`
  width: 100%;
`;

export const BudgetData = styled.div<BudgetColorProps>`
  display: flex;
  position: relative;
  flex-direction: column;
  width: 100%;
  border-radius: 10px;
  border: 1px solid #ccc;
  padding: 25px;
  background: ${(p: any) => p.background};
  border: 1px solid ${(p: any) => p.borderColor};
`;

export const BudgetBountyLink = styled.span`
  cursor: pointer;
  position: absolute;
  right: 10px;
  top: 5px;
`;

export const ViewBudgetTextWrap = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 12px;
`;

export const BudgetSmall = styled.h6`
  padding: 0px;
  font-size: 0.8rem;
  color: #8e969c;
  @media only screen and (max-width: 500px) {
    font-size: 0.75rem;
  }
`;

export const BudgetHeaderWrap = styled.div`
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  height: 15px;
`;

export const BudgetSmallHead = styled.h5<BudgetHeaderProps>`
  padding: 0px;
  font-size: 0.9rem;
  color: ${(p: any) => p.color};
  margin: 0px;
`;

export const BudgetCount = styled.span<BudgetHeaderProps>`
  background: ${(p: any) => p.color};
  color: #fff;
  padding: 1px 4px;
  border-radius: 50%;
  font-size: 0.65rem;
  font-weight: bolder;
  display: inline-block;
  margin-left: 4px;
`;

export const Budget = styled.h4`
  color: #3c3f41;
  font-size: 1.25rem;
  font-weight: 600;

  &.budget-small {
    font-size: 0.95rem;
    color: #8e969c;
  }

  @media only screen and (max-width: 500px) {
    font-size: 1rem;
  }
`;

export const Grey = styled.span`
  color: #8e969c;
  font-weight: 400;
`;

export const NoBudgetText = styled.p`
  font-size: 0.85rem;
  padding: 0px;
  margin: 0px;
  color: #8e969c;
  width: 90%;
  margin-left: auto;
`;

export const FullNoBudgetText = styled.p`
  font-size: 1.2rem;
  padding: 0px;
  margin: 0px;
  color: #8e969c;
`;

export const UserWrap = styled.div`
  display: flex;
  flex-direction: column;
  background-color: rgb(240, 241, 243);
  width: 100%;
  @media only screen and (max-width: 700px) {
    padding: 20px 0px;
  }
  @media only screen and (max-width: 500px) {
    padding: 20px 0px;
  }
`;

export const UsersHeadWrap = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 20px 60px;
  padding-right: 40px;
  border-bottom: 1px solid #dde1e5;
  @media only screen and (max-width: 500px) {
    width: 100%;
    padding: 0 30px;
    padding-bottom: 20px;
  }
`;

export const UsersHeader = styled.h4`
  font-size: 0.8125rem;
  font-weight: 700;
  padding: 0;
  margin: 0;
  color: #3c3f41;
  @media only screen and (max-width: 500px) {
    font-size: 0.8rem;
    margin-right: 55%;
  }
`;

export const UsersList = styled.div`
  padding: 0 60px;
  padding-right: 40px;
  border-bottom: 1px solid #dde1e5;

  @media only screen and (max-width: 500px) {
    width: 100%;
    padding: 0 30px;
  }
`;

export const UserImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
`;

export const User = styled.div`
  padding: 15px 0px;
  border-bottom: 1px solid #ebedef;
  display: flex;
  align-items: center;
  @media only screen and (max-width: 500px) {
    padding: 10px 0px;
    width: 100%;
  }
`;

export const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 2%;
  width: 30%;
  @media only screen and (max-width: 500px) {
    width: 60%;
    margin-left: 5%;
  }
`;

export const UserName = styled.p`
  padding: 0px;
  margin: 0px;
  font-size: 0.9375rem;
  text-transform: capitalize;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  color: #3c3f41;
`;

export const UserPubkey = styled.p`
  padding: 0px;
  margin: 0px;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  color: #5f6368;
`;

export const UserAction = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
`;

export const ActionBtn = styled.button`
  border: 0px;
  padding: 0px;
`;

export const IconWrap = styled.div`
  :first-child {
    margin-right: 40px;
    @media only screen and (max-width: 700px) {
      margin-right: 20px;
    }
    @media only screen and (max-width: 500px) {
      margin-right: 8px;
    }
  }
`;

export const HeadButton = styled(Button)`
  border-radius: 5px;
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

export const ImgDashContainer = styled.div`
  width: 8.875rem;
  height: 8.875rem;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px dashed #d0d5d8;
  padding: 0.5rem;
  position: relative;
`;

export const UploadImageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.37756rem;
  height: 2.37756rem;
  position: absolute;
  bottom: 0;
  right: 0;
  cursor: pointer;
`;

export const WorkspaceImgOutterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const ImgContainer = styled.div`
  width: 7.875rem;
  height: 7.875rem;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ebedf1;
`;

export const SelectedImg = styled.img`
  width: 7.875rem;
  height: 7.875rem;
  border-radius: 50%;
  object-fit: cover;
`;

export const ImgTextContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-top: 1rem;
`;

export const InputFile = styled.input`
  display: none;
`;

export const ImgInstructionText = styled.p`
  color: #5f6368;
  text-align: center;
  font-family: 'Roboto';
  font-size: 0.8125rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.0625rem;
  letter-spacing: 0.00813rem;
  margin-bottom: 0;
`;

export const ImgInstructionSpan = styled.span`
  color: #618aff;
  cursor: pointer;
`;

export const ImgDetailInfo = styled.p`
  color: #b0b7bc;
  text-align: center;
  font-family: 'Roboto';
  font-size: 0.625rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.125rem;
  margin-bottom: 0;
  margin-top: 1rem;
`;

interface InputContainerProps {
  feature?: boolean;
}

export const WorkspaceInputContainer = styled.div<InputContainerProps>`
  width: ${(p: any) => (p.feature ? '100%' : '16rem')};
  height: ${(p: any) => (p.feature ? 'auto' : '223px')};
  display: flex;
  flex-direction: column;
  @media only screen and (max-width: 500px) {
    width: 100%;
    margin-top: 1rem;
  }
`;

export const WorkspaceLabel = styled.label`
  color: #5f6368;
  font-family: 'Barlow';
  font-size: 13px;
  font-style: normal;
  font-weight: 500;
  margin-bottom: 0.75rem;
  height: 0.5625rem;
  width: 100%;
`;

interface TextInputProps {
  feature?: boolean;
}

export const TextInput = styled.input<TextInputProps>`
  padding: 8px 14px;
  border-radius: 6px;
  border: 2px solid #dde1e5;
  outline: none;
  caret-color: #618aff;
  color: #3c3f41;
  font-family: 'Barlow';
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
  width: ${(p: any) => (p.feature ? '100%' : '16rem')};
  height: 2.4rem;

  ::placeholder {
    color: #b0b7bc;
    font-family: 'Barlow';
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
  }

  :focus {
    border: 2px solid #82b4ff;
  }
`;

export const TextAreaInput = styled.textarea`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: 2px solid #dde1e5;
  outline: none;
  caret-color: #618aff;
  color: #3c3f41;
  font-family: 'Barlow';
  font-size: 13px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
  width: 16rem;
  resize: none;
  height: 13.9375rem;

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
export const SecondaryText = styled.p`
  color: #b0b7bc;
  font-family: 'Barlow';
  font-size: 0.813rem;
  font-style: normal;
  font-weight: 400;
  margin-bottom: 18px;
  height: 0.5625rem;
`;
export const RouteHintText = styled.p`
  font-size: 0.9rem;
  text-align: center;
  color: #9157f6;
`;

export const AddUserContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const AddUserHeaderContainer = styled.div`
  display: flex;
  padding: 1.875rem;
  flex-direction: column;
`;

export const AddUserHeader = styled.h2`
  color: #3c3f41;
  font-family: 'Barlow';
  font-size: 1.625rem;
  font-style: normal;
  font-weight: 800;
  line-height: normal;
  margin-bottom: 1.25rem;
`;

export const SearchUserInput = styled.input`
  padding: 0.9375rem 0.875rem;
  border-radius: 0.375rem;
  border: 1px solid #dde1e5;
  background: #fff;
  width: 100%;
  color: #292c33;
  font-family: 'Barlow';
  font-size: 0.8125rem;
  font-style: normal;
  font-weight: 400;

  ::placeholder {
    color: #8e969c;
  }
`;

export const UsersListContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem 1.875rem;
  background-color: #f2f3f5;
  height: 16rem;
  overflow-y: auto;
`;

export const UserContianer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

export const UserInfo = styled.div<UserProps>`
  display: flex;
  align-items: center;
  opacity: ${(p: any) => (p.inactive ? 0.3 : 1)};
`;

export const UserImg = styled.img`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  margin-right: 0.63rem;
  object-fit: cover;
`;

export const Username = styled.p`
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

export const SmallBtn = styled.button<SmallBtnProps>`
  width: 5.375rem;
  height: 2rem;
  padding: 0.625rem;
  border-radius: 0.375rem;
  background: ${(p: any) => (p.selected ? '#618AFF' : '#dde1e5')};
  color: ${(p: any) => (p.selected ? '#FFF' : '#5f6368')};
  font-family: 'Barlow';
  font-size: 0.8125rem;
  font-style: normal;
  font-weight: 600;
  line-height: 0rem; /* 0% */
  letter-spacing: 0.00813rem;
  border: none;
`;

export const AddWorkspaceWrapper = styled.div`
  min-width: 100%;
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;

  @media only screen and (max-width: 500px) {
    padding: 1rem;
    width: 100%;
  }
`;

export const AddWorkspaceHeader = styled.h2`
  color: #3c3f41;
  font-family: 'Barlow';
  font-size: 1.875rem;
  font-style: normal;
  font-weight: 800;
  line-height: 1.875rem;
  margin-bottom: 0;
  min-width: 100%;

  @media only screen and (max-width: 500px) {
    text-align: center;
    font-size: 1.4rem;
  }
`;
export const WorkspaceDetailsContainer = styled.div`
  margin-top: 3rem;
  min-width: 100%;
  gap: 3.56rem;
  @media only screen and (max-width: 500px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

export const FooterContainer = styled.div`
  display: flex;
  padding: 1.125rem 1.875rem;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const AddUserBtn = styled.button`
  height: 3rem;
  padding: 0.5rem 1rem;
  width: 100%;
  border-radius: 0.375rem;
  font-family: 'Barlow';
  font-size: 0.9375rem;
  font-style: normal;
  font-weight: 500;
  line-height: 0rem;
  letter-spacing: 0.00938rem;
  background: #618aff;
  box-shadow: 0px 2px 10px 0px rgba(97, 138, 255, 0.5);
  border: none;
  color: #fff;
  &:disabled {
    border: 1px solid rgba(0, 0, 0, 0.07);
    background: rgba(0, 0, 0, 0.04);
    color: rgba(142, 150, 156, 0.85);
    cursor: not-allowed;
    box-shadow: none;
  }
`;

export const AssignUserContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
`;

export const UserInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: -2.5rem;
  left: 0;
  right: 0;
`;

export const AssignRoleUserImage = styled.img`
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background: #dde1e5;
  border: 4px solid #fff;
  object-fit: cover;
`;

export const AssignRoleUsername = styled.p`
  color: #3c3f41;
  text-align: center;
  font-family: 'Barlow';
  font-size: 1.25rem;
  font-style: normal;
  font-weight: 500;
  line-height: 1.625rem;
  margin-top: 0.69rem;
  margin-bottom: 0;
  text-transform: capitalize;
`;

export const UserRolesContainer = styled.div`
  padding: 3.25rem 3rem 3rem 3rem;
  margin-top: 3.25rem;
`;

export const UserRolesTitle = styled.h2`
  color: #3c3f41;
  font-family: 'Barlow';
  font-size: 1.625rem;
  font-style: normal;
  font-weight: 800;
  line-height: 1.625rem;
  margin-bottom: 2.81rem;
`;

export const RolesContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const RoleContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

export const Checkbox = styled.input`
  margin-right: 1rem;
  width: 1rem;
  height: 1rem;
`;

export const Label = styled.label`
  margin-bottom: 0;
  color: #1e1f25;
  font-family: 'Barlow';
  font-size: 0.9375rem;
  font-style: normal;
  font-weight: 500;
  line-height: 1.125rem;
`;

export const AssingUserBtn = styled.button`
  height: 3rem;
  padding: 0.5rem 1rem;
  width: 100%;
  border-radius: 0.375rem;
  font-family: 'Barlow';
  font-size: 0.9375rem;
  font-style: normal;
  font-weight: 500;
  line-height: 0rem;
  letter-spacing: 0.00938rem;
  background: #618aff;
  box-shadow: 0px 2px 10px 0px rgba(97, 138, 255, 0.5);
  border: none;
  margin-top: 3rem;
  color: #fff;
  &:disabled {
    border: 1px solid rgba(0, 0, 0, 0.07);
    background: rgba(0, 0, 0, 0.04);
    color: rgba(142, 150, 156, 0.85);
    cursor: not-allowed;
    box-shadow: none;
  }
`;

export const BudgetButton = styled.button`
  width: 100%;
  padding: 1rem;
  border-radius: 0.375rem;
  margin-top: 1.25rem;
  font-family: 'Barlow';
  font-size: 0.9375rem;
  font-style: normal;
  font-weight: 500;
  letter-spacing: 0.00938rem;
  background: #49c998;
  box-shadow: 0px 2px 10px 0px rgba(73, 201, 152, 0.5);
  border: none;
  color: #fff;
  &:disabled {
    border: 1px solid rgba(0, 0, 0, 0.07);
    background: rgba(0, 0, 0, 0.04);
    color: rgba(142, 150, 156, 0.85);
    cursor: not-allowed;
    box-shadow: none;
  }
`;

export const RowFlex = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
`;

export const ChatRowFlex = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 22px !important;
  cursor: pointer;
`;

export const MissionRowFlex = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  position: absolute;
  left: 2px;
`;

export const ButtonWrap = styled.div`
  margin-left: auto;
  margin-top: 10px;
  display: flex;
  gap: 15px;
`;

interface ButtonProps {
  color?: string;
  marginTop?: string;
  width?: string;
  height?: string;
  borderRadius?: string;
}

export const ActionButton = styled.button<ButtonProps>`
  padding: 5px 20px;
  width: ${(p: ButtonProps) => p.width ?? '124px'};
  border-radius: 5px;
  border-radius: ${(p: any) => p.borderRadius ?? '0.375rem'};
  font-family: 'Barlow';
  font-size: 0.9375rem;
  font-style: normal;
  font-weight: 500;
  line-height: 0rem;
  letter-spacing: 0.00938rem;
  margin-top: ${(p: any) => p.marginTop ?? '1.5rem'};
  border: none;
  height: ${(p: any) => p.height ?? '40px'};
  background: var(--Primary-blue, #618aff);
  box-shadow: 0px 2px 10px 0px rgba(97, 138, 255, 0.5);
  border: none;
  color: #fff;
  white-space: nowrap;

  background: ${(p: any) => {
    if (p.color === 'primary') {
      return 'rgb(97, 138, 255)';
    } else if (p.color === 'cancel') {
      return '#D3D3D3';
    }
  }};
  color: ${(p: any) => {
    if (p.color === 'primary') {
      return '#FFF';
    } else if (p.color === 'cancel') {
      return '#000';
    }
  }};

  &:hover {
    text-decoration: none;
    color: white;
  }

  :disabled {
    border: 1px solid rgba(0, 0, 0, 0.07);
    background: rgba(0, 0, 0, 0.04);
    color: rgba(142, 150, 156, 0.85);
    box-shadow: none;
  }
`;

export const RepoName = styled.h6`
  padding: 0px;
  margin: 0px;
  margin-right: 10px;
`;

export const RepoEliipsis = styled.img`
  cursor: pointer;
  width: 18px;
  height: 15px;
  font-weight: 900;
  color: #36454f;
  padding: 0px;
  margin-left: -5px;
`;

export const RepoWrap = styled.div`
  margin-bottom: 10px;
`;

export const WorkspaceOption = styled.div`
  position: absolute;
  z-index: 1;
  top: 20px;
  right: -40px;
  width: 110px;
  height: 55px;
  display: inline-flex;
  padding: 15px 10px;
  flex-direction: column;
  align-items: center;
  gap: 25px;
  border-radius: 6px;
  background: #fff;
  overflow-y: scroll;
  box-shadow: 0px 4px 20px 0px rgba(0, 0, 0, 0.25);

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    color: grey;
    width: 100%;
  }

  li {
    padding: 0px;
    width: 100%;
    text-align: center;
    padding-bottom: 5px;
    cursor: pointer;
    color: grey;
    font-family: 'Barlow', sans-serif;
    font-size: 0.8rem;
    font-style: normal;
    font-weight: 500;
    line-height: 18px;
    border-bottom: 0.5px solid #ccc;

    &:hover {
      color: #3c3f41;
    }
  }
`;

export const UserStoryOption = styled.div`
  position: absolute;
  z-index: 2;
  top: 100%;
  right: -65px;
  width: 80px;
  height: 30px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-shadow: 0px 4px 20px 0px rgba(0, 0, 0, 0.25);
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    padding: 5px;
    text-align: center;
    cursor: pointer;
    font-family: 'Barlow', sans-serif;
    font-size: 0.8rem;
    font-weight: 500;
    line-height: 18px;
    border-bottom: 0.5px solid #ccc;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: #f0f0f0;
      color: #3c3f41;
      border-radius: 6px;
    }

    &:last-child {
      border-bottom: none;
    }
  }
`;

export const UserStoryPanel = styled(EuiPanel)`
  && {
    position: relative;
    background-color: #fff;
    box-shadow: 0px 1px 2px 0px #00000026;
    border: none;
  }

  .drag-handle {
    background-color: #fff;
    border: none;
  }
`;

export const UserStoryWrapper = styled.div`
  background-color: #fff;
  min-height: 50px;
  border-radius: 5px;
  padding: 20px 30px;
  display: flex;
  flex-direction: column;
  white-space: pre-wrap;
  box-shadow: 0px 1px 2px 0px #00000026;

  .euiDroppable.euiDroppable--isDraggingType:not(
      .euiDroppable--isDisabled
    ).euiDroppable--isDraggingOver {
    background-color: #dee1e1;
    border-radius: 10px;
  }

  .euiDroppable--m {
    padding: unset;
  }
`;

export const UserStoryField = styled.div`
  display: flex;
  align-items: center;
  font-family: Barlow;
  font-size: 17px;
  font-weight: 500;
  line-height: 20px;
  text-align: left;
`;

export const StyledModal = styled.div`
  background: #fff;
  width: 600px;
  border: 2px solid dimgray;
`;

export const ModalBody = styled.div`
  margin: 20px 0 20px 40px;
  width: 100%;
`;

export const StoryButtonWrap = styled.div`
  margin-right: auto;
  margin-top: 10px;
  display: flex;
  gap: 15px;
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 20px;
`;

export const StyledEuiTabbedContent = styled(EuiTabbedContent as any)`
  && {
    .euiTabs {
      overflow-x: auto;
      padding-bottom: 45px;
    }

    .euiTab {
      position: relative;
      border: 0;
      margin: 0 5px;
      text-decoration: none;
      flex-direction: row-reverse;
      gap: 10px;
      max-width: 275px;
      background-color: white !important;

      .euiTab__content {
        color: #292c33;
        text-overflow: ellipsis;
        size: 15px;
        font-weight: 600;
        font-family: 'Barlow';
      }

      .euiTab__prepend {
        color: black;
        margin-right: 3px;
        width: 25px;
      }
    }

    .euiTab-isSelected {
      color: black !important;
      text-decoration: none;
      border-bottom: unset;
      z-index: 200;
    }

    .euiTab.euiTab-isSelected,
    .euiTab.euiTab-isSelected .euiTab__content {
      color: #8e969c !important;
    }

    .euiTab.euiTab-isSelected {
      box-shadow: unset;
      border-bottom: 4px solid #618aff;
    }

    .euiTab:not(.euiTab-isDisabled):hover .euiTab__content,
    .euiTab:not(.euiTab-isDisabled):focus .euiTab__content {
      text-decoration: none;
    }

    .euiTabs--bottomBorder {
      box-shadow: unset;
    }
  }
`;

export const TabContentOptions = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  transform: translate(-0%, -45%);
`;

export const TabContent = styled.div`
  width: 100%;
  min-height: 275px;
  display: flex;
  flex-direction: column;
  background-color: white;
`;

export const PostABounty = styled.div`
  color: #49c998;
  radius: 6px;
  gap: 10px;
  margin-top: 0.5rem;
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  direction: row;
  padding-bottom: 20px;
  margin-right: 10px;

  button {
    div {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    img {
      vertical-align: middle;
    }
  }

  button:first-child {
    margin-right: 10px;
  }
`;

export const DisplayBounties = styled.div`
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
`;

export const Background = styled.div`
  color: white;
`;

export const StoriesButtonGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;

  ${ActionButton} {
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

export const GenerateStoriesModal = styled.div`
  background: #fff;
  width: 65%;
  max-height: 80vh;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 100vw;
  border: none;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 90%;
    padding: 1rem;
  }
`;

export const GenerateStoriesHeader = styled.div`
  padding: 24px 32px;
  border-bottom: 1px solid #ebedef;
`;

export const GenerateStoriesTitle = styled.h2`
  font-family: 'Barlow', sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #3c3f41;
  margin: 0;
`;

export const GenerateStoriesContent = styled.div`
  padding: 40px 70px;
  flex: 1;
  overflow-y: auto;
`;

export const GenerateStoriesText = styled.p`
  font-family: 'Barlow', sans-serif;
  font-size: 18px;
  color: #5f6368;
  margin: 0;
  width: 100%;
`;

export const GenerateStoriesFooter = styled.div`
  padding: 24px 32px;
  border-top: 1px solid #ebedef;
  display: flex;
  justify-content: flex-end;
`;

export const GenerateStoriesButton = styled.button`
  padding: 5px 20px;
  border-radius: 5px;
  font-family: 'Barlow';
  font-size: 0.9375rem;
  font-style: normal;
  font-weight: 500;
  line-height: 0rem;
  letter-spacing: 0.00938rem;
  border: none;
  cursor: pointer;
  background-color: #d3d3d3;
  color: #000;
  height: 40px;
  width: 124px;
  box-shadow: 0px 2px 10px 0px rgba(97, 138, 255, 0.5);

  &:hover {
    background-color: #e0e0e0;
  }

  &:active {
    background-color: #c0c0c0;
  }
`;

export const SendStoriesButton = styled.button`
  padding: 5px 20px;
  border-radius: 5px;
  font-family: 'Barlow';
  font-size: 0.9375rem;
  font-style: normal;
  font-weight: 500;
  line-height: 0rem;
  letter-spacing: 0.00938rem;
  margin-left: 10px;
  border: none;
  cursor: pointer;
  background-color: rgb(97, 138, 255);
  color: #fff;
  height: 40px;
  width: 124px;
  box-shadow: 0px 2px 10px 0px rgba(97, 138, 255, 0.5);

  &:hover {
    background-color: rgb(97, 148, 255);
  }

  &:active {
    background-color: #c0c0c0;
  }
`;

export const FeatureModalBody = styled.div`
  margin: 5px 0 0 27px;
  width: 100%;
`;

export const FeatureModalFooter = styled(EuiModalFooter)`
  padding: 4px 15px 15px;
`;

export const FeatureHeadNameWrap = styled.div`
  display: flex;
  align-items: center;
  width: 80rem;
  @media only screen and (max-width: 500px) {
    margin-bottom: 20px;
  }
`;

export const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  ${ActionButton} {
    transition: background-color 0.2s ease;
    width: auto;
    min-width: 100px;
    margin-top: 0;
    margin-bottom: 10px;

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

export const AudioButtonWrap = styled.div`
  margin-left: auto;
  display: flex;
  gap: 15px;
`;

export const AudioButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export const AudioModalBody = styled.div`
  margin: 5px 0 0 27px;
  width: 100%;
`;

export const StyledEuiModalFooter = styled(EuiModalFooter)`
  padding: 4px 15px 15px;
`;

export const PhaseFlexContainer = styled.div`
  display: flex;
  align-items: left;
  width: 100%;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 5%;
`;

export const TicketButtonGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;

  ${ActionButton} {
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

    &[color='#49C998'] {
      background-color: #49c998;

      &:hover {
        background-color: #5ad3a7;
      }

      &:active {
        background-color: #3eb986;
      }
    }
  }
`;

export const Select = styled.select`
  padding: 5px 10px;
  border-radius: 4px;
  width: 300px;
  height: 38px;
  border: 1px solid #ccc;
  margin-right: 10px;
  margin-top: 25px;
  background-color: white;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: #49c998;
  }

  &:focus {
    outline: none;
    border-color: #618aff;
    box-shadow: 0 0 5px rgba(97, 138, 255, 0.5);
  }
`;

export const Option = styled.option`
  font-size: 14px;
`;

export const CopyButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  align-items: baseline;
  justify-content: flex-end;
  margin-left: auto;
  margin-top: calc(100px - 108px);

  ${ActionButton} {
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

export const Skeleton = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #ebedf1 0%, #f2f3f5 50%, #ebedf1 100%);
  background-size: 200% 100%;
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: -100% 0;
    }
  }
`;

export const ErrorContainer = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
`;

export const ErrorText = styled.span`
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  color: red;
`;

export const StyledImage = styled.img<{ isVisible: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: ${(props: { isVisible: boolean }) => (props.isVisible ? 1 : 0)};
`;

export const SchematicImgContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 9rem;
  border-radius: 10px;
  overflow: hidden;
  background-color: #ebedf1;
`;

export const SwitcherContainer = styled.div`
  display: flex;
  background-color: rgb(238, 231, 231);
  border-radius: 20px;
  padding: 4px;
  width: fit-content;
  margin-bottom: 12px;
`;

export const SwitcherButton = styled.button<{ isActive: boolean }>`
  padding: 8px 16px;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;

  ${(props: { isActive: boolean }) =>
    props.isActive
      ? `
    background-color: #007bff;
    color: white;
    box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);
  `
      : `
    background-color: transparent;
    color: #333;
    &:hover {
      background-color: rgba(0, 123, 255, 0.1);
    }
  `}
`;

export const PreviewButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
  margin-top: calc(100px - 110px);
  margin-right: 3px;
  width: 100%;

  ${ActionButton} {
    transition: background-color 0.2s ease;
    width: auto;
    margin-top: calc(100px - 110px);
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

export const EmptyState = styled.div`
  border-radius: 4px;
  font-size: 18px;
  font-family: 'Barlow';
  font-weight: 500;
  color: #000;
`;

export const ProofActionButton = styled.button<ButtonProps>`
  padding: 5px 20px;
  width: ${(p: ButtonProps) => p.width ?? '124px'};
  border-radius: 5px;
  border-radius: ${(p: any) => p.borderRadius ?? '0.375rem'};
  font-family: 'Barlow';
  font-size: 0.9375rem;
  font-style: normal;
  font-weight: 500;
  line-height: 0rem;
  letter-spacing: 0.00938rem;
  margin-top: ${(p: any) => p.marginTop ?? '1.5rem'};
  border: none;
  height: ${(p: any) => p.height ?? '40px'};
  background: var(--Primary-blue, #618aff);
  box-shadow: 0px 2px 10px 0px rgba(97, 138, 255, 0.5);
  border: none;
  color: #fff;
  white-space: nowrap;
  cursor: pointer;
  position: relative;

  background: ${(p: any) => {
    if (p.color === 'primary') {
      return 'rgb(97, 138, 255)';
    } else if (p.color === 'cancel') {
      return '#D3D3D3';
    }
  }};
  color: ${(p: any) => {
    if (p.color === 'primary') {
      return '#FFF';
    } else if (p.color === 'cancel') {
      return '#000';
    }
  }};

  &:hover {
    text-decoration: none;
    color: white;
  }

  :disabled {
    background: #9ca3af !important;
    color: #fff;
    box-shadow: none;
    cursor: not-allowed;

    &:hover::before {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 14px;
    }
  }
`;

export const SelectWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

export const SelectLabel = styled.label`
  font-weight: 500;
  min-width: 70px;
`;

export const StyledSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
  min-width: 200px;
  height: 36px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:hover {
    border-color: #b3d4fc;
  }

  &:focus {
    outline: none;
    border-color: #2196f3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

export const SnippetContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: auto;
`;

export const ActionButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

export const TicketSnippetContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 11px;
  margin-right: auto;
  margin-left: -10px;
`;
