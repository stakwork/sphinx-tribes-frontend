import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { EuiCheckboxGroup, EuiPopover, EuiText } from '@elastic/eui';
import MaterialIcon from '@material/react-material-icon';
import { PostModal } from 'people/widgetViews/postBounty/PostModal';
import { GetValue, coding_languages } from 'people/utils/languageLabelStyle';
import { colors } from 'config';
import { WorkspaceBountyHeaderProps } from '../../../../people/interfaces.ts';
import { SearchBar } from '../../../../components/common/index.tsx';
import { useStores } from '../../../../store/index.tsx';
import { userCanManageBounty, filterCount } from '../../../../helpers/index.ts';
import { Leftheader, Header } from '../../style.ts';
import addBounty from './Icons/addBounty.svg';
import file from './Icons/file.svg';
import githubIcon from './Icons/githubIcon.svg';

import websiteIcon from './Icons/websiteIcon.svg';

import {
  BountyNumber,
  Button,
  CompanyDescription,
  CompanyLabel,
  CompanyNameAndLink,
  EuiPopOverCheckbox,
  EuiPopOverCheckboxRight,
  FillContainer,
  Filters,
  FiltersRight,
  ImageContainer,
  Img,
  InternalContainer,
  NewStatusContainer,
  NumberOfBounties,
  PrimaryText,
  RightHeader,
  SecondaryText,
  SkillContainer,
  SkillFilter,
  StatusContainer,
  UrlButton,
  UrlButtonContainer,
  FilterCount,
  InnerContainer,
  Formatter,
  SkillTextContainer,
  SkillInnerContainer
} from './WorkspaceHeaderStyles.tsx';

const color = colors['light'];

const Coding_Languages = GetValue(coding_languages);

const Status = ['Open', 'Assigned', 'Completed', 'Paid'];

