import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Modal from './Modal';

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock('remark-gfm', () => {});
// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock('rehype-raw', () => {});

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

  test('calls bigCloseImage and stops click propagation when image close is clicked', () => {
    const bigCloseImage = jest.fn();
    const wrapperClick = jest.fn();

    render(
      <div onClick={wrapperClick}>
        <Modal bigCloseImage={bigCloseImage} visible={true} />
      </div>
    );

    fireEvent.click(screen.getByTestId('close-btn'));

    expect(bigCloseImage).toHaveBeenCalled();
    expect(wrapperClick).not.toHaveBeenCalled();
  });

  test('calls bigCloseImage from keyboard activation', () => {
    const bigCloseImage = jest.fn();
    render(<Modal bigCloseImage={bigCloseImage} visible={true} />);

    fireEvent.keyDown(screen.getByTestId('close-btn'), { key: 'Enter' });
    fireEvent.keyDown(screen.getByTestId('close-btn'), { key: ' ' });

    expect(bigCloseImage).toHaveBeenCalledTimes(2);
  });
});
