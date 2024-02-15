const mockBounties = [
  {
    bounty: {
      id: 892,
      owner_id: '03bfe6723c06fb2b7546df1e8ca1a17ae5c504615da32c945425ccbe8d3ca6260d',
      paid: false,
      show: true,
      type: 'freelance_job_request',
      award: '',
      assigned_hours: 0,
      bounty_expires: '',
      commitment_fee: 0,
      price: '1',
      title: 'test',
      tribe: 'None',
      created: 1702398254,
      assignee: '',
      ticket_url: '',
      org_uuid: 'ck13rgua5fdkhph1po4g',
      description: 'test',
      wanted_type: 'Mobile development',
      deliverables: 'test',
      github_description: false,
      one_sentence_summary: '',
      estimated_session_length: '',
      estimated_completion_date: '',
      updated: '2023-12-12T16:24:14.585187Z',
      paid_date: null,
      coding_languages: ['Lightning', 'Typescript']
    },
    assignee: {
      id: 0,
      uuid: '',
      owner_pubkey: '',
      owner_alias: '',
      unique_name: '',
      description: '',
      tags: null,
      img: '',
      created: null,
      updated: null,
      unlisted: false,
      deleted: false,
      last_login: 0,
      owner_route_hint: '',
      owner_contact_key: '',
      price_to_meet: 0,
      new_ticket_time: 0,
      twitter_confirmed: false,
      extras: null,
      github_issues: null
    },
    owner: {
      id: 38,
      uuid: 'cd9dm5ua5fdtsj2c2nbg',
      owner_pubkey: '',
      owner_alias: 'kevkevin',
      unique_name: 'umbreltest',
      description: 'This is the real kevkevin I like to code alot',
      tags: [],
      img: 'https://memes.sphinx.chat/public/1jPjjDsrwRoBPzahpWjR8QE5DjQ726MsUSrCOjflSmo=',
      created: '2021-11-15T19:09:46.356248Z',
      updated: '2023-12-04T19:48:05.641056Z',
      unlisted: false,
      deleted: false,
      last_login: 1702065128,
      owner_route_hint: '',
      owner_contact_key:
        'MIIBCgKCAQEAxtkwpxx8RjdVhgzx4oUYkmJQttvFzwI+lCWYgngMi/4o8OgUF9eVvW8zSY0t9A1KEY2MdEOTGjv9QiesoN7hmkgTdUqDQd1LIsU4vBtwPVWyJs0d6VEdMySN9veN68S7Fu+S20e5gygj17X8cffoEwLNDPi0dsTgojAC/uggE98zJvHmEd/Ob/W3ADQD68DQErCejvqXK2557GtsDNo35iIN9KlOPLRmvG3S/oV4pIyj5Z/6uMEXlok2b/mtvP0E4ClMP77j9QPs7mQarQ03XM0iRC2Ru/Qg/xWBTeqmYv5zfD8hmtzakBVyMSrHNZKZjSnURVNVpFaEXoB4wBqcvQIDAQAB',
      price_to_meet: 21,
      new_ticket_time: 0,
      twitter_confirmed: true,
      extras: null,
      github_issues: null
    },
    organization: {
      uuid: 'ck13rgua5fdkhph1po4g',
      name: 'test after jwt',
      img: 'https://memes.sphinx.chat/public/l-_K9mJatGvz16Ixw1lPHtG9Om8QWtZtiRS_aIQme9c='
    }
  },
  {
    bounty: {
      id: 883,
      owner_id: '0214087d2f6d1a476bb18c08480c4fbe2dd95d3a2b1e9632718629582123eb491f',
      paid: false,
      show: true,
      type: 'freelance_job_request',
      award: '',
      assigned_hours: 0,
      bounty_expires: '',
      commitment_fee: 0,
      price: '10000',
      title: 'Help with Node',
      tribe: 'None',
      created: 1702342032,
      assignee: '',
      ticket_url: '',
      org_uuid: 'clrqpvg4nncuuf32kh30',
      description: 'I need help installing LND on a mac with M2 chip.',
      wanted_type: 'Bitcoin / Lightning',
      deliverables: '',
      github_description: false,
      one_sentence_summary: '',
      estimated_session_length: 'Less than 1 hour',
      estimated_completion_date: '2023-12-14T00:46:11.979Z',
      updated: '2023-12-12T00:47:12.671921Z',
      paid_date: null,
      coding_languages: ['Node', 'Javacript']
    },
    assignee: {
      id: 0,
      uuid: '',
      owner_pubkey: '',
      owner_alias: '',
      unique_name: '',
      description: '',
      tags: null,
      img: '',
      created: null,
      updated: null,
      unlisted: false,
      deleted: false,
      last_login: 0,
      owner_route_hint: '',
      owner_contact_key: '',
      price_to_meet: 0,
      new_ticket_time: 0,
      twitter_confirmed: false,
      extras: null,
      github_issues: null
    },
    owner: {
      id: 255,
      uuid: 'clrqpq84nncuuf32kh2g',
      owner_pubkey: '',
      owner_alias: 'DVR',
      unique_name: 'dvr',
      description: 'description',
      tags: [],
      img: 'https://memes.sphinx.chat/public/3bt5n-7mGLgC6jGBBwKwLyZdJY6IUVZke8p2nLUsPhU=',
      created: '2023-12-12T00:44:25.83042Z',
      updated: '2023-12-12T01:12:39.970648Z',
      unlisted: false,
      deleted: false,
      last_login: 1702341870,
      owner_route_hint:
        '03a6ea2d9ead2120b12bd66292bb4a302c756983dc45dcb2b364b461c66fd53bcb:1099519492097',
      owner_contact_key:
        'MIIBCgKCAQEAheE3AeFFTlvVTC2JHxlRN2iNnbxyVuEw6mueixBxA7CNtNZZ8PD06K/mMad7GjU5QtfK1jwRcI1+1OnFeqwTKr03gUjgMAm/KAV46LX2o56QC6YaTEhSSecyCFkb9LuLTYOORZWhm+Qq0H1eR4j/7lF3H1jMzjy/rN+eCJ9Ry5kAH4IkTfq1JHOUIWMWmWnZhfgMciRHNweejx+Rwq5F6QZhK6zhP6u//JIbTrAMyeg70afdX4Y5koby70Us2RoAoPDHYP+v4x9Obtw1Gl7oM2G2DSzHmmpK78vlxiJEZaa71SB20RItM94DwqzthzEqh3zz7CzhggE+kt2zeJSQSQIDAQAB',
      price_to_meet: 0,
      new_ticket_time: 0,
      twitter_confirmed: false,
      extras: null,
      github_issues: null
    },
    organization: { uuid: 'clrqpvg4nncuuf32kh30', name: 'LoS', img: '' }
  }
];

