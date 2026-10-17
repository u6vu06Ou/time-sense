# time-sense

A Claude Code mod that gives the agent a sense of time, for a few dozen tokens.

**The problem.** An agent has no clock. Come back after six hours and it acts as if no time passed. Ask how long a task will take and it answers in human workdays ("1–2 days") for work it finishes in ten minutes.

**Situations it is meant for.** (What changes is what the model *sees*; how it reacts is up to the model. These are the cases I wrote it for, not measured results.)

- *"I'm going to bed, let's continue tomorrow."* You come back the next morning in the same conversation. Without a clock the agent can't tell whether 2 minutes or 9 hours passed. time-sense shows it `this conversation's last message 9h05m ago`.
- *Resuming an old conversation.* You `--resume` a session from three weeks ago. The agent sees `last message 21d3h ago`, a cue that plans and "what's running" may be stale.
- *"How long will this take?"* Agents tend to answer in human workdays. time-sense shows the agent its own measured turn times, so it has real numbers to estimate from.

**What it does.**

1. **Clock after a gap.** On the first prompt of a session, and whenever you return after 20+ minutes of silence, it attaches one hidden line the model reads:
   `[time] now 2026-10-17 Sat 21:40 · this conversation's last message 6h12m ago`
   The gap is tracked per conversation, so resuming an old session shows that session's own gap.
   Back-to-back chatting adds nothing.
2. **Real pace.** It records how long each main-loop turn actually took (wall clock). Once it has 5+ samples, the first prompt of each session also gets:
   `[pace] your last 40 turns took median 4m, longest 38m of real time. Estimate durations in these terms, not human workdays.`

Cost: ~20 tokens per gap, ~30 tokens once per session. No model calls, no system-prompt changes (so prompt caching is untouched). If the mod fails, the prompt goes through unchanged.

## Install

```
/plugin install time-sense --marketplace u6vu06Ou/time-sense
```

(Answer `y` to add the marketplace, then pick the **user** scope so it works in every project. Pick project scope if you want it in one project only.)

## Notes

- Uses your machine's local time zone.
- Durations are stored with the mod's own store (last 40 turns); nothing leaves your machine.

---

## 繁中簡介

讓 Claude Code 有時間感：隔很久回來時，偷偷告訴 AI 現在幾點、這個對話上一則訊息是多久以前；每個對話第一次發言時，也告訴它自己平常一回合實際花多久。這些情境是我設計它要解決的（例如「我去睡了」隔天回來、resume 幾週前的對話、把 10 分鐘的事估成 1～2 天），AI 看到後怎麼反應由它自己決定，不是保證的效果。每次只加幾十個 token，連續聊天時完全不加。安裝時選 user 範圍＝所有專案都有效。
