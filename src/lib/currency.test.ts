import { describe, expect, it } from 'vitest';
import { formatBrl } from './currency';

const normalize = (text: string) => text.replace(/\s/g, ' ');

describe('formatBrl', () => {
  it('formats reais with or without cents', () => {
    expect(normalize(formatBrl(4500, { cents: true }))).toBe('R$ 4.500,00');
    expect(normalize(formatBrl(3900))).toBe('R$ 3.900');
  });
});
