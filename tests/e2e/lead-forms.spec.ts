import { expect, test, type Route } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

const answerWith = (status: number, body: unknown) => (route: Route) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

test('the meeting application blocks submission while required fields are empty', async ({ page }) => {
  let requests = 0;
  await page.route('**/api/mentoring-applications/', (route) => {
    requests += 1;
    return answerWith(200, { ok: true })(route);
  });
  await page.goto('/a-mesa/');

  await page
    .locator('form[data-lead-form="mentoring-application"]')
    .getByRole('button', { name: /Quero agendar meu primeiro encontro/ })
    .click();

  expect(requests).toBe(0);
  await expect(page.locator('#mentoring-name')).toBeFocused();
});

test('the meeting application confirms only after the server accepts it', async ({ page }) => {
  let sentBody = '';
  await page.route('**/api/mentoring-applications/', (route) => {
    sentBody = route.request().postData() ?? '';
    return answerWith(200, { ok: true })(route);
  });
  await page.goto('/a-mesa/');
  const form = page.locator('form[data-lead-form="mentoring-application"]');

  await form.getByLabel('Nome').fill('Ana Souza');
  await form.getByLabel('E-mail').fill('ana@example.com');
  await form.getByLabel('WhatsApp').fill('(44) 90000-0000');
  await form.getByLabel('Empresa').fill('Empresa');
  await form.getByLabel('Cargo').fill('Sócia');
  await form.getByText('5 a 20 pessoas').click();
  await form.getByLabel(/Concordo em receber/).check();
  await form.getByRole('button', { name: /Quero agendar meu primeiro encontro/ }).click();

  await expect(form.getByRole('status')).toHaveText(/Recebemos seus dados/);
  const fields = new URLSearchParams(sentBody);
  expect(fields.get('teamSize')).toBe('5-20');
  expect(fields.get('consent')).toBe('on');
});

test('server field errors are linked to their messages and focused', async ({ page }) => {
  await page.route(
    '**/api/ebook-requests/',
    answerWith(422, { ok: false, error: { code: 'validation', fieldErrors: { email: ['Invalid email'] } } }),
  );
  await page.goto('/double-diamond/');
  const form = page.locator('form[data-lead-form="ebook-request"]');

  await form.getByLabel('Nome').fill('Ana Souza');
  await form.getByLabel('E-mail').fill('ana@example.com');
  await form.getByLabel(/Concordo em receber/).check();
  await form.getByRole('button', { name: 'Quero o ebook gratuito' }).click();

  await expect(form.getByLabel('E-mail')).toHaveAttribute('aria-invalid', 'true');
  await expect(form.getByLabel('E-mail')).toHaveAccessibleDescription('Confira o e-mail informado.');
  await expect(form.getByLabel('E-mail')).toBeFocused();
});

test('explains that sending is unavailable while no destination is configured', async ({ page }) => {
  await page.goto('/');
  const form = page.locator('form[data-lead-form="newsletter-subscription"]');

  await form.getByLabel('E-mail').fill('reader@example.com');
  await form.getByRole('button', { name: 'Assinar' }).click();

  await expect(form.getByRole('status')).toHaveText(/Não foi possível enviar agora/);
});

test('asks the visitor to wait when submissions are rate limited', async ({ page }) => {
  await page.route(
    '**/api/newsletter-subscriptions/',
    answerWith(429, { ok: false, error: { code: 'rate-limited', retryAfterSeconds: 60 } }),
  );
  await page.goto('/a-mesa/');
  const form = page.locator('form[data-lead-form="newsletter-subscription"]');

  await form.getByLabel('E-mail').fill('reader@example.com');
  await form.getByRole('button', { name: 'Assinar' }).click();

  await expect(form.getByRole('status')).toHaveText(/Muitas tentativas/);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the newsletter posts natively and lands on the confirmation page', async ({ page }) => {
    await page.route('**/api/newsletter-subscriptions/', (route) =>
      route.fulfill({ status: 303, headers: { location: '/thank-you/newsletter-subscription/' } }),
    );
    await page.goto('/double-diamond/');

    await page.locator('#newsletter-email').fill('reader@example.com');
    await page.getByRole('button', { name: 'Assinar' }).click();

    await expect(page).toHaveURL(/\/thank-you\/newsletter-subscription\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Inscrição feita/);
  });
});
