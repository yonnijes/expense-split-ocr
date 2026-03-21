import type { Config } from 'tailwindcss';

export default {
  content: [
    './apps/web-portal/app/**/*.{ts,tsx}',
    './apps/web-portal/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
