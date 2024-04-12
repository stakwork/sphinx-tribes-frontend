import React, { useState } from 'react';
import ConnectCard from 'people/utils/ConnectCard';
import { TicketModalPage } from '../TicketModalPage';
import WorkspaceTickets from './WorkspaceTickets';

export const WorkspaceTicketsPage = () => {
  const [connectPerson, setConnectPerson] = useState<any>(null);
  return (
    <>
      <WorkspaceTickets />
      <TicketModalPage setConnectPerson={setConnectPerson} />
      {connectPerson && (
        <ConnectCard
          dismiss={() => setConnectPerson(null)}
          modalStyle={{
            top: '-64px',
            height: 'calc(100% + 64px)'
          }}
          person={connectPerson}
          visible={true}
        />
      )}
    </>
  );
};
