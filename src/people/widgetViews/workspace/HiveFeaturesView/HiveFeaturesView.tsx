/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/typedef */
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useStores } from 'store';
import { useParams } from 'react-router-dom';
import SidebarComponent from 'components/common/SidebarComponent';
import { useHistory } from 'react-router';
import { EuiGlobalToastList } from '@elastic/eui';
import { Author, TicketStatus } from 'store/interface.ts';
import { createSocketInstance } from 'config/socket';
import { SOCKET_MSG } from 'config/socket';
import { uiStore } from 'store/ui';
import { v4 as uuidv4 } from 'uuid';
import {
  QuickBountyTicket,
  quickBountyTicketStore
} from '../../../../store/quickBountyTicketStore.tsx';
import { Toast } from '../interface.ts';
import ActivitiesHeader from './header';

const TableContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
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
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: center;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
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
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 0;
  &:first-child {
    width: 60%;
    max-width: 60%;
  }
  &:nth-child(2) {
    width: 20%;
  }
  &:nth-child(3) {
    width: 20%;
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

export const ActivitiesContainer = styled.div<{ collapsed: boolean }>`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  padding: 3.5rem;
  background-color: #f8f9fa;
  height: calc(100vh - 120px);
  overflow-y: auto;
  margin-bottom: 50px;
  margin-top: 50px;
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
  const [expandedPhases, setExpandedPhases] = useState<{ [key: string]: boolean }>({});
  const { main } = useStores();
  const [draftTexts, setDraftTexts] = useState<{ [phaseID: string]: string }>({});
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [websocketSessionId, setWebsocketSessionId] = useState<string>('');

  console.log('main', main.meInfo);

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
    const fetchPhaseNames = async () => {
      const names: { [key: string]: string } = {};
      for (const phaseID of Object.keys(groupedData)) {
        const phase = await main.getFeaturePhaseByUUID(featureUuid, phaseID);
        names[phaseID] = phase?.name || 'Untitled Phase';
      }
      setPhaseNames(names);
    };
    fetchPhaseNames();
  }, [groupedData, featureUuid, main]);

  useEffect(() => {
    const savedState = localStorage.getItem(`expandedPhases_${featureUuid}`);
    if (savedState) {
      setExpandedPhases(JSON.parse(savedState));
    }
  }, [featureUuid]);

  useEffect(() => {
    localStorage.setItem(`expandedPhases_${featureUuid}`, JSON.stringify(expandedPhases));
  }, [expandedPhases, featureUuid]);

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

  const togglePhase = (phaseID: string) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [phaseID]: !prev[phaseID]
    }));
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

      console.log('Creating ticket with text:', text, uiStore.meInfo?.pubkey);

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

  return (
    <>
      <MainContainer>
        <SidebarComponent uuid={workspaceUuid} />
        <ActivitiesHeader uuid={workspaceUuid} collapsed={collapsed} />
        <ActivitiesContainer collapsed={collapsed}>
          {Object.values(groupedData).length === 0 ? (
            <p>No phases available</p>
          ) : (
            <TableContainer>
              {Object.values(groupedData).map((items, index) => {
                const { phaseID } = items[0];
                const isExpanded = expandedPhases[phaseID] !== false;
                const draftText = draftTexts[phaseID] || '';

                return (
                  <div key={index}>
                    <PhaseHeader onClick={() => togglePhase(phaseID)} style={{ cursor: 'pointer' }}>
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
                          Phase {index + 1}: {phaseNames[phaseID] || 'Untitled Phase'}
                        </span>
                      </div>
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
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item) => (
                              <tr key={item.ID}>
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
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                        <DraftInputContainer>
                          <DraftInput
                            type="text"
                            placeholder="Quick draft a new ticket..."
                            value={draftText}
                            onChange={(e) => handleDraftChange(phaseID, e.target.value)}
                          />
                          {draftText && (
                            <DraftButton
                              onClick={() => handleCreateTicket(phaseID)}
                              disabled={!draftText}
                            >
                              Draft
                            </DraftButton>
                          )}
                        </DraftInputContainer>
                      </>
                    )}
                  </div>
                );
              })}
            </TableContainer>
          )}
        </ActivitiesContainer>
        <EuiGlobalToastList
          toasts={toasts}
          dismissToast={() => setToasts([])}
          toastLifeTimeMs={3000}
        />
      </MainContainer>
    </>
  );
});

export default HiveFeaturesView;
