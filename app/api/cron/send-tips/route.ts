import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendMessage } from '@/lib/slack'

interface Installation {
  team_id: string
  team_name: string
  channel_id: string
  access_token: string
  tip_index: number
}

interface Tip {
  tip: string
  object: string | null
  difficulty: string | null
  hubspot_edition: string | null
  tip_type: string | null
}

function formatLabel(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function formatTipMessage(tip: Tip): string {
  const lines: string[] = ['💡 *HubSpot Tip van de Week*', '', tip.tip]

  const meta: string[] = []
  if (tip.object) meta.push(`🏷️ *Object:* ${formatLabel(tip.object)}`)
  if (tip.difficulty) meta.push(`📊 *Niveau:* ${formatLabel(tip.difficulty)}`)
  if (tip.hubspot_edition) meta.push(`🔑 *Editie:* ${formatLabel(tip.hubspot_edition)}`)
  if (tip.tip_type) meta.push(`⚡ *Type:* ${formatLabel(tip.tip_type)}`)

  if (meta.length > 0) {
    lines.push('')
    lines.push(...meta)
  }

  return lines.join('\n')
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: installations, error: installationsError } = await supabase
    .from('installations')
    .select('team_id, team_name, channel_id, access_token, tip_index')
    .eq('is_active', true)
    .returns<Installation[]>()

  if (installationsError) {
    console.error('Fout bij ophalen installaties:', installationsError)
    return NextResponse.json({ error: 'Failed to fetch installations' }, { status: 500 })
  }

  const { data: tips, error: tipsError } = await supabase
    .from('tips')
    .select('tip, object, difficulty, hubspot_edition, tip_type')
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .returns<Tip[]>()

  if (tipsError) {
    console.error('Fout bij ophalen tips:', tipsError)
    return NextResponse.json({ error: 'Failed to fetch tips' }, { status: 500 })
  }

  if (!tips || tips.length === 0) {
    console.warn('Geen actieve tips gevonden')
    return NextResponse.json({ sent: 0 })
  }

  let sent = 0

  for (const installation of installations ?? []) {
    try {
      const tip = tips[installation.tip_index % tips.length]

      await sendMessage(installation.access_token, installation.channel_id, formatTipMessage(tip))

      const { error: updateError } = await supabase
        .from('installations')
        .update({
          tip_index: installation.tip_index + 1,
          last_tip_sent_at: new Date().toISOString(),
        })
        .eq('team_id', installation.team_id)

      if (updateError) {
        console.error(`Fout bij updaten tip_index voor ${installation.team_name}:`, updateError)
      }

      sent++
    } catch (err) {
      console.error(`Fout bij versturen tip naar ${installation.team_name}:`, err)
    }
  }

  return NextResponse.json({ sent })
}
