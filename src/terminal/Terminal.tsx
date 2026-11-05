import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { profile } from '../data/profile'
import type { ThemeName } from '../theme'
import { commands, Cmd, type Ctx } from './commands'
import { rawEgg } from './eggs'
import { displayPath, HOME } from './fs'

type Line = { id: number; prompt?: { cwd: string; input: string }; out: ReactNode }

type Props = {
  theme: ThemeName
  setTheme: (t: ThemeName) => void
  crt: boolean
  setCrt: (on: boolean) => void
  go: (route: 'desktop' | 'plain' | 'reboot') => void
  /** Running inside a desktop window. */
  embedded?: boolean
  /** Close the hosting window (embedded only). */
  onExit?: () => void
  autofocus?: boolean
}

const QUICK = ['help', 'whoami', 'experience', 'projects', 'skills', 'contact', 'resume', 'gui']

let nextId = 1

const isCoarse = () => window.matchMedia('(pointer: coarse)').matches

const Prompt = ({ cwd }: { cwd: string }) => (
  <span className="t-prompt">
    <span className="t-accent">guest@kav</span>
    <span className="t-dim">:</span>
    <span className="t-dir">{displayPath(cwd)}</span>
    <span className="t-dim">$</span>{' '}
  </span>
)

const Banner = () => (
  <div className="t-banner">
    <pre className="t-accent t-logo" aria-hidden>
      {LOGO}
    </pre>
    <div>
      Welcome to <span className="t-accent">KavOS</span>. You are logged in as <span className="t-accent">guest</span>.
    </div>
    <div>
      {profile.name} · {profile.title}
    </div>
    <div className="t-dim">
      Type <Cmd c="help" /> to see what you can do, or start with <Cmd c="whoami" />. Prefer windows? <Cmd c="gui" />. Prefer a CV?{' '}
      <Cmd c="resume" />.
    </div>
  </div>
)

