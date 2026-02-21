# Task: Log Chunking API & "Read More" Behavior (Sub-Epic: 59_Log_Windowing_Core)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-047], [6_UI_UX_ARCH-REQ-097]

## 1. Initial Test Written
- [ ] Create unit and integration tests at tests/webview/console/chunkManager.test.ts and tests/webview/console/readmore.integration.test.ts that describe the chunking and read-more contract:
  - ChunkManager.getPage(pageIndex, pageSize) returns deterministic pages of historical logs; create synthetic data of 1,200 lines and assert pages are sized correctly and that the last page contains the most recent logs.
  - When the WindowingStore is receiving live appends, Read More should fetch older pages without resetting the user's scroll position; write an integration test using jsdom that simulates prepending a page and asserts scrollTop is adjusted so the visible content remains stable.
  - Assert that chunking logic cooperates with maxLines=500 retention: when retention trimming occurs, older pages disappear and Read More should indicate end-of-history.

## 2. Task Implementation
- [ ] Implement a ChunkManager at src/webview/console/chunkManager.ts with this API and behavior:
  - append(entry: LogEntry): void
  - getPage(pageIndex:number, pageSize:number=100): { entries: LogEntry[], pageIndex:number, hasMore:boolean }
  - readMore(cursor?:{pageIndex:number}): Promise<{ entries: LogEntry[], hasMore:boolean }>
  - Implementation detail: maintain pages as views into the WindowingStore using indices rather than copying arrays; pages should be immutable snapshots (shallow copies) returned to the UI to avoid concurrent modification.
  - Expose an event or callback (onPrepend(page)) that ConsoleView can use to preserve scroll position when older pages are inserted at the top.
  - Provide a configurable pageSize for tests and a default of 100 lines.

## 3. Code Review
- [ ] Ensure:
  - Pages are computed via index arithmetic and do not copy the entire backing array on each request.
  - readMore is asynchronous (returns a Promise) to support future remote/backing-store implementations.
  - The API documents the contract for hasMore and how to detect end-of-history.

## 4. Run Automated Tests to Verify
- [ ] Execute the chunk manager unit tests and the read-more integration test to ensure scroll-preservation assertions pass and chunk boundaries are correct.

## 5. Update Documentation
- [ ] Document chunking contract in docs/phase_11/59_log_windowing_core/design.md and include an example UI sequence showing initial tail load -> user triggers Read More -> older pages fetched -> scroll preserved.

## 6. Automated Verification
- [ ] Add an automated integration check tests/phase_11/chunking_verify.js that simulates the real-life timeline: append 5,000 logs, set maxLines=500, ensure getPage(pageIndex) returns pages consistent with trim behavior and that readMore eventually reports hasMore=false.
