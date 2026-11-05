import { useEffect, useRef, useState } from 'react'

const W = 9, H = 9, MINES = 10

type Cell = { mine: boolean; open: boolean; flag: boolean; n: number }

const blank = (): Cell[] => Array.from({ length: W * H }, () => ({ mine: false, open: false, flag: false, n: 0 }))

function build(safe: number): Cell[] {
  const cells = blank()
  // keep the first click and its neighbours mine-free, so the first move always opens an area
  const keepClear = new Set([safe, ...neighbours(safe)])
  let placed = 0
  while (placed < MINES) {
    const i = Math.floor(Math.random() * W * H)
    if (cells[i].mine || keepClear.has(i)) continue
    cells[i].mine = true
    placed++
  }
  for (let i = 0; i < cells.length; i++) cells[i].n = neighbours(i).filter((j) => cells[j].mine).length
  return cells
}

function neighbours(i: number) {
  const x = i % W, y = Math.floor(i / W)
  const out: number[] = []
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue
      const nx = x + dx, ny = y + dy
      if (nx >= 0 && nx < W && ny >= 0 && ny < H) out.push(ny * W + nx)
    }
  return out
}

const COLORS = ['', '#0000ff', '#008000', '#ff0000', '#000080', '#800000', '#008080', '#000', '#808080']
const LONG_PRESS = 400

export default function Minesweeper() {
  const [cells, setCells] = useState<Cell[]>(blank)
  const [started, setStarted] = useState(false)
  const [state, setState] = useState<'play' | 'won' | 'lost'>('play')
  const [flagMode, setFlagMode] = useState(false)
  const [secs, setSecs] = useState(0)
  const [pressing, setPressing] = useState(false)
  const press = useRef<{ timer: number; fired: boolean } | null>(null)
  const lastPointer = useRef('mouse')
  const [cursor, setCursor] = useState(40) // roving focus: one Tab stop, arrows move within the board
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    if (!started || state !== 'play') return
    const t = setInterval(() => setSecs((s) => Math.min(999, s + 1)), 1000)
    return () => clearInterval(t)
  }, [started, state])

  const flags = cells.filter((c) => c.flag).length

  const reset = () => (setCells(blank()), setStarted(false), setState('play'), setSecs(0))

  const reveal = (i: number) => {
    if (state !== 'play') return
    const c = (started ? cells : build(i)).map((x) => ({ ...x }))
    if (!started) setStarted(true)
    if (c[i].flag || c[i].open) return
    if (c[i].mine) {
      c.forEach((x) => x.mine && (x.open = true))
      setCells(c)
      setState('lost')
      return
    }
    const stack = [i]
    while (stack.length) {
      const j = stack.pop()!
      if (c[j].open || c[j].flag) continue
      c[j].open = true
      if (c[j].n === 0) neighbours(j).forEach((k) => !c[k].open && stack.push(k))
    }
    setCells(c)
    if (c.every((x) => x.mine || x.open)) setState('won')
  }

  const toggleFlag = (i: number) => {
    // No flags before the board exists: the first reveal builds it, and would drop them.
    if (state !== 'play' || !started || cells[i].open) return
    setCells((cs) => cs.map((x, k) => (k === i ? { ...x, flag: !x.flag } : x)))
  }

  const onDown = (e: React.PointerEvent, i: number) => {
    lastPointer.current = e.pointerType
    if (e.button !== 0 || state !== 'play') return
    setPressing(true)
    const timer = window.setTimeout(() => {
      if (press.current) press.current.fired = true
      toggleFlag(i)
      navigator.vibrate?.(15)
    }, LONG_PRESS)
    press.current = { timer, fired: false }
  }
  const onUp = () => {
    setPressing(false)
    if (press.current) clearTimeout(press.current.timer)
  }
  const onClick = (i: number) => {
    setCursor(i)
    const fired = press.current?.fired
    press.current = null
    if (fired || state !== 'play') return
    if (flagMode) toggleFlag(i)
    else reveal(i)
  }

  const onCellKey = (e: React.KeyboardEvent, i: number) => {
    const x = i % W, y = Math.floor(i / W)
    const to = (nx: number, ny: number) => {
      e.preventDefault()
      const j = Math.max(0, Math.min(H - 1, ny)) * W + Math.max(0, Math.min(W - 1, nx))
      setCursor(j)
      cellRefs.current[j]?.focus()
    }
    if (e.key === 'ArrowLeft') to(x - 1, y)
    else if (e.key === 'ArrowRight') to(x + 1, y)
    else if (e.key === 'ArrowUp') to(x, y - 1)
    else if (e.key === 'ArrowDown') to(x, y + 1)
    else if (e.key === 'f' || e.key === 'F') toggleFlag(i)
  }

  const face = state === 'won' ? '😎' : state === 'lost' ? '😵' : pressing ? '😮' : '🙂'
  const status = state === 'won' ? `Cleared in ${secs} seconds.` : state === 'lost' ? 'Boom. Press the face to try again.' : ''

  return (
    <div className="ms">
      <div className="ms-bar">
        <span className="ms-led" role="img" aria-label={`${MINES - flags} mines left`}>
          {String(Math.max(-99, MINES - flags)).padStart(3, '0')}
        </span>
        <button type="button" className="w95-btn ms-face" onClick={reset} aria-label="New game">
          <span aria-hidden>{face}</span>
        </button>
        <span className="ms-led" role="img" aria-label={`${secs} seconds`}>
          {String(secs).padStart(3, '0')}
        </span>
      </div>
      <div className="ms-grid" role="group" aria-label="Minefield, 9 by 9" style={{ gridTemplateColumns: `repeat(${W}, var(--ms-cell))` }} onPointerUp={onUp} onPointerLeave={onUp} onPointerCancel={onUp}>
        {cells.map((c, i) => (
          <button
            key={i}
            ref={(el) => {
              cellRefs.current[i] = el
            }}
            type="button"
            tabIndex={i === cursor ? 0 : -1}
            className={`ms-cell${c.open ? ' is-open' : ''}${c.open && c.mine ? ' is-mine' : ''}`}
            style={{ color: COLORS[c.n] }}
            onPointerDown={(e) => onDown(e, i)}
            onClick={() => onClick(i)}
            onContextMenu={(e) => {
              e.preventDefault()
              // Touch long-press is handled by the timer; Android also fires contextmenu, which would toggle twice.
              if (lastPointer.current !== 'mouse') return
              toggleFlag(i)
            }}
            onKeyDown={(e) => onCellKey(e, i)}
            aria-disabled={state !== 'play' && !c.open}
            aria-label={`Row ${Math.floor(i / W) + 1}, column ${(i % W) + 1}: ${c.open ? (c.mine ? 'mine' : c.n ? `${c.n} adjacent` : 'empty') : c.flag ? 'flagged' : 'hidden'}`}
          >
            {c.open ? (c.mine ? '💣' : c.n || '') : c.flag ? '🚩' : ''}
          </button>
        ))}
      </div>
      <div className="ms-foot">
        <label className="ms-mode">
          <input type="checkbox" checked={flagMode} onChange={(e) => setFlagMode(e.target.checked)} /> 🚩 flag mode
        </label>
        <span className="ms-hint">right-click, long-press or F to flag · arrows to move</span>
      </div>
      <div className="sr-only" aria-live="polite">
        {status}
      </div>
    </div>
  )
}
