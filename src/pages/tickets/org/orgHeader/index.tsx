import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { EuiCheckboxGroup, EuiPopover, EuiText } from '@elastic/eui';
import MaterialIcon from '@material/react-material-icon';
import { PostModal } from 'people/widgetViews/postBounty/PostModal';
import { SearchBar } from '../../../../components/common/index.tsx';
import { useStores } from '../../../../store';
import { colors } from '../../../../config';
import { OrgBountyHeaderProps } from '../../../../people/interfaces.ts';
import addBounty from './Icons/addBounty.svg';
import file from './Icons/file.svg';
import checkboxImage from './Icons/checkboxImage.svg';
import githubIcon from './Icons/githubIcon.svg';
import websiteIcon from './Icons/websiteIcon.svg';

interface styledProps {
  color?: any;
}

const Header = styled.div`
  display: flex;
  height: 130px;
  padding: 45px 20px 45px 130px;
  justify-content: center;
  align-items: center;
  align-self: stretch;
  border-bottom: 1px solid var(--Input-BG-1, #f2f3f5);
  background: #fff;
`;

const UrlButtonContainer = styled.div`
  width: 180px;
  display: flex;
  gap: 8px;
  justify-content: space-between;
  margin-top: 40px;
  margin-right: 690px;
  margin-left: 0px;
`;

const FillContainer = styled.div`
  width: 100vw;
  align-self: stretch;
  background: #fff;
`;

const Filters = styled.div`
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
const FiltersRight = styled.span`
  display: flex;
  height: 40px;
  padding-right: 122px;
  align-items: flex-start;
  gap: 52px;
  flex: 1 0 0;
  width: 1366px;
`;

const SkillContainer = styled.span`
  padding: 10px 0px;
  align-items: center;
  gap: 4px;
  width: max-content;
`;
const Skill = styled.select`
  border: none;
  background-color: transparent;
`;

const Button = styled.button`
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

