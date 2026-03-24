// src/admin/AdminDashboard.jsx
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { addProject, updateProject, deleteProject, getProject } from '../supabase/projects'
import { uploadFile, deleteFile, uploadResume } from '../supabase/storage'
import { useProjects } from '../hooks/useProjects'
import './AdminDashboard.css'

const DEFAULT_BREAKDOWNS = [
  { label: 'Modeling', desc: 'Base mesh construction, topology flow, and geometric detail work.' },
  { label: 'Texturing', desc: 'PBR material authoring, UV mapping, and surface detail painting.' },
  { label: 'Lighting', desc: 'HDRI environment, area lights, and mood-defining light placement.' },
  { label: 'Rendering', desc: 'Cycles / EEVEE render pass setup, noise reduction, and compositing.' },
]

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
  const { projects, loading } = useProjects()
  const [view, setView] = useState('list')
  const [editingProject, setEditingProject] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
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

  const openUpload = () => {
    setForm(EMPTY_FORM)
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
      breakdowns: project.breakdowns || [...DEFAULT_BREAKDOWNS],
    })
    setView('edit')
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.category) {
      setStatus('✗ Title and Category are required.')
      return
    }
    setSaving(true)
    setStatus('Saving project...')
    try {
      const data = {
        title: form.title,
        category: form.category,
        description: form.description,
        software: form.software.split(',').map((s) => s.trim()).filter(Boolean),
        year: Number(form.year),
        images: form.images,
        thumbnail: form.images[0] || '',
        video: form.video,
        breakdowns: form.breakdowns,
      }

      if (view === 'edit' && editingProject) {
        // Find if any old images were removed during edit, if so we should probably clean them up 
        // (Handled partially by handleRemoveImage above if they interacted via UI)
        await updateProject(editingProject.id, data)
        setStatus('✓ Project updated!')
      } else {
        await addProject(data)
        setStatus('✓ Project published!')
      }
      setTimeout(() => {
        setView('list')
        window.location.reload() // Quickest way to refetch the project list cleanly
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
      const targetProject = await getProject(id)

      // Delete the database row
      await deleteProject(id)
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
        <nav className="admin-sidebar__nav">
          <button
            className={`admin-nav-btn ${view === 'list' ? 'active' : ''}`}
            onClick={() => setView('list')}
          >
            ◈ Projects
          </button>
          <button
            className={`admin-nav-btn ${view === 'upload' ? 'active' : ''}`}
            onClick={openUpload}
          >
            + New Project
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
              <h1 className="display admin-panel__title">Projects</h1>
              <button className="btn btn-primary" onClick={openUpload}>
                + New Project
              </button>
            </div>

            {loading ? (
              <p className="mono admin-empty">Loading...</p>
            ) : projects.length === 0 ? (
              <p className="mono admin-empty">No projects yet. Add your first one.</p>
            ) : (
              <div className="admin-project-list">
                {projects.map((project) => (
                  <div key={project.id} className="admin-project-row">
                    <div className="admin-project-row__thumb">
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
                        {project.category} · {project.year}
                      </span>
                    </div>
                    <div className="admin-project-row__actions">
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
                {view === 'edit' ? 'Edit Project' : 'New Project'}
              </h1>
              <button className="btn btn-ghost" onClick={() => setView('list')}>
                ← Back
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form__row">
                <AdminField label="Title *" name="title" value={form.title} onChange={handleChange} />
                <AdminField label="Category *" name="category" value={form.category} onChange={handleChange} placeholder="e.g. Product Visualization" />
              </div>
              <div className="admin-form__row">
                <AdminField label="Year" name="year" type="number" value={form.year} onChange={handleChange} />
                <AdminField label="Software (comma-separated)" name="software" value={form.software} onChange={handleChange} placeholder="Blender, After Effects" />
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

              {/* Breakdowns Area */}
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
            </div>
          </div>
        )}
      </main>

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
              <p className="admin-confirm-modal__sub">This will delete the project and all attached files.</p>
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