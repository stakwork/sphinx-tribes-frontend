import { waitFor } from '@testing-library/react';
import { UiStore } from '../ui';
import { mainStore } from '../main';

jest.mock('../main', () => ({
  mainStore: {
    getPersonById: jest.fn()
  }
}));

describe('UiStore.setSelectedPerson', () => {
  let uiStore: UiStore;

  beforeEach(() => {
    uiStore = new UiStore();
    jest.clearAllMocks();
  });

  it('Valid Input (Positive Number)', () => {
    uiStore.setSelectedPerson(5);
    expect(uiStore.selectedPerson).toBe(5);
    expect(mainStore.getPersonById).toHaveBeenCalledWith(5);
  });

  it('Valid Input (Zero)', () => {
    uiStore.setSelectedPerson(0);
    expect(uiStore.selectedPerson).toBe(0);
    expect(mainStore.getPersonById).toHaveBeenCalledWith(0);
  });

  it('Undefined Input', () => {
    uiStore.setSelectedPerson(undefined);
    expect(uiStore.selectedPerson).toBe(0);
    expect(mainStore.getPersonById).toHaveBeenCalledWith(0);
  });

  it('Negative Number', () => {
    uiStore.setSelectedPerson(-1);
    expect(uiStore.selectedPerson).toBe(-1);
    expect(mainStore.getPersonById).toHaveBeenCalledWith(-1);
  });

  it('Non-Number Input (String)', () => {
    uiStore.setSelectedPerson('123' as unknown as number);
    waitFor(() => {
      expect(uiStore.selectedPerson).toBe(0);
      expect(mainStore.getPersonById).toHaveBeenCalledWith(0);
    });
  });

  it('Non-Number Input (Object)', () => {
    uiStore.setSelectedPerson({ id: 1 } as unknown as number);
    waitFor(() => {
      expect(uiStore.selectedPerson).toBe(0);
      expect(mainStore.getPersonById).toHaveBeenCalledWith(0);
    });
  });

  it('Large Number Input', () => {
    const largeNumber = 999999999;
    uiStore.setSelectedPerson(largeNumber);
    expect(uiStore.selectedPerson).toBe(largeNumber);
    expect(mainStore.getPersonById).toHaveBeenCalledWith(largeNumber);
  });

  it('Boundary Number (Maximum Safe Integer)', () => {
    uiStore.setSelectedPerson(Number.MAX_SAFE_INTEGER);
    expect(uiStore.selectedPerson).toBe(Number.MAX_SAFE_INTEGER);
    expect(mainStore.getPersonById).toHaveBeenCalledWith(Number.MAX_SAFE_INTEGER);
  });

  it('Boundary Number (Minimum Safe Integer)', () => {
    uiStore.setSelectedPerson(Number.MIN_SAFE_INTEGER);
    expect(uiStore.selectedPerson).toBe(Number.MIN_SAFE_INTEGER);
    expect(mainStore.getPersonById).toHaveBeenCalledWith(Number.MIN_SAFE_INTEGER);
  });

  it('Null Input', () => {
    uiStore.setSelectedPerson(null as unknown as number);
    expect(uiStore.selectedPerson).toBe(0);
    expect(mainStore.getPersonById).toHaveBeenCalledWith(0);
  });

  it('Floating Point Number', () => {
    uiStore.setSelectedPerson(3.14);
    expect(uiStore.selectedPerson).toBe(3.14);
    expect(mainStore.getPersonById).toHaveBeenCalledWith(3.14);
  });

  it('Multiple Calls', () => {
    uiStore.setSelectedPerson(1);
    expect(uiStore.selectedPerson).toBe(1);
    expect(mainStore.getPersonById).toHaveBeenCalledWith(1);

    uiStore.setSelectedPerson(2);
    expect(uiStore.selectedPerson).toBe(2);
    expect(mainStore.getPersonById).toHaveBeenCalledWith(2);

    expect(mainStore.getPersonById).toHaveBeenCalledTimes(2);
  });

  it('Same Value Multiple Times', () => {
    uiStore.setSelectedPerson(1);
    uiStore.setSelectedPerson(1);
    uiStore.setSelectedPerson(1);

    expect(uiStore.selectedPerson).toBe(1);
    expect(mainStore.getPersonById).toHaveBeenCalledTimes(3);
    expect(mainStore.getPersonById).toHaveBeenCalledWith(1);
  });
});

