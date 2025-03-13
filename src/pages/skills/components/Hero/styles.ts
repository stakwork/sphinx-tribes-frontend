import styled from 'styled-components';

export const StyledHero = styled.section`
  display: flex;
  min-height: auto;
  width: 100%;
  background-color: #1a242e;
  color: white;
  overflow: visible;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 2rem;
  }
`;

export const StyledHeroContainer = styled.section`
  width: 100%;
  height: auto;
  min-height: 100vh;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 80px;
  padding: 100px 15rem;
  margin: 0 auto;
  background-color: #1a242e;
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
    min-height: 70vh;
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

  span {
    margin-right: 0.25rem;
    font-weight: semi-bold;
  }
`;

export { StyledHeroColumn as HeroColumn };
export { StyledHeroList as HeroList };
export { StyledHeroListItem as HeroListItem };
export { StyledHeroContainer as HeroContainer };
