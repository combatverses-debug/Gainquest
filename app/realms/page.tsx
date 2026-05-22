"use client"
import { useEffect, useState } from "react"

const RUN_LOCATIONS = [
  { name: "Ironhold Village", km: 0, icon: "🏘", item: "Worn Boots", itemIcon: "👟", stat: "+2 END", rarity: "Common", rarityColor: "#888780", lore: "A humble village of forge workers at the edge of the known realm. Every hero's journey begins here." },
  { name: "Ashenveil Forest", km: 80, icon: "🌲", item: "Forest Cloak", itemIcon: "🧥", stat: "+5 END", rarity: "Uncommon", rarityColor: "#1D9E75", lore: "An ancient forest where the trees whisper forgotten names. Strange lights flicker between the trunks at night." },
  { name: "Grimstone Keep", km: 180, icon: "⚔", item: "Chain Vest", itemIcon: "⚙", stat: "+8 PWR", rarity: "Rare", rarityColor: "#378ADD", lore: "A crumbling fortress carved from black rock. Only the truly strong dare enter its gates." },
  { name: "Duskwall Citadel", km: 300, icon: "🏰", item: "Voidblade", itemIcon: "⚔", stat: "+12 STR", rarity: "Epic", rarityColor: "#9B7FE8", lore: "A towering citadel at the crossroads of the realm. Its walls have never been breached." },
  { name: "The Ashpeaks", km: 450, icon: "⛰", item: "Ascendant Wings", itemIcon: "🪽", stat: "+20 all", rarity: "Legendary", rarityColor: "#F5C475", lore: "Jagged peaks that pierce the clouds. Ancient dragons nest in the highest crags." },
  { name: "The Void Throne", km: 650, icon: "👑", item: "Deathless Crown", itemIcon: "☠", stat: "+50 all", rarity: "Mythic", rarityColor: "#854F0B", lore: "At the edge of the realm sits the Void Throne — a seat carved from the bones of a dead god. No hero has ever returned." },
]

const CYCLE_LOCATIONS = [
  { name: "Greengate", km: 0, mapKm: 0, icon: "🏘", item: "Traveller's Wheel", itemIcon: "🔧", stat: "+2 END", rarity: "Common", rarityColor: "#888780", lore: "A market town at the start of the great cycling roads. Merchants and adventurers pass through daily." },
  { name: "Windmere Plains", km: 200, mapKm: 60, icon: "🌾", item: "Windplate Armour", itemIcon: "🛡", stat: "+6 END", rarity: "Uncommon", rarityColor: "#1D9E75", lore: "Rolling green plains swept by constant wind. Cyclists speak of the legendary tailwind that carries you forward." },
  { name: "Stonepedal Pass", km: 500, mapKm: 150, icon: "🪨", item: "Stoneguard Helm", itemIcon: "⛑", stat: "+10 PWR", rarity: "Rare", rarityColor: "#378ADD", lore: "A mountain pass carved by ancient giants. The road is treacherous but the views are breathtaking." },
  { name: "Highpass Summit", km: 900, mapKm: 270, icon: "🏔", item: "Highwind Cape", itemIcon: "🌪", stat: "+15 STR", rarity: "Epic", rarityColor: "#9B7FE8", lore: "The highest point of the known cycling world. Few have reached it. Fewer have returned unchanged." },
  { name: "The Summit", km: 1500, mapKm: 450, icon: "👑", item: "Champion's Crown", itemIcon: "🏆", stat: "+30 all", rarity: "Legendary", rarityColor: "#F5C475", lore: "The legendary summit where cycling gods are born. Reaching here means you have conquered the winds of the realm." },
]

