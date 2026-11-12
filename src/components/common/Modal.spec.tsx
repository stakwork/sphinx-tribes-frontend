import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Modal from './Modal';

describe('<Modal /> Arrow Buttons', () => {
  test('calls prevArrowNew function when previous arrow is clicked', () => {
    const prevArrowFunction = jest.fn();
    render(<Modal prevArrowNew={prevArrowFunction} visible={true} />);
    const prevArrow = screen.getByText('chevron_left');
    fireEvent.click(prevArrow);
    expect(prevArrowFunction).toHaveBeenCalled();
  });

  test('calls nextArrowNew function when next arrow is clicked', () => {
    const nextArrowFunction = jest.fn();
    render(<Modal nextArrowNew={nextArrowFunction} visible={true} />);
    const nextArrow = screen.getByText('chevron_right');
    fireEvent.click(nextArrow);
    expect(nextArrowFunction).toHaveBeenCalled();
  });

  test('renders new arrow icon buttons without primary blue backgrounds', () => {
    render(<Modal prevArrowNew={jest.fn()} nextArrowNew={jest.fn()} visible={true} />);

    expect(screen.getByText('chevron_left').closest('button')).toHaveStyle({
      background: '#ffffff00'
    });
    expect(screen.getByText('chevron_right').closest('button')).toHaveStyle({
      background: '#ffffff00'
    });
  });
});
