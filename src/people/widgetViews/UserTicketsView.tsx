import React, { useEffect, useState } from 'react';
import { Route, Switch, useParams, useRouteMatch, Router } from 'react-router-dom';
import { useStores } from 'store';
import NoResults from 'people/utils/UserNoResults';
import { useIsMobile, usePerson } from 'hooks';
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

const UserTickets = () => {
  const color = colors['light'];
  const { uuid } = useParams<{ uuid: string }>();
  const { main, ui } = useStores();
  const isMobile = useIsMobile();
  const { path, url } = useRouteMatch();

  const { person } = usePerson(ui.selectedPerson);

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

  const getUserTickets = async () => {
    setIsLoading(true);
    const response = await main.getPersonAssignedBounties(
      { page: page, limit: paginationLimit },
      uuid
    );
    if (response.length < paginationLimit) {
      setHasMoreBounties(false);
    }
    setDisplayedBounties((prevBounties: BountyType[]) => [...prevBounties, ...response]);
    setIsLoading(false);
  };

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
    setDisplayedBounties((prevBounties: BountyType[]) => [...prevBounties, ...response]);
  };

  useEffect(() => {
    getUserTickets();
  }, [main]);

  const listItems =
    displayedBounties && displayedBounties.length ? (
      displayedBounties.map((item: any, i: number) => {
        const person = main.people.find((p: any) => p.owner_pubkey === item.body.owner_id);
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
