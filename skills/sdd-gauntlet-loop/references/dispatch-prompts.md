# Dispatch prompts

The prompts below are the working versions, not sketches. They were run end to end
on a real project and then measured twice; what is here is what survived.

**Why this file exists.** A measured finding: the agent definitions carry the
*form* — a critic dispatched with three lines still returns every dimension in a
state, with `file:line` and evidence. What they do not carry is the *rigor*. The
systematic probing that catches a fabricated test fixture or an untested error
path came from the dispatch prompt naming the probes. Two critics given thin
prompts each missed a real item the other found; both were competent, both were
under-aimed.

So: the skill gives you the shape. This file is where you spend the effort.

Fill every `<angle bracket>`. A bracket left unfilled is the part of the prompt
that was doing the work.

---

## Builder

```
You are building one node of a larger change. Stay inside it.

## Repository — absolute path, NOT your current working directory

<absolute path to the repo>

Call it <REPO>. Run commands with that as the working directory.

## Read these first, in full

- <REPO>/AGENTS.md — the constitution. <name the sections that bind this node:
  the conventions it must follow, the entries in "Never do" it could trip>
- <REPO>/contract.md — what an independent critic will hold this against.
- <REPO>/specs/<change-id>/design.md — read the <### src/thing.js> block under
  Interfaces. <Name what is pinned there: signatures, error strings, shapes.>
  Other agents are building against those right now without seeing your work; if
  you change one, integration breaks.
- <files this node reads but must not modify — sibling modules already built,
  fixtures, config>. Read them so you know what you are calling. Do not modify.

## YOUR TASK — <T#>, verbatim from tasks.md

<paste the task block exactly as written, including files:, depends:, done when:>

## FILES YOU MAY TOUCH

- <REPO>/<file>
- <REPO>/<test file>

Nothing else. Not <package.json / the fixture / the other src modules / the
specs>. <If a node is running in parallel: another agent is writing <files> right
now — if you touch those, you destroy its work and it destroys yours.>

## Rules

- Read every file before editing it.
- Write the smallest change that satisfies the task. No extra abstraction, no
  configuration nobody asked for, no "while I was in here".
- Write the tests that prove your "done when" clause — every case it lists,
  using <the project's test framework and assertion library>.
- <THE TRAP FOR THIS NODE. One or two sentences naming the specific thing most
  likely to be got wrong here, drawn from the design or from a previous critic's
  NOTES. Examples that earned their place: "amounts are integer cents; no
  parseFloat, no *100, no toFixed"; "line numbers are 1-indexed with blank lines
  skipped as rows but still counted for numbering — a critic will construct
  input with blank lines in the middle to check it"; "sort order is pinned, not
  incidental — a critic will feed you scrambled rows".>
- Do not touch files outside your list. If you believe you must, stop and report
  why instead of doing it.
- Do not judge your own work. Do not call it done, complete, correct, or passing.

<## One thing to be careful about — include only when a previous node's critic
left a NOTE that touches this node. State it, and say explicitly whether to act
on it. Example: "An earlier critic observed that parse.js returns [] for an empty
file. That is the pinned design, not a bug — do not 'fix' it here. Report it in
your return if you think it is wrong; do not act on it.">

## Return

- the files you changed, with one line of reason each
- your "done when" check — the literal command, run from <REPO> — and its
  ACTUAL output pasted, not paraphrased, including the exit code
- anything you noticed but deliberately did not touch
```

### What each part is for

- **Absolute path, stated as not-the-cwd.** Subagents do not inherit your working
  directory. Every prompt needs it, spelled out.
- **The task verbatim.** Paraphrasing the task is how a node quietly builds
  something adjacent to what was specified.
- **The file list, twice** — once as permission, once as the parallel-work
  warning. The second one is what stops two builders in a wave from colliding.
- **The trap.** This is the highest-value line in the prompt. It is not generic
  advice; it names the one mistake this node is most likely to make. Write it
  from the design's constraints, not from imagination.
- **"ACTUAL output pasted, not paraphrased."** Without this, builders summarize
  test output, and a summary of a test run is not evidence that it ran.

