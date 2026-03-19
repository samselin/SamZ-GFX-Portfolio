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
