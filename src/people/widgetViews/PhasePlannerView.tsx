/* eslint-disable @typescript-eslint/typedef */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams, useHistory } from 'react-router-dom';
import { BountyStatus, Feature, Ticket, TicketMessage, TicketStatus } from 'store/interface';
import MaterialIcon from '@material/react-material-icon';
import TicketEditor from 'components/common/TicketEditor/TicketEditor';
import { useStores } from 'store';
import {
  EuiDragDropContext,
  EuiDroppable,
  EuiDraggable,
  EuiGlobalToastList,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter
} from '@elastic/eui';
import { v4 as uuidv4 } from 'uuid';
import {
  FeatureBody,
  FeatureDataWrap,
  FieldWrap,
  PhaseLabel,
  LabelValue,
  AddTicketButton,
  Data,
  Label
} from 'pages/tickets/style';
import { SOCKET_MSG } from 'config/socket';
import { createSocketInstance } from 'config/socket';
import SidebarComponent from 'components/common/SidebarComponent.tsx';
import styled from 'styled-components';
import { phaseTicketStore } from '../../store/phase';
import StakworkLogsPanel from '../../components/common/TicketEditor/StakworkLogsPanel.tsx';
import { useFeatureFlag } from '../../hooks/useFeatureFlag';
import {
  FeatureHeadNameWrap,
  FeatureHeadWrap,
  WorkspaceName,
  PhaseFlexContainer,
  ActionButton,
  DisplayBounties
} from './workspace/style';
import { Phase, Toast } from './workspace/interface';
import { EditableField } from './workspace/EditableField.tsx';
import WidgetSwitchViewer from './WidgetSwitchViewer.tsx';
import ActivitiesHeader from './workspace/Activities/header.tsx';

interface PhasePlannerParams {
  feature_uuid: string;
  phase_uuid: string;
}

interface LogEntry {
  timestamp: string;
  projectId: string;
  ticketUUID: string;
  message: string;
}

const MainContent = styled.div<{ collapsed: boolean }>`
  margin-left: ${({ collapsed }) => (collapsed ? '60px' : '250px')};
  transition: margin-left 0.3s ease-in-out;
  width: ${({ collapsed }) => (collapsed ? 'calc(100% - 60px)' : 'calc(100% - 250px)')};
`;

const BulkConvertButton = styled(ActionButton)`
  margin: 10px 0;
  background-color: #49c998 !important;
  width: 300px;

  &:hover {
    background-color: #3ab583 !important;
    color: white;
  }

  &:disabled {
    background-color: rgba(73, 201, 152, 0.5) !important;
    border: none;
    color: white;
  }
`;

