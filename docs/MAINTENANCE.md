Whenever a major feature is completed:

Update

Current Focus

Feature Mapping

Business Rules

Architecture Decisions

Project Memory

Implementation Patterns

AI Memory

If documentation is outdated,

documentation is a bug.

# Documentation Maintenance Checklist

Whenever a pull request changes any of the following:

- Architecture
- Folder structure
- Business rules
- API contracts
- Authentication
- Authorization
- Workflows
- Shared components
- Shared hooks
- Shared utilities
- Coding conventions
- Development workflow
- Deployment process

The same pull request should also update:

- `PROJECT_CONTEXT.md` (if applicable)
- `docs/CURRENT_FOCUS.md` (if priorities changed)
- Relevant documents under `docs/`
- `18_ARCHITECTURAL_DECISIONS.md` (if a design decision changed)
- `31_IMPLEMENTATION_PATTERNS.md` (if development patterns changed)
- `39_AI_MEMORY.md` (if project philosophy changed)

Documentation that no longer matches the codebase is considered a defect.

A feature is not complete until both implementation and documentation are in sync.