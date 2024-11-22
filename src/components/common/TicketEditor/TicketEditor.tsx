import React, { useState } from 'react';
import { ActionButton, TicketButtonGroup } from '../../../people/widgetViews/workspace/style';

import { TicketContainer, TicketHeader, TicketTextArea } from '../../../pages/tickets/style';

interface TicketEditorProps {
  ticketNumber: number;
}

const TicketEditor: React.FC<TicketEditorProps> = ({ ticketNumber }: TicketEditorProps) => {
  const [content, setContent] = useState('');

  const handleUpdate = () => {
    console.log('Update clicked', content);
  };

  const handleTicketBuilder = () => {
    console.log('Ticket Builder clicked');
  };

  return (
    <TicketContainer>
      <TicketHeader>Ticket {ticketNumber}:</TicketHeader>
      <TicketTextArea
        value={content}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
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
    </TicketContainer>
  );
};

export default TicketEditor;
