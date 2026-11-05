import { useEffect, useState } from 'react'
import { profile } from '../data/profile'

const POST = [
  'KavBIOS (C) 2003-2026, Walisinghe Systems Inc.',
  'BIOS Date 06/01/26 Ver: 1.0.0',
  '',
  'CPU : Human Brain @ 1 coffee/hr  (1 core, infinite threads)',
  'Memory Test : 65536K OK',
  '',
  'Detecting IDE drives ...',
  '  Primary Master   : PYTHON-SSD      3.12',
  '  Primary Slave    : TYPESCRIPT-HDD   5.x',
  '  Secondary Master : RUST-NVME        1.85',
  '  Secondary Slave  : SQL-TAPE         ∞',
  '',
  'Loading kernel modules ...',
  '  [ OK ] llm.ko',
  '  [ OK ] medallion.ko (bronze, silver, gold)',
  '  [ OK ] whosup.ko',
  '  [ OK ] coffee.ko',
  '',
  `Booting ${profile.name.toLowerCase().replace(' ', '-')}.portfolio ...`,
]

type Props = { onDone: () => void }

export default function Boot({ onDone }: Props) {
  const [n, setN] = useState(0)

  useEffect(() => {
    if (n >= POST.length) {
      const t = setTimeout(onDone, 500)
      return () => clearTimeout(t)
    }
    const line = POST[n]
    const delay = line === '' ? 60 : line.startsWith('  [') ? 140 : line.startsWith('Memory') ? 500 : 90
    const t = setTimeout(() => setN(n + 1), delay)
    return () => clearTimeout(t)
  }, [n, onDone])

  useEffect(() => {
    const KEYS = new Set(['Enter', 'Escape', ' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace'])
    const onKey = (e: KeyboardEvent) => {
      // "Any key" means typing keys: leave modifiers, F-keys and browser shortcuts alone.
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return
      if (e.key.length !== 1 && !KEYS.has(e.key)) return
      e.preventDefault()
      onDone()
    }
    // Skip on click (not pointerdown) so the same tap can't fall through onto the boot menu underneath.
    const onClick = () => onDone()
    window.addEventListener('keydown', onKey)
    window.addEventListener('click', onClick)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('click', onClick)
    }
  }, [onDone])

  return (
    <div className="boot">
      <p className="sr-only">Booting KavOS. Press any key to skip.</p>
      <pre className="boot-text" aria-hidden>
        {POST.slice(0, n).join('\n')}
        <span className="boot-cursor">_</span>
      </pre>
      <div className="boot-skip">press any key to skip</div>
    </div>
  )
}
