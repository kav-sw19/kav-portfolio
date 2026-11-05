import { useCallback, useEffect, useRef, useState } from 'react'
import { session } from '../../storage'

type Entry = { id: string; name: string; message: string; at: number }
type Load = { state: 'loading' } | { state: 'offline' } | { state: 'error' } | { state: 'ready'; entries: Entry[] }
type Status = { kind: 'idle' | 'sending' | 'ok' | 'error'; text?: string }

const API = '/api/guestbook'
const MAX_NAME = 40
const MAX_MESSAGE = 280
const TOKEN_KEY = 'kav.gb.admin'

const when = (at: number) => new Date(at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export default function Guestbook() {
  const [load, setLoad] = useState<Load>({ state: 'loading' })
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [hp, setHp] = useState('') // honeypot: humans never see or fill this
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const opened = useRef(Date.now())
  const [adminOpen, setAdminOpen] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const r = await fetch(API, { cache: 'no-store' })
      if (r.status === 503) return setLoad({ state: 'offline' })
      if (!r.ok) return setLoad({ state: 'error' })
      const data = (await r.json()) as { entries: Entry[] }
      setLoad({ state: 'ready', entries: data.entries })
    } catch {
      setLoad({ state: 'error' })
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !message.trim()) return setStatus({ kind: 'error', text: 'Please add your name and a message.' })
    setStatus({ kind: 'sending' })
    try {
      const r = await fetch(API, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, message, hp, t: opened.current }),
      })
      const data = (await r.json().catch(() => ({}))) as { error?: string }
      if (r.ok) {
        setStatus({ kind: 'ok', text: "Thanks for signing! Your message will appear once Kav has approved it." })
        setMessage('')
      } else if (r.status === 503) setStatus({ kind: 'error', text: "The guestbook isn't connected yet. Try again soon." })
      else setStatus({ kind: 'error', text: data.error ? capitalise(data.error) + '.' : 'Something went wrong. Please try again.' })
    } catch {
      setStatus({ kind: 'error', text: "Couldn't reach the guestbook. Check your connection and try again." })
    }
  }

  return (
    <div className="gb">
      <section className="gb-entries w95-sunken" aria-label="Guestbook entries" aria-busy={load.state === 'loading'}>
        {load.state === 'loading' && <p className="gb-note">Loading entries…</p>}
        {load.state === 'offline' && <p className="gb-note">The guestbook isn't connected yet. Check back soon.</p>}
        {load.state === 'error' && (
          <p className="gb-note">
            Couldn't load entries.{' '}
            <button type="button" className="w95-link" onClick={() => void refresh()}>
              Try again
            </button>
          </p>
        )}
        {load.state === 'ready' && load.entries.length === 0 && <p className="gb-note">No entries yet. Be the first to sign!</p>}
        {load.state === 'ready' &&
          load.entries.map((e) => (
            <article key={e.id} className="gb-entry">
              <header>
                <b>{e.name}</b> <span className="gb-date">{when(e.at)}</span>
              </header>
              <p>{e.message}</p>
            </article>
          ))}
      </section>

      <form className="gb-form" onSubmit={submit} noValidate>
        <fieldset className="w95-fieldset">
          <legend>Sign the guestbook</legend>
          <label className="gb-field">
            <span>Name</span>
            <input className="w95-input" value={name} maxLength={MAX_NAME} autoComplete="nickname" onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="gb-field">
            <span>
              Message <span className="gb-count">{message.length}/{MAX_MESSAGE}</span>
            </span>
            <textarea className="w95-input gb-message" value={message} maxLength={MAX_MESSAGE} rows={3} onChange={(e) => setMessage(e.target.value)} />
          </label>
          <label className="gb-hp" aria-hidden="true">
            Website
            <input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
          </label>
          <div className="gb-actions">
            <p className={`gb-status${status.kind === 'error' ? ' is-error' : ''}`} role="status">
              {status.kind === 'sending' ? 'Signing…' : status.text ?? 'No links. Messages are approved before they appear.'}
            </p>
            <button type="submit" className="w95-btn" disabled={status.kind === 'sending'}>
              Sign
            </button>
          </div>
        </fieldset>
      </form>

      <div className="gb-foot">
        <button type="button" className="gb-admin-toggle" onClick={() => setAdminOpen((o) => !o)} aria-expanded={adminOpen}>
          <span aria-hidden>🔑</span>
          <span className="sr-only">Admin</span>
        </button>
      </div>
      {adminOpen && <Admin onChange={refresh} />}
    </div>
  )
}

function Admin({ onChange }: { onChange: () => void }) {
  const [token, setToken] = useState(() => session.get(TOKEN_KEY) ?? '')
  const [draft, setDraft] = useState('')
  const [data, setData] = useState<{ pending: Entry[]; approved: Entry[] } | null>(null)
  const [err, setErr] = useState('')

  const load = useCallback(async (t: string) => {
    setErr('')
    const r = await fetch(`${API}?admin=1`, { headers: { 'x-admin-token': t } })
    if (!r.ok) {
      setData(null)
      setErr(r.status === 401 ? 'Wrong token.' : 'Could not load.')
      return false
    }
    setData((await r.json()) as { pending: Entry[]; approved: Entry[] })
    return true
  }, [])

  useEffect(() => {
    if (token) void load(token)
  }, [token, load])

  const act = async (action: 'approve' | 'delete', id: string) => {
    await fetch(API, { method: 'POST', headers: { 'content-type': 'application/json', 'x-admin-token': token }, body: JSON.stringify({ action, id }) })
    await load(token)
    onChange()
  }

  if (!token || !data)
    return (
      <form
        className="gb-admin w95-sunken"
        onSubmit={async (e) => {
          e.preventDefault()
          if (await load(draft)) {
            session.set(TOKEN_KEY, draft)
            setToken(draft)
          }
        }}
      >
        <label className="gb-field">
          <span>Admin token</span>
          <input className="w95-input" type="password" value={draft} onChange={(e) => setDraft(e.target.value)} autoComplete="off" />
        </label>
        <button type="submit" className="w95-btn">
          Unlock
        </button>
        {err && <p className="gb-status is-error">{err}</p>}
      </form>
    )

  const Row = ({ e, pending }: { e: Entry; pending?: boolean }) => (
    <li className="gb-admin-row">
      <div>
        <b>{e.name}</b> <span className="gb-date">{when(e.at)}</span>
        <p>{e.message}</p>
      </div>
      <div className="gb-admin-btns">
        {pending && (
          <button type="button" className="w95-btn" onClick={() => void act('approve', e.id)}>
            Approve
          </button>
        )}
        <button type="button" className="w95-btn" onClick={() => void act('delete', e.id)}>
          Delete
        </button>
      </div>
    </li>
  )

  return (
    <section className="gb-admin w95-sunken" aria-label="Moderation">
      <h3>Pending ({data.pending.length})</h3>
      {data.pending.length === 0 ? <p className="gb-note">Nothing waiting.</p> : <ul>{data.pending.map((e) => <Row key={e.id} e={e} pending />)}</ul>}
      <h3>Approved ({data.approved.length})</h3>
      {data.approved.length === 0 ? <p className="gb-note">None yet.</p> : <ul>{data.approved.map((e) => <Row key={e.id} e={e} />)}</ul>}
      <button
        type="button"
        className="w95-btn"
        onClick={() => {
          session.remove(TOKEN_KEY)
          setToken('')
          setData(null)
        }}
      >
        Lock
      </button>
    </section>
  )
}

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
