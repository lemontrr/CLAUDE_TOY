import React, { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import PaperCard from '../components/PaperCard'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { removeBookmark } from '../lib/localStorage'
import type { Paper } from '../types'

type SourceFilter = 'all' | 'arxiv' | 'semanticscholar' | 'openalex'
type SortOrder = 'newest' | 'title'

const SOURCE_TABS: { label: string; value: SourceFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'arXiv', value: 'arxiv' },
  { label: 'Semantic Scholar', value: 'semanticscholar' },
  { label: 'OpenAlex', value: 'openalex' },
]

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useLocalStorage<Paper[]>('rpf:bookmarks', [])
  const [activeFilter, setActiveFilter] = useState<SourceFilter>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')

  const handleRemove = useCallback(
    (paper: Paper) => {
      removeBookmark(paper.id)
      setBookmarks(bookmarks.filter((b) => b.id !== paper.id))
    },
    [bookmarks, setBookmarks],
  )

  const filtered = bookmarks.filter(
    (p) => activeFilter === 'all' || p.source === activeFilter,
  )

  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
    }
    return a.title.localeCompare(b.title)
  })

  const totalCount = bookmarks.length
  const filteredCount = filtered.length

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Bookmarks</h1>
          {totalCount > 0 && (
            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700">
              {totalCount}
            </span>
          )}
        </div>

        {/* Filter tabs + sort row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          {/* Source filter tabs */}
          <div className="flex flex-wrap gap-1" role="tablist" aria-label="Filter by source">
            {SOURCE_TABS.map(({ label, value }) => {
              const isActive = activeFilter === value
              const count =
                value === 'all'
                  ? totalCount
                  : bookmarks.filter((p) => p.source === value).length
              return (
                <button
                  key={value}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveFilter(value)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {label}
                  {count > 0 && (
                    <span
                      className={`ml-1.5 text-xs font-semibold ${
                        isActive ? 'text-indigo-200' : 'text-gray-400'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Sort dropdown */}
          {totalCount > 0 && (
            <div className="flex items-center gap-2">
              <label htmlFor="sort-order" className="text-sm text-gray-500 whitespace-nowrap">
                Sort by
              </label>
              <select
                id="sort-order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="newest">Newest first</option>
                <option value="title">Title (A–Z)</option>
              </select>
            </div>
          )}
        </div>

        {/* Content */}
        {totalCount === 0 ? (
          /* Empty state — no bookmarks at all */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <svg
              className="h-16 w-16 text-gray-300 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No bookmarks yet</h2>
            <p className="text-gray-500 mb-6 max-w-sm">
              Save papers you want to read later and they will appear here.
            </p>
            <Link
              to="/home"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              Browse papers
            </Link>
          </div>
        ) : filteredCount === 0 ? (
          /* Empty state — filter yields no results */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-500 mb-4">
              No bookmarks from this source yet.
            </p>
            <button
              onClick={() => setActiveFilter('all')}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none focus:underline"
            >
              Show all bookmarks
            </button>
          </div>
        ) : (
          /* Paper grid */
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {sorted.map((paper) => (
              <PaperCard
                key={paper.id}
                paper={paper}
                isBookmarked
                onBookmark={handleRemove}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
