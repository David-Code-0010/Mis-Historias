import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mis-Historias',
  description: 'Reviviendo la era dorada de la lectura y escritura.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-[#121212] text-[#e5e5e5] min-h-screen font-sans">
        <nav className="bg-[#1e1e1e] border-b border-gray-800 p-4 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-[#ff8b3d] tracking-wider">
              Mis-Historias
            </Link>
            <div className="flex gap-4">
              <Link href="/" className="hover:text-[#ff8b3d] transition">Descubrir</Link>
              <Link href="/create" className="bg-[#ff8b3d] text-white px-4 py-1 rounded-full font-semibold hover:bg-[#e07020] transition">
                Escribir
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto p-4 mt-6">
          {children}
        </main>
      </body>
    </html>
  )
}
