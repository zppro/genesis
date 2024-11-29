import { useState, useEffect } from "react"

export const useLocalStorage = <T>(key: string, fallbackState: T) => {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') {
      return fallbackState
    }
    let item = window.localStorage.getItem(key)
    return JSON.parse(item ? item : "null") as T ?? fallbackState
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [value, key]);
  return [value, setValue];
};

export const useLocalStorage2 = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}