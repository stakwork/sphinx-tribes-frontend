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
