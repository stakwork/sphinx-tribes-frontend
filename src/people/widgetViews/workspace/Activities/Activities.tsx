/* eslint-disable @typescript-eslint/typedef */
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { Key, ReactChild, ReactFragment, ReactPortal } from 'react';
import { activityStore } from 'store/activityStore';
import styled from 'styled-components';
import { uiStore } from 'store/ui';
import ActivitiesHeader from './header';

export const ActivitiesContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 2rem;
  padding-top: 0rem !important;
  padding: 3.5rem;
  background-color: #f8f9fa;
  height: 100%;
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

export const BulletList = styled.ul`
  list-style: none;
  padding-left: 1rem;

  li {
    position: relative;
    padding-left: 1rem;
    margin-bottom: 0.5rem;

    &:before {
      content: '-';
      position: absolute;
      left: -1rem;
    }
  }
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

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
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

const AddActivityButton = styled(Button)`
  margin-left: auto;
  display: block;
  margin-right: 60px;
  margin-bottom: 10px;
  margin-top: 10px;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const DeleteButton = styled(Button)`
  background: #dc2626;
  &:hover {
    background: #b91c1c;
  }
`;

const EditButton = styled(Button)`
  background: #2563eb;
  &:hover {
    background: #1d4ed8;
  }
`;

export interface Activity {
  timeCreated: JSX.Element;
  id: string;
  title: string;
  date: string;
  type: 'call' | 'pr' | 'issue';
  details: {
    transcript?: string;
    notes?: string;
    bulletPoints?: string[];
    nextActions?: string[];
  };
}

const Activities = observer(() => {
  const ui = uiStore;
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    details: '',
    notes: [],
    nextActions: []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewActivity((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await activityStore.createActivity({
        ...newActivity,
        workspace: 'ctrus0kopisngc0ehip0',
        content: 'skfjkadfkshf',
        contentType: 'feature_creation',
        featureUUID: '',
        phaseUUID: '',
        author: 'human',
        authorRef: ui._meInfo?.owner_pubkey || ''
      });
      setIsModalOpen(false);
      setNewActivity({
        title: '',
        description: '',
        details: '',
        notes: [],
        nextActions: []
      });
    } catch (error) {
      console.error('Error creating activity:', error);
    }
  };

  const activities = [
    {
      id: 1,
      title: 'Call with Tom - 01/02/25',
      date: '01/02/25',
      type: 'call',
      details: {
        transcript: 'The transcript from the call is.....',
        notes: `I was reviewing you call with Tom yesterday.

You had a question about the next phase of Hive Product graph to 
build out and sync a graph representation of the Hive Product 
Methodology, that wasn't resolved.

I had a look and built out a plan for you as a draft plan to implement 
this feature.`,
        bulletPoints: [
          'Setup workflow in Stakwork',
          'Endpoint to process and submit to stakwork',
          'Trigger deltas on Product Information'
        ],
        nextActions: ['Review proposed workflow', 'Schedule follow-up meeting']
      }
    },
    {
      id: 2,
      title: 'Call with Paul - 01/02/25',
      date: '01/02/25',
      type: 'call',
      details: {
        transcript: 'Call transcript with Paul...',
        notes: 'Discussion about upcoming features',
        nextActions: ['Update documentation', 'Share meeting notes']
      }
    },
    {
      id: 3,
      title: 'New PR received "End point /build-draft-feature"',
      date: '01/02/25',
      type: 'pr',
      details: {
        notes: 'Pull request for new endpoint implementation',
        bulletPoints: [
          'API endpoint implementation',
          'Test coverage added',
          'Documentation updated'
        ],
        nextActions: ['Review code', 'Run integration tests']
      }
    },
    {
      id: 4,
      title: "Feature x doesn't match spec in current release",
      date: '01/02/25',
      type: 'issue',
      details: {
        notes: 'Discrepancy found between implementation and specification',
        bulletPoints: [
          'Identified mismatched behavior',
          'Current vs expected behavior documented',
          'Impact assessment needed'
        ],
        nextActions: ['Review specification', 'Update implementation']
      }
    }
  ];

  console.log(ui._meInfo?.owner_pubkey);

  const handleActivityClick = (activity) => {
    setSelectedActivity(activity);
  };

  useEffect(() => {
    const workspace = 'ctrus0kopisngc0ehip0';
    activityStore.fetchWorkspaceActivities(workspace);
  }, []);

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
        {selectedActivity.details.transcript && (
          <DetailCard>
            <Title>Transcript</Title>
            <p>{selectedActivity.details.transcript}</p>
          </DetailCard>
        )}

        <DetailCard>
          {selectedActivity.details.notes && (
            <>
              <p>{selectedActivity.details.notes}</p>
              <br />
            </>
          )}

          {selectedActivity.details.bulletPoints && (
            <>
              <BulletList>
                {selectedActivity.details.bulletPoints.map(
                  (
                    point: boolean | ReactChild | ReactFragment | ReactPortal | null | undefined,
                    index: Key | null | undefined
                  ) => (
                    <li key={index}>{point}</li>
                  )
                )}
              </BulletList>
              <br />
            </>
          )}
        </DetailCard>

        <NextActionsSection>
          <Title>Next actions</Title>
          {selectedActivity.details.nextActions?.map((action: any, index: any) => (
            <ActionItem key={index}>{action}</ActionItem>
          )) || <ActionItem>No actions defined</ActionItem>}
        </NextActionsSection>

        <ActionButtons>
          <EditButton onClick={() => console.log('Edit', selectedActivity.id)}>Edit</EditButton>
          <DeleteButton onClick={() => console.log('Delete', selectedActivity.id)}>
            Delete
          </DeleteButton>
        </ActionButtons>
      </>
    );
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', height: '100%' }}>
      <ActivitiesHeader />
      <AddActivityButton onClick={() => setIsModalOpen(true)}>Add New Activity</AddActivityButton>
      <ActivitiesContainer>
        {isModalOpen && (
          <ModalOverlay onClick={() => setIsModalOpen(false)}>
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
                  <label>Description</label>
                  <TextArea
                    name="description"
                    value={newActivity.description}
                    onChange={handleInputChange}
                    required
                  />
                </FormField>
                <FormField>
                  <label>Details</label>
                  <TextArea
                    name="details"
                    value={newActivity.details}
                    onChange={handleInputChange}
                    required
                  />
                </FormField>
                <Button type="submit">Create Activity</Button>
              </Form>
            </ModalContent>
          </ModalOverlay>
        )}

        <ActivitiesList>
          <Title style={{ fontSize: '2.25rem' }}>Activities</Title>
          {activities.length === 0 ? (
            <div>No activities available</div>
          ) : (
            activities.map((activity: any) => (
              <ActivityItem
                key={activity.id}
                isSelected={selectedActivity?.id === activity.id}
                onClick={() => handleActivityClick(activity)}
              >
                {activity.title}
                {activity.timeCreated && (
                  <span>{new Date(activity.timeCreated).toLocaleString()}</span>
                )}
              </ActivityItem>
            ))
          )}
        </ActivitiesList>
        <DetailsPanel>{renderDetailsPanel()}</DetailsPanel>
      </ActivitiesContainer>
    </div>
  );
});

export default Activities;
