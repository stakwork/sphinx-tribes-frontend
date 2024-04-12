import React, { useState, DragEvent, ChangeEvent } from 'react';
import styled from 'styled-components';
import { useStores } from 'store';
import { EuiGlobalToastList, EuiLoadingSpinner } from '@elastic/eui';
import { normalizeInput, normalizeTextValue } from '../../../helpers';
import { Toast } from './interface';
import {
  ImgDashContainer,
  ImgDetailInfo,
  ImgInstructionSpan,
  ImgInstructionText,
  ImgText,
  ImgTextContainer,
  InputFile,
  TextInput,
  WorkspaceInputContainer,
  WorkspaceLabel,
  SelectedImg,
  UploadImageContainer,
  TextAreaInput,
  SecondaryText
} from './style';

const AddWorkspaceWrapper = styled.div`
  padding: 3rem;
  display: flex;
  flex-direction: column;

  @media only screen and (max-width: 500px) {
    padding: 1.2rem;
    width: 100%;
  }
`;

const AddWorkspaceHeader = styled.h2`
  color: #3c3f41;
  font-family: 'Barlow';
  font-size: 1.875rem;
  font-style: normal;
  font-weight: 800;
  line-height: 1.875rem;
  margin-bottom: 0;

  @media only screen and (max-width: 500px) {
    text-align: center;
    font-size: 1.4rem;
  }
`;
const WorkspaceDetailsContainer = styled.div`
  margin-top: 3rem;
  display: flex;
  gap: 3.56rem;
  @media only screen and (max-width: 500px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;
const FooterContainer = styled.div`
  display: flex;
  gap: 3.56rem;
  align-items: end;
  justify-content: space-between;

  @media only screen and (max-width: 500px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const WorkspaceImgOutterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ImgContainer = styled.div`
  width: 7.875rem;
  height: 7.875rem;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ebedf1;
`;

const WorkspaceButton = styled.button`
  width: 16rem;
  height: 3rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-family: 'Barlow';
  font-size: 0.9375rem;
  font-style: normal;
  font-weight: 500;
  line-height: 0rem;
  letter-spacing: 0.00938rem;
  margin-top: 1.5rem;
  border: none;
  background: var(--Primary-blue, #618aff);
  box-shadow: 0px 2px 10px 0px rgba(97, 138, 255, 0.5);
  color: #fff;

  :disabled {
    border: 1px solid rgba(0, 0, 0, 0.07);
    background: rgba(0, 0, 0, 0.04);
    color: rgba(142, 150, 156, 0.85);
    box-shadow: none;
  }
`;

const errcolor = '#FF8F80';

const InputError = styled.div`
  color: #ff8f80;
  text-edge: cap;
  margin-bottom: 9px;
  font-family: Barlow;
  font-size: 11px;
  font-style: normal;
  font-weight: 500;
`;

const LabelRowContainer = styled.div`
  display: flex;
  align-items: end;
  justify-content: space-between;
`;

const MAX_ORG_NAME_LENGTH = 20;
const MAX_DESCRIPTION_LENGTH = 120;

const AddWorkspace = (props: {
  closeHandler: () => void;
  getUserWorkspaces: () => void;
  owner_pubkey: string | undefined;
}) => {
  const [orgName, setWorkspaceName] = useState('');
  const [websiteName, setWebsiteName] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { main } = useStores();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [orgNameError, setWorkspaceNameError] = useState<boolean>(false);
  const [descriptionError, setDescriptionError] = useState<boolean>(false);

  const handleWorkspaceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_ORG_NAME_LENGTH) {
      setWorkspaceName(newValue);
      setWorkspaceNameError(false);
    } else {
      setWorkspaceNameError(true);
    }
  };

  const handleWebsiteNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWebsiteName(e.target.value);
  };

  const handleGithubRepoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGithubRepo(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_DESCRIPTION_LENGTH) {
      setDescription(newValue);
      setDescriptionError(false);
    } else {
      setDescriptionError(true);
    }
  };

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

  function addSuccessToast() {
    setToasts([
      {
        id: '1',
        title: 'Create Workspace',
        color: 'success',
        text: 'Workspace created successfully'
      }
    ]);
  }

  function addErrorToast(text: string) {
    setToasts([
      {
        id: '2',
        title: 'Create Workspace',
        color: 'danger',
        text
      }
    ]);
  }

  function removeToast() {
    setToasts([]);
  }

  const handleBrowse = () => {
    const fileInput = document.getElementById('file-input');
    fileInput?.click();
  };

  const addWorkspace = async () => {
    try {
      setIsLoading(true);
      let img_url = '';
      const formData = new FormData();
      if (selectedFile) {
        formData.append('file', selectedFile);
        const file = await main.uploadFile(formData);
        if (file && file.ok) {
          img_url = await file.json();
        }
      }

      if (!orgName.trim()) {
        addErrorToast('Workspace name is required');
        setIsLoading(false);
        return;
      }

      const body = {
        owner_pubkey: props.owner_pubkey || '',
        name: normalizeInput(orgName),
        description: normalizeTextValue(description),
        img: img_url,
        github: normalizeInput(githubRepo),
        website: normalizeInput(websiteName)
      };

      const res = await main.addWorkspace(body);
      if (res.status === 200) {
        addSuccessToast();
        setTimeout(async () => {
          await props.getUserWorkspaces();
          setIsLoading(false);
          props.closeHandler();
        }, 500);
      } else {
        addErrorToast(await res.json());
        setIsLoading(false);
      }
    } catch (error) {
      addErrorToast('Error occured while creating workspace');
      console.error('Error occured', error);
      setIsLoading(false);
    }
  };

  return (
    <AddWorkspaceWrapper>
      <AddWorkspaceHeader>Add New Workspace</AddWorkspaceHeader>
      <WorkspaceDetailsContainer>
        <WorkspaceImgOutterContainer>
          <ImgDashContainer onDragOver={handleDragOver} onDrop={handleDrop}>
            <UploadImageContainer onClick={handleBrowse}>
              <img src="/static/upload.svg" alt="upload" />
            </UploadImageContainer>
            <ImgContainer>
              {selectedFile ? (
                <SelectedImg src={URL.createObjectURL(selectedFile)} alt="selected file" />
              ) : (
                <ImgText>LOGO</ImgText>
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
        <WorkspaceInputContainer style={{ color: orgNameError ? errcolor : '' }}>
          <WorkspaceLabel style={{ color: orgNameError ? errcolor : '' }}>
            Workspace Name *
          </WorkspaceLabel>
          <TextInput
            placeholder="My Workspace..."
            value={orgName}
            onChange={handleWorkspaceNameChange}
            style={{ borderColor: orgNameError ? errcolor : '' }}
          />
          <LabelRowContainer>
            {orgNameError && <InputError>Name is too long.</InputError>}
            <SecondaryText style={{ color: orgNameError ? errcolor : '', marginLeft: 'auto' }}>
              {orgName.length}/{MAX_ORG_NAME_LENGTH}
            </SecondaryText>
          </LabelRowContainer>
          <WorkspaceLabel>Website</WorkspaceLabel>
          <TextInput
            placeholder="Website URL..."
            value={websiteName}
            onChange={handleWebsiteNameChange}
          />
          <WorkspaceLabel>Github Repo</WorkspaceLabel>
          <TextInput
            placeholder="Github link..."
            value={githubRepo}
            onChange={handleGithubRepoChange}
          />
        </WorkspaceInputContainer>
        <WorkspaceInputContainer>
          <WorkspaceLabel style={{ color: descriptionError ? errcolor : '' }}>
            Description
          </WorkspaceLabel>
          <TextAreaInput
            placeholder="Description Text..."
            rows={7}
            value={description}
            onChange={handleDescriptionChange}
            style={{ borderColor: descriptionError ? errcolor : '' }}
          />
          <LabelRowContainer>
            {descriptionError && <InputError>Description is too long.</InputError>}
            <SecondaryText style={{ color: descriptionError ? errcolor : '', marginLeft: 'auto' }}>
              {description.length}/{MAX_DESCRIPTION_LENGTH}
            </SecondaryText>
          </LabelRowContainer>
        </WorkspaceInputContainer>
      </WorkspaceDetailsContainer>
      <FooterContainer>
        <SecondaryText>* Required fields</SecondaryText>
        <WorkspaceButton
          disabled={orgNameError || descriptionError || !orgName}
          onClick={addWorkspace}
          data-testid="add-workspace"
        >
          {isLoading ? <EuiLoadingSpinner size="m" /> : 'Add Workspace'}
        </WorkspaceButton>
      </FooterContainer>
      <EuiGlobalToastList toasts={toasts} dismissToast={removeToast} toastLifeTimeMs={3000} />
    </AddWorkspaceWrapper>
  );
};

export default AddWorkspace;
