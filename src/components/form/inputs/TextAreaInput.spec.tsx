import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TextAreaInput from './TextAreaInput';
import '@testing-library/jest-dom';

const mockProps = {
  label: 'Description',
  value: '',
  readOnly: false,
  github_state: true,
  labelStyle: { color: 'red', fontSize: '16px' },
  handleChange: jest.fn(),
  placeholder: '',
  handleBlur: jest.fn(),
  handleFocus: jest.fn(),
  prepend: '',
  extraHTML: '',
  note: '',
  testId: '',
  options: [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' }
  ],
  name: '',
  error: '',
  borderType: undefined,
  imageIcon: false,
  isFocused: jest.fn(),
  disabled: false,
  notProfilePic: true,
  style: { width: '100%', padding: '10px' },
  maxLength: 100,
  setColor: jest.fn()
};

describe('TextAreaInput', () => {
  it('renders uneditable description when pulled from GitHub issue', () => {
    const mockProps = {
      label: 'Description',
      value: 'Some description text',
      readOnly: false,
      github_state: true,
      labelStyle: { color: 'red', fontSize: '16px' },
      handleChange: jest.fn(),
      placeholder: '',
      handleBlur: jest.fn(),
      handleFocus: jest.fn(),
      prepend: '',
      extraHTML: '',
      note: '',
      testId: '',
      options: [
        { label: 'Option 1', value: '1' },
        { label: 'Option 2', value: '2' }
      ],
      name: '',
      error: '',
      borderType: undefined,
      imageIcon: false,
      isFocused: jest.fn(),
      disabled: false,
      notProfilePic: true,
      style: { width: '100%', padding: '10px' },
      maxLength: 100,
      setColor: jest.fn()
    };

    render(<TextAreaInput {...mockProps} />);
    const textArea = screen.getByTestId('checktextarea');

    expect(textArea).toHaveAttribute('readonly'); // Check if the textarea has the 'readonly' attribute
    expect(textArea).toHaveValue(mockProps.value);
  });

  it('renders editable description when github_state is false', () => {
    const mockProps = {
      label: 'Description',
      value: 'Some description text',
      readOnly: false,
      github_state: false,
      labelStyle: { color: 'red', fontSize: '16px' },
      handleChange: jest.fn(),
      placeholder: '',
      handleBlur: jest.fn(),
      handleFocus: jest.fn(),
      prepend: '',
      extraHTML: '',
      note: '',
      testId: '',
      options: [
        { label: 'Option 1', value: '1' },
        { label: 'Option 2', value: '2' }
      ],
      name: '',
      error: '',
      borderType: undefined,
      imageIcon: false,
      isFocused: jest.fn(),
      disabled: false,
      notProfilePic: true,
      style: { width: '100%', padding: '10px' },
      maxLength: 100,
      setColor: jest.fn()
    };

    render(<TextAreaInput {...mockProps} />);
    const textArea = screen.getByTestId('checktextarea');

    expect(textArea).not.toHaveAttribute('readonly'); // Check if the textarea does not have the 'readonly' attribute
    expect(textArea).toHaveValue(mockProps.value);
  });
});
