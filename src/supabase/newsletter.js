// src/supabase/newsletter.js
// Simple Supabase CRUD for newsletter subscribers.
import { supabase } from './config'

const TABLE = 'newsletter_subscribers'

function assertClient() {
  if (!supabase) throw new Error('Supabase not configured')
}

export async function subscribe(email) {
  assertClient()
  // Upsert on email — same person subscribing twice doesn't error.
  const { data, error } = await supabase
    .from(TABLE)
    .upsert([{ email: email.toLowerCase().trim() }], { onConflict: 'email' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getSubscriberCount() {
  assertClient()
  const { count, error } = await supabase
    .from(TABLE)
    .select('*', { count: 'exact', head: true })
  if (error) throw error
  return count ?? 0
}