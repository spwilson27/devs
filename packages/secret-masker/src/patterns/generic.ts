/**
 * Generic secret/key/token patterns
 */
import { PatternDefinition } from '../types';

export const GENERIC_PATTERNS: PatternDefinition[] = [
  { id: 'generic-api-key', regex: /(?:api[_-]?key|apikey|api[_-]?secret)\s*[:=]\s*\S{16,}/gi, description: 'Generic API key assignment (key: value)', severity: 'high' },
  { id: 'bearer-token', regex: /bearer\s+[A-Za-z0-9\-._~+\/]+=*/gi, description: 'HTTP Bearer token in headers', severity: 'high' },
  { id: 'basic-auth-url', regex: /https?:\/\/[^:\s]+:[^@]+@/g, description: 'Basic auth credentials in URL', severity: 'high' },
  { id: 'generic-password', regex: /password\s*[:=]\s*\S{8,}/gi, description: 'Potential plaintext password assignment', severity: 'high' },
  { id: 'generic-secret-key', regex: /(?:secret|token|credential)\s*[:=]\s*\S{8,}/gi, description: 'Generic secret/token/credential assignment', severity: 'medium' },
];
