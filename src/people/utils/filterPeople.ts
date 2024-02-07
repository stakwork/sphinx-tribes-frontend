import { SkillsFilter } from 'people/main/usePeopleFilteredSearch';
import { Person } from 'store/main';

const filterByCodingLanguage = (users: Person[], codingLanguages: SkillsFilter) => {
  const requiredLanguages = Object.keys(codingLanguages).filter(
    (key: string) => codingLanguages[key]
  );

  return users.filter((user: Person) => {
    const userCodingLanguages = (
      user.extras && user.extras.coding_languages ? user.extras.coding_languages : []
    ).map((t: { [key: string]: string }) => t.value);
    return requiredLanguages?.every((requiredLanguage: string) =>
      userCodingLanguages.includes(requiredLanguage)
    );
  });
};

export default filterByCodingLanguage;
