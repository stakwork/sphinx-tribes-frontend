import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import React from 'react';
import { setupStore } from '../../../../__test__/__mockData__/setupStore';
import { user } from '../../../../__test__/__mockData__/user';
import { mockUsehistory } from '../../../../__test__/__mockFn__/useHistory';
import { PostModal } from '../PostModal';

beforeAll(() => {
  setupStore();
  mockUsehistory();
});

describe('Post bounty modal', () => {
  beforeEach(() => {
    nock(user.url).get('/person/id/1').reply(200, user);
  });

  test('clicking on post a bounty button render a form', () => {
    const closeHandler = jest.fn();
    render(<PostModal isOpen={true} onClose={closeHandler} widget="wanted" />);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText(/Choose Bounty type/i)).toBeInTheDocument();
  });

  test('start button is visible and navigates to the first step', () => {
    const closeHandler = jest.fn();
    render(<PostModal isOpen={true} onClose={closeHandler} widget="wanted" />);
    const startButton = screen.getByText('Start');
    expect(startButton).toBeInTheDocument();
    fireEvent.click(startButton);
    expect(screen.getByText('Basic info')).toBeInTheDocument();
  });

  test('back and the next button take you forward and backward respectively', () => {
    const closeHandler = jest.fn();
    render(<PostModal isOpen={true} onClose={closeHandler} widget="wanted" />);
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Freelance Job Request')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Back'));
    expect(screen.getByText('Choose Bounty type')).toBeInTheDocument();
  });

  test('all form field are rendered', () => {
    const closeHandler = jest.fn();
    render(<PostModal isOpen={true} onClose={closeHandler} widget="wanted" />);
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);
    expect(screen.getByText('Basic info')).toBeInTheDocument();
    const Form1 = screen.getByText('Organization (optional)');
    const Form2 = screen.getByText('Bounty Title *');
    const Form3 = screen.getByText('Github Issue URL');
    const Form4 = screen.getByText('Category *');
    const Form5 = screen.getByText('Coding Language');
    expect(Form1).toBeInTheDocument();
    expect(Form2).toBeInTheDocument();
    expect(Form3).toBeInTheDocument();
    expect(Form4).toBeInTheDocument();
    expect(Form5).toBeInTheDocument();
  });

  test('clicking on assign hunter', () => {
    const closeHandler = jest.fn();
    const formData = {
      organization: 'organization',
      title: 'title',
      category: 'Web development',
      description: 'description',
      price: 1
    };
    render(<PostModal isOpen={true} onClose={closeHandler} widget="wanted" />);
    fireEvent.click(screen.getByText('Start'));

    expect(screen.queryByText('Basic info')).toBeInTheDocument();
    expect(screen.queryByText('Next')).toHaveClass('disableText');
    waitFor(async () => {
      await userEvent.type(screen.getByLabelText('Bounty Title'), formData.title);
      userEvent.click(screen.getByTestId('Category'));
      userEvent.click(screen.getByText(formData.category));
      userEvent.click(screen.getByText('Next'));
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.queryAllByText('Description')[0]).toBeInTheDocument();
      await waitFor(async () => {
        await userEvent.type(screen.getByLabelText('Description'), formData.description);
        userEvent.click(screen.getByText('Next'));
      });
      expect(screen.getByText('Price and Estimate')).toBeInTheDocument();
      await waitFor(async () => {
        await userEvent.type(screen.getByLabelText('Price (Sats)*'), String(formData.price));
        userEvent.click(screen.getByText('Next'));
      });
      expect(screen.queryByText('Assign Developer')).toBeInTheDocument();
      await waitFor(async () => {
        userEvent.click(await screen.findByText('Decide Later'));
      });
      expect(screen.queryByText('Finish')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Type to search')).toBeInTheDocument();
        expect(screen.getByText('Skills')).toBeInTheDocument();
        const assignButtons = screen.getAllByText('Assign');
        expect(assignButtons.length).toBe(5);
      });

      // Test That on clicking on the "type to search" box I should be able to type in any character and the list below should be filtered.
      const searchBox = screen.getByPlaceholderText('Type to search ...');
      await userEvent.type(searchBox, 'John Doe');

      // Test that on clicking on the "skills" box I should be able to type in any character and the list below should be filtered.
      userEvent.click(screen.getByRole('button', { name: /Skills/i }));
      const dropdown = screen.getByRole('listbox');
      userEvent.click(within(dropdown).getByText('JavaScript'));
      userEvent.click(within(dropdown).getByText('Python'));
      userEvent.click(within(dropdown).getByText('Golang'));
      expect(screen.getByText('JavaScript')).toBeVisible();
      expect(screen.getByText('Python')).toBeVisible();
      expect(screen.getByText('Golang')).toBeVisible();
    });
  });
});