export default function Terminal({ theme, setTheme, crt, setCrt, go, embedded = false, onExit, autofocus = true }: Props) {
  const [lines, setLines] = useState<Line[]>([{ id: 0, out: <Banner /> }])
  const [input, setInputRaw] = useState('')
  const [pos, setPos] = useState(0)
  // programmatic changes (history, completion) put the caret at the end
  const setInput = (v: string) => (setInputRaw(v), setPos(v.length))
  const [cwd, setCwd] = useState(HOME)
  const [history, setHistory] = useState<string[]>([])
  const [hIdx, setHIdx] = useState(-1)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const cwdRef = useRef(cwd)
  cwdRef.current = cwd
  const timers = useRef<number[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const clear = useCallback(() => setLines([]), [])

  const run = useCallback(
    async (raw: string) => {
      const cmdLine = raw.trim()
      const promptCwd = cwdRef.current
      if (cmdLine) setHistory((h) => (h.at(-1) === cmdLine ? h : [...h, cmdLine]))
      setHIdx(-1)
      setDraft('')

      // Whole-line tricks (injection attempts, fork bombs, pipes to sh) are answered before parsing.
      const egg = cmdLine ? rawEgg(cmdLine) : null
      if (egg != null) {
        setLines((l) => [...l, { id: nextId++, prompt: { cwd: promptCwd, input: raw }, out: <div>{egg}</div> }])
        return
      }

      // support `a && b`
      const parts = cmdLine ? cmdLine.split('&&').map((s) => s.trim()).filter(Boolean) : []
      const outs: ReactNode[] = []
      let cleared = false
      for (const part of parts) {
        const [name, ...args] = part.split(/\s+/)
        if (embedded && (name === 'exit' || name === 'logout') && onExit) {
          onExit()
          return
        }
        const cmd = Object.hasOwn(commands, name) ? commands[name] : undefined
        const ctx: Ctx = {
          cwd: cwdRef.current,
          setCwd: (p) => {
            cwdRef.current = p
            setCwd(p)
          },
          history,
          clear: () => {
            cleared = true
            clear()
          },
          setTheme,
          theme,
          crt,
          setCrt,
          go: (r, delay = 0) => {
            if (delay) timers.current.push(window.setTimeout(() => go(r), delay))
            else go(r)
          },
          embedded,
        }
        if (!cmd) {
          outs.push(
            <span>
              kavsh: command not found: {name}. Try <Cmd c="help" />.
            </span>,
          )
          continue
        }
        try {
          const o = await cmd.run(args, ctx)
          if (o != null) outs.push(o)
        } catch (e) {
          outs.push(`error: ${(e as Error).message}`)
        }
      }
      if (cleared) return
      setLines((l) => [
        ...l,
        {
          id: nextId++,
          prompt: { cwd: promptCwd, input: raw },
          out: outs.length ? (
            <>
              {outs.map((o, i) => (
                <div key={i}>{o}</div>
              ))}
            </>
          ) : null,
        },
      ])
    },
    [history, theme, crt, setTheme, setCrt, go, embedded, clear, onExit],
  )

  const note = (out: ReactNode) => setLines((l) => [...l, { id: nextId++, out }])

  /** Tab completion. Returns false when there was nothing to complete, so Tab can move focus as normal. */
  const complete = (): boolean => {
    const parts = input.split(/\s+/)
    if (parts.length <= 1) {
      const matches = Object.entries(commands)
        .filter(([n, c]) => !c.hidden && n.startsWith(input))
        .map(([n]) => n)
      if (!matches.length) return false
      if (matches.length === 1) setInput(matches[0] + ' ')
      else {
        const common = commonPrefix(matches)
        if (common.length > input.length) setInput(common)
        else note(<div className="t-dim">{matches.join('   ')}</div>)
      }
      return true
    }
    const [name, ...rest] = parts
    const cmd = Object.hasOwn(commands, name) ? commands[name] : undefined
    const last = rest.at(-1) ?? ''
    const opts = cmd?.args?.({ cwd: cwdRef.current } as Ctx) ?? []
    const matches = opts.filter((o) => o.startsWith(last))
    if (!matches.length) return false
    if (matches.length === 1) setInput([name, ...rest.slice(0, -1), matches[0]].join(' ') + (matches[0].endsWith('/') ? '' : ' '))
    else {
      const common = commonPrefix(matches)
      if (common.length > last.length) setInput([name, ...rest.slice(0, -1), common].join(' '))
      else note(<div className="t-dim">{matches.join('   ')}</div>)
    }
    return true
  }

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const v = input
      setInput('')
      void run(v)
    } else if (e.key === 'Tab') {
      // Only trap Tab when it completes something, so keyboard users can always tab out.
      if (e.shiftKey || !input.trim()) return
      if (complete()) e.preventDefault()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!history.length) return
      const idx = hIdx === -1 ? history.length - 1 : Math.max(0, hIdx - 1)
      if (hIdx === -1) setDraft(input)
      setHIdx(idx)
      setInput(history[idx])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (hIdx === -1) return
      const idx = hIdx + 1
      if (idx >= history.length) {
        setHIdx(-1)
        setInput(draft)
      } else {
        setHIdx(idx)
        setInput(history[idx])
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      clear()
    } else if (e.key === 'c' && e.ctrlKey && !window.getSelection()?.toString()) {
      e.preventDefault()
      setLines((l) => [...l, { id: nextId++, prompt: { cwd, input: input + '^C' }, out: null }])
      setInput('')
    }
  }

  // Keep the newest output readable: if it is taller than the screen, scroll to where it starts, not to its end.
  useLayoutEffect(() => {
    const box = scrollRef.current
    if (!box) return
    const items = box.querySelectorAll<HTMLElement>('.t-line')
    const last = items[items.length - 1]
    if (last && last.offsetHeight > box.clientHeight * 0.75) box.scrollTop = last.offsetTop - 12
    else box.scrollTop = box.scrollHeight
  }, [lines])

  useEffect(() => {
    // On phones, don't pop the keyboard over the welcome screen.
    if (autofocus && !isCoarse()) inputRef.current?.focus({ preventScroll: true })
  }, [autofocus])

  const focusInput = () => inputRef.current?.focus({ preventScroll: true })

  const runFromUi = (c: string) => {
    void run(c)
    if (!isCoarse()) focusInput()
  }

  // Clicks on <Cmd> buttons run the command
  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    const btn = target.closest<HTMLButtonElement>('button.t-cmd')
    if (btn?.dataset.cmd) {
      e.preventDefault()
      runFromUi(btn.dataset.cmd)
      return
    }
    if (window.getSelection()?.toString()) return
    if (target.closest('a, button')) return
    // On touch, only the prompt line opens the keyboard; tapping output should just read.
    if (isCoarse() && !target.closest('.t-inputline')) return
    focusInput()
  }

  return (
    <section className={`terminal${embedded ? ' terminal--embedded' : ''}`} aria-label="KavOS terminal">
      {!embedded && <h1 className="sr-only">Kavindu Walisinghe, AI Solutions Engineer: interactive terminal portfolio</h1>}
      <div className="t-scroll" ref={scrollRef} onClick={onClick}>
        <div role="log" aria-live="polite" aria-relevant="additions">
          {lines.map((l) => (
            <div key={l.id} className="t-line">
              {l.prompt && (
                <div className="t-echo">
                  <Prompt cwd={l.prompt.cwd} />
                  <span>{l.prompt.input}</span>
                </div>
              )}
              {l.out != null && <div className="t-out">{l.out}</div>}
            </div>
          ))}
        </div>
        <label className="t-inputline">
          <Prompt cwd={cwd} />
          <span className="t-inputwrap">
            <span className="t-typed" aria-hidden>
              {input.slice(0, pos)}
              <span className="t-caret">{input[pos] ?? ' '}</span>
              {input.slice(pos + 1)}
            </span>
            <input
              ref={inputRef}
              className="t-input"
              value={input}
              onChange={(e) => (setInputRaw(e.target.value), setPos(e.target.selectionStart ?? e.target.value.length))}
              onKeyDown={onKey}
              onSelect={(e) => setPos(e.currentTarget.selectionStart ?? input.length)}
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              aria-label="Command. Type help for a list of commands."
              enterKeyHint="go"
            />
          </span>
        </label>
      </div>
      {!embedded && (
        <nav className="t-quick" aria-label="Quick commands">
          {QUICK.map((c) => (
            <button key={c} type="button" className="t-chip" onClick={() => runFromUi(c)}>
              {c}
            </button>
          ))}
        </nav>
      )}
    </section>
  )
}

function commonPrefix(arr: string[]) {
  if (!arr.length) return ''
  let p = arr[0]
  for (const s of arr) while (!s.startsWith(p)) p = p.slice(0, -1)
  return p
}

const LOGO = [
  " _  __                ___   ____  ",
  "| |/ /  __ _ __   __ / _ \\ / ___| ",
  "| \' /  / _` |\\ \\ / /| | | |\\___ \\ ",
  "| . \\ | (_| | \\ V / | |_| | ___) |",
  "|_|\\_\\ \\__,_|  \\_/   \\___/ |____/ ",
].join('\n')
