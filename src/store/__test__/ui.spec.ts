import { waitFor } from '@testing-library/react';
import { UiStore } from '../ui';
import { mainStore } from '../main';
jest.mock('../main', () => ({ mainStore: { getPersonById: jest.fn() } }));
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
