import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import ButtonSet from '../BountyModalButtonSet';

describe('BountyModalButtonSet Component', () => {
  it('renders the tribe button with correct content when a tribe is provided', () => {
    const { queryByText } = render(<ButtonSet tribe="W3schools" />);
    const tribeButton = queryByText('W3schools');
    expect(tribeButton).toBeInTheDocument();
  });

  it('does not display the tribe button when no tribe is associated', () => {
    render(<ButtonSet tribe="None" />);
    const tribeButton = screen.queryByText(/tribe/i);
    expect(tribeButton).not.toBeInTheDocument();
  });

  it('displays the tribe button when a tribe is associated', () => {
    render(<ButtonSet tribe="kotlin" />);

    const tribeButton = screen.getByText(/kotlin/i);
    expect(tribeButton).toBeInTheDocument();
  });

  it('renders the ticket tribe notification link and opens the tribe when clicked', () => {
    const tribeFunction = jest.fn();

    render(<ButtonSet tribe="kotlin" tribeFunction={tribeFunction} />);

    const joinLink = screen.getByTestId('join-tribe-ticket-link');
    expect(joinLink).toHaveTextContent(
      'Interested in seeing more tickets like this? Join the tribe and get notified about new tickets'
    );

    fireEvent.click(joinLink);
    expect(tribeFunction).toHaveBeenCalledTimes(1);
  });

  it('opens the tribe notification link from the keyboard', () => {
    const tribeFunction = jest.fn();

    render(<ButtonSet tribe="kotlin" tribeFunction={tribeFunction} />);

    fireEvent.keyDown(screen.getByTestId('join-tribe-ticket-link'), { key: 'Enter' });
    expect(tribeFunction).toHaveBeenCalledTimes(1);
  });

  it('does not render the ticket tribe notification link for missing tribes', () => {
    const { rerender } = render(<ButtonSet tribe="none" />);
    expect(screen.queryByTestId('join-tribe-ticket-link')).not.toBeInTheDocument();

    rerender(<ButtonSet tribe=" " />);
    expect(screen.queryByTestId('join-tribe-ticket-link')).not.toBeInTheDocument();
  });
});
