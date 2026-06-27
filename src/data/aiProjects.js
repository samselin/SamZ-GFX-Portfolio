// src/data/aiProjects.js
// AI Studio projects — categories are limited to 'image' | 'video'.
// Reuses the same shape as mockProjects so ProjectDetail works out of the box.

export const aiProjects = [
  // ─── AI IMAGES ─────────────────────────────────────────────────────
  {
    id: 'ai-img-1',
    title: 'Neon Dreamscape',
    category: 'image',
    description:
      'A surreal cityscape bathed in bioluminescent light. Built from layered prompt compositions and curated in Nano Banana for chromatic balance.',
    thumbnail: 'https://images.unsplash.com/photo-1542856391-010fb87dcfed?w=1200',
    images: [
      'https://images.unsplash.com/photo-1542856391-010fb87dcfed?w=1600',
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200',
      'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1200',
    ],
    video: '',
    software: ['ChatGPT Image', 'Nano Banana'],
    year: 2025,
  },
  {
    id: 'ai-img-2',
    title: 'Mechanical Bloom',
    category: 'image',
    description:
      'Botanical forms fused with mechanical components — a study in contrast between organic curves and precision engineering.',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200',
    images: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1600',
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200',
    ],
    video: '',
    software: ['ChatGPT Image'],
    year: 2025,
  },
  {
    id: 'ai-img-3',
    title: 'Silent Cartographer',
    category: 'image',
    description:
      'Concept landscapes for an unproduced short film. Hand-curated compositions exploring light, distance, and absence.',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200',
    images: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200',
      'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=1200',
    ],
    video: '',
    software: ['Nano Banana'],
    year: 2025,
  },
  {
    id: 'ai-img-4',
    title: 'Portrait Study No. 7',
    category: 'image',
    description:
      'A series of stylised portrait studies exploring skin texture, soft lighting, and compositional depth.',
    thumbnail: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1200',
    images: [
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1600',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=1200',
    ],
    video: '',
    software: ['ChatGPT Image', 'Nano Banana'],
    year: 2025,
  },

  // ─── AI VIDEOS ─────────────────────────────────────────────────────
  {
    id: 'ai-vid-1',
    title: 'Liquid Chrome',
    category: 'video',
    description:
      'A study in reflective fluid simulation — molten chrome forms reshape themselves against a deep void. Generated with VEO and refined in Flow.',
    thumbnail: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200',
    images: [
      'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1600',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200',
    ],
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    software: ['VEO', 'Flow'],
    year: 2025,
  },
  {
    id: 'ai-vid-2',
    title: 'Aurora Drift',
    category: 'video',
    description:
      'Cinematic motion study of atmospheric particles drifting across an arctic horizon. Composed frame-by-frame in Higgsfield.',
    thumbnail: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1200',
    images: [
      'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1600',
    ],
    video: '',
    software: ['Higgsfield', 'Flow'],
    year: 2025,
  },
  {
    id: 'ai-vid-3',
    title: 'Synth Botanica',
    category: 'video',
    description:
      'Synthetic plant growth loop — petals unfold in slow motion under volumetric light. Built as a seamless motion piece.',
    thumbnail: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200',
    images: [
      'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1600',
      'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=1200',
    ],
    video: '',
    software: ['VEO', 'Higgsfield'],
    year: 2025,
  },
  {
    id: 'ai-vid-4',
    title: 'Glacial Pulse',
    category: 'video',
    description:
      'Slow-motion ice fragments falling through a deep blue void. Minimal sound design, maximal presence.',
    thumbnail: 'https://images.unsplash.com/photo-1517825738774-7de9363ef735?w=1200',
    images: [
      'https://images.unsplash.com/photo-1517825738774-7de9363ef735?w=1600',
    ],
    video: '',
    software: ['VEO', 'Flow'],
    year: 2025,
  },
]