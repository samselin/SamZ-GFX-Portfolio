// src/supabase/aiProjects.js
// CRUD for the AI Studio projects table.
// Same shape as the main `projects` table so existing detail view works unchanged.
import { supabase } from './config'

const TABLE = 'ai_projects'

function assertClient() {
  if (!supabase) throw new Error('Supabase not configured')
}

export async function getAIProjects() {
  assertClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getAIProject(id) {
  assertClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function addAIProject(projectData) {
  assertClient()
  const { data, error } = await supabase
    .from(TABLE)
    .insert([projectData])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateAIProject(id, projectData) {
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

export async function deleteAIProject(id) {
  assertClient()
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id)
  if (error) throw error
}
