import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TabBar from '../TabBar';

describe('TabBar', () => {
  const mockOnTabChange = jest.fn();

  beforeEach(() => {
    mockOnTabChange.mockClear();
  });

  it('renders all tabs correctly', () => {
    render(<TabBar activeTab="focus" onTabChange={mockOnTabChange} />);

    expect(screen.getByText('Focus')).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Backlog')).toBeInTheDocument();
    expect(screen.getByText('Archive')).toBeInTheDocument();
  });

  it('applies correct styles to active tab', () => {
    render(<TabBar activeTab="focus" onTabChange={mockOnTabChange} />);

    const focusTab = screen.getByText('Focus').closest('button');
    const allTab = screen.getByText('All').closest('button');

    expect(focusTab).toHaveStyle({
      background: '#6d6d6d',
      color: '#fff',
      fontWeight: '800'
    });

    expect(allTab).toHaveStyle({
      background: '#eff0f3',
      color: '#000',
      fontWeight: '600'
    });
  });

  it('calls onTabChange with correct value when tabs are clicked', () => {
    render(<TabBar activeTab="focus" onTabChange={mockOnTabChange} />);

    fireEvent.click(screen.getByText('All'));
    expect(mockOnTabChange).toHaveBeenCalledWith('all');

    fireEvent.click(screen.getByText('Backlog'));
    expect(mockOnTabChange).toHaveBeenCalledWith('backlog');

    fireEvent.click(screen.getByText('Archive'));
    expect(mockOnTabChange).toHaveBeenCalledWith('archive');

    fireEvent.click(screen.getByText('Focus'));
    expect(mockOnTabChange).toHaveBeenCalledWith('focus');

    expect(mockOnTabChange).toHaveBeenCalledTimes(4);
  });

  it('handles multiple clicks on the same tab', () => {
    render(<TabBar activeTab="focus" onTabChange={mockOnTabChange} />);

    const focusTab = screen.getByText('Focus');

    fireEvent.click(focusTab);
    fireEvent.click(focusTab);
    fireEvent.click(focusTab);

    expect(mockOnTabChange).toHaveBeenCalledTimes(3);
    expect(mockOnTabChange).toHaveBeenCalledWith('focus');
  });

  it('handles invalid active tab prop gracefully', () => {
    type TabType = string;
    const invalidTab: TabType = 'invalid';

    render(<TabBar activeTab={invalidTab} onTabChange={mockOnTabChange} />);

    expect(screen.getByText('Focus')).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Backlog')).toBeInTheDocument();
    expect(screen.getByText('Archive')).toBeInTheDocument();

    const allTabs = screen.getAllByRole('button');
    allTabs.forEach((tab) => {
      expect(tab).toHaveStyle({ background: '#eff0f3' });
    });
  });

  it('supports keyboard navigation', async () => {
    render(<TabBar activeTab="focus" onTabChange={mockOnTabChange} />);

    const focusTab = screen.getByText('Focus');

    waitFor(() => {
      focusTab.focus();
      fireEvent.keyDown(focusTab, { key: 'Enter' });
      expect(mockOnTabChange).toHaveBeenCalledWith('focus');

      fireEvent.keyDown(focusTab, { key: ' ' });
      expect(mockOnTabChange).toHaveBeenCalledWith('focus');
    });
  });

  it('updates styles when active tab prop changes', () => {
    const { rerender } = render(<TabBar activeTab="focus" onTabChange={mockOnTabChange} />);

    expect(screen.getByText('Focus').closest('button')).toHaveStyle({
      background: '#6d6d6d'
    });

    rerender(<TabBar activeTab="all" onTabChange={mockOnTabChange} />);

    expect(screen.getByText('All').closest('button')).toHaveStyle({
      background: '#6d6d6d'
    });
    expect(screen.getByText('Focus').closest('button')).toHaveStyle({
      background: '#eff0f3'
    });
  });

  it('meets accessibility requirements', async () => {
    const { container } = render(<TabBar activeTab="focus" onTabChange={mockOnTabChange} />);

    expect(container.querySelector('nav')).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);

    waitFor(() => {
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('tabindex', '0');
      });
    });
  });

  it('has transition styles for smooth animations', () => {
    render(<TabBar activeTab="focus" onTabChange={mockOnTabChange} />);

    const tabs = screen.getAllByRole('button');
    tabs.forEach((tab) => {
      const styles = window.getComputedStyle(tab);
      expect(styles.transition).toBe('all 0.2s ease');
    });
  });

  it('has correct container styling', () => {
    const { container } = render(<TabBar activeTab="focus" onTabChange={mockOnTabChange} />);

    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv).toHaveStyle({
      background: '#f8f9fa',
      paddingTop: '30px',
      borderRadius: '8px 8px 0 0'
    });
  });
});
