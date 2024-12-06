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