import { certifications, education, experience, profile, projects, skills } from '../../data/profile'
import type { AppDef, AppId, WinApi } from './wm'
import Guestbook from './Guestbook'
import Minesweeper from './Minesweeper'
import OutlookExpress from './OutlookExpress'
import RecycleBin from './RecycleBin'
import Rich from '../Rich'

const A = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} target={href.startsWith('mailto:') ? undefined : '_blank'} rel="noreferrer">
    {children}
  </a>
)

const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

const Notepad = ({ children }: { children: React.ReactNode }) => <div className="w95-notepad">{children}</div>

const about = (): AppDef => ({
  id: 'about',
  title: 'About Me.txt - Notepad',
  icon: '📄',
  w: 520,
  h: 400,
  render: () => (
    <Notepad>
      <h1>{profile.name}</h1>
      <p>
        <b>{profile.title}</b> · {profile.location}
      </p>
      {profile.bio.map((b, i) => (
        <p key={i}>{b}</p>
      ))}
    </Notepad>
  ),
})

const experienceApp = (): AppDef => ({
  id: 'experience',
  title: 'Experience - Notepad',
  icon: '💼',
  w: 640,
  h: 520,
  render: () => (
    <Notepad>
      {experience.map((j) => (
        <section key={j.slug}>
          <h2>
            {j.role} @ {j.company}
          </h2>
          <p className="w95-muted">
            {j.start} – {j.end} · {j.location}
          </p>
          {j.summary && <p>{j.summary}</p>}
          {j.highlights.map((h, i) => (
            <div key={i}>
              {h.title && <h3>{h.title}</h3>}
              <ul>
                {h.points.map((p, k) => (
                  <li key={k}>
                    <Rich text={p} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {j.tech && <p className="w95-muted">Stack: {j.tech.join(', ')}</p>}
          <hr />
        </section>
      ))}
    </Notepad>
  ),
})

const projectsApp = (): AppDef => ({
  id: 'projects',
  title: 'C:\\Projects',
  icon: '📁',
  w: 600,
  h: 460,
  render: () => (
    <div className="w95-explorer">
      <div className="w95-explorer-bar w95-inset">Address: C:\Projects\</div>
      <div className="w95-explorer-body">
        {projects.map((p) => (
          <details key={p.slug} className="w95-proj" open={projects.length === 1}>
            <summary>
              <span className="w95-proj-icon">📦</span> {p.name}
              <span className="w95-muted"> — {p.tagline.replace(/`/g, '')}</span>
            </summary>
            <div className="w95-proj-body">
              {p.description.map((d, i) => (
                <p key={i}>
                  <Rich text={d} />
                </p>
              ))}
              {p.install && <pre className="w95-inset w95-code">{p.install}</pre>}
              <p className="w95-muted">{p.tech.join(' · ')}</p>
              <p>
                {p.links.map((l) => (
                  <span key={l.href}>
                    <A href={l.href}>{l.label}</A>{' '}
                  </span>
                ))}
              </p>
            </div>
          </details>
        ))}
        <p className="w95-muted">{projects.length} object(s)</p>
      </div>
    </div>
  ),
})

const skillsApp = (): AppDef => ({
  id: 'skills',
  title: 'Skills.txt - Notepad',
  icon: '🧰',
  w: 520,
  h: 380,
  render: () => (
    <Notepad>
      {skills.map((s) => (
        <p key={s.group}>
          <b>{s.group}:</b> {s.items.join(', ')}
        </p>
      ))}
    </Notepad>
  ),
})

const educationApp = (): AppDef => ({
  id: 'education',
  title: 'Education.txt - Notepad',
  icon: '🎓',
  w: 520,
  h: 360,
  render: () => (
    <Notepad>
      {education.map((e) => (
        <p key={e.school}>
          <b>{e.qualification}</b>
          <br />
          <span className="w95-muted">
            {e.school}, {e.location} · {e.start} – {e.end}
          </span>
        </p>
      ))}
      <h3>Certifications</h3>
      <ul>
        {certifications.map((c) => (
          <li key={c.name}>
            {c.name} · {c.issuer}
            {c.date ? ` · ${c.date}` : ''}
          </li>
        ))}
      </ul>
    </Notepad>
  ),
})

const contact = (): AppDef => ({
  id: 'contact',
  title: 'Contact',
  icon: '📧',
  w: 420,
  h: 260,
  render: (api) => (
    <div className="w95-dialog">
      <div className="w95-dialog-row">
        <span className="w95-dialog-icon">💬</span>
        <div>
          <p>
            Want to work together, or just say hi? I reply fast.
          </p>
          <table className="w95-table">
            <tbody>
              <tr>
                <td>Email</td>
                <td>
                  <A href={`mailto:${profile.email}`}>{profile.email}</A>
                </td>
              </tr>
              {profile.socials.map((s) => (
                <tr key={s.href}>
                  <td>{s.label}</td>
                  <td>
                    <A href={s.href}>{s.href.replace(/^https?:\/\//, '')}</A>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="w95-dialog-btns">
        <a className="w95-btn" href={`mailto:${profile.email}?subject=Hello`}>
          Send email
        </a>
        <button type="button" className="w95-btn" onClick={api.close}>
          Cancel
        </button>
      </div>
    </div>
  ),
})

const readme = (): AppDef => ({
  id: 'readme',
  title: 'README.txt - Notepad',
  icon: '📝',
  w: 460,
  h: 320,
  render: (api) => (
    <Notepad>
      <p>Welcome to KavOS Desktop.</p>
      <p>Double-click an icon (or tap it on a phone), or use the Start menu. Drag windows by their title bar, resize them from the bottom-right corner, double-click a title bar to maximise.</p>
      <p>
        Prefer typing? Open{' '}
        <button type="button" className="w95-link" onClick={() => api.open('terminal')}>
          Terminal
        </button>
        . Prefer a normal web page? Start → Plain page.
      </p>
      <p>Yes, Minesweeper works.</p>
      <p>
        Curious how it's built? <A href={profile.repo}>Source on GitHub</A>.
      </p>
    </Notepad>
  ),
})

const minesweeper = (): AppDef => ({
  id: 'minesweeper',
  title: 'Minesweeper',
  icon: '💣',
  w: coarse ? 330 : 270,
  h: coarse ? 430 : 350,
  render: () => <Minesweeper />,
})

const outlook = (): AppDef => ({ id: 'outlook', title: 'Outlook Express', icon: '📨', w: 760, h: 500, render: () => <OutlookExpress /> })
const recycle = (): AppDef => ({ id: 'recycle', title: 'Recycle Bin', icon: '🗑️', w: 640, h: 420, render: () => <RecycleBin /> })
const guestbook = (): AppDef => ({ id: 'guestbook', title: 'Guestbook', icon: '📖', w: 520, h: 560, render: () => <Guestbook /> })

// terminal is rendered specially by Desktop (needs theme props)
const terminal = (): AppDef => ({ id: 'terminal', title: 'Terminal', icon: '🖥️', w: 720, h: 460, render: () => null })

export const APPS: Record<AppId, AppDef> = {
  readme: readme(),
  about: about(),
  experience: experienceApp(),
  projects: projectsApp(),
  skills: skillsApp(),
  education: educationApp(),
  contact: contact(),
  terminal: terminal(),
  minesweeper: minesweeper(),
  outlook: outlook(),
  recycle: recycle(),
  guestbook: guestbook(),
}

export const DESKTOP_ICONS: AppId[] = ['about', 'experience', 'projects', 'skills', 'education', 'contact', 'outlook', 'guestbook', 'terminal', 'minesweeper', 'readme', 'recycle']

export type { WinApi }
