import { MainStore } from '../main';

describe('MainStore.doPageListMerger', () => {
  it('keeps the current list when a later search page has no results', () => {
    const store = new MainStore();
    const setPage = jest.fn();
    const currentList = [{ uuid: 'tribe-1' }, { uuid: 'tribe-2' }];

    const result = store.doPageListMerger(currentList, [], setPage, {
      search: 'tribe',
      page: 2
    });

    expect(result).toEqual(currentList);
    expect(setPage).not.toHaveBeenCalled();
  });

  it('clears the current list when a reset search has no results', () => {
    const store = new MainStore();
    const setPage = jest.fn();
    const currentList = [{ uuid: 'tribe-1' }];

    const result = store.doPageListMerger(currentList, [], setPage, {
      search: 'missing',
      page: 1,
      resetPage: true
    });

    expect(result).toEqual([]);
    expect(setPage).not.toHaveBeenCalled();
  });
});
