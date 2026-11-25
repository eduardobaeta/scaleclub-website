export const TEAM_SIZES = ['1-4', '5-20', '21-50', '50+'] as const;
export type TeamSize = (typeof TEAM_SIZES)[number];

export interface MeetingRequest {
  name: string;
  email: string;
  /** Digits only, including the area code. */
  whatsapp?: string;
}

export interface MentoringApplication {
  name: string;
  email: string;
  whatsapp: string;
  company: string;
  role: string;
  teamSize?: TeamSize;
  problem?: string;
}

export interface EbookRequest {
  name: string;
  email: string;
  instagram?: string;
}

export interface NewsletterSubscription {
  email: string;
}

export type Lead =
  | { type: 'meeting-request'; data: MeetingRequest }
  | { type: 'mentoring-application'; data: MentoringApplication }
  | { type: 'ebook-request'; data: EbookRequest }
  | { type: 'newsletter-subscription'; data: NewsletterSubscription };

export type LeadType = Lead['type'];
