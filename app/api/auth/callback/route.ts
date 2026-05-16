import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")

  if (!code) return NextResponse.redirect(`${process.env.NEXTAUTH_URL}?error=no_code`)

  const tokenRes = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  })

  const tokens = await tokenRes.json()
  if (tokens.errors) return NextResponse.redirect(`${process.env.NEXTAUTH_URL}?error=token_failed`)

  const athlete = tokens.athlete
  const stravaId = athlete.id

  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("strava_id", stravaId)
    .single()

  if (!existing) {
    await supabase.from("users").insert({
      strava_id: stravaId,
      name: `${athlete.firstname} ${athlete.lastname}`,
      email: athlete.email ?? `${stravaId}@strava.com`,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_at,
      character_name: `${athlete.firstname} the Spellblade`,
      character_class: "Spellblade",
      avatar: "🧙",
    })
  } else {
    await supabase.from("users").update({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_at,
    }).eq("strava_id", stravaId)
  }

  const response = NextResponse.redirect(process.env.NEXTAUTH_URL!)
  response.cookies.set("strava_id", String(stravaId), {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 30,
  })

  return response
}
