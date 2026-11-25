import { formErrorPath, thankYouPath } from '@/config/routes';
import {
  ebookRequestSchema,
  createConfiguredRateLimiter,
  createLeadRoute,
  resolveConfiguredLeadGateway,
} from '@/features/leads';

export const prerender = false;

export const POST = createLeadRoute({
  schema: ebookRequestSchema,
  toLead: ({ consent: _consent, ...data }) => ({ type: 'ebook-request', data }),
  resolveGateway: resolveConfiguredLeadGateway,
  rateLimiter: createConfiguredRateLimiter('ebook-requests'),
  errorRedirect: formErrorPath,
  successRedirect: thankYouPath('ebook-request'),
});
