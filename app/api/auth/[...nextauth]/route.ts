import NextAuth from 'next-auth'

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
      token: {
        url: 'https://www.strava.com/oauth/token',
        params: {
          client_id: process.env.STRAVA_CLIENT_ID,
          client_secret: process.env.STRAVA_CLIENT_SECRET,
          grant_type: 'authorization_code',
        },
      },
      userinfo: 'https://www.strava.com/api/v3/athlete',
      clientId: process.env.STRAVA_CLIENT_ID,
      clientSecret: process.env.STRAVA_CLIENT_SECRET,
      profile(profile: any) {
        return {
          id: profile.id.toString(),
          name: `${profile.firstname} ${profile.lastname}`,
          email: profile.email ?? `${profile.id}@strava.com`,
          image: profile.profile,
        }
      },
    },
  ],
  callbacks: {
    async signIn({ user, account }: any) {
      try {
        const { supabase } = await import('@/lib/supabase')
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
            character_name: `${user.name?.split(' ')[0]} the Spellblade`,
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
        return true
      } catch (e) {
        console.error('SignIn error:', e)
        return true
      }
    },
    async session({ session, token }: any) {
      session.stravaId = token.sub
      return session
    },
  },
})

export { handler as GET, handler as POST }