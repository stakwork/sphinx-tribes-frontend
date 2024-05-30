import {
  EuiDragDropContext,
  EuiDraggable,
  EuiDroppable,
  EuiFlexGroup,
  EuiFlexItem,
  EuiGlobalToastList,
  EuiIcon,
  EuiLoadingSpinner,
  EuiPanel
} from '@elastic/eui';
import { DispatchSetStateAction } from 'components/common/WorkspaceEditableFeild';
import {
  Body,
  FeatureBody,
  FeatureDataWrap,
  FieldWrap,
  Label,
  Data,
  OptionsWrap,
  TextArea,
  InputField,
  Input,
  UserStoryOptionWrap,
  EditPopover,
  EditPopoverTail,
  EditPopoverText,
  EditPopoverContent
} from 'pages/tickets/style';
import React, { useCallback, useEffect, useState } from 'react';
import history from 'config/history';
import { useParams } from 'react-router-dom';
import { useStores } from 'store';
import { mainStore } from 'store/main';
import { Feature, FeatureStory } from 'store/interface';
import MaterialIcon from '@material/react-material-icon';
import { EuiOverlayMask, EuiModalHeader, EuiModalFooter, EuiText } from '@elastic/eui';
import { Box } from '@mui/system';
import { useDeleteConfirmationModal } from '../../components/common';
import {
  ActionButton,
  ButtonWrap,
  HeadNameWrap,
  FeatureHeadWrap,
  WorkspaceName,
  UserStoryField,
  StyledModal,
  ModalBody,
  ButtonGroup,
  StoryButtonWrap,
  UserStoryWrapper,
  UserStoryPanel
} from './workspace/style';
import WorkspacePhasingTabs from './workspace/WorkspacePhase';
import { Phase, Toast } from './workspace/interface';

interface WSEditableFieldProps {
  label: string;
  value: string;
  setValue: DispatchSetStateAction<string>;
  isEditing: boolean;
  setIsEditing: DispatchSetStateAction<boolean>;
  displayOptions: boolean;
  setDisplayOptions: DispatchSetStateAction<boolean>;
  placeholder: string;
  dataTestIdPrefix: string;
  onSubmit: () => Promise<void>;
  main: typeof mainStore;
}

