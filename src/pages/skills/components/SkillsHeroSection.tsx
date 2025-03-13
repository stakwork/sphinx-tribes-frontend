import React from 'react';
import styled from 'styled-components';
import { HeroCTACard } from './HeroCTACard';

const HeroContainer = styled.section`
  min-height: 100vh;
  width: 100%;
  background-color: #1a242e;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 80px;

  @media (max-width: 768px) {
    padding: 40px 20px;
  }
`;

const TwoColumnLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  gap: 80px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;

const SecondaryText = styled.p`
  color: rgba(229, 231, 235, 0.8);
  font-size: 16px;
  line-height: 1.5;
  margin-top: 24px;
  max-width: 500px;
`;

const scrollToSection = (sectionId: string) => {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
};

export const SkillsHeroSection: React.FC = () => (
  <HeroContainer>
    <TwoColumnLayout>
      <div>
        <HeroCTACard
          title="For the LLM Power User"
          heading="Supercharge your agents with AI native skills"
          description="Access specialized tools, data and memory systems so your AI Agent can handle ever more complex tasks easily."
          buttonText="Browse marketplace"
          onButtonClick={() => scrollToSection('skills')}
          variant="primary"
        />
        <SecondaryText>
          Our marketplace connects your agents with premium pay-per-use skills, eliminating the need
          to build custom solutions from scratch
        </SecondaryText>
      </div>
      <div>
        <HeroCTACard
          title="For the Developer"
          heading="Register Skills to earn money whilst AIs work"
          description="Never worry about AI taking your job, instead get paid whilst they work:"
          numberList={[
            'Build skills',
            'Register in our skills market',
            'Get paid when agents work.'
          ]}
          buttonText="Register Skills"
          onButtonClick={() => scrollToSection('register')}
          variant="secondary"
        />
      </div>
    </TwoColumnLayout>
  </HeroContainer>
);

export default SkillsHeroSection;
