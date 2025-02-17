/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/typedef */
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { activityStore } from 'store/activityStore';
import MaterialIcon from '@material/react-material-icon';
import styled from 'styled-components';
import { AuthorType, ContentType, Feature, IActivity } from 'store/interface';
import { useStores } from 'store';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router';
import { EuiDragDropContext, EuiDraggable, EuiDroppable } from '@elastic/eui';
import { Phase } from '../interface';
import { quickBountyTicketStore } from '../../../../store/quickBountyTicketStore.ts';
import ActivitiesHeader from './header';

export const ActivitiesContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 2rem;
  padding: 3.5rem;
  background-color: #f8f9fa;
  height: calc(100vh - 120px);
  overflow-y: auto;
  margin-bottom: 50px;
  margin-top: 50px;
`;

const ModalOverlay = styled.div<{ collapsed: boolean }>`
  position: ${({ collapsed }) => (collapsed ? 'static' : 'fixed')};
  top: 0;
  left: 0;
  width: ${({ collapsed }) => (collapsed ? '0' : '100%')};
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  transition: all 0.3s ease;
  display: ${({ collapsed }) => (collapsed ? 'none' : 'block')};
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  margin: 20px 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
`;

const TextArea = styled.textarea`
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  min-height: 100px;
`;

const Button = styled.button`
  padding: 0.75rem 1rem;
  background: #94a3b8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #64748b;
  }
`;

const CharacterCount = styled.div`
  font-size: 0.8rem;
  color: ${(props) => props.theme.textSecondary};
  margin-top: 0.5rem;

  &.error {
    color: red;
    font-weight: bold;
  }
`;

const ItemList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const Item = styled.div`
  background: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
  line-height: 1;

  &:hover {
    color: #ff0000;
  }
`;

const MainContainer = styled.div<{ collapsed: boolean }>`
  flex-grow: 1;
  transition:
    margin-left 0.3s ease-in-out,
    width 0.3s ease-in-out;
  margin-left: ${({ collapsed }) => (collapsed ? '60px' : '250px')};
  width: ${({ collapsed }) => (collapsed ? 'calc(100% - 60px)' : 'calc(100% - 250px)')};
  overflow: hidden;
`;

const SidebarContainer = styled.div<{ collapsed: boolean }>`
  width: ${({ collapsed }) => (collapsed ? '60px' : '250px')};
  transition: width 0.3s ease-in-out;
  overflow: hidden;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  background: #f4f4f4;
  box-shadow: 2px 0px 5px rgba(0, 0, 0, 0.1);
`;

const HamburgerButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  margin-top: 80px;
  margin-left: 10px;
  z-index: 1000;
`;

const NavItem = styled.div<{ collapsed: boolean; active?: boolean }>`
  display: flex;
  align-items: center;
  padding: 15px;
  cursor: pointer;
  background-color: ${(props) => (props.active ? '#e0e0e0' : 'transparent')};
  &:hover {
    background-color: #e0e0e0;
  }
  span {
    margin-left: ${(props) => (props.collapsed ? '0' : '10px')};
    display: ${(props) => (props.collapsed ? 'none' : 'inline')};
  }
`;

const FeaturesSection = styled.div`
  margin-top: 20px;
`;

const FeatureData = styled.div`
  min-width: calc(100% - 7%);
  font-size: 0.6rem;
  font-weight: 400;
  display: flex;
  margin-left: 4%;
  color: #333;
`;

