import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import styled from 'styled-components';
import { EuiGlobalToastList, EuiLoadingSpinner } from '@elastic/eui';
import PeopleHeader from 'people/widgetViews/PeopleHeader';
import type { Person } from 'store/main';
import usePeopleFilters from 'hooks/usePeopleFilters';
import { SearchTextInput } from '../../components/common';
import { colors } from '../../config/colors';
import { useIsMobile, usePageScroll, useScreenWidth } from '../../hooks';
import { useStores } from '../../store';
import PersonCard from '../../pages/people/Person';
import NoResults from '../utils/NoResults';
import PageLoadSpinner from '../utils/PageLoadSpinner';
import StartUpModal from '../utils/StartUpModal';

const color = colors['light'];
const Body = styled.div<{ isMobile: boolean }>`
  flex: 1;
  height: ${(p: any) => (p.isMobile ? 'calc(100% - 105px)' : 'calc(100% - 65px)')};
  background: ${(p: any) => (p.isMobile ? undefined : color.grayish.G950)};
  width: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;
  & > .header {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 10px 0;
  }
  & > .content {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    height: 100%;
    justify-content: center;
    align-items: flex-start;
    margin-left: 20px;
    margin-right: 20px;
    padding-right: 13px;
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
  const { codingLanguageFilter, handleCodingLanguageFilterChange, languagesQueryParam } =
    usePeopleFilters();
  const closeModal = () => setOpenStartUpModel(false);
  const { peoplePageNumber } = ui;
  const history = useHistory();
  const isMobile = useIsMobile();
  async function loadMore(direction: number) {
    let currentPage = 1;
    currentPage = peoplePageNumber;

    let newPage = currentPage + direction;
    if (newPage < 1) newPage = 1;
    try {
      await main.getPeople({ page: newPage });
    } catch (e: any) {
      console.log('load failed', e);
    }
  }
  const loadForwardFunc = () => loadMore(1);
  const loadBackwardFunc = () => loadMore(-1);
  const { loadingBottom, handleScroll } = usePageScroll(loadForwardFunc, loadBackwardFunc);

  const toastsEl = (
    <EuiGlobalToastList
      toasts={ui.toasts}
      dismissToast={() => ui.setToasts([])}
      toastLifeTimeMs={3000}
    />
  );

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    async function initialPeopleFetch() {
      setIsLoading(true);
      await main.getPeople({ page: 1, resetPage: true, languages: languagesQueryParam });
      setIsLoading(false);
    }

    initialPeopleFetch();
  }, []);

  useEffect(() => {
    if (ui.meInfo) {
      main.getTribesByOwner(ui.meInfo.owner_pubkey || '');
    }
  }, [main, ui.meInfo]);

  function selectPerson(id: number, unique_name: string, pubkey: string) {
    ui.setSelectedPerson(id);
    ui.setSelectingPerson(id);

    history.push(`/p/${pubkey}`);
  }

  return (
    <Body
      data-testid="content"
      isMobile={isMobile}
      onScroll={(e: any) => {
        handleScroll(e);
      }}
    >
      <div className="header">
        <PeopleHeader
          onChangeLanguage={handleCodingLanguageFilterChange}
          checkboxIdToSelectedMapLanguage={codingLanguageFilter}
        />

        <SearchTextInput
          small
          name="search"
          type="search"
          placeholder="Search"
          style={{
            width: isMobile ? '95vw' : 240,
            height: 40,
            border: `1px solid ${color.grayish.G600}`,
            background: color.grayish.G600
          }}
          onChange={async (searchText: string) => {
            ui.setSearchText(searchText);

            setIsLoading(true);
            await main.getPeople({ page: 1, resetPage: true, languages: languagesQueryParam });
            setIsLoading(false);
          }}
        />
      </div>
      <div className="content">
        {isLoading ? (
          <EuiLoadingSpinner className="loader" size="xl" />
        ) : (
          main.people.map((p: Person) => (
            <PersonCard
              {...p}
              key={p.id}
              small={isMobile}
              squeeze={screenWidth < 1420}
              selected={ui.selectedPerson === p.id}
              select={selectPerson}
            />
          ))
        )}

        {!main.people.length && <NoResults />}
        <PageLoadSpinner noAnimate show={loadingBottom} />
      </div>
      {openStartUpModel && (
        <StartUpModal closeModal={closeModal} dataObject={'getWork'} buttonColor={'primary'} />
      )}
      {toastsEl}
    </Body>
  );
}

export default observer(BodyComponent);
