import React, { ChangeEvent, FormEvent, useState } from 'react';
import styled from 'styled-components';
import { useIsMobile } from 'hooks/uiHooks';
import { Modal } from '../../../components/common';
import { bountyStore, FeaturedBounty } from '../../../store/bountyStore';
import { nonWidgetConfigs } from '../../../people/utils/Constants.tsx';
import { BudgetButton } from '../../../people/widgetViews/workspace/style.ts';

interface FeatureBountyProps {
  open: boolean;
  close: () => void;
  addToast?: (title: string, color: 'success' | 'error') => void;
}

const ModalTitle = styled.h3`
  font-size: 1.9rem;
  font-weight: bolder;
  margin-bottom: 20px;
  display: flex;
  gap: 60px;
  align-items: center;
`;

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 40px 50px;
`;

const BountiesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const BountyItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  gap: 12px;
  margin-top: 8px;
`;

const BountyIndex = styled.span`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #9157f6;
  color: white;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #000;
  }
`;

const BountyCount = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #555;
  margin-top: 4px;
  text-align: center;
`;

const FeatureBountyModal = (props: FeatureBountyProps) => {
  const isMobile = useIsMobile();
  const { open, close, addToast } = props;
  const [loading, setLoading] = useState(false);
  const [bountyUrl, setBountyUrl] = useState('');
  const featuredBounties = bountyStore.getFeaturedBounties();
  const maxBounties = 3;
  const isAtLimit = featuredBounties.length >= maxBounties;
  const config = nonWidgetConfigs['workspaceusers'];

  const handleAddFeaturedBounty = async () => {
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

      if (isAtLimit) {
        if (addToast) addToast('Cannot add more than 3 bounties', 'error');
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

  const handleRemoveFeaturedBounty = (bountyId: string) => {
    bountyStore.removeFeaturedBounty(bountyId);
    if (addToast) addToast('Featured bounty removed', 'success');
  };

  const handleClearAll = () => {
    bountyStore.clearFeaturedBounties();
    if (addToast) addToast('All featured bounties cleared', 'success');
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
        background: 'white',
        zIndex: 20,
        ...(config?.modalStyle ?? {}),
        maxHeight: '100%',
        borderRadius: '10px'
      }}
      overlayClick={close}
      bigCloseImage={close}
      bigCloseImageStyle={{
        top: '1.6rem',
        right: `${isMobile ? '0rem' : '-1.25rem'}`,
        background: '#000',
        borderRadius: '50%'
      }}
    >
      <Wrapper>
        <ModalTitle>
          Featured Bounties{' '}
          <BountyCount>
            {featuredBounties.length} / {bountyStore.maxFeaturedBounties} bounties
          </BountyCount>
        </ModalTitle>
        <form
          onSubmit={(e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            handleAddFeaturedBounty();
          }}
        >
          <label style={{ display: 'block', marginBottom: 8 }}>URL of the feature bounty</label>
          <input
            type="text"
            style={{
              width: '100%',
              marginBottom: 12,
              padding: 8,
              borderRadius: 4,
              border: '1px solid #ccc'
            }}
            value={bountyUrl}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setBountyUrl(e.target.value)}
            placeholder="Enter bounty URL"
            disabled={isAtLimit || loading}
          />
          <BudgetButton
            type="submit"
            disabled={isAtLimit || !bountyUrl || loading}
            style={{
              borderRadius: '8px',
              marginTop: '12px',
              padding: '10px 20px',
              background: !loading && !isAtLimit && bountyUrl ? '#9157F6' : 'rgba(0, 0, 0, 0.04)',
              color: !loading && !isAtLimit && bountyUrl ? '#FFF' : 'rgba(142, 150, 156, 0.85)',
              border: 'none',
              cursor: !loading && !isAtLimit && bountyUrl ? 'pointer' : 'not-allowed'
            }}
          >
            Add Bounty
          </BudgetButton>
        </form>

        <BountiesList>
          {featuredBounties.map((bounty: FeaturedBounty, index: number) => (
            <BountyItem key={bounty.bountyId}>
              <BountyIndex>{index + 1}</BountyIndex>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>
                  {bounty.title || `Bounty #${bounty.bountyId}`}
                </div>
                <div style={{ fontSize: 14, color: '#555' }}>{bounty.url}</div>
              </div>
              <RemoveButton onClick={() => handleRemoveFeaturedBounty(bounty.bountyId)}>
                x
              </RemoveButton>
            </BountyItem>
          ))}
        </BountiesList>

        {featuredBounties.length > 0 && (
          <button
            onClick={handleClearAll}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#FF4D4F',
              color: '#FFF',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            Clear All
          </button>
        )}

        {featuredBounties.length === 0 && (
          <div
            style={{
              marginTop: '20px',
              textAlign: 'center',
              padding: '20px',
              background: '#f9f9f9',
              borderRadius: 8,
              color: '#555',
              fontWeight: 500
            }}
          >
            No featured bounties added yet. Add up to {maxBounties} bounties.
          </div>
        )}
      </Wrapper>
    </Modal>
  );
};

export default FeatureBountyModal;
