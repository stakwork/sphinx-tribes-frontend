import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import FocusedView from '../FocusView';

const mockMain = {
  dropDownWorkspaces: [],
  getBountyById: jest.fn(),
  getPersonCreatedBounties: jest.fn(),
  getUserDropdownWorkspaces: jest.fn(),
  isTorSave: jest.fn(),
  saveBounty: jest.fn()
};

const mockUi = {
  meInfo: {
    id: 1,
    pubkey: 'current-user-pubkey',
    owner_pubkey: 'current-user-pubkey'
  },
  setEditMe: jest.fn()
};

jest.mock('../../../store', () => ({
  useStores: () => ({
    main: mockMain,
    ui: mockUi
  })
}));

jest.mock('../../../store/ui', () => ({
  uiStore: {
    meInfo: { id: 1 }
  }
}));

jest.mock('../../../store/bountyReviewStore', () => ({
  bountyReviewStore: {
    deleteBountyTiming: jest.fn()
  }
}));

jest.mock('../../../components/common', () => ({
  Button: ({ onClick, text }: any) => <button onClick={onClick}>{text}</button>,
  IconButton: ({ onClick }: any) => <button onClick={onClick}>Back</button>,
  useAfterDeleteNotification: () => ({ openAfterDeleteNotification: jest.fn() }),
  useDeleteConfirmationModal: () => ({ openDeleteConfirmation: jest.fn() })
}));

jest.mock('../../../components/form/bounty', () => (props: any) => (
  <button
    onClick={() =>
      props.onSubmit({
        title: 'New bounty',
        one_sentence_summary: '',
        description: 'New description',
        price: '2500',
        assignee: '',
        type: 'coding_task'
      })
    }
  >
    Save mocked bounty
  </button>
));

jest.mock('../../widgetViews/summaries/WantedSummary', () => () => <div />);

describe('FocusedView bounty submission guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMain.dropDownWorkspaces = [];
    mockMain.getBountyById.mockResolvedValue([]);
    mockMain.getUserDropdownWorkspaces.mockResolvedValue(undefined);
    mockMain.isTorSave.mockReturnValue(false);
  });

  it('ignores duplicate clicks while a bounty save is in flight', async () => {
    let resolveSave: () => void = jest.fn();
    mockMain.saveBounty.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveSave = resolve;
        })
    );

    render(
      <FocusedView
        config={{ schema: [], submitText: 'Save' }}
        selectedIndex={-1}
        canEdit={false}
        person={{}}
      />
    );

    fireEvent.click(screen.getByText('Save mocked bounty'));
    fireEvent.click(screen.getByText('Save mocked bounty'));

    await waitFor(() => {
      expect(mockMain.saveBounty).toHaveBeenCalledTimes(1);
    });

    resolveSave();
  });
});