export default mockBounties;

export const newBounty = {
  person: { id: 10, name: 'Alice Johnson' },
  body: 'Bounty details here',
  org_uuid: 'org1',
  title: 'Fix Backend Bug',
  description: 'Fix a critical bug in the backend',
  owner_id: 'owner123',
  created: 1610000000,
  show: true,
  assignee: { id: 'dev123', name: 'Jane Smith' },
  wanted_type: 'bugfix',
  type: 'backend',
  price: '1000',
  codingLanguage: 'JavaScript',
  estimated_session_length: '3 hours',
  bounty_expires: '2023-12-31',
  commitment_fee: 50
};

export const updatedBounty = {
  person: { name: 'Satoshi Nakamoto', id: 1 },
  body: { content: 'Detailed description of the bounty task' },
  org_uuid: 'org123',
  title: 'Updated Title: Fix Backend bugs',
  description: 'A bug in the front end needs fixing',
  owner_id: 'owner001',
  created: 1670000000000,
  show: true,
  assignee: { name: 'Jane Doe', id: 'a1' },
  wanted_type: 'bugfix',
  type: 'issue',
  price: '500',
  codingLanguage: 'JavaScript',
  estimated_session_length: '2 hours',
  bounty_expires: '2024-01-01',
  commitment_fee: 50
};

