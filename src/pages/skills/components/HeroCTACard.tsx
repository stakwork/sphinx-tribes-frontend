import React from 'react';
import styled from 'styled-components';

interface HeroCTACardProps {
  title: string;
  heading: React.ReactNode;
  description: string;
  buttonText: string;
  secondaryText?: string;
  onButtonClick: () => void;
  variant: 'primary' | 'secondary';
  numberList?: string[];
}

const Card = styled.div`
  display: flex;
  flex-direction: column;
  color: white;
  max-width: 700px;
  padding: 25px;

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const Title = styled.h2`
  font-size: 20px;
  color: white;
  margin-bottom: 18px;
  margin-right: 60px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-align: center;
`;

const Heading = styled.h3`
  font-size: 42px;
  line-height: 1.3;
  margin-bottom: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

const Description = styled.p<{ $hasList?: boolean }>`
  font-size: 18px;
  line-height: 1.5;
  color: white;
  margin-top: 16px;
  width: 80%;
  word-wrap: break-word;
  margin-bottom: ${(props) => (props.$hasList ? '24px' : '5px')};
`;

const NumberedList = styled.ol`
  list-style: decimal;
  color: white;
  margin-left: 35px;
  padding: 0;
`;

const ListItem = styled.li`
  font-size: 18px;
  line-height: 1.2;
`;

const Button = styled.button<{ variant: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border-radius: 5px;
  font-weight: 600;
  font-size: 16px;
  margin-top: 50px;
  cursor: pointer;
  width: fit-content;
  transition: all 0.2s;
  align-self: center;
  margin-right: 20%;

  ${({ variant }) =>
    variant === 'primary'
      ? `
    background: #608AFF;
    color: white;
    border: none;
    &:hover {
      background: #4A6FE5;
    }
  `
      : `
    background: transparent;
    color: #608AFF;
    border: 1.5px solid #608AFF;
    &:hover {
      background: rgba(96, 138, 255, 0.1);
    }
  `}
`;

export const HeroCTACard: React.FC<HeroCTACardProps> = ({
  title,
  heading,
  description,
  buttonText,
  secondaryText,
  onButtonClick,
  variant,
  numberList
}) => (
  <Card>
    <Title>{title}</Title>
    <Heading>{heading}</Heading>
    <Description $hasList={!!numberList}>{description}</Description>
    {secondaryText && <Description $hasList={!!numberList}>{secondaryText}</Description>}
    {numberList && (
      <NumberedList>
        {numberList.map((item, index) => (
          <ListItem key={index}>{item}</ListItem>
        ))}
      </NumberedList>
    )}
    <Button variant={variant} onClick={onButtonClick}>
      {buttonText}
    </Button>
  </Card>
);
