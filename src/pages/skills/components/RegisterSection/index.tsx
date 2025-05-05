import React from 'react';
import { Title } from '../common/Title';
import { Description, SectionContainer } from '../common/styles';

interface SkillsRegisterSectionProps {
  id: string;
}

export const SkillsRegisterSection: React.FC<SkillsRegisterSectionProps> = ({ id }) => (
  <SectionContainer id={id} style={{ backgroundColor: '#fff' }} data-testid="skills-register-section-component">
    <Title>Register Your Skills</Title>
    <Description>Start earning by registering your AI skills</Description>
  </SectionContainer>
);
