import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface LayoutProps {
  children: React.ReactNode
}

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Bookmarks', to: '/bookmarks' },
  { label: 'Settings', to: '/settings' },
]

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-indigo-900 shadow-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="text-white font-bold text-xl tracking-tight select-none"
          >
            PaperFeed
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, to }) => {
              const active = location.pathname === to
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? 'bg-indigo-700 text-white'
                        : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-indigo-200 hover:text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-indigo-900 border-t border-indigo-700 px-4 pb-3">
            <ul className="flex flex-col gap-1 pt-2">
              {navLinks.map(({ label, to }) => {
                const active = location.pathname === to
                return (
                  <li key={to}>
                    <Link
                      to={to}
                      onClick={() => setMenuOpen(false)}
                      className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        active
                          ? 'bg-indigo-700 text-white'
                          : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                      }`}
                    >
                      {label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </nav>

      <main className="min-h-screen pt-16 bg-gray-50">
        {children}
      </main>
    </>
  )
}
