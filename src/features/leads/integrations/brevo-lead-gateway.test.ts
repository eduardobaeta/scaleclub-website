import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createBrevoLeadGateway } from './brevo-lead-gateway';

const BASE_URL = 'https://brevo.example/v3';
const server = setupServer();
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const gateway = createBrevoLeadGateway({
  apiKey: 'test-key',
  listIds: { 'ebook-request': 7, 'newsletter-subscription': 8 },
  ebookTemplateId: 42,
  baseUrl: BASE_URL,
});

function recordContacts(response: () => Response = () => new HttpResponse(null, { status: 204 })) {
  const requests: Request[] = [];
  server.use(
    http.post(`${BASE_URL}/contacts`, ({ request }) => {
      requests.push(request.clone());
      return response();
    }),
  );
  return requests;
}

function recordEmails(
  response: () => Response = () => HttpResponse.json({ messageId: '<id@brevo>' }, { status: 201 }),
) {
  const requests: Request[] = [];
  server.use(
    http.post(`${BASE_URL}/smtp/email`, ({ request }) => {
      requests.push(request.clone());
      return response();
    }),
  );
  return requests;
}

describe('createBrevoLeadGateway', () => {
  it('adds an e-book lead to its list with the name split for personalization', async () => {
    const requests = recordContacts();
    recordEmails();

    await gateway.submit({ type: 'ebook-request', data: { name: 'Ana Maria Souza', email: 'ana@example.com' } });

    expect(requests[0]?.headers.get('api-key')).toBe('test-key');
    expect(await requests[0]?.json()).toEqual({
      email: 'ana@example.com',
      attributes: { FIRSTNAME: 'Ana', LASTNAME: 'Maria Souza' },
      listIds: [7],
      updateEnabled: true,
    });
  });

  it('sends the e-book e-mail after the contact is saved', async () => {
    recordContacts();
    const emails = recordEmails();

    await gateway.submit({ type: 'ebook-request', data: { name: 'Ana Maria', email: 'ana@example.com' } });

    expect(await emails[0]?.json()).toEqual({
      templateId: 42,
      to: [{ email: 'ana@example.com', name: 'Ana Maria' }],
      params: { FIRSTNAME: 'Ana' },
    });
  });

  it('rejects an e-book lead when the e-mail is refused, so the visitor can retry', async () => {
    recordContacts();
    recordEmails(() => HttpResponse.json({ code: 'invalid_parameter' }, { status: 400 }));

    await expect(
      gateway.submit({ type: 'ebook-request', data: { name: 'Ana', email: 'ana@example.com' } }),
    ).rejects.toEqual({ code: 'validation' });
  });

  it('adds a newsletter subscriber without attributes or e-mail', async () => {
    const requests = recordContacts();
    const emails = recordEmails();

    await gateway.submit({ type: 'newsletter-subscription', data: { email: 'ana@example.com' } });

    expect(await requests[0]?.json()).toMatchObject({ email: 'ana@example.com', attributes: {}, listIds: [8] });
    expect(emails).toHaveLength(0);
  });

  it('ignores lead types without a list', async () => {
    const requests = recordContacts();

    await gateway.submit({ type: 'meeting-request', data: { name: 'Ana', email: 'ana@example.com' } });

    expect(requests).toHaveLength(0);
  });

  it('rejects with a normalized error when Brevo refuses the contact', async () => {
    recordContacts(() => HttpResponse.json({ code: 'unauthorized' }, { status: 401 }));

    await expect(
      gateway.submit({ type: 'newsletter-subscription', data: { email: 'ana@example.com' } }),
    ).rejects.toEqual({ code: 'unauthenticated' });
  });
});
