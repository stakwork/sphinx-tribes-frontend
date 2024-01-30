import { Button, Modal, TextInput } from 'components/common';
import React from 'react';

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
      close={() => {
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
        <>
          <TextInput
            style={{ width: 240, border: '1px solid black' }}
            label={'Liquid Address'}
            value={liquidAddress}
            onChange={(e: any) => setLiquidAddress(e)}
          />

          <TextInput
            style={{ width: 240, border: '1px solid black' }}
            label={'Memo (optional)'}
            value={memo}
            onChange={(e: any) => setMemo(e)}
          />

          <Button
            color="primary"
            text="Claim on Liquid"
            loading={claiming}
            disabled={!liquidAddress || claiming}
            onClick={() => claimBadge()}
          />
        </>
      </div>
    </Modal>
  );
}

export default BadgesModal;
