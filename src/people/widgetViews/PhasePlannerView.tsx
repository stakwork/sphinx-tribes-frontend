import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Feature } from 'store/interface';
import MaterialIcon from '@material/react-material-icon';
import { useStores } from 'store';
import {
  FeatureBody,
  FeatureDataWrap,
  FieldWrap,
  PhaseLabel,
  LabelValue
} from 'pages/tickets/style';
import {
  FeatureHeadNameWrap,
  FeatureHeadWrap,
  WorkspaceName,
  PhaseFlexContainer
} from './workspace/style';
import { Phase } from './workspace/interface';

interface PhasePlannerParams {
  feature_uuid: string;
  phase_uuid: string;
}

const PhasePlannerView: React.FC = () => {
  const { feature_uuid, phase_uuid } = useParams<PhasePlannerParams>();
  const [featureData, setFeatureData] = useState<Feature | null>(null);
  const [phaseData, setPhaseData] = useState<Phase | null>(null);
  const { main } = useStores();
  const history = useHistory();

  const getFeatureData = useCallback(async () => {
    if (!feature_uuid) return;
    const data = await main.getFeaturesByUuid(feature_uuid);
    if (data) {
      setFeatureData(data);
    }
    return data;
  }, [feature_uuid, main]);

  const getPhaseData = useCallback(async () => {
    if (!feature_uuid || !phase_uuid) return;
    const data = await main.getFeaturePhaseByUUID(feature_uuid, phase_uuid);
    if (data) {
      setPhaseData(data);
    }
    return data;
  }, [feature_uuid, phase_uuid, main]);

  useEffect(() => {
    getFeatureData();
    getPhaseData();
  }, [getFeatureData, getPhaseData]);

  const handleClose = () => {
    history.push(`/feature/${feature_uuid}`);
  };

  return (
    <FeatureBody>
      <FeatureHeadWrap>
        <FeatureHeadNameWrap>
          <MaterialIcon
            onClick={handleClose}
            icon={'arrow_back'}
            style={{
              fontSize: 25,
              cursor: 'pointer'
            }}
          />
          <WorkspaceName>Phase Planner</WorkspaceName>
        </FeatureHeadNameWrap>
      </FeatureHeadWrap>
      <FeatureDataWrap>
        <FieldWrap>
          <PhaseFlexContainer>
            <PhaseLabel>
              Feature Name: <LabelValue>{featureData?.name}</LabelValue>
            </PhaseLabel>
            <PhaseLabel>
              Phase: <LabelValue>{phaseData?.name}</LabelValue>
            </PhaseLabel>
          </PhaseFlexContainer>
        </FieldWrap>
      </FeatureDataWrap>
    </FeatureBody>
  );
};

export default PhasePlannerView;
