import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  const { stravaId, partnerStravaId } = await req.json()

  await supabase.from('users')
    .update({ partner_strava_id: partnerStravaId })
    .eq('strava_id', stravaId)

  await supabase.from('users')
    .update({ partner_strava_id: stravaId })
    .eq('strava_id', partnerStravaId)

  return NextResponse.json({ success: true })
}
