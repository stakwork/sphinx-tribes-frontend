import { EuiLoadingSpinner, EuiText } from '@elastic/eui';
import { colors, mobileBreakpoint } from 'config';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { useStores } from 'store';
import styled from 'styled-components';
import { LeaerboardItem } from './leaderboardItem';

interface TopEarnersProps {
  limit?: number;
  className?: string;
  style?: React.CSSProperties;
  onError?: (error: Error) => void;
}

const Container = styled.div`
  height: 100%;
  min-height: 100%;
  overflow: auto;
  align-items: center;
  justify-content: center;
  min-width: 100%;
  & > .inner {
    position: relative;
    margin: auto;
    max-width: 100%;
    min-width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  & .summary {
    position: absolute;
    right: 0;
    top: 0;
  }

  @media (${mobileBreakpoint}) {
    height: calc(100% - 2rem);
    padding: 1rem;
    & > .inner {
      max-width: 100%;
      min-width: 300px;
    }
    & .summary {
      position: relative;
      right: 0;
      top: 0;
    }
  }
`;

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 1rem;
  color: ${colors.light.red1};
`;

const TopEarners = observer(({ limit = 5, className, style, onError }: TopEarnersProps) => {
  const { leaderboard } = useStores();
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await leaderboard.fetchLeaders();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch leaderboard data');
        setError(error);
        onError?.(error);
      }
    };

    fetchData();
  }, [leaderboard, onError]);

  if (error) {
    return (
      <ErrorContainer>
        <EuiText color="danger">Failed to load top earners</EuiText>
      </ErrorContainer>
    );
  }

  if (leaderboard.isLoading) {
    return (
      <LoaderContainer>
        <EuiLoadingSpinner size="xl" />
      </LoaderContainer>
    );
  }

  return (
    <Container data-testId={'main'} className={className} style={style} data-testid="top-earners-component">
      <div className="inner">
        {leaderboard?.topEarners
          .slice(0, limit)
          .map((item: any, index: number) => (
            <LeaerboardItem position={index + 1} key={item.owner_pubkey} {...item} />
          ))}
      </div>
    </Container>
  );
});

export default TopEarners;
