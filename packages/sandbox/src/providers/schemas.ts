export const ExecResultSchema = {
  type: 'object',
  properties: {
    stdout: { type: 'string' },
    stderr: { type: 'string' },
    exitCode: { type: 'number' }
  },
  required: ['stdout', 'stderr', 'exitCode'],
  additionalProperties: false
} as const;

export const ResourceStatsSchema = {
  type: 'object',
  properties: {
    cpuPercent: { type: 'number' },
    memoryBytes: { type: 'number' },
    timestamp: { type: 'string' }
  },
  required: ['cpuPercent', 'memoryBytes', 'timestamp'],
  additionalProperties: false
} as const;
