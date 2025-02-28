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
  WorkspaceFeatureBody,
  FeatureDataWrap,
  FieldWrap,
  Label,
  Data,
  InputField,
  Input,
  UserStoryOptionWrap,
  EditPopover,
  EditPopoverTail,
  EditPopoverText,
  EditPopoverContent,
  FeatureOptionsWrap
} from 'pages/tickets/style';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useStores } from 'store';
import { mainStore } from 'store/main';
import { Feature, FeatureStory, Workspace } from 'store/interface';
import MaterialIcon from '@material/react-material-icon';
import { EuiOverlayMask, EuiModalHeader, EuiModalFooter, EuiText } from '@elastic/eui';
import { Box } from '@mui/system';
import { userHasRole } from 'helpers/helpers-extended';
import { createSocketInstance, SOCKET_MSG } from '../../config/socket.ts';
import { useDeleteConfirmationModal } from '../../components/common';
import SidebarComponent from '../../components/common/SidebarComponent.tsx';
import {
  ActionButton,
  FeatureHeadNameWrap,
  FeatureHeadWrap,
  WorkspaceName,
  UserStoryField,
  StyledModal,
  ModalBody,
  ButtonGroup,
  StoryButtonWrap,
  UserStoryWrapper,
  UserStoryPanel,
  FullNoBudgetText,
  FullNoBudgetWrap,
  StoriesButtonGroup,
  FlexContainer,
  AudioButtonWrap,
  AudioButtonGroup,
  AudioModalBody,
  StyledEuiModalFooter,
  FeatureModalBody,
  FeatureModalFooter
} from './workspace/style';
import WorkspacePhasingTabs from './workspace/WorkspacePhase';
import { Phase, Toast } from './workspace/interface';
import ActivitiesHeader from './workspace/Activities/header';
import { EditableField } from './workspace/EditableField';

interface AudioRecordingModalProps {
  open: boolean;
  handleClose: () => void;
  handleSubmit: (audioLink: string) => Promise<void>;
  featureUUID: string;
}

const AudioRecordingModal: React.FC<AudioRecordingModalProps> = ({
  open,
  handleClose,
  handleSubmit
}: AudioRecordingModalProps) => {
  const [audioLink, setAudioLink] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAudioLink(event.target.value);
  };

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      await handleSubmit(audioLink);
      setIsSuccess(true);
    } catch (error) {
      setIsSuccess(false);
    }
    setIsSubmitting(false);
    handleClose();
    setShowResultModal(true);
  };

  const handleResultClose = () => {
    setShowResultModal(false);
    setAudioLink('');
  };

  return (
    <>
      {open && (
        <EuiOverlayMask>
          <StyledModal>
            <EuiModalHeader>
              <EuiText>
                <h2>Enter Audio Recording URL</h2>
              </EuiText>
            </EuiModalHeader>
            <AudioModalBody>
              <Label>Audio URL</Label>
              <Input
                placeholder="Enter public URL for AudioDataWorkflow"
                onChange={handleInputChange}
                value={audioLink}
                data-testid="audio-url-input"
              />
            </AudioModalBody>
            <StyledEuiModalFooter>
              <AudioButtonGroup>
                <AudioButtonWrap>
                  <ActionButton color="cancel" onClick={handleClose}>
                    Cancel
                  </ActionButton>
                  <ActionButton
                    data-testid="audio-submit-btn"
                    onClick={onSubmit}
                    disabled={isSubmitting}
                  >
                    Submit
                  </ActionButton>
                </AudioButtonWrap>
              </AudioButtonGroup>
            </StyledEuiModalFooter>
          </StyledModal>
        </EuiOverlayMask>
      )}

      {showResultModal && (
        <EuiOverlayMask>
          <StyledModal>
            <EuiModalHeader>
              <EuiText>
                <h2>Request Submitted</h2>
              </EuiText>
            </EuiModalHeader>
            <AudioModalBody>
              <div>
                {isSuccess
                  ? 'Your request has been submitted and the feature brief will be updated soon.'
                  : 'Your request has failed please contact the Hive Product Manager.'}
              </div>
            </AudioModalBody>
            <StyledEuiModalFooter>
              <AudioButtonGroup>
                <AudioButtonWrap>
                  <ActionButton onClick={handleResultClose}>Close</ActionButton>
                </AudioButtonWrap>
              </AudioButtonGroup>
            </StyledEuiModalFooter>
          </StyledModal>
        </EuiOverlayMask>
      )}
    </>
  );
};

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
  showAudioButton?: boolean;
  feature_uuid?: string;
  previewMode: 'preview' | 'edit';
  setPreviewMode: DispatchSetStateAction<'preview' | 'edit'>;
  workspaceUUID: string;
}

