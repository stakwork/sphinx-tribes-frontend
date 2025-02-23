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
import { AddPhaseModal } from '../WorkspacePhasingModals.tsx';
import ActivitiesHeader from './header';

const TableContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 7%;
`;

export const LabelValue = styled.span`
  font-weight: normal;
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
  padding-bottom: 0 !important;
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

const NewPhaseButton = styled(FeatureButton)`
  background-color: #608aff;
  &:hover {
    background-color: #4a6fd1;
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
  const [showAddPhaseModal, setShowAddPhaseModal] = useState(false);
  const [phaseName, setPhaseName] = useState<string>('');
  const [featureName, setFeatureName] = useState<string>('');

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
    const fetchAllPhases = async () => {
      if (featureUuid) {
        const phases = await main.getFeaturePhases(featureUuid);
        const names: { [key: string]: string } = {};
        for (const phase of phases) {
          names[phase.uuid] = phase.name || 'Untitled Phase';

          if (!(phase.uuid in expandedPhases)) {
            setExpandedPhases((prev) => ({
              ...prev,
              [phase.uuid]: true
            }));
          }
        }
        setPhaseNames(names);
      }
    };
    fetchAllPhases();
  }, [featureUuid, main]);

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

  const handleAddPhaseClick = () => {
    setShowAddPhaseModal(true);
  };

  const handleAddPhaseModalClose = () => {
    setShowAddPhaseModal(false);
  };

  const handleFeatureDetailsClick = () => {
    history.push(`/feature/${featureUuid}`);
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

  return (
    <>
      <MainContainer>
        <SidebarComponent uuid={workspaceUuid} />
        <ActivitiesHeader uuid={workspaceUuid} collapsed={collapsed} />
        <ActivitiesContainer collapsed={collapsed}>
          {Object.keys(phaseNames).length === 0 ? (
            <p>No phases available</p>
          ) : (
            <TableContainer>
              <h3>
                Feature Name: <LabelValue>{featureName}</LabelValue>
              </h3>
              {Object.entries(phaseNames).map(([phaseID, phaseName], index) => {
                const items = groupedData[phaseID] || [];
                const isExpanded = expandedPhases[phaseID] !== false;
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
              <BottomButtonContainer>
                <FeatureButton onClick={handleFeatureDetailsClick}>Feature Details</FeatureButton>
                <NewPhaseButton onClick={handleAddPhaseClick}>+ New Phase</NewPhaseButton>
              </BottomButtonContainer>
            </TableContainer>
          )}
        </ActivitiesContainer>

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
