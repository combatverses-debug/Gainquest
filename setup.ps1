# Create lib directory and files
New-Item -ItemType Directory -Force -Path "lib"

Set-Content -Path "lib\supabase.ts" -Value @"
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)
"@

Set-Content -Path "lib\xp.ts" -Value @"
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
"@

# Create API directories and files
New-Item -ItemType Directory -Force -Path "app\api\auth\[...nextauth]"
New-Item -ItemType Directory -Force -Path "app\api\sync"
New-Item -ItemType Directory -Force -Path "app\api\me"
New-Item -ItemType Directory -Force -Path "app\api\link-partner"

Set-Content -Path "app\api\auth\[...nextauth]\route.ts" -Value @"
import NextAuth from 'next-auth'
import { supabase } from '@/lib/supabase'

const handler = NextAuth({
  providers: [
    {
      id: 'strava',
      name: 'Strava',
      type: 'oauth',
      authorization: {
        url: 'https://www.strava.com/oauth/authorize',
        params: {
          scope: 'read,activity:read_all',
          response_type: 'code',
          approval_prompt: 'auto',
        },
      },
      token: 'https://www.strava.com/oauth/token',
      userinfo: 'https://www.strava.com/api/v3/athlete',
      clientId: process.env.STRAVA_CLIENT_ID,
      clientSecret: process.env.STRAVA_CLIENT_SECRET,
      profile(profile: any) {
        return {
          id: profile.id.toString(),
          name: `\${profile.firstname} \${profile.lastname}`,
          email: profile.email,
          image: profile.profile,
        }
      },
    },
  ],
  callbacks: {
    async signIn({ user, account }: any) {
      if (account.provider === 'strava') {
        const stravaId = parseInt(user.id)
        const { data: existing } = await supabase
          .from('users')
          .select('*')
          .eq('strava_id', stravaId)
          .single()

        if (!existing) {
          await supabase.from('users').insert({
            strava_id: stravaId,
            name: user.name,
            email: user.email,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            character_name: `\${user.name?.split(' ')[0]} the Spellblade`,
            character_class: 'Spellblade',
            avatar: '🧙',
          })
        } else {
          await supabase.from('users').update({
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
          }).eq('strava_id', stravaId)
        }
      }
      return true
    },
    async session({ session, token }: any) {
      session.stravaId = token.sub
      return session
    },
  },
})

export { handler as GET, handler as POST }
"@

Set-Content -Path "app\api\sync\route.ts" -Value @"
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { calculateXP, xpToLevel } from '@/lib/xp'

export async function POST(req: Request) {
  const { stravaId } = await req.json()

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('strava_id', stravaId)
    .single()

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  let accessToken = user.access_token
  if (Date.now() / 1000 > user.expires_at) {
    const res = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        refresh_token: user.refresh_token,
        grant_type: 'refresh_token',
      }),
    })
    const tokens = await res.json()
    accessToken = tokens.access_token
    await supabase.from('users').update({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_at,
    }).eq('strava_id', stravaId)
  }

  const activitiesRes = await fetch(
    'https://www.strava.com/api/v3/athlete/activities?per_page=10',
    { headers: { Authorization: `Bearer \${accessToken}` } }
  )
  const activities = await activitiesRes.json()

  let totalXP = user.xp
  let totalStr = user.str
  let totalEnd = user.end_stat
  let totalPwr = user.pwr

  for (const act of activities) {
    const { data: existing } = await supabase
      .from('activities')
      .select('id')
      .eq('strava_id', act.id)
      .single()

    if (!existing) {
      const { xp, str, endStat, pwr } = calculateXP(act.type, act.distance, act.moving_time)
      await supabase.from('activities').insert({
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
  await supabase.from('users').update({
    xp: totalXP,
    level: newLevel,
    str: totalStr,
    end_stat: totalEnd,
    pwr: totalPwr,
  }).eq('strava_id', stravaId)

  return NextResponse.json({ success: true, xp: totalXP, level: newLevel })
}
"@

Set-Content -Path "app\api\me\route.ts" -Value @"
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const stravaId = searchParams.get('stravaId')

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('strava_id', stravaId)
    .single()

  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .eq('user_strava_id', stravaId)
    .order('date', { ascending: false })
    .limit(10)

  let partner = null
  if (user?.partner_strava_id) {
    const { data: partnerData } = await supabase
      .from('users')
      .select('*')
      .eq('strava_id', user.partner_strava_id)
      .single()
    partner = partnerData
  }

  return NextResponse.json({ user, activities, partner })
}
"@

Set-Content -Path "app\api\link-partner\route.ts" -Value @"
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  const { stravaId, partnerStravaId } = await req.json()

  await supabase.from('users')
    .update({ partner_strava_id: partnerStravaId })
    .eq('strava_id', stravaId)

  await supabase.from('users')
    .update({ partner_strava_id: stravaId })
    .eq('strava_id', partnerStravaId)

  return NextResponse.json({ success: true })
}
"@

Set-Content -Path "app\SessionProvider.tsx" -Value @"
'use client'
import { SessionProvider as Provider } from 'next-auth/react'

export default function SessionProvider({ children, session }: any) {
  return <Provider session={session}>{children}</Provider>
}
"@

Set-Content -Path "app\layout.tsx" -Value @"
import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import SessionProvider from './SessionProvider'

export const metadata: Metadata = {
  title: 'Gainquest',
  description: 'Turn your workouts into legend',
  manifest: '/manifest.json',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
"@

Set-Content -Path "public\manifest.json" -Value @"
{
  "name": "Gainquest",
  "short_name": "Gainquest",
  "description": "Turn your workouts into legend",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#534AB7",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
"@

Write-Host "✅ All files created successfully!" -ForegroundColor Green