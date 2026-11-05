import { Component, lazy, Suspense, useCallback, useEffect, useLayoutEffect, useState, type ReactNode } from 'react'
import Boot from './components/Boot'
import Grub from './components/Grub'
import Plain from './components/Plain'
import { session } from './storage'
import Terminal from './terminal/Terminal'
import { applyTheme, loadCrt, loadTheme, saveCrt, saveTheme, type ThemeName } from './theme'

const Desktop = lazy(() => import('./components/desktop/Desktop'))

export type Route = 'boot' | 'grub' | 'terminal' | 'desktop' | 'plain'
export type Go = (r: Route | 'reboot') => void

const MODES = ['terminal', 'desktop', 'plain'] as const
const isMode = (h: string): h is (typeof MODES)[number] => (MODES as readonly string[]).includes(h)

/** Where a URL with no (or an unknown) mode hash should land. */
const fallbackRoute = (): Route => (session.get('kav.booted') ? 'grub' : 'boot')

function routeFromHash(): Route {
  const h = location.hash.replace('#', '')
  return isMode(h) ? h : fallbackRoute()
}

const TITLES: Record<Route, string> = {
  boot: 'Kavindu Walisinghe · booting…',
  grub: 'Kavindu Walisinghe · AI Solutions Engineer',
  terminal: 'Kavindu Walisinghe · terminal',
  desktop: 'Kavindu Walisinghe · desktop',
  plain: 'Kavindu Walisinghe · AI Solutions Engineer',
}

export default function App() {
  return (
    <ErrorBoundary>
      <Shell />
    </ErrorBoundary>
  )
}

function Shell() {
  const [route, setRoute] = useState<Route>(routeFromHash)
  const [theme, setThemeState] = useState<ThemeName>(loadTheme)
  const [crt, setCrtState] = useState(loadCrt)
  // CRT power-on: once, on the very first boot of the session. Cleared when it finishes so remounts don't replay it.
  const [poweron, setPoweron] = useState(() => route === 'boot')

  // Before paint, so a saved theme never flashes the default green first.
  useLayoutEffect(() => {
    const doc = route === 'plain'
    document.documentElement.classList.toggle('is-doc', doc)
    document.documentElement.style.colorScheme = doc ? 'light' : 'dark'
    if (doc) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#e8e6e1')
    else applyTheme(theme)
  }, [route, theme])

  const setTheme = useCallback((t: ThemeName) => (saveTheme(t), setThemeState(t)), [])
  const setCrt = useCallback((on: boolean) => (saveCrt(on), setCrtState(on)), [])

  useEffect(() => {
    // Modes live in the URL (shareable, Back works). Boot and the menu don't get their own history entries.
    if (isMode(route)) {
      if (location.hash !== `#${route}`) location.hash = route
    } else if (location.hash) history.replaceState(null, '', location.pathname + location.search)
    document.title = TITLES[route]
    window.scrollTo(0, 0)
  }, [route])

  useEffect(() => {
    const onHash = () => setRoute(routeFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const go = useCallback<Go>((r) => {
    if (r === 'reboot') {
      session.remove('kav.booted')
      setRoute('boot')
    } else setRoute(r)
  }, [])

  const bootDone = useCallback(() => {
    session.set('kav.booted', '1')
    setRoute('grub')
  }, [])

  if (route === 'plain') return <Plain />

  const screen =
    route === 'boot' ? (
      <Boot onDone={bootDone} />
    ) : route === 'grub' ? (
      <Grub onSelect={go} />
    ) : route === 'desktop' ? (
      <Suspense
        fallback={
          <div className="boot">
            <pre className="boot-text">starting X server…</pre>
          </div>
        }
      >
        <Desktop theme={theme} setTheme={setTheme} crt={crt} setCrt={setCrt} go={go} />
      </Suspense>
    ) : (
      <Terminal theme={theme} setTheme={setTheme} crt={crt} setCrt={setCrt} go={go} />
    )

  return (
    <div className={`crt${crt ? ' crt--on' : ''}${route === 'desktop' ? ' crt--desktop' : ''}${poweron && crt ? ' crt--poweron' : ''}`}>
      <div className="crt-screen" onAnimationEnd={(e) => e.animationName.startsWith('crt-') && e.target === e.currentTarget && setPoweron(false)}>
        {screen}
      </div>
      {crt && <div className="crt-overlay" aria-hidden />}
    </div>
  )
}

/** If anything in the fancy modes throws, fall back to the plain page rather than a blank screen. */
class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    console.error(error)
  }
  render() {
    return this.state.failed ? <Plain /> : this.props.children
  }
}
