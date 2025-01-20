import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams, useHistory } from 'react-router-dom';
import { useStores } from 'store';
import { EuiFlexGroup, EuiFlexItem, EuiLoadingSpinner } from '@elastic/eui';
import MaterialIcon from '@material/react-material-icon';
import { createSocketInstance, SOCKET_MSG } from 'config/socket';
import WorkspaceTicketEditor from 'components/common/TicketEditor/WorkspaceTicketEditor';
import { workspaceTicketStore } from '../../../store/workspace-ticket';
import { TicketMessage } from '../../../store/interface';
import { FeatureBody, FeatureDataWrap } from '../../../pages/tickets/style';
import { FeatureHeadWrap, FeatureHeadNameWrap, WorkspaceName } from './style';

const WorkspaceTicketView: React.FC = observer(() => {
  const { workspaceId, ticketId } = useParams<{ workspaceId: string; ticketId: string }>();
  const [websocketSessionId, setWebsocketSessionId] = useState<string>('');
  const [swwfLinks, setSwwfLinks] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { main } = useStores();
  const history = useHistory();
  const [currentTicketId, setCurrentTicketId] = useState<string>(ticketId);

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
        <WorkspaceTicketEditor
          ticketData={currentTicket}
          websocketSessionId={websocketSessionId}
          index={0}
          draggableId={currentTicket.uuid}
          hasInteractiveChildren={false}
          swwfLink={swwfLinks[currentTicket.uuid]}
          getPhaseTickets={getTickets}
        />
      </FeatureDataWrap>
    </FeatureBody>
  );
});

export default WorkspaceTicketView;
