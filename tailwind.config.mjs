/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        beige: {
          light: "#f5f0e8",
          DEFAULT: "#efe6d9",
          dark: "#e5d9c8",
        },
        brown: {
          light: "#8a7a6d",
          DEFAULT: "#6A4E3C",
          dark: "#4E3B2D",
        },
        charcoal: "#333333",
        cream: "#f9f6f0",
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'ui-serif', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
