import React from 'react';
import styled from 'styled-components';
import { useBrowserTabTitle } from '../../hooks';
import { SkillsHeroSection } from './components/SkillsHeroSection';
import { SkillsRegisterSection } from './components/SkillsRegisterSection';
import { SkillsListSection } from './components/SkillsListSection';

const Container = styled.div`
  width: 100%;
  overflow-x: hidden;
`;

export const SkillsPage: React.FC = () => {
  useBrowserTabTitle('Skills');

  return (
    <Container>
      <SkillsHeroSection />
      <SkillsListSection id="skills" />
      <SkillsRegisterSection id="register" />
    </Container>
  );
};
