import { test, expect, mock } from 'claude-code/testing'

const MIN = 60_000

function setup($: any, on: any) {
  const clock = mock.clock(on)
  mock.store(on)
  on('session.id', () => ({ value: 's1' }))
  const seen: (readonly string[] | undefined)[] = []
  on('prompt.submit', (_: any, e: any) => { seen.push(e.context); return { text: e.text } })
  const send = (text: string) => $.prompt.submit({ text })
  return { clock, seen, send }
}

test('every prompt gets the time; a quick follow-up gets no gap; a long gap gets the gap', async ($, on) => {
  const s = setup($, on)
  await s.send('a')
  expect(String(s.seen[0])).toContain('[time] now')
  await s.clock.advance(5 * MIN)
  await s.send('b')
  expect(String(s.seen[1])).toContain('[time] now')
  expect(String(s.seen[1])).not.toContain('ago')
  await s.clock.advance(6 * 60 * MIN)
  await s.send('c')
  expect(String(s.seen[2])).toContain("conversation's last message 6h")
})
