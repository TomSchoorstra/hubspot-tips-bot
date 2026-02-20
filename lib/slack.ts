interface SlackOAuthResponse {
  ok: boolean
  access_token: string
  token_type: string
  scope: string
  bot_user_id: string
  app_id: string
  team: { id: string; name: string }
  authed_user: { id: string }
  incoming_webhook?: {
    channel: string
    channel_id: string
    configuration_url: string
    url: string
  }
  error?: string
}

export async function sendMessage(
  accessToken: string,
  channelId: string,
  text: string
): Promise<void> {
  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ channel: channelId, text }),
  })

  const data = await response.json() as { ok: boolean; error?: string }

  if (!data.ok) {
    throw new Error(`Slack sendMessage failed: ${data.error}`)
  }
}

export async function joinChannel(
  accessToken: string,
  channelId: string
): Promise<void> {
  const response = await fetch('https://slack.com/api/conversations.join', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ channel: channelId }),
  })

  const data = await response.json() as { ok: boolean; error?: string }

  if (!data.ok) {
    throw new Error(`Slack joinChannel failed: ${data.error}`)
  }
}

export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<SlackOAuthResponse> {
  const clientId = process.env.SLACK_CLIENT_ID
  const clientSecret = process.env.SLACK_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Missing required environment variables: SLACK_CLIENT_ID, SLACK_CLIENT_SECRET')
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
  })

  const response = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  })

  const data = await response.json() as SlackOAuthResponse

  if (!data.ok) {
    throw new Error(`Slack OAuth exchange failed: ${data.error}`)
  }

  return data
}
