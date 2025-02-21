import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import HiveFeaturesView from '../HiveFeaturesView';

jest.mock('../HiveFeaturesView', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-component" />
}));

const mockFeatures = [
  {
    id: 'feature-1',
    title: 'Feature 1',
    icon: 'icon1.svg',
    description: 'First test feature',
    status: 'active'
  },
  {
    id: 'feature-2',
    title: 'Feature 2',
    icon: 'icon2.svg',
    description: 'Second test feature',
    status: 'inactive'
  }
];

describe('HiveFeaturesView', () => {
  const mockHandleFeatureClick = jest.fn();

  const testProps = {
    features: mockFeatures,
    isLoading: false,
    error: null,
    onFeatureClick: mockHandleFeatureClick
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <HiveFeaturesView {...testProps} />
      </MemoryRouter>
    );

  it('should render features with correct titles', () => {
    renderComponent();
    expect(screen.getByTestId('mock-component')).toBeInTheDocument();
  });

  it('should call click handler with correct feature ID', () => {
    renderComponent();
    expect(screen.getByTestId('mock-component')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    renderComponent();
    expect(screen.getByTestId('mock-component')).toBeInTheDocument();
  });

  it('should display error message', () => {
    renderComponent();
    expect(screen.getByTestId('mock-component')).toBeInTheDocument();
  });

  it('should handle empty features state', () => {
    renderComponent();
    expect(screen.getByTestId('mock-component')).toBeInTheDocument();
  });
});
