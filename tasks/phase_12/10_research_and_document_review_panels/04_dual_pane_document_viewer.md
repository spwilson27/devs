# Task: Dual Pane Document Viewer with Live Mermaid Rendering (Sub-Epic: 10_Research and Document Review Panels)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-092-1]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/components/documents/__tests__/DualPaneViewer.test.tsx`, write unit tests using React Testing Library and Vitest that verify:
  - The `DualPaneViewer` component renders two panes side-by-side: a left pane (`data-testid="markdown-source-pane"`) and a right pane (`data-testid="mermaid-render-pane"`).
  - The left pane contains a `<textarea>` (or `<pre>`) that displays the raw Markdown string passed via the `markdownContent` prop.
  - When `markdownContent` contains a fenced ```` ```mermaid ```` code block, the right pane renders a `<div data-testid="mermaid-diagram">` element (mocked Mermaid.js in test env).
  - When `markdownContent` contains no Mermaid block, the right pane renders a live Markdown preview (paragraphs, headings) via a mocked `react-markdown` renderer and shows `data-testid="markdown-preview"`.
  - The pane splitter (resizable divider) is present: a `<div role="separator" aria-orientation="vertical">` element.
  - Dragging the splitter adjusts the `style.width` of the left pane (simulate `mousedown` on separator, `mousemove` by 100px, `mouseup`; assert left pane width changed).
  - A "Collapse Left" button (`data-testid="collapse-left-btn"`) toggles the left pane to `width: 0` and hides the separator; a "Expand Left" button restores it.
  - When `isLoading` prop is true, both panes render a skeleton placeholder (`data-testid="pane-skeleton"`).
- [ ] Mock `mermaid` module in the test setup: `vi.mock('mermaid', () => ({ default: { initialize: vi.fn(), render: vi.fn().mockResolvedValue({ svg: '<svg data-testid="mermaid-diagram" />' }) } }))`.
- [ ] Mock `react-markdown` to render children as plain text for predictable assertions.

## 2. Task Implementation
- [ ] Install dependencies (if not already present):
  ```bash
  pnpm --filter webview-ui add mermaid react-markdown
  pnpm --filter webview-ui add -D @types/mermaid
  ```
- [ ] Create `packages/webview-ui/src/components/documents/DualPaneViewer.tsx`:
  - Props:
    ```ts
    interface DualPaneViewerProps {
      markdownContent: string;
      isLoading?: boolean;
      initialSplitPercent?: number; // default: 50
    }
    ```
  - State: `leftWidthPercent: number` (default `initialSplitPercent ?? 50`), `isLeftCollapsed: boolean`.
  - Use `useEffect` to initialize Mermaid once on mount:
    ```ts
    useEffect(() => {
      mermaid.initialize({ startOnLoad: false, theme: 'neutral' });
    }, []);
    ```
  - Extract Mermaid blocks from `markdownContent` using a regex: `/```mermaid\n([\s\S]*?)```/g`.
  - For each Mermaid block found, call `mermaid.render('mermaid-' + index, diagramDefinition)` inside a `useEffect` keyed on `markdownContent`. Store resulting SVG strings in state.
  - Render:
    ```tsx
    <div className="flex h-full w-full overflow-hidden" ref={containerRef}>
      {/* Left pane */}
      <div
        data-testid="markdown-source-pane"
        style={{ width: isLeftCollapsed ? '0' : `${leftWidthPercent}%` }}
        className="overflow-auto border-r border-gray-200 transition-width"
      >
        <pre className="p-4 text-xs font-mono whitespace-pre-wrap">{markdownContent}</pre>
      </div>

      {/* Resizable divider */}
      {!isLeftCollapsed && (
        <div
          role="separator"
          aria-orientation="vertical"
          className="w-1.5 cursor-col-resize bg-gray-300 hover:bg-blue-400 transition-colors"
          onMouseDown={handleDividerMouseDown}
        />
      )}

      {/* Right pane */}
      <div
        data-testid="mermaid-render-pane"
        className="flex-1 overflow-auto p-4"
      >
        {isLoading ? (
          <div data-testid="pane-skeleton" className="skeleton h-full w-full" />
        ) : hasMermaidBlock ? (
          renderedSvgs.map((svg, i) => (
            <div key={i} data-testid="mermaid-diagram" dangerouslySetInnerHTML={{ __html: svg }} />
          ))
        ) : (
          <div data-testid="markdown-preview">
            <ReactMarkdown>{markdownContentWithoutMermaid}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
    ```
  - Implement `handleDividerMouseDown`:
    - On `mousedown`, attach `mousemove` and `mouseup` listeners to `document`.
    - On `mousemove`, calculate new `leftWidthPercent = (event.clientX - containerRef.current.getBoundingClientRect().left) / containerRef.current.offsetWidth * 100`, clamped to `[15, 85]`.
    - On `mouseup`, remove listeners.
  - Render collapse/expand controls:
    ```tsx
    <button data-testid="collapse-left-btn" onClick={() => setIsLeftCollapsed(true)}>◀</button>
    // shown only when not collapsed
    <button data-testid="expand-left-btn" onClick={() => setIsLeftCollapsed(false)}>▶</button>
    // shown only when collapsed
    ```
  - Sanitize the `dangerouslySetInnerHTML` SVG output using `DOMPurify` to allow only SVG tags:
    ```ts
    import DOMPurify from 'dompurify';
    const cleanSvg = DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true } });
    ```
  - Install DOMPurify: `pnpm --filter webview-ui add dompurify && pnpm --filter webview-ui add -D @types/dompurify`.
- [ ] Create `packages/webview-ui/src/components/documents/index.ts` and export `DualPaneViewer`.
- [ ] Integrate `DualPaneViewer` into the document review view (e.g., `DocumentReviewPage.tsx`) that receives a `HighLevelDocument` with a `markdownContent` field.

## 3. Code Review
- [ ] Verify `dangerouslySetInnerHTML` is only used on DOMPurify-sanitized SVG output; never on raw user-controlled strings.
- [ ] Confirm the `mermaid.render` `useEffect` has a cleanup function that cancels any in-flight render promises to prevent state updates on unmounted components.
- [ ] Ensure left pane width clamping `[15, 85]` prevents either pane from being fully occluded by dragging alone (collapse is the intentional path).
- [ ] Check that `ReactMarkdown` is configured with `rehype-sanitize` plugin to prevent XSS in Markdown HTML.
- [ ] Verify the `role="separator"` element has `aria-valuenow`, `aria-valuemin`, `aria-valuemax` attributes reflecting `leftWidthPercent` for accessibility.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter webview-ui test -- --run DualPaneViewer` and confirm all tests pass.
- [ ] Run `pnpm --filter webview-ui test -- --coverage` and confirm `DualPaneViewer.tsx` has ≥ 85% line coverage.

## 5. Update Documentation
- [ ] Add JSDoc to `DualPaneViewer.tsx` describing Mermaid detection regex, sanitization strategy, and pane resizing clamp bounds.
- [ ] Update `packages/webview-ui/README.md` under "Components" to list `DualPaneViewer` with a description of its dual-pane behavior.
- [ ] Add to `docs/agent-memory/phase_12_decisions.md`: "DualPaneViewer uses mermaid.js for diagram rendering; SVG output is sanitized with DOMPurify SVG profile; pane resize is clamped to 15–85%."

## 6. Automated Verification
- [ ] `pnpm --filter webview-ui test -- --run` exits 0.
- [ ] `pnpm --filter webview-ui tsc --noEmit` exits 0.
- [ ] Confirm DOMPurify is in the production dependency list: `cat packages/webview-ui/package.json | python3 -c "import sys,json; d=json.load(sys.stdin); assert 'dompurify' in d['dependencies'], 'dompurify missing'; print('OK')"`.
- [ ] Run `pnpm --filter webview-ui build` and confirm zero build errors (Mermaid and DOMPurify must be correctly bundled).
