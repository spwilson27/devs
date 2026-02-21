/**
 * packages/core/test/events/eventbus.test.ts
 *
 * Unit and integration tests for the EventBus IPC mechanism and
 * SharedEventBus pub/sub abstraction.
 *
 * Requirements: [2_TAS-REQ-018], [1_PRD-REQ-INT-004], [9_ROADMAP-REQ-037]
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from "vitest";
import * as os from "node:os";
import * as path from "node:path";
import * as fs from "node:fs";
import { SharedEventBus } from "../../src/events/SharedEventBus.js";
import { EventBus, BUS_MESSAGE_EVENT } from "../../src/events/EventBus.js";
import {
  EventTopics,
  type StateChangePayload,
  type PausePayload,
  type ResumePayload,
  type LogStreamPayload,
} from "../../src/events/types.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeTempSocketPath(): string {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "devs-eb-"));
  // Keep socket filename short to stay under UNIX_PATH_MAX (104 bytes on macOS)
  return path.join(tmpDir, "t.sock");
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── SharedEventBus tests ──────────────────────────────────────────────────────

describe("SharedEventBus", () => {
  let socketPath: string;
  let server: SharedEventBus | null = null;
  let client: SharedEventBus | null = null;

  beforeEach(() => {
    socketPath = makeTempSocketPath();
  });

  afterEach(async () => {
    await client?.close();
    await server?.close();
    client = null;
    server = null;
  });

  describe("createServer / createClient", () => {
    it("should create a server without error", async () => {
      server = await SharedEventBus.createServer(socketPath);
      expect(server).toBeDefined();
    });

    it("should create a client that connects to the server", async () => {
      server = await SharedEventBus.createServer(socketPath);
      client = await SharedEventBus.createClient(socketPath);
      expect(client).toBeDefined();
    });

    it("should create the socket file on the filesystem", async () => {
      server = await SharedEventBus.createServer(socketPath);
      expect(fs.existsSync(socketPath)).toBe(true);
    });

    it("should reject client creation when server is not running", async () => {
      await expect(
        SharedEventBus.createClient(socketPath, { connectionTimeout: 200 })
      ).rejects.toThrow();
    });

    it("should clean up the socket file when server closes", async () => {
      server = await SharedEventBus.createServer(socketPath);
      expect(fs.existsSync(socketPath)).toBe(true);
      await server.close();
      server = null;
      expect(fs.existsSync(socketPath)).toBe(false);
    });

    it("should overwrite a stale socket file from a previous crashed process", async () => {
      // Create a fake stale socket file
      fs.writeFileSync(socketPath, "stale");
      expect(fs.existsSync(socketPath)).toBe(true);
      // Server should start cleanly by removing the stale file
      server = await SharedEventBus.createServer(socketPath);
      expect(fs.existsSync(socketPath)).toBe(true);
    });
  });

  describe("publish / subscribe — server → client", () => {
    it("should deliver STATE_CHANGE events from server to client", async () => {
      server = await SharedEventBus.createServer(socketPath);
      client = await SharedEventBus.createClient(socketPath);
      await wait(20); // allow TCP handshake to complete

      const received = await new Promise<StateChangePayload>((resolve) => {
        client!.subscribe(EventTopics.STATE_CHANGE, (payload) => {
          resolve(payload);
        });
        server!.publish(EventTopics.STATE_CHANGE, {
          entityType: "task",
          entityId: "task-001",
          newStatus: "completed",
          timestamp: new Date().toISOString(),
        });
      });

      expect(received.entityType).toBe("task");
      expect(received.entityId).toBe("task-001");
      expect(received.newStatus).toBe("completed");
    });

    it("should deliver PAUSE events from server to client", async () => {
      server = await SharedEventBus.createServer(socketPath);
      client = await SharedEventBus.createClient(socketPath);
      await wait(20);

      const received = await new Promise<PausePayload>((resolve) => {
        client!.subscribe(EventTopics.PAUSE, (payload) => {
          resolve(payload);
        });
        server!.publish(EventTopics.PAUSE, {
          reason: "user requested",
          requestedBy: "cli",
          timestamp: new Date().toISOString(),
        });
      });

      expect(received.requestedBy).toBe("cli");
      expect(received.reason).toBe("user requested");
    });

    it("should deliver RESUME events from server to client", async () => {
      server = await SharedEventBus.createServer(socketPath);
      client = await SharedEventBus.createClient(socketPath);
      await wait(20);

      const received = await new Promise<ResumePayload>((resolve) => {
        client!.subscribe(EventTopics.RESUME, (payload) => {
          resolve(payload);
        });
        server!.publish(EventTopics.RESUME, {
          requestedBy: "vscode",
          timestamp: new Date().toISOString(),
        });
      });

      expect(received.requestedBy).toBe("vscode");
    });

    it("should deliver LOG_STREAM events from server to client", async () => {
      server = await SharedEventBus.createServer(socketPath);
      client = await SharedEventBus.createClient(socketPath);
      await wait(20);

      const received = await new Promise<LogStreamPayload>((resolve) => {
        client!.subscribe(EventTopics.LOG_STREAM, (payload) => {
          resolve(payload);
        });
        server!.publish(EventTopics.LOG_STREAM, {
          level: "info",
          message: "agent started task",
          agentId: "agent-001",
          taskId: "task-001",
          timestamp: new Date().toISOString(),
        });
      });

      expect(received.level).toBe("info");
      expect(received.message).toBe("agent started task");
      expect(received.agentId).toBe("agent-001");
    });
  });

  describe("publish / subscribe — client → server", () => {
    it("should deliver STATE_CHANGE events from client to server", async () => {
      server = await SharedEventBus.createServer(socketPath);
      client = await SharedEventBus.createClient(socketPath);
      await wait(20);

      const received = await new Promise<StateChangePayload>((resolve) => {
        server!.subscribe(EventTopics.STATE_CHANGE, (payload) => {
          resolve(payload);
        });
        client!.publish(EventTopics.STATE_CHANGE, {
          entityType: "project",
          entityId: "proj-001",
          newStatus: "in_progress",
          timestamp: new Date().toISOString(),
        });
      });

      expect(received.entityType).toBe("project");
      expect(received.entityId).toBe("proj-001");
      expect(received.newStatus).toBe("in_progress");
    });

    it("should fan-out client events to all other connected clients", async () => {
      server = await SharedEventBus.createServer(socketPath);
      client = await SharedEventBus.createClient(socketPath);
      const client2 = await SharedEventBus.createClient(socketPath);
      await wait(20);

      try {
        const received = await new Promise<StateChangePayload>((resolve) => {
          // client2 subscribes
          client2.subscribe(EventTopics.STATE_CHANGE, (payload) => {
            resolve(payload);
          });
          // client publishes — should fan-out to client2 via server
          client!.publish(EventTopics.STATE_CHANGE, {
            entityType: "epic",
            entityId: "epic-001",
            newStatus: "completed",
            timestamp: new Date().toISOString(),
          });
        });

        expect(received.entityType).toBe("epic");
        expect(received.entityId).toBe("epic-001");
      } finally {
        await client2.close();
      }
    });
  });

  describe("subscribe — multiple subscribers", () => {
    it("should deliver to all subscribers for the same topic", async () => {
      server = await SharedEventBus.createServer(socketPath);
      client = await SharedEventBus.createClient(socketPath);
      await wait(20);

      const results: string[] = [];

      const unsub1 = client.subscribe(EventTopics.PAUSE, (payload) => {
        results.push(`sub1:${payload.requestedBy}`);
      });
      const unsub2 = client.subscribe(EventTopics.PAUSE, (payload) => {
        results.push(`sub2:${payload.requestedBy}`);
      });

      await new Promise<void>((resolve) => {
        // Use a flag to avoid resolving before both are pushed
        let count = 0;
        client!.subscribe(EventTopics.PAUSE, () => {
          count++;
          if (count === 1) resolve();
        });
        server!.publish(EventTopics.PAUSE, {
          requestedBy: "cli",
          timestamp: new Date().toISOString(),
        });
      });

      unsub1();
      unsub2();

      expect(results).toContain("sub1:cli");
      expect(results).toContain("sub2:cli");
    });

    it("should stop delivering after unsubscribe", async () => {
      server = await SharedEventBus.createServer(socketPath);
      client = await SharedEventBus.createClient(socketPath);
      await wait(20);

      const calls: number[] = [];
      const unsub = client.subscribe(EventTopics.RESUME, () => {
        calls.push(1);
      });

      server.publish(EventTopics.RESUME, {
        requestedBy: "cli",
        timestamp: new Date().toISOString(),
      });
      await wait(50);
      unsub();

      const beforeCount = calls.length;
      server.publish(EventTopics.RESUME, {
        requestedBy: "cli",
        timestamp: new Date().toISOString(),
      });
      await wait(50);

      expect(calls.length).toBe(beforeCount); // no new calls after unsub
    });

    it("should not deliver events of wrong topic to subscriber", async () => {
      server = await SharedEventBus.createServer(socketPath);
      client = await SharedEventBus.createClient(socketPath);
      await wait(20);

      const wrongTopicCalls: number[] = [];
      client.subscribe(EventTopics.PAUSE, () => {
        wrongTopicCalls.push(1);
      });

      // Publish RESUME — should NOT trigger PAUSE subscriber
      server.publish(EventTopics.RESUME, {
        requestedBy: "cli",
        timestamp: new Date().toISOString(),
      });
      await wait(50);

      expect(wrongTopicCalls.length).toBe(0);
    });
  });

  describe("event message envelope", () => {
    it("should include id, topic, timestamp, and source in the message", async () => {
      server = await SharedEventBus.createServer(socketPath);
      const rawBus = (server as unknown as { bus: EventBus }).bus;

      const messages: Array<{ id: string; topic: string; timestamp: string; source: string }> = [];
      rawBus.on(BUS_MESSAGE_EVENT, (msg) => {
        messages.push(msg as { id: string; topic: string; timestamp: string; source: string });
      });

      server.publish(EventTopics.LOG_STREAM, {
        level: "debug",
        message: "test",
        timestamp: new Date().toISOString(),
      });

      await wait(10);

      expect(messages).toHaveLength(1);
      expect(messages[0].id).toBeTruthy();
      expect(messages[0].topic).toBe("LOG_STREAM");
      expect(messages[0].timestamp).toBeTruthy();
      expect(messages[0].source).toBeTruthy();
    });

    it("should generate unique IDs for each published message", async () => {
      server = await SharedEventBus.createServer(socketPath);
      const rawBus = (server as unknown as { bus: EventBus }).bus;

      const ids: string[] = [];
      rawBus.on(BUS_MESSAGE_EVENT, (msg) => {
        ids.push((msg as { id: string }).id);
      });

      server.publish(EventTopics.RESUME, {
        requestedBy: "cli",
        timestamp: new Date().toISOString(),
      });
      server.publish(EventTopics.RESUME, {
        requestedBy: "cli",
        timestamp: new Date().toISOString(),
      });
      await wait(10);

      expect(ids).toHaveLength(2);
      expect(ids[0]).not.toBe(ids[1]);
    });
  });

  describe("latency", () => {
    it("should deliver events with sub-100ms latency over local IPC", async () => {
      server = await SharedEventBus.createServer(socketPath);
      client = await SharedEventBus.createClient(socketPath);
      await wait(20);

      const start = performance.now();
      await new Promise<void>((resolve) => {
        client!.subscribe(EventTopics.PAUSE, () => {
          resolve();
        });
        server!.publish(EventTopics.PAUSE, {
          requestedBy: "latency-test",
          timestamp: new Date().toISOString(),
        });
      });
      const latency = performance.now() - start;

      // IPC over Unix domain sockets is typically < 5ms; allow up to 100ms as a safe bound
      expect(latency).toBeLessThan(100);
    });
  });

  describe("typed events", () => {
    it("should enforce correct payload shape for STATE_CHANGE (TypeScript)", () => {
      // This test validates compile-time TypeScript types.
      // The TypeScript compiler will catch shape mismatches at build time.
      const payload: StateChangePayload = {
        entityType: "task",
        entityId: 42,
        newStatus: "completed",
        timestamp: new Date().toISOString(),
      };
      expect(payload.entityType).toBe("task");
      expect(typeof payload.entityId).toBe("number");
    });

    it("should enforce correct payload shape for PAUSE (TypeScript)", () => {
      const payload: PausePayload = {
        requestedBy: "cli",
        timestamp: new Date().toISOString(),
      };
      expect(payload.requestedBy).toBe("cli");
    });

    it("should enforce correct payload shape for RESUME (TypeScript)", () => {
      const payload: ResumePayload = {
        requestedBy: "vscode",
        timestamp: new Date().toISOString(),
      };
      expect(payload.requestedBy).toBe("vscode");
    });

    it("should enforce correct payload shape for LOG_STREAM (TypeScript)", () => {
      const payload: LogStreamPayload = {
        level: "error",
        message: "something went wrong",
        timestamp: new Date().toISOString(),
      };
      expect(payload.level).toBe("error");
    });
  });

  describe("connection resilience", () => {
    it("should reconnect client after server restarts", async () => {
      server = await SharedEventBus.createServer(socketPath);
      client = await SharedEventBus.createClient(socketPath, {
        reconnectDelay: 100,
        maxReconnectAttempts: 5,
      });
      await wait(20);

      // Close the server (simulates crash)
      await server.close();
      server = null;
      await wait(50);

      // Start a new server on the same socket path
      server = await SharedEventBus.createServer(socketPath);
      // Wait for client to reconnect (up to 500ms)
      await wait(400);

      // After reconnect, events should flow again
      const received = await new Promise<ResumePayload>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Reconnect timeout")), 1000);
        client!.subscribe(EventTopics.RESUME, (payload) => {
          clearTimeout(timer);
          resolve(payload);
        });
        server!.publish(EventTopics.RESUME, {
          requestedBy: "reconnect-test",
          timestamp: new Date().toISOString(),
        });
      });

      expect(received.requestedBy).toBe("reconnect-test");
    });

    it("should emit reconnected event after successful reconnection", async () => {
      const serverBus = new EventBus(socketPath, "server");
      await serverBus.startServer();

      const clientBus = new EventBus(socketPath, "client", {
        reconnectDelay: 100,
        maxReconnectAttempts: 5,
      });
      await clientBus.connectClient();
      await wait(20);

      const reconnectedPromise = new Promise<void>((resolve) => {
        clientBus.on("reconnected", () => resolve());
      });

      // Close server to trigger disconnect
      await serverBus.close();
      await wait(50);

      // Start new server
      const newSocketPath = socketPath; // same path (cleaned up by close)
      const serverBus2 = new EventBus(newSocketPath, "server");
      await serverBus2.startServer();

      await reconnectedPromise;

      await clientBus.close();
      await serverBus2.close();
    });
  });

  describe("resource cleanup", () => {
    it("should not error when close() is called multiple times", async () => {
      server = await SharedEventBus.createServer(socketPath);
      await server.close();
      await expect(server.close()).resolves.not.toThrow();
      server = null;
    });

    it("should handle multiple clients closing independently", async () => {
      server = await SharedEventBus.createServer(socketPath);
      const c1 = await SharedEventBus.createClient(socketPath);
      const c2 = await SharedEventBus.createClient(socketPath);
      await wait(20);

      await c1.close();
      // Server should still handle c2 messages after c1 disconnects
      const received = await new Promise<PausePayload>((resolve) => {
        server!.subscribe(EventTopics.PAUSE, resolve);
        c2.publish(EventTopics.PAUSE, {
          requestedBy: "c2",
          timestamp: new Date().toISOString(),
        });
      });
      expect(received.requestedBy).toBe("c2");
      await c2.close();
    });
  });
});

// ── EventBus low-level tests ──────────────────────────────────────────────────

describe("EventBus (low-level)", () => {
  let socketPath: string;
  let serverBus: EventBus | null = null;
  let clientBus: EventBus | null = null;

  beforeEach(() => {
    socketPath = makeTempSocketPath();
  });

  afterEach(async () => {
    await clientBus?.close();
    await serverBus?.close();
    clientBus = null;
    serverBus = null;
  });

  it("should emit BUS_MESSAGE_EVENT when server sends", async () => {
    serverBus = new EventBus(socketPath, "server");
    await serverBus.startServer();

    clientBus = new EventBus(socketPath, "client");
    await clientBus.connectClient();
    await wait(20);

    const msgPromise = new Promise<unknown>((resolve) => {
      clientBus!.on(BUS_MESSAGE_EVENT, (msg) => resolve(msg));
    });

    serverBus.send({
      id: "test-id",
      topic: "PAUSE",
      payload: { requestedBy: "test", timestamp: new Date().toISOString() },
      timestamp: new Date().toISOString(),
      source: "test",
    });

    const msg = await msgPromise;
    expect((msg as { id: string }).id).toBe("test-id");
    expect((msg as { topic: string }).topic).toBe("PAUSE");
  });

  it("should emit BUS_MESSAGE_EVENT on server when client sends", async () => {
    serverBus = new EventBus(socketPath, "server");
    await serverBus.startServer();

    clientBus = new EventBus(socketPath, "client");
    await clientBus.connectClient();
    await wait(20);

    const msgPromise = new Promise<unknown>((resolve) => {
      serverBus!.on(BUS_MESSAGE_EVENT, (msg) => resolve(msg));
    });

    clientBus.send({
      id: "client-msg-id",
      topic: "RESUME",
      payload: { requestedBy: "client-test", timestamp: new Date().toISOString() },
      timestamp: new Date().toISOString(),
      source: "client",
    });

    const msg = await msgPromise;
    expect((msg as { id: string }).id).toBe("client-msg-id");
  });

  it("should handle large messages (multi-chunk)", async () => {
    serverBus = new EventBus(socketPath, "server");
    await serverBus.startServer();

    clientBus = new EventBus(socketPath, "client");
    await clientBus.connectClient();
    await wait(20);

    const longMessage = "x".repeat(100_000);

    const msgPromise = new Promise<unknown>((resolve) => {
      clientBus!.on(BUS_MESSAGE_EVENT, (msg) => resolve(msg));
    });

    serverBus.send({
      id: "large-msg",
      topic: "LOG_STREAM",
      payload: {
        level: "debug",
        message: longMessage,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
      source: "test",
    });

    const msg = await msgPromise;
    expect((msg as { payload: { message: string } }).payload.message.length).toBe(100_000);
  });

  it("should emit 'listening' event when server starts", async () => {
    const listeningPromise = new Promise<void>((resolve) => {
      const bus = new EventBus(socketPath, "server");
      bus.on("listening", () => {
        serverBus = bus;
        resolve();
      });
      bus.startServer();
    });
    await listeningPromise;
    expect(serverBus).not.toBeNull();
  });

  it("should emit 'connected' event when client connects", async () => {
    serverBus = new EventBus(socketPath, "server");
    await serverBus.startServer();

    const connectedPromise = new Promise<void>((resolve) => {
      const bus = new EventBus(socketPath, "client");
      bus.on("connected", () => {
        clientBus = bus;
        resolve();
      });
      bus.connectClient();
    });
    await connectedPromise;
    expect(clientBus).not.toBeNull();
  });

  it("should throw on connectClient if connection times out", async () => {
    clientBus = new EventBus(socketPath, "client", { connectionTimeout: 100 });
    await expect(clientBus.connectClient()).rejects.toThrow(/timeout|ENOENT|ECONNREFUSED/i);
  });
});
