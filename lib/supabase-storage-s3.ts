import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"

const endpoint = process.env.SUPABASE_S3_ENDPOINT ?? ""
const region = process.env.SUPABASE_S3_REGION ?? "ap-southeast-2"
const accessKeyId = process.env.SUPABASE_S3_ACCESS_KEY_ID ?? ""
const secretAccessKey = process.env.SUPABASE_S3_SECRET_ACCESS_KEY ?? ""
const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""

const isConfigured =
  endpoint && accessKeyId && secretAccessKey && projectUrl

export const supabaseStorageS3: S3Client | null = isConfigured
  ? new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    })
  : null

export const SUPABASE_S3_BUCKET = "portfolio"

/**
 * Get the public URL for an object in Supabase Storage.
 * Format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
 */
export function getStoragePublicUrl(path: string): string {
  const base = projectUrl.replace(/\/$/, "")
  return `${base}/storage/v1/object/public/${SUPABASE_S3_BUCKET}/${path}`
}

/**
 * Upload a buffer to Supabase Storage via S3-compatible API.
 */
export async function uploadToStorage(
  path: string,
  buffer: Buffer,
  contentType: string
): Promise<{ success: true; publicUrl: string } | { success: false; error: string }> {
  if (!supabaseStorageS3) {
    return {
      success: false,
      error: "Supabase S3 storage not configured. Add SUPABASE_S3_* and NEXT_PUBLIC_SUPABASE_URL to .env",
    }
  }

  try {
    await supabaseStorageS3.send(
      new PutObjectCommand({
        Bucket: SUPABASE_S3_BUCKET,
        Key: path,
        Body: buffer,
        ContentType: contentType,
      })
    )
    const publicUrl = getStoragePublicUrl(path)
    return { success: true, publicUrl }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed"
    return { success: false, error: message }
  }
}
