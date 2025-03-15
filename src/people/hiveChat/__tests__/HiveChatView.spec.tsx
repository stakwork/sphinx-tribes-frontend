import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ThinkingModeToggle from '../ThinkingModeToggle';
import { useFeatureFlag } from '../../../hooks';
import { ModelOption } from '../modelSelector';

jest.mock('../../../hooks/useFeatureFlag', () => ({
  useFeatureFlag: jest.fn()
}));

jest.mock('../modelSelector', () => ({
  ModelSelector: jest.fn(({ selectedModel, onModelChange }) => (
    <div data-testid="model-selector">
      <button
        data-testid="model-selector-button"
        onClick={() =>
          onModelChange({
            id: 'claude-3-opus',
            name: 'Claude 3 Opus',
            label: 'Claude 3 Opus',
            value: 'claude-3-opus'
          })
        }
      >
        {selectedModel.name}
      </button>
    </div>
  ))
}));

describe('HiveChatView Feature Flag Tests', () => {
  const defaultProps = {
    isBuild: 'Chat' as const,
    setIsBuild: jest.fn(),
    selectedModel: {
      id: 'claude-3-sonnet',
      name: 'Claude 3 Sonnet',
      label: 'Claude 3 Sonnet',
      value: 'claude-3-sonnet'
    } as ModelOption,
    setSelectedModel: jest.fn(),
    handleKeyDown: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Test Case 1: Both feature flags disabled renders nothing', () => {
    (useFeatureFlag as jest.Mock).mockImplementation(() => ({
      isEnabled: false
    }));

    const { container } = render(<ThinkingModeToggle {...defaultProps} />);

    expect(container.firstChild).toBeInTheDocument();
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(screen.queryByTestId('model-selector')).not.toBeInTheDocument();
  });

  it('Test Case 2: Only chat_toggle enabled - renders toggle but no model selector', () => {
    (useFeatureFlag as jest.Mock).mockImplementation((flag) => ({
      isEnabled: flag === 'chat_toggle'
    }));

    render(<ThinkingModeToggle {...defaultProps} />);

    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    expect(screen.queryByTestId('model-selector')).not.toBeInTheDocument();

    expect(screen.getByRole('radio', { name: 'Build' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Chat' })).toBeInTheDocument();
  });

  it('Test Case 3: Only chat_model enabled - renders model selector but no toggle', () => {
    (useFeatureFlag as jest.Mock).mockImplementation((flag) => ({
      isEnabled: flag === 'chat_model'
    }));

    waitFor(() => {
      render(<ThinkingModeToggle {...defaultProps} />);

      expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
      expect(screen.getByTestId('model-selector')).toBeInTheDocument();
    });
  });

  it('Test Case 4: Both feature flags enabled - renders both toggle and model selector', () => {
    (useFeatureFlag as jest.Mock).mockImplementation(() => ({
      isEnabled: true
    }));

    waitFor(() => {
      render(<ThinkingModeToggle {...defaultProps} />);

      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
      expect(screen.getByTestId('model-selector')).toBeInTheDocument();
    });
  });

  it('Test Case 5: Toggle buttons correctly reflect active state', () => {
    (useFeatureFlag as jest.Mock).mockImplementation(() => ({
      isEnabled: true
    }));

    waitFor(() => {
      const { rerender } = render(<ThinkingModeToggle {...defaultProps} />);

      const buildButton = screen.getByRole('radio', { name: 'Build' });
      const chatButton = screen.getByRole('radio', { name: 'Chat' });

      expect(chatButton).toHaveAttribute('aria-checked', 'true');
      expect(buildButton).toHaveAttribute('aria-checked', 'false');

      rerender(<ThinkingModeToggle {...defaultProps} isBuild="Build" />);

      expect(buildButton).toHaveAttribute('aria-checked', 'true');
      expect(chatButton).toHaveAttribute('aria-checked', 'false');
    });
  });

  it('Test Case 6: Toggle buttons call setIsBuild when clicked', () => {
    (useFeatureFlag as jest.Mock).mockImplementation(() => ({
      isEnabled: true
    }));

    const setIsBuild = jest.fn();
    waitFor(() => {
      render(<ThinkingModeToggle {...defaultProps} setIsBuild={setIsBuild} />);

      const buildButton = screen.getByRole('radio', { name: 'Build' });
      const chatButton = screen.getByRole('radio', { name: 'Chat' });

      fireEvent.click(buildButton);
      expect(setIsBuild).toHaveBeenCalledWith('Build');

      fireEvent.click(chatButton);
      expect(setIsBuild).toHaveBeenCalledWith('Chat');
    });
  });

  it('Test Case 7: Model selector calls setSelectedModel when changed', () => {
    (useFeatureFlag as jest.Mock).mockImplementation(() => ({
      isEnabled: true
    }));

    const setSelectedModel = jest.fn();
    waitFor(() => {
      render(<ThinkingModeToggle {...defaultProps} setSelectedModel={setSelectedModel} />);

      fireEvent.click(screen.getByTestId('model-selector-button'));

      expect(setSelectedModel).toHaveBeenCalledWith({ id: 'claude-3-opus', name: 'Claude 3 Opus' });
    });
  });

  it('Test Case 8: handleKeyDown is called when pressing keys on toggle container', () => {
    (useFeatureFlag as jest.Mock).mockImplementation(() => ({
      isEnabled: true
    }));

    const handleKeyDown = jest.fn();
    waitFor(() => {
      render(<ThinkingModeToggle {...defaultProps} handleKeyDown={handleKeyDown} />);

      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowRight' });

      expect(handleKeyDown).toHaveBeenCalled();
    });
  });
});
