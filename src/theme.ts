import { local } from './storage'

export const THEMES = {
  green: { fg: '#9ef09e', accent: '#4dff4d', dim: '#5c9a5c', bg: '#061006', glow: 'rgba(77,255,77,.35)' },
  amber: { fg: '#ffcf7a', accent: '#ffb000', dim: '#a08040', bg: '#120c02', glow: 'rgba(255,176,0,.35)' },
  white: { fg: '#e6e6e6', accent: '#ffffff', dim: '#858585', bg: '#0a0a0a', glow: 'rgba(255,255,255,.25)' },
  dracula: { fg: '#f8f8f2', accent: '#bd93f9', dim: '#7f8cc0', bg: '#1a1b26', glow: 'rgba(189,147,249,.3)' },
  cyan: { fg: '#aef6ff', accent: '#2ee6ff', dim: '#4f97a3', bg: '#02100f', glow: 'rgba(46,230,255,.35)' },
} as const

export type ThemeName = keyof typeof THEMES

export function applyTheme(name: ThemeName) {
  const t = THEMES[name]
  const r = document.documentElement.style
  r.setProperty('--fg', t.fg)
  r.setProperty('--accent', t.accent)
  r.setProperty('--dim', t.dim)
  r.setProperty('--bg', t.bg)
  r.setProperty('--glow', t.glow)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t.bg)
}

const KEY = 'kav.theme'
export function loadTheme(): ThemeName {
  const v = local.get(KEY)
  return v && v in THEMES ? (v as ThemeName) : 'green'
}
export function saveTheme(n: ThemeName) {
  local.set(KEY, n)
}

const CRT_KEY = 'kav.crt'
export function loadCrt() {
  const v = local.get(CRT_KEY)
  if (v === null) return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return v === '1'
}
export function saveCrt(on: boolean) {
  local.set(CRT_KEY, on ? '1' : '0')
}
