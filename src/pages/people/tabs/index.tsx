import { useBrowserTabTitle, useIsMobile, usePerson } from 'hooks';
import { observer } from 'mobx-react-lite';
import RenderWidgets from 'people/widgetViews/RenderWidgets';
import { widgetConfigs } from 'people/utils/Constants';
import React, { useCallback, useEffect, useState } from 'react';
import { Route, Switch, useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import { useStores } from 'store';
import styled from 'styled-components';
import { Wanted } from './Wanted';

const Container = styled.div<{ isMobile: boolean }>`
  flex-grow: 1;
  margin: ${(p: any) => (p.isMobile ? '0 -20px' : '0')};
`;

const Tabs = styled.div<{ canEdit: boolean }>`
  display: flex;
  width: 100%;
  align-items: center;
  overflow-x: auto;
  ::-webkit-scrollbar {
    display: none;
  }
  background: #fff;
  padding: 0 20px;
  border-bottom: solid 1px #ebedef;
  box-shadow: ${(p: any) =>
    p.canEdit ? '0px 2px 0px rgba(0, 0, 0, 0.07)' : '0px 2px 6px rgba(0, 0, 0, 0.07)'};
`;
interface TagProps {
  selected: boolean;
}

const Tab = styled.div<TagProps>`
  display: flex;
  padding: 10px;
  margin-right: 25px;
  color: ${(p: any) => (p.selected ? '#292C33' : '#8E969C')};
  border-bottom: ${(p: any) => p.selected && '4px solid #618AFF'};
  cursor: hover;
  font-weight: 500;
  font-size: 15px;
  line-height: 19px;
  cursor: pointer;
`;

const Counter = styled.div`
  font-family: Roboto;
  font-style: normal;
  font-weight: normal;
  font-size: 11px;
  line-height: 19px;
  margin-bottom: -3px;
  /* or 173% */
  margin-left: 8px;

  display: flex;
  align-items: center;

  /* Placeholder Text */

  color: #b0b7bc;
`;

const RouteWrap = styled.div`
  padding: 20px 30px;
  height: calc(100% - 63px);
  overflow-y: auto;
  position: relative;
  width: 100%;
`;

interface RouteDataProps {
  fullSelectedWidget: (name: any) => any;
}

const RouteData = styled.div<RouteDataProps>`
  display: flex;
  align-items: flex-start;
  justify-content: ${(p: any) =>
    p.fullSelectedWidget && p.fullSelectedWidget.length > 0 ? 'flex-start' : 'center'};
  flex-wrap: wrap;
  min-height: 100%;
`;

const tabs = widgetConfigs;

const getTabId = (name: string) => `profile-tab-${name}`;
const getTabPanelId = (name: string) => `profile-tabpanel-${name}`;

export const TabsPages = observer(() => {
  const location = useLocation();
  const { ui, main } = useStores();
  const { url, path } = useRouteMatch();
  const history = useHistory();
  const isMobile = useIsMobile();
  const personId = ui.selectedPerson;
  const { person, canEdit } = usePerson(personId);
  const [bountyCount, setBountyCount] = useState<number>(0);
  const [assignedCount, setAssignedCount] = useState<number>(0);

  const tabsNames = Object.keys(tabs).filter((name: any) => {
    if (name === 'about' && !isMobile) {
      return false;
    }
    return true;
  });

  const changeTabHandler = useCallback(
    (tabName: any) => {
      history.replace({
        pathname: `${url}/${tabName}`
      });
    },
    [history, url]
  );

  const getBountiesCount = async (personKey: string, name: string) => {
    if (personKey) {
      const count = await main.getBountyCount(personKey, name);
      if (name === 'bounties') {
        setBountyCount(count);
      } else {
        setAssignedCount(count);
      }
    }
  };

  const toTitleCase = (str: string) =>
    str
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  const activeTabName: string =
    tabsNames.find((name: any) => location.pathname.includes(name)) || 'People';
  const activeTab: string = toTitleCase(activeTabName);
  useBrowserTabTitle(activeTab);

  useEffect(() => {
    const tabSelected = tabsNames.some((name: any) => location.pathname.includes(name));

    if (!tabSelected) {
      changeTabHandler(tabsNames[0]);
    } else {
      getBountiesCount(person?.owner_pubkey || '', 'bounties');
      getBountiesCount(person?.owner_pubkey || '', 'assigned');
    }
  }, [changeTabHandler, location.pathname, tabsNames, person]);

  const fullSelectedWidget = (name: any) => person?.extras?.[name];

  return (
    <Container isMobile={isMobile}>
      <Tabs canEdit={canEdit} role="tablist" aria-label="Profile content tabs">
        {tabs &&
          tabsNames.map((name: any, i: number) => {
            const t = tabs[name];
            const { label } = t;
            const tabId = getTabId(name);
            const panelId = getTabPanelId(name);

            const selected = location.pathname.includes(name);
            const tabIndex = selected ? 0 : -1;
            const hasExtras = !!person?.extras?.[name]?.length;
            let count: any = 0;
            const dataTestId = `${label}-tab`;
            if (name === 'bounties') {
              count = bountyCount;
            } else if (name === 'assigned') {
              count = assignedCount;
            } else {
              count = hasExtras
                ? person.extras[name].filter((f: any) => {
                    if ('show' in f) {
                      // show has a value
                      if (!f.show) return false;
                    }
                    // if no value default to true
                    return true;
                  }).length
                : null;
            }

            return (
              <Tab
                key={i}
                style={{ height: 64, alignItems: 'center' }}
                selected={selected}
                role="tab"
                id={tabId}
                aria-selected={selected}
                aria-controls={panelId}
                aria-label={label}
                tabIndex={tabIndex}
                data-testid={dataTestId}
                onClick={() => {
                  changeTabHandler(name);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    changeTabHandler(name);
                  }
                  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const nextIndex =
                      e.key === 'ArrowRight'
                        ? (i + 1) % tabsNames.length
                        : (i - 1 + tabsNames.length) % tabsNames.length;
                    const nextTabName = tabsNames[nextIndex];
                    changeTabHandler(nextTabName);
                    window.setTimeout(() => {
                      document.getElementById(getTabId(nextTabName))?.focus();
                    }, 0);
                  }
                }}
              >
                {label}
                {count > 0 && <Counter>{count}</Counter>}
              </Tab>
            );
          })}
      </Tabs>
      <Switch>
        {tabsNames.map((name: any) => (
          <Route key={name} path={`${path}${name}`}>
            <RouteWrap role="tabpanel" id={getTabPanelId(name)} aria-labelledby={getTabId(name)}>
              <RouteData fullSelectedWidget={fullSelectedWidget}>
                {name === 'bounties' && <Wanted />}
                <RenderWidgets widget={name} />
              </RouteData>
            </RouteWrap>
          </Route>
        ))}
      </Switch>
    </Container>
  );
});
