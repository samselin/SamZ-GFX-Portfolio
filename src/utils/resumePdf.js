// src/utils/resumePdf.js
// Generate a styled PDF resume on the fly from project data + a profile constant.
// Uses jsPDF (loaded from CDN at runtime to avoid bundling).
//
// The PDF opens in a new tab; users can then download it via the browser's
// native print → save-as-PDF, or jsPDF.save() triggers a direct download.
import { supabase } from '../supabase/config'

const PROFILE = {
  name: 'Sam Selin',
  title: '3D Generalist · AI Artist',
  location: 'Tamil Nadu, India',
  email: 'samzgfx8@gmail.com',
  linkedin: 'linkedin.com/in/s-am-selin',
  instagram: 'instagram.com/samz_gfx',
  youtube: '@SamzGfx',
  summary:
    'Computer Science graduate turned 3D Generalist. Specialising in product visualisation, VFX, and generative AI workflows. Experienced with Blender, After Effects, DaVinci Resolve, and modern AI image/video pipelines.',
  skills: [
    { name: 'Blender', level: 78 },
    { name: 'After Effects', level: 55 },
    { name: 'Photoshop', level: 60 },
    { name: 'DaVinci Resolve', level: 75 },
    { name: 'CapCut', level: 90 },
  ],
  education: {
    degree: 'B.E. Computer Science & Engineering',
    school: 'JP College of Engineering, Tamil Nadu',
    year: '2021 – 2025',
  },
}

function loadJsPDF() {
  return new Promise((resolve, reject) => {
    if (window.jspdf) return resolve(window.jspdf)
    const s = document.createElement('script')
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
    s.onload = () => resolve(window.jspdf)
    s.onerror = reject
    document.head.appendChild(s)
  })
}

export async function generateResumePDF() {
  // Fetch projects (3D + AI) for the "Selected Works" section
  let projects = []
  try {
    const [{ data: p3d }, { data: pai }] = await Promise.all([
      supabase?.from('projects').select('title, category, year, description').order('created_at', { ascending: false }).limit(6),
      supabase?.from('ai_projects').select('title, category, year, description').order('created_at', { ascending: false }).limit(6),
    ])
    projects = [
      ...(p3d || []).map((p) => ({ ...p, scope: '3D' })),
      ...(pai || []).map((p) => ({ ...p, scope: 'AI' })),
    ]
  } catch (_) {
    projects = []
  }

  const { jsPDF } = await loadJsPDF()
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  const W = doc.internal.pageSize.getWidth()
  const M = 48
  let y = M

  // ─── HEADER ─────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text(PROFILE.name, M, y)
  y += 22

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(110, 110, 110)
  doc.text(PROFILE.title, M, y)
  y += 16

  doc.setFontSize(9)
  doc.setTextColor(140, 140, 140)
  const contactLine = [PROFILE.email, PROFILE.linkedin, PROFILE.location]
    .filter(Boolean)
    .join('  ·  ')
  doc.text(contactLine, M, y)
  y += 22

  // Divider
  doc.setDrawColor(220, 220, 220)
  doc.line(M, y, W - M, y)
  y += 18

  // ─── SUMMARY ────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(40, 40, 40)
  doc.text('SUMMARY', M, y)
  y += 14

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(80, 80, 80)
  const summaryLines = doc.splitTextToSize(PROFILE.summary, W - M * 2)
  doc.text(summaryLines, M, y)
  y += summaryLines.length * 12 + 10

  // ─── SKILLS ──────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(40, 40, 40)
  doc.text('SKILLS', M, y)
  y += 12

  PROFILE.skills.forEach((s) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(60, 60, 60)
    doc.text(s.name, M, y + 9)
    // bar
    const barX = M + 110
    const barW = W - M - barX
    doc.setFillColor(230, 230, 230)
    doc.rect(barX, y + 3, barW, 5, 'F')
    doc.setFillColor(40, 40, 40)
    doc.rect(barX, y + 3, (barW * s.level) / 100, 5, 'F')
    doc.setFontSize(8)
    doc.setTextColor(140, 140, 140)
    doc.text(`${s.level}%`, W - M - 24, y + 9)
    y += 14
  })
  y += 10

  // ─── SELECTED WORKS ──────────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(40, 40, 40)
  doc.text('SELECTED WORKS', M, y)
  y += 14

  if (projects.length === 0) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    doc.setTextColor(140, 140, 140)
    doc.text('— See portfolio for full archive —', M, y)
    y += 14
  } else {
    projects.slice(0, 8).forEach((p) => {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(40, 40, 40)
      doc.text(`${p.title}`, M, y + 9)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(140, 140, 140)
      doc.text(`${p.scope} · ${p.category} · ${p.year || ''}`, W - M, y + 9, { align: 'right' })
      y += 14
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(80, 80, 80)
      const lines = doc.splitTextToSize(p.description || '', W - M * 2)
      doc.text(lines.slice(0, 2), M, y + 8)
      y += lines.slice(0, 2).length * 11 + 6
    })
  }
  y += 8

  // ─── EDUCATION ───────────────────────────────────────────────────
  if (y > 700) { doc.addPage(); y = M }
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(40, 40, 40)
  doc.text('EDUCATION', M, y)
  y += 14

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(60, 60, 60)
  doc.text(PROFILE.education.degree, M, y + 9)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(140, 140, 140)
  doc.text(PROFILE.education.year, W - M, y + 9, { align: 'right' })
  y += 14
  doc.setFontSize(9)
  doc.setTextColor(80, 80, 80)
  doc.text(PROFILE.education.school, M, y + 8)
  y += 18

  // ─── CONTACT ────────────────────────────────────────────────────
  if (y > 720) { doc.addPage(); y = M }
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(40, 40, 40)
  doc.text('CONTACT', M, y)
  y += 14
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(80, 80, 80)
  doc.text(`Email: ${PROFILE.email}`, M, y + 9)
  doc.text(`LinkedIn: ${PROFILE.linkedin}`, M, y + 22)
  doc.text(`Instagram: ${PROFILE.instagram}`, M, y + 35)
  doc.text(`YouTube: ${PROFILE.youtube}`, M, y + 48)

  // Save
  doc.save(`${PROFILE.name.replace(/\s+/g, '_')}_Resume.pdf`)
}