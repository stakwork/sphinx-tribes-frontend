import React, { memo, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react-lite';
import { useIsMobile } from 'hooks/uiHooks';
import { queryLimit } from 'store/interface';
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
  padding: ${(p) => (p.isMobile ? '0 0 50px 0' : '0')};
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

interface ViewerListItemProps {
  activeWorkspace: any;
  color: any;
  featuredBountyIdSet: Set<string>;
  fromBountyPage?: boolean;
  isBountyLandingPage?: boolean;
  isMobile: boolean;
  item: any;
  onPanelClick?: (activeWorkspace: any, body: any) => void;
  panelStyles: any;
  selectedWidget: string;
  setDeletePayload: (payload: object) => void;
  showModal: () => void;
  userAvatarPlaceholder: (ownerPubkey: string) => string;
}

const ViewerListItem = memo((props: ViewerListItemProps) => {
  const {
    activeWorkspace,
    color,
    featuredBountyIdSet,
    fromBountyPage,
    isBountyLandingPage,
    isMobile,
    item,
    onPanelClick,
    panelStyles,
    selectedWidget,
    setDeletePayload,
    showModal,
    userAvatarPlaceholder
  } = props;
  const { person, body, organization } = item;
  const displayPerson = {
    ...person,
    img: person.img || userAvatarPlaceholder(person.owner_pubkey)
  };
  const isFeatured = featuredBountyIdSet.has(body.id.toString());

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

  return (
    <Panel
      color={color}
      isMobile={isMobile}
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
        <PostView showName person={displayPerson} {...body} />
      ) : selectedWidget === 'offer' ? (
        <OfferView showName person={displayPerson} {...body} />
      ) : selectedWidget === 'bounties' ? (
        <WantedView
          showName
          onPanelClick={() => {
            if (onPanelClick) onPanelClick(activeWorkspace, body);
          }}
          person={displayPerson}
          showModal={showModal}
          isBountyLandingPage={isBountyLandingPage}
          setDeletePayload={setDeletePayload}
          fromBountyPage={fromBountyPage}
          activeWorkspace={activeWorkspace}
          {...body}
          {...organization}
        />
      ) : null}
    </Panel>
  );
});

ViewerListItem.displayName = 'ViewerListItem';

