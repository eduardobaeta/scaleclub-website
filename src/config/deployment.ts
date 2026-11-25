import { VERCEL_ENV } from 'astro:env/server';

export const isIndexable = VERCEL_ENV === 'production';
