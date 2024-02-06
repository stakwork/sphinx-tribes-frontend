import { CodingLanguage } from "people/utils/languageLabelStyle";
import { useCallback, useEffect, useState } from "react";
import { useStores } from "store";

type SkillsFilter = Record<CodingLanguage, boolean>;

const emptySkillsFilter = {} as SkillsFilter;

function getLanguagesQueryString(skillsFilter: SkillsFilter): string {
  return Object.entries(skillsFilter)
    .reduce((languagesQueryParams: Array<string>, [language, state]: [string, boolean]) => {
      if (state) languagesQueryParams.push(language);

      return languagesQueryParams;
    }, [])
    .join(',');
}

export function usePeopleFilteredSearch() {
  const { main, ui } = useStores();
  const [isLoading, setIsLoading] = useState(true);
  const [skillsFilter, setSkillsFilter] = useState<SkillsFilter>(emptySkillsFilter);
  const fetchPeople = useCallback(
    (languages: string) => {
      setIsLoading(true);
      main.getPeople({ page: 1, resetPage: true, languages });
      setIsLoading(false);
    },
    [main]
  );

  useEffect(function initialPeopleFetch() {
    fetchPeople(getLanguagesQueryString(skillsFilter));
  }, []);

  return {
    isLoading,
    handleFilterChange: useCallback((codingLanguage: CodingLanguage) => {
      const newSkillsFilter = {
        ...skillsFilter,
        [codingLanguage]: !skillsFilter[codingLanguage]
      } as SkillsFilter;

      setSkillsFilter(newSkillsFilter);

      fetchPeople(getLanguagesQueryString(newSkillsFilter));
    }, [fetchPeople, skillsFilter]),
    handleSearchChange: useCallback(
      (searchText: string) => {
        ui.setSearchText(searchText);

        fetchPeople(getLanguagesQueryString(skillsFilter));
      },
      [fetchPeople, skillsFilter, ui]
    )
  };
}
