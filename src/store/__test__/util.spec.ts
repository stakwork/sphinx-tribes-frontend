import { transformBountyWithPeopleBounty } from './util';

describe('transformBountyWithPeopleBounty', () => {
  it('Standard Input with All Fields Present', () => {
    const input = {
      bounty: {
        id: 1,
        title: 'Test Bounty',
        assignee: 'user1',
        org_uuid: 'org123'
      },
      owner: {
        id: 1,
        name: 'John Doe'
      },
      assignee: {
        id: 2,
        name: 'Jane Doe'
      },
      workspace: {
        id: 1,
        name: 'Test Workspace'
      }
    };

    const result = transformBountyWithPeopleBounty(input);
    expect(result).toEqual({
      body: {
        id: 1,
        title: 'Test Bounty',
        assignee: { id: 2, name: 'Jane Doe' },
        org_uuid: 'org123'
      },
      person: {
        id: 1,
        name: 'John Doe',
        wanteds: []
      },
      workspace: {
        id: 1,
        name: 'Test Workspace'
      }
    });
  });

  it('Missing Assignee', () => {
    const input = {
      bounty: {
        id: 1,
        title: 'Test Bounty',
        org_uuid: 'org123'
      },
      owner: {
        id: 1,
        name: 'John Doe'
      },
      workspace: {
        id: 1,
        name: 'Test Workspace'
      }
    };

    const result = transformBountyWithPeopleBounty(input);
    expect(result.body.assignee).toBe('');
  });

  it('Missing Workspace', () => {
    const input = {
      bounty: {
        id: 1,
        title: 'Test Bounty',
        assignee: 'user1'
      },
      owner: {
        id: 1,
        name: 'John Doe'
      },
      assignee: {
        id: 2,
        name: 'Jane Doe'
      }
    };

    const result = transformBountyWithPeopleBounty(input);
    expect(result.workspace).toEqual({});
  });

  it('Empty BountyDetails', () => {
    const input = {};
    const result = transformBountyWithPeopleBounty(input);
    expect(result).toEqual({
      body: { assignee: '' },
      person: { wanteds: [] },
      workspace: {}
    });
  });

  it('Invalid Data Types', () => {
    const input = {
      bounty: 'invalid',
      owner: 123,
      assignee: true,
      workspace: null
    };

    const result = transformBountyWithPeopleBounty(input);
    expect(result).toBeTruthy();
    expect(result.body).toBeDefined();
    expect(result.person).toBeDefined();
    expect(result.workspace).toBeDefined();
  });

  it('Large BountyDetails Object', () => {
    const input = {
      bounty: {
        id: 1,
        title: 'Test Bounty',
        assignee: 'user1',
        org_uuid: 'org123',
        ...Array(100)
          .fill(0)
          .reduce((acc: any, _: unknown, i: any) => ({ ...acc, [`field${i}`]: `value${i}` }), {})
      },
      owner: {
        id: 1,
        name: 'John Doe'
      },
      assignee: {
        id: 2,
        name: 'Jane Doe'
      },
      workspace: {
        id: 1,
        name: 'Test Workspace'
      }
    };

    const result = transformBountyWithPeopleBounty(input);
    expect(result.body).toBeTruthy();
    expect(Object.keys(result.body).length).toBeGreaterThan(100);
  });

  it('Bounty with Nested Structures', () => {
    const input = {
      bounty: {
        id: 1,
        title: 'Test Bounty',
        assignee: 'user1',
        org_uuid: 'org123',
        nested: {
          level1: {
            level2: {
              data: 'test'
            }
          }
        }
      },
      owner: {
        id: 1,
        name: 'John Doe',
        details: {
          address: {
            city: 'Test City'
          }
        }
      },
      assignee: {
        id: 2,
        name: 'Jane Doe'
      },
      workspace: {
        id: 1,
        name: 'Test Workspace'
      }
    };

    const result = transformBountyWithPeopleBounty(input);
    expect(result.body.nested.level1.level2.data).toBe('test');
    expect(result.person.details.address.city).toBe('Test City');
  });

  it('Bounty with Only Owner', () => {
    const input = {
      owner: {
        id: 1,
        name: 'John Doe'
      }
    };

    const result = transformBountyWithPeopleBounty(input);
    expect(result).toEqual({
      body: { assignee: '' },
      person: {
        id: 1,
        name: 'John Doe',
        wanteds: []
      },
      workspace: {}
    });
  });

  it('Bounty with Only Bounty', () => {
    const input = {
      bounty: {
        id: 1,
        title: 'Test Bounty'
      }
    };

    const result = transformBountyWithPeopleBounty(input);
    expect(result).toEqual({
      body: {
        id: 1,
        title: 'Test Bounty',
        assignee: ''
      },
      person: { wanteds: [] },
      workspace: {}
    });
  });

  it('Bounty with Empty Arrays', () => {
    const input = {
      bounty: {
        id: 1,
        title: 'Test Bounty',
        tags: [],
        comments: []
      },
      owner: {
        id: 1,
        activities: []
      }
    };

    const result = transformBountyWithPeopleBounty(input);
    expect(result.body.tags).toEqual([]);
    expect(result.body.comments).toEqual([]);
    expect(result.person.activities).toEqual([]);
  });

  it('Bounty with Special Characters', () => {
    const input = {
      bounty: {
        id: 1,
        title: '!@#$%^&*()',
        description: '你好世界'
      },
      owner: {
        name: 'João & María'
      }
    };

    const result = transformBountyWithPeopleBounty(input);
    expect(result.body.title).toBe('!@#$%^&*()');
    expect(result.body.description).toBe('你好世界');
    expect(result.person.name).toBe('João & María');
  });

  it('Bounty with Zero Values', () => {
    const input = {
      bounty: {
        id: 0,
        price: 0,
        count: 0
      },
      owner: {
        id: 0,
        rating: 0
      }
    };

    const result = transformBountyWithPeopleBounty(input);
    expect(result.body.id).toBe(0);
    expect(result.body.price).toBe(0);
    expect(result.body.count).toBe(0);
    expect(result.person.id).toBe(0);
    expect(result.person.rating).toBe(0);
  });

  it('Bounty with Boolean Values', () => {
    const input = {
      bounty: {
        id: 1,
        isActive: true,
        isCompleted: false
      },
      owner: {
        isVerified: true
      }
    };

    const result = transformBountyWithPeopleBounty(input);
    expect(result.body.isActive).toBe(true);
    expect(result.body.isCompleted).toBe(false);
    expect(result.person.isVerified).toBe(true);
  });

  it('Bounty with Undefined Values', () => {
    const input = {
      bounty: {
        id: 1,
        title: undefined,
        description: undefined
      },
      owner: {
        name: undefined
      }
    };

    const result = transformBountyWithPeopleBounty(input);
    expect(result.body.title).toBeUndefined();
    expect(result.body.description).toBeUndefined();
    expect(result.person.name).toBeUndefined();
  });

  it('Bounty with Mixed Types Array', () => {
    const input = {
      bounty: {
        id: 1,
        mixedArray: [1, 'string', true, { key: 'value' }, null, undefined]
      }
    };

    const result = transformBountyWithPeopleBounty(input);
    expect(result.body.mixedArray).toEqual([1, 'string', true, { key: 'value' }, null, undefined]);
  });

  it('Bounty with Circular Reference', () => {
    const circular: any = {
      id: 1,
      name: 'Circular'
    };
    circular.self = circular;

    const input = {
      bounty: {
        id: 1,
        circular
      }
    };

    const result = transformBountyWithPeopleBounty(input);
    expect(result.body.circular.id).toBe(1);
    expect(result.body.circular.name).toBe('Circular');
    expect(result.body.circular.self).toBeDefined();
  });

  it('Bounty with Date Objects', () => {
    const testDate = new Date('2024-01-01');
    const input = {
      bounty: {
        id: 1,
        createdAt: testDate,
        updatedAt: testDate
      }
    };

    const result = transformBountyWithPeopleBounty(input);
    expect(result.body.createdAt).toEqual(testDate);
    expect(result.body.updatedAt).toEqual(testDate);
  });

  it('Bounty with Empty Strings', () => {
    const input = {
      bounty: {
        id: 1,
        title: '',
        description: ''
      },
      owner: {
        name: ''
      }
    };

    const result = transformBountyWithPeopleBounty(input);
    expect(result.body.title).toBe('');
    expect(result.body.description).toBe('');
    expect(result.person.name).toBe('');
  });

  it('Bounty with Very Long Strings', () => {
    const longString = 'a'.repeat(10000);
    const input = {
      bounty: {
        id: 1,
        title: longString,
        description: longString
      }
    };

    const result = transformBountyWithPeopleBounty(input);
    expect(result.body.title.length).toBe(10000);
    expect(result.body.description.length).toBe(10000);
  });
});
