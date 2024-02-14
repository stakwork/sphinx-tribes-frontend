import '@testing-library/jest-dom';
import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import Tribe from '../Tribe';
import { getHostIncludingDockerHosts } from '../../../config';

// Mocking navigator.clipboard.writeText
const mockWriteText = jest.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText
  }
});

describe('Tribe component', () => {
  test('copies link when copy button is clicked', async () => {
    const mockData = {
      uuid: '123456',
      name: 'Test Tribe',
      img: 'test-image-url',
      tags: ['tag1', 'tag2'],
      description: 'Test description',
      selected: false,
      select: jest.fn(),
      owner_alias: 'test_owner',
      price_to_join: 10,
      price_per_message: 1,
      member_count: 5,
      last_active: 1644720000,
      unique_name: 'test-unique-name',
      preview: 'example.com'
    };

    render(<Tribe {...mockData} />);

    // Find the copy button
    const copyButton = screen.getByText('Copy');

    // Simulate a click on the copy button
    fireEvent.click(copyButton);

    // Wait for the copied message to appear
    await waitFor(() => expect(screen.getByText('Copied!')).toBeInTheDocument());

    // Assert that navigator.clipboard.writeText was called with the correct value
    expect(mockWriteText).toHaveBeenCalledWith(
      `sphinx.chat://?action=tribe&uuid=${mockData.uuid}&host=${getHostIncludingDockerHosts()}`
    );
  });
});
