import React, { useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react-lite';
import { useIsMobile } from 'hooks/uiHooks';
import { queryLimit, phaseBountyLimit } from 'store/interface';
import { Spacer } from '../main/Body';
import NoResults from '../utils/NoResults';
import { uiStore } from '../../store/ui';
import { colors } from '../../config/colors';
import { useStores } from '../../store';
import { widgetConfigs } from '../utils/Constants';
import { bountyStore, FeaturedBounty } from '../../store/bountyStore';
import OfferView from './OfferView';
import WantedView from './WantedView';
import PostView from './PostView';
import DeleteTicketModal from './DeleteModal';

interface PanelProps {
  isMobile?: boolean;
  color?: any;
  isAssignee?: boolean;
}

const Panel = styled.a<PanelProps>`
  margin-top: 5px;
  background: ${(p: any) => p.color && p.color.pureWhite};
  color: ${(p: any) => p.color && p.color.pureBlack};
  padding: 20px;
  border-bottom: ${(p: any) => (p.isMobile ? `2px solid ${p.color.grayish.G700}` : 'none')};
  :hover {
    box-shadow: ${(p: any) =>
      p.isAssignee ? `0px 1px 6px ${p.color.black100}` : 'none'} !important;
    text-decoration: none !important;
  }
  :active {
    box-shadow: none !important;
  }
`;

export const LoadMoreContainer = styled.div<PanelProps>`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  .LoadMoreButton {
    width: 166px;
    height: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${(p: any) => p.color && p.color.grayish.G10};
    border: 1px solid ${(p: any) => p.color && p.color.grayish.G600};
    border-radius: 30px;
    background: ${(p: any) => p.color && p.color.pureWhite};
    font-family: 'Barlow';
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 17px;
    cursor: pointer;
    user-select: none;
    :hover {
      border: 1px solid ${(p: any) => p.color && p.color.grayish.G300};
    }
    :active {
      border: 1px solid ${(p: any) => p.color && p.color.grayish.G100};
    }
  }
`;

function WidgetSwitchViewer(props: any) {
  const color = colors['light'];
  const { main } = useStores();
  const isMobile = useIsMobile();
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deletePayload, setDeletePayload] = useState<object>({});
  const closeModal = () => setShowDeleteModal(false);
  const showModal = () => setShowDeleteModal(true);

  const {
    currentItems,
    setCurrentItems,
    totalBounties,
    WorkspaceTotalBounties,
    page: propsPage,
    setPage,
    languageString,
    isBountyLandingPage,
    activeWorkspace,
    uuid,
    orgQueryLimit,
    phaseTotalBounties,
    featureUuid,
    phaseUuid
  } = props;

  const items = currentItems ?? 0;
  const bountiesTotal = totalBounties ?? 0;
  const WorkspaceBountiesTotal = WorkspaceTotalBounties ?? 0;
  const phaseBountiesTotal = phaseTotalBounties ?? 0;
  const page = propsPage ?? 0;

  const panelStyles = isMobile
    ? {
        minHeight: 132
      }
    : {
        minWidth: isBountyLandingPage ? '900px' : '1100px',
        maxWidth: isBountyLandingPage ? '900px' : '1100px',
        marginBottom: 16,
        borderRadius: '10px',
        display: 'flex',
        justifyContent: 'center'
      };

  const { peoplePosts, peopleBounties, peopleOffers } = main;
  const { selectedWidget, onPanelClick, org_uuid } = props;

  const featuredBountyIds = bountyStore
    .getFeaturedBounties()
    .map((b: FeaturedBounty) => b.bountyId);

  const sortBounties = (bounties: any[]) => {
    const featured: any[] = [];
    const regular: any[] = [];

    bounties.forEach((item: any) => {
      if (featuredBountyIds.includes(item.body.id.toString())) {
        featured.push(item);
      } else {
        regular.push(item);
      }
    });

    return [...featured, ...regular];
  };

  const listSource = {
    post: peoplePosts,
    bounties: selectedWidget === 'bounties' ? sortBounties(peopleBounties) : peopleBounties,
    offer: peopleOffers
  };

  const activeList = [...listSource[selectedWidget]].filter(({ body }: any) => {
    const value = { ...body };
    if (org_uuid) {
      return value.org_uuid === org_uuid;
    }
    return value;
  });

  const foundDynamicSchema = widgetConfigs[selectedWidget]?.schema?.find(
    (f: any) => f.dynamicSchemas
  );
  // if dynamic schema, get all those fields
  if (foundDynamicSchema) {
    const dynamicFields: any = [];
    foundDynamicSchema.dynamicSchemas?.forEach((ds: any) => {
      ds.forEach((f: any) => {
        if (!dynamicFields.includes(f.name)) dynamicFields.push(f.name);
      });
    });
  }

  const deleteTicket = async (payload: any) => {
    const info = uiStore.meInfo as any;
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

  const nextBounties = async () => {
    const currentPage = page + 1;
    if (setPage) {
      setPage(currentPage);
    }

    if (setCurrentItems) {
      setCurrentItems(currentItems + queryLimit);
    }
    await main.getPeopleBounties({
      limit: queryLimit,
      page: currentPage,
      ...props.checkboxIdToSelectedMap
    });
  };

  const nextWorkspaceBounties = async () => {
    const currentPage = page + 1;
    if (setPage) {
      setPage(currentPage);
    }

    if (setCurrentItems) {
      setCurrentItems(currentItems + queryLimit);
    }
    await main.getSpecificWorkspaceBounties(uuid, {
      limit: queryLimit,
      page: currentPage,
      ...props.checkboxIdToSelectedMap
    });
  };

  const nextPhaseBounties = async () => {
    const currentPage = page + 1;
    if (setPage) {
      setPage(currentPage);
    }

    if (setCurrentItems) {
      setCurrentItems(currentItems + phaseBountyLimit);
    }
    await main.getPhaseBounties(featureUuid, phaseUuid, {
      limit: phaseBountyLimit,
      page: currentPage,
      ...props.checkboxIdToSelectedMap
    });
  };

  const listItems =
    activeList && activeList.length ? (
      activeList.slice(0, currentItems).map((item: any, i: number) => {
        const { person, body, organization } = item;
        person.img = person.img || main.getUserAvatarPlaceholder(person.owner_pubkey);

        const isFeatured = featuredBountyIds.includes(body.id.toString());

        const conditionalStyles = body?.paid
          ? {
              border: isMobile ? `2px 0 0 0 solid ${color.grayish.G600}` : '',
              boxShadow: 'none'
            }
          : isFeatured
          ? {
              border: '',
              borderRadius: '12px'
            }
          : {};

        // if this person has entries for this widget
        return (
          <Panel
            color={color}
            isMobile={isMobile}
            key={person?.owner_pubkey + i + body?.created}
            isAssignee={!!body.assignee}
            style={{
              ...panelStyles,
              ...conditionalStyles,
              cursor: 'pointer',
              padding: isFeatured ? '2px' : 0,
              overflow: 'hidden',
              background: 'transparent',
              minHeight: !isMobile ? '160px' : '',
              maxHeight: 'auto',
              boxShadow: 'none'
            }}
          >
            {selectedWidget === 'post' ? (
              <PostView
                showName
                key={`${i + person.owner_pubkey}pview`}
                person={person}
                {...body}
              />
            ) : selectedWidget === 'offer' ? (
              <OfferView
                showName
                key={`${i + person.owner_pubkey}oview`}
                person={person}
                {...body}
              />
            ) : selectedWidget === 'bounties' ? (
              <WantedView
                showName
                onPanelClick={() => {
                  if (onPanelClick) onPanelClick(activeWorkspace, body);
                }}
                person={person}
                showModal={showModal}
                isBountyLandingPage={isBountyLandingPage}
                setDeletePayload={setDeletePayload}
                fromBountyPage={props.fromBountyPage}
                activeWorkspace={activeWorkspace}
                {...body}
                {...organization}
              />
            ) : null}
          </Panel>
        );
      })
    ) : (
      <NoResults loaded={!!languageString} />
    );

  const showLoadMore = bountiesTotal > items && activeList.length >= queryLimit;
  const WorkspaceLoadMore = WorkspaceBountiesTotal > items && activeList.length >= orgQueryLimit;
  const PhaseLoadMore = phaseBountiesTotal > items && activeList.length >= phaseBountyLimit;

  return (
    <>
      {listItems}
      <Spacer key={'spacer2'} />
      {showDeleteModal && (
        <DeleteTicketModal closeModal={closeModal} confirmDelete={confirmDelete} />
      )}
      {showLoadMore && (
        <LoadMoreContainer
          color={color}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div className="LoadMoreButton" onClick={() => nextBounties()}>
            Load More
          </div>
        </LoadMoreContainer>
      )}
      {uuid && WorkspaceLoadMore && (
        <LoadMoreContainer
          color={color}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div className="LoadMoreButton" onClick={() => nextWorkspaceBounties()}>
            Load More
          </div>
        </LoadMoreContainer>
      )}
      {featureUuid && phaseUuid && PhaseLoadMore && (
        <LoadMoreContainer
          color={color}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div className="LoadMoreButton" onClick={() => nextPhaseBounties()}>
            Load More
          </div>
        </LoadMoreContainer>
      )}
      <Spacer key={'spacer'} />
    </>
  );
}

export default observer(WidgetSwitchViewer);
