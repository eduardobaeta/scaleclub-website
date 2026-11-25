// @ts-check
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import astro from 'eslint-plugin-astro';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const featureInternals = {
  group: ['@/features/*/*'],
  message: "Import a feature through its public API ('@/features/<feature>').",
};

export default defineConfig(
  { ignores: ['dist/', '.astro/', '.vercel/', 'coverage/', 'test-results/', 'playwright-report/', 'docs/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      'no-restricted-imports': ['error', { patterns: [featureInternals] }],
    },
  },
  {
    files: ['src/components/ui/**', 'src/components/layout/**', 'src/lib/**', 'src/server/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['@/features/*', '@/features/*/*'], message: 'Shared code never imports features.' }] },
      ],
    },
  },
  {
    files: ['src/features/*/domain/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            featureInternals,
            {
              group: ['astro', 'astro:*', 'axios', '@upstash/*'],
              message: 'The domain stays free of framework and I/O.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/scripts/**', 'src/features/*/components/*.ts', 'src/lib/submit-form.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            featureInternals,
            { group: ['@/server/*', 'astro:env/server'], message: 'Client code never imports server modules.' },
          ],
        },
      ],
    },
  },
  prettier,
);
