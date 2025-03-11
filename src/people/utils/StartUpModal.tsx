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

  async function getConnectionCode() {
    if (!ui.meInfo && !connection_string) {
      const code = await api.get('connectioncodes');
      if (code.connection_string) {
        setConnectionString(code.connection_string);
      }
    }
  }

  const DisplayQRCode = () => (
    <>
      <ModalContainer data-testid="qrcode">
        {!connection_string ? (
          <QRText>We are out of codes to sign up! Please check again later.</QRText>
        ) : (
          <QrContainer>
            <QR size={200} value={connection_string} />
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
        <ModalContainer
          role="region"
          aria-labelledby="step-one-heading"
          data-testid="step-one"
          tabIndex={0}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <h2
            id="step-one-heading"
            style={{
              textAlign: 'center',
              fontWeight: 600,
              marginTop: 15,
              marginBottom: 15,
              fontSize: 'inherit',
              fontFamily: 'inherit'
            }}
          >
            Step 1
          </h2>

          <p id="step-one-description" style={{ textAlign: 'center' }}>
            Download App
          </p>

          <div
            style={{
              width: '85%',
              display: 'flex',
              justifyContent: 'center',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
            role="group"
            aria-labelledby="download-options"
          >
            <span id="download-options" className="sr-only">
              Download options
            </span>
            <AndroidIosButtonConatiner>
              <IconButton
                text={'Android'}
                width={100}
                height={48}
                style={{ marginTop: '20px', textDecoration: 'none' }}
                onClick={() =>
                  window.open(
                    'https://play.google.com/store/apps/details?id=chat.sphinx.v2&hl=en_US',
                    '_blank',
                    'noopener noreferrer'
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
                aria-label="Download Android app"
              />
              <IconButton
                text={'iOS'}
                width={100}
                height={48}
                style={{ marginTop: '20px', textDecoration: 'none' }}
                onClick={() =>
                  window.open(
                    'https://testflight.apple.com/join/p721ALD9',
                    '_blank',
                    'noopener noreferrer'
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
                aria-label="Download iOS app"
              />
            </AndroidIosButtonConatiner>
          </div>
        </ModalContainer>

        <ModalContainer
          role="region"
          aria-labelledby="step-two-heading"
          data-testid="step-two"
          tabIndex={0}
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <h2
            id="step-two-heading"
            style={{
              textAlign: 'center',
              fontWeight: 600,
              marginTop: 15,
              marginBottom: 15,
              fontSize: 'inherit',
              fontFamily: 'inherit'
            }}
          >
            Step 2
          </h2>

          <p id="step-two-description" style={{ textAlign: 'center' }}>
            Scan Code
          </p>

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
              aria-label="Reveal connection code"
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
                aria-label="Sign in instead"
              />
            </DirectionWrap>
          </ButtonContainer>
        </ModalContainer>
      </>
    );
  

  return (
    <BaseModal data-testid="startup-modal" open onClose={closeModal}>
      <Box p={4} bgcolor={palette.grayish.G950} borderRadius={2} maxWidth={400} minWidth={350}>
        {step === 2 ? <StepTwo /> : <DisplayQRCode />}
      </Box>
    </BaseModal>
  );
};

export default observer(StartUpModal);
