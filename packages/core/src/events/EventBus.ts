/**
 * packages/core/src/events/EventBus.ts
 *
 * Low-level IPC EventBus using Unix Domain Sockets (UDS).
 *
 * Architecture:
 *   One process acts as the "server" — it creates the socket file and accepts
 *   connections.  All other processes (CLI, VSCode extension) connect as
 *   "clients".  The server acts as a message hub: when a client sends a
 *   message the server (1) emits it locally and (2) fan-outs it to all other
 *   connected clients.  When the server itself sends a message it (1) emits
 *   locally and (2) broadcasts to all connected clients.
 *
 * Wire protocol:
 *   Newline-delimited JSON (NDJSON).  Each message is a single JSON string
 *   followed by `\n`.  The receiver buffers incoming data until a complete
 *   newline-terminated record is available before parsing.  This naturally
 *   handles TCP-style fragmentation and concatenation.
 *
 * Reconnection:
 *   When a client's socket closes unexpectedly (e.g. server crash), the client
 *   schedules reconnection attempts with exponential back-off.  The server
 *   does NOT auto-reconnect — it is expected to be the long-lived process.
 *
 * Requirements: [2_TAS-REQ-018], [1_PRD-REQ-INT-004]
 */

import { EventEmitter } from "node:events";
import * as net from "node:net";
import * as fs from "node:fs";
import type { BusMessage, EventTopic, AnyBusMessage } from "./types.js";
import { VALID_TOPICS } from "./types.js";

// ── Constants ──────────────────────────────────────────────────────────────────

/**
 * The Node.js EventEmitter event name used to deliver decoded bus messages to
 * in-process listeners.  SharedEventBus listens on this event to route messages
 * to topic-specific subscribers.
 */
export const BUS_MESSAGE_EVENT = "bus:message" as const;

const DEFAULT_RECONNECT_DELAY_MS = 1_000;
const DEFAULT_MAX_RECONNECT_ATTEMPTS = 10;
const DEFAULT_CONNECTION_TIMEOUT_MS = 5_000;

// ── Types ──────────────────────────────────────────────────────────────────────

export interface EventBusOptions {
  /**
   * Base delay in milliseconds before the first reconnect attempt.
   * Subsequent attempts use exponential back-off capped at 8× this value.
   * Default: 1 000 ms.
   */
  reconnectDelay?: number;
  /**
   * Maximum number of consecutive reconnect attempts before giving up and
   * emitting `"max_reconnect_exceeded"`.
   * Default: 10.
   */
  maxReconnectAttempts?: number;
  /**
   * Milliseconds to wait for a client connection to be established before
   * rejecting the `connectClient()` promise.
   * Default: 5 000 ms.
   */
  connectionTimeout?: number;
}

// ── EventBus ──────────────────────────────────────────────────────────────────

/**
 * Low-level IPC EventBus.
 *
 * Emit contract (via EventEmitter):
 *   - `"bus:message"` (msg: AnyBusMessage) — delivered for every decoded
 *     inbound message regardless of role.
 *   - `"listening"` — emitted once the server socket is ready.
 *   - `"connected"` — emitted once the client socket is connected.
 *   - `"reconnected"` — emitted when the client successfully reconnects.
 *   - `"max_reconnect_exceeded"` — emitted when reconnect attempts are exhausted.
 *   - `"error"` (err: Error) — socket-level error (non-fatal for the bus).
 */
export class EventBus extends EventEmitter {
  private readonly socketPath: string;
  readonly role: "server" | "client";
  private readonly reconnectDelay: number;
  private readonly maxReconnectAttempts: number;
  private readonly connectionTimeout: number;

  private server: net.Server | null = null;
  private readonly connectedClients: Set<net.Socket> = new Set();
  private clientSocket: net.Socket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private isShuttingDown = false;

