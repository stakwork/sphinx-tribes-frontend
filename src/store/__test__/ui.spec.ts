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
