/**
 * @devs/core audit/AuditTrailReconstructor.ts
 *
 * Minimal AuditTrailReconstructor implementation to support the initial
 * integration tests. Focuses on producing a human-readable Markdown report
 * containing Thoughts, Actions, Observations, Decisions and commit info for a
 * single task. This is intentionally small and efficient; future iterations
 * can add streaming/pagination and JSON output formats.
 */

import type Database from "better-sqlite3";
import { StateRepository } from "../persistence/state_repository.js";
import { DecisionLogger } from "./DecisionLogger.js";

export interface ReconstructionOptions {
  taskId?: number;
  projectId?: number;
  format?: "markdown" | "json";
}

export class AuditTrailReconstructor {
  static generateReport(db: Database.Database, opts: ReconstructionOptions = {}) {
    if (!opts?.taskId && !opts?.projectId) {
      throw new Error("Either taskId or projectId must be provided");
    }

    if (opts.taskId) {
      const repo = new StateRepository(db);
      const logs = repo.getTaskLogs(opts.taskId);

      // Safely attempt to read decision logs; DecisionLogger throws if task missing.
      let decisions: any[] = [];
      try {
        const dlogger = new DecisionLogger(db, opts.taskId);
        decisions = dlogger.getTaskDecisions();
      } catch (e) {
        decisions = [];
      }

      const taskRow = db.prepare("SELECT * FROM tasks WHERE id = ?").get(opts.taskId) as any;
      const commit = taskRow?.git_commit_hash ?? null;

      let md = `# Audit Trail Report — Task ${opts.taskId}\n\n`;

      // Thoughts
      md += "## Thoughts\n\n";
      const thoughts = logs.filter((l) => l.content_type === "THOUGHT");
      if (thoughts.length === 0) {
        md += "_No thought logs found._\n\n";
      } else {
        for (const t of thoughts) {
          try {
            const parsed = JSON.parse(t.content);
            const text = parsed["thought"] ?? JSON.stringify(parsed);
            md += `- [turn ${parsed["turn_index"] ?? "?"}] (${t.role}) ${text}\n`;
          } catch (e) {
            md += `- (malformed) ${t.content}\n`;
          }
        }
        md += "\n";
      }

      // Actions
      md += "## Actions\n\n";
      const actions = logs.filter((l) => l.content_type === "ACTION");
      if (actions.length === 0) {
        md += "_No action logs found._\n\n";
      } else {
        for (const a of actions) {
          try {
            const parsed = JSON.parse(a.content);
            const tool = parsed["tool_name"] ?? "unknown";
            const input = parsed["tool_input"] ? JSON.stringify(parsed["tool_input"]) : "";
            md += `- [turn ${parsed["turn_index"] ?? "?"}] (${a.role}) ${tool} ${input}\n`;
          } catch (e) {
            md += `- (malformed) ${a.content}\n`;
          }
        }
        md += "\n";
      }

      // Observations
      md += "## Observations\n\n";
      const obs = logs.filter((l) => l.content_type === "OBSERVATION");
      if (obs.length === 0) {
        md += "_No observations found._\n\n";
      } else {
        for (const o of obs) {
          try {
            const parsed = JSON.parse(o.content);
            const res = parsed["tool_result"] ?? JSON.stringify(parsed);
            md += `- [turn ${parsed["turn_index"] ?? "?"}] (${o.role}) ${JSON.stringify(res)}\n`;
          } catch (e) {
            md += `- (malformed) ${o.content}\n`;
          }
        }
        md += "\n";
      }

      // Decisions
      md += "## Decisions\n\n";
      if (decisions.length === 0) {
        md += "_No decisions recorded._\n\n";
      } else {
        for (const d of decisions) {
          md += `- Alternative: ${d.alternative_considered ?? "[none]"}\n`;
          md += `  - Rejection: ${d.reasoning_for_rejection ?? "[none]"}\n`;
          md += `  - Selected: ${d.selected_option ?? "[none]"}\n`;
        }
        md += "\n";
      }

      // Commits
      md += "## Commits\n\n";
      if (commit) {
        md += `- Task commit: ${commit}\n\n`;
      } else {
        md += "_No commit recorded for this task._\n\n";
      }

      return md;
    }

    // project-level minimal report
    const repo = new StateRepository(db);
    const state = repo.getProjectState(opts.projectId!);
    return `# Project ${opts.projectId} Audit Report\n\nTasks: ${state?.tasks.length ?? 0}\n`;
  }
}