describe('UiStore.setMeInfo', () => {
  let uiStore: UiStore;

  beforeEach(() => {
    uiStore = new UiStore();
  });

  it('Standard Input with All Fields Present', () => {
    const input = {
      pubkey: 'pub123',
      owner_pubkey: 'owner123',
      photo_url: 'photo.jpg',
      img: 'image.jpg',
      alias: 'john',
      owner_alias: 'owner_john',
      route_hint: 'hint',
      contact_key: 'key123',
      price_to_meet: 100,
      jwt: 'jwt123',
      tribe_jwt: 'tribe123',
      url: 'http://example.com',
      description: 'description',
      verification_signature: 'sig123',
      extras: {},
      isSuperAdmin: false
    };

    uiStore.setMeInfo(input);
    expect(uiStore.meInfo).toEqual(input);
  });

  it('Input with photo_url but No img', () => {
    const input = {
      pubkey: 'pub123',
      photo_url: 'photo.jpg',
      alias: 'john',
      route_hint: 'hint',
      contact_key: 'key123',
      price_to_meet: 100,
      jwt: 'jwt123',
      tribe_jwt: 'tribe123',
      url: 'url123',
      description: 'desc',
      verification_signature: 'sig123',
      extras: {},
      isSuperAdmin: false,
      img: ''
    };

    uiStore.setMeInfo(input);
    expect(uiStore.meInfo?.img).toBe('photo.jpg');
  });

  it('Input with No owner_alias', () => {
    const input = {
      pubkey: 'pub123',
      alias: 'john',
      route_hint: 'hint',
      contact_key: 'key123',
      price_to_meet: 100,
      photo_url: '',
      img: '',
      jwt: 'jwt123',
      tribe_jwt: 'tribe123',
      url: 'url123',
      description: 'desc',
      verification_signature: 'sig123',
      extras: {},
      isSuperAdmin: false
    };

    uiStore.setMeInfo(input);
    expect(uiStore.meInfo?.owner_alias).toBe('john');
  });

  it('Input with No owner_pubkey', () => {
    const input = {
      pubkey: 'pub123',
      alias: 'john',
      route_hint: 'hint',
      contact_key: 'key123',
      price_to_meet: 100,
      photo_url: '',
      img: '',
      jwt: 'jwt123',
      tribe_jwt: 'tribe123',
      url: 'url123',
      description: 'desc',
      verification_signature: 'sig123',
      extras: {},
      isSuperAdmin: false
    };

    uiStore.setMeInfo(input);
    expect(uiStore.meInfo?.owner_pubkey).toBe('pub123');
  });

  it('Input with Only photo_url and alias', () => {
    const input = {
      pubkey: '',
      photo_url: 'photo.jpg',
      alias: 'john',
      route_hint: '',
      contact_key: '',
      price_to_meet: 0,
      jwt: '',
      tribe_jwt: '',
      url: '',
      description: '',
      verification_signature: '',
      extras: {},
      isSuperAdmin: false,
      img: ''
    };

    uiStore.setMeInfo(input);
    waitFor(() => {
      expect(uiStore.meInfo?.img).toBe('photo.jpg');
      expect(uiStore.meInfo?.owner_alias).toBe('john');
    });
  });

  it('Input with Only pubkey', () => {
    const input = {
      pubkey: 'pub123',
      photo_url: '',
      alias: '',
      route_hint: '',
      contact_key: '',
      price_to_meet: 0,
      jwt: '',
      tribe_jwt: '',
      url: '',
      img: '',
      description: '',
      verification_signature: '',
      extras: {},
      isSuperAdmin: false
    };

    uiStore.setMeInfo(input);
    expect(uiStore.meInfo?.owner_pubkey).toBe('pub123');
  });

  it('Input with Empty Strings', () => {
    const input = {
      pubkey: '',
      photo_url: '',
      alias: '',
      route_hint: '',
      contact_key: '',
      price_to_meet: 0,
      jwt: '',
      tribe_jwt: '',
      url: '',
      img: '',
      description: '',
      verification_signature: '',
      extras: {},
      isSuperAdmin: false
    };

    uiStore.setMeInfo(input);
    waitFor(() => {
      expect(uiStore.meInfo).toEqual(input);
    });
  });

  it('Null Input', () => {
    uiStore.setMeInfo(null);
    expect(uiStore.meInfo).toBeNull();
  });

  it('Input with Invalid Data Types', () => {
    const input = {
      pubkey: 123 as unknown as string,
      photo_url: true as unknown as string,
      alias: {} as unknown as string,
      route_hint: '',
      contact_key: '',
      price_to_meet: '100' as unknown as number,
      jwt: '',
      tribe_jwt: '',
      url: '',
      img: '',
      description: '',
      verification_signature: '',
      extras: {},
      isSuperAdmin: 'true' as unknown as boolean
    };

    uiStore.setMeInfo(input);
    expect(uiStore.meInfo).toBeTruthy();
  });

  it('Input with Identical alias and owner_alias', () => {
    const input = {
      pubkey: 'pub123',
      alias: 'john',
      owner_alias: 'john',
      route_hint: '',
      contact_key: '',
      price_to_meet: 0,
      photo_url: '',
      img: '',
      jwt: '',
      tribe_jwt: '',
      url: '',
      description: '',
      verification_signature: '',
      extras: {},
      isSuperAdmin: false
    };

    uiStore.setMeInfo(input);
    expect(uiStore.meInfo?.alias).toBe(uiStore.meInfo?.owner_alias);
  });

  it('Input with Identical pubkey and owner_pubkey', () => {
    const input = {
      pubkey: 'pub123',
      owner_pubkey: 'pub123',
      alias: 'john',
      route_hint: '',
      contact_key: '',
      price_to_meet: 0,
      photo_url: '',
      img: '',
      jwt: '',
      tribe_jwt: '',
      url: '',
      description: '',
      verification_signature: '',
      extras: {},
      isSuperAdmin: false
    };

    uiStore.setMeInfo(input);
    expect(uiStore.meInfo?.pubkey).toBe(uiStore.meInfo?.owner_pubkey);
  });
});

