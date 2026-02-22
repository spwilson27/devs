/**
 * Project lifecycle enums and transition validator
 */

export enum ProjectStatus {
  INITIALIZING = "INITIALIZING",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  ERROR = "ERROR",
  COMPLETED = "COMPLETED",
}

export enum ProjectPhase {
  FOUNDATION = "FOUNDATION",
  INTELLIGENCE = "INTELLIGENCE",
  AUTONOMY = "AUTONOMY",
  MULTI_MODAL = "MULTI_MODAL",
  VALIDATION = "VALIDATION",
}

/**
 * Validates whether a transition from `current` → `next` is allowed.
 * Returns true for allowed transitions, false otherwise.
 */
export function validateTransition(
  current: ProjectStatus | undefined | null,
  next: ProjectStatus
): boolean {
  if (current === undefined || current === null) return true;
  if (current === next) return true;

  // COMPLETED is terminal — no outgoing transitions allowed.
  if (current === ProjectStatus.COMPLETED) return false;

  const ALLOWED: Record<ProjectStatus, ProjectStatus[]> = {
    [ProjectStatus.INITIALIZING]: [ProjectStatus.ACTIVE, ProjectStatus.ERROR],
    [ProjectStatus.ACTIVE]: [ProjectStatus.PAUSED, ProjectStatus.COMPLETED, ProjectStatus.ERROR],
    [ProjectStatus.PAUSED]: [ProjectStatus.ACTIVE, ProjectStatus.COMPLETED, ProjectStatus.ERROR],
    [ProjectStatus.ERROR]: [ProjectStatus.PAUSED, ProjectStatus.ACTIVE, ProjectStatus.COMPLETED],
    [ProjectStatus.COMPLETED]: [],
  };

  return ALLOWED[current]?.includes(next) ?? false;
}
