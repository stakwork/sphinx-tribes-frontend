import { useState, useEffect } from 'react';

export const useLocalStorage = (key: string, defaultValue: boolean) => {
  const [value, setValue] = useState(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  });

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        setValue(event.newValue ? JSON.parse(event.newValue) : defaultValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, defaultValue]);

  const setStoredValue = (newValue: boolean) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
    // Trigger storage event to notify other tabs
    window.dispatchEvent(
      new StorageEvent('storage', {
        key,
        newValue: JSON.stringify(newValue)
      })
    );
  };

  return [value, setStoredValue] as const;
};
