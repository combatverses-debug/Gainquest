"use client"
import { useEffect, useState } from "react"

export default function ReadinessPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/readiness")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return (
    <div style={s.center}>
      <div style={s.loading}>⚔ Analysing your battle readiness...</div>
    </div>
  )

  if (!data || data.error) return (
    <div style={s.center}>
      <div style={s.loading}>Failed to load — make sure you've synced Strava first.</div>
    </div>
  )

  const orbPct = data.readiness / 100
  const circumference = 2 * Math.PI * 60
  const dashOffset = circumference - (orbPct * circumference)

  const fmtMins = (mins: number) => {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  const loadMax = Math.max(...(data.weekLoads || [1]))

  return (
    <div style={s.app}>
      <div style={s.topBar}>
        <div style={s.title}>Battle Readiness</div>
        <div style={s.syncTime}>{data.activitiesThisWeek} activities this week</div>
      </div>

      <div style={s.orbWrap}>
        <div style={s.orbContainer}>
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="60" fill="none" stroke="#1e1830" strokeWidth="12"/>
            <circle cx="80" cy="80" r="60" fill="none" stroke={data.statusColor} strokeWidth="12"
              strokeDasharray={circumference} strokeDashoffset={dashOffset}
              strokeLinecap="round" transform="rotate(-90 80 80)"/>
            <circle cx="80" cy="80" r="48" fill="#12101a"/>
          </svg>
          <div style={s.orbInner}>
            <div style={{...s.orbScore, color: data.statusColor}}>{data.readiness}</div>
            <div style={s.orbMax}>/100</div>
          </div>
        </div>
        <div style={{...s.orbStatus, color: data.statusColor}}>⚔ {data.statusLabel}</div>
        {data.xpBonus > 0 && (
          <div style={s.xpBonusBadge}>+{data.xpBonus}% XP Bonus Active</div>
        )}
      </div>

      <div style={s.adviceCard}>
        <div style={s.adviceTitle}>⚔ Commander's Orders</div>
        <div style={s.adviceText}>{data.advice}</div>
      </div>

      <div style={s.statusBar}>
        <div style={s.statusItem}>
          <div style={{...s.statusVal, color: data.statusColor}}>{data.statusLabel}</div>
          <div style={s.statusLbl}>Form</div>
        </div>
        <div style={s.statusItem}>
          <div style={{...s.statusVal, color: "#F5C475"}}>{fmtMins(data.weeklyLoadMins)}</div>
          <div style={s.statusLbl}>This week</div>
        </div>
        <div style={s.statusItem}>
          <div style={{...s.statusVal, color: "#7F77DD"}}>{data.sufferScore}</div>
          <div style={s.statusLbl}>Suffer score</div>
        </div>
        <div style={s.statusItem}>
          <div style={{...s.statusVal, color: "#1D9E75"}}>+{data.xpBonus}%</div>
          <div style={s.statusLbl}>XP Bonus</div>
        </div>
      </div>

      <div style={s.sectionTitle}>Suffer score</div>
      <div style={s.metricCard}>
        <div style={s.metricTop}>
          <div style={s.metricLeft}>
            <div style={s.metricName}>Relative Effort</div>
            <div style={s.metricDesc}>How hard you've worked this week vs last</div>
          </div>
          <div>
            <div style={{...s.metricVal, color: "#D85A30"}}>{data.sufferScore}</div>
            <div style={s.metricUnit}>this week</div>
          </div>
        </div>
        <div style={s.levelBarWrap}>
          <div style={{...s.levelBar, width: `${Math.min(data.sufferScore / 3, 100)}%`, background: "linear-gradient(90deg, #1D9E75, #F5C475, #D85A30)"}} />
        </div>
        <div style={s.levelLabels}><span>Easy</span><span>Moderate</span><span>Hard</span><span>Max</span></div>
        <div style={s.compRow}>
          <span style={s.compItem}>Last week: <strong style={{color: "#e8d5ff"}}>{data.lastWeekSuffer}</strong></span>
          {data.sufferScore > data.lastWeekSuffer
            ? <span style={{...s.badge, background: "#0f2a1a", color: "#1D9E75"}}>↑ Higher effort</span>
            : <span style={{...s.badge, background: "#1a0f00", color: "#F5C475"}}>↓ Lower effort</span>
          }
        </div>
      </div>

      <div style={s.sectionTitle}>Training load</div>
      <div style={s.metricCard}>
        <div style={s.metricTop}>
          <div style={s.metricLeft}>
            <div style={s.metricName}>Weekly Load</div>
            <div style={s.metricDesc}>Training minutes over last 4 weeks</div>
          </div>
          <div>
            <div style={{...s.metricVal, color: "#7F77DD"}}>{fmtMins(data.weeklyLoadMins)}</div>
            <div style={s.metricUnit}>this week</div>
          </div>
        </div>
        <div style={s.trendRow}>
          {(data.weekLoads || []).map((load: number, i: number) => (
            <div key={i} style={{
              ...s.trendBar,
              height: `${Math.max((load / (loadMax || 1)) * 100, 8)}%`,
              background: i === data.weekLoads.length - 1 ? "#534AB7" : "#2a2040"
            }} />
          ))}
        </div>
        <div style={s.trendLabels}>
          <span>4w ago</span><span>3w</span><span>2w</span><span>This week</span>
        </div>
      </div>

      {data.avgHR > 0 && (
        <>
          <div style={s.sectionTitle}>Heart rate zones</div>
          <div style={s.metricCard}>
            <div style={s.metricTop}>
              <div style={s.metricLeft}>
                <div style={s.metricName}>Zone Distribution</div>
                <div style={s.metricDesc}>Time in each HR zone this week</div>
              </div>
              <div>
                <div style={{...s.metricVal, color: "#1D9E75"}}>{data.avgHR}</div>
                <div style={s.metricUnit}>avg bpm</div>
              </div>
            </div>
            <div style={s.zoneRow}>
              <div style={{...s.zone, background: "#0f2a1a"}}>
                <div style={{...s.zoneVal, color: "#1D9E75"}}>{data.zones?.z1 || 0}%</div>
                <div style={{...s.zoneLbl, color: "#085041"}}>Z1</div>
              </div>
              <div style={{...s.zone, background: "#0f2010"}}>
                <div style={{...s.zoneVal, color: "#639922"}}>{data.zones?.z2 || 0}%</div>
                <div style={{...s.zoneLbl, color: "#3B6D11"}}>Z2</div>
              </div>
              <div style={{...s.zone, background: "#1a1200"}}>
                <div style={{...s.zoneVal, color: "#F5C475"}}>{data.zones?.z3 || 0}%</div>
                <div style={{...s.zoneLbl, color: "#633806"}}>Z3</div>
              </div>
              <div style={{...s.zone, background: "#1a0800"}}>
                <div style={{...s.zoneVal, color: "#D85A30"}}>{data.zones?.z4 || 0}%</div>
                <div style={{...s.zoneLbl, color: "#712B13"}}>Z4</div>
              </div>
              <div style={{...s.zone, background: "#1a0000"}}>
                <div style={{...s.zoneVal, color: "#E24B4A"}}>{data.zones?.z5 || 0}%</div>
                <div style={{...s.zoneLbl, color: "#A32D2D"}}>Z5</div>
              </div>
            </div>
          </div>
        </>
      )}

      <div style={s.sectionTitle}>Fitness vs Fatigue</div>
      <div style={s.metricCard}>
        <div style={s.metricName}>Fitness & Freshness</div>
        <div style={{...s.metricDesc, marginBottom: 12}}>Long term fitness vs short term fatigue</div>
        <div style={s.ftnRow}>
          <div style={{...s.ftnBox, background: "#0f1a2a"}}>
            <div style={{...s.ftnVal, color: "#378ADD"}}>{data.ctl}</div>
            <div style={{...s.ftnLbl, color: "#185FA5"}}>Fitness CTL</div>
          </div>
          <div style={{...s.ftnBox, background: "#1a1000"}}>
            <div style={{...s.ftnVal, color: "#F5C475"}}>{data.atl}</div>
            <div style={{...s.ftnLbl, color: "#633806"}}>Fatigue ATL</div>
          </div>
          <div style={{...s.ftnBox, background: data.tsb >= 0 ? "#0f2a1a" : "#1a0800"}}>
            <div style={{...s.ftnVal, color: data.tsb >= 0 ? "#1D9E75" : "#D85A30"}}>{data.tsb > 0 ? "+" : ""}{data.tsb}</div>
            <div style={{...s.ftnLbl, color: data.tsb >= 0 ? "#085041" : "#712B13"}}>Form TSB</div>
          </div>
        </div>
        <div style={{...s.badge, background: data.tsb > 20 ? "#0f2a1a" : data.tsb > 0 ? "#1a1528" : "#1a0800", color: data.tsb > 20 ? "#1D9E75" : data.tsb > 0 ? "#7F77DD" : "#D85A30", marginTop: 10, display: "inline-block"}}>
          {data.tsb > 20 ? "Peak Form 🏆" : data.tsb > 0 ? "Building 📈" : "Recovering 💤"}
        </div>
      </div>

      <div style={s.backBtn} onClick={() => window.location.href = "/"}>← Back to Gainquest</div>
    </div>
  )
}

