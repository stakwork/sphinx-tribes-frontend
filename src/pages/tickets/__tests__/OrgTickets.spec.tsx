import '@testing-library/jest-dom';
import { act, fireEvent, screen, render } from '@testing-library/react';
import { person } from '__test__/__mockData__/persons';
import { setupStore } from '__test__/__mockData__/setupStore';
import { mockUsehistory } from '__test__/__mockFn__/useHistory';
import mockBounties, { createdBounty } from 'bounties/__mock__/mockBounties.data';
import React from 'react';
import { MemoryRouter, Route } from 'react-router-dom';
import { mainStore } from 'store/main';
import { useStores } from 'store/index.tsx';
import { usePerson } from 'hooks/index.ts';
import { OrgTicketsPage } from '../org/index';

beforeAll(() => {
  setupStore();
  mockUsehistory();
});

jest.mock('remark-gfm', () => null);

jest.mock('rehype-raw', () => null);

jest.mock('hooks', () => ({
  ...jest.requireActual('hooks'),
  usePerson: jest.fn()
}));

jest.mock('store', () => ({
  ...jest.requireActual('store'),
  useStores: jest.fn()
}));

describe('OrgTicketsPage Component', () => {
  test('Test that post a bounty button, auto populates newer bounties on org bounty page', async () => {
    const orgBounty = { ...createdBounty, body: {} } as any;
    orgBounty.body = {
      ...orgBounty.bounty,
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
        getSpecificOrganizationBounties: jest.fn(() => [orgBounty]),
        getTribesByOwner: jest.fn(),
        getTotalOrgBounties: jest.fn(() => 1)
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        }
      }
    });

    jest
      .spyOn(mainStore, 'getSpecificOrganizationBounties')
      .mockReturnValue(Promise.resolve(orgBounty));
    jest.spyOn(mainStore, 'getTotalOrgBounties').mockReturnValue(Promise.resolve(1));
    act(async () => {
      const { getByText } = render(
        <MemoryRouter initialEntries={['/org/bounties/random_org_uuid']}>
          <Route path="/org/bounties/random_org_uuid" component={OrgTicketsPage} />
        </MemoryRouter>
      );
      const PostBountyButton = await screen.findByRole('button', { name: /Post a Bounty/i });
      expect(PostBountyButton).toBeInTheDocument();
      fireEvent.click(PostBountyButton);
      const StartButton = await screen.findByRole('button', { name: /Start/i });
      expect(StartButton).toBeInTheDocument();
      const bountyTitleInput = await screen.findByRole('input', { name: /Bounty Title /i });
      expect(bountyTitleInput).toBeInTheDocument();
      fireEvent.change(bountyTitleInput, { target: { value: 'new bounty title' } });
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
      expect(getByText(orgBounty.body.title)).toBeInTheDocument();
      expect(getByText('new bounty title')).toBeInTheDocument();
    });
  });

  test(' Test that org bounties are scrollable on org home page', async () => {
    const createdMockBounties = Array.from({ length: 20 }, (_: any, index: number) => ({
      ...(mockBounties[0] || {}),
      bounty: {
        ...(mockBounties[0]?.bounty || {}),
        id: mockBounties[0]?.bounty?.id + index + 1
      }
    }));

    const orgBounties = createdMockBounties.map((bounty: any, index: number) => ({
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
        getSpecificOrganizationBounties: jest.fn(() => [orgBounties]),
        getTribesByOwner: jest.fn(),
        getTotalOrgBounties: jest.fn(() => 20)
      },
      ui: {
        selectedPerson: '123',
        meInfo: {
          owner_alias: 'test'
        }
      }
    });

    jest
      .spyOn(mainStore, 'getSpecificOrganizationBounties')
      .mockReturnValue(Promise.resolve(orgBounties));
    jest.spyOn(mainStore, 'getTotalOrgBounties').mockReturnValue(Promise.resolve(20));
    async () => {
      const { getByText } = render(
        <MemoryRouter initialEntries={['/org/bounties/random_org_uuid']}>
          <Route path="/org/bounties/random_org_uuid" component={OrgTicketsPage} />
        </MemoryRouter>
      );

      fireEvent.scroll(window, { target: { scrollY: 1000 } });

      expect(getByText('Load More')).toBeInTheDocument();
    };
  });
});
