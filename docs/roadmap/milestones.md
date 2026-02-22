# Project Milestones — Technical Definitions

This document defines the technical completion criteria and phase mappings for the project's high-level milestones.

## Milestone Mapping

- M1 (Foundation): Phases 1 & 2
- M2 (Intelligence): Phases 3, 4 & 5
- M3 (Autonomy): Phases 6, 7 & 8

> Note: Phases are referenced by their `epics.order_index` value (1-indexed) in the Flight Recorder schema.

## Completion Criteria (Technical)

A milestone is considered complete when all of the following hold:

1. All atomic tasks (rows in the `tasks` table) that belong to epics whose `order_index` falls within the milestone's phase range are in status `completed`.
2. Optionally, each completed task should have an associated `git_commit_hash` recorded to provide an auditable snapshot linking the implementation to a specific commit (recommended for release milestones).

## Progress Calculation

- Progress for a milestone is calculated as: (number of tasks with `status = 'completed'` in milestone phases) / (total number of tasks in milestone phases) rounded to the nearest integer percentage (0–100).

## Example

- If Phase 1 (order_index=1) has 2 tasks completed and Phase 2 (order_index=2) has 2 tasks pending, then M1 progress = 2 / (2+2) = 50%.

## Maintenance

- The `MILESTONE_PHASE_MAP` should be centrally defined in `@devs/core` (a single source of truth) and referenced by any consumers (CLI, status endpoints, or ProjectManager implementations).