const PhasePlannerView: React.FC = observer(() => {
  const { feature_uuid, phase_uuid } = useParams<PhasePlannerParams>();
  const [featureData, setFeatureData] = useState<Feature | null>(null);
  const [phaseData, setPhaseData] = useState<Phase | null>(null);
  const [websocketSessionId, setWebsocketSessionId] = useState<string>('');
  const [swwfLinks, setSwwfLinks] = useState<Record<string, string>>({});
  const [purpose, setPurpose] = useState<string>(phaseData?.phase_purpose || '');
  const [outcome, setOutcome] = useState<string>(phaseData?.phase_outcome || '');
  const [scope, setScope] = useState<string>(phaseData?.phase_scope || '');
  const [design, setDesign] = useState<string>(phaseData?.phase_design || '');
  const [editPurpose, setEditPurpose] = useState<boolean>(true);
  const [editOutcome, setEditOutcome] = useState<boolean>(true);
  const [editScope, setEditScope] = useState<boolean>(true);
  const [editDesign, setEditDesign] = useState<boolean>(true);
  const [purposePreviewMode, setPurposePreviewMode] = useState<'preview' | 'edit'>('preview');
  const [outcomePreviewMode, setOutcomePreviewMode] = useState<'preview' | 'edit'>('preview');
  const [scopePreviewMode, setScopePreviewMode] = useState<'preview' | 'edit'>('preview');
  const [designPreviewMode, setDesignPreviewMode] = useState<'preview' | 'edit'>('preview');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { main } = useStores();
  const history = useHistory();
  const tickets = phaseTicketStore.getPhaseTickets(phase_uuid);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [totalBounties, setTotalBounties] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const selectedWidget = 'bounties';
  const { isEnabled } = useFeatureFlag('display_planner_logs');
  const [collapsed, setCollapsed] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<Record<string, boolean>>({});
  const { isEnabled: isBulkCreateEnabled } = useFeatureFlag('bulk_ticket_create');
  const [isConversionModalOpen, setIsConversionModalOpen] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const handleSelectTicket = (ticketId: string) => {
    setSelectedTickets((prev) => ({
      ...prev,
      [ticketId]: !prev[ticketId]
    }));
  };

  const checkboxIdToSelectedMap: BountyStatus = useMemo(
    () => ({
      Open: true,
      Assigned: true,
      Completed: true,
      Paid: true,
      Pending: true,
      Failed: true
    }),
    []
  );

  const checkboxIdToSelectedMapLanguage = {};
  const languageString = '';

  useEffect(() => {
    const socket = createSocketInstance();

    socket.onopen = () => {
      console.log('Socket connected in Phase Planner');
    };

    const refreshSingleTicket = async (ticketUuid: string) => {
      try {
        const ticket = await main.getTicketDetails(ticketUuid);

        if (ticket.UUID) {
          ticket.uuid = ticket.UUID;
        }

        phaseTicketStore.addTicket(ticket);

        const groupId = ticket.ticket_group || ticket.uuid;

        const latestTicket = phaseTicketStore.getLatestVersionFromGroup(groupId);

        phaseTicketStore.updateTicket(latestTicket?.uuid as string, latestTicket as Ticket);
      } catch (error) {
        console.error('Error on refreshing ticket:', error);
      }
    };

    socket.onmessage = async (event: MessageEvent) => {
      // Log raw message data
      console.log('Raw websocket message received:', event.data);

      try {
        const data = JSON.parse(event.data);
        // Log parsed data
        console.log('Parsed websocket message:', data);

        if (data.msg === SOCKET_MSG.user_connect) {
          const sessionId = data.body || localStorage.getItem('websocket_token');
          setWebsocketSessionId(sessionId);
          console.log(`Websocket Session ID: ${sessionId}`);
          return;
        }

        if (data.action === 'swrun' && data.message && data.ticketDetails?.ticketUUID) {
          try {
            const stakworkId = data.message.replace(
              'https://jobs.stakwork.com/admin/projects/',
              ''
            );
            if (stakworkId) {
              setSwwfLinks((prev: Record<string, string>) => ({
                ...prev,
                [data.ticketDetails.ticketUUID]: stakworkId
              }));
            }
          } catch (error) {
            console.error('Error processing Stakwork URL:', error);
          }
          return;
        }

        const ticketMessage = data as TicketMessage;
        // Log ticket message before processing
        console.log('Ticket message before processing:', ticketMessage);

        switch (ticketMessage.action) {
          case 'message':
            console.log('Received ticket message:', ticketMessage.message);
            console.log('Ticket details:', {
              broadcastType: ticketMessage.broadcastType,
              sourceSessionID: ticketMessage.sourceSessionID,
              action: ticketMessage.action,
              ticketDetails: ticketMessage.ticketDetails
            });
            break;

          case 'process':
            console.log('Processing ticket update:', ticketMessage.ticketDetails.ticketUUID);
            await refreshSingleTicket(ticketMessage.ticketDetails.ticketUUID as string);
            break;
        }
      } catch (error) {
        console.error('Error processing websocket message:', error);
      }
    };

    socket.onclose = () => {
      console.log('Socket disconnected in Phase Planner');
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [main]);

  const submitPurpose = async () => {
    if (!phaseData) return;
    try {
      const updatedPhase = await main.createOrUpdatePhase({
        ...phaseData,
        phase_purpose: purpose
      });
      if (updatedPhase) {
        setPhaseData(updatedPhase);
        setPurpose(updatedPhase.phase_purpose || '');
        setEditPurpose(true);
        setToasts([
          {
            id: `${Date.now()}-purpose-success`,
            title: 'Success',
            color: 'success',
            text: 'Purpose updated successfully!'
          }
        ]);
      }
    } catch (error) {
      console.error('Error updating phase purpose:', error);
      setToasts([
        {
          id: `${Date.now()}-purpose-error`,
          title: 'Error',
          color: 'danger',
          text: 'Failed to update purpose'
        }
      ]);
    }
  };

  const submitOutcome = async () => {
    if (!phaseData) return;
    try {
      const updatedPhase = await main.createOrUpdatePhase({
        ...phaseData,
        phase_outcome: outcome
      });
      if (updatedPhase) {
        setPhaseData(updatedPhase);
        setOutcome(updatedPhase.phase_outcome || '');
        setEditOutcome(true);
        setToasts([
          {
            id: `${Date.now()}-outcome-success`,
            title: 'Success',
            color: 'success',
            text: 'Outcome updated successfully!'
          }
        ]);
      }
    } catch (error) {
      console.error('Error updating phase outcome:', error);
      setToasts([
        {
          id: `${Date.now()}-outcome-error`,
          title: 'Error',
          color: 'danger',
          text: 'Failed to update outcome'
        }
      ]);
    }
  };

  const submitScope = async () => {
    if (!phaseData) return;
    try {
      const updatedPhase = await main.createOrUpdatePhase({
        ...phaseData,
        phase_scope: scope
      });
      if (updatedPhase) {
        setPhaseData(updatedPhase);
        setScope(updatedPhase.phase_scope || '');
        setEditScope(true);
        setToasts([
          {
            id: `${Date.now()}-scope-success`,
            title: 'Success',
            color: 'success',
            text: 'Scope updated successfully!'
          }
        ]);
      }
    } catch (error) {
      console.error('Error updating phase scope:', error);
      setToasts([
        {
          id: `${Date.now()}-scope-error`,
          title: 'Error',
          color: 'danger',
          text: 'Failed to update scope'
        }
      ]);
    }
  };

  const submitDesign = async () => {
    if (!phaseData) return;
    try {
      const updatedPhase = await main.createOrUpdatePhase({
        ...phaseData,
        phase_design: design
      });
      if (updatedPhase) {
        setPhaseData(updatedPhase);
        setDesign(updatedPhase.phase_design || '');
        setEditDesign(true);
        setToasts([
          {
            id: `${Date.now()}-design-success`,
            title: 'Success',
            color: 'success',
            text: 'Design updated successfully!'
          }
        ]);
      }
    } catch (error) {
      console.error('Error updating phase design:', error);
      setToasts([
        {
          id: `${Date.now()}-design-error`,
          title: 'Error',
          color: 'danger',
          text: 'Failed to update design'
        }
      ]);
    }
  };

  const getFeatureData = useCallback(async () => {
    if (!feature_uuid) return;
    const data = await main.getFeaturesByUuid(feature_uuid);
    return data;
  }, [feature_uuid, main]);

  const getPhaseData = useCallback(async () => {
    if (!feature_uuid || !phase_uuid) return;
    const data = await main.getFeaturePhaseByUUID(feature_uuid, phase_uuid);
    return data;
  }, [feature_uuid, phase_uuid, main]);

  const getPhaseTickets = useCallback(async () => {
    if (!feature_uuid || !phase_uuid) return;
    const data = await main.getTicketDataByPhase(feature_uuid, phase_uuid);
    return data;
  }, [feature_uuid, phase_uuid, main]);

  const getTotalBounties = useCallback(
    async (statusData: any) => {
      if (phase_uuid) {
        const totalBounties = await main.getTotalPhaseBountyCount(
          feature_uuid,
          phase_uuid,
          statusData.Open,
          statusData.Assigned,
          statusData.Paid
        );
        setTotalBounties(totalBounties);
      }
    },
    [phase_uuid, main, feature_uuid]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const feature = await getFeatureData();
        const phase = await getPhaseData();
        const phaseTickets = await getPhaseTickets();

        if (!feature || !phase || !Array.isArray(phaseTickets)) {
          history.push('/');
        } else {
          phaseTicketStore.clearPhaseTickets(phase_uuid);

          for (const ticket of phaseTickets) {
            if (ticket.UUID) {
              ticket.uuid = ticket.UUID;
            }
            phaseTicketStore.addTicket(ticket);
          }
          setFeatureData(feature);
          setPhaseData(phase);
          setPurpose(phase.phase_purpose || '');
          setOutcome(phase.phase_outcome || '');
          setScope(phase.phase_scope || '');
          setDesign(phase.phase_design || '');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        history.push('/');
      }
    };

    fetchData();
  }, [getFeatureData, getPhaseData, history, getPhaseTickets, phase_uuid]);

  const handleClose = () => {
    history.push(`/feature/${feature_uuid}`);
  };

  const addTicketHandler = async () => {
    const newTicketUuid = uuidv4();
    const latestTickets = phaseTicketStore.organizeTicketsByGroup(tickets);
    const initialTicketData = {
      uuid: newTicketUuid,
      feature_uuid,
      phase_uuid,
      name: '',
      sequence: latestTickets.length + 1,
      dependency: [],
      description: '',
      status: 'DRAFT' as TicketStatus,
      version: 1,
      number: latestTickets.length + 1
    };

    const ticketPayload = {
      metadata: {
        source: 'websocket',
        id: websocketSessionId
      },
      ticket: initialTicketData
    };

    try {
      await main.createUpdateTicket(ticketPayload);
      phaseTicketStore.addTicket(initialTicketData as Ticket);
    } catch (error) {
      console.error('Error registering ticket:', error);
    }
  };

  const onDragEnd = async ({ source, destination }: any) => {
    if (!source || !destination) {
      console.warn('Invalid drag event: missing source or destination');
      return;
    }
    if (source.index === destination.index) {
      console.log('No movement detected in drag');
      return;
    }

    const latestTickets = phaseTicketStore
      .organizeTicketsByGroup(tickets)
      .sort((a: Ticket, b: Ticket) => a.sequence - b.sequence);
    const reorderedTickets = Array.from(latestTickets);
    const [movedTicket] = reorderedTickets.splice(source.index, 1);
    reorderedTickets.splice(destination.index, 0, movedTicket);

    reorderedTickets.forEach((ticket: Ticket, idx: number) => {
      phaseTicketStore.updateTicket(ticket.uuid, { ...ticket, sequence: idx + 1 });
    });

    try {
      await Promise.all(
        reorderedTickets.map((ticket: Ticket, index: number) => {
          const updatedTicket = { ...ticket, sequence: index + 1 };
          return main.updateTicketSequence({
            ticket: updatedTicket
          });
        })
      );

      console.log('Ticket order updated successfully');
    } catch (error) {
      console.error('Error updating ticket order:', error);
    }
  };

  useEffect(() => {
    if (phase_uuid) {
      (async () => {
        setLoading(true);

        await main.getPhaseBounties(feature_uuid, phase_uuid, {
          page: 1,
          resetPage: true,
          ...checkboxIdToSelectedMap,
          languages: languageString
        });

        await getTotalBounties(checkboxIdToSelectedMap);

        setLoading(false);
      })();
    }
  }, [main, checkboxIdToSelectedMap, languageString, getTotalBounties, feature_uuid, phase_uuid]);

  const onPanelClick = (activeWorkspace?: string, bounty?: any) => {
    if (bounty?.id) {
      history.push(`/bounty/${bounty.id}`);
    } else {
      history.push(`/feature/${feature_uuid}/phase/${phase_uuid}/planner`);
    }
  };

  const toastsEl = (
    <EuiGlobalToastList toasts={toasts} dismissToast={() => setToasts([])} toastLifeTimeMs={3000} />
  );

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

  const selectedTicketCount = Object.values(selectedTickets).filter(Boolean).length;

  const handleBulkConvert = async () => {
    if (isConverting) return;
    setIsConverting(true);

    try {
      const ticketsToConvert = Object.entries(selectedTickets)
        .filter(([, isSelected]) => isSelected)
        .map(([uuid]) => ({ ticketUUID: uuid }));

      const response = await main.convertTicketsToBounties({
        tickets_to_bounties: ticketsToConvert
      });

      if (response?.success) {
        setToasts([
          {
            id: `${Date.now()}-bulk-convert-success`,
            title: 'Success',
            color: 'success',
            text: 'Successfully converted tickets to bounties'
          }
        ]);

        setSelectedTickets({});

        const phaseTickets = await getPhaseTickets();
        if (Array.isArray(phaseTickets)) {
          phaseTicketStore.clearPhaseTickets(phase_uuid);
          for (const ticket of phaseTickets) {
            phaseTicketStore.addTicket(ticket);
          }
        }
      } else {
        throw new Error(response?.message || 'Failed to convert tickets');
      }
    } catch (error) {
      console.error('Error in bulk conversion:', error);
      setToasts([
        {
          id: `${Date.now()}-bulk-convert-error`,
          title: 'Error',
          color: 'danger',
          text: 'Failed to convert tickets to bounties'
        }
      ]);
    } finally {
      setIsConverting(false);
      setIsConversionModalOpen(false);
    }
  };

  return (
    <MainContent collapsed={collapsed}>
      <FeatureBody>
        <ActivitiesHeader uuid={featureData?.workspace_uuid || ''} />
        <SidebarComponent uuid={featureData?.workspace_uuid || ''} />
        <FeatureHeadWrap>
          <FeatureHeadNameWrap>
            <MaterialIcon
              onClick={handleClose}
              icon={'arrow_back'}
              style={{
                fontSize: 25,
                cursor: 'pointer'
              }}
            />
            <WorkspaceName>Phase Planner</WorkspaceName>
          </FeatureHeadNameWrap>
        </FeatureHeadWrap>
        <FeatureDataWrap>
          <FieldWrap>
            <PhaseFlexContainer>
              <PhaseLabel>
                Feature Name: <LabelValue>{featureData?.name}</LabelValue>
              </PhaseLabel>
              <PhaseLabel>
                Phase: <LabelValue>{phaseData?.name}</LabelValue>
              </PhaseLabel>
              <FieldWrap>
                <Label>Purpose</Label>
                <Data>
                  <EditableField
                    value={purpose ?? phaseData?.phase_purpose ?? ''}
                    setValue={setPurpose}
                    isEditing={editPurpose}
                    previewMode={purposePreviewMode}
                    setPreviewMode={setPurposePreviewMode}
                    placeholder="Purpose"
                    dataTestIdPrefix="purpose"
                    workspaceUUID={featureData?.workspace_uuid ?? ''}
                    onCancel={() => setEditPurpose(true)}
                    onUpdate={submitPurpose}
                  />
                </Data>
              </FieldWrap>

              <FieldWrap>
                <Label>Outcome</Label>
                <Data>
                  <EditableField
                    value={outcome ?? phaseData?.phase_outcome ?? ''}
                    setValue={setOutcome}
                    isEditing={editOutcome}
                    previewMode={outcomePreviewMode}
                    setPreviewMode={setOutcomePreviewMode}
                    placeholder="Outcome"
                    dataTestIdPrefix="outcome"
                    workspaceUUID={featureData?.workspace_uuid}
                    onCancel={() => setEditOutcome(true)}
                    onUpdate={submitOutcome}
                  />
                </Data>
              </FieldWrap>

              <FieldWrap>
                <Label>Scope</Label>
                <Data>
                  <EditableField
                    value={scope ?? phaseData?.phase_scope ?? ''}
                    setValue={setScope}
                    isEditing={editScope}
                    previewMode={scopePreviewMode}
                    setPreviewMode={setScopePreviewMode}
                    placeholder="Scope"
                    dataTestIdPrefix="scope"
                    workspaceUUID={featureData?.workspace_uuid}
                    onCancel={() => setEditScope(true)}
                    onUpdate={submitScope}
                  />
                </Data>
              </FieldWrap>

              <FieldWrap>
                <Label>Design</Label>
                <Data>
                  <EditableField
                    value={design ?? phaseData?.phase_design ?? ''}
                    setValue={setDesign}
                    isEditing={editDesign}
                    previewMode={designPreviewMode}
                    setPreviewMode={setDesignPreviewMode}
                    placeholder="Design"
                    dataTestIdPrefix="design"
                    workspaceUUID={featureData?.workspace_uuid}
                    onCancel={() => setEditDesign(true)}
                    onUpdate={submitDesign}
                  />
                </Data>
              </FieldWrap>

              {isBulkCreateEnabled && selectedTicketCount >= 2 && (
                <BulkConvertButton
                  onClick={() => setIsConversionModalOpen(true)}
                  disabled={isConverting}
                >
                  Convert Selected to Bounties ({selectedTicketCount})
                </BulkConvertButton>
              )}

              <EuiDragDropContext onDragEnd={onDragEnd}>
                <EuiDroppable droppableId="ticketDroppable" spacing="m">
                  {phaseTicketStore
                    .organizeTicketsByGroup(tickets)
                    .sort((a: Ticket, b: Ticket) => a.sequence - b.sequence)
                    .map((ticket: Ticket, index: number) => (
                      <EuiDraggable
                        spacing="m"
                        key={ticket.uuid}
                        index={index}
                        draggableId={ticket.uuid}
                        customDragHandle
                        hasInteractiveChildren
                      >
                        {(provided: any) => (
                          <div {...provided.dragHandleProps} ref={provided.innerRef}>
                            <TicketEditor
                              index={index}
                              ticketData={ticket}
                              logs={logs}
                              websocketSessionId={websocketSessionId}
                              draggableId={ticket.uuid}
                              hasInteractiveChildren
                              dragHandleProps={provided.dragHandleProps}
                              swwfLink={swwfLinks[ticket.uuid]}
                              getPhaseTickets={getPhaseTickets}
                              workspaceUUID={featureData?.workspace_uuid || ''}
                              selectedTickets={selectedTickets}
                              onSelectTicket={handleSelectTicket}
                              collapsed={collapsed}
                            />
                          </div>
                        )}
                      </EuiDraggable>
                    ))}
                </EuiDroppable>
              </EuiDragDropContext>
              <AddTicketButton>
                <ActionButton
                  color="primary"
                  onClick={addTicketHandler}
                  data-testid="audio-generation-btn"
                >
                  Add Ticket
                </ActionButton>
              </AddTicketButton>
              <DisplayBounties>
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    overflowY: 'auto'
                  }}
                >
                  {totalBounties > 0 ? (
                    <WidgetSwitchViewer
                      onPanelClick={onPanelClick}
                      checkboxIdToSelectedMap={checkboxIdToSelectedMap}
                      checkboxIdToSelectedMapLanguage={checkboxIdToSelectedMapLanguage}
                      fromBountyPage={true}
                      selectedWidget={selectedWidget}
                      loading={loading}
                      page={page}
                      setPage={setPage}
                      languageString={languageString}
                      phaseTotalBounties={totalBounties}
                      featureUuid={feature_uuid}
                      phaseUuid={phase_uuid}
                    />
                  ) : (
                    <p>No Bounties Yet!</p>
                  )}
                </div>
              </DisplayBounties>
            </PhaseFlexContainer>
          </FieldWrap>
          {isEnabled && <StakworkLogsPanel swwfLinks={swwfLinks} logs={logs} setLogs={setLogs} />}
          {isConversionModalOpen && (
            <EuiModal
              onClose={() => setIsConversionModalOpen(false)}
              maxWidth={500}
              style={{
                backgroundColor: 'white',
                color: '#333',
                borderRadius: '8px',
                padding: '24px'
              }}
            >
              <EuiModalHeader>
                <EuiModalHeaderTitle style={{ color: '#333' }}>
                  Convert Tickets to Bounties
                </EuiModalHeaderTitle>
              </EuiModalHeader>

              <EuiModalBody>
                <p style={{ color: '#333', marginBottom: '16px' }}>
                  Are you sure you want to convert these {selectedTicketCount} tickets to bounties?
                </p>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: '0',
                    margin: '0'
                  }}
                >
                  {Object.entries(selectedTickets)
                    .filter(([, isSelected]) => isSelected)
                    .map(([uuid]) => {
                      const ticket = tickets.find((t) => t.uuid === uuid);
                      return ticket ? (
                        <li
                          key={uuid}
                          style={{
                            padding: '8px 0',
                            borderBottom: '1px solid #eee',
                            color: '#333'
                          }}
                        >
                          {ticket.name || 'Unnamed Ticket'}
                        </li>
                      ) : null;
                    })}
                </ul>
              </EuiModalBody>

              <EuiModalFooter
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '15px'
                }}
              >
                <ActionButton
                  onClick={() => setIsConversionModalOpen(false)}
                  color="cancel"
                  style={{
                    backgroundColor: '#f5f5f5',
                    color: '#333',
                    border: '1px solid #ddd',
                    padding: '8px 24px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </ActionButton>
                <ActionButton
                  color="primary"
                  onClick={handleBulkConvert}
                  disabled={isConverting}
                  style={{
                    backgroundColor: '#618aff',
                    color: 'white',
                    border: 'none',
                    padding: '8px 24px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {isConverting ? 'Converting...' : 'Convert'}
                </ActionButton>
              </EuiModalFooter>
            </EuiModal>
          )}
        </FeatureDataWrap>
        {toastsEl}
      </FeatureBody>
    </MainContent>
  );
});

export default PhasePlannerView;
