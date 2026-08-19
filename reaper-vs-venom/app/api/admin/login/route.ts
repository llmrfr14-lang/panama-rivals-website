import { timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'
import { ADMIN_COOKIE, adminCookieOptions, createAdminSessionValue } from '@/lib/admin-auth'

export const runtime = 'nodejs'

function redirectTo(path: string) {
  return new NextResponse(null, {
    status: 303,
    headers: { Location: path },
  })
}

export async function POST(request: Request) {
  const password = process.env.ADMIN_PASSWORD
  const sessionSecret = process.env.ADMIN_SESSION_SECRET
  if (!password || !sessionSecret) return redirectTo('/admin/login?error=config')

  const formData = await request.formData()
  const submitted = String(formData.get('password') ?? '')
  const submittedBuffer = Buffer.from(submitted)
  const expectedBuffer = Buffer.from(password)
  const passwordMatches =
    submittedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(submittedBuffer, expectedBuffer)

  if (!passwordMatches) return redirectTo('/admin/login?error=password')

  const response = redirectTo('/admin')
  response.cookies.set(ADMIN_COOKIE, createAdminSessionValue(), adminCookieOptions)
  return response
}
