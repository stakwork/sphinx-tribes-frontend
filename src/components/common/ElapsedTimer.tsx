import React, { useState, useEffect, useRef } from 'react';
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
  const [elapsedTime, setElapsedTime] = useState<string>('00h 00m 00s');
  const [firstAssignedAt, setFirstAssignedAt] = useState<string | null>(null);
  const [lastPowAt, setLastPowAt] = useState<string | null>(null);
  const [accumulatedPauseSeconds, setAccumulatedPauseSeconds] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [closedAt, setClosedAt] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearIntervalIfNeeded = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    const fetchTiming = async () => {
      if (bountyId === '0') {
        setError(false);
        return;
      }

      try {
        const timing = await bountyReviewStore.getBountyTiming(bountyId);

        if (timing) {
          setFirstAssignedAt(timing.first_assigned_at);
          setLastPowAt(timing.last_pow_at || null);
          setIsPaused(timing.is_paused || false);
          setClosedAt(timing.closed_at || null);
          setAccumulatedPauseSeconds(timing.accumulated_pause_seconds || 0);

          setElapsedTime(
            formatElapsedTime(
              timing.first_assigned_at,
              timing.last_pow_at,
              timing.is_paused,
              timing.closed_at,
              timing.accumulated_pause_seconds
            )
          );

          setError(false);
        }
      } catch (error) {
        console.error('Error fetching timing:', error);
        setError(true);
      }
    };

    fetchTiming();
  }, [bountyId]);

  useEffect(() => {
    const stopTimer = (!!closedAt && !!lastPowAt) || isPaused;

    if (stopTimer) {
      clearIntervalIfNeeded();
      return;
    }

    const updateTimer = () => {
      setElapsedTime(
        formatElapsedTime(
          firstAssignedAt || '',
          lastPowAt,
          isPaused,
          closedAt,
          accumulatedPauseSeconds
        )
      );
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

    return () => clearIntervalIfNeeded();
  }, [firstAssignedAt, lastPowAt, isPaused, closedAt, accumulatedPauseSeconds]);

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
