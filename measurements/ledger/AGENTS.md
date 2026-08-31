# AGENTS.md — repository constitution

Read this before doing anything in this repository. It applies to every agent
(Cursor, Claude Code, Codex, Gemini CLI, Windsurf, OpenCode) and to every
subagent they dispatch.

This project runs on **Spec-Driven Development → Diamond Graph → Gauntlet Loop**.
Start it with `/sdd-gauntlet-loop`.

## Project

- **What this is:** `ledger` is a tiny offline CLI. It reads a CSV of expenses and prints a
  per-month, per-category report. It is used by one person on one laptop; there is no server,
  no database and no network call anywhere in it.
- **Stack:** Node.js 24, plain ES modules (`"type": "module"`). Zero runtime dependencies and
  zero dev dependencies — the test runner is `node --test`, built in. Keep it that way.
- **Entry points:** `src/cli.js` is the executable entry. `fixtures/expenses.csv` is the sample
  input that `npm run smoke` reads.

## Commands

```bash
npm test        # node --test test/  — the suite. Exits non-zero if any test fails OR if no test ran.
npm run check   # node --check on every src file — syntax gate, stands in for a typechecker.
npm run smoke   # end-to-end: runs the CLI against fixtures/expenses.csv and must exit 0.
```

There is no install step, no build step and no linter. Do not add one, and do not write a
verifier that depends on a package being installed — this project must run on a clean machine
with nothing but Node.

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

- **Style:** 2-space indent, semicolons, single quotes. Named exports only — no default exports.
- **Naming:** `camelCase` for values and functions, `PascalCase` for nothing (there are no
  classes here), `SCREAMING_SNAKE` for module-level constants.
- **Money:** amounts are handled as **integer cents**, never as floating-point numbers.
  `0.1 + 0.2 !== 0.3`, and a ledger that is off by a cent is a broken ledger. Parse to cents at
  the edge, do all arithmetic in cents, format back to a string only for display.
- **Errors:** a malformed input row is a reported error, never a silent skip and never a `NaN`
  that flows onward. Throw with a message naming the offending line number.
- **Tests:** `node:test` + `node:assert/strict`, in `test/<module>.test.js`, one test file per
  `src/` module. Every error path named in the design needs a test that triggers it.
- **Commits:** conventional commits, one logical change per commit.

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

- Never add a dependency. Not a formatter, not a CSV library, not a test framework. If a task
  seems to need one, that is a signal the task is wrong — escalate instead of installing.
- Never do money arithmetic in floats. See **Money** above; this is the one rule most likely to
  be broken by accident and it is the one a critic must check first.
- Never edit `fixtures/expenses.csv` to make a test pass. The fixture is the input contract; if
  code disagrees with it, the code is wrong.
- Never make a network call or read an environment variable. This CLI is offline and pure.