const WEEKLY_BOSSES = [
  { name: "Vexar the Crusher", icon: "💀", hp: 6000, tier: "Bronze" },
  { name: "Gorrath the Stone Fist", icon: "👹", hp: 8000, tier: "Iron" },
  { name: "Malachar the Ironborn", icon: "💀", hp: 10000, tier: "Iron" },
  { name: "Dreadmaw the Unbroken", icon: "🐲", hp: 14000, tier: "Steel" },
  { name: "Void Sentinel Prime", icon: "👁", hp: 20000, tier: "Void" },
]

const BOSS_REWARDS = [
  { item: "Iron Gauntlets", icon: "🤜", stat: "+8 PWR", rarity: "Rare", rarityColor: "#378ADD", xp: 500 },
  { item: "Stonefist Bracers", icon: "💪", stat: "+10 PWR", rarity: "Rare", rarityColor: "#378ADD", xp: 600 },
  { item: "Malachar's Helm", icon: "⛑", stat: "+12 PWR", rarity: "Epic", rarityColor: "#9B7FE8", xp: 800 },
  { item: "Dreadmaw Scale", icon: "🐉", stat: "+15 STR", rarity: "Epic", rarityColor: "#9B7FE8", xp: 1000 },
  { item: "Void Core", icon: "🔮", stat: "+20 all", rarity: "Legendary", rarityColor: "#F5C475", xp: 1500 },
]

