// src/hooks/useProjects.js
import { useState, useEffect } from 'react'
import { getProjects } from '../supabase/projects'
import { getAIProjects, getAIProject } from '../supabase/aiProjects'
import { mockProjects } from '../data/mockProjects'
import { aiProjects } from '../data/aiProjects'

export function useProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetch() {
      try {
        const data = await getProjects()
        // Fall back to mock data if Supabase is empty
        setProjects(data.length > 0 ? data : mockProjects)
      } catch (err) {
        console.warn('Supabase unavailable, using mock data:', err.message)
        setProjects(mockProjects)
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return { projects, loading, error }
}

// Combined lookup — searches both 3D portfolio and AI Studio projects.
// For AI projects not in the local fallback, also queries Supabase so admin-created
// entries resolve correctly on their detail page.
export function useProject(id) {
  const { projects, loading } = useProjects()
  const [remoteProject, setRemoteProject] = useState(null)
  const [remoteLoading, setRemoteLoading] = useState(false)

  const local =
    projects.find((p) => String(p.id) === String(id)) ||
    aiProjects.find((p) => String(p.id) === String(id))

  useEffect(() => {
    if (local || !id) {
      setRemoteProject(null)
      setRemoteLoading(false)
      return
    }
    let cancelled = false
    setRemoteLoading(true)
    getAIProject(id)
      .then((data) => { if (!cancelled) setRemoteProject(data) })
      .catch(() => { if (!cancelled) setRemoteProject(null) })
      .finally(() => { if (!cancelled) setRemoteLoading(false) })
    return () => { cancelled = true }
  }, [id, local])

  return { project: local || remoteProject, loading: loading || remoteLoading }
}

// AI Studio projects — fetches from Supabase, falls back to local data.
// Pass { adminMode: true } to skip mock fallback (admin should only see real DB entries).
export function useAIProjects({ adminMode = false } = {}) {
  const [projects, setProjects] = useState(adminMode ? [] : aiProjects)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function fetch() {
      try {
        const data = await getAIProjects()
        if (cancelled) return
        // In admin mode never fall back to mock data (mock IDs aren't valid UUIDs)
        setProjects(data.length > 0 ? data : (adminMode ? [] : aiProjects))
      } catch (err) {
        if (cancelled) return
        console.warn('Supabase unavailable, using local AI Studio data:', err.message)
        setProjects(adminMode ? [] : aiProjects)
        setError(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [adminMode])

  return { projects, loading, error, refresh: () => window.location.reload() }
}

// Single AI project lookup (used by ProjectDetail when route id matches an AI project)
export function useAIProject(id) {
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetch() {
      try {
        const data = await getAIProject(id)
        if (!cancelled) setProject(data)
      } catch {
        if (!cancelled) {
          const local = aiProjects.find((p) => String(p.id) === String(id)) || null
          setProject(local)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [id])

  return { project, loading }
}