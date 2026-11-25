import { z } from 'astro/zod';
import type { NewsletterSubscription } from '../domain/lead';
import { emailAddress } from './field-rules';

export const newsletterSubscriptionSchema = z.object({
  email: emailAddress,
}) satisfies z.ZodType<NewsletterSubscription, unknown>;
