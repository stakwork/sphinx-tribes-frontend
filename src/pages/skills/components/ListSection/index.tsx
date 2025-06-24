import React from 'react';
import { Title } from '../common/Title';
import { Description, SectionContainer } from '../common/styles';

interface SkillsListSectionProps {
  id: string;
}

export const SkillsListSection: React.FC<SkillsListSectionProps> = ({ id }) => (
  <SectionContainer id={id} data-testid="skills-list-section-component">
    <Title>Skills Marketplace</Title>
    <Description>Browse available AI skills</Description>
  </SectionContainer>
);
