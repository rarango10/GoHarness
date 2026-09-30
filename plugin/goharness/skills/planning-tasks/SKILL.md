---
name: planning-tasks
description: Checks that a feature's spec is complete and approved and, if it is, launches the "tasks-fanout" workflow that creates or iterates its tasks.md. It asks before launching. It doesn't plan or write tasks.md on its own. It is the only path to the task plan; use it when the person says, in English or Spanish, "let's plan the tasks / planeemos las tareas", "let's break down the tasks / desglosemos las tareas", "let's build the implementation plan / armemos el plan de implementación", "generate the implementation plan / generá el plan de implementación", "let's iterate tasks.md / iteremos tasks.md", "let's review the spec's tasks / revisemos las tareas del spec", or asks what the next step is after approving the design. If requirements.md or design.md don't exist or aren't approved yet, this skill doesn't apply — send them to "specify" first.
---

# Planning Tasks

Check the inputs, ask, launch. The task plan is built by the `tasks-fanout` workflow; this skill
only checks that it can run and triggers it.

## 1. Check the inputs

The spec folder is `docs/YYYY-MM-DD-<feature>/`. If there are several and it isn't clear which
one, ask. Inside it:

- `requirements.md` exists and its status header says `approved` (`aprobado`).
- `design.md` exists and its status header says `approved` (`aprobado`).

If either one is missing, or they are in `pending approval` (`pendiente de aprobación`), **stop
here**: tell the person and send them to the `specify` skill. Don't launch anyway or fill in what's
missing yourself.

## 2. Ask

One line with the folder and, if `tasks.md` already exists, how many tasks it has today — the
workflow launches one agent per task, so that number is what makes the question mean something.

Wait for the yes. A short confirmation ("go", "ok" / "dale", "va") is enough.

**The confirmation goes in prose, not as a structured question.** Asking for a yes is not offering
a choice: here there is a single path —launching— and `AskUserQuestion` requires two different
options, so it rejects the call and the person never sees the question. Write the line and wait
for the answer.

## 3. Launch

Call the `Workflow` tool with the saved workflow `tasks-fanout` and `args` equal to the path of the
spec folder:

```
Workflow(tasks-fanout, args: "docs/YYYY-MM-DD-<feature>")
```

`args` also accepts an object, to limit the rounds or force an unapproved spec:
`{"specDir": "docs/YYYY-MM-DD-<feature>", "maxRounds": 2}`.

**When confirming the launch, say these three things and not one less:**

- That it is running, with its `Task ID`.
- **`/workflows` to watch the progress live.** The fan-out launches one agent per task and the run
  can take several minutes; without this line the person waits blind, and waiting blind pushes them
  to open the repo to see what's happening — which, on a run in flight, gives snapshots, not
  conclusions. The `Workflow` tool's output already brings the pointer (`Use /workflows to watch
  live progress.`): don't drop it when summarizing.
- The shape of the fan-out: 1 scout + 1 initial plan + 1 reviewer per task + 1 reducer per round
  with changes + 1 writer. **The exact number can't be anticipated on the first run** —the
  workflow itself draws the plan— but the shape can, and it's enough to size the wait.

**When the end notification arrives**, before summarizing, read
`~/.claude/projects/<project>/<session>/workflows/wf_<runId>.json` and report `agentCount`, the
duration and the run's `logs`. It is the same data `/workflows` showed live: if the pointer got
lost at launch, it arrives here anyway.

**The name may come with a prefix.** If the harness is packaged as a plugin, the workflow is
registered as `<plugin-name>:tasks-fanout` and the bare name doesn't resolve. Launch the bare one
anyway: if it doesn't exist, the error lists the available names and you take the right one from
there — it's explained below. Don't invent the prefix before having that list.

### If something fails at launch

They are two different failures and they are fixed differently — and the second one has, in turn,
two causes.

**The `Workflow` tool doesn't exist.** Dynamic workflows are opt-in on the Pro plan: if
`enableWorkflows` isn't in `~/.claude/settings.json`, the tool isn't even offered. Ask the person to
turn it on (`/config` → Dynamic workflows, or the key by hand) and to open a **new session** — the
toolset is built at startup.

**The tool exists but says `Workflow "tasks-fanout" not found`.** That error brings the solution
with it: it ends with `Available: <list of names>`. **Read that list before doing anything else**,
because it tells the two possible causes apart.

*The workflow is there, under another name.* If `Available` shows an entry that **ends in
`:tasks-fanout`** —for example `my-harness:tasks-fanout`—, the workflow was loaded from a plugin.
Plugins register their workflows namespaced with the plugin's name, so the bare name doesn't
resolve. Relaunch with the full name exactly as it appears in the list:

```
Workflow(<what-appears-in-Available>, args: "docs/YYYY-MM-DD-<feature>")
```

Don't hardcode the prefix or guess it: take it from the list. The plugin's name changes depending
on how it's installed, and a local copy of the workflow coexists with the plugin's under different
names —there is no shadowing for workflows—, so the list is the only reliable source for which one
really exists.

*The workflow isn't there in any form.* If no entry ends in `:tasks-fanout`, the registry doesn't
have it. It's built when the session starts, so a workflow created or edited mid-session falls out
of it. Don't offer `/tasks-fanout`: that command comes from the same registry and won't exist
either. Launch it by path, which doesn't depend on the registry:

```
Workflow(scriptPath: "<absolute path of tasks-fanout.js>",
         args: "docs/YYYY-MM-DD-<feature>")
```

The path is `plugin/goharness/workflows/tasks-fanout.js` inside the harness's own repo if the
harness lives there, or `workflows/tasks-fanout.js` inside the plugin's directory if it came
packaged. If you don't know which, look for it with `Glob` instead of guessing.

What you never do, whatever happens, is build the plan from outside: the workflow exists so the task
table has a single writer. (Each task's `Status` and `Log` are another region, and whoever
implements writes them — that isn't planning.)
