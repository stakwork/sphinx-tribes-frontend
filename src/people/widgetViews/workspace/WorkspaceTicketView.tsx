/* eslint-disable @typescript-eslint/typedef */
import React, { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams, useHistory } from 'react-router-dom';
import { useStores } from 'store';
import { EuiFlexGroup, EuiFlexItem, EuiLoadingSpinner } from '@elastic/eui';
import MaterialIcon from '@material/react-material-icon';
import { createSocketInstance, SOCKET_MSG } from 'config/socket';
import SidebarComponent from 'components/common/SidebarComponent.tsx';
import styled from 'styled-components';
import TicketEditor from 'components/common/TicketEditor/TicketEditor';
import { workspaceTicketStore } from '../../../store/workspace-ticket';
import { phaseTicketStore } from '../../../store/phase';
import { Feature, Ticket, TicketMessage } from '../../../store/interface';
import { FeatureBody, FeatureDataWrap, LabelValue, StyledLink } from '../../../pages/tickets/style';
import {
  FeatureHeadWrap,
  FeatureHeadNameWrap,
  WorkspaceName,
  StyledSelect,
  SelectLabel,
  SelectWrapper
} from './style';
import { Phase } from './interface.ts';
import ActivitiesHeader from './Activities/header.tsx';

interface LogEntry {
  timestamp: string;
  projectId: string;
  ticketUUID: string;
  message: string;
}

interface Connection {
  projectId: string;
  ticketUUID: string;
  websocket: WebSocket;
  status: 'disconnected' | 'connected' | 'error';
}

const MainContent = styled.div<{ collapsed: boolean }>`
  margin-left: ${({ collapsed }) => (collapsed ? '60px' : '250px')};
  transition: margin-left 0.3s ease-in-out;
  width: ${({ collapsed }) => (collapsed ? 'calc(100% - 60px)' : 'calc(100% - 250px)')};
`;

