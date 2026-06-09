export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  const { url } = await res.json();
  return url;
}

export async function deleteFile(publicUrl) {
  if (!publicUrl) return;
  // Only attempt deletion for files stored in Netlify Blobs
  if (!publicUrl.includes('/api/media')) return;

  try {
    const res = await fetch('/api/delete-file', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: publicUrl }),
    });
    if (!res.ok) {
      console.error('Failed to delete file:', await res.text());
    }
  } catch (err) {
    console.error('Failed to delete file:', err);
  }
}

export async function uploadResume(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'resume');

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  const { url } = await res.json();
  return url;
}

export function getResumeUrl() {
  return `/api/media?key=${encodeURIComponent('resume/resume.pdf')}`;
}
