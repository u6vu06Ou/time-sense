# time-sense

A Claude Code mod that gives the agent a sense of time, for a few dozen tokens.

**The problem.** An agent has no clock. Come back after six hours and it acts as if no time passed. Ask how long a task will take and it answers in human workdays ("1–2 days") for work it finishes in ten minutes.

**Real situations it fixes.**

- *"I'm going to bed, let's continue tomorrow."* You come back 9 hours later in the same conversation and the agent still says "Sure, get some rest!" — every reply, even after finishing the work. With time-sense it reads `this conversation's last message 9h05m ago` and knows you already slept.
- *Resuming an old conversation.* You `--resume` a session from three weeks ago. Without a clock the agent assumes it's still that day: same plans, same "we'll do it tomorrow", stale assumptions about what's running. With time-sense it sees `last message 21d3h ago` and re-checks before acting.
- *"How long will this take?"* The agent says "1–2 days" for something it finishes in 12 minutes. time-sense shows it its own measured pace, so estimates come out in minutes.

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

## Notes

- Uses your machine's local time zone.
- Durations are stored with the mod's own store (last 40 turns); nothing leaves your machine.

---

## 繁中簡介

讓 Claude Code 有時間感：隔很久回來會知道現在幾點、這個對話上一則訊息是多久以前（例如說「我去睡了」，隔天回來它會知道你已經睡醒；resume 幾週前的對話，它會知道已經過了幾週）；估時間時會參考自己實際每回合花多久，不再把 10 分鐘的事估成 1～2 天。每次只加幾十個 token，連續聊天時完全不加。
