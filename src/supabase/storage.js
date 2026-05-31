// src/supabase/storage.js
import { supabase } from './config'

const BUCKET = 'portfolio-media'

function assertClient() {
  if (!supabase) throw new Error('Supabase not configured')
}

/**
 * Uploads a file to Supabase Storage and returns its public URL
 */
export async function uploadFile(file) {
  assertClient()

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  // If Cloudinary is configured via .env.local, use it to upload (bypasses Supabase 50MB limit)
  if (cloudName && uploadPreset) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', uploadPreset)

    // 'auto' detects if it's an image, video, or raw file
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(`Cloudinary Upload Error: ${errorData.error?.message || 'Unknown error'}`)
    }

    const data = await res.json()
    return data.secure_url // Return the Cloudinary URL
  }

  // Fallback to Supabase Storage if Cloudinary is not configured
  // Create a unique filename: timestamp + random string + original name
  // This prevents caching issues and overwriting identically named files
  const ext = file.name.split('.').pop()
  const randomStr = Math.random().toString(36).substring(2, 8)
  const filePath = `${Date.now()}-${randomStr}.${ext}`

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error

  // Get the public URL for the uploaded file
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(data.path)

  return publicUrlData.publicUrl
}

/**
 * Deletes a file from Supabase Storage given its public URL
 */
export async function deleteFile(publicUrl) {
  assertClient()
  if (!publicUrl) return

  // If it's a Cloudinary URL, skip Supabase deletion. Note: Unsigned Cloudinary uploads 
  // cannot be deleted directly from the browser for security reasons.
  if (publicUrl.includes('res.cloudinary.com')) {
    console.log('Skipping automatic deletion for Cloudinary file:', publicUrl)
    return
  }

  try {
    // Extract the exact file path from the full public URL
    // URL format: https://<project>.supabase.co/storage/v1/object/public/portfolio-media/123456-abc.jpg
    const urlParts = publicUrl.split(`${BUCKET}/`)
    if (urlParts.length !== 2) {
      console.warn('Could not parse file path from URL:', publicUrl)
      return
    }

    const filePath = urlParts[1]

    const { error } = await supabase.storage
      .from(BUCKET)
      .remove([filePath])

    if (error) {
      console.error('Error deleting file:', error)
      throw error
    }
  } catch (err) {
    console.error('Failed to delete storage file:', err)
    // We don't throw here to prevent breaking the overall project delete flow
  }
}

/**
 * Uploads (or overwrites) the resume file to a fixed path
 */
export async function uploadResume(file) {
  assertClient()

  // We use a fixed path so the URL remains consistent.
  // We also set upsert: true to overwrite any existing resume.
  const filePath = `resume/resume.pdf`

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      cacheControl: '0',
      upsert: true
    })

  if (error) throw error

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(data.path)

  return publicUrlData.publicUrl
}

/**
 * Returns the public URL for the portfolio resume.
 * Appends a timestamp to bypass browser caching of the previously uploaded resume.
 */
export function getResumeUrl() {
  if (!supabase) return ''
  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl('resume/resume.pdf')

  // return URL with cache busting query param
  return `${data.publicUrl}?t=${Date.now()}`
}