const WorkspaceEditableField = ({
  label,
  value,
  setValue,
  isEditing,
  setIsEditing,
  placeholder,
  dataTestIdPrefix,
  onSubmit,
  main,
  showAudioButton = false,
  feature_uuid,
  previewMode,
  setPreviewMode,
  workspaceUUID
}: WSEditableFieldProps) => {
  const handleCancelClick = () => {
    setIsEditing(true);
  };

  const [showAudioModal, setShowAudioModal] = useState(false);

  const handleAudioGeneration = () => {
    setShowAudioModal(true);
  };

  const handleAudioModalClose = () => {
    setShowAudioModal(false);
  };

  const handleAudioModalSubmit = async (audioLink: string) => {
    const postData = {
      audioLink,
      featureUUID: feature_uuid ?? '',
      source: 'featureBrief',
      examples: [
        'Hive Process integrates Stakwork Workflows and LLM based automation into the Hive Development Process. This will reduce workload on Product Managers by streamlining creative tasks and automating the drafting of product artefacts and audit tasks. \nIn this feature we will automate the production of User Stories and Requirements from a Product Brief and Feature Brief. \nThis will leverage a Stakwork workflow which will take the following steps:\n1. Load the product context and specific feature context. \n2. Generate a series of user stories in the workflow as a JSON object. \n3. Iterate through the user stories and score them for relevance against the product and feature context. \n4. Filter out low relevance scores\n5. Return the information to a form in the Hive Process for human review and acceptance.'
      ]
    };

    const response = await main.sendAudioData(postData);
    if (!response || !response.ok) {
      throw new Error('Failed to submit audio data');
    }
  };

  return (
    <FieldWrap>
      <FlexContainer>
        <Label>{label}</Label>
        {showAudioButton && (
          <>
            <ActionButton
              color="primary"
              onClick={handleAudioGeneration}
              data-testid="audio-generation-btn"
            >
              Audio Generation
            </ActionButton>
            <AudioRecordingModal
              open={showAudioModal}
              handleClose={handleAudioModalClose}
              handleSubmit={handleAudioModalSubmit}
              featureUUID={feature_uuid ?? ''}
            />
          </>
        )}
      </FlexContainer>
      <Data>
        <EditableField
          value={value}
          setValue={setValue}
          isEditing={isEditing}
          previewMode={previewMode}
          setPreviewMode={setPreviewMode}
          placeholder={placeholder}
          dataTestIdPrefix={dataTestIdPrefix}
          workspaceUUID={workspaceUUID}
          onCancel={handleCancelClick}
          onUpdate={onSubmit}
        />
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
  const { feature_uuid, workspaceId } = useParams<{ feature_uuid: string; workspaceId: string }>();
  const [featureData, setFeatureData] = useState<Feature | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userStory, setUserStory] = useState<string>('');
  const [userStoryPriority, setUserStoryPriority] = useState<number>(0);
  const [featureStories, setFeatureStories] = useState<FeatureStory[]>([]);
  const [brief, setBrief] = useState<string>('');
  const [phases, setPhases] = useState<Phase[]>([]);
  const [architecture, setArchitecture] = useState<string>('');
  const [requirements, setRequirements] = useState<string>('');
  const [editBrief, setEditBrief] = useState<boolean>(true);
  const [editArchitecture, setEditArchitecture] = useState<boolean>(true);
  const [editRequirements, setEditRequirements] = useState<boolean>(true);
  const [displayBriefOptions, setDisplayBriefOptions] = useState<boolean>(false);
  const [websocketSessionId, setWebsocketSessionId] = useState('');
  const [displayArchitectureOptions, setDisplayArchitectureOptions] = useState<boolean>(false);
  const [displayRequirementsOptions, setDisplayRequirementsOptions] = useState<boolean>(false);
  const [displayUserStoryOptions, setDisplayUserStoryOptions] = useState<Record<number, boolean>>(
    {}
  );
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editUserStory, setEditUserStory] = useState<FeatureStory>();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [workspaceData, setWorkspaceData] = useState<Workspace>();
  const [collapsed, setCollapsed] = useState(false);
  const [editFeatureName, setEditFeatureName] = useState<string>(featureData?.name || '');
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [displayNameOptions, setDisplayNameOptions] = useState<boolean>(false);
  const [briefPreviewMode, setBriefPreviewMode] = useState<'preview' | 'edit'>('preview');
  const [architecturePreviewMode, setArchitecturePreviewMode] = useState<'preview' | 'edit'>(
    'preview'
  );
  const [requirementsPreviewMode, setRequirementsPreviewMode] = useState<'preview' | 'edit'>(
    'preview'
  );
  const [permissionsChecked, setPermissionsChecked] = useState<boolean>(false);

  const history = useHistory();

  const editWorkspaceDisabled = useMemo(() => {
    if (!ui.meInfo) return true;
    if (!workspaceData?.owner_pubkey) return false;

    const isWorkspaceAdmin = workspaceData.owner_pubkey === ui.meInfo.owner_pubkey;
    return !isWorkspaceAdmin && !userHasRole(main.bountyRoles, userRoles, 'EDIT ORGANIZATION');
  }, [workspaceData, ui.meInfo, userRoles, main.bountyRoles]);

  useEffect(() => {
    const handleCollapseChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ collapsed: boolean }>;
      setCollapsed(customEvent.detail.collapsed);
    };

    window.addEventListener('sidebarCollapse', handleCollapseChange as EventListener);

    return () => {
      window.removeEventListener('sidebarCollapse', handleCollapseChange as EventListener);
    };
  }, []);

  useEffect(() => {
    const loadWorkspace = async () => {
      if (!workspaceId) return;

      try {
        const workspaceData = await main.getUserWorkspaceByUuid(workspaceId);
        if (workspaceData) {
          setWorkspaceData(workspaceData);
        } else {
          console.error('Failed to load workspace data');
          setToasts([
            {
              id: `error-${Date.now()}`,
              title: 'Error',
              color: 'danger',
              text: 'Failed to load workspace data'
            }
          ]);
        }
      } catch (error) {
        console.error('Error loading workspace:', error);
      }
    };

    loadWorkspace();
  }, [workspaceId, main]);

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

    if (data) {
      setFeatureStories(data);
      setUserStoryPriority((data?.length + 1) as number);
    }

    setLoading(false);
  }, [feature_uuid, main]);

  useEffect(() => {
    Promise.all([getFeatureData(), getFeaturePhaseData(), getFeatureStoryData()]).finally(() => {
      setLoading(false);
    });
  }, [getFeatureData, getFeaturePhaseData, getFeatureStoryData]);

  const getWorkspaceData = useCallback(async () => {
    if (!featureData?.workspace_uuid) return;
    const workspaceData = await main.getUserWorkspaceByUuid(featureData.workspace_uuid);
    if (!workspaceData) return;
    setWorkspaceData(workspaceData);

    setLoading(false);
  }, [featureData?.workspace_uuid, main]);

  useEffect(() => {
    getWorkspaceData();
  }, [getWorkspaceData]);

  useEffect(() => {
    const socket = createSocketInstance();

    socket.onmessage = async (event: MessageEvent) => {
      console.log('Raw websocket message received:', event.data);

      try {
        const data = JSON.parse(event.data);
        console.log('Parsed websocket message:', data);

        if (data.msg === SOCKET_MSG.user_connect) {
          const sessionId = data.body;
          setWebsocketSessionId(sessionId);
          console.log(`Websocket Session ID: ${sessionId}`);
        } else if (data.action === 'message' && data.message) {
          await getFeatureStoryData();
        } else if (data.action === 'process' && data.message) {
          await getFeatureStoryData();
        }
      } catch (error) {
        console.error('Error processing websocket message:', error);
      }
    };

    socket.onclose = () => {
      console.log('Socket disconnected user feature stories');
    };

    socket.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
      ui.setToasts([
        {
          title: 'Connection Error',
          color: 'danger',
          text: 'Failed to connect to featureStory server'
        }
      ]);
    };
  }, [ui, getFeatureStoryData]);

  const getUserRoles = useCallback(
    async (user: any) => {
      const pubkey = user.owner_pubkey;
      if (featureData?.workspace_uuid && pubkey) {
        const userRoles = await main.getUserRoles(featureData.workspace_uuid, pubkey);
        setUserRoles(userRoles);
      }
    },
    [featureData?.workspace_uuid, main]
  );

  useEffect(() => {
    if (featureData?.workspace_uuid && ui.meInfo) {
      getUserRoles(ui.meInfo).finally(() => {
        setPermissionsChecked(true);
      });
    } else {
      setPermissionsChecked(true);
    }
  }, [getUserRoles, ui.meInfo]);

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
    setIsEditing(true);
  };

  const handleUserStorySubmit = async () => {
    if (userStory.trim() === '') return;
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

  const handleGenerateClick = () => {
    history.push(`/feature/${feature_uuid}/stories/${websocketSessionId}`);
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

  if (loading || !permissionsChecked) {
    return (
      <Body style={{ justifyContent: 'center', alignItems: 'center' }}>
        <EuiLoadingSpinner size="xl" />
      </Body>
    );
  }

  if (editWorkspaceDisabled) {
    return (
      <FullNoBudgetWrap>
        <MaterialIcon
          icon={'lock'}
          style={{
            fontSize: 30,
            cursor: 'pointer',
            color: '#ccc'
          }}
        />
        <FullNoBudgetText>
          You have restricted permissions and you are unable to view this page. Reach out to the
          workspace admin to get them updated.
        </FullNoBudgetText>
      </FullNoBudgetWrap>
    );
  }

  const onDragEnd = ({ source, destination }: any) => {
    if (source && destination && source.index !== destination.index) {
      const updatedStories = [...featureStories];

      const [movedItem] = updatedStories.splice(source.index, 1);
      const dropItem = featureStories[destination.index];

      if (destination.index !== updatedStories.length) {
        updatedStories.splice(destination.index, 0, movedItem);
      } else {
        updatedStories[source.index] = dropItem;
        updatedStories.splice(updatedStories.length, 1, movedItem);
      }

      setFeatureStories(updatedStories);

      // get drag feature
      const dragIndex = updatedStories.findIndex(
        (feat: FeatureStory) => feat.uuid === movedItem.uuid
      );
      // get drop feature
      const dropIndex = updatedStories.findIndex(
        (feat: FeatureStory) => feat.uuid === dropItem.uuid
      );

      // update drag and drop items indexes
      handleReorderUserStories(movedItem, dragIndex + 1);
      handleReorderUserStories(dropItem, dropIndex + 1);
    }
  };

  const openEditModal = () => {
    setEditFeatureName(featureData?.name || '');
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleUpdateFeatureName = async () => {
    const body = {
      uuid: featureData?.uuid ?? '',
      name: editFeatureName,
      workspace_uuid: featureData?.workspace_uuid ?? ''
    };
    await main.addWorkspaceFeature(body);
    await getFeatureData();
    setIsEditModalOpen(false);
  };

  return (
    <>
      <SidebarComponent uuid={workspaceData?.uuid || ''} />
      <WorkspaceFeatureBody collapsed={collapsed}>
        <ActivitiesHeader uuid={workspaceData?.uuid || ''} />
        <FeatureHeadWrap>
          <FeatureHeadNameWrap>
            <MaterialIcon
              onClick={() =>
                history.push(`/workspace/${workspaceData?.uuid}/feature/${feature_uuid}`)
              }
              icon={'arrow_back'}
              style={{
                fontSize: 25,
                cursor: 'pointer'
              }}
            />
            <WorkspaceName>{featureData?.name}</WorkspaceName>
            <FeatureOptionsWrap>
              <MaterialIcon
                icon="more_horiz"
                className="MaterialIcon"
                onClick={() => setDisplayNameOptions(!displayNameOptions)}
                data-testid="feature-name-btn"
              />
              {displayNameOptions && (
                <EditPopover>
                  <EditPopoverTail />
                  <EditPopoverContent
                    onClick={() => {
                      openEditModal();
                      setDisplayNameOptions(false);
                    }}
                  >
                    <MaterialIcon icon="edit" style={{ fontSize: '20px', marginTop: '2px' }} />
                    <EditPopoverText data-testid="feature-name-edit-btn">Edit</EditPopoverText>
                  </EditPopoverContent>
                </EditPopover>
              )}
            </FeatureOptionsWrap>
          </FeatureHeadNameWrap>
          {isEditModalOpen && (
            <EuiOverlayMask>
              <StyledModal>
                <EuiModalHeader>
                  <EuiText>
                    <h2>Edit Feature Name</h2>
                  </EuiText>
                </EuiModalHeader>
                <FeatureModalBody>
                  <Label>Feature Name</Label>
                  <Input
                    placeholder="Edit Feature Name"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditFeatureName(e.target.value)
                    }
                    value={editFeatureName}
                    data-testid="edit-feature-name-input"
                  />
                </FeatureModalBody>
                <FeatureModalFooter>
                  <StoriesButtonGroup>
                    <ActionButton color="cancel" onClick={closeEditModal}>
                      Cancel
                    </ActionButton>
                    <ActionButton
                      data-testid="feature-name-save-btn"
                      onClick={handleUpdateFeatureName}
                      color="primary"
                    >
                      Update
                    </ActionButton>
                  </StoriesButtonGroup>
                </FeatureModalFooter>
              </StyledModal>
            </EuiOverlayMask>
          )}
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
            showAudioButton={true}
            feature_uuid={feature_uuid}
            previewMode={briefPreviewMode}
            setPreviewMode={setBriefPreviewMode}
            workspaceUUID={featureData?.workspace_uuid ?? ''}
          />
          <FieldWrap>
            <Label>User Stories</Label>
            <UserStoryWrapper>
              <EuiDragDropContext onDragEnd={onDragEnd}>
                <EuiDroppable droppableId="user_story_droppable_area" spacing="m">
                  {featureStories.map((story: FeatureStory, idx: number) => (
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
                <StoriesButtonGroup>
                  <ActionButton
                    marginTop="0"
                    height="40px"
                    color="primary"
                    onClick={handleUserStorySubmit}
                    data-testid="story-input-update-btn"
                  >
                    Create
                  </ActionButton>
                  <ActionButton
                    marginTop="0"
                    height="40px"
                    color="primary"
                    onClick={handleGenerateClick}
                    data-testid="story-generate-btn"
                  >
                    Generate
                  </ActionButton>
                </StoriesButtonGroup>
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
            previewMode={requirementsPreviewMode}
            setPreviewMode={setRequirementsPreviewMode}
            workspaceUUID={featureData?.workspace_uuid ?? ''}
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
            previewMode={architecturePreviewMode}
            setPreviewMode={setArchitecturePreviewMode}
            workspaceUUID={featureData?.workspace_uuid ?? ''}
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
      </WorkspaceFeatureBody>
    </>
  );
};

export default WorkspaceFeature;
