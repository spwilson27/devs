/**
 * packages/core/src/events/SharedEventBus.ts
 *
 * High-level pub/sub abstraction over the low-level EventBus IPC.
 *
 * SharedEventBus is the primary interface that CLI, VSCode extension, and
 * orchestration code should use.  It provides:
 *
 *   - `subscribe(topic, callback)` — typed subscription that returns an
 *     unsubscribe function.
 *   - `publish(topic, payload)` — typed event publication.
 *   - `createServer(socketPath)` / `createClient(socketPath)` — factory methods
 *     that hide the EventBus role details.
 *   - `close()` — idempotent teardown.
 *
 * All payloads are strictly typed via the EventPayloadMap generic.  TypeScript
 * will reject a `publish` call with the wrong payload shape at compile time.
 *
 * The socket path should be derived from the project root:
 *
 *   ```ts
 *   import * as path from 'node:path';
 *   import { resolveDevsDir } from '@devs/core';
 *   const socketPath = path.join(resolveDevsDir(), EVENTBUS_SOCKET_NAME);
 *   ```
 *
 * Requirements: [2_TAS-REQ-018], [1_PRD-REQ-INT-004], [9_ROADMAP-REQ-037]
 */

import { randomUUID } from "node:crypto";
import {
  EventBus,
  BUS_MESSAGE_EVENT,
  type EventBusOptions,
} from "./EventBus.js";
import type {
  EventTopic,
  EventPayloadMap,
  BusMessage,
  AnyBusMessage,
} from "./types.js";

// ── Public constants ───────────────────────────────────────────────────────────

/**
 * Filename for the EventBus Unix Domain Socket within the `.devs/` directory.
 * Use this constant to construct the socket path:
 *
 * ```ts
 * const socketPath = path.join(resolveDevsDir(fromDir), EVENTBUS_SOCKET_NAME);
 * ```
 */
export const EVENTBUS_SOCKET_NAME = "eventbus.sock" as const;

// ── Types ──────────────────────────────────────────────────────────────────────

/** Callback invoked when a subscribed event arrives. */
export type SubscribeCallback<T extends EventTopic> = (
  payload: EventPayloadMap[T]
) => void;

/** Calling the returned function removes the subscription. */
export type UnsubscribeFn = () => void;

// ── SharedEventBus ─────────────────────────────────────────────────────────────

/**
 * Typed, bidirectional pub/sub bus for cross-process state synchronization.
 *
 * @example
 * ```ts
 * // Server process (orchestration engine):
 * const bus = await SharedEventBus.createServer(socketPath);
 * bus.publish('STATE_CHANGE', { entityType: 'task', entityId: 1, newStatus: 'completed', timestamp: new Date().toISOString() });
 *
 * // Client process (CLI):
 * const bus = await SharedEventBus.createClient(socketPath);
 * const unsub = bus.subscribe('STATE_CHANGE', (payload) => {
 *   console.log('Task status changed:', payload.newStatus);
 * });
 * // Later:
 * unsub();
 * await bus.close();
 * ```
 */
export class SharedEventBus {
  /** Exposed for testing — allows tests to inspect raw BUS_MESSAGE_EVENT traffic. */
  readonly bus: EventBus;
  private readonly processId: string;

  private constructor(bus: EventBus, processId: string) {
    this.bus = bus;
    this.processId = processId;
  }

  // ── Subscription ────────────────────────────────────────────────────────────

  /**
   * Subscribe to events of a specific topic.
   *
   * @param topic     The event topic to subscribe to.
   * @param callback  Called with the typed payload each time an event with
   *                  this topic arrives.
   * @returns         A function that removes this subscription when called.
   *
   * @example
   * const unsub = bus.subscribe('PAUSE', ({ requestedBy }) => {
   *   console.log('Pause requested by:', requestedBy);
   * });
   * // Later, stop listening:
   * unsub();
   */
  subscribe<T extends EventTopic>(
    topic: T,
    callback: SubscribeCallback<T>
  ): UnsubscribeFn {
    const handler = (message: AnyBusMessage) => {
      if (message.topic === topic) {
        // TypeScript cannot narrow `message.payload` based on the runtime
        // `message.topic === topic` check, so we cast here.  The cast is safe
        // because `_isValidMessage()` in EventBus guarantees the topic/payload
        // pairing is structurally correct.
        callback(message.payload as EventPayloadMap[T]);
      }
    };

    this.bus.on(BUS_MESSAGE_EVENT, handler);
    return () => this.bus.off(BUS_MESSAGE_EVENT, handler);
  }

  // ── Publishing ──────────────────────────────────────────────────────────────

  /**
   * Publish an event on the bus.
   *
   * TypeScript enforces that `payload` matches the shape required by `topic`.
   *
   * @param topic    The event topic.
   * @param payload  The event-specific payload (must match EventPayloadMap[T]).
   *
   * @example
   * bus.publish('LOG_STREAM', {
   *   level: 'info',
   *   message: 'Research phase started',
   *   timestamp: new Date().toISOString(),
   * });
   */
  publish<T extends EventTopic>(
    topic: T,
    payload: EventPayloadMap[T]
  ): void {
    const message: BusMessage<T> = {
      id: randomUUID(),
      topic,
      payload,
      timestamp: new Date().toISOString(),
      source: this.processId,
    };
    // Cast to the base BusMessage type required by EventBus.send().
    this.bus.send(message as BusMessage);
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  /**
   * Shut down the bus and release all resources.
   *
   * Idempotent — safe to call multiple times.
   */
  async close(): Promise<void> {
    await this.bus.close();
  }

  // ── Factory methods ─────────────────────────────────────────────────────────

  /**
   * Create a SharedEventBus in server (hub) mode.
   *
   * The server process creates the Unix Domain Socket file and listens for
   * incoming client connections.  Any stale socket file from a previous
   * crashed server is removed automatically.
   *
   * Typically called once by the orchestration engine process.
   *
   * @param socketPath  Absolute path to the socket file (inside `.devs/`).
   * @param options     Optional EventBus configuration overrides.
   */
  static async createServer(
    socketPath: string,
    options?: EventBusOptions
  ): Promise<SharedEventBus> {
    const bus = new EventBus(socketPath, "server", options);
    await bus.startServer();
    return new SharedEventBus(bus, `server:${process.pid}`);
  }

  /**
   * Create a SharedEventBus in client mode.
   *
   * Connects to an existing server socket.  Rejects if the server is not
   * reachable within `options.connectionTimeout` milliseconds.
   *
   * @param socketPath  Absolute path to the socket file (inside `.devs/`).
   * @param options     Optional EventBus configuration overrides.
   */
  static async createClient(
    socketPath: string,
    options?: EventBusOptions
  ): Promise<SharedEventBus> {
    const bus = new EventBus(socketPath, "client", options);
    await bus.connectClient();
    return new SharedEventBus(bus, `client:${process.pid}`);
  }
}
