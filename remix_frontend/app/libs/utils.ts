import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// do not add to this file. It's only purpose is to enable compatibility with shadcn-ui
// instead make a new file with your util function

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
