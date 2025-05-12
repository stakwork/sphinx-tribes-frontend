import React from 'react';
import {
  PageContainer,
  SkillPageHeroSection,
  SkillsListSection,
  SkillsRegisterSection
} from './components';

export const SkillsPage: React.FC = () => (
  <PageContainer data-testid="skills-page-component">
    <SkillPageHeroSection />
    <SkillsListSection id="skills" />
    <SkillsRegisterSection id="register" />
  </PageContainer>
);
