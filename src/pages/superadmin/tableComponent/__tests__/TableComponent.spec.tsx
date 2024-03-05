import React, { useState } from 'react';
import { screen, render, fireEvent, waitFor } from '@testing-library/react';
import moment from 'moment';
import { createMemoryHistory } from 'history';
import userEvent from '@testing-library/user-event';
import { Router } from 'react-router-dom';
import '@testing-library/jest-dom';
import { MyTable } from '../index.tsx';
import { Bounty } from '../interfaces.ts';
import { TableProps } from '../index.tsx';

jest.mock('../index.tsx', () => ({
  ...jest.requireActual('../index.tsx'),
  paginatePrev: jest.fn(),
  paginateNext: jest.fn()
}));

const defaultPage = 1;
const totalBounties = 174;
const paginationLimit = Math.floor(totalBounties / 20) + 1;
const defaultTabs: number[] = [1, 2, 3, 4, 5, 6, 7];
const activeTabs = defaultTabs;
const setActiveTabs = jest.fn();
const onChangeFilterByDateMock = jest.fn();
const clickApply = jest.fn();

const mockBounties: Bounty[] = [
  {
    id: 1,
    bounty_id: 1,
    title: 'Bounty 1',
    date: '2023-01-01',
    bounty_created: '1672552800',
    paid_date: '2023-01-01',
    dtgp: 100,
    assignee: '',
    assigneeImage: '',
    provider: 'Provider 1',
    providerImage: 'provider-image-1.jpg',
    organization_name: 'Org 1',
    organizationImage: 'org-image-1.jpg',
    paid: false,
    assignee_alias: 'Ednum',
    status: 'open'
  },
  {
    id: 2,
    bounty_id: 2,
    title: 'Bounty 2',
    date: '2023-01-02',
    bounty_created: '1672639200',
    paid_date: '2023-01-02',
    dtgp: 200,
    assignee: 'Assignee 2',
    assigneeImage: 'assignee-image-2.jpg',
    provider: 'Provider 2',
    providerImage: 'provider-image-2.jpg',
    organization_name: 'Org 2',
    organizationImage: 'org-image-2.jpg',
    status: 'assigned',
    paid: false,
    assignee_alias: 'Ednum'
  },
  {
    id: 3,
    bounty_id: 3,
    title: 'Bounty 3',
    date: '2023-01-03',
    bounty_created: '1672725600',
    paid_date: '2023-01-03',
    dtgp: 300,
    assignee: 'Assignee 3',
    assigneeImage: 'assignee-image-3.jpg',
    provider: 'Provider 3',
    providerImage: 'provider-image-3.jpg',
    organization_name: 'Org 3',
    organizationImage: 'org-image-3.jpg',
    status: 'paid',
    paid: true,
    assignee_alias: 'Ednum'
  }
];

const unSortedMockBounties: Bounty[] = [
  {
    id: 1,
    bounty_id: 2,
    title: 'Bounty 1',
    date: '2023-01-02',
    bounty_created: '1672639200',
    paid_date: '2023-01-02',
    dtgp: 200,
    assignee: 'Assignee 2',
    assigneeImage: 'assignee-image-2.jpg',
    provider: 'Provider 2',
    providerImage: 'provider-image-2.jpg',
    organization_name: 'Org 2',
    organizationImage: 'org-image-2.jpg',
    status: 'paid',
    paid: false,
    assignee_alias: 'Ednum'
  },
  {
    id: 2,
    bounty_id: 1,
    title: 'Bounty 2',
    date: '2023-01-01',
    bounty_created: '1672552800',
    paid_date: '2023-01-01',
    dtgp: 100,
    assignee: '',
    assigneeImage: '',
    provider: 'Provider 1',
    providerImage: 'provider-image-1.jpg',
    organization_name: 'Org 1',
    organizationImage: 'org-image-1.jpg',
    paid: false,
    assignee_alias: 'Ednum',
    status: 'open'
  },
  {
    id: 3,
    bounty_id: 3,
    title: 'Bounty 3',
    date: '2023-01-03',
    bounty_created: '1672725600',
    paid_date: '2023-01-03',
    dtgp: 300,
    assignee: 'Assignee 3',
    assigneeImage: 'assignee-image-3.jpg',
    provider: 'Provider 3',
    providerImage: 'provider-image-3.jpg',
    organization_name: 'Org 3',
    organizationImage: 'org-image-3.jpg',
    status: 'assigned',
    paid: true,
    assignee_alias: 'Ednum'
  }
];

