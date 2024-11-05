import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { EuiOverlayMask } from '@elastic/eui';
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
  const { feature_uuid } = useParams<{ feature_uuid: string }>();

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
          <GenerateStoriesText>Story Generation Coming Soon!</GenerateStoriesText>
        </GenerateStoriesContent>
        <GenerateStoriesFooter>
          <GenerateStoriesButton onClick={handleClose}>Cancel</GenerateStoriesButton>
        </GenerateStoriesFooter>
      </GenerateStoriesModal>
    </EuiOverlayMask>
  );
};

export default GenerateStoriesView;
