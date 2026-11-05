// Hidden commands: what people who know their way around a shell try first.
// None of these appear in `help` or tab completion, and none of them touch anything real.
import type { ReactNode } from 'react'
import { profile } from '../data/profile'
import type { Command } from './commands'

const Pre = ({ children, label }: { children: string; label?: string }) =>
  label ? (
    <pre className="t-pre" role="img" aria-label={label}>
      {children}
    </pre>
  ) : (
    <pre className="t-pre">{children}</pre>
  )

const Dim = ({ children }: { children: ReactNode }) => <span className="t-dim">{children}</span>
const Mail = ({ children }: { children: ReactNode }) => <a href={`mailto:${profile.email}`}>{children}</a>

export const ENV: Record<string, string> = {
  USER: 'guest',
  HOME: '/home/kav',
  SHELL: '/bin/kavsh',
  PATH: '/usr/local/bin:/usr/bin:/bin:/opt/coffee/bin',
  EDITOR: 'vim  # we have all been there',
  TERM: 'xterm-256color (with feelings)',
  LANG: 'en_GB.UTF-8',
  COFFEE_LEVEL: 'critical',
  OPENAI_API_KEY: 'sk-nice-try-0000000000000000',
  AWS_SECRET_ACCESS_KEY: '********  (it was hunter2)',
  HIRE_ME: 'true',
}

const PS = `USER    PID  %CPU %MEM  COMMAND
kav       1   0.4  2.0  /sbin/kav-brain --overclocked
kav      42  97.3  0.4  coffee-daemon --refill=always
kav     101  12.0  8.1  medallion --layer=gold
kav     404   0.0  0.0  [motivation] <defunct>   (mondays only)
kav    1337   3.2  1.1  whosup --watch
kav    2002   0.1  0.1  imposter-syndrome --quiet   (ignored)
guest  4242   0.0  0.1  you --snooping`

const NMAP = `Starting Nmap 7.95 ( https://nmap.org )
Nmap scan report for portfolio (127.0.0.1)
PORT      STATE     SERVICE
22/tcp    filtered  ssh            (nope)
80/tcp    open      http           (redirects to 443, like a responsible adult)
443/tcp   open      https          (you are here)
3000/tcp  open      dev-server     (left running by an agent; see \`whosup\`)
5432/tcp  closed    postgresql     (there is no database. it's a static site)
8080/tcp  open      coffee-machine (HTCPCP/1.0, 418 I'm a teapot)

Nmap done: 1 IP address (1 host up, 0 vulnerabilities found, 1 developer looking for work)`

const IFCONFIG = `lo0: flags=8049<UP,LOOPBACK,RUNNING>  mtu 16384
        inet 127.0.0.1  netmask 0xff000000      # there's no place like it
en0: flags=8863<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 10.0.0.42  netmask 255.255.255.0
        ether de:ad:be:ef:ca:fe
coffee0: flags=8843<UP,RUNNING,CAFFEINATED>  mtu 9000
        status: brewing`

const SL = String.raw`      ====        ________                ___________
  _D _|  |_______/        \__I_I_____===__|_________|
   |(_)---  |   H\________/ |   |        =|___ ___|
   /     |  |   H  |  |     |   |         ||_| |_||
  |      |  |   H  |__--------------------| [___] |
  | ________|___H__/__|_____/[][]~\_______|       |
  |/ |   |-----------I_____I [][] []  D   |=======|__
__/ =| o |=-~~\  /~~\  /~~\  /~~\ ____Y___________|__
 |/-=|___|=    ||    ||    ||    |_____/~\___/
  \_/      \O=====O=====O=====O_/      \_/`

function cow(text: string) {
  const t = text.trim() || 'moo. hire kav.'
  const line = '_'.repeat(t.length + 2)
  const dash = '-'.repeat(t.length + 2)
  return ` ${line}\n< ${t} >\n ${dash}\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||`
}

const rmRf = (
  <div>
    <Pre>{`removing /home/kav/experience ......... done
removing /home/kav/projects ........... done
removing /home/kav/sense-of-humour .... permission denied
removing / ............................ `}</Pre>
    <div>
      rm: cannot remove '/': it's a static site. it lives on Vercel's computers, not yours. <Dim>nothing was harmed. try `ls`.</Dim>
    </div>
  </div>
)