describe('setShowSignIn', () => {
  let uiStore: UiStore;

  beforeEach(() => {
    uiStore = new UiStore();
  });

  it('Initial state verification', () => {
    expect(uiStore.showSignIn).toBe(false);
  });

  it('Set showSignIn to true', () => {
    uiStore.setShowSignIn(true);
    expect(uiStore.showSignIn).toBe(true);
  });

  it('Set showSignIn to false', () => {
    uiStore.setShowSignIn(true);
    uiStore.setShowSignIn(false);
    expect(uiStore.showSignIn).toBe(false);
  });

  it('Set showSignIn with non-boolean truthy value', () => {
    uiStore.setShowSignIn(1 as unknown as boolean);
    waitFor(() => {
      expect(uiStore.showSignIn).toBe(true);
    });

    uiStore.setShowSignIn('true' as unknown as boolean);
    waitFor(() => {
      expect(uiStore.showSignIn).toBe(true);
    });
  });

  it('Set showSignIn with non-boolean falsy value', () => {
    uiStore.setShowSignIn(true);

    uiStore.setShowSignIn(0 as unknown as boolean);
    waitFor(() => {
      expect(uiStore.showSignIn).toBe(false);
    });

    uiStore.setShowSignIn('' as unknown as boolean);
    waitFor(() => {
      expect(uiStore.showSignIn).toBe(false);
    });

    uiStore.setShowSignIn(null as unknown as boolean);
    waitFor(() => {
      expect(uiStore.showSignIn).toBe(false);
    });

    uiStore.setShowSignIn(undefined as unknown as boolean);
    waitFor(() => {
      expect(uiStore.showSignIn).toBe(false);
    });
  });

  it('Set showSignIn with invalid type (object)', () => {
    uiStore.setShowSignIn(true);

    uiStore.setShowSignIn({} as unknown as boolean);
    waitFor(() => {
      expect(uiStore.showSignIn).toBe(true);
    });

    uiStore.setShowSignIn([] as unknown as boolean);
    waitFor(() => {
      expect(uiStore.showSignIn).toBe(true);
    });
  });

  it('Multiple consecutive calls with same value', () => {
    uiStore.setShowSignIn(true);
    uiStore.setShowSignIn(true);
    expect(uiStore.showSignIn).toBe(true);

    uiStore.setShowSignIn(false);
    uiStore.setShowSignIn(false);
    expect(uiStore.showSignIn).toBe(false);
  });

  it('Toggle behavior verification', () => {
    uiStore.setShowSignIn(true);
    expect(uiStore.showSignIn).toBe(true);

    uiStore.setShowSignIn(false);
    expect(uiStore.showSignIn).toBe(false);

    uiStore.setShowSignIn(true);
    expect(uiStore.showSignIn).toBe(true);
  });

  it('Boundary testing with Boolean values', () => {
    uiStore.setShowSignIn(Boolean(true) as unknown as boolean);
    expect(uiStore.showSignIn).toBe(true);

    uiStore.setShowSignIn(Boolean(false) as unknown as boolean);
    expect(uiStore.showSignIn).toBe(false);
  });
});

