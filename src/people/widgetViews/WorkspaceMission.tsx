/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/typedef */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { EuiGlobalToastList, EuiLink, EuiLoadingSpinner } from '@elastic/eui';
import {
  Body,
  WorkspaceMissionBody,
  DataWrap,
  FieldWrap,
  Label,
  Data,
  OptionsWrap,
  EditPopoverTail,
  EditPopoverContent,
  EditPopoverText,
  EditPopover
} from 'pages/tickets/style';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStores } from 'store';
import { useDeleteConfirmationModal } from 'components/common';
import { Box } from '@mui/system';
import { FeatureCall, Person, Workspace, ChatWorkflow } from 'store/interface';
import MaterialIcon from '@material/react-material-icon';
import { Button, Modal } from 'components/common';
import { EuiToolTip } from '@elastic/eui';
import { useIsMobile } from 'hooks';
import styled from 'styled-components';
import { AvatarGroup } from 'components/common/AvatarGroup';
import { userHasRole } from 'helpers/helpers-extended';
import { CodeGraph } from 'store/interface';

import { SchematicPreview } from 'people/SchematicPreviewer';

import { colors } from '../../config/colors';
import SidebarComponent from '../../components/common/SidebarComponent.tsx';
import { useBrowserTabTitle } from '../../hooks';
import AddCodeGraph from './workspace/AddCodeGraphModal';
import AddFeatureCall from './workspace/AddFeatureCallModal.tsx';
import { FullNoBudgetWrap, FullNoBudgetText } from './workspace/style';
import AddRepoModal from './workspace/AddRepoModal';
import EditSchematic from './workspace/EditSchematicModal';
import ManageWorkspaceUsersModal from './workspace/ManageWorkspaceUsersModal';
import { BudgetWrapComponent } from './BudgetWrap';
import { EditableField } from './workspace/EditableField';
import { Toast } from './workspace/interface';
import TextSnippetModal from './workspace/TextSnippetModal.tsx';
import ActivitiesHeader from './workspace/Activities/header.tsx';
import AddChatWorkflow from './workspace/AddChatWorkflowModal.tsx';
import ManageCodeSpaceModal from './workspace/ManageCodeSpaceModal.tsx';
import {
  Section,
  SectionHeader,
  SectionTitle,
  SettingsContainer,
  SectionRow,
  ToolButton,
  ToolsSection,
  RepositoryItem,
  RepositoryInfo,
  RepositoryIcon,
  RepositoryText,
  RepositoryName,
  RepositoryUrl,
  IntegrationItem,
  IntegrationInfo,
  IntegrationIcon,
  IntegrationContent,
  IntegrationTitle,
  IntegrationDescription
} from './workspace/style.ts';

const color = colors['light'];

export const RowWrap = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1rem; /* Adjust this margin as needed */
`;

const EuiLinkStyled = styled(EuiLink)<{ isMobile: boolean }>`
  border: none;
  margin-left: ${(props: any) => (props.isMobile ? 'auto' : '0')};
  margin: ${(props: any) => (props.isMobile ? '0' : '0')};
  background-color: #fff;
`;

const UrlLink = styled.a`
  word-wrap: break-word;
  word-break: break-all;
  color: #0066cc;
  text-decoration: none;
  flex: 1;
  min-width: 200px;
  padding-right: 16px;

  &:hover {
    text-decoration: underline;
  }
