import React from 'react';
import useScrollToElement from 'hooks/useScrollToElement';
import { StyledButton } from './styles';

interface BaseChildrenProps {
  children: React.ReactNode;
}

export interface ButtonProps extends BaseChildrenProps {
  targetSection: string;
  variant?: 'default' | 'outlined';
}

export function Button({ children, targetSection, variant = 'default' }: ButtonProps) {
  const scrollToElement = useScrollToElement();

  return (
    <StyledButton variant={variant} onClick={() = data-testid="button-component"> scrollToElement(targetSection)}>
      {children}
    </StyledButton>
  );
}
