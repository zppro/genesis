import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function CreateConfirm(tip: string) {
  return (event: React.FormEvent<HTMLFormElement>) => {
    const response = confirm(
      tip
    );
    if (!response) {
      event.preventDefault();
    }
  }
}

export function calcFileSize(n: number) {
  if (n < 1e3) {
    return `${n} bytes`;
  } else if (n >= 1e3 && n < 1e6) {
    return `${(n / 1e3).toFixed(1)} KB`;
  } else {
    return `${(n / 1e6).toFixed(1)} MB`;
  }
}

export const getRandomInteger = (min: number, max: number) => {
  min = Math.ceil(min)
  max = Math.floor(max)

  return Math.floor(Math.random() * (max - min)) + min
}

export function array2Map<T>(array: Array<T>, key: keyof T) {
  return new Map(array.map(obj => [obj[key] as string, obj]));
}