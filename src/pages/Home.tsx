import React, { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import PaperCard from '../components/PaperCard'
import { useRecommendations } from '../hooks/useRecommendations'
import { addBookmark, removeBookmark, addFeedback, updateFeedbackWeight, getBookmarks } from '../lib/localStorage'
import type { Paper } from '../types'

function buildInitialBookmarkState(papers: Paper[]): Record<string, boolean> {
  const saved = getBookmarks()
  const savedIds = new Set(saved.map((p) => p.id))
  const state: Record<string, boolean> = {}
  for (const p of papers) {
    state[p.id] = savedIds.has(p.id)
  }
  return state
}

export default function Home() {
  const { papers, loading, error, refresh } = useRecommendations()
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>(() =>
    buildInitialBookmarkState([])
  )

  // Sync bookmark state when papers change
  React.useEffect(() => {
    setBookmarks(buildInitialBookmarkState(papers))
  }, [papers])

  const handleBookmark = useCallback((paper: Paper) => {
    const isCurrentlyBookmarked = bookmarks[paper.id] ?? false
    if (isCurrentlyBookmarked) {
      removeBookmark(paper.id)
    } else {
      addBookmark(paper)
    }
    setBookmarks((prev) => ({ ...prev, [paper.id]: !isCurrentlyBookmarked }))
  }, [bookmarks])

  const handleFeedback = useCallback((id: string, vote: 'up' | 'down') => {
    addFeedback(id, vote)
    updateFeedbackWeight(id, vote === 'up' ? 1 : -1)
  }, [])

  const todayPicks = papers.slice(0, 5)
  const remaining = papers.slice(5)

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Recommendations</h1>
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
            aria-label="Refresh recommendations"
          >
            <svg
              className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>

        {/* Loading state */}
        {loading && <LoadingSpinner size="lg" />}

        {/* Error state */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 flex flex-col items-start gap-3">
            <div className="flex items-center gap-2 text-red-700">
              <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <span className="font-semibold text-sm">Failed to load recommendations</span>
            </div>
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={refresh}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state — no tags configured */}
        {!loading && !error && papers.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-10 flex flex-col items-center gap-4 text-center">
            <svg className="h-12 w-12 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">No recommendations yet</h2>
              <p className="text-gray-500 text-sm max-w-xs">
                Add some interest tags to start receiving personalised paper recommendations.
              </p>
            </div>
            <Link
              to="/settings"
              className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
            >
              Go to Settings
            </Link>
          </div>
        )}

        {/* Papers available */}
        {!loading && !error && papers.length > 0 && (
          <div className="flex flex-col gap-10">
            {/* Today's Picks */}
            {todayPicks.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Today's Picks</h2>
                <div className="flex flex-col gap-4">
                  {todayPicks.map((paper) => (
                    <div key={paper.id} className="rounded-xl bg-indigo-50 p-1">
                      <PaperCard
                        paper={paper}
                        isBookmarked={bookmarks[paper.id] ?? false}
                        onBookmark={handleBookmark}
                        onFeedback={handleFeedback}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* All Recommendations grid */}
            {remaining.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">All Recommendations</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {remaining.map((paper) => (
                    <PaperCard
                      key={paper.id}
                      paper={paper}
                      isBookmarked={bookmarks[paper.id] ?? false}
                      onBookmark={handleBookmark}
                      onFeedback={handleFeedback}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
