/**
 * MilestoneService — calculates milestone progress and completion based on
 * atomic task statuses stored in the core state repository.
 */

import { StateRepository } from "../persistence/state_repository.js";

export type ProjectMilestone = "M1" | "M2" | "M3";

export const MILESTONE_PHASE_MAP: Record<ProjectMilestone, number[]> = {
  M1: [1, 2],
  M2: [3, 4, 5],
  M3: [6, 7, 8],
};

export class MilestoneService {
  private repo: StateRepository;
  private projectId: number;

  constructor(repo: StateRepository, projectId: number) {
    this.repo = repo;
    this.projectId = projectId;
  }

  /**
   * Calculates milestone progress as an integer percentage (0-100) based on
   * the fraction of tasks in the milestone's phases that are marked 'completed'.
   */
  calculateProgress(milestone: ProjectMilestone): number {
    const state = this.repo.getProjectState(this.projectId);
    if (!state) return 0;

    const phases = MILESTONE_PHASE_MAP[milestone];
    const epicsInMilestone = state.epics.filter((e) => phases.includes(e.order_index ?? 0));
    const epicIds = new Set(epicsInMilestone.map((e) => e.id as number));

    const tasksInMilestone = state.tasks.filter((t) => epicIds.has(t.epic_id));
    if (tasksInMilestone.length === 0) return 0;

    const completed = tasksInMilestone.filter((t) => String(t.status).toLowerCase() === "completed").length;
    return Math.round((completed / tasksInMilestone.length) * 100);
  }

  /**
   * Returns true only when all tasks included in the milestone's phases are completed.
   */
  isMilestoneComplete(milestone: ProjectMilestone): boolean {
    const state = this.repo.getProjectState(this.projectId);
    if (!state) return false;

    const phases = MILESTONE_PHASE_MAP[milestone];
    const epicsInMilestone = state.epics.filter((e) => phases.includes(e.order_index ?? 0));
    const epicIds = new Set(epicsInMilestone.map((e) => e.id as number));

    const tasksInMilestone = state.tasks.filter((t) => epicIds.has(t.epic_id));
    if (tasksInMilestone.length === 0) return false;

    return tasksInMilestone.every((t) => String(t.status).toLowerCase() === "completed");
  }
}

