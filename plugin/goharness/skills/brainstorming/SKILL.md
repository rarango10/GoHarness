---
name: brainstorming
description: "Use this before any creative or design work in this project - adding a feature, changing behavior, or shaping a new part of the app. Turns a raw idea into a clarified, approved design through clarifying questions and conversation, before any spec is written or any code is touched. Trigger this whenever the user proposes a new feature, asks 'how should we build X', or describes something to add/change and hasn't yet agreed on an approach."
---

# Brainstorming

Turn an idea into a clarified, approved design through conversation — before writing a spec or touching code.

This project's workflow is: brainstorm (this skill) → spec (`docs/`) → implementation (TDD) → verification → commit. This skill covers only the first step. Writing the spec file and planning implementation are out of scope here — they happen after this skill's approval gate.

<HARD-GATE>
Do NOT invoke any implementation skill, write any code, write a spec file, or take any implementation action until you have told your human partner what you intend and they have explicitly approved it.
</HARD-GATE>

## Anti-Pattern: "Too Simple To Need Approval"

Every brainstorm ends with the human partner approving the design before anything else happens. For a small change the design might be two sentences in chat — but you must still present it and get a yes. "Simple" changes the size of the design, never whether approval is needed.

| Thought | Reality |
|---------|---------|
| "This is too simple to need a design" | Simple means a short design, not no design. |
| "The design is obvious — I'll start while they read it" | Present, then stop. Don't act until you hear yes. |
| "They approved something similar before" | Each idea gets its own approval. |
| "They said 'go ahead' / 'sure, do it' — I can also draft the spec while I'm at it" | Approving the design isn't approval to skip the next checkpoint. Announce the next step and stop — don't bundle it into the same message. |

## The Process

1. **Explore project context** — check relevant files, docs, and recent commits before asking anything. Don't make the human repeat what's already visible in the repo.
2. **Ask clarifying questions, one at a time** — focus on purpose, constraints, and success criteria. Prefer multiple choice when a question has a natural small set of answers; open-ended is fine otherwise. One question per message — if a topic needs more exploration, split it into several questions rather than stacking them.
3. **Know when to stop asking.** "One at a time" sets the *rate*; this sets the *exit condition*, and without it the rate is all you have. Before you move on, **list the behavioural decisions the request leaves open** — what happens on empty or malformed input, whether something recalculates automatically or only on demand, what a "clear" action clears, which fields are editable. Move on only when that list is empty, or when what remains is written down explicitly as an assumption. A stated assumption is honest; a silent one turns into a numbered acceptance criterion two steps later, and from then on nobody questions it.
4. **Propose approaches** — once the shape of the idea is clear, offer 1-3 approaches with trade-offs. Lead with the one you'd recommend and say why. Cut anything not needed for the actual request (YAGNI) — a smaller design is easier to approve and easier to build.
5. **Present the design in chat** — a few sentences for something small, up to a couple of short paragraphs for something with more moving parts. Cover whatever is non-obvious: approach, what it touches, edge cases, how it'll be tested. For anything with multiple parts, check in after each part rather than dropping the whole design at once.
6. **Get explicit approval** — stop and wait for a clear yes. Presenting the design and moving on in the same breath skips the gate. **Say what the yes unlocks**: if they approve, the next step is the `specify` skill, which turns this design into `requirements.md` with numbered acceptance criteria. Naming it when you ask — not after they answer — is what lets them weigh what they are approving toward. A chain you only learn about in hindsight is one you authorised before you could see it.

If new complexity turns up mid-conversation that changes the scope significantly, say so and re-confirm the design rather than quietly expanding it.

### Label every decision with where it came from

**Never attribute a decision to your human partner that they did not make.** Writing "the result only updates when Calculate is pressed, *as you asked*" about something they never asked for is the same class of failure as marking a task done without a verdict: inventing backing that does not exist.

It is also the hardest failure to catch. Someone reading "as you asked" assumes they are misremembering, not that they are being told their own position. So every decision in the design carries its origin, in three flavours:

- **"You asked for this"** — they said it, and you can point at where.
- **"I decided this — tell me if it works"** — your call, offered for approval.
- **"I assumed this because X"** — no one decided it; you filled a gap and are saying so.

The distinction between the three is what makes the approval mean anything. And no gate catches this on its own: the gate asks "do you approve?", never "this thing I say you asked for — did you?".

## Design for isolation and clarity

When the design involves more than one moving part, shape it so that:

- Each unit has one clear purpose and talks to the rest through a well-defined interface.
- For each unit you can answer: what does it do, how do you use it, what does it depend on?
- Someone could understand what a unit does without reading its internals, and you could change the internals without breaking whoever calls it.

Smaller, well-bounded units are also easier to reason about and edit reliably — if a proposed unit is growing a lot of responsibility, that's a signal to split it during the design, not after.

## Working in existing code

- Explore the current structure before proposing changes, and follow the patterns already in use.
- If existing code has a problem that genuinely affects the work at hand (a file that's grown too large, tangled responsibilities), it's fine to fold a targeted improvement into the design.
- Don't propose unrelated refactoring just because you're in the area — stay focused on what the current idea actually needs.

## After Approval

Once the human approves the design, stop. Confirm the design is approved and restate that the next step is the **`specify` skill**, which turns the approved design into `requirements.md` and then `design.md`, under `docs/AAAA-MM-DD-<feature>/`. You already named it when you asked for the yes, so this is a confirmation rather than the first they hear of it. The task plan (`tasks.md`) comes after that and is a separate step — the `planning-tasks` skill — so don't promise it as part of `specify`. Name the next skill, don't start it: which skill comes next is information they need, deciding when to run it is theirs.

A short or casual approval ("go ahead", "sure", "do it") still counts as approving the design — it does not extend to drafting the spec in the same message. Name the next step and stop there, even if the user's tone suggests they're in a hurry.
