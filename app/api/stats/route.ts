import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function GET() {
  const cookieStore = await cookies()
  const stravaId = cookieStore.get("strava_id")?.value
  if (!stravaId) return NextResponse.json({ error: "Not logged in" }, { status: 401 })

  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("user_strava_id", stravaId)

  if (!activities) return NextResponse.json({})

const totalRunKm = activities.filter(a => a.type === "Run").reduce((s, a) => s + (a.distance || 0) / 1000, 0)
const totalWalkKm = activities.filter(a => a.type === "Walk").reduce((s, a) => s + (a.distance || 0) / 1000, 0)
const totalCycleKm = activities.filter(a => a.type === "Ride" || a.type === "VirtualRide").reduce((s, a) => s + (a.distance || 0) / 1000, 0)
  const gymSessions = activities.filter(a => a.type === "WeightTraining" || a.type === "Workout").length
  const totalCalories = activities.reduce((s, a) => s + (a.calories || 0), 0)
  const totalActivities = activities.length
  const longestRun = Math.max(0, ...activities.filter(a => a.type === "Run").map(a => (a.distance || 0) / 1000))
  const longestGym = Math.max(0, ...activities.filter(a => a.type === "WeightTraining" || a.type === "Workout").map(a => (a.duration || 0) / 60))
  const morningActivities = activities.filter(a => { const h = new Date(a.date).getHours(); return h >= 5 && h < 10 }).length
  const eveningActivities = activities.filter(a => { const h = new Date(a.date).getHours(); return h >= 18 && h < 23 }).length
  const weekendActivities = activities.filter(a => { const d = new Date(a.date).getDay(); return d === 0 || d === 6 }).length

  const dates = activities.map(a => new Date(a.date).toDateString())
  const uniqueDates = [...new Set(dates)].sort()
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (uniqueDates.includes(d.toDateString())) streak++
    else break
  }

  const { data: user } = await supabase.from("users").select("level").eq("strava_id", stravaId).single()

  return NextResponse.json({
   totalRunKm: Math.round(totalRunKm),
    totalCycleKm: Math.round(totalCycleKm),
    totalWalkKm: Math.round(totalWalkKm),
    gymSessions,
    totalCalories: Math.round(totalCalories),
    totalActivities,
    longestRun: Math.round(longestRun * 10) / 10,
    longestGym: Math.round(longestGym),
    morningActivities,
    eveningActivities,
    weekendActivities,
    streak,
    weekStreak: 0,
    tripleWeek: 0,
    level: user?.level || 1,
  })
}