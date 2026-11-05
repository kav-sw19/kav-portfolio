import { useCallback, useEffect, useRef, useState } from 'react'
import type { Route } from '../../App'
import { profile } from '../../data/profile'
import Terminal from '../../terminal/Terminal'
import { session } from '../../storage'
import type { ThemeName } from '../../theme'
import { APPS, DESKTOP_ICONS } from './apps'
import type { AppId, Win } from './wm'
import './desktop.css'

type Props = {
  theme: ThemeName
  setTheme: (t: ThemeName) => void
  crt: boolean
  setCrt: (on: boolean) => void
  go: (r: Route | 'reboot') => void
}

const TASKBAR = 30
const MIN_W = 220
const MIN_H = 140

let key = 1
let z = 10

// Phones in either orientation: narrow, short, or a touch-first device that isn't tablet-sized.
const isSmall = () =>
  window.innerWidth < 640 || window.innerHeight < 480 || (window.matchMedia('(pointer: coarse)').matches && window.innerWidth < 1024)

export default function Desktop({ theme, setTheme, crt, setCrt, go }: Props) {
  const [wins, setWins] = useState<Win[]>([])
  const [active, setActive] = useState<number | null>(null)
  const [start, setStart] = useState(false)
  const [sel, setSel] = useState<AppId | null>(null)
  const [clock, setClock] = useState(() => time())
  const deskRef = useRef<HTMLDivElement>(null)
  const startBtnRef = useRef<HTMLButtonElement>(null)
  const startMenuRef = useRef<HTMLDivElement>(null)
  const winRefs = useRef(new Map<number, HTMLDivElement>())
  const lastPointer = useRef<string>('mouse')

  useEffect(() => {
    const t = setInterval(() => setClock(time()), 10_000)
    return () => clearInterval(t)
  }, [])

  const winsRef = useRef(wins)
  winsRef.current = wins

  const focus = useCallback((k: number) => {
    setActive(k)
    setWins((ws) => ws.map((w) => (w.key === k ? { ...w, z: ++z, min: false } : w)))
  }, [])

  const open = useCallback(
    (id: AppId) => {
      setStart(false)
      const existing = winsRef.current.find((w) => w.app === id)
      if (existing) {
        focus(existing.key)
        requestAnimationFrame(() => winRefs.current.get(existing.key)?.focus({ preventScroll: true }))
        return
      }
      const def = APPS[id]
      const area = deskRef.current?.getBoundingClientRect()
      const aw = area?.width ?? window.innerWidth
      const ah = area?.height ?? window.innerHeight - TASKBAR
      const w = Math.min(def.w, aw - 20)
      const h = Math.min(def.h, ah - 20)
      const n = winsRef.current.length
      const win: Win = {
        key: key++,
        app: id,
        x: Math.max(10, Math.min(120 + n * 28, aw - w - 10)),
        y: Math.max(10, Math.min(24 + n * 28, ah - h - 10)),
        w,
        h,
        z: ++z,
        min: false,
        max: isSmall(),
      }
      winsRef.current = [...winsRef.current, win]
      setWins((ws) => (ws.some((x) => x.key === win.key) ? ws : [...ws, win]))
      setActive(win.key)
    },
    [focus],
  )

  // Move keyboard focus into the window that just became active.
  useEffect(() => {
    if (active == null) return
    const el = winRefs.current.get(active)
    if (el && !el.contains(document.activeElement)) {
      const target = el.querySelector<HTMLElement>('.t-input') ?? el
      target.focus({ preventScroll: true })
    }
  }, [active])

  // When a window goes away, hand focus to the next window down (like Win95), or back to Start.
  const handOff = useCallback(
    (gone: number) => {
      const next = winsRef.current.filter((w) => w.key !== gone && !w.min).sort((a, b) => b.z - a.z)[0]
      if (next) focus(next.key)
      else {
        setActive(null)
        requestAnimationFrame(() => startBtnRef.current?.focus())
      }
    },
    [focus],
  )
  const close = useCallback(
    (k: number) => {
      setWins((ws) => ws.filter((w) => w.key !== k))
      handOff(k)
    },
    [handOff],
  )
  const minimize = (k: number) => {
    setWins((ws) => ws.map((w) => (w.key === k ? { ...w, min: true } : w)))
    handOff(k)
  }
  const toggleMax = (k: number) => setWins((ws) => ws.map((w) => (w.key === k ? { ...w, max: !w.max } : w)))

  // First visit: show the README (not on phones, where windows open full-screen and would hide the icons).
  useEffect(() => {
    if (!isSmall() && !session.get('kav.desktop.readme')) {
      session.set('kav.desktop.readme', '1')
      open('readme')
    }
  }, [open])

  // Keep windows reachable when the browser window shrinks.
  useEffect(() => {
    const onResize = () => {
      const area = deskRef.current?.getBoundingClientRect()
      if (!area) return
      setWins((ws) =>
        ws.map((w) => {
          const nw = Math.min(w.w, area.width - 20)
          const nh = Math.min(w.h, area.height - 20)
          return {
            ...w,
            w: Math.max(MIN_W, nw),
            h: Math.max(MIN_H, nh),
            x: Math.max(0, Math.min(w.x, area.width - Math.min(nw, 120))),
            y: Math.max(0, Math.min(w.y, area.height - 40)),
            max: w.max || isSmall(),
          }
        }),
      )
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Start menu: focus the first item on open; arrows move between items; Escape closes and returns focus to Start.
  useEffect(() => {
    if (start) startMenuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
  }, [start])

  const onMenuKey = (e: React.KeyboardEvent) => {
    const items = [...(startMenuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])]
    const i = items.indexOf(document.activeElement as HTMLElement)
    if (e.key === 'Escape') {
      setStart(false)
      startBtnRef.current?.focus()
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus()
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault()
      items[e.key === 'Home' ? 0 : items.length - 1]?.focus()
    } else if (e.key === 'Tab') {
      setStart(false)
    }
  }

  // Close the Start menu on any press outside it (desktop, windows, taskbar), but not on the Start button itself.
  useEffect(() => {
    if (!start) return
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (startMenuRef.current?.contains(t) || startBtnRef.current?.contains(t)) return
      setStart(false)
    }
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [start])

  const pointerOp = (e: React.PointerEvent, k: number, mode: 'move' | 'resize') => {
    const win = wins.find((w) => w.key === k)
    if (!win || win.max || e.button !== 0) return
    if ((e.target as HTMLElement).closest('button')) return
    e.preventDefault()
    focus(k)
    const el = e.currentTarget as HTMLElement
    const winEl = winRefs.current.get(k)
    if (!winEl) return
    try {
      el.setPointerCapture(e.pointerId)
    } catch {
      /* synthetic pointers can't be captured; tracking still works while over the element */
    }
    const area = deskRef.current!.getBoundingClientRect()
    const sx = e.clientX, sy = e.clientY
    // Track the pointer by writing straight to the element (transform for moves), not React state,
    // so a drag never re-renders the desktop. Commit the final geometry once, on release.
    let next = { x: win.x, y: win.y, w: win.w, h: win.h }
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy
      if (mode === 'move') {
        next = {
          ...next,
          x: Math.max(-win.w + 100, Math.min(win.x + dx, area.width - 100)),
          y: Math.max(0, Math.min(win.y + dy, area.height - 30)),
        }
        winEl.style.transform = `translate(${next.x - win.x}px, ${next.y - win.y}px)`
      } else {
        next = {
          ...next,
          w: Math.max(MIN_W, Math.min(win.w + dx, area.width - win.x)),
          h: Math.max(MIN_H, Math.min(win.h + dy, area.height - win.y)),
        }
        winEl.style.width = `${next.w}px`
        winEl.style.height = `${next.h}px`
      }
    }
    const up = () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      winEl.style.transform = ''
      setWins((ws) => ws.map((w) => (w.key === k ? { ...w, ...next } : w)))
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
  }

  const onIconClick = (e: React.MouseEvent, id: AppId) => {
    // Mouse: select, double-click opens (like Win95). Touch, pen and keyboard: open straight away.
    if (e.detail === 0 || lastPointer.current !== 'mouse') open(id)
    else setSel(id)
  }

  return (
    <div className="w95" onPointerDown={(e) => (lastPointer.current = e.pointerType)}>
      <h1 className="sr-only">Kavindu Walisinghe: KavOS desktop</h1>
      <div
        className="w95-desktop"
        ref={deskRef}
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) setSel(null)
        }}
      >
        <ul className="w95-icons" aria-label="Desktop">
          {DESKTOP_ICONS.map((id) => (
            <li key={id}>
              <button
                type="button"
                className={`w95-icon${sel === id ? ' is-sel' : ''}`}
                onClick={(e) => onIconClick(e, id)}
                onDoubleClick={() => open(id)}
              >
                <span className="w95-icon-glyph" aria-hidden>
                  {APPS[id].icon}
                </span>
                <span className="w95-icon-label">{label(id)}</span>
              </button>
            </li>
          ))}
        </ul>

        {wins.map((w) => {
          const def = APPS[w.app]
          const isActive = active === w.key
          return (
            <div
              key={w.key}
              ref={(el) => {
                if (el) winRefs.current.set(w.key, el)
                else winRefs.current.delete(w.key)
              }}
              tabIndex={-1}
              className={`w95-window${isActive ? ' is-active' : ''}${w.max ? ' is-max' : ''}`}
              style={w.max ? { zIndex: w.z } : { left: w.x, top: w.y, width: w.w, height: w.h, zIndex: w.z }}
              onPointerDown={() => !isActive && focus(w.key)}
              role="dialog"
              aria-label={def.title}
              hidden={w.min}
            >
              <div className="w95-titlebar" onPointerDown={(e) => pointerOp(e, w.key, 'move')} onDoubleClick={() => toggleMax(w.key)}>
                <span className="w95-title-icon" aria-hidden>
                  {def.icon}
                </span>
                <span className="w95-title">{def.title}</span>
                <span className="w95-title-btns">
                  <button type="button" className="w95-btn w95-tb" onClick={() => minimize(w.key)} aria-label="Minimise">
                    <svg viewBox="0 0 8 7" aria-hidden><rect x="0" y="5" width="6" height="2" /></svg>
                  </button>
                  <button type="button" className="w95-btn w95-tb" onClick={() => toggleMax(w.key)} aria-label={w.max ? 'Restore' : 'Maximise'}>
                    {w.max ? (
                      <svg viewBox="0 0 8 7" aria-hidden><path d="M2 0h6v5H6V2H2zM0 2h6v5H0zm1 2v2h4V4z" fillRule="evenodd" /></svg>
                    ) : (
                      <svg viewBox="0 0 8 7" aria-hidden><path d="M0 0h8v7H0zm1 2v4h6V2z" fillRule="evenodd" /></svg>
                    )}
                  </button>
                  <button type="button" className="w95-btn w95-tb w95-tb-x" onClick={() => close(w.key)} aria-label="Close">
                    <svg viewBox="0 0 8 7" aria-hidden><path d="M0 0h2l2 2 2-2h2L5 3.5 8 7H6L4 5 2 7H0l3-3.5z" /></svg>
                  </button>
                </span>
              </div>
              <div className={`w95-body${w.app === 'terminal' ? ' w95-body--term' : ''}`}>
                {w.app === 'terminal' ? (
                  <Terminal theme={theme} setTheme={setTheme} crt={crt} setCrt={setCrt} go={go} embedded onExit={() => close(w.key)} autofocus={isActive} />
                ) : (
                  def.render({ open, close: () => close(w.key) })
                )}
              </div>
              {!w.max && <div className="w95-grip" onPointerDown={(e) => pointerOp(e, w.key, 'resize')} aria-hidden />}
            </div>
          )
        })}
      </div>

      <div className="w95-taskbar">
        <button
          ref={startBtnRef}
          type="button"
          className={`w95-btn w95-start${start ? ' is-down' : ''}`}
          onClick={() => setStart((s) => !s)}
          aria-haspopup="menu"
          aria-expanded={start}
        >
          <svg className="w95-start-logo" viewBox="0 0 16 14" aria-hidden>
            <path fill="#f33" d="M1 1.5 7 0v6.5H1z" />
            <path fill="#3c3" d="M8 0l7-1v7.5H8z" transform="translate(0 1)" />
            <path fill="#36f" d="M1 7.5h6V14l-6-1.5z" />
            <path fill="#fc0" d="M8 7.5h7V14l-7-1z" />
          </svg>
          Start
        </button>
        <div className="w95-tasks">
          {wins.map((w) => (
            <button
              key={w.key}
              type="button"
              className={`w95-btn w95-task${active === w.key && !w.min ? ' is-down' : ''}`}
              onClick={() => (active === w.key && !w.min ? minimize(w.key) : focus(w.key))}
              aria-pressed={active === w.key && !w.min}
            >
              <span aria-hidden>{APPS[w.app].icon}</span>
              <span className="w95-task-label">{APPS[w.app].title}</span>
            </button>
          ))}
        </div>
        <div className="w95-tray">
          <button type="button" className="w95-tray-btn" onClick={() => setCrt(!crt)} aria-pressed={crt} title={`CRT effects ${crt ? 'on' : 'off'}`}>
            <span aria-hidden>📺</span>
            <span className="sr-only">CRT effects</span>
          </button>
          <time>{clock}</time>
        </div>
      </div>

      {start && (
        <div className="w95-startmenu w95-raised" ref={startMenuRef} onKeyDown={onMenuKey}>
          <div className="w95-startmenu-side" aria-hidden>
            <span>
              <b>Kav</b>OS
            </span>
          </div>
          <div className="w95-startmenu-items">
            <div className="w95-startmenu-head" aria-hidden>
              {profile.name}
            </div>
            <div role="menu" aria-label="Start" className="w95-startmenu-list">
            {DESKTOP_ICONS.map((id) => (
              <button key={id} type="button" className="w95-menuitem" role="menuitem" onClick={() => open(id)}>
                <span aria-hidden>{APPS[id].icon}</span> {label(id)}
              </button>
            ))}
            <hr role="separator" />
            <button type="button" className="w95-menuitem" role="menuitem" onClick={() => (setStart(false), setCrt(!crt))}>
              <span aria-hidden>📺</span> CRT effects: {crt ? 'on' : 'off'}
            </button>
            <button type="button" className="w95-menuitem" role="menuitem" onClick={() => go('plain')}>
              <span aria-hidden>📃</span> Plain page
            </button>
            <button type="button" className="w95-menuitem" role="menuitem" onClick={() => go('terminal')}>
              <span aria-hidden>⌨️</span> Exit to terminal
            </button>
            <button type="button" className="w95-menuitem" role="menuitem" onClick={() => go('reboot')}>
              <span aria-hidden>⏻</span> Shut Down…
            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function label(id: AppId) {
  return {
    about: 'About Me',
    experience: 'Experience',
    projects: 'Projects',
    skills: 'Skills',
    education: 'Education',
    contact: 'Contact',
    terminal: 'Terminal',
    minesweeper: 'Minesweeper',
    readme: 'README',
    outlook: 'Outlook Express',
    recycle: 'Recycle Bin',
    guestbook: 'Guestbook',
  }[id]
}

function time() {
  return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}