const s: { [k: string]: React.CSSProperties } = {
  app: { maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#0a0a0f", fontFamily: "system-ui, sans-serif", padding: "16px", paddingBottom: 80 },
  center: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0a0a0f" },
  loading: { fontSize: 16, color: "#7F77DD", textAlign: "center", padding: 20 },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 17, fontWeight: 600, color: "#e8d5ff" },
  syncTime: { fontSize: 11, color: "#6b5a8a" },
  orbWrap: { display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 },
  orbContainer: { position: "relative", width: 160, height: 160, marginBottom: 12 },
  orbInner: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" },
  orbScore: { fontSize: 40, fontWeight: 700 },
  orbMax: { fontSize: 13, color: "#6b5a8a" },
  orbStatus: { fontSize: 16, fontWeight: 600, marginBottom: 6 },
  xpBonusBadge: { background: "#1e1830", border: "1px solid #534AB7", color: "#7F77DD", fontSize: 12, padding: "4px 14px", borderRadius: 20 },
  adviceCard: { background: "#12101a", border: "1px solid #534AB7", borderRadius: 12, padding: 14, marginBottom: 16 },
  adviceTitle: { fontSize: 13, fontWeight: 600, color: "#e8d5ff", marginBottom: 6 },
  adviceText: { fontSize: 12, color: "#9980cc", lineHeight: 1.6 },
  statusBar: { display: "flex", justifyContent: "space-between", background: "#12101a", border: "1px solid #2a2040", borderRadius: 12, padding: "10px 14px", marginBottom: 20 },
  statusItem: { textAlign: "center" },
  statusVal: { fontSize: 13, fontWeight: 600 },
  statusLbl: { fontSize: 9, color: "#6b5a8a", marginTop: 2, textTransform: "uppercase" as const },
  sectionTitle: { fontSize: 11, color: "#6b5a8a", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 10 },
  metricCard: { background: "#12101a", border: "1px solid #2a2040", borderRadius: 12, padding: 14, marginBottom: 12 },
  metricTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  metricLeft: { flex: 1 },
  metricName: { fontSize: 13, fontWeight: 500, color: "#e8d5ff", marginBottom: 3 },
  metricDesc: { fontSize: 11, color: "#6b5a8a" },
  metricVal: { fontSize: 22, fontWeight: 700, textAlign: "right" },
  metricUnit: { fontSize: 11, color: "#6b5a8a", textAlign: "right", marginTop: 2 },
  levelBarWrap: { background: "#1a1528", borderRadius: 20, height: 8, overflow: "hidden", marginBottom: 6 },
  levelBar: { height: "100%", borderRadius: 20 },
  levelLabels: { display: "flex", justifyContent: "space-between", fontSize: 9, color: "#6b5a8a" },
  compRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  compItem: { fontSize: 11, color: "#6b5a8a" },
  badge: { fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 20, display: "inline-block" },
  trendRow: { display: "flex", gap: 4, alignItems: "flex-end", height: 50, marginBottom: 6 },
  trendBar: { flex: 1, borderRadius: "3px 3px 0 0", minHeight: 4 },
  trendLabels: { display: "flex", justifyContent: "space-between", fontSize: 8, color: "#6b5a8a" },
  zoneRow: { display: "flex", gap: 6, marginTop: 8 },
  zone: { flex: 1, borderRadius: 6, padding: "6px 4px", textAlign: "center" },
  zoneVal: { fontSize: 12, fontWeight: 600 },
  zoneLbl: { fontSize: 8, marginTop: 2 },
  ftnRow: { display: "flex", gap: 8 },
  ftnBox: { flex: 1, borderRadius: 8, padding: 10, textAlign: "center" },
  ftnVal: { fontSize: 20, fontWeight: 700 },
  ftnLbl: { fontSize: 9, marginTop: 2, textTransform: "uppercase" as const },
  backBtn: { textAlign: "center" as const, padding: "20px", color: "#6b5a8a", fontSize: 13, cursor: "pointer" },
}