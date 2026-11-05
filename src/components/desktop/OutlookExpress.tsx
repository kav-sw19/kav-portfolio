import { useState } from 'react'
import { highlights, profile } from '../../data/profile'

type Mail = { id: string; from: string; subject: string; date: string; body: string; draft?: boolean }
type Folder = 'inbox' | 'drafts' | 'sent' | 'deleted'

const INBOX: Mail[] = [
  {
    id: 'welcome',
    from: 'KavOS Team',
    subject: 'Welcome to Outlook Express',
    date: 'Today',
    body: `This is the quickest way to reach Kav.

Click "New Mail" (or open the draft in Drafts) and your message opens in your own email app, already addressed to ${profile.email}.

Nothing is sent from this page.`,
  },
  {
    id: 'golive',
    from: 'medallion-bot',
    subject: '[go-live] 16,409 records updated, 0 failed',
    date: 'Nov 2026',
    body: `Run complete.

  Records updated ....... 16,409
  Field values written .. 103,943
  Case moves ............ 14,080
  Failed sends .......... 0
  Read-back check ....... 400/400 matched

Coffee consumed: unknown (counter overflowed).`,
  },
  {
    id: 'brew',
    from: 'Homebrew',
    subject: 'whosup was successfully installed',
    date: 'Oct 2026',
    body: `==> Tapping kav-sw19/tap
==> Fetching whosup
==> Installing whosup
🍺  whosup was successfully installed!

Run \`whosup\` to see every coding agent you have running.`,
  },
  {
    id: 'uni',
    from: 'University of Leicester',
    subject: 'Your degree result',
    date: 'Jun 2025',
    body: `Dear Kavindu,

Congratulations: BSc Computer Science, First Class Honours.

(The original was nicer. This one is a re-enactment.)`,
  },
  {
    id: 'teapot',
    from: 'Coffee Machine',
    subject: 'HTCPCP error 418',
    date: 'Every night',
    body: `I'm a teapot.

Please stop asking me for coffee at 11pm. You said you'd sleep.`,
  },
]

const DRAFT: Mail = {
  id: 'draft',
  from: 'You',
  subject: 'Re: Opportunity',
  date: 'Draft',
  draft: true,
  body: `Hi Kav,

I came across your portfolio and I'd like to talk to you about a role at [company].

[A sentence about the role.]

Are you free for a quick call this week?

Best,
[Your name]`,
}

const DELETED: Mail[] = [
  {
    id: 'rust',
    from: 'Kav (2024)',
    subject: 'Re: rewrite everything in Rust?',
    date: '2024',
    body: 'Maybe later.\n\n(Update: whosup is in Rust. Everything else is still pending.)',
  },
]

const FOLDERS: { id: Folder; label: string; icon: string }[] = [
  { id: 'inbox', label: 'Inbox', icon: '📥' },
  { id: 'drafts', label: 'Drafts', icon: '📝' },
  { id: 'sent', label: 'Sent Items', icon: '📤' },
  { id: 'deleted', label: 'Deleted Items', icon: '🗑️' },
]

