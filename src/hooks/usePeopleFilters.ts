import filterByCodingLanguage from 'people/utils/filterPeople';
import { useState } from 'react';
import { useStores } from 'store';
import type { Person } from 'store/main';
import type { CodingLanguage } from 'people/utils/languageLabelStyle';
import { useFuse } from './useFuse';

export type CodingLanguageFilter = Record<CodingLanguage, boolean>;

const emptyCodingLanguageFilter = {} as CodingLanguageFilter;

/**
 * Filter people list by search string and selected language
 */
export default function usePeopleFilters() {
  const { main } = useStores();
  const [codingLanguageFilter, setCodingLanguageFilter] =
    useState<CodingLanguageFilter>(emptyCodingLanguageFilter);
  let people = filterByCodingLanguage(
    useFuse(main.people, ['owner_alias']).filter((p: Person) => !p.hide) || [],
    codingLanguageFilter
  );

  const handleCodingLanguageFilterChange = (codingLanguage: CodingLanguage) => {
    const newCodingLanguageFilter = {
      ...codingLanguageFilter,
      [codingLanguage]: !codingLanguageFilter[codingLanguage]
    };
    setCodingLanguageFilter(newCodingLanguageFilter);

    people = filterByCodingLanguage(people, newCodingLanguageFilter);
  };

  return {
    codingLanguageFilter,
    handleCodingLanguageFilterChange,
    people
  };
}
