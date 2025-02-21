/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/typedef */
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { activityStore } from 'store/activityStore';
import styled from 'styled-components';
import { AuthorType, ContentType, Feature, IActivity } from 'store/interface';
import { useStores } from 'store';
import { useParams } from 'react-router-dom';
import { renderMarkdown } from 'people/utils/RenderMarkdown';
import SidebarComponent from 'components/common/SidebarComponent';
import { Phase } from '../interface';
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

export const ActivitiesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const ActivityItem = styled.div<{ isSelected?: boolean }>`
  padding: 1rem;
  background: ${({ isSelected }) => (isSelected ? '#f1f5f9' : 'white')};
  border: 1px solid ${({ isSelected }) => (isSelected ? '#94a3b8' : '#e2e8f0')};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #94a3b8;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
`;

export const DetailsPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const DetailCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 1.5rem;
  min-height: 200px;

  .markdown-content {
    margin-top: 1rem;
  }
`;

export const NextActionsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const ActionItem = styled.div`
  background: #94a3b8;
  color: white;
  padding: 1rem;
  border-radius: 4px;
`;

export const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 1rem;
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  color: #64748b;
  min-height: 200px;
  text-align: center;
`;

export const SelectActivityState = styled(EmptyState)`
  border: 2px dashed #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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

const Feedback = styled.div`
  font-style: italic;
  color: #718096;
  margin-bottom: 1rem;
`;

const QuestionList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin-bottom: 1rem;
`;

const Question = styled.li`
  color: #4a5568;
  margin-bottom: 0.5rem;
  padding-left: 1rem;
  position: relative;

  &:before {
    content: '•';
    position: absolute;
    left: 0;
    color: #4299e1;
  }
`;

const TimeInfo = styled.div`
  display: flex;
  justify-content: space-between;
  color: #718096;
  font-size: 0.875rem;
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

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
  position: sticky;
  bottom: 0;
  background: white;
  padding: 0.5rem 0;
  z-index: 1;
  border-radius: 5%;
`;

const DeleteButton = styled(Button)`
  background: #dc2626;
  &:hover {
    background: #b91c1c;
  }
  margin-bottom: 10px;
  margin-right: 10px;
`;

const EditButton = styled(Button)`
  background: #2563eb;
  &:hover {
    background: #1d4ed8;
  }
  margin-bottom: 10px;
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

const ThreadResponseCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

const CommentInput = styled.textarea`
  padding: 0.5rem;
  border: 1px dashed #94a3b8;
  border-radius: 4px;
  min-height: 100px;
  width: 100%;
  margin-top: 1rem;
  resize: vertical;
`;

const PostButton = styled(Button)`
  margin-top: 0.5rem;
  display: none;

  &.visible {
    display: block;
  }