export default function OutlookExpress() {
  const [folder, setFolder] = useState<Folder>('inbox')
  const [selected, setSelected] = useState<string>('welcome')
  const [compose, setCompose] = useState<{ subject: string; body: string } | null>(null)
  const [sent, setSent] = useState<Mail[]>([])

  const mails = folder === 'inbox' ? INBOX : folder === 'drafts' ? [DRAFT] : folder === 'sent' ? sent : DELETED
  const current = mails.find((m) => m.id === selected) ?? mails[0]

  const openFolder = (f: Folder) => {
    setFolder(f)
    const first = f === 'inbox' ? INBOX[0] : f === 'drafts' ? DRAFT : f === 'sent' ? sent[0] : DELETED[0]
    setSelected(first?.id ?? '')
  }

  const newMail = (subject = '', body = '') => setCompose({ subject, body })

  const send = () => {
    if (!compose) return
    const href = `mailto:${profile.email}?subject=${encodeURIComponent(compose.subject || 'Hello')}&body=${encodeURIComponent(compose.body)}`
    // A real link click is the most reliable way to hand off to the visitor's mail app (Safari, iOS, in-app browsers).
    const a = document.createElement('a')
    a.href = href
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
    const id = `sent-${Date.now()}`
    setSent((s) => [
      {
        id,
        from: profile.email,
        subject: compose.subject || 'Hello',
        date: 'Just now',
        body: `${compose.body}\n\n---\nThis opened in your email app: press send there.\nNothing happened? Email ${profile.email} directly.`,
      },
      ...s,
    ])
    setSelected(id)
    setCompose(null)
    setFolder('sent')
  }

  return (
    <div className="oe">
      <div className="oe-toolbar" role="toolbar" aria-label="Mail">
        <button type="button" className="w95-btn oe-tool" onClick={() => newMail()}>
          <span aria-hidden>✉️</span> New Mail
        </button>
        <button
          type="button"
          className="w95-btn oe-tool"
          disabled={!current || folder === 'sent'}
          onClick={() => current && (current.draft ? newMail(current.subject, current.body) : newMail(`Re: ${current.subject}`, ''))}
        >
          <span aria-hidden>↩️</span> {current?.draft ? 'Open draft' : 'Reply'}
        </button>
        <button type="button" className="w95-btn oe-tool" onClick={() => openFolder('inbox')}>
          <span aria-hidden>🔄</span> Send/Recv
        </button>
      </div>

      {compose ? (
        <form
          className="oe-compose"
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
        >
          <label className="oe-field">
            <span>To:</span>
            <input className="w95-input" value={profile.email} readOnly />
          </label>
          <label className="oe-field">
            <span>Subject:</span>
            <input className="w95-input" value={compose.subject} onChange={(e) => setCompose({ ...compose, subject: e.target.value })} autoFocus />
          </label>
          <textarea className="w95-input oe-body" aria-label="Message" value={compose.body} onChange={(e) => setCompose({ ...compose, body: e.target.value })} />
          <div className="oe-compose-btns">
            <span className="oe-hint">Opens in your own email app, ready to send.</span>
            <button type="button" className="w95-btn" onClick={() => setCompose(null)}>
              Discard
            </button>
            <button type="submit" className="w95-btn oe-send">
              Send
            </button>
          </div>
        </form>
      ) : (
        <div className="oe-main">
          <nav className="oe-folders w95-sunken" aria-label="Folders">
            <div className="oe-folders-head">Outlook Express</div>
            {FOLDERS.map((f) => {
              const count = f.id === 'inbox' ? INBOX.length : f.id === 'drafts' ? 1 : f.id === 'sent' ? sent.length : DELETED.length
              return (
                <button key={f.id} type="button" className={`oe-folder${folder === f.id ? ' is-sel' : ''}`} aria-current={folder === f.id} onClick={() => openFolder(f.id)}>
                  <span aria-hidden>{f.icon}</span> {f.label}
                  {count > 0 && <span className="oe-count">({count})</span>}
                </button>
              )
            })}
          </nav>
          <select className="oe-folder-select w95-input" aria-label="Folder" value={folder} onChange={(e) => openFolder(e.target.value as Folder)}>
            {FOLDERS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
          <div className="oe-right">
            <div className="oe-list w95-sunken" role="listbox" aria-label="Messages">
              <div className="oe-list-head" aria-hidden>
                <span>{folder === 'sent' ? 'To' : 'From'}</span>
                <span>Subject</span>
                <span>Received</span>
              </div>
              {mails.length === 0 && <p className="oe-empty">There are no items in this view.</p>}
              {mails.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="option"
                  aria-selected={current?.id === m.id}
                  className={`oe-row${current?.id === m.id ? ' is-sel' : ''}`}
                  onClick={() => setSelected(m.id)}
                  onDoubleClick={() => m.draft && newMail(m.subject, m.body)}
                >
                  <span>{m.from}</span>
                  <span>{m.subject}</span>
                  <span>{m.date}</span>
                </button>
              ))}
            </div>
            <article className="oe-preview w95-sunken" aria-label="Message preview">
              {current ? (
                <>
                  <header className="oe-preview-head">
                    <div>
                      <b>{folder === 'sent' ? 'To:' : 'From:'}</b> {current.from}
                    </div>
                    <div>
                      <b>Subject:</b> {current.subject}
                    </div>
                  </header>
                  <pre className="oe-preview-body">{current.body}</pre>
                  {current.draft && (
                    <button type="button" className="w95-btn" onClick={() => newMail(current.subject, current.body)}>
                      Open draft
                    </button>
                  )}
                </>
              ) : (
                <p className="oe-empty">Select a message to read it.</p>
              )}
            </article>
          </div>
        </div>
      )}
      <div className="oe-status" aria-hidden>
        {mails.length} message(s) · {highlights.length} unread achievements · Working Online
      </div>
    </div>
  )
}
