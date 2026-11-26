import axios, { type AxiosInstance, type CreateAxiosDefaults } from 'axios';
import { toAppError } from '@/lib/api/errors';

export function createHttpClient(config: CreateAxiosDefaults = {}): AxiosInstance {
  const client = axios.create({ timeout: 8_000, ...config });
  client.interceptors.response.use(undefined, (error: unknown) => Promise.reject(toAppError(error)));
  return client;
}
