export function calculateXP(type: string, distance: number, duration: number): {
  xp: number, str: number, endStat: number, pwr: number
} {
  const km = distance / 1000
  const mins = duration / 60

  if (type === 'Run') {
    const xp = Math.round(km * 15 + mins * 1.5)
    return { xp, str: Math.round(km * 2), endStat: Math.round(km), pwr: 0 }
  }
  if (type === 'Walk') {
    const xp = Math.round(km * 8 + mins * 0.8)
    return { xp, str: 0, endStat: Math.round(km * 2), pwr: 0 }
  }
  if (type === 'WeightTraining' || type === 'Workout') {
    const xp = Math.round(mins * 2)
    return { xp, str: 0, endStat: 0, pwr: Math.round(mins / 2) }
  }
  const xp = Math.round(mins * 1.2)
  return { xp, str: 0, endStat: Math.round(km || 0), pwr: 0 }
}

export function xpToLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

export function xpForNextLevel(level: number): number {
  return Math.pow(level, 2) * 100
}
