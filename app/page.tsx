"use client"
import { useEffect, useState } from "react"

export default function Home() {
  const [userData, setUserData] = useState<any>(null)
  const [syncing, setSyncing] = useState(false)
  const [tab, setTab] = useState("home")
  const [loading, setLoading] = useState(true)
  const [selectedActivity, setSelectedActivity] = useState<any>(null)

  useEffect(() => {
    fetchData()
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
    }
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

  const xpForNext = (level: number) => Math.pow(level, 2) * 100
  const xpProgress = (user: any) => {
    const prev = Math.pow(user.level - 1, 2) * 100
    const next = xpForNext(user.level)
    return Math.round(((user.xp - prev) / (next - prev)) * 100)
  }

  const fmtPace = (speed: number) => {
    if (!speed) return "—"
    const minPerKm = 60 / (speed * 3.6)
    const mins = Math.floor(minPerKm)
    const secs = Math.round((minPerKm - mins) * 60)
    return `${mins}:${secs.toString().padStart(2, "0")}/km`
  }

  const fmtTime = (secs: number) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    if (h > 0) return `${h}h ${m}m`
    return `${m}m ${s}s`
  }

  const activityIcon = (type: string) => {
    if (type === "Run") return "🏃"
    if (type === "Walk") return "🚶"
    if (type === "WeightTraining" || type === "Workout") return "🏋️"
    return "⚡"
  }

  if (loading) return (
    <div style={s.center}>
      <img src="/Gainquest-trans-logo.png" style={{ height: 120, objectFit: "contain", marginBottom: 20 }} alt="Gainquest" />
      <div style={s.loadText}>Entering the realm...</div>
    </div>
  )

  if (!userData?.user) return (
    <div style={s.center}>
      <div style={s.loginCard}>
        <img src="/Gainquest-trans-logo.png" style={{ height: 140, objectFit: "contain", marginBottom: 16 }} alt="Gainquest" />
        <div style={s.tagline}>Turn your workouts into legend</div>
        <a href="/api/auth/strava" style={{ ...s.stravaBtn, display: "block", textDecoration: "none", textAlign: "center" }}>
          Connect with Strava
        </a>
      </div>
    </div>
  )

  const user = userData?.user
  const activities = userData?.activities || []

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const myWeekXP = activities
    .filter((a: any) => new Date(a.date) >= weekStart)
    .reduce((sum: number, a: any) => sum + a.xp_earned, 0)

  if (selectedActivity) {
    const act = selectedActivity
    return (
      <div style={s.app}>
        <div style={s.battleHeader}>
          <button style={s.backBtn2} onClick={() => setSelectedActivity(null)}>← Back</button>
          <div style={s.battleHeaderTitle}>Battle Record</div>
          <div />
        </div>

        <div style={{ padding: "16px" }}>
          <div style={s.battleHero}>
            <div style={s.cornerTL} /><div style={s.cornerTR} /><div style={s.cornerBL} /><div style={s.cornerBR} />
            <div style={{ fontSize: 40, marginBottom: 10 }}>{activityIcon(act.type)}</div>
            <div style={s.battleName}>{act.name}</div>
            <div style={s.battleDate}>{new Date(act.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</div>
            <div style={s.battleXPBig}>+{act.xp_earned} XP earned</div>
          </div>

          <div style={s.divider}>
            <div style={s.dividerLine} />
            <div style={s.dividerDiamond} />
            <div style={s.dividerText}>Battle Stats</div>
            <div style={s.dividerDiamond} />
            <div style={{ ...s.dividerLine, background: "linear-gradient(90deg,#2a1f45,transparent)" }} />
          </div>

          <div style={s.statsGrid}>
            <div style={s.statBig}>
              <div style={s.statBigVal}>{act.distance ? `${(act.distance / 1000).toFixed(2)}km` : "—"}</div>
              <div style={s.statBigLbl}>Distance</div>
            </div>
            <div style={s.statBig}>
              <div style={s.statBigVal}>{fmtTime(act.duration)}</div>
              <div style={s.statBigLbl}>Duration</div>
            </div>
            <div style={s.statBig}>
              <div style={{ ...s.statBigVal, color: "#9B7FE8" }}>{fmtPace(act.avg_speed || 0)}</div>
              <div style={s.statBigLbl}>Avg pace</div>
            </div>
            <div style={s.statBig}>
              <div style={{ ...s.statBigVal, color: "#F5C475" }}>{act.calories || "—"}</div>
              <div style={s.statBigLbl}>Calories</div>
            </div>
            <div style={s.statBig}>
              <div style={{ ...s.statBigVal, color: "#E24B4A" }}>{act.avg_heartrate ? `${Math.round(act.avg_heartrate)} bpm` : "—"}</div>
              <div style={s.statBigLbl}>Avg heart rate</div>
            </div>
            <div style={s.statBig}>
              <div style={{ ...s.statBigVal, color: "#E24B4A" }}>{act.max_heartrate ? `${Math.round(act.max_heartrate)} bpm` : "—"}</div>
              <div style={s.statBigLbl}>Max heart rate</div>
            </div>
            <div style={s.statBig}>
              <div style={{ ...s.statBigVal, color: "#4ECBA5" }}>{act.elevation_gain ? `${Math.round(act.elevation_gain)}m` : "—"}</div>
              <div style={s.statBigLbl}>Elevation gain</div>
            </div>
            <div style={s.statBig}>
              <div style={{ ...s.statBigVal, color: "#D85A30" }}>{act.suffer_score || act.relative_effort || "—"}</div>
              <div style={s.statBigLbl}>Suffer score</div>
            </div>
          </div>

    <a href={"https://www.strava.com/activities/" + act.strava_id} target="_blank" rel="noopener noreferrer" style={s.stravaLink}>{"View on Strava"}</a>
        </div>
      </div>
    )
  }

  return (
    <div style={s.app}>
      <div style={s.content}>

        {tab === "home" && (
          <div>
            <div style={{ textAlign: "center", padding: "16px 16px 0", borderBottom: "1px solid #1a1230" }}>
  <div style={{ fontSize: 10, color: "#4a3d6b", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 8 }}>The Ironveil Realm</div>
  <img src="/Gainquest-trans-logo.png" style={{ height: 100, objectFit: "contain", marginBottom: 10 }} alt="Gainquest" />
  <div style={{ paddingBottom: 12 }}>
    <button style={s.syncBtn} onClick={syncActivities} disabled={syncing}>
      {syncing ? "Syncing..." : "Sync Strava"}
    </button>
  </div>
</div>

            <div style={s.heroCard}>
              <div style={s.cornerTL} /><div style={s.cornerTR} /><div style={s.cornerBL} /><div style={s.cornerBR} />
              <div style={s.heroTop}>
                <div style={s.heroAvatar}>{user.avatar || "🧙"}</div>
                <div style={s.heroInfo}>
                  <div style={s.heroName}>{user.character_name || user.name}</div>
                  <div style={s.heroClass}>Level {user.level} · {user.character_class} · {user.xp} XP</div>
                  <div style={s.xpBarWrap}>
                    <div style={{ ...s.xpBarFill, width: `${xpProgress(user)}%` }} />
                  </div>
                  <div style={s.xpLabel}>
                    <span>{user.xp} XP</span>
                    <span>{xpForNext(user.level)} to level {user.level + 1}</span>
                  </div>
                </div>
              </div>
              <div style={s.statRow}>
                <div style={s.statPip}><div style={{ ...s.statVal, color: "#9B7FE8" }}>{user.str}</div><div style={s.statLbl}>STR</div></div>
                <div style={s.statPip}><div style={{ ...s.statVal, color: "#4ECBA5" }}>{user.end_stat}</div><div style={s.statLbl}>END</div></div>
                <div style={s.statPip}><div style={{ ...s.statVal, color: "#D85A30" }}>{user.pwr}</div><div style={s.statLbl}>PWR</div></div>
              </div>
            </div>

            <div style={s.divider}>
              <div style={s.dividerLine} />
              <div style={s.dividerDiamond} />
              <div style={s.dividerText}>Quick Access</div>
              <div style={s.dividerDiamond} />
              <div style={{ ...s.dividerLine, background: "linear-gradient(90deg,#2a1f45,transparent)" }} />
            </div>

            <div style={{ display: "flex", gap: 8, padding: "0 16px 14px" }}>
              <div style={s.quickCard} onClick={() => window.location.href = "/character"}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>🧙</div>
                <div style={s.quickTitle}>Character</div>
                <div style={s.quickSub}>& Medals</div>
              </div>
              <div style={s.quickCard} onClick={() => window.location.href = "/readiness"}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>⚔</div>
                <div style={s.quickTitle}>Battle</div>
                <div style={s.quickSub}>Readiness</div>
              </div>
              <div style={s.quickCard} onClick={() => window.location.href = "/program"}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>🔮</div>
                <div style={s.quickTitle}>Oracle</div>
                <div style={s.quickSub}>Program</div>
              </div>
              <div style={s.quickCard} onClick={() => window.location.href = "/calendar"}>
              <div style={s.quickTitle}>Calendar</div>
               <div style={s.quickSub}>Training history</div>
              </div>
            </div>
            <div style={s.quickCard} onClick={() => window.location.href = "/realms"}>
  <div style={s.quickTitle}>Realms</div>
  <div style={s.quickSub}>& Map</div>
</div>

            <div style={s.divider}>
              <div style={s.dividerLine} />
              <div style={s.dividerDiamond} />
              <div style={s.dividerText}>This Week</div>
              <div style={s.dividerDiamond} />
              <div style={{ ...s.dividerLine, background: "linear-gradient(90deg,#2a1f45,transparent)" }} />
            </div>

           <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, padding: "0 16px 14px" }}>
              <div style={s.weekStat}>
                <div style={{ ...s.weekStatVal, color: "#9B7FE8" }}>{myWeekXP}</div>
                <div style={s.weekStatLbl}>XP earned</div>
              </div>
              <div style={s.weekStat}>
                <div style={{ ...s.weekStatVal, color: "#4ECBA5" }}>
                  {activities.filter((a: any) => new Date(a.date) >= weekStart).length}
                </div>
                <div style={s.weekStatLbl}>Activities</div>
              </div>
              <div style={s.weekStat}>
                <div style={{ ...s.weekStatVal, color: "#F5C475" }}>
                  {Math.round(activities.filter((a: any) => new Date(a.date) >= weekStart && a.type === "Run").reduce((s: number, a: any) => s + (a.distance || 0), 0) / 1000 * 10) / 10}km
                </div>
                <div style={s.weekStatLbl}>Run this week</div>
              </div>
            </div>
          </div>
        )}

        {tab === "battles" && (
          <div>
            <div style={s.topBar}>
              <div>
                <div style={s.realm}>Chronicle of Deeds</div>
                <div style={s.tabTitle}>Recent Battles</div>
              </div>
            </div>
            {activities.length === 0 && (
              <div style={{ padding: 24, textAlign: "center", color: "#4a3d6b" }}>No battles yet — sync Strava to begin your chronicle</div>
            )}
            {activities.map((act: any) => (
              <div key={act.id} style={s.activityRow} onClick={() => setSelectedActivity(act)}>
                <div style={s.actIcon}>{activityIcon(act.type)}</div>
                <div style={s.actInfo}>
                  <div style={s.actName}>{act.name}</div>
                  <div style={s.actMeta}>
                    {act.distance ? `${(act.distance / 1000).toFixed(1)}km · ` : ""}
                    {fmtTime(act.duration)} · {new Date(act.date).toLocaleDateString("en-GB")}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={s.actXP}>+{act.xp_earned} XP</div>
                  <div style={{ fontSize: 10, color: "#4a3d6b", marginTop: 2 }}>tap for stats</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "profile" && user && (
          <div>
            <div style={s.topBar}>
              <div>
                <div style={s.realm}>Hall of the Chosen</div>
                <div style={s.tabTitle}>Your Champion</div>
              </div>
              <button style={s.signOutBtn} onClick={() => window.location.href = "/api/auth/signout"}>Sign out</button>
            </div>
            <div style={{ padding: "0 16px" }}>
              <div style={{ ...s.heroCard, textAlign: "center", padding: 24 }}>
                <div style={s.cornerTL} /><div style={s.cornerTR} /><div style={s.cornerBL} /><div style={s.cornerBR} />
                <div style={{ fontSize: 52, marginBottom: 10 }}>{user.avatar || "🧙"}</div>
                <div style={{ fontSize: 18, fontWeight: 500, color: "#e8d5ff", marginBottom: 4 }}>{user.character_name || user.name}</div>
                <div style={{ fontSize: 12, color: "#9B7FE8", marginBottom: 12 }}>Level {user.level} · {user.xp} XP total</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                  <span style={s.tag}>{user.character_class}</span>
                  <span style={s.tag}>Season III</span>
                </div>
              </div>

              <div style={{ ...s.stravaConnected, marginTop: 12 }}>
                ✅ Strava connected · Auto-syncing
              </div>

              <div style={s.idCard}>
                <div style={s.idLabel}>Your Strava ID</div>
                <div style={s.idValue}>{user.strava_id}</div>
              </div>
            </div>
          </div>
        )}

      </div>

      <div style={s.nav}>
        <button style={{ ...s.navBtn, ...(tab === "home" ? s.navActive : {}) }} onClick={() => setTab("home")}>
          <span style={s.navIcon}>🏰</span>
          <span style={s.navLabel}>realm</span>
        </button>
        <button style={{ ...s.navBtn, ...(tab === "battles" ? s.navActive : {}) }} onClick={() => setTab("battles")}>
          <span style={s.navIcon}>⚔</span>
          <span style={s.navLabel}>battles</span>
        </button>
        <button style={{ ...s.navBtn, ...(tab === "profile" ? s.navActive : {}) }} onClick={() => setTab("profile")}>
          <span style={s.navIcon}>👤</span>
          <span style={s.navLabel}>champion</span>
        </button>
      </div>
    </div>
  )
}

const s: { [k: string]: React.CSSProperties } = {
  app: { maxWidth: 430, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "system-ui, sans-serif", background: "#0a0810" },
  content: { flex: 1, overflowY: "auto", paddingBottom: 70 },
  center: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0a0810" },
  loadText: { fontSize: 16, color: "#9B7FE8" },
  loginCard: { background: "#0e0b1a", border: "1px solid #2a1f45", borderRadius: 16, padding: 40, textAlign: "center", margin: 20 },
  tagline: { fontSize: 13, color: "#4a3d6b", marginBottom: 24 },
  stravaBtn: { background: "#FC4C02", color: "#fff", border: "none", borderRadius: 8, padding: "12px 24px", fontSize: 15, fontWeight: 500, cursor: "pointer", width: "100%" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px 10px", borderBottom: "1px solid #1a1230" },
  realm: { fontSize: 10, color: "#4a3d6b", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 2 },
  tabTitle: { fontSize: 18, fontWeight: 500, color: "#F5C475" },
  syncBtn: { background: "#1a1230", color: "#9B7FE8", border: "1px solid #3d2d6b", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer" },
  signOutBtn: { background: "none", color: "#4a3d6b", border: "1px solid #2a1f45", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer" },
  heroCard: { margin: "14px 16px", background: "#0e0b1a", border: "1px solid #2a1f45", borderRadius: 12, padding: 14, position: "relative" as const },
  cornerTL: { position: "absolute" as const, top: 8, left: 8, width: 12, height: 12, borderTop: "1px solid #F5C475", borderLeft: "1px solid #F5C475" },
  cornerTR: { position: "absolute" as const, top: 8, right: 8, width: 12, height: 12, borderTop: "1px solid #F5C475", borderRight: "1px solid #F5C475" },
  cornerBL: { position: "absolute" as const, bottom: 8, left: 8, width: 12, height: 12, borderBottom: "1px solid #F5C475", borderLeft: "1px solid #F5C475" },
  cornerBR: { position: "absolute" as const, bottom: 8, right: 8, width: 12, height: 12, borderBottom: "1px solid #F5C475", borderRight: "1px solid #F5C475" },
  heroTop: { display: "flex", gap: 12, marginBottom: 12 },
  heroAvatar: { width: 54, height: 54, borderRadius: "50%", background: "#1a1230", border: "2px solid #7B5CF0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 },
  heroInfo: { flex: 1 },
  heroName: { fontSize: 15, fontWeight: 500, color: "#e8d5ff" },
  heroClass: { fontSize: 11, color: "#4a3d6b", marginBottom: 6 },
  xpBarWrap: { background: "#1a1230", borderRadius: 20, height: 6, overflow: "hidden", border: "1px solid #2a1f45" },
  xpBarFill: { height: "100%", borderRadius: 20, background: "linear-gradient(90deg, #534AB7, #9B7FE8)", transition: "width 0.6s ease" },
  xpLabel: { display: "flex", justifyContent: "space-between", fontSize: 10, color: "#4a3d6b", marginTop: 4 },
  statRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 },
  statPip: { background: "#120d20", border: "1px solid #2a1f45", borderRadius: 8, padding: 8, textAlign: "center" },
  statVal: { fontSize: 18, fontWeight: 500 },
  statLbl: { fontSize: 9, color: "#4a3d6b", marginTop: 2, textTransform: "uppercase" as const, letterSpacing: "0.06em" },
  divider: { display: "flex", alignItems: "center", gap: 8, margin: "12px 16px" },
  dividerLine: { flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #2a1f45)" },
  dividerDiamond: { width: 6, height: 6, background: "#F5C475", transform: "rotate(45deg)", flexShrink: 0 },
  dividerText: { fontSize: 10, color: "#F5C475", letterSpacing: "0.12em", textTransform: "uppercase" as const, flexShrink: 0 },
  quickCard: { flex: 1, background: "#0e0b1a", border: "1px solid #2a1f45", borderRadius: 10, padding: "12px 8px", textAlign: "center", cursor: "pointer" },
  quickTitle: { fontSize: 12, fontWeight: 500, color: "#e8d5ff" },
  quickSub: { fontSize: 10, color: "#4a3d6b", marginTop: 2 },
  weekStat: { flex: 1, background: "#0e0b1a", border: "1px solid #2a1f45", borderRadius: 10, padding: 12, textAlign: "center" },
  weekStatVal: { fontSize: 18, fontWeight: 500 },
  weekStatLbl: { fontSize: 10, color: "#4a3d6b", marginTop: 2 },
  activityRow: { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid #150f22", cursor: "pointer" },
  actIcon: { width: 40, height: 40, borderRadius: 8, background: "#1a1230", border: "1px solid #3d2d6b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 },
  actInfo: { flex: 1 },
  actName: { fontSize: 13, fontWeight: 500, color: "#e8d5ff" },
  actMeta: { fontSize: 11, color: "#4a3d6b", marginTop: 2 },
  actXP: { fontSize: 13, fontWeight: 500, color: "#9B7FE8" },
  battleHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid #1a1230", background: "#080612" },
  battleHeaderTitle: { fontSize: 16, fontWeight: 500, color: "#F5C475" },
  backBtn2: { background: "none", border: "none", color: "#9B7FE8", fontSize: 14, cursor: "pointer" },
  battleHero: { background: "#0e0b1a", border: "1px solid #2a1f45", borderRadius: 12, padding: 24, textAlign: "center", marginBottom: 16, position: "relative" as const },
  battleName: { fontSize: 18, fontWeight: 500, color: "#e8d5ff", marginBottom: 6 },
  battleDate: { fontSize: 12, color: "#4a3d6b", marginBottom: 10 },
  battleXPBig: { fontSize: 20, fontWeight: 500, color: "#9B7FE8" },
  statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 },
  statBig: { background: "#0e0b1a", border: "1px solid #2a1f45", borderRadius: 10, padding: 14, textAlign: "center" },
  statBigVal: { fontSize: 20, fontWeight: 500, color: "#e8d5ff" },
  statBigLbl: { fontSize: 10, color: "#4a3d6b", marginTop: 4, textTransform: "uppercase" as const, letterSpacing: "0.06em" },
  stravaLink: { display: "block", textAlign: "center", padding: "12px", background: "#1a1230", border: "1px solid #3d2d6b", borderRadius: 8, color: "#FC4C02", fontSize: 14, textDecoration: "none" },
  stravaConnected: { background: "#0e0b1a", border: "1px solid #1D9E75", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#4ECBA5", marginBottom: 10 },
  idCard: { background: "#0e0b1a", border: "1px solid #2a1f45", borderRadius: 8, padding: 14, marginBottom: 12 },
  idLabel: { fontSize: 11, color: "#4a3d6b", marginBottom: 4 },
  idValue: { fontSize: 18, fontWeight: 500, color: "#e8d5ff", letterSpacing: 1 },
  tag: { fontSize: 11, background: "#1a1230", border: "1px solid #3d2d6b", color: "#9B7FE8", padding: "4px 10px", borderRadius: 20 },
  nav: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, display: "flex", justifyContent: "space-around", borderTop: "1px solid #1a1230", background: "#0a0810", padding: "8px 0 12px" },
  navBtn: { background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", padding: "4px 20px", borderRadius: 8, color: "#4a3d6b" },
  navActive: { color: "#F5C475" },
  navIcon: { fontSize: 22 },
  navLabel: { fontSize: 10, letterSpacing: "0.05em" },
}