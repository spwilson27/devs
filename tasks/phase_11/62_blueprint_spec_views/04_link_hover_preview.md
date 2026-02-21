# Task: Implement Link Hover Previews and Inline Disambiguation (Sub-Epic: 62_Blueprint_Spec_Views)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-061]

## 1. Initial Test Written
- [ ] Create an integration test `src/webview/components/__tests__/LinkPreview.test.tsx`:
  - Use Jest + React Testing Library + `msw` to mock the preview API endpoint `/api/docs/preview?target=`.
  - Render `SpecLink` and simulate `mouseEnter` (hover) on the link.
  - Assert that after debounce (150ms) a network request is made and a tooltip with sanitized HTML excerpt appears with `role="tooltip"`.
  - Assert that repeated hovers read from cache (no additional network request) and that cache TTL invalidation is tested by advancing timers.
  - Run: `npx jest src/webview/components/__tests__/LinkPreview.test.tsx --runInBand --json --outputFile=tmp/link-preview-test.json`

## 2. Task Implementation
- [ ] Implement `src/webview/components/LinkPreview.tsx` and supporting store `src/webview/stores/specPreviewStore.ts`:
  - Behavior:
    - On hover (mouseEnter/focus), debounce 150ms then fetch preview via `fetchPreview(target)` which hits `/api/docs/preview?target=...` through the MCP bridge or webview host.
    - Cache preview responses in `specPreviewStore` with TTL (default 5 minutes) and a simple LRU policy for more than 200 entries.
    - Show sanitized HTML excerpt inside an accessible tooltip (`role="tooltip"`, `aria-hidden` when not visible).
    - Cancel pending fetch on mouseLeave before debounce completes.
  - Efficiency:
    - Batch preview fetches that occur within 50ms to avoid overloading the preview backend (coalesce requests for the same `target`).

## 3. Code Review
- [ ] Verify:
  - Fetch cancellation, debounce, and cache invariants are properly tested.
  - Tooltip is accessible (keyboard focus opens tooltip, tooltip content announced if appropriate), and sanitized to avoid XSS.
  - Rate-limiting/coalescing logic prevents excessive network calls.

## 4. Run Automated Tests to Verify
- [ ] Run the link preview integration test:
  - `npx jest src/webview/components/__tests__/LinkPreview.test.tsx --runInBand --json --outputFile=tmp/link-preview-test.json`
  - Confirm 0 failures and assert that only one network request occurred for repeated hovers (check msw's request log).

## 5. Update Documentation
- [ ] Add `docs/spec-linking.md` section `Hover previews` documenting the preview API contract, caching TTL, and LRU sizing.

## 6. Automated Verification
- [ ] After running the jest command, validate the JSON output and assert via a Node script that `msw` served exactly one request for repeated hovers and that `tmp/link-preview-test.json` records 0 failures.
