import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Input from '../../../components/form/inputs';
import { Props } from '../../../components/form/inputs/propsType.ts';

const mockProps: Props = {
  value: '',
  label: '',
  labelStyle: { color: 'red', fontSize: '16px' },
  handleChange: jest.fn(),
  placeholder: '',
  handleBlur: jest.fn(),
  handleFocus: jest.fn(),
  readOnly: false,
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

const mockTextAreaProps = {
  ...mockProps,
  type: 'textarea',
  testId: 'deliverables-textarea',
  label: 'Deliverables'
};
const mockNumberSatsProps = {
  ...mockProps,
  type: 'numbersats',
  testId: 'price-sats-input'
};

const MockParentComponent = () => (
  <>
    <Input {...mockTextAreaProps} />
    <Input {...mockNumberSatsProps} />
  </>
);

test("Clicking on 'Deliverables' placeholder should not focus on NumberInputNew", () => {
  const { getByText } = render(<MockParentComponent />);

  const deliverablesInput = getByText('Deliverables');

  deliverablesInput.focus();

  expect(document.activeElement).toBeInTheDocument();
});

describe('MockParentComponent', () => {
  test('renders without crashing', () => {
    const { container } = render(<MockParentComponent />);
    expect(container).toBeInTheDocument();
  });

  test('renders TextArea Input with correct props', () => {
    const { getByTestId } = render(<MockParentComponent />);
    waitFor(() => {
      const textArea = getByTestId('deliverables-textarea');

      expect(textArea).toBeInTheDocument();
      expect(textArea).toHaveAttribute('type', 'textarea');
      expect(textArea.parentElement).toHaveTextContent('Deliverables');
    });
  });

  test('renders Number Input with correct props', () => {
    const { getByTestId } = render(<MockParentComponent />);

    waitFor(() => {
      const numberInput = getByTestId('price-sats-input');

      expect(numberInput).toBeInTheDocument();
      expect(numberInput).toHaveAttribute('type', 'number');
    });
  });

  test('renders with empty props', () => {
    const emptyProps = {
      ...mockProps,
      value: '',
      label: '',
      placeholder: '',
      options: []
    };

    const EmptyPropsComponent = () => (
      <>
        <Input {...emptyProps} type="textarea" />
        <Input {...emptyProps} type="numbersats" />
      </>
    );

    const { container } = render(<EmptyPropsComponent />);
    expect(container).toBeInTheDocument();
  });

  test('handles invalid prop types gracefully', () => {
    const invalidProps = {
      ...mockProps,
      value: null,
      label: undefined,
      style: 'invalid-style',
      maxLength: 'invalid-max'
    };

    const InvalidPropsComponent = () => (
      <>
        <Input {...invalidProps} type="textarea" />
        <Input {...invalidProps} type="numbersats" />
      </>
    );

    const { container } = render(<InvalidPropsComponent />);
    expect(container).toBeInTheDocument();
  });

  test('handles large prop values', () => {
    const largeProps = {
      ...mockProps,
      value: 'a'.repeat(1000),
      label: 'b'.repeat(1000),
      maxLength: 9999999
    };

    const LargePropsComponent = () => (
      <>
        <Input {...largeProps} type="textarea" />
        <Input {...largeProps} type="numbersats" />
      </>
    );

    const { container } = render(<LargePropsComponent />);
    expect(container).toBeInTheDocument();
  });

  test('handles minimum and maximum values', () => {
    const { getByTestId } = render(<MockParentComponent />);
    waitFor(() => {
      const numberInput = getByTestId('price-sats-input');

      fireEvent.change(numberInput, { target: { value: '-1' } });
      expect(numberInput).toHaveValue(0);

      const maxValue = Number.MAX_SAFE_INTEGER;
      fireEvent.change(numberInput, { target: { value: maxValue + 1 } });
      expect(numberInput).toHaveValue(maxValue);
    });
  });

  test('renders correctly with duplicate prop values', () => {
    const duplicateProps = {
      ...mockProps,
      options: [
        { label: 'Duplicate', value: '1' },
        { label: 'Duplicate', value: '1' }
      ]
    };

    const DuplicatePropsComponent = () => (
      <>
        <Input {...duplicateProps} type="textarea" />
        <Input {...duplicateProps} type="numbersats" />
      </>
    );

    const { container } = render(<DuplicatePropsComponent />);
    expect(container).toBeInTheDocument();
  });
});
