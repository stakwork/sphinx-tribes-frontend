import React from 'react';
import styled from 'styled-components';

const SectionContainer = styled.section`
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f2f3f5;
`;

interface SkillsListSectionProps {
  id: string;
}

export const SkillsListSection: React.FC<SkillsListSectionProps> = ({ id }) => (
  <SectionContainer id={id}>
    <h2>Skills Marketplace</h2>
    <p>Browse available AI skills</p>
  </SectionContainer>
);

export default SkillsListSection;
