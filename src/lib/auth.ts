import { cookies } from 'next/headers'
import { supabaseAdmin } from './supabase/admin'
import crypto from 'crypto'

const SESSION_COOKIE_NAME = 'cre8_session'
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days

// OWASP recommends minimum 100,000 iterations for PBKDF2 (2024)
const PBKDF2_ITERATIONS = 100000

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, hash] = storedHash.split(':')
  // Support legacy 1000 iteration hashes during migration
  const legacyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  if (legacyHash === hash) return true
  // Check with new iteration count
  const verifyHash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 64, 'sha512').toString('hex')
  return hash === verifyHash
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function createSession(memberId: string): Promise<string> {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  await supabaseAdmin.from('sessions').insert({
    member_id: memberId,
    token,
    expires_at: expiresAt.toISOString(),
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })

  return token
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) return null

  const { data: session } = await supabaseAdmin
    .from('sessions')
    .select('*, member:members(*)')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!session) return null

  return {
    member: session.member,
    session: {
      id: session.id,
      token: session.token,
      expiresAt: session.expires_at,
    },
  }
}

export async function destroySession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (token) {
    await supabaseAdmin.from('sessions').delete().eq('token', token)
    cookieStore.delete(SESSION_COOKIE_NAME)
  }
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function requireAdmin() {
  const session = await requireAuth()
  if (!session.member.is_admin) {
    throw new Error('Forbidden')
  }
  return session
}
