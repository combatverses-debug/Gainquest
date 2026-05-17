Set-Content -Path "lib\levels.ts" -Value @'
export const LEVEL_TITLES = [
  '', 
  'Explorer',
  'Adventurer', 
  'Wanderer',
  'Seeker',
  'Initiate',
  'Fighter',
  'Warrior',
  'Sentinel',
  'Ironclad',
  'Battlelord',
  'Hexblade',
  'Spellblade',
  'Soulkeeper',
  'Dreadknight',
  'Warlord',
  'Shadowlord',
  'Runeborn',
  'Voidwalker',
  'Doomforged',
  'Legendborn',
  'Ascendant',
  'Eternal',
  'Godslayer',
  'Archon',
  'The Undying',
  'Titan',
  'Celestial',
  'Eclipse',
  'Wraithborn',
  'Deathless'
]

export const LEVEL_ITEMS = [
  null,
  { name: 'Worn Boots', icon: '👟', rarity: 'common' },
  { name: 'Leather Hood', icon: '🪖', rarity: 'common' },
  { name: "Traveller's Cloak", icon: '🧥', rarity: 'common' },
  { name: 'Iron Bracers', icon: '🛡', rarity: 'common' },
  { name: 'Steel Dagger', icon: '🗡', rarity: 'common' },
  { name: 'Chain Vest', icon: '⚙', rarity: 'uncommon' },
  { name: 'War Hammer', icon: '🔨', rarity: 'uncommon' },
  { name: 'Tower Shield', icon: '🛡', rarity: 'uncommon' },
  { name: 'Plate Gauntlets', icon: '🤜', rarity: 'uncommon' },
  { name: 'Crimson Helm', icon: '⛑', rarity: 'rare' },
  { name: 'Void Cloak', icon: '🌑', rarity: 'rare' },
  { name: 'Voidblade', icon: '⚔', rarity: 'rare' },
  { name: 'Soul Lantern', icon: '🔮', rarity: 'rare' },
  { name: 'Obsidian Shield', icon: '🖤', rarity: 'rare' },
  { name: 'Crown of Ruin', icon: '👑', rarity: 'epic' },
  { name: 'Shadow Cape', icon: '🌘', rarity: 'epic' },
  { name: 'Rune Gauntlets', icon: '✨', rarity: 'epic' },
  { name: 'Void Boots', icon: '👢', rarity: 'epic' },
  { name: 'Doomplate Armour', icon: '🦾', rarity: 'epic' },
  { name: 'Legendary Sword', icon: '⚔', rarity: 'legendary' },
  { name: 'Ascendant Wings', icon: '🪽', rarity: 'legendary' },
  { name: 'Eternal Ring', icon: '💍', rarity: 'legendary' },
  { name: 'Godslayer Axe', icon: '🪓', rarity: 'legendary' },
  { name: 'Archon Crown', icon: '👑', rarity: 'legendary' },
  { name: 'Undying Armour', icon: '🔥', rarity: 'legendary' },
  { name: 'Titan Gauntlets', icon: '💪', rarity: 'legendary' },
  { name: 'Celestial Bow', icon: '🏹', rarity: 'legendary' },
  { name: 'Eclipse Blade', icon: '🌑', rarity: 'legendary' },
  { name: 'Wraithplate', icon: '👻', rarity: 'legendary' },
  { name: 'Deathless Crown', icon: '☠', rarity: 'legendary' },
]

