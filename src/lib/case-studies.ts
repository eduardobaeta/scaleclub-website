import { getCollection, type CollectionEntry } from 'astro:content';

export type CaseStudy = CollectionEntry<'cases'>;

export async function getCaseStudies(): Promise<CaseStudy[]> {
  const entries = await getCollection('cases');
  return entries.sort((first, second) => first.data.order - second.data.order);
}
