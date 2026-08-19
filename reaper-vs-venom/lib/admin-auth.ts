import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

export const ADMIN_COOKIE = 'panamarivals_admin'
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_DURATION_MS / 1000,
}

function secret() {
  return process.env.ADMIN_SESSION_SECRET || ''
}

function sign(value: string) {
  return createHmac('sha256', secret()).update(value).digest('base64url')
}

export function createAdminSessionValue() {
  const expiresAt = String(Date.now() + SESSION_DURATION_MS)
  return `${expiresAt}.${sign(expiresAt)}`
}

export function verifyAdminSessionValue(value: string | undefined) {
  if (!value || !secret()) return false

  const [expiresAt, signature] = value.split('.')
  if (!expiresAt || !signature || Number(expiresAt) <= Date.now()) return false

  const expected = sign(expiresAt)
  const receivedBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)

  return receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
}

export function isAdminRequest(request: NextRequest) {
  return verifyAdminSessionValue(request.cookies.get(ADMIN_COOKIE)?.value)
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies()
  return verifyAdminSessionValue(cookieStore.get(ADMIN_COOKIE)?.value)
}
