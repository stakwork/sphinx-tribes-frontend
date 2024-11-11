import React, { useState } from 'react';
import { nonWidgetConfigs } from 'people/utils/Constants';
import { useIsMobile } from 'hooks/uiHooks';
import { InvoiceForm, InvoiceInput, InvoiceLabel } from 'people/utils/style';
import styled from 'styled-components';
import { BudgetButton } from 'people/widgetViews/workspace/style';
import { useStores } from 'store';
import { Modal } from '../../../components/common';

interface InviteProps {
  open: boolean;
  close: () => void;
  addToast?: (title: string, color: 'success' | 'error') => void;
}

const WithdrawModalTitle = styled.h3`
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

const InviteModal = (props: InviteProps) => {
  const isMobile = useIsMobile();
  const { main } = useStores();
  const { open, close, addToast } = props;
  const [loading, setLoading] = useState(false);
  const [inviteNumber, setInviteNumber] = useState(1);
  const config = nonWidgetConfigs['workspaceusers'];

  const createConnectionCode = async () => {
    setLoading(true);
    const status = await main.createConnectionCodes(inviteNumber);

    if (status === 200) {
      if (addToast) addToast('Users invite code created successfully', 'success');
      setInviteNumber(1);
      close();
    } else {
      if (addToast) addToast('Could not create users invite code', 'error');
    }
    setLoading(false);
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
          <WithdrawModalTitle className="withdraw-title">Invite Users</WithdrawModalTitle>
          <InvoiceForm>
            <InvoiceLabel
              style={{
                display: 'block'
              }}
            >
              Number of users
            </InvoiceLabel>
            <InvoiceInput
              data-testid="withdrawInvoiceInput"
              type="text"
              style={{
                width: '100%'
              }}
              value={inviteNumber}
              onChange={(e: any) => setInviteNumber(Number(e.target.value))}
            />
          </InvoiceForm>
          <BudgetButton
            disabled={false}
            style={{
              borderRadius: '8px',
              marginTop: '12px',
              color: !loading ? '#FFF' : 'rgba(142, 150, 156, 0.85)',
              background: !loading ? '#9157F6' : 'rgba(0, 0, 0, 0.04)'
            }}
            onClick={createConnectionCode}
          >
            Confirm
          </BudgetButton>
        </Wrapper>
      </Modal>
    </>
  );
};

export default InviteModal;
