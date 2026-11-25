import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { companyKeys } from '@/config/content/companies';

const figure = z.object({ value: z.string(), label: z.string() });

const cases = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/cases' }),
  schema: z.object({
    order: z.number().int(),
    company: z.enum(companyKeys),
    year: z.string(),
    tag: z.string(),
    title: z.string(),
    description: z.string(),
    subtitle: z.string(),
    intro: z.string(),
    result: figure,
    scope: z.array(z.string()).min(1),
    stats: z.array(figure).length(3),
    areas: z.array(z.string()).optional(),
  }),
});

export const collections = { cases };
