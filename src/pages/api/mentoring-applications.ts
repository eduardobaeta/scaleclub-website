import { formErrorPath, thankYouPath } from '@/config/routes';
import {
  mentoringApplicationSchema,
  createConfiguredRateLimiter,
  createLeadRoute,
  resolveConfiguredLeadGateway,
} from '@/features/leads';

export const prerender = false;

export const POST = createLeadRoute({
  schema: mentoringApplicationSchema,
  toLead: ({ consent: _consent, ...data }) => ({ type: 'mentoring-application', data }),
  resolveGateway: resolveConfiguredLeadGateway,
  rateLimiter: createConfiguredRateLimiter('mentoring-applications'),
  errorRedirect: formErrorPath,
  successRedirect: thankYouPath('mentoring-application'),
});
