import React, { useCallback, useEffect, useState } from 'react';
import { Route, Switch, useParams, useRouteMatch, Router } from 'react-router-dom';
import { useStores } from 'store';
import { EuiCheckboxGroup } from '@elastic/eui';
import NoResults from 'people/utils/UserNoResults';
import { useIsMobile } from 'hooks';
import { Spacer } from 'people/main/Body';
import styled from 'styled-components';
import { BountyModal } from 'people/main/bountyModal/BountyModal';
import PageLoadSpinner from 'people/utils/PageLoadSpinner';
import { Person } from 'store/main';
import history from '../../config/history';
import { colors } from '../../config/colors';
import WantedView from './WantedView';
import DeleteTicketModal from './DeleteModal';
import { LoadMoreContainer } from './WidgetSwitchViewer';
import checkboxImage from './Icons/checkboxImage.svg';

type BountyType = any;

const Container = styled.div`
  display: flex;
  flex-flow: row wrap;
  gap: 1rem;
  align-items: center;
  flex: 1 1 100%;
`;

interface PanelProps {
  isMobile: boolean;
}
const Panel = styled.a<PanelProps>`
  position: relative;
  overflow: hidden;
  cursor: pointer;
  max-width: 300px;
  flex: 1 1 auto;
  background: #ffffff;
  color: #000000;
  padding: 20px;
  box-shadow: ${(p: any) => (p.isMobile ? 'none' : '0px 0px 6px rgb(0 0 0 / 7%)')};
  border-bottom: ${(p: any) => (p.isMobile ? '2px solid #EBEDEF' : 'none')};
  &:hover {
    text-decoration: none !important;
  }
`;

const EuiPopOverCheckbox = styled.div<{ color?: any }>`
  overflow-y: scroll;
  display: flex;
  align-items: center;
  &.CheckboxOuter > div {
    height: 100%;
    display: flex;
    .euiCheckboxGroup__item {
      margin-top: 0px;
      display: flex;
      align-items: center;
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
        background-image: url(${checkboxImage});
      }
      .euiCheckbox__label {
        font-family: 'Barlow';
        font-style: normal;
        font-weight: 500;
        font-size: 13px;
        line-height: 16px;
        color: ${(p: any) => p?.color && p?.color?.grayish.G50};
        margin-top: 4px;
      }
      input.euiCheckbox__input:checked ~ label {
        color: black;
        font-weight: 600;
      }
    }
  }
`;

const UserTickets = () => {
  const color = colors['light'];
  const { uuid } = useParams<{ uuid: string }>();
  const { main, ui } = useStores();
  const isMobile = useIsMobile();
  const { path, url } = useRouteMatch();

  const [deletePayload, setDeletePayload] = useState<object>({});
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const closeModal = () => setShowDeleteModal(false);
  const showModal = () => setShowDeleteModal(true);
  const [displayedBounties, setDisplayedBounties] = useState<BountyType[]>([]);
  const [loading, setIsLoading] = useState<boolean>(true);
  const [hasMoreBounties, setHasMoreBounties] = useState(true);
  const [bountyOwner, setBountyOwner] = useState<Person>();
  const [page, setPage] = useState(1);
  const paginationLimit = 20;

  const defaultStatus: Record<string, boolean> = {
    Assigned: false,
    Open: false
  };

  const [checkboxIdToSelectedMap, setCheckboxIdToSelectedMap] = useState(defaultStatus);

  const Status = Object.keys(defaultStatus);

  const applyFilters = (id: string) => {
    setCheckboxIdToSelectedMap({ ...defaultStatus, [id]: !checkboxIdToSelectedMap[id] });
  };

  function onPanelClick(id: number, index: number) {
    history.push({
      pathname: `${url}/${id}/${index}`
    });
  }

  const deleteTicket = async (payload: any) => {
    const info = ui.meInfo as any;
    const URL = info.url.startsWith('http') ? info.url : `https://${info.url}`;
    try {
      await fetch(`${URL}/delete_ticket`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'x-jwt': info.jwt,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  const confirmDelete = async () => {
    try {
      if (deletePayload) {
        await deleteTicket(deletePayload);
      }
    } catch (error) {
      console.log(error);
    }
    closeModal();
  };

  const getUserTickets = useCallback(async () => {
    setIsLoading(true);
    const response = await main.getPersonAssignedBounties(
      { page: page, limit: paginationLimit, ...checkboxIdToSelectedMap },
      uuid
    );
    if (response.length < paginationLimit) {
      setHasMoreBounties(false);
    }
    setDisplayedBounties(response);
    setIsLoading(false);
  }, [main, page, uuid, checkboxIdToSelectedMap]);

  const nextBounties = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    const response = await main.getPersonAssignedBounties(
      { page: nextPage, limit: paginationLimit },
      uuid
    );
    if (response.length < paginationLimit) {
      setHasMoreBounties(false);
    }
    setDisplayedBounties(response);
  };

  useEffect(() => {
    getUserTickets();
  }, [main, getUserTickets, checkboxIdToSelectedMap]);

  const listItems =
    displayedBounties && displayedBounties.length ? (
      displayedBounties.map((item: any, i: number) => {
        const { person } = item;
        const body = { ...item.body };
        return (
          <Panel
            href={`${url}/${body.id}/${i}`}
            isMobile={isMobile}
            key={i + body?.created}
            data-testid={'user-personal-bounty-card'}
          >
            <WantedView
              colors={color}
              showName
              onPanelClick={(e: any) => {
                e.preventDefault();
                onPanelClick(body.id, i);
                ui.setBountyPerson(person?.id);
                setBountyOwner(person);
              }}
              person={person}
              showModal={showModal}
              setDeletePayload={setDeletePayload}
              fromBountyPage={false}
              {...body}
              show={true}
            />
          </Panel>
        );
      })
    ) : (
      <NoResults />
    );

  return (
    <Container data-testid="test">
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          paddingBottom: '16px',
          alignItems: 'center'
        }}
      >
        <h4>Assigned Bounties</h4>
        <div style={{ display: 'flex' }}>
          <EuiPopOverCheckbox className="CheckboxOuter" color={colors['light']}>
            <EuiCheckboxGroup
              style={{ display: 'flex', alignItems: 'center', gap: 20, marginRight: 20 }}
              options={Status.map((status: string) => ({
                label: status,
                id: status
              }))}
              idToSelectedMap={checkboxIdToSelectedMap}
              onChange={(optionId: any) => {
                applyFilters(optionId);
              }}
            />
          </EuiPopOverCheckbox>
        </div>
      </div>
      {loading && <PageLoadSpinner show={loading} />}
      <Router history={history}>
        <Switch>
          <Route path={`${path}/:wantedId/:wantedIndex`}>
            <BountyModal fromPage={'usertickets'} bountyOwner={bountyOwner} basePath={url} />
          </Route>
        </Switch>
      </Router>
      {!loading ? listItems : ''}
      {hasMoreBounties && !loading && (
        <LoadMoreContainer
          color={color}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '20px 0'
          }}
        >
          <div className="LoadMoreButton" onClick={nextBounties}>
            Load More
          </div>
        </LoadMoreContainer>
      )}
      <Spacer key={'spacer2'} />
      {showDeleteModal && (
        <DeleteTicketModal closeModal={closeModal} confirmDelete={confirmDelete} />
      )}
    </Container>
  );
};

export default UserTickets;
