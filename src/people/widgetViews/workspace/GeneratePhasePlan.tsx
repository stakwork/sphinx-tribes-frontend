import React, { useState } from 'react';
import { EuiGlobalToastList } from '@elastic/eui';
import { useStores } from 'store';
import styled from 'styled-components';
import { phaseTicketStore } from 'store/phase';
import { Toast } from './interface';

interface GeneratePhasePlanButtonProps {
  featureId: string;
  phaseId: string;
  sourceWebsocket: string;
}

const BuildPhasePlanButton = styled.button`
  background: #3cc591;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s ease;

  &:hover {
    background: #16a34a;
  }

  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
  }
`;

export const GeneratePhasePlanButton: React.FC<GeneratePhasePlanButtonProps> = ({
  featureId,
  phaseId,
  sourceWebsocket
}: GeneratePhasePlanButtonProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { main } = useStores();

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const ticketGroupIds = phaseTicketStore.getTicketGroupIds(phaseId);
      const requestUuid = crypto.randomUUID();

      const response = await main.sendPhasePlan({
        feature_id: featureId,
        phase_id: phaseId,
        ticket_group_ids: ticketGroupIds,
        source_websocket: sourceWebsocket,
        request_uuid: requestUuid
      });

      console.log('Generate Phase Plan Response:', response);

      setToasts([
        {
          id: `${Date.now()}-generate-success`,
          title: 'Success',
          color: 'success',
          text: 'Phase plan generated successfully!'
        }
      ]);
    } catch (error) {
      setToasts([
        {
          id: `${Date.now()}-generate-error`,
          title: 'Error',
          color: 'danger',
          text: error instanceof Error ? error.message : 'Failed to generate phase plan'
        }
      ]);
      console.error('Error generating phase plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <BuildPhasePlanButton onClick={handleGenerate} disabled={isLoading} data-testid="">
        {isLoading ? 'Generating...' : 'Generate Phase Plan'}
      </BuildPhasePlanButton>
      <EuiGlobalToastList
        toasts={toasts}
        dismissToast={() => setToasts([])}
        toastLifeTimeMs={3000}
      />
    </>
  );
};
