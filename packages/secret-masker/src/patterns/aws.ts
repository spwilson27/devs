/**
 * AWS patterns - AWS credentials grant account access if leaked.
 */
import { PatternDefinition } from '../types';

export const AWS_PATTERNS: PatternDefinition[] = [
  { id: 'aws-access-key-id', regex: /AKIA[0-9A-Z]{14,16}/g, description: 'AWS Access Key ID (AKIA...)', severity: 'critical' },
  { id: 'aws-secret-access-key', regex: /aws[_-]?secret[_-]?access[_-]?key\s*[:=]\s*[A-Za-z0-9/+=]{40}/gi, description: 'AWS Secret Access Key in config style', severity: 'critical' },
  { id: 'aws-secret-key-raw-40', regex: /[A-Za-z0-9/+=]{40}/g, description: '40-character base64-like secret (potential AWS secret)', severity: 'high' },
  { id: 'aws-session-token', regex: /aws[_-]?session[_-]?token\s*[:=]\s*[A-Za-z0-9/+=]{16,}/gi, description: 'AWS session token', severity: 'high' },
  { id: 'aws-arn-role', regex: /arn:aws:iam::\d{12}:role\/[A-Za-z0-9+=,.@_\/-]+/g, description: 'AWS ARN role', severity: 'medium' },
  { id: 'aws-access-key-id-alt', regex: /A3T[A-Z0-9]{15}/g, description: 'Alternate AWS access key pattern (A3T... )', severity: 'high' },
];
