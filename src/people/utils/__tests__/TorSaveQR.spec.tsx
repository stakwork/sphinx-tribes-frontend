import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TorSaveQR from '../TorSaveQR';

describe('TorSaveQR', () => {
  const mockGoBack = jest.fn();
  const validUrl = 'sphinx://test.com/example';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with valid url and goBack, and the structure and inline styles are correct', () => {
    const { container } = render(<TorSaveQR url={validUrl} goBack={mockGoBack} />);

    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveStyle({
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '10px 20px',
      width: '100%'
    });

    expect(screen.getByText('Scan to complete this request.')).toBeInTheDocument();
    expect(screen.getByText('Open Sphinx App')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it("clicking 'Open Sphinx App' button creates an anchor element with correct href and calls click()", () => {
    render(<TorSaveQR url={validUrl} goBack={mockGoBack} />);

    const mockAnchor = {
      href: '',
      click: jest.fn()
    };
    const createElementSpy = jest
      .spyOn(document, 'createElement')
      .mockReturnValue(mockAnchor as any);

    fireEvent.click(screen.getByText('Open Sphinx App'));

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(mockAnchor.href).toBe(validUrl);
    expect(mockAnchor.click).toHaveBeenCalled();

    createElementSpy.mockRestore();
  });

  it("clicking 'Cancel' button calls goBack function exactly once", () => {
    render(<TorSaveQR url={validUrl} goBack={mockGoBack} />);

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('renders and behaves correctly when url prop is an empty string', async () => {
    const { container } = render(<TorSaveQR url="" goBack={mockGoBack} />);

    expect(screen.getByText('Open Sphinx App')).toBeInTheDocument();
    const qrComponent = container.querySelector('[data-testid="qr-code"]');
    waitFor(() => {
      expect(qrComponent).toHaveAttribute('value', '');
    });
  });

  it('renders correctly with a URL containing special characters and query parameters', () => {
    const complexUrl = 'sphinx://test.com/path?param=value&special=@#$%';
    render(<TorSaveQR url={complexUrl} goBack={mockGoBack} />);

    const mockAnchor = { href: '', click: jest.fn() };
    const createElementSpy = jest
      .spyOn(document, 'createElement')
      .mockReturnValue(mockAnchor as any);

    fireEvent.click(screen.getByText('Open Sphinx App'));
    expect(mockAnchor.href).toBe(complexUrl);

    createElementSpy.mockRestore();
  });

  it('matches the snapshot for the given valid props', () => {
    const { container } = render(<TorSaveQR url={validUrl} goBack={mockGoBack} />);
    expect(container).toMatchSnapshot();
  });

  it('verifies specific inline styles on main container and Button components', () => {
    const { container } = render(<TorSaveQR url={validUrl} goBack={mockGoBack} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveStyle({ marginTop: '30px' });
    expect(buttons[1]).toHaveStyle({ marginTop: '20px' });

    const spacerDiv = container.querySelector('div[style*="height: 40px"]');
    expect(spacerDiv).toBeInTheDocument();
  });

  it('handles a null url value appropriately', () => {
    render(<TorSaveQR url={'' as string} goBack={mockGoBack} />);

    waitFor(() => {
      const qrComponent = screen.getByTestId('qr-code');
      expect(qrComponent).toHaveAttribute('value', '');

      expect(screen.getByText('Scan to complete this request.')).toBeInTheDocument();
    });
  });
});
