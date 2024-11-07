import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { EuiOverlayMask } from '@elastic/eui';
import { useStores } from '../../store';
import {
  GenerateStoriesModal,
  GenerateStoriesHeader,
  GenerateStoriesTitle,
  GenerateStoriesContent,
  GenerateStoriesText,
  GenerateStoriesFooter,
  GenerateStoriesButton
} from './workspace/style';

const GenerateStoriesView: React.FC = () => {
  const history = useHistory();
  const { main } = useStores();
  const { feature_uuid } = useParams<{ feature_uuid: string }>();
  const [featureName, setFeatureName] = useState<string | undefined>('');
  const [featureBrief, setFeatureBrief] = useState<string | undefined>('');
  const [mission, setMission] = useState<string | undefined>('');
  const [tactics, setTactics] = useState<string | undefined>('');

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

  const handleClose = () => {
    history.push(`/feature/${feature_uuid}`);
  };

  const postData = {
    postData: {
      productBrief: `Product: ${featureName}. \nProduct Brief: \n* Mission: ${mission}. \n* Objectives: ${tactics}`,
      featureName: featureName ?? '',
      description: featureBrief ?? '',
      examples: [],
      webhook_url: 'https://webhook.site/8adf917d-d292-47ce-88e8-3994f63bfcce',
      featureUUID: feature_uuid
    }
  };

  return (
    <EuiOverlayMask>
      <GenerateStoriesModal>
        <GenerateStoriesHeader>
          <GenerateStoriesTitle>User Story Automation</GenerateStoriesTitle>
        </GenerateStoriesHeader>
        <GenerateStoriesContent>
          <GenerateStoriesText>
            {postData ? (
              <pre>{JSON.stringify(postData, null, 2)}</pre>
            ) : (
              'Story Generation Coming Soon!'
            )}
          </GenerateStoriesText>
        </GenerateStoriesContent>
        <GenerateStoriesFooter>
          <GenerateStoriesButton onClick={handleClose}>Cancel</GenerateStoriesButton>
        </GenerateStoriesFooter>
      </GenerateStoriesModal>
    </EuiOverlayMask>
  );
};

export default GenerateStoriesView;
