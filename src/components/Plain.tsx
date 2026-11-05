import { useEffect, useRef, type ReactNode } from 'react'
import { certifications, education, experience, profile, projects, skills } from '../data/profile'
import Rich from './Rich'
import './plain.css'

/** The plain mode: the CV, typeset like its LaTeX original (Jake's résumé layout, Computer Modern). */
export default function Plain() {
  // Arriving from another mode: start keyboard and screen-reader users at the top of the document.
  const h1 = useRef<HTMLHeadingElement>(null)
  useEffect(() => h1.current?.focus({ preventScroll: true }), [])

  const site = profile.website.replace(/^https?:\/\//, '')
  const github = profile.socials.find((s) => s.label === 'GitHub')!
  const linkedin = profile.socials.find((s) => s.label === 'LinkedIn')!

  return (
    <div className="cv-desk">
      <nav className="cv-bar" aria-label="Site">
        <span className="cv-bar-modes">
          <a href="#terminal">terminal</a>
          <a href="#desktop">desktop</a>
        </span>
        <button type="button" className="cv-bar-print" onClick={() => window.print()}>
          Print / save as PDF
        </button>
      </nav>

      <main className="cv" id="top">
        <header className="cv-head">
          <h1 ref={h1} tabIndex={-1} className="cv-name">
            {profile.name}
          </h1>
          <ul className="cv-contact">
            <Contact icon={<IconMail />} href={`mailto:${profile.email}`} label={profile.email} />
            <Contact icon={<IconLinkedIn />} href={linkedin.href} label={linkedin.href.replace(/^https?:\/\//, '')} />
            <Contact icon={<IconGitHub />} href={github.href} label={github.href.replace(/^https?:\/\//, '')} />
            <Contact icon={<IconGlobe />} href={profile.website} label={site} />
          </ul>
        </header>

        <Section title="Professional Summary">
          <p className="cv-summary">
            <Rich text={profile.summary} as="b" />
          </p>
        </Section>

        <Section title="Work Experience">
          {experience.map((j) => (
            <article key={j.slug} className="cv-entry">
              <Row left={<b>{j.company}</b>} right={<b>{j.start} – {j.end}</b>} />
              <Row className="cv-sub" left={<i>{j.role}</i>} right={<i>{j.location}</i>} />
              {j.highlights.map((h, i) => (
                <div key={i} className="cv-group">
                  {h.title && <p className="cv-group-title">{h.title}</p>}
                  <Bullets items={h.points} />
                </div>
              ))}
            </article>
          ))}
        </Section>

        <Section title="Projects">
          {projects.map((p) => (
            <article key={p.slug} className="cv-entry">
              <Row
                left={
                  <b>
                    {p.links[0] ? (
                      <a href={p.links[0].href} target="_blank" rel="noreferrer">
                        {p.name}
                      </a>
                    ) : (
                      p.name
                    )}
                    {p.links.slice(1).map((l) => (
                      <span key={l.href} className="cv-extra-link">
                        {' '}
                        ·{' '}
                        <a href={l.href} target="_blank" rel="noreferrer">
                          {l.label.toLowerCase()}
                        </a>
                      </span>
                    ))}
                  </b>
                }
                right={<b className="cv-tech">{p.tech.join(' | ')}</b>}
              />
              <Bullets items={p.description} />
            </article>
          ))}
        </Section>

        <Section title="Education">
          {education.map((e) => (
            <article key={e.school} className="cv-entry">
              <Row left={<b>{e.school}</b>} right={<b>{e.start} – {e.end}</b>} />
              <Row className="cv-sub" left={<i>{e.qualification}</i>} right={<i>{e.location}</i>} />
            </article>
          ))}
        </Section>

        <Section title="Technical Skills">
          <dl className="cv-skills">
            {skills.map((s) => (
              <div key={s.group}>
                <dt>{s.group}</dt>
                <dd>{s.items.join(', ')}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section title="Certifications">
          {certifications.map((c) => (
            <article key={c.name} className="cv-entry cv-cert">
              <Row
                left={
                  <b>
                    {c.url ? (
                      <a href={c.url} target="_blank" rel="noreferrer">
                        {c.name}
                      </a>
                    ) : (
                      c.name
                    )}
                  </b>
                }
                right={<b>{c.issuer}</b>}
              />
              <Row className="cv-sub" left={<i>Certification</i>} right={c.date && <i>{c.date}</i>} />
              <Bullets items={[c.detail]} />
            </article>
          ))}
        </Section>
      </main>

      <footer className="cv-foot">
        This page is KavOS in safe mode. The <a href="#terminal">terminal</a> is more fun.{' '}
        <a href={profile.repo} target="_blank" rel="noreferrer">
          Source on GitHub
        </a>
        .
      </footer>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="cv-section" aria-label={title}>
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function Row({ left, right, className = '' }: { left: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <div className={`cv-row ${className}`}>
      <span className="cv-row-l">{left}</span>
      {right && <span className="cv-row-r">{right}</span>}
    </div>
  )
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="cv-bullets">
      {items.map((t, i) => (
        <li key={i}>
          <Rich text={t} as="b" />
        </li>
      ))}
    </ul>
  )
}

function Contact({ icon, href, label }: { icon: ReactNode; href: string; label: string }) {
  return (
    <li>
      {icon}
      <a href={href} target={href.startsWith('mailto:') ? undefined : '_blank'} rel="noreferrer">
        {label}
      </a>
    </li>
  )
}

/* Icons (Bootstrap Icons, MIT), sized to the text like the LaTeX fontawesome glyphs. */
const svg = { viewBox: '0 0 16 16', width: '0.95em', height: '0.95em', fill: 'currentColor', 'aria-hidden': true } as const
const IconMail = () => (
  <svg {...svg}>
    <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.586L16 11.801V4.697z" />
  </svg>
)
const IconLinkedIn = () => (
  <svg {...svg}>
    <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z" />
  </svg>
)
const IconGitHub = () => (
  <svg {...svg}>
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
  </svg>
)
const IconGlobe = () => (
  <svg {...svg}>
    <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.5-6.923c-.67.204-1.335.82-1.887 1.855A8 8 0 0 0 5.145 4H7.5zM4.09 4a9.3 9.3 0 0 1 .64-1.539 7 7 0 0 1 .597-.933A7.03 7.03 0 0 0 2.255 4zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a7 7 0 0 0-.656 2.5zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5zM8.5 5v2.5h2.99a12.5 12.5 0 0 0-.337-2.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5zM5.145 12q.208.58.468 1.068c.552 1.035 1.218 1.65 1.887 1.855V12zm.182 2.472a7 7 0 0 1-.597-.933A9.3 9.3 0 0 1 4.09 12H2.255a7 7 0 0 0 3.072 2.472M3.82 11a13.7 13.7 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5zm6.853 3.472A7 7 0 0 0 13.745 12H11.91a9.3 9.3 0 0 1-.64 1.539 7 7 0 0 1-.597.933M8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855q.26-.487.468-1.068zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.7 13.7 0 0 1-.312 2.5m2.802-3.5a7 7 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7 7 0 0 0-3.072-2.472c.218.284.418.598.597.933M10.855 4a8 8 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4z" />
  </svg>
)
