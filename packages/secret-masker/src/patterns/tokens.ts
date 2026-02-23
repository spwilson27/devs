/**
 * Service-specific token patterns: Slack, Stripe, Twilio, SendGrid, Mailgun, Azure, NPM, Docker
 */
import { PatternDefinition } from '../types';

export const TOKENS_PATTERNS: PatternDefinition[] = [
  { id: 'slack-token', regex: /xox[baprs]-[0-9A-Za-z\-]{10,}/g, description: 'Slack token (xox-*)', severity: 'high' },
  { id: 'stripe-key', regex: /(sk|pk)_(test|live)_[0-9a-zA-Z]{24,}/g, description: 'Stripe keys', severity: 'high' },
  { id: 'twilio-sid', regex: /AC[0-9a-fA-F]{32}/g, description: 'Twilio Account SID', severity: 'high' },
  { id: 'twilio-key', regex: /SK[0-9a-fA-F]{32}/g, description: 'Twilio API key', severity: 'high' },
  { id: 'sendgrid-key', regex: /SG\.[A-Za-z0-9\-_]{22}\.[A-Za-z0-9\-_]{43}/g, description: 'SendGrid API key', severity: 'high' },
  { id: 'mailgun-key', regex: /key-[0-9a-zA-Z]{32,}/g, description: 'Mailgun API key', severity: 'high' },
  { id: 'azure-sas', regex: /(sv|se|sig)=[^&\s]+/g, description: 'Azure SAS token components in URL', severity: 'high' },
  { id: 'npm-token', regex: /(?:_authToken|npm_token)\s*[:=]\s*\S{16,}/gi, description: 'NPM auth token in config', severity: 'medium' },
  { id: 'docker-auth', regex: /"auth"\s*:\s*"[A-Za-z0-9+/=]{20,}"/g, description: 'Docker config.json auth value (base64)', severity: 'high' },
];
