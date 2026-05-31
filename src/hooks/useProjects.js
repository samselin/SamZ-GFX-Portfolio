// src/hooks/useProjects.js
import { useState, useEffect } from 'react'
import { getProjects } from '../supabase/projects'
import { mockProjects } from '../data/mockProjects'

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

export function useProject(id) {
  const { projects, loading } = useProjects()
  const project = projects.find((p) => String(p.id) === String(id)) || null
  return { project, loading }
}
