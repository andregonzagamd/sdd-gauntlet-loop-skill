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

Then send the entire change to a final clean-context `harsh-critic`, closing every rubric dimension against the whole contract rather than a single task. This is the verdict that matters, and the change is not done until every dimension comes back `CLEAR`.

**And it takes two of them.** This is the same rule as a `gauntlet` node's finish (see [`phase-3-graph-gauntlet.md`](phase-3-graph-gauntlet.md)), applied where it matters most: if the whole-change critic returns zero open items, dispatch a second one — fresh context, cheaper model, blind to the first — and take the union. Nothing looks at this change again after this verdict, which is exactly why one agent's word is not enough to end it.

## The archive step

When the final critic passes and every contract box is checked:

1. Move `specs/<change-id>/` to `specs/archive/<change-id>/`, or run `/opsx archive` when the project uses OpenSpec. The specification stops being a plan and becomes the documentation of how the thing actually works.
2. Append the closing entry to `progress.md`: how the final critic closed each dimension, verifier results, files touched, and anything deliberately left undone.
3. If `design.md` drifted during the build — and it usually does — update it to match reality *before* archiving. An archived spec that lies is worse than no spec, because the next change will be planned against it.
4. **Promote what the critics kept asking for into `AGENTS.md`.** Read the run's `GAP` and `IMPROVEMENT` items together. Anything that came up on more than one node was never a property of that node — it is a convention this repo had not written down, and the builders had no way to know it.

   Write it into the constitution's **Conventions** as one line, and the next change's *first* draft is already better. This is the only quality gain in the whole pipeline that costs nothing per run: every other mechanism buys quality with iterations, and iterations are paid again on every change. A line in `AGENTS.md` is paid once.

   Be strict about what earns a line. One node wanting it is a node-level note. Two or more is a convention. Anything else is somebody's taste, and the constitution is not a style diary — it is read in full by every agent on every run, so a line that does not change behavior is a permanent tax.

## Reporting to the human

Close with a report that can be checked, not a victory lap:

- what was built, in one paragraph;
- every verifier and its result;
- how the final critic closed each rubric dimension, with the evidence behind every `CLEAR`;
- what the contract deliberately left out (the non-goals from `proposal.md`);
- anything you had to assume because a question went unanswered;
- what you would look at first if something breaks in production.

If any node stalled and was escalated, that goes at the top, not the bottom.
