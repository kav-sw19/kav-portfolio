import { certifications, education, experience, profile, projects, skills } from '../data/profile'

export type FsFile = { type: 'file'; content: string }
export type FsDir = { type: 'dir'; children: Record<string, FsNode> }
export type FsNode = FsFile | FsDir

export const HOME = '/home/kav'

const file = (content: string): FsFile => ({ type: 'file', content })
const dir = (children: Record<string, FsNode>): FsDir => ({ type: 'dir', children })

function jobMd(slug: string) {
  const j = experience.find((e) => e.slug === slug)!
  const lines = [`# ${j.role} @ ${j.company}`, `${j.start} – ${j.end} · ${j.location}`, '']
  if (j.summary) lines.push(j.summary, '')
  for (const h of j.highlights) {
    if (h.title) lines.push(`## ${h.title}`)
    for (const p of h.points) lines.push(`- ${p}`)
    lines.push('')
  }
  if (j.tech?.length) lines.push(`stack: ${j.tech.join(', ')}`)
  return lines.join('\n').trimEnd()
}

function projectMd(slug: string) {
  const p = projects.find((x) => x.slug === slug)!
  return [
    `# ${p.name}`,
    p.tagline,
    '',
    ...p.description,
    '',
    `stack: ${p.tech.join(', ')}`,
    ...(p.install ? [`install: ${p.install}`] : []),
    ...p.links.map((l) => `${l.label.toLowerCase()}: ${l.href}`),
  ].join('\n')
}

