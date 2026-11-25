import { z } from 'astro/zod';

export const requiredText = (minimum: number, maximum: number) => z.string().trim().min(minimum).max(maximum);

export const optionalText = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum)
    .optional()
    .transform((value) => value || undefined);

export const emailAddress = z.string().trim().toLowerCase().max(254).pipe(z.email());

/** Brazilian phone with area code (10–11 digits), optionally prefixed with country code 55. */
export const brazilianPhone = z
  .string()
  .transform((value) => value.replace(/\D/g, ''))
  .pipe(z.string().regex(/^(55)?\d{10,11}$/));

export const optionalBrazilianPhone = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined)
  .pipe(brazilianPhone.optional());

export const consentGiven = z.literal('on');
