/**
 * SSH and hex patterns
 */
import { PatternDefinition } from '../types';

export const SSH_HEX_PATTERNS: PatternDefinition[] = [
  { id: 'ssh-openssh-private-key', regex: /-----BEGIN OPENSSH PRIVATE KEY-----/g, description: 'OpenSSH private key header', severity: 'critical' },
  { id: 'hex-secret-32', regex: /\b[0-9a-f]{32,}\b/gi, description: 'Hex secrets of length >= 32', severity: 'high' },
];
