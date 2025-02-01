import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { EuiLoadingSpinner } from '@elastic/eui';
import { useIsMobile } from 'hooks/uiHooks';
import { Modal } from '../../../components/common';
import { mainStore } from '../../../store/main';
import { ConnectionCodesList } from '../../../store/interface';

interface ViewInvitesProps {
  open: boolean;
  close: () => void;
  addToast?: (title: string, color: 'success' | 'error') => void;
}

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 40px 50px;
`;

const ModalTitle = styled.h3`
  font-size: 1.9rem;
  font-weight: bolder;
  margin-bottom: 20px;
`;

const TableContainer = styled.div`
  margin-top: 20px;
  border: 1px solid #eee;
  border-radius: 4px;
`;

const TableWrapper = styled.div`
  max-height: 400px;
  overflow-y: auto;

  /* Hide scrollbar for Chrome, Safari and Opera */
  ::-webkit-scrollbar {
    width: 4px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    margin-top: 50px;
  }

  ::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
    margin-top: 50px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #555;
    margin-top: 50px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
`;

const Thead = styled.thead`
  position: sticky;
  top: 0;
  background: #f9f9f9;
  z-index: 1;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px;
  background: #f9f9f9;
  border-bottom: 2px solid #eee;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #eee;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
`;

const PageButton = styled.button`
  background: #9157f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const TotalCodesWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #9157f6;
`;

const TotalCodesLabel = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin-right: 8px;
`;

const TotalCodesValue = styled.span`
  font-size: 1.1rem;
  color: #9157f6;
  font-weight: 600;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const EmptyState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: #666;
`;

const ViewInvitesModal = ({ open, close, addToast }: ViewInvitesProps) => {
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [inviteCodes, setInviteCodes] = useState<ConnectionCodesList[]>([]);
  const [page, setPage] = useState(1);
  const [totalCodes, setTotalCodes] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const codesPerPage = 20;

  const fetchInviteCodes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await mainStore.getInviteCodes(page, codesPerPage);
      if (response?.success) {
        setIsSuccess(true);
        if (response.data.codes.length === 0) {
          setInviteCodes([]);
          setTotalCodes(0);
        } else {
          setInviteCodes(response.data.codes);
          setTotalCodes(response.data.total);
        }
      } else {
        setIsSuccess(false);
        if (addToast) addToast('Failed to fetch invite codes', 'error');
        setInviteCodes([]);
        setTotalCodes(0);
      }
    } catch (error) {
      setIsSuccess(false);
      if (addToast) addToast('Failed to fetch invite codes', 'error');
      setInviteCodes([]);
      setTotalCodes(0);
    } finally {
      setLoading(false);
    }
  }, [page, addToast]);

  useEffect(() => {
    if (open) {
      fetchInviteCodes();
    }
  }, [open, fetchInviteCodes]);

  return (
    <Modal
      visible={open}
      style={{
        height: '100%',
        flexDirection: 'column',
        width: '100%',
        alignItems: isMobile ? '' : 'center',
        justifyContent: isMobile ? '' : 'center',
        overflowY: 'hidden'
      }}
      envStyle={{
        marginTop: isMobile ? 64 : 0,
        background: 'white',
        zIndex: 21,
        maxHeight: '100%',
        borderRadius: '10px',
        width: isMobile ? '100%' : '80%',
        maxWidth: '1000px'
      }}
      overlayClick={close}
      bigCloseImage={close}
      bigCloseImageStyle={{
        top: '1.6rem',
        right: isMobile ? '0rem' : '-1.25rem',
        background: '#000',
        borderRadius: '50%'
      }}
    >
      <Wrapper>
        <ModalTitle>Available Invite Codes</ModalTitle>
        <TotalCodesWrapper>
          <TotalCodesLabel>Total available codes:</TotalCodesLabel>
          <TotalCodesValue>{totalCodes}</TotalCodesValue>
        </TotalCodesWrapper>

        {loading ? (
          <LoadingContainer>
            <EuiLoadingSpinner size="xl" />
          </LoadingContainer>
        ) : isSuccess && inviteCodes.length === 0 ? (
          <EmptyState>No invite codes available</EmptyState>
        ) : (
          <TableContainer>
            <TableWrapper>
              <Table>
                <Thead>
                  <tr>
                    <Th style={{ width: '50%' }}>Invite Code</Th>
                    <Th style={{ width: '30%' }}>Pubkey</Th>
                    <Th style={{ width: '10%' }}>Sats</Th>
                    <Th style={{ width: '10%' }}>Created</Th>
                  </tr>
                </Thead>
                <tbody>
                  {inviteCodes.map((code: ConnectionCodesList, index: number) => (
                    <tr key={index}>
                      <Td title={code.connection_string}>{code.connection_string}</Td>
                      <Td title={code.pubkey}>{code.pubkey || '-'}</Td>
                      <Td>{code.sats_amount || '-'}</Td>
                      <Td>{code.date_created || '-'}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>
          </TableContainer>
        )}

        <Pagination>
          <PageButton disabled={page === 1} onClick={() => setPage((p: number) => p - 1)}>
            Previous
          </PageButton>
          <span>Page {page}</span>
          <PageButton
            disabled={inviteCodes.length < codesPerPage}
            onClick={() => setPage((p: number) => p + 1)}
          >
            Next
          </PageButton>
        </Pagination>
      </Wrapper>
    </Modal>
  );
};

export default ViewInvitesModal;
