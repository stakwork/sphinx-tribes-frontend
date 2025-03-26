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
import { paginationQueryLimit } from 'store/interface';
import styled from 'styled-components';
import { LoadMoreContainer } from '../../../people/widgetViews/WidgetSwitchViewer';
import { colors } from '../../../config/colors';
import PopoverCheckbox from './popoverCheckboxStyles';

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

interface FilterHeaderProps {
  checkboxIdToSelectedMap: Record<string, boolean>;
  applyFilters: (id: string) => void;
  canEdit: boolean;
  Status: string[];
}

const FilterHeader: React.FC<FilterHeaderProps> = ({
  checkboxIdToSelectedMap,
  applyFilters,
  canEdit,
  Status
}: FilterHeaderProps): JSX.Element => (
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
    <PopoverCheckbox className="CheckboxOuter" color={colors['light']}>
      <EuiCheckboxGroup
        style={{ display: 'flex', alignItems: 'center', gap: 20, marginRight: 50 }}
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
    </PopoverCheckbox>
  </div>
);

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
    Paid: false,
    Pending: false,
    Failed: false
  };

  const [checkboxIdToSelectedMap, setCheckboxIdToSelectedMap] = useState(defaultStatus);

  const Status = Object.keys(defaultStatus);

  const applyFilters = (id: string) => {
    setCheckboxIdToSelectedMap({ ...defaultStatus, [id]: !checkboxIdToSelectedMap[id] });
  };

  const isOwner = ui.meInfo?.owner_pubkey === person?.owner_pubkey;

  const getUserTickets = useCallback(async () => {
    setIsLoading(true);
    const response = await main.getPersonCreatedBounties(
      { page: 1, limit: paginationQueryLimit, ...checkboxIdToSelectedMap },
      uuid
    );

    const filteredBounties = response.filter((bounty: any) => {
      if (isOwner) return true;
      return bounty.body.show !== false;
    });

    setDisplayedBounties(filteredBounties);
    setIsLoading(false);
  }, [main, uuid, checkboxIdToSelectedMap, isOwner]);

  const nextBounties = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    const response = await main.getPersonCreatedBounties(
      { page: nextPage, limit: paginationQueryLimit, ...checkboxIdToSelectedMap },
      uuid
    );

    const filteredBounties = response.filter((bounty: any) => {
      if (isOwner) return true;
      return bounty.body.show !== false;
    });

    if (filteredBounties.length < paginationQueryLimit) {
      setHasMoreBounties(false);
    }
    setDisplayedBounties((prevBounties: BountyType[]) => [...prevBounties, ...filteredBounties]);
  };

  useEffect(() => {
    getUserTickets();
  }, [main, checkboxIdToSelectedMap, getUserTickets]);

  const renderBounties = () => (
    <>
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
    </>
  );

  return (
    <Container>
      <FilterHeader
        checkboxIdToSelectedMap={checkboxIdToSelectedMap}
        applyFilters={applyFilters}
        canEdit={canEdit}
        Status={Status}
      />
      {loading && <PageLoadSpinner show={loading} />}
      {!loading && displayedBounties.length === 0 ? (
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
      ) : (
        renderBounties()
      )}
    </Container>
  );
});
