import type { Register } from 'claude-code'

const GAP_MS = 20 * 60_000 // only speak up after 20 min of silence
const KEEP = 40 // turn durations remembered
const MIN_SAMPLES = 5

let sessionNoted = false
let turnStartedAt: number | undefined

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function stamp(ms: number) {
  const d = new Date(ms)
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${day} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function span(ms: number) {
  const m = Math.round(ms / 60_000)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  return h < 48 ? `${h}h${pad(m % 60)}m` : `${Math.floor(h / 24)}d${h % 24}h`
}

async function paceLine($: any) {
  const list = ((await $.store.get('durations')) as number[] | undefined) ?? []
  if (list.length < MIN_SAMPLES) return undefined
  const s = [...list].sort((a, b) => a - b)
  const median = s[Math.floor(s.length / 2)]
  return `[pace] your last ${s.length} turns took median ${span(median)}, longest ${span(s[s.length - 1])} of real time. Estimate durations in these terms, not human workdays.`
}

export const register: Register = on => {
  on('prompt.submit', async ($, e, next) => {
    const now = await $.clock.now()
    const last = (await $.store.get('lastActive')) as number | undefined
    await $.store.set('lastActive', now)
    const notes: string[] = []
    if (last === undefined || now - last >= GAP_MS || !sessionNoted) {
      notes.push(`[time] now ${stamp(now)}` + (last === undefined ? '' : ` · last activity ${span(now - last)} ago`))
    }
    if (!sessionNoted) {
      sessionNoted = true
      const pace = await paceLine($)
      if (pace) notes.push(pace)
    }
    return notes.length ? next({ ...e, context: [...(e.context ?? []), notes.join('\n')] }) : next(e)
  }).catch(($, e, next) => next(e))

  on('turn.start', async ($, e, next) => {
    if (!(e as any).agentId) turnStartedAt = await $.clock.now()
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    if (!(e as any).agentId && turnStartedAt !== undefined) {
      const now = await $.clock.now()
      const list = ((await $.store.get('durations')) as number[] | undefined) ?? []
      await $.store.set('durations', [...list, now - turnStartedAt].slice(-KEEP))
      await $.store.set('lastActive', now)
      turnStartedAt = undefined
    }
    return next(e)
  })
}