export const mockBountiesMutated = [
  {
    body: {
      assigned_hours: 0,
      assignee: '',
      award: '',
      bounty_expires: '',
      coding_languages: ['Lightning', 'Typescript'],
      commitment_fee: 0,
      created: 1702398254,
      deliverables: 'test',
      description: 'test',
      estimated_completion_date: '',
      estimated_session_length: '',
      github_description: false,
      id: 892,
      one_sentence_summary: '',
      org_uuid: 'ck13rgua5fdkhph1po4g',
      owner_id: '03bfe6723c06fb2b7546df1e8ca1a17ae5c504615da32c945425ccbe8d3ca6260d',
      paid: false,
      paid_date: null,
      price: '1',
      show: true,
      ticket_url: '',
      title: 'test',
      tribe: 'None',
      type: 'freelance_job_request',
      updated: '2023-12-12T16:24:14.585187Z',
      wanted_type: 'Mobile development'
    },
    organization: {
      img: 'https://memes.sphinx.chat/public/l-_K9mJatGvz16Ixw1lPHtG9Om8QWtZtiRS_aIQme9c=',
      name: 'test after jwt',
      uuid: 'ck13rgua5fdkhph1po4g'
    },
    person: {
      created: '2021-11-15T19:09:46.356248Z',
      deleted: false,
      description: 'This is the real kevkevin I like to code alot',
      extras: null,
      github_issues: null,
      id: 38,
      img: 'https://memes.sphinx.chat/public/1jPjjDsrwRoBPzahpWjR8QE5DjQ726MsUSrCOjflSmo=',
      last_login: 1702065128,
      new_ticket_time: 0,
      owner_alias: 'kevkevin',
      owner_contact_key:
        'MIIBCgKCAQEAxtkwpxx8RjdVhgzx4oUYkmJQttvFzwI+lCWYgngMi/4o8OgUF9eVvW8zSY0t9A1KEY2MdEOTGjv9QiesoN7hmkgTdUqDQd1LIsU4vBtwPVWyJs0d6VEdMySN9veN68S7Fu+S20e5gygj17X8cffoEwLNDPi0dsTgojAC/uggE98zJvHmEd/Ob/W3ADQD68DQErCejvqXK2557GtsDNo35iIN9KlOPLRmvG3S/oV4pIyj5Z/6uMEXlok2b/mtvP0E4ClMP77j9QPs7mQarQ03XM0iRC2Ru/Qg/xWBTeqmYv5zfD8hmtzakBVyMSrHNZKZjSnURVNVpFaEXoB4wBqcvQIDAQAB',
      owner_pubkey: '',
      owner_route_hint: '',
      price_to_meet: 21,
      tags: [],
      twitter_confirmed: true,
      unique_name: 'umbreltest',
      unlisted: false,
      updated: '2023-12-04T19:48:05.641056Z',
      uuid: 'cd9dm5ua5fdtsj2c2nbg',
      wanteds: []
    }
  },
  {
    body: {
      assigned_hours: 0,
      assignee: '',
      award: '',
      bounty_expires: '',
      coding_languages: ['Node', 'Javacript'],
      commitment_fee: 0,
      created: 1702342032,
      deliverables: '',
      description: 'I need help installing LND on a mac with M2 chip.',
      estimated_completion_date: '2023-12-14T00:46:11.979Z',
      estimated_session_length: 'Less than 1 hour',
      github_description: false,
      id: 883,
      one_sentence_summary: '',
      org_uuid: 'clrqpvg4nncuuf32kh30',
      owner_id: '0214087d2f6d1a476bb18c08480c4fbe2dd95d3a2b1e9632718629582123eb491f',
      paid: false,
      paid_date: null,
      price: '10000',
      show: true,
      ticket_url: '',
      title: 'Help with Node',
      tribe: 'None',
      type: 'freelance_job_request',
      updated: '2023-12-12T00:47:12.671921Z',
      wanted_type: 'Bitcoin / Lightning'
    },
    organization: { img: '', name: 'LoS', uuid: 'clrqpvg4nncuuf32kh30' },
    person: {
      created: '2023-12-12T00:44:25.83042Z',
      deleted: false,
      description: 'description',
      extras: null,
      github_issues: null,
      id: 255,
      img: 'https://memes.sphinx.chat/public/3bt5n-7mGLgC6jGBBwKwLyZdJY6IUVZke8p2nLUsPhU=',
      last_login: 1702341870,
      new_ticket_time: 0,
      owner_alias: 'DVR',
      owner_contact_key:
        'MIIBCgKCAQEAheE3AeFFTlvVTC2JHxlRN2iNnbxyVuEw6mueixBxA7CNtNZZ8PD06K/mMad7GjU5QtfK1jwRcI1+1OnFeqwTKr03gUjgMAm/KAV46LX2o56QC6YaTEhSSecyCFkb9LuLTYOORZWhm+Qq0H1eR4j/7lF3H1jMzjy/rN+eCJ9Ry5kAH4IkTfq1JHOUIWMWmWnZhfgMciRHNweejx+Rwq5F6QZhK6zhP6u//JIbTrAMyeg70afdX4Y5koby70Us2RoAoPDHYP+v4x9Obtw1Gl7oM2G2DSzHmmpK78vlxiJEZaa71SB20RItM94DwqzthzEqh3zz7CzhggE+kt2zeJSQSQIDAQAB',
      owner_pubkey: '',
      owner_route_hint:
        '03a6ea2d9ead2120b12bd66292bb4a302c756983dc45dcb2b364b461c66fd53bcb:1099519492097',
      price_to_meet: 0,
      tags: [],
      twitter_confirmed: false,
      unique_name: 'dvr',
      unlisted: false,
      updated: '2023-12-12T01:12:39.970648Z',
      uuid: 'clrqpq84nncuuf32kh2g',
      wanteds: []
    }
  }
];

