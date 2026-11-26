import type { AxiosInstance } from 'axios';
import { createHttpClient } from '@/server/http/create-http-client';
import type { Lead, LeadType, TeamSize } from '../domain/lead';
import type { LeadGateway } from '../domain/lead-gateway';

const ATTIO_API_URL = 'https://api.attio.com/v2';
const DEFAULT_TIMEOUT_MS = 8000;

/** Titles and slugs configured in the Attio workspace (docs/integrations/leads.md). */
export const LEAD_SOURCES: Record<LeadType, string> = {
  'meeting-request': 'Meeting request (site)',
  'mentoring-application': 'Mesa application',
  'ebook-request': 'Double Diamond e-book',
  'newsletter-subscription': 'Newsletter',
};

const TEAM_SIZE_OPTIONS: Record<TeamSize, string> = {
  '1-4': '1–4 people',
  '5-20': '5–20 people',
  '21-50': '21–50 people',
  '50+': '50+ people',
};

const DEAL_STAGES = { new: 'New lead', closed: ['Won 🎉', 'Lost'] };

/** Every site form sells A Mesa; other products get their own option of the deal `product` select. */
export const DEAL_PRODUCT = 'A Mesa';

export const LISTS = {
  ebook: { slug: 'ebook_double_diamond', firstStage: 'Downloaded', convertedStage: 'Converted' },
  newsletter: { slug: 'newsletter' },
};

export interface AttioLeadGatewayOptions {
  token: string;
  /** Workspace member who owns new deals; Attio requires an owner on every deal. */
  dealOwnerEmail: string;
  /** Value in BRL of every new deal (the price of A Mesa). */
  dealValue: number;
  baseUrl?: string;
  timeoutMs?: number;
}

type AttioValues = Record<string, unknown>;

interface PersonInput {
  email: string;
  name?: string;
  whatsapp?: string;
  role?: string;
  instagram?: string;
  companyId?: string;
}

interface DealInput {
  title: string;
  personId: string;
  companyId?: string;
  teamSize?: TeamSize;
  problem?: string;
}

interface ListEntry {
  listSlug: string;
  entryId: string;
}

