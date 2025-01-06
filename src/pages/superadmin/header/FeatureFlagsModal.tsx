import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { EuiLoadingSpinner } from '@elastic/eui';
import { useIsMobile } from 'hooks/uiHooks';
import { Modal } from '../../../components/common';
import { BudgetButton } from '../../../people/widgetViews/workspace/style.ts';
import { mainStore } from '../../../store/main';
import { FeatureFlag } from '../../../store/interface';
import CreateFeatureFlagModal from './CreateFeatureFlagModal';

interface FeatureFlagsProps {
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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
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
`;

const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 34px;
    &:before {
      position: absolute;
      content: '';
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: 0.4s;
      border-radius: 50%;
    }
  }
  input:checked + span {
    background-color: #9157f6;
  }
  input:checked + span:before {
    transform: translateX(26px);
  }
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #9157f6;
  cursor: pointer;
  margin: 0 5px;
  &:hover {
    text-decoration: underline;
  }
`;

const CreateButton = styled(BudgetButton)`
  margin-bottom: 20px;
  background: #9157f6;
  font-size: 1.2rem;
  font-weight: 500;
  color: white;
  &:hover {
    background: #7c3dde;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileCards = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
`;

const Card = styled.div`
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: white;
`;

const CardField = styled.div`
  margin-bottom: 8px;

  label {
    font-weight: 500;
    color: #666;
    margin-right: 8px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const FeatureFlagsModal = ({ open, close, addToast }: FeatureFlagsProps) => {
  const isMobile = useIsMobile();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);

  const fetchFeatureFlags = useCallback(async () => {
    try {
      const response = await mainStore.getFeatureFlags();
      if (response?.success) {
        setFlags(response.data);
      }
    } catch (error) {
      if (addToast) addToast('Failed to fetch feature flags', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (open) {
      fetchFeatureFlags();
    }
  }, [open, fetchFeatureFlags]);

  const handleToggle = async (uuid: string, enabled: boolean) => {
    try {
      const response = await mainStore.updateFeatureFlag(uuid, !enabled);
      if (response?.ok) {
        await fetchFeatureFlags();
        if (addToast) addToast('Feature flag updated successfully', 'success');
      }
    } catch (error) {
      if (addToast) addToast('Failed to update feature flag', 'error');
    }
  };

  const handleDelete = async (uuid: string) => {
    try {
      const response = await mainStore.deleteFeatureFlag(uuid);
      if (response?.success) {
        if (addToast) addToast('Feature flag deleted successfully', 'success');
        await fetchFeatureFlags();
      } else {
        if (addToast) addToast('Failed to delete feature flag', 'error');
      }
    } catch (error) {
      if (addToast) addToast('Failed to delete feature flag', 'error');
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedFlags = [...flags].sort((a: FeatureFlag, b: FeatureFlag) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    return a[sortField as keyof FeatureFlag] > b[sortField as keyof FeatureFlag]
      ? direction
      : -direction;
  });

  const handleEdit = (flag: FeatureFlag) => {
    setEditingFlag(flag);
    setShowCreateModal(true);
  };

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
        zIndex: 20,
        maxHeight: '100%',
        borderRadius: '10px',
        width: isMobile ? '100%' : '80%',
        maxWidth: '1200px'
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
        <ModalTitle>Feature Flags</ModalTitle>
        <CreateButton onClick={() => setShowCreateModal(true)}>Create Feature Flag</CreateButton>

        {loading ? (
          <LoadingContainer>
            <EuiLoadingSpinner size="xl" />
          </LoadingContainer>
        ) : (
          <>
            <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <Th onClick={() => handleSort('name')}>
                      Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </Th>
                    <Th onClick={() => handleSort('description')}>
                      Description{' '}
                      {sortField === 'description' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFlags.map((flag: FeatureFlag) => (
                    <tr key={flag.uuid}>
                      <Td>{flag.name}</Td>
                      <Td>{flag.description}</Td>
                      <Td>
                        <Toggle>
                          <input
                            type="checkbox"
                            checked={flag.enabled}
                            onChange={() => handleToggle(flag.uuid, flag.enabled)}
                          />
                          <span />
                        </Toggle>
                      </Td>
                      <Td>
                        <ActionButton onClick={() => handleEdit(flag)}>Edit</ActionButton>
                        <ActionButton onClick={() => handleDelete(flag.uuid)}>Delete</ActionButton>
                        <ActionButton
                          onClick={() => console.log('Manage Endpoints button has been clicked')}
                        >
                          Manage Endpoints
                        </ActionButton>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableContainer>

            <MobileCards>
              {sortedFlags.map((flag: FeatureFlag) => (
                <Card key={flag.uuid}>
                  <CardField>
                    <label>Name:</label>
                    {flag.name}
                  </CardField>
                  <CardField>
                    <label>Description:</label>
                    {flag.description}
                  </CardField>
                  <CardField>
                    <label>Status:</label>
                    <Toggle>
                      <input
                        type="checkbox"
                        checked={flag.enabled}
                        onChange={() => handleToggle(flag.uuid, flag.enabled)}
                      />
                      <span />
                    </Toggle>
                  </CardField>
                  <CardField>
                    <ActionButton onClick={() => handleEdit(flag)}>Edit</ActionButton>
                    <ActionButton onClick={() => handleDelete(flag.uuid)}>Delete</ActionButton>
                    <ActionButton
                      onClick={() => console.log('Manage Endpoints button has been clicked')}
                    >
                      Manage Endpoints
                    </ActionButton>
                  </CardField>
                </Card>
              ))}
            </MobileCards>
          </>
        )}

        <CreateFeatureFlagModal
          open={showCreateModal}
          close={() => {
            setShowCreateModal(false);
            setEditingFlag(null);
          }}
          onSuccess={() => {
            fetchFeatureFlags();
            setEditingFlag(null);
          }}
          addToast={addToast}
          editData={editingFlag}
        />
      </Wrapper>
    </Modal>
  );
};

export default FeatureFlagsModal;