export const expectedBountyResponses = [
  {
    body: {
      assigned_hours: 0,
      assignee: '',
      award: '',
      bounty_expires: '',
      coding_languages: ['Lightning', 'Typescript'],
      commitment_fee: 0,
      created: 1702398254,
      deliverables: 'test',
      description: 'test',
      estimated_completion_date: '',
      estimated_session_length: '',
      github_description: false,
      id: 892,
      one_sentence_summary: '',
      org_uuid: 'ck13rgua5fdkhph1po4g',
      owner_id: '03bfe6723c06fb2b7546df1e8ca1a17ae5c504615da32c945425ccbe8d3ca6260d',
      paid: false,
      paid_date: null,
      price: '1',
      show: true,
      ticket_url: '',
      title: 'test',
      tribe: 'None',
      type: 'freelance_job_request',
      updated: '2023-12-12T16:24:14.585187Z',
      wanted_type: 'Mobile development'
    },
    organization: {
      img: 'https://memes.sphinx.chat/public/l-_K9mJatGvz16Ixw1lPHtG9Om8QWtZtiRS_aIQme9c=',
      name: 'test after jwt',
      uuid: 'ck13rgua5fdkhph1po4g'
    },
    person: {
      created: '2021-11-15T19:09:46.356248Z',
      deleted: false,
      description: 'This is the real kevkevin I like to code alot',
      extras: null,
      github_issues: null,
      id: 38,
      img: 'https://memes.sphinx.chat/public/1jPjjDsrwRoBPzahpWjR8QE5DjQ726MsUSrCOjflSmo=',
      last_login: 1702065128,
      new_ticket_time: 0,
      owner_alias: 'kevkevin',
      owner_contact_key:
        'MIIBCgKCAQEAxtkwpxx8RjdVhgzx4oUYkmJQttvFzwI+lCWYgngMi/4o8OgUF9eVvW8zSY0t9A1KEY2MdEOTGjv9QiesoN7hmkgTdUqDQd1LIsU4vBtwPVWyJs0d6VEdMySN9veN68S7Fu+S20e5gygj17X8cffoEwLNDPi0dsTgojAC/uggE98zJvHmEd/Ob/W3ADQD68DQErCejvqXK2557GtsDNo35iIN9KlOPLRmvG3S/oV4pIyj5Z/6uMEXlok2b/mtvP0E4ClMP77j9QPs7mQarQ03XM0iRC2Ru/Qg/xWBTeqmYv5zfD8hmtzakBVyMSrHNZKZjSnURVNVpFaEXoB4wBqcvQIDAQAB',
      owner_pubkey: '',
      owner_route_hint: '',
      price_to_meet: 21,
      tags: [],
      twitter_confirmed: true,
      unique_name: 'umbreltest',
      unlisted: false,
      updated: '2023-12-04T19:48:05.641056Z',
      uuid: 'cd9dm5ua5fdtsj2c2nbg',
      wanteds: []
    }
  }
];

