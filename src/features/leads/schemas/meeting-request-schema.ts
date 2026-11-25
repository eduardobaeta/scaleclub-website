import { z } from 'astro/zod';
import { consentGiven, emailAddress, optionalBrazilianPhone, requiredText } from './field-rules';

export const meetingRequestSchema = z.object({
  name: requiredText(2, 120),
  email: emailAddress,
  whatsapp: optionalBrazilianPhone,
  consent: consentGiven,
});
