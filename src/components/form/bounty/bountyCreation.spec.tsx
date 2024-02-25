import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { wantedCodingTaskSchema } from '../schema.ts';
import Form from './index.tsx';

describe('Bounty index', () => {
  beforeEach(async () => {
    act(async () => {
      render(<Form onSubmit={jest.fn()} schema={wantedCodingTaskSchema} />);
      const PostBountyButton = await screen.findByRole('button', { name: /Post a Bounty/i });
      expect(PostBountyButton).toBeInTheDocument();
      fireEvent.click(PostBountyButton);
      const StartButton = await screen.findByRole('button', { name: /Start/i });
      expect(StartButton).toBeInTheDocument();
      const bountyTitleInput = await screen.findByRole('input', { name: /Bounty Title /i });
      expect(bountyTitleInput).toBeInTheDocument();
      fireEvent.change(bountyTitleInput, { target: { value: 'new text' } });
      const dropdown = screen.getByText(/Category /i);
      fireEvent.click(dropdown);
      const desiredOption = screen.getByText(/Web Development/i);
      fireEvent.click(desiredOption);
      const NextButton = await screen.findByRole('button', { name: /Next/i });
      expect(NextButton).toBeInTheDocument();
      fireEvent.click(NextButton);
      const DescriptionInput = await screen.findByRole('input', { name: /Description /i });
      expect(DescriptionInput).toBeInTheDocument();
      fireEvent.change(DescriptionInput, { target: { value: 'new text' } });
      const NextButton2 = await screen.findByRole('button', { name: /Next/i });
      expect(NextButton2).toBeInTheDocument();
      fireEvent.click(NextButton2);
      const SatInput = await screen.findByRole('input', { name: /Price(Sats)/i });
      expect(SatInput).toBeInTheDocument();
    });
  });

  test('Placeholder text for 0 Sats is visible for amount input box', async () => {
    act(async () => {
      const SatInput = await screen.findByRole('input', { name: /Price(Sats)/i });
      expect(SatInput).toBeInTheDocument();
      const amountInput = await screen.findByText('0');
      expect(amountInput).toBeInTheDocument();
    });
  });

  test('Next button is disabled if amount is set to zero', async () => {
    act(async () => {
      const amountInput = await screen.findByText('0');
      fireEvent.change(amountInput, { target: { value: '0' } });
      const nextButton = screen.findByRole('button', { name: /Next/i });
      expect(nextButton).toBeDisabled();
    });
  });

  test('Next button is enabled for amount > 0 and Disabled again when reverting to 0', async () => {
    act(async () => {
      const amountInput = await screen.findByText('0');
      fireEvent.change(amountInput, { target: { value: '50' } });
      const nextButton = screen.findByRole('button', { name: /Next/i });
      expect(nextButton).toBeEnabled();
      fireEvent.change(amountInput, { target: { value: '0' } });
      expect(nextButton).toBeDisabled();
    });
  });

  test('Proceeding to next page of form only if value for amount is greater than 0', async () => {
    act(async () => {
      const amountInput = await screen.findByText('0');
      fireEvent.change(amountInput, { target: { value: '13' } });
      const nextButton = screen.findByRole('button', { name: /Next/i });
      fireEvent.click(await nextButton);
      const nextPage = await screen.findByText('Assign Developer');
      expect(nextPage).toBeInTheDocument();
      const DecideLaterButton = await screen.findByRole('button', { name: /Decide Later/i });
      expect(DecideLaterButton).toBeInTheDocument();
    });
  });

  test('Form does not proceed when only spaces are entered in title', async () => {
    act(async () => {
      const bountyTitleInput = await screen.findByRole('input', { name: /Bounty Title/i });
      fireEvent.change(bountyTitleInput, { target: { value: '                ' } });

      const dropdown = screen.getByText(/Category /i);
      fireEvent.click(dropdown);
      const desiredOption = screen.getByText(/Web Development/i);
      fireEvent.click(desiredOption);

      const nextButton = await screen.findByRole('button', { name: /Next/i });
      fireEvent.click(nextButton);
      expect(nextButton).toBeDisabled();
    });
  });

  test('Form does not proceed when only spaces are entered in description', async () => {
    act(async () => {
      const bountyTitleInput = await screen.findByRole('input', { name: /Bounty Title/i });
      fireEvent.change(bountyTitleInput, { target: { value: 'Test The Bounty' } });

      const dropdown = screen.getByText(/Category /i);
      fireEvent.click(dropdown);
      const desiredOption = screen.getByText(/Web Development/i);
      fireEvent.click(desiredOption);

      const nextButton = await screen.findByRole('button', { name: /Next/i });
      fireEvent.click(nextButton);

      const descriptionInput = await screen.findByRole('input', { name: /Description/i });
      fireEvent.change(descriptionInput, { target: { value: '              ' } });

      const nextButton2 = await screen.findByRole('button', { name: /Next/i });
      fireEvent.click(nextButton2);
      expect(nextButton2).toBeDisabled();
    });
  });

  test('Spaces are trimmed from bounty title and description', async () => {
    act(async () => {
      const bountyTitleInput = await screen.findByRole('input', { name: /Bounty Title/i });
      fireEvent.change(bountyTitleInput, { target: { value: '   Te st Ti tle   ' } });

      const descriptionInput = await screen.findByRole('input', { name: /Description/i });
      fireEvent.change(descriptionInput, { target: { value: '   Te st Descri ption   ' } });

      const mockOnSubmit = jest.fn();
      render(<Form onSubmit={mockOnSubmit} schema={wantedCodingTaskSchema} />);

      const submitButton = await screen.findByRole('button', { name: /Next/i });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Title',
          description: 'Test Description'
        })
      );
    });
  });
});
