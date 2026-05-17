New-Item -ItemType Directory -Force -Path "app\program"
New-Item -ItemType Directory -Force -Path "app\api\program"
New-Item -ItemType Directory -Force -Path "app\api\program\generate"
New-Item -ItemType Directory -Force -Path "app\api\program\progress"

Set-Content -Path "app\api\program\generate\route.ts" -Value @'
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const stravaId = cookieStore.get("strava_id")?.value
  if (!stravaId) return NextResponse.json({ error: "Not logged in" }, { status: 401 })

  const body = await req.json()
  const { goal, days, level, duration, age, height, weight, gender, event } = body

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
    "https://www.strava.com/api/v3/athlete/activities?per_page=20",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  const activities = await activitiesRes.json()

  const recentRuns = Array.isArray(activities) ? activities.filter((a: any) => a.type === "Run") : []
  const recentGym = Array.isArray(activities) ? activities.filter((a: any) => a.type === "WeightTraining" || a.type === "Workout") : []
  const avgRunKm = recentRuns.length > 0 ? Math.round(recentRuns.reduce((s: number, a: any) => s + (a.distance || 0), 0) / recentRuns.length / 1000 * 10) / 10 : 0
  const avgRunPace = recentRuns.length > 0 ? Math.round(recentRuns.reduce((s: number, a: any) => s + (a.average_speed || 0), 0) / recentRuns.length * 3.6 * 10) / 10 : 0
  const weeklyRunKm = recentRuns.slice(0, 4).reduce((s: number, a: any) => s + (a.distance || 0), 0) / 1000
  const bmi = weight && height ? Math.round((weight / Math.pow(height / 100, 2)) * 10) / 10 : null
  const maxHR = age ? 220 - age : 180
  const fatBurnZoneLow = Math.round(maxHR * 0.6)
  const fatBurnZoneHigh = Math.round(maxHR * 0.7)

  const prompt = `You are Oracle, an elite AI fitness coach inside a fantasy RPG fitness app called Gainquest. You speak with wisdom, authority and a hint of mysticism. You are creating a personalised training program.

User stats:
- Goal: ${goal}
- Training days per week: ${days}
- Fitness level: ${level}
- Program duration: ${duration}
- Age: ${age}, Height: ${height}cm, Weight: ${weight}kg, Gender: ${gender}
- BMI: ${bmi}
- Max heart rate: ${maxHR}bpm
- Fat burn zone: ${fatBurnZoneLow}-${fatBurnZoneHigh}bpm
- Upcoming event: ${event || "none"}
- Recent Strava data: avg run distance ${avgRunKm}km, avg speed ${avgRunPace}km/h, weekly run volume ~${Math.round(weeklyRunKm)}km
- Recent gym sessions: ${recentGym.length} in last 20 activities

Generate a complete training program as a JSON object with this exact structure:
{
  "campaignName": "Epic fantasy campaign name (e.g. The Shadow Road Campaign)",
  "campaignSubtitle": "Short epic subtitle",
  "oracleIntro": "Oracle's opening message to the user, 2-3 sentences, mystical but motivating, referencing their specific stats",
  "weeks": [
    {
      "weekNumber": 1,
      "title": "Epic RPG week title",
      "sessions": [
        {
          "day": "Monday",
          "type": "Run|Gym|Walk|Rest",
          "description": "Specific session description e.g. Easy 5km run at conversational pace",
          "targetKm": 5,
          "targetMins": 35,
          "xpReward": 200
        }
      ],
      "weeklyTarget": "Summary of week target",
      "oracleAdvice": "Oracle's specific advice for this week referencing their data",
      "totalXP": 800
    }
  ]
}

Generate all ${duration.replace(" weeks", "")} weeks. Make sessions realistic and progressive based on their Strava data. Only respond with the JSON object, no other text.`

  const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    }),
  })

  const claudeData = await claudeRes.json()
  const text = claudeData.content?.[0]?.text || ""

  let program
  try {
    const clean = text.replace(/```json|```/g, "").trim()
    program = JSON.parse(clean)
  } catch (e) {
    return NextResponse.json({ error: "Failed to parse program" }, { status: 500 })
  }

  const { data: savedProgram } = await supabase
    .from("programs")
    .insert({
      user_strava_id: stravaId,
      campaign_name: program.campaignName,
      campaign_subtitle: program.campaignSubtitle,
      oracle_intro: program.oracleIntro,
      goal,
      days_per_week: parseInt(days),
      duration_weeks: parseInt(duration),
      fitness_level: level,
      age: parseInt(age),
      height: parseInt(height),
      weight: parseInt(weight),
      gender,
      event: event || null,
      weeks: program.weeks,
      current_week: 1,
      started_at: new Date().toISOString(),
      active: true,
    })
    .select()
    .single()

  return NextResponse.json({ program: savedProgram })
}
'@

Set-Content -Path "app\api\program\progress\route.ts" -Value @'
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function GET() {
  const cookieStore = await cookies()
  const stravaId = cookieStore.get("strava_id")?.value
  if (!stravaId) return NextResponse.json({ error: "Not logged in" }, { status: 401 })

  const { data: program } = await supabase
    .from("programs")
    .select("*")
    .eq("user_strava_id", stravaId)
    .eq("active", true)
    .single()

  if (!program) return NextResponse.json({ program: null })

  const startDate = new Date(program.started_at)
  const now = new Date()
  const weeksPassed = Math.floor((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
  const currentWeek = Math.min(weeksPassed + 1, program.duration_weeks)

  if (currentWeek !== program.current_week) {
    await supabase.from("programs").update({ current_week: currentWeek }).eq("id", program.id)
  }

  const weekStart = new Date(startDate)
  weekStart.setDate(weekStart.getDate() + (currentWeek - 1) * 7)

  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("user_strava_id", stravaId)
    .gte("date", weekStart.toISOString())

  const weekKm = (activities || []).reduce((s: number, a: any) => s + (a.distance || 0) / 1000, 0)
  const weekSessions = (activities || []).length

  return NextResponse.json({
    program: { ...program, current_week: currentWeek },
    weekKm: Math.round(weekKm * 10) / 10,
    weekSessions,
  })
}
'@

Write-Host "✅ API routes created!" -ForegroundColor Green