const UrlButton = styled.button`
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

const Label = styled.label`
  color: var(--Main-bottom-icons, #5f6368);
  font-family: Barlow;
  font-size: 15px;
  font-style: normal;
  font-weight: 500;
  line-height: 17px; /* 113.333% */
  letter-spacing: 0.15px;
`;

const SoryByContainer = styled.span`
  justify-content: center;
  align-items: center;
  gap: 4px;
`;
const SortBy = styled.select`
  background-color: transparent;
  border: none;
`;
const NumberOfBounties = styled.div`
  height: 23px;
  padding: 1.5px 983.492px 1.5px 10px;
  align-items: center;
  flex-shrink: 0;
  margin: 23px 133px;
  width: 1366px;
  margin-left: auto;
  margin-right: auto;
`;
const BountyNumber = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 11px;
`;
const PrimaryText = styled.p`
  color: var(--Primary-Text-1, var(--Press-Icon-Color, #292c33));
  font-family: Barlow;
  font-size: 15px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
`;
const SecondaryText = styled.p`
  color: var(--Main-bottom-icons, #5f6368);
  font-family: Barlow;
  font-size: 15px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`;
const Img = styled.img`
  padding-bottom: 10px;
`;

const EuiPopOverCheckbox = styled.div<styledProps>`
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

const StatusContainer = styled.div<styledProps>`
  width: 70px;
  height: 48px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-left: 19px;
  margin-top: 4px;
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

const Status = ['Open', 'Assigned', 'Completed', 'Paid'];
const color = colors['light'];
export const OrgHeader = ({
  onChangeStatus,
  checkboxIdToSelectedMap,
  org_uuid,
  languageString,
  organizationUrls
}: OrgBountyHeaderProps) => {
  const [isPostBountyModalOpen, setIsPostBountyModalOpen] = useState(false);
  const [isStatusPopoverOpen, setIsStatusPopoverOpen] = useState<boolean>(false);
  const onButtonClick = async () => {
    setIsStatusPopoverOpen((isPopoverOpen: any) => !isPopoverOpen);
  };
  const closeStatusPopover = () => setIsStatusPopoverOpen(false);

  const selectedWidget = 'wanted';
  const { website, github } = organizationUrls;
  const handlePostBountyClick = () => {
    setIsPostBountyModalOpen(true);
  };
  const handlePostBountyClose = () => {
    setIsPostBountyModalOpen(false);
  };
  const { main, ui } = useStores();
  const color = colors['light'];

  const handleWebsiteButton = (websiteUrl: string) => {
    window.open(websiteUrl, '_blank');
  };

  const handleGithubButton = (githubUrl: string) => {
    window.open(githubUrl, '_blank');
  };

  const handleSearch = (searchText: string) => {
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/');
    const paramValue = pathSegments[pathSegments.length - 1];

    main.getPeopleBounties({
      page: 1,
      resetPage: true,
      search: searchText,
      org_uuid: paramValue
    });
  };

  useEffect(() => {
    if (org_uuid) {
      main.getSpecificOrganizationBounties(org_uuid, {
        page: 1,
        resetPage: true,
        ...checkboxIdToSelectedMap,
        languageString
      });
    }
  }, [org_uuid, checkboxIdToSelectedMap]);

  return (
    <>
      <FillContainer>
        <Header>
          <UrlButtonContainer data-testid="url-button-container">
            {website !== '' ? (
              <UrlButton onClick={() => handleWebsiteButton(website)}>
                <img src={websiteIcon} alt="" />
                Website
              </UrlButton>
            ) : (
              ''
            )}
            {github !== '' ? (
              <UrlButton onClick={() => handleGithubButton(github)}>
                <img src={githubIcon} alt="" />
                Github
              </UrlButton>
            ) : (
              ''
            )}
          </UrlButtonContainer>
          <Button onClick={handlePostBountyClick}>
            <img src={addBounty} alt="" />
            Post a Bounty
          </Button>
        </Header>
      </FillContainer>
      <FillContainer>
        <Filters>
          <FiltersRight>
            <EuiPopover
              button={
                <StatusContainer onClick={onButtonClick} color={color}>
                  <EuiText
                    className="statusText"
                    style={{
                      color: isStatusPopoverOpen ? color.grayish.G10 : ''
                    }}
                  >
                    Status
                  </EuiText>
                  <div className="filterStatusIconContainer">
                    <MaterialIcon
                      className="materialStatusIcon"
                      icon={`${isStatusPopoverOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}`}
                      style={{
                        color: isStatusPopoverOpen ? color.grayish.G10 : ''
                      }}
                    />
                  </div>
                </StatusContainer>
              }
              panelStyle={{
                border: 'none',
                boxShadow: `0px 1px 20px ${color.black90}`,
                background: `${color.pureWhite}`,
                borderRadius: '0px 0px 6px 6px',
                maxWidth: '140px',
                minHeight: '160px',
                marginTop: '0px',
                marginLeft: '20px'
              }}
              isOpen={isStatusPopoverOpen}
              closePopover={closeStatusPopover}
              panelClassName="yourClassNameHere"
              panelPaddingSize="none"
              anchorPosition="downLeft"
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row'
                }}
              >
                <EuiPopOverCheckbox className="CheckboxOuter" color={color}>
                  <EuiCheckboxGroup
                    options={Status.map((status: any) => ({
                      label: `${status}`,
                      id: status
                    }))}
                    idToSelectedMap={checkboxIdToSelectedMap}
                    onChange={(id: any) => {
                      onChangeStatus(id);
                    }}
                  />
                </EuiPopOverCheckbox>
              </div>
            </EuiPopover>
            <SkillContainer>
              <Label htmlFor="statusSelect">Skill</Label>
              <Skill id="statusSelect" />
            </SkillContainer>
            <SearchBar
              name="search"
              type="search"
              placeholder="Search"
              value={ui.searchText}
              style={{
                width: '384px',
                height: '40px',
                background: color.grayish.G950,
                fontFamily: 'Barlow',
                color: color.text2,
                gap: '10px',
                flex: '1 0 0',
                display: 'flex',
                position: 'relative',
                marginLeft: '20px',
                alignItems: 'center',
                borderRadius: '6px',
                border: 'none',
                outline: 'none'
              }}
              onChange={(e: any) => {
                ui.setSearchText(e);
              }}
              onKeyUp={(e: any) => {
                if (e.key === 'Enter' || e.keyCode === 13) {
                  handleSearch(e.target.value);
                }
              }}
              TextColor={color.grayish.G100}
              TextColorHover={color.grayish.G50}
              iconColor={color.grayish.G300}
              iconColorHover={color.grayish.G50}
            />
          </FiltersRight>
          <SoryByContainer>
            <Label htmlFor="statusSelect">Sort by:Newest First</Label>
            <SortBy id="statusSelect" />
          </SoryByContainer>
        </Filters>
      </FillContainer>
      <NumberOfBounties>
        <BountyNumber>
          <Img src={file} alt="" />
          <PrimaryText>284</PrimaryText>
          <SecondaryText>Bounties</SecondaryText>
        </BountyNumber>
      </NumberOfBounties>
      <PostModal
        widget={selectedWidget}
        isOpen={isPostBountyModalOpen}
        onClose={handlePostBountyClose}
      />
    </>
  );
};
