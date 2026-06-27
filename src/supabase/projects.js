// src/supabase/projects.js
import { supabase } from './config'

const TABLE = 'projects'

function assertClient() {
  if (!supabase) throw new Error('Supabase not configured')
}

export async function getProjects() {
  assertClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getProject(id) {
  assertClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function addProject(projectData) {
  assertClient()
  const { data, error } = await supabase
    .from(TABLE)
    .insert([projectData])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProject(id, projectData) {
  assertClient()
  const { data, error } = await supabase
    .from(TABLE)
    .update(projectData)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProject(id) {
  assertClient()
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id)
  if (error) throw error
}

/**
 * Fire-and-forget view increment. Reads current value, increments by 1, writes back.
 * Safe to call from a useEffect without await — failures are logged but never thrown.
 */
export async function incrementProjectViews(id) {
  assertClient()
  try {
    const { data, error: readErr } = await supabase
      .from(TABLE)
      .select('views')
      .eq('id', id)
      .single()
    if (readErr) throw readErr
    const next = (data?.views ?? 0) + 1
    const { error: writeErr } = await supabase
      .from(TABLE)
      .update({ views: next })
      .eq('id', id)
    if (writeErr) throw writeErr
  } catch (err) {
    console.warn('incrementProjectViews failed:', err.message)
  }
}
