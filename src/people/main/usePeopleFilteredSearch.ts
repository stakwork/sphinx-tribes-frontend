import { CodingLanguage } from 'people/interfaces';
import { useCallback, useEffect, useState } from 'react';
import { useStores } from 'store';

export type SkillsFilter = Record<CodingLanguage, boolean>;

const emptySkillsFilter = {} as SkillsFilter;

function getLanguagesQueryString(skillsFilter: SkillsFilter): string {
  return Object.entries(skillsFilter)
    .reduce((languagesQueryParams: Array<string>, [language, state]: [string, boolean]) => {
      if (state) languagesQueryParams.push(language);

      return languagesQueryParams;
    }, [])
    .join(',');
}

interface fetchPeopleParams {
  skillsFilter?: SkillsFilter;
  page?: number;
  resetPage?: boolean;
}

export function usePeopleFilteredSearch() {
  const { main, ui } = useStores();
  const [isLoading, setIsLoading] = useState(true);
  const [skillsFilter, setSkillsFilter] = useState<SkillsFilter>(emptySkillsFilter);
  const fetchPeople = useCallback(
    async (params?: fetchPeopleParams) => {
      const page = params?.page || 1;
      const resetPage = params && 'resetPage' in params ? params.resetPage : true;
      const languages = getLanguagesQueryString(params?.skillsFilter || skillsFilter);

      const peopleParamsObject = {
        page,
        resetPage,
        ...(languages ? { languages } : {})
      };

      await main.getPeople(peopleParamsObject);
    },
    [main, skillsFilter]
  );

  useEffect(() => {
    let isMounted = true;

    if (isMounted) setIsLoading(true);
    fetchPeople().then(() => {
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [fetchPeople]);

  return {
    isLoading,
    skillsFilter,
    handleFilterChange: useCallback(
      async (codingLanguage: CodingLanguage) => {
        const newSkillsFilter = {
          ...skillsFilter,
          [codingLanguage]: !skillsFilter[codingLanguage]
        } as SkillsFilter;

        setSkillsFilter(newSkillsFilter);

        setIsLoading(true);
        await fetchPeople({ skillsFilter: newSkillsFilter });
        setIsLoading(false);
      },
      [fetchPeople, skillsFilter]
    ),
    handleSearchChange: useCallback(
      async (searchText: string) => {
        ui.setSearchText(searchText);

        setIsLoading(true);
        await fetchPeople();
        setIsLoading(false);
      },
      [fetchPeople, ui]
    ),
    uploadMore: useCallback(
      (direction: 1 | -1) => {
        let newPage = ui.peoplePageNumber + direction;

        if (newPage < 1) newPage = 1;

        fetchPeople({ page: newPage, resetPage: false });
      },
      [fetchPeople, ui.peoplePageNumber]
    )
  };
}