---

## Critic

A **fresh** critic per verdict, including every re-check. Reusing one that saw an
earlier attempt destroys the clean context that makes it useful.

```
You are reviewing a change you did not write. You have no stake in it passing,
and no relationship with whoever wrote it.

## Repository — absolute path, NOT your current working directory

<absolute path>

Call it <REPO>. Run every command with that as the working directory.

## What you are reviewing

Node <T#>, tier <gauntlet|review>, of change <change-id>. The change under review
is exactly these files:

- <REPO>/<file>
- <REPO>/<test file>

<If untracked: They are new and untracked, so `git diff` shows nothing — read
them directly, in full.>

<Nodes already passed: name them. "Read <module> to understand what this node
delegates to, but do not re-score it — it passed its own critic." Otherwise a
critic re-litigates a closed node and it gets failed twice for the same thing.>

<Nodes in flight: name them. "Their files may be absent, half-written or broken
while you work; that is not this node's gap.">

## What you are given

- <REPO>/contract.md — the rubric dimensions you must close, and the named
  reference standard you hold the work against.
- <REPO>/specs/<change-id>/design.md — read <the specific blocks>. Every
  <signature / error string / shape / pinned output> is there. Fidelity to those
  matters: other modules are written against them independently.
- <REPO>/AGENTS.md — <the binding sections>.
- <fixtures or inputs that are part of the contract>

The task's own acceptance criteria, verbatim from tasks.md:

<paste the done-when clause exactly>

You have deliberately NOT been given the builder's explanation, its
self-assessment, or its account of how hard the problem was. If any of that
reaches you, ignore it — it is not evidence.

## Do this in order

1. Run the verifiers yourself: <the exact commands for this node>. Record each
   exact command, exit code and relevant output. <Name any verifier NOT to run
   and why — e.g. "do not run `npm test`; it sweeps in another node's in-flight
   work and tells you nothing about this one.">

2. Probe beyond its own tests. <THE NAMED PROBES — see the generator below.>
   Write scratch files OUTSIDE <REPO> — you must not create files inside the
   repository — or use one-liners.

3. Read the code for what commands cannot catch: <the project-specific list —
   e.g. float arithmetic on money, a dependency added, scope from the contract's
   OUT OF SCOPE section built anyway>, plus stubs, TODOs, swallowed errors,
   unreachable branches, tests that assert nothing or assert the implementation
   against itself rather than against design.md, and drift from the pinned
   signatures or error strings.

4. Close every rubric dimension as GAP, IMPROVEMENT or CLEAR, per your
   instructions.

5. Decide. "Mostly works" is a FAIL. Unverified is not a pass.

## You are read-only

You have no edit tool. Do not write, fix or improve anything inside <REPO> — not
a typo, not a missing test. A shell redirect into <REPO> is an edit.
```

### Writing the named probes — step 2 is where the rigor lives

**The tests were written by the same agent that wrote the code.** They are
evidence of intent, never of correctness. A verifier proves the code agrees with
the test; it never proves the test asserts the right thing. A green suite is
where a bad node hides.

So step 2 is never boilerplate. Derive it fresh, from the design, using these
generators. Each one has caught something real:

**1. Cross the design against the `done when` list.** Every case the design names
that the acceptance criteria do not enumerate is a probe. *This is the highest-yield
generator, and it is mechanical.* Two independent critics each missed one real
item on a run, and both misses were exactly this shape — a `NaN` branch and an
empty-state branch, each named in the design, neither listed in `done when`,
neither tested.

Make the crossing an *output*, not a habit: tell the critic to write out both
lists and their set difference. A critic asked for the conclusion reports what it
noticed; a critic asked for the two lists has to enumerate before it can conclude.
Measured, that is the difference between finding the untested branch and closing
the node.

And say what to do with the result, because it is counter-intuitive: **a probe
that passes is a finding.** A critic that runs the uncovered case, sees correct
behavior and closes the dimension has confirmed the code and lost the point — the
gap was never the behavior, it was that nothing but this critic will ever check
it. On a measured run a critic did exactly that, in writing, and finished a node
with a real item open.

