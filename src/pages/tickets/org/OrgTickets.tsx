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
import { OrgBody, Body, Backdrop } from '../style';
import { Organization, defaultOrgBountyStatus, queryLimit } from '../../../store/main';
import { OrgHeader } from './orgHeader';

function OrgBodyComponent() {
  const { main, ui } = useStores();
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const selectedWidget = 'wanted';
  const [scrollValue, setScrollValue] = useState<boolean>(false);
  const [checkboxIdToSelectedMap, setCheckboxIdToSelectedMap] = useState(defaultOrgBountyStatus);
  const [checkboxIdToSelectedMapLanguage, setCheckboxIdToSelectedMapLanguage] = useState({});
  const { uuid } = useParams<{ uuid: string; bountyId: string }>();

  const [organizationData, setOrganizationData] = useState<Organization>();
  const [languageString, setLanguageString] = useState('');
  const [page, setPage] = useState<number>(1);
  const [currentItems, setCurrentItems] = useState<number>(queryLimit);
  const [OrgTotalBounties, setTotalBounties] = useState(0);

  const color = colors['light'];

  const history = useHistory();
  const isMobile = useIsMobile();

  useEffect(() => {
    (async () => {
      if (!uuid) return;
      const orgData = await main.getUserOrganizationByUuid(uuid);
      if (!orgData) return;
      setOrganizationData(orgData);

      setLoading(false);
    })();
  }, [main, uuid, checkboxIdToSelectedMap, languageString]);

  useEffect(() => {
    setCheckboxIdToSelectedMap({ ...defaultOrgBountyStatus });
  }, [loading]);

  useEffect(() => {
    if (ui.meInfo) {
      main.getTribesByOwner(ui.meInfo.owner_pubkey || '');
    }
  }, [main, ui.meInfo]);

  const getTotalBounties = useCallback(
    async (uuid: any, statusData: any, page: any) => {
      const OrgTotalBounties = await main.getTotalOrgBounties(uuid, {
        page,
        ...statusData,
        resetPage: true
      });

      setTotalBounties(OrgTotalBounties);
    },
    [main]
  );

  useEffect(() => {
    getTotalBounties(uuid, checkboxIdToSelectedMap, page);
  }, [getTotalBounties]);

  const onChangeStatus = (optionId: any) => {
    const newCheckboxIdToSelectedMap = {
      ...checkboxIdToSelectedMap,
      ...{
        [optionId]: !checkboxIdToSelectedMap[optionId]
      }
    };
    setCheckboxIdToSelectedMap(newCheckboxIdToSelectedMap);
    // set the store status, to enable the accurate navigation modal call
    main.setBountiesStatus(newCheckboxIdToSelectedMap);
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

  const onPanelClick = (activeOrg: string, item: any) => {
    history.push({
      pathname: `/bounty/${item.id}`,
      state: { activeOrg }
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
      <OrgBody
        onScroll={(e: any) => {
          setScrollValue(e?.currentTarget?.scrollTop >= 20);
        }}
        style={{
          background: color.grayish.G950,
          height: 'calc(100% - 65px)'
        }}
      >
        <OrgHeader
          onChangeStatus={onChangeStatus}
          onChangeLanguage={onChangeLanguage}
          checkboxIdToSelectedMap={checkboxIdToSelectedMap}
          checkboxIdToSelectedMapLanguage={checkboxIdToSelectedMapLanguage}
          languageString={languageString}
          organizationData={organizationData as Organization}
          org_uuid={uuid}
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
                OrgTotalBounties={OrgTotalBounties}
                currentItems={currentItems}
                setCurrentItems={setCurrentItems}
                page={page}
                setPage={setPage}
                uuid={uuid}
                org_uuid={uuid}
                languageString={languageString}
                activeOrg={uuid}
                orgQueryLimit={queryLimit}
              />
            </div>
          </div>
        </>
        {toastsEl}
      </OrgBody>
    )
  );
}
export default observer(OrgBodyComponent);
