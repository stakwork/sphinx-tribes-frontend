import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

interface PhasePlannerParams {
  feature_uuid: string;
  phase_uuid: string;
}

const PhasePlannerView: React.FC = () => {
  const { feature_uuid, phase_uuid } = useParams<PhasePlannerParams>();

  return (
    <Container>
      <h1>Phase Planner</h1>
      <p>Feature UUID: {feature_uuid}</p>
      <p>Phase UUID: {phase_uuid}</p>
    </Container>
  );
};

export default PhasePlannerView;
