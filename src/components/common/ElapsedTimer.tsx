import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { bountyReviewStore } from 'store/bountyReviewStore';
import styled from 'styled-components';
import { formatElapsedTime } from '../../helpers/timeFormatting';

interface ElapsedTimerProps {
  bountyId: string;
}

const TimerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const Label = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #8f8f8f;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Barlow';
`;

const Time = styled.span`
  font-size: 20px;
  font-weight: 600;
  color: #000000;
  text-align: center;
`;

const ElapsedTimerBase: React.FC<ElapsedTimerProps> = ({ bountyId }: ElapsedTimerProps) => {
  const [elapsedTime, setElapsedTime] = useState<string>('00h 00m');
  const [firstAssignedAt, setFirstAssignedAt] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchTiming = async () => {
      if (bountyId === '0') {
        setError(false);
        return;
      }

      try {
        await bountyReviewStore.getTiming(bountyId);
        const timing = bountyReviewStore.timings[bountyId];

        if (timing?.firstAssignedAt) {
          setFirstAssignedAt(timing.firstAssignedAt);
          setElapsedTime(formatElapsedTime(timing.firstAssignedAt));
          setError(false);
        } else {
          setFirstAssignedAt(null);
          setElapsedTime('00h 00m');
          setError(false);
        }
      } catch (error) {
        console.error('Error fetching timing:', error);
        setError(true);
        setFirstAssignedAt(null);
        setElapsedTime('00h 00m');
      }
    };

    fetchTiming();
  }, [bountyId]);

  useEffect(() => {
    if (!firstAssignedAt) return;

    const updateTimer = () => {
      setElapsedTime(formatElapsedTime(firstAssignedAt));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, [firstAssignedAt]);

  if (error) {
    return null;
  }

  return (
    <TimerContainer>
      <Label>Elapsed</Label>
      <Time>{elapsedTime}</Time>
    </TimerContainer>
  );
};

export const ElapsedTimer = observer(ElapsedTimerBase);
