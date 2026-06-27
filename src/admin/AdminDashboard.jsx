// src/admin/AdminDashboard.jsx
import { useState, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { addProject, updateProject, deleteProject, getProject } from '../supabase/projects'
import {
  addAIProject,
  updateAIProject,
  deleteAIProject,
  getAIProject,
} from '../supabase/aiProjects'
import { uploadFile, deleteFile, uploadResume } from '../supabase/storage'
import { useProjects, useAIProjects } from '../hooks/useProjects'
import Magnetic from '../components/Magnetic'
import { generateResumePDF } from '../utils/resumePdf'
import './AdminDashboard.css'

const DEFAULT_BREAKDOWNS = [
  { label: 'Modeling', desc: 'Base mesh construction, topology flow, and geometric detail work.' },
  { label: 'Texturing', desc: 'PBR material authoring, UV mapping, and surface detail painting.' },
  { label: 'Lighting', desc: 'HDRI environment, area lights, and mood-defining light placement.' },
  { label: 'Rendering', desc: 'Cycles / EEVEE render pass setup, noise reduction, and compositing.' },
]

// Categories supported per scope
const SCOPE_CONFIG = {
  portfolio: {
    label: '3D Projects',
    icon: '◈',
    categoryOptions: [
      'Product Visualization',
      'Architectural Visualization',
      'Abstract Art',
      'Motion Graphics',
      'VFX',
      'Character Art',
    ],
    hasBreakdowns: true,
    backRoute: '/portfolio',
  },
  ai: {
    label: 'AI Studio',
    icon: '◇',
    categoryOptions: ['image', 'video'],
    categoryLabels: { image: 'AI Image', video: 'AI Video' },
    hasBreakdowns: false,
    backRoute: '/ai-studio',
  },
}

const EMPTY_FORM = {
  title: '',
  category: '',
  description: '',
  software: '',
  year: new Date().getFullYear(),
  images: [], // array of public URLs
  video: '',
  breakdowns: [...DEFAULT_BREAKDOWNS],
}

export default function AdminDashboard() {
  const [scope, setScope] = useState('portfolio')
  const { projects: portfolioProjects, loading: portfolioLoading } = useProjects()
  const { projects: aiProjectsList, loading: aiLoading } = useAIProjects({ adminMode: true })

  const projects = scope === 'portfolio' ? portfolioProjects : aiProjectsList
  const loading = scope === 'portfolio' ? portfolioLoading : aiLoading
  const config = SCOPE_CONFIG[scope]

  const [search, setSearch] = useState('')
  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projects
    const q = search.toLowerCase()
    return projects.filter((p) => {
      const haystack = [
        p.title,
        p.category,
        p.year,
        ...(p.software || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [projects, search])

  const [view, setView] = useState('list')
  const [editingProject, setEditingProject] = useState(null)
  const [galleryProject, setGalleryProject] = useState(null)
  const [lightboxSrc, setLightboxSrc] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [pdfGenerating, setPdfGenerating] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [status, setStatus] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const handleLogout = () => {
    sessionStorage.removeItem('sam_admin')
    navigate('/')
  }

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setSaving(true)
    setStatus('Uploading resume...')

    try {
      await uploadResume(file)
      setStatus('✓ Resume uploaded successfully!')
    } catch (err) {
      console.error(err)
      setStatus(`✗ Upload failed: ${err.message}`)
    } finally {
      setSaving(false)
      if (e.target) e.target.value = ''
    }
  }

  const switchScope = (nextScope) => {
    setScope(nextScope)
    setView('list')
    setEditingProject(null)
    setGalleryProject(null)
    setForm(EMPTY_FORM)
    setStatus('')
    setUploadProgress('')
  }

  const openUpload = () => {
    setForm({
      ...EMPTY_FORM,
      category: scope === 'ai' ? 'image' : '',
    })
    setEditingProject(null)
    setView('upload')
    setStatus('')
    setUploadProgress('')
  }

  const openEdit = (project) => {
    setEditingProject(project)
    setForm({
      title: project.title || '',
      category: project.category || '',
      description: project.description || '',
      software: project.software?.join(', ') || '',
      year: project.year || new Date().getFullYear(),
      images: project.images || [],
      video: project.video || '',
      breakdowns: project.breakdowns?.length
        ? project.breakdowns
        : [...DEFAULT_BREAKDOWNS],
    })
    setView('edit')
    setStatus('')
    setUploadProgress('')
  }

  const openGalleryManager = (project) => {
    setGalleryProject(project)
    setForm({
      ...EMPTY_FORM,
      images: project.images || [],
      video: project.video || '',
    })
    setView('gallery')
    setStatus('')
    setUploadProgress('')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleBreakdownChange = (index, field, value) => {
    const newBreakdowns = [...form.breakdowns]
    newBreakdowns[index] = { ...newBreakdowns[index], [field]: value }
    setForm((f) => ({ ...f, breakdowns: newBreakdowns }))
  }

  const handleAddBreakdown = () => {
    setForm((f) => ({
      ...f,
      breakdowns: [...f.breakdowns, { label: '', desc: '' }],
    }))
  }

  const handleRemoveBreakdown = (index) => {
    setForm((f) => ({
      ...f,
      breakdowns: f.breakdowns.filter((_, i) => i !== index),
    }))
  }

  // Handle direct file selection
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    setSaving(true)
    setStatus('')

    try {
      const newImages = [...form.images]
      let newVideo = form.video

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setUploadProgress(`Uploading ${i + 1} of ${files.length}...`)

        const publicUrl = await uploadFile(file)

        if (file.type.startsWith('video/')) {
          newVideo = publicUrl
        } else {
          newImages.push(publicUrl)
        }
      }

      setForm((f) => ({ ...f, images: newImages, video: newVideo }))
      setUploadProgress('')
      setStatus('✓ Files uploaded temporarily. Save project to keep them.')
    } catch (err) {
      console.error(err)
      setStatus(`✗ Upload failed: ${err.message}`)
      setUploadProgress('')
    } finally {
      setSaving(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Remove a file from the current form array and actually delete it from storage
  const handleRemoveImage = async (indexToRemove) => {
    const urlToRemove = form.images[indexToRemove]

    // Remove from UI immediately
    setForm(f => ({
      ...f,
      images: f.images.filter((_, i) => i !== indexToRemove)
    }))

    // Delete from Supabase Storage
    try {
      await deleteFile(urlToRemove)
    } catch (err) {
      console.error("Failed to delete from storage", err)
    }
  }

  const handleRemoveVideo = async () => {
    const v = form.video
    setForm(f => ({ ...f, video: '' }))
    try {
      await deleteFile(v)
    } catch (err) {
      console.error("Failed to delete video from storage", err)
    }
  }

  const buildPayload = () => {
    const data = {
      title: form.title,
      category: form.category,
      description: form.description,
      software: form.software.split(',').map((s) => s.trim()).filter(Boolean),
      year: Number(form.year),
      images: form.images,
      thumbnail: form.images[0] || '',
      video: form.video,
    }
    // Only include breakdowns for 3D portfolio scope
    if (scope === 'portfolio') {
      data.breakdowns = form.breakdowns
    }
    return data
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.category) {
      setStatus('✗ Title and Category are required.')
      return
    }
    setSaving(true)
    setStatus('Saving project...')
    try {
      const data = buildPayload()

      if (view === 'edit' && editingProject) {
        if (scope === 'portfolio') {
          await updateProject(editingProject.id, data)
        } else {
          await updateAIProject(editingProject.id, data)
        }
        setStatus('✓ Project updated!')
      } else {
        if (scope === 'portfolio') {
          await addProject(data)
        } else {
          await addAIProject(data)
        }
        setStatus('✓ Project published!')
      }
      setTimeout(() => {
        setView('list')
        window.location.reload()
      }, 1200)
    } catch (err) {
      setStatus(`✗ Error: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleGallerySubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setStatus('Saving gallery...')
    try {
      const data = {
        images: form.images,
        thumbnail: form.images.length > 0 ? form.images[0] : (galleryProject.thumbnail || ''),
        video: form.video,
      }
      if (scope === 'portfolio') {
        await updateProject(galleryProject.id, data)
      } else {
        await updateAIProject(galleryProject.id, data)
      }
      setStatus('✓ Gallery updated!')
      setTimeout(() => {
        setView('list')
        window.location.reload()
      }, 1200)
    } catch (err) {
      setStatus(`✗ Error: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      // First fetch the project to get all media URLs
      const targetProject =
        scope === 'portfolio'
          ? await getProject(id)
          : await getAIProject(id)

      // Delete the database row
      if (scope === 'portfolio') {
        await deleteProject(id)
      } else {
        await deleteAIProject(id)
      }
      setConfirmDelete(null)

      // Background cleanup: delete actual files from storage
      if (targetProject) {
        if (targetProject.images?.length) {
          targetProject.images.forEach(img => deleteFile(img))
        }
        if (targetProject.video) {
          deleteFile(targetProject.video)
        }
      }

      window.location.reload()
    } catch (err) {
      alert('Delete failed: ' + err.message)
    }
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar glass">
        <div className="admin-sidebar__logo">
          <span className="display">SS</span>
          <span className="mono">Admin</span>
        </div>

        {/* Scope toggle — 3D Projects vs AI Studio */}
        <div className="admin-scope-toggle" role="tablist" aria-label="Project scope">
          <button
            role="tab"
            aria-selected={scope === 'portfolio'}
            className={`admin-scope-btn ${scope === 'portfolio' ? 'active' : ''}`}
            onClick={() => switchScope('portfolio')}
          >
            ◈ <span>3D Projects</span>
          </button>
          <button
            role="tab"
            aria-selected={scope === 'ai'}
            className={`admin-scope-btn ${scope === 'ai' ? 'active' : ''}`}
            onClick={() => switchScope('ai')}
          >
            ◇ <span>AI Studio</span>
          </button>
        </div>

        <nav className="admin-sidebar__nav">
          <button
            className={`admin-nav-btn ${view === 'list' ? 'active' : ''}`}
            onClick={() => setView('list')}
          >
            {config.icon} {config.label}
          </button>
          <button
            className={`admin-nav-btn ${view === 'upload' ? 'active' : ''}`}
            onClick={openUpload}
          >
            + New {scope === 'ai' ? 'AI' : '3D'} Project
          </button>
          <button
            className={`admin-nav-btn ${view === 'resume' ? 'active' : ''}`}
            onClick={() => { setView('resume'); setStatus(''); setUploadProgress(''); }}
          >
            📄 Resume
          </button>
        </nav>
        <button className="admin-nav-btn admin-logout" onClick={handleLogout}>
          ↩ Logout
        </button>
      </aside>

      {/* Main */}
      <main className="admin-main">

        {/* List */}
        {view === 'list' && (
          <div className="admin-panel">
            <div className="admin-panel__header">
              <h1 className="display admin-panel__title">
                {config.label}
                <span className="mono admin-panel__scope">· {scope === 'ai' ? 'image / video' : '3D / VFX'}</span>
              </h1>
              <Magnetic strength={0.2}>
                <button className="btn btn-primary" onClick={openUpload}>
                  + New Project
                </button>
              </Magnetic>
            </div>

            <div className="admin-search">
              <span className="admin-search__icon mono">⌕</span>
              <input
                type="text"
                className="admin-search__input"
                placeholder={`Search ${scope === 'ai' ? 'AI Studio' : '3D'} projects by title, category, year, or tools…`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="admin-search__clear mono"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                >✕</button>
              )}
            </div>

            {loading ? (
              <p className="mono admin-empty">Loading...</p>
            ) : filteredProjects.length === 0 ? (
              <p className="mono admin-empty">
                {search
                  ? `No ${scope === 'ai' ? 'AI' : ''} projects match "${search}".`
                  : `No ${scope === 'ai' ? 'AI studio' : ''} projects yet. Add your first one.`}
              </p>
            ) : (
              <div className="admin-project-list">
                {filteredProjects.map((project) => (
                  <div key={project.id} className="admin-project-row">
                    <div
                      className="admin-project-row__thumb admin-project-row__thumb--clickable"
                      onClick={() => project.thumbnail && setLightboxSrc(project.thumbnail)}
                      title="Click to preview"
                    >
                      {project.thumbnail
                        ? <img src={project.thumbnail} alt={project.title} />
                        : <div className="admin-project-row__thumb-empty" />
                      }
                    </div>
                    <div className="admin-project-row__info">
                      <h3 className="admin-project-row__title display">
                        {project.title}
                      </h3>
                      <span className="mono admin-project-row__meta">
                        {scope === 'ai'
                          ? (SCOPE_CONFIG.ai.categoryLabels[project.category] || project.category)
                          : project.category}{' · '}{project.year}
                      </span>
                    </div>
                    <div className="admin-project-row__actions">
                      <button className="admin-action-btn" onClick={() => openGalleryManager(project)}>
                        Gallery
                      </button>
                      <button className="admin-action-btn" onClick={() => openEdit(project)}>
                        Edit
                      </button>
                      <button
                        className="admin-action-btn admin-action-btn--danger"
                        onClick={() => setConfirmDelete(project.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Upload / Edit Form */}
        {(view === 'upload' || view === 'edit') && (
          <div className="admin-panel">
            <div className="admin-panel__header">
              <h1 className="display admin-panel__title">
                {view === 'edit' ? 'Edit' : 'New'} {config.label.slice(0, -1)}
              </h1>
              <Magnetic strength={0.15}>
                <button className="btn btn-ghost" onClick={() => setView('list')}>
                  ← Back
                </button>
              </Magnetic>
            </div>

            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form__row">
                <AdminField label="Title *" name="title" value={form.title} onChange={handleChange} />

                {scope === 'portfolio' ? (
                  <AdminField
                    label="Category *"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="e.g. Product Visualization"
                  />
                ) : (
                  <label className="admin-field">
                    <span className="mono admin-field__label">Category *</span>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="admin-input admin-select"
                    >
                      <option value="">Select type…</option>
                      {SCOPE_CONFIG.ai.categoryOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {SCOPE_CONFIG.ai.categoryLabels[opt]}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              <div className="admin-form__row">
                <AdminField label="Year" name="year" type="number" value={form.year} onChange={handleChange} />
                <AdminField
                  label="Software (comma-separated)"
                  name="software"
                  value={form.software}
                  onChange={handleChange}
                  placeholder={scope === 'ai' ? 'VEO, Flow, Higgsfield' : 'Blender, After Effects'}
                />
              </div>

              <label className="admin-field">
                <span className="mono admin-field__label">Description</span>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="admin-input admin-textarea"
                  placeholder="Describe the project..."
                />
              </label>

              {/* Breakdowns — only for 3D portfolio */}
              {config.hasBreakdowns && (
                <div className="admin-field" style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span className="mono admin-field__label" style={{ marginBottom: 0 }}>Project Breakdown Steps</span>
                    <button type="button" className="btn btn-ghost" style={{ padding: '4px 12px', fontSize: '0.7rem' }} onClick={handleAddBreakdown}>+ Add Step</button>
                  </div>

                  <div className="admin-breakdowns-list">
                    {form.breakdowns.map((item, i) => (
                      <div key={i} className="admin-breakdown-row">
                        <div className="admin-breakdown-row__inputs">
                          <input
                            type="text"
                            className="admin-input"
                            placeholder="Step Name (e.g. Modeling)"
                            value={item.label}
                            onChange={(e) => handleBreakdownChange(i, 'label', e.target.value)}
                          />
                          <textarea
                            className="admin-input admin-textarea"
                            rows={2}
                            placeholder="Short description of this step..."
                            value={item.desc}
                            onChange={(e) => handleBreakdownChange(i, 'desc', e.target.value)}
                          />
                        </div>
                        <button
                          type="button"
                          className="admin-breakdown-row__remove admin-action-btn admin-action-btn--danger"
                          onClick={() => handleRemoveBreakdown(i)}
                          title="Remove Step"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {form.breakdowns.length === 0 && (
                      <span className="mono" style={{ color: 'var(--c-grey-5)', fontSize: '0.8rem' }}>No breakdown steps added.</span>
                    )}
                  </div>
                </div>
              )}

              {/* Media Upload Area */}
              <div className="admin-field" style={{ marginTop: '1rem' }}>
                <span className="mono admin-field__label">Media Upload (Images / Video)</span>

                <div
                  className="admin-dropzone"
                  onClick={() => !saving && fileInputRef.current?.click()}
                  style={{ opacity: saving ? 0.5 : 1, pointerEvents: saving ? 'none' : 'auto' }}
                >
                  <span className="mono">+ Choose Files</span>
                  <span className="mono admin-dropzone__hint">
                    Select multiple images and/or one video. They will be uploaded immediately.
                  </span>
                  {uploadProgress && (
                    <span className="mono" style={{ color: '#4caf50', marginTop: 8 }}>{uploadProgress}</span>
                  )}
                </div>

                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />

                {/* Media Preview */}
                {(form.images.length > 0 || form.video) && (
                  <div className="admin-image-preview">
                    {/* Images */}
                    {form.images.map((url, i) => (
                      <div key={i} className="admin-image-preview__item">
                        <img src={url} alt={`preview ${i + 1}`} onError={(e) => e.target.style.opacity = 0.2} />
                        {i === 0 && <span className="mono admin-image-preview__badge">Cover</span>}
                        <button
                          type="button"
                          className="admin-image-preview__remove"
                          title="Delete image"
                          onClick={(e) => { e.stopPropagation(); handleRemoveImage(i); }}
                        >✕</button>
                      </div>
                    ))}

                    {/* Video */}
                    {form.video && (
                      <div className="admin-image-preview__item" style={{ border: '1px solid #ff6b6b' }}>
                        {form.video.includes('youtube') || form.video.includes('vimeo') || form.video.includes('drive.google') ? (
                          <iframe src={form.video} title="preview" style={{ width: '100%', height: '100%', pointerEvents: 'none' }} frameBorder="0" />
                        ) : (
                          <video src={form.video} />
                        )}
                        <span className="mono admin-image-preview__badge" style={{ background: '#ff6b6b' }}>Video</span>
                        <button
                          type="button"
                          className="admin-image-preview__remove"
                          title="Delete video"
                          onClick={(e) => { e.stopPropagation(); handleRemoveVideo(); }}
                        >✕</button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {status && (
                <p className={`mono admin-status ${status.startsWith('✓') ? 'ok' : 'err'}`}>
                  {status}
                </p>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving || uploadProgress !== ''}
                style={{ alignSelf: 'flex-start', marginTop: '1rem' }}
              >
                {saving && !uploadProgress ? 'Saving...' : view === 'edit' ? 'Save Changes' : 'Publish Project'}
              </button>
            </form>
          </div>
        )}

        {/* Gallery Manager Form */}
        {view === 'gallery' && galleryProject && (
          <div className="admin-panel">
            <div className="admin-panel__header">
              <h1 className="display admin-panel__title">
                Manage Gallery: {galleryProject.title}
              </h1>
              <Magnetic strength={0.15}>
                <button className="btn btn-ghost" onClick={() => setView('list')}>
                  ← Back
                </button>
              </Magnetic>
            </div>

            <form onSubmit={handleGallerySubmit} className="admin-form">
              <div className="admin-field">
                <span className="mono admin-field__label">Project Media (Images / Video)</span>

                <div
                  className="admin-dropzone"
                  onClick={() => !saving && fileInputRef.current?.click()}
                  style={{ opacity: saving ? 0.5 : 1, pointerEvents: saving ? 'none' : 'auto' }}
                >
                  <span className="mono">+ Choose Files</span>
                  <span className="mono admin-dropzone__hint">
                    Select multiple images and/or one video. They will be uploaded immediately.
                  </span>
                  {uploadProgress && (
                    <span className="mono" style={{ color: '#4caf50', marginTop: 8 }}>{uploadProgress}</span>
                  )}
                </div>

                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />

                {/* Media Preview */}
                {(form.images.length > 0 || form.video) && (
                  <div className="admin-image-preview">
                    {/* Images */}
                    {form.images.map((url, i) => (
                      <div key={i} className="admin-image-preview__item">
                        <img src={url} alt={`preview ${i + 1}`} onError={(e) => e.target.style.opacity = 0.2} />
                        {i === 0 && <span className="mono admin-image-preview__badge">Cover</span>}
                        <button
                          type="button"
                          className="admin-image-preview__remove"
                          title="Delete image"
                          onClick={(e) => { e.stopPropagation(); handleRemoveImage(i); }}
                        >✕</button>
                      </div>
                    ))}

                    {/* Video */}
                    {form.video && (
                      <div className="admin-image-preview__item" style={{ border: '1px solid #ff6b6b' }}>
                        {form.video.includes('youtube') || form.video.includes('vimeo') || form.video.includes('drive.google') ? (
                          <iframe src={form.video} title="preview" style={{ width: '100%', height: '100%', pointerEvents: 'none' }} frameBorder="0" />
                        ) : (
                          <video src={form.video} />
                        )}
                        <span className="mono admin-image-preview__badge" style={{ background: '#ff6b6b' }}>Video</span>
                        <button
                          type="button"
                          className="admin-image-preview__remove"
                          title="Delete video"
                          onClick={(e) => { e.stopPropagation(); handleRemoveVideo(); }}
                        >✕</button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {status && (
                <p className={`mono admin-status ${status.startsWith('✓') ? 'ok' : 'err'}`}>
                  {status}
                </p>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving || uploadProgress !== ''}
                style={{ alignSelf: 'flex-start', marginTop: '1rem' }}
              >
                {saving && !uploadProgress ? 'Saving...' : 'Save Gallery'}
              </button>
            </form>
          </div>
        )}

        {/* Resume Settings */}
        {view === 'resume' && (
          <div className="admin-panel">
            <div className="admin-panel__header">
              <h1 className="display admin-panel__title">Manage Resume</h1>
            </div>

            <div className="admin-form">
              <p className="about-bio" style={{ marginBottom: '1.5rem', color: 'var(--c-grey-4)', fontSize: '1rem' }}>
                Upload your resume document. The new file will instantly replace the old one for visitors downloading it from the home page.
              </p>

              <div
                className="admin-dropzone"
                onClick={() => !saving && document.getElementById('resume-upload').click()}
                style={{ opacity: saving ? 0.5 : 1, pointerEvents: saving ? 'none' : 'auto' }}
              >
                <span className="mono">+ Choose Resume File (PDF)</span>
                <span className="mono admin-dropzone__hint">Max 5MB</span>
              </div>

              <input
                id="resume-upload"
                type="file"
                accept="application/pdf"
                style={{ display: 'none' }}
                onChange={handleResumeUpload}
              />

              {status && (
                <p className={`mono admin-status ${status.startsWith('✓') ? 'ok' : 'err'}`} style={{ marginTop: '1rem' }}>
                  {status}
                </p>
              )}

              {/* ─── AUTO-GENERATED PREVIEW ──────────────────────────────── */}
              <div className="admin-divider" style={{ margin: '2.5rem 0 1.5rem' }}>
                <span className="mono admin-divider__label">OR · Auto-generate</span>
              </div>

              <p className="about-bio" style={{ marginBottom: '1rem', color: 'var(--c-grey-4)', fontSize: '0.95rem' }}>
                Generate a styled PDF from your latest projects + profile data on the fly — no upload needed. Useful as a quick preview or as the final document after you've entered your details above.
              </p>

              <Magnetic strength={0.15}>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={pdfGenerating}
                  onClick={async () => {
                    try {
                      setPdfGenerating(true)
                      setStatus('')
                      await generateResumePDF()
                      setStatus('✓ PDF generated — check your downloads.')
                    } catch (err) {
                      setStatus(err.message || 'PDF generation failed.')
                    } finally {
                      setPdfGenerating(false)
                    }
                  }}
                  style={{ minWidth: 220 }}
                >
                  {pdfGenerating ? '⏳ Generating…' : '⚡ Generate Preview PDF'}
                </button>
              </Magnetic>
            </div>
          </div>
        )}
      </main>

      {/* Thumbnail Lightbox Preview */}
      <AnimatePresence>
        {lightboxSrc && (
          <motion.div
            className="admin-confirm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxSrc(null)}
          >
            <button
              className="lightbox-back"
              style={{ position: 'absolute', top: 'var(--space-xl)', left: 'var(--space-xl)', zIndex: 1 }}
              onClick={(e) => { e.stopPropagation(); setLightboxSrc(null); }}
            >
              ← Close
            </button>
            <motion.img
              src={lightboxSrc}
              alt="Preview"
              className="lightbox-img"
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            className="admin-confirm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="admin-confirm-modal glass"
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3 className="display admin-confirm-modal__title">Delete?</h3>
              <p className="admin-confirm-modal__sub">This will delete the {scope === 'ai' ? 'AI studio' : ''} project and all attached files.</p>
              <div className="admin-confirm-modal__actions">
                <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>
                  Cancel
                </button>
                <button className="btn admin-btn-danger" onClick={() => handleDelete(confirmDelete)}>
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function AdminField({ label, name, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <label className="admin-field">
      <span className="mono admin-field__label">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="admin-input"
        placeholder={placeholder}
      />
    </label>
  )
}