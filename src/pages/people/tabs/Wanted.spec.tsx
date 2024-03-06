import '@testing-library/jest-dom';
import { act, fireEvent, screen, render, waitFor, within, queries } from '@testing-library/react';
import { person } from '__test__/__mockData__/persons';
import { setupStore } from '__test__/__mockData__/setupStore';
import { user } from '__test__/__mockData__/user';
import { mockUsehistory } from '__test__/__mockFn__/useHistory';
import mockBounties, { createdBounty } from 'bounties/__mock__/mockBounties.data';
import nock from 'nock';
import React from 'react';
import { MemoryRouter, Route } from 'react-router-dom';
import { mainStore } from 'store/main';
import { useStores } from '../../../store';
import { usePerson } from '../../../hooks';
import { Wanted } from './Wanted.tsx';

beforeAll(() => {
  nock.disableNetConnect();
  setupStore();
  mockUsehistory();
});

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock('remark-gfm', () => {});

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock('rehype-raw', () => {});

jest.mock('hooks', () => ({
  ...jest.requireActual('hooks'),
  usePerson: jest.fn()
}));

jest.mock('store', () => ({
  ...jest.requireActual('store'),
  useStores: jest.fn()
}));

describe('Wanted Component', () => {
  nock(user.url).get('/person/id/1').reply(200, { user });
  nock(user.url).get('/ask').reply(200, {});

  test('Should call getPersonCreatedBounties when the component is mounted', async () => {
    const userBounty = { ...mockBounties[0], body: {} } as any;
    userBounty.body = {
      ...userBounty.bounty,
      owner_id: person.owner_pubkey,
      title: 'test bounty here',
      description: 'custom ticket for testing'
    };

    (usePerson as jest.Mock).mockImplementation(() => ({
      person: {},
      canEdit: false
    }));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties: jest.fn(() => [userBounty])
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        }
      }
    });

    const mockedPersonAssignedBounites = jest
      .spyOn(mainStore, 'getPersonCreatedBounties')
      .mockReturnValue(Promise.resolve([userBounty]));
    act(async () => {
      const { getAllByTestId } = render(
        <MemoryRouter initialEntries={['/p/1234/bounties']}>
          <Route path="/p/:uuid/bounties" component={Wanted} />
        </MemoryRouter>
      );
      await waitFor(() => getAllByTestId('user-created-bounty'));
      expect(mockedPersonAssignedBounites).toBeCalled();
    });
  });

  test('Should render correct number of bounties created by the user', async () => {
    const createdMockBounties = Array.from({ length: 15 }, (_: any, index: number) => ({
      ...(mockBounties[0] || {}),
      bounty: {
        ...(mockBounties[0]?.bounty || {}),
        id: mockBounties[0]?.bounty?.id + index + 1
      }
    }));

    const userBounties = createdMockBounties.map((bounty: any, index: number) => ({
      ...bounty,
      body: {
        ...bounty.bounty,
        owner_id: person.owner_pubkey,
        title: `test bounty here ${index}`
      }
    })) as any;

    (usePerson as jest.Mock).mockImplementation(() => ({
      person: {},
      canEdit: false
    }));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties: jest.fn(() => [userBounties])
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        }
      }
    });

    const mockedPersonAssignedBounites = jest
      .spyOn(mainStore, 'getPersonCreatedBounties')
      .mockReturnValue(Promise.resolve(userBounties));
    act(async () => {
      const { getAllByTestId } = render(
        <MemoryRouter initialEntries={['/p/1234/bounties']}>
          <Route path="/p/:uuid/bounties" component={Wanted} />
        </MemoryRouter>
      );

      await waitFor(() => getAllByTestId('user-created-bounty'));
      expect(mockedPersonAssignedBounites).toBeCalled();
      expect(getAllByTestId('user-created-bounty').length).toBe(15);
    });
  });

  test('Each bounty should be visible on UI', async () => {
    const createdMockBounties = Array.from({ length: 15 }, (_: any, index: number) => ({
      ...(mockBounties[0] || {}),
      bounty: {
        ...(mockBounties[0]?.bounty || {}),
        id: mockBounties[0]?.bounty?.id + index + 1
      }
    })) as any;

    const userBounties = createdMockBounties.map((bounty: any, index: number) => ({
      ...bounty,
      body: {
        ...bounty.bounty,
        owner_id: person.owner_pubkey,
        title: `test bounty here ${index}`
      }
    }));

    (usePerson as jest.Mock).mockImplementation(() => ({
      person: {},
      canEdit: false
    }));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties: jest.fn(() => [userBounties])
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        }
      }
    });

    jest
      .spyOn(mainStore, 'getPersonCreatedBounties')
      .mockReturnValue(Promise.resolve(userBounties));
    act(async () => {
      const { getByText } = render(
        <MemoryRouter initialEntries={['/p/1234/bounties']}>
          <Route path="/p/:uuid/bounties" component={Wanted} />
        </MemoryRouter>
      );

      await waitFor(() => getByText(userBounties[0].body.title));

      for (const bounty of userBounties) {
        expect(getByText(bounty.body.title)).toBeInTheDocument();
      }
    });
  });

  test('should redirect to bounty page when bounty card is clicked', async () => {
    const mockPush = jest.fn();

    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useHistory: () => ({
        push: mockPush,
        replace: mockPush
      })
    }));

    const userBounty = { ...mockBounties[0], body: {} } as any;
    userBounty.body = {
      ...userBounty.bounty,
      owner_id: person.owner_pubkey,
      title: 'test bounty here',
      description: 'custom ticket for testing'
    };

    (usePerson as jest.Mock).mockImplementation(() => ({
      person: {},
      canEdit: false
    }));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties: jest.fn(() => [userBounty])
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        }
      }
    });

    jest
      .spyOn(mainStore, 'getPersonCreatedBounties')
      .mockReturnValue(Promise.resolve([userBounty]));
    act(async () => {
      const { getAllByTestId } = render(
        <MemoryRouter initialEntries={['/p/1234/bounties']}>
          <Route path="/p/:uuid/bounties" component={Wanted} />
        </MemoryRouter>
      );

      await waitFor(() => getAllByTestId('user-created-bounty'));
      getAllByTestId('user-created-bounty')[0].click();
      expect(getAllByTestId('user-created-bounty').length).toBe(1);
      expect(getAllByTestId('user-created-bounty')[0].getAttribute('href')).toEqual(
        `/p/1234/wanted/${userBounty.body.id}/0`
      );
    });
  });

  test('should render status assigned if ticket is assigned', async () => {
    const userBounty = { ...createdBounty, body: {} } as any;
    userBounty.body = {
      ...userBounty.bounty,
      owner_id: person.owner_pubkey,
      title: 'test bounty here',
      description: 'custom ticket for testing'
    };

    (usePerson as jest.Mock).mockImplementation(() => ({
      person: {},
      canEdit: false
    }));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties: jest.fn(() => [userBounty])
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        }
      }
    });

    jest
      .spyOn(mainStore, 'getPersonCreatedBounties')
      .mockReturnValue(Promise.resolve([userBounty]));
    act(async () => {
      const { getAllByTestId } = render(
        <MemoryRouter initialEntries={['/p/1234/bounties']}>
          <Route path="/p/:uuid/bounties" component={Wanted} />
        </MemoryRouter>
      );

      await waitFor(() => getAllByTestId('user-created-bounty'));
      getAllByTestId('user-created-bounty')[0].click();
      expect(getAllByTestId('user-created-bounty').length).toBe(1);
      within(within(getAllByTestId('user-created-bounty')[0]).getByTestId('status-pill')).getByText(
        'Paid'
      );
    });
  });

  test('Should render load more button if have more bounties', async () => {
    const createdMockBounties = Array.from({ length: 20 }, (_: any, index: number) => ({
      ...(mockBounties[0] || {}),
      bounty: {
        ...(mockBounties[0]?.bounty || {}),
        id: mockBounties[0]?.bounty?.id + index + 1
      }
    }));

    const userBounties = createdMockBounties.map((bounty: any, index: number) => ({
      ...bounty,
      body: {
        ...bounty.bounty,
        owner_id: person.owner_pubkey,
        title: `test bounty here ${index}`
      }
    })) as any;

    (usePerson as jest.Mock).mockImplementation(() => ({
      person: {},
      canEdit: false
    }));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties: jest.fn(() => [userBounties])
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        }
      }
    });

    jest
      .spyOn(mainStore, 'getPersonCreatedBounties')
      .mockReturnValue(Promise.resolve(userBounties));
    act(async () => {
      const { getByText, getAllByTestId } = render(
        <MemoryRouter initialEntries={['/p/1234/bounties']}>
          <Route path="/p/:uuid/bounties" component={Wanted} />
        </MemoryRouter>
      );
      await waitFor(() => getAllByTestId('user-created-bounty'));
      fireEvent.scroll(window, { target: { scrollY: 1000 } });

      expect(getByText('Load More')).toBeInTheDocument();
    });
  });

  test('Should render correct message if no bounties are assigned', async () => {
    (usePerson as jest.Mock).mockImplementation(() => ({
      person: {},
      canEdit: false
    }));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties: jest.fn(() => []),
        dropDownOrganizations: []
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        }
      }
    });
    jest.spyOn(mainStore, 'getPersonCreatedBounties').mockReturnValue(Promise.resolve([]));
    act(async () => {
      const { getByText } = render(
        <MemoryRouter initialEntries={['/p/1234/bounties']}>
          <Route path="/p/:uuid/bounties" component={Wanted} />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(getByText('No Tickets Yet')).toBeInTheDocument();
      });
    });
  });

  test('when click on post a bounty button should flow through the process', async () => {
    const userBounty = { ...createdBounty, body: {} } as any;
    userBounty.body = {
      ...userBounty.bounty,
      owner_id: person.owner_pubkey,
      title: 'new text',
      description: 'new text'
    };

    (usePerson as jest.Mock).mockImplementation(() => ({
      person: {},
      canEdit: true
    }));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties: jest.fn(() => [userBounty])
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        }
      }
    });

    jest
      .spyOn(mainStore, 'getPersonCreatedBounties')
      .mockReturnValue(Promise.resolve([userBounty]));
    act(async () => {
      const { getByText } = render(
        <MemoryRouter initialEntries={['/p/1234/bounties']}>
          <Route path="/p/:uuid/bounties" component={Wanted} />
        </MemoryRouter>
      );
      const PostBountyButton = await screen.findByRole('button', { name: /Post a Bounty/i });
      expect(PostBountyButton).toBeInTheDocument();
      fireEvent.click(PostBountyButton);
      const StartButton = await screen.findByRole('button', { name: /Start/i });
      expect(StartButton).toBeInTheDocument();
      const bountyTitleInput = await screen.findByRole('input', { name: /Bounty Title /i });
      expect(bountyTitleInput).toBeInTheDocument();
      fireEvent.change(bountyTitleInput, { target: { value: 'new text' } });
      const dropdown = screen.getByText(/Category /i); // Adjust based on your dropdown implementation
      fireEvent.click(dropdown);
      const desiredOption = screen.getByText(/Web Development/i); // Adjust based on your desired option
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
      fireEvent.change(SatInput, { target: { value: 1 } });
      const NextButton3 = await screen.findByRole('button', { name: /Next/i });
      expect(NextButton3).toBeInTheDocument();
      fireEvent.click(NextButton3);
      const DecideLaterButton = await screen.findByRole('button', { name: /Decide Later/i });
      expect(DecideLaterButton).toBeInTheDocument();
      fireEvent.click(DecideLaterButton);
      const FinishButton = await screen.findByRole('button', { name: /Finish/i });
      expect(FinishButton).toBeInTheDocument();
      fireEvent.click(FinishButton);
      expect(getByText(userBounty.body.title)).toBeInTheDocument();
    });
  });

  test('Should show loading image first and then show correct message if no bounties are assigned', async () => {
    (usePerson as jest.Mock).mockImplementation(() => ({
      person: {},
      canEdit: false
    }));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties: jest.fn(() => []),
        dropDownOrganizations: []
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        }
      }
    });
    jest.spyOn(mainStore, 'getPersonCreatedBounties').mockReturnValue(Promise.resolve([]));

    act(async () => {
      const { getByText, getByTestId } = render(
        <MemoryRouter initialEntries={['/p/1234/bounties']}>
          <Route path="/p/:uuid/bounties" component={Wanted} />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(getByTestId('loading-spinner')).toBeInTheDocument();
        expect(getByText('No Tickets Yet')).toBeInTheDocument();
        expect(getByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });
  });

  test('bounties are displayed if there are bounties instead of defualt image', async () => {
    const createdMockBounties = Array.from({ length: 15 }, (_: any, index: number) => ({
      ...(mockBounties[0] || {}),
      bounty: {
        ...(mockBounties[0]?.bounty || {}),
        id: mockBounties[0]?.bounty?.id + index + 1
      }
    })) as any;

    const userBounties = createdMockBounties.map((bounty: any, index: number) => ({
      ...bounty,
      body: {
        ...bounty.bounty,
        owner_id: person.owner_pubkey,
        title: `test bounty here ${index}`
      }
    }));

    (usePerson as jest.Mock).mockImplementation(() => ({
      person: {},
      canEdit: false
    }));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties: jest.fn(() => [userBounties])
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        }
      }
    });

    jest
      .spyOn(mainStore, 'getPersonCreatedBounties')
      .mockReturnValue(Promise.resolve(userBounties));
    act(async () => {
      const { getByText, getByTestId } = render(
        <MemoryRouter initialEntries={['/p/1234/bounties']}>
          <Route path="/p/:uuid/bounties" component={Wanted} />
        </MemoryRouter>
      );

      await waitFor(() => getByText(userBounties[0].body.title));

      for (const bounty of userBounties) {
        expect(getByTestId('loading-spinner')).toBeInTheDocument();
        expect(getByText('No Tickets Yet')).not.toBeInTheDocument();
        expect(getByText(bounty.body.title)).toBeInTheDocument();
        expect(getByTestId('loading-spinner')).not.toBeInTheDocument();
      }
    });
  });

  test('Test that org bounties are scrollable on org home page', async () => {
    const createdMockBounties = Array.from({ length: 30 }, (_: any, index: number) => ({
      ...(mockBounties[0] || {}),
      bounty: {
        ...(mockBounties[0]?.bounty || {}),
        id: mockBounties[0]?.bounty?.id + index + 1
      }
    }));

    const userBounties = createdMockBounties.map((bounty: any, index: number) => ({
      ...bounty,
      body: {
        ...bounty.bounty,
        owner_id: person.owner_pubkey,
        title: `This is a test bounty ${index}`
      }
    })) as any;

    (usePerson as jest.Mock).mockImplementation(() => ({
      person: {},
      canEdit: true
    }));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties: jest.fn(() => [userBounties])
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        }
      }
    });

    jest
      .spyOn(mainStore, 'getPersonCreatedBounties')
      .mockReturnValue(Promise.resolve(userBounties));
    act(async () => {
      const { getByText, getAllByTestId } = render(
        <MemoryRouter initialEntries={['/p/1234/bounties']}>
          <Route path="/p/:uuid/bounties" component={Wanted} />
        </MemoryRouter>
      );
      await waitFor(() => getAllByTestId('user-created-bounty'));
      fireEvent.scroll(window, { target: { scrollY: 1000 } });

      expect(getByText('Load More')).toBeInTheDocument();
    });
  });

  test('Test that post a bounty button, auto populates newer bounties on org bounty page and bounties section on profile', async () => {
    const userBounty = { ...createdBounty, body: {} } as any;
    userBounty.body = {
      ...userBounty.bounty,
      owner_id: person.owner_pubkey,
      title: 'new test',
      description: 'this is a new test'
    };

    const createdMockBounties = Array.from({ length: 1 }, (_: any, index: number) => ({
      ...(mockBounties[0] || {}),
      bounty: {
        ...(mockBounties[0]?.bounty || {}),
        id: mockBounties[0]?.bounty?.id + index + 1
      }
    }));

    const userBounties = createdMockBounties.map((bounty: any, index: number) => ({
      ...bounty,
      body: {
        ...bounty.bounty,
        owner_id: person.owner_pubkey,
        title: `This is a test bounty ${index}`
      }
    })) as any;

    (usePerson as jest.Mock).mockImplementation(() => ({
      person: {},
      canEdit: true
    }));

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPersonCreatedBounties: jest.fn(() => [userBounties])
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        }
      }
    });

    jest
      .spyOn(mainStore, 'getPersonCreatedBounties')
      .mockReturnValue(Promise.resolve(userBounties));
    act(async () => {
      render(
        <MemoryRouter initialEntries={['/p/1234/bounties']}>
          <Route path="/p/:uuid/bounties" component={Wanted} />
        </MemoryRouter>
      );

      await waitFor(() => expect(mainStore.getPersonCreatedBounties()).toHaveBeenCalled());

      const postBountyButton = screen.getByText('Post a Bounty');
      fireEvent.click(postBountyButton);

      const PostBountyButton = await screen.findByRole('button', { name: /Post a Bounty/i });
      expect(PostBountyButton).toBeInTheDocument();
      fireEvent.click(PostBountyButton);
      const StartButton = await screen.findByRole('button', { name: /Start/i });
      expect(StartButton).toBeInTheDocument();
      const bountyTitleInput = await screen.findByRole('input', { name: /Bounty Title /i });
      expect(bountyTitleInput).toBeInTheDocument();
      fireEvent.change(bountyTitleInput, { target: { value: 'new text' } });
      const dropdown = screen.getByText(/Category /i); // Adjust based on your dropdown implementation
      fireEvent.click(dropdown);
      const desiredOption = screen.getByText(/Web Development/i); // Adjust based on your desired option
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
      fireEvent.change(SatInput, { target: { value: 1 } });
      const NextButton3 = await screen.findByRole('button', { name: /Next/i });
      expect(NextButton3).toBeInTheDocument();
      fireEvent.click(NextButton3);
      const DecideLaterButton = await screen.findByRole('button', { name: /Decide Later/i });
      expect(DecideLaterButton).toBeInTheDocument();
      fireEvent.click(DecideLaterButton);
      const FinishButton = await screen.findByRole('button', { name: /Finish/i });
      expect(FinishButton).toBeInTheDocument();
      fireEvent.click(FinishButton);
      expect(screen.getByText(userBounty.body.title)).toBeInTheDocument();

      await waitFor(() => expect(screen.queryByText('new test')).toBeInTheDocument());
    });
  });
});
