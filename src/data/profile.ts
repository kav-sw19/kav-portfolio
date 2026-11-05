// Single source of truth for the whole site.
// Terminal, desktop and plain view all read from here.

export type Link = { label: string; href: string }

export type Project = {
  slug: string
  name: string
  tagline: string
  description: string[]
  tech: string[]
  links: Link[]
  install?: string
}

export type Job = {
  slug: string
  company: string
  role: string
  location: string
  start: string
  end: string
  summary?: string
  highlights: { title?: string; points: string[] }[]
  tech?: string[]
}

export type Education = {
  school: string
  qualification: string
  location: string
  start: string
  end: string
}

export const profile = {
  name: 'Kavindu Walisinghe',
  handle: 'kav',
  title: 'AI Solutions Engineer',
  tagline: 'I build AI systems that move real work: data pipelines, LLM automation and developer tools.',
  location: 'Shropshire, UK',
  bio: [
    'AI Solutions Engineer at Tanantech, where I turn messy inboxes and manual case-handling into data pipelines and LLM automation that run every day.',
    'First Class Computer Science graduate from the University of Leicester. Before Tanantech I trained and evaluated large language models at Outlier, which is where I learned how they fail and how to test for it.',
    'Outside work I build developer tools, mostly in Rust and TypeScript, for the coding agents I use all day.',
  ],
  /** CV-style summary. **double asterisks** mark bold phrases (rendered bold on the CV, accent in the terminal). */
  summary:
    'AI Solutions Engineer with a First Class Computer Science degree, building **LLM automation, data pipelines and agentic tooling** that run in production. Designed a **medallion email and document lakehouse** that classifies and extracts tens of thousands of emails with **System One models** (structured decisions with probability scores, not free text), and the automation that turned those extractions into **16,409 records updated and 14,080 automated case moves** at go-live, verified against the live CRM. Background in **LLM evaluation and prompt engineering** from training models at Outlier, and a habit of measuring before claiming. Builds developer tools in **Rust and TypeScript** in spare time.',
  website: 'https://kav-portfolio-chi.vercel.app',
  repo: 'https://github.com/kav-sw19/kav-portfolio',
  email: 'kav.sw19@gmail.com',
  socials: [
    { label: 'GitHub', href: 'https://github.com/kav-sw19' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/kav.sw19' },
  ] as Link[],
  resume: null as string | null, // e.g. '/kavindu-walisinghe-cv.pdf' once added to /public
}

/** Headline numbers, shown on the plain page and by `stats` in the terminal. */
export const highlights: { value: string; label: string }[] = [
  { value: '16,409', label: 'records updated automatically at go-live' },
  { value: '54k', label: 'emails classified and extracted by LLM pipeline' },
  { value: '18\u00d7', label: 'throughput vs the pipeline it replaced' },
  { value: '400/400', label: 'live CRM read-backs matched exactly' },
]

export const experience: Job[] = [
  {
    slug: 'tanantech',
    company: 'Tanantech',
    role: 'AI Solutions Engineer',
    location: 'UK',
    start: 'Jun 2026',
    end: 'Present',
    summary: 'Designing and building the AI automation and data infrastructure behind a high-volume operations team.',
    highlights: [
      {
        title: 'Medallion: email & document lakehouse (designed and built)',
        points: [
          'Designed and built a **bronze → silver → gold medallion lakehouse** (Delta Lake on S3, Postgres serving layer) that ingests whole mailboxes via the Microsoft Graph API, cleans and de-duplicates emails and attachments, and turns them into CRM-ready data.',
          'Classification and extraction run on **System One models**: decision models that return structured labels, fields and **probability scores** instead of free-form text, so every output is machine-checkable. Model and prompt versions are pinned, token budgets are counted up front, and requests are HMAC-signed async jobs with retries.',
          'Processed **nearly 54,000 business emails** from a single mailbox end to end: all classified, 41,500+ extracted into 48,000+ structured rows, with every raw model response kept immutably as an audit trail (146k+).',
          '**18× the throughput** of the MongoDB pipeline it replaced: 48k extractions in under 8 hours at 200-way concurrency, with call failures cut from **24% to 0.05%**.',
          'Roughly **$0.001 per email** for classification and extraction together. Content-hash de-duplication cut stored attachments by 70%.',
          'Validation built in: schema, plausibility and format checks on every row, and append-only result history so any answer can be traced and replayed. QC found 0.22% incorrect values across 41.5k rows.',
          'Leading the v2 platform: **Apache Iceberg on Cloudflare R2**, a **Workers + Durable Objects** control plane, container workers, Postgres serving and BI dashboards, documented in 70 architecture decision records. Benchmarked OCR models for scanned documents (PaddleOCR-VL and LightOnOCR both hit 0% character error on the test set) and made Postgres reads **6× faster** with streaming.',
        ],
      },
      {
        title: 'Email responses → automated case updates',
        points: [
          "Turned Medallion's extracted email responses into live CRM updates: each response is matched to its record (exact, then scored fuzzy matching), ranked against competing responses, then applied as field updates followed by a state change.",
          'Go-live run: **16,409 records updated** from 18,390 responses, with **103,943 field values** written and **14,080 cases moved state** automatically. This was work previously done by hand.',
          'The main batch of 15,309 records ran in about 5 hours with **0 failed sends**. The 2,329 moves the CRM refused by rule were routed to a ready-made review list.',
          'Verified, not trusted: a random sample of **400 records read back from the live CRM matched** on every field and state. An independent re-implementation agreed on 18,388 of 18,390 decisions, and 1,000+ automated tests passed.',
          'Rolled out in stages (a 100-record pilot, a 1,000-record batch, then the full run) on a declarative **state-machine engine** with dry-run mode, an idempotent send ledger, retries and read-back verification.',
        ],
      },
      {
        title: 'Rules-based eligibility engine',
        points: [
          'Built a rules engine that checks each case against configurable business rules (duplicates, third-party data lookups, required documents and more) and returns **YES, NO or MANUAL REVIEW** with a reason.',
          'Batch runs of **2,000–3,300 cases** at a time. A single 2,102-case run flagged 541 cases missing required documents before they went further.',
          'Automated duplicate detection that moves duplicate records out of the queue on a poller, dry-run by default.',
        ],
      },
      {
        title: 'Other work',
        points: [
          '**Vision OCR** for scanned signed documents: barcode and signature detection plus vision-model field extraction across up to 200 parallel workers. 82/82 documents read first time, 93% field accuracy on human review.',
          'Built **MCP (Model Context Protocol) servers** so the team can use AI agents safely against company systems, and an internal docs site on Cloudflare Workers.',
        ],
      },
    ],
    tech: ['Python', 'TypeScript', 'System One models', 'LLMs', 'MCP', 'Delta Lake', 'Apache Iceberg', 'PostgreSQL', 'Cloudflare Workers & Durable Objects', 'AWS S3', 'Microsoft Graph API', 'Docker'],
  },
  {
    slug: 'outlier',
    company: 'Outlier',
    role: 'LLM Trainer',
    location: 'Remote',
    start: 'Nov 2024',
    end: 'Jun 2026',
    highlights: [
      {
        points: [
          'Reviewed and rated **200+ model responses** across coding, reasoning and instruction-following tasks, improving accuracy and reliability across training iterations.',
          'Designed adversarial prompts to probe model behaviour, surface edge cases and score responses against strict rubrics.',
          'Diagnosed hallucinations, weak reasoning and code errors, and wrote detailed corrective feedback.',
        ],
      },
    ],
    tech: ['Prompt engineering', 'LLM evaluation', 'Python'],
  },
  {
    slug: 'haughton-hall',
    company: 'Haughton Hall Hotel',
    role: 'Guest Services Assistant (Reception & Systems)',
    location: 'Shifnal',
    start: 'Jun 2025',
    end: 'Jun 2026',
    highlights: [
      {
        points: [
          'Managed bookings, payments and guest data across multiple reservation platforms and internal systems.',
          'Kept data consistent across departments in real time during events of up to 300 guests.',
        ],
      },
    ],
  },
  {
    slug: 'buckatree-hall',
    company: 'Buckatree Hall Hotel',
    role: 'Bartender',
    location: 'Telford',
    start: 'Jun 2024',
    end: 'Sep 2024',
    highlights: [
      {
        points: ['Delivered customer service in a fast-paced environment while managing multiple priorities, strengthening communication and teamwork.'],
      },
    ],
  },
]

export const projects: Project[] = [
  {
    slug: 'whosup',
    name: 'whosup',
    tagline: '`top` for your coding agents.',
    description: [
      'A live terminal UI that shows every coding-agent session you have running (pi, Codex, opencode, Gemini CLI, aider and more), what each one is doing, and whether it needs you.',
      'Nests sub-agents under their session, surfaces sessions waiting for approval, and jumps straight to the right tab in Ghostty, iTerm2, Terminal, tmux or your editor.',
      'Terminals and Ports tabs show what every terminal is running and which agent started that dev server still holding :3000. A Usage tab charts spend and tokens by agent, model and project.',
      'Read-only by design: it only reads the files agents already write and the process list. It never touches the network. Transcripts are read incrementally, so multi-megabyte sessions cost almost nothing.',
    ],
    tech: ['Rust', 'ratatui', 'macOS', 'Homebrew', 'GitHub Actions'],
    links: [
      { label: 'GitHub', href: 'https://github.com/kav-sw19/whosup' },
      { label: 'Releases', href: 'https://github.com/kav-sw19/whosup/releases' },
    ],
    install: 'brew install kav-sw19/tap/whosup',
  },
  {
    slug: 'kavos',
    name: 'KavOS (this portfolio)',
    tagline: 'a portfolio that boots like an old PC.',
    description: [
      'Boots through a CRT power-on, a BIOS screen and a GRUB menu into an **interactive terminal** (tab completion, history, a virtual file system), a **Win95-style desktop** with draggable windows and a working Minesweeper, or this LaTeX-style CV.',
      'Built to a measured bar: **Lighthouse 100** for accessibility, best practices and SEO in every mode, full keyboard and touch support, reduced-motion aware, and one data file that also generates llms.txt.',
    ],
    tech: ['React', 'TypeScript', 'Vite', 'Vercel'],
    links: [
      { label: 'Live', href: 'https://kav-portfolio-chi.vercel.app' },
      { label: 'Source', href: 'https://github.com/kav-sw19/kav-portfolio' },
    ],
  },
]

export const skills: { group: string; items: string[] }[] = [
  { group: 'AI & LLMs', items: ['System One decision models', 'LLM automation', 'Structured extraction', 'Vision OCR', 'MCP servers', 'Agents & tool use', 'LLM evaluation', 'Prompt engineering', 'RAG'] },
  { group: 'Languages', items: ['Python', 'TypeScript', 'Rust', 'SQL', 'Java', 'JavaScript'] },
  { group: 'Data', items: ['Medallion / lakehouse architecture', 'Delta Lake', 'Apache Iceberg', 'ETL pipelines', 'PostgreSQL', 'Redis', 'Data validation'] },
  { group: 'Web & APIs', items: ['React', 'Next.js', 'Flask', 'REST APIs', 'Gradio'] },
  { group: 'Cloud & tools', items: ['AWS (S3, RDS)', 'Cloudflare (Workers, Durable Objects, R2)', 'Vercel', 'Azure / Microsoft Graph', 'Docker', 'GitLab CI', 'Git', 'Linux'] },
]

export const education: Education[] = [
  { school: 'University of Leicester', qualification: 'BSc Computer Science, First Class Honours', location: 'Leicester, UK', start: 'Sep 2022', end: 'Jun 2025' },
  { school: 'Madeley Academy Sixth Form', qualification: 'A-Levels: Computer Science, Mathematics, Physics', location: 'Telford, UK', start: 'Sep 2020', end: 'Jul 2022' },
]

export type Certification = { name: string; issuer: string; detail: string; date?: string; url?: string }

/** Newest first. Coursera entries link to their public verification page. */
export const certifications: Certification[] = [
  {
    name: 'ChatGPT + Cybersecurity: AI-Powered Tabletops & Training',
    issuer: 'Vanderbilt University (Coursera)',
    date: 'Sep 2026',
    url: 'https://www.coursera.org/account/accomplishments/certificate/WRUQXUVT5O8V',
    detail: 'Using generative AI to design and run cybersecurity tabletop exercises and incident-response training.',
  },
  {
    name: 'Generative AI Cybersecurity & Privacy for Leaders: A Primer',
    issuer: 'Vanderbilt University (Coursera)',
    date: 'Sep 2026',
    url: 'https://www.coursera.org/account/accomplishments/certificate/0K81PWP2ZC2V',
    detail: 'Security and privacy risks of generative AI in organisations, and the governance needed to adopt it safely.',
  },
  {
    name: 'Applied Calculus with Python',
    issuer: 'Johns Hopkins University (Coursera)',
    detail: 'Mathematical modelling and computational analysis in Python: rates of change, optimisation and integration.',
  },
  {
    name: 'Introduction to Cybersecurity',
    issuer: 'Cisco',
    detail: 'Foundations of cybersecurity principles, risk management and secure data handling.',
  },
]

export const fortunes = [
  'There are 2 hard problems in computer science: cache invalidation, naming things, and off-by-one errors.',
  'It works on my machine. Ship the machine. (That is how Docker happened.)',
  'A medallion has three layers. So does a good lasagne. Coincidence? Yes.',
  'The best prompt is the one you tested.',
  'Rust compiler says no. Rust compiler is usually right.',
  'Somewhere, a coding agent is waiting for your approval. Run whosup to find it.',
]
