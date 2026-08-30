---
name: sdd-spec
description: Phase 1 only — turn a request into proposal.md, design.md and tasks.md under specs/<change-id>/, and stop there. Writes no implementation code.
argument-hint: <what to build>
disable-model-invocation: true
---

Run **Phase 0 and Phase 1** of the SDD + Gauntlet Loop, and nothing after them.

Read `skills/sdd-gauntlet-loop/SKILL.md` for the principles, then
`references/phase-1-spec.md` for this phase in detail. Follow them as written.

## Do

1. **Bootstrap.** Ensure `AGENTS.md`, `contract.md` and `progress.md` exist at the
   repo root; create the missing ones from the skill's `assets/`. Never clobber an
   `AGENTS.md` someone already wrote — ask first.
2. **Pick the change id** — a kebab-case slug for this work. Announce it.
3. **Dispatch the `spec-writer` subagent** with the request below and the
   constitution. It produces `specs/<change-id>/{proposal,design,tasks}.md`.
   If the repo has `openspec/` or the `openspec` CLI, drive the phase through it.

## Do not

Write, scaffold or stub a single implementation file. Not the types, not the
folder structure. A spec phase that touches code has failed, and the rest of the
pipeline is now grading work nobody specified.

Do not continue into Phase 2. This command ends at the spec.

## Stop by returning

The three file paths, the task count, the parallel waves you would plan from the
`files:` and `depends:` lines, and every open question — as questions, not as
assumptions you resolved on your own. Then ask the user to approve the spec
before `/sdd-contract`.

---

What to build:

$ARGUMENTS
