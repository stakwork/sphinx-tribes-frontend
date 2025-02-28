/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/typedef */
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams, useHistory } from 'react-router-dom';
import { Feature, Ticket, TicketMessage, TicketStatus, Author } from 'store/interface';
import MaterialIcon from '@material/react-material-icon';
import { useStores } from 'store';
import { v4 as uuidv4 } from 'uuid';
import {
  FeatureBody,
  FeatureDataWrap,
  FieldWrap,
  LabelValue,
  StyledLink
} from 'pages/tickets/style';
import { SOCKET_MSG } from 'config/socket';
import { createSocketInstance } from 'config/socket';
import { EuiGlobalToastList } from '@elastic/eui';
import TicketEditor from 'components/common/TicketEditor/TicketEditor';
import SidebarComponent from 'components/common/SidebarComponent';
import styled from 'styled-components';
import { phaseTicketStore } from '../../../store/phase';
import StakworkLogsPanel from '../../../components/common/TicketEditor/StakworkLogsPanel';
import {
  FeatureHeadNameWrap,
  FeatureHeadWrap,
  SelectWrapper,
  SelectLabel,
  StyledSelect,
  WorkspaceName,
  PhaseFlexContainer
} from './style';
import { Phase, Toast } from './interface';
import ActivitiesHeader from './Activities/header';