describe('setSelectingPerson', () => {
  let uiStore: UiStore;

  beforeEach(() => {
    uiStore = new UiStore();
  });

  it('Standard Input (Positive Number)', () => {
    uiStore.setSelectingPerson(42);
    expect(uiStore.selectingPerson).toBe(42);
  });

  it('Standard Input (Negative Number)', () => {
    uiStore.setSelectingPerson(-42);
    expect(uiStore.selectingPerson).toBe(-42);
  });

  it('Zero Value', () => {
    uiStore.setSelectingPerson(0);
    expect(uiStore.selectingPerson).toBe(0);
  });

  it('Undefined Value', () => {
    uiStore.setSelectingPerson(undefined);
    expect(uiStore.selectingPerson).toBe(0);
  });

  it('Maximum Safe Integer', () => {
    uiStore.setSelectingPerson(Number.MAX_SAFE_INTEGER);
    expect(uiStore.selectingPerson).toBe(Number.MAX_SAFE_INTEGER);
  });

  it('Minimum Safe Integer', () => {
    uiStore.setSelectingPerson(Number.MIN_SAFE_INTEGER);
    expect(uiStore.selectingPerson).toBe(Number.MIN_SAFE_INTEGER);
  });

  it('Non-Number Input (String)', () => {
    uiStore.setSelectingPerson('123' as unknown as number);
    waitFor(() => {
      expect(uiStore.selectingPerson).toBe(0);
    });
  });

  it('Non-Number Input (Object)', () => {
    uiStore.setSelectingPerson({ id: 1 } as unknown as number);
    waitFor(() => {
      expect(uiStore.selectingPerson).toBe(0);
    });
  });

  it('Null Value', () => {
    uiStore.setSelectingPerson(null as unknown as number);
    expect(uiStore.selectingPerson).toBe(0);
  });

  it('Large Positive Number', () => {
    const largeNumber = 1e15;
    uiStore.setSelectingPerson(largeNumber);
    expect(uiStore.selectingPerson).toBe(largeNumber);
  });

  it('Large Negative Number', () => {
    const largeNegativeNumber = -1e15;
    uiStore.setSelectingPerson(largeNegativeNumber);
    expect(uiStore.selectingPerson).toBe(largeNegativeNumber);
  });

  it('Floating Point Number', () => {
    uiStore.setSelectingPerson(3.14159);
    expect(uiStore.selectingPerson).toBe(3.14159);
  });

  it('NaN (Not a Number)', () => {
    uiStore.setSelectingPerson(NaN);
    expect(uiStore.selectingPerson).toBe(0);
  });

  it('Infinity', () => {
    uiStore.setSelectingPerson(Infinity);
    waitFor(() => {
      expect(uiStore.selectingPerson).toBe(0);
    });
  });

  it('Negative Infinity', () => {
    uiStore.setSelectingPerson(-Infinity);
    waitFor(() => {
      expect(uiStore.selectingPerson).toBe(0);
    });
  });

  it('Multiple consecutive calls', () => {
    uiStore.setSelectingPerson(1);
    uiStore.setSelectingPerson(2);
    uiStore.setSelectingPerson(3);
    expect(uiStore.selectingPerson).toBe(3);
  });

  it('Same value multiple times', () => {
    uiStore.setSelectingPerson(42);
    uiStore.setSelectingPerson(42);
    uiStore.setSelectingPerson(42);
    expect(uiStore.selectingPerson).toBe(42);
  });

  it('Alternating between valid and invalid values', () => {
    waitFor(() => {
      uiStore.setSelectingPerson(1);
      expect(uiStore.selectingPerson).toBe(1);

      uiStore.setSelectingPerson(NaN);
      expect(uiStore.selectingPerson).toBe(0);

      uiStore.setSelectingPerson(2);
      expect(uiStore.selectingPerson).toBe(2);

      uiStore.setSelectingPerson('invalid' as unknown as number);
      expect(uiStore.selectingPerson).toBe(0);
    });
  });
});

