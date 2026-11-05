import { useEffect, useRef, useState } from 'react'
import type { Route } from '../App'

const ENTRIES: { route: Route; label: string; hint: string }[] = [
  { route: 'terminal', label: 'KavOS Terminal (default)', hint: 'an interactive shell: ls, cat, whoami…' },
  { route: 'desktop', label: 'KavOS Desktop (Win95 mode)', hint: 'windows, icons, a Start menu' },
  { route: 'plain', label: 'Plain text mode (safe mode)', hint: 'a normal page, for the busy' },
]

const TIMEOUT = 8

export default function Grub({ onSelect }: { onSelect: (r: Route) => void }) {
  const [sel, setSel] = useState(0)
  const [left, setLeft] = useState(TIMEOUT)
  const [armed, setArmed] = useState(true)
  const items = useRef<(HTMLButtonElement | null)[]>([])
  const programmatic = useRef(false)

  const move = (i: number) => {
    setSel(i)
    setArmed(false)
    programmatic.current = true
    items.current[i]?.focus()
    programmatic.current = false
  }

  // Start with focus on the default entry so keyboard and screen-reader users land in the menu.
  useEffect(() => {
    programmatic.current = true
    items.current[0]?.focus({ preventScroll: true })
    programmatic.current = false
  }, [])

  useEffect(() => {
    if (!armed) return
    if (left <= 0) {
      onSelect(ENTRIES[sel].route)
      return
    }
    const t = setTimeout(() => setLeft(left - 1), 1000)
    return () => clearTimeout(t)
  }, [left, armed, sel, onSelect])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return
      if (e.key === 'ArrowUp' || e.key === 'k') move((sel + ENTRIES.length - 1) % ENTRIES.length)
      else if (e.key === 'ArrowDown' || e.key === 'j') move((sel + 1) % ENTRIES.length)
      else if (e.key === 'Home') move(0)
      else if (e.key === 'End') move(ENTRIES.length - 1)
      else if (/^[1-3]$/.test(e.key)) onSelect(ENTRIES[Number(e.key) - 1].route)
      else {
        // Any other key stops the countdown, like real GRUB, and keeps its normal behaviour (Tab, Enter on the focused entry…).
        setArmed(false)
        return
      }
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel, onSelect])

  return (
    <div className="grub" onPointerDown={() => setArmed(false)}>
      <h1 className="grub-title">GNU GRUB version 2.26 (KavOS edition)</h1>
      <ul className="grub-box" aria-label="Choose how to view the portfolio">
        {ENTRIES.map((e, i) => (
          <li key={e.route}>
            <button
              ref={(el) => {
                items.current[i] = el
              }}
              type="button"
              className={`grub-item${i === sel ? ' is-sel' : ''}`}
              aria-current={i === sel ? 'true' : undefined}
              tabIndex={i === sel ? 0 : -1}
              onPointerEnter={(ev) => ev.pointerType === 'mouse' && (setSel(i), setArmed(false))}
              onFocus={() => {
                setSel(i)
                if (!programmatic.current) setArmed(false)
              }}
              onClick={() => onSelect(e.route)}
            >
              <span className="grub-marker" aria-hidden>
                {i === sel ? '*' : ' '}
              </span>
              <span className="grub-label">{e.label}</span>
              <span className="grub-hint">{e.hint}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="grub-foot">
        <p>Use the ↑ and ↓ keys to select which entry is highlighted. Press Enter to boot the selected OS, or 1–3 to pick directly.</p>
        <p aria-hidden={!armed} className={armed ? undefined : 'grub-stopped'}>
          {armed ? (
            <>
              The highlighted entry will be executed automatically in <b>{left}</b>s.
            </>
          ) : (
            'Countdown stopped.'
          )}
        </p>
      </div>
    </div>
  )
}
