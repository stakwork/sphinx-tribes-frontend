import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import { Button } from 'components/common';

describe('Test for FocusedView Button', () => {
  const OnClick = jest.fn();

  it('enable delete button if there is no a hunter assigned or bounty is paid', () => {
    const isAssigned = false;
    const paid = false;
    const isDisabled = isAssigned || paid;
    const button = render(
      <Button
        color={'white'}
        loading={false}
        disabled={isDisabled}
        leadingIcon={'delete_outline'}
        text={'Delete'}
        onClick={OnClick}
        style={{
          marginLeft: 10
        }}
      />
    );

    const btn = button.getByRole('button', { name: 'delete_outline Delete' });
    expect(btn).toBeInTheDocument();
    expect(btn).toBeEnabled();
  });

  it('The button should be disable if there is a hunter assigned to the bounty or is paid', () => {
    const isAssigned = true;
    const paid = false;
    const isDisabled = isAssigned || paid;
    const button = render(
      <Button
        color={'white'}
        loading={false}
        disabled={isDisabled}
        leadingIcon={'delete_outline'}
        text={'Delete'}
        onClick={OnClick}
        style={{
          marginLeft: 10
        }}
      />
    );

    const btn = button.getByRole('button', { name: 'delete_outline Delete' });
    expect(btn).toBeInTheDocument();
    expect(btn).toBeDisabled();
  });
});