export const root: FsDir = dir({
  home: dir({
    kav: dir({
      'about.md': file([`# ${profile.name}`, profile.title, '', ...profile.bio].join('\n')),
      'contact.txt': file(
        [`email:    ${profile.email}`, ...profile.socials.map((s) => `${(s.label.toLowerCase() + ':').padEnd(9)} ${s.href}`)].join('\n'),
      ),
      'skills.txt': file(skills.map((s) => `${s.group.padEnd(12)} ${s.items.join(', ')}`).join('\n')),
      'education.txt': file(
        [
          ...education.map((e) => `${e.qualification}\n  ${e.school}, ${e.location} (${e.start} – ${e.end})`),
          '',
          'certifications:',
          ...certifications.map((c) => `  - ${c.name} · ${c.issuer}${c.date ? ` · ${c.date}` : ''}`),
        ].join('\n'),
      ),
      experience: dir(Object.fromEntries(experience.map((j) => [`${j.slug}.md`, file(jobMd(j.slug))]))),
      projects: dir(Object.fromEntries(projects.map((p) => [`${p.slug}.md`, file(projectMd(p.slug))]))),
      '.since-you-curious': file(
        [
          '# since you\'re curious: every hidden command in kavsh.',
          '# none of them do anything real. go wild.',
          '',
          'breaking things   rm -rf /   sudo rm -rf /   :(){ :|:& };:   dd   mkfs   format c:',
          '                  shutdown   poweroff   halt   kill -9 1   killall   pkill',
          'secrets           cat /etc/passwd   cat /etc/shadow   cat ~/.env   cat ~/.ssh/id_rsa',
          '                  cat ~/.ssh/id_rsa | base64 -d   base64 [-d]   ls /root   cd /root',
          '                  env   printenv   export   set   echo $OPENAI_API_KEY',
          'privilege         sudo hire-me   sudo su   sudo !!   sudo make me a sandwich   su   passwd',
          '                  chmod   chown   id',
          'recon             uname -a   uptime   ps aux   top   htop   w   nmap   netstat   ifconfig   ip a',
          '                  ping   traceroute   curl   wget   whois kav   finger   crontab -l   systemctl',
          'web attacks       <script>alert(1)</script>   \' OR 1=1 --   DROP TABLE   $(whoami)   curl x | sh',
          '                  cat /dev/urandom',
          'dev habits        git status|log|push --force|blame|commit|pull|clone|stash   npm install',
          '                  pip install   brew install whosup   docker   kubectl get pods   python   python3   node',
          '                  make   make me a sandwich   man kav   which kav   alias',
          'editors           vim   vi   nvim   emacs   nano   code   :q   :wq   :q!',
          'classics          sl   cowsay <text>   yes   fortune   coffee   whosup   42   hack the planet',
          '                  hackerman   msfconsole   exploit   ssh   date',
          'manners           hello   hi   please   thanks   exit   logout',
          'meta              source   git clone',
        ].join('\n'),
      ),
      '.bash_history': file('git push --force\n# oops\ngit reflog\n# phew\nsudo make me a sandwich\nsl\n# not again'),
      '.env': file(
        [
          '# production secrets. obviously.',
          'OPENAI_API_KEY=sk-nice-try-0000000000000000',
          'AWS_SECRET_ACCESS_KEY=hunter2',
          'DATABASE_URL=postgres://kav:password123@localhost/hopes_and_dreams',
          'COFFEE_LEVEL=critical',
          'SECRET_SAUCE=hard_work',
          'HIRE_ME=true',
        ].join('\n'),
      ),
      '.ssh': dir({
        id_rsa: file(
          [
            '-----BEGIN OPENSSH PRIVATE KEY-----',
            'bmljZSB0cnkuIHRoaXMga2V5IG9wZW5zIGV4YWN0bHkgb25lIGRvb3I6IG1haWx0bzprYXYuc3cxOUBnbWFpbC5jb20=',
            '-----END OPENSSH PRIVATE KEY-----',
            '',
            '(go on, base64 -d it)',
          ].join('\n'),
        ),
        'id_rsa.pub': file('ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHireMeHireMeHireMeHireMeHireMeHireMe kav@portfolio'),
        known_hosts: file('github.com ssh-ed25519 AAAA...\ncoffee-machine.local ssh-rsa AAAA... # most trusted host'),
      }),
    }),
  }),
  etc: dir({
    motd: file('Welcome to KavOS. Type `help` to get started.'),
    passwd: file(
      [
        'root:x:0:0:root:/root:/usr/sbin/nologin',
        'kav:x:1000:1000:Kavindu Walisinghe,,,:/home/kav:/bin/kavsh',
        'guest:x:1001:1001:You (hello!):/home/guest:/bin/kavsh',
        'recruiter:x:1002:1002:Always Welcome:/home/recruiter:/usr/bin/sudo-hire-me',
        'coffee:x:42:42:Coffee Daemon:/var/run/coffee:/bin/brew',
        'nobody:x:65534:65534:nobody:/nonexistent:/bin/false',
      ].join('\n'),
    ),
    shadow: file(''),
    hosts: file('127.0.0.1   localhost      # there\'s no place like it\n10.0.0.42   coffee-machine\n0.0.0.0     distractions   # blocked'),
    hostname: file('portfolio'),
  }),
  root: dir({ 'secrets.txt': file('') }),
  tmp: dir({}),
})

/** Entries that exist (cat/cd still reach them) but never show in a listing, even with ls -a. */
export const UNLISTED = new Set(['.ssh'])

/** Paths that exist (so probing finds them) but are locked. */
const DENIED = ['/root', '/etc/shadow']
export const isDenied = (abs: string) => DENIED.some((d) => abs === d || abs.startsWith(d + '/'))

export function resolve(cwd: string, path: string | undefined): string {
  if (!path || path === '~') return HOME
  let p = path.startsWith('~') ? HOME + path.slice(1) : path
  if (!p.startsWith('/')) p = `${cwd}/${p}`
  const out: string[] = []
  for (const part of p.split('/')) {
    if (!part || part === '.') continue
    if (part === '..') out.pop()
    else out.push(part)
  }
  return '/' + out.join('/')
}

export function lookup(abs: string): FsNode | null {
  let node: FsNode = root
  for (const part of abs.split('/').filter(Boolean)) {
    if (node.type !== 'dir') return null
    const next: FsNode | undefined = Object.hasOwn(node.children, part) ? node.children[part] : undefined
    if (!next) return null
    node = next
  }
  return node
}

export function displayPath(abs: string) {
  return abs === HOME ? '~' : abs.startsWith(HOME + '/') ? '~' + abs.slice(HOME.length) : abs
}
