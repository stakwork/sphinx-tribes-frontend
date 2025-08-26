import {
  aboutSchema,
  wantedSchema,
  offerSkillSchema,
  offerOtherSchema,
  wantedCodingTaskSchema,
  wantedOtherSchema,
  workspaceSchema,
  workspaceUserSchema
} from '../../components/form/schema';

const MAX_UPLOAD_SIZE = 10194304; //10MB

const widgetConfigs = {
  about: {
    label: 'About',
    name: 'about',
    single: true,
    skipEditLayer: true,
    submitText: 'Save',
    schema: aboutSchema,
    action: {
      text: 'Edit Profile',
      icon: 'edit'
    }
  },
  workspaces: {
    label: 'Workspaces',
    name: 'workspaces',
    submitText: 'Save',
    modalStyle: {
      width: 'auto',
      maxWidth: 'auto',
      minWidth: '400px',
      minHeight: '40%',
      maxHeight: '70%'
    },
    schema: workspaceSchema,
    action: {
      text: 'Add Workspace',
      icon: 'add'
    },
    noneSpace: {
      noUserResult: {
        img: 'no_org.png',
        text: 'Manage and organize your tickets',
        sub: 'Fund and pay bounties directly through the website, add members, organize tickets, and more!'
      },
      noResult: {
        img: 'no_org.png',
        text: 'No Workspace Yet',
        sub: 'Looks like this person has not created or added to any workspaces yet.'
      }
    }
  },
  badges: {
    label: 'Badges',
    name: 'badges',
    single: true,
    skipEditLayer: true,
    action: {
      text: 'Edit Profile',
      icon: 'edit'
    },
    noneSpace: {
      me: {
        img: '',
        text: 'No Badges',
        sub: 'Click here to learn about badges',
        buttonText: 'Add to Portfolio',
        buttonIcon: 'work'
      },
      otherUser: {
        img: '',
        text: 'No Badges',
        sub: "Looks like this person doesn't have any Badges yet."
      }
    }
  },
  // TODO: REMOVE
  bounties: {
    label: 'Bounties',
    name: 'bounties',
    submitText: 'Save',
    modalStyle: {
      width: 'auto',
      maxWidth: 'auto',
      minWidth: '400px',
      minHeight: '40%',
      maxHeight: '70%'
    },
    schema: wantedSchema,
    action: {
      text: 'Add New Bounty',
      icon: 'local_offer'
    },
    noneSpace: {
      me: {
        img: 'no_wanted.png',
        text: 'Make a list of github tickets you want help on.',
        buttonText: 'Add New Ticket',
        buttonIcon: 'local_offer'
      },
      otherUser: {
        img: 'no_wanted2.png',
        text: 'No Tickets Yet',
        sub: 'Looks like this person doesn’t need anything yet.'
      }
    }
  },
  assigned: {
    label: 'Assigned Bounties',
    name: 'assigned',
    submitText: 'Save',
    modalStyle: {
      width: 'auto',
      maxWidth: 'auto',
      minWidth: '400px',
      minHeight: '40%',
      maxHeight: '70%'
    },
    schema: [],
    action: {
      text: 'Add New Ticket',
      icon: 'local_offer'
    },
    noneSpace: {
      noResult: {
        img: 'no_wanted2.png',
        text: 'No Assigned Tickets Yet',
        sub: 'Looks like this person doesn’t need anything yet.'
      }
    }
  }
};

const formDropdownOptions = {
  wanted: [
    {
      value: 'freelance_job_request',
      label: 'Freelance Job Request',
      schema: wantedCodingTaskSchema
      // description: 'Post a coding task referencing your github repo.',
    },
    {
      value: 'live_help',
      label: 'Live Help',
      schema: wantedOtherSchema
      // description: 'Could be anything.',
    }
  ],
  offer: [
    {
      value: 'offer_skill',
      label: 'Skill',
      schema: offerSkillSchema,
      description: 'Build your portfolio.'
    },
    {
      value: 'offer_other',
      label: 'Other',
      schema: offerOtherSchema,
      description: 'Could be anything.'
    }
  ]
};

const badges = {
  earlyMember: {
    title: 'Early Adopter',
    src: 'EarlyMember.svg'
  }
};

const nonWidgetConfigs = {
  workspaceusers: {
    label: 'Workspace Users',
    name: 'workspaceusers',
    submitText: 'Save',
    modalStyle: {
      width: 'auto',
      maxWidth: 'auto',
      minWidth: '400px',
      minHeight: '40%',
      maxHeight: '70%'
    },
    schema: workspaceUserSchema
  }
};

const ERROR_MESSAGES = {
  CANNOT_SEND_MESSAGE: 'Cannot Send Message',
  GITHUB_PAT_EXPIRED: 'Your GitHub PAT has expired. Please update it in settings.',
  WORKSPACE_SETUP_INCOMPLETE: 'Your workspace setup is incomplete. Please check settings.',
  COMPLETE_WORKSPACE_SETUP: 'Complete workspace setup to send messages',
  TYPE_MESSAGE_PLACEHOLDER: 'Type your message...'
};

export {
  MAX_UPLOAD_SIZE,
  widgetConfigs,
  formDropdownOptions,
  badges,
  nonWidgetConfigs,
  ERROR_MESSAGES
};
