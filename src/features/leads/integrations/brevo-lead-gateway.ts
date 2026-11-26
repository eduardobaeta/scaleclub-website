import { createHttpClient } from '@/server/http/create-http-client';
import type { Lead, LeadType } from '../domain/lead';
import type { LeadGateway } from '../domain/lead-gateway';

const BREVO_API_URL = 'https://api.brevo.com/v3';
const DEFAULT_TIMEOUT_MS = 8000;

export interface BrevoLeadGatewayOptions {
  apiKey: string;
  /** Brevo list per lead type; lead types without a list are not sent to Brevo. */
  listIds: Partial<Record<LeadType, number>>;
  /** Transactional template that delivers the e-book link (source: docs/integrations/brevo-ebook-email.html). */
  ebookTemplateId: number;
  baseUrl?: string;
  timeoutMs?: number;
}

export function createBrevoLeadGateway({
  apiKey,
  listIds,
  ebookTemplateId,
  baseUrl = BREVO_API_URL,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: BrevoLeadGatewayOptions): LeadGateway {
  const client = createHttpClient({ baseURL: baseUrl, timeout: timeoutMs, headers: { 'api-key': apiKey } });

  return {
    async submit(lead: Lead): Promise<void> {
      const listId = listIds[lead.type];
      if (listId === undefined) return;

      const contact = brevoContact(lead, listId);
      await client.post('/contacts', contact);
      if (lead.type !== 'ebook-request') return;

      await client.post('/smtp/email', {
        templateId: ebookTemplateId,
        to: [{ email: lead.data.email, name: lead.data.name }],
        params: { FIRSTNAME: contact.attributes.FIRSTNAME ?? lead.data.name },
      });
    },
  };
}

/** `updateEnabled` turns a repeated e-mail into an update instead of a duplicate error. */
function brevoContact(lead: Lead, listId: number) {
  const name = 'name' in lead.data ? lead.data.name.trim() : '';
  const [firstName, ...rest] = name ? name.split(/\s+/) : [];
  const attributes: { FIRSTNAME?: string; LASTNAME?: string } = firstName
    ? { FIRSTNAME: firstName, LASTNAME: rest.join(' ') }
    : {};
  return { email: lead.data.email, attributes, listIds: [listId], updateEnabled: true };
}