  constructor(
    socketPath: string,
    role: "server" | "client",
    options: EventBusOptions = {}
  ) {
    super();
    this.socketPath = socketPath;
    this.role = role;
    this.reconnectDelay =
      options.reconnectDelay ?? DEFAULT_RECONNECT_DELAY_MS;
    this.maxReconnectAttempts =
      options.maxReconnectAttempts ?? DEFAULT_MAX_RECONNECT_ATTEMPTS;
    this.connectionTimeout =
      options.connectionTimeout ?? DEFAULT_CONNECTION_TIMEOUT_MS;
  }

  // ── Server API ──────────────────────────────────────────────────────────────

  /**
   * Start the socket server.  Removes a stale socket file if one exists
   * (handles the common case where the previous server process crashed).
   *
   * Resolves once the server is listening and ready to accept connections.
   */
  async startServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Remove stale socket file from a previous crashed process.
      if (fs.existsSync(this.socketPath)) {
        try {
          fs.unlinkSync(this.socketPath);
        } catch {
          // Ignore — the server.listen() call will fail if it can't bind,
          // surfacing the error through the 'error' event below.
        }
      }

      this.server = net.createServer((socket) => {
        this.connectedClients.add(socket);
        this._attachSocketHandlers(socket, "remote");

        socket.on("close", () => {
          this.connectedClients.delete(socket);
        });
      });

      this.server.on("error", (err) => {
        reject(err);
      });

