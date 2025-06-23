import styled from 'styled-components';
import { SectionContainer } from '../common/styles';

export const StyledHero = styled.section`
  display: flex;
  min-height: auto;
  width: 100%;
  color: white;
  overflow: visible;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 2rem;
  }
`;

export const StyledHeroWrapper = styled(SectionContainer)`
  background-color: #1a242e;

  @media (max-width: 768px) {
    min-height: auto;
  }
`;

export const StyledHeroContainer = styled.section`
  width: 75%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 80px;
  margin: 0 auto;
  color: #ffffff;
  overflow: visible;

  @media (max-width: 768px) {
    min-height: auto;
    flex-direction: column;
    padding: 24px 16px;
    gap: 32px;
  }
`;

const StyledHeroColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem;
  height: fit-content;

  @media (max-width: 768px) {
    padding: 1rem 0;
    min-height: 75vh;
    min-width: 320px;
  }
`;

const StyledHeroList = styled.ol`
  list-style: none;
  padding: 0;
  margin-bottom: 2rem;
`;

export const StyledHeroListItem = styled.li`
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  font-size: 1.125rem;
  opacity: 0.8;
  font-weight: 500;

  span {
    font-size: 1rem;
    margin-right: 0.25rem;
    font-weight: 500;
  }
`;

export { StyledHeroColumn as HeroColumn };
export { StyledHeroList as HeroList };
export { StyledHeroListItem as HeroListItem };
export { StyledHeroContainer as HeroContainer };
