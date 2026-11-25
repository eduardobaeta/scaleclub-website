import { formErrorPath, thankYouPath } from '@/config/routes';
import {
  newsletterSubscriptionSchema,
  createConfiguredRateLimiter,
  createLeadRoute,
  resolveConfiguredLeadGateway,
} from '@/features/leads';

export const prerender = false;

export const POST = createLeadRoute({
  schema: newsletterSubscriptionSchema,
  toLead: (data) => ({ type: 'newsletter-subscription', data }),
  resolveGateway: resolveConfiguredLeadGateway,
  rateLimiter: createConfiguredRateLimiter('newsletter-subscriptions'),
  errorRedirect: formErrorPath,
  successRedirect: thankYouPath('newsletter-subscription'),
});
