import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { convertLocaleToNumber } from '../../../../helpers';
import NumberInputNew from '../NumberSatsInput.tsx';

describe('NumberInputNew Component', () => {
  test('accepts numbers greater than or equal to 1', () => {
    render(
      <NumberInputNew
        error={''}
        label="Test Label"
        name="testInput"
        value=""
        handleChange={() = data-testid="number-sats-input-component"> {
          ('');
        }}
        handleBlur={() => {
          ('');
        }}
        handleFocus={() => {
          ('');
        }}
        readOnly
      />
    );
    const inputElement = screen.getByPlaceholderText('0') as HTMLInputElement;
    fireEvent.change(inputElement, { target: { value: '123' } });
    expect(convertLocaleToNumber(inputElement.value)).toBeGreaterThanOrEqual(1);
  });

  test('does not accept symbols', () => {
    render(
      <NumberInputNew
        error={''}
        label="Test Label"
        name="testInput"
        value=""
        handleChange={() => {
          ('');
        }}
        handleBlur={() => {
          ('');
        }}
        handleFocus={() => {
          ('');
        }}
        readOnly
      />
    );
    const inputElement = screen.getByPlaceholderText('0') as HTMLInputElement;
    fireEvent.change(inputElement, { target: { value: '@#$' } });
    expect(inputElement.value).toBe(''); //component clears the input for invalid values
  });

  test('does not accept text', () => {
    render(
      <NumberInputNew
        error={''}
        label="Test Label"
        name="testInput"
        value=""
        handleChange={() => {
          ('');
        }}
        handleBlur={() => {
          ('');
        }}
        handleFocus={() => {
          ('');
        }}
        readOnly
      />
    );
    const inputElement = screen.getByPlaceholderText('0') as HTMLInputElement;
    fireEvent.change(inputElement, { target: { value: 'text' } });
    expect(inputElement.value).toBe('');
  });

  test('does not accept negative numbers', () => {
    render(
      <NumberInputNew
        error={''}
        label="Test Label"
        name="testInput"
        value=""
        handleChange={() => {
          ('');
        }}
        handleBlur={() => {
          ('');
        }}
        handleFocus={() => {
          ('');
        }}
        readOnly
      />
    );
    const inputElement = screen.getByPlaceholderText('0') as HTMLInputElement;
    fireEvent.change(inputElement, { target: { value: '-123' } });
    expect(inputElement.value).toBe('');
  });

  test('does not accept numbers less than to 0', () => {
    render(
      <NumberInputNew
        error={''}
        label="Test Label"
        name="testInput"
        value=""
        handleChange={() => {
          ('');
        }}
        handleBlur={() => {
          ('');
        }}
        handleFocus={() => {
          ('');
        }}
        readOnly
      />
    );
    const inputElement = screen.getByPlaceholderText('0') as HTMLInputElement;
    fireEvent.change(inputElement, { target: { value: '0' } });
    expect(inputElement.value).toBe('');
  });
});
