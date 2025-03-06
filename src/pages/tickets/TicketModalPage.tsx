import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { Modal } from 'components/common';
import { EuiGlobalToastList } from '@elastic/eui';
import { colors } from 'config';
import { useIsMobile } from 'hooks';
import { observer } from 'mobx-react-lite';
import FocusedView from '../../people/main/FocusView';
import { widgetConfigs } from '../../people/utils/Constants';
import { AlreadyDeleted } from '../../components/common/AfterDeleteNotification/AlreadyDeleted';
import { useStores } from '../../store';
import { PersonBounty } from '../../store/interface';
import { AccessDenied } from '../../components/common/AccessDenied';

const color = colors['light'];
const focusedDesktopModalStyles = widgetConfigs.bounties.modalStyle;

type Props = {
  setConnectPerson: (p: any) => void;
  visible?: boolean;
};

export const TicketModalPage = observer(({ setConnectPerson }: Props) => {
  const location = useLocation();
  const { main, modals, ui } = useStores();

  const history = useHistory();
  const [connectPersonBody, setConnectPersonBody] = useState<any>();
  // eslint-disable-next-line no-unused-vars
  const [publicFocusIndex, setPublicFocusIndex] = useState(0);
  const [removeNextAndPrev, setRemoveNextAndPrev] = useState(false);
  const { bountyId } = useParams<{ bountyId: string }>();
  const [activeBounty, setActiveBounty] = useState<PersonBounty[]>([]);
  const [visible, setVisible] = useState(false);
  const [isDeleted, setisDeleted] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  const [toasts, setToasts]: any = useState([]);

  function addToast(title: string, color: 'primary' | 'success') {
    setToasts([
      {
        id: `${Math.random()}`,
        title,
        color
      }
    ]);
  }

  function removeToast() {
    setToasts([]);
  }
  let orgUuid = '';
  if (location.state) {
    const locationState: any = location.state;
    orgUuid = locationState?.activeWorkspace;
    main.setActiveWorkspace(orgUuid);
  }

  const isMobile = useIsMobile();

  const search = useMemo(() => {
    const s = new URLSearchParams(location.search);
    return {
      owner_id: s.get('owner_id'),
      created: s.get('created')
    };
  }, [location.search]);

  const { activeWorkspace } = main;

  const getBounty = useCallback(async () => {
    let bounty;
    let bountyIndex = 0;

    if (bountyId) {
      bounty = await main.getBountyById(Number(bountyId));
      bountyIndex = await main.getBountyIndexById(Number(bountyId));
    } else if (search && search.created) {
      bounty = await main.getBountyByCreated(Number(search.created));
      bountyIndex = await main.getBountyIndexById(Number(search.created));
    }

    if (bounty && bounty.length > 0 && bounty[0].body.access_restriction === 'workspace') {
      const workspaceUser = await main.getWorkspaceUser(bounty[0].body.workspace_uuid);
      const isWorkspaceAdmin = bounty[0].organization?.owner_pubkey === ui.meInfo?.owner_pubkey;
      const isWorkspaceMember = workspaceUser?.owner_pubkey === ui.meInfo?.owner_pubkey;

      if (!workspaceUser || (!isWorkspaceAdmin && !isWorkspaceMember)) {
        setAccessDenied(true);
        setVisible(false);
        return;
      }
    }

    const connectPerson = bounty && bounty.length ? bounty[0].person : [];

    setPublicFocusIndex(bountyIndex);
    setConnectPersonBody(connectPerson);

    const visible = bounty && bounty.length > 0;
    const isDeleted = bounty && bounty.length === 0;
    setisDeleted(isDeleted);
    setActiveBounty(bounty);
    setAccessDenied(false);
    setVisible(visible);
  }, [bountyId, main, search, ui.meInfo]);

  useEffect(() => {
    getBounty();
  }, [getBounty, removeNextAndPrev]);

  const isDirectAccess = useCallback(() => !document.referrer, [location.pathname]);

  const goBack = () => {
    setVisible(false);
    setisDeleted(false);

    if (isDirectAccess() && !activeWorkspace) {
      history.push('/bounties');
    } else {
      history.goBack();
    }

    // set the active org to an empty string before closing
    main.setActiveWorkspace('');
  };

  const prevArrHandler = async () => {
    const { created } = activeBounty[0].body;
    if (activeWorkspace) {
      try {
        const bountyId = await main.getWorkspaceNextBountyByCreated(activeWorkspace, created);
        if (bountyId === 0) {
          addToast('There are no more bounties to display!', 'primary');
        } else {
          history.replace(`/bounty/${bountyId}`);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      try {
        const bountyId = await main.getNextBountyByCreated(created);
        history.replace(`/bounty/${bountyId}`);
      } catch (e) {
        console.error(e);
      }
    }
    return 1;
  };

  const nextArrHandler = async () => {
    const { created } = activeBounty[0].body;
    if (activeWorkspace) {
      try {
        const bountyId = await main.getWorkspacePreviousBountyByCreated(activeWorkspace, created);
        if (bountyId === 0) {
          addToast('There are no more bounties to display!', 'primary');
        } else {
          history.replace(`/bounty/${bountyId}`);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      try {
        const bountyId = await main.getPreviousBountyByCreated(created);
        history.replace(`/bounty/${bountyId}`);
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (isMobile) {
    return (
      <>
        {accessDenied ? (
          <Modal visible={true} fill={true}>
            <AccessDenied onClose={goBack} />
          </Modal>
        ) : isDeleted ? (
          <Modal visible={isDeleted} fill={true}>
            <AlreadyDeleted onClose={goBack} isDeleted={true} />
          </Modal>
        ) : (
          visible && (
            <Modal visible={visible} fill={true}>
              <FocusedView
                person={connectPersonBody}
                personBody={connectPersonBody}
                canEdit={false}
                selectedIndex={publicFocusIndex}
                config={widgetConfigs.bounties}
                bounty={activeBounty}
                fromBountyPage={true}
                goBack={goBack}
                getBounty={getBounty}
                extraModalFunction={() => {
                  if (ui.meInfo) {
                    setConnectPerson(connectPersonBody);
                  } else {
                    goBack();
                    modals.setStartupModal(true);
                  }
                }}
              />
            </Modal>
          )
        )}
      </>
    );
  }

  return (
    <>
      {accessDenied ? (
        <Modal
          visible={true}
          envStyle={{
            background: 'white',
            width: '800px',
            height: 'auto',
            borderRadius: '16px',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            padding: '24px'
          }}
          style={{
            background: 'rgba(0, 0, 0, 0.5)'
          }}
          overlayClick={goBack}
        >
          <AccessDenied onClose={goBack} />
        </Modal>
      ) : isDeleted ? (
        <Modal
          visible={isDeleted}
          envStyle={{
            background: color.pureWhite,
            ...focusedDesktopModalStyles,
            right: '-50px',
            borderRadius: '50%'
          }}
        >
          <AlreadyDeleted onClose={goBack} isDeleted={true} />
        </Modal>
      ) : (
        visible && (
          <Modal
            visible={visible}
            envStyle={{
              background: color.pureWhite,
              ...focusedDesktopModalStyles,
              maxHeight: '100vh',
              minWidth: '55vw',
              borderRadius: 0,
              zIndex: 20
            }}
            style={{
              background: 'rgba( 0 0 0 /75% )'
            }}
            overlayClick={goBack}
            bigCloseImage={goBack}
            bigCloseImageStyle={{
              top: '18px',
              right: '-50px',
              borderRadius: '50%'
            }}
            prevArrowNew={removeNextAndPrev ? undefined : prevArrHandler}
            nextArrowNew={removeNextAndPrev ? undefined : nextArrHandler}
          >
            <EuiGlobalToastList toasts={toasts} dismissToast={removeToast} toastLifeTimeMs={5000} />
            <FocusedView
              setRemoveNextAndPrev={setRemoveNextAndPrev}
              person={connectPersonBody}
              personBody={connectPersonBody}
              canEdit={false}
              selectedIndex={publicFocusIndex}
              config={widgetConfigs.bounties}
              goBack={goBack}
              getBounty={getBounty}
              bounty={activeBounty}
              fromBountyPage={true}
              extraModalFunction={() => {
                if (ui.meInfo) {
                  setConnectPerson(connectPersonBody);
                } else {
                  goBack();
                  modals.setStartupModal(true);
                }
              }}
            />
          </Modal>
        )
      )}
    </>
  );
});
