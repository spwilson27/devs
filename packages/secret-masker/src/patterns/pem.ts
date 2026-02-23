/**
 * PEM patterns - Private key headers
 */
import { PatternDefinition } from '../types';

export const PEM_PATTERNS: PatternDefinition[] = [
  { id: 'pem-private-key', regex: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g, description: 'PEM private key header', severity: 'critical' },
  { id: 'pem-certificate', regex: /-----BEGIN CERTIFICATE-----/g, description: 'PEM certificate header', severity: 'medium' },
];
