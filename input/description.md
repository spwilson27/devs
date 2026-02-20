# Project Description

devs is an agentic AI system that allows users to provide a short project
description, and example user journeys and translate it into a completely
finished greenfield software project. The devs project is wrapped in a VSCode
Extension, CLI tool, and supports an MCP interface.

It accomplishes this by using a series of agents to:

1. Research the problem space
  - Create a market research report
  - Create a competitive analysis report
  - Create a technology landscape report
  - Create a user research report
2. Develop a detailed set of high level documents (PRD, TAS, MCP Arch, etc.)
  - For each document: Prompt AI to flesh out the phase of the document
3. Distill documents into a complete list of requirements
  - For each document: Distill document into a list of requirements
  - Merge requirements from all documents
  - Order requirements by dependencies
4. Generate a series of high level ordered project phases (epics) tied which meet all requirements (expect around 8-16 phases)
5. Break phases into atomic tasks, which must meet all requirements for the given phase
  - For each phase: Break phase into atomic tasks (Ideally around 25+ per phase)
  - For each phase: Review the broken down tasks to ensure all requirements are met
6. Finally iterate through tasks performing a rigorous test-driven development cycle for each task including:
   a. Agent: Initial Test written
   b. Agent: Task Implementation
   c. Agent: Code Review
   d. Agent: Run Automated Tests to verify
   e. Agent: Update Documentation (project documentation, and agent "memory" is updated)
   f. Automated: run the tests to verify the agents haven't lied about the tests passing

## High Level Documents

A "research agent and architect" agent will be responsible for generating a set
of high level documents which will guide the development process. These
documents will be stored in the project's documentation directory. And will be
used to generate requirements, epics, and tasks.

Each document should be written with the primary audience (AI Agents) in mind:
- Documents should be authoritative and unambiguous. (Identify problems and make decisions.)
- No flowery or braggy language needed.
- Diagrams should use mermaid markup, not images.

Documents are:

1. PRD (Product Requirements Document)
   - Answer the question: "What should this project do?"
   - Answer the question: "What should this project not do?"
   - Answer the question: "What are the goals of this project?"
   - Answer the question: "What are the constraints of this project?"
2. TAS (Technical Architecture Specification)
   - Answer the question: "How should this project be structured?"
   - Answer the question: "What technologies should be used in this project?"
   - Answer the question: "What patterns should be used in this project?"
3. MCP and AI Development Design
   - Answer the question: "How will AI agents interact with this project?"
   - Answer the question: "How should the traditional project structure change to support a Glass-Box architecture?"
   - Answer the question: "What is needed to support thorough and automated validation?"
4. User Features
   - Answer the question: "What user journeys should this project support?"
   - Answer the question: "What features should this project support?"
   - Answer the question: "What would users expect this project to do?"
5. Security Design
   - Answer the question: "What security risks does this project have?"
   - Answer the question: "How should this project be secured?"
6. UI/UX Architecture
   - How should the project be structured to support a rich and interactive user experience?
   - What technologies should be used to support a rich and interactive user experience?
7. UI/UX Design
   - Answer the question: "What should the user interface look like?"
   - Answer the question: "What should the user experience be like?"
   - Answer the question: "What should the user journey be like?"
8. Risks and Mitigation
   - Answer the question: "What are the risks associated with this project?"
   - Answer the question: "How can we mitigate these risks?"
9. Project Roadmap
    - Answer the question: "What is the order of operations for this project?"
    - Answer the question: "What are the dependencies between tasks?"
    - Answer the question: "What are the milestones for this project?"

## devs User Journeys

### The Maker of devs

As the sole maker of devs, I will heavily leverage Agentic AI to develop devs. I
do not need to "bootstrap" the project, as in I will not be using devs to create
devs. I will be creating temporary ad-hoc tools to perform the initial
development of the documentation for the project.

However, the devs project validation should be extremely thorough and entirely
automated. From the start, devs should support agentic Debugging and Profiling
capabilities to support gemini-based development.

### The devs User

As the devs user, I have a project idea and want to see it come to life. I will
provide a short project description, and example user journeys and devs should
develop a complete software project.

- I am a developer who likely is familiar with general software
  development but likely is inexperienced with the specific technologies required
  for my project. I will want to review all architectural decisions
  within high level documents and approve them before the project proceeds.
- At any point in the process (document generation or automated development),
  I will want to be able to monitor the development process and will
  want to be able to intervene and provide feedback or new requirements at any
  point in the process.
- I will want to automatically detect and prevent AI agents from
  getting trapped in loops which waste agent tokens and time.
- I will want the AI agents to be sandboxed to prevent them from working on 
  scope they are not yet assigned (i.e., working ahead of the current task.)

### The AI Devloper Agent directed by devs

As the AI Agent devs operated by devs, I will be responsible for implementing the
tasks assigned to me by the devs User or devs itself. I will be responsible for
maintaining the integrity of the project and ensuring that all tasks are completed
in an efficient manner.

- I will need to implement all requirements layed out in project requirement documents.
- I will need to remember all decisions made during the development process
  - Short-term: Current task context.
  - Medium-term: Phase/Epic architectural decisions.
  - Long-term: Project-wide constraints (e.g., "Always use Functional Programming," "No external CSS libraries")
- I will need to use the project's MCP interfaces to debug, and profile the
  project.
- Every project I make will need to support agentic debugging and profiling
  from the start. This means that the project should be structured in a way
  that makes it easy to debug and profile. This includes things like having
  clear separation of concerns, writing devsd documentation, and maintaining devsd
  test coverage and integrating an MCP server for to ensure I can debug and profile the code.
