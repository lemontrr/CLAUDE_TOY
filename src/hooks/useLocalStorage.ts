import { useState } from "react"

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return defaultValue
      return JSON.parse(raw) as T
    } catch {
      return defaultValue
    }
  })

  function setValue(value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Silently ignore storage errors (e.g. quota exceeded)
    }
    setStoredValue(value)
  }

  return [storedValue, setValue]
}