export function createAttioLeadGateway({
  token,
  dealOwnerEmail,
  dealValue,
  baseUrl = ATTIO_API_URL,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: AttioLeadGatewayOptions): LeadGateway {
  const client = createHttpClient({
    baseURL: baseUrl,
    timeout: timeoutMs,
    headers: { authorization: `Bearer ${token}` },
  });

  const assertPerson = (source: LeadType, person: PersonInput) =>
    writeRecord(
      client,
      'put',
      '/objects/people/records?matching_attribute=email_addresses',
      personValues(source, person),
    );

  /** A person keeps a single open deal per product: a second form updates it instead of opening another. */
  async function upsertOpenDeal(source: LeadType, deal: DealInput): Promise<void> {
    const openDealId = await findOpenDeal(client, deal.personId);
    if (openDealId) {
      await client.patch(`/objects/deals/records/${openDealId}`, { data: { values: dealUpdateValues(source, deal) } });
      return;
    }
    await writeRecord(client, 'post', '/objects/deals/records', dealValues(source, deal, dealOwnerEmail, dealValue));
  }

  async function markEbookConverted(personId: string): Promise<void> {
    const entry = (await listEntriesOf(client, personId)).find(({ listSlug }) => listSlug === LISTS.ebook.slug);
    if (!entry) return;
    await client.patch(`/lists/${LISTS.ebook.slug}/entries/${entry.entryId}`, {
      data: { entry_values: { stage: LISTS.ebook.convertedStage } },
    });
  }

  /** Re-adding an existing member would reset its stage, so only people outside the list get an entry. */
  async function addToList(listSlug: string, personId: string, entryValues: AttioValues = {}): Promise<void> {
    const entries = await listEntriesOf(client, personId);
    if (entries.some((entry) => entry.listSlug === listSlug)) return;
    await client.post(`/lists/${listSlug}/entries`, {
      data: { parent_record_id: personId, parent_object: 'people', entry_values: entryValues },
    });
  }

  return {
    async submit(lead: Lead): Promise<void> {
      switch (lead.type) {
        case 'meeting-request': {
          const { name, email, whatsapp } = lead.data;
          const personId = await assertPerson(lead.type, { name, email, whatsapp });
          await upsertOpenDeal(lead.type, { title: name, personId });
          await markEbookConverted(personId);
          return;
        }
        case 'mentoring-application': {
          const { name, email, whatsapp, company, role, teamSize, problem } = lead.data;
          const companyId = await findOrCreateCompany(client, company);
          const personId = await assertPerson(lead.type, { name, email, whatsapp, role, companyId });
          await upsertOpenDeal(lead.type, { title: company, personId, companyId, teamSize, problem });
          await markEbookConverted(personId);
          return;
        }
        case 'ebook-request': {
          const { name, email, instagram } = lead.data;
          const personId = await assertPerson(lead.type, { name, email, instagram });
          await addToList(LISTS.ebook.slug, personId, { stage: LISTS.ebook.firstStage });
          return;
        }
        case 'newsletter-subscription': {
          const personId = await assertPerson(lead.type, { email: lead.data.email });
          await addToList(LISTS.newsletter.slug, personId);
        }
      }
    },
  };
}

async function findOrCreateCompany(client: AxiosInstance, name: string): Promise<string> {
  const response = await client.post<unknown>('/objects/companies/records/query', {
    filter: { name: { $eq: name } },
    limit: 1,
  });
  const existing = recordsOf(response.data)[0]?.id;
  return existing ?? writeRecord(client, 'post', '/objects/companies/records', { name });
}

async function findOpenDeal(client: AxiosInstance, personId: string): Promise<string | undefined> {
  const response = await client.post<unknown>('/objects/deals/records/query', {
    filter: { associated_people: { target_object: 'people', target_record_id: personId }, product: DEAL_PRODUCT },
    limit: 20,
  });
  return recordsOf(response.data).find(({ stage }) => !stage || !DEAL_STAGES.closed.includes(stage))?.id;
}

async function listEntriesOf(client: AxiosInstance, personId: string): Promise<ListEntry[]> {
  const response = await client.get<unknown>(`/objects/people/records/${personId}/entries`);
  const entries = dataOf(response.data);
  if (!Array.isArray(entries)) return [];
  return entries.flatMap((entry: unknown) => {
    const listSlug = field(entry, 'list_api_slug');
    const entryId = field(entry, 'entry_id');
    return typeof listSlug === 'string' && typeof entryId === 'string' ? [{ listSlug, entryId }] : [];
  });
}

async function writeRecord(client: AxiosInstance, method: 'put' | 'post', path: string, values: AttioValues) {
  const response = await client[method]<unknown>(path, { data: { values } });
  const recordId = recordsOf({ data: [dataOf(response.data)] })[0]?.id;
  if (!recordId) throw new Error('Attio did not confirm the record');
  return recordId;
}

function personValues(source: LeadType, { email, name, whatsapp, role, instagram, companyId }: PersonInput) {
  const values: AttioValues = { email_addresses: [email], lead_source: LEAD_SOURCES[source] };
  if (name) values.name = [personalName(name)];
  if (whatsapp) values.phone_numbers = [{ original_phone_number: toE164(whatsapp), country_code: 'BR' }];
  if (role) values.job_title = role;
  if (instagram) values.instagram = instagram;
  if (companyId) values.company = [{ target_object: 'companies', target_record_id: companyId }];
  return values;
}

function dealValues(source: LeadType, deal: DealInput, ownerEmail: string, value: number) {
  return {
    product: DEAL_PRODUCT,
    stage: DEAL_STAGES.new,
    owner: ownerEmail,
    value,
    associated_people: [{ target_object: 'people', target_record_id: deal.personId }],
    ...dealUpdateValues(source, deal),
  };
}

/** What a later form adds to an open deal; stage, owner and value stay as the team left them. */
function dealUpdateValues(source: LeadType, deal: DealInput) {
  const values: AttioValues = { name: `Mesa · ${deal.title}`, lead_source: LEAD_SOURCES[source] };
  if (deal.companyId) values.associated_company = [{ target_object: 'companies', target_record_id: deal.companyId }];
  if (deal.teamSize) values.team_size = TEAM_SIZE_OPTIONS[deal.teamSize];
  if (deal.problem) values.problem = deal.problem;
  return values;
}

function personalName(fullName: string) {
  const [firstName = fullName, ...rest] = fullName.trim().split(/\s+/);
  return { first_name: firstName, last_name: rest.join(' '), full_name: fullName.trim() };
}

/** The form keeps digits only; a 12+ digit number already carries Brazil's country code (55). */
export function toE164(digits: string): string {
  return digits.length >= 12 && digits.startsWith('55') ? `+${digits}` : `+55${digits}`;
}

function field(value: unknown, key: string): unknown {
  if (typeof value !== 'object' || value === null) return undefined;
  const entries: [string, unknown][] = Object.entries(value);
  return entries.find(([name]) => name === key)?.[1];
}

function dataOf(body: unknown): unknown {
  return field(body, 'data');
}

function recordsOf(body: unknown): { id: string; stage?: string }[] {
  const records = dataOf(body);
  if (!Array.isArray(records)) return [];
  return records.flatMap((record: unknown) => {
    const id = field(field(record, 'id'), 'record_id');
    if (typeof id !== 'string') return [];
    const stageValues = field(field(record, 'values'), 'stage');
    const stage = Array.isArray(stageValues) ? field(field(stageValues[0], 'status'), 'title') : undefined;
    return [{ id, stage: typeof stage === 'string' ? stage : undefined }];
  });
}
