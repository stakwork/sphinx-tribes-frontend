import React, { useState } from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { EuiCheckboxGroup, EuiPopover, EuiText } from '@elastic/eui';
import MaterialIcon from '@material/react-material-icon';
import paginationarrow1 from '../header/icons/paginationarrow1.svg';
import paginationarrow2 from '../header/icons/paginationarrow2.svg';
import defaultPic from '../../../public/static/profile_avatar.svg';
import copygray from '../header/icons/copygray.svg';
import { dateFilterOptions } from '../utils';
import { pageSize, visibleTabs } from '../constants.ts';
import checkboxImage from './Icons/checkboxImage.svg';
import { colors } from './../../../config/colors';
import { Bounty } from './interfaces.ts';

import {
  TableContainer,
  HeaderContainer,
  PaginatonSection,
  Header,
  Table,
  TableRow,
  TableData,
  TableDataCenter,
  TableData3,
  TableHeaderData,
  TableHeaderDataCenter,
  TableHeaderDataRight,
  BountyHeader,
  Options,
  LeadingTitle,
  AlternativeTitle,
  FlexDiv,
  PaginationButtons,
  PageContainer,
  TableHeaderDataAlternative,
  TableDataRow,
  TableDataAlternative,
  BountyData,
  Paragraph,
  BoxImage,
  DateFilterWrapper,
  DateFilterContent,
  PaginationImg,
  ProviderContainer,
  ProvidersListContainer,
  ProviderContianer,
  ProviderInfo,
  ProviderImg,
  Providername,
  Checkbox,
  HorizontalGrayLine,
  FooterContainer,
  ClearButton,
  ClearText,
  ApplyButton
} from './TableStyle';

interface styledProps {
  color?: any;
}

export interface TableProps {
  bounties: Bounty[];
  startDate?: number;
  endDate?: number;
  headerIsFrozen?: boolean;
  sortOrder?: string;
  onChangeFilterByDate?: (option: string) => void;
  onChangeStatus: (number) => void;
  clickApply: () => void;
  checkboxIdToSelectedMap?: any;
  paginatePrev?: () => void;
  paginateNext?: () => void;
  currentPage: number;
  totalBounties: number;
  paginationLimit: number;
  setCurrentPage?: React.Dispatch<React.SetStateAction<number>>;
  activeTabs: number[];
  setActiveTabs: React.Dispatch<React.SetStateAction<number[]>>;
  providers?: any[];
  providersCheckboxSelected?: Bounty[];
  handleProviderSelection?: (provider: Bounty) => void;
  handleClearButtonClick?: () => void;
  handleApplyButtonClick?: () => void;
}

interface ImageWithTextProps {
  image?: string;
  text: string;
}

export const ImageWithText = ({ image, text }: ImageWithTextProps) => (
  <>
    <BoxImage>
      <img
        src={image}
        style={{
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          marginRight: '10px'
        }}
        alt={text}
      />
      <Paragraph>{text}</Paragraph>
    </BoxImage>
  </>
);

interface TextInColorBoxProps {
  status: string;
}

export const TextInColorBox = ({ status }: TextInColorBoxProps) => (
  <>
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end'
      }}
    >
      <p
        data-testid="bounty-status"
        style={{
          color: '#fff',
          textTransform: 'uppercase',
          paddingRight: '10px',
          paddingLeft: '10px',
          width: 'max-content',
          textAlign: 'right',
          backgroundColor:
            status === 'open'
              ? '#618AFF'
              : status === 'paid'
                ? '#5F6368'
                : status === 'assigned'
                  ? '#49C998'
                  : status === 'completed'
                    ? '#9157F6'
                    : 'transparent',
          borderRadius: '2px',
          marginBottom: '0'
        }}
      >
        {status}
      </p>
    </div>
  </>
);

const StatusApplyButton = styled.button`
  display: flex;
  width: 112px;
  height: 25px;
  margin: 10px;
  margin-left: 0px;
  padding: 18px 23px;
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

const ProviderStatusContainer = styled(StatusContainer)<styledProps>`
  margin-top: 0px !important;
