import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { EuiLoadingSpinner, EuiGlobalToastList } from '@elastic/eui';
import MaterialIcon from '@material/react-material-icon';
import { chatService } from '../services';
import { Toast } from '../people/widgetViews/workspace/interface';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (url: string) => void;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const UploadArea = styled.div<{ isDragging: boolean }>`
  width: 100%;
  height: 200px;
  border: 2px dashed
    ${(props: { isDragging: boolean }) => (props.isDragging ? '#4285f4' : '#e4e7eb')};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${(props: { isDragging: boolean }) =>
    props.isDragging ? 'rgba(66, 133, 244, 0.05)' : '#f8f9fa'};
  margin-bottom: 16px;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    border-color: #4285f4;
    background: rgba(66, 133, 244, 0.05);
  }
`;

const UploadIcon = styled(MaterialIcon)`
  font-size: 48px;
  color: #5f6368;
  margin-bottom: 16px;
`;

const UploadText = styled.p`
  color: #5f6368;
  margin: 8px 0;
`;

const SuccessMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const CloseButton = styled.button`
  padding: 8px 24px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background-color: #3367d6;
  }
`;

const SelectContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  width: 100%;
`;

const SelectInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e4e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #5f6368;
  background: white;
  &:read-only {
    background: #f8f9fa;
  }

  &:focus {
    outline: none;
    border-color: #4285f4;
  }
`;

const SelectButton = styled.button`
  padding: 8px 24px;
  background-color: #f1f3f4;
  color: #5f6368;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background-color: #e4e7eb;
  }
`;

const FileInput = styled.input`
  display: none;
`;

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadComplete
}: UploadModalProps) => {
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const response = await chatService.uploadFile(file);
      if (response.success) {
        setUploadedUrl(response.url);
        onUploadComplete(response.url);
        setToasts([
          {
            id: `${Date.now()}-upload-success`,
            title: 'Success',
            color: 'success',
            text: 'File uploaded successfully!'
          }
        ]);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setToasts([
        {
          id: `${Date.now()}-upload-error`,
          title: 'Error',
          color: 'danger',
          text: error instanceof Error ? error.message : 'Failed to upload file'
        }
      ]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      await handleFileUpload(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      await handleFileUpload(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <ModalOverlay data-testid="upload-modal-component" onClick={onClose}>
      <ModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <UploadArea
          onDrop={handleDrop}
          onDragOver={(e: React.DragEvent) => e.preventDefault()}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          isDragging={isDragging}
        >
          {isUploading ? (
            <EuiLoadingSpinner size="xl" />
          ) : uploadedUrl ? (
            <SuccessMessage>
              <MaterialIcon icon="check_circle" style={{ color: '#34A853', fontSize: 48 }} />
              <UploadText>Upload successful!</UploadText>
              <CloseButton onClick={onClose}>Done</CloseButton>
            </SuccessMessage>
          ) : (
            <>
              <UploadIcon icon="upload_file" />
              <UploadText>Drag PDF here or click to upload</UploadText>
              <FileInput ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} />
            </>
          )}
        </UploadArea>

        {!isUploading && !uploadedUrl && (
          <SelectContainer>
            <SelectInput
              type="text"
              value={selectedFile ? selectedFile.name : 'No file selected'}
              readOnly
              placeholder="No file selected"
            />
            <SelectButton onClick={triggerFileSelect}>Select</SelectButton>
          </SelectContainer>
        )}
        <EuiGlobalToastList
          toasts={toasts}
          dismissToast={() => setToasts([])}
          toastLifeTimeMs={3000}
        />
      </ModalContent>
    </ModalOverlay>
  );
};