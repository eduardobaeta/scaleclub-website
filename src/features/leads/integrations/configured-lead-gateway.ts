import {
  ATTIO_API_TOKEN,
  ATTIO_DEAL_OWNER_EMAIL,
  BREVO_API_TOKEN,
  BREVO_EBOOK_LIST_ID,
  BREVO_EBOOK_TEMPLATE_ID,
  BREVO_NEWSLETTER_LIST_ID,
} from 'astro:env/server';
import { tablePriceBrl } from '@/config/prices';
import type { LeadGateway } from '../domain/lead-gateway';
import { createAttioLeadGateway } from './attio-lead-gateway';
import { createBrevoLeadGateway } from './brevo-lead-gateway';
import { createFanOutLeadGateway } from './fan-out-lead-gateway';

/** Every lead reaches the Attio CRM; e-book and newsletter leads also join their Brevo list, and e-book leads get the link. */
export function resolveConfiguredLeadGateway(): LeadGateway | null {
  if (!ATTIO_API_TOKEN || !ATTIO_DEAL_OWNER_EMAIL || !BREVO_API_TOKEN) return null;
  if (BREVO_EBOOK_LIST_ID === undefined || BREVO_NEWSLETTER_LIST_ID === undefined) return null;
  if (BREVO_EBOOK_TEMPLATE_ID === undefined) return null;

  return createFanOutLeadGateway([
    createAttioLeadGateway({
      token: ATTIO_API_TOKEN,
      dealOwnerEmail: ATTIO_DEAL_OWNER_EMAIL,
      dealValue: tablePriceBrl,
    }),
    createBrevoLeadGateway({
      apiKey: BREVO_API_TOKEN,
      listIds: { 'ebook-request': BREVO_EBOOK_LIST_ID, 'newsletter-subscription': BREVO_NEWSLETTER_LIST_ID },
      ebookTemplateId: BREVO_EBOOK_TEMPLATE_ID,
    }),
  ]);
}
