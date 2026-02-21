# Task: Define TUI Event Bus and RTES Integration (Sub-Epic: 12_TUI Log Streaming & Event Support)

## Covered Requirements
- [TAS-038]

## 1. Initial Test Written
- [ ] Create a unit test for a `TUIEventBus` class in `@devs/cli/tui/events`.
- [ ] Verify that the event bus can subscribe to events of type `THOUGHT_STREAM`, `TOOL_LIFECYCLE`, and `AGENT_LOG`.
- [ ] Mock the core `RTES` (Real-time Trace & Event Streaming) emitter and verify that `TUIEventBus` correctly receives and forwards events to its subscribers.
- [ ] Test that multiple TUI components can subscribe to the same event bus without interference.

## 2. Task Implementation
- [ ] Define the `TUIEvent` interface and supporting types in `@devs/cli/tui/types.ts`.
- [ ] Implement the `TUIEventBus` class using `EventEmitter` or a similar pattern that is compatible with React hooks.
- [ ] Create a `useTUIEvents` React hook that allows Ink components to subscribe to specific event types.
- [ ] Integrate the `TUIEventBus` with the CLI entry point so it connects to the core orchestrator's event stream upon `devs run`.
- [ ] Ensure that the event bus handles connection/disconnection events from the core engine.

## 3. Code Review
- [ ] Verify that the event bus doesn't leak memory (subscribers are cleaned up in `useEffect` hooks).
- [ ] Ensure that the event payloads are typed strictly according to the `TAS-113` event types.
- [ ] Check that the bridge between the core process and the TUI process (if separate) uses the established IPC mechanism.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test @devs/cli/tui/events` to ensure the event bus logic is sound.

## 5. Update Documentation
- [ ] Update `docs/architecture/tui_event_flow.md` to describe how the TUI receives real-time updates from the core engine via the RTES.

## 6. Automated Verification
- [ ] Run a script that spawns a mock RTES emitter and verifies that a CLI TUI listener captures and logs the expected number of events to a temporary file.
