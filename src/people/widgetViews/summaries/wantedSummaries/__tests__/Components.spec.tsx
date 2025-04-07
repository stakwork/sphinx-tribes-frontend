import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SelfAssignButton, ViewTribe } from '../Components.tsx';
// import { ViewTribe } from '../summaries/wantedSummaries/Components.tsx';

jest.mock('remark-gfm', () => ({}));
jest.mock('rehype-raw', () => ({}));

describe('ViewTribe Component', () => {
  it('should display the tribe button enabled when a valid tribe is associated', () => {
    const mockProps = {
      tribe: 'W3schools',
      tribeInfo: { img: 'https://www.w3schools.com/html/pic_trulli.jpg' }
    };

    render(<ViewTribe {...mockProps} />);
    expect(screen.getByText('View Tribe')).toBeInTheDocument();
    expect(screen.getByRole('button')).not.toHaveAttribute('disabled');
    expect(screen.getByRole('button')).toHaveStyle('opacity: 1');
  });

  it('should display the tribe button disabled when no tribe is associated', () => {
    const mockProps = {
      tribe: 'none', // Testing with string 'none' which should be considered invalid
      tribeInfo: null
    };

    render(<ViewTribe {...mockProps} />);
    expect(screen.getByText('View Tribe')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('disabled');
    expect(screen.getByRole('button')).toHaveStyle('opacity: 0.5');
  });

  it('should display the tribe button disabled when tribe is a falsy value', () => {
    const mockProps = {
      tribe: '', // Testing with an empty string
      tribeInfo: null
    };

    render(<ViewTribe {...mockProps} />);
    expect(screen.getByText('View Tribe')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('disabled');
    expect(screen.getByRole('button')).toHaveStyle('opacity: 0.5');
  });
});

describe('SelfAssignButton Component', () => {
  const mockOnClick = jest.fn();

  it('renders with valid stake and session length', () => {
    const mockProps = {
      onClick: mockOnClick,
      stakeMin: 5000,
      EstimatedSessionLength: '2 hours'
    };

    render(<SelfAssignButton {...mockProps} />);

    expect(screen.getByText('Self Assign')).toBeInTheDocument();
    expect(screen.getByRole('button')).not.toHaveAttribute('disabled');
    expect(screen.getByText('Deposit this amount to Self Assign')).toBeInTheDocument();
    expect(screen.getByText('5,000 SAT')).toBeInTheDocument();
    expect(screen.getByText('Time to Complete')).toBeInTheDocument();
    expect(screen.getByText('2 hours')).toBeInTheDocument();
  });

  it('handles zero stake amount', () => {
    const mockProps = {
      onClick: mockOnClick,
      stakeMin: 0,
      EstimatedSessionLength: '30 minutes'
    };

    render(<SelfAssignButton {...mockProps} />);
    expect(screen.getByText('0 SAT')).toBeInTheDocument();
  });

  it('handles missing session length', () => {
    const mockProps = {
      onClick: mockOnClick,
      stakeMin: 1000,
      EstimatedSessionLength: ''
    };

    render(<SelfAssignButton {...mockProps} />);
    const timeElement = screen.getByText('Time to Complete').nextElementSibling;
    expect(timeElement).toHaveTextContent('');
  });
});
