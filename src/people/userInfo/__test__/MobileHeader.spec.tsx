import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { HeaderMobile } from '../MobileHeader';

describe('HeaderMobile', () => {
  const baseProps = {
    goBack: jest.fn(),
    logout: jest.fn(),
    onEdit: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Edit Profile and Sign out buttons when the user can edit their profile', () => {
    render(<HeaderMobile {...baseProps} canEdit={true} />);

    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });

  it('opens the edit profile modal when Edit Profile is clicked', () => {
    const onEdit = jest.fn();
    render(<HeaderMobile {...baseProps} canEdit={true} onEdit={onEdit} />);

    fireEvent.click(screen.getByText('Edit Profile'));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('hides the edit actions when the user cannot edit the profile', () => {
    render(<HeaderMobile {...baseProps} canEdit={false} />);

    expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign out')).not.toBeInTheDocument();
  });

  it('stacks the action bar above the profile content so the buttons stay visible', () => {
    const { container } = render(<HeaderMobile {...baseProps} canEdit={true} />);
    const bar = container.firstChild as HTMLElement;

    expect(bar.style.position).not.toBe('absolute');
    expect(Number(bar.style.zIndex)).toBeGreaterThan(0);
  });
});
