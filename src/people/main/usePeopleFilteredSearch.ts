import { CodingLanguage } from 'people/utils/languageLabelStyle';
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
      const resetPage = params?.resetPage || true;
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

  useEffect(function initialPeopleFetch() {
    let isMounted = true;

    if (isMounted) setIsLoading(true);
    fetchPeople();
    if (isMounted) setIsLoading(false);

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    isLoading,
    skillsFilter,
    handleFilterChange: useCallback(
      (codingLanguage: CodingLanguage) => {
        const newSkillsFilter = {
          ...skillsFilter,
          [codingLanguage]: !skillsFilter[codingLanguage]
        } as SkillsFilter;

        setSkillsFilter(newSkillsFilter);

        setIsLoading(true);
        fetchPeople({ skillsFilter: newSkillsFilter });
        setIsLoading(false);
      },
      [fetchPeople, skillsFilter]
    ),
    handleSearchChange: useCallback(
      (searchText: string) => {
        ui.setSearchText(searchText);

        setIsLoading(true);
        fetchPeople();
        setIsLoading(false);
      },
      [fetchPeople, ui]
    ),
    uploadMore: useCallback(
      (direction: 1 | -1) => {
        let newPage = ui.peoplePageNumber + direction;

        if (newPage < 1) newPage = 1;

        setIsLoading(true);
        fetchPeople({ page: newPage, resetPage: false });
        setIsLoading(false);
      },
      [fetchPeople, ui.peoplePageNumber]
    )
  };
}
