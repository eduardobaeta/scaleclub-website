import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import type { Lead } from '../domain/lead';
import { createAttioLeadGateway, DEAL_PRODUCT, LEAD_SOURCES, LISTS, toE164 } from './attio-lead-gateway';

const DEAL_VALUE = 4500;

const BASE_URL = 'https://attio.example/v2';
const OWNER = 'owner@example.com';

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const record = (recordId: string) => HttpResponse.json({ data: { id: { record_id: recordId } } });

interface Captured {
  method: string;
  path: string;
  body: unknown;
}

interface Workspace {
  existingCompanyId?: string;
  deals?: { id: string; stage: string }[];
  entries?: { list: string; id: string }[];
}

function attio({ existingCompanyId, deals = [], entries = [] }: Workspace = {}) {
  const requests: Captured[] = [];
  const capture = async (request: Request) => {
    const url = new URL(request.url);
    const body: unknown = request.method === 'GET' ? undefined : await request.json();
    requests.push({ method: request.method, path: url.pathname.replace('/v2', '') + url.search, body });
  };
  server.use(
    http.put(`${BASE_URL}/objects/people/records`, async ({ request }) => (await capture(request), record('person-1'))),
    http.get(`${BASE_URL}/objects/people/records/person-1/entries`, async ({ request }) => {
      await capture(request);
      return HttpResponse.json({ data: entries.map(({ list, id }) => ({ list_api_slug: list, entry_id: id })) });
    }),
    http.post(`${BASE_URL}/objects/deals/records/query`, async ({ request }) => {
      await capture(request);
      return HttpResponse.json({
        data: deals.map(({ id, stage }) => ({
          id: { record_id: id },
          values: { stage: [{ status: { title: stage } }] },
        })),
      });
    }),
    http.post(`${BASE_URL}/objects/deals/records`, async ({ request }) => (await capture(request), record('deal-new'))),
    http.patch(
      `${BASE_URL}/objects/deals/records/:id`,
      async ({ request }) => (await capture(request), record('deal')),
    ),
    http.post(`${BASE_URL}/objects/companies/records/query`, async ({ request }) => {
      await capture(request);
      return HttpResponse.json({ data: existingCompanyId ? [{ id: { record_id: existingCompanyId } }] : [] });
    }),
    http.post(
      `${BASE_URL}/objects/companies/records`,
      async ({ request }) => (await capture(request), record('company-new')),
    ),
    http.post(
      `${BASE_URL}/lists/:list/entries`,
      async ({ request }) => (await capture(request), HttpResponse.json({})),
    ),
    http.patch(
      `${BASE_URL}/lists/:list/entries/:entry`,
      async ({ request }) => (await capture(request), HttpResponse.json({})),
    ),
  );
  return requests;
}

const calls = (requests: Captured[]) => requests.map(({ method, path }) => `${method} ${path}`);
const valuesOf = (captured: Captured | undefined): unknown => {
  const body = captured?.body;
  const data = typeof body === 'object' && body !== null && 'data' in body ? body.data : undefined;
  return typeof data === 'object' && data !== null && 'values' in data ? data.values : undefined;
};

const gateway = (timeoutMs?: number) =>
  createAttioLeadGateway({
    token: 'test-token',
    dealOwnerEmail: OWNER,
    dealValue: DEAL_VALUE,
    baseUrl: BASE_URL,
    timeoutMs,
  });

const meetingRequest: Lead = {
  type: 'meeting-request',
  data: { name: 'Ana Maria Souza', email: 'ana@example.com', whatsapp: '44999990000' },
};

