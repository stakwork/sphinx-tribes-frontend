import { Button, Modal, TextInput } from 'components/common';
import React from 'react';
import styled from 'styled-components';

type BadgesModalProps = {
  visible: boolean;
  setBadgeToPush: any;
  liquidAddress: string;
  setLiquidAddress: any;
  memo: string;
  setMemo: any;
  claiming: boolean;
  claimBadge: any;
};

const StyledTextInput = styled(TextInput)`
  width: 240px;
  border: 1px solid black;
`;

function BadgesModal({
  setBadgeToPush,
  visible,
  liquidAddress,
  setLiquidAddress,
  memo,
  setMemo,
  claiming,
  claimBadge
}: BadgesModalProps) {
  return (
    <Modal
      visible={visible}
      close={() = data-testid="badges-modal-component"> {
        setBadgeToPush(null);
      }}
    >
      <div
        style={{
          padding: 20,
          height: 300,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '20px'
        }}
      >
        <StyledTextInput
          label={'Liquid Address'}
          value={liquidAddress}
          onChange={(e: any) => setLiquidAddress(e)}
        />

        <StyledTextInput label={'Memo (optional)'} value={memo} onChange={(e: any) => setMemo(e)} />

        <Button
          color="primary"
          text="Claim on Liquid"
          loading={claiming}
          disabled={!liquidAddress || claiming}
          onClick={() => claimBadge()}
        />
      </div>
    </Modal>
  );
}

export default BadgesModal;
