'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateStory() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '', synopsis: '', authorName: '', chapterTitle: '', chapterContent: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const res = await fetch('/api/stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    if (res.ok) {
      router.push('/')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto bg-[#1e1e1e] p-8 rounded-lg shadow-xl border border-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-white border-b border-gray-700 pb-2">Publicar nueva historia</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input required type="text" placeholder="Título de la historia" 
          className="bg-[#2a2a2a] p-3 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#ff8b3d]"
          onChange={(e) => setFormData({...formData, title: e.target.value})} />
        <input required type="text" placeholder="Tu nombre de autor/Usuario" 
          className="bg-[#2a2a2a] p-3 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#ff8b3d]"
          onChange={(e) => setFormData({...formData, authorName: e.target.value})} />
        <textarea required placeholder="Sinopsis (¿De qué trata?)" rows={3}
          className="bg-[#2a2a2a] p-3 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#ff8b3d]"
          onChange={(e) => setFormData({...formData, synopsis: e.target.value})} />
        <h2 className="text-xl font-semibold mt-4 text-[#ff8b3d]">Primer Capítulo</h2>
        <input required type="text" placeholder="Título del capítulo (Ej: Prólogo)" 
          className="bg-[#2a2a2a] p-3 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#ff8b3d]"
          onChange={(e) => setFormData({...formData, chapterTitle: e.target.value})} />
        <textarea required placeholder="Escribe tu historia aquí..." rows={10}
          className="bg-[#2a2a2a] p-3 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#ff8b3d]"
          onChange={(e) => setFormData({...formData, chapterContent: e.target.value})} />
        <button type="submit" disabled={loading}
          className="mt-4 bg-[#ff8b3d] text-white p-3 rounded font-bold hover:bg-[#e07020] transition disabled:opacity-50">
          {loading ? 'Publicando...' : 'Publicar Historia'}
        </button>
      </form>
    </div>
  )
}