`;

const Status = ['Open', 'Assigned', 'Completed', 'Paid'];

export const MyTable = ({
  bounties,
  headerIsFrozen,
  sortOrder,
  onChangeFilterByDate,
  onChangeStatus,
  checkboxIdToSelectedMap,
  clickApply,
  currentPage,
  setCurrentPage,
  activeTabs,
  setActiveTabs,
  totalBounties,
  paginationLimit,
  providers,
  providersCheckboxSelected,
  handleProviderSelection,
  handleClearButtonClick,
  handleApplyButtonClick
}: TableProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [isProviderPopoverOpen, setIsProviderPopoverOpen] = useState<boolean>(false);
  const onButtonClick = () => setIsPopoverOpen((isPopoverOpen: any) => !isPopoverOpen);
  const closePopover = () => setIsPopoverOpen(false);

  const [isStatusPopoverOpen, setIsStatusPopoverOpen] = useState<boolean>(false);
  const onStatusButtonClick = async () => {
    setIsStatusPopoverOpen((isPopoverOpen: any) => !isPopoverOpen);
  };
  const closeStatusPopover = () => setIsStatusPopoverOpen(false);

  const onProviderButtonClick = async () => {
    setIsProviderPopoverOpen((isProviderPopoverOpen: any) => !isProviderPopoverOpen);
  };
  const closeProviderPopover = () => setIsProviderPopoverOpen(false);

  const handleClearClick = () => {
    if (handleClearButtonClick) {
      handleClearButtonClick();
    }
  };

  const handleApplyClick = () => {
    if (handleApplyButtonClick) {
      handleApplyButtonClick();
    }
  };

  const paginateNext = () => {
    const activeTab = paginationLimit > visibleTabs;
    const activePage = currentPage < totalBounties / pageSize;
    if (activePage && activeTab) {
      const dataNumber: number[] = activeTabs;

      let nextPage: number;
      if (currentPage < visibleTabs) {
        nextPage = visibleTabs + 1;
        if (setCurrentPage) setCurrentPage(nextPage);
      } else {
        nextPage = currentPage + 1;
        if (setCurrentPage) setCurrentPage(nextPage);
      }

      dataNumber.push(nextPage);
      dataNumber.shift();
    }
  };

  const paginatePrev = () => {
    const firtsTab = activeTabs[0];
    const lastTab = activeTabs[6];
    if (firtsTab > 1) {
      const dataNumber: number[] = activeTabs;
      let nextPage: number;
      if (lastTab > visibleTabs) {
        nextPage = lastTab - visibleTabs;
      } else {
        nextPage = currentPage - 1;
      }

      if (setCurrentPage) setCurrentPage(currentPage - 1);
      dataNumber.pop();
      const newActivetabs = [nextPage, ...dataNumber];
      setActiveTabs(newActivetabs);
    }
  };

  const paginate = (page: number) => {
    if (setCurrentPage) {
      setCurrentPage(page);
    }
  };

  const color = colors['light'];

  return (
    <>
      <HeaderContainer freeze={!headerIsFrozen}>
        <Header>
          <BountyHeader>
            <img src={copygray} alt="" width="16.508px" height="20px" />
            <LeadingTitle>
              {totalBounties}
              <div>
                <AlternativeTitle>{bounties?.length > 1 ? 'Bounties' : 'Bounty'}</AlternativeTitle>
              </div>
            </LeadingTitle>
          </BountyHeader>
          <Options>
            <FlexDiv>
              <EuiPopover
                button={
                  <ProviderStatusContainer onClick={onProviderButtonClick} color={color}>
                    <EuiText
                      className="statusText"
                      style={{
                        color: isProviderPopoverOpen ? color.grayish.G10 : ''
                      }}
                    >
                      Provider:
                    </EuiText>
                    <div className="filterStatusIconContainer">
                      <MaterialIcon
                        className="materialStatusIcon"
                        icon={`${isProviderPopoverOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'
                          }`}
                        style={{
                          color: isProviderPopoverOpen ? color.grayish.G10 : ''
                        }}
                      />
                    </div>
                  </ProviderStatusContainer>
                }
                panelStyle={{
                  border: 'none',
                  boxShadow: `0px 1px 20px ${color.black90}`,
                  background: `${color.pureWhite}`,
                  borderRadius: '0px 0px 6px 6px',
                  marginTop: '0px',
                  marginLeft: '20px'
                }}
                isOpen={isProviderPopoverOpen}
                closePopover={closeProviderPopover}
                panelPaddingSize="none"
                anchorPosition="downLeft"
              >
                <ProviderContainer>
                  <ProvidersListContainer>
                    {providers && providers.length > 0 ? (
                      providers.map((provider: Bounty) => (
                        <ProviderContianer key={provider.owner_id}>
                          <ProviderInfo>
                            <ProviderImg
                              src={provider.owner_img || `/static/person_placeholder.png`}
                              alt="provider"
                            />
                            <Providername>
                              {provider.owner_alias || provider.owner_pubkey}
                            </Providername>
                          </ProviderInfo>
                          <Checkbox
                            type="checkbox"
                            name={provider.owner_alias}
                            checked={
                              providersCheckboxSelected &&
                              providersCheckboxSelected.some(
                                (p: Bounty) => p.owner_id === provider.owner_id
                              )
                            }
                            onChange={() =>
                              handleProviderSelection && handleProviderSelection(provider)
                            }
                          />
                        </ProviderContianer>
                      ))
                    ) : (
                      <p>No provider available</p>
                    )}
                  </ProvidersListContainer>
                  <HorizontalGrayLine />
                  <FooterContainer>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row'
                      }}
                    >
                      <ClearButton onClick={handleClearClick}>
                        <ClearText>Clear</ClearText>
                      </ClearButton>
                      <ApplyButton onClick={handleApplyClick}>Apply</ApplyButton>
                    </div>
                  </FooterContainer>
                </ProviderContainer>
              </EuiPopover>
              <EuiPopover
                button={
                  <DateFilterWrapper onClick={onButtonClick} color={color}>
                    <EuiText
                      className="filterText"
                      style={{
                        color: isPopoverOpen ? color.grayish.G10 : ''
                      }}
                    >
                      Sort By:
                    </EuiText>
                    <div className="image">
                      <EuiText
                        className="filterText"
                        style={{
                          color: isPopoverOpen ? color.grayish.G10 : ''
                        }}
                      >
                        {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
                      </EuiText>
                      <MaterialIcon
                        className="materialIconImage"
                        icon="expand_more"
                        style={{
                          color: isPopoverOpen ? color.grayish.G10 : '',
                          fontWeight: 'bold'
                        }}
                      />
                    </div>
                  </DateFilterWrapper>
                }
                panelStyle={{
                  marginTop: '3px',
                  border: 'none',
                  left: '700px',
                  maxWidth: '106px',
                  boxShadow: `0px 1px 20px ${color.black90}`,
                  background: `${color.pureWhite}`,
                  borderRadius: '6px'
                }}
                isOpen={isPopoverOpen}
                closePopover={closePopover}
                panelPaddingSize="none"
                anchorPosition="downRight"
              >
                <DateFilterContent className="CheckboxOuter" color={color}>
                  {dateFilterOptions.map((val: { [key: string]: string }) => (
                    <Options
                      onClick={() => {
                        onChangeFilterByDate?.(val.value);
                      }}
                      key={val.id}
                    >
                      {val.label}
                    </Options>
                  ))}
                </DateFilterContent>
              </EuiPopover>
            </FlexDiv>
            <EuiPopover
              button={
                <StatusContainer onClick={onStatusButtonClick} color={color}>
                  <EuiText
                    className="statusText"
                    style={{
                      color: isStatusPopoverOpen ? color.grayish.G10 : ''
                    }}
                  >
                    Status:
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
                marginLeft: '7px'
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
                  <StatusApplyButton onClick={clickApply}>Apply</StatusApplyButton>
                </EuiPopOverCheckbox>
              </div>
            </EuiPopover>
          </Options>
        </Header>
      </HeaderContainer>
      <TableContainer>
        <Table>
          <TableRow freeze={!headerIsFrozen}>
            <TableHeaderData>Bounty</TableHeaderData>
            <TableHeaderData>Date</TableHeaderData>
            <TableHeaderDataCenter>#DTGP</TableHeaderDataCenter>
            <TableHeaderData>Assignee</TableHeaderData>
            <TableHeaderData>Provider</TableHeaderData>
            <TableHeaderDataAlternative>Organization</TableHeaderDataAlternative>
            <TableHeaderDataRight>Status</TableHeaderDataRight>
          </TableRow>
          <tbody>
            {bounties &&
              bounties.map((bounty: any) => {
                const bounty_status =
                  bounty?.paid && bounty.assignee
                    ? 'paid'
                    : bounty.assignee && !bounty.paid
                      ? 'assigned'
                      : 'open';

                const created = moment.unix(bounty.bounty_created).format('YYYY-MM-DD');
                const time_to_pay = bounty.paid_date
                  ? moment(bounty.paid_date).diff(created, 'days')
                  : 0;

                return (
                  <TableDataRow key={bounty?.id}>
                    <BountyData className="avg">
                      <a
                        style={{
                          textDecoration: 'inherit',
                          color: 'inherit',
                          display: 'block',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          width: '200px'
                        }}
                        href={`/bounty/${bounty.bounty_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {bounty?.title}
                      </a>
                    </BountyData>
                    <TableData data-testId={'bounty-date'}>{created}</TableData>
                    <TableDataCenter>{time_to_pay}</TableDataCenter>
                    <TableDataAlternative>
                      <ImageWithText
                        text={bounty?.assignee_alias}
                        image={bounty?.assignee_img || defaultPic}
                      />
                    </TableDataAlternative>
                    <TableDataAlternative className="address">
                      <ImageWithText
                        text={bounty?.owner_unique_name}
                        image={bounty?.owner_img || defaultPic}
                      />
                    </TableDataAlternative>
                    <TableData className="organization">
                      <ImageWithText
                        text={bounty?.organization_name}
                        image={bounty?.organization_img || defaultPic}
                      />
                    </TableData>
                    <TableData3>
                      <TextInColorBox status={bounty_status} />
                    </TableData3>
                  </TableDataRow>
                );
              })}
          </tbody>
        </Table>
      </TableContainer>
      <PaginatonSection>
        <FlexDiv>
          {totalBounties > pageSize ? (
            <PageContainer role="pagination">
              <PaginationImg
                src={paginationarrow1}
                alt="pagination arrow 1"
                onClick={() => paginatePrev()}
              />
              {activeTabs.map((page: number) => (
                <PaginationButtons
                  key={page}
                  onClick={() => paginate(page)}
                  active={page === currentPage}
                >
                  {page}
                </PaginationButtons>
              ))}
              <PaginationImg
                src={paginationarrow2}
                alt="pagination arrow 2"
                onClick={() => paginateNext()}
              />
            </PageContainer>
          ) : null}
        </FlexDiv>
      </PaginatonSection>
    </>
  );
};
