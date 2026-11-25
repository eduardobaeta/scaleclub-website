import { z } from 'astro/zod';
import { consentGiven, emailAddress, optionalText, requiredText } from './field-rules';

export const ebookRequestSchema = z.object({
  name: requiredText(2, 120),
  email: emailAddress,
  instagram: optionalText(60),
  consent: consentGiven,
});
