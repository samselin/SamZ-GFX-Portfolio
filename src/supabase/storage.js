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
