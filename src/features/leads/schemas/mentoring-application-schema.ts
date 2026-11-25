import { z } from 'astro/zod';
import { TEAM_SIZES } from '../domain/lead';
import { brazilianPhone, consentGiven, emailAddress, optionalText, requiredText } from './field-rules';

export const mentoringApplicationSchema = z.object({
  name: requiredText(2, 120),
  email: emailAddress,
  whatsapp: brazilianPhone,
  company: requiredText(1, 160),
  role: requiredText(1, 120),
  teamSize: z.enum(TEAM_SIZES).optional(),
  problem: optionalText(1000),
  consent: consentGiven,
});
