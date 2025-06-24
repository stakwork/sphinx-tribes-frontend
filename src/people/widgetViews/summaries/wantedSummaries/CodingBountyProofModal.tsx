import { Box } from '@mui/system';
import { BaseModal } from 'components/common';
import { colors } from 'config';
import { observer } from 'mobx-react-lite';
import { ProofActionButton, CopyButtonGroup } from 'people/widgetViews/workspace/style';
import React, { memo } from 'react';
import styled from 'styled-components';

const ModalContainer = styled.div<{ isMobile: boolean }>`
  max-height: auto;
  overflow-y: visible;
  display: flex;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 20px;
  width: ${(props: { isMobile: boolean }) => (props.isMobile ? '80vw' : '650px')};
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const StyledTextArea = styled.textarea<{ isMobile: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: 2px solid #dde1e5;
  outline: none;
  caret-color: #618aff;
  color: #3c3f41;
  font-family: 'Barlow';
  font-size: 1rem;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
  width: 100%;
  resize: vertical;
  min-height: ${(props: { isMobile: boolean }) => (props.isMobile ? '40vh' : '300px')};

  ::placeholder {
    color: #b0b7bc;
    font-family: 'Barlow';
    font-size: 15px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
  }

  :focus {
    border: 2px solid #82b4ff;
  }
`;

const palette = colors.light;

interface TextAreaProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  isMobile: boolean;
}

const TextArea = memo(({ value, onChange, placeholder, isMobile }: TextAreaProps) => (
  <ModalContainer isMobile={isMobile}>
    <StyledTextArea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      aria-label="Enter your proof"
      isMobile={isMobile}
    />
  </ModalContainer>
));

TextArea.displayName = 'TextArea';

interface ProofModalProps extends Omit<TextAreaProps, 'isMobile'> {
  closeModal: () => void;
  bountyId: string;
  submitProof: (bountyId: string, description: string) => Promise<boolean>;
  isMobile?: boolean;
}

const ProofModal = ({
  value,
  onChange,
  placeholder,
  closeModal,
  bountyId,
  submitProof,
  isMobile = false
}: ProofModalProps) => {
  const handleSubmit = async () => {
    const success: boolean = await submitProof(bountyId, value);
    if (success) {
      closeModal();
    }
  };

  return (
    <BaseModal open onClose={closeModal}>
      <Box
        p={isMobile ? 2 : 4}
        bgcolor={palette.grayish.G950}
        borderRadius={2}
        minWidth={isMobile ? '90vw' : 400}
        minHeight={isMobile ? '50vh' : 450}
      >
        <TextArea value={value} onChange={onChange} placeholder={placeholder} isMobile={isMobile} />
        <CopyButtonGroup>
          <ProofActionButton
            color="primary"
            data-testid="submit-proof-handler"
            onClick={handleSubmit}
            disabled={!value.trim()}
            style={{
              width: isMobile ? '100%' : 'auto'
            }}
          >
            Submit Proof
          </ProofActionButton>
        </CopyButtonGroup>
      </Box>
    </BaseModal>
  );
};

ProofModal.displayName = 'ProofModal';

export default observer(ProofModal);