const WorkspaceEditableField = ({
  label,
  value,
  setValue,
  isEditing,
  setIsEditing,
  displayOptions,
  setDisplayOptions,
  placeholder,
  dataTestIdPrefix,
  onSubmit,
  main
}: WSEditableFieldProps) => {
  const handleEditClick = () => {
    setIsEditing(!isEditing);
    setDisplayOptions(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.persist();

    const clipboardItems: DataTransferItemList = e.clipboardData?.items as DataTransferItemList;
    const itemsArray: DataTransferItem[] = Array.from(clipboardItems);
    for (const item of itemsArray) {
      if (item.type.startsWith('image/')) {
        const imageFile = item.getAsFile();
        if (imageFile) {
          const formData = new FormData();
          formData.append('file', imageFile);
          const file = await main.uploadFile(formData);
          let img_url = '';
          if (file && file.ok) {
            img_url = await file.json();
          }
          setValue((prevValue: string) => `${prevValue}\n![Uploaded Image](${img_url})`);
        }
        e.preventDefault();
      }
    }
  };

  const parseValue = (input: string | null): string => {
    if (!input) {
      return `No ${label.toLowerCase()} yet`;
    }

    // Regex to detect markdown image syntax ![alt text](url)
    const imageMarkdownRegex = /!\[.*?\]\((.*?)\)/g;

    // Replace the markdown image syntax with HTML <img> tag
    return input
      .replace(
        imageMarkdownRegex,
        (match: string, p1: string) => `<img src="${p1}" alt="Uploaded Image" />`
      )
      .replace(/\n/g, '<br/>');
  };

  return (
    <FieldWrap>
      <Label>{label}</Label>
      <Data>
        <OptionsWrap>
          <MaterialIcon
            icon="more_horiz"
            className="MaterialIcon"
            onClick={() => setDisplayOptions(!displayOptions)}
            data-testid={`${dataTestIdPrefix}-option-btn`}
          />
          {displayOptions && (
            <EditPopover>
              <EditPopoverTail />
              <EditPopoverContent onClick={handleEditClick}>
                <MaterialIcon icon="edit" style={{ fontSize: '20px', marginTop: '2px' }} />
                <EditPopoverText data-testid={`${dataTestIdPrefix}-edit-btn`}>Edit</EditPopoverText>
              </EditPopoverContent>
            </EditPopover>
          )}
        </OptionsWrap>
        {!isEditing ? (
          <div
            style={{
              overflowY: 'auto'
            }}
            dangerouslySetInnerHTML={{
              __html: parseValue(value)
            }}
          />
        ) : (
          <>
            <TextArea
              placeholder={`Enter ${placeholder}`}
              onChange={handleChange}
              onPaste={handlePaste}
              value={value}
              data-testid={`${dataTestIdPrefix}-textarea`}
              rows={10}
              cols={50}
            />
            <ButtonWrap>
              <ActionButton
                onClick={handleCancelClick}
                data-testid={`${dataTestIdPrefix}-cancel-btn`}
                color="cancel"
              >
                Cancel
              </ActionButton>
              <ActionButton
                color="primary"
                onClick={onSubmit}
                data-testid={`${dataTestIdPrefix}-update-btn`}
              >
                Update
              </ActionButton>
            </ButtonWrap>
          </>
        )}
      </Data>
    </FieldWrap>
  );
};

interface UserStoryModalProps {
  open: boolean;
  storyDescription: string;
  handleClose: () => void;
  handleSave: (inputValue: string) => void;
  handleDelete: () => void;
}

const UserStoryModal: React.FC<UserStoryModalProps> = ({
  open,
  storyDescription,
  handleClose,
  handleSave,
  handleDelete
}: UserStoryModalProps) => {
  const [inputValue, setInputValue] = useState<string>(storyDescription);

  useEffect(() => {
    setInputValue(storyDescription);
  }, [storyDescription]);
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  return (
    <>
      {open && (
        <EuiOverlayMask>
          <StyledModal>
            <EuiModalHeader>
              <EuiText>
                <h2>Edit User Story</h2>
              </EuiText>
            </EuiModalHeader>
            <ModalBody>
              <Label>User Story</Label>
              <Input
                placeholder="Edit Story"
                onChange={handleInputChange}
                value={inputValue}
                data-testid="edit-story-input"
              />
            </ModalBody>
            <EuiModalFooter>
              <ButtonGroup>
                <StoryButtonWrap>
                  <ActionButton
                    data-testid="user-story-save-btn"
                    onClick={() => handleSave(inputValue)}
                  >
                    Save
                  </ActionButton>
                  <ActionButton color="cancel" onClick={handleClose}>
                    Cancel
                  </ActionButton>
                </StoryButtonWrap>
                <ActionButton
                  data-testid="user-story-delete-btn"
                  marginTop="30px"
                  color="cancel"
                  onClick={handleDelete}
                >
                  Delete
                </ActionButton>
              </ButtonGroup>
            </EuiModalFooter>
          </StyledModal>
        </EuiOverlayMask>
      )}
    </>
  );
};

const WorkspaceFeature = () => {
  const { main, ui } = useStores();
  const { feature_uuid } = useParams<{ feature_uuid: string }>();
  const [featureData, setFeatureData] = useState<Feature | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userStory, setUserStory] = useState<string>('');
  const [userStoryPriority, setUserStoryPriority] = useState<number>(0);
  const [featureStories, setFeatureStories] = useState<FeatureStory[]>([]);
  const [brief, setBrief] = useState<string>('');
  const [phases, setPhases] = useState<Phase[]>([]);
  const [architecture, setArchitecture] = useState<string>('');
  const [requirements, setRequirements] = useState<string>('');
  const [editBrief, setEditBrief] = useState<boolean>(false);
  const [editArchitecture, setEditArchitecture] = useState<boolean>(false);
  const [editRequirements, setEditRequirements] = useState<boolean>(false);
  const [displayBriefOptions, setDisplayBriefOptions] = useState<boolean>(false);
  const [displayArchitectureOptions, setDisplayArchitectureOptions] = useState<boolean>(false);
  const [displayRequirementsOptions, setDisplayRequirementsOptions] = useState<boolean>(false);
  const [displayUserStoryOptions, setDisplayUserStoryOptions] = useState<Record<number, boolean>>(
    {}
  );
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editUserStory, setEditUserStory] = useState<FeatureStory>();
  const [toasts, setToasts] = useState<Toast[]>([]);

  const getFeatureData = useCallback(async () => {
    if (!feature_uuid) return;
    const data = await main.getFeaturesByUuid(feature_uuid);

    if (data) {
      setFeatureData(data);
      setBrief(data.brief);
      setArchitecture(data.architecture);
      setRequirements(data.requirements);
    }

    return data;
  }, [feature_uuid, main]);

  const getFeaturePhaseData = useCallback(async () => {
    if (!feature_uuid) return;
    const phases = await main.getFeaturePhases(feature_uuid);

    if (phases) {
      setPhases(phases);
    }
    return phases;
  }, [feature_uuid, main]);

  const getFeatureStoryData = useCallback(async (): Promise<void> => {
    if (!feature_uuid) return;
    const data = (await main.getFeatureStories(feature_uuid)) as FeatureStory[];

    setUserStoryPriority((data?.length + 1) as number);
    setFeatureStories(data);

    setLoading(false);
  }, [feature_uuid, main]);

  useEffect(() => {
    Promise.all([getFeatureData(), getFeaturePhaseData(), getFeatureStoryData()]).finally(() => {
      setLoading(false);
    });
  }, [getFeatureData, getFeaturePhaseData, getFeatureStoryData]);

  const submitField = async (
    field: string,
    value: string,
    setIsEditing: DispatchSetStateAction<boolean>
  ): Promise<void> => {
    const body = {
      [field]: value,
      uuid: featureData?.uuid ?? '',
      workspace_uuid: featureData?.workspace_uuid ?? ''
    };
    await main.addWorkspaceFeature(body);
    await getFeatureData();
    setIsEditing(false);
  };

  const handleUserStorySubmit = async () => {
    const body = {
      feature_uuid: feature_uuid ?? '',
      description: userStory,
      priority: userStoryPriority
    };
    await main.addFeatureStory(body);
    await getFeatureStoryData();
    setUserStory('');
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserStory(e.target.value);
  };

  const handleUserStoryOptionClick = (storyId: number) => {
    setDisplayUserStoryOptions((prev: Record<number, boolean>) => ({
      ...prev,
      [storyId]: !prev[storyId]
    }));
  };

  const handleUserStoryEdit = (featureStory: FeatureStory) => {
    const storyId = featureStory?.id as number;
    setEditUserStory(featureStory);
    setModalOpen(true);
    setDisplayUserStoryOptions((prev: Record<number, boolean>) => ({
      ...prev,
      [storyId]: !prev[storyId]
    }));
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleModalSave = async (inputValue: string) => {
    const body = {
      uuid: editUserStory?.uuid,
      feature_uuid: editUserStory?.feature_uuid ?? '',
      description: inputValue,
      priority: editUserStory?.priority
    };
    await main.addFeatureStory(body);
    await getFeatureStoryData();
    setModalOpen(false);
  };

  const handleReorderUserStories = async (story: FeatureStory, newPriority: number) => {
    await main.updateFeatureStoryPriority({
      uuid: story.uuid,
      priority: newPriority
    });
  };

  const deleteUserStory = async () => {
    await main.deleteFeatureStory(
      editUserStory?.feature_uuid as string,
      editUserStory?.uuid as string
    );
    await getFeatureStoryData();
    return;
  };

  const { openDeleteConfirmation } = useDeleteConfirmationModal();

  const deleteHandler = () => {
    openDeleteConfirmation({
      onDelete: deleteUserStory,
      children: (
        <Box fontSize={20} textAlign="center">
          Are you sure you want to <br />
          <Box component="span" fontWeight="500">
            delete this User Story?
          </Box>
        </Box>
      )
    });
  };

  const handleModalDelete = async () => {
    setModalOpen(false);
    deleteHandler();
  };

  const updateFeaturePhase = (reason: any, title: string, message: string) => {
    getFeaturePhaseData();
    setToasts([
      {
        id: '1',
        title,
        color: (reason === 'success' ? 'sucess' : 'danger') as any,
        text: message
      }
    ]);
  };

  const toastsEl = (
    <EuiGlobalToastList
      toasts={toasts}
      dismissToast={() => ui.setToasts([])}
      toastLifeTimeMs={3000}
    />
  );

  if (loading) {
    return (
      <Body style={{ justifyContent: 'center', alignItems: 'center' }}>
        <EuiLoadingSpinner size="xl" />
      </Body>
    );
  }

  const onDragEnd = ({ source, destination }: any) => {
    if (source && destination && source.index !== destination.index) {
      const updatedStories = [...featureStories];

      const [movedItem] = updatedStories.splice(source.index, 1);
      updatedStories.splice(destination.index, 0, movedItem);

      const promises = updatedStories.map((story: FeatureStory, index: number) =>
        handleReorderUserStories(story, index + 1)
      );

      Promise.all(promises).then(() => {
        getFeatureStoryData();
      });
    }
  };

  return (
    <FeatureBody>
      <FeatureHeadWrap>
        <HeadNameWrap>
          <MaterialIcon
            onClick={() => history.goBack()}
            icon={'arrow_back'}
            style={{
              fontSize: 25,
              cursor: 'pointer'
            }}
          />
          <WorkspaceName>{featureData?.name}</WorkspaceName>
        </HeadNameWrap>
      </FeatureHeadWrap>
      <FeatureDataWrap>
        <WorkspaceEditableField
          label="Feature Brief"
          value={brief}
          setValue={setBrief}
          isEditing={editBrief}
          setIsEditing={setEditBrief}
          displayOptions={displayBriefOptions}
          setDisplayOptions={setDisplayBriefOptions}
          placeholder="Brief"
          dataTestIdPrefix="brief"
          onSubmit={() => submitField('brief', brief, setEditBrief)}
          main={main}
        />
        <FieldWrap>
          <Label>User Stories</Label>
          <UserStoryWrapper>
            <EuiDragDropContext onDragEnd={onDragEnd}>
              <EuiDroppable droppableId="user_story_droppable_area" spacing="m">
                {featureStories
                  ?.sort((a: FeatureStory, b: FeatureStory) => a.priority - b.priority)
                  ?.map((story: FeatureStory, idx: number) => (
                    <EuiDraggable
                      spacing="m"
                      key={story.id}
                      index={idx}
                      draggableId={story.uuid}
                      customDragHandle
                      hasInteractiveChildren
                    >
                      {(provided: any) => (
                        <UserStoryPanel paddingSize="l">
                          <EuiFlexGroup alignItems="center" gutterSize="s">
                            <EuiFlexItem grow={false}>
                              <EuiPanel
                                color="transparent"
                                className="drag-handle"
                                paddingSize="s"
                                {...provided.dragHandleProps}
                                data-testid={`drag-handle-${story.priority}`}
                                aria-label="Drag Handle"
                              >
                                <EuiIcon type="grab" />
                              </EuiPanel>
                            </EuiFlexItem>
                            <EuiFlexItem>
                              <UserStoryField>{story.description}</UserStoryField>
                            </EuiFlexItem>
                          </EuiFlexGroup>
                          <UserStoryOptionWrap>
                            <MaterialIcon
                              icon="more_horiz"
                              onClick={() => handleUserStoryOptionClick(story.id as number)}
                              data-testid={`${story.priority}-user-story-option-btn`}
                            />
                            {displayUserStoryOptions[story?.id as number] && (
                              <EditPopover>
                                <EditPopoverTail />
                                <EditPopoverContent onClick={() => handleUserStoryEdit(story)}>
                                  <MaterialIcon
                                    icon="edit"
                                    style={{ fontSize: '20px', marginTop: '2px' }}
                                  />
                                  <EditPopoverText data-testid="user-story-edit-btn">
                                    Edit
                                  </EditPopoverText>
                                </EditPopoverContent>
                              </EditPopover>
                            )}
                          </UserStoryOptionWrap>
                        </UserStoryPanel>
                      )}
                    </EuiDraggable>
                  ))}
              </EuiDroppable>
            </EuiDragDropContext>
            <InputField>
              <Input
                placeholder="Enter new user story"
                onChange={handleChange}
                value={userStory}
                data-testid="story-input"
                style={{ height: '40px', width: '100%', maxHeight: 'unset' }}
              />
              <ActionButton
                marginTop="0"
                height="40px"
                color="primary"
                onClick={handleUserStorySubmit}
                data-testid="story-input-update-btn"
              >
                Create
              </ActionButton>
            </InputField>
          </UserStoryWrapper>
        </FieldWrap>
        <WorkspaceEditableField
          label="Requirements"
          value={requirements}
          setValue={setRequirements}
          isEditing={editRequirements}
          setIsEditing={setEditRequirements}
          displayOptions={displayRequirementsOptions}
          setDisplayOptions={setDisplayRequirementsOptions}
          placeholder="Requirements"
          dataTestIdPrefix="requirements"
          onSubmit={() => submitField('requirements', requirements, setEditRequirements)}
          main={main}
        />
        <WorkspaceEditableField
          label="Architecture"
          value={architecture}
          setValue={setArchitecture}
          isEditing={editArchitecture}
          setIsEditing={setEditArchitecture}
          displayOptions={displayArchitectureOptions}
          setDisplayOptions={setDisplayArchitectureOptions}
          placeholder="Architecture"
          dataTestIdPrefix="architecture"
          onSubmit={() => submitField('architecture', architecture, setEditArchitecture)}
          main={main}
        />
        <UserStoryModal
          open={modalOpen}
          storyDescription={editUserStory?.description as string}
          handleClose={handleModalClose}
          handleSave={handleModalSave}
          handleDelete={handleModalDelete}
        />
      </FeatureDataWrap>
      <FeatureDataWrap>
        <WorkspacePhasingTabs
          featureId={feature_uuid}
          phases={phases}
          updateFeaturePhase={updateFeaturePhase}
          workspace_uuid={featureData?.workspace_uuid ?? ''}
        />
      </FeatureDataWrap>
      {toastsEl}
    </FeatureBody>
  );
};

export default WorkspaceFeature;
