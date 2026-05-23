"use client"
import { useEffect, useState } from "react"

const typeColors: any = { Run: '#E24B4A', Gym: '#9B7FE8', Walk: '#4ECBA5', Ride: '#378ADD', VirtualRide: '#378ADD' }
const typeIcons: any = { Run: '🏃', Gym: '🏋️', Walk: '🚶', Ride: '🚴', VirtualRide: '🚴', WeightTraining: '🏋️', Workout: '🏋️' }
const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function CalendarPage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const [selected, setSelected] = useState<string | null>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/me")
      .then(r => r.json())
      .then(d => {
        setActivities(d.activities || [])
        setLoading(false)
      })
  }, [])

  // Build a lookup map of date string → activity
  // We use the date string format YYYY-MM-DD as the key
  const activityMap: any = {}
  activities.forEach(act => {
    const d = new Date(act.date)
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    activityMap[key] = act
  })

  // Figure out where the first day of the month falls
  // We use Monday as the first day of the week (European style)
  const firstDay = new Date(year, month, 1).getDay()
  const startOffset = firstDay === 0 ? 6 : firstDay - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  // Calculate month summary stats
  const monthActivities = activities.filter(act => {
    const d = new Date(act.date)
    return d.getFullYear() === year && d.getMonth() === month
  })
  const monthXP = monthActivities.reduce((s, a) => s + (a.xp_earned || 0), 0)
  const monthKm = monthActivities.reduce((s, a) => s + (a.distance || 0) / 1000, 0)

  const fmtPace = (dist: number, duration: number) => {
    if (!dist) return '—'
    const minsPerKm = (duration / 60) / (dist / 1000)
    return `${Math.floor(minsPerKm)}:${String(Math.round((minsPerKm % 1) * 60)).padStart(2,'0')}/km`
  }

  const fmtTime = (secs: number) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
  }

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelected(null)
  }

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelected(null)
  }

  if (loading) return (
    <div style={s.center}><div style={s.loading}>⚔ Loading your chronicle...</div></div>
  )

  const selectedAct = selected ? activityMap[selected] : null

  return (
    <div style={s.app}>
      <div style={s.topBar}>
        <div style={s.realm}>Chronicle of Deeds</div>
        <div style={s.title}>Training Calendar</div>
      </div>

      <div style={s.content}>
        <div style={s.monthNav}>
          <button style={s.navBtn} onClick={prevMonth}>←</button>
          <div style={s.monthLabel}>{monthNames[month]} {year}</div>
          <button style={s.navBtn} onClick={nextMonth}>→</button>
        </div>

        <div style={s.statsRow}>
          <div style={s.statCard}><div style={{...s.statVal, color: '#9B7FE8'}}>{monthXP.toLocaleString()}</div><div style={s.statLbl}>XP earned</div></div>
          <div style={s.statCard}><div style={{...s.statVal, color: '#E24B4A'}}>{monthActivities.length}</div><div style={s.statLbl}>Activities</div></div>
          <div style={s.statCard}><div style={{...s.statVal, color: '#4ECBA5'}}>{Math.round(monthKm * 10) / 10}km</div><div style={s.statLbl}>Distance</div></div>
        </div>

        <div style={s.dayHeaders}>
          {['M','T','W','T','F','S','S'].map((d, i) => (
            <div key={i} style={s.dayHdr}>{d}</div>
          ))}
        </div>

        <div style={s.calGrid}>
          {/* Empty cells before the first day */}
          {Array.from({length: startOffset}).map((_, i) => (
            <div key={`e${i}`} />
          ))}
          {/* Day cells */}
          {Array.from({length: daysInMonth}).map((_, i) => {
            const d = i + 1
            const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
            const act = activityMap[dateStr]
            const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year
            const isSelected = selected === dateStr
            const color = act ? (typeColors[act.type] || '#888780') : null

            return (
              <div
                key={d}
                onClick={() => act ? setSelected(isSelected ? null : dateStr) : setSelected(null)}
                style={{
                  aspectRatio: '1',
                  borderRadius: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: act ? 'pointer' : 'default',
                  background: act ? color + '22' : '#0e0b1a',
                  border: isSelected ? `2px solid ${color}` : isToday ? '1px solid #F5C475' : act ? `1px solid ${color}66` : '1px solid #1a1230',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 11, color: act ? '#e8d5ff' : isToday ? '#F5C475' : '#4a3d6b', lineHeight: 1 }}>{d}</div>
                {act && <div style={{ fontSize: 11, marginTop: 2 }}>{typeIcons[act.type] || '⚡'}</div>}
              </div>
            )
          })}
        </div>

        <div style={s.legend}>
          {[['Run','#E24B4A'],['Gym','#9B7FE8'],['Walk','#4ECBA5'],['Cycle','#378ADD']].map(([type, color]) => (
            <div key={type} style={s.leg}>
              <div style={{...s.legDot, background: color}} />
              {type}
            </div>
          ))}
        </div>

        {selectedAct && (() => {
          const color = typeColors[selectedAct.type] || '#888780'
          const date = new Date(selected!)
          return (
            <>
              <div style={s.divider}>
                <div style={s.divLine}/><div style={s.divDiamond}/><div style={s.divText}>Activity detail</div><div style={s.divDiamond}/><div style={s.divLineR}/>
              </div>
              <div style={{...s.detailCard, borderColor: color + '88'}}>
                <div style={s.detailHeader}>
                  <div style={{...s.detailIcon, background: color + '22', border: `1px solid ${color}66`}}>
                    {typeIcons[selectedAct.type] || '⚡'}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#e8d5ff' }}>{selectedAct.name}</div>
                    <div style={{ fontSize: 11, color: '#4a3d6b', marginTop: 2 }}>
                      {date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                  </div>
                </div>
                <div style={s.detailGrid}>
                  <div style={s.detailStat}><div style={s.detailStatVal}>{selectedAct.distance ? `${(selectedAct.distance/1000).toFixed(1)}km` : '—'}</div><div style={s.detailStatLbl}>Distance</div></div>
                  <div style={s.detailStat}><div style={s.detailStatVal}>{fmtTime(selectedAct.duration)}</div><div style={s.detailStatLbl}>Duration</div></div>
                  <div style={s.detailStat}><div style={s.detailStatVal}>{fmtPace(selectedAct.distance, selectedAct.duration)}</div><div style={s.detailStatLbl}>Avg Pace</div></div>
                  <div style={s.detailStat}><div style={s.detailStatVal}>{selectedAct.avg_heartrate ? `${Math.round(selectedAct.avg_heartrate)}bpm` : '—'}</div><div style={s.detailStatLbl}>Avg HR</div></div>
                  <div style={s.detailStat}><div style={s.detailStatVal}>{selectedAct.calories || '—'}</div><div style={s.detailStatLbl}>Calories</div></div>
                  <div style={s.detailStat}><div style={s.detailStatVal}>{selectedAct.elevation_gain ? `${Math.round(selectedAct.elevation_gain)}m` : '—'}</div><div style={s.detailStatLbl}>Elevation</div></div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color, textAlign: 'right', marginTop: 8 }}>+{selectedAct.xp_earned} XP earned</div>
              </div>
            </>
          )
        })()}
      </div>

      <div style={s.backBtn} onClick={() => window.location.href = '/'}>← Back to Gainquest</div>
    </div>
  )
}

