import React, { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams, useHistory } from 'react-router-dom';
import { Feature, Ticket, TicketMessage, TicketStatus } from 'store/interface';
import MaterialIcon from '@material/react-material-icon';
import TicketEditor from 'components/common/TicketEditor/TicketEditor';
import { useStores } from 'store';
import { v4 as uuidv4 } from 'uuid';
import {
  FeatureBody,
  FeatureDataWrap,
  FieldWrap,
  PhaseLabel,
  LabelValue,
  AddTicketButton
} from 'pages/tickets/style';
import { SOCKET_MSG } from 'config/socket';
import { createSocketInstance } from 'config/socket';
import { phaseTicketStore } from '../../store/phase';
import {
  FeatureHeadNameWrap,
  FeatureHeadWrap,
  WorkspaceName,
  PhaseFlexContainer,
  ActionButton
} from './workspace/style';
import { Phase } from './workspace/interface';

interface PhasePlannerParams {
  feature_uuid: string;
  phase_uuid: string;
}

const PhasePlannerView: React.FC = observer(() => {
  const { feature_uuid, phase_uuid } = useParams<PhasePlannerParams>();
  const [featureData, setFeatureData] = useState<Feature | null>(null);
  const [phaseData, setPhaseData] = useState<Phase | null>(null);
  const [websocketSessionId, setWebsocketSessionId] = useState<string>('');
  const { main } = useStores();
  const history = useHistory();
  const tickets = phaseTicketStore.getPhaseTickets(phase_uuid);

  useEffect(() => {
    const socket = createSocketInstance();

    socket.onopen = () => {
      console.log('Socket connected in Phase Planner');
    };

    const refreshSingleTicket = async (ticketUuid: string) => {
      try {
        const ticket = await main.getTicketDetails(ticketUuid);
        phaseTicketStore.updateTicket(ticket.uuid, ticket);
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
          console.log(`Websocket Session ID: ${sessionId}`);
          return;
        }

        const ticketMessage = data as TicketMessage;

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const feature = await getFeatureData();
        const phase = await getPhaseData();
        const phaseTickets = await getPhaseTickets();

        if (!feature || !phase || !Array.isArray(phaseTickets)) {
          history.push('/');
        } else {
          // Clear existing tickets for this phase before adding new ones
          phaseTicketStore.clearPhaseTickets(phase_uuid);

          // Add fetched tickets
          for (const ticket of phaseTickets) {
            if (ticket.UUID) {
              ticket.uuid = ticket.UUID;
            }
            phaseTicketStore.addTicket(ticket);
          }
          setFeatureData(feature);
          setPhaseData(phase);
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
    const initialTicketData = {
      uuid: newTicketUuid,
      feature_uuid,
      phase_uuid,
      name: '',
      sequence: tickets.length + 1,
      dependency: [],
      description: '',
      status: 'DRAFT' as TicketStatus,
      version: 1,
      number: tickets.length + 1
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
            {tickets.map((ticket: Ticket) => (
              <TicketEditor
                key={ticket.uuid}
                ticketData={ticket}
                websocketSessionId={websocketSessionId}
              />
            ))}
            <AddTicketButton>
              <ActionButton
                color="primary"
                onClick={addTicketHandler}
                data-testid="audio-generation-btn"
              >
                Add Ticket
              </ActionButton>
            </AddTicketButton>
          </PhaseFlexContainer>
        </FieldWrap>
      </FeatureDataWrap>
    </FeatureBody>
  );
});

export default PhasePlannerView;
