/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/typedef */
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useStores } from 'store';
import { useParams } from 'react-router-dom';
import SidebarComponent from 'components/common/SidebarComponent';
import { useHistory } from 'react-router';
import { EuiGlobalToastList } from '@elastic/eui';
import { Author, BountyCardStatus, TicketStatus } from 'store/interface.ts';
import { createSocketInstance } from 'config/socket';
import { SOCKET_MSG } from 'config/socket';
import { Box } from '@mui/system';
import { uiStore } from 'store/ui';
import { EuiLoadingSpinner } from '@elastic/eui';
import { Body } from 'pages/tickets/style';
import { userHasRole } from 'helpers';
import MaterialIcon from '@material/react-material-icon';
import { v4 as uuidv4 } from 'uuid';
import {
  QuickBountyTicket,
  quickBountyTicketStore
} from '../../../../store/quickBountyTicketStore.tsx';
import { AddPhaseModal } from '../WorkspacePhasingModals.tsx';
import { PaymentConfirmationModal } from '../../../../components/common';
import { WorkspaceName } from '../style.ts';
import { FullNoBudgetWrap, FullNoBudgetText } from '../style';
import { FeatureHeadNameWrap } from '../style.ts';
import { useDeleteConfirmationModal } from '../../../../components/common/DeleteConfirmationModal/DeleteConfirmationModal';
import ActivitiesHeader from './header';

const TableContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 7%;
  overflow: visible;
`;

export const LabelValue = styled.span`
  font-weight: normal;
  margin-left: 5px;
`;

const PhaseHeader = styled.h3`
  margin-top: 20px;
  padding: 10px;
  background: #f4f4f4;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0;
  padding-left: 10px;
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 8px;
  align-items: center;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  overflow: visible;
`;

const Th = styled.th`
  background: #f8f9fa;
  padding: 10px;
  border-bottom: 2px solid #ddd;
  &:first-child {
    width: 60%;
  }
  &:nth-child(2) {
    width: 20%;
  }
  &:nth-child(3) {
    width: 20%;
  }
`;

const Td = styled.td`
  padding: 10px;
  border-bottom: 1px solid #ddd;
  white-space: nowrap;
  text-overflow: ellipsis;
  position: relative;
  overflow: visible !important;
  max-width: 0;
  &:first-child {
    width: 40%;
    max-width: 60%;
  }
  &:nth-child(2) {
    width: 30%;
  }
  &:nth-child(3) {
    width: 30%;
  }
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: #fff;
  background-color: ${({ status }) =>
    status === 'PAID'
      ? 'green'
      : status === 'IN_PROGRESS'
      ? 'gray'
      : status === 'IN_REVIEW'
      ? 'orange'
      : status === 'TODO'
      ? 'blue'
      : status === 'DRAFT'
      ? 'lightgray'
      : 'black'};
`;

export const FeatureHeadWrap = styled.div<{ collapsed: boolean }>`
  display: flex;
  align-items: center;
  background: #f8f9fa;
  padding: 30px 50px 10px 50px;
  padding-right: 40px;
  margin-left: ${({ collapsed }: { collapsed: boolean }) => (collapsed ? '50px' : '250px')};
  transition: margin-left 0.3s ease-in-out;
  @media only screen and (max-width: 800px) {
    padding: 15px 15px;
  }
  @media only screen and (max-width: 700px) {
    padding: 12px 10px;
  }
  @media only screen and (max-width: 500px) {
    padding: 0px;
    padding-bottom: 15px;
    flex-direction: column;
    align-items: start;
    padding: 20px 30px;
  }
`;

export const ActivitiesContainer = styled.div<{ collapsed: boolean }>`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  padding: 3.5rem;
  padding-bottom: 0 !important;
  background-color: #f8f9fa;
  height: calc(100vh - 120px);
  overflow-y: auto;
  margin-bottom: 50px;
  margin-left: ${({ collapsed }: { collapsed: boolean }) => (collapsed ? '50px' : '250px')};
  transition: margin-left 0.3s ease-in-out;
`;

const MainContainer = styled.div`
  flex-grow: 1;
  transition:
    margin-left 0.3s ease-in-out,
    width 0.3s ease-in-out;
  overflow: hidden;
