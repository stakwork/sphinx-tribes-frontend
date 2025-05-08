import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useDropzone } from 'react-dropzone';
import { TicketTextAreaComp } from '../TicketTextArea';

const mockUploadFile = jest.fn();
jest.mock('store', () => ({
  useStores: () => ({
    main: {
      uploadFile: mockUploadFile
    }
  })
}));

jest.mock('react-dropzone', () => ({
  useDropzone: jest.fn()
}));

const mockUiStore = {
  ready: true,
  setReady: jest.fn(),
  tags: [],
  setTags: jest.fn(),
  selectedTag: null,
  setSelectedTag: jest.fn(),
  selectedPerson: null,
  setSelectedPerson: jest.fn()
} as any;

describe('TicketTextAreaComp', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    value: '',
    onChange: mockOnChange,
    placeholder: 'Enter text here',
    ui: mockUiStore,
    'data-testid': 'ticket-textarea'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useDropzone as jest.Mock).mockImplementation(() => ({
      getRootProps: () => ({}),
      getInputProps: () => ({})
    }));
    mockUploadFile.mockReset();
  });

  test('renders textarea with correct placeholder', () => {
    render(<TicketTextAreaComp {...defaultProps} />);
    const textarea = screen.getByPlaceholderText('Enter text here');
    expect(textarea).toBeInTheDocument();
  });

  test('handles text input correctly', () => {
    render(<TicketTextAreaComp {...defaultProps} />);
    const textarea = screen.getByTestId('ticket-textarea');

    fireEvent.change(textarea, { target: { value: 'Hello World' } });
    expect(mockOnChange).toHaveBeenCalledWith('Hello World');
  });

  test('handles image paste', async () => {
    document.querySelector = jest.fn().mockImplementation(() => ({
      value: '',
      selectionStart: 0
    }));

    mockUploadFile.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve('https://example.com/image.png')
    });

    render(<TicketTextAreaComp data-testid="ticket-text-area-comp-component" {...defaultProps} />);
    const textarea = screen.getByTestId('ticket-textarea');

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const clipboardData = {
      items: [
        {
          kind: 'file',
          type: 'image/png',
          getAsFile: () => file
        }
      ],
      files: [file],
      getData: () => ''
    };

    fireEvent.paste(textarea, {
      clipboardData,
      preventDefault: () => {
        ('');
      }
    });

    waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(expect.stringContaining('![Uploading'));
    });

    waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('![image](https://example.com/image.png)')
      );
    });
  });

  test('handles non-image paste normally', () => {
    document.querySelector = jest.fn().mockImplementation(() => ({
      value: '',
      selectionStart: 0
    }));

    render(<TicketTextAreaComp {...defaultProps} />);
    const textarea = screen.getByTestId('ticket-textarea');

    const clipboardData = {
      items: [
        {
          kind: 'string',
          type: 'text/plain',
          getAsFile: () => null
        }
      ],
      files: [],
      getData: () => 'plain text'
    };

    fireEvent.paste(textarea, {
      clipboardData,
      preventDefault: () => {
        ('');
      }
    });

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  test('handles failed image upload', async () => {
    document.querySelector = jest.fn().mockImplementation(() => ({
      value: '',
      selectionStart: 0
    }));
    mockUploadFile.mockRejectedValueOnce(new Error('Upload failed'));

    render(<TicketTextAreaComp {...defaultProps} />);
    const textarea = screen.getByTestId('ticket-textarea');

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const clipboardData = {
      items: [
        {
          kind: 'file',
          type: 'image/png',
          getAsFile: () => file
        }
      ],
      files: [file],
      getData: () => ''
    };

    fireEvent.paste(textarea, {
      clipboardData,
      preventDefault: () => {
        ('');
      }
    });

    waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(expect.stringContaining('![Upload failed]()'));
    });
  });

  test('handles successful image upload', async () => {
    document.querySelector = jest.fn().mockImplementation(() => ({
      value: '',
      selectionStart: 0
    }));
    mockUploadFile.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve('https://example.com/image.png')
    });

    render(<TicketTextAreaComp {...defaultProps} />);
    const textarea = screen.getByTestId('ticket-textarea');

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const clipboardData = {
      items: [
        {
          kind: 'file',
          type: 'image/png',
          getAsFile: () => file
        }
      ],
      files: [file],
      getData: () => ''
    };

    fireEvent.paste(textarea, {
      clipboardData,
      preventDefault: () => {
        ('');
      }
    });

    waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('![image](https://example.com/image.png)')
      );
    });
  });

  test('renders with existing content', () => {
    render(<TicketTextAreaComp {...defaultProps} value="Existing content" />);
    expect(screen.getByDisplayValue('Existing content')).toBeInTheDocument();
  });

  test('renders with custom placeholder', () => {
    render(<TicketTextAreaComp {...defaultProps} placeholder="Custom placeholder" />);
    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  });

  test('handles multiple simultaneous image uploads', async () => {
    document.querySelector = jest.fn().mockImplementation(() => ({
      value: '',
      selectionStart: 0
    }));
    mockUploadFile
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve('https://example.com/image1.png')
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve('https://example.com/image2.png')
      });

    render(<TicketTextAreaComp {...defaultProps} />);
    const textarea = screen.getByTestId('ticket-textarea');

    const file1 = new File(['content1'], 'test1.png', { type: 'image/png' });
    const file2 = new File(['content2'], 'test2.png', { type: 'image/png' });

    fireEvent.paste(textarea, {
      clipboardData: {
        items: [
          {
            kind: 'file',
            type: 'image/png',
            getAsFile: () => file1
          }
        ],
        files: [file1],
        getData: () => ''
      },
      preventDefault: () => {
        ('');
      }
    });

    fireEvent.paste(textarea, {
      clipboardData: {
        items: [
          {
            kind: 'file',
            type: 'image/png',
            getAsFile: () => file2
          }
        ],
        files: [file2],
        getData: () => ''
      },
      preventDefault: () => {
        ('');
      }
    });

    await waitFor(() => {
      expect(mockUploadFile).toHaveBeenCalledTimes(2);
    });
  });

  test('handles large image files', async () => {
    document.querySelector = jest.fn().mockImplementation(() => ({
      value: '',
      selectionStart: 0
    }));
    const largeFile = new File([new ArrayBuffer(5 * 1024 * 1024)], 'large.png', {
      type: 'image/png'
    });
    mockUploadFile.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve('https://example.com/large-image.png')
    });

    render(<TicketTextAreaComp {...defaultProps} />);
    const textarea = screen.getByTestId('ticket-textarea');

    fireEvent.paste(textarea, {
      clipboardData: {
        items: [
          {
            kind: 'file',
            type: 'image/png',
            getAsFile: () => largeFile
          }
        ],
        files: [largeFile],
        getData: () => ''
      },
      preventDefault: () => {
        ('');
      }
    });

    waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('![image](https://example.com/large-image.png)')
      );
    });
  });

  test('handles network error during upload', async () => {
    document.querySelector = jest.fn().mockImplementation(() => ({
      value: '',
      selectionStart: 0
    }));
    mockUploadFile.mockRejectedValueOnce(new Error('Network error'));

    render(<TicketTextAreaComp {...defaultProps} />);
    const textarea = screen.getByTestId('ticket-textarea');

    const file = new File(['content'], 'test.png', { type: 'image/png' });
    fireEvent.paste(textarea, {
      clipboardData: {
        items: [
          {
            kind: 'file',
            type: 'image/png',
            getAsFile: () => file
          }
        ],
        files: [file],
        getData: () => ''
      },
      preventDefault: () => {
        ('');
      }
    });

    waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(expect.stringContaining('![Upload failed]()'));
    });
  });

  test('handles server error response', async () => {
    document.querySelector = jest.fn().mockImplementation(() => ({
      value: '',
      selectionStart: 0
    }));
    mockUploadFile.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    render(<TicketTextAreaComp {...defaultProps} />);
    const textarea = screen.getByTestId('ticket-textarea');

    const file = new File(['content'], 'test.png', { type: 'image/png' });
    fireEvent.paste(textarea, {
      clipboardData: {
        items: [
          {
            kind: 'file',
            type: 'image/png',
            getAsFile: () => file
          }
        ],
        files: [file],
        getData: () => ''
      },
      preventDefault: () => {
        ('');
      }
    });

    waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(expect.stringContaining('![Upload failed]()'));
    });
  });

  test('handles empty file paste', () => {
    document.querySelector = jest.fn().mockImplementation(() => ({
      value: '',
      selectionStart: 0
    }));
    render(<TicketTextAreaComp {...defaultProps} />);
    const textarea = screen.getByTestId('ticket-textarea');

    fireEvent.paste(textarea, {
      clipboardData: {
        items: [
          {
            kind: 'file',
            type: 'image/png',
            getAsFile: () => null
          }
        ],
        files: [],
        getData: () => ''
      },
      preventDefault: () => {
        ('');
      }
    });

    expect(mockUploadFile).not.toHaveBeenCalled();
  });

  test('handles unsupported file types', () => {
    document.querySelector = jest.fn().mockImplementation(() => ({
      value: '',
      selectionStart: 0
    }));
    render(<TicketTextAreaComp {...defaultProps} />);
    const textarea = screen.getByTestId('ticket-textarea');

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.paste(textarea, {
      clipboardData: {
        items: [
          {
            kind: 'file',
            type: 'application/pdf',
            getAsFile: () => file
          }
        ],
        files: [file],
        getData: () => ''
      },
      preventDefault: () => {
        ('');
      }
    });

    expect(mockUploadFile).not.toHaveBeenCalled();
  });
});