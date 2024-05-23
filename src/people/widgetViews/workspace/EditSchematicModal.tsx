import React, { ChangeEvent, DragEvent, useState } from 'react';
import styled from 'styled-components';
import { useStores } from 'store';
import { EuiGlobalToastList, EuiLoadingSpinner } from '@elastic/eui';
import history from 'config/history';
import { normalizeInput } from '../../../helpers';
import { Toast } from './interface';
import {
  TextInput,
  WorkspaceInputContainer,
  WorkspaceLabel,
  ActionButton,
  ButtonWrap,
  ImgDashContainer,
  UploadImageContainer,
  SelectedImg,
  ImgText,
  ImgTextContainer,
  InputFile,
  ImgInstructionText,
  ImgInstructionSpan,
  ImgDetailInfo,
  AddWorkspaceWrapper,
  AddWorkspaceHeader,
  WorkspaceDetailsContainer,
  WorkspaceImgOutterContainer,
  ImgContainer
} from './style';

const FooterContainer = styled.div`
  display: flex;
  gap: 3.56rem;
  align-items: end;
  justify-content: space-between;
  margin-top: 0.5rem;

  @media only screen and (max-width: 500px) {
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 20px;
  }
`;

const errcolor = '#FF8F80';

const EditSchematic = (props: {
  closeHandler: () => void;
  getSchematic: () => void;
  uuid: string | undefined;
  owner_pubkey: string | undefined;
  schematic_url: string | '';
  schematic_img: string | '';
}) => {
  const [schematicUrl, setSchematicUrl] = useState(props.schematic_url);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { main } = useStores();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [schematicUrlError, setSchematicUrlError] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleWorkspaceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSchematicUrl(newValue);
    setSchematicUrlError(false);
  };

  function addSuccessToast() {
    setToasts([
      {
        id: '1',
        title: 'Edit Schematic',
        color: 'success',
        text: 'Schematic updated successfully'
      }
    ]);
  }

  function addErrorToast(text: string) {
    setToasts([
      {
        id: '2',
        title: 'Add Schematic',
        color: 'danger',
        text
      }
    ]);
  }

  function removeToast() {
    setToasts([]);
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;

    if (fileList) {
      setSelectedFile(fileList[0]);
    }
  };

  const handleBrowse = () => {
    const fileInput = document.getElementById('file-input');
    fileInput?.click();
  };

  const isValidUrl = (url: string): boolean => {
    const pattern: RegExp = /^(?:(?:https?|ftp|mailto|tel|sms):\/\/)[^\s/$.?#].[^\s]*$/i;
    return pattern.test(url);
  };

  const editSchematic = async () => {
    try {
      setIsLoading(true);

      if (!schematicUrl.trim()) {
        addErrorToast('Schematic url is required');
        setIsLoading(false);
        return;
      }

      if (!isValidUrl(schematicUrl)) {
        addErrorToast('Invalid Schematic URL');
        setIsLoading(false);
        return;
      }

      let img_url = '';
      const formData = new FormData();
      if (selectedFile) {
        formData.append('file', selectedFile);
        const file = await main.uploadFile(formData);
        if (file && file.ok) {
          img_url = await file.json();
        }
      }

      const body = {
        uuid: props.uuid || '',
        owner_pubkey: props.owner_pubkey || '',
        schematic_url: normalizeInput(schematicUrl),
        schematic_img: img_url
      };

      const res = await main.workspaceUpdateSchematic(body);
      if (res.status === 200) {
        addSuccessToast();
        setTimeout(async () => {
          await props.getSchematic();
          setIsLoading(false);
          props.closeHandler();

          const schematic = await res.json();
          history.push(`/workspace/${schematic.uuid}`);
        }, 500);
      } else {
        addErrorToast(await res.json());
        setIsLoading(false);
      }
    } catch (error) {
      addErrorToast('Error occured while  schematic');
      console.error('Error occured', error);
      setIsLoading(false);
    }
  };

  return (
    <AddWorkspaceWrapper>
      <AddWorkspaceHeader>Edit Schematic</AddWorkspaceHeader>
      <WorkspaceDetailsContainer>
        <WorkspaceImgOutterContainer>
          <ImgDashContainer onDragOver={handleDragOver} onDrop={handleDrop}>
            <UploadImageContainer onClick={handleBrowse}>
              <img src="/static/upload.svg" alt="upload" />
            </UploadImageContainer>
            <ImgContainer>
              {selectedFile ? (
                <SelectedImg src={URL.createObjectURL(selectedFile)} alt="selected file" />
              ) : props.schematic_img ? (
                <SelectedImg src={props.schematic_img} alt="schematic image" />
              ) : (
                <ImgText>Image</ImgText>
              )}
            </ImgContainer>
          </ImgDashContainer>
          <ImgTextContainer>
            <InputFile
              type="file"
              id="file-input"
              accept=".jpg, .jpeg, .png, .gif"
              onChange={handleFileChange}
            />
            <ImgInstructionText>
              Drag and drop or{' '}
              <ImgInstructionSpan onClick={handleBrowse}>Browse</ImgInstructionSpan>
            </ImgInstructionText>
            <ImgDetailInfo>PNG, JPG or GIF, Min. 300 x 300 px</ImgDetailInfo>
          </ImgTextContainer>
        </WorkspaceImgOutterContainer>
        <WorkspaceInputContainer
          feature={true}
          style={{ color: schematicUrlError ? errcolor : '', marginTop: '1rem' }}
        >
          <WorkspaceLabel style={{ color: schematicUrlError ? errcolor : '' }}>
            Schematic Url *
          </WorkspaceLabel>
          <TextInput
            placeholder="Schematic..."
            value={schematicUrl}
            feature={true}
            data-testid="schematic-input"
            onChange={handleWorkspaceNameChange}
            style={{ borderColor: schematicUrlError ? errcolor : '' }}
          />
        </WorkspaceInputContainer>
      </WorkspaceDetailsContainer>
      <FooterContainer>
        <ButtonWrap>
          <ActionButton
            data-testid="schematic-cancel-btn"
            onClick={() => setSchematicUrl('')}
            color="cancel"
          >
            Cancel
          </ActionButton>
          <ActionButton
            disabled={schematicUrlError || !schematicUrl}
            data-testid="add-schematic-btn"
            color="primary"
            onClick={editSchematic}
          >
            {isLoading ? <EuiLoadingSpinner size="m" /> : 'Save'}
          </ActionButton>
        </ButtonWrap>
      </FooterContainer>
      <EuiGlobalToastList toasts={toasts} dismissToast={removeToast} toastLifeTimeMs={3000} />
    </AddWorkspaceWrapper>
  );
};

export default EditSchematic;
