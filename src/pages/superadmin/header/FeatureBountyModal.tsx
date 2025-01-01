/* eslint-disable @typescript-eslint/typedef */
import React, { useState } from 'react';
import { nonWidgetConfigs } from 'people/utils/Constants';
import { useIsMobile } from 'hooks/uiHooks';
import { InvoiceForm, InvoiceInput, InvoiceLabel } from 'people/utils/style';
import styled from 'styled-components';
import { BudgetButton } from 'people/widgetViews/workspace/style';
import { Modal } from '../../../components/common';
import { bountyStore } from '../../../store/bountyStore';

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
  justify-content: space-between;
  align-items: center;
`;

const BountyCount = styled.h3`
  font-size: 1rem;
  font-weight: bolder;
  margin-bottom: 20px;
  color: gray;
`;

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 40px 50px;
`;

const FeaturedList = styled.div`
  margin: 20px 0;
`;

const FeaturedItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
`;

const CloseBtn = styled.button`
  background-color: red;
  color: white;
  border: none;
  border-radius: 4px;
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 15px;
  cursor: pointer;

  &:hover {
    background-color: darkred;
  }
`;

const ClearAll = styled.span`
  color: grey;
  cursor: pointer;
  margin-bottom: 30px;
  flex: 1;
  padding: 10px;
`;

const FeatureBountyModal = (props: FeatureBountyProps) => {
  const isMobile = useIsMobile();
  const { open, close, addToast } = props;
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
    <>
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
          ...(nonWidgetConfigs['workspaceusers']?.modalStyle ?? {}),
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ModalTitle>Featured Bounties</ModalTitle>
            <BountyCount>({featuredBounties.length}/3)</BountyCount>
          </div>
          <FeaturedList>
            {featuredBounties.map((bounty, index) => (
              <div
                key={bounty.bountyId}
                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <span>{index + 1}</span>
                <FeaturedItem>
                  <span>{bounty.url}</span>
                </FeaturedItem>
                <CloseBtn onClick={() => handleRemoveFeaturedBounty(bounty.bountyId)}>x</CloseBtn>
              </div>
            ))}
            {featuredBounties.length > 0 && (
              <ClearAll onClick={() => handleRemoveAll()}>Clear All</ClearAll>
            )}
          </FeaturedList>
          <InvoiceForm>
            <InvoiceLabel
              style={{
                display: 'block'
              }}
            >
              URL of the feature bounty
            </InvoiceLabel>
            <InvoiceInput
              type="text"
              style={{
                width: '100%'
              }}
              value={bountyUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBountyUrl(e.target.value)}
              placeholder="Enter bounty URL"
            />
          </InvoiceForm>
          <BudgetButton
            disabled={!bountyUrl || featuredBounties.length >= 3}
            style={{
              borderRadius: '8px',
              marginTop: '12px',
              color: !loading && bountyUrl ? '#FFF' : 'rgba(142, 150, 156, 0.85)',
              background: !loading && bountyUrl ? '#9157F6' : 'rgba(0, 0, 0, 0.04)'
            }}
            onClick={handleAddFeaturedBounty}
          >
            {featuredBounties.length >= 3 ? 'Max Bounties Added' : 'Add Bounty'}
          </BudgetButton>
        </Wrapper>
      </Modal>
    </>
  );
};

export default FeatureBountyModal;
