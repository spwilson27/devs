# Task: Expose ContentExtractor as an MCP Tool for Agent Consumption (Sub-Epic: 04_Content Extraction Tools)

## Covered Requirements
- [TAS-028], [9_ROADMAP-TAS-303], [9_ROADMAP-REQ-026]

## 1. Initial Test Written
- [ ] Create `src/mcp/tools/__tests__/extract_content_tool.test.ts`.
- [ ] Write a test that `extractContentTool` exported from `src/mcp/tools/extract_content_tool.ts` has the correct MCP tool schema: `name: "extract_content"`, `description` containing the substring `"Extracts web page content"`, and `inputSchema` with a required `url` string property.
- [ ] Write a test that calling `extractContentTool.handler({ url: 'https://example.com' })` with a mocked `IContentExtractor` returns a JSON-serializable object with the shape `{ markdown: string, sourceUrl: string, noiseStripped: boolean, adCount: number, navCount: number }`.
- [ ] Write a test that when the underlying `IContentExtractor.extract()` throws `ExtractionFailedError`, the MCP handler returns an MCP error response (not an uncaught exception) with `isError: true` and a human-readable `content` message.
- [ ] Write a test that when the `url` parameter is missing from the input, the MCP handler returns a validation error with `isError: true`.
- [ ] Write a test that when the `url` parameter is not a valid HTTP/HTTPS URL (e.g., `"ftp://bad"` or `"not-a-url"`), the handler returns a validation error.
- [ ] Write a test that the optional `provider` input parameter (`'firecrawl' | 'jina'`) overrides the default provider for that single call.

## 2. Task Implementation
- [ ] Create `src/mcp/tools/extract_content_tool.ts`:
  - Import `IContentExtractor`, `ContentExtractorFactory`, `ExtractionFailedError` from the content extractor module.
  - Export `extractContentTool` conforming to the project's `McpTool` interface (from `src/mcp/types.ts`).
  - Tool definition:
    - `name: "extract_content"`
    - `description: "Extracts web page content, including SPA/dynamic sites, and returns clean LLM-optimized Markdown. Strips navigation, ads, and noise automatically."`
    - `inputSchema`: JSON Schema object with:
      - `url` (string, required): The full HTTPS URL to extract.
      - `provider` (string, optional, enum `['firecrawl', 'jina']`): Override the default extraction provider.
      - `timeout` (number, optional): Maximum extraction time in milliseconds.
  - `handler(input)`: Validate `url` is a valid `https://` or `http://` URL (use `URL` constructor, catch `TypeError`). Call `ContentExtractorFactory.create(input.provider ?? defaultProvider).extract(input.url, { timeout: input.timeout })`. On success: return `{ content: [{ type: 'text', text: JSON.stringify(result) }] }`. On `ExtractionFailedError`: return `{ isError: true, content: [{ type: 'text', text: \`Extraction failed for ${input.url}: ${error.message}\` }] }`.
- [ ] Register `extractContentTool` in `src/mcp/tools/index.ts` by adding it to the exported tools array.
- [ ] Add a corresponding entry in `src/mcp/server.ts` (or wherever tools are registered with the MCP server instance).

## 3. Code Review
- [ ] Verify that the tool handler never throws an unhandled exception — all errors must be caught and returned as MCP error responses.
- [ ] Verify that the `provider` override uses `ContentExtractorFactory.create()` per-call (stateless), not a module-level singleton, ensuring different providers can be used per request.
- [ ] Verify that the `url` validation uses the WHATWG `URL` constructor (built into Node.js 18+) rather than a regex, for correctness.
- [ ] Verify that the tool's `inputSchema` is a valid JSON Schema Draft 7 object and matches the actual handler input type.
- [ ] Verify that the tool is tested in isolation using a mocked `ContentExtractorFactory` — no real HTTP calls in unit tests.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/mcp/tools/__tests__/extract_content_tool.test.ts --coverage` and confirm all tests pass with ≥90% branch coverage on `extract_content_tool.ts`.
- [ ] Run `npx jest src/mcp/ --coverage` and confirm no regressions in other MCP tool tests.
- [ ] Run `npx tsc --noEmit` and confirm zero type errors.

## 5. Update Documentation
- [ ] Create `src/mcp/tools/extract_content_tool.agent.md` documenting:
  - MCP tool name: `extract_content`.
  - Input schema (fields, types, required vs optional).
  - Output schema (`markdown`, `sourceUrl`, `noiseStripped`, `adCount`, `navCount`).
  - Error response format.
  - Example agent usage: code snippet calling `extract_content` via MCP.
- [ ] Update `docs/mcp_tools_reference.md` (or equivalent) with an entry for `extract_content`.

## 6. Automated Verification
- [ ] Run `npx jest src/mcp/tools/__tests__/extract_content_tool.test.ts --json --outputFile=/tmp/mcp_tool_results.json && node -e "const r=require('/tmp/mcp_tool_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"` and confirm exit code 0.
- [ ] Run `node -e "const tools = require('./dist/mcp/tools'); const t = tools.find(t => t.name === 'extract_content'); if (!t) process.exit(1); console.log('Tool registered:', t.name)"` and confirm output is `Tool registered: extract_content`.
- [ ] Run `npm run lint src/mcp/tools/extract_content_tool.ts` and confirm zero errors.
