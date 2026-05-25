"use client"
import { useEffect, useState } from "react"
import { LEVEL_TITLES, LEVEL_ITEMS, MEDALS } from "@/lib/levels"
import { xpForNextLevel } from "@/lib/xp"

export default function CharacterPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [view, setView] = useState<"front" | "back">("front")
  const [tab, setTab] = useState<"character" | "medals">("character")
  const [medalFilter, setMedalFilter] = useState("all")

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(d => setUser(d.user))
    fetch("/api/stats").then(r => r.json()).then(d => setStats(d))
  }, [])

  if (!user) return (
    <div style={s.center}>
      <div style={s.loading}>⚔ Loading character...</div>
    </div>
  )

  const level = user.level || 1
  const title = LEVEL_TITLES[level] || "Explorer"
  const charClass = user.character_class || "Spellblade"
  const isSpellblade = charClass === "Spellblade"
  const frontImg = isSpellblade ? "/characters/spellblade-front.png" : "/characters/wildrunner-front.png"
  const backImg = isSpellblade ? "/characters/spellblade-back.png" : "/characters/wildrunner-back.png"

  const unlockedItems = LEVEL_ITEMS.slice(1, level + 1).filter(Boolean)
  const lockedItems = LEVEL_ITEMS.slice(level + 1).filter(Boolean).slice(0, 4)

  const earnedMedals = stats ? MEDALS.filter(m => m.check(stats)) : []
  const topMedals = earnedMedals.slice(0, 3)

  const xpProgress = () => {
    const prev = Math.pow(level - 1, 2) * 100
    const next = xpForNextLevel(level)
    return Math.round(((user.xp - prev) / (next - prev)) * 100)
  }

  const filteredMedals = MEDALS.filter(m => medalFilter === "all" || m.cat === medalFilter)
  const nextMedal = stats ? MEDALS.find(m => !m.check(stats) && m.progress) : null

  const rarityColor: any = {
    common: "#888780",
    uncommon: "#1D9E75",
    rare: "#378ADD",
    epic: "#7F77DD",
    legendary: "#F5C475",
  }

  return (
    <div style={s.app}>
      <div style={s.tabRow}>
        <button style={{...s.tabBtn, ...(tab === "character" ? s.tabActive : {})}} onClick={() => setTab("character")}>Character</button>
        <button style={{...s.tabBtn, ...(tab === "medals" ? s.tabActive : {})}} onClick={() => setTab("medals")}>
          Medals {earnedMedals.length > 0 && <span style={s.medalBadge}>{earnedMedals.length}</span>}
        </button>
      </div>

      {tab === "character" && (
        <div style={s.content}>
          <div style={s.charHeader}>
            <div style={s.charName}>{user.character_name || user.name}</div>
            <div style={s.charTitle}>the {title}</div>
            <div style={s.topMedals}>
              {topMedals.map(m => <span key={m.id} style={s.topMedalBadge}>{m.icon}</span>)}
            </div>
          </div>

          <div style={s.charStage}>
            <div style={s.viewToggle}>
              <button style={{...s.viewBtn, ...(view === "front" ? s.viewActive : {})}} onClick={() => setView("front")}>Front</button>
              <button style={{...s.viewBtn, ...(view === "back" ? s.viewActive : {})}} onClick={() => setView("back")}>Back</button>
            </div>
            <div style={s.charImgWrap}>
              <img src={view === "front" ? frontImg : backImg} alt={charClass} style={s.charImg} />
            </div>
            <div style={s.statsOverlay}>
              <div style={s.statPill}><div style={{...s.statVal, color: "#7F77DD"}}>{user.str}</div><div style={s.statLbl}>STR</div></div>
              <div style={s.statPill}><div style={{...s.statVal, color: "#1D9E75"}}>{user.end_stat}</div><div style={s.statLbl}>END</div></div>
              <div style={s.statPill}><div style={{...s.statVal, color: "#D85A30"}}>{user.pwr}</div><div style={s.statLbl}>PWR</div></div>
            </div>
          </div>

          <div style={s.xpSection}>
            <div style={s.xpRow}>
              <span style={s.xpLbl}>Level {level}</span>
              <span style={s.xpLbl}>{user.xp} / {xpForNextLevel(level)} XP</span>
            </div>
            <div style={s.xpBarWrap}>
              <div style={{...s.xpBarFill, width: `${xpProgress()}%`}} />
            </div>
          </div>

          <div style={s.sectionTitle}>Unlocked items</div>
          <div style={s.itemsGrid}>
            {unlockedItems.map((item: any, i) => (
              <div key={i} style={s.itemCard}>
                <div style={s.itemIcon}>{item.icon}</div>
                <div style={s.itemName}>{item.name}</div>
                <div style={{...s.itemRarity, color: rarityColor[item.rarity]}}>{item.rarity}</div>
              </div>
            ))}
          </div>

          {lockedItems.length > 0 && (
            <>
              <div style={s.sectionTitle}>Coming up</div>
              <div style={s.itemsGrid}>
                {lockedItems.map((item: any, i) => (
                  <div key={i} style={{...s.itemCard, opacity: 0.4}}>
                    <div style={s.itemIcon}>{item.icon}</div>
                    <div style={s.itemName}>{item.name}</div>
                    <div style={s.itemLock}>Level {level + i + 1}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {tab === "medals" && (
        <div style={s.content}>
          <div style={s.medalHeader}>
            <div style={s.medalCount}>{earnedMedals.length} / {MEDALS.length} earned</div>
          </div>

          {stats && (
            <div style={s.statsRow}>
              <div style={s.statCard}><div style={{...s.statCardVal, color: "#7F77DD"}}>{stats.totalRunKm}km</div><div style={s.statCardLbl}>run</div></div>
              <div style={s.statCard}><div style={{...s.statCardVal, color: "#1D9E75"}}>{stats.gymSessions}</div><div style={s.statCardLbl}>gym</div></div>
              <div style={s.statCard}><div style={{...s.statCardVal, color: "#F5C475"}}>{stats.totalCalories.toLocaleString()}</div><div style={s.statCardLbl}>cals</div></div>
            </div>
          )}

          {nextMedal && stats && (
            <div style={s.nextMedal}>
              <div style={s.nextIcon}>{nextMedal.icon}</div>
              <div style={s.nextInfo}>
                <div style={s.nextName}>{nextMedal.name}</div>
                <div style={s.nextDesc}>{nextMedal.desc}</div>
                <div style={s.nextProgWrap}><div style={{...s.nextProgFill, width: `${Math.round(nextMedal.progress!(stats) * 100)}%`}} /></div>
                <div style={s.nextPct}>{Math.round(nextMedal.progress!(stats) * 100)}% complete</div>
              </div>
            </div>
          )}

          <div style={s.filterRow}>
            {["all", "running", "gym", "walking", "levels", "special"].map(f => (
              <button key={f} style={{...s.filterBtn, ...(medalFilter === f ? s.filterActive : {})}} onClick={() => setMedalFilter(f)}>{f}</button>
            ))}
          </div>

          <div style={s.medalsGrid}>
            {filteredMedals.map(medal => {
              const earned = stats ? medal.check(stats) : false
              const prog = stats && medal.progress ? medal.progress(stats) : 0
              const rc = { bronze: "#854F0B", silver: "#B4B2A9", gold: "#F5C475" }[medal.rarity as "bronze" | "silver" | "gold"] || "#534AB7"
              return (
                <div key={medal.id} style={{...s.medalCard, ...(earned ? { borderColor: rc, opacity: 1 } : { opacity: 0.4 })}}>
                  <div style={{...s.medalIconWrap, borderColor: rc}}>
                    <span style={{ fontSize: 26 }}>{medal.icon}</span>
                    {earned && <div style={s.earnedTick}>✓</div>}
                  </div>
                  <div style={s.medalName}>{medal.name}</div>
                  <div style={s.medalDesc}>{medal.desc}</div>
                  {!earned && prog > 0 && (
                    <div style={s.medalProg}><div style={{...s.medalProgFill, width: `${Math.round(prog * 100)}%`, background: rc}} /></div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div style={s.backBtn} onClick={() => window.location.href = "/"}>← Back to Gainquest</div>
    </div>
  )
}

const s: { [k: string]: React.CSSProperties } = {
  app: { maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#0a0810", fontFamily: "system-ui, sans-serif", paddingBottom: 80, backgroundImage: "radial-gradient(ellipse at 20% 20%, rgba(123,92,240,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(245,196,117,0.04) 0%, transparent 50%)" },
  center: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0a0a0f" },
  loading: { fontSize: 20, color: "#7F77DD" },
  tabRow: { display: "flex", borderBottom: "1px solid #1e1830", background: "#0a0a0f", position: "sticky", top: 0, zIndex: 10 },
  tabBtn: { flex: 1, padding: "14px", background: "none", border: "none", color: "#6b5a8a", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 },
  tabActive: { color: "#e8d5ff", borderBottom: "2px solid #534AB7" },
  medalBadge: { background: "#534AB7", color: "#fff", fontSize: 10, padding: "2px 6px", borderRadius: 20 },
  content: { padding: "16px" },
  charHeader: { textAlign: "center", marginBottom: 14 },
  charName: { fontSize: 20, fontWeight: 600, color: "#e8d5ff" },
  charTitle: { fontSize: 13, color: "#F5C475", marginTop: 2 },
    topMedals: { display: "flex", justifyContent: "center", gap: 8, marginTop: 8 },
  topMedalBadge: { fontSize: 20, background: "#1e1830", border: "1px solid #2a2040", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" },
  charStage: { background: "#12101a", borderRadius: 16, border: "1px solid #2a2040", padding: 14, marginBottom: 14, position: "relative", boxShadow: "0 0 24px rgba(123,92,240,0.1), inset 0 1px 0 rgba(155,127,232,0.08)" },
  viewToggle: { display: "flex", gap: 8, justifyContent: "center", marginBottom: 12 },
  viewBtn: { background: "#1e1830", border: "1px solid #3a2d60", color: "#9980cc", fontSize: 12, padding: "5px 16px", borderRadius: 20, cursor: "pointer" },
  viewActive: { background: "#534AB7", borderColor: "#7F77DD", color: "#fff" },
  charImgWrap: { display: "flex", justifyContent: "center" },
  charImg: { height: 260, objectFit: "contain" },
  statsOverlay: { position: "absolute", right: 14, top: 50, display: "flex", flexDirection: "column", gap: 6 },
  statPill: { background: "#1e1830", border: "1px solid #2a2040", borderRadius: 8, padding: "5px 10px", textAlign: "center" },
  statVal: { fontSize: 16, fontWeight: 600 },
  statLbl: { fontSize: 9, color: "#6b5a8a", marginTop: 1 },
  xpSection: { marginBottom: 16 },
  xpRow: { display: "flex", justifyContent: "space-between", marginBottom: 4 },
  xpLbl: { fontSize: 12, color: "#6b5a8a" },
  xpBarWrap: { background: "#1e1830", borderRadius: 20, height: 6, overflow: "hidden" },
  xpBarFill: { height: "100%", borderRadius: 20, background: "#534AB7", transition: "width 0.6s ease" },
  sectionTitle: { fontSize: 11, color: "#6b5a8a", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 10, marginTop: 16 },
  itemsGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 },
  itemCard: { background: "#12101a", border: "1px solid #2a2040", borderRadius: 10, padding: 10, display: "flex", alignItems: "center", gap: 10 },
  itemIcon: { fontSize: 22, flexShrink: 0 },
  itemName: { fontSize: 12, fontWeight: 500, color: "#e8d5ff", flex: 1 },
  itemRarity: { fontSize: 9, textTransform: "capitalize" as const },
  itemLock: { fontSize: 9, color: "#6b5a8a" },
  medalHeader: { display: "flex", justifyContent: "flex-end", marginBottom: 12 },
  medalCount: { background: "#1e1830", border: "1px solid #2a2040", color: "#9980cc", fontSize: 11, padding: "4px 12px", borderRadius: 20 },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 },
  statCard: { background: "#12101a", border: "1px solid #2a2040", borderRadius: 10, padding: 10, textAlign: "center" },
  statCardVal: { fontSize: 16, fontWeight: 600 },
  statCardLbl: { fontSize: 9, color: "#6b5a8a", marginTop: 2, textTransform: "uppercase" as const },
  nextMedal: { background: "#12101a", border: "1px solid #2a2040", borderRadius: 12, padding: 12, marginBottom: 12, display: "flex", alignItems: "center", gap: 12 },
  nextIcon: { width: 44, height: 44, borderRadius: "50%", background: "#1e1830", border: "2px solid #534AB7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 },
  nextInfo: { flex: 1 },
  nextName: { fontSize: 13, fontWeight: 500, color: "#e8d5ff" },
  nextDesc: { fontSize: 10, color: "#6b5a8a", marginTop: 2 },
  nextProgWrap: { background: "#1a1528", borderRadius: 20, height: 5, marginTop: 6 },
  nextProgFill: { height: "100%", borderRadius: 20, background: "#534AB7" },
  nextPct: { fontSize: 10, color: "#7F77DD", marginTop: 4 },
  filterRow: { display: "flex", gap: 6, marginBottom: 12, overflowX: "auto" as const, paddingBottom: 4 },
  filterBtn: { background: "#1e1830", border: "1px solid #2a2040", color: "#9980cc", fontSize: 11, padding: "4px 12px", borderRadius: 20, cursor: "pointer", whiteSpace: "nowrap" as const, flexShrink: 0 },
  filterActive: { background: "#534AB7", borderColor: "#7F77DD", color: "#fff" },
  medalsGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 },
  medalCard: { background: "#12101a", border: "1px solid #2a2040", borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  medalIconWrap: { width: 56, height: 56, borderRadius: "50%", background: "#1e1830", border: "2px solid #2a2040", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8, position: "relative" as const },
  earnedTick: { position: "absolute" as const, top: -3, right: -3, width: 16, height: 16, borderRadius: "50%", background: "#1D9E75", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff" },
  medalName: { fontSize: 12, fontWeight: 500, color: "#e8d5ff", marginBottom: 3 },
  medalDesc: { fontSize: 10, color: "#6b5a8a", lineHeight: "1.4" },
  medalProg: { width: "100%", background: "#1a1528", borderRadius: 20, height: 4, marginTop: 6 },
  medalProgFill: { height: "100%", borderRadius: 20 },
  backBtn: { textAlign: "center" as const, padding: "20px", color: "#6b5a8a", fontSize: 13, cursor: "pointer" },
}