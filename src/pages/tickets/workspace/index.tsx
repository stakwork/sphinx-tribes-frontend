import React, { useState } from 'react';
import ConnectCard from 'people/utils/ConnectCard';
import { useParams } from 'react-router-dom';
import { TicketModalPage } from '../TicketModalPage';
import { useBrowserTabTitle } from '../../../hooks/useBrowserTabTitle';
import WorkspaceTickets from './WorkspaceTickets';

export const WorkspaceTicketsPage = () => {
  const { bountyId } = useParams<{ bountyId?: string }>();
  const [connectPerson, setConnectPerson] = useState<any>(null);
  useBrowserTabTitle('Workspace Bounties');
  return (
    <>
      <WorkspaceTickets />
      {bountyId && <TicketModalPage setConnectPerson={setConnectPerson} />}
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
