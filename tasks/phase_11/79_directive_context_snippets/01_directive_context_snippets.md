# Task: Contextual Snippets for Directives (Sub-Epic: 79_Directive_Context_Snippets)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-031], [6_UI_UX_ARCH-REQ-090]

## 1. Initial Test Written
- [ ] Write string parsing tests that ensure `@file` references map successfully to file path contents in the payload processor.
- [ ] Assert that submitting a whisper with an `@file` path or `#requirement` ID packages the actual target contents alongside the message.

## 2. Task Implementation
- [ ] Extend the Directive Processing pipeline to automatically resolve `@file` and `#requirement` strings identified by the autocomplete UI.
- [ ] Implement an asynchronous context injection step that literally pulls file content or requirement descriptors and appends them to the whisper context before delegating to the agent orchestrator.

## 3. Code Review
- [ ] Verify secure file reading constraints when pulling `@file` contents to prevent unauthorized directory traversal.
- [ ] Ensure that extremely large files do not overload the payload limit.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- DirectiveContextSnippets.test.ts`.

## 5. Update Documentation
- [ ] Record the context resolution process in the architecture guides so prompt engineers understand how injected data looks.

## 6. Automated Verification
- [ ] Run type checks to confirm file fetching returns strictly formatted and sanitized buffers.
