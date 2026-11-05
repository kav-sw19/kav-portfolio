import type { ReactNode } from 'react'
import { certifications, education, experience, fortunes, profile, projects, skills } from '../data/profile'
import Rich from '../components/Rich'
import { THEMES, type ThemeName } from '../theme'
import { eggs } from './eggs'
import { displayPath, HOME, isDenied, lookup, resolve, UNLISTED } from './fs'

export type Ctx = {
  cwd: string
  setCwd: (p: string) => void
  history: string[]
  clear: () => void
  setTheme: (t: ThemeName) => void
  theme: ThemeName
  crt: boolean
  setCrt: (on: boolean) => void
  /** Navigate, optionally after a delay so the command's output is seen first. */
  go: (route: 'desktop' | 'plain' | 'reboot', delayMs?: number) => void
  embedded: boolean
}

export type Command = {
  desc: string
  usage?: string
  hidden?: boolean
  args?: (ctx: Ctx) => string[]
  run: (args: string[], ctx: Ctx) => ReactNode | Promise<ReactNode>
}

const A = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target={href.startsWith('mailto:') ? undefined : '_blank'} rel="noreferrer">
    {children}
  </a>
)

/** Clickable command, so visitors can explore without typing. */
export const Cmd = ({ c, children }: { c: string; children?: ReactNode }) => (
  <button type="button" className="t-cmd" data-cmd={c}>
    {children ?? c}
  </button>
)

const Head = ({ children }: { children: ReactNode }) => <div className="t-head">{children}</div>

function pathArgs(ctx: Ctx, wantDir = false) {
  const node = lookup(ctx.cwd)
  if (!node || node.type !== 'dir') return []
  return Object.entries(node.children)
    .filter(([n, c]) => !n.startsWith('.') && (!wantDir || c.type === 'dir'))
    .map(([n, c]) => (c.type === 'dir' ? n + '/' : n))
}

function renderJob(slug: string) {
  const j = experience.find((e) => e.slug === slug)
  if (!j) return null
  return (
    <div className="t-block">
      <Head>
        {j.role} <span className="t-dim">@</span> {j.company}
      </Head>
      <div className="t-dim">
        {j.start} – {j.end} · {j.location}
      </div>
      {j.summary && <p>{j.summary}</p>}
      {j.highlights.map((h, i) => (
        <div key={i} className="t-sub">
          {h.title && <div className="t-accent">▸ {h.title}</div>}
          <ul>
            {h.points.map((p, k) => (
              <li key={k}>
                <Rich text={p} />
              </li>
            ))}
          </ul>
        </div>
      ))}
      {j.tech && <div className="t-dim">stack: {j.tech.join(' · ')}</div>}
    </div>
  )
}