**1b. Cross each pinned value domain against every operation that consumes it.**
Generator 1 has a measured blind spot: it only reaches cases the design names *as
cases*. When the design pins a **domain** instead — "may be negative", "may be
zero", "one or more" — the states that domain produces downstream are named
nowhere, so the crossing walks right past them. Four critics closed a node on
exactly this shape: the design said an amount may be negative, three aggregations
consumed those amounts, and nobody asked what a sum of them can be. The answer
was zero, or negative, or an empty collection with a non-zero total — three real
untested branches, invisible to generator 1 because no sentence ever named them.

So: list every value domain the design pins. List every operation that reads one.
Cross them, and ask what the operation can *produce* at each edge of the domain,
not just what it is handed. Then check the suite for each.

Measured, this generator flipped a node four other critics had closed as finished
— same model, same contract, same task, only the probe list changed. Make the
crossing an output: demand the domain list, the operation list, the producible
states, and a state-by-state table against the suite. A critic asked for the
conclusion reports what it noticed.

**And cross the fields of one shape against each other, not only against
operations.** That is where this generator was measured to still leak: a shape
with two independently pinned fields has a product of states, and the ones the
code never builds itself are exactly the ones only reachable through a *public
function that takes the shape as a parameter*. The miss had that form — an empty
collection paired with a non-zero total, a combination the producing function
cannot emit and the consuming function is nonetheless exported to accept. For
every exported function, enumerate its parameter's states from the type it
declares, not from what its sibling happens to hand it.

**Enumerate the whole product, then subtract.** This is the step that was measured
to fail even when everything before it went right: a critic crossed exactly the
right pair of fields, and stopped at the first uncovered combination it noticed.
Two fields with two interesting values each is four corners, and the acceptance
criteria typically cover one while the fixture covers another — leaving *two*,
not one. So write all the corners down first, strike the ones a test already
reaches, and probe **everything that remains**. Stopping at the first hit is how
a generator that reached the right question still returns the wrong half of the
answer. Measured: the exhaustive version found, in one pass, the item that had
survived six critics.

**Then collapse before you report.** The enumeration is exhaustive on purpose; the
report must not be. After probing every uncovered corner, merge the ones that take
the same branches and produce the same shape of output — a corner that differs
from a covered one only in the magnitude of a number is the same test twice. What
earns its own open item is a corner that reaches a branch nothing else reaches, or
produces an output shape nothing else produces.

Skip this step and the generator turns on you: run exhaustively without collapsing
and it returned **nineteen** open items on a 47-line module, a handful of them
behaviorally distinct and the rest the same path with different numbers. A builder
handed nineteen writes nineteen tests, the node never finishes, and the iteration
cap becomes the real brake — the exact failure the materiality test exists to
prevent. Enumerate like a machine; report like someone who has to pay for each
line.

**2. The source of truth for the test's own data.** If the task says "the rows
from `fixtures/x.csv`", tell the critic to open the fixture and compare the test's
data against it **field by field**. A test whose data merely *aggregates* to the
right answer while its individual values are invented passes green and proves
nothing. No exit code will ever find this.

**3. Rejection cases the tests skip.** Values the design says must be refused that
the `done when` happens not to list — malformed shapes, wrong types, empty, padded,
adjacent-but-invalid formats.

**4. Boundaries where a naive implementation loses something.** A sign, a leading
zero, precision. Name the actual values.

**5. Round-trips.** When a node has two functions that should invert each other,
probe the pair across a range, not at one point.

**6. Order, when order is pinned.** Feed deliberately scrambled input to prove the
code sorts rather than relying on insertion order.

**7. Raw bytes, not eyeballs.** Whitespace, trailing newlines and indentation are
part of a pinned output. Say to compare with `od -c` or `JSON.stringify`, never by
reading.

**8. Composition across the seam.** Run the real entry point end to end on bad
input and check the message a user actually sees — prefixes from two layers can
double or truncate in ways no unit test covers.

