# AGENTS.md — repository constitution

Read this before doing anything in this repository. It applies to every agent
(Cursor, Claude Code, Codex, Gemini CLI, Windsurf, OpenCode) and to every
subagent they dispatch.

This project runs on **Spec-Driven Development → Diamond Graph → Gauntlet Loop**.
Start it with `/sdd-gauntlet-loop`.

## Project

- **What this is:** [one paragraph — what the project does and for whom]
- **Stack:** [languages, framework, database, hosting]
- **Entry points:** [where a reader should start, e.g. `src/main.ts`, `app/`]

## Commands

```bash
[install]      # e.g. pnpm install
[dev]          # e.g. pnpm dev
[test]         # e.g. pnpm test
[typecheck]    # e.g. pnpm typecheck
[lint]         # e.g. pnpm lint
[build]        # e.g. pnpm build
```

These are the commands the contract's verifiers are built from. Keep them accurate.

## Golden rules

1. **Read before you write.** Never edit a file you have not read in this session.
2. **Edit before you create.** A new file needs a reason the existing ones can't serve.
3. **Do only what was asked.** No unrequested features, refactors, or abstractions.
4. **Smallest change that works.** Delete more than you add when you can.
5. **No stubs presented as finished.** A `TODO` in a node claimed as done is a failed node.
6. **Never weaken a test to make it pass.** Not skipping, not mocking away the thing under test, not loosening an assertion.
7. **Never commit secrets.** No keys, tokens, or `.env` contents — in code, in logs, in commit messages.
8. **Ask before anything destructive.** Schema drops, data deletion, force-push, history rewrites, deploys.
9. **State lives on disk.** `contract.md` and `progress.md` are the source of truth, not the conversation.
10. **The builder never grades itself.** Approval comes from a clean-context critic, always.

## Conventions

- **Style:** [formatter, linter, and anything they don't catch]
- **Naming:** [the conventions that already exist in this codebase]
- **Errors:** [how failures are surfaced — exceptions, result types, logging]
- **Tests:** [framework, where they live, what must be covered]
- **Commits:** [format, e.g. conventional commits; one logical change per commit]

## Loop files

| File | Role |
|---|---|
| `AGENTS.md` | this constitution — rules that outlive any single change |
| `specs/<change-id>/` | proposal, design, tasks for the change in flight |
| `contract.md` | objective, verifiers, critic rubric, boundaries |
| `progress.md` | append-only log of every wave, node, iteration and verdict |

## Subagent roles

| Role | Writes code? | Sees | Decides |
|---|---|---|---|
| lead / orchestrator | no | everything | wave plan, dispatch, when to stop |
| `builder` | yes, in its files only | constitution, contract, its own task | nothing about quality |
| `harsh-critic` | **never** | contract + diff only | PASS / FAIL |
| `integrator` | seams only | full change + design | that the parts form a whole |

## Model routing

- Trivial and mechanical work → the cheapest capable model.
- Building, reviewing, and architecture → the strongest model available.
- Critics are never cheaper than the builders they review.

## Never do

- [project-specific hard limits — e.g. "never touch `legacy/`", "never call the billing API from tests"]
