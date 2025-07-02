import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

// the following links are full documentation on how should it be implemented.
// here we simplify as much as possible!
// https://unicode.org/reports/tr9/
// https://www.unicode.org/Public/UNIDATA/extracted/DerivedBidiClass.txt

export function getSmartTextDirection(text: string): 'ltr' | 'rtl' {
  const defaultDirection: 'ltr' | 'rtl' = 'ltr';
  if (!text || text.length === 0) return defaultDirection;

  // Regex to match "non-directional" characters: numbers, symbols, emojis, etc.
  const ignoreRegex = /[\s\d!-\/:-@\[\\\]_{-~\u200C-\u200F\u{1F000}-\u{1FFFF}\u0660-\u0669\u06F0-\u06F9\u060C\uFEFF\u061B\u061F]/gu;

  // Remove ignored characters from the start
  const meaningfulText = text.trim().replace(ignoreRegex, '');
  if (!meaningfulText || meaningfulText.length === 0) return defaultDirection;

  const firstChar = meaningfulText[0];
  const code = firstChar.codePointAt(0);
  if (code === undefined) return defaultDirection;

  const rtlRanges = [
    [0x0590, 0x08FF],
    [0xFB1D, 0xFDFF],
    [0xFE70, 0xFEFF],
    [0x10800, 0x10FFF],
  ];

  for (const [start, end] of rtlRanges) {
    if (code >= start && code <= end) {
      return 'rtl';
    }
  }

  return 'ltr';
}

