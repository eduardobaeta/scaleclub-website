import type { Lead } from './lead';

export interface LeadGateway {
  /** Resolves only after the provider accepted the lead; rejects otherwise. */
  submit(lead: Lead): Promise<void>;
}
