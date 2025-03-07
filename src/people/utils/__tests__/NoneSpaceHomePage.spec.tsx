import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NoneSpaceHomePage from '../NoneSpaceHomePage';

describe('NoneSpaceHomePage', () => {
  const mockAction1 = jest.fn();
  const mockAction2 = jest.fn();

  const defaultProps = {
    style: {},
    img: '',
    text: ''
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with banner and single button', () => {
    render(
      <NoneSpaceHomePage
        {...defaultProps}
        banner={true}
        text="Test Header"
        sub="Test Subheader"
        buttonText1="Button 1"
        buttonIcon="test-icon"
        action1={mockAction1}
      />
    );

    expect(screen.getByText('Test Header')).toBeInTheDocument();
    expect(screen.getByText('Test Subheader')).toBeInTheDocument();
    expect(screen.getByText('Button 1')).toBeInTheDocument();
    expect(screen.queryByText('Button 2')).not.toBeInTheDocument();
  });

  it('renders without banner and single button', () => {
    render(
      <NoneSpaceHomePage
        {...defaultProps}
        banner={false}
        text="Test Header"
        sub="Test Subheader"
        buttonText1="Button 1"
        buttonIcon="test-icon"
        action1={mockAction1}
      />
    );

    waitFor(() => {
      expect(screen.getByText('Test Header')).toHaveStyle({ fontSize: '40px' });
      expect(screen.getByText('Button 1')).toHaveStyle({ marginTop: '40px' });
    });
  });

  it('renders with banner and both buttons', () => {
    render(
      <NoneSpaceHomePage
        {...defaultProps}
        banner={true}
        text="Test Header"
        sub="Test Subheader"
        buttonText1="Button 1"
        buttonText2="Button 2"
        buttonIcon="test-icon"
        action1={mockAction1}
        action2={mockAction2}
      />
    );

    const button1 = screen.getByText('Button 1');
    const button2 = screen.getByText('Button 2');

    expect(button1).toBeInTheDocument();
    expect(button2).toBeInTheDocument();

    fireEvent.click(button1);
    fireEvent.click(button2);

    expect(mockAction1).toHaveBeenCalledTimes(1);
    expect(mockAction2).toHaveBeenCalledTimes(1);
  });

  it('renders without banner and both buttons', () => {
    render(
      <NoneSpaceHomePage
        {...defaultProps}
        banner={false}
        text="Test Header"
        sub="Test Subheader"
        buttonText1="Button 1"
        buttonText2="Button 2"
        buttonIcon="test-icon"
        action1={mockAction1}
        action2={mockAction2}
      />
    );

    waitFor(() => {
      expect(screen.getByText('Button 1')).toHaveStyle({ marginTop: '40px' });
      expect(screen.getByText('Button 2')).toHaveStyle({ marginTop: '20px' });
    });
  });

  it('renders with custom style override in banner mode', () => {
    const customStyle = { backgroundColor: 'red', padding: '20px' };

    render(
      <NoneSpaceHomePage
        {...defaultProps}
        banner={true}
        text="Test Header"
        sub="Test Subheader"
        style={customStyle}
      />
    );

    const container = screen.getByText('Test Header').parentElement;
    expect(container).toHaveStyle(customStyle);
  });

  it('renders with banner true but no button texts', () => {
    render(
      <NoneSpaceHomePage {...defaultProps} banner={true} text="Test Header" sub="Test Subheader" />
    );

    expect(screen.getByText('Test Header')).toBeInTheDocument();
    expect(screen.getByText('Test Subheader')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders without banner and without any button or text content', () => {
    render(<NoneSpaceHomePage {...defaultProps} banner={false} />);

    waitFor(() => {
      const container = screen.getByText('').parentElement;
      expect(container).toHaveStyle({
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        background: '#f0f1f3'
      });
    });
  });

  it('handles unexpected style prop values', () => {
    const invalidStyle = { invalid: true } as React.CSSProperties;
    render(<NoneSpaceHomePage {...defaultProps} banner={true} text="Test" style={invalidStyle} />);

    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('renders with only text in mobile layout', () => {
    render(<NoneSpaceHomePage {...defaultProps} banner={false} text="Test Header" />);

    const header = screen.getByText('Test Header');
    expect(header).toHaveStyle({
      fontSize: '40px',
      fontFamily: 'Barlow'
    });
  });

  it('renders with undefined action handlers', () => {
    render(
      <NoneSpaceHomePage
        {...defaultProps}
        banner={true}
        text="Test Header"
        buttonText1="Button 1"
        buttonText2="Button 2"
      />
    );

    const button1 = screen.getByText('Button 1');
    const button2 = screen.getByText('Button 2');

    fireEvent.click(button1);
    fireEvent.click(button2);
  });

  it('renders with banner and buttons but without buttonIcon', () => {
    render(
      <NoneSpaceHomePage
        {...defaultProps}
        banner={true}
        text="Test Header"
        buttonText1="Button 1"
        buttonText2="Button 2"
        action1={mockAction1}
        action2={mockAction2}
      />
    );

    expect(screen.getByText('Button 1')).toBeInTheDocument();
    expect(screen.getByText('Button 2')).toBeInTheDocument();
  });
});
