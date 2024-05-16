import React from 'react';
import { EuiModal, EuiModalBody, EuiModalHeader, EuiModalFooter } from '@elastic/eui';
import styled from 'styled-components';
import { Button } from 'components/common';

const StyledModal = styled(EuiModal)`
  background-color: white;
  width: 650px;
  height: 350px;

  .euiButtonIcon.euiButtonIcon--empty {
    display: none;
  }
`;

const ModalBody = styled(EuiModalBody)`
  margin-left: 20px;
  margin-right: 20px;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 5px;
  justify-content: center;
  align-items: center;
  font-weight: 500;
  border: 1px solid #3f3f3f;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
`;
const StyledFooter = styled(EuiModalFooter)`
  display: flex;
  width: 100%;
  justify-content: space-between;
`;

interface ModalProps {
  isModalVisible: boolean;
  closeModal: () => void;
  handleSave: () => void;
  handleDelete: () => void;
  name: string;
  setName: (name: string) => void;
  url: string;
  setUrl: (url: string) => void;
  modalType: string;
}

export const AddRepoModal = ({
  closeModal,
  handleSave,
  handleDelete,
  name,
  setName,
  url,
  setUrl,
  modalType
}: ModalProps) => (
  <StyledModal onClose={closeModal}>
    <EuiModalHeader>
      <h3>{modalType === 'add' ? 'Add Repository' : 'Edit Repository'}</h3>
    </EuiModalHeader>

    <ModalBody>
      <h5>Name *</h5>
      <StyledInput
        placeholder="Repository name"
        value={name}
        onChange={(e: any) => setName(e.target.value)}
      />
      <h5>Url</h5>
      <StyledInput
        placeholder="Repository url"
        value={url}
        onChange={(e: any) => setUrl(e.target.value)}
      />
    </ModalBody>

    <StyledFooter>
      <ButtonContainer>
        <Button text={'Save'} onClick={handleSave} />
        <Button text={'Cancel'} color="white" onClick={closeModal} />
      </ButtonContainer>
      {modalType === 'edit' && (
        <div>
          <Button text={'Delete'} color="white" onClick={handleDelete} />
        </div>
      )}
    </StyledFooter>
  </StyledModal>
);