interface WorkspaceParams {
  workspaceId: string;
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

const WorkspaceTicketCreateView: React.FC = observer(() => {
  const { workspaceId } = useParams<WorkspaceParams>();
  const [websocketSessionId, setWebsocketSessionId] = useState<string>('');
  const [swwfLinks, setSwwfLinks] = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<string>('');
  const [selectedPhase, setSelectedPhase] = useState<string>('');
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(false);
  const [isLoadingPhases, setIsLoadingPhases] = useState(false);
  const { main } = useStores();
  const history = useHistory();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [workspace, setWorkspace] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [ticketGroupId] = useState(uuidv4());

  const defaultTicket = useMemo(
    () => ({
      uuid: uuidv4(),
      name: '',
      sequence: 1,
      dependency: [],
      description: '',
      status: 'DRAFT' as TicketStatus,
      version: 1,
      feature_uuid: selectedFeature,
      phase_uuid: selectedPhase,
      category: '',
      amount: 0,
      ticket_group: ticketGroupId,
      author: 'HUMAN' as Author,
      author_id: ''
    }),
    [selectedFeature, selectedPhase, ticketGroupId]
  );

  useEffect(() => {
    phaseTicketStore.addTicket(defaultTicket);
    return () => phaseTicketStore.clearPhaseTickets(defaultTicket.uuid);
  }, [defaultTicket]);

  const emptyTicket = useMemo(
    () => ({
      ...defaultTicket,
      uuid: uuidv4(),
      feature_uuid: selectedFeature,
      phase_uuid: selectedPhase,
      ticket_group: ticketGroupId
    }),
    [defaultTicket, selectedFeature, selectedPhase, ticketGroupId]
  );

  useEffect(() => {
    const loadWorkspace = async () => {
      if (!workspaceId) return;

      try {
        const workspaceData = await main.getUserWorkspaceByUuid(workspaceId);
        if (workspaceData) {
          setWorkspace(workspaceData);
        } else {
          console.error('Failed to load workspace data');
          setToasts([
            {
              id: `error-${Date.now()}`,
              title: 'Error',
              color: 'danger',
              text: 'Failed to load workspace data'
            }
          ]);
        }
      } catch (error) {
        console.error('Error loading workspace:', error);
      }
    };

    loadWorkspace();
  }, [workspaceId, main]);

  useEffect(() => {
    const loadFeatures = async () => {
      if (!workspaceId || !workspace) return;

      setIsLoadingFeatures(true);
      try {
        const workspaceFeatures = await main.getWorkspaceFeatures(workspaceId, {
          sortBy: 'priority',
          limit: 100,
          direction: 'asc',
          search: '',
          page: 1,
          resetPage: false
        });

        if (Array.isArray(workspaceFeatures)) {
          setFeatures(workspaceFeatures);
        } else {
          console.error('Features response is not an array:', workspaceFeatures);
        }
      } catch (error) {
        console.error('Error loading features:', error);
        setToasts([
          {
            id: `error-${Date.now()}`,
            title: 'Error',
            color: 'danger',
            text: 'Failed to load features'
          }
        ]);
      } finally {
        setIsLoadingFeatures(false);
      }
    };

    loadFeatures();
  }, [workspaceId, workspace, main]);

  useEffect(() => {
    const loadPhases = async () => {
      if (!selectedFeature) {
        setPhases([]);
        return;
      }

      setIsLoadingPhases(true);
      try {
        const featurePhases = await main.getFeaturePhases(selectedFeature);
        if (Array.isArray(featurePhases)) {
          setPhases(featurePhases);
        }
      } catch (error) {
        console.error('Error loading phases:', error);
      } finally {
        setIsLoadingPhases(false);
      }
    };

    loadPhases();
  }, [selectedFeature, main]);

  useEffect(() => {
    const socket = createSocketInstance();

    socket.onopen = () => {
      console.log('Socket connected in Workspace Ticket Create View');
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
      console.log('Raw websocket message received:', event.data);

      try {
        const data = JSON.parse(event.data);

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

  const getPhaseTickets = useCallback(async () => {
    const storeTickets = phaseTicketStore.getPhaseTickets(selectedPhase);
    return [...storeTickets, defaultTicket];
  }, [selectedPhase, defaultTicket]);

  const handleFeatureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const featureUuid = e.target.value;
    setSelectedFeature(featureUuid);
    setSelectedPhase('');
  };

  const handlePhaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPhase(e.target.value);
  };

  const handleClose = () => {
    history.push(`/workspace/${workspaceId}/planner`);
  };

  const handleTicketSaved = (ticketUuid: string) => {
    if (ticketUuid) {
      history.push(`/workspace/${workspaceId}/ticket/${ticketUuid}`);
    } else {
      console.error('No ticket UUID received');
      setToasts([
        {
          id: `error-${Date.now()}`,
          title: 'Something Wrong!',
          color: 'danger',
          text: 'Failed to get ticket details'
        }
      ]);
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

  return (
    <MainContent collapsed={collapsed}>
      <FeatureBody>
        <SidebarComponent uuid={workspaceId} />
        <ActivitiesHeader uuid={workspaceId} />
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
            <WorkspaceName>Create New Ticket</WorkspaceName>
          </FeatureHeadNameWrap>
        </FeatureHeadWrap>
        <FeatureDataWrap>
          <FieldWrap>
            <SelectWrapper>
              <SelectLabel>Feature:</SelectLabel>
              <StyledSelect
                value={selectedFeature}
                onChange={handleFeatureChange}
                disabled={isLoadingFeatures}
              >
                <option value="">Select Feature</option>
                {features.map((feature: Feature) => (
                  <option key={feature.uuid} value={feature.uuid}>
                    {feature.name}
                  </option>
                ))}
              </StyledSelect>
            </SelectWrapper>

            <SelectWrapper>
              <SelectLabel>Phase:</SelectLabel>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <StyledSelect
                  value={selectedPhase}
                  onChange={handlePhaseChange}
                  disabled={isLoadingPhases || !selectedFeature}
                >
                  <option value="">Select Phase</option>
                  {phases.map((phase: Phase) => (
                    <option key={phase.uuid} value={phase.uuid}>
                      {phase.name}
                    </option>
                  ))}
                </StyledSelect>
                {selectedFeature && selectedPhase && (
                  <LabelValue>
                    <StyledLink
                      onClick={() =>
                        window.open(
                          `/feature/${selectedFeature}/phase/${selectedPhase}/planner`,
                          '_blank'
                        )
                      }
                    >
                      [Phase Planner]
                    </StyledLink>
                  </LabelValue>
                )}
              </div>
            </SelectWrapper>

            <PhaseFlexContainer style={{ height: '600px' }}>
              <TicketEditor
                key={emptyTicket.uuid}
                ticketData={emptyTicket}
                logs={logs}
                websocketSessionId={websocketSessionId}
                swwfLink={swwfLinks[emptyTicket.uuid]}
                getPhaseTickets={getPhaseTickets}
                workspaceUUID={workspaceId}
                draggableId={emptyTicket.uuid}
                hasInteractiveChildren={false}
                onTicketUpdate={(updatedTicket) => handleTicketSaved(updatedTicket.uuid)}
                showFeaturePhaseDropdowns={true}
                showVersionSelector={true}
                showDragHandle={false}
                showSWWFLink={false}
                index={0}
                selectedTickets={{}}
                onSelectTicket={() => {}}
                showCheckbox={false}
              />
            </PhaseFlexContainer>
          </FieldWrap>
          <StakworkLogsPanel swwfLinks={swwfLinks} logs={logs} setLogs={setLogs} />
        </FeatureDataWrap>
        {toastsEl}
      </FeatureBody>
    </MainContent>
  );
});

export default WorkspaceTicketCreateView;