const s: { [k: string]: React.CSSProperties } = {
  app: { maxWidth: 430, margin: '0 auto', minHeight: '100vh', background: '#0a0810', fontFamily: 'system-ui,sans-serif', paddingBottom: 80 },
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0810' },
  loading: { fontSize: 16, color: '#9B7FE8' },
  topBar: { padding: '14px 16px 0', borderBottom: '1px solid #1a1230' },
  realm: { fontSize: 10, color: '#4a3d6b', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 4 },
  title: { fontSize: 18, fontWeight: 500, color: '#F5C475', paddingBottom: 12 },
  content: { padding: 14 },
  monthNav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  monthLabel: { fontSize: 15, fontWeight: 500, color: '#e8d5ff' },
  navBtn: { background: '#0e0b1a', border: '1px solid #2a1f45', borderRadius: 8, color: '#9B7FE8', fontSize: 13, padding: '6px 12px', cursor: 'pointer' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 },
  statCard: { background: '#0e0b1a', border: '1px solid #2a1f45', borderRadius: 10, padding: 10, textAlign: 'center' },
  statVal: { fontSize: 18, fontWeight: 500 },
  statLbl: { fontSize: 10, color: '#4a3d6b', marginTop: 2 },
  dayHeaders: { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 4 },
  dayHdr: { fontSize: 10, color: '#4a3d6b', textAlign: 'center', padding: '4px 0', textTransform: 'uppercase' as const, letterSpacing: '0.06em' },
  calGrid: { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 14 },
  legend: { display: 'flex', gap: 14, flexWrap: 'wrap' as const, marginBottom: 14 },
  leg: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#4a3d6b' },
  legDot: { width: 8, height: 8, borderRadius: '50%' },
  divider: { display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0' },
  divLine: { flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,#2a1f45)' },
  divLineR: { flex: 1, height: 1, background: 'linear-gradient(90deg,#2a1f45,transparent)' },
  divDiamond: { width: 5, height: 5, background: '#F5C475', transform: 'rotate(45deg)', flexShrink: 0 },
  divText: { fontSize: 9, color: '#F5C475', letterSpacing: '0.12em', textTransform: 'uppercase' as const, flexShrink: 0 },
  detailCard: { background: '#0e0b1a', border: '1px solid #2a1f45', borderRadius: 12, padding: 14 },
  detailHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  detailIcon: { width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 },
  detailGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 },
  detailStat: { background: '#120d20', borderRadius: 8, padding: 8, textAlign: 'center' },
  detailStatVal: { fontSize: 14, fontWeight: 500, color: '#e8d5ff' },
  detailStatLbl: { fontSize: 9, color: '#4a3d6b', marginTop: 2, textTransform: 'uppercase' as const, letterSpacing: '0.04em' },
  backBtn: { textAlign: 'center' as const, padding: '20px', color: '#6b5a8a', fontSize: 13, cursor: 'pointer' },
}