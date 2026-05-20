import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { calculateXP, xpToLevel } from "@/lib/xp"
import { cookies } from "next/headers"

export async function POST() {
  const cookieStore = await cookies()
  const stravaId = cookieStore.get("strava_id")?.value

  if (!stravaId) return NextResponse.json({ error: "Not logged in" }, { status: 401 })

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("strava_id", stravaId)
    .single()

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  let accessToken = user.access_token
  if (Date.now() / 1000 > user.expires_at) {
    const res = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        refresh_token: user.refresh_token,
        grant_type: "refresh_token",
      }),
    })
    const tokens = await res.json()
    accessToken = tokens.access_token
    await supabase.from("users").update({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_at,
    }).eq("strava_id", stravaId)
  }

  const activitiesRes = await fetch(
    "https://www.strava.com/api/v3/athlete/activities?per_page=30",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  const activities = await activitiesRes.json()

  let totalXP = user.xp
  let totalStr = user.str
  let totalEnd = user.end_stat
  let totalPwr = user.pwr

  for (const act of activities) {
    const { data: existing } = await supabase
      .from("activities")
      .select("id")
      .eq("strava_id", act.id)
      .single()

    if (!existing) {
      const detailRes = await fetch(
        `https://www.strava.com/api/v3/activities/${act.id}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      const detail = await detailRes.json()

      const { xp, str, endStat, pwr } = calculateXP(
        act.type,
        act.distance,
        act.moving_time,
        detail.calories
      )
      await supabase.from("activities").insert({
        strava_id: act.id,
        user_strava_id: stravaId,
        name: act.name,
        type: act.type,
        distance: act.distance,
        duration: act.moving_time,
        calories: detail.calories || 0,
        avg_speed: act.average_speed || 0,
        avg_heartrate: act.average_heartrate || 0,
        max_heartrate: act.max_heartrate || 0,
        elevation_gain: act.total_elevation_gain || 0,
        suffer_score: act.suffer_score || 0,
        relative_effort: act.relative_effort || 0,
        xp_earned: xp,
        date: act.start_date,
      })
      totalXP += xp
      totalStr += str
      totalEnd += endStat
      totalPwr += pwr
    }
  }

  const newLevel = xpToLevel(totalXP)
  await supabase.from("users").update({
    xp: totalXP,
    level: newLevel,
    str: totalStr,
    end_stat: totalEnd,
    pwr: totalPwr,
  }).eq("strava_id", stravaId)

  return NextResponse.json({ success: true, xp: totalXP, level: newLevel })
}