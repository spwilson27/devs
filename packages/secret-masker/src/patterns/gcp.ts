/**
 * GCP patterns - API keys and service account private keys.
 */
import { PatternDefinition } from '../types';

export const GCP_PATTERNS: PatternDefinition[] = [
  { id: 'gcp-api-key', regex: /AIza[0-9A-Za-z_-]{35}/g, description: 'GCP API key starting with AIza', severity: 'critical' },
  { id: 'gcp-service-account-private-key', regex: /"private_key"\s*:\s*"[\s\S]*?-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----[\s\S]*?"/g, description: 'GCP service account JSON private_key block', severity: 'critical' },
  { id: 'gcp-client-id', regex: /[0-9]{12}-[0-9A-Za-z]+\.apps\.googleusercontent\.com/g, description: 'GCP OAuth client id', severity: 'medium' },
];