export const MEDALS = [
  { id: 'first_blood', name: 'First Blood', desc: 'Complete your first activity', icon: '⚡', rarity: 'bronze', cat: 'special', check: (s: any) => s.totalActivities >= 1 },
  { id: 'road_warrior', name: 'Road Warrior', desc: 'Run 50km total', icon: '🏃', rarity: 'bronze', cat: 'running', check: (s: any) => s.totalRunKm >= 50, progress: (s: any) => Math.min(s.totalRunKm / 50, 1) },
  { id: 'century_club', name: 'Century Club', desc: 'Run 100km total', icon: '🏅', rarity: 'gold', cat: 'running', check: (s: any) => s.totalRunKm >= 100, progress: (s: any) => Math.min(s.totalRunKm / 100, 1) },
  { id: 'marathoner', name: 'Marathoner', desc: 'Run 200km total', icon: '🎖', rarity: 'gold', cat: 'running', check: (s: any) => s.totalRunKm >= 200, progress: (s: any) => Math.min(s.totalRunKm / 200, 1) },
  { id: 'speed_demon', name: 'Speed Demon', desc: 'Run 500km total', icon: '💨', rarity: 'gold', cat: 'running', check: (s: any) => s.totalRunKm >= 500, progress: (s: any) => Math.min(s.totalRunKm / 500, 1) },
  { id: 'iron_will', name: 'Iron Will', desc: '10 gym sessions', icon: '💪', rarity: 'silver', cat: 'gym', check: (s: any) => s.gymSessions >= 10, progress: (s: any) => Math.min(s.gymSessions / 10, 1) },
  { id: 'titan', name: 'Titan', desc: '50 gym sessions', icon: '🏋️', rarity: 'silver', cat: 'gym', check: (s: any) => s.gymSessions >= 50, progress: (s: any) => Math.min(s.gymSessions / 50, 1) },
  { id: 'ironborn', name: 'Ironborn', desc: '100 gym sessions', icon: '🦾', rarity: 'gold', cat: 'gym', check: (s: any) => s.gymSessions >= 100, progress: (s: any) => Math.min(s.gymSessions / 100, 1) },
  { id: 'wanderer', name: 'Wanderer', desc: 'Walk 50km total', icon: '🚶', rarity: 'bronze', cat: 'walking', check: (s: any) => s.totalWalkKm >= 50, progress: (s: any) => Math.min(s.totalWalkKm / 50, 1) },
  { id: 'globe_trotter', name: 'Globe Trotter', desc: 'Walk 200km total', icon: '🌍', rarity: 'silver', cat: 'walking', check: (s: any) => s.totalWalkKm >= 200, progress: (s: any) => Math.min(s.totalWalkKm / 200, 1) },
  { id: 'pilgrim', name: 'Pilgrim', desc: 'Walk 500km total', icon: '🗺', rarity: 'gold', cat: 'walking', check: (s: any) => s.totalWalkKm >= 500, progress: (s: any) => Math.min(s.totalWalkKm / 500, 1) },
  { id: 'on_fire', name: 'On Fire', desc: '7 day streak', icon: '🔥', rarity: 'bronze', cat: 'special', check: (s: any) => s.streak >= 7, progress: (s: any) => Math.min(s.streak / 7, 1) },
  { id: 'unstoppable', name: 'Unstoppable', desc: '30 day streak', icon: '💎', rarity: 'gold', cat: 'special', check: (s: any) => s.streak >= 30, progress: (s: any) => Math.min(s.streak / 30, 1) },
  { id: 'calorie_king', name: 'Calorie King', desc: 'Burn 50,000 calories', icon: '🔮', rarity: 'gold', cat: 'special', check: (s: any) => s.totalCalories >= 50000, progress: (s: any) => Math.min(s.totalCalories / 50000, 1) },
  { id: 'inferno', name: 'Inferno', desc: 'Burn 100,000 calories', icon: '🌋', rarity: 'gold', cat: 'special', check: (s: any) => s.totalCalories >= 100000, progress: (s: any) => Math.min(s.totalCalories / 100000, 1) },
  { id: 'initiate', name: 'Initiate', desc: 'Reach level 5', icon: '⭐', rarity: 'bronze', cat: 'levels', check: (s: any) => s.level >= 5, progress: (s: any) => Math.min(s.level / 5, 1) },
  { id: 'battlelord', name: 'Battlelord', desc: 'Reach level 10', icon: '⚔', rarity: 'silver', cat: 'levels', check: (s: any) => s.level >= 10, progress: (s: any) => Math.min(s.level / 10, 1) },
  { id: 'warlord', name: 'Warlord', desc: 'Reach level 15', icon: '🗡', rarity: 'silver', cat: 'levels', check: (s: any) => s.level >= 15, progress: (s: any) => Math.min(s.level / 15, 1) },
  { id: 'legendborn', name: 'Legendborn', desc: 'Reach level 20', icon: '👑', rarity: 'gold', cat: 'levels', check: (s: any) => s.level >= 20, progress: (s: any) => Math.min(s.level / 20, 1) },
  { id: 'the_undying', name: 'The Undying', desc: 'Reach level 25', icon: '🔱', rarity: 'gold', cat: 'levels', check: (s: any) => s.level >= 25, progress: (s: any) => Math.min(s.level / 25, 1) },
  { id: 'deathless', name: 'Deathless', desc: 'Reach level 30', icon: '☠', rarity: 'gold', cat: 'levels', check: (s: any) => s.level >= 30, progress: (s: any) => Math.min(s.level / 30, 1) },
  { id: 'early_bird', name: 'Early Bird', desc: 'Log 10 morning activities', icon: '🌅', rarity: 'bronze', cat: 'special', check: (s: any) => s.morningActivities >= 10, progress: (s: any) => Math.min(s.morningActivities / 10, 1) },
  { id: 'night_owl', name: 'Night Owl', desc: 'Log 10 evening activities', icon: '🌙', rarity: 'bronze', cat: 'special', check: (s: any) => s.eveningActivities >= 10, progress: (s: any) => Math.min(s.eveningActivities / 10, 1) },
  { id: 'weekend_warrior', name: 'Weekend Warrior', desc: 'Log 20 weekend activities', icon: '🎯', rarity: 'silver', cat: 'special', check: (s: any) => s.weekendActivities >= 20, progress: (s: any) => Math.min(s.weekendActivities / 20, 1) },
  { id: 'half_marathon', name: 'Half Marathon', desc: 'Run 21km in one session', icon: '🥇', rarity: 'gold', cat: 'running', check: (s: any) => s.longestRun >= 21, progress: (s: any) => Math.min(s.longestRun / 21, 1) },
  { id: 'marathon', name: 'Marathon', desc: 'Run 42km in one session', icon: '🏆', rarity: 'gold', cat: 'running', check: (s: any) => s.longestRun >= 42, progress: (s: any) => Math.min(s.longestRun / 42, 1) },
  { id: 'triple_threat', name: 'Triple Threat', desc: 'Do all 3 activity types in one week', icon: '🎪', rarity: 'silver', cat: 'special', check: (s: any) => s.tripleWeek >= 1, progress: (s: any) => Math.min(s.tripleWeek, 1) },
  { id: 'consistent', name: 'Consistent', desc: 'Log activities for 4 weeks straight', icon: '📅', rarity: 'silver', cat: 'special', check: (s: any) => s.weekStreak >= 4, progress: (s: any) => Math.min(s.weekStreak / 4, 1) },
  { id: 'centurion', name: 'Centurion', desc: 'Log 100 total activities', icon: '💯', rarity: 'gold', cat: 'special', check: (s: any) => s.totalActivities >= 100, progress: (s: any) => Math.min(s.totalActivities / 100, 1) },
  { id: 'power_hour', name: 'Power Hour', desc: 'Complete a 2 hour gym session', icon: '⏱', rarity: 'silver', cat: 'gym', check: (s: any) => s.longestGym >= 120, progress: (s: any) => Math.min(s.longestGym / 120, 1) },
]
'@

