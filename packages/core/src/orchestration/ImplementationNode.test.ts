/**
 * @devs/core — ImplementationNode unit tests
 *
 * Requirements: TAS-054, TAS-055
 *
 * `SnapshotManager` is injected as a mock to verify the node's behavior
 * without performing real git operations.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createImplementationNode } from "./ImplementationNode.js";
import { createInitialState } from "./types.js";
import type { GraphState, ProjectConfig } from "./types.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeProjectConfig(): ProjectConfig {
  return {
    projectId: "proj-001",
    name: "Test Project",
    description: "A test project",
    status: "implementing",
    createdAt: "2026-02-21T00:00:00Z",
    updatedAt: "2026-02-21T00:00:00Z",
  };
}

function makeState(overrides?: Partial<GraphState>): GraphState {
  return {
    ...createInitialState(makeProjectConfig()),
    ...overrides,
  };
}

function makeMockSnapshotManager(commitHash: string | null = "abc1234") {
  return {
    initialize: vi.fn().mockResolvedValue(undefined),
    createTaskSnapshot: vi.fn().mockResolvedValue(commitHash),
    takeSnapshot: vi.fn().mockResolvedValue("sha"),
    getStatus: vi.fn().mockResolvedValue({ isClean: true, staged: [], unstaged: [], untracked: [] }),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("createImplementationNode", () => {
  let mockSnapshot: ReturnType<typeof makeMockSnapshotManager>;

  beforeEach(() => {
    mockSnapshot = makeMockSnapshotManager();
    vi.clearAllMocks();
  });

  // ── no active task ─────────────────────────────────────────────────────────

  describe("when activeTaskId is null", () => {
    it("returns an empty partial state (no-op)", async () => {
      const node = createImplementationNode({
        projectPath: "/test/project",
        snapshotManager: mockSnapshot as never,
      });

      const result = await node(makeState({ activeTaskId: null }));
      expect(result).toEqual({});
    });

    it("does not call initialize or createTaskSnapshot", async () => {
      const node = createImplementationNode({
        projectPath: "/test/project",
        snapshotManager: mockSnapshot as never,
      });

      await node(makeState({ activeTaskId: null }));
      expect(mockSnapshot.initialize).not.toHaveBeenCalled();
      expect(mockSnapshot.createTaskSnapshot).not.toHaveBeenCalled();
    });
  });

  // ── active task with changes ───────────────────────────────────────────────

  describe("when activeTaskId is set and workspace has changes", () => {
    it("calls initialize() before createTaskSnapshot()", async () => {
      const callOrder: string[] = [];
      mockSnapshot.initialize.mockImplementation(async () => {
        callOrder.push("initialize");
      });
      mockSnapshot.createTaskSnapshot.mockImplementation(async () => {
        callOrder.push("createTaskSnapshot");
        return "commit-sha";
      });

      const node = createImplementationNode({
        projectPath: "/test/project",
        snapshotManager: mockSnapshot as never,
      });

      const state = makeState({
        activeTaskId: "task-001",
        tasks: [
          {
            taskId: "task-001",
            epicId: "epic-001",
            name: "My Task",
            description: "...",
            status: "in_progress",
            agentRole: "developer",
            dependsOn: [],
          },
        ],
      });

      await node(state);
      expect(callOrder).toEqual(["initialize", "createTaskSnapshot"]);
    });

    it("calls createTaskSnapshot with the activeTaskId", async () => {
      const node = createImplementationNode({
        projectPath: "/test/project",
        snapshotManager: mockSnapshot as never,
      });

      const state = makeState({ activeTaskId: "task-xyz" });
      await node(state);
      expect(mockSnapshot.createTaskSnapshot).toHaveBeenCalledWith(
        "task-xyz",
        expect.any(Object)
      );
    });

    it("updates the matching task's gitHash in the returned state", async () => {
      mockSnapshot.createTaskSnapshot.mockResolvedValue("deadbeef1234");

      const node = createImplementationNode({
        projectPath: "/test/project",
        snapshotManager: mockSnapshot as never,
      });

      const state = makeState({
        activeTaskId: "task-001",
        tasks: [
          {
            taskId: "task-001",
            epicId: "epic-001",
            name: "My Task",
            description: "...",
            status: "in_progress",
            agentRole: "developer",
            dependsOn: [],
          },
          {
            taskId: "task-002",
            epicId: "epic-001",
            name: "Other Task",
            description: "...",
            status: "pending",
            agentRole: "developer",
            dependsOn: [],
          },
        ],
      });

      const result = await node(state);
      const tasks = result.tasks as GraphState["tasks"];
      const updatedTask = tasks?.find((t) => t.taskId === "task-001");
      const untouchedTask = tasks?.find((t) => t.taskId === "task-002");

      expect(updatedTask?.gitHash).toBe("deadbeef1234");
      expect(untouchedTask?.gitHash).toBeUndefined();
    });

    it("does not mutate tasks that do not match activeTaskId", async () => {
      mockSnapshot.createTaskSnapshot.mockResolvedValue("abc1234");

      const node = createImplementationNode({
        projectPath: "/test/project",
        snapshotManager: mockSnapshot as never,
      });

      const originalTask2 = {
        taskId: "task-002",
        epicId: "epic-001",
        name: "Other Task",
        description: "...",
        status: "pending" as const,
        agentRole: "developer" as const,
        dependsOn: [] as readonly string[],
      };

      const state = makeState({
        activeTaskId: "task-001",
        tasks: [
          {
            taskId: "task-001",
            epicId: "epic-001",
            name: "My Task",
            description: "...",
            status: "in_progress" as const,
            agentRole: "developer" as const,
            dependsOn: [] as readonly string[],
          },
          originalTask2,
        ],
      });

      const result = await node(state);
      const tasks = result.tasks as GraphState["tasks"];
      const task2 = tasks?.find((t) => t.taskId === "task-002");
      expect(task2).toEqual(originalTask2);
    });

    it("passes context with taskName to createTaskSnapshot", async () => {
      const node = createImplementationNode({
        projectPath: "/test/project",
        snapshotManager: mockSnapshot as never,
      });

      const state = makeState({
        activeTaskId: "task-001",
        tasks: [
          {
            taskId: "task-001",
            epicId: "epic-001",
            name: "Implement Feature X",
            description: "...",
            status: "in_progress",
            agentRole: "developer",
            dependsOn: [],
          },
        ],
      });

      await node(state);
      expect(mockSnapshot.createTaskSnapshot).toHaveBeenCalledWith(
        "task-001",
        expect.objectContaining({ taskName: "Implement Feature X" })
      );
    });
  });

  // ── workspace clean (no changes) ──────────────────────────────────────────

  describe("when createTaskSnapshot returns null (workspace clean)", () => {
    it("returns an empty partial state (no-op)", async () => {
      mockSnapshot.createTaskSnapshot.mockResolvedValue(null);

      const node = createImplementationNode({
        projectPath: "/test/project",
        snapshotManager: mockSnapshot as never,
      });

      const result = await node(makeState({ activeTaskId: "task-001" }));
      expect(result).toEqual({});
    });

    it("does not update tasks in the returned state", async () => {
      mockSnapshot.createTaskSnapshot.mockResolvedValue(null);

      const node = createImplementationNode({
        projectPath: "/test/project",
        snapshotManager: mockSnapshot as never,
      });

      const result = await node(makeState({ activeTaskId: "task-001" }));
      expect(result.tasks).toBeUndefined();
    });
  });

  // ── error propagation ─────────────────────────────────────────────────────

  describe("when git operations fail", () => {
    it("propagates errors from initialize()", async () => {
      mockSnapshot.initialize.mockRejectedValue(
        new Error("git repo not found")
      );

      const node = createImplementationNode({
        projectPath: "/test/project",
        snapshotManager: mockSnapshot as never,
      });

      await expect(
        node(makeState({ activeTaskId: "task-001" }))
      ).rejects.toThrow("git repo not found");
    });

    it("propagates errors from createTaskSnapshot()", async () => {
      mockSnapshot.createTaskSnapshot.mockRejectedValue(
        new Error("nothing to commit")
      );

      const node = createImplementationNode({
        projectPath: "/test/project",
        snapshotManager: mockSnapshot as never,
      });

      await expect(
        node(makeState({ activeTaskId: "task-001" }))
      ).rejects.toThrow("nothing to commit");
    });
  });

  // ── DB persistence (taskRepository + dbTaskId) ────────────────────────────

  describe("when taskRepository and dbTaskId are provided", () => {
    it("calls taskRepository.updateGitHash with dbTaskId and commit hash", async () => {
      mockSnapshot.createTaskSnapshot.mockResolvedValue("deadbeef1234");

      const mockTaskRepo = {
        updateGitHash: vi.fn(),
        getTask: vi.fn(),
        getTaskByGitHash: vi.fn(),
      };

      const node = createImplementationNode({
        projectPath: "/test/project",
        snapshotManager: mockSnapshot as never,
        taskRepository: mockTaskRepo as never,
        dbTaskId: 42,
      });

      await node(makeState({ activeTaskId: "task-001" }));

      expect(mockTaskRepo.updateGitHash).toHaveBeenCalledOnce();
      expect(mockTaskRepo.updateGitHash).toHaveBeenCalledWith(42, "deadbeef1234");
    });

    it("does NOT call updateGitHash when workspace is clean (no commit)", async () => {
      mockSnapshot.createTaskSnapshot.mockResolvedValue(null);

      const mockTaskRepo = {
        updateGitHash: vi.fn(),
        getTask: vi.fn(),
        getTaskByGitHash: vi.fn(),
      };

      const node = createImplementationNode({
        projectPath: "/test/project",
        snapshotManager: mockSnapshot as never,
        taskRepository: mockTaskRepo as never,
        dbTaskId: 42,
      });

      await node(makeState({ activeTaskId: "task-001" }));

      expect(mockTaskRepo.updateGitHash).not.toHaveBeenCalled();
    });

    it("does NOT call updateGitHash when only taskRepository is provided (no dbTaskId)", async () => {
      mockSnapshot.createTaskSnapshot.mockResolvedValue("sha123");

      const mockTaskRepo = {
        updateGitHash: vi.fn(),
        getTask: vi.fn(),
        getTaskByGitHash: vi.fn(),
      };

      const node = createImplementationNode({
        projectPath: "/test/project",
        snapshotManager: mockSnapshot as never,
        taskRepository: mockTaskRepo as never,
        // dbTaskId intentionally omitted
      });

      await node(makeState({ activeTaskId: "task-001" }));

      expect(mockTaskRepo.updateGitHash).not.toHaveBeenCalled();
    });

    it("does NOT call updateGitHash when only dbTaskId is provided (no taskRepository)", async () => {
      // This just exercises the no-op path — no mock to assert on,
      // but the node should not throw.
      mockSnapshot.createTaskSnapshot.mockResolvedValue("sha456");

      const node = createImplementationNode({
        projectPath: "/test/project",
        snapshotManager: mockSnapshot as never,
        dbTaskId: 99,
        // taskRepository intentionally omitted
      });

      // Should complete without error and still return updated state.
      const result = await node(makeState({ activeTaskId: "task-001" }));
      expect(result.tasks).toBeDefined();
    });
  });
});
