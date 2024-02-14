import React from 'react';
import { render } from '@testing-library/react';
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