Set-Content -Path "lib\xp.ts" -Value @'
export function calculateXP(type: string, distance: number, duration: number, calories?: number): {
  xp: number, str: number, endStat: number, pwr: number
} {
  const km = distance / 1000
  const mins = duration / 60
  const calBonus = calories ? Math.round(calories * 0.1) : 0

  if (type === 'Run') {
    const xp = Math.round(km * 15 + mins * 1.5) + calBonus
    return { xp, str: Math.round(km * 2), endStat: Math.round(km), pwr: 0 }
  }
  if (type === 'Walk') {
    const xp = Math.round(km * 8 + mins * 0.8) + calBonus
    return { xp, str: 0, endStat: Math.round(km * 2), pwr: 0 }
  }
  if (type === 'WeightTraining' || type === 'Workout') {
    const xp = Math.round(mins * 2) + calBonus
    return { xp, str: 0, endStat: 0, pwr: Math.round(mins / 2) }
  }
  const xp = Math.round(mins * 1.2) + calBonus
  return { xp, str: 0, endStat: Math.round(km || 0), pwr: 0 }
}

export function xpToLevel(xp: number): number {
  return Math.min(Math.floor(Math.sqrt(xp / 100)) + 1, 30)
}

export function xpForNextLevel(level: number): number {
  return Math.pow(level, 2) * 100
}
'@

