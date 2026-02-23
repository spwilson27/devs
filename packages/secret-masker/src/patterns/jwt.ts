/**
 * JWT patterns - JSON Web Tokens
 */
import { PatternDefinition } from '../types';

export const JWT_PATTERNS: PatternDefinition[] = [
  { id: 'jwt', regex: /eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/g, description: 'JSON Web Token (three base64 segments)', severity: 'high' },
];
