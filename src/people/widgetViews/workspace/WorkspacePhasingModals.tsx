import { EuiButton, EuiModal, EuiOverlayMask, EuiText } from '@elastic/eui';
import React from 'react';
import styled from 'styled-components';
import { TextInput } from './style';

const ModalContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 5px;
`;

const BoldText = styled.span`
  font-weight: bold;
`;

const CenteredText = styled(EuiText)`
  text-align: center;
`;

const StyledButton = styled(EuiButton)`
  text-decoration: none !important;
  border-radius: 25px;
  height: 35px;
  display: flex;
  align-item: center;
  justify-content: space-between;
  font-size: 12px;
`;

const CancelButton = styled(StyledButton)`
  color: #000;
  background: #fff;
  border: 1px solid #d0d5d8;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.06);
`;

const DeleteButton = styled(StyledButton)`
  background: #ed7474;
  color: #fff;
  border: none;
  box-shadow: 0px 2px 10px 0px rgba(237, 116, 116, 0.5);
`;

const SaveButton = styled(StyledButton)`
  background: #608aff;
  color: #fff;
  border: none;
  box-shadow: 0px 2px 10px 0px rgba(237, 116, 116, 0.5);
`;

const ModalTitle = styled.h2`
  color: #3c3f41;
  font-family: 'Barlow';
  font-size: 1.875rem;
  font-weight: 800;
  line-height: 1.875rem;
  margin-bottom: 0;

  @media only screen and (max-width: 500px) {
    text-align: center;
    font-size: 1.4rem;
  }
`;

const Label = styled.span`
  font-size: 1rem;
  color: black;
  margin-bottom: 3px;
`;

const DeleteIcon = styled.img`
  width: 27.857px;
  height: 30px;
  flex-shrink: 0;
  fill: var(--Input-Outline-1, #d0d5d8);
  margin: 0 auto;
`;

interface ModalProps {
  onClose: () => void;
  onConfirmDelete?: () => void;
}

interface ModalWrapperProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

const ModalWrapper = (props: ModalWrapperProps) => {
  const { title, children, onClose } = props;

  return (
    <EuiOverlayMask>
      <EuiModal
        onClose={onClose}
        style={{
          background: '#F2F3F5',
          padding: '50px 30px 30px 30px'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            justifyContent: 'center',
            height: '100%'
          }}
        >
          <ModalTitle>{title}</ModalTitle>
          {children}
        </div>
      </EuiModal>
    </EuiOverlayMask>
  );
};

export const DeletePhaseModal = (props: ModalProps) => {
  const { onClose, onConfirmDelete } = props;

  return (
    <ModalWrapper title="" onClose={onClose} data-testid="phase-modals-component">
      <DeleteIcon src="/static/Delete.svg" alt="delete icon" />
      <CenteredText>
        Are you sure you want to <br />
        <BoldText>Delete this Phase?</BoldText>
      </CenteredText>
      <ModalContainer>
        <CancelButton onClick={onClose}>Cancel</CancelButton>
        <DeleteButton data-testid="confirm-delete-phase" onClick={onConfirmDelete}>
          Delete
        </DeleteButton>
      </ModalContainer>
    </ModalWrapper>
  );
};

interface EditOrAddPhaseModalProps extends ModalProps {
  onEditPhase: (value: string) => void;
  onSave: () => Promise<void>;
  phaseName?: string;
}

export const EditPhaseModal = (props: EditOrAddPhaseModalProps) => {
  const { onClose, onConfirmDelete, phaseName, onSave, onEditPhase } = props;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onEditPhase(e.target.value);
  };

  return (
    <ModalWrapper title="Edit Phase" onClose={onClose}>
      <div>
        <Label>Phase Name *</Label>
        <TextInput
          placeholder="Phase..."
          value={phaseName}
          feature={true}
          data-testid="edit-phase-input"
          onChange={handleChange}
        />
      </div>

      <ModalContainer>
        <SaveButton onClick={onSave}>Save</SaveButton>
        <CancelButton onClick={onConfirmDelete}>
          <DeleteIcon style={{ height: '14px' }} src="/static/Delete.svg" alt="delete icon" />{' '}
          Delete
        </CancelButton>
      </ModalContainer>
    </ModalWrapper>
  );
};

export const AddPhaseModal = (props: EditOrAddPhaseModalProps) => {
  const { onClose, onEditPhase, onSave } = props;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onEditPhase(e.target.value);
  };

  return (
    <ModalWrapper title="Add Phase" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Label>Phase Name *</Label>
        <TextInput
          placeholder="Phase..."
          feature={true}
          data-testid="add-phase-input"
          onChange={handleChange}
        />
      </div>

      <ModalContainer>
        <CancelButton onClick={onClose}>Cancel</CancelButton>
        <SaveButton data-testid="add-phase-btn" onClick={onSave}>
          Save
        </SaveButton>
      </ModalContainer>
    </ModalWrapper>
  );
};
