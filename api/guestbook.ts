// Guestbook API (Vercel Function). Approve-first: new entries are hidden until approved.
//
//   GET  /api/guestbook                         -> approved entries (public)
//   POST /api/guestbook  {name, message, hp, t}  -> submit (goes to pending)
//   GET  /api/guestbook?admin=1   + x-admin-token -> pending + approved
//   POST /api/guestbook  {action: approve|delete, id} + x-admin-token
//
// Storage: Upstash Redis (KV_REST_API_* or UPSTASH_REDIS_REST_* env vars, set by the Vercel integration).
// Admin: GUESTBOOK_ADMIN_TOKEN env var. Locally (no Upstash env, not on Vercel) an in-memory store is used.
import { Redis } from '@upstash/redis'
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto'

export type Entry = { id: string; name: string; message: string; at: number }

type Store = {
  add(e: Entry): Promise<void>
  list(which: 'approved' | 'pending', limit: number): Promise<Entry[]>
  approve(id: string): Promise<boolean>
  remove(id: string): Promise<void>
  hit(key: string, windowSec: number): Promise<number>
}

const MAX_NAME = 40
const MAX_MESSAGE = 280
const RATE_LIMIT = 3 // submissions per IP per hour
const LIST_LIMIT = 100

// ---------- stores ----------

function redisStore(redis: Redis): Store {
  const key = (id: string) => `gb:entry:${id}`
  return {
    async add(e) {
      await redis.set(key(e.id), e)
      await redis.zadd('gb:pending', { score: e.at, member: e.id })
    },
    async list(which, limit) {
      const ids = await redis.zrange<string[]>(`gb:${which}`, 0, limit - 1, { rev: true })
      if (!ids.length) return []
      const rows = await redis.mget<(Entry | null)[]>(...ids.map(key))
      return rows.filter((r): r is Entry => !!r)
    },
    async approve(id) {
      const e = await redis.get<Entry>(key(id))
      if (!e) return false
      await redis.zrem('gb:pending', id)
      await redis.zadd('gb:approved', { score: e.at, member: id })
      return true
    },
    async remove(id) {
      await Promise.all([redis.zrem('gb:pending', id), redis.zrem('gb:approved', id), redis.del(key(id))])
    },
    async hit(k, windowSec) {
      const n = await redis.incr(`gb:rl:${k}`)
      if (n === 1) await redis.expire(`gb:rl:${k}`, windowSec)
      return n
    },
  }
}

function memoryStore(): Store {
  const entries = new Map<string, Entry>()
  const pending = new Set<string>()
  const approved = new Set<string>()
  const hits = new Map<string, number>()
  const sorted = (ids: Set<string>) => [...ids].map((id) => entries.get(id)!).sort((a, b) => b.at - a.at)
  return {
    async add(e) {
      entries.set(e.id, e)
      pending.add(e.id)
    },
    async list(which, limit) {
      return sorted(which === 'approved' ? approved : pending).slice(0, limit)
    },
    async approve(id) {
      if (!entries.has(id)) return false
      pending.delete(id)
      approved.add(id)
      return true
    },
    async remove(id) {
      pending.delete(id)
      approved.delete(id)
      entries.delete(id)
    },
    async hit(k) {
      const n = (hits.get(k) ?? 0) + 1
      hits.set(k, n)
      return n
    },
  }
}

let memo: Store | null | undefined
function getStore(): Store | null {
  if (memo !== undefined) return memo
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN
  if (url && token) memo = redisStore(new Redis({ url, token }))
  else memo = process.env.VERCEL ? null : memoryStore() // never silently use memory in production
  return memo
}

// ---------- helpers ----------

const json = (body: unknown, status = 200, cache = 'no-store') =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': cache } })

const clean = (s: unknown, max: number) =>
  typeof s === 'string'
    ? s
        .normalize('NFKC')
        .replace(/[\u0000-\u0008\u000B-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
        .slice(0, max)
    : ''

const LINKY = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|ru|xyz|top|biz|info|co)\b)/i

function isAdmin(req: Request) {
  const expected = process.env.GUESTBOOK_ADMIN_TOKEN ?? (process.env.VERCEL ? '' : 'dev-admin')
  const got = req.headers.get('x-admin-token') ?? ''
  if (!expected || got.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(got), Buffer.from(expected))
}

function clientKey(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown'
  // only a salted hash of the IP is stored, and it expires with the rate-limit window
  return createHash('sha256').update(`${process.env.GUESTBOOK_SALT ?? 'kavos'}:${ip}`).digest('hex').slice(0, 24)
}

// ---------- handlers ----------

export async function GET(req: Request) {
  const store = getStore()
  if (!store) return json({ error: 'offline' }, 503)
  const admin = new URL(req.url).searchParams.has('admin')
  if (admin) {
    if (!isAdmin(req)) return json({ error: 'unauthorised' }, 401)
    const [pending, approved] = await Promise.all([store.list('pending', LIST_LIMIT), store.list('approved', LIST_LIMIT)])
    return json({ pending, approved })
  }
  const approved = await store.list('approved', LIST_LIMIT)
  return json({ entries: approved }, 200, 'public, max-age=0, s-maxage=30, stale-while-revalidate=300')
}

export async function POST(req: Request) {
  const store = getStore()
  if (!store) return json({ error: 'offline' }, 503)
  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return json({ error: 'bad request' }, 400)
  }

  // admin actions
  if (body.action) {
    if (!isAdmin(req)) return json({ error: 'unauthorised' }, 401)
    const id = typeof body.id === 'string' ? body.id : ''
    if (!/^[0-9a-f-]{36}$/.test(id)) return json({ error: 'bad id' }, 400)
    if (body.action === 'approve') return json({ ok: await store.approve(id) })
    if (body.action === 'delete') return (await store.remove(id), json({ ok: true }))
    return json({ error: 'unknown action' }, 400)
  }

  // a new entry
  if (body.hp) return json({ ok: true }) // honeypot filled: a bot. pretend it worked.
  const opened = Number(body.t)
  if (!Number.isFinite(opened) || Date.now() - opened < 2500) return json({ error: 'too fast' }, 400)
  const name = clean(body.name, MAX_NAME)
  const message = clean(body.message, MAX_MESSAGE)
  if (!name || !message) return json({ error: 'name and message are required' }, 400)
  if (LINKY.test(name) || LINKY.test(message)) return json({ error: 'no links, please' }, 400)
  if ((await store.hit(clientKey(req), 3600)) > RATE_LIMIT) return json({ error: 'slow down: try again later' }, 429)

  await store.add({ id: randomUUID(), name, message, at: Date.now() })
  return json({ ok: true, pending: true }, 201)
}
