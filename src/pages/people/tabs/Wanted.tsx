import { usePerson } from 'hooks';
import { observer } from 'mobx-react-lite';
import { BountyModal } from 'people/main/bountyModal';
import { widgetConfigs } from 'people/utils/Constants';
import NoneSpace from 'people/utils/NoneSpace';
import { PostBounty } from 'people/widgetViews/postBounty';
import WantedView from 'people/widgetViews/WantedView';
import PageLoadSpinner from 'people/utils/PageLoadSpinner';
import React, { useEffect, useState } from 'react';
import { Route, Switch, useHistory, useRouteMatch, useParams } from 'react-router-dom';
import { useStores } from 'store';
import { paginationQueryLimit } from 'store/main';
import styled from 'styled-components';
import { LoadMoreContainer } from '../../../people/widgetViews/WidgetSwitchViewer';
import { colors } from '../../../config/colors';
const config = widgetConfigs.bounties;
type BountyType = any;
const Container = styled.div`
  display: flex;
  flex-flow: row wrap;
  gap: 1rem;
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

export const Wanted = observer(() => {
  const { ui, main } = useStores();
  const { person, canEdit } = usePerson(ui.selectedPerson);
  const { path, url } = useRouteMatch();
  const history = useHistory();
  const { uuid } = useParams<{ uuid: string }>();
  const [displayedBounties, setDisplayedBounties] = useState<BountyType[]>([]);
  const [loading, setIsLoading] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [hasMoreBounties, setHasMoreBounties] = useState(true);

  // Function to fetch user tickets with pagination
  const getUserTickets = async () => {
    setIsLoading(true);

    // Fetch bounties for the specified page and limit
    const response = await main.getPersonCreatedBounties(
      { page: page, limit: paginationQueryLimit },
      uuid
    );

    // Check if the response has fewer bounties than the limit, indicating no more bounties to load
    if (response.length < paginationQueryLimit) {
      setHasMoreBounties(false);
    }
    // Update the displayed bounties by appending the new bounties
    setDisplayedBounties((prevBounties: BountyType[]) => [...prevBounties, ...response]);
    setIsLoading(false);
  };

  const nextBounties = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    // Fetch bounties for the next page
    const response = await main.getPersonCreatedBounties(
      { page: nextPage, limit: paginationQueryLimit },
      uuid
    );
    // Check if the response has fewer bounties than the limit, indicating no more bounties to load
    if (response.length < paginationQueryLimit) {
      setHasMoreBounties(false);
    }
    // Update the displayed bounties by appending the new bounties
    setDisplayedBounties((prevBounties: BountyType[]) => [...prevBounties, ...response]);
  };

  useEffect(() => {
    getUserTickets();
  }, [main]);

  if (!main.createdBounties?.length) {
    return (
      <NoneSpace
        style={{
          margin: 'auto'
        }}
        small
        Button={
          canEdit && (
            <PostBounty
              title={config.noneSpace.me.buttonText}
              buttonProps={{
                leadingIcon: config.noneSpace.me.buttonIcon,
                color: 'secondary'
              }}
              widget={'wanted'}
              onSucces={() => {
                window.location.reload();
              }}
            />
          )
        }
        {...(canEdit ? config.noneSpace.me : config.noneSpace.otherUser)}
      />
    );
  }
  return (
    <Container>
      <PageLoadSpinner show={loading} />
      <Switch>
        <Route path={`${path}/:wantedId/:wantedIndex`}>
          <BountyModal basePath={url} />
        </Route>
      </Switch>
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-end',
          paddingBottom: '16px'
        }}
      >
        {canEdit && <PostBounty widget="wanted" />}
      </div>
      {displayedBounties
        .filter((w: BountyType) => w.body.owner_id === person?.owner_pubkey)
        .map((w: BountyType, i: any) => (
          <Panel
            href={`${url}/${w.body.id}/${i}`}
            key={w.body.id}
            isMobile={false}
            onClick={(e: any) => {
              e.preventDefault();
              ui.setBountyPerson(person?.id);
              history.push({
                pathname: `${url}/${w.body.id}/${i}`
              });
            }}
          >
            <WantedView {...w.body} person={person} />
          </Panel>
        ))}
      {hasMoreBounties && !loading && (
        <LoadMoreContainer
          color={colors['light']}
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
    </Container>
  );
});
