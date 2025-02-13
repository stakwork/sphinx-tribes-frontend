/* eslint-disable @typescript-eslint/typedef */
import React, { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams, useHistory } from 'react-router-dom';
import { useStores } from 'store';
import { EuiFlexGroup, EuiFlexItem, EuiLoadingSpinner } from '@elastic/eui';
import MaterialIcon from '@material/react-material-icon';
import { createSocketInstance, SOCKET_MSG } from 'config/socket';
import WorkspaceTicketEditor from 'components/common/TicketEditor/WorkspaceTicketEditor';
import { workspaceTicketStore } from '../../../store/workspace-ticket';
import { Feature, TicketMessage } from '../../../store/interface';
import { FeatureBody, FeatureDataWrap, LabelValue, StyledLink } from '../../../pages/tickets/style';
import {
  FeatureHeadWrap,
  FeatureHeadNameWrap,
  WorkspaceName,
  SelectWrapper,
  StyledSelect
} from './style';
import { Phase } from './interface.ts';

const WorkspaceTicketView: React.FC = observer(() => {
  const { workspaceId, ticketId } = useParams<{ workspaceId: string; ticketId: string }>();
  const [websocketSessionId, setWebsocketSessionId] = useState<string>('');
  const [swwfLinks, setSwwfLinks] = useState<Record<string, string>>({});
  const [featureData, setFeatureData] = useState<Feature | null>(null);
  const [phaseData, setPhaseData] = useState<Phase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { main } = useStores();
  const history = useHistory();
  const [currentTicketId, setCurrentTicketId] = useState<string>(ticketId);
  const [availableFeatures, setAvailableFeatures] = useState<Feature[]>([]);
  const [availablePhases, setAvailablePhases] = useState<Phase[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

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
    const fetchTicketAndVersions = async () => {
      try {
        setIsLoading(true);
        const groupTickets = await main.getTicketsByGroup(ticketId);

        if (groupTickets && Array.isArray(groupTickets) && groupTickets.length > 0) {
          workspaceTicketStore.clearTickets();

          for (const ticket of groupTickets) {
            if (ticket.UUID) {
              ticket.uuid = ticket.UUID;
            }
            workspaceTicketStore.addTicket(ticket);
          }

          const groupId = groupTickets[0].ticket_group || ticketId;

          const latestVersion = workspaceTicketStore.getLatestVersionFromGroup(groupId);

          if (latestVersion) {
            workspaceTicketStore.addTicket(latestVersion);
            setCurrentTicketId(latestVersion.uuid);
          }
        }
      } catch (error) {
        console.error('Error fetching ticket and versions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicketAndVersions();
  }, [ticketId, main]);

  const handleClose = () => {
    history.push(`/workspace/${workspaceId}/planner`);
  };

  const getTickets = async () => {
    const ticket = workspaceTicketStore.getTicket(currentTicketId);
    return ticket ? [ticket] : [];
  };

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
          setFeatureData(feature);
          setPhaseData(phase);
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

  // Fetch available features when component mounts
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const features = await main.getWorkspaceFeatures(workspaceId, {});
        setAvailableFeatures(features);
      } catch (error) {
        console.error('Error fetching features:', error);
      }
    };
    fetchFeatures();
  }, [main]);

  // Fetch phases when feature is selected
  useEffect(() => {
    const fetchPhases = async () => {
      if (selectedFeature?.uuid) {
        try {
          const phases = await main.getFeaturePhases(selectedFeature.uuid);
          setAvailablePhases(phases);
        } catch (error) {
          console.error('Error fetching phases:', error);
        }
      }
    };
    fetchPhases();
  }, [selectedFeature?.uuid, main]);

  const handleFeatureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const featureUuid = e.target.value;
    const selectedFeature = availableFeatures.find((f) => f.uuid === featureUuid);

    if (selectedFeature) {
      setSelectedFeature(selectedFeature);
      setFeatureData(selectedFeature);
      // Clear phase data when feature changes
      setPhaseData(null);
      setAvailablePhases([]);
    }
  };

  const handlePhaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const phaseUuid = e.target.value;
    const selectedPhase = availablePhases.find((p) => p.uuid === phaseUuid);
    if (selectedPhase) {
      setPhaseData(selectedPhase);
    }
  };

  const handleSave = async () => {
    if (currentTicket) {
      try {
        await main.createUpdateTicket({
          metadata: { source: 'workspace', id: currentTicket.uuid },
          ticket: {
            ...currentTicket,
            feature_uuid: featureData?.uuid || '',
            phase_uuid: phaseData?.uuid || ''
          }
        });
        // Show success notification or refresh data
      } catch (error) {
        console.error('Error updating ticket:', error);
      }
    }
  };

  if (isLoading) {
    return (
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
    );
  }

  if (!currentTicket) {
    return (
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
    );
  }

  return (
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
        <SelectWrapper>
          <StyledSelect value={selectedFeature?.uuid || ''} onChange={handleFeatureChange}>
            <option value="">Select Feature</option>
            {availableFeatures.map((f) => (
              <option key={f.uuid} value={f.uuid}>
                {f.name}
              </option>
            ))}
          </StyledSelect>
        </SelectWrapper>
        <SelectWrapper style={{ marginBottom: '10px' }}>
          <StyledSelect
            value={phaseData?.uuid || ''}
            onChange={handlePhaseChange}
            disabled={!selectedFeature}
          >
            <option value="">Select Phase</option>
            {availablePhases.map((p) => (
              <option key={p.uuid} value={p.uuid}>
                {p.name}
              </option>
            ))}
          </StyledSelect>
          {selectedFeature && phaseData && (
            <LabelValue style={{ marginTop: '10px' }}>
              <StyledLink onClick={handleLinkClick}>[Phase Planner]</StyledLink>
            </LabelValue>
          )}
        </SelectWrapper>
        <WorkspaceTicketEditor
          ticketData={currentTicket}
          websocketSessionId={websocketSessionId}
          index={0}
          draggableId={currentTicket.uuid}
          hasInteractiveChildren={false}
          swwfLink={swwfLinks[currentTicket.uuid]}
          getPhaseTickets={getTickets}
          onSave={handleSave}
        />
      </FeatureDataWrap>
    </FeatureBody>
  );
});

export default WorkspaceTicketView;
