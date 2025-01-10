import React, { useState, useRef, useEffect, useCallback } from 'react';
import moment from 'moment';
import { Workspace } from 'store/interface';
import { mainStore } from 'store/main';
import {
  AlternateWrapper,
  ButtonWrapper,
  ExportButton,
  ExportText,
  Month,
  ArrowButton,
  DropDown,
  LeftWrapper,
  RightWrapper,
  Container,
  Option,
  CustomButton,
  WorkspaceOption,
  WorkspaceText,
  FeaturedButton
} from './HeaderStyles';
import arrowback from './icons/arrowback.svg';
import arrowforward from './icons/arrowforward.svg';
import expand_more from './icons/expand_more.svg';
import App from './components/Calendar/App';
import InviteModal from './InviteModal';
import FeatureBountyModal from './FeatureBountyModal';
import FeatureFlagsModal from './FeatureFlagsModal';

interface HeaderProps {
  startDate?: number;
  endDate?: number;
  setStartDate: (newDate: number) => void;
  setEndDate: (newDate: number) => void;
  workspace: string;
  setWorkspace: React.Dispatch<React.SetStateAction<string>>;
  addToast?: (title: string, color: 'success' | 'error') => void;
}
export const Header = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  workspace,
  setWorkspace,
  addToast
}: HeaderProps) => {
  const [showSelector, setShowSelector] = useState(false);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [dateDiff, setDateDiff] = useState(7);
  const [exportLoading, setExportLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [dropdownText, setDropdownText] = useState<string>('Last 7 Days');
  const [workspaceText, setWorkspaceText] = useState<string>('Workspaces ...');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [openInvite, setOpenInvite] = useState(false);
  const [openFeatureBounty, setOpenFeatureBounty] = useState(false);
  const [openFeatureFlags, setOpenFeatureFlags] = useState(false);

  const formatUnixDate = (unixDate: number) => {
    const formatString = 'DD MMM YYYY';
    if (startDate !== undefined && endDate !== undefined) {
      const startYear = moment.unix(startDate).format('YYYY');
      const endYear = moment.unix(endDate).format('YYYY');

      return moment
        .unix(unixDate)
        .format(startYear !== endYear || unixDate === endDate ? formatString : 'DD MMM YYYY');
    }
    return '';
  };
  const handleBackClick = () => {
    if (startDate !== undefined && endDate !== undefined) {
      const newStartDate = moment.unix(startDate).subtract(dateDiff, 'days').unix();
      const newEndDate = moment.unix(endDate).subtract(dateDiff, 'days').unix();
      setStartDate(newStartDate);
      setEndDate(newEndDate);
    }
  };

  const handleForwardClick = () => {
    if (startDate !== undefined && endDate !== undefined) {
      const newStartDate = moment.unix(startDate).add(dateDiff, 'days').unix();
      const newEndDate = moment.unix(endDate).add(dateDiff, 'days').unix();

      const todayUnix = moment().startOf('day').unix();
      const cappedEndDate = Math.min(newEndDate, todayUnix);

      setStartDate(newStartDate);
      setEndDate(cappedEndDate);
    }
  };

  const toggleFeatureBountyModal = () => {
    setOpenFeatureBounty(!openFeatureBounty);
  };

  const toggleModal = () => {
    setOpenInvite(!openInvite);
  };

  const exportCsv = async () => {
    setExportLoading(true);
    const csvUrl = await mainStore.exportMetricsBountiesCsv(
      {
        start_date: String(startDate),
        end_date: String(endDate)
      },
      workspace
    );

    if (csvUrl) {
      window.open(csvUrl);
    }
    setExportLoading(false);
  };

  const handleDropDownChange = (option: number | string) => {
    if (typeof option === 'number') {
      const selectedValue = Number(option);
      setDateDiff(selectedValue);
      let text = `${selectedValue} Days`;
      switch (selectedValue) {
        case 7:
          text = 'Last 7 Days';
          break;
        case 30:
          text = 'Last 30 Days';
          break;
        case 90:
          text = 'Last 90 Days';
          break;
        case moment().date():
          text = `Current Month`;
          break;
        default:
          break;
      }
      setDropdownText(text);

      if (startDate && endDate) {
        const currentEndDate = moment.unix(endDate);
        const newStartDate = currentEndDate.clone().subtract(selectedValue, 'days').unix();
        setStartDate(newStartDate);
      }
    } else if (option === 'Custom') {
      setDropdownText('Custom');
      setShowCalendar(!showCalendar);
    }
  };

  const handleWorkspaceChange = (option: string) => {
    if (option === 'all') {
      setWorkspaceText('All');
      setWorkspace('');
    } else {
      setWorkspace(option);
      const activeSpace = workspaces.find((work: Workspace) => work.uuid === option);
      setWorkspaceText(activeSpace?.name ?? '');
    }
  };

  const currentDateUnix = moment().unix();
  const optionRef = useRef<HTMLDivElement | null>(null);
  const workspaceRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (optionRef.current && !optionRef.current.contains(event.target as Node)) {
        setShowSelector(!showSelector);
      }

      if (workspaceRef.current && !workspaceRef.current.contains(event.target as Node)) {
        setShowWorkspace(!showWorkspace);
      }
    };

    window.addEventListener('click', handleOutsideClick);

    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, [showSelector, showWorkspace]);

  const getWorkspaces = useCallback(async () => {
    const workspaces = await mainStore.getAdminWorkspaces();
    setWorkspaces(workspaces);
  }, []);

  useEffect(() => {
    getWorkspaces();
  }, [getWorkspaces]);

  const toggleFeatureFlagsModal = () => {
    setOpenFeatureFlags(!openFeatureFlags);
  };

  return (
    <Container>
      <AlternateWrapper>
        <LeftWrapper data-testid="leftWrapper">
          {startDate && endDate ? (
            <>
              <ButtonWrapper>
                <ArrowButton onClick={() => handleBackClick()}>
                  <img src={arrowback} alt="" />
                </ArrowButton>
                <ArrowButton
                  disabled={
                    endDate === currentDateUnix ||
                    moment.unix(endDate).isSameOrAfter(moment().startOf('day'))
                  }
                  onClick={() => handleForwardClick()}
                >
                  <img src={arrowforward} alt="" />
                </ArrowButton>
              </ButtonWrapper>
              <Month data-testid="month">
                {formatUnixDate(startDate)} - {formatUnixDate(endDate)}
              </Month>
            </>
          ) : null}
        </LeftWrapper>
        <RightWrapper>
          <FeaturedButton onClick={() => toggleFeatureFlagsModal()}>
            <ExportText>Feature Flags</ExportText>
          </FeaturedButton>
          <FeaturedButton onClick={() => toggleFeatureBountyModal()}>
            <ExportText>Featured Bounty</ExportText>
          </FeaturedButton>
          <ExportButton onClick={() => toggleModal()}>
            <ExportText>Invite Users</ExportText>
          </ExportButton>
          <ExportButton disabled={exportLoading} onClick={() => exportCsv()}>
            <ExportText>{exportLoading ? 'Exporting ...' : 'Export CSV'}</ExportText>
          </ExportButton>
          <DropDown
            data-testid="WorkspaceDropDown"
            onClick={() => {
              setShowWorkspace(!showWorkspace);
            }}
            style={{ position: 'relative' }}
          >
            <WorkspaceText style={{ flex: 2, textAlign: 'center' }}>{workspaceText}</WorkspaceText>
            <div>
              <img src={expand_more} alt="a" />
            </div>
            {showWorkspace ? (
              <WorkspaceOption ref={workspaceRef}>
                <ul>
                  <li onClick={() => handleWorkspaceChange('all')}>All</li>
                  {workspaces.map((work: Workspace) => (
                    <li key={work.uuid} onClick={() => handleWorkspaceChange(work.uuid)}>
                      {work.name}
                    </li>
                  ))}
                </ul>
              </WorkspaceOption>
            ) : null}
          </DropDown>
          <DropDown
            data-testid="DropDown"
            onClick={() => {
              setShowSelector(!showSelector);
            }}
          >
            <div style={{ flex: 2, textAlign: 'center' }}>{dropdownText}</div>
            <div>
              <img src={expand_more} alt="a" />
            </div>
            {showSelector ? (
              <Option ref={optionRef}>
                <ul>
                  <li onClick={() => handleDropDownChange(7)}>7 Days</li>
                  <li onClick={() => handleDropDownChange(30)}>30 Days</li>
                  <li onClick={() => handleDropDownChange(90)}>90 Days</li>
                  <li onClick={() => handleDropDownChange(moment().date())}>Current Month</li>
                  <li>
                    <CustomButton onClick={() => handleDropDownChange('Custom')}>
                      Custom
                    </CustomButton>
                  </li>
                </ul>
              </Option>
            ) : null}
          </DropDown>
          <FeatureFlagsModal
            addToast={addToast}
            open={openFeatureFlags}
            close={toggleFeatureFlagsModal}
          />
        </RightWrapper>
      </AlternateWrapper>
      {showCalendar && (
        <App
          filterStartDate={setStartDate}
          filterEndDate={setEndDate}
          setShowCalendar={setShowCalendar}
        />
      )}
      <InviteModal addToast={addToast} open={openInvite} close={toggleModal} />
      <FeatureBountyModal
        addToast={addToast}
        open={openFeatureBounty}
        close={toggleFeatureBountyModal}
      />
    </Container>
  );
};