export const assignedBounty = {
  bounty: {
    id: 9999, // Randomized
    owner_id: 'random_owner_id', // Randomized
    paid: false,
    show: true,
    type: 'coding_task',
    award: '',
    assigned_hours: 0,
    bounty_expires: '',
    commitment_fee: 0,
    price: 50000,
    title: 'Show "0" value if % is too low instead of no value in superadmin',
    tribe: 'None',
    assignee: 'random_assignee_id', // Randomized
    ticket_url: 'https://example.com/issue/123', // Randomized
    org_uuid: 'random_org_uuid', // Randomized
    description:
      '**Describe the bug**\nOn staging there is a really small (close to 0) value for % conversion. This results in a "0" value. However, no 0 value is being displayed.\n**Expected behavior**\nDisplay a 0 value if the % is below 0.00%.\n**Desktop**\n - Browser: Chrome\n### Acceptance Criteria\n- I have tested on Chrome desktop\n- I have posted a screenshot in my PR\n- I have created a test that shows a 0 value gets displayed when value is below 0.00%\n- I have rebased and tested locally before submitting my PR',
    wanted_type: 'Web development',
    github_description: true,
    estimated_completion_date: '2024-02-12T22:55:12.301Z',
    created: 1707432920,
    updated: '2024-02-09T00:09:02.297044Z',
    coding_languages: []
  },
  assignee: {
    id: 123, // Randomized
    uuid: 'random_uuid', // Randomized
    owner_pubkey: 'random_owner_pubkey', // Randomized
    owner_alias: 'RandomName', // Randomized
    unique_name: 'random_unique_name', // Randomized
    description: 'description',
    img: '',
    created: '2024-02-05T19:29:36.419064Z',
    updated: '2024-02-05T19:29:36.720503Z',
    last_login: 1707770720,
    price_to_meet: 0
  },
  owner: {
    id: 456, // Randomized
    uuid: 'another_random_uuid', // Randomized
    owner_pubkey: 'another_random_owner_pubkey', // Randomized
    owner_alias: 'AnotherRandomName', // Randomized
    unique_name: 'another_random_unique_name', // Randomized
    description: 'Bitcoin PM test',
    img: 'https://example.com/public/random_image.png', // Randomized
    created: '2023-09-05T21:34:39.170759Z',
    updated: '2024-01-30T17:25:48.8506Z'
  },
  organization: {
    uuid: 'random_org_uuid_again', // Randomized
    name: 'Bounties Platform',
    img: 'https://example.com/public/another_random_image.png' // Randomized
  }
};

export const createdBounty = {
  bounty: {
    id: 9999,
    owner_id: 'random_owner_id',
    paid: false,
    show: true,
    type: 'coding_task',
    award: '',
    assigned_hours: 0,
    bounty_expires: '',
    commitment_fee: 0,
    price: 50000,
    title: 'Show "0" value if % is too low instead of no value in superadmin',
    tribe: 'None',
    assignee: 'random_assignee_id',
    ticket_url: 'https://example.com/issue/123',
    org_uuid: 'random_org_uuid',
    description:
      '**Describe the bug**\nOn staging there is a really small (close to 0) value for % conversion. This results in a "0" value. However, no 0 value is being displayed.\n**Expected behavior**\nDisplay a 0 value if the % is below 0.00%.\n**Desktop**\n - Browser: Chrome\n### Acceptance Criteria\n- I have tested on Chrome desktop\n- I have posted a screenshot in my PR\n- I have created a test that shows a 0 value gets displayed when value is below 0.00%\n- I have rebased and tested locally before submitting my PR',
    wanted_type: 'Web development',
    github_description: true,
    estimated_completion_date: '2024-02-12T22:55:12.301Z',
    created: 1707432920,
    updated: '2024-02-09T00:09:02.297044Z',
    coding_languages: []
  },
  assignee: {
    id: 123,
    uuid: 'random_uuid',
    owner_pubkey: 'random_owner_pubkey',
    owner_alias: 'RandomName',
    unique_name: 'random_unique_name',
    description: 'description',
    img: '',
    created: '2024-02-05T19:29:36.419064Z',
    updated: '2024-02-05T19:29:36.720503Z',
    last_login: 1707770720,
    price_to_meet: 0
  },
  owner: {
    id: 456,
    uuid: 'another_random_uuid',
    owner_pubkey: 'another_random_owner_pubkey',
    owner_alias: 'AnotherRandomName',
    unique_name: 'another_random_unique_name',
    description: 'Bitcoin PM test',
    img: 'https://example.com/public/random_image.png',
    created: '2023-09-05T21:34:39.170759Z',
    updated: '2024-01-30T17:25:48.8506Z'
  },
  organization: {
    uuid: 'random_org_uuid_again',
    name: 'Bounties Platform',
    img: 'https://example.com/public/another_random_image.png'
  }
};