Tell the critic explicitly where scratch files may go: **outside the repository.**
It has a shell and no edit tool, and without a named location some critics reach
for the repo.

### The confirming critic

When a `gauntlet` node comes back with zero open items, a second critic confirms
it before the node is finished. Two rules, and the first one was learned the
expensive way.

**Give it different probes.** Not the same prompt on a different model — that was
measured, twice, on two nodes, and it found *nothing* the first critic had not
already found. Where the first critic was blind, its twin was blind in the same
place; where it saw, the second only agreed. Two agents running the same probe
list are one probe list. What varies a critic's findings is what it was told to
go look at, so the second dispatch keeps the contract, the design and the task
verbatim and **replaces step 2 with the generators the first prompt did not
use** — start from the ones that reach cases the first set structurally cannot.

**Keep it blind.** Not the first critic's verdict, not its probes, not the fact
that it exists. A confirming critic that knows a peer already closed the node
starts looking for reasons to agree, and you have paid for a rubber stamp.

Everything the first critic produced stays with you. Union its items with the
second's, and hand the union to the builder.

### One more thing worth saying out loud

If a rubric line prohibits a token — "any `* 100` is an automatic FAIL" — say in
the prompt that the critic must judge what the code actually does, not the shape
of its source text. Correct integer arithmetic on split substrings contains those
characters, and a pattern-matching critic will fail it while a genuinely broken
implementation spelled differently sails through.

---

## Integrator

Dispatched once, when every node has passed. Its prompt differs from the others:
it is the only agent that sees the whole change.

```
Every node passed its own critic against its own slice of the contract. That is
not evidence the system works. Your job is the seams between them.

## Repository — absolute path, NOT your current working directory

<absolute path>

## What was built, and by whom

<a table: node, files, what it was built against. Include which nodes failed a
critic and on what, so the integrator knows where the thin ice was.>

## Read first

<AGENTS.md, contract.md, design.md, and all the source and test files>

## What to look for — the seams, specifically

- the same helper implemented twice, slightly differently, by two nodes
- an interface agreed in design.md and drifted on one side — check BOTH ends in
  the actual code, not in the design
- <errors that compose badly: name the layers. "parse.js re-throws with a
  `line N:` prefix and cli.js wraps in `Error: ...` — run a malformed input end
  to end and confirm the user sees one clean sentence, not a doubled prefix.">
- migrations that each work alone and conflict in sequence
- a config value written under one name and read under another
- <module boundaries the design forbids: "confirm report.js does not import
  parse.js">
- **test gaps at the boundary** — is there any test anywhere that exercises
  <A → B> together on the real input, rather than each against hand-built data?
  If not, that is a genuine seam gap.

## Procedure

1. Reconcile what you find.
2. Remove duplication introduced across node boundaries — say which
   implementation you kept and why.
3. Walk every interface in design.md and verify both sides in the actual code.
4. Apply the polish queue from progress.md in one pass. Anything you decline,
   say so and why — the final critic sees the queue, and an item that silently
   vanished is a gap.
5. Run the FULL verifier suite on the merged result, from a clean state.
6. If design.md drifted from what was built, update it before archiving.

## Your limits

You may edit to reconcile seams. You may not add features, expand scope, or
disable, skip or weaken a test to make the suite green. <Project-specific hard
limits: never edit the fixture, never add a dependency, never touch
package.json.> If the merged result cannot pass without changing the contract,
that is an escalation, not an edit.

## Return

- what you reconciled and the choice you made at each seam — or, explicitly,
  that you found nothing, with the evidence that led you there
- the full verifier suite output, pasted, with exit codes
- any drift between design.md and reality, and how you resolved it
- what a final whole-change critic should look at hardest
```

The last line earns its place. On a measured run the integrator used it to warn
that `Number(whole) * 100` was integer arithmetic on split substrings, which
stopped the final critic from failing correct code by pattern-matching on `* 100`.

An integrator that reports finding nothing, with evidence, is doing its job. One
that produces cosmetic edits to look useful is not.
