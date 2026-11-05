import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import * as guestbook from './api/guestbook.ts'
import { certifications, education, experience, highlights, profile, projects, skills } from './src/data/profile.ts'

/** llms.txt (https://llmstxt.org) and robots.txt, generated from the same profile data as the site. */
function siteTextFiles(): Plugin {
  const llms = () =>
    [
      `# ${profile.name}`,
      '',
      `> ${profile.title}. ${profile.tagline}`,
      '',
      ...profile.bio.flatMap((b) => [b, '']),
      '## Highlights',
      '',
      ...highlights.map((h) => `- ${h.value}: ${h.label}`),
      '',
      '## Experience',
      '',
      ...experience.flatMap((j) => [
        `### ${j.role}, ${j.company} (${j.start} – ${j.end})`,
        '',
        ...(j.summary ? [j.summary, ''] : []),
        ...j.highlights.flatMap((h) => [...(h.title ? [`**${h.title}**`, ''] : []), ...h.points.map((p) => `- ${p}`), '']),
      ]),
      '## Projects',
      '',
      ...projects.flatMap((p) => [`- [${p.name}](${p.links[0]?.href}): ${p.tagline.replace(/`/g, '')}${p.links.slice(1).map((l) => ` ([${l.label.toLowerCase()}](${l.href}))`).join('')}`]),
      '',
      `Site source: ${profile.repo}`,
      '',
      '## Skills',
      '',
      ...skills.map((s) => `- ${s.group}: ${s.items.join(', ')}`),
      '',
      '## Education',
      '',
      ...education.map((e) => `- ${e.qualification}, ${e.school} (${e.start} – ${e.end})`),
      '',
      '## Certifications',
      '',
      ...certifications.map((c) => `- ${c.url ? `[${c.name}](${c.url})` : c.name}, ${c.issuer}${c.date ? ` (${c.date})` : ''}`),
      '',
      '## Contact',
      '',
      `- [Email](mailto:${profile.email})`,
      ...profile.socials.map((s) => `- [${s.label}](${s.href})`),
      '',
    ].join('\n')

  const robots = () => 'User-agent: *\nAllow: /\n'
  const files: Record<string, () => string> = { '/llms.txt': llms, '/robots.txt': robots }

  return {
    name: 'site-text-files',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const make = req.url && files[req.url.split('?')[0]]
        if (!make) return next()
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.end(make())
      })
    },
    generateBundle() {
      for (const [path, make] of Object.entries(files)) this.emitFile({ type: 'asset', fileName: path.slice(1), source: make() })
    },
  }
}

/** Dev only: serve /api/guestbook with the real handler (in-memory store, admin token `dev-admin`). Vercel serves it in production. */
function devApi(): Plugin {
  return {
    name: 'dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/guestbook')) return next()
        const chunks: Buffer[] = []
        for await (const c of req) chunks.push(c as Buffer)
        const headers = new Headers()
        for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') headers.set(k, v)
        const request = new Request(`http://localhost${req.url}`, {
          method: req.method,
          headers,
          body: req.method === 'GET' || req.method === 'HEAD' ? undefined : Buffer.concat(chunks),
        })
        const handler = req.method === 'POST' ? guestbook.POST : guestbook.GET
        const response = await handler(request)
        res.statusCode = response.status
        response.headers.forEach((v, k) => res.setHeader(k, v))
        res.end(await response.text())
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), siteTextFiles(), devApi()],
})
