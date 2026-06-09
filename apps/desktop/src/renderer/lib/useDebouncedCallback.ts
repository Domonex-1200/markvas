import { useRef } from "react";

export function useDebouncedCallback<T>(callback: (value: T) => void, delayMs: number): (value: T) => void {
  const timeoutRef = useRef<number | null>(null);

  return (value: T) => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => callback(value), delayMs);
  };
}
