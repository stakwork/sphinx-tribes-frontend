import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CodingBountiesProps } from 'people/interfaces';
import React, { useState } from 'react';
import NameTag from 'people/utils/NameTag';
import { uiStore } from 'store/ui';
import { user } from '__test__/__mockData__/user';
import userEvent from '@testing-library/user-event';
import { mainStore } from 'store/main';
import MobileView from '../CodingBounty';

describe('MobileView component', () => {
  beforeEach(() => {
    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null
    });
    window.IntersectionObserver = mockIntersectionObserver;
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  const defaultProps: CodingBountiesProps = {
    deliverables: 'Default Deliverables',
    description: 'Default Description',
    titleString: 'Default Title',
    nametag: <></>,
    labels: [],
    person: {
      owner_pubkey: 'DefaultOwnerPubKey',
      owner_route_hint: 'DefaultRouteHint',
      owner_alias: 'DefaultOwnerAlias'
    } as any,
    setIsPaidStatusPopOver: jest.fn(),
    creatorStep: 1,
    paid: false,
    tribe: 'Default Tribe',
    saving: 'false',
    isPaidStatusPopOver: false,
    isPaidStatusBadgeInfo: false,
    awardDetails: {
      name: 'Default Award'
    },
    isAssigned: false,
    dataValue: { a: 'a' },
    assigneeValue: false,
    assignedPerson: {
      owner_pubkey: 'DefaultOwnerPubKey',
      owner_route_hint: 'DefaultRouteHint',
      owner_alias: 'DefaultOwnerAlias'
    } as any,
    changeAssignedPerson: jest.fn(),
    sendToRedirect: jest.fn(),
    handleCopyUrl: jest.fn(),
    isCopied: false,
    replitLink: 'DefaultReplitLink',
    assigneeHandlerOpen: jest.fn(),
    setCreatorStep: jest.fn(),
    awards: ['Award1', 'Award2'],
    setExtrasPropertyAndSaveMultiple: jest.fn(),
    handleAssigneeDetails: jest.fn(),
    peopleList: [],
    setIsPaidStatusBadgeInfo: jest.fn(),
    bountyPrice: 100,
    price: 100,
    selectedAward: 'DefaultSelectedAward',
    handleAwards: jest.fn(),
    repo: 'DefaultRepo',
    issue: 'DefaultIssue',
    isMarkPaidSaved: false,
    setAwardDetails: jest.fn(),
    setBountyPrice: jest.fn(),
    owner_idURL: 'DefaultOwnerIdURL',
    createdURL: 'DefaultCreatedURL',
    created: 1234567890,
    loomEmbedUrl: 'DefaultLoomEmbedUrl',
    org_uuid: 'DefaultOrgUUID',
    id: 987654321,
    localPaid: 'UNKNOWN' as any,
    setLocalPaid: jest.fn(),
    isMobile: false,
    actionButtons: false,
    assigneeLabel: {},
    setExtrasPropertyAndSave: jest.fn(),
    setIsModalSideButton: jest.fn(),
    setIsExtraStyle: jest.fn(),
    coding_languages: ['language'],
    type: '',
    badgeRecipient: '',
    fromBountyPage: '',
    wanted_type: '',
    one_sentence_summary: '',
    github_description: '',
    show: false,
    formSubmit: jest.fn(),
    ticket_url: '',
    assignee: undefined as any,
    title: '',
    estimated_session_length: 'Less than 3 hours',
    estimated_completion_date: '2024-01-26T15:39:40.945Z'
  };

  it('should render titleString on the screen', () => {
    render(<MobileView {...defaultProps} titleString="Test Title" />);
    const titleElement = screen.getByText('Test Title');
    expect(titleElement).toBeInTheDocument();
  });

  it('should render description on the screen', () => {
    render(<MobileView {...defaultProps} description="Test Description" />);
    const descriptionElement = screen.getByText('Test Description');
    expect(descriptionElement).toBeInTheDocument();
  });

  it('should render deliverables on the screen', () => {
    render(<MobileView {...defaultProps} deliverables="Test Deliverables" />);
    const deliverablesElement = screen.getByText('Test Deliverables');
    expect(deliverablesElement).toBeInTheDocument();
  });

  it('I can help button is rendered on the screen', () => {
    render(<MobileView {...defaultProps} />);

    const iCanHelp = screen.getByText('I can help');
    expect(iCanHelp).toBeInTheDocument();
  });

  it('correct price is rendered on the screen', () => {
    render(<MobileView {...defaultProps} />);

    const bountyPrice = screen.getByText(`${defaultProps.bountyPrice}`);
    expect(bountyPrice).toBeInTheDocument();
  });

  it('share with twitter button is rendered on the screen', () => {
    render(<MobileView {...defaultProps} />);

    const iCanHelp = screen.getByText('Share to Twitter');
    expect(iCanHelp).toBeInTheDocument();
  });

  it('should render the NameTag with correct props', () => {
    const nameTagProps = {
      owner_alias: 'Test Owner',
      img: 'test-image.jpg',
      created: 1610000000,
      id: 180,
      owner: 'Test-Owner',
      owner_pubkey: 'abc100',
      widget: 'wanted'
    };
    render(<MobileView {...defaultProps} nametag={<NameTag {...nameTagProps} />} />);

    expect(screen.getByText(nameTagProps.owner_alias)).toBeInTheDocument();
  });

  it('share render session length if provided', () => {
    render(<MobileView {...defaultProps} />);

    const sessionLength = screen.getByText('< 3 hrs');
    expect(sessionLength).toBeInTheDocument();
  });

  it('share render esitmate completion date if provided', () => {
    render(<MobileView {...defaultProps} />);

    const completionDate = screen.getByText('Jan 26, 2024');
    expect(completionDate).toBeInTheDocument();
  });

  it('Test that on clicking on "not assigned", a pop up should appear to invite a developer including "type to search" box, a "skills" box, and a recommendation of 5 hunters.', async () => {
    const props: CodingBountiesProps = {
      ...defaultProps,
      assigneeValue: true,
      creatorStep: 0,
      peopleList: [
        { id: 1, owner_alias: '111' },
        { id: 2, owner_alias: '222' },
        { id: 3, owner_alias: '333' },
        { id: 4, owner_alias: '444' },
        { id: 5, owner_alias: '555' }
      ] as any
    };

    uiStore.setMeInfo({
      ...user,
      owner_alias: props.person.owner_alias
    });

    render(<MobileView {...props} />);

    fireEvent.click(screen.getByText('Not Assigned'));

    await waitFor(() => {
      expect(screen.getByText('Assign Developer')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Type to search ...')).toBeInTheDocument();
      expect(screen.getByText('Skills')).toBeInTheDocument();
      expect(document.querySelectorAll('.PeopleList .People')).toHaveLength(5);
    });
  });

  it('Test filter peopleList by "type to search" or "skills"', async () => {
    const props: CodingBountiesProps = {
      ...defaultProps,
      assigneeValue: true,
      creatorStep: 0,
      peopleList: [
        { id: 1, owner_alias: '111' },
        { id: 2, owner_alias: '222' },
        { id: 3, owner_alias: '333' },
        { id: 4, owner_alias: '444' },
        { id: 5, owner_alias: '555' }
      ] as any
    };

    uiStore.setMeInfo({
      ...user,
      owner_alias: props.person.owner_alias
    });

    const mockPeopleList: any = [
      {
        id: 1,
        owner_alias: 'TEST_NAME_1',
        extras: {
          coding_languages: [
            { value: 'R', label: 'R' },
            { value: 'C++', label: 'C++' }
          ]
        }
      },
      {
        id: 2,
        owner_alias: 'TEST_NAME_2',
        extras: { coding_languages: [{ value: 'C', label: 'C' }] }
      },
      { id: 3, owner_alias: 'TEST_NAME_3', extras: { coding_languages: [] } }
    ];
    const mockSearch = jest
      .spyOn(mainStore, 'getPeopleByNameAliasPubkey')
      .mockResolvedValue(mockPeopleList);

    render(<MobileView {...props} />);

    fireEvent.click(screen.getByText('Not Assigned'));

    // filter by "type to search"
    await waitFor(async () => {
      expect(screen.getByText('Assign Developer')).toBeInTheDocument();
      fireEvent.click(screen.getByPlaceholderText('Type to search ...'));
      await userEvent.type(screen.getByPlaceholderText('Type to search ...'), 'TEST_NAME');
      expect(document.querySelectorAll('.PeopleList .People')).toHaveLength(mockPeopleList.length);

      mockPeopleList.forEach((person: any) => {
        expect(screen.getByText(person.owner_alias)).toBeInTheDocument();
      });
    });

    // filter by "skills"
    await waitFor(() => {
      fireEvent.click(screen.getByText('Skills'));
      fireEvent.click(screen.getByText('R'));

      fireEvent.keyDown(document, { key: 'Escape', keyCode: 27 });
    });

    expect(document.querySelectorAll('.PeopleList .People')).toHaveLength(1);
    expect(screen.getByText('TEST_NAME_1')).toBeInTheDocument();
    expect(screen.queryByText('TEST_NAME_2')).not.toBeInTheDocument();
    expect(screen.queryByText('TEST_NAME_3')).not.toBeInTheDocument();

    mockSearch.mockRestore();
  });

  it('Test that on clicking on "Assign" on a hunter, the pop up should clear and the hunter should be assigned to the bounty', async () => {
    const props: CodingBountiesProps = {
      ...defaultProps,
      creatorStep: 0,
      peopleList: [
        { id: 1, owner_alias: 'NAME_1' },
        { id: 2, owner_alias: 'NAME_2' },
        { id: 3, owner_alias: 'NAME_3' },
        { id: 4, owner_alias: 'NAME_4' },
        { id: 5, owner_alias: 'NAME_5' }
      ] as any
    };
    const mockHandleAssigneeDetails = jest.fn();

    uiStore.setMeInfo({
      ...user,
      owner_alias: props.person.owner_alias
    });

    const App = () => {
      const [assigneeValue, setAssigneeValue] = useState(false);

      return (
        <MobileView
          {...props}
          assigneeValue={assigneeValue}
          assigneeHandlerOpen={() => setAssigneeValue((v: boolean) => !v)}
          handleAssigneeDetails={() => {
            setAssigneeValue((v: boolean) => !v);
            mockHandleAssigneeDetails();
          }}
        />
      );
    };

    render(<App />);

    fireEvent.click(screen.getByText('Not Assigned'));

    await waitFor(() => {
      expect(screen.getByText('Assign Developer')).toBeInTheDocument();
      fireEvent.click(screen.getAllByText('Assign')[0]);
    });

    await waitFor(() => {
      expect(screen.queryByText('Assign Developer')).toBe(null);
      expect(mockHandleAssigneeDetails).toBeCalledTimes(1);
    });
  });
});
