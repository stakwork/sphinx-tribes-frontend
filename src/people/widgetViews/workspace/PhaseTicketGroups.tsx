import React from 'react';
import styled from 'styled-components';
import { Ticket } from 'store/interface';

const TicketGroupContainer = styled.div`
  margin-top: 10px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
`;

const TicketCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 1100px;
  min-height: 130px;
  background: white;
  border-radius: 10px 20px 20px 10px;
  border: 2px solid #f2f3f5;

  &:hover {
    border: 2px solid #dbf4ea;
  }
`;

const TicketInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TicketTitle = styled.div`
  font-family: 'Barlow';
  font-size: 17px;
  font-weight: 500;
  margin: 20px 0 0 20px;
  color: #1a1c1e;
  line-height: 18px;
`;

const DraftSection = styled.div`
  min-width: 580px;
  min-height: 160px;
  border-radius: 20px;
  border: 3px dashed #b0b7bc;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const DraftLabel = styled.div`
  font-family: 'Barlow';
  font-size: 20px;
  font-weight: 600;
  color: #69707d;
`;

interface PhaseTicketGroupsProps {
  tickets: Ticket[];
}

const PhaseTicketGroups: React.FC<PhaseTicketGroupsProps> = ({
  tickets
}: PhaseTicketGroupsProps) => {
  // Group tickets by ticket_group
  const ticketGroups = tickets.reduce((groups: { [key: string]: Ticket }, ticket: Ticket) => {
    const groupId = ticket.ticket_group || ticket.uuid;
    if (!groups[groupId] || ticket.version > (groups[groupId].version || 0)) {
      groups[groupId] = ticket;
    }
    return groups;
  }, {});

  return (
    <TicketGroupContainer data-testid="phase-ticket-groups-component">
      {Object.values(ticketGroups).map((ticket: Ticket) => (
        <TicketCard key={ticket.uuid}>
          <TicketInfo>
            <TicketTitle>{ticket.name || 'Untitled Ticket'}</TicketTitle>
          </TicketInfo>
          <DraftSection>
            <DraftLabel>Draft</DraftLabel>
          </DraftSection>
        </TicketCard>
      ))}
    </TicketGroupContainer>
  );
};

export default PhaseTicketGroups;
