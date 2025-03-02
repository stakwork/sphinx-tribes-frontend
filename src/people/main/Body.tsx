import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import styled from 'styled-components';
import { EuiGlobalToastList, EuiLoadingSpinner } from '@elastic/eui';
import PeopleHeader from 'people/widgetViews/PeopleHeader';
import type { Person } from 'store/interface';
import { SearchTextInput } from '../../components/common';
import { colors } from '../../config/colors';
import { useIsMobile, usePageScroll, useScreenWidth, useBrowserTabTitle } from '../../hooks';
import { useStores } from '../../store';
import PersonCard from '../../pages/people/Person';
import NoResults from '../utils/NoResults';
import PageLoadSpinner from '../utils/PageLoadSpinner';
import StartUpModal from '../utils/StartUpModal';
import { usePeopleFilteredSearch } from './usePeopleFilteredSearch';

const color = colors['light'];
const Body = styled.div<{ isMobile: boolean }>`
  flex: 1;
  height: ${(p: any) => (p.isMobile ? 'calc(100% - 105px)' : 'calc(100vh - 60px)')};
  background: ${(p: any) => (p.isMobile ? undefined : color.grayish.G950)};
  width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  & > .header {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 10px 0;

    .searchTextInput {
      // 125px = Filter width + margin
      width: ${(p: any) => (p.isMobile ? 'calc(100vw - 125px)' : '240px')};
      height: 40px;
      border: 1px solid ${color.grayish.G600};
      background: ${color.grayish.G600};
    }
  }
  & > .content {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    height: 100%;
    justify-content: center;
    align-items: flex-start;
    margin-left: ${(p: any) => (p.isMobile ? 'unset' : '20px')};
    margin-right: ${(p: any) => (p.isMobile ? 'unset' : '20px')};
    padding-right: ${(p: any) => (p.isMobile ? 'unset' : '13px')};
  }
`;

export const Spacer = styled.div`
  display: flex;
  min-height: 10px;
  min-width: 100%;
  height: 10px;
  width: 100%;
`;

function BodyComponent() {
  const { main, ui } = useStores();
  const screenWidth = useScreenWidth();
  const [openStartUpModel, setOpenStartUpModel] = useState<boolean>(false);
  const closeModal = () => setOpenStartUpModel(false);
  const history = useHistory();
  const isMobile = useIsMobile();
  const { isLoading, skillsFilter, handleFilterChange, handleSearchChange, uploadMore } =
    usePeopleFilteredSearch();
  const loadForwardFunc = () => uploadMore(1);
  const loadBackwardFunc = () => uploadMore(-1);
  const { loadingBottom, handleScroll } = usePageScroll(loadForwardFunc, loadBackwardFunc);
  useBrowserTabTitle('People');

  const toastsEl = (
    <EuiGlobalToastList
      toasts={ui.toasts}
      dismissToast={() => ui.setToasts([])}
      toastLifeTimeMs={3000}
    />
  );

  useEffect(() => {
    if (ui.meInfo) {
      main.getTribesByOwner(ui.meInfo.owner_pubkey || '');
    }
  }, [main, ui.meInfo]);

  function selectPerson(id: number, unique_name: string, uuid: string) {
    ui.setSelectedPerson(id);
    ui.setSelectingPerson(id);

    history.push(`/p/${uuid}`);
  }

  if (isLoading) {
    return (
      <Body
        data-testid="content"
        isMobile={isMobile}
        style={{ justifyContent: 'center', alignItems: 'center' }}
      >
        <EuiLoadingSpinner size="xl" />
      </Body>
    );
  }

  return (
    <Body
      isMobile={isMobile}
      onScroll={(e: any) => {
        handleScroll(e);
      }}
    >
      <div className="header">
        <PeopleHeader
          onChangeLanguage={handleFilterChange}
          checkboxIdToSelectedMapLanguage={skillsFilter}
        />

        <SearchTextInput
          small
          name="search"
          type="search"
          placeholder="Search"
          onChange={handleSearchChange}
          className="searchTextInput"
        />
      </div>
      <div className="content">
        <>
          {main.people.map((p: Person) => (
            <PersonCard
              {...p}
              key={p.id}
              small={isMobile}
              squeeze={screenWidth < 1420}
              selected={ui.selectedPerson === p.id}
              select={selectPerson}
            />
          ))}

          {!main.people.length && <NoResults />}
          <PageLoadSpinner noAnimate show={loadingBottom} />
        </>
      </div>
      {openStartUpModel && (
        <StartUpModal closeModal={closeModal} dataObject={'getWork'} buttonColor={'primary'} />
      )}
      {toastsEl}
    </Body>
  );
}

export default observer(BodyComponent);
