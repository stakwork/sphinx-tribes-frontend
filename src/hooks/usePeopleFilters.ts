import { useState } from 'react';
import { useStores } from 'store';
import type { CodingLanguage } from 'people/utils/languageLabelStyle';

export type CodingLanguageFilter = Record<CodingLanguage, boolean>;

const emptyCodingLanguageFilter = {} as CodingLanguageFilter;

/**
 * Filter people list by search string and selected language
 */
export default function usePeopleFilters() {
  const { main } = useStores();
  const [codingLanguageFilter, setCodingLanguageFilter] =
    useState<CodingLanguageFilter>(emptyCodingLanguageFilter);
  const [languagesQueryParam, setLanguagesQueryParam] = useState('');

  const handleCodingLanguageFilterChange = (codingLanguage: CodingLanguage) => {
    const newCodingLanguageFilter = {
      ...codingLanguageFilter,
      [codingLanguage]: !codingLanguageFilter[codingLanguage]
    };
    setCodingLanguageFilter(newCodingLanguageFilter);

    const languages = Object.entries(newCodingLanguageFilter)
      .reduce((languagesQueryParam: Array<string>, [language, state]: [string, boolean]) => {
        if (state) languagesQueryParam.push(language);
        return languagesQueryParam;
      }, [])
      .join(',');

    setLanguagesQueryParam(languages);

    main.getPeople({ page: 1, resetPage: true, languages });
  };

  return {
    codingLanguageFilter,
    handleCodingLanguageFilterChange,
    languagesQueryParam
  };
}
