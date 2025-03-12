import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  color: #292c33;
  margin-bottom: 16px;
`;

export const SkillsPage: React.FC = () => (
  <Container>
    <Title>Skills</Title>
  </Container>
);
