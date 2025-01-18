import { EuiGlobalToastList, EuiLoadingSpinner } from '@elastic/eui';
import { observer } from 'mobx-react-lite';
import FirstTimeScreen from 'people/main/FirstTimeScreen';
import BountyHeader from 'people/widgetViews/BountyHeader';
import WidgetSwitchViewer from 'people/widgetViews/WidgetSwitchViewer';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { useParams } from 'react-router-dom';
import { colors } from '../../../config/colors';
import { useIsMobile } from '../../../hooks';
import { useStores } from '../../../store';
import { WorkspaceBody, Body, Backdrop } from '../style';
import { Workspace, queryLimit } from '../../../store/interface';
import { WorkspaceHeader } from './workspaceHeader';

function WorkspaceBodyComponent() {
  const { main, ui } = useStores();
  const { uuid } = useParams<{ uuid: string; bountyId: string }>();
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const selectedWidget = 'bounties';
  const [scrollValue, setScrollValue] = useState<boolean>(false);
  const [checkboxIdToSelectedMap, setCheckboxIdToSelectedMap] = useState(
    main.workspaceBountiesStatus
  );
  const [checkboxIdToSelectedMapLanguage, setCheckboxIdToSelectedMapLanguage] = useState({});
  const [workspaceData, setWorkspaceData] = useState<Workspace>();
  const [languageString, setLanguageString] = useState('');
  const [page, setPage] = useState<number>(1);
  const [currentItems, setCurrentItems] = useState<number>(queryLimit);
  const [WorkspaceTotalBounties, setTotalBounties] = useState(0);

  const color = colors['light'];
  const history = useHistory();
  const isMobile = useIsMobile();

  useEffect(() => {
    setCheckboxIdToSelectedMap(main.workspaceBountiesStatus);
  }, [main.workspaceBountiesStatus]);

  useEffect(() => {
    (async () => {
      if (!uuid) return;
      const workspaceData = await main.getUserWorkspaceByUuid(uuid);
      if (!workspaceData) return;
      setWorkspaceData(workspaceData);
      setLoading(false);
    })();
  }, [main, uuid, checkboxIdToSelectedMap, languageString]);

  useEffect(() => {
    if (ui.meInfo) {
      main.getTribesByOwner(ui.meInfo.owner_pubkey || '');
    }
  }, [main, ui.meInfo]);

  const getTotalBounties = useCallback(
    async (uuid: any, statusData: any, page: any) => {
      const WorkspaceTotalBounties = await main.getTotalWorkspaceBounties(uuid, {
        page,
        ...statusData,
        resetPage: true
      });
      setTotalBounties(WorkspaceTotalBounties);
    },
    [main]
  );

  useEffect(() => {
    getTotalBounties(uuid, checkboxIdToSelectedMap, page);
  }, [checkboxIdToSelectedMap, getTotalBounties, page, uuid]);

  const onChangeStatus = (optionId: any) => {
    const newCheckboxIdToSelectedMap = {
      ...checkboxIdToSelectedMap,
      ...{
        [optionId]: !checkboxIdToSelectedMap[optionId]
      }
    };
    // set the store status, to enable the accurate navigation modal call
    main.setWorkspaceBountiesStatus(newCheckboxIdToSelectedMap);
    setCheckboxIdToSelectedMap(newCheckboxIdToSelectedMap);
    getTotalBounties(uuid, newCheckboxIdToSelectedMap, page);
    // set data to default
    setCurrentItems(queryLimit);
    setPage(1);
  };

  const onChangeLanguage = (optionId: number) => {
    const newCheckboxIdToSelectedMapLanguage = {
      ...checkboxIdToSelectedMapLanguage,
      [optionId]: !checkboxIdToSelectedMapLanguage[optionId]
    };
    setCheckboxIdToSelectedMapLanguage(newCheckboxIdToSelectedMapLanguage);
    const languageString = Object.keys(newCheckboxIdToSelectedMapLanguage)
      .filter((key: string) => newCheckboxIdToSelectedMapLanguage[key])
      .join(',');
    setLanguageString(languageString);

    main.setBountyLanguages(languageString);
  };

  const onPanelClick = (activeWorkspace: string, item: any) => {
    history.push({
      pathname: `/bounty/${item.id}`,
      state: { activeWorkspace }
    });
  };

  if (loading) {
    return (
      <Body style={{ justifyContent: 'center', alignItems: 'center' }}>
        <EuiLoadingSpinner size="xl" />
      </Body>
    );
  }

  const showFirstTime = ui.meInfo && ui.meInfo.id === 0;

  if (showFirstTime) {
    return <FirstTimeScreen />;
  }

  const toastsEl = (
    <EuiGlobalToastList
      toasts={ui.toasts}
      dismissToast={() => ui.setToasts([])}
      toastLifeTimeMs={3000}
    />
  );

  if (!loading && isMobile) {
    return (
      <Body>
        <div
          style={{
            width: '100%',
            padding: '8px 0px',
            boxShadow: `0 0 6px 0 ${color.black100}`,
            zIndex: 2,
            position: 'relative',
            background: color.pureWhite,
            borderBottom: `1px solid ${color.black100}`
          }}
        >
          <BountyHeader
            selectedWidget={selectedWidget}
            scrollValue={scrollValue}
            onChangeStatus={onChangeStatus}
            onChangeLanguage={onChangeLanguage}
            checkboxIdToSelectedMap={checkboxIdToSelectedMap}
            checkboxIdToSelectedMapLanguage={checkboxIdToSelectedMapLanguage}
          />
        </div>

        {showDropdown && <Backdrop onClick={() => setShowDropdown(false)} />}
        <div style={{ width: '100%' }}>
          <WidgetSwitchViewer
            checkboxIdToSelectedMap={checkboxIdToSelectedMap}
            checkboxIdToSelectedMapLanguage={checkboxIdToSelectedMapLanguage}
            onPanelClick={onPanelClick}
            fromBountyPage={true}
            selectedWidget={selectedWidget}
            loading={loading}
            languageString={languageString}
          />
        </div>

        {toastsEl}
      </Body>
    );
  }

  return (
    !loading && (
      <WorkspaceBody
        onScroll={(e: any) => {
          setScrollValue(e?.currentTarget?.scrollTop >= 20);
        }}
        style={{
          background: color.grayish.G950,
          height: 'calc(100% - 65px)'
        }}
      >
        <WorkspaceHeader
          onChangeStatus={onChangeStatus}
          onChangeLanguage={onChangeLanguage}
          checkboxIdToSelectedMap={checkboxIdToSelectedMap}
          checkboxIdToSelectedMapLanguage={checkboxIdToSelectedMapLanguage}
          languageString={languageString}
          workspaceData={workspaceData as Workspace}
          workspace_uuid={uuid}
          totalBountyCount={WorkspaceTotalBounties}
        />
        <>
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexWrap: 'wrap',
              height: '100%',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              padding: '0px 20px 20px 20px'
            }}
          >
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%'
              }}
            >
              <WidgetSwitchViewer
                checkboxIdToSelectedMap={checkboxIdToSelectedMap}
                checkboxIdToSelectedMapLanguage={checkboxIdToSelectedMapLanguage}
                onPanelClick={onPanelClick}
                fromBountyPage={true}
                selectedWidget={selectedWidget}
                loading={loading}
                WorkspaceTotalBounties={WorkspaceTotalBounties}
                currentItems={currentItems}
                setCurrentItems={setCurrentItems}
                page={page}
                setPage={setPage}
                uuid={uuid}
                org_uuid={uuid}
                languageString={languageString}
                activeWorkspace={uuid}
                orgQueryLimit={queryLimit}
              />
            </div>
          </div>
        </>
        {toastsEl}
      </WorkspaceBody>
    )
  );
}
export default observer(WorkspaceBodyComponent);