`;

const Activities = observer(() => {
  const { uuid } = useParams<{ uuid: string }>();
  const { main, ui } = useStores();
  const [phases, setPhases] = useState<Phase[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [isLoadingPhases, setIsLoadingPhases] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<IActivity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
    workspace: uuid || '',
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
  const [threadResponses, setThreadResponses] = useState<IActivity[]>([]);
  const [comment, setComment] = useState('');
  const [isCommentChanged, setIsCommentChanged] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  let interval: NodeJS.Timeout | null = null;

  useEffect(() => {
    if (uuid) {
      activityStore.fetchWorkspaceActivities(uuid);
    }
  }, [uuid]);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await main.getWorkspaceFeatures(uuid || '', {
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
  }, [main, uuid]);

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

  useEffect(() => {
    if (selectedActivity?.ID) {
      const fetchThreadResponses = async () => {
        try {
          const responses = await activityStore.getThreadResponses(selectedActivity.ID);
          setThreadResponses(responses.filter((response) => response.ID !== selectedActivity.ID));
        } catch (error) {
          console.error('Error fetching thread responses:', error);
        }
      };

      fetchThreadResponses();
      interval = setInterval(fetchThreadResponses, 10000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [selectedActivity]);

  useEffect(() => {
    if (activityStore.rootActivities.length > 0 && !selectedActivity) {
      setSelectedActivity(activityStore.rootActivities[0]);
    }
  }, [activityStore.rootActivities]);

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

  const handleEditClick = (activity: IActivity) => {
    setNewActivity({
      notes: [],
      nextActions: [],
      question: '',
      content: '',
      content_type: activity.content_type,
      workspace: activity.workspace,
      feature_uuid: activity.feature_uuid,
      phase_uuid: activity.phase_uuid,
      author: activity.author,
      author_ref: activity.author_ref,
      thread_id: activity.thread_id || '',
      feedback: activity.feedback || '',
      actions: activity.actions || [],
      questions: activity.questions || [],
      actions_input: activity.actions?.join(', ') || '',
      questions_input: activity.questions?.join(', ') || '',
      title: '',
      description: '',
      details: ''
    });
    setIsModalOpen(true);
    setSelectedActivity(activity);
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
      workspace: uuid || '',
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

    if (!uuid) {
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
          workspace: uuid,
          content: trimmedContent,
          content_type: newActivity.content_type as ContentType,
          author: newActivity.author as AuthorType
        });
      } else {
        response = await activityStore.createActivity({
          ...newActivity,
          workspace: uuid,
          content: trimmedContent,
          content_type: newActivity.content_type as ContentType,
          author: newActivity.author as AuthorType
        });
      }

      if (response) {
        await activityStore.fetchWorkspaceActivities(uuid);

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

  const handleActivityClick = (activity) => {
    setSelectedActivity(activity);
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        const success = await activityStore.deleteActivity(activityId);
        if (success) {
          if (selectedActivity?.ID === activityId) {
            setSelectedActivity(null);
          }
          await activityStore.fetchWorkspaceActivities(uuid);
        } else {
          alert('Failed to delete activity');
        }
      } catch (error) {
        console.error('Error deleting activity:', error);
        alert('Failed to delete activity');
      }
    }
  };

  const removeItem = (field: 'actions' | 'questions', index: number) => {
    setNewActivity((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
      [`${field}_input`]: prev[field].filter((_, i) => i !== index).join(', ')
    }));
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
    setIsCommentChanged(e.target.value.trim() !== '');
  };

  const handlePostComment = async () => {
    if (!uuid || !ui._meInfo?.owner_alias || isPosting) return;

    try {
      setIsPosting(true);
      const newActivity = {
        workspace: uuid,
        content: comment,
        content_type: 'general_update' as ContentType,
        author: 'human' as AuthorType,
        author_ref: ui._meInfo?.owner_pubkey || '',
        title: `${ui._meInfo.owner_alias} - ${new Date().toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}`,
        description: '',
        details: '',
        notes: [],
        nextActions: [],
        question: '',
        feature_uuid: '',
        phase_uuid: '',
        thread_id: '',
        feedback: '',
        actions: [],
        questions: [],
        actions_input: '',
        questions_input: ''
      };

      const response = await activityStore.createActivity(newActivity);
      if (response) {
        setComment('');
        setIsCommentChanged(false);

        await activityStore.fetchWorkspaceActivities(uuid);

        const createdActivity = activityStore.rootActivities.find(
          (a) =>
            a.content === newActivity.content &&
            new Date(a.time_created).getTime() - new Date().getTime() < 5000
        );

        if (createdActivity) {
          setSelectedActivity(createdActivity);
        } else {
          setSelectedActivity(activityStore.rootActivities[0]);
        }
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const renderDetailsPanel = () => {
    if (!selectedActivity) {
      return (
        <SelectActivityState>
          <h3>Select an activity to view details</h3>
          <p>Click on any activity from the list to see its information</p>
        </SelectActivityState>
      );
    }

    return (
      <>
        <DetailCard>
          <Title>{selectedActivity.title}</Title>
          <div className="markdown-content">{renderMarkdown(selectedActivity.content)}</div>
          {selectedActivity.feedback && (
            <Feedback>Feedback: {renderMarkdown(selectedActivity.feedback)}</Feedback>
          )}
          {selectedActivity.questions?.length > 0 && (
            <>
              <h3>Questions:</h3>
              <QuestionList>
                {selectedActivity.questions.map((question, index) => (
                  <Question key={index}>{renderMarkdown(question)}</Question>
                ))}
              </QuestionList>
            </>
          )}
          <TimeInfo>
            <span>Created: {new Date(selectedActivity.time_created).toLocaleString()}</span>
            <span>Updated: {new Date(selectedActivity.time_updated).toLocaleString()}</span>
          </TimeInfo>
        </DetailCard>

        {/* thread responses section */}
        {threadResponses.length > 0 && (
          <DetailCard>
            <Title>Thread Responses</Title>
            {threadResponses.map((response) => (
              <ThreadResponseCard key={response.ID}>
                <div className="markdown-content">{renderMarkdown(response.content)}</div>
                <TimeInfo>
                  <span>By: {response.author_ref}</span>
                  <span>{new Date(response.time_created).toLocaleString()}</span>
                </TimeInfo>
              </ThreadResponseCard>
            ))}
          </DetailCard>
        )}

        <NextActionsSection>
          <Title>Next actions</Title>
          {selectedActivity.actions?.map((action: any, index: any) => (
            <ActionItem key={index}>{renderMarkdown(action)}</ActionItem>
          )) || <ActionItem>No actions defined</ActionItem>}
        </NextActionsSection>

        <ActionButtons>
          <EditButton onClick={() => handleEditClick(selectedActivity)}>Reply</EditButton>
          <DeleteButton onClick={() => handleDeleteActivity(selectedActivity.ID)}>
            Delete
          </DeleteButton>
        </ActionButtons>
      </>
    );
  };

  return (
    <>
      <SidebarComponent uuid={uuid} />
      <MainContainer collapsed={collapsed}>
        <ActivitiesHeader uuid={uuid} />
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
                      value={uuid}
                      onChange={handleInputChange}
                      disabled
                      required
                    />
                  </FormField>
                  <FormField>
                    <label>Content Type</label>
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

          <ActivitiesList>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Activities</Title>
            </div>
            {activityStore.rootActivities.length === 0 ? (
              <div>No activities available</div>
            ) : (
              activityStore.rootActivities.map((activity: any) => (
                <ActivityItem
                  key={activity.id}
                  isSelected={selectedActivity?.ID === activity.ID}
                  onClick={() => handleActivityClick(activity)}
                >
                  {activity.title}
                  {activity.timeCreated && (
                    <span>{new Date(activity.timeCreated).toLocaleString()}</span>
                  )}
                </ActivityItem>
              ))
            )}
            <CommentInput
              placeholder="Add a comment or question..."
              value={comment}
              onChange={handleCommentChange}
            />
            <PostButton
              onClick={handlePostComment}
              className={isCommentChanged ? 'visible' : ''}
              disabled={isPosting}
            >
              {isPosting ? 'Posting...' : 'Post'}
            </PostButton>
          </ActivitiesList>
          <DetailsPanel>{selectedActivity ? renderDetailsPanel() : <></>}</DetailsPanel>
        </ActivitiesContainer>
      </MainContainer>
    </>
  );
});

export default Activities;
