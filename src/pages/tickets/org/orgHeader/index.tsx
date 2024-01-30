import React, { useState, useEffect, useRef } from 'react';
import { Organization } from 'store/main';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { EuiCheckboxGroup, EuiPopover, EuiText } from '@elastic/eui';
import MaterialIcon from '@material/react-material-icon';
import { PostModal } from 'people/widgetViews/postBounty/PostModal';
import { GetValue, coding_languages } from 'people/utils/languageLabelStyle';
import { colors } from 'config';
import { OrgBountyHeaderProps } from '../../../../people/interfaces';
import { useStores } from '../../../../store';
import addBounty from './Icons/addBounty.svg';
import dropdown from './Icons/dropDownIcon.svg';
import searchIcon from './Icons/searchIcon.svg';
import file from './Icons/file.svg';
import checkboxImage from './Icons/checkboxImage.svg';
import githubIcon from './Icons/githubIcon.svg';
import websiteIcon from './Icons/websiteIcon.svg';

const Coding_Languages = GetValue(coding_languages);
interface styledProps {
  color?: any;
}
const color = colors['light'];

const FillContainer = styled.div`
  width: 100vw;
  display: flex;
  justify-content: center;
  align-self: stretch;
  background: #fff;
  border-bottom: 1px solid var(--Input-BG-1, #f2f3f5);
`;

const Header = styled.div`
  display: flex;
  min-width: 1366px;
  height: 130px;
  align-items: center;
  align-self: stretch;
  padding: 0 130px;
  background: #fff;
  @media (max-width: 1140px) {
    min-width: 90%;
    padding: 0;
  }
`;

const OrgDetails = styled.div`
  display: flex;
  flex: 4;
  justify-content: space-between;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: flex-end;
`;

const OrgDetailsLeft = styled.div`
  display: flex;
  
`;

const OrgDetailsRight = styled.div`
  display: flex;
  justify-contents: flex-end;
  align-items: center;
  
`;

const OrgLogo = styled.img`
  width: 72px;
  height: 72px;
  border-radius: 66px;
  
`;

const OrgNameLinks = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 20px;
  