const MockStatusProps = {
  checkboxIdToSelectedMap: {
    Open: false,
    Assigned: false,
    Paid: false,
    Completed: false
  },
  onChangeStatus: jest.fn()
};

const MockTableProps: TableProps = {
  bounties: mockBounties,
  ...MockStatusProps,
  currentPage: defaultPage,
  clickApply: clickApply,
  totalBounties: totalBounties,
  paginationLimit: paginationLimit,
  activeTabs: activeTabs,
  setActiveTabs: setActiveTabs,
  onChangeFilterByDate: jest.fn()
};

describe('MyTable Component', () => {
  it('renders elements from TableProps in the document', () => {
    const { getByText } = render(<MyTable {...MockTableProps} headerIsFrozen={false} />);
    expect(getByText(mockBounties[0].title)).toBeInTheDocument();
  });

  it('renders "Sort By:" in the document', () => {
    const { getByText } = render(<MyTable {...MockTableProps} headerIsFrozen={false} />);
    expect(getByText('Sort By:')).toBeInTheDocument();
  });

  it('renders "Date" in the document', () => {
    const { getByText } = render(<MyTable {...MockTableProps} headerIsFrozen={false} />);
    expect(getByText('Date')).toBeInTheDocument();
  });

  it('renders "Assignee" in the document', () => {
    const { getByText } = render(<MyTable {...MockTableProps} headerIsFrozen={false} />);
    expect(getByText('Assignee')).toBeInTheDocument();
  });

  it('renders "Status" twice in the document', () => {
    const { getAllByText } = render(<MyTable {...MockTableProps} headerIsFrozen={false} />);
    expect(getAllByText(/Status/i)).toHaveLength(2);
  });

  it('renders "Status:" in the document', () => {
    const { getByText } = render(<MyTable {...MockTableProps} headerIsFrozen={false} />);
    expect(getByText('Status:')).toBeInTheDocument();
  });

  it('renders "Open" in the document', () => {
    const { getByText } = render(<MyTable {...MockTableProps} headerIsFrozen={false} />);
    fireEvent.click(getByText('Status:'));
    expect(getByText('Open')).toBeInTheDocument();
  });

  it('renders "Assigned" in the document', () => {
    const { getByText } = render(<MyTable {...MockTableProps} headerIsFrozen={false} />);
    fireEvent.click(getByText('Status:'));
    expect(getByText('Assigned')).toBeInTheDocument();
  });

  it('renders "Completed" in the document', () => {
    const { getByText } = render(<MyTable {...MockTableProps} headerIsFrozen={false} />);
    fireEvent.click(getByText('Status:'));
    expect(getByText('Completed')).toBeInTheDocument();
  });

  it('renders "Paid" in the document', () => {
    const { getByText } = render(<MyTable {...MockTableProps} headerIsFrozen={false} />);
    fireEvent.click(getByText('Status:'));
    expect(getByText('Paid')).toBeInTheDocument();
  });

  it('renders "Bounty" in the document', () => {
    const { getByText } = render(<MyTable {...MockTableProps} headerIsFrozen={false} />);
    expect(getByText('Bounty')).toBeInTheDocument();
  });

  it('renders "#DTGP" in the document', () => {
    const { getByText } = render(<MyTable {...MockTableProps} headerIsFrozen={false} />);
    expect(getByText('#DTGP')).toBeInTheDocument();
  });

  it('renders "Provider" in the document', () => {
    const { getByText } = render(<MyTable {...MockTableProps} headerIsFrozen={false} />);
    expect(getByText('Provider')).toBeInTheDocument();
  });

  it('renders "Organization" in the document', () => {
    const { getByText } = render(<MyTable {...MockTableProps} headerIsFrozen={false} />);
    expect(getByText('Organization')).toBeInTheDocument();
  });

  it('renders each element in the table in the document', () => {
    const { getByText } = render(<MyTable {...MockTableProps} headerIsFrozen={false} />);
    expect(getByText(mockBounties[0].title)).toBeInTheDocument();
  });

  it('renders each element in the table in the document', () => {
    const { getByText, getAllByText } = render(
      <MyTable {...MockTableProps} headerIsFrozen={false} />
    );
    const dates = ['2023-01-01', '2023-01-02', '2023-01-03'];
    const assignedText = getAllByText('assigned');
    expect(assignedText.length).toBe(1);
    expect(getByText('paid')).toBeInTheDocument();
    mockBounties.forEach((bounty: Bounty, index: number) => {
      expect(getByText(bounty.title)).toBeInTheDocument();
      expect(getByText(dates[index])).toBeInTheDocument();
      // expect(getByText(String(bounty.dtgp))).toBeInTheDocument();
      // expect(getByText(bounty.provider)).toBeInTheDocument();
      expect(getByText(bounty.organization_name)).toBeInTheDocument();
    });
  });

  it('should navigate to the correct URL when a bounty is clicked', () => {
    const history = createMemoryHistory();
    const { getByText } = render(
      <Router history={history}>
        <MyTable {...MockTableProps} />
      </Router>
    );
    const bountyTitle = getByText('Bounty 1');
    fireEvent.click(bountyTitle);
    // expect(history.location.pathname).toBe('/bounty/1');
  });

  it('renders correct color box for different bounty statuses', () => {
    const { getAllByTestId } = render(<MyTable {...MockTableProps} />);
    const statusElements = getAllByTestId('bounty-status');
    expect(statusElements[0]).toHaveStyle('background-color: #618aff');
    expect(statusElements[1]).toHaveStyle('background-color: #49C998');
    expect(statusElements[2]).toHaveStyle('background-color: #5F6368');
  });

  it('it renders with filter status states', async () => {
    const Wrapper = () => {
      return <MyTable {...MockTableProps} />;
    };
    const { getByText } = render(<Wrapper />);

    fireEvent.click(getByText('Status:'));
    await userEvent.click(getByText('Open'));
    const openText = getByText('Open');
    expect(openText).toBeInTheDocument();
  });

  it('renders pagination section when number of bounties is greater than page size', () => {
    // Create an array of bounties with a count greater than the page size
    const largeMockBounties = Array.from({ length: 25 }, () => ({
      id: 1,
      bounty_id: 1,
      title:
        'Return user to the same page they were on before they edited a bounty user to the same page they were on before.',
      date: '2021.01.01',
      bounty_created: '2023-10-04T14:58:50.441223Z',
      paid_date: '2023-10-04T14:58:50.441223Z',
      dtgp: 1,
      assignee: '035f22835fbf55cf4e6823447c63df74012d1d587ed60ef7cbfa3e430278c44cce',
      assigneeImage:
        'https://avatars.githubusercontent.com/u/10001?s=460&u=8c61f1cda5e9e2c2d1d5b8d2a5a8a5b8d2a5a8a5&v=4',
      provider:
        '035f22835fbf55cf4e6823447c63df74012d1d587ed60ef7cbfa3e430278c44cce:03a6ea2d9ead2120b12bd66292bb4a302c756983dc45dcb2b364b461c66fd53bcb:1099517001729',
      providerImage:
        'https://avatars.githubusercontent.com/u/10001?s=460&u=8c61f1cda5e9e2c2d1d5b8d2a5a8a5b8d2a5a8a5&v=4',
      organization_name: 'OrganizationName',
      organizationImage:
        'https://avatars.githubusercontent.com/u/10001?s=460&u=8c61f1cda5e9e2c2d1d5b8d2a5a8a5b8d2a5a8a5&v=4',
      status: 'open',
      paid: false,
      assignee_alias: ''
    }));

    render(
      <MyTable
        bounties={largeMockBounties}
        headerIsFrozen={false}
        startDate={moment().subtract(7, 'days').startOf('day').unix()}
        endDate={moment().startOf('day').unix()}
        clickApply={clickApply}
        currentPage={defaultPage}
        totalBounties={totalBounties}
        paginationLimit={paginationLimit}
        activeTabs={activeTabs}
        setActiveTabs={setActiveTabs}
        {...MockStatusProps}
      />
    );

    (async () => {
      await waitFor(() => {
        const paginationSection = screen.getByRole('pagination');
        expect(paginationSection).toBeInTheDocument();

        // Optionally, you can also check if pagination arrows are present
        const paginationArrowPrev = screen.getByAltText('pagination arrow 1');
        const paginationArrowNext = screen.getByAltText('pagination arrow 2');
        expect(paginationArrowPrev).toBeInTheDocument();
        expect(paginationArrowNext).toBeInTheDocument();
      });
    })();
  });

  const mockProps = {
    bounties: Array.from({ length: 25 }, () => ({
      id: 1,
      bounty_id: 1,
      title:
        'Return user to the same page they were on before they edited a bounty user to the same page they were on before.',
      date: '2021.01.01',
      bounty_created: '2023-10-04T14:58:50.441223Z',
      paid_date: '2023-10-04T14:58:50.441223Z',
      dtgp: 1,
      assignee: '035f22835fbf55cf4e6823447c63df74012d1d587ed60ef7cbfa3e430278c44cce',
      assigneeImage:
        'https://avatars.githubusercontent.com/u/10001?s=460&u=8c61f1cda5e9e2c2d1d5b8d2a5a8a5b8d2a5a8a5&v=4',
      provider:
        '035f22835fbf55cf4e6823447c63df74012d1d587ed60ef7cbfa3e430278c44cce:03a6ea2d9ead2120b12bd66292bb4a302c756983dc45dcb2b364b461c66fd53bcb:1099517001729',
      providerImage:
        'https://avatars.githubusercontent.com/u/10001?s=460&u=8c61f1cda5e9e2c2d1d5b8d2a5a8a5b8d2a5a8a5&v=4',
      organization_name: 'OrganizationName',
      organizationImage:
        'https://avatars.githubusercontent.com/u/10001?s=460&u=8c61f1cda5e9e2c2d1d5b8d2a5a8a5b8d2a5a8a5&v=4',
      status: 'open',
      assignee_alias: '',
      paid: false
    })),
    startDate: moment().subtract(7, 'days').startOf('day').unix(),
    endDate: moment().startOf('day').unix(),
    headerIsFrozen: false,
    ...MockStatusProps,
    paginatePrev: jest.fn(),
    paginateNext: jest.fn()
  };
  it('renders pagination arrows when bounties length is greater than pageSize and status filter is set to "open"', async () => {
    render(
      <MyTable
        {...mockProps}
        currentPage={defaultPage}
        totalBounties={totalBounties}
        clickApply={clickApply}
        paginationLimit={paginationLimit}
        activeTabs={activeTabs}
        setActiveTabs={setActiveTabs}
      />
    );

    (async () => {
      await waitFor(() => {
        const paginationArrow1 = screen.getByAltText('pagination arrow 1');
        const paginationArrow2 = screen.getByAltText('pagination arrow 2');

        expect(paginationArrow1).toBeInTheDocument();
        expect(paginationArrow2).toBeInTheDocument();
      });
    })();
  });

  it('calls paginateNext when next pagination arrow is clicked with status filter set to "in-progress"', async () => {
    const inProgressProps = {
      ...mockProps,
      checkboxIdToSelectedMap: {
        Open: false,
        Assigned: true,
        Paid: false,
        Completed: false
      }
    };
    render(
      <MyTable
        {...inProgressProps}
        currentPage={defaultPage}
        totalBounties={totalBounties}
        clickApply={clickApply}
        paginationLimit={paginationLimit}
        activeTabs={activeTabs}
        setActiveTabs={setActiveTabs}
      />
    );

    (async () => {
      await waitFor(() => {
        const myTableInstance = screen.getByRole('pagination');
        const { paginateNext }: { paginateNext: any } = myTableInstance as any;
        const paginationArrow2 = screen.getByAltText('pagination arrow 2');
        fireEvent.click(paginationArrow2);

        expect(paginateNext).toHaveBeenCalled();
      });
    })();
  });

  //Leaved in comments for futures tests

  /* it('renders bounties with Open status when "Open" filter is selected', async () => {
    const Wrapper = () => {
      return <MyTable {...MockTableProps} />;
    };
    const { getByText, getAllByText } = render(<Wrapper />);

    fireEvent.click(getByText('Status:'));
    userEvent.click(getByText('Open'));

    expect(MockStatusProps.onChangeStatus).toHaveBeenCalledWith('Open');

    const openText = getByText('Open');
    expect(openText).toBeInTheDocument();

    const openBounties = getAllByText('open');
    expect(openBounties.length).toBe(1);
  });

  it('renders bounties with Assigned status when "Assigned" filter is selected', async () => {
    const Wrapper = () => {
      return <MyTable {...MockTableProps} />;
    };
    const { getByText, getAllByText } = render(<Wrapper />);

    fireEvent.click(getByText('Status:'));
    userEvent.click(getByText('Assigned'));

    expect(MockStatusProps.onChangeStatus).toHaveBeenCalledWith('Assigned');

    const assignedText = getByText('Assigned');
    expect(assignedText).toBeInTheDocument();

    const assignedBounties = getAllByText('assigned');
    expect(assignedBounties.length).toBe(1);
  });

  it('renders bounties with Paid status when "Paid" filter is selected', async () => {
    const Wrapper = () => {
      return <MyTable {...MockTableProps} />;
    };
    const { getByText, getAllByText } = render(<Wrapper />);

    fireEvent.click(getByText('Status:'));
    userEvent.click(getByText('Paid'));

    expect(MockStatusProps.onChangeStatus).toHaveBeenCalledWith('Paid');

    const paidText = getByText('Paid');
    expect(paidText).toBeInTheDocument();

    const paidBounties = getAllByText('paid');
    expect(paidBounties.length).toBe(1);
  }); */

  it('simulates filtering bounties by status: open, assigned, paid', async () => {
    let filteredBounties = unSortedMockBounties.filter((bounty: any) => bounty.status === 'open');
    const { rerender } = render(<MyTable {...MockTableProps} bounties={filteredBounties} />);

    fireEvent.click(screen.getByText('Status:'));
    userEvent.click(screen.getByText('Open'));
    expect(MockStatusProps.onChangeStatus).toHaveBeenCalledWith('Open');
    expect(screen.getByText('Bounty 2')).toBeInTheDocument(); // 'Bounty 2' is an "Open" bounty
    expect(screen.queryByText('Bounty 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Bounty 3')).not.toBeInTheDocument();

    filteredBounties = unSortedMockBounties.filter((bounty: any) => bounty.status === 'assigned');
    rerender(<MyTable {...MockTableProps} bounties={filteredBounties} />);
    fireEvent.click(screen.getByText('Status:'));
    userEvent.click(screen.getByText('Assigned'));
    expect(MockStatusProps.onChangeStatus).toHaveBeenCalledWith('Assigned');
    expect(screen.getByText('Bounty 3')).toBeInTheDocument(); // 'Bounty 3' is an "Assigned" bounty
    expect(screen.queryByText('Bounty 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Bounty 2')).not.toBeInTheDocument();

    filteredBounties = unSortedMockBounties.filter((bounty: any) => bounty.status === 'paid');
    rerender(<MyTable {...MockTableProps} bounties={filteredBounties} />);
    fireEvent.click(screen.getByText('Status:'));
    userEvent.click(screen.getByText('Paid'));
    expect(MockStatusProps.onChangeStatus).toHaveBeenCalledWith('Paid');
    expect(screen.getByText('Bounty 1')).toBeInTheDocument(); // 'Bounty 1' is a "Paid" bounty
    expect(screen.queryByText('Bounty 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Bounty 3')).not.toBeInTheDocument();
  });

  it('sorts the bounties according to admin select Newest', async () => {
    const unsortedBounties = [...unSortedMockBounties].reverse();
    render(
      <MyTable
        {...MockTableProps}
        bounties={unsortedBounties}
        onChangeFilterByDate={onChangeFilterByDateMock}
      />
    );

    fireEvent.click(screen.getByText('Sort By:'));
    fireEvent.click(screen.getByText('Newest'));
    await waitFor(() => {
      expect(onChangeFilterByDateMock).toHaveBeenCalledWith('desc');
    });

    await waitFor(() => {
      const displayedBounties = screen
        .getAllByTestId('bounty-date')
        .map((node: any) => node.textContent);

      const sortedDatesDesc = unsortedBounties.map((bounty: any) => bounty.date);
      expect(displayedBounties).toEqual(sortedDatesDesc);
    });
  });

  it('sorts the bounties according to admin select Oldest', async () => {
    render(<MyTable {...MockTableProps} onChangeFilterByDate={onChangeFilterByDateMock} />);

    fireEvent.click(screen.getByText('Sort By:'));
    const oldestButtons = screen.getAllByText('Oldest');
    fireEvent.click(oldestButtons[1]);
    await waitFor(() => {
      expect(onChangeFilterByDateMock).toHaveBeenCalledWith('asc');
    });

    await waitFor(() => {
      const displayedBounties = screen
        .getAllByTestId('bounty-date')
        .map((node: any) => node.textContent);

      const sortedDatesAsc = [...unSortedMockBounties]
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((bounty: any) => bounty.date);

      expect(displayedBounties).toEqual(
        sortedDatesAsc.map((date: any) => expect.stringContaining(date))
      );
    });
  });

  it('renders bounties in the order: open, assigned, paid', async () => {
    let filteredBounties = unSortedMockBounties.filter((bounty: any) => bounty.status === 'open');
    const { rerender } = render(<MyTable {...MockTableProps} bounties={filteredBounties} />);

    fireEvent.click(screen.getByText('Status:'));
    userEvent.click(screen.getByText('Open'));
    expect(MockStatusProps.onChangeStatus).toHaveBeenCalledWith('Open');
    expect(screen.getByText('Bounty 2')).toBeInTheDocument(); // 'Bounty 2' is an "Open" bounty
    expect(screen.queryByText('Bounty 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Bounty 3')).not.toBeInTheDocument();

    filteredBounties = unSortedMockBounties.filter((bounty: any) => bounty.status === 'assigned');
    rerender(<MyTable {...MockTableProps} bounties={filteredBounties} />);
    fireEvent.click(screen.getByText('Status:'));
    userEvent.click(screen.getByText('Assigned'));
    expect(MockStatusProps.onChangeStatus).toHaveBeenCalledWith('Assigned');
    expect(screen.getByText('Bounty 3')).toBeInTheDocument(); // 'Bounty 3' is an "Assigned" bounty
    expect(screen.queryByText('Bounty 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Bounty 2')).not.toBeInTheDocument();

    filteredBounties = unSortedMockBounties.filter((bounty: any) => bounty.status === 'paid');
    rerender(<MyTable {...MockTableProps} bounties={filteredBounties} />);
    fireEvent.click(screen.getByText('Status:'));
    userEvent.click(screen.getByText('Paid'));
    expect(MockStatusProps.onChangeStatus).toHaveBeenCalledWith('Paid');
    expect(screen.getByText('Bounty 1')).toBeInTheDocument(); // 'Bounty 1' is a "Paid" bounty
    expect(screen.queryByText('Bounty 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Bounty 3')).not.toBeInTheDocument();
  });

  it('filter by Open bounties after click apply', async () => {
    render(<MyTable {...MockTableProps} />);

    fireEvent.click(screen.getByText('Status:'));

    userEvent.click(screen.getByText('Open'));

    fireEvent.click(screen.getByText('Apply'));

    waitFor(() => {
      expect(screen.getByText('Bounty 2')).toBeInTheDocument();
    });
  });

  it('filter by Paid bounties after click apply', async () => {
    render(<MyTable {...MockTableProps} />);

    fireEvent.click(screen.getByText('Status:'));

    userEvent.click(screen.getByText('Paid'));

    fireEvent.click(screen.getByText('Apply'));

    waitFor(() => {
      expect(screen.getByText('Bounty 1')).toBeInTheDocument();
    });
  });

  it('filter by Assigned bounties after click apply', async () => {
    render(<MyTable {...MockTableProps} />);

    fireEvent.click(screen.getByText('Status:'));

    userEvent.click(screen.getByText('Assigned'));

    fireEvent.click(screen.getByText('Apply'));

    waitFor(() => {
      expect(screen.getByText('Bounty 3')).toBeInTheDocument();
    });
  });
});
