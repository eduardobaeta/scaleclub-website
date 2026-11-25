import type { LeadType } from '@/features/leads';

export const routes = {
  home: '/',
  table: '/a-mesa/',
  doubleDiamond: '/double-diamond/',
} as const;

export const sectionLink = (page: string, section: string): string => `${page}#${section}`;

export const caseStudyPath = (slug: string): string => `/casos/${slug}/`;
export const formErrorPath = '/form-error/';

export const thankYouPath = (form: LeadType): string => `/thank-you/${form}/`;

export const leadEndpoints: Record<LeadType, string> = {
  'meeting-request': '/api/meeting-requests/',
  'mentoring-application': '/api/mentoring-applications/',
  'ebook-request': '/api/ebook-requests/',
  'newsletter-subscription': '/api/newsletter-subscriptions/',
};