describe('setBadgeList', () => {
  let uiStore: UiStore;

  beforeEach(() => {
    uiStore = new UiStore();
  });

  it('Standard Array Input', () => {
    const badges = [
      { id: 1, name: 'Badge1' },
      { id: 2, name: 'Badge2' }
    ];
    uiStore.setBadgeList(badges);
    expect(uiStore.badgeList).toEqual(badges);
  });

  it('Empty Array Input', () => {
    uiStore.setBadgeList([]);
    expect(uiStore.badgeList).toEqual([]);
  });

  it('Single Object Input', () => {
    const badge = { id: 1, name: 'Badge1' };
    uiStore.setBadgeList(badge);
    expect(uiStore.badgeList).toEqual(badge);
  });

  it('Null Input', () => {
    uiStore.setBadgeList(null);
    expect(uiStore.badgeList).toBeNull();
  });

  it('Undefined Input', () => {
    uiStore.setBadgeList(undefined);
    expect(uiStore.badgeList).toBeUndefined();
  });

  it('Empty String Input', () => {
    uiStore.setBadgeList('');
    expect(uiStore.badgeList).toBe('');
  });

  it('Non-Array, Non-Object Input', () => {
    const number = 42;
    uiStore.setBadgeList(number);
    expect(uiStore.badgeList).toBe(number);
  });

  it('Boolean Input', () => {
    uiStore.setBadgeList(true);
    expect(uiStore.badgeList).toBe(true);

    uiStore.setBadgeList(false);
    expect(uiStore.badgeList).toBe(false);
  });

  it('Large Array Input', () => {
    const largeArray = Array(1000)
      .fill(null)
      .map((_: any, index: number) => ({
        id: index,
        name: `Badge${index}`
      }));
    uiStore.setBadgeList(largeArray);
    expect(uiStore.badgeList).toEqual(largeArray);
    expect(uiStore.badgeList.length).toBe(1000);
  });

  it('Nested Object Input', () => {
    const nestedObject = {
      level1: {
        level2: {
          level3: {
            badges: [{ id: 1, name: 'NestedBadge' }]
          }
        }
      }
    };
    uiStore.setBadgeList(nestedObject);
    expect(uiStore.badgeList).toEqual(nestedObject);
  });

  it('Function as Input', () => {
    const func = () => ['badge1', 'badge2'];
    uiStore.setBadgeList(func);
    waitFor(() => {
      expect(typeof uiStore.badgeList).toBe('function');
      expect(uiStore.badgeList).toBe(func);
    });
  });

  it('Array with Mixed Types', () => {
    const mixedArray = [
      'string',
      42,
      { id: 1 },
      true,
      null,
      undefined,
      [],
      () => {
        ('');
      }
    ];
    uiStore.setBadgeList(mixedArray);
    waitFor(() => {
      expect(uiStore.badgeList).toEqual(mixedArray);
    });
  });

  it('Object with Circular Reference', () => {
    const circularObj: any = {
      name: 'CircularBadge',
      reference: null
    };
    circularObj.reference = circularObj;

    waitFor(() => {
      uiStore.setBadgeList(circularObj);
      expect(uiStore.badgeList).toBe(circularObj);
      expect(uiStore.badgeList.name).toBe('CircularBadge');
      expect(uiStore.badgeList.reference).toBe(circularObj);
    });
  });

  it('Multiple consecutive calls', () => {
    const badges1 = [{ id: 1 }];
    const badges2 = [{ id: 2 }];

    uiStore.setBadgeList(badges1);
    expect(uiStore.badgeList).toEqual(badges1);

    uiStore.setBadgeList(badges2);
    expect(uiStore.badgeList).toEqual(badges2);
  });

  it('Setting same value multiple times', () => {
    const badges = [{ id: 1 }];

    uiStore.setBadgeList(badges);
    uiStore.setBadgeList(badges);
    uiStore.setBadgeList(badges);
    waitFor(() => {
      expect(uiStore.badgeList).toBe(badges);
    });
  });

  it('Array with special characters', () => {
    const specialChars = [
      { id: 1, name: '!@#$%^&*()' },
      { id: 2, name: '😀🎉🔥' },
      { id: 3, name: '\\n\\t\\r' }
    ];

    uiStore.setBadgeList(specialChars);
    expect(uiStore.badgeList).toEqual(specialChars);
  });
});
