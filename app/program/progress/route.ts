import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const stravaId = cookieStore.get("strava_id")?.value
    if (!stravaId) return NextResponse.json({ program: null })

    const { data: program, error } = await supabase
      .from("programs")
      .select("*")
      .eq("user_strava_id", stravaId)
      .eq("active", true)
      .maybeSingle()

    if (error || !program) return NextResponse.json({ program: null })

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

    const weekKm = (acti