# time-sense

[English](README.md) · [繁體中文](README.zh-TW.md)

A Claude Code mod that gives the agent a sense of time, for a few tokens per prompt.

**The problem.** An agent has no clock. Come back after six hours and it acts as if no time passed. Ask how long a task will take and it answers in human workdays ("1–2 days") for work it finishes in ten minutes.

**Situations it is meant for.** (What changes is what the model *sees*; how it reacts is up to the model. These are the cases I wrote it for, not measured results.)

- *"I'm going to bed, let's continue tomorrow."* You come back the next morning in the same conversation. Without a clock the agent can't tell whether 2 minutes or 9 hours passed. time-sense shows it `this conversation's last message 9h05m ago`.
- *Resuming an old conversation.* You `--resume` a session from three weeks ago. The agent sees `last message 21d3h ago`, a cue that plans and "what's running" may be stale.
- *"How long will this take?"* Agents tend to answer in human workdays. time-sense shows the agent its own measured turn times, so it has real numbers to estimate from.

**What it does.** Everything goes to the model only; nothing is drawn on your screen.

1. **Clock on every prompt.** Every prompt you send carries one hidden line the model reads:
   `[time] now 2026-10-17 Sat 21:40`
   When you return after 20+ minutes of silence (or on the first prompt of a session), the gap is added:
   `[time] now 2026-10-17 Sat 21:40 · this conversation's last message 6h12m ago`
   The gap is tracked per conversation, so resuming an old session shows that session's own gap.
2. **Real pace.** It records how long each main-loop turn actually took (wall clock). Once it has 5+ samples, the first prompt of each session also gets:
   `[pace] your last 40 turns took median 4m, longest 38m of real time. Estimate durations in these terms, not human workdays.`

Cost: ~12 tokens per prompt, ~20 more per gap, ~30 once per session. No model calls, no system-prompt changes (so prompt caching is untouched). If the mod fails, the prompt goes through unchanged.

## What the agent sees

| Situation | Example hidden cue |
|---|---|
| Any prompt | `[time] now 2026-10-17 Sat 21:40` |
| Return after a long gap | `this conversation's last message 9h05m ago` |
| Resume an older conversation | `last message 21d3h ago` |
| At least five measured turns | A median and longest turn duration from up to 40 samples |

These cues supply evidence to the model, not a guarantee that its estimates or behavior improve.

## Install

```
/plugin install time-sense --marketplace u6vu06Ou/time-sense
```

(Answer `y` to add the marketplace, then pick the **user** scope so it works in every project. Pick project scope if you want it in one project only.)

## Notes

- Background-task notifications (a subagent reporting back) are not prompts, so they carry no clock line.

- Uses your machine's local time zone.
- Durations are stored with the mod's own store (last 40 turns); nothing leaves your machine.
