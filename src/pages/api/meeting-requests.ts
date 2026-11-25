import { formErrorPath, thankYouPath } from '@/config/routes';
import {
  meetingRequestSchema,
  createConfiguredRateLimiter,
  createLeadRoute,
  resolveConfiguredLeadGateway,
} from '@/features/leads';

export const prerender = false;

export const POST = createLeadRoute({
  schema: meetingRequestSchema,
  toLead: ({ consent: _consent, ...data }) => ({ type: 'meeting-request', data }),
  resolveGateway: resolveConfiguredLeadGateway,
  rateLimiter: createConfiguredRateLimiter('meeting-request'),
  errorRedirect: formErrorPath,
  successRedirect: thankYouPath('meeting-request'),
});
