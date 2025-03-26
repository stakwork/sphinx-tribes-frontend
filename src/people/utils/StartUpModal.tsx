import { Box } from '@mui/system';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import styled from 'styled-components';
import { StartUpModalProps } from '../interfaces';
import api from '../../api';
import { useStores } from '../../store';
import { colors } from '../../config';
import { BaseModal, QR, IconButton } from '../../components/common';

const ModalContainer = styled.div`
  max-height: auto;
  overflow-y: visible;
  display: flex;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const QrContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  overflow-y: hidden;
`;

const QRText = styled.p`
  padding: 0px;
  margin-top: 15px;
  font-size: 0.9rem;
  font-weight: bold;
  width: 60%;
  text-align: center;
`;

const DirectionWrap = styled.div`
  padding: 0px;
  display: flex;
  width: 100%;
  justify-content: center;
`;

const AndroidIosButtonConatiner = styled.div`
  padding: 0px;
  display: flex;
  width: 100%;
  margin-right: 20px;
  justify-content: space-between;
`;

const palette = colors.light;

const StartUpModal = ({ closeModal, buttonColor }: StartUpModalProps) => {
  const { ui } = useStores();
  const [step, setStep] = useState(2);
  const [connection_string, setConnectionString] = useState('');
  const [error, setError] = useState(false);

  // Add focus trap for accessibility
  const modalRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
      // Trap focus within modal
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeModal]);

  async function getConnectionCode() {
    if (!ui.meInfo && !connection_string) {
      try {
        const code = await api.get('connectioncodes');
        if (code.connection_string) {
          setConnectionString(code.connection_string);
        }
        setError(false);
      } catch (error) {
        setError(true);
      }
    }
  }

  const DisplayQRCode = () => (
    <>
      <ModalContainer data-testid="qrcode" role="region" aria-label="QR Code Section">
        {!connection_string || error ? (
          <QRText>We are out of codes to sign up! Please check again later.</QRText>
        ) : (
          <QrContainer>
            <QR size={200} value={connection_string} aria-label="Connection QR Code" />
            <QRText>Install the Sphinx app on your phone and then scan this QRcode</QRText>
          </QrContainer>
        )}
      </ModalContainer>
      <ButtonContainer>
        <IconButton
          text={'Back'}
          width={210}
          height={48}
          buttonType={'text'}
          style={{ color: '#83878b', marginTop: '0px', textDecoration: 'none' }}
          onClick={(e: any) => {
            e.stopPropagation();
            setStep(2);
          }}
          textStyle={{
            fontSize: '15px',
            fontWeight: '500',
            color: '#5F6368'
          }}
          iconStyle={{
            top: '14px'
          }}
          color={buttonColor}
        />
      </ButtonContainer>
    </>
  );

  const StepTwo = () => (
    <>
      <ModalContainer data-testid="step-two" role="region" aria-label="Download Instructions">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ textAlign: 'center', fontWeight: 600, margin: 0 }}>Step 1</h2>
          <p style={{ textAlign: 'center' }}>Download App</p>
          <AndroidIosButtonConatiner>
            <IconButton
              text={'Android'}
              width={100}
              height={48}
              style={{ marginTop: '20px', textDecoration: 'none' }}
              onClick={() =>
                window.open(
                  'https://play.google.com/store/apps/details?id=chat.sphinx.v2&hl=en_US',
                  '_blank'
                )
              }
              textStyle={{
                fontSize: '15px',
                fontWeight: '500'
              }}
              iconStyle={{
                top: '14px'
              }}
              color={buttonColor}
              aria-label="Download Android App"
              aria-pressed={false}
              aria-disabled={false}
              aria-describedby="android-desc"
            />
            <span id="android-desc" style={{ display: 'none' }}>
              Opens Google Play Store in new window
            </span>
            <IconButton
              text={'IOS'}
              width={100}
              height={48}
              style={{ marginTop: '20px', textDecoration: 'none' }}
              onClick={() => window.open('https://testflight.apple.com/join/p721ALD9', '_blank')}
              textStyle={{
                fontSize: '15px',
                fontWeight: '500'
              }}
              iconStyle={{
                top: '14px'
              }}
              color={buttonColor}
              aria-label="Download iOS App"
              aria-pressed={false}
              aria-disabled={false}
              aria-describedby="ios-desc"
            />
            <span id="ios-desc" style={{ display: 'none' }}>
              Opens Apple TestFlight in new window
            </span>
          </AndroidIosButtonConatiner>
        </div>
      </ModalContainer>
      <h2 style={{ textAlign: 'center', fontWeight: 600, margin: 0 }}>Step 2</h2>
      <p style={{ textAlign: 'center' }}>Scan Code</p>
      <ButtonContainer>
        <IconButton
          text={'Reveal Connection Code'}
          endingIcon={'key'}
          width={250}
          height={48}
          style={{ marginTop: 20 }}
          hovercolor={buttonColor === 'primary' ? '#5881F8' : '#3CBE88'}
          activecolor={buttonColor === 'primary' ? '#5078F2' : '#2FB379'}
          shadowcolor={
            buttonColor === 'primary' ? 'rgba(97, 138, 255, 0.5)' : 'rgba(73, 201, 152, 0.5)'
          }
          onClick={() => {
            getConnectionCode();
            setStep(4);
          }}
          color={buttonColor}
          aria-label="Reveal Connection Code"
        />
        <DirectionWrap>
          <IconButton
            text={'Sign in'}
            width={210}
            height={48}
            buttonType={'text'}
            style={{ color: '#83878b', marginTop: '20px', textDecoration: 'none' }}
            onClick={(e: any) => {
              e.stopPropagation();
              closeModal();
              ui.setShowSignIn(true);
            }}
            textStyle={{
              fontSize: '15px',
              fontWeight: '500',
              color: '#5F6368'
            }}
            iconStyle={{
              top: '14px'
            }}
            color={buttonColor}
            aria-label="Sign in"
          />
        </DirectionWrap>
      </ButtonContainer>
    </>
  );

  return (
    <BaseModal
      data-testid="startup-modal"
      open
      onClose={closeModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="startup-modal-title"
      aria-describedby="startup-modal-description"
    >
      <Box
        p={4}
        bgcolor={palette.grayish.G950}
        borderRadius={2}
        maxWidth={400}
        minWidth={350}
        ref={modalRef}
        tabIndex={-1}
      >
        <h1 id="startup-modal-title" style={{ display: 'none' }}>
          Get Started with Sphinx
        </h1>
        <p id="startup-modal-description" style={{ display: 'none' }}>
          Modal for setting up Sphinx application
        </p>
        {step === 2 ? <StepTwo /> : <DisplayQRCode />}
      </Box>
    </BaseModal>
  );
};

export default observer(StartUpModal);
