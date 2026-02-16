import { prisma } from "@/lib/prisma"
import { supabase } from "@/lib/supabase"
import { uploadToStorage } from "@/lib/supabase-storage-s3"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const albumId = formData.get("albumId") as string | null

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    const ext = file.name.split(".").pop() ?? "jpg"
    const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`
    const path = albumId ? `albums/${albumId}/${filename}` : `images/${filename}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const contentType = file.type || "image/jpeg"

    // Prefer S3-compatible API if configured, otherwise fall back to REST API
    const s3Result = await uploadToStorage(path, buffer, contentType)
    let publicUrl: string

    if (s3Result.success) {
      publicUrl = s3Result.publicUrl
    } else if (supabase) {
      const { error: uploadError } = await supabase.storage
        .from("portfolio")
        .upload(path, buffer, {
          contentType,
          upsert: false,
        })

      if (uploadError) {
        return NextResponse.json(
          { error: "Failed to upload image", details: uploadError.message },
          { status: 500 }
        )
      }

      const { data: urlData } = supabase.storage
        .from("portfolio")
        .getPublicUrl(path)
      publicUrl = urlData.publicUrl
    } else {
      return NextResponse.json(
        {
          error: s3Result.error ||
            "Storage not configured. Add SUPABASE_S3_* and NEXT_PUBLIC_SUPABASE_URL, or NEXT_PUBLIC_SUPABASE_* to .env",
        },
        { status: 503 }
      )
    }

    const image = await prisma.image.create({
      data: {
        url: publicUrl,
        path,
        filename: file.name,
        size: file.size,
        mimeType: file.type,
        albumId: albumId || null,
      },
    })

    return NextResponse.json(image, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    )
  }
}
