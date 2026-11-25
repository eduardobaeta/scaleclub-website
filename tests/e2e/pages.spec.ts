import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

const pages = [
  { path: '/', heading: /Estruture melhor/ },
  { path: '/a-mesa/', heading: /Da recorrência do problema/ },
  { path: '/double-diamond/', heading: /Resolva o problema certo/ },
  { path: '/casos/fatorcard/', heading: /De uma operação recém-adquirida/ },
  { path: '/casos/prospera/', heading: /aquisição pela Consilux/ },
];

for (const { path, heading } of pages) {
  test(`${path} renders one h1, landmarks, language and canonical`, async ({ page }) => {
    await page.goto(path);

    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://site.example${path}`);
  });

  test(`${path} has no automatically detectable WCAG A/AA violations`, async ({ page }) => {
    await page.goto(path);

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();

    expect(results.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) }))).toEqual([]);
  });
}

test('keeps preview deployments out of search results', async ({ page, request }) => {
  await page.goto('/');

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /');
});

test('offers a skip link to the main content', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');

  await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused();
});

test('desktop navigation reaches the A Mesa page sections', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Desktop navigation only');
  await page.goto('/a-mesa/');

  await page
    .getByRole('navigation', { name: 'Navegação principal' })
    .getByRole('link', { name: 'Investimento' })
    .click();

  await expect(page).toHaveURL(/#investimento$/);
  await expect(page.getByRole('heading', { name: 'Investimento' })).toBeInViewport();
});

test('mobile menu opens, navigates and closes with the keyboard', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'Mobile menu only');
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Abrir menu' });

  await toggle.click();
  const menu = page.locator('#site-menu');
  await expect(menu.getByRole('link', { name: 'Metodologia' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(toggle).toBeFocused();
});

test('FAQ answers expand and collapse', async ({ page }) => {
  await page.goto('/a-mesa/');
  const question = page.locator('summary', { hasText: 'O mentor implementa as ações dentro da minha empresa?' });

  await question.click();
  await expect(page.getByText('quem executa é a sua empresa')).toBeVisible();
  await question.click();
  await expect(page.getByText('quem executa é a sua empresa')).toBeHidden();
});

test('the lesson video loads only after the visitor asks for it', async ({ page }) => {
  await page.route('https://www.youtube-nocookie.com/**', (route) => route.fulfill({ status: 200, body: '' }));
  await page.goto('/double-diamond/');
  await expect(page.locator('iframe')).toHaveCount(0);

  await page.getByRole('button', { name: /Assistir à aula/ }).click();

  await expect(page.locator('iframe[src*="youtube-nocookie.com/embed/vHRCi6APO_w"]')).toHaveCount(1);
});

test('unknown addresses show the not-found page with a way back', async ({ page }) => {
  const response = await page.goto('/pagina-inexistente/');

  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/página não encontrada/i);
  await page.getByRole('link', { name: 'Voltar ao site' }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('case cards open their case study page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Ver caso.*Fatorcard/ }).click();

  await expect(page).toHaveURL(/\/casos\/fatorcard\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/De uma operação recém-adquirida/);
});
