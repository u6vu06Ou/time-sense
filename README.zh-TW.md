# time-sense

[English](README.md) · [繁體中文](README.zh-TW.md)

一個讓 agent 產生時間感的 Claude Code mod,每個提示只多幾個 token。

**問題所在。** Agent 沒有時鐘。隔六個小時再回來，它的反應就像時間根本沒流逝過。問它一個任務要多久，它會用「人類工作天」來回答(「1–2 天」)，而那份工作它其實十分鐘就做完了。

**適用情境。**(改變的是模型*看到*什麼；它如何反應由模型自己決定。這些是我寫這個 mod 時針對的情境，並非實測結果。)

- *「我要睡了，明天再繼續。」* 隔天早上你在同一個對話中回來。沒有時鐘的話，agent 無法分辨到底過了 2 分鐘還是 9 個小時。time-sense 會讓它看到 `this conversation's last message 9h05m ago`。
- *接續舊的對話。* 你 `--resume` 三個星期前的 session。agent 會看到 `last message 21d3h ago`,這個提示代表先前的計畫和「正在跑的東西」可能已經過時。
- *「這要多久？」* Agent 傾向用「人類工作天」來回答。time-sense 會把 agent 自己實測的 turn 耗時呈現給它，讓它有真實的數字可以用來估計。

**它做了什麼。** 全部只給模型看，畫面上不顯示任何東西。

1. **每個提示都報時。** 你送出的每個提示都會附上一行模型會讀到的隱藏文字：
   `[time] now 2026-10-17 Sat 21:40`
   隔了超過 20 分鐘再回來(或 session 的第一個提示)時，會再加上間隔：
   `[time] now 2026-10-17 Sat 21:40 · this conversation's last message 6h12m ago`
   間隔是以對話為單位分別追蹤的，所以接續舊 session 時，看到的是那個 session 自己的間隔。
2. **實際節奏。** 它會記錄每個 main-loop turn 實際花了多久(以實際時鐘計)。樣本累積到 5 筆以上之後，每個 session 的第一個提示還會附上：
   `[pace] your last 40 turns took median 4m, longest 38m of real time. Estimate durations in these terms, not human workdays.`

成本：每個提示約 12 個 token,每個間隔再多約 20 個,每個 session 一次約 30 個 token。不呼叫模型、不更動 system prompt(所以 prompt caching 完全不受影響)。即使 mod 失效，提示也會原封不動地送出。

## Agent 會看到什麼

| 情境 | 隱藏提示範例 |
|---|---|
| 任何提示 | `[time] now 2026-10-17 Sat 21:40` |
| 長時間間隔後回來 | `this conversation's last message 9h05m ago` |
| 接續較舊的對話 | `last message 21d3h ago` |
| 已有至少五次實測 turn | 由至多 40 筆樣本得出的中位數與最長 turn 時長 |

這些提示只是提供給模型的證據，並不保證它的估計或行為會因此改善。

## 安裝

```
/plugin install time-sense --marketplace u6vu06Ou/time-sense
```

(回答 `y` 加入 marketplace,然後選擇 **user** 範圍，讓它在每個專案都能使用。若只想在單一專案使用，就選 project 範圍。)

## 備註

- 背景任務通知(例如 subagent 回報)不算提示，所以不會附上時間。

- 使用你機器所在的本地時區。
- 時長資料儲存在 mod 自己的儲存區(最近 40 個 turn);不會有任何資料離開你的機器。