function WidgetSwitchViewer(props: any) {
  const color = colors['light'];
  const { main, ui } = useStores();
  const isMobile = useIsMobile();
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deletePayload, setDeletePayload] = useState<object>({});
  const closeModal = useCallback(() => setShowDeleteModal(false), []);
  const showModal = useCallback(() => setShowDeleteModal(true), []);

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
    featureUuid,
    phaseUuid,
    orgQueryLimit
  } = props;

  const items = currentItems ?? 0;
  const bountiesTotal = totalBounties ?? 0;
  const WorkspaceBountiesTotal = WorkspaceTotalBounties ?? 0;
  const page = propsPage ?? 0;

  const panelStyles = useMemo(
    () =>
      isMobile
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
          },
    [isBountyLandingPage, isMobile]
  );

  const { peoplePosts, peopleBounties, phaseBounties, peopleOffers } = main;
  const { selectedWidget, onPanelClick, org_uuid } = props;

  const featuredBounties = bountyStore.getFeaturedBounties();
  const featuredBountyIdSet = useMemo(
    () => new Set(featuredBounties.map((b: FeaturedBounty) => b.bountyId)),
    [featuredBounties]
  );

  const sortBounties = useMemo(
    () => (bounties: any[]) => {
      const featured: any[] = [];
      const regular: any[] = [];

      bounties.forEach((item: any) => {
        if (featuredBountyIdSet.has(item.body.id.toString())) {
          featured.push(item);
        } else {
          regular.push(item);
        }
      });

      return [...featured, ...regular];
    },
    [featuredBountyIdSet]
  );

  const listSource = useMemo(
    () => ({
      post: peoplePosts,
      bounties: selectedWidget === 'bounties' ? sortBounties(peopleBounties) : peopleBounties,
      offer: peopleOffers
    }),
    [peopleBounties, peopleOffers, peoplePosts, selectedWidget, sortBounties]
  );

  const phaseListSource = useMemo(
    () => ({
      post: peoplePosts,
      bounties: selectedWidget === 'bounties' ? sortBounties(phaseBounties) : phaseBounties,
      offer: peopleOffers
    }),
    [peopleOffers, peoplePosts, phaseBounties, selectedWidget, sortBounties]
  );

  const activeList = useMemo(
    () =>
      [...listSource[selectedWidget]].filter(({ body, person }: any) => {
        const value = body;

        const isOwner = ui.meInfo?.owner_pubkey === person?.owner_pubkey;
        const isAssignee = value.assignee?.owner_pubkey === ui.meInfo?.owner_pubkey;

        if (!value.show && !isOwner && !isAssignee) {
          return false;
        }

        if (org_uuid) {
          return value.org_uuid === org_uuid;
        }
        return true;
      }),
    [listSource, org_uuid, selectedWidget, ui.meInfo?.owner_pubkey]
  );

  const activePhaseList = useMemo(
    () =>
      [...phaseListSource[selectedWidget]].filter(({ body, person }: any) => {
        const value = body;
        const isOwner = ui.meInfo?.owner_pubkey === person?.owner_pubkey;
        const isAssignee = value.assignee?.owner_pubkey === ui.meInfo?.owner_pubkey;

        if (!value.show && !isOwner && !isAssignee) {
          return false;
        }

        if (org_uuid) {
          return value.org_uuid === org_uuid;
        }
        return true;
      }),
    [org_uuid, phaseListSource, selectedWidget, ui.meInfo?.owner_pubkey]
  );

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

  const listItems =
    activeList && activeList.length ? (
      activeList
        .slice(0, currentItems)
        .map((item: any, i: number) => (
          <ViewerListItem
            activeWorkspace={activeWorkspace}
            color={color}
            featuredBountyIdSet={featuredBountyIdSet}
            fromBountyPage={props.fromBountyPage}
            isBountyLandingPage={isBountyLandingPage}
            isMobile={isMobile}
            item={item}
            key={`${item.person?.owner_pubkey}-${item.body?.id || item.body?.created}-${i}`}
            onPanelClick={onPanelClick}
            panelStyles={panelStyles}
            selectedWidget={selectedWidget}
            setDeletePayload={setDeletePayload}
            showModal={showModal}
            userAvatarPlaceholder={main.getUserAvatarPlaceholder}
          />
        ))
    ) : (
      <NoResults loaded={!!languageString} />
    );

  const phaseListItems =
    activePhaseList && activePhaseList.length ? (
      activePhaseList
        .slice(0, currentItems)
        .map((item: any, i: number) => (
          <ViewerListItem
            activeWorkspace={activeWorkspace}
            color={color}
            featuredBountyIdSet={featuredBountyIdSet}
            fromBountyPage={props.fromBountyPage}
            isBountyLandingPage={isBountyLandingPage}
            isMobile={isMobile}
            item={item}
            key={`${item.person?.owner_pubkey}-${item.body?.id || item.body?.created}-${i}`}
            onPanelClick={onPanelClick}
            panelStyles={panelStyles}
            selectedWidget={selectedWidget}
            setDeletePayload={setDeletePayload}
            showModal={showModal}
            userAvatarPlaceholder={main.getUserAvatarPlaceholder}
          />
        ))
    ) : (
      <NoResults loaded={!!languageString} />
    );

  const showLoadMore = bountiesTotal > items && activeList.length >= queryLimit;
  const WorkspaceLoadMore = WorkspaceBountiesTotal > items && activeList.length >= orgQueryLimit;

  return (
    <>
      {featureUuid && phaseUuid ? phaseListItems : listItems}
      <Spacer key={'spacer2'} />
      {showDeleteModal && (
        <DeleteTicketModal closeModal={closeModal} confirmDelete={confirmDelete} />
      )}
      {showLoadMore && (
        <LoadMoreContainer
          color={color}
          isMobile={isMobile}
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
          isMobile={isMobile}
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
      <Spacer key={'spacer'} />
    </>
  );
}

export default observer(WidgetSwitchViewer);