`;

const WorkspaceMission = () => {
  const { main, ui } = useStores();
  const { uuid } = useParams<{ uuid: string }>();
  const [workspaceData, setWorkspaceData] = useState<Workspace>();
  const [loading, setLoading] = useState(true);
  const [editMission, setEditMission] = useState<boolean>(true);
  const [displaySchematic, setDidplaySchematic] = useState(false);
  const [editTactics, setEditTactics] = useState<boolean>(true);
  const [mission, setMission] = useState(workspaceData?.mission);
  const [schematicModal, setSchematicModal] = useState(false);
  const [tactics, setTactics] = useState(workspaceData?.tactics);
  const [repoName, setRepoName] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [repositories, setRepositories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentuuid, setCurrentuuid] = useState('');
  const [modalType, setModalType] = useState('add');
  const [isOpenUserManage, setIsOpenUserManage] = useState<boolean>(false);
  const [users, setUsers] = useState<Person[]>([]);
  const [codeGraphModal, setCodeGraphModal] = useState(false);
  const [codeGraph, setCodeGraph] = useState<CodeGraph | null>(null);
  const [codeGraphModalType, setCodeGraphModalType] = useState<'add' | 'edit'>('add');
  const [currentCodeGraphUuid, setCurrentCodeGraphUuid] = useState('');
  const [selectedCodeGraph, setSelectedCodeGraph] = useState<{
    name: string;
    url: string;
    secret_alias: string;
  }>();
  const [featureCallModal, setFeatureCallModal] = useState(false);
  const [featureCall, setFeatureCall] = useState<FeatureCall | null>(null);
  const [featureCallModalType, setFeatureCallModalType] = useState<'add' | 'edit'>('add');
  const [currentFeatureCallUrl, setCurrentFeatureCallUrl] = useState('');
  const [selectedFeatureCall, setSelectedFeatureCall] = useState<{
    id: string;
    url: string;
  }>();
  const [missionPreviewMode, setMissionPreviewMode] = useState<'preview' | 'edit'>('preview');
  const [tacticsPreviewMode, setTacticsPreviewMode] = useState<'preview' | 'edit'>('preview');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [permissionsChecked, setPermissionsChecked] = useState<boolean>(false);
  const [isSnippetModalVisible, setSnippetModalVisible] = useState(false);
  const [currentOpenMenu, setCurrentOpenMenu] = useState<string | number | null>(null);
  const [chatWorkflowModal, setChatWorkflowModal] = useState(false);
  const [codeSpaceModal, setCodeSpaceModal] = useState(false);
  const [selectedChatWorkflow, setSelectedChatWorkflow] = useState<ChatWorkflow | null>(null);
  const [currentChatWorkflowUrl, setCurrentChatWorkflowUrl] = useState('');
  const [featureFlags, setFeatureFlags] = useState<any>({});

  const openSnippetModal = () => {
    setSnippetModalVisible(true);
  };

  const closeSnippetModal = () => {
    setSnippetModalVisible(false);
  };

  const fetchCodeGraph = useCallback(async () => {
    try {
      const data = await main.getWorkspaceCodeGraph(uuid);
      setCodeGraph(data);
    } catch (error) {
      console.error(error);
    }
  }, [main, uuid]);

  const fetchFeatureCall = useCallback(async () => {
    try {
      const data = await main.getWorkspaceFeatureCall(uuid);
      setFeatureCall(data);
    } catch (error) {
      console.error(error);
    }
  }, [main, uuid]);

  const fetchChatWorkflow = useCallback(async () => {
    try {
      const data = await main.getWorkspaceChatWorkflow(uuid);
      setSelectedChatWorkflow(data);
      if (data) {
        setCurrentChatWorkflowUrl(data.url);
      }
    } catch (error) {
      console.error('Error fetching chat workflow:', error);
    }
  }, [main, uuid]);

  const fetchFeatureFlags = useCallback(async () => {
    try {
      const response = await main.getFeatureFlags();

      console.log(response);
      if (response?.success) {
        setFeatureFlags(
          response.data.reduce((acc: any, flag: any) => {
            acc[flag.name] = flag.enabled;
            return acc;
          }, {})
        );
      }
    } catch (error) {
      console.error('Error fetching feature flags:', error);
    }
  }, [main]);

  useBrowserTabTitle('Workspace');

  useEffect(() => {
    fetchCodeGraph();
  }, [fetchCodeGraph]);

  useEffect(() => {
    fetchFeatureCall();
  }, [fetchFeatureCall]);

  useEffect(() => {
    fetchChatWorkflow();
  }, [fetchChatWorkflow]);

  useEffect(() => {
    fetchFeatureFlags();
  }, [fetchFeatureFlags]);

  const openCodeGraphModal = (type: 'add' | 'edit', graph?: CodeGraph) => {
    if (type === 'edit' && graph) {
      if (graph) {
        setSelectedCodeGraph({
          name: graph.name,
          url: graph.url,
          secret_alias: graph.secret_alias
        });
      }
      setCurrentCodeGraphUuid(graph.uuid);
    } else {
      setCurrentCodeGraphUuid('');
    }
    setCodeGraphModalType(type);
    setCodeGraphModal(true);
  };

  const openFeatureCallModal = (type: 'add' | 'edit', featureCall?: FeatureCall) => {
    if (type === 'edit' && featureCall) {
      if (featureCall) {
        setSelectedFeatureCall({
          id: featureCall.id,
          url: featureCall.url
        });
      }
      setCurrentFeatureCallUrl(featureCall.url);
    } else {
      // setCurrent('');
    }
    setFeatureCallModalType(type);
    setFeatureCallModal(true);
  };

  const openChatWorkflowModal = (type: 'add' | 'edit') => {
    if (type === 'add') {
      setCurrentChatWorkflowUrl('');
    } else {
      setCurrentChatWorkflowUrl(selectedChatWorkflow?.url || '');
    }
    setChatWorkflowModal(true);
  };

  const openCodeSpaceModal = () => {
    setCodeSpaceModal(true);
  };

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

  const closeCodeGraphModal = () => {
    setSelectedCodeGraph({
      name: '',
      url: '',
      secret_alias: ''
    });
    setCurrentCodeGraphUuid('');
    setCodeGraphModal(false);
  };

  const closeFeatureCallModal = () => {
    setSelectedFeatureCall({
      id: '',
      url: ''
    });
    setCurrentFeatureCallUrl('');
    setFeatureCallModal(false);
  };

  const closeChatWorkflowModal = () => {
    setSelectedChatWorkflow(null);
    setCurrentChatWorkflowUrl('');
    setChatWorkflowModal(false);
  };

  const closeCodeSpaceModal = () => {
    setCodeSpaceModal(false);
  };

  const handleDeleteCodeGraph = async () => {
    try {
      await main.deleteCodeGraph(uuid, currentCodeGraphUuid);
      closeCodeGraphModal();
      fetchCodeGraph();
    } catch (error) {
      console.error('Error deleteCodeGraph', error);
    }
  };

  const handleDeleteFeatureCall = async () => {
    try {
      await main.deleteFeatureCall(uuid);
      closeFeatureCallModal();
      fetchFeatureCall();
    } catch (error) {
      console.error('Error deleteFeatureCall', error);
    }
  };

  const handleDeleteChatWorkflow = async () => {
    try {
      await main.deleteChatWorkflow(uuid);
      closeChatWorkflowModal();
      fetchChatWorkflow();
    } catch (error) {
      console.error('Error deleteChatWorkflow', error);
    }
  };

  const handleUserRepoOptionClick = (repositoryId: string | number) => {
    if (currentOpenMenu === repositoryId) {
      setCurrentOpenMenu(null);
    } else {
      setCurrentOpenMenu(repositoryId);
    }
  };
  const [userRoles, setUserRoles] = useState<any[]>([]);

  const isMobile = useIsMobile();

  const editWorkspaceDisabled = useMemo(() => {
    if (!ui.meInfo) return true;
    if (!workspaceData?.owner_pubkey) return false;

    const isWorkspaceAdmin = workspaceData.owner_pubkey === ui.meInfo.owner_pubkey;
    return !isWorkspaceAdmin && !userHasRole(main.bountyRoles, userRoles, 'EDIT ORGANIZATION');
  }, [workspaceData, ui.meInfo, userRoles, main.bountyRoles]);

  const getUserRoles = useCallback(
    async (user: any) => {
      const pubkey = user.owner_pubkey;
      if (uuid && pubkey) {
        const userRoles = await main.getUserRoles(uuid, pubkey);
        setUserRoles(userRoles);
      }
    },
    [uuid, main]
  );

  useEffect(() => {
    if (uuid && ui.meInfo) {
      getUserRoles(ui.meInfo).finally(() => {
        setPermissionsChecked(true);
      });
    } else {
      setPermissionsChecked(true);
    }
  }, [getUserRoles]);

  const fetchRepositories = useCallback(async () => {
    try {
      const data = await main.getRepositories(uuid);
      setRepositories(data);
    } catch (error) {
      console.error(error);
    }
  }, [main, uuid]);

  const openModal = (type: string, repository?: any) => {
    if (type === 'add') {
      setRepoName('');
      setCurrentuuid('');
      setRepoUrl('');
      setIsModalVisible(true);
      setModalType(type);
    } else if (type === 'edit') {
      setRepoName(repository.name);
      setCurrentuuid(repository.uuid);
      setRepoUrl(repository.url);
      setIsModalVisible(true);
      setModalType(type);
    }
  };

  const closeRepoModal = () => {
    setIsModalVisible(false);
  };

  const DeleteRepository = async (workspace_uuid: string, repository_uuid: string) => {
    try {
      await main.deleteRepository(workspace_uuid, repository_uuid);
      closeRepoModal();
      fetchRepositories();
    } catch (error) {
      console.error('Error deleteRepository', error);
    }
  };

  const handleDelete = () => {
    closeRepoModal();
    DeleteRepository(uuid, currentuuid);
  };

  const { openDeleteConfirmation } = useDeleteConfirmationModal();

  const deleteHandler = () => {
    openDeleteConfirmation({
      onDelete: handleDelete,
      children: (
        <Box fontSize={20} textAlign="center">
          Are you sure you want to <br />
          <Box component="span" fontWeight="500">
            Delete this Repo?
          </Box>
        </Box>
      )
    });
  };

  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  const getWorkspaceData = useCallback(async () => {
    if (!uuid) return;
    const workspaceData = await main.getUserWorkspaceByUuid(uuid);
    if (!workspaceData) return;
    setWorkspaceData(workspaceData);

    setLoading(false);
  }, [uuid, main]);

  const getWorkspaceUsers = useCallback(async () => {
    if (uuid) {
      const users = await main.getWorkspaceUsers(uuid);
      setUsers(users);
      return users;
    }
  }, [main, uuid]);

  useEffect(() => {
    getWorkspaceData();
    getWorkspaceUsers();
  }, [getWorkspaceData, getWorkspaceUsers]);

  const submitMission = async () => {
    try {
      const body = {
        mission: mission ?? '',
        owner_pubkey: ui.meInfo?.owner_pubkey ?? '',
        uuid: workspaceData?.uuid ?? ''
      };
      await main.workspaceUpdateMission(body);
      await getWorkspaceData();
      setEditMission(true);
      setToasts([
        {
          id: `${Date.now()}-mission-success`,
          title: 'Success',
          color: 'success',
          text: 'Mission updated successfully!'
        }
      ]);
    } catch (error) {
      setToasts([
        {
          id: `${Date.now()}-mission-error`,
          title: 'Error',
          color: 'danger',
          text: 'Failed to update mission'
        }
      ]);
    }
  };

  const refreshCodeSpace = async () => {
    try {
      console.log('Refreshing Code Graph', uuid);
      const response = await main.refreshCodeSpace(uuid);
      console.log('Refresh Code Graph Response:', response);
    } catch (error) {
      console.error('Error refreshing code graph:', error);
    }
  };

  const submitTactics = async () => {
    try {
      const body = {
        tactics: tactics ?? '',
        owner_pubkey: ui.meInfo?.owner_pubkey ?? '',
        uuid: workspaceData?.uuid ?? ''
      };
      await main.workspaceUpdateTactics(body);
      await getWorkspaceData();
      setEditTactics(true);
      setToasts([
        {
          id: `${Date.now()}-tactics-success`,
          title: 'Success',
          color: 'success',
          text: 'Tactics updated successfully!'
        }
      ]);
    } catch (error) {
      setToasts([
        {
          id: `${Date.now()}-tactics-error`,
          title: 'Error',
          color: 'danger',
          text: 'Failed to update tactics'
        }
      ]);
    }
  };

  const toggleSchematicModal = () => {
    setDidplaySchematic(false);
    setSchematicModal(!schematicModal);
  };

  const selectedWorkspace = main.workspaces.find((workspace: Workspace) => workspace.uuid === uuid);

  const avatarList = useMemo(
    () => users.map((user: Person) => ({ name: user.owner_alias, imageUrl: user.img })),
    [users]
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

  const toggleManageUserModal = () => setIsOpenUserManage(!isOpenUserManage);
  const updateWorkspaceUsers = (updatedUsers: Person[]) => setUsers(updatedUsers);

  return (
    !loading &&
    !editWorkspaceDisabled && (
      <>
        <SidebarComponent uuid={uuid} />
        <WorkspaceMissionBody collapsed={collapsed}>
          <ActivitiesHeader uuid={uuid} />
          <SettingsContainer>
            <DataWrap style={{ marginTop: '20px', padding: '0px' }}>
              <FieldWrap style={{ background: 'white' }}>
                <BudgetWrapComponent uuid={uuid} org={workspaceData} />
              </FieldWrap>
            </DataWrap>

            <SectionRow style={{ marginTop: '20px' }}>
              <Section>
                <Label>Mission</Label>
                <Data>
                  <EditableField
                    value={mission ?? workspaceData?.mission ?? ''}
                    setValue={setMission}
                    isEditing={editMission}
                    previewMode={missionPreviewMode}
                    setPreviewMode={setMissionPreviewMode}
                    placeholder="Mission"
                    dataTestIdPrefix="mission"
                    workspaceUUID={workspaceData?.uuid}
                    onCancel={() => setEditMission(true)}
                    onUpdate={submitMission}
                    defaultHeight="250px"
                  />
                </Data>
              </Section>
              <Section>
                <Label>Tactics and Objectives</Label>
                <Data>
                  <EditableField
                    value={tactics ?? workspaceData?.tactics ?? ''}
                    setValue={setTactics}
                    isEditing={editTactics}
                    previewMode={tacticsPreviewMode}
                    setPreviewMode={setTacticsPreviewMode}
                    placeholder="Tactics"
                    dataTestIdPrefix="tactics"
                    workspaceUUID={workspaceData?.uuid}
                    onCancel={() => setEditTactics(true)}
                    onUpdate={submitTactics}
                    defaultHeight="250px"
                  />
                </Data>
              </Section>
            </SectionRow>

            <SectionRow>
              <Section>
                <Label>Schematic</Label>
                <Data style={{ border: 'none', paddingLeft: '0px', padding: '5px 5px' }}>
                  <SchematicPreview
                    schematicImg={workspaceData?.schematic_img || ''}
                    schematicUrl={workspaceData?.schematic_url || ''}
                  />
                  <RowWrap>
                    <OptionsWrap style={{ position: 'unset', display: 'contents' }}>
                      <MaterialIcon
                        icon={'more_horiz'}
                        className="MaterialIcon"
                        onClick={() => setDidplaySchematic(!displaySchematic)}
                        data-testid="schematic-option-btn"
                        style={{ transform: 'rotate(90deg)' }}
                      />
                      <EditPopover style={{ display: displaySchematic ? 'block' : 'none' }}>
                        <EditPopoverTail bottom="-30px" left="-27px" />
                        <EditPopoverContent
                          onClick={toggleSchematicModal}
                          bottom="-60px"
                          transform="translateX(-90%)"
                        >
                          <MaterialIcon
                            icon="edit"
                            style={{ fontSize: '20px', marginTop: '2px' }}
                          />
                          <EditPopoverText data-testid="schematic-edit-btn">Edit</EditPopoverText>
                        </EditPopoverContent>
                      </EditPopover>
                    </OptionsWrap>
                    {workspaceData?.schematic_url ? (
                      <a
                        href={workspaceData?.schematic_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid="schematic-url"
                        style={{ marginLeft: '0.5rem' }}
                      >
                        schematic
                      </a>
                    ) : (
                      <span style={{ marginLeft: '0.5rem' }}>No schematic url yet</span>
                    )}
                  </RowWrap>
                </Data>
              </Section>
              <Section>
                <SectionHeader>
                  <SectionTitle style={{ marginBottom: 0 }}>People</SectionTitle>
                  <EuiLinkStyled isMobile={isMobile} onClick={toggleManageUserModal}>
                    Manage
                  </EuiLinkStyled>
                </SectionHeader>
                <AvatarGroup avatarList={avatarList} avatarSize="xl" maxGroupSize={10} />
              </Section>
            </SectionRow>

            <Section>
              <SectionHeader>
                <SectionTitle>Repositories</SectionTitle>
                <Button
                  onClick={() => openModal('add')}
                  dataTestId="new-repository-btn"
                  text="Add Repository"
                  color="primary"
                />
              </SectionHeader>
              {repositories.map((repository: any) => (
                <RepositoryItem key={repository?.id}>
                  <RepositoryInfo>
                    <RepositoryIcon>
                      <MaterialIcon icon="code" />
                    </RepositoryIcon>
                    <RepositoryText>
                      <RepositoryName>{repository.name}</RepositoryName>
                      <RepositoryUrl href={repository.url} target="_blank" rel="noreferrer">
                        {repository.url}
                      </RepositoryUrl>
                    </RepositoryText>
                  </RepositoryInfo>
                  <Button onClick={() => openModal('edit', repository)} text="Edit" color="link" />
                </RepositoryItem>
              ))}
              {repositories.length === 0 && <p>No repositories added yet.</p>}
            </Section>

            <Section>
              <SectionTitle>Integrations</SectionTitle>
              <IntegrationItem>
                <IntegrationInfo>
                  <IntegrationIcon>
                    <MaterialIcon icon="hub" />
                  </IntegrationIcon>
                  <IntegrationContent>
                    <IntegrationTitle>Code Graph</IntegrationTitle>
                    <IntegrationDescription>
                      {codeGraph
                        ? `Connected to ${codeGraph.name}`
                        : 'Not connected. Connect to a code graph for AI-powered features.'}
                    </IntegrationDescription>
                  </IntegrationContent>
                </IntegrationInfo>
                <Button
                  onClick={() =>
                    openCodeGraphModal(codeGraph ? 'edit' : 'add', codeGraph || undefined)
                  }
                  text={codeGraph ? 'Edit' : 'Add'}
                  color="link"
                />
              </IntegrationItem>
              <IntegrationItem>
                <IntegrationInfo>
                  <IntegrationIcon>
                    <MaterialIcon icon="call" />
                  </IntegrationIcon>
                  <IntegrationContent>
                    <IntegrationTitle>Feature Call</IntegrationTitle>
                    <IntegrationDescription>
                      {featureCall
                        ? `Webhook URL: ${featureCall.url}`
                        : 'Not configured. Set up a webhook for feature calls.'}
                    </IntegrationDescription>
                  </IntegrationContent>
                </IntegrationInfo>
                <Button
                  onClick={() =>
                    openFeatureCallModal(featureCall ? 'edit' : 'add', featureCall || undefined)
                  }
                  text={featureCall ? 'Edit' : 'Add'}
                  color="link"
                />
              </IntegrationItem>
              <IntegrationItem>
                <IntegrationInfo>
                  <IntegrationIcon>
                    <MaterialIcon icon="chat" />
                  </IntegrationIcon>
                  <IntegrationContent>
                    <IntegrationTitle>Hive Chat</IntegrationTitle>
                    <IntegrationDescription>
                      {selectedChatWorkflow
                        ? `Connected to workflow: ${selectedChatWorkflow.url}`
                        : 'Not configured. Set up a workflow for Hive Chat.'}
                    </IntegrationDescription>
                  </IntegrationContent>
                </IntegrationInfo>
                <Button
                  onClick={() => openChatWorkflowModal(selectedChatWorkflow ? 'edit' : 'add')}
                  text={selectedChatWorkflow ? 'Edit' : 'Add'}
                  color="link"
                />
              </IntegrationItem>
            </Section>

            <ToolsSection>
              <ToolButton
                onClick={() => openSnippetModal()}
                dataTestId="workspace-planner-btn"
                text="Manage Text snippets"
                color="white"
                leadingIcon="description"
              />
              <ToolButton
                onClick={() => openCodeSpaceModal()}
                text="Manage My Code Space"
                color="white"
                leadingIcon="code"
              />
              {featureFlags && (
                <ToolButton
                  onClick={() => refreshCodeSpace()}
                  text="Refresh Code Graph"
                  color="white"
                  leadingIcon="refresh"
                />
              )}
            </ToolsSection>
          </SettingsContainer>

          <Modal
            visible={isModalVisible}
            style={{
              height: '100%',
              flexDirection: 'column'
            }}
            envStyle={{
              marginTop: isMobile ? 64 : 0,
              background: color.pureWhite,
              zIndex: 20,
              maxHeight: '100%',
              borderRadius: '10px',
              minWidth: isMobile ? '100%' : '25%',
              minHeight: isMobile ? '100%' : '20%'
            }}
            overlayClick={closeRepoModal}
            bigCloseImage={closeRepoModal}
            bigCloseImageStyle={{
              top: '-18px',
              right: '-18px',
              background: '#000',
              borderRadius: '50%'
            }}
          >
            <AddRepoModal
              closeHandler={closeRepoModal}
              getRepositories={fetchRepositories}
              workspace_uuid={uuid}
              currentUuid={currentuuid}
              modalType={modalType}
              handleDelete={deleteHandler}
              name={repoName}
              url={repoUrl}
            />
          </Modal>
          <Modal
            visible={schematicModal}
            style={{
              height: '100%',
              flexDirection: 'column'
            }}
            envStyle={{
              marginTop: isMobile ? 64 : 0,
              background: color.pureWhite,
              zIndex: 20,
              maxHeight: '100%',
              borderRadius: '10px',
              minWidth: isMobile ? '100%' : '25%',
              minHeight: isMobile ? '100%' : '20%'
            }}
            overlayClick={toggleSchematicModal}
            bigCloseImage={toggleSchematicModal}
            bigCloseImageStyle={{
              top: '-18px',
              right: '-18px',
              background: '#000',
              borderRadius: '50%'
            }}
          >
            <EditSchematic
              closeHandler={toggleSchematicModal}
              getSchematic={getWorkspaceData}
              uuid={workspaceData?.uuid}
              owner_pubkey={ui.meInfo?.owner_pubkey}
              schematic_url={workspaceData?.schematic_url ?? ''}
              schematic_img={workspaceData?.schematic_img ?? ''}
            />
          </Modal>
          <Modal
            visible={codeGraphModal}
            style={{
              height: '100%',
              flexDirection: 'column'
            }}
            envStyle={{
              marginTop: isMobile ? 64 : 0,
              background: color.pureWhite,
              zIndex: 20,
              maxHeight: '100%',
              borderRadius: '10px',
              minWidth: isMobile ? '100%' : '30%',
              minHeight: isMobile ? '100%' : '20%'
            }}
            overlayClick={closeCodeGraphModal}
            bigCloseImage={closeCodeGraphModal}
            bigCloseImageStyle={{
              top: '-18px',
              right: '-18px',
              background: '#000',
              borderRadius: '50%'
            }}
          >
            <AddCodeGraph
              closeHandler={closeCodeGraphModal}
              getCodeGraph={fetchCodeGraph}
              workspace_uuid={uuid}
              modalType={codeGraphModalType}
              currentUuid={currentCodeGraphUuid}
              handleDelete={handleDeleteCodeGraph}
              name={selectedCodeGraph?.name}
              url={selectedCodeGraph?.url}
              secret_alias={selectedCodeGraph?.secret_alias}
            />
          </Modal>
          <Modal
            visible={featureCallModal}
            style={{
              height: '100%',
              flexDirection: 'column'
            }}
            envStyle={{
              marginTop: isMobile ? 64 : 0,
              background: color.pureWhite,
              zIndex: 20,
              maxHeight: '100%',
              borderRadius: '10px',
              minWidth: isMobile ? '100%' : '30%',
              minHeight: isMobile ? '100%' : '20%'
            }}
            overlayClick={closeFeatureCallModal}
            bigCloseImage={closeFeatureCallModal}
            bigCloseImageStyle={{
              top: '-18px',
              right: '-18px',
              background: '#000',
              borderRadius: '50%'
            }}
          >
            <AddFeatureCall
              closeHandler={closeFeatureCallModal}
              getFeatureCall={fetchFeatureCall}
              workspace_uuid={uuid}
              currentUuid={currentuuid}
              handleDelete={handleDeleteFeatureCall}
              url={currentFeatureCallUrl}
            />
          </Modal>
          <Modal
            visible={isSnippetModalVisible}
            style={{
              height: '100%',
              flexDirection: 'column'
            }}
            envStyle={{
              marginTop: isMobile ? 64 : 0,
              background: color.pureWhite,
              zIndex: 20,
              maxHeight: '60%',
              borderRadius: '10px',
              minWidth: isMobile ? '100%' : '60%',
              minHeight: isMobile ? '100%' : '50%',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
              overflowX: 'hidden'
            }}
            overlayClick={closeSnippetModal}
            bigCloseImage={closeSnippetModal}
            bigCloseImageStyle={{
              position: 'absolute',
              top: '-1%',
              right: '-1%',
              background: '#000',
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            <TextSnippetModal isVisible={isSnippetModalVisible} workspaceUUID={uuid} />
          </Modal>

          {isOpenUserManage && (
            <ManageWorkspaceUsersModal
              isOpen={isOpenUserManage}
              close={() => setIsOpenUserManage(!isOpenUserManage)}
              uuid={uuid}
              org={workspaceData}
              users={users}
              updateUsers={updateWorkspaceUsers}
            />
          )}
          <Modal
            visible={chatWorkflowModal}
            style={{
              height: '100%',
              flexDirection: 'column'
            }}
            envStyle={{
              marginTop: isMobile ? 64 : 0,
              background: color.pureWhite,
              zIndex: 20,
              maxHeight: '100%',
              borderRadius: '10px',
              minWidth: isMobile ? '100%' : '30%',
              minHeight: isMobile ? '100%' : '20%'
            }}
            overlayClick={closeChatWorkflowModal}
            bigCloseImage={closeChatWorkflowModal}
            bigCloseImageStyle={{
              top: '-18px',
              right: '-18px',
              background: '#000',
              borderRadius: '50%'
            }}
          >
            <AddChatWorkflow
              closeHandler={closeChatWorkflowModal}
              getChatWorkflow={fetchChatWorkflow}
              workspaceId={uuid}
              currentId={selectedChatWorkflow?.id}
              handleDelete={handleDeleteChatWorkflow}
              url={currentChatWorkflowUrl}
            />
          </Modal>
          <Modal
            visible={codeSpaceModal}
            style={{
              height: '100%',
              flexDirection: 'column'
            }}
            envStyle={{
              marginTop: isMobile ? 64 : 0,
              background: color.pureWhite,
              zIndex: 20,
              maxHeight: '100%',
              borderRadius: '10px',
              minWidth: isMobile ? '100%' : '30%',
              minHeight: isMobile ? '100%' : '20%'
            }}
            overlayClick={closeCodeSpaceModal}
            bigCloseImage={closeCodeSpaceModal}
            bigCloseImageStyle={{
              top: '-18px',
              right: '-18px',
              background: '#000',
              borderRadius: '50%'
            }}
          >
            <ManageCodeSpaceModal
              closeHandler={closeCodeSpaceModal}
              workspaceName={selectedWorkspace?.name}
              workspaceUUID={selectedWorkspace?.uuid as string}
              userAlias={ui.meInfo?.owner_alias}
            />
          </Modal>
          <EuiGlobalToastList
            toasts={toasts}
            dismissToast={() => setToasts([])}
            toastLifeTimeMs={3000}
          />
        </WorkspaceMissionBody>
      </>
    )
  );
};

export default WorkspaceMission;
