Tests directory conventions:

- tests/unit/ mirrors src/ and contains fast unit tests.
- tests/integration/ contains longer-running integration tests (e.g., docker, webcontainer).
- tests/agent/ contains agent-driven end-to-end tests.
- Test files should end with .test.ts and live alongside their relevant subfolders.
