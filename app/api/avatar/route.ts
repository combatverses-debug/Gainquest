import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const stravaId = cookieStore.get("strava_id")?.value
  if (!stravaId) return NextResponse.json({ error: "Not logged in" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("avatar") as File
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

  const ext = file.name.split(".").pop()
  const fileName = `${stravaId}.${ext}`
  const buffer = await file.arrayBuffer()

  const { error } = await supabase.storage
    .from("avatars")
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data } = supabase.storage.from("avatars").getPublicUrl(fileName)

  await supabase.from("users")
    .update({ avatar_url: data.publicUrl })
    .eq("strava_id", stravaId)

  return NextResponse.json({ url: data.publicUrl })
}