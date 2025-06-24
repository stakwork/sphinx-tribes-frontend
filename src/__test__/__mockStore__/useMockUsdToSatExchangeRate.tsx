```
import { useEffect } from 'react';
import { useStores } from 'store';

export const useMockUsdToSatExchangeRate = ({
  time = 100000,
  enabled
}: {
  time?: number;
  enabled: boolean;
}) => {
  const { ui } = useStores();

  useEffect(() => {
    if (enabled) {
      const getUsdToSatsExchangeRate = () => {
        // random rate for 1 usd
        const rate = Math.random() || 1;

        // 1 bitcoin is 1 million satoshis
        const satoshisInABitcoin = 0.00000001;
        ui.setUsdToSatsExchangeRate(rate / satoshisInABitcoin);
      };

      getUsdToSatsExchangeRate();
      const timer = setInterval(() => {
        getUsdToSatsExchangeRate();
      }, time);

      return () => {
        clearInterval(timer);
      };
    }
  }, [time, ui, enabled]);
};
```