export default function RealmsPage() {
  const [tab, setTab] = useState("run")
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/stats").then(r => r.json()).then(d => {
      setStats(d)
      setLoading(false)
    })
  }, [])

  const getWeekNumber = () => {
    const start = new Date(2026, 0, 1)
    const now = new Date()
    return Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000))
  }

  const weekNum = getWeekNumber()
  const boss = WEEKLY_BOSSES[weekNum % WEEKLY_BOSSES.length]
  const bossReward = BOSS_REWARDS[weekNum % BOSS_REWARDS.length]

  const runKm = stats?.totalRunKm || 0
  const cycleKm = stats?.totalCycleKm || 0
  const cycleMapKm = Math.round(cycleKm / 3.3)
  const gymSessions = stats?.gymSessions || 0
  const gymCalories = stats?.totalCalories || 0

  const gymDamage = Math.min((gymSessions * 400) + (gymCalories * 0.3), boss.hp)
  const bossHpRemaining = Math.max(boss.hp - gymDamage, 0)
  const bossHpPct = Math.round((bossHpRemaining / boss.hp) * 100)
  const bossDamagePct = 100 - bossHpPct

  const getCurrentRunLoc = () => {
    for (let i = RUN_LOCATIONS.length - 1; i >= 0; i--) {
      if (runKm >= RUN_LOCATIONS[i].km) return i
    }
    return 0
  }

  const getCurrentCycleLoc = () => {
    for (let i = CYCLE_LOCATIONS.length - 1; i >= 0; i--) {
      if (cycleMapKm >= CYCLE_LOCATIONS[i].mapKm) return i
    }
    return 0
  }

  const runLocIdx = getCurrentRunLoc()
  const cycleLocIdx = getCurrentCycleLoc()
  const currentRunLoc = RUN_LOCATIONS[runLocIdx]
  const nextRunLoc = RUN_LOCATIONS[Math.min(runLocIdx + 1, RUN_LOCATIONS.length - 1)]
  const currentCycleLoc = CYCLE_LOCATIONS[cycleLocIdx]
  const nextCycleLoc = CYCLE_LOCATIONS[Math.min(cycleLocIdx + 1, CYCLE_LOCATIONS.length - 1)]

  const runProgress = runLocIdx < RUN_LOCATIONS.length - 1
    ? Math.round(((runKm - currentRunLoc.km) / (nextRunLoc.km - currentRunLoc.km)) * 100)
    : 100

  const cycleProgress = cycleLocIdx < CYCLE_LOCATIONS.length - 1
    ? Math.round(((cycleMapKm - currentCycleLoc.mapKm) / (nextCycleLoc.mapKm - currentCycleLoc.mapKm)) * 100)
    : 100

  const getDaysUntilReset = () => {
    const now = new Date()
    const sunday = new Date()
    sunday.setDate(now.getDate() + (7 - now.getDay()) % 7)
    sunday.setHours(0, 0, 0, 0)
    const diff = sunday.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    return `${days}d ${hours}h`
  }

  if (loading) return (
    <div style={s.center}>
      <div style={s.loading}>⚔ Loading the realms...</div>
    </div>
  )

  return (
    <div style={s.app}>
      <div style={s.topBar}>
        <div style={s.realm}>Gainquest</div>
        <div style={s.tabTitle}>The Realms</div>
      </div>

      <div style={s.tabs}>
        <button style={{...s.tab, ...(tab === "run" ? s.tabActive : {})}} onClick={() => setTab("run")}>
          <span style={s.tabIcon}>🏃</span>
          <span>Running</span>
        </button>
        <button style={{...s.tab, ...(tab === "cycle" ? s.tabActive : {})}} onClick={() => setTab("cycle")}>
          <span style={s.tabIcon}>🚴</span>
          <span>Cycling</span>
        </button>
        <button style={{...s.tab, ...(tab === "gym" ? s.tabActive : {})}} onClick={() => setTab("gym")}>
          <span style={s.tabIcon}>⚔</span>
          <span>Gym</span>
        </button>
      </div>

      {tab === "run" && (
        <div style={s.content}>
          <div style={s.progressBanner}>
            <div>
              <div style={s.pbTitle}>The Ironveil Realm</div>
              <div style={s.xpBarWrap}>
                <div style={{...s.xpBarFill, width: `${(runKm / 650) * 100}%`, background: "linear-gradient(90deg,#534AB7,#9B7FE8)"}} />
              </div>
            </div>
            <div style={{textAlign: "right"}}>
              <div style={{fontSize: 16, fontWeight: 500, color: "#9B7FE8"}}>{runKm}km</div>
              <div style={{fontSize: 10, color: "#4a3d6b"}}>of 650km</div>
            </div>
          </div>

          <div style={s.mapWrap}>
            <svg width="100%" viewBox="0 0 380 300" xmlns="http://www.w3.org/2000/svg">
              <rect width="380" height="300" fill="#12101e"/>
              <ellipse cx="55" cy="245" rx="45" ry="30" fill="#0e1a10" stroke="#1a2a1a" stroke-width="0.5"/>
              <ellipse cx="305" cy="210" rx="40" ry="48" fill="#0e1a10" stroke="#1a2a1a" stroke-width="0.5"/>
              <ellipse cx="185" cy="148" rx="52" ry="26" fill="#0e1a10" stroke="#1a2a1a" stroke-width="0.5"/>
              <polygon points="278,48 288,28 298,48" fill="#1a1535" stroke="#2a2045" stroke-width="0.5"/>
              <polygon points="293,44 306,20 319,44" fill="#1a1535" stroke="#2a2045" stroke-width="0.5"/>
              <polygon points="48,78 58,56 68,78" fill="#1a1535" stroke="#2a2045" stroke-width="0.5"/>
              <path d="M185 272 Q172 232 155 195 Q140 160 153 130 Q163 108 182 88 Q200 70 196 42" fill="none" stroke="#2a1f45" stroke-width="2" stroke-dasharray="4,3"/>
              {RUN_LOCATIONS.map((loc, i) => {
                const positions = [{x:185,y:272},{x:152,y:195},{x:150,y:128},{x:182,y:88},{x:196,y:55},{x:196,y:25}]
                const pos = positions[i]
                const visited = runKm >= loc.km
                const current = i === runLocIdx
                return (
                  <g key={i}>
                    {i < runLocIdx && (
                      <line
                        x1={positions[i].x} y1={positions[i].y}
                        x2={positions[Math.min(i+1, positions.length-1)].x}
                        y2={positions[Math.min(i+1, positions.length-1)].y}
                        stroke="#534AB7" strokeWidth="2.5" strokeLinecap="round"
                      />
                    )}
                    <circle cx={pos.x} cy={pos.y} r={current ? 10 : 7}
                      fill={visited ? (i === 0 ? "#0F6E56" : "#534AB7") : "#1a1535"}
                      stroke={visited ? (i === 0 ? "#4ECBA5" : "#9B7FE8") : "#2a2045"}
                      strokeWidth={current ? 2 : 1}
                    />
                    {current && <circle cx={pos.x} cy={pos.y} r="16" fill="none" stroke="#9B7FE8" strokeWidth="1" strokeDasharray="3,2" opacity="0.5"/>}
                    <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill={visited ? "#fff" : "#4a3d6b"} fontSize="9">{visited ? "✦" : "·"}</text>
                    <text x={pos.x} y={pos.y + 18} textAnchor="middle" fill={visited ? (current ? "#9B7FE8" : "#4ECBA5") : "#3d2d6b"} fontSize="8">{loc.name}</text>
                    <text x={pos.x} y={pos.y + 27} textAnchor="middle" fill="#2a1f45" fontSize="7">{loc.km}km</text>
                  </g>
                )
              })}
              <text x="20" y="294" fill="#2a1f45" fontSize="7">THE IRONVEIL REALM · RUNNING</text>
            </svg>
          </div>

          <div style={s.locCard}>
            <div style={s.cornerTL}/><div style={s.cornerTR}/><div style={s.cornerBL}/><div style={s.cornerBR}/>
            <div style={{padding: 4}}>
              <div style={s.locName}>📍 {currentRunLoc.name}</div>
              <div style={s.locLore}>{currentRunLoc.lore}</div>
              {runLocIdx < RUN_LOCATIONS.length - 1 && (
                <>
                  <div style={s.locReward}>
                    <span style={{fontSize: 11, color: "#F5C475"}}>Next reward at {nextRunLoc.km}km:</span>
                    <span style={{fontSize: 11, color: nextRunLoc.rarityColor, marginLeft: 6}}>{nextRunLoc.itemIcon} {nextRunLoc.item} ({nextRunLoc.stat})</span>
                  </div>
                  <div style={s.xpBarWrap}>
                    <div style={{...s.xpBarFill, width: `${runProgress}%`, background: "linear-gradient(90deg,#534AB7,#9B7FE8)"}}/>
                  </div>
                  <div style={s.progLabels}>
                    <span>{runKm}km / {nextRunLoc.km}km</span>
                    <span>{runProgress}%</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div style={s.divider}>
            <div style={s.divLine}/><div style={s.divDiamond}/><div style={s.divText}>Unlocked items</div><div style={s.divDiamond}/><div style={s.divLineR}/>
          </div>

          <div style={s.itemGrid}>
            {RUN_LOCATIONS.filter(l => runKm >= l.km).map((loc, i) => (
              <div key={i} style={s.itemCard}>
                <div style={s.itemIcon}>{loc.itemIcon}</div>
                <div style={s.itemName}>{loc.item}</div>
                <span style={{...s.rarityBadge, color: loc.rarityColor, background: "#1a1230"}}>{loc.rarity}</span>
                <div style={s.itemStat}>{loc.stat}</div>
              </div>
            ))}
            {RUN_LOCATIONS.filter(l => runKm < l.km).map((loc, i) => (
              <div key={i} style={{...s.itemCard, opacity: 0.35}}>
                <div style={s.itemIcon}>{loc.itemIcon}</div>
                <div style={s.itemName}>{loc.item}</div>
                <span style={{...s.rarityBadge, color: loc.rarityColor, background: "#1a1230"}}>{loc.rarity}</span>
                <div style={{fontSize: 10, color: "#4a3d6b", marginTop: 4}}>🔒 {loc.km}km</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "cycle" && (
        <div style={s.content}>
          <div style={{...s.progressBanner, borderColor: "#1a3020"}}>
            <div>
              <div style={s.pbTitle}>The Windswept Kingdoms</div>
              <div style={s.xpBarWrap}>
                <div style={{...s.xpBarFill, width: `${(cycleMapKm / 450) * 100}%`, background: "linear-gradient(90deg,#0F6E56,#4ECBA5)"}}/>
              </div>
            </div>
            <div style={{textAlign: "right"}}>
              <div style={{fontSize: 16, fontWeight: 500, color: "#4ECBA5"}}>{cycleKm}km</div>
              <div style={{fontSize: 10, color: "#4a3d6b"}}>cycled · {cycleMapKm}km on map</div>
            </div>
          </div>

          <div style={{background: "#0e1a10", border: "1px solid #1a3020", borderRadius: 8, padding: "10px 12px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10}}>
            <span style={{fontSize: 18}}>🚴</span>
            <div>
              <div style={{fontSize: 12, color: "#4ECBA5", fontWeight: 500}}>3.3km cycled = 1km on map</div>
              <div style={{fontSize: 11, color: "#4a3d6b", marginTop: 2}}>Cycling covers more ground — need more distance to progress</div>
            </div>
          </div>

          <div style={s.mapWrap}>
            <svg width="100%" viewBox="0 0 380 280" xmlns="http://www.w3.org/2000/svg">
              <rect width="380" height="280" fill="#0f1a10"/>
              <ellipse cx="58" cy="225" rx="48" ry="32" fill="#0a1a0a" stroke="#0f2a0f" stroke-width="0.5"/>
              <ellipse cx="308" cy="188" rx="42" ry="46" fill="#0a1a0a" stroke="#0f2a0f" stroke-width="0.5"/>
              <ellipse cx="188" cy="135" rx="52" ry="26" fill="#0a1a0a" stroke="#0f2a0f" stroke-width="0.5"/>
              <path d="M188 255 Q174 218 158 180 Q142 145 156 115 Q168 90 188 72 Q208 55 205 28" fill="none" stroke="#0f3a1f" stroke-width="2" stroke-dasharray="4,3"/>
              {CYCLE_LOCATIONS.map((loc, i) => {
                const positions = [{x:188,y:255},{x:155,y:178},{x:153,y:112},{x:186,y:72},{x:205,y:28}]
                const pos = positions[i]
                const visited = cycleMapKm >= loc.mapKm
                const current = i === cycleLocIdx
                return (
                  <g key={i}>
                    {i < cycleLocIdx && (
                      <line
                        x1={positions[i].x} y1={positions[i].y}
                        x2={positions[Math.min(i+1,positions.length-1)].x}
                        y2={positions[Math.min(i+1,positions.length-1)].y}
                        stroke="#0F6E56" strokeWidth="2.5" strokeLinecap="round"
                      />
                    )}
                    <circle cx={pos.x} cy={pos.y} r={current ? 10 : 7}
                      fill={visited ? "#0F6E56" : "#0a1a0a"}
                      stroke={visited ? "#4ECBA5" : "#0f2a0f"}
                      strokeWidth={current ? 2 : 1}
                    />
                    {current && <circle cx={pos.x} cy={pos.y} r="16" fill="none" stroke="#4ECBA5" strokeWidth="1" strokeDasharray="3,2" opacity="0.5"/>}
                    <text x={pos.x} y={pos.y+4} textAnchor="middle" fill={visited ? "#fff" : "#1a3a1a"} fontSize="9">{visited ? "✦" : "·"}</text>
                    <text x={pos.x} y={pos.y+18} textAnchor="middle" fill={visited ? (current ? "#4ECBA5" : "#1D9E75") : "#0f2a0f"} fontSize="8">{loc.name}</text>
                    <text x={pos.x} y={pos.y+27} textAnchor="middle" fill="#0f2a0f" fontSize="7">{loc.km}km cycled</text>
                  </g>
                )
              })}
              <text x="20" y="274" fill="#0f2a0f" fontSize="7">THE WINDSWEPT KINGDOMS · CYCLING</text>
            </svg>
          </div>

          <div style={{...s.locCard, borderColor: "#1a3020"}}>
            <div style={{padding: 4}}>
              <div style={{...s.locName, color: "#4ECBA5"}}>📍 {currentCycleLoc.name}</div>
              <div style={s.locLore}>{currentCycleLoc.lore}</div>
              {cycleLocIdx < CYCLE_LOCATIONS.length - 1 && (
                <>
                  <div style={s.locReward}>
                    <span style={{fontSize: 11, color: "#4ECBA5"}}>Next at {nextCycleLoc.km}km cycled:</span>
                    <span style={{fontSize: 11, color: nextCycleLoc.rarityColor, marginLeft: 6}}>{nextCycleLoc.itemIcon} {nextCycleLoc.item}</span>
                  </div>
                  <div style={s.xpBarWrap}>
                    <div style={{...s.xpBarFill, width: `${cycleProgress}%`, background: "linear-gradient(90deg,#0F6E56,#4ECBA5)"}}/>
                  </div>
                  <div style={s.progLabels}>
                    <span>{cycleKm}km cycled / {nextCycleLoc.km}km</span>
                    <span>{cycleProgress}%</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "gym" && (
        <div style={s.content}>
          <div style={s.weeklyReset}>⏱ Weekly boss resets in {getDaysUntilReset()}</div>

          <div style={s.bossCard}>
            <div style={{textAlign: "center", fontSize: 52, marginBottom: 10}}>{boss.icon}</div>
            <div style={s.bossName}>{boss.name}</div>
            <div style={s.bossSub}>Week {weekNum % WEEKLY_BOSSES.length + 1} Boss · {boss.tier} Tier · Resets Sunday midnight</div>
            <div style={s.bossHpWrap}>
              <div style={{...s.bossHpFill, width: `${bossHpPct}%`}}/>
            </div>
            <div style={s.bossHpLabels}>
              <span>HP: {Math.round(bossHpRemaining).toLocaleString()} / {boss.hp.toLocaleString()}</span>
              <span style={{color: "#E24B4A"}}>{bossDamagePct}% damaged</span>
            </div>

            <div style={s.bossStats}>
              <div style={s.bossStat}>
                <div style={{...s.bossStatVal, color: "#E24B4A"}}>{Math.round(gymDamage).toLocaleString()}</div>
                <div style={s.bossStatLbl}>Damage dealt</div>
              </div>
              <div style={s.bossStat}>
                <div style={{...s.bossStatVal, color: "#F5C475"}}>{gymSessions}</div>
                <div style={s.bossStatLbl}>Sessions</div>
              </div>
              <div style={s.bossStat}>
                <div style={{...s.bossStatVal, color: "#9B7FE8"}}>{gymCalories.toLocaleString()}</div>
                <div style={s.bossStatLbl}>Kcals burned</div>
              </div>
            </div>

            <div style={s.divider}>
              <div style={s.divLine}/><div style={s.divDiamond}/><div style={s.divText}>Damage formula</div><div style={s.divDiamond}/><div style={s.divLineR}/>
            </div>

            <div style={{display: "flex", gap: 8, marginBottom: 12}}>
              <div style={s.attackCard}>
                <div style={s.attackVal}>400</div>
                <div style={s.attackLbl}>per session</div>
              </div>
              <div style={s.attackCard}>
                <div style={{...s.attackVal, color: "#F5C475"}}>×1.8</div>
                <div style={s.attackLbl}>500+ kcal bonus</div>
              </div>
              <div style={s.attackCard}>
                <div style={{...s.attackVal, color: "#4ECBA5"}}>×2.0</div>
                <div style={s.attackLbl}>3+ days streak</div>
              </div>
            </div>

            <div style={s.divider}>
              <div style={s.divLine}/><div style={s.divDiamond}/><div style={s.divText}>Kill reward</div><div style={s.divDiamond}/><div style={s.divLineR}/>
            </div>

            <div style={s.rewardCard}>
              <div style={{fontSize: 28}}>{bossReward.icon}</div>
              <div style={{flex: 1}}>
                <div style={{fontSize: 13, fontWeight: 500, color: bossReward.rarityColor}}>{bossReward.item}</div>
                <div style={{fontSize: 10, color: "#4a3d6b", marginTop: 2}}>{bossReward.stat} · {bossReward.rarity}</div>
              </div>
              <span style={{fontSize: 10, background: "#1a0800", color: "#854F0B", padding: "3px 8px", borderRadius: 20}}>+{bossReward.xp} XP</span>
            </div>

            {gymDamage >= boss.hp && (
              <div style={{marginTop: 12, background: "#0f2a1a", border: "1px solid #1D9E75", borderRadius: 8, padding: 12, textAlign: "center"}}>
                <div style={{fontSize: 20, marginBottom: 4}}>🎉</div>
                <div style={{fontSize: 14, fontWeight: 500, color: "#4ECBA5"}}>Boss Defeated!</div>
                <div style={{fontSize: 11, color: "#4a3d6b", marginTop: 4}}>Reward claimed · New boss on Sunday</div>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={s.backBtn} onClick={() => window.location.href = "/"}>← Back to Gainquest</div>
    </div>
  )
}

const s: { [k: string]: React.CSSProperties } = {
  app: { maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#0a0810", fontFamily: "system-ui, sans-serif", paddingBottom: 80 },
  center: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0a0810" },
  loading: { fontSize: 16, color: "#9B7FE8" },
  topBar: { padding: "14px 16px 0", borderBottom: "1px solid #1a1230" },
  realm: { fontSize: 10, color: "#4a3d6b", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 4 },
  tabTitle: { fontSize: 18, fontWeight: 500, color: "#F5C475", paddingBottom: 12 },
  tabs: { display: "flex", borderBottom: "1px solid #1a1230" },
  tab: { flex: 1, padding: "10px 6px", textAlign: "center", fontSize: 11, color: "#4a3d6b", cursor: "pointer", background: "none", border: "none", borderBottom: "2px solid transparent", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 },
  tabActive: { color: "#F5C475", borderBottom: "2px solid #F5C475" },
  tabIcon: { fontSize: 18 },
  content: { padding: "14px" },
  progressBanner: { background: "#0e0b1a", border: "1px solid #2a1f45", borderRadius: 10, padding: 12, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" },
  pbTitle: { fontSize: 12, color: "#e8d5ff", marginBottom: 6 },
  xpBarWrap: { background: "#1a1230", borderRadius: 20, height: 5, overflow: "hidden", border: "1px solid #2a1f45", width: "100%" },
  xpBarFill: { height: "100%", borderRadius: 20, transition: "width 0.6s ease" },
  mapWrap: { border: "1px solid #2a1f45", borderRadius: 12, overflow: "hidden", marginBottom: 12 },
  locCard: { background: "#0e0b1a", border: "1px solid #2a1f45", borderRadius: 10, padding: 12, marginBottom: 12, position: "relative" as const },
  cornerTL: { position: "absolute" as const, top: 8, left: 8, width: 10, height: 10, borderTop: "1px solid #F5C475", borderLeft: "1px solid #F5C475" },
  cornerTR: { position: "absolute" as const, top: 8, right: 8, width: 10, height: 10, borderTop: "1px solid #F5C475", borderRight: "1px solid #F5C475" },
  cornerBL: { position: "absolute" as const, bottom: 8, left: 8, width: 10, height: 10, borderBottom: "1px solid #F5C475", borderLeft: "1px solid #F5C475" },
  cornerBR: { position: "absolute" as const, bottom: 8, right: 8, width: 10, height: 10, borderBottom: "1px solid #F5C475", borderRight: "1px solid #F5C475" },
  locName: { fontSize: 14, fontWeight: 500, color: "#F5C475", marginBottom: 4 },
  locLore: { fontSize: 11, color: "#6b5a8a", lineHeight: 1.6, marginBottom: 8 },
  locReward: { display: "flex", alignItems: "center", flexWrap: "wrap" as const, gap: 4, marginBottom: 6 },
  progLabels: { display: "flex", justifyContent: "space-between", fontSize: 10, color: "#4a3d6b", marginTop: 4 },
  divider: { display: "flex", alignItems: "center", gap: 8, margin: "12px 0" },
  divLine: { flex: 1, height: 1, background: "linear-gradient(90deg,transparent,#2a1f45)" },
  divLineR: { flex: 1, height: 1, background: "linear-gradient(90deg,#2a1f45,transparent)" },
  divDiamond: { width: 5, height: 5, background: "#F5C475", transform: "rotate(45deg)", flexShrink: 0 },
  divText: { fontSize: 9, color: "#F5C475", letterSpacing: "0.12em", textTransform: "uppercase" as const, flexShrink: 0 },
  itemGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  itemCard: { background: "#0e0b1a", border: "1px solid #2a1f45", borderRadius: 10, padding: 12, textAlign: "center" },
  itemIcon: { fontSize: 26, marginBottom: 6 },
  itemName: { fontSize: 12, fontWeight: 500, color: "#e8d5ff", marginBottom: 4 },
  rarityBadge: { fontSize: 9, padding: "2px 8px", borderRadius: 20, display: "inline-block" },
  itemStat: { fontSize: 11, color: "#4ECBA5", marginTop: 4 },
  weeklyReset: { fontSize: 11, color: "#D85A30", textAlign: "center", padding: 8, background: "#1a0800", borderRadius: 8, marginBottom: 12 },
  bossCard: { background: "#0e0b1a", border: "1px solid #3d1515", borderRadius: 12, padding: 16, marginBottom: 12 },
  bossName: { fontSize: 16, fontWeight: 500, color: "#E24B4A", textAlign: "center", marginBottom: 4 },
  bossSub: { fontSize: 11, color: "#6b5a8a", textAlign: "center", marginBottom: 12 },
  bossHpWrap: { background: "#1a0f0f", borderRadius: 20, height: 12, overflow: "hidden", border: "1px solid #3d1515", marginBottom: 6 },
  bossHpFill: { height: "100%", borderRadius: 20, background: "linear-gradient(90deg,#E24B4A,#993C1D)", transition: "width 0.6s ease" },
  bossHpLabels: { display: "flex", justifyContent: "space-between", fontSize: 10, color: "#6b5a8a", marginBottom: 12 },
  bossStats: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 },
  bossStat: { background: "#120d20", border: "1px solid #2a1f45", borderRadius: 8, padding: 8, textAlign: "center" },
  bossStatVal: { fontSize: 16, fontWeight: 500 },
  bossStatLbl: { fontSize: 9, color: "#4a3d6b", marginTop: 2, textTransform: "uppercase" as const, letterSpacing: "0.05em" },
  attackCard: { flex: 1, background: "#120d20", border: "1px solid #2a1f45", borderRadius: 8, padding: 10, textAlign: "center" },
  attackVal: { fontSize: 14, fontWeight: 500, color: "#E24B4A" },
  attackLbl: { fontSize: 9, color: "#4a3d6b", marginTop: 2 },
  rewardCard: { background: "#120d20", border: "1px solid #854F0B", borderRadius: 8, padding: 10, display: "flex", alignItems: "center", gap: 10 },
  backBtn: { textAlign: "center" as const, padding: "20px", color: "#6b5a8a", fontSize: 13, cursor: "pointer" },
}