`;

const OrgName = styled.p`
  color: var(--Text-2, #3c3f41);
  font-family: Barlow;
  font-size: 28px;
  font-style: normal;
  font-weight: 700;
  margin: 0;
`;

const OrgLinks = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
`;

const SmallButton = styled.a`
  border-radius: 4px;
  border: 1px solid var(--Divider-2, #dde1e5);
  display: flex;
  width: auto;
  height: 28px;
  padding: 0px 10px 0px 7px;
  align-items: center;
  gap: 6px;
  color: var(--Main-bottom-icons, #5f6368);
  text-decoration: none;
  cursor: pointer;
  font-family: Barlow;
  font-size: 13px;
  font-style: normal;
  font-weight: 500;
  outline: none;
  &:hover {
    text-decoration: none;
    color: var(--Main-bottom-icons, #5f6368);
    border: 1px solid var(--Disabled-Icon-color, #B0B7BC);
  }
  &:focus {
    outline: none;
  }
`;
const OrgDetailsText = styled.div`
  overflow: hidden;
  color: var(--Main-bottom-icons, #5F6368);
  text-align: right;
  leading-trim: both;
  text-edge: cap;
  text-overflow: ellipsis;
  font-family: Barlow;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
  width: 403px;

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
  display: flex;
  position: relative;
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

const FilterLabel = styled.label`
  color: var(--Main-bottom-icons, #5f6368);
  font-family: Barlow;
  font-size: 15px;
  font-style: normal;
  font-weight: 500;
  line-height: 17px; /* 113.333% */
  letter-spacing: 0.15px;
`;

const SearchWrapper = styled.div`
  height: 40px;
  padding: 0px 16px;
  align-items: center;
  gap: 10px;
  flex: 1 0 0;
  display: flex;
  position: relative;
`;

const Icon = styled.img`
  position: absolute;
  right: 30px;
`;

const SearchBar = styled.input`
  display: flex;
  height: 40px;
  padding: 0px 16px;
  padding-left: 30px;
  align-items: center;
  gap: 10px;
  flex: 1 0 0;
  border-radius: 6px;
  background: var(--Input-BG-1, #f2f3f5);
  outline: none;
  border: none;
`;

const SoryByContainer = styled.span`
  padding: 10px 0px;
  display: flex;
  justify-content: center;
  align-items: center;
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

const SkillFilter = styled.div`
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
const InternalContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 30px;
  padding: 24px 20px 28px 20px;
`;

const EuiPopOverCheckboxRight = styled.div<styledProps>`
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
        background-image: url('static/checkboxImage.svg');
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

const DropDownButton = styled.button`
  border: none;
  background-color: transparent;
  padding-top: 5px;
`;

const FiltersLeft = styled.span`
  display: flex;
  height: 40px;
  align-items: flex-start;
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

const NewStatusContainer = styled.div``;

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
export const OrgHeader = ({
  onChangeLanguage,
  checkboxIdToSelectedMapLanguage,
  onChangeStatus,
  checkboxIdToSelectedMap,
  org_uuid,
  languageString,
  organizationUrls
}: OrgBountyHeaderProps) => {
  const { main } = useStores();
  const [isPostBountyModalOpen, setIsPostBountyModalOpen] = useState(false);
  const [filterClick, setFilterClick] = useState(false);
  const [isStatusPopoverOpen, setIsStatusPopoverOpen] = useState<boolean>(false);
  const [organization, setOrganization] = useState<Organization>();
  const { uuid } = useParams<{ uuid: string }>();
  const onButtonClick = async () => {
    setIsStatusPopoverOpen((isPopoverOpen: any) => !isPopoverOpen);
  };
  const closeStatusPopover = () => setIsStatusPopoverOpen(false);

  const selectedWidget = 'wanted';
  const filterRef = useRef<HTMLDivElement | null>(null);
  const { website, github } = organizationUrls;
  const handlePostBountyClick = () => {
    setIsPostBountyModalOpen(true);
  };
  const handlePostBountyClose = () => {
    setIsPostBountyModalOpen(false);
  };
  const handleWebsiteButton = (websiteUrl: string) => {
    window.open(websiteUrl, '_blank');
  };

  const handleGithubButton = (githubUrl: string) => {
    window.open(githubUrl, '_blank');
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
  }, [org_uuid, checkboxIdToSelectedMap, main, languageString]);

  useEffect(() => {
    (async () => {
      if (!uuid) return;
      const res = await main.getOrganizationByUuid(uuid);
      if (!res) return;
      setOrganization(res);      
    })();
  }, [main, uuid])

  const handleClick = () => {
    setFilterClick(!filterClick);
  };

  useEffect(() => {
    const handleWindowClick = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterClick(false);
      }
    };
    if (filterClick) {
      window.addEventListener('click', handleWindowClick);
    } else {
      window.removeEventListener('click', handleWindowClick);
    }
    return () => {
      window.removeEventListener('click', handleWindowClick);
    };
  }, [filterClick]);

  return (
    <>
      <FillContainer>
        <Header>
          <OrgDetails>
              <OrgDetailsLeft>
                <OrgLogo src={organization?.img || '/static/orgdefault.png'} alt={organization?.name + ' logo'}/>
                <OrgNameLinks>
                  <OrgName>{organization?.name || ''}</OrgName>
                  <OrgLinks>
                    {
                      organization?.github &&
                      <SmallButton href={organization?.website} target="_blank">
                        <img src={websiteIcon} alt="globe-website icon" />
                        <span>Website</span>
                      </SmallButton>
                    }
                    {
                      organization?.website &&
                      <SmallButton href={organization?.github} target="_blank">
                        {' '}
                        <img src={githubIcon} alt="github icon" />
                        <span>Github</span>
                      </SmallButton>
                    }
                    
                  </OrgLinks>
                  
                </OrgNameLinks>
              </OrgDetailsLeft>
              <OrgDetailsRight>
                <OrgDetailsText>{organization?.description || ''}</OrgDetailsText>
              </OrgDetailsRight>
            </OrgDetails>
            <ButtonContainer>
              <Button onClick={handlePostBountyClick}>
                <img src={addBounty} alt="" />
                Post a Bounty
              </Button>
            </ButtonContainer>

        </Header>
      </FillContainer>
      <FillContainer>
        <Filters>
          <FiltersRight>
            <NewStatusContainer>
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
                        icon={`${
                          isStatusPopoverOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'
                        }`}
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
            </NewStatusContainer>
            <SkillContainer>
              <FilterLabel>Skill</FilterLabel>
              <DropDownButton onClick={handleClick} data-testid="skillDropdown">
                {' '}
                <Img src={dropdown} alt="" />
              </DropDownButton>
              {filterClick ? (
                <SkillFilter ref={filterRef} data-testid="skill-filter">
                  <InternalContainer>
                    <EuiPopOverCheckboxRight className="CheckboxOuter" color={color}>
                      <EuiCheckboxGroup
                        options={Coding_Languages}
                        idToSelectedMap={checkboxIdToSelectedMapLanguage}
                        onChange={(id: any) => {
                          onChangeLanguage(id);
                        }}
                      />
                    </EuiPopOverCheckboxRight>
                  </InternalContainer>
                </SkillFilter>
              ) : null}
            </SkillContainer>
            <SearchWrapper>
              <SearchBar placeholder="Search" disabled />
              <Icon src={searchIcon} alt="Search" />
            </SearchWrapper>
          </FiltersRight>
          <FiltersLeft>
            <SoryByContainer>
              <FilterLabel>Sort by:Newest First</FilterLabel>
              <DropDownButton>
                {' '}
                <Img src={dropdown} alt="" />
              </DropDownButton>
            </SoryByContainer>
          </FiltersLeft>
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
