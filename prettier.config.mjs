/** @type {import('prettier').Config} */
export default {
  printWidth: 120,
  singleQuote: true,
  semi: true,
  trailingComma: 'all',
  plugins: ['prettier-plugin-astro', 'prettier-plugin-tailwindcss'],
  tailwindStylesheet: './src/styles/globals.css',
  overrides: [{ files: '*.astro', options: { parser: 'astro' } }],
};
