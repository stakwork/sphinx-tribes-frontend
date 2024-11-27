import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Feature } from 'store/interface';
import MaterialIcon from '@material/react-material-icon';
import TicketEditor from 'components/common/TicketEditor/TicketEditor';
import { useStores } from 'store';
import { v4 as uuidv4 } from 'uuid';
import {
  FeatureBody,
  FeatureDataWrap,
  FieldWrap,
  PhaseLabel,
  LabelValue,
  AddTicketButton
} from 'pages/tickets/style';
import {
  FeatureHeadNameWrap,
  FeatureHeadWrap,
  WorkspaceName,
  PhaseFlexContainer,
  ActionButton
} from './workspace/style';
import { Phase } from './workspace/interface';

interface PhasePlannerParams {
  feature_uuid: string;
  phase_uuid: string;
}

interface TicketData {
  uuid: string;
  feature_uuid: string;
  phase_uuid: string;
  name: string;
  sequence: number;
  dependency: string[];
  description: string;
  status: string;
  version: number;
  number: number;
}

const PhasePlannerView: React.FC = () => {
  const { feature_uuid, phase_uuid } = useParams<PhasePlannerParams>();
  const [featureData, setFeatureData] = useState<Feature | null>(null);
  const [phaseData, setPhaseData] = useState<Phase | null>(null);
  const [ticketData, setTicketData] = useState<TicketData[]>([]);
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

  const addTicketHandler = async () => {
    const newTicketUuid = uuidv4();
    const initialTicketData = {
      uuid: newTicketUuid,
      feature_uuid,
      phase_uuid,
      name: '',
      sequence: 0,
      dependency: [],
      description: '',
      status: 'DRAFT',
      version: 1
    };

    try {
      await main.createUpdateTicket(initialTicketData);
      setTicketData((prevTickets: TicketData[]) => [
        ...prevTickets,
        {
          uuid: newTicketUuid,
          feature_uuid,
          phase_uuid,
          name: '',
          sequence: prevTickets.length + 1,
          dependency: [],
          description: '',
          status: 'DRAFT',
          version: 1,
          number: prevTickets.length + 1
        }
      ]);
    } catch (error) {
      console.error('Error registering ticket:', error);
    }
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
            {ticketData.map((ticketData: TicketData) => (
              <TicketEditor key={ticketData.uuid} ticketData={ticketData} />
            ))}
            <AddTicketButton>
              <ActionButton
                color="primary"
                onClick={addTicketHandler}
                data-testid="audio-generation-btn"
              >
                Add Ticket
              </ActionButton>
            </AddTicketButton>
          </PhaseFlexContainer>
        </FieldWrap>
      </FeatureDataWrap>
    </FeatureBody>
  );
};

export default PhasePlannerView;
