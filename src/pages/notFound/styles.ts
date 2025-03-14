import styled from 'styled-components';

export const NotFoundPageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 100vh;
  background: #1a242e;
  color: #fff;
  width: 100%;
  font-family: 'Barlow';
  padding: 0 2rem;
`;

export const ContentWrapper = styled.div`
  padding: 24px 4px;
  display: flex;
  flex-direction: column-reverse;
  justify-content: center;
  align-items: center;
  gap: 16px;

  @media (min-width: 1024px) {
    flex-direction: row;
    padding: 24px;
    gap: 28px;
  }

  @media (min-width: 768px) {
    padding: 20px 44px;
    gap: 28px;
  }
`;

export const TextContent = styled.div`
  width: 100%;
  position: relative;
  padding-bottom: 12px;

  @media (min-width: 1024px) {
    padding-bottom: 0;
    width: 50%;
  }

  @media (min-width: 1280px) {
    padding-top: 24px;
  }
`;

export const ErrorCode = styled.h1`
  margin: 8px 0;
  color: #f2f2f2;
  font-weight: bold;
  font-size: 4rem;
`;

export const Title = styled.h2`
  margin: 8px 0;
  color: #f2f2f2;
  font-weight: bold;
  font-size: 1.25rem;
`;

export const Message = styled.p`
  margin: 8px 0;
  color: #f2f2f2;
`;

export const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: fit-content;
  margin: 2rem auto;

  background-color: #4b6bff;
  color: white;
  border: none;

  &:hover {
    background-color: #3a55d9;
  }
`;

export const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Image = styled.img`
  max-width: 100%;
  height: auto;
`;
