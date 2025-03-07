import React from 'react';
import { Button } from 'components/common';
import styled from 'styled-components';
import AccessDeniedImage from '../../../public/static/access_denied.png';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 20px;
`;

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  max-width: 700px;
  text-align: center;
`;

const AccessImg = styled.img`
  width: 200px;
  height: auto;
`;

const DeniedText = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #3c3f41;
  margin: 0;
`;

const DeniedSmall = styled.p`
  font-size: 16px;
  color: #5f6368;
  margin: 0;
`;

interface AccessDeniedProps {
  onClose: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ onClose }) => (
  <Container>
    <Wrap>
      <AccessImg src={AccessDeniedImage} alt="Access Denied" />
      <DeniedText>Access Denied</DeniedText>
      <DeniedSmall>
        You have restricted permissions and you are unable to view this page. Reach out to the
        workspace admin to get them updated.
      </DeniedSmall>
      <Button
        style={{ borderRadius: '6px', height: '45px' }}
        leadingIcon={'arrow_back'}
        text="Go Back"
        onClick={onClose}
      />
    </Wrap>
  </Container>
);
