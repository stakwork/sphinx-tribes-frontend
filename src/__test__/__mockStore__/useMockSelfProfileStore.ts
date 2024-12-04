import { user } from '__test__/__mockData__/user';
import { useEffect } from 'react';
import { useStores } from 'store';
import { Person } from 'store/interface';

export const useMockSelfProfileStore = ({ enabled }: { enabled: boolean }) => {
  const { ui, main } = useStores();

  useEffect(() => {
    if (enabled) {
      ui.setMeInfo(user);
      ui.setSelectedPerson(user.id);
      const person = {
        ...user,
        unique_name: Math.random().toString(36).substring(7),
        tags: []
      } as Person;
      main.setActivePerson(person);
    }
  }, [main, ui, enabled]);
};
