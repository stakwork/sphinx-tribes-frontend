/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/typedef */
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useStores } from 'store';
import { useParams } from 'react-router-dom';
import SidebarComponent from 'components/common/SidebarComponent';
import { useHistory } from 'react-router';
import {
  QuickBountyTicket,
  quickBountyTicketStore
} from '../../../../store/quickBountyTicketStore.tsx';
import ActivitiesHeader from './header';

const TableContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
`;

const PhaseHeader = styled.h3`
  margin-top: 20px;
  padding: 10px;
  background: #f4f4f4;
  border-radius: 5px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
`;

const Th = styled.th`
  background: #f8f9fa;
  padding: 10px;
  border-bottom: 2px solid #ddd;
  width: 33.33%;
`;

const Td = styled.td`
  padding: 10px;
  border-bottom: 1px solid #ddd;
  width: 33.33%;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: #fff;
  background-color: ${({ status }) =>
    status === 'PAID'
      ? 'green'
      : status === 'IN_PROGRESS'
      ? 'gray'
      : status === 'IN_REVIEW'
      ? 'orange'
      : status === 'TODO'
      ? 'blue'
      : status === 'DRAFT'
      ? 'lightgray'
      : 'black'};
`;

export const ActivitiesContainer = styled.div<{ collapsed: boolean }>`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  padding: 3.5rem;
  background-color: #f8f9fa;
  height: calc(100vh - 120px);
  overflow-y: auto;
  margin-bottom: 50px;
  margin-top: 50px;
  margin-left: ${({ collapsed }: { collapsed: boolean }) => (collapsed ? '50px' : '250px')};
  transition: margin-left 0.3s ease-in-out;
`;

const MainContainer = styled.div`
  flex-grow: 1;
  transition:
    margin-left 0.3s ease-in-out,
    width 0.3s ease-in-out;
  overflow: hidden;
`;

const HiveFeaturesView = observer(() => {
  const { uuid, feature_uuid, workspace_uuid } = useParams<{
    uuid: string;
    feature_uuid: string;
    workspace_uuid: string;
  }>();
  const history = useHistory();
  const [phaseNames, setPhaseNames] = useState<{ [key: string]: string }>({});
  const [collapsed, setCollapsed] = useState(false);
  const [data, setData] = useState<QuickBountyTicket[]>([]);
  const { main } = useStores();

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

  useEffect(() => {
    const fetchData = async () => {
      const response = await quickBountyTicketStore.fetchAndSetQuickData(feature_uuid);
      setData(response || []);
    };
    fetchData();
  }, [feature_uuid]);

  const groupedData = data.reduce<{ [key: string]: QuickBountyTicket[] }>((acc, item) => {
    if (!acc[item.phaseID]) acc[item.phaseID] = [];
    acc[item.phaseID].push(item);
    return acc;
  }, {});

  useEffect(() => {
    const fetchPhaseNames = async () => {
      const names: { [key: string]: string } = {};
      for (const phaseID of Object.keys(groupedData)) {
        const phase = await main.getFeaturePhaseByUUID(feature_uuid, phaseID);
        names[phaseID] = phase?.name || 'Untitled Phase';
      }
      setPhaseNames(names);
    };
    fetchPhaseNames();
  }, [groupedData, feature_uuid, main]);

  const getNavigationURL = (item: QuickBountyTicket) => {
    if (item.bountyTicket === 'bounty') {
      return `/bounty/${item.bountyID}`;
    } else if (item.bountyTicket === 'ticket') {
      return `/workspace/${uuid}/ticket/${item.ticketUUID}`;
    }
    return '';
  };

  const handleTitleClick = (item: QuickBountyTicket) => {
    const url = getNavigationURL(item);
    if (url !== '') {
      history.push(url);
    }
  };

  return (
    <>
      <MainContainer>
        <SidebarComponent />
        <ActivitiesHeader uuid={workspace_uuid} collapsed={collapsed} />
        <ActivitiesContainer collapsed={collapsed}>
          {Object.values(groupedData).length === 0 ? (
            <p>No phases available</p>
          ) : (
            <TableContainer>
              {Object.values(groupedData).map((items, index) => (
                <div key={index}>
                  <PhaseHeader>
                    Phase {index + 1}: {phaseNames[items[0].phaseID] || 'Untitled Phase'}
                  </PhaseHeader>
                  <Table>
                    <thead>
                      <tr>
                        <Th>Name</Th>
                        <Th style={{ textAlign: 'center' }}>Status</Th>
                        <Th style={{ textAlign: 'center' }}>Assigned</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.ID}>
                          <Td onClick={() => handleTitleClick(item)} style={{ cursor: 'pointer' }}>
                            {item.Title || 'Unnamed'}
                          </Td>
                          <Td style={{ textAlign: 'center' }}>
                            <StatusBadge status={item.status}>{item.status}</StatusBadge>
                          </Td>
                          <Td style={{ textAlign: 'center' }}>{item.assignedAlias || '...'}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ))}
            </TableContainer>
          )}
        </ActivitiesContainer>
      </MainContainer>
    </>
  );
});

export default HiveFeaturesView;
