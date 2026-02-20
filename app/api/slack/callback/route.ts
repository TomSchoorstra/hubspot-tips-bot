import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken, joinChannel } from '@/lib/slack'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const redirectUri = `${origin}/api/slack/callback`

  const storedState = request.cookies.get('slack_oauth_state')?.value

  if (!storedState || state !== storedState) {
    console.error('Slack callback: ongeldige of ontbrekende state parameter (mogelijke CSRF)')
    return NextResponse.redirect(`${origin}/?error=true`)
  }

  if (!code) {
    console.error('Slack callback: ontbrekende code parameter')
    return NextResponse.redirect(`${origin}/?error=true`)
  }

  try {
    const data = await exchangeCodeForToken(code, redirectUri)

    if (!data.incoming_webhook?.channel_id) {
      console.error('Slack callback: incoming_webhook ontbreekt in OAuth response', { team: data.team.id })
      return NextResponse.redirect(`${origin}/?error=true`)
    }

    const { error } = await supabase
      .from('installations')
      .upsert(
        {
          team_id: data.team.id,
          team_name: data.team.name,
          channel_id: data.incoming_webhook.channel_id,
          access_token: data.access_token,
          is_active: true,
          installed_at: new Date().toISOString(),
        },
        { onConflict: 'team_id' }
      )

    if (error) {
      console.error('Supabase upsert mislukt:', error)
      return NextResponse.redirect(`${origin}/?error=true`)
    }

    await joinChannel(data.access_token, data.incoming_webhook.channel_id)

    const response = NextResponse.redirect(`${origin}/?success=true`)
    response.cookies.delete('slack_oauth_state')
    return response
  } catch (err) {
    console.error('Slack callback fout:', err)
    return NextResponse.redirect(`${origin}/?error=true`)
  }
}