const MissionRowFlex = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  left: 18px;
`;

const HiveFeaturesView = observer(() => {
  const { workspace_uuid, feature_uuid } = useParams<{
    workspace_uuid: string;
    feature_uuid: string;
  }>();
  const { main, ui } = useStores();
  const history = useHistory();
  const [phases, setPhases] = useState<Phase[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [isLoadingPhases, setIsLoadingPhases] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<IActivity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
    workspace: workspace_uuid || '',
    content: '',
    content_type: '',
    feature_uuid: '',
    phase_uuid: '',
    author: 'human',
    author_ref: ui._meInfo?.owner_pubkey || '',
    question: '',
    title: '',
    description: '',
    details: '',
    notes: [] as string[],
    nextActions: [] as string[],
    thread_id: '',
    feedback: '',
    actions: [] as string[],
    questions: [] as string[],
    actions_input: '',
    questions_input: ''
  });
  const [activeItem, setActiveItem] = useState('activities');

  const handleItemClick = (item: string) => {
    setActiveItem(item);
  };

  const handleOpenWorkspace = () => {
    history.push(`/workspace/${workspace_uuid}`);
  };

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await main.getWorkspaceFeatures(workspace_uuid || '', {
          page: 1,
          status: 'active'
        });
        setFeatures(Array.isArray(response) ? response : response || response || []);
      } catch (error) {
        console.error('Error fetching features:', error);
        setFeatures([]);
      }
    };
    fetchFeatures();
  }, [main, workspace_uuid]);

  useEffect(() => {
    const fetchPhasesForFeature = async () => {
      if (newActivity.feature_uuid) {
        setIsLoadingPhases(true);
        try {
          const response = await main.getFeaturePhases(newActivity.feature_uuid);
          setPhases(Array.isArray(response) ? response : response || response || []);
        } catch (error) {
          console.error('Error fetching phases:', error);
          setPhases([]);
        } finally {
          setIsLoadingPhases(false);
        }
      } else {
        setPhases([]);
      }
    };
    fetchPhasesForFeature();
  }, [newActivity.feature_uuid, main]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewActivity((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'feature_uuid' && { phase_uuid: '' })
    }));
  };

  const handleArrayInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'actions' | 'questions'
  ) => {
    const inputValue = e.target.value;

    const newArray = inputValue
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    setNewActivity((prev) => ({
      ...prev,
      [field]: newArray,
      [`${field}_input`]: inputValue
    }));
  };

  const handleReorderFeatures = async (feat: Feature, priority: number) => {
    await main.addWorkspaceFeature({
      workspace_uuid: feat.workspace_uuid,
      uuid: feat.uuid,
      priority: priority
    });
  };

  const onDragEnd = ({ source, destination }: any) => {
    if (source && destination && source.index !== destination.index) {
      const updatedFeatures = [...features];

      const [movedItem] = updatedFeatures.splice(source.index, 1);
      const dropItem = features[destination.index];

      if (destination.index !== updatedFeatures.length) {
        updatedFeatures.splice(destination.index, 0, movedItem);
      } else {
        updatedFeatures[source.index] = dropItem;
        updatedFeatures.splice(updatedFeatures.length, 1, movedItem);
      }

      setFeatures(updatedFeatures);

      const dragIndex = updatedFeatures.findIndex((feat: Feature) => feat.uuid === movedItem.uuid);

      const dropIndex = updatedFeatures.findIndex((feat: Feature) => feat.uuid === dropItem.uuid);

      handleReorderFeatures(movedItem, dragIndex + 1);
      handleReorderFeatures(dropItem, dropIndex + 1);
    }
  };

  const resetForm = () => {
    setNewActivity({
      title: '',
      description: '',
      details: '',
      notes: [],
      nextActions: [],
      question: '',
      content: '',
      content_type: '',
      workspace: workspace_uuid || '',
      feature_uuid: '',
      phase_uuid: '',
      author: 'human',
      author_ref: ui._meInfo?.owner_pubkey || '',
      thread_id: '',
      feedback: '',
      actions: [],
      questions: [],
      actions_input: '',
      questions_input: ''
    });
    setSelectedActivity(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workspace_uuid) {
      alert('Workspace UUID is missing');
      return;
    }

    const trimmedContent = newActivity.content.trim();

    if (!trimmedContent) {
      alert('Content must not be empty');
      return;
    }

    if (trimmedContent.length > 10000) {
      alert('Content must be less than 10000 characters');
      return;
    }

    try {
      let response;
      if (selectedActivity) {
        response = await activityStore.createThreadResponse(selectedActivity.ID, {
          ...newActivity,
          workspace: workspace_uuid,
          content: trimmedContent,
          content_type: newActivity.content_type as ContentType,
          author: newActivity.author as AuthorType
        });
      } else {
        response = await activityStore.createActivity({
          ...newActivity,
          workspace: workspace_uuid,
          content: trimmedContent,
          content_type: newActivity.content_type as ContentType,
          author: newActivity.author as AuthorType
        });
      }

      if (response) {
        await activityStore.fetchWorkspaceActivities(workspace_uuid);

        const createdActivity = activityStore.rootActivities.find(
          (a) =>
            a.content === trimmedContent &&
            new Date(a.time_created).getTime() - new Date().getTime() < 5000
        );

        if (createdActivity) {
          setSelectedActivity(createdActivity);
        } else {
          setSelectedActivity(activityStore.rootActivities[0]);
        }

        setIsModalOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save activity');
    }
  };

  const removeItem = (field: 'actions' | 'questions', index: number) => {
    setNewActivity((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
      [`${field}_input`]: prev[field].filter((_, i) => i !== index).join(', ')
    }));
  };

  useEffect(() => {
    const fetchdata = async () => {
      const data = await quickBountyTicketStore.fetchAndSetQuickData(feature_uuid);
      console.log('data', data);
    };

    fetchdata();
  }, [feature_uuid]);

  return (
    <>
      <SidebarContainer collapsed={collapsed}>
        <HamburgerButton onClick={() => setCollapsed(!collapsed)}>
          <MaterialIcon icon="menu" style={{ fontSize: 28 }} />
        </HamburgerButton>
        <NavItem
          active={activeItem === 'activities'}
          onClick={() => handleItemClick('activities')}
          collapsed={collapsed}
        >
          <MaterialIcon icon="home" />
          <span>Activities</span>
        </NavItem>
        <NavItem onClick={handleOpenWorkspace} collapsed={collapsed}>
          <MaterialIcon icon="settings" />
          <span>Workspace</span>
        </NavItem>
        <FeaturesSection>
          <h6 style={{ display: collapsed ? 'none' : 'block', paddingLeft: '15px' }}>Features</h6>
          <div style={{ overflowY: 'auto', maxHeight: 'calc(80vh - 150px)' }}>
            <EuiDragDropContext onDragEnd={onDragEnd}>
              <EuiDroppable droppableId="features_droppable_area" spacing="m">
                {features &&
                  features.map((feat: Feature, i: number) => (
                    <EuiDraggable
                      spacing="m"
                      key={feat.id}
                      index={i}
                      draggableId={feat.uuid}
                      customDragHandle
                      hasInteractiveChildren
                    >
                      {(provided: any) => (
                        <NavItem
                          onClick={() => history.push(`/feature/${feat.uuid}`)}
                          key={feat.id}
                          collapsed={collapsed}
                        >
                          <MissionRowFlex>
                            <MaterialIcon
                              icon="menu"
                              color="transparent"
                              className="drag-handle"
                              paddingSize="s"
                              {...provided.dragHandleProps}
                              data-testid={`drag-handle-${feat.priority}`}
                              aria-label="Drag Handle"
                              style={{ fontSize: 20, marginBottom: '6px' }}
                            />
                          </MissionRowFlex>
                          {!collapsed && (
                            <FeatureData>
                              <h6 style={{ marginLeft: '1rem' }}>{feat.name}</h6>
                            </FeatureData>
                          )}
                        </NavItem>
                      )}
                    </EuiDraggable>
                  ))}
              </EuiDroppable>
            </EuiDragDropContext>
          </div>
        </FeaturesSection>
      </SidebarContainer>
      <MainContainer collapsed={collapsed}>
        <ActivitiesHeader uuid={workspace_uuid} />
        <ActivitiesContainer>
          {isModalOpen && (
            <ModalOverlay
              collapsed={false}
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              <ModalContent onClick={(e) => e.stopPropagation()}>
                <h2>Create New Activity</h2>
                <Form onSubmit={handleSubmit}>
                  <FormField>
                    <label>Title</label>
                    <Input
                      name="title"
                      value={newActivity.title}
                      onChange={handleInputChange}
                      required
                    />
                  </FormField>
                  <FormField>
                    <label>Workspace</label>
                    <Input
                      name="workspace"
                      value={workspace_uuid}
                      onChange={handleInputChange}
                      disabled
                      required
                    />
                  </FormField>
                  <FormField>
                    <label>Content Type</label>The sidebar implementation doesn’t align with the
                    expected design. Right now, it’s not a standalone component but is instead
                    embedded directly into the activity view.
                    <select
                      name="content_type"
                      value={newActivity.content_type}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select content type</option>
                      <option value="feature_creation">Feature Creation</option>
                      <option value="story_update">Story Update</option>
                      <option value="requirement_change">Requirement Change</option>
                      <option value="general_update">General Update</option>
                    </select>
                  </FormField>
                  <FormField>
                    <label>Content</label>
                    <TextArea
                      name="content"
                      value={newActivity.content}
                      onChange={handleInputChange}
                      required
                      maxLength={10000}
                      minLength={1}
                    />
                    <CharacterCount
                      className={newActivity.content.trim().length > 10000 ? 'error' : ''}
                    >
                      {newActivity.content.trim().length}/10000 characters
                    </CharacterCount>
                  </FormField>
                  <FormField>
                    <label>Question</label>
                    <Input
                      name="question"
                      value={newActivity.question}
                      onChange={handleInputChange}
                    />
                  </FormField>
                  <FormField>
                    <label>Feedback</label>
                    <TextArea
                      name="feedback"
                      value={newActivity.feedback}
                      onChange={handleInputChange}
                    />
                  </FormField>
                  <FormField>
                    <label>Actions (comma separated)</label>
                    <Input
                      name="actions"
                      value={newActivity.actions_input}
                      onChange={(e) => handleArrayInputChange(e, 'actions')}
                      placeholder="Enter actions separated by commas"
                    />
                    <ItemList>
                      {newActivity.actions.map((action, index) => (
                        <Item key={index}>
                          <span>{action}</span>
                          <RemoveButton onClick={() => removeItem('actions', index)}>
                            ×
                          </RemoveButton>
                        </Item>
                      ))}
                    </ItemList>
                  </FormField>
                  <FormField>
                    <label>Questions (comma separated)</label>
                    <Input
                      name="questions"
                      value={newActivity.questions_input}
                      onChange={(e) => handleArrayInputChange(e, 'questions')}
                      placeholder="Enter questions separated by commas"
                    />
                    <ItemList>
                      {newActivity.questions.map((question, index) => (
                        <Item key={index}>
                          <span>{question}</span>
                          <RemoveButton onClick={() => removeItem('questions', index)}>
                            ×
                          </RemoveButton>
                        </Item>
                      ))}
                    </ItemList>
                  </FormField>
                  <FormField>
                    <label>Feature</label>
                    <select
                      name="feature_uuid"
                      value={newActivity.feature_uuid}
                      onChange={handleInputChange}
                    >
                      <option value="">Select a feature (optional)</option>
                      {features.map((feature) => (
                        <option key={feature.uuid} value={feature.uuid}>
                          {feature.name}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField>
                    <label>Phase</label>
                    <select
                      name="phase_uuid"
                      value={newActivity.phase_uuid}
                      onChange={handleInputChange}
                      disabled={!newActivity.feature_uuid || isLoadingPhases}
                    >
                      <option value="">Select a phase (optional)</option>
                      {isLoadingPhases ? (
                        <option>Loading phases...</option>
                      ) : (
                        phases.map((phase) => (
                          <option key={phase.uuid} value={phase.uuid}>
                            {phase.name}
                          </option>
                        ))
                      )}
                    </select>
                  </FormField>
                  <Button type="submit">Create Activity</Button>
                </Form>
              </ModalContent>
            </ModalOverlay>
          )}
        </ActivitiesContainer>
      </MainContainer>
    </>
  );
});

export default HiveFeaturesView;
