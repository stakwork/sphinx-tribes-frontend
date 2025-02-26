import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { EuiOverlayMask } from '@elastic/eui';
import { useBrowserTabTitle } from 'hooks';
import { useStores } from '../../store';
import { getHost } from '../../config';
import { FieldWrap } from '../../pages/tickets/style';
import { Label } from '../../pages/tickets/style';
import { UserStoryWrapper } from './workspace/style';
import {
  GenerateStoriesModal,
  GenerateStoriesHeader,
  GenerateStoriesTitle,
  GenerateStoriesContent,
  GenerateStoriesText,
  GenerateStoriesFooter,
  GenerateStoriesButton,
  SendStoriesButton,
  UserStoryField
} from './workspace/style';

const GenerateStoriesView: React.FC = () => {
  const history = useHistory();
  const { main } = useStores();
  const { feature_uuid, socket_id } = useParams<{ feature_uuid: string; socket_id: string }>();
  const [featureName, setFeatureName] = useState<string | undefined>('');
  const [featureBrief, setFeatureBrief] = useState<string | undefined>('');
  const [mission, setMission] = useState<string | undefined>('');
  const [tactics, setTactics] = useState<string | undefined>('');
  const [response, setResponse] = useState<any>(null);
  useBrowserTabTitle("Stories")

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!feature_uuid) return;

        const featureData = await main.getFeaturesByUuid(feature_uuid);

        setFeatureName(featureData?.name);
        setFeatureBrief(featureData?.brief);

        if (featureData?.workspace_uuid) {
          const workspaceData = await main.getUserWorkspaceByUuid(featureData.workspace_uuid);

          setMission(workspaceData?.mission);
          setTactics(workspaceData?.tactics);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [feature_uuid, main]);

  let socketId = socket_id;
  if (socketId === '') {
    socketId = localStorage.getItem('websocket_token') || '';
  }

  const postData = {
    productBrief: `Product: ${featureName}. \nProduct Brief: \n* Mission: ${mission} \n* Objectives: \n${tactics}`,
    featureName: featureName,
    description: featureBrief,
    examples: [],
    webhook_url: `https://${getHost()}/features/stories`,
    featureUUID: feature_uuid ?? '',
    sourceWebsocketId: socketId
  };

  const submitStories = async () => {
    try {
      const apiResponse = await main.sendStories(postData);
      setResponse(apiResponse);
    } catch (error) {
      console.error('Error sending stories:', error);
    }
  };

  const handleClose = () => {
    history.push(`/feature/${feature_uuid}`);
  };

  return (
    <EuiOverlayMask>
      <GenerateStoriesModal>
        <GenerateStoriesHeader>
          <GenerateStoriesTitle>User Story Automation</GenerateStoriesTitle>
        </GenerateStoriesHeader>
        <GenerateStoriesContent>
          <GenerateStoriesText>
            {response ? (
              response?.success ? (
                'Workflow submitted please check back in 5 minutes and refresh the feature screen'
              ) : (
                'Workflow failed: Please contact Hive Product Manager'
              )
            ) : postData ? (
              <>
                <FieldWrap>
                  <Label>Product Brief</Label>
                  <UserStoryWrapper>
                    <UserStoryField>{postData.productBrief}</UserStoryField>
                  </UserStoryWrapper>
                </FieldWrap>

                <FieldWrap>
                  <Label>Feature Name</Label>
                  <UserStoryWrapper>
                    <UserStoryField>{postData.featureName}</UserStoryField>
                  </UserStoryWrapper>
                </FieldWrap>

                <FieldWrap>
                  <Label>Feature Description</Label>
                  <UserStoryWrapper>
                    <UserStoryField>{postData.description}</UserStoryField>
                  </UserStoryWrapper>
                </FieldWrap>
              </>
            ) : (
              'Story Generation Coming Soon!'
            )}
          </GenerateStoriesText>
        </GenerateStoriesContent>
        <GenerateStoriesFooter>
          {response ? (
            <>
              <SendStoriesButton onClick={handleClose}>Close</SendStoriesButton>
            </>
          ) : (
            <>
              <GenerateStoriesButton onClick={handleClose}>Cancel</GenerateStoriesButton>
              <SendStoriesButton onClick={submitStories}>Send</SendStoriesButton>
            </>
          )}
        </GenerateStoriesFooter>
      </GenerateStoriesModal>
    </EuiOverlayMask>
  );
};

export default GenerateStoriesView;
