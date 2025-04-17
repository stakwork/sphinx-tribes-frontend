import React, { useEffect, useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Modal } from '../../components/common';
import { useStores } from '../../store';

interface TokenExpiring {
  expired: boolean;
  message: string;
}

function TokenRefresh() {
  const { main, ui } = useStores();
  const [show, setShow] = useState(false);

  // Separate function for logout logic
  const handleLogout = useCallback(() => {
    ui.setMeInfo(null);
    ui.setSelectedPerson(0);
    ui.setSelectingPerson(0);
    setShow(true);
    // Consider deferring this call or ensuring it handles the logged-out state correctly
    setTimeout(() => main.getPeople(), 100);
  }, [ui, main, setShow]);

  useEffect(() => {
    let isMounted = true;

    // Function to decode a JWT token
    const decodeJWT = (token: any) => {
      const parts = token.split('.');

      if (parts.length !== 3) {
        throw new Error('Invalid JWT token');
      }

      const payload = parts[1];
      const decodedPayload = atob(payload);
      return JSON.parse(decodedPayload);
    };

    // Function to check if the token has expired or is within an hour of expiring
    const isTokenExpiring = (token: any): TokenExpiring => {
      try {
        const payload = decodeJWT(token);

        if (!payload.exp) {
          throw new Error('Token does not contain an expiration time');
        }

        console.log('Payload ===', payload);

        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        const expiryTime = payload.exp; // Expiry time in seconds
        const oneHour = 3600; // One hour in seconds

        if (expiryTime < currentTime) {
          return { expired: true, message: 'Token has already expired' };
        }

        if (expiryTime - currentTime <= oneHour) {
          return { expired: true, message: 'Token will expire within an hour' };
        }

        return { expired: false, message: 'Token is valid and not expiring soon' };
      } catch (error: any) {
        return { expired: true, message: `Error decoding token: ${error.message}` };
      }
    };

    async function checkLoginStatus() {
      // Proper conditional check
      if (ui.meInfo && ui.meInfo.tribe_jwt) {
        const tokenExpireCheck = isTokenExpiring(ui.meInfo.tribe_jwt);
        console.log('Token Expired Check', tokenExpireCheck);

        if (tokenExpireCheck.expired) {
          try {
            const abortController = new AbortController();
            const timeoutId = setTimeout(() => abortController.abort(), 10000);

            const currentMeInfo = ui.meInfo;

            const res = await main.refreshJwt(abortController.signal);

            clearTimeout(timeoutId);

            if (res && res.jwt && ui.meInfo === currentMeInfo) {
              ui.setMeInfo({ ...ui.meInfo, tribe_jwt: res.jwt });
            } else if (res === null) {
              console.log('Token refresh failed, logging out!');
              handleLogout();
            }
          } catch (error: unknown) {
            if (error instanceof Error && error.name === 'AbortError') {
              console.log('Token refresh request was aborted');
            } else {
              console.log('Token refresh error:', error);
              handleLogout();
            }
          }
        }
      }
    }

    const runCheckIfMounted = async () => {
      if (isMounted) await checkLoginStatus();
    };

    runCheckIfMounted();

    // Create the interval
    const intervalId = setInterval(() => {
      if (isMounted) runCheckIfMounted();
    }, 1000 * 30);

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [main, ui, handleLogout]);

  return (
    <>
      <Modal visible={show}>
        <div style={{ display: 'flex', flexDirection: 'column', width: 250 }}>
          <div style={{ marginBottom: 20, textAlign: 'center' }}>
            Your session expired. Please log in again.
          </div>
          <Button text={'OK'} color={'widget'} onClick={() => setShow(false)} />
        </div>
      </Modal>
    </>
  );
}
export default observer(TokenRefresh);
