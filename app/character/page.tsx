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
  app: { maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#0a0a0f", fontFamily: "system-ui, sans-serif", paddingBottom: 80 },
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
  topMedals: { display: "flex", justifyContent: "center", gap: 8, marginTop