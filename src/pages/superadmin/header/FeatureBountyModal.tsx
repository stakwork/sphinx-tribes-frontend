/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/typedef */
import React, { useState } from 'react';
import styled from 'styled-components';
import { nonWidgetConfigs } from 'people/utils/Constants';
import { useIsMobile } from 'hooks/uiHooks';
import { Modal } from '../../../components/common';
import { bountyStore } from '../../../store/bountyStore';

interface FeatureBountyProps {
  open: boolean;
  close: () => void;
  addToast?: (title: string, color: 'success' | 'error') => void;
}

const Wrapper = styled.div`
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  padding: 32px;
  background: white;
  border-radius: 16px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
`;

const BountyCount = styled.span`
  color: #666;
  font-size: 16px;
  font-weight: 500;
`;

const InputLabel = styled.label`
  display: block;
  font-size: 12px;
  color: #4a4a4a;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: 16px;

  &::placeholder {
    color: #999;
  }

  &:focus {
    outline: none;
    border-color: #9157f6;
  }
`;

const BountyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 24px 0;
`;

const BountyItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BountyNumber = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #9157f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
`;

const BountyContent = styled.div`
  display: flex;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
  gap: 30px;
  align-items: center;

  h4 {
    margin: 0 0 4px 0;
    font-size: 16px;
    font-weight: 500;
  }

  p {
    margin: 0;
    color: #666;
    font-size: 14px;
  }
`;

const DeleteButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #f5f5f5;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #ff4d4f;
    color: white;
  }
`;

const ClearAllButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 10px;
  margin-top: 10px;

  &:hover {
    background: #ff7875;
  }
`;

const AddButton = styled.button<{ isActive: boolean }>`
  width: 100%;
  padding: 12px;
  background: ${(props) => (props.isActive ? '#9157F6' : '#f5f5f5')};
  color: ${(props) => (props.isActive ? 'white' : '#999')};
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: ${(props) => (props.isActive ? 'pointer' : 'not-allowed')};
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.isActive ? '#a679f7' : '#f5f5f5')};
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: -15px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #000;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #333;
  }
`;

const FeatureBountyModal = ({ open, close, addToast }: FeatureBountyProps) => {
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [bountyUrl, setBountyUrl] = useState('');
  const featuredBounties = bountyStore.getFeaturedBounties();

  const handleAddFeaturedBounty = () => {
    setLoading(true);
    try {
      const bountyId = bountyStore.getBountyIdFromURL(bountyUrl);

      if (!bountyId) {
        if (addToast) addToast('Invalid bounty URL format', 'error');
        return;
      }

      if (bountyStore.hasBounty(bountyId)) {
        if (addToast) addToast('Bounty already in featured list', 'error');
        return;
      }

      bountyStore.addFeaturedBounty(bountyUrl);
      if (addToast) addToast('Bounty added to featured list', 'success');
      setBountyUrl('');
    } catch (error) {
      if (addToast) addToast('Could not add bounty to featured list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAll = () => {
    bountyStore.removeAllFeaturedBounties();
    if (addToast) addToast('All featured bounties deleted!', 'success');
  };

  const handleRemoveFeaturedBounty = (bountyId: string) => {
    bountyStore.removeFeaturedBounty(bountyId);
    if (addToast) addToast('Featured bounty deleted', 'success');
  };

  return (
    <Modal
      visible={open}
      style={{
        height: '100%',
        flexDirection: 'column',
        width: '100%',
        alignItems: `${isMobile ? '' : 'center'}`,
        justifyContent: `${isMobile ? '' : 'center'}`,
        overflowY: 'hidden'
      }}
      envStyle={{
        marginTop: isMobile ? 64 : 0,
        background: 'transparent',
        zIndex: 20,
        ...(nonWidgetConfigs['workspaceusers']?.modalStyle ?? {}),
        maxHeight: '100%'
      }}
      overlayClick={close}
    >
      <Wrapper>
        <CloseButton onClick={close}>x</CloseButton>

        <Header>
          <Title>Featured Bounties</Title>
          <BountyCount>{featuredBounties.length}/3 bounties</BountyCount>
        </Header>

        <BountyList>
          {featuredBounties.length > 0 ? (
            featuredBounties.map((bounty, index) => (
              <BountyItem key={bounty.bountyId}>
                <BountyContent>
                  <BountyNumber>{index + 1}</BountyNumber>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h4>Bounty #{bounty.bountyId}</h4>
                    <p>{bounty.url}</p>
                  </div>
                  <DeleteButton onClick={() => handleRemoveFeaturedBounty(bounty.bountyId)}>
                    x
                  </DeleteButton>
                </BountyContent>
              </BountyItem>
            ))
          ) : (
            <p style={{ display: 'flex', justifyContent: 'center' }}>No featured bounties added</p>
          )}
        </BountyList>

        <InputLabel>Enter URL for feature bounty</InputLabel>
        <Input
          type="text"
          value={bountyUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBountyUrl(e.target.value)}
          placeholder="Enter bounty URL"
        />

        <AddButton
          isActive={!!bountyUrl && featuredBounties.length < 3}
          onClick={handleAddFeaturedBounty}
          disabled={!bountyUrl || featuredBounties.length >= 3}
        >
          {featuredBounties.length >= 3 ? 'Max Bounties Added' : 'Add Bounty'}
        </AddButton>

        {featuredBounties.length > 0 && (
          <ClearAllButton onClick={handleRemoveAll}>Clear All</ClearAllButton>
        )}
      </Wrapper>
    </Modal>
  );
};

export default FeatureBountyModal;