Set-Content -Path "app\api\sync\route.ts" -Value @'
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { calculateXP, xpToLevel } from "@/lib/xp"
import { cookies } from "next/headers"

export async function POST() {
  const cookieStore = await cookies()
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
    "https://www.strava.com/api/v3/athlete/activities?per_page=30",
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
      const { xp, str, endStat, pwr } = calculateXP(
        act.type,
        act.distance,
        act.moving_time,
        act.calories
      )
      await supabase.from("activities").insert({
        strava_id: act.id,
        user_strava_id: stravaId,
        name: act.name,
        type: act.type,
        distance: act.distance,
        duration: act.moving_time,
        calories: act.calories || 0,
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

Set-Content -Path "app\api\stats\route.ts" -Value @'
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
  let weekStreak = 0
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
    weekStreak,
    tripleWeek: 0,
    level: user?.level || 1,
  })
}
'@

Set-Content -Path "app\character\page.tsx" -Value @'
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
        <button style={{...s.tabBtn, ...(tab === "medals" ? s.tabActive : {})}} onClick={() => setTab("medals")}>Medals {earnedMedals.length > 0 && <span style={s.medalBadge}>{earnedMedals.length}</span>}</button>
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
              <img
                src={view === "front" ? frontImg : backImg}
                alt={charClass}
                style={s.charImg}
              />
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
              <div style={s.statCard}><div style={{...s.statCardVal, color: "#1D9E75"}}>{stats.gymSessions}</div><div style={s.statCardLbl}>gym sessions</div></div>
              <div style={s.statCard}><div style={{...s.statCardVal, color: "#F5C475"}}>{stats.totalCalories.toLocaleString()}</div><div style={s.statCardLbl}>cals burned</div></div>
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
              const rc = { bronze: "#854F0B", silver: "#B4B2A9", gold: "#F5C475" }[medal.rarity] || "#534AB7"
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
  topMedals: { display: "flex", justifyContent: "center", gap: 8, marginTop: 8 },
  topMedalBadge: { fontSize: 20, background: "#1e1830", border: "1px solid #2a2040", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" },
  charStage: { background: "#12101a", borderRadius: 16, border: "1px solid #2a2040", padding: 14, marginBottom: 14, position: "relative" },
  viewToggle: { display: "flex", gap: 8, justifyContent: "center", marginBottom: 12 },
  viewBtn: { background: "#1e1830", border: "1px solid #3a2d60", color: "#9980cc", fontSize: 12, padding: "5px 16px", borderRadius: 20, cursor: "pointer" },
  viewActive: { background: "#534AB7", borderColor: "#7F77DD", color: "#fff" },
  charImgWrap: { display: "flex", justifyContent: "center", position: "relative" },
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
'@

New-Item -ItemType Directory -Force -Path "app\api\stats"
New-Item -ItemType File -Force -Path "app\api\stats\route.ts"

New-Item -ItemType Directory -Force -Path "app\character"
New-Item -ItemType File -Force -Path "app\character\page.tsx"

Write-Host "✅ All files created!" -ForegroundColor Green