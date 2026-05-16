New-Item -ItemType Directory -Force -Path "app\api\auth\strava"
New-Item -ItemType Directory -Force -Path "app\api\auth\callback"

Set-Content -Path "app\api\auth\strava\route.ts" -Value @'
import { NextResponse } from "next/server"

export async function GET() {
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback`,
    response_type: "code",
    approval_prompt: "auto",
    scope: "read,activity:read_all",
  })
  return NextResponse.redirect(
    `https://www.strava.com/oauth/authorize?${params}`
  )
}
'@

Set-Content -Path "app\api\auth\callback\route.ts" -Value @'
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
'@

Set-Content -Path "app\api\me\route.ts" -Value @'
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function GET() {
  const cookieStore = cookies()
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
    .limit(10)

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
'@

Set-Content -Path "app\api\sync\route.ts" -Value @'
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { calculateXP, xpToLevel } from "@/lib/xp"
import { cookies } from "next/headers"

export async function POST() {
  const cookieStore = cookies()
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
    "https://www.strava.com/api/v3/athlete/activities?per_page=10",
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
      const { xp, str, endStat, pwr } = calculateXP(act.type, act.distance, act.moving_time)
      await supabase.from("activities").insert({
        strava_id: act.id,
        user_strava_id: stravaId,
        name: act.name,
        type: act.type,
        distance: act.distance,
        duration: act.moving_time,
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
'@

Set-Content -Path "app\layout.tsx" -Value @'
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Gainquest",
  description: "Turn your workouts into legend",
  manifest: "/manifest.json",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
'@

Set-Content -Path "app\page.tsx" -Value @'
"use client"
import { useEffect, useState } from "react"

export default function Home() {
  const [userData, setUserData] = useState<any>(null)
  const [syncing, setSyncing] = useState(false)
  const [tab, setTab] = useState("home")
  const [partnerInput, setPartnerInput] = useState("")
  const [linking, setLinking] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const res = await fetch("/api/me")
    if (res.ok) {
      const data = await res.json()
      setUserData(data)
    }
    setLoading(false)
  }

  async function syncActivities() {
    setSyncing(true)
    await fetch("/api/sync", { method: "POST" })
    await fetchData()
    setSyncing(false)
  }

  async function linkPartner() {
    setLinking(true)
    await fetch("/api/link-partner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stravaId: userData?.user?.strava_id,
        partnerStravaId: parseInt(partnerInput),
      }),
    })
    await fetchData()
    setLinking(false)
  }

  const xpForNext = (level: number) => Math.pow(level, 2) * 100
  const xpProgress = (user: any) => {
    const prev = Math.pow(user.level - 1, 2) * 100
    const next = xpForNext(user.level)
    return Math.round(((user.xp - prev) / (next - prev)) * 100)
  }

  if (loading) return (
    <div style={styles.center}>
      <div style={styles.loadText}>⚔ Loading Gainquest...</div>
    </div>
  )

  if (!userData?.user) return (
    <div style={styles.center}>
      <div style={styles.loginCard}>
        <div style={styles.logo}>⚔ Gainquest</div>
        <div style={styles.tagline}>Turn your workouts into legend</div>
        <a href="/api/auth/strava" style={{...styles.stravaBtn, display: "block", textDecoration: "none", textAlign: "center"}}>
          Connect with Strava
        </a>
      </div>
    </div>
  )

  const user = userData?.user
  const partner = userData?.partner
  const activities = userData?.activities || []

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const myWeekXP = activities
    .filter((a: any) => new Date(a.date) >= weekStart)
    .reduce((sum: number, a: any) => sum + a.xp_earned, 0)

  return (
    <div style={styles.app}>
      <div style={styles.content}>

        {tab === "home" && user && (
          <div>
            <div style={styles.header}>
              <span style={styles.headerTitle}>⚔ Gainquest</span>
              <button style={styles.syncBtn} onClick={syncActivities} disabled={syncing}>
                {syncing ? "Syncing..." : "Sync Strava"}
              </button>
            </div>

            {partner && (
              <div style={styles.vsCard}>
                <div style={styles.vsPlayer}>
                  <div style={styles.vsEmoji}>{user.avatar || "🧙"}</div>
                  <div style={styles.vsLevel}>Lvl {user.level}</div>
                  <div style={styles.vsName}>You</div>
                  <div style={{...styles.vsXP, color: "#7F77DD"}}>{myWeekXP} XP</div>
                </div>
                <div style={styles.vsMiddle}>
                  <div style={styles.vsWeek}>this week</div>
                  <div style={styles.vsVS}>VS</div>
                  {myWeekXP > (partner.weekly_xp || 0)
                    ? <div style={styles.winning}>you are winning ⚔</div>
                    : <div style={styles.losing}>she is ahead 🏹</div>
                  }
                </div>
                <div style={styles.vsPlayer}>
                  <div style={styles.vsEmoji}>{partner.avatar || "🏹"}</div>
                  <div style={styles.vsLevel}>Lvl {partner.level}</div>
                  <div style={styles.vsName}>Her</div>
                  <div style={{...styles.vsXP, color: "#D85A30"}}>{partner.xp} XP</div>
                </div>
              </div>
            )}

            <div style={styles.heroCard}>
              <div style={styles.heroTop}>
                <div style={styles.avatarYou}>{user.avatar || "🧙"}</div>
                <div style={styles.heroInfo}>
                  <div style={styles.heroName}>{user.character_name || user.name}</div>
                  <div style={styles.heroClass}>Level {user.level} · {user.character_class} · {user.xp} XP</div>
                  <div style={styles.xpBarWrap}>
                    <div style={{...styles.xpBar, width: `${xpProgress(user)}%`, background: "#7F77DD"}} />
                  </div>
                  <div style={styles.xpLabel}>
                    <span>{user.xp} XP</span>
                    <span>{xpForNext(user.level)} to next level</span>
                  </div>
                </div>
              </div>
              <div style={styles.statRow}>
                <div style={styles.statBox}>
                  <div style={{...styles.statVal, color: "#534AB7"}}>{user.str}</div>
                  <div style={styles.statLbl}>STR</div>
                </div>
                <div style={styles.statBox}>
                  <div style={{...styles.statVal, color: "#0F6E56"}}>{user.end_stat}</div>
                  <div style={styles.statLbl}>END</div>
                </div>
                <div style={styles.statBox}>
                  <div style={{...styles.statVal, color: "#993C1D"}}>{user.pwr}</div>
                  <div style={styles.statLbl}>PWR</div>
                </div>
              </div>
            </div>

            {partner && (
              <div style={{...styles.heroCard, marginTop: 12}}>
                <div style={styles.heroTop}>
                  <div style={styles.avatarHer}>{partner.avatar || "🏹"}</div>
                  <div style={styles.heroInfo}>
                    <div style={styles.heroName}>{partner.character_name || partner.name}</div>
                    <div style={styles.heroClass}>Level {partner.level} · {partner.character_class} · {partner.xp} XP</div>
                    <div style={styles.xpBarWrap}>
                      <div style={{...styles.xpBar, width: `${xpProgress(partner)}%`, background: "#D85A30"}} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!partner && (
              <div style={styles.linkCard}>
                <div style={styles.linkTitle}>Link your partner</div>
                <div style={styles.linkSub}>Ask her to sign in to Gainquest, then enter her Strava ID</div>
                <input
                  style={styles.input}
                  placeholder="Her Strava ID"
                  value={partnerInput}
                  onChange={e => setPartnerInput(e.target.value)}
                />
                <button style={styles.linkBtn} onClick={linkPartner} disabled={linking}>
                  {linking ? "Linking..." : "Link Partner"}
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "feed" && (
          <div>
            <div style={styles.header}>
              <span style={styles.headerTitle}>⚔ Recent Battles</span>
            </div>
            {activities.map((act: any) => (
              <div key={act.id} style={styles.activityItem}>
                <div style={styles.activityIcon}>
                  {act.type === "Run" ? "🏃" : act.type === "Walk" ? "🚶" : "🏋️"}
                </div>
                <div style={styles.activityInfo}>
                  <div style={styles.activityName}>{act.name}</div>
                  <div style={styles.activityMeta}>
                    {act.distance ? `${(act.distance / 1000).toFixed(1)}km · ` : ""}
                    {Math.round(act.duration / 60)}min · {new Date(act.date).toLocaleDateString()}
                  </div>
                </div>
                <div style={styles.activityXP}>+{act.xp_earned} XP</div>
              </div>
            ))}
          </div>
        )}

        {tab === "profile" && user && (
          <div>
            <div style={styles.header}>
              <span style={styles.headerTitle}>⚔ Profile</span>
              <a href="/api/auth/signout" style={{...styles.signOutBtn, textDecoration: "none", display: "inline-block"}}>Sign out</a>
            </div>
            <div style={styles.profileCard}>
              <div style={styles.profileAvatar}>{user.avatar || "🧙"}</div>
              <div style={styles.profileName}>{user.character_name || user.name}</div>
              <div style={styles.profileSub}>Level {user.level} · {user.xp} XP total</div>
            </div>
            <div style={styles.stravaConnected}>
              ✅ Strava connected · Auto-syncing
            </div>
            <div style={styles.idCard}>
              <div style={styles.idLabel}>Your Strava ID (share with partner)</div>
              <div style={styles.idValue}>{user.strava_id}</div>
            </div>
          </div>
        )}

      </div>

      <div style={styles.nav}>
        <button style={{...styles.navBtn, ...(tab === "home" ? styles.navActive : {})}} onClick={() => setTab("home")}>
          <span style={styles.navIcon}>🏠</span>
          <span style={styles.navLabel}>home</span>
        </button>
        <button style={{...styles.navBtn, ...(tab === "feed" ? styles.navActive : {})}} onClick={() => setTab("feed")}>
          <span style={styles.navIcon}>⚔</span>
          <span style={styles.navLabel}>battles</span>
        </button>
        <button style={{...styles.navBtn, ...(tab === "profile" ? styles.navActive : {})}} onClick={() => setTab("profile")}>
          <span style={styles.navIcon}>👤</span>
          <span style={styles.navLabel}>profile</span>
        </button>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  app: { maxWidth: 430, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "system-ui, sans-serif", background: "#fff" },
  content: { flex: 1, overflowY: "auto", paddingBottom: 70 },
  center: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f5f5f5" },
  loadText: { fontSize: 20, color: "#534AB7" },
  loginCard: { background: "#fff", borderRadius: 16, padding: 40, textAlign: "center", boxShadow: "0 2px 20px rgba(0,0,0,0.1)" },
  logo: { fontSize: 32, fontWeight: 600, color: "#534AB7", marginBottom: 8 },
  tagline: { fontSize: 14, color: "#888", marginBottom: 24 },
  stravaBtn: { background: "#FC4C02", color: "#fff", border: "none", borderRadius: 8, padding: "12px 24px", fontSize: 15, fontWeight: 500, cursor: "pointer", width: "100%" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "0.5px solid #eee" },
  headerTitle: { fontSize: 17, fontWeight: 600, color: "#534AB7" },
  syncBtn: { background: "#534AB7", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer" },
  signOutBtn: { background: "none", color: "#999", border: "0.5px solid #ddd", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer" },
  vsCard: { margin: 12, background: "#f8f8f8", borderRadius: 12, padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between", border: "0.5px solid #eee" },
  vsPlayer: { textAlign: "center" },
  vsEmoji: { fontSize: 28 },
  vsLevel: { fontSize: 18, fontWeight: 600 },
  vsName: { fontSize: 11, color: "#999" },
  vsXP: { fontSize: 12, fontWeight: 500 },
  vsMiddle: { textAlign: "center" },
  vsWeek: { fontSize: 10, color: "#999", marginBottom: 4 },
  vsVS: { fontSize: 18, fontWeight: 700, color: "#333" },
  winning: { fontSize: 11, color: "#1D9E75", marginTop: 4 },
  losing: { fontSize: 11, color: "#D85A30", marginTop: 4 },
  heroCard: { margin: "12px 12px 0", background: "#f8f8f8", borderRadius: 12, padding: 14, border: "0.5px solid #eee" },
  heroTop: { display: "flex", gap: 12, marginBottom: 12 },
  avatarYou: { width: 52, height: 52, borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 },
  avatarHer: { width: 52, height: 52, borderRadius: "50%", background: "#FAECE7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 },
  heroInfo: { flex: 1 },
  heroName: { fontSize: 14, fontWeight: 600, color: "#333" },
  heroClass: { fontSize: 11, color: "#999", marginBottom: 6 },
  xpBarWrap: { background: "#e5e5e5", borderRadius: 20, height: 6, overflow: "hidden" },
  xpBar: { height: "100%", borderRadius: 20, transition: "width 0.6s ease" },
  xpLabel: { display: "flex", justifyContent: "space-between", fontSize: 10, color: "#999", marginTop: 4 },
  statRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 },
  statBox: { background: "#fff", borderRadius: 8, padding: 8, textAlign: "center", border: "0.5px solid #eee" },
  statVal: { fontSize: 18, fontWeight: 600 },
  statLbl: { fontSize: 10, color: "#999", marginTop: 2 },
  linkCard: { margin: 12, background: "#f8f8f8", borderRadius: 12, padding: 16, border: "0.5px solid #eee" },
  linkTitle: { fontSize: 14, fontWeight: 600, color: "#333", marginBottom: 4 },
  linkSub: { fontSize: 12, color: "#999", marginBottom: 12 },
  input: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "0.5px solid #ddd", fontSize: 14, marginBottom: 10, boxSizing: "border-box" as const },
  linkBtn: { background: "#534AB7", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer", width: "100%" },
  activityItem: { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "0.5px solid #f0f0f0" },
  activityIcon: { width: 38, height: 38, borderRadius: 8, background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 },
  activityInfo: { flex: 1 },
  activityName: { fontSize: 13, fontWeight: 500, color: "#333" },
  activityMeta: { fontSize: 11, color: "#999", marginTop: 2 },
  activityXP: { fontSize: 12, fontWeight: 600, color: "#534AB7" },
  profileCard: { margin: 16, background: "#EEEDFE", borderRadius: 12, padding: 24, textAlign: "center" },
  profileAvatar: { fontSize: 48, marginBottom: 8 },
  profileName: { fontSize: 18, fontWeight: 600, color: "#534AB7" },
  profileSub: { fontSize: 12, color: "#7F77DD", marginTop: 4 },
  stravaConnected: { margin: "0 16px 12px", fontSize: 13, color: "#1D9E75", background: "#E1F5EE", padding: "10px 14px", borderRadius: 8 },
  idCard: { margin: "0 16px", background: "#f8f8f8", borderRadius: 8, padding: 14, border: "0.5px solid #eee" },
  idLabel: { fontSize: 11, color: "#999", marginBottom: 4 },
  idValue: { fontSize: 18, fontWeight: 700, color: "#333", letterSpacing: 1 },
  nav: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, display: "flex", justifyContent: "space-around", borderTop: "0.5px solid #eee", background: "#fff", padding: "8px 0 12px" },
  navBtn: { background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", padding: "4px 20px", borderRadius: 8, color: "#999" },
  navActive: { color: "#534AB7" },
  navIcon: { fontSize: 22 },
  navLabel: { fontSize: 10 },
}
'@

Write-Host "✅ All files updated successfully!" -ForegroundColor Green