`;

const DraftInputContainer = styled.div`
  margin-top: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  display: flex;
  gap: 8px;
`;

const DraftInput = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const DraftButton = styled.button`
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const PlannerButton = styled.button`
  background-color: #49c998;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 0.9rem;
  &:hover {
    background-color: #3ab584;
  }
`;

const BottomButtonContainer = styled.div`
  margin-top: 30px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const FeatureButton = styled.button`
  background-color: #49c998;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 0.9rem;
  &:hover {
    background-color: #3ab584;
  }
`;

const FeatureBacklogButton = styled(FeatureButton)`
  background-color: #49c998;
  &:hover {
    background-color: #3ab584;
  }
`;

const NewPhaseButton = styled(FeatureButton)`
  background-color: #608aff;
  &:hover {
    background-color: #4a6fd1;
  }
`;

const MenuContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const MenuButton = styled.button`
  border: none;
  background: none;
  padding: 4px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background: #f0f0f0;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  right: 0;
  top: 20px;
  margin-top: 4px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  min-width: 140px;
  z-index: 9999;
  overflow: hidden;
`;

const DropdownItem = styled.button`
  display: flex;
  width: 100%;
  padding: 10px 12px;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  align-items: center;
  transition: background-color 0.2s ease;

  &:hover {
    background: #f5f7fa;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
  }
`;

const MenuIcon = styled.span`
  margin-right: 8px;
  display: inline-flex;
  align-items: center;
