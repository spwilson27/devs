# Task: Multi-Agent Panel Component (Sub-Epic: 44_Dashboard_Sidebar_Hub)

## Covered Requirements
- [4_USER_FEATURES-REQ-006], [7_UI_UX_DESIGN-REQ-UI-DES-094]

## 1. Initial Test Written
- [ ] Create unit tests at packages/webview/src/components/__tests__/MultiAgentPanel.test.tsx that assert:
  - The component renders a list of agents with avatar, displayName, role tag, and an online/offline status dot.
  - Role color tokens map correctly (Developer=blue, Reviewer=orange, Architect=green) and the rendered color matches the CSS variable values.
  - Rendering is stable under rapid updates (simulate store updates and assert no thrown errors and limited DOM mutations by snapshot diffing).

## 2. Task Implementation
- [ ] Implement MultiAgentPanel component at packages/webview/src/components/MultiAgentPanel.tsx with props: agents: Agent[] and onSelect(agentId: string).
  - Render each agent as a compact row: 24px avatar, 12px status dot, bold name, small role badge. Use CSS variables: --devs-agent-developer, --devs-agent-reviewer, --devs-agent-architect.
  - Use React.memo and key by agent.id to avoid re-renders; if agents length exceeds 50, integrate simple virtualization (windowing) via react-window.
  - Add a small agent action overflow menu (3-dot) that exposes 'Focus', 'Mute', 'Inspect' commands; these emit events to the store or the webview host.

## 3. Code Review
- [ ] Verify color usage is via CSS variables (no hard-coded hex colors). Verify role color contrast meets WCAG 4.5:1 on primary text.
- [ ] Verify efficient rendering: check use of React.memo/useCallback, and that virtualization is enabled when agent count > 50.
- [ ] Verify no direct calls to fs or extension APIs from the component; interactions should be event-driven.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- packages/webview/src/components/__tests__/MultiAgentPanel.test.tsx` and ensure all tests pass.

## 5. Update Documentation
- [ ] Document component props, events, and role color tokens in docs/components.md under `MultiAgentPanel` heading.

## 6. Automated Verification
- [ ] Add a small smoke test script that mounts the component in jsdom and measures render time for 100 agents; fail if mount time > 250ms on CI runner (tunable).
