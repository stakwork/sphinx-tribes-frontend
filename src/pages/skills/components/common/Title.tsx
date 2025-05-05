import React, { Fragment } from 'react';
import { StyledSubtitle, StyledTitle } from './styles';

interface BaseChildrenProps {
  children: React.ReactNode;
}

export interface TitleProps extends BaseChildrenProps {
  subtitle?: string;
  style?: React.CSSProperties;
}

export function Title({ children, subtitle, style }: TitleProps) {
  return (
    <Fragment data-testid="title-component">
      {subtitle && <StyledSubtitle>{subtitle}</StyledSubtitle>}
      <StyledTitle style={style}>{children}</StyledTitle>
    </Fragment>
  );
}