const WorkspaceTicketView: React.FC = observer(() => {
  const { workspaceId, ticketId } = useParams<{ workspaceId: string; ticketId: string }>();
  const [websocketSessionId, setWebsocketSessionId] = useState<string>('');
  const [swwfLinks, setSwwfLinks] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { main } = useStores();
  const history = useHistory();
  const [currentTicketId, setCurrentTicketId] = useState<string>(ticketId);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(false);
  const [isLoadingPhases, setIsLoadingPhases] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const socket = createSocketInstance();

    socket.onopen = () => {
      console.log('Socket connected in Workspace Ticket View');
    };

    const refreshSingleTicket = async (ticketUuid: string) => {
      try {
        const ticket = await main.getTicketDetails(ticketUuid);

        if (ticket.UUID) {
          ticket.uuid = ticket.UUID;
        }

        workspaceTicketStore.addTicket(ticket);

        const groupId = ticket.ticket_group || ticket.uuid;
        const latestTicket = workspaceTicketStore.getLatestVersionFromGroup(groupId);

        if (latestTicket) {
          workspaceTicketStore.updateTicket(latestTicket.uuid, latestTicket);
          setCurrentTicketId(latestTicket.uuid);
        }
      } catch (error) {
        console.error('Error on refreshing ticket:', error);
      }
    };

    socket.onmessage = async (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        if (data.msg === SOCKET_MSG.user_connect) {
          const sessionId = data.body;
          setWebsocketSessionId(sessionId);
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

        switch (ticketMessage.action) {
          case 'message':
            console.log('Received ticket message:', ticketMessage.message);
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

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [main]);

  useEffect(() => {
    const connectToLogWebSocket = (projectId: string, ticketUUID: string) => {
      const ws = new WebSocket('wss://jobs.stakwork.com/cable?channel=ProjectLogChannel');

      ws.onopen = () => {
        const command = {
          command: 'subscribe',
          identifier: JSON.stringify({ channel: 'ProjectLogChannel', id: projectId })
        };
        ws.send(JSON.stringify(command));
      };

      ws.onmessage = (event: any) => {
        const data = JSON.parse(event.data);
        if (data.type === 'ping') return;

        const messageData = data?.message;
        if (
          messageData &&
          (messageData.type === 'on_step_start' || messageData.type === 'on_step_complete')
        ) {
          setLogs((prev: LogEntry[]) => [
            {
              timestamp: new Date().toISOString(),
              projectId,
              ticketUUID,
              message: messageData.message
            },
            ...prev
          ]);
        }
      };

      ws.onerror = () => {
        setConnections((prev: Connection[]) =>
          prev.map((conn: Connection) =>
            conn.projectId === projectId ? { ...conn, status: 'error' } : conn
          )
        );
      };

      ws.onclose = () => {
        setConnections((prev: Connection[]) =>
          prev.map((conn: Connection) =>
            conn.projectId === projectId ? { ...conn, status: 'disconnected' } : conn
          )
        );
      };

      setConnections((prev: Connection[]) => [
        ...prev,
        { projectId, ticketUUID, websocket: ws, status: 'connected' }
      ]);
    };

    Object.entries(swwfLinks).forEach(([ticketUUID, projectId]: [string, string]) => {
      if (!connections.some((conn: Connection) => conn.projectId === projectId)) {
        connectToLogWebSocket(projectId, ticketUUID);
      }
    });

    return () => {
      connections.forEach((conn: Connection) => {
        if (!Object.values(swwfLinks).includes(conn.projectId)) {
          conn.websocket.close();
        }
      });
    };
  }, [connections, swwfLinks, setLogs]);

  useEffect(() => {
    const fetchTicketAndVersions = async () => {
      try {
        setIsLoading(true);

        const ticket = await main.getTicketDetails(ticketId);

        if (ticket) {
          if (ticket.UUID) ticket.uuid = ticket.UUID;

          workspaceTicketStore.addTicket(ticket);
          phaseTicketStore.addTicket(ticket);

          const groupTickets = ticket.ticket_group
            ? await main.getTicketsByGroup(ticket.ticket_group)
            : [];

          if (groupTickets?.length) {
            groupTickets.forEach((t) => {
              if (t.UUID) t.uuid = t.UUID;
              workspaceTicketStore.addTicket(t);
              phaseTicketStore.addTicket(t);
            });
          }
        }
      } catch (error) {
        console.error('Error fetching ticket:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (ticketId) fetchTicketAndVersions();
  }, [ticketId, main]);

  const getTickets = useCallback(
    async () => phaseTicketStore.getTicketsByGroup(currentTicketId),
    [currentTicketId]
  );

  const currentTicket = workspaceTicketStore.getTicket(currentTicketId);

  const getFeatureData = useCallback(async () => {
    if (!currentTicket?.feature_uuid) return;
    const data = await main.getFeaturesByUuid(currentTicket?.feature_uuid);
    return data;
  }, [currentTicket?.feature_uuid, main]);

  const getPhaseData = useCallback(async () => {
    if (!currentTicket?.feature_uuid || !currentTicket?.phase_uuid) return;
    const data = await main.getFeaturePhaseByUUID(
      currentTicket.feature_uuid,
      currentTicket.phase_uuid
    );
    return data;
  }, [currentTicket?.feature_uuid, currentTicket?.phase_uuid, main]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const feature = await getFeatureData();
        const phase = await getPhaseData();
        if (feature && phase) {
          // setFeatureData(feature);
          // setPhaseData(phase);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [getFeatureData, getPhaseData]);

  const handleLinkClick = () => {
    window.open(
      `/feature/${currentTicket?.feature_uuid}/phase/${currentTicket?.phase_uuid}/planner`,
      '_target'
    );
  };

  useEffect(() => {
    const loadFeatures = async () => {
      setIsLoadingFeatures(true);
      try {
        const workspaceFeatures = await main.getWorkspaceFeatures(workspaceId, {});
        setFeatures(workspaceFeatures);
      } catch (error) {
        console.error('Error loading features:', error);
      } finally {
        setIsLoadingFeatures(false);
      }
    };
    loadFeatures();
  }, [workspaceId, main]);

  useEffect(() => {
    const loadPhases = async () => {
      if (!currentTicket?.feature_uuid) {
        setPhases([]);
        return;
      }

      setIsLoadingPhases(true);
      try {
        const featurePhases = await main.getFeaturePhases(currentTicket.feature_uuid);
        setPhases(featurePhases);
      } catch (error) {
        console.error('Error loading phases:', error);
      } finally {
        setIsLoadingPhases(false);
      }
    };
    loadPhases();
  }, [currentTicket?.feature_uuid, main]);

  const handleFeatureChange = async (featureUuid: string | undefined) => {
    if (!currentTicket) return;

    const updatedTicket: Partial<Ticket> = {
      ...currentTicket,
      feature_uuid: featureUuid,
      phase_uuid: undefined
    };

    workspaceTicketStore.updateTicket(currentTicket.uuid, updatedTicket);
    setCurrentTicketId(currentTicket.uuid);
  };

  const handlePhaseChange = async (phaseUuid: string | undefined) => {
    if (!currentTicket) return;

    const updatedTicket: Partial<Ticket> = {
      ...currentTicket,
      phase_uuid: phaseUuid
    };

    workspaceTicketStore.updateTicket(currentTicket.uuid, updatedTicket);
    setCurrentTicketId(currentTicket.uuid);
  };

  useEffect(() => {
    const currentTicket = workspaceTicketStore.getTicket(currentTicketId);
    if (currentTicket?.feature_uuid) {
      const loadPhases = async () => {
        setIsLoadingPhases(true);
        try {
          const featurePhases = await main.getFeaturePhases(currentTicket.feature_uuid as string);
          setPhases(featurePhases);
        } catch (error) {
          console.error('Error loading phases:', error);
        } finally {
          setIsLoadingPhases(false);
        }
      };
      loadPhases();
    }
  }, [currentTicketId, main]);

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

  const handleClose = () => {
    if (currentTicket?.feature_uuid) {
      history.push(`/workspace/${workspaceId}/feature/${currentTicket?.feature_uuid}`);
    } else {
      history.push(`/workspace/${workspaceId}/planner`);
    }
  };

  useEffect(
    () => () => {
      if (currentTicketId) {
        phaseTicketStore.clearPhaseTickets(currentTicketId);
      }
    },
    [currentTicketId]
  );

  if (isLoading) {
    return (
      <MainContent collapsed={collapsed}>
        <FeatureBody>
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
              <WorkspaceName>Ticket Editor</WorkspaceName>
            </FeatureHeadNameWrap>
          </FeatureHeadWrap>
          <EuiFlexGroup
            alignItems="center"
            justifyContent="center"
            style={{ height: 'calc(100vh - 100px)' }}
          >
            <EuiFlexItem grow={false}>
              <EuiLoadingSpinner size="xl" />
            </EuiFlexItem>
          </EuiFlexGroup>
        </FeatureBody>
      </MainContent>
    );
  }

  if (!currentTicket) {
    return (
      <MainContent collapsed={collapsed}>
        <FeatureBody>
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
              <WorkspaceName>Ticket Editor</WorkspaceName>
            </FeatureHeadNameWrap>
          </FeatureHeadWrap>
          <FeatureDataWrap>
            <div>Ticket not found</div>
          </FeatureDataWrap>
        </FeatureBody>
      </MainContent>
    );
  }

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
            <WorkspaceName>Ticket Editor</WorkspaceName>
          </FeatureHeadNameWrap>
        </FeatureHeadWrap>
        <FeatureDataWrap>
          <SelectWrapper>
            <SelectLabel>Feature:</SelectLabel>
            <StyledSelect
              value={currentTicket?.feature_uuid || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                handleFeatureChange(e.target.value || undefined)
              }
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
                value={currentTicket?.phase_uuid || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  handlePhaseChange(e.target.value || undefined)
                }
                disabled={isLoadingPhases || !currentTicket?.feature_uuid}
              >
                <option value="">Select Phase</option>
                {phases.map((phase: Phase) => (
                  <option key={phase.uuid} value={phase.uuid}>
                    {phase.name}
                  </option>
                ))}
              </StyledSelect>
              {currentTicket?.feature_uuid && currentTicket?.phase_uuid && (
                <LabelValue>
                  <StyledLink onClick={handleLinkClick}>[Phase Planner]</StyledLink>
                </LabelValue>
              )}
            </div>
          </SelectWrapper>
          <TicketEditor
            ticketData={currentTicket}
            websocketSessionId={websocketSessionId}
            logs={logs}
            index={0}
            draggableId={currentTicket.uuid}
            hasInteractiveChildren={false}
            swwfLink={swwfLinks[currentTicket.uuid]}
            getPhaseTickets={getTickets}
            workspaceUUID={workspaceId}
            onTicketUpdate={(updatedTicket: Ticket) => {
              workspaceTicketStore.updateTicket(updatedTicket.uuid, updatedTicket);
              setCurrentTicketId(updatedTicket.uuid);
            }}
            showFeaturePhaseDropdowns={false}
            showVersionSelector={true}
            showDragHandle={false}
            showSWWFLink={true}
            showCheckbox={false}
          />
        </FeatureDataWrap>
      </FeatureBody>
    </MainContent>
  );
});

export default WorkspaceTicketView;
