"use client"
import { useEffect, useState } from "react"

export default function ProgramPage() {
  const [step, setStep] = useState<"check" | "onboard" | "generating" | "program">("check")
  const [screen, setScreen] = useState(1)
  const [selections, setSelections] = useState<any>({})
  const [program, setProgram] = useState<any>(null)
  const [progress, setProgress] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [genStep, setGenStep] = useState(0)

  useEffect(() => {
    fetch("/api/program/progress")
      .then(r => r.json())
      .then(d => {
        if (d.program) {
          setProgram(d.program)
          setProgress(d)
          setStep("program")
        } else {
          setStep("onboard")
        }
      })
  }, [])

  const select = (key: string, val: string) => {
    setSelections((prev: any) => ({ ...prev, [key]: val }))
  }

 const generateProgram = async () => {
    console.log("forge clicked", selections)
    setStep("generating")
    setGenStep(1)
    setTimeout(() => setGenStep(2), 1200)
    setTimeout(() => setGenStep(3), 2400)
    setTimeout(() => setGenStep(4), 3600)

    const res = await fetch("/api/program/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selections),
    })
    const data = await res.json()
    setGenStep(5)
    setTimeout(() => {
      setProgram(data.program)
      setStep("program")
    }, 800)
  }

  const OptionBtn = ({ icon, label, desc, group }: any) => (
    <div
      style={{
        ...s.optionBtn,
        ...(selections[group] === label ? s.optionSelected : {})
      }}
      onClick={() => select(group, label)}
    >
      <div style={s.optionIcon}>{icon}</div>
      <div style={{...s.optionLabel, ...(selections[group] === label ? { color: "#7F77DD" } : {})}}>{label}</div>
      {desc && <div style={s.optionDesc}>{desc}</div>}
    </div>
  )

  const Dots = ({ current }: { current: number }) => (
    <div style={s.dots}>
      {[1,2,3,4,5,6].map(i => (
        <div key={i} style={{
          ...s.dot,
          ...(i < current ? s.dotDone : {}),
          ...(i === current ? s.dotActive : {})
        }} />
      ))}
    </div>
  )

  if (step === "check") return (
    <div style={s.center}><div style={s.loading}>⚔ Consulting the Oracle...</div></div>
  )

  if (step === "generating") return (
    <div style={s.app}>
      <div style={s.genWrap}>
        <div style={s.genIcon}>🔮</div>
        <div style={s.genTitle}>Oracle is forging your program...</div>
        <div style={s.genSub}>Analysing your Strava data and crafting your campaign</div>
        <div style={s.genSteps}>
          {[
            "Analysing your recent activities",
            "Calculating fitness baseline",
            "Generating your campaign",
            "Setting XP targets & milestones",
            "Naming your campaign",
          ].map((text, i) => (
            <div key={i} style={{
              ...s.genStep,
              ...(genStep > i + 1 ? s.genDone : {}),
              ...(genStep === i + 1 ? s.genActive : {})
            }}>
              <div style={{
                ...s.stepDot,
                ...(genStep > i + 1 ? { background: "#1D9E75" } : {}),
                ...(genStep === i + 1 ? { background: "#534AB7" } : {})
              }} />
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (step === "program" && program) {
    const weeks = program.weeks || []
    const currentWeek = program.current_week || 1
    const totalXP = weeks.reduce((s: number, w: any) => s + (w.totalXP || 0), 0)
    const earnedXP = weeks.slice(0, currentWeek - 1).reduce((s: number, w: any) => s + (w.totalXP || 0), 0)
    const currentWeekData = weeks[currentWeek - 1]
    const weekTarget = currentWeekData?.sessions?.reduce((s: number, sess: any) => s + (sess.targetKm || 0), 0) || 0

    return (
      <div style={s.app}>
        <div style={s.topBar}>
          <div style={s.title}>Your Program</div>
          <div style={s.syncTime} onClick={() => { setProgram(null); setStep("onboard"); setSelections({}); setScreen(1) }}>New program</div>
        </div>

        <div style={s.programHeader}>
          <div style={s.campaignName}>⚔ {program.campaign_name}</div>
          <div style={s.campaignSub}>{program.campaign_subtitle}</div>
          <div style={s.progMeta}>{program.duration_weeks} weeks · {program.goal} · {program.days_per_week} days/week</div>
          <div style={s.progBarWrap}>
            <div style={{...s.progBarFill, width: `${(currentWeek / program.duration_weeks) * 100}%`}} />
          </div>
          <div style={s.progLabels}>
            <span>Week {currentWeek} of {program.duration_weeks}</span>
            <span>+{earnedXP.toLocaleString()} XP earned</span>
          </div>
        </div>

        <div style={s.oracleCard}>
          <div style={s.oracleAvatar}>🔮</div>
          <div style={s.oracleMsg}>
            <div style={s.oracleName}>ORACLE</div>
            <div style={s.oracleText}>
              {currentWeekData?.oracleAdvice || program.oracle_intro}
            </div>
          </div>
        </div>

        {weeks.map((week: any, i: number) => {
          const isCurrentWeek = i + 1 === currentWeek
          const isDone = i + 1 < currentWeek
          const isLocked = i + 1 > currentWeek

          return (
            <div key={i} style={{...s.weekCard, ...(isCurrentWeek ? s.weekCurrent : {}), ...(isLocked ? { opacity: 0.5 } : {})}}>
              <div style={s.weekHeader}>
                <div style={s.weekTitle}>Week {week.weekNumber} — {week.title}</div>
                <div style={{
                  ...s.weekBadge,
                  ...(isDone ? s.badgeDone : {}),
                  ...(isCurrentWeek ? s.badgeActive : {}),
                  ...(isLocked ? s.badgeLocked : {})
                }}>
                  {isDone ? "✓ Complete" : isCurrentWeek ? "In Progress" : "🔒 Locked"}
                </div>
              </div>

              <div style={s.sessionRow}>
                {week.sessions?.map((sess: any, j: number) => (
                  <div key={j} style={{
                    ...s.sessionTag,
                    ...(sess.type === "Run" ? s.tagRun : sess.type === "Gym" ? s.tagGym : sess.type === "Walk" ? s.tagWalk : s.tagRest)
                  }}>
                    {sess.type === "Run" ? "🏃" : sess.type === "Gym" ? "💪" : sess.type === "Walk" ? "🚶" : "😴"} {sess.description}
                  </div>
                ))}
              </div>

              <div style={s.weekTarget}>{week.weeklyTarget}</div>

              {isCurrentWeek && progress && (
                <>
                  <div style={s.weekProgWrap}>
                    <div style={{...s.weekProgFill, width: `${Math.min((progress.weekKm / (weekTarget || 1)) * 100, 100)}%`}} />
                  </div>
                  <div style={s.weekProgLabels}>
                    <span>{progress.weekKm}km done</span>
                    <span>{weekTarget}km target</span>
                  </div>
                </>
              )}

              <div style={s.weekXP}>+{week.totalXP?.toLocaleString()} XP this week</div>
            </div>
          )
        })}

        <div style={s.backBtn} onClick={() => window.location.href = "/"}>← Back to Gainquest</div>
      </div>
    )
  }

  return (
    <div style={s.app}>
      <div style={s.topBar}>
        <div style={s.title}>{screen === 1 ? "Start a Program" : "Build Your Plan"}</div>
        <div style={s.syncTime}>Step {screen} of 6</div>
      </div>

      <Dots current={screen} />

      {screen === 1 && (
        <div style={s.questionCard}>
          <div style={s.questionIcon}>🎯</div>
          <div style={s.questionText}>What's your main goal?</div>
          <div style={s.questionSub}>Oracle will build your program around this</div>
          <div style={s.optionsGrid}>
            {[
              { icon: "🏃", label: "Run Further", desc: "Build endurance & distance" },
              { icon: "⚡", label: "Run Faster", desc: "Improve pace & speed" },
              { icon: "💪", label: "Build Strength", desc: "Gym focused program" },
              { icon: "🔥", label: "Lose Weight", desc: "Mixed cardio & strength" },
              { icon: "🏅", label: "Race Prep", desc: "Train for an event" },
              { icon: "⚖", label: "General Fitness", desc: "Balanced all-rounder" },
            ].map(o => <OptionBtn key={o.label} {...o} group="goal" />)}
          </div>
          <button style={{...s.nextBtn, ...(selections.goal ? {} : s.nextDisabled)}} disabled={!selections.goal} onClick={() => setScreen(2)}>Continue →</button>
        </div>
      )}

      {screen === 2 && (
        <div style={s.questionCard}>
          <div style={s.questionIcon}>📅</div>
          <div style={s.questionText}>How many days can you train?</div>
          <div style={s.questionSub}>Be honest — consistency beats intensity</div>
          <div style={s.optionsGrid}>
            {[
              { icon: "2️⃣", label: "2 days", desc: "Casual pace" },
              { icon: "3️⃣", label: "3 days", desc: "Steady progress" },
              { icon: "4️⃣", label: "4 days", desc: "Strong commitment" },
              { icon: "5️⃣", label: "5+ days", desc: "Elite mode" },
            ].map(o => <OptionBtn key={o.label} {...o} group="days" />)}
          </div>
          <button style={{...s.nextBtn, ...(selections.days ? {} : s.nextDisabled)}} disabled={!selections.days} onClick={() => setScreen(3)}>Continue →</button>
        </div>
      )}

      {screen === 3 && (
        <div style={s.questionCard}>
          <div style={s.questionIcon}>⚔</div>
          <div style={s.questionText}>What's your fitness level?</div>
          <div style={s.questionSub}>Oracle will check your Strava data too</div>
          <div style={s.optionsGrid}>
            {[
              { icon: "🌱", label: "Beginner", desc: "Just getting started" },
              { icon: "⚡", label: "Intermediate", desc: "Training regularly" },
              { icon: "🔥", label: "Advanced", desc: "Serious athlete" },
              { icon: "👑", label: "Elite", desc: "Competing level" },
            ].map(o => <OptionBtn key={o.label} {...o} group="level" />)}
          </div>
          <button style={{...s.nextBtn, ...(selections.level ? {} : s.nextDisabled)}} disabled={!selections.level} onClick={() => setScreen(4)}>Continue →</button>
        </div>
      )}

      {screen === 4 && (
        <div style={s.questionCard}>
          <div style={s.questionIcon}>⏱</div>
          <div style={s.questionText}>How long do you want the program?</div>
          <div style={s.questionSub}>Longer programs yield bigger XP rewards</div>
          <div style={s.optionsGrid}>
            {[
              { icon: "⚡", label: "4 weeks", desc: "Quick blast" },
              { icon: "🔥", label: "8 weeks", desc: "Solid foundation" },
              { icon: "💎", label: "12 weeks", desc: "Full transformation" },
              { icon: "👑", label: "16 weeks", desc: "Elite campaign" },
            ].map(o => <OptionBtn key={o.label} {...o} group="duration" />)}
          </div>
          <button style={{...s.nextBtn, ...(selections.duration ? {} : s.nextDisabled)}} disabled={!selections.duration} onClick={() => setScreen(5)}>Continue →</button>
        </div>
      )}

      {screen === 5 && (
        <div style={s.questionCard}>
          <div style={s.questionIcon}>👤</div>
          <div style={s.questionText}>Tell Oracle about yourself</div>
          <div style={s.questionSub}>Used to personalise your program</div>
          <div style={s.formGroup}>
            <div style={s.formRow}>
              <div style={s.formField}>
                <div style={s.formLabel}>Age</div>
                <input style={s.formInput} type="number" placeholder="25" onChange={e => select("age", e.target.value)} />
              </div>
              <div style={s.formField}>
                <div style={s.formLabel}>Weight (kg)</div>
                <input style={s.formInput} type="number" placeholder="75" onChange={e => select("weight", e.target.value)} />
              </div>
            </div>
            <div style={s.formRow}>
              <div style={s.formField}>
                <div style={s.formLabel}>Height (cm)</div>
                <input style={s.formInput} type="number" placeholder="175" onChange={e => select("height", e.target.value)} />
              </div>
              <div style={s.formField}>
                <div style={s.formLabel}>Gender</div>
                <select style={s.formInput} onChange={e => select("gender", e.target.value)}>
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>
          <button
            style={{...s.nextBtn, ...(selections.age && selections.weight && selections.height && selections.gender ? {} : s.nextDisabled)}}
            disabled={!selections.age || !selections.weight || !selections.height || !selections.gender}
            onClick={() => setScreen(6)}
          >Continue →</button>
        </div>
      )}

      {screen === 6 && (
        <div style={s.questionCard}>
          <div style={s.questionIcon}>🏁</div>
          <div style={s.questionText}>Any upcoming event?</div>
          <div style={s.questionSub}>Optional — Oracle will target it if so</div>
          <div style={s.optionsGrid}>
            {[
              { icon: "🏃", label: "5k Race" },
              { icon: "🥇", label: "10k Race" },
              { icon: "🏅", label: "Half Marathon" },
              { icon: "🏆", label: "Marathon" },
              { icon: "✈", label: "Holiday" },
              { icon: "⏭", label: "No Event" },
            ].map(o => <OptionBtn key={o.label} {...o} group="event" />)}
          </div>
          <button
            style={{...s.nextBtn, ...(selections.event ? {} : s.nextDisabled)}}
            disabled={!selections.event}
            onClick={generateProgram}
          >
            🔮 Forge My Program
          </button>
        </div>
      )}
    </div>
  )
}

const s: { [k: string]: React.CSSProperties } = {
  app: { maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#0a0a0f", fontFamily: "system-ui, sans-serif", padding: "16px", paddingBottom: 80 },
  center: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0a0a0f" },
  loading: { fontSize: 16, color: "#7F77DD" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 17, fontWeight: 600, color: "#e8d5ff" },
  syncTime: { fontSize: 11, color: "#6b5a8a", cursor: "pointer" },
  dots: { display: "flex", gap: 6, justifyContent: "center", marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: "50%", background: "#1e1830", transition: "all 0.3s" },
  dotActive: { background: "#534AB7", width: 24, borderRadius: 4 },
  dotDone: { background: "#1D9E75" },
  questionCard: { background: "#12101a", border: "1px solid #2a2040", borderRadius: 16, padding: 20 },
  questionIcon: { fontSize: 32, textAlign: "center", marginBottom: 12 },
  questionText: { fontSize: 16, fontWeight: 500, color: "#e8d5ff", textAlign: "center", marginBottom: 6 },
  questionSub: { fontSize: 12, color: "#6b5a8a", textAlign: "center", marginBottom: 20 },
  optionsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 },
  optionBtn: { background: "#1a1528", border: "1px solid #2a2040", borderRadius: 10, padding: "12px 8px", textAlign: "center", cursor: "pointer" },
  optionSelected: { background: "#1e1830", borderColor: "#7F77DD" },
  optionIcon: { fontSize: 22, marginBottom: 6 },
  optionLabel: { fontSize: 12, fontWeight: 500, color: "#e8d5ff" },
  optionDesc: { fontSize: 10, color: "#6b5a8a", marginTop: 2 },
  nextBtn: { width: "100%", padding: 14, background: "#534AB7", border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 500, cursor: "pointer" },
  nextDisabled: { opacity: 0.4, cursor: "not-allowed" },
  formGroup: { marginBottom: 16 },
  formRow: { display: "flex", gap: 10, marginBottom: 10 },
  formField: { flex: 1 },
  formLabel: { fontSize: 11, color: "#6b5a8a", marginBottom: 4 },
  formInput: { width: "100%", padding: "10px 12px", background: "#1a1528", border: "1px solid #2a2040", borderRadius: 8, color: "#e8d5ff", fontSize: 14 },
  genWrap: { textAlign: "center", padding: "40px 20px" },
  genIcon: { fontSize: 48, marginBottom: 16 },
  genTitle: { fontSize: 18, fontWeight: 600, color: "#e8d5ff", marginBottom: 8 },
  genSub: { fontSize: 13, color: "#6b5a8a", marginBottom: 24 },
  genSteps: { background: "#12101a", border: "1px solid #2a2040", borderRadius: 12, padding: 14, textAlign: "left" },
  genStep: { display: "flex", alignItems: "center", gap: 10, padding: "6px 0", fontSize: 12, color: "#6b5a8a" },
  genDone: { color: "#1D9E75" },
  genActive: { color: "#e8d5ff" },
  stepDot: { width: 8, height: 8, borderRadius: "50%", background: "#2a2040", flexShrink: 0 },
  programHeader: { background: "#12101a", border: "1px solid #2a2040", borderRadius: 14, padding: 16, marginBottom: 14 },
  campaignName: { fontSize: 16, fontWeight: 600, color: "#F5C475", marginBottom: 4 },
  campaignSub: { fontSize: 12, color: "#9980cc", marginBottom: 6 },
  progMeta: { fontSize: 11, color: "#6b5a8a", marginBottom: 10 },
  progBarWrap: { background: "#1a1528", borderRadius: 20, height: 8, overflow: "hidden", marginBottom: 6 },
  progBarFill: { height: "100%", borderRadius: 20, background: "linear-gradient(90deg, #534AB7, #F5C475)" },
  progLabels: { display: "flex", justifyContent: "space-between", fontSize: 10, color: "#6b5a8a" },
  oracleCard: { background: "#12101a", border: "1px solid #534AB7", borderRadius: 12, padding: 14, marginBottom: 14, display: "flex", gap: 12 },
  oracleAvatar: { width: 44, height: 44, borderRadius: "50%", background: "#1e1830", border: "2px solid #534AB7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 },
  oracleMsg: { flex: 1 },
  oracleName: { fontSize: 11, color: "#7F77DD", marginBottom: 4, fontWeight: 600 },
  oracleText: { fontSize: 12, color: "#9980cc", lineHeight: 1.6 },
  weekCard: { background: "#12101a", border: "1px solid #2a2040", borderRadius: 12, padding: 14, marginBottom: 10 },
  weekCurrent: { borderColor: "#534AB7" },
  weekHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  weekTitle: { fontSize: 13, fontWeight: 600, color: "#e8d5ff" },
  weekBadge: { fontSize: 10, padding: "3px 10px", borderRadius: 20, background: "#1a1528", color: "#6b5a8a" },
  badgeDone: { background: "#0f2a1a", color: "#1D9E75" },
  badgeActive: { background: "#1e1830", color: "#7F77DD", border: "1px solid #534AB7" },
  badgeLocked: { background: "#1a1528", color: "#6b5a8a" },
  sessionRow: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 },
  sessionTag: { fontSize: 11, padding: "4px 10px", borderRadius: 20 },
  tagRun: { background: "#0f1a2a", color: "#378ADD" },
  tagGym: { background: "#1e1830", color: "#7F77DD" },
  tagWalk: { background: "#0f2a1a", color: "#1D9E75" },
  tagRest: { background: "#1a1528", color: "#6b5a8a" },
  weekTarget: { fontSize: 11, color: "#6b5a8a", marginTop: 4 },
  weekProgWrap: { background: "#1a1528", borderRadius: 20, height: 5, marginTop: 8 },
  weekProgFill: { height: "100%", borderRadius: 20, background: "#534AB7" },
  weekProgLabels: { display: "flex", justifyContent: "space-between", fontSize: 10, color: "#6b5a8a", marginTop: 3 },
  weekXP: { fontSize: 11, color: "#F5C475", marginTop: 6 },
  backBtn: { textAlign: "center" as const, padding: "20px", color: "#6b5a8a", fontSize: 13, cursor: "pointer" },
}