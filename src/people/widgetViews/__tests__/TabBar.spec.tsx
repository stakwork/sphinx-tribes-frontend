import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TabBar from 'components/BountyComponents/TabBar';

describe('TabBar Component', () => {
  const mockTabChange = jest.fn();

  beforeEach(() => {
    mockTabChange.mockClear();
  });

  it('renders all tabs correctly', () => {
    render(<TabBar activeTab="focus" onTabChange={mockTabChange} />);

    expect(screen.getByText('Focus')).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Backlog')).toBeInTheDocument();
    expect(screen.getByText('Archive')).toBeInTheDocument();
  });

  it('highlights the active tab', () => {
    const { rerender } = render(<TabBar activeTab="focus" onTabChange={mockTabChange} />);

    const focusTab = screen.getByText('Focus').closest('div');
    const allTab = screen.getByText('All').closest('div');
    const backlogTab = screen.getByText('Backlog').closest('div');
    const archiveTab = screen.getByText('Archive').closest('div');

    expect(focusTab).toHaveStyle('background-color: #6d6d6d');
    expect(focusTab).toHaveStyle('font-weight: 800');
    expect(focusTab).toHaveStyle('color: #ffffff');

    expect(allTab).toHaveStyle('background-color: #eff0f3');
    expect(backlogTab).toHaveStyle('background-color: #eff0f3');
    expect(archiveTab).toHaveStyle('background-color: #eff0f3');

    rerender(<TabBar activeTab="all" onTabChange={mockTabChange} />);

    expect(allTab).toHaveStyle('background-color: #6d6d6d');
    expect(focusTab).toHaveStyle('background-color: #eff0f3');
  });

  it('calls onTabChange with correct tab name when clicked', () => {
    render(<TabBar activeTab="focus" onTabChange={mockTabChange} />);

    fireEvent.click(screen.getByText('All'));
    expect(mockTabChange).toHaveBeenCalledWith('all');

    fireEvent.click(screen.getByText('Backlog'));
    expect(mockTabChange).toHaveBeenCalledWith('backlog');

    fireEvent.click(screen.getByText('Archive'));
    expect(mockTabChange).toHaveBeenCalledWith('archive');

    fireEvent.click(screen.getByText('Focus'));
    expect(mockTabChange).toHaveBeenCalledWith('focus');
  });
});
