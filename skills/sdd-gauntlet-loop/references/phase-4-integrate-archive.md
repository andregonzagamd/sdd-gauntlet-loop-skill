# Phases 4 and 5 — Integrate and archive

## Why integration is its own phase

Every node passed its own critic against its own slice of the contract. That is not evidence the system works. Node-level passes routinely hide:

- two builders implementing the same helper twice, slightly differently,
- an interface one node produces and another consumes, agreed on in `design.md` and drifted in practice,
- migrations that each work alone and conflict in sequence,
- a config value set in one node and read in another under a different name,
- the full test suite failing even though every subset passed.

## The integrator

Dispatch one `integrator` subagent when all waves have passed:

```
CONSTITUTION: <AGENTS.md>
CONTRACT:     <contract.md>
DESIGN:       <specs/<change-id>/design.md>
CHANGES:      <the full diff across all nodes>

Do this:
1. Merge or reconcile the nodes' work into one coherent change.
2. Find and remove duplication introduced across node boundaries.
3. Verify every interface in design.md against both its producer and its consumer.
4. Run the FULL verifier suite on the merged result, not per-node subsets.
5. Report what you had to reconcile, so the seams are visible to the human.

You may edit code to reconcile seams. You may not add features, and you may
not weaken a test to make the suite green.
```

Then send the entire change to one final clean-context `harsh-critic`, scored against the whole contract rather than a single task. This is the verdict that matters.

## The archive step

When the final critic passes and every contract box is checked:

1. Move `specs/<change-id>/` to `specs/archive/<change-id>/`, or run `/opsx archive` when the project uses OpenSpec. The specification stops being a plan and becomes the documentation of how the thing actually works.
2. Append the closing entry to `progress.md`: final scores, verifier results, files touched, and anything deliberately left undone.
3. If `design.md` drifted during the build — and it usually does — update it to match reality *before* archiving. An archived spec that lies is worse than no spec, because the next change will be planned against it.

## Reporting to the human

Close with a report that can be checked, not a victory lap:

- what was built, in one paragraph;
- every verifier and its result;
- the final critic score per rubric dimension;
- what the contract deliberately left out (the non-goals from `proposal.md`);
- anything you had to assume because a question went unanswered;
- what you would look at first if something breaks in production.

If any node stalled and was escalated, that goes at the top, not the bottom.