      this.server.listen(this.socketPath, () => {
        this.emit("listening");
        resolve();
      });
    });
  }

  // ── Client API ──────────────────────────────────────────────────────────────

  /**
   * Connect to an existing server socket.
   *
   * Resolves once the TCP handshake completes.  Rejects if the connection
   * cannot be established within `connectionTimeout` milliseconds.
   */
  async connectClient(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        socket.destroy();
        reject(
          new Error(
            `EventBus connection timeout after ${this.connectionTimeout}ms to ${this.socketPath}`
          )
        );
      }, this.connectionTimeout);

      const socket = net.createConnection(this.socketPath);

      socket.once("connect", () => {
        clearTimeout(timer);
        this.clientSocket = socket;
        this.reconnectAttempts = 0;
        this._attachSocketHandlers(socket, "server");
        this.emit("connected");
        resolve();
      });

      socket.once("error", (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });
  }

  // ── Messaging ───────────────────────────────────────────────────────────────

  /**
   * Send a message on the bus.
   *
   * - Server: emits the message locally AND broadcasts to all connected clients.
   * - Client: writes the message to the server socket (the server will then
   *   emit it locally and fan-out to other clients).
   */
  send(message: BusMessage): void {
    if (this.role === "server") {
      // Emit locally for in-process subscribers.
      this.emit(BUS_MESSAGE_EVENT, message);
      // Broadcast to all connected clients.
      this._broadcast(message, undefined);
    } else {
      // Client: write to server.
      if (this.clientSocket && !this.clientSocket.destroyed && this.clientSocket.writable) {
        try {
          this.clientSocket.write(this._frame(message));
        } catch {
          // Socket half-closed; drop the message — reconnect logic will restore
          // connectivity on the next attempt.
        }
      }
    }
  }

  // ── Close ───────────────────────────────────────────────────────────────────

  /**
   * Gracefully shut down the bus.
   *
   * - Client: destroys the client socket and cancels any pending reconnect.
   * - Server: destroys all client connections and closes the server socket,
   *   then removes the socket file from the filesystem.
   *
   * Idempotent — safe to call multiple times.
   */
  async close(): Promise<void> {
    this.isShuttingDown = true;

    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.role === "client") {
      if (this.clientSocket) {
        this.clientSocket.destroy();
        this.clientSocket = null;
      }
      return;
    }

    // Server cleanup.
    if (this.server) {
      await new Promise<void>((resolve) => {
        for (const client of this.connectedClients) {
          client.destroy();
        }
        this.connectedClients.clear();

        this.server!.close(() => {
          // Remove the socket file so future startServer() calls start cleanly.
          if (fs.existsSync(this.socketPath)) {
            try {
              fs.unlinkSync(this.socketPath);
            } catch {
              // Best-effort cleanup.
            }
          }
          resolve();
        });
      });
      this.server = null;
    }
  }

  // ── Internal helpers ────────────────────────────────────────────────────────

  /**
   * Attach data / close / error handlers to a socket.
   *
   * @param socket  The connected socket.
   * @param senderRole  "remote" when called by the server for an inbound client
   *                    connection; "server" when called by the client for its
   *                    outbound connection.
   */
  private _attachSocketHandlers(
    socket: net.Socket,
    senderRole: "server" | "remote"
  ): void {
    let buffer = "";

    socket.on("data", (chunk: Buffer) => {
      buffer += chunk.toString("utf8");

      // Split on newlines — each complete line is one NDJSON record.
      const lines = buffer.split("\n");
      // The last element is the incomplete tail (possibly empty string).
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        let message: AnyBusMessage;
        try {
          const parsed = JSON.parse(trimmed) as unknown;
          if (!this._isValidMessage(parsed)) continue;
          message = parsed;
        } catch {
          // Discard malformed frames.
          continue;
        }

        // Deliver to in-process listeners.
        this.emit(BUS_MESSAGE_EVENT, message);

        // Server fan-out: forward to all OTHER connected clients.
        if (this.role === "server" && senderRole === "remote") {
          this._broadcast(message, socket);
        }
      }
    });

    socket.on("close", () => {
      if (this.role === "client" && !this.isShuttingDown) {
        this._scheduleReconnect();
      }
    });

    socket.on("error", (err) => {
      // Surface the error to listeners without crashing the process.
      this.emit("error", err);
    });
  }

  /**
   * Write a message to all connected client sockets, optionally excluding one.
   *
   * Checks both `destroyed` and `writable` before writing.  `writable` becomes
   * `false` when the remote end sends FIN (half-close), which happens before the
   * `'close'` event fires.  Writing to such a socket raises EPIPE; the try-catch
   * handles the residual race window between FIN receipt and the `close` listener
   * removing the socket from `connectedClients`.
   */
  private _broadcast(message: BusMessage, exclude?: net.Socket): void {
    const frame = this._frame(message);
    for (const client of this.connectedClients) {
      if (client !== exclude && !client.destroyed && client.writable) {
        try {
          client.write(frame);
        } catch {
          // Socket is half-closed or destroyed — remove it from the set so
          // future broadcasts skip it immediately.
          this.connectedClients.delete(client);
        }
      }
    }
  }

  /**
   * Serialize a message to a newline-terminated NDJSON frame.
   */
  private _frame(message: BusMessage): string {
    return JSON.stringify(message) + "\n";
  }

  /**
   * Type guard: check that a parsed value looks like a valid BusMessage.
   * Only validates the discriminant fields (id, topic, payload, timestamp,
   * source) — payload contents are trusted from co-located processes.
   */
  private _isValidMessage(value: unknown): value is AnyBusMessage {
    if (typeof value !== "object" || value === null) return false;
    const v = value as Record<string, unknown>;
    return (
      typeof v["id"] === "string" &&
      typeof v["topic"] === "string" &&
      VALID_TOPICS.has(v["topic"]) &&
      typeof v["payload"] === "object" &&
      v["payload"] !== null &&
      typeof v["timestamp"] === "string" &&
      typeof v["source"] === "string"
    );
  }

  /**
   * Schedule a reconnection attempt with exponential back-off.
   *
   * Back-off formula: `reconnectDelay * 2^min(attempts, 6)` — caps at 64×
   * the base delay (e.g. 64 s when base = 1 s).
   */
  private _scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit("max_reconnect_exceeded");
      return;
    }

    const backoffFactor = Math.pow(2, Math.min(this.reconnectAttempts, 6));
    const delay = this.reconnectDelay * backoffFactor;
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connectClient()
        .then(() => {
          this.emit("reconnected");
        })
        .catch(() => {
          if (!this.isShuttingDown) {
            this._scheduleReconnect();
          }
        });
    }, delay);
  }
}
