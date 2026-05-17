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
        id: 33,
        title: 'Existing bounty',
        one_sentence_summary: '',
        description: 'Updated description',
        price: '2500',
        assignee: 'assigned-user-pubkey',
        type: 'coding_task'
      })
    }
  >
    Save mocked bounty
  </button>
));

jest.mock('../../widgetViews/summaries/WantedSummary', () => () => <div />);

describe('FocusedView bounty edits', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMain.dropDownWorkspaces = [];
    mockMain.getBountyById.mockResolvedValue([{ body: { owner_id: 'original-owner-pubkey' } }]);
    mockMain.getUserDropdownWorkspaces.mockResolvedValue(undefined);
    mockMain.isTorSave.mockReturnValue(false);
    mockMain.saveBounty.mockResolvedValue(undefined);
  });

  it('refreshes the active bounty after editing assigned bounty fields', async () => {
    const getBounty = jest.fn().mockResolvedValue(undefined);
    const setAfterEdit = jest.fn();

    render(
      <FocusedView
        config={{ schema: [], submitText: 'Save' }}
        selectedIndex={-1}
        canEdit={false}
        person={{}}
        getBounty={getBounty}
        setAfterEdit={setAfterEdit}
      />
    );

    fireEvent.click(screen.getByText('Save mocked bounty'));

    await waitFor(() => {
      expect(mockMain.saveBounty).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 33,
          price: 2500,
          owner_id: 'original-owner-pubkey',
          assignee: 'assigned-user-pubkey'
        })
      );
    });

    expect(setAfterEdit).toHaveBeenCalledWith(true);
    expect(getBounty).toHaveBeenCalledTimes(1);
  });
});
