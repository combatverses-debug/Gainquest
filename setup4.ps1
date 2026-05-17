New-Item -ItemType Directory -Force -Path "app\readiness"
New-Item -ItemType Directory -Force -Path "app\api\readiness"

Set-Content -Path "app\api\readiness\route.ts" -Value @'
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function GET() {
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

  const now = Math.floor(Date.now() / 1000)
  const fourWeeksAgo = now - (28 * 24 * 60 * 60)

  const activitiesRes = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?per_page=100&after=${fourWeeksAgo}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  const activities = await activitiesRes.json()

  if (!Array.isArray(activities)) {
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 })
  }

  const oneWeekAgo = now - (7 * 24 * 60 * 60)
  const twoWeeksAgo = now - (14 * 24 * 60 * 60)

  const thisWeek = activities.filter((a: any) => new Date(a.start_date).getTime() / 1000 > oneWeekAgo)
  const lastWeek = activities.filter((a: any) => {
    const t = new Date(a.start_date).getTime() / 1000
    return t > twoWeeksAgo && t <= oneWeekAgo
  })

  const sufferScore = thisWeek.reduce((s: number, a: any) => s + (a.suffer_score || 0), 0)
  const lastWeekSuffer = lastWeek.reduce((s: number, a: any) => s + (a.suffer_score || 0), 0)

  const weeklyLoad = thisWeek.reduce((s: number, a: any) => s + (a.moving_time / 60), 0)
  const lastWeekLoad = lastWeek.reduce((s: number, a: any) => s + (a.moving_time / 60), 0)

  const avgHR = thisWeek.filter((a: any) => a.average_heartrate).length > 0
    ? Math.round(thisWeek.filter((a: any) => a.average_heartrate).reduce((s: number, a: any) => s + a.average_heartrate, 0) / thisWeek.filter((a: any) => a.average_heartrate).length)
    : 0

  const maxHR = Math.max(0, ...thisWeek.map((a: any) => a.max_heartrate || 0))

  const totalMovingTime = thisWeek.reduce((s: number, a: any) => s + (a.moving_time || 0), 0)

  const z1Time = thisWeek.reduce((s: number, a: any) => {
    if (!a.heartrate_opt_out && a.average_heartrate) {
      const ratio = Math.min(a.average_heartrate / (maxHR || 180), 1)
      if (ratio < 0.6) return s + a.moving_time
    }
    return s
  }, 0)

  const z2Time = thisWeek.reduce((s: number, a: any) => {
    if (a.average_heartrate) {
      const ratio = a.average_heartrate / (maxHR || 180)
      if (ratio >= 0.6 && ratio < 0.7) return s + a.moving_time
    }
    return s
  }, 0)

  const z3Time = thisWeek.reduce((s: number, a: any) => {
    if (a.average_heartrate) {
      const ratio = a.average_heartrate / (maxHR || 180)
      if (ratio >= 0.7 && ratio < 0.8) return s + a.moving_time
    }
    return s
  }, 0)

  const z4Time = thisWeek.reduce((s: number, a: any) => {
    if (a.average_heartrate) {
      const ratio = a.average_heartrate / (maxHR || 180)
      if (ratio >= 0.8 && ratio < 0.9) return s + a.moving_time
    }
    return s
  }, 0)

  const z5Time = thisWeek.reduce((s: number, a: any) => {
    if (a.average_heartrate) {
      const ratio = a.average_heartrate / (maxHR || 180)
      if (ratio >= 0.9) return s + a.moving_time
    }
    return s
  }, 0)

  const totalHRTime = z1Time + z2Time + z3Time + z4Time + z5Time || 1

  const weekLoads = [0, 1, 2, 3].map(weeksAgo => {
    const start = now - ((weeksAgo + 1) * 7 * 24 * 60 * 60)
    const end = now - (weeksAgo * 7 * 24 * 60 * 60)
    return activities
      .filter((a: any) => {
        const t = new Date(a.start_date).getTime() / 1000
        return t > start && t <= end
      })
      .reduce((s: number, a: any) => s + (a.suffer_score || 0), 0)
  }).reverse()

  const ctl = weekLoads.reduce((s, w) => s + w, 0) / 4
  const atl = weekLoads[weekLoads.length - 1]
  const tsb = Math.round(ctl - atl)

  const fatigueLevel = atl / (ctl || 1)
  let readiness = 50
  if (fatigueLevel < 0.8) readiness = 85
  else if (fatigueLevel < 1.0) readiness = 75
  else if (fatigueLevel < 1.2) readiness = 60
  else if (fatigueLevel < 1.5) readiness = 40
  else readiness = 25

  if (sufferScore > 200) readiness -= 10
  if (tsb > 20) readiness += 10
  readiness = Math.min(100, Math.max(0, readiness))

  let xpBonus = 0
  let statusLabel = ""
  let statusColor = ""
  let advice = ""

  if (readiness >= 80) {
    xpBonus = 20
    statusLabel = "Battle Ready"
    statusColor = "#1D9E75"
    advice = "You're in peak form. Push hard today — you'll earn a 20% XP bonus on all activities. A high intensity run or gym session will trigger the Warrior's Rush bonus."
  } else if (readiness >= 60) {
    xpBonus = 10
    statusLabel = "Primed"
    statusColor = "#F5C475"
    advice = "Good form with moderate fatigue. A steady session today will earn a 10% XP bonus. Avoid going all out — save the big efforts for when you're fresher."
  } else if (readiness >= 40) {
    xpBonus = 0
    statusLabel = "Fatigued"
    statusColor = "#D85A30"
    advice = "Your body is tired from recent efforts. A light walk or rest day will help you recover faster. Come back strong tomorrow for bonus XP."
  } else {
    xpBonus = 0
    statusLabel = "Depleted"
    statusColor = "#E24B4A"
    advice = "You're running on empty. Rest is your best weapon right now. Taking a recovery day today will unlock a Rested bonus tomorrow worth +25% XP."
  }

  return NextResponse.json({
    readiness,
    statusLabel,
    statusColor,
    xpBonus,
    advice,
    sufferScore: Math.round(sufferScore),
    lastWeekSuffer: Math.round(lastWeekSuffer),
    weeklyLoadMins: Math.round(weeklyLoad),
    lastWeekLoadMins: Math.round(lastWeekLoad),
    avgHR,
    maxHR,
    totalMovingTimeMins: Math.round(totalMovingTime / 60),
    zones: {
      z1: Math.round((z1Time / totalHRTime) * 100),
      z2: Math.round((z2Time / totalHRTime) * 100),
      z3: Math.round((z3Time / totalHRTime) * 100),
      z4: Math.round((z4Time / totalHRTime) * 100),
      z5: Math.round((z5Time / totalHRTime) * 100),
    },
    weekLoads,
    ctl: Math.round(ctl),
    atl: Math.round(atl),
    tsb,
    activitiesThisWeek: thisWeek.length,
  })
}
'@

Write-Host "✅ API route created!" -ForegroundColor Green