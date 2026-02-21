# Task: Abstract Model Provider Ecosystem and MCP Interfaces (Sub-Epic: 29_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-131]

## 1. Initial Test Written
- [ ] Write unit tests for an abstract `IModelProvider` interface, asserting that concrete implementations (e.g., `GeminiProvider`, `MockProvider`) fulfill the contract identically.
- [ ] Write tests ensuring that the `AgentCore` does not contain hardcoded references to Gemini-specific API constructs (like `candidates` or `parts`), but rather standard `Message` objects.

## 2. Task Implementation
- [ ] Refactor the existing LLM orchestration layer to extract all Gemini 3 Pro specific API logic into a dedicated `GeminiAdapter` implementing `IModelProvider`.
- [ ] Ensure that all internal agents and tools consume standardized `AgentRequest` and `AgentResponse` DTOs rather than direct vendor objects.
- [ ] Abstract the MCP server initialization and protocol bindings so that underlying standards can be updated independently of the core agent logic.

## 3. Code Review
- [ ] Conduct a strict dependency review to guarantee that `@google/generative-ai` (or similar) is only imported within the specific adapter files, not globally in the core engine.
- [ ] Verify that changing the provider configuration purely requires an environment variable update or DI binding swap, without touching business logic.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test` to ensure all existing agent interaction tests pass using the refactored provider interface.
- [ ] Run the test suite using an injected `MockProvider` to prove complete decoupling from the live Gemini API.

## 5. Update Documentation
- [ ] Update `docs/tas.md` to map out the new `IModelProvider` architectural boundary.
- [ ] Document the exact DTO schemas (`AgentRequest`, `AgentResponse`) in the repository for future adapter implementations.

## 6. Automated Verification
- [ ] Run a linting rule or custom AST script enforcing that the core engine domain (`src/core/`) imports zero vendor-specific SDK modules.