`;

interface HiveFeaturesViewProps {
  features?: Array<{
    id?: string;
    title?: string;
    icon?: string;
    description?: string;
    status?: string;
  }>;
  isLoading?: boolean;
  error?: string | null;
  onFeatureClick?: (featureId: string) => void;
}

const HiveFeaturesView = observer<HiveFeaturesViewProps>(() => {
  const params = useParams<{
    uuid?: string;
    feature_uuid?: string;
    workspace_uuid?: string;
  }>();

  const featureUuid = params.feature_uuid ?? '';
  const workspaceUuid = params.workspace_uuid ?? '';

  const history = useHistory();
  const [phaseNames, setPhaseNames] = useState<{ [key: string]: string }>({});
  const [collapsed, setCollapsed] = useState(false);
  const [data, setData] = useState<QuickBountyTicket[]>([]);
  const { ui, main } = useStores();
  const [draftTexts, setDraftTexts] = useState<{ [phaseID: string]: string }>({});
  const [toasts, setToasts] = React.useState<any[]>([]);
  const [websocketSessionId, setWebsocketSessionId] = useState<string>('');
  const [showAddPhaseModal, setShowAddPhaseModal] = useState(false);
  const [phaseName, setPhaseName] = useState<string>('');
  const [featureName, setFeatureName] = useState<string>('');
  const [connectPersonBody, setConnectPersonBody] = React.useState<any>({});
  const [isOpenPaymentConfirmation, setIsOpenPaymentConfirmation] = React.useState(false);
  const [activeBounty, setActiveBounty] = React.useState<any[]>([]);
  const [bountyID, setBountyID] = useState<number>();
  const [featureCalls, setFeatureCalls] = useState<any>(null);
  const [workspaceData, setWorkspaceData] = useState<any>(null);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [permissionsChecked, setPermissionsChecked] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const { openDeleteConfirmation } = useDeleteConfirmationModal();

  const editWorkspaceDisabled = React.useMemo(() => {
    if (!ui.meInfo) return true;
    if (!workspaceData?.owner_pubkey) return false;

    const isWorkspaceAdmin = workspaceData.owner_pubkey === ui.meInfo.owner_pubkey;
    return (
      !isWorkspaceAdmin &&
      !userHasRole(main.bountyRoles, userRoles, 'EDIT ORGANIZATION') &&
      !userHasRole(main.bountyRoles, userRoles, 'ADD USER') &&
      !userHasRole(main.bountyRoles, userRoles, 'VIEW REPORT')
    );
  }, [workspaceData, ui.meInfo, userRoles, main.bountyRoles]);

  const getWorkspaceData = React.useCallback(async () => {
    if (!workspaceUuid) return;
    try {
      const data = await main.getUserWorkspaceByUuid(workspaceUuid);
      setWorkspaceData(data);
    } catch (error) {
      console.error('Error fetching workspace data:', error);
    }
  }, [workspaceUuid, main]);

  const getUserRoles = React.useCallback(async () => {
    if (!workspaceUuid || !ui.meInfo?.owner_pubkey) {
      setPermissionsChecked(true);
      return;
    }

    try {
      const roles = await main.getUserRoles(workspaceUuid, ui.meInfo.owner_pubkey);
      setUserRoles(roles);
    } catch (error) {
      console.error('Error fetching user roles:', error);
    } finally {
      setPermissionsChecked(true);
    }
  }, [workspaceUuid, ui.meInfo?.owner_pubkey, main]);

  useEffect(() => {
    const checkPermissions = async () => {
      setLoading(true);
      await getWorkspaceData();
      await getUserRoles();
      setLoading(false);
    };

    checkPermissions();
  }, [getWorkspaceData, getUserRoles]);

  let interval: number;

  const addToast = (type: string) => {
    const toastId = Math.random();
    switch (type) {
      case SOCKET_MSG.keysend_success:
        setToasts([
          {
            id: `${toastId}`,
            title: 'Paid successfully',
            color: 'success'
          }
        ]);
        break;
      case SOCKET_MSG.keysend_failed:
        setToasts([
          {
            id: `${toastId}`,
            title: 'Insufficient funds in the workspace.',
            color: 'error',
            toastLifeTimeMs: 10000
          }
        ]);
        break;
      default:
        break;
    }
  };

  const getBounty = useCallback(async () => {
    let bounty;
    if (bountyID) {
      bounty = await main.getBountyById(Number(bountyID));
    }
    const connectPerson = bounty?.length ? bounty[0].person : [];
    setConnectPersonBody(connectPerson);
    setActiveBounty(bounty || []);
  }, [bountyID, main]);

  useEffect(() => {
    if (bountyID) {
      getBounty();
    }
  }, [bountyID, getBounty]);

  useEffect(() => {
    const handleCollapseChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ collapsed: boolean }>;
      setCollapsed(customEvent.detail.collapsed);
    };

    window.addEventListener('sidebarCollapse', handleCollapseChange as EventListener);

    return () => {
      window.removeEventListener('sidebarCollapse', handleCollapseChange as EventListener);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const response = await quickBountyTicketStore.fetchAndSetQuickData(featureUuid);
      setData(response || []);
    };
    fetchData();
  }, [featureUuid]);

  const groupedData = data.reduce<{ [key: string]: QuickBountyTicket[] }>((acc, item) => {
    if (!acc[item.phaseID]) acc[item.phaseID] = [];
    acc[item.phaseID].push(item);
    return acc;
  }, {});

  useEffect(() => {
    const fetchAllPhases = async () => {
      if (featureUuid) {
        const phases = await main.getFeaturePhases(featureUuid);
        const names: { [key: string]: string } = {};
        for (const phase of phases) {
          names[phase.uuid] = phase.name || 'Untitled Phase';

          if (!(phase.uuid in quickBountyTicketStore.expandedPhases)) {
            quickBountyTicketStore.setPhaseExpanded(phase.uuid, true);
          }
        }
        setPhaseNames(names);
      }
    };
    fetchAllPhases();
  }, [featureUuid, main]);

  useEffect(() => {
    const socket = createSocketInstance();

    socket.onopen = () => {
      console.log('Socket connected in Hive Features View');
    };

    socket.onmessage = async (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        if (data.msg === SOCKET_MSG.user_connect) {
          const sessionId = data.body || localStorage.getItem('websocket_token');
          setWebsocketSessionId(sessionId);
          console.log(`Websocket Session ID: ${sessionId}`);
        }
      } catch (error) {
        console.error('Error processing websocket message:', error);
      }
    };

    socket.onclose = () => {
      console.log('Socket disconnected in Hive Features View');
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  useEffect(() => {
    const fetchFeatureName = async () => {
      if (featureUuid) {
        const feature = await main.getFeaturesByUuid(featureUuid);
        if (feature) {
          setFeatureName(feature.name || 'Feature');
        }
      }
    };
    fetchFeatureName();
  }, [featureUuid]);

  useEffect(() => {
    const fetchFeatureCalls = async () => {
      if (workspaceUuid) {
        try {
          const calls = await main.getFeatureCalls(workspaceUuid);
          setFeatureCalls(calls);
        } catch (error) {
          console.error('Error fetching feature calls:', error);
        }
      }
    };

    fetchFeatureCalls();
  }, [workspaceUuid, main]);

  const togglePhase = (phaseID: string) => {
    const currentState = quickBountyTicketStore.expandedPhases[phaseID] !== false;
    quickBountyTicketStore.setPhaseExpanded(phaseID, !currentState);
  };

  const getNavigationURL = (item: QuickBountyTicket) => {
    if (item.bountyTicket === 'bounty') {
      return `/bounty/${item.bountyID}`;
    } else if (item.bountyTicket === 'ticket') {
      return `/workspace/${workspaceUuid}/ticket/${item.ticketUUID}`;
    }
    return '';
  };

  const handleTitleClick = (item: QuickBountyTicket) => {
    const url = getNavigationURL(item);
    if (url !== '') {
      history.push(url);
    }
  };

  const handleDraftChange = (phaseID: string, text: string) => {
    setDraftTexts((prev) => ({
      ...prev,
      [phaseID]: text
    }));
  };

  const addSuccessToast = (message: string) => {
    setToasts([
      {
        id: `${Date.now()}-success`,
        title: 'Hive',
        color: 'success',
        text: message
      }
    ]);
  };

  const addErrorToast = (message: string) => {
    setToasts([
      {
        id: `${Date.now()}-error`,
        title: 'Hive',
        color: 'danger',
        text: message
      }
    ]);
  };

  const handleCreateTicket = async (phaseID: string) => {
    console.log('Create ticket clicked for phase:', phaseID);
    const text = draftTexts[phaseID];
    if (!text) {
      console.log('No text found for phase:', phaseID);
      return;
    }

    try {
      if (!uiStore.meInfo?.pubkey) {
        console.log('No user info found');
        return;
      }

      const ticketPayload = {
        metadata: {
          source: 'hive-features-view',
          id: websocketSessionId
        },
        ticket: {
          name: text,
          description: text,
          status: 'DRAFT' as TicketStatus,
          author: 'HUMAN' as Author,
          author_id: uiStore.meInfo?.pubkey,
          feature_uuid: featureUuid,
          phase_uuid: phaseID,
          uuid: uuidv4(),
          sequence: 0,
          version: 0
        }
      };

      const response = await main.createUpdateTicket(ticketPayload);

      if (response === 406 || !response) {
        throw new Error('Failed to create ticket');
      }

      if (response.UUID) {
        const updatedData = await quickBountyTicketStore.fetchAndSetQuickData(featureUuid);
        setData(updatedData || []);
        addSuccessToast('Ticket created successfully!');
      } else {
        throw new Error('No UUID in response');
      }

      setDraftTexts((prev) => ({
        ...prev,
        [phaseID]: ''
      }));
    } catch (error) {
      console.error('Error creating ticket:', error);
      addErrorToast('Failed to create ticket. Please try again.');
    }
  };

  const handleAddPhaseClick = () => {
    setShowAddPhaseModal(true);
  };

  const handleAddPhaseModalClose = () => {
    setShowAddPhaseModal(false);
  };

  const handleFeatureDetailsClick = () => {
    history.push(`/feature/${featureUuid}`);
  };

  const handleFeatureBacklogClick = () => {
    history.push(`/workspace/${workspaceUuid}/feature_backlog`);
  };

  const handleCreatePhase = async () => {
    try {
      const body = {
        uuid: '',
        feature_uuid: featureUuid,
        name: phaseName,
        priority: 0
      };

      await main.createOrUpdatePhase(body);
      const response = await quickBountyTicketStore.fetchAndSetQuickData(featureUuid);
      setData(response || []);

      setPhaseName('');

      const updatedPhases = await main.getFeaturePhases(featureUuid);
      const names: { [key: string]: string } = {};
      for (const phase of updatedPhases) {
        names[phase.uuid] = phase.name || 'Untitled Phase';
      }
      setPhaseNames(names);

      addSuccessToast('Phase created successfully!');
      handleAddPhaseModalClose();
    } catch (error) {
      console.error('Error creating phase:', error);
      addErrorToast('Failed to create phase. Please try again.');
    }
  };

  const handlePhaseNameChange = (name: string) => setPhaseName(name);

  const startPolling = React.useCallback(
    async (paymentRequest: string) => {
      let i = 0;
      interval = window.setInterval(async () => {
        try {
          const invoiceData = await main.pollInvoice(paymentRequest);
          if (invoiceData?.success && invoiceData.response.settled) {
            clearInterval(interval);
            addToast(SOCKET_MSG.invoice_success);
            main.setKeysendInvoice('');
          }
          if (i++ > 22) clearInterval(interval);
        } catch (e) {
          console.warn('Invoice Polling Error', e);
        }
      }, 5000);
    },
    [main, addToast]
  );

  const generateInvoice = async (price: number) => {
    if (activeBounty[0]?.created && ui.meInfo?.websocketToken) {
      const data = await main.getLnInvoice({
        amount: price || 0,
        memo: '',
        owner_pubkey: connectPersonBody.owner_pubkey,
        user_pubkey: connectPersonBody.owner_pubkey,
        route_hint: connectPersonBody.owner_route_hint ?? '',
        created: activeBounty[0].created?.toString() || '',
        type: 'KEYSEND'
      });
      if (data.response.invoice) {
        main.setKeysendInvoice(data.response.invoice);
        startPolling(data.response.invoice);
      }
    }
  };

  const handlePayment = async () => {
    try {
      const price = Number(activeBounty[0].body.price);

      console.log('price', price);

      if (workspaceUuid) {
        const workspaceBudget = await main.getWorkspaceBudget(workspaceUuid);
        if (Number(workspaceBudget.current_budget) >= price) {
          await main.makeBountyPayment({
            id: Number(bountyID),
            websocket_token: ui.meInfo?.websocketToken || ''
          });
          addToast(SOCKET_MSG.keysend_success);
        } else {
          addToast(SOCKET_MSG.keysend_failed);
        }
      } else {
        await generateInvoice(price);
      }
    } catch (error) {
      console.error('Payment failed:', error);
      addToast(SOCKET_MSG.keysend_failed);
    } finally {
      setIsOpenPaymentConfirmation(false);
    }
  };

  const ActionMenu = ({
    status,
    bountyId,
    itemType,
    onPay,
    onDelete
  }: {
    status?: BountyCardStatus;
    bountyId?: number;
    ticketUUID?: string;
    itemType: 'bounty' | 'ticket';
    onPay?: () => void;
    onDelete?: () => void;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const toggleMenu = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (bountyId) {
        setBountyID(bountyId);
      }
      setIsOpen((prev) => !prev);
    };

    const closeMenu = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    useEffect(() => {
      document.addEventListener('click', closeMenu);
      return () => document.removeEventListener('click', closeMenu);
    }, []);

    const showBountyMenu =
      itemType === 'bounty' && ['COMPLETED', 'IN_REVIEW', 'IN_PROGRESS'].includes(status || '');
    const showTicketMenu = itemType === 'ticket';

    if (!showBountyMenu && !showTicketMenu) return null;

    return (
      <MenuContainer ref={menuRef}>
        <MenuButton onClick={toggleMenu} title="Actions">
          ...
        </MenuButton>
        {isOpen && (
          <Dropdown>
            {showBountyMenu && onPay && (
              <DropdownItem onClick={onPay}>
                <MenuIcon>💰</MenuIcon>
                Pay Bounty
              </DropdownItem>
            )}
            {showTicketMenu && onDelete && (
              <DropdownItem onClick={onDelete}>
                <MenuIcon>🗑️</MenuIcon>
                Delete Ticket
              </DropdownItem>
            )}
          </Dropdown>
        )}
      </MenuContainer>
    );
  };

  const confirmPaymentHandler = () => {
    setIsOpenPaymentConfirmation(true);
  };

  const handleFeatureCallClick = async () => {
    try {
      if (!featureCalls) {
        setToasts([
          {
            id: `${Date.now()}-feature-call-error`,
            title: 'Feature Call',
            color: 'danger',
            text: 'Feature call not configured'
          }
        ]);
        return;
      }

      if (!featureCalls?.url) {
        setToasts([
          {
            id: `${Date.now()}-feature-call-error`,
            title: 'Feature Call',
            color: 'danger',
            text: 'Feature call URL is missing'
          }
        ]);
        return;
      }

      // Validate URL format
      try {
        new URL(featureCalls.url);
      } catch (e) {
        setToasts([
          {
            id: `${Date.now()}-feature-call-error`,
            title: 'Feature Call',
            color: 'danger',
            text: 'Invalid URL format'
          }
        ]);
        return;
      }

      window.open(featureCalls.url, '_blank');
    } catch (error) {
      console.error('Error handling feature call:', error);
      setToasts([
        {
          id: `${Date.now()}-feature-call-error`,
          title: 'Feature Call',
          color: 'danger',
          text: error instanceof Error ? error.message : 'Unable to load feature call'
        }
      ]);
    }
  };

  const handleDeleteTicket = async (ticketUUID: string) => {
    try {
      const success = await main.deleteTicket(ticketUUID);
      if (success) {
        setToasts([
          {
            id: `${Date.now()}-delete-success`,
            title: 'Ticket',
            color: 'success',
            text: 'Ticket deleted successfully!'
          }
        ]);

        const updatedData = await quickBountyTicketStore.fetchAndSetQuickData(featureUuid);
        setData(updatedData || []);
      } else {
        setToasts([
          {
            id: `${Date.now()}-delete-error`,
            title: 'Error',
            color: 'danger',
            text: 'Failed to delete ticket'
          }
        ]);
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
      setToasts([
        {
          id: `${Date.now()}-delete-error`,
          title: 'Error',
          color: 'danger',
          text: 'An error occurred while deleting the ticket'
        }
      ]);
    }
  };

  const confirmDeleteTicket = (ticketUUID: string) => {
    openDeleteConfirmation({
      onDelete: () => handleDeleteTicket(ticketUUID),
      children: (
        <Box fontSize={20} textAlign="center">
          Are you sure you want to <br />
          <Box component="span" fontWeight="500">
            delete this ticket?
          </Box>
        </Box>
      )
    });
  };

  if (loading || !permissionsChecked) {
    return (
      <Body style={{ justifyContent: 'center', alignItems: 'center' }}>
        <EuiLoadingSpinner size="xl" />
      </Body>
    );
  }

  if (editWorkspaceDisabled) {
    return (
      <FullNoBudgetWrap>
        <MaterialIcon
          icon={'lock'}
          style={{
            fontSize: 30,
            cursor: 'pointer',
            color: '#ccc'
          }}
        />
        <FullNoBudgetText>
          You have restricted permissions and you are unable to view this page. Reach out to the
          workspace admin to get them updated.
        </FullNoBudgetText>
      </FullNoBudgetWrap>
    );
  }

  return (
    <>
      <MainContainer>
        <SidebarComponent uuid={workspaceUuid} />
        <ActivitiesHeader uuid={workspaceUuid} collapsed={collapsed} />
        <FeatureHeadWrap collapsed={collapsed}>
          <FeatureHeadNameWrap>
            <MaterialIcon
              onClick={handleFeatureBacklogClick}
              icon={'arrow_back'}
              style={{
                fontSize: 25,
                cursor: 'pointer'
              }}
            />
            <WorkspaceName>
              Feature Name:
              <LabelValue>{featureName}</LabelValue>
            </WorkspaceName>
          </FeatureHeadNameWrap>
        </FeatureHeadWrap>
        <ActivitiesContainer collapsed={collapsed}>
          <TableContainer>
            {Object.keys(phaseNames).length === 0 ? (
              <p>No phases available</p>
            ) : (
              Object.entries(phaseNames).map(([phaseID, phaseName], index) => {
                const items = groupedData[phaseID] || [];
                const isExpanded = quickBountyTicketStore.expandedPhases[phaseID] !== false;
                const draftText = draftTexts[phaseID] || '';

                return (
                  <div key={phaseID}>
                    <PhaseHeader
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('button')) {
                          e.stopPropagation();
                          return;
                        }
                        togglePhase(phaseID);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          minWidth: 0,
                          flexGrow: 1
                        }}
                      >
                        <span
                          style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            minWidth: 0
                          }}
                        >
                          Phase {index + 1}: {phaseName}
                        </span>
                      </div>
                      <PlannerButton
                        onClick={(e) => {
                          e.stopPropagation();
                          history.push(`/feature/${featureUuid}/phase/${phaseID}/planner`);
                        }}
                      >
                        Phase Planner
                      </PlannerButton>
                      <span>{isExpanded ? '▼' : '▶'}</span>
                    </PhaseHeader>
                    {isExpanded && (
                      <>
                        <Table>
                          <thead>
                            <tr>
                              <Th>Name</Th>
                              <Th style={{ textAlign: 'center' }}>Status</Th>
                              <Th style={{ textAlign: 'center' }}>Assigned</Th>
                              <Th style={{ width: '5%', textAlign: 'center' }}>Action</Th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item) => (
                              <tr key={item.ID} style={{ position: 'relative', zIndex: 1 }}>
                                <Td
                                  onClick={() => handleTitleClick(item)}
                                  style={{ cursor: 'pointer' }}
                                >
                                  {item.Title || 'Unnamed'}
                                </Td>
                                <Td style={{ textAlign: 'center' }}>
                                  <StatusBadge status={item.status}>{item.status}</StatusBadge>
                                </Td>
                                <Td style={{ textAlign: 'center' }}>
                                  {item.assignedAlias || '...'}
                                </Td>
                                <Td style={{ textAlign: 'center' }}>
                                  <ActionMenu
                                    status={item.status}
                                    bountyId={
                                      item.bountyTicket === 'bounty'
                                        ? (item.bountyID as number)
                                        : undefined
                                    }
                                    ticketUUID={
                                      item.bountyTicket === 'ticket' ? item.ticketUUID : undefined
                                    }
                                    itemType={item.bountyTicket as 'bounty' | 'ticket'}
                                    onPay={
                                      item.bountyTicket === 'bounty'
                                        ? confirmPaymentHandler
                                        : undefined
                                    }
                                    onDelete={
                                      item.bountyTicket === 'ticket'
                                        ? () => confirmDeleteTicket(item.ticketUUID as string)
                                        : undefined
                                    }
                                  />
                                </Td>
                              </tr>
                            ))}
                            {items.length === 0 && (
                              <tr>
                                <Td colSpan={3} style={{ textAlign: 'center' }}>
                                  No tickets in this phase
                                </Td>
                              </tr>
                            )}
                          </tbody>
                        </Table>
                        <DraftInputContainer>
                          <DraftInput
                            type="text"
                            placeholder="Quick draft a new ticket..."
                            value={draftText}
                            data-testid="ticket-draft-input"
                            onChange={(e) => handleDraftChange(phaseID, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && draftText) {
                                handleCreateTicket(phaseID);
                              }
                            }}
                          />
                          {draftText && (
                            <DraftButton
                              onClick={() => handleCreateTicket(phaseID)}
                              disabled={!draftText}
                              data-testid="create-ticket-btn"
                            >
                              Draft
                            </DraftButton>
                          )}
                        </DraftInputContainer>
                      </>
                    )}
                  </div>
                );
              })
            )}
            <BottomButtonContainer>
              {featureCalls?.url && (
                <FeatureBacklogButton onClick={handleFeatureCallClick}>
                  Start Feature Call
                </FeatureBacklogButton>
              )}
              <FeatureBacklogButton onClick={handleFeatureBacklogClick}>
                Feature Backlog
              </FeatureBacklogButton>
              <FeatureButton onClick={handleFeatureDetailsClick}>Feature Details</FeatureButton>
              <NewPhaseButton data-testid="new-phase-btn" onClick={handleAddPhaseClick}>
                + New Phase
              </NewPhaseButton>
            </BottomButtonContainer>
          </TableContainer>
        </ActivitiesContainer>

        {isOpenPaymentConfirmation && (
          <PaymentConfirmationModal
            onClose={() => setIsOpenPaymentConfirmation(false)}
            onConfirmPayment={handlePayment}
          />
        )}
        <EuiGlobalToastList
          toasts={toasts}
          dismissToast={() => setToasts([])}
          toastLifeTimeMs={5000}
        />
        {showAddPhaseModal && (
          <AddPhaseModal
            onSave={handleCreatePhase}
            onEditPhase={handlePhaseNameChange}
            onClose={handleAddPhaseModalClose}
            onConfirmDelete={() => {
              handleAddPhaseModalClose();
            }}
          />
        )}
      </MainContainer>
    </>
  );
});

export default HiveFeaturesView;
