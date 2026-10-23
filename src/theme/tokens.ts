// Design tokens ported from the Figma "Colors" collection.
// Accent colors are darkened versus the mockup so white button text meets WCAG 4.5:1.

export type ThemeName = 'light' | 'dark';

export type Palette = {
  surface: string;
  field: string;
  text: string;
  textMuted: string;
  shadow: string;
  highlight: string;
  border: string;
  displayBg: string;
  displayBorder: string;
  displayGreen: string;
  displayGold: string;
  displayRed: string;
  danger: string;
  success: string;
  successBg: string;
  dangerBg: string;
  note: string;
  page: string;
};

export const palettes: Record<ThemeName, Palette> = {
  light: {
    surface: '#C0C0C0',
    field: '#FFFFFF',
    text: '#000000',
    textMuted: '#4A4A4A',
    shadow: '#808080',
    highlight: '#FFFFFF',
    border: '#000000',
    displayBg: '#101040',
    displayBorder: '#3A3A90',
    displayGreen: '#8CFF8C',
    displayGold: '#F2C14E',
    displayRed: '#FF8090',
    danger: '#B8321C',
    success: '#2C7356',
    successBg: '#CFFFCF',
    dangerBg: '#FFDCDC',
    note: '#FFFFE1',
    page: '#808080',
  },
  dark: {
    surface: '#2A2A38',
    field: '#12121A',
    text: '#F2F2F8',
    textMuted: '#A8A8B8',
    shadow: '#14141C',
    highlight: '#4A4A60',
    border: '#000000',
    displayBg: '#101040',
    displayBorder: '#3A3A90',
    displayGreen: '#8CFF8C',
    displayGold: '#F2C14E',
    displayRed: '#FF8090',
    danger: '#FF8090',
    success: '#8CFF8C',
    successBg: '#1F3A2C',
    dangerBg: '#4A1E26',
    note: '#3A3A2A',
    page: '#12121A',
  },
};

/** Screen accent colors (title bar + primary button). All pass 4.5:1 with white text. */
export const accents = {
  teal: '#1D727A',
  pink: '#B23A5C',
  green: '#2C7356',
  orange: '#9A5A10',
  red: '#B8321C',
  purple: '#6B48A8',
  blue: '#1E5FB0',
} as const;

export type Accent = keyof typeof accents;

export const fonts = {
  pixel: 'PressStart2P_400Regular',
  digits: 'VT323_400Regular',
} as const;

/** 4-px spacing scale. */
export const space = (n: number) => n * 4;