const sortDirectionOptions = [
  {
    id: 'desc',
    label: 'Newest First'
  },
  {
    id: 'asc',
    label: 'Oldest First'
  }
];
export const WorkspaceHeader = ({
  onChangeLanguage,
  checkboxIdToSelectedMapLanguage,
  onChangeStatus,
  checkboxIdToSelectedMap,
  workspace_uuid,
  languageString,
  workspaceData,
  totalBountyCount
}: WorkspaceBountyHeaderProps) => {
  const { main, ui } = useStores();
  const [isPostBountyModalOpen, setIsPostBountyModalOpen] = useState(false);
  const [filterClick, setFilterClick] = useState(false);
  const [canPostBounty, setCanPostBounty] = useState(false);
  const [isStatusPopoverOpen, setIsStatusPopoverOpen] = useState<boolean>(false);
  const [isSortByPopoverOpen, setIsSortByPopoverOpen] = useState(false);
  const [sortDirection, setSortDirection] = useState<string>('desc');
  const [skillCountNumber, setSkillCountNumber] = useState<number>(0);
  const [statusCountNumber, setStatusCountNumber] = useState<number>(0);

  const onButtonClick = async () => {
    setIsStatusPopoverOpen((isPopoverOpen: any) => !isPopoverOpen);
  };
  const closeStatusPopover = () => setIsStatusPopoverOpen(false);

  const sortDirectionLabel = useMemo(
    () => (sortDirection === 'asc' ? 'Oldest First' : 'Newest First'),
    [sortDirection]
  );

  const onSortButtonClick = async () => {
    setIsSortByPopoverOpen((isPopoverOpen: any) => !isPopoverOpen);
  };

  const closeSortByPopover = () => setIsSortByPopoverOpen(false);

  const checkUserPermissions = useCallback(async () => {
    const hasPermission = await userCanManageBounty(workspace_uuid, ui.meInfo?.pubkey, main);
    setCanPostBounty(hasPermission);
  }, [workspace_uuid, ui.meInfo, main]);

  useEffect(() => {
    checkUserPermissions();
  }, [checkUserPermissions]);

  const selectedWidget = 'bounties';

  const filterRef = useRef<HTMLDivElement | null>(null);

  const handlePostBountyClick = () => {
    setIsPostBountyModalOpen(true);
  };

  const handleWebsiteButton = (websiteUrl: string) => {
    window.open(websiteUrl, '_blank');
  };

  const handleGithubButton = (githubUrl: string) => {
    window.open(githubUrl, '_blank');
  };

  const handleSearch = (searchText: string) => {
    if (workspace_uuid) {
      main.getSpecificWorkspaceBounties(workspace_uuid, {
        page: 1,
        resetPage: true,
        ...checkboxIdToSelectedMap,
        search: searchText
      });
    } else {
      console.log('Workspace UUID is missing in params');
    }
  };

  let timeoutId;
  const onChangeSearch = (e: any) => {
    ui.setSearchText(e);
    clearTimeout(timeoutId);
    // Set a new timeout to wait for user to pause typing
    timeoutId = setTimeout(() => {
      if (ui.searchText === '') {
        handleSearch('');
      }
    }, 1000);
  };

  useEffect(() => {
    if (workspace_uuid) {
      main.getSpecificWorkspaceBounties(workspace_uuid, {
        page: 1,
        resetPage: true,
        ...checkboxIdToSelectedMap,
        languageString,
        direction: sortDirection
      });
    }
  }, [workspace_uuid, checkboxIdToSelectedMap, main, languageString, sortDirection]);

  const { name, img, description, website, github } = workspaceData;

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
  }, [workspace_uuid, checkboxIdToSelectedMap, languageString, main, filterClick]);

  useEffect(() => {
    setStatusCountNumber(filterCount(checkboxIdToSelectedMap));
  }, [checkboxIdToSelectedMap]);

  useEffect(() => {
    setSkillCountNumber(filterCount(checkboxIdToSelectedMapLanguage));
  }, [checkboxIdToSelectedMapLanguage]);

  return (
    <>
      <FillContainer>
        <Header>
          <Leftheader>
            <ImageContainer src={img} width="72px" height="72px" alt="workspace icon" />
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
          <RightHeader>
            <CompanyDescription>{description}</CompanyDescription>
            {canPostBounty && (
              <Button onClick={handlePostBountyClick}>
                <img src={addBounty} alt="" />
                Post a Bounty
              </Button>
            )}
          </RightHeader>
        </Header>
      </FillContainer>
      <FillContainer>
        <Filters>
          <FiltersRight>
            <NewStatusContainer>
              <EuiPopover
                button={
                  <StatusContainer onClick={onButtonClick} color={color}>
                    <InnerContainer>
                      <EuiText
                        className="statusText"
                        style={{
                          color: isStatusPopoverOpen ? color.grayish.G10 : ''
                        }}
                      >
                        Status
                      </EuiText>
                      <Formatter>
                        {statusCountNumber > 0 && (
                          <FilterCount color={color}>
                            <EuiText className="filterCountText">{statusCountNumber}</EuiText>
                          </FilterCount>
                        )}
                      </Formatter>
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
                    </InnerContainer>
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
                    flex: 'row'
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
              <EuiPopover
                button={
                  <SkillTextContainer color={color}>
                    <SkillInnerContainer onClick={handleClick}>
                      <EuiText className="skillText">Skill</EuiText>
                      <Formatter>
                        {skillCountNumber > 0 && (
                          <FilterCount color={color}>
                            <EuiText className="filterCountText">{skillCountNumber}</EuiText>
                          </FilterCount>
                        )}
                      </Formatter>
                      <div className="filterStatusIconContainer">
                        <MaterialIcon
                          data-testid="skillDropdown"
                          className="materialStatusIcon"
                          icon={'keyboard_arrow_down'}
                          style={{
                            color: isStatusPopoverOpen ? color.grayish.G10 : ''
                          }}
                        />
                      </div>
                    </SkillInnerContainer>
                  </SkillTextContainer>
                }
              />
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
              onChange={(e: any) => {
                onChangeSearch(e);
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
              border={'none'}
              borderHover={'none'}
              borderActive={'none'}
              borderRadius={'6px'}
              width={'384px'}
              height={'40px'}
              marginLeft={'20px'}
              color={color.grayish.G950}
            />
          </FiltersRight>
          <EuiPopover
            button={
              <StatusContainer onClick={onSortButtonClick} className="CheckboxOuter" color={color}>
                <div style={{ minWidth: '145px' }}>
                  <EuiText
                    className="statusText"
                    style={{
                      color: isSortByPopoverOpen ? color.grayish.G10 : ''
                    }}
                  >
                    Sort By: {sortDirectionLabel}
                  </EuiText>
                </div>

                <div className="filterStatusIconContainer">
                  <MaterialIcon
                    className="materialStatusIcon"
                    icon={`${isSortByPopoverOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}`}
                    style={{
                      color: isSortByPopoverOpen ? color.grayish.G10 : ''
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
              marginTop: '0px',
              marginRight: '30px'
            }}
            isOpen={isSortByPopoverOpen}
            closePopover={closeSortByPopover}
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
                  options={sortDirectionOptions}
                  idToSelectedMap={{ [sortDirection]: true }}
                  onChange={(id: string) => setSortDirection(id)}
                />
              </EuiPopOverCheckbox>
            </div>
          </EuiPopover>
        </Filters>
      </FillContainer>
      <NumberOfBounties>
        <BountyNumber>
          <Img src={file} alt="" />
          <PrimaryText>{totalBountyCount}</PrimaryText>
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
