/**
 * GitHub patterns - tokens and personal access tokens
 */
import { PatternDefinition } from '../types';

export const GITHUB_PATTERNS: PatternDefinition[] = [
  { id: 'github-token-gh', regex: /gh[pousr]_[A-Za-z0-9_]{30,255}/g, description: 'GitHub token (gh*)', severity: 'high' },
  { id: 'github-personal-access-token', regex: /github_pat_[A-Za-z0-9_]{82}/g, description: 'GitHub personal access token', severity: 'high' },
  { id: 'github-oauth-token', regex: /gho_[A-Za-z0-9_]{36,255}/g, description: 'GitHub OAuth token', severity: 'high' },
];