const hackOutput = (
  <div>
    <Pre>{`[*] initialising cyberdeck .............. ok
[*] bypassing mainframe firewall ........ ok
[*] reversing the polarity ............... ok
[*] enhancing ............................ enhancing
[*] escalating privileges ................ ok
[+] ACCESS GRANTED`}</Pre>
    <div>
      you now have read access to a public CV. you could have typed <span className="t-accent">resume</span>.
    </div>
  </div>
)

const repl = (name: string, banner: string) => ({
  desc: name,
  hidden: true,
  run: () => (
    <Pre>{`${banner}
>>> import antigravity
>>> exit()
${name}: REPLs are disabled here. the only thing being evaluated is the candidate.`}</Pre>
  ),
})

const editor = (msg: string) => ({ desc: 'editor', hidden: true, run: () => msg })

export const eggs: Record<string, Command> = {
  // --- destruction -------------------------------------------------------------
  rm: {
    desc: 'remove files',
    hidden: true,
    run: (a) =>
      a.some((x) => /^-[a-z]*r[a-z]*f|^-[a-z]*f[a-z]*r/i.test(x)) && a.some((x) => ['/', '/*', '*', '~', '.', '--no-preserve-root'].includes(x))
        ? rmRf
        : `rm: cannot remove '${a.filter((x) => !x.startsWith('-'))[0] ?? ''}': this portfolio is read-only. (like whosup.)`,
  },
  dd: { desc: 'dd', hidden: true, run: () => 'dd: /dev/sda: no such device. your bravery has been noted.' },
  mkfs: { desc: 'mkfs', hidden: true, run: () => "mkfs: refusing to format a portfolio. it's the only one I've got." },
  format: { desc: 'format', hidden: true, run: () => "format c: is a Windows thing. try `gui`: there's a Win95 machine in there with nothing to lose." },
  shutdown: {
    desc: 'shutdown',
    hidden: true,
    run: (_, ctx) => {
      ctx.go('reboot', 1800)
      return (
        <Pre>{`Broadcast message from kav@portfolio (pts/0):

The system is going down for reboot NOW!
(it'll be back in a second. it always comes back.)`}</Pre>
      )
    },
  },
  kill: { desc: 'kill', hidden: true, run: (a) => `kill: (${a.find((x) => /^\d+$/.test(x)) ?? '1'}) - Operation not permitted. kav is unkillable before the second coffee.` },
  killall: { desc: 'killall', hidden: true, run: () => 'killall: no process found matching "the vibe".' },

  // --- privilege ---------------------------------------------------------------
  sudo: {
    desc: 'try it',
    hidden: true,
    args: () => ['hire-me'],
    run: (args) => {
      const a = args.join(' ')
      if (a === 'hire-me' || a === 'hire me')
        return (
          <div className="t-block">
            <div className="t-accent">[sudo] password for recruiter: ********</div>
            <div>✔ permission granted. excellent decision.</div>
            <div>
              → <Mail>{profile.email}</Mail>
            </div>
          </div>
        )
      if (/^rm\b/.test(a)) return rmRf
      if (a === 'make me a sandwich') return 'Okay. 🥪'
      if (a === '!!') return "sudo: !!: you're not getting root with history expansion either."
      if (/^(su|-i|-s|bash|sh|zsh)\b/.test(a)) return 'guest is not in the sudoers file. This incident will be reported. (to my mum.)'
      return `${profile.handle} is not in the sudoers file. This incident will be reported. (try: sudo hire-me)`
    },
  },
  su: { desc: 'su', hidden: true, run: () => "su: Authentication failure. hint: it's not 'password'. it's also not 'hunter2'." },
  passwd: {
    desc: 'passwd',
    hidden: true,
    run: () => <Pre>{'Changing password for guest.\nCurrent password: ********\npasswd: guests cannot have nice things.'}</Pre>,
  },
  chmod: { desc: 'chmod', hidden: true, run: () => 'chmod: changing permissions of the internet: Operation not permitted' },
  chown: { desc: 'chown', hidden: true, run: () => "chown: you can't own this. but you can hire it: sudo hire-me" },
  id: { desc: 'id', hidden: true, run: () => 'uid=1001(guest) gid=1001(recruiters) groups=1001(recruiters),42(coffee),418(teapots)' },

  // --- recon -------------------------------------------------------------------
  uname: { desc: 'uname', hidden: true, run: () => 'KavOS 26.6.0-kav #1 SMP PREEMPT_CAFFEINE x86_64 GNU/Not-Actually-Linux' },
  uptime: { desc: 'uptime', hidden: true, run: () => `${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}  up since this morning's coffee,  1 user,  load averages: 0.42 0.69 1.337` },
  ps: { desc: 'ps', hidden: true, run: () => <Pre>{PS}</Pre> },
  top: { desc: 'top', hidden: true, run: () => <Pre>{`Processes: 7 total, 1 caffeinated, 1 zombie (motivation)\n\n${PS}\n\n(press q to quit. or don't, nothing here is listening.)`}</Pre> },
  w: { desc: 'w', hidden: true, run: () => <Pre>{'USER    TTY     FROM             WHAT\nkav     pts/0   coffee-machine   shipping something\nguest   pts/1   your browser     snooping (hi!)'}</Pre> },
  nmap: { desc: 'nmap', hidden: true, run: () => <Pre>{NMAP}</Pre> },
  netstat: { desc: 'netstat', hidden: true, run: () => <Pre>{NMAP.split('\n').slice(2, 9).join('\n')}</Pre> },
  ifconfig: { desc: 'ifconfig', hidden: true, run: () => <Pre>{IFCONFIG}</Pre> },
  ip: { desc: 'ip', hidden: true, run: () => <Pre>{IFCONFIG}</Pre> },
  ping: {
    desc: 'ping',
    hidden: true,
    run: (a) => {
      const host = a.find((x) => !x.startsWith('-')) ?? 'kav'
      return (
        <Pre>{`PING ${host}: 56 data bytes
64 bytes from ${host}: icmp_seq=0 ttl=64 time=0.42 ms
64 bytes from ${host}: icmp_seq=1 ttl=64 time=0.69 ms
64 bytes from ${host}: icmp_seq=2 ttl=64 time=13.37 ms  (was making coffee)
--- ${host} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss. pong.`}</Pre>
      )
    },
  },
  traceroute: { desc: 'traceroute', hidden: true, run: () => <Pre>{' 1  your-browser  0.1 ms\n 2  vercel-edge   4.2 ms\n 3  this-cv       0.0 ms  (you have arrived)'}</Pre> },
  curl: { desc: 'curl', hidden: true, run: () => "curl: (6) this terminal can't reach the internet. it's 100% client-side: no server, nothing to SSRF." },
  wget: { desc: 'wget', hidden: true, run: () => 'wget: unable to resolve host. try `resume` instead, it opens something useful.' },
  whois: {
    desc: 'whois',
    hidden: true,
    run: () => (
      <Pre>{`Domain:      kav
Registrant:  ${profile.name}
Role:        ${profile.title}
Status:      clientTransferProhibited, openToGoodConversations
Contact:     ${profile.email}`}</Pre>
    ),
  },
  finger: { desc: 'finger', hidden: true, run: () => `Login: kav    Name: ${profile.name}\nPlan: build useful things, measure them, repeat.` },
  crontab: { desc: 'crontab', hidden: true, run: () => <Pre>{'@hourly      medallion       # ingest, classify and extract new mail\n@hourly      case-updates    # apply new responses to the CRM\n0 7 * * *    make-coffee\n0 9 * * 1-5  ship-something\n0 17 * * 5   write-tests-for-the-thing-shipped-on-monday\n0 23 * * *   go-to-bed   # has never run successfully'}</Pre> },
  systemctl: {
    desc: 'systemctl',
    hidden: true,
    run: () => (
      <Pre>{`● kav.service - ${profile.name}, ${profile.title}
     Loaded: loaded (/etc/systemd/system/kav.service; enabled)
     Active: active (running) since this morning's coffee
   Main PID: 1 (kav-brain)
      Tasks: too many
     Memory: mostly song lyrics`}</Pre>
    ),
  },
  env: { desc: 'env', hidden: true, run: () => <Pre>{Object.entries(ENV).map(([k, v]) => `${k}=${v}`).join('\n')}</Pre> },
  echo: {
    desc: 'print text',
    hidden: true,
    run: (a) => a.join(' ').replace(/\$\{?([A-Z_]+)\}?/g, (_, k: string) => ENV[k] ?? ''),
  },

  // --- developer habits ----------------------------------------------------------
  git: {
    desc: 'git',
    hidden: true,
    run: ([sub, ...rest]) => {
      const flags = rest.join(' ')
      switch (sub) {
        case 'status':
          return <Pre>{"On branch main\nYour career is ahead of 'origin/expectations' by 3 commits.\n\nnothing to commit, working tree clean (unlike my desk)"}</Pre>
        case 'log':
          return (
            <Pre>{`commit 0c40ec1 (HEAD -> main)
    feat: medallion + case updates now run hourly on cron

commit 16409c1
    feat: automated 14,080 case moves at go-live

commit 54k0e11
    feat: medallion pipeline, 18x faster than the old one

commit 1st0c1a
    feat: graduated, First Class

commit 0000001
    initial commit (hello world)`}</Pre>
          )
        case 'push':
          return flags.includes('--force') || flags.includes('-f')
            ? "remote: rejected. nobody force-pushes to main. (it's in .bash_history. I learned.)"
            : 'Everything up-to-date. including me.'
        case 'blame':
          return `every line: ${profile.name}. full responsibility taken.`
        case 'commit':
          return '[main 7e57ed1] wip\n 1 file changed, 1 insertion(+), 0 tests :('
        case 'pull':
          return 'Already up to date.'
        case 'clone':
          return (
            <span>
              Cloning into 'kav-portfolio'... done. it's real, by the way:{' '}
              <a href={profile.repo} target="_blank" rel="noreferrer">
                {profile.repo.replace('https://', '')}
              </a>
            </span>
          )
        case 'stash':
          return 'Saved working directory and index state: "will deal with it later" (narrator: he did not)'
        default:
          return 'git: try `git status`, `git log` or `git blame`.'
      }
    },
  },
  npm: {
    desc: 'npm',
    hidden: true,
    run: () => <Pre>{'added 1,482 packages, and audited 1,483 packages in 42s\n\n1,337 vulnerabilities (all of them in left-pad)\n\nrun `npm fund` to fund my coffee'}</Pre>,
  },
  pip: { desc: 'pip', hidden: true, run: (a) => `Successfully installed ${a.filter((x) => x !== 'install' && !x.startsWith('-'))[0] ?? 'kav'}-1.0 (requires: coffee>=3.0)` },
  brew: {
    desc: 'brew',
    hidden: true,
    run: (a) =>
      a.some((x) => x.includes('whosup')) ? (
        <span>
          good taste. run this in your real terminal: <span className="t-accent">brew install kav-sw19/tap/whosup</span>
        </span>
      ) : (
        "brew: this isn't your real terminal. but whosup is a real brew: brew install kav-sw19/tap/whosup"
      ),
  },
  docker: { desc: 'docker', hidden: true, run: () => 'docker: this portfolio is already containerised. the container is your browser tab.' },
  kubectl: { desc: 'kubectl', hidden: true, run: () => <Pre>{'NAME    READY   STATUS                RESTARTS\nkav-0   1/1     Running (on coffee)   0'}</Pre> },
  python: repl('python', 'Python 3.12.0 (kavsh edition)'),
  python3: repl('python3', 'Python 3.12.0 (kavsh edition)'),
  node: repl('node', 'Welcome to Node.js v24 (kavsh edition).'),
  make: {
    desc: 'make',
    hidden: true,
    run: (a) => (a.join(' ') === 'me a sandwich' ? 'What? Make it yourself.' : `make: *** No rule to make target '${a.join(' ') || 'sense'}'. Stop.`),
  },
  vim: editor("you're in vim now. just kidding. but if you were, you'd need :q"),
  vi: editor("vi: even braver than vim. respect. type :q to pretend to leave."),
  nvim: editor('nvim: ah, a person of culture. still not a real editor in here though. :q'),
  emacs: editor('emacs: a great operating system, lacking only a decent editor.'),
  nano: editor("nano: the sensible choice. sadly this is a portfolio, not an editor."),
  code: editor("code: opening VS Code… in a terminal… inside a browser. let's not."),
  ':q': editor('congratulations, you have escaped vim. most people never do.'),
  ':wq': editor('written and quit. nothing was written. you are free.'),
  ':q!': editor('quit without saving. honestly, same.'),

  // --- classics ------------------------------------------------------------------
  sl: {
    desc: 'steam locomotive',
    hidden: true,
    run: () => (
      <div>
        <pre className="t-pre t-sl" role="img" aria-label="A steam train goes by. You probably meant ls.">
          {SL}
        </pre>
        <span className="t-dim">you meant `ls`. the train has left the station.</span>
      </div>
    ),
  },
  cowsay: { desc: 'cowsay', hidden: true, run: (a) => <Pre label={`A cow says: ${a.join(' ') || 'moo. hire kav.'}`}>{cow(a.join(' '))}</Pre> },
  yes: { desc: 'yes', hidden: true, run: (a) => <Pre>{`${Array(12).fill(a.join(' ') || 'y').join('\n')}\n^C  (stopped early to save your scroll wheel)`}</Pre> },
  base64: {
    desc: 'base64',
    hidden: true,
    run: (a) => {
      const decode = a.includes('-d') || a.includes('--decode')
      const text = a.filter((x) => !x.startsWith('-')).join(' ')
      if (!text) return 'usage: base64 [-d] <text>   (pipes are for plumbers)'
      try {
        return decode ? atob(text) : btoa(text)
      } catch {
        return 'base64: invalid input. much like my sleep schedule.'
      }
    },
  },
  source: {
    desc: 'source',
    hidden: true,
    run: () => (
      <span>
        view source:{' '}
        <a href={profile.repo} target="_blank" rel="noreferrer">
          {profile.repo.replace('https://', '')}
        </a>{' '}
        <Dim>(yes, the hidden commands are in there. no peeking.)</Dim>
      </span>
    ),
  },
  '42': { desc: '42', hidden: true, run: () => 'the answer. now, what was the question?' },
  hack: { desc: 'hack', hidden: true, run: () => hackOutput },
  hackerman: { desc: 'hack', hidden: true, run: () => hackOutput },
  msfconsole: { desc: 'hack', hidden: true, run: () => hackOutput },
  exploit: { desc: 'hack', hidden: true, run: () => hackOutput },
  ssh: { desc: 'connect', hidden: true, run: () => <span>ssh: connection established. say hi → <Mail>{profile.email}</Mail></span> },
  hello: { desc: 'hi', hidden: true, run: () => 'hello! type help to look around.' },
  hi: { desc: 'hi', hidden: true, run: () => 'hi! type help to look around.' },
  please: { desc: 'please', hidden: true, run: () => 'since you asked nicely: politeness logged to /var/log/nice-people.log' },
  thanks: { desc: 'thanks', hidden: true, run: () => "you're welcome. thanks for stopping by." },
  exit: { desc: 'leave', hidden: true, run: (_, ctx) => (ctx.go('reboot', 400), 'logout') },
  logout: { desc: 'leave', hidden: true, run: (_, ctx) => (ctx.go('reboot', 400), 'logout') },
}
for (const k of ['printenv', 'export', 'set']) eggs[k] = { ...eggs.env }
eggs.htop = { ...eggs.top }
eggs.pkill = { ...eggs.killall }
eggs.poweroff = { ...eggs.shutdown }
eggs.halt = { ...eggs.shutdown }

