import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const origin = new URL(request.url).origin
  const redirectUri = `${origin}/api/slack/callback`
  const state = randomBytes(16).toString('hex')

  const params = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID!,
    scope: 'chat:write,incoming-webhook',
    redirect_uri: redirectUri,
    state,
  })

  const response = NextResponse.redirect(`https://slack.com/oauth/v2/authorize?${params}`)
  response.cookies.set('slack_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minuten
    path: '/',
  })

  return response
}
