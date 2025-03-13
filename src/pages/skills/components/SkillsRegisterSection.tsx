import React from 'react';
import styled from 'styled-components';

const SectionContainer = styled.section`
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: white;
`;

interface SkillsRegisterSectionProps {
  id: string;
}

export const SkillsRegisterSection: React.FC<SkillsRegisterSectionProps> = ({ id }) => (
  <SectionContainer id={id}>
    <h2>Register Your Skills</h2>
    <p>Start earning by registering your AI skills</p>
  </SectionContainer>
);

export default SkillsRegisterSection;