/** Whole-line patterns that never reach normal parsing: injection attempts and shell tricks. */
export function rawEgg(line: string): ReactNode | null {
  if (/:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:/.test(line))
    return 'kavsh: fork: Resource temporarily unavailable. just kidding: kavsh forks for no one. the only thing multiplying here is the coffee.'
  if (/<\s*script|javascript:|on(error|load)\s*=|<\s*img|<\s*svg/i.test(line))
    return "nice try. React escaped that before it reached the DOM. the only thing executing here is my career plan."
  if (/('|")\s*or\s*('|")?\d+('|")?\s*=\s*('|")?\d+|drop\s+table|union\s+select|;\s*--/i.test(line))
    return "there's no database to inject into. it's a static site. Robert'); DROP TABLE Students;-- is that you? (xkcd 327)"
  if (/\$\(|`/.test(line)) return 'command substitution is disabled. your subshell has been reported to HR.'
  if (/^\s*(cat|less|more|head|tail)\s+\/dev\/(u?random|zero)/.test(line)) return "that's my brain before the first coffee. I hit ctrl+c for you."
  if (/\|\s*(sh|bash|zsh)\b/.test(line)) return 'piping to sh? on a stranger\'s machine? I like you. still no.'
  if (/id_rsa\s*\|\s*base64\s+(-d|--decode)/.test(line))
    return 'nice try. this key opens exactly one door: mailto:kav.sw19@gmail.com'
  return null
}
