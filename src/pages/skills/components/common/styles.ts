import styled, { css } from 'styled-components';

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-y: auto;
  height: 100%;
`;

export const SectionContainer = styled.section`
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f2f3f5;
`;

export const StyledSubtitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  font-weight: 700;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 0.35rem;
    font-weight: 500;
  }
`;

export const StyledTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  width: fit-content;

  @media (max-width: 768px) {
    font-size: 2rem;
    text-align: center;
  }
`;

export const StyledButton = styled.button<{ variant: 'default' | 'outlined' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: fit-content;
  margin: 0 auto;

  ${({ variant }) =>
    variant === 'default'
      ? css`
          background-color: #4b6bff;
          color: white;
          border: none;

          &:hover {
            background-color: #3a55d9;
          }
        `
      : css`
          background-color: transparent;
          color: #4b6bff;
          border: 1px solid #4b6bff;

          &:hover {
            background-color: rgba(75, 107, 255, 0.1);
          }
        `}
`;

export const StyledDescription = styled.p`
  font-size: 1.125rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  opacity: 0.8;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

export { StyledDescription as Description };
