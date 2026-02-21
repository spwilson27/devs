# Task: Implement Interactive Q&A interface with Architect Agent (Sub-Epic: 12_HITL Approval Interface)

## Covered Requirements
- [1_PRD-REQ-NEED-DOMAIN-03]

## 1. Initial Test Written
- [ ] Create `tests/integration/test_qna_agent.py` with the following tests:
  - `test_start_qna_session`: POST `/api/architect/qna/start` with `{doc_type, doc_id}` and assert response contains `session_id` and `linked_doc_id`.
  - `test_send_message_and_receive_response`: POST `/api/architect/qna/{session_id}/message` with `{author: 'user', text: 'Why was dependency X chosen?'}`; mock the ArchitectAgent to return a deterministic answer and assert the message is stored and the response is returned and persisted.
  - `test_qna_session_linked_to_document`: Ensure each message is linked to the TAS/PRD (doc_id) in the DB and visible when retrieving `/api/architect/qna/{session_id}`.

## 2. Task Implementation
- [ ] Implement backend Q&A endpoints in `src/api/architect_qna.py`:
  - `POST /api/architect/qna/start` -> creates a `QnaSession` linked to `doc_type`/`doc_id` and returns `session_id`.
  - `POST /api/architect/qna/{session_id}/message` -> accepts a user message, forwards it to the ArchitectAgent (via MCP client or a local stub), stores both user message and agent response as immutable `QnaMessage` records.
  - `GET /api/architect/qna/{session_id}` -> returns transcript.
- [ ] Implement a thin `src/agents/architect_agent.py` adapter that can be mocked in tests; real implementation should call the MCP/Gemini client with a fixed prompt template linking the TAS document and context.
- [ ] Add DB models `QnaSession` and `QnaMessage` with fields: `session_id`, `doc_type`, `doc_id`, `author`, `text`, `agent_response`, `created_at`.
- [ ] Add rate-limiting and basic RBAC for starting sessions (limit per-doc per-user to prevent abuse).
- [ ] Implement front-end `ChatPanel` component in the review dashboard that can start a session, send messages, and stream AI responses incrementally (fallback to polling if streaming not available).

## 3. Code Review
- [ ] Verify: transcripts are immutable and auditable; third-party API keys (Gemini) are not leaked in logs; Agent responses include provenance metadata (model, prompt digest) and are stored.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest -q tests/integration/test_qna_agent.py` (with the ArchitectAgent adapter mocked) and ensure all tests pass deterministically.

## 5. Update Documentation
- [ ] Add `docs/architect_qna.md` describing the Q&A flows, sample prompts used with the ArchitectAgent, session lifecycle, and retention policy for transcripts.

## 6. Automated Verification
- [ ] Add `scripts/ci_verify_qna.sh` that runs the Q&A integration tests (with agent adapter mocked) and verifies transcripts are persisted and linked to documents.
