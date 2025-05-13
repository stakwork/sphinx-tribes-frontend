```
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import ButtonSet from '../BountyModalButtonSet';

describe('BountyModalButtonSet Component', () => {
  it('renders the tribe button with correct content when a tribe is provided', () => {
    const { queryByText } = render(<ButtonSet data-testid="bounty-modal-button-set-component" tribe="W3schools" />);
    const tribeButton = queryByText('W3schools');
    expect(tribeButton).toBeInTheDocument();
  });

  it('does not display the tribe button when no tribe is associated', () => {
    render(<ButtonSet data-testid="bounty-modal-button-set-component" tribe="None" />);
    const tribeButton = screen.queryByText(/tribe/i);
    expect(tribeButton).not.toBeInTheDocument();
  });

  it('displays the tribe button when a tribe is associated', () => {
    render(<ButtonSet data-testid="bounty-modal-button-set-component" tribe="kotlin" />);

    const tribeButton = screen.getByText(/kotlin/i);
    expect(tribeButton).toBeInTheDocument();
  });
});
```