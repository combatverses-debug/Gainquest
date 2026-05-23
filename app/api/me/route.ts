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

  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("user_strava_id", stravaId)
    .order("date", { ascending: false })
    .limit(10000)

  let partner = null
  if (user?.partner_strava_id) {
    const { data: partnerData } = await supabase
      .from("users")
      .select("*")
      .eq("strava_id", user.partner_strava_id)
      .single()
    partner = partnerData
  }

  return NextResponse.json({ user, activities, partner })
}
