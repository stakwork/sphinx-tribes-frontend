import React from 'react';
import { Title } from '../common/Title';
import { Button } from '../common/Button';
import { Description } from '../common/styles';
import {
  HeroList,
  HeroColumn,
  HeroContainer,
  StyledHeroListItem,
  StyledHeroWrapper
} from './styles';

const skillList = ['Build skills', 'Register in our skills market', 'Get paid when agents work.'];

export const SkillPageHeroSection = () => (
  <StyledHeroWrapper>
    <HeroContainer>
      <HeroColumn>
        <Title subtitle="For the LLM Power User">
          Supercharge your agents <br /> with AI native skills
        </Title>
        <Description>
          Access specialized tools, data and memory systems so your AI Agent can handle ever more
          complex tasks easily.
        </Description>
        <Description>
          Our marketplace connects your agents with premium pay-per-use skills, eliminating the
          need to build custom solutions from scratch
        </Description>
        <Button targetSection="skills">Browse marketplace</Button>
      </HeroColumn>

      <HeroColumn>
        <Title subtitle="For the Developer">Register Skills to earn money whilst AIs work</Title>
        <Description>
          Never worry about AI taking your job, instead get paid whilst they work:
        </Description>
        <HeroList>
          {skillList.map((skill, index) => (
            <StyledHeroListItem key={index}>
              <span>{index + 1}.</span> {skill}
            </StyledHeroListItem>
          ))}
        </HeroList>
        <Button targetSection="register" variant="outlined">
          Register Skills
        </Button>
      </HeroColumn>
    </HeroContainer>
  </StyledHeroWrapper>
);
