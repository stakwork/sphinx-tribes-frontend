import React, { useState, useEffect, useRef } from 'react';
import { EuiCheckboxGroup, EuiPopover, EuiText } from '@elastic/eui';
import MaterialIcon from '@material/react-material-icon';
import { PostModal } from 'people/widgetViews/postBounty/PostModal';
import { GetValue, coding_languages } from 'people/utils/languageLabelStyle';
import { SearchBar } from '../../../../components/common/index.tsx';
import { useStores } from '../../../../store';
import { colors } from '../../../../config';
import { OrgBountyHeaderProps } from '../../../../people/interfaces.ts';
import { userCanManageBounty } from '../../../../helpers';
import addBounty from './Icons/addBounty.svg';
import dropdown from './Icons/dropDownIcon.svg';
import file from './Icons/file.svg';
import githubIcon from './Icons/githubIcon.svg';
import websiteIcon from './Icons/websiteIcon.svg';
import {
  BountyNumber,
  Button,
  CompanyDescription,
  CompanyLabel,
  CompanyNameAndLink,
  DropDownButton,
  EuiPopOverCheckbox,
  EuiPopOverCheckboxRight,
  FillContainer,
  FilterLabel,
  Filters,
  FiltersLeft,
  FiltersRight,
  Header,
  ImageContainer,
  Img,
  InternalContainer,
  Leftheader,
  NewStatusContainer,
  NumberOfBounties,
  PrimaryText,
  RightHeader,
  SecondaryText,
  SkillContainer,
  SkillFilter,
  SoryByContainer,
  StatusContainer,
  UrlButton,
  UrlButtonContainer
} from './OrgHeaderStyles';

const Coding_Languages = GetValue(coding_languages);
const color = colors['light'];

const Status = ['Open', 'Assigned', 'Completed', 'Paid'];
export const OrgHeader = ({
  onChangeLanguage,
  checkboxIdToSelectedMapLanguage,
  onChangeStatus,
  checkboxIdToSelectedMap,
  org_uuid,
  languageString,
  organizationData
}: OrgBountyHeaderProps) => {
  const { main, ui } = useStores();
  const [isPostBountyModalOpen, setIsPostBountyModalOpen] = useState(false);
  const [filterClick, setFilterClick] = useState(false);
  const [canPostBounty, setCanPostBounty] = useState(false);
  const [isStatusPopoverOpen, setIsStatusPopoverOpen] = useState<boolean>(false);
  const onButtonClick = async () => {
    setIsStatusPopoverOpen((isPopoverOpen: any) => !isPopoverOpen);
  };
  const closeStatusPopover = () => setIsStatusPopoverOpen(false);

  useEffect(() => {
    const checkUserPermissions = async () => {
      const isLoggedIn = !!ui.meInfo;
      const hasPermission =
        isLoggedIn && (await userCanManageBounty(org_uuid, ui.meInfo?.pubkey, main));
      setCanPostBounty(hasPermission);
    };

    if (ui.meInfo && org_uuid) {
      checkUserPermissions();
    }
  }, [ui.meInfo, org_uuid, main]);

  const selectedWidget = 'wanted';

  const filterRef = useRef<HTMLDivElement | null>(null);

  const handlePostBountyClick = () => {
    setIsPostBountyModalOpen(true);
  };
  // const handlePostBountyClose = () => {
  //   setIsPostBountyModalOpen(false);
  // };
  const handleWebsiteButton = (websiteUrl: string) => {
    window.open(websiteUrl, '_blank');
  };

  const handleGithubButton = (githubUrl: string) => {
    window.open(githubUrl, '_blank');
  };

  const handleSearch = (searchText: string) => {
    if (org_uuid) {
      main.getSpecificOrganizationBounties(org_uuid, {
        page: 1,
        resetPage: true,
        ...checkboxIdToSelectedMap,
        search: searchText
      });
    } else {
      console.log('Organization UUID is missing in params');
    }
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

  const { name, img, description, website, github } = organizationData;

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
          <Leftheader>
            <ImageContainer src={img} width="72px" height="72px" alt="organization icon" />
            <CompanyNameAndLink>
              <CompanyLabel>{name}</CompanyLabel>
              <UrlButtonContainer data-testid="url-button-container">
                {website !== '' ? (
                  <UrlButton onClick={() => handleWebsiteButton(website ?? '')}>
                    <img src={websiteIcon} alt="" />
                    Website
                  </UrlButton>
                ) : (
                  ''
                )}
                {github !== '' ? (
                  <UrlButton onClick={() => handleGithubButton(github ?? '')}>
                    <img src={githubIcon} alt="" />
                    Github
                  </UrlButton>
                ) : (
                  ''
                )}
              </UrlButtonContainer>
            </CompanyNameAndLink>
          </Leftheader>
          {canPostBounty && (
            <RightHeader>
              <CompanyDescription>{description}</CompanyDescription>
              <Button onClick={handlePostBountyClick}>
                <img src={addBounty} alt="" />
                Post a Bounty
              </Button>
            </RightHeader>
          )}
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
          <FiltersLeft>
            <SoryByContainer>
              <FilterLabel>Sort by:Newest First</FilterLabel>
              <DropDownButton>
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
        onClose={() => setIsPostBountyModalOpen(false)}
      />
    </>
  );
};