describe('createAttioLeadGateway', () => {
  it('upserts the person and opens a deal for a first meeting request', async () => {
    const requests = attio();

    await gateway().submit(meetingRequest);

    expect(calls(requests)).toEqual([
      'PUT /objects/people/records?matching_attribute=email_addresses',
      'POST /objects/deals/records/query',
      'POST /objects/deals/records',
      'GET /objects/people/records/person-1/entries',
    ]);
    expect(valuesOf(requests[0])).toEqual({
      email_addresses: ['ana@example.com'],
      lead_source: LEAD_SOURCES['meeting-request'],
      name: [{ first_name: 'Ana', last_name: 'Maria Souza', full_name: 'Ana Maria Souza' }],
      phone_numbers: [{ original_phone_number: '+5544999990000', country_code: 'BR' }],
    });
    expect(valuesOf(requests[2])).toEqual({
      name: 'Mesa · Ana Maria Souza',
      product: DEAL_PRODUCT,
      stage: 'New lead',
      owner: OWNER,
      value: DEAL_VALUE,
      lead_source: LEAD_SOURCES['meeting-request'],
      associated_people: [{ target_object: 'people', target_record_id: 'person-1' }],
    });
  });

  it('updates the open deal instead of opening a second one', async () => {
    const requests = attio({
      existingCompanyId: 'company-1',
      deals: [{ id: 'deal-open', stage: 'First meeting' }],
    });

    await gateway().submit({
      type: 'mentoring-application',
      data: {
        name: 'Ana',
        email: 'ana@example.com',
        whatsapp: '5544999990000',
        company: 'Empresa',
        role: 'Sócia',
        teamSize: '5-20',
        problem: 'Vendas instáveis',
      },
    });

    expect(calls(requests)).toContain('PATCH /objects/deals/records/deal-open');
    expect(calls(requests)).not.toContain('POST /objects/deals/records');
    expect(requests.find(({ path }) => path === '/objects/deals/records/query')?.body).toMatchObject({
      filter: { product: DEAL_PRODUCT },
    });
    expect(valuesOf(requests.find(({ method }) => method === 'PATCH'))).toEqual({
      name: 'Mesa · Empresa',
      lead_source: LEAD_SOURCES['mentoring-application'],
      associated_company: [{ target_object: 'companies', target_record_id: 'company-1' }],
      team_size: '5–20 people',
      problem: 'Vendas instáveis',
    });
    expect(valuesOf(requests[1])).toMatchObject({
      job_title: 'Sócia',
      phone_numbers: [{ original_phone_number: '+5544999990000', country_code: 'BR' }],
      company: [{ target_object: 'companies', target_record_id: 'company-1' }],
    });
  });

  it('opens a new deal when the earlier ones are closed', async () => {
    const requests = attio({
      deals: [
        { id: 'deal-won', stage: 'Won 🎉' },
        { id: 'deal-lost', stage: 'Lost' },
      ],
    });

    await gateway().submit(meetingRequest);

    expect(calls(requests)).toContain('POST /objects/deals/records');
  });

  it('creates the company when none has that name', async () => {
    const requests = attio();

    await gateway().submit({
      type: 'mentoring-application',
      data: { name: 'Ana', email: 'ana@example.com', whatsapp: '44999990000', company: 'Nova', role: 'CEO' },
    });

    expect(requests[1]).toMatchObject({
      path: '/objects/companies/records',
      body: { data: { values: { name: 'Nova' } } },
    });
  });

  it('moves an e-book reader to "Converted" when they ask for a meeting', async () => {
    const requests = attio({ entries: [{ list: LISTS.ebook.slug, id: 'entry-1' }] });

    await gateway().submit(meetingRequest);

    expect(requests.at(-1)).toEqual({
      method: 'PATCH',
      path: `/lists/${LISTS.ebook.slug}/entries/entry-1`,
      body: { data: { entry_values: { stage: LISTS.ebook.convertedStage } } },
    });
  });

  it('adds an e-book request to the e-book list in its first stage', async () => {
    const requests = attio();

    await gateway().submit({
      type: 'ebook-request',
      data: { name: 'Ana', email: 'ana@example.com', instagram: '@ana' },
    });

    expect(valuesOf(requests[0])).toMatchObject({ instagram: '@ana', lead_source: LEAD_SOURCES['ebook-request'] });
    expect(requests.at(-1)).toEqual({
      method: 'POST',
      path: `/lists/${LISTS.ebook.slug}/entries`,
      body: {
        data: {
          parent_record_id: 'person-1',
          parent_object: 'people',
          entry_values: { stage: LISTS.ebook.firstStage },
        },
      },
    });
  });

  it('keeps an existing list entry untouched so its stage is not reset', async () => {
    const requests = attio({ entries: [{ list: LISTS.newsletter.slug, id: 'entry-1' }] });

    await gateway().submit({ type: 'newsletter-subscription', data: { email: 'ana@example.com' } });

    expect(calls(requests)).toEqual([
      'PUT /objects/people/records?matching_attribute=email_addresses',
      'GET /objects/people/records/person-1/entries',
    ]);
  });

  it('rejects when Attio answers without a record', async () => {
    server.use(http.put(`${BASE_URL}/objects/people/records`, () => HttpResponse.json({ data: {} })));

    await expect(
      gateway().submit({ type: 'newsletter-subscription', data: { email: 'ana@example.com' } }),
    ).rejects.toThrow('did not confirm');
  });

  it('rejects with a normalized error when Attio fails or times out', async () => {
    server.use(http.put(`${BASE_URL}/objects/people/records`, () => new HttpResponse(null, { status: 500 })));
    await expect(
      gateway().submit({ type: 'newsletter-subscription', data: { email: 'ana@example.com' } }),
    ).rejects.toEqual({ code: 'unavailable' });

    server.use(
      http.put(`${BASE_URL}/objects/people/records`, async () => {
        await delay(200);
        return record('late');
      }),
    );
    await expect(
      gateway(20).submit({ type: 'newsletter-subscription', data: { email: 'ana@example.com' } }),
    ).rejects.toEqual({ code: 'timeout' });
  });
});

describe('toE164', () => {
  it('adds the Brazilian country code only when it is missing', () => {
    expect(toE164('44999990000')).toBe('+5544999990000');
    expect(toE164('5544999990000')).toBe('+5544999990000');
    expect(toE164('4433330000')).toBe('+554433330000');
  });
});
