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
`;

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 40px 50px;
`;

const FeatureBountyModal = (props: FeatureBountyProps) => {
  const isMobile = useIsMobile();
  const { open, close, addToast } = props;
  const [loading, setLoading] = useState(false);
  const [bountyUrl, setBountyUrl] = useState(bountyStore.getFeaturedBounty()?.url || '');
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

      bountyStore.addFeaturedBounty(bountyUrl);

      if (addToast) addToast('Bounty added to featured list', 'success');
      setBountyUrl('');
      close();
    } catch (error) {
      if (addToast) addToast('Could not add bounty to featured list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFeaturedBounty = () => {
    bountyStore.removeFeaturedBounty();
    setBountyUrl('');
    if (addToast) addToast('Featured bounty deleted', 'success');
    close();
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
          <ModalTitle>Featured Bounties</ModalTitle>
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
            disabled={!bountyUrl}
            style={{
              borderRadius: '8px',
              marginTop: '12px',
              color: !loading && bountyUrl ? '#FFF' : 'rgba(142, 150, 156, 0.85)',
              background: !loading && bountyUrl ? '#9157F6' : 'rgba(0, 0, 0, 0.04)'
            }}
            onClick={handleAddFeaturedBounty}
          >
            Confirm
          </BudgetButton>
          <BudgetButton
            disabled={!bountyUrl}
            style={{
              borderRadius: '8px',
              marginTop: '12px',
              color: !bountyUrl ? 'rgba(142, 150, 156, 0.85)' : '#FFF',
              background: !bountyUrl ? 'rgba(0, 0, 0, 0.04)' : '#FF4D4F'
            }}
            onClick={handleRemoveFeaturedBounty}
          >
            Delete
          </BudgetButton>
        </Wrapper>
      </Modal>
    </>
  );
};

export default FeatureBountyModal;
