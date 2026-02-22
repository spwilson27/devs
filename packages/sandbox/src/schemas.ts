import { z } from 'zod';
import type { SandboxContext } from './types';

export const sandboxStatusSchema = z.enum(['running', 'stopped', 'error']);

export const sandboxContextSchema = z.object({
  id: z.string(),
  workdir: z.string(),
  status: sandboxStatusSchema,
  createdAt: z.date(),
});

export type SandboxContextSchema = z.infer<typeof sandboxContextSchema>;
