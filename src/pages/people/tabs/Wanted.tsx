import { usePerson } from 'hooks';
import { observer } from 'mobx-react-lite';
import { EuiCheckboxGroup } from '@elastic/eui';
import { BountyModal } from 'people/main/bountyModal';
import { widgetConfigs } from 'people/utils/Constants';
import NoneSpace from 'people/utils/NoneSpace';
import { PostBounty } from 'people/widgetViews/postBounty';
import WantedView from 'people/widgetViews/WantedView';
import PageLoadSpinner from 'people/utils/PageLoadSpinner';
import React, { useCallback, useEffect, useState } from 'react';
import { Route, Switch, useHistory, useRouteMatch, useParams } from 'react-router-dom';
import { useStores } from 'store';
import { paginationQueryLimit } from 'store/main';
import styled from 'styled-components';
import { LoadMoreContainer } from '../../../people/widgetViews/WidgetSwitchViewer';
import { colors } from '../../../config/colors';
import checkboxImage from './Icons/checkboxImage.svg';

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

const EuiPopOverCheckbox = styled.div<{ color?: any }>`
  margin-right: 3px;
  overflow-y: scroll;
  &.CheckboxOuter > div {
    height: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
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
        background-image: url(${checkboxImage});
      }
      .euiCheckbox__label {
        font-family: 'Barlow';
        font-style: normal;
        font-weight: 500;
        font-size: 13px;
        line-height: 16px;
        color: ${(p: any) => p?.color && p?.color?.grayish.G50};
      }
      input.euiCheckbox__input:checked ~ label {
        color: black;
        font-weight: 600;
      }
    }
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

  const defaultStatus: Record<string, boolean> = {
    Open: false,
    Assigned: false,
    Paid: false
  };

  const [checkboxIdToSelectedMap, setCheckboxIdToSelectedMap] = useState(defaultStatus);

  const Status = Object.keys(defaultStatus);

  const applyFilters = (id: string) => {
    setCheckboxIdToSelectedMap({ ...defaultStatus, [id]: !checkboxIdToSelectedMap[id] });
  };

  // Function to fetch user tickets with pagination
  const getUserTickets = useCallback(async () => {
    setIsLoading(true);

    // Fetch bounties for the specified page and limit
    const response = await main.getPersonCreatedBounties(
      { page: page, limit: paginationQueryLimit, sortBy: 'created', ...checkboxIdToSelectedMap },
      uuid
    );

    // Check if the response has fewer bounties than the limit, indicating no more bounties to load
    if (response.length < paginationQueryLimit) {
      setHasMoreBounties(false);
    }
    // Update the displayed bounties by appending the new bounties
    setDisplayedBounties(response);
    setIsLoading(false);
  }, [checkboxIdToSelectedMap, main, page, uuid]);

  const nextBounties = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    // Fetch bounties for the next page
    const response = await main.getPersonCreatedBounties(
      { page: nextPage, limit: paginationQueryLimit, ...checkboxIdToSelectedMap },
      uuid
    );
    // Check if the response has fewer bounties than the limit, indicating no more bounties to load
    if (response.length < paginationQueryLimit) {
      setHasMoreBounties(false);
    }
    // Update the displayed bounties by appending the new bounties
    setDisplayedBounties(response);
  };

  useEffect(() => {
    getUserTickets();
  }, [main, checkboxIdToSelectedMap, getUserTickets]);

  if (!main.createdBounties?.length && !loading) {
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
              widget={'bounties'}
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
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          paddingBottom: '16px',
          alignItems: 'center'
        }}
      >
        <h4>Bounties </h4>
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
          {canEdit && <PostBounty widget="bounties" />}
        </EuiPopOverCheckbox>
      </div>
      {loading && <PageLoadSpinner show={loading} />}
      <Switch>
        <Route path={`${path}/:wantedId/:wantedIndex`}>
          <BountyModal basePath={url} />
        </Route>
      </Switch>
      {displayedBounties
        .filter((w: BountyType) => w.body.owner_id === person?.owner_pubkey)
        .map((w: BountyType, i: any) => (
          <Panel
            href={`${url}/${w.body.id}/${i}`}
            key={w.body.id}
            data-testid={'user-created-bounty'}
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
