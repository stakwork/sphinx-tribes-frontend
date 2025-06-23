import { useState, useEffect, useCallback } from 'react';
import { mainStore } from '../store/main';
import { FeatureFlag } from '../store/interface';

interface FlagCache {
  flags: FeatureFlag[] | null;
  lastFetched: number | null;
  expiryTime: number;
}

const flagCache: FlagCache = {
  flags: null,
  lastFetched: null,
  expiryTime: 5 * 60 * 1000
};

interface UseFeatureFlagResult {
  isEnabled: boolean;
  loading: boolean;
  error?: Error;
  refresh: () => Promise<void>;
}

export const useFeatureFlag = (flagName: string): UseFeatureFlagResult => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  const isCacheValid = () =>
    !!(
      flagCache.flags &&
      flagCache.lastFetched &&
      Date.now() - flagCache.lastFetched < flagCache.expiryTime
    );

  const fetchFlags = useCallback(async () => {
    try {
      setLoading(true);
      const response = await mainStore.getFeatureFlags();

      if (response?.success) {
        flagCache.flags = response.data;
        flagCache.lastFetched = Date.now();

        const flag = response.data.find((f: FeatureFlag) => f.name === flagName);
        setIsEnabled(flag?.enabled || false);
      } else {
        throw new Error('Failed to fetch feature flags');
      }
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error occurred'));
      console.error('Error fetching feature flags:', e);
    } finally {
      setLoading(false);
    }
  }, [flagName]);

  const refresh = async () => {
    flagCache.flags = null;
    flagCache.lastFetched = null;
    await fetchFlags();
  };

  useEffect(() => {
    const getFlags = async () => {
      if (isCacheValid() && flagCache.flags) {
        const flag = flagCache.flags.find((f: FeatureFlag) => f.name === flagName);
        setIsEnabled(flag?.enabled || false);
        setLoading(false);
      } else {
        await fetchFlags();
      }
    };

    getFlags();
  }, [flagName, fetchFlags]);

  return { isEnabled, loading, error, refresh };
};
