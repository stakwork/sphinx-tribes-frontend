/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/typedef */
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { activityStore } from 'store/activityStore';
import styled from 'styled-components';
import { AuthorType, ContentType, Feature, IActivity } from 'store/interface';
import { useStores } from 'store';
import { useParams } from 'react-router-dom';
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

const MainContainer = styled.div`
  flex-grow: 1;
  transition:
    margin-left 0.3s ease-in-out,
    width 0.3s ease-in-out;
  overflow: hidden;
`;

const HiveFeaturesView = observer(() => {
  const { workspace_uuid } = useParams<{ workspace_uuid: string }>();
  const { main, ui } = useStores();
  const [phases, setPhases] = useState<Phase[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
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

  return (
    <>
      <MainContainer>
        <SidebarComponent />
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
        </ActivitiesContainer>
      </MainContainer>
    </>
  );
});

export default HiveFeaturesView;
