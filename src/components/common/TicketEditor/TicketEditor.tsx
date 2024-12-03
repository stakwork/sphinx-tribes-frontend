import React, { useState, useEffect } from 'react';
import { useStores } from 'store';
import { EuiGlobalToastList } from '@elastic/eui';
import { ActionButton, TicketButtonGroup } from '../../../people/widgetViews/workspace/style';
import {
  TicketContainer,
  TicketHeader,
  TicketTextArea,
  TicketInput,
  TicketHeaderInputWrap
} from '../../../pages/tickets/style';
import { TicketStatus } from '../../../store/interface';
import { Toast } from '../../../people/widgetViews/workspace/interface';

interface TicketEditorProps {
  ticketData: {
    uuid: string;
    feature_uuid: string;
    phase_uuid: string;
    name: string;
    sequence: number;
    dependency: string[];
    description: string;
    status: string;
    version: number;
    number: number;
  };
}

const TicketEditor = ({ ticketData }: TicketEditorProps) => {
  const [name, setName] = useState(ticketData.name || 'Ticket');
  const [description, setDescription] = useState(ticketData.description || '');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { main } = useStores();

  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        const ticket = await main.getTicketDetails(ticketData.uuid);
        if (ticket) {
          setDescription(ticket.description || '');
          setName(ticket.name || 'Ticket');
        }
      } catch (error) {
        console.error('Error fetching ticket details:', error);
      }
    };

    fetchTicketDetails();
  }, [ticketData.uuid, main]);

  const handleUpdate = async () => {
    const updateTicketData = {
      ...ticketData,
      name,
      description,
      status: 'DRAFT' as TicketStatus,
      version: ticketData.version + 1
    };

    try {
      await main.createUpdateTicket(updateTicketData);
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const addSuccessToast = () => {
    setToasts([
      {
        id: '1',
        title: 'Ticket Builder',
        color: 'success',
        text: "Success, I'll rewrite your ticket now!"
      }
    ]);
  };

  const addErrorToast = () => {
    setToasts([
      {
        id: '2',
        title: 'Ticket Builder',
        color: 'danger',
        text: 'Sorry, there appears to be a problem'
      }
    ]);
  };

  const handleTicketBuilder = async () => {
    try {
      const ticketForReview = {
        ...ticketData,
        name,
        description,
        status: 'DRAFT' as TicketStatus
      };

      const response = await main.sendTicketForReview(ticketForReview);

      if (response) {
        addSuccessToast();
      } else {
        throw new Error('Failed to send ticket for review');
      }
    } catch (error) {
      console.error('Error in ticket builder:', error);
      addErrorToast();
    }
  };

  return (
    <TicketContainer>
      <TicketHeaderInputWrap>
        <TicketHeader>Ticket:</TicketHeader>
        <TicketInput
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          placeholder="Enter ticket name..."
        />
      </TicketHeaderInputWrap>
      <TicketTextArea
        value={description}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
        placeholder="Enter ticket details..."
      />
      <TicketButtonGroup>
        <ActionButton color="primary" onClick={handleUpdate} data-testid="story-input-update-btn">
          Update
        </ActionButton>
        <ActionButton
          color="#49C998"
          onClick={handleTicketBuilder}
          data-testid="story-generate-btn"
        >
          Ticket Builder
        </ActionButton>
      </TicketButtonGroup>
      <EuiGlobalToastList
        toasts={toasts}
        dismissToast={() => setToasts([])}
        toastLifeTimeMs={3000}
      />
    </TicketContainer>
  );
};

export default TicketEditor;
