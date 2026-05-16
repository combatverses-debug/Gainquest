import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const stravaId = searchParams.get('stravaId')

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('strava_id', stravaId)
    .single()

  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .eq('user_strava_id', stravaId)
    .order('date', { ascending: false })
    .limit(10)

  let partner = null
  if (user?.partner_strava_id) {
    const { data: partnerData } = await supabase
      .from('users')
      .select('*')
      .eq('strava_id', user.partner_strava_id)
      .single()
    partner = partnerData
  }

  return NextResponse.json({ user, activities, partner })
}
