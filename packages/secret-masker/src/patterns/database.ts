/**
 * Database DSN patterns - Postgres, MySQL, MongoDB, Redis
 */
import { PatternDefinition } from '../types';

export const DATABASE_PATTERNS: PatternDefinition[] = [
  { id: 'postgres-dsn', regex: /(?:postgres|postgresql):\/\/[^:\s]+:[^@\s]+@/g, description: 'Postgres DSN with credentials', severity: 'high' },
  { id: 'mysql-dsn', regex: /mysql:\/\/[^:\s]+:[^@\s]+@/g, description: 'MySQL DSN', severity: 'high' },
  { id: 'mongodb-dsn', regex: /mongodb(?:\+srv)?:\/\/[^:\s]+:[^@\s]+@/g, description: 'MongoDB DSN', severity: 'high' },
  { id: 'redis-dsn', regex: /redis:\/\/[^:\s]+:[^@\s]+@/g, description: 'Redis DSN', severity: 'high' },
];
