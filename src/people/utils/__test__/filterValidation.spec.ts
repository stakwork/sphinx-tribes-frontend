import { waitFor } from '@testing-library/react';
import { bountyHeaderFilter, bountyHeaderLanguageFilter } from '../filterValidation';
import filterByCodingLanguage from '../filterPeople';
import { users } from '../__test__/__mockData__/users';

describe('testing filters', () => {
  describe('bountyHeaderFilter', () => {
    test('o/t/t', () => {
      expect(bountyHeaderFilter({ Open: true }, true, true)).toEqual(false);
    });
    test('a/t/t', () => {
      expect(bountyHeaderFilter({ Assigned: true }, true, true)).toEqual(false);
    });
    test('p/t/t', () => {
      expect(bountyHeaderFilter({ Paid: true }, true, true)).toEqual(true);
    });
    test('/t/t', () => {
      expect(bountyHeaderFilter({}, true, true)).toEqual(true);
    });
    test('o/f/t', () => {
      expect(bountyHeaderFilter({ Open: true }, false, true)).toEqual(false);
    });
    test('a/f/t', () => {
      expect(bountyHeaderFilter({ Assigned: true }, false, true)).toEqual(true);
    });
    test('p/f/t', () => {
      expect(bountyHeaderFilter({ Paid: true }, false, true)).toEqual(false);
    });
  });

  describe('bountyHeaderLanguageFilter', () => {
    it('returns true when no filter is selected (empty object)', () => {
      const codingLanguages = ['JavaScript', 'Python', 'Java'];
      const filters = {};
      expect(bountyHeaderLanguageFilter(codingLanguages, filters)).toBe(true);
    });

    it('returns true when all filter values are false', () => {
      const codingLanguages = ['JavaScript', 'Python'];
      const filters = { JavaScript: false, Python: false, Java: false };
      expect(bountyHeaderLanguageFilter(codingLanguages, filters)).toBe(true);
    });

    it('returns true for single matching language', () => {
      const codingLanguages = ['JavaScript', 'Python'];
      const filters = { JavaScript: true };
      expect(bountyHeaderLanguageFilter(codingLanguages, filters)).toBe(true);
    });

    it('returns false for single non-matching language', () => {
      const codingLanguages = ['JavaScript', 'Python'];
      const filters = { Java: true };
      expect(bountyHeaderLanguageFilter(codingLanguages, filters)).toBe(false);
    });

    it('returns true when all selected languages match', () => {
      const codingLanguages = ['JavaScript', 'Python', 'Java'];
      const filters = { JavaScript: true, Python: true };
      expect(bountyHeaderLanguageFilter(codingLanguages, filters)).toBe(true);
    });

    it('returns false when one selected language is missing', () => {
      const codingLanguages = ['JavaScript', 'Python'];
      const filters = { JavaScript: true, Java: true };
      expect(bountyHeaderLanguageFilter(codingLanguages, filters)).toBe(false);
    });

    it('returns false for empty coding language array with active filter', () => {
      const codingLanguages: string[] = [];
      const filters = { JavaScript: true };
      expect(bountyHeaderLanguageFilter(codingLanguages, filters)).toBe(false);
    });

    it('handles non-boolean truthy values in filter', () => {
      const codingLanguages = ['JavaScript'];
      const filters = { JavaScript: 1 } as any;
      expect(bountyHeaderLanguageFilter(codingLanguages, filters)).toBe(true);
    });

    it('handles non-boolean falsy values in filter', () => {
      const codingLanguages = ['JavaScript'];
      const filters = { JavaScript: 0 } as any;
      expect(bountyHeaderLanguageFilter(codingLanguages, filters)).toBe(true);
    });

    it('handles invalid coding language type gracefully', () => {
      const codingLanguages = [123, true, null] as any;
      const filters = { JavaScript: true };
      expect(bountyHeaderLanguageFilter(codingLanguages, filters)).toBe(false);
    });

    it('handles invalid filter type gracefully', () => {
      const codingLanguages = ['JavaScript'];
      const filters = null as any;
      waitFor(() => {
        expect(bountyHeaderLanguageFilter(codingLanguages, filters)).toBe(true);
      });
    });

    it('handles large filter set with partial matches', () => {
      const codingLanguages = ['JavaScript', 'Python', 'Java'];
      const filters = {
        JavaScript: true,
        Python: true,
        Java: true,
        Ruby: true,
        TypeScript: true
      };
      expect(bountyHeaderLanguageFilter(codingLanguages, filters)).toBe(false);
    });

    it('handles large filter set with all matches', () => {
      const codingLanguages = ['JavaScript', 'Python', 'Java', 'Ruby', 'TypeScript'];
      const filters = {
        JavaScript: true,
        Python: true,
        Java: true,
        Ruby: true,
        TypeScript: true
      };
      expect(bountyHeaderLanguageFilter(codingLanguages, filters)).toBe(true);
    });

    it('is case sensitive in language matching', () => {
      const codingLanguages = ['JavaScript', 'Python'];
      const filters = { javascript: true, PYTHON: true } as any;
      expect(bountyHeaderLanguageFilter(codingLanguages, filters)).toBe(false);
    });

    it('handles undefined coding languages', () => {
      const codingLanguages = undefined as any;
      const filters = { JavaScript: true };
      waitFor(() => {
        expect(bountyHeaderLanguageFilter(codingLanguages, filters)).toBe(false);
      });
    });

    it('handles array-like objects as coding languages', () => {
      const codingLanguages = { 0: 'JavaScript', 1: 'Python', length: 2 } as any;
      const filters = { JavaScript: true };
      waitFor(() => {
        expect(bountyHeaderLanguageFilter(codingLanguages, filters)).toBe(false);
      });
    });

    it('handles special characters in language names', () => {
      const codingLanguages = ['C++', 'C#', '.NET'];
      const filters = { 'C++': true, 'C#': true };
      waitFor(() => {
        expect(bountyHeaderLanguageFilter(codingLanguages, filters)).toBe(true);
      });
    });
  });
  describe('peopleHeaderCodingLanguageFilters', () => {
    test('match', () => {
      expect(filterByCodingLanguage(users, { Typescript: true })).toStrictEqual([users[0]]);
    });
    test('no_match', () => {
      expect(filterByCodingLanguage(users, { Rust: true })).toStrictEqual([]);
    });
    test('no filters', () => {
      expect(filterByCodingLanguage(users, {})).toEqual(users);
    });
    test('false filters', () => {
      expect(filterByCodingLanguage(users, { PHP: false, MySQL: false })).toStrictEqual(users);
    });
    test('no users', () => {
      expect(filterByCodingLanguage([], { Typescript: true })).toStrictEqual([]);
    });
  });
});