function renderProject(slug: string) {
  const p = projects.find((x) => x.slug === slug)
  if (!p) return null
  return (
    <div className="t-block">
      <Head>
        {p.name} <span className="t-dim">— {p.tagline.replace(/`/g, '')}</span>
      </Head>
      {p.description.map((d, i) => (
        <p key={i}>
          <Rich text={d} />
        </p>
      ))}
      {p.install && (
        <div>
          <span className="t-dim">$</span> <span className="t-accent">{p.install}</span>
        </div>
      )}
      <div className="t-dim">stack: {p.tech.join(' · ')}</div>
      <div>
        {p.links.map((l, i) => (
          <span key={l.href}>
            {i > 0 && ' · '}
            <A href={l.href}>{l.label}</A>
          </span>
        ))}
      </div>
    </div>
  )
}

export const commands: Record<string, Command> = {
  help: {
    desc: 'list available commands',
    run: () => (
      <div className="t-block">
        <div className="t-grid">
          {Object.entries(commands)
            .filter(([, c]) => !c.hidden)
            .map(([name, c]) => (
              <div key={name} className="t-row">
                <Cmd c={name} />
                <span className="t-dim">{c.desc}</span>
              </div>
            ))}
        </div>
        <p className="t-dim">
          tip: <kbd>Tab</kbd> completes, <kbd>↑</kbd>/<kbd>↓</kbd> walk history, <kbd>Ctrl</kbd>+<kbd>L</kbd> clears. Some commands are
          hidden…
        </p>
      </div>
    ),
  },
  whoami: {
    desc: 'who is this guy?',
    run: () => (
      <div className="t-block">
        <Head>{profile.name}</Head>
        <div className="t-accent">{profile.title}</div>
        <p>{profile.tagline}</p>
        <p className="t-dim">
          more: <Cmd c="about" /> · <Cmd c="experience" /> · <Cmd c="projects" /> · <Cmd c="contact" />
        </p>
      </div>
    ),
  },
  about: {
    desc: 'a short bio',
    run: () => (
      <div className="t-block">
        {profile.bio.map((b, i) => (
          <p key={i}>{b}</p>
        ))}
      </div>
    ),
  },
  experience: {
    desc: 'work history (try: experience tanantech)',
    usage: 'experience [company]',
    args: () => experience.map((e) => e.slug),
    run: ([slug]) => {
      if (slug) return renderJob(slug) ?? `experience: no such job '${slug}'`
      return (
        <div className="t-block">
          {experience.map((j) => (
            <div key={j.slug} className="t-row">
              <Cmd c={`experience ${j.slug}`}>{j.slug}</Cmd>
              <span>
                {j.role} <span className="t-dim">@ {j.company} · {j.start} – {j.end}</span>
              </span>
            </div>
          ))}
          <div className="t-gap" />
          {renderJob(experience[0].slug)}
        </div>
      )
    },
  },
  projects: {
    desc: 'things I have built',
    usage: 'projects [name]',
    args: () => projects.map((p) => p.slug),
    run: ([slug]) => {
      if (slug) return renderProject(slug) ?? `projects: no such project '${slug}'`
      return (
        <div className="t-block">
          {projects.map((p) => (
            <div key={p.slug}>{renderProject(p.slug)}</div>
          ))}
          <p className="t-dim">more on the way. watch this space.</p>
        </div>
      )
    },
  },
  skills: {
    desc: 'languages, tools and the rest',
    run: () => (
      <div className="t-block">
        {skills.map((s) => (
          <div key={s.group} className="t-row">
            <span className="t-accent t-label">{s.group}</span>
            <span>{s.items.join(' · ')}</span>
          </div>
        ))}
      </div>
    ),
  },
  education: {
    desc: 'degrees and certificates',
    run: () => (
      <div className="t-block">
        {education.map((e) => (
          <div key={e.school} className="t-sub">
            <div className="t-accent">{e.qualification}</div>
            <div className="t-dim">
              {e.school}, {e.location} · {e.start} – {e.end}
            </div>
          </div>
        ))}
        <div className="t-sub">
          <div className="t-accent">Certifications</div>
          <ul>
            {certifications.map((c) => (
              <li key={c.name}>
                {c.name} <span className="t-dim">· {c.issuer}{c.date ? ` · ${c.date}` : ''}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    ),
  },
  contact: {
    desc: 'get in touch',
    run: () => (
      <div className="t-block">
        <div className="t-row">
          <span className="t-accent t-label">email</span>
          <A href={`mailto:${profile.email}`}>{profile.email}</A>
        </div>
        {profile.socials.map((s) => (
          <div key={s.href} className="t-row">
            <span className="t-accent t-label">{s.label.toLowerCase()}</span>
            <A href={s.href}>{s.href.replace(/^https?:\/\//, '')}</A>
          </div>
        ))}
      </div>
    ),
  },
  resume: {
    desc: 'open my CV',
    run: (_, ctx) => {
      ctx.go('plain', 300)
      return 'opening CV…'
    },
  },
  ls: {
    desc: 'list files',
    usage: 'ls [-a] [dir]',
    args: (ctx) => pathArgs(ctx),
    run: (args, ctx) => {
      const all = args.includes('-a') || args.includes('-la')
      const target = resolve(ctx.cwd, args.find((a) => !a.startsWith('-')))
      if (isDenied(target)) return `ls: ${displayPath(target)}: Permission denied. even kav doesn't go in there.`
      const node = lookup(target)
      if (!node) return `ls: ${args.at(-1)}: No such file or directory`
      if (node.type === 'file') return displayPath(target).split('/').pop()
      const base = displayPath(target)
      return (
        <div className="t-ls">
          {Object.entries(node.children)
            .filter(([n]) => !UNLISTED.has(n) && (all || !n.startsWith('.')))
            .map(([n, c]) => {
              const rel = target === ctx.cwd ? n : `${base}/${n}`
              return c.type === 'dir' ? (
                <Cmd key={n} c={`cd ${rel} && ls`}>
                  <span className="t-dir">{n}/</span>
                </Cmd>
              ) : (
                <Cmd key={n} c={`cat ${rel}`}>
                  {n}
                </Cmd>
              )
            })}
        </div>
      )
    },
  },
  cd: {
    desc: 'change directory',
    usage: 'cd <dir>',
    args: (ctx) => pathArgs(ctx, true),
    run: ([p], ctx) => {
      const target = resolve(ctx.cwd, p)
      if (isDenied(target)) return `cd: ${p}: Permission denied. some doors stay shut.`
      const node = lookup(target)
      if (!node) return `cd: no such file or directory: ${p}`
      if (node.type !== 'dir') return `cd: not a directory: ${p}`
      ctx.setCwd(target)
      return null
    },
  },
  pwd: { desc: 'print working directory', run: (_, ctx) => ctx.cwd },
  cat: {
    desc: 'print a file',
    usage: 'cat <file>',
    args: (ctx) => pathArgs(ctx),
    run: ([p], ctx) => {
      if (!p) return 'usage: cat <file>'
      const abs = resolve(ctx.cwd, p)
      if (abs === '/etc/shadow') return "cat: /etc/shadow: Permission denied. (the hashes are just pictures of my cat anyway. (i lied, i don't even have a cat.))"
      if (isDenied(abs)) return `cat: ${p}: Permission denied.`
      const node = lookup(abs)
      if (!node) return `cat: ${p}: No such file or directory`
      if (node.type === 'dir') return `cat: ${p}: Is a directory`
      return <pre className="t-pre">{node.content}</pre>
    },
  },
  tree: {
    desc: 'show the file tree',
    run: (_, ctx) => {
      const lines: string[] = [displayPath(ctx.cwd)]
      const walk = (abs: string, prefix: string) => {
        const node = lookup(abs)
        if (!node || node.type !== 'dir') return
        const entries = Object.entries(node.children).filter(([n]) => !n.startsWith('.'))
        entries.forEach(([n, c], i) => {
          const last = i === entries.length - 1
          lines.push(`${prefix}${last ? '└── ' : '├── '}${n}${c.type === 'dir' ? '/' : ''}`)
          if (c.type === 'dir') walk(`${abs}/${n}`, prefix + (last ? '    ' : '│   '))
        })
      }
      walk(ctx.cwd, '')
      return <pre className="t-pre">{lines.join('\n')}</pre>
    },
  },
  neofetch: {
    desc: 'system info, but make it me',
    run: () => (
      <div className="t-neofetch">
        <pre className="t-accent t-logo" aria-hidden>
          {LOGO}
        </pre>
        <div>
          <div>
            <span className="t-accent">kav</span>@<span className="t-accent">portfolio</span>
          </div>
          <div className="t-dim">-----------------</div>
          {(
            [
              ['OS', 'KavOS 26.6 (Leicester First)'],
              ['Host', profile.name],
              ['Role', `${profile.title} @ Tanantech`],
              ['Uptime', `${new Date().getFullYear() - 2022} years of writing code for a living (and fun)`],
              ['Shell', 'kavsh 1.0'],
              ['Languages', 'Python, TypeScript, Rust, SQL'],
              ['Packages', `${projects.length} shipped (brew: whosup)`],
              ['Location', profile.location],
              ['Coffee', '100%'],
            ] as const
          ).map(([k, v]) => (
            <div key={k}>
              <span className="t-accent">{k}</span>: {k === 'Coffee' && <span aria-hidden>██████████ </span>}
              {v}
            </div>
          ))}
          <div className="t-swatches" aria-hidden>
            {Array.from({ length: 8 }, (_, i) => (
              <span key={i} style={{ background: `var(--sw${i})` }} />
            ))}
          </div>
        </div>
      </div>
    ),
  },
  theme: {
    desc: 'change colours (theme amber)',
    usage: `theme <${Object.keys(THEMES).join('|')}>`,
    args: () => Object.keys(THEMES),
    run: ([t], ctx) => {
      if (!t)
        return (
          <div>
            current: <span className="t-accent">{ctx.theme}</span> · available:{' '}
            {Object.keys(THEMES).map((n) => (
              <span key={n}>
                <Cmd c={`theme ${n}`} />{' '}
              </span>
            ))}
          </div>
        )
      if (!(t in THEMES)) return `theme: unknown theme '${t}'`
      ctx.setTheme(t as ThemeName)
      return `theme set to ${t}`
    },
  },
  crt: {
    desc: 'toggle CRT effects (crt off)',
    args: () => ['on', 'off'],
    run: ([v], ctx) => {
      const on = v ? v === 'on' : !ctx.crt
      ctx.setCrt(on)
      return `crt effects ${on ? 'on' : 'off'}`
    },
  },
  gui: {
    desc: 'launch the Win95 desktop',
    run: (_, ctx) => {
      if (ctx.embedded) return "gui: you're already in the GUI. (this is a terminal inside the desktop.)"
      ctx.go('desktop', 600)
      return 'starting X server…'
    },
  },
  clear: { desc: 'clear the screen', run: (_, ctx) => (ctx.clear(), null) },
  history: {
    desc: 'previous commands',
    run: (_, ctx) => <pre className="t-pre">{ctx.history.map((h, i) => `${String(i + 1).padStart(4)}  ${h}`).join('\n')}</pre>,
  },
  date: { desc: 'current date', hidden: true, run: () => new Date().toString() },
  fortune: { desc: 'words of wisdom', hidden: true, run: () => fortunes[Math.floor(Math.random() * fortunes.length)] },
  coffee: {
    desc: 'brew coffee',
    hidden: true,
    run: () => (
      <pre className="t-pre" role="img" aria-label="A steaming cup of coffee. Brewed. Back to work.">
        {COFFEE}
      </pre>
    ),
  },
  whosup: {
    desc: 'demo of my agent monitor',
    hidden: true,
    run: () => (
      <pre className="t-pre" role="img" aria-label="Mock whosup screen: three agent sessions, one waiting for you. Install with brew install kav-sw19/tap/whosup.">
        {WHOSUP}
      </pre>
    ),
  },
}

// aliases
const alias: Record<string, string> = { work: 'experience', jobs: 'experience', cv: 'resume', ll: 'ls', dir: 'ls', cls: 'clear', '?': 'help', email: 'contact', bio: 'about' }
for (const [a, target] of Object.entries(alias)) commands[a] = { ...commands[target], hidden: true }

// Hidden commands for the curious. Always hidden from help and tab completion.
for (const [name, cmd] of Object.entries(eggs)) commands[name] = { ...cmd, hidden: true }

commands.man = {
  desc: 'manual',
  hidden: true,
  run: ([page]) => {
    if (!page) return 'What manual page do you want?  try: man kav'
    if (page === 'kav')
      return (
        <pre className="t-pre">{`KAV(1)                     KavOS Manual                     KAV(1)

NAME
     kav - AI solutions engineer

SYNOPSIS
     kav [--coffee] [--deadline] problem

DESCRIPTION
     Turns messy inboxes and manual processes into data pipelines and
     LLM automation that keep running hourly on cron, then measures
     whether it worked.

OPTIONS
     --coffee     required
     --deadline   improves throughput; see BUGS

BUGS
     Forgets to sleep sometimes.

SEE ALSO
     whoami(1), experience(1), sudo hire-me(8)`}</pre>
      )
    const cmd = Object.hasOwn(commands, page) ? commands[page] : undefined
    if (!cmd) return `No manual entry for ${page}`
    if (cmd.hidden) return `No manual entry for ${page}. some things are better discovered.`
    return `${page}: ${cmd.desc}${cmd.usage ? `\nusage: ${cmd.usage}` : ''}`
  },
}
commands.which = {
  desc: 'locate a command',
  hidden: true,
  run: ([c]) => {
    if (!c) return 'usage: which <command>'
    if (c === 'kav') return '/usr/local/bin/kav (stable release, still accepting feature requests)'
    return Object.hasOwn(commands, c) ? `/usr/bin/${c}` : `${c} not found`
  },
}
commands.alias = {
  desc: 'aliases',
  hidden: true,
  run: () => <pre className="t-pre">{Object.entries(alias).map(([a, t]) => `alias ${a}='${t}'`).join('\n')}</pre>,
}

export const HOME_DIR = HOME

const LOGO = [
  ' _               ',
  '| | ____ ___   __',
  "| |/ / _` \\ \\ / /",
  '|   < (_| |\\ V / ',
  '|_|\\_\\__,_| \\_/  ',
].join('\n')

const COFFEE = String.raw`      ( (
       ) )
    ........
    |      |]
    \      /
     \`----'   brewed. back to work.`

const WHOSUP = `whosup ─ 3 sessions · 1 needs you                ↵ jump  / search
  AGENT    PROJECT     STATUS               FOR   IN
● pi       portfolio   ⚠ waiting for you    2m    ghostty:2
● opencode medallion   running Bash         14s   vscode
● codex    whosup      thinking…            41s   tmux:1
  └ scout              done                 1m

$ brew install kav-sw19/tap/whosup`
