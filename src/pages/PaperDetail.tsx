import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import SourceBadge from '../components/SourceBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import { fetchArxivPaper } from '../api/arxiv'
import { fetchOpenAlexPaper } from '../api/openAlex'
import {
  addToReadHistory,
  addBookmark,
  removeBookmark,
  isBookmarked,
  addFeedback,
} from '../lib/localStorage'
import type { Paper } from '../types'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

async function fetchPaperById(id: string): Promise<Paper | null> {
  if (id.startsWith('arxiv:')) {
    const arxivId = id.slice('arxiv:'.length)
    return fetchArxivPaper(arxivId)
  }
  if (id.startsWith('oa:')) {
    // Strip the "oa:" prefix; the remainder is the full OpenAlex work URL or short ID
    const workId = id.slice('oa:'.length)
    return fetchOpenAlexPaper(workId)
  }
  if (id.startsWith('ss:')) {
    // Semantic Scholar API not yet implemented — surface a clear error
    return null
  }
  return null
}

export default function PaperDetail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const rawId = searchParams.get('id') ?? ''

  const [paper, setPaper] = useState<Paper | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookmarked, setBookmarked] = useState(false)
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)

  useEffect(() => {
    if (!rawId) {
      setError('No paper ID provided.')
      setLoading(false)
      return
    }

    let cancelled = false

    setLoading(true)
    setError(null)
    setPaper(null)

    fetchPaperById(rawId)
      .then((result) => {
        if (cancelled) return
        if (!result) {
          if (rawId.startsWith('ss:')) {
            setError('Semantic Scholar paper fetching is not yet supported.')
          } else {
            setError('Paper not found or failed to load.')
          }
        } else {
          setPaper(result)
          setBookmarked(isBookmarked(result.id))
          addToReadHistory(result)
        }
      })
      .catch(() => {
        if (!cancelled) setError('An unexpected error occurred while loading the paper.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [rawId])

  function handleBookmarkToggle() {
    if (!paper) return
    if (bookmarked) {
      removeBookmark(paper.id)
      setBookmarked(false)
    } else {
      addBookmark(paper)
      setBookmarked(true)
    }
  }

  function handleFeedback(vote: 'up' | 'down') {
    if (!paper) return
    addFeedback(paper.id, vote)
    setFeedback(vote)
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 mb-6 focus:outline-none focus:underline"
          aria-label="Go back"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Loading state */}
        {loading && <LoadingSpinner size="lg" />}

        {/* Error state */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700 font-medium text-base">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 text-sm text-indigo-600 hover:underline focus:outline-none"
            >
              Go back
            </button>
          </div>
        )}

        {/* Paper content */}
        {!loading && !error && paper && (
          <article className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-5">
            {/* Source badge + date row */}
            <div className="flex items-center gap-3 flex-wrap">
              <SourceBadge source={paper.source} />
              {paper.publishedDate && (
                <span className="text-gray-500 text-sm">{formatDate(paper.publishedDate)}</span>
              )}
              {paper.citationCount !== undefined && (
                <span className="text-gray-400 text-sm ml-auto">
                  {paper.citationCount.toLocaleString()} citations
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 leading-snug">{paper.title}</h1>

            {/* Authors */}
            {paper.authors.length > 0 && (
              <p className="text-sm text-gray-600 leading-relaxed">
                {paper.authors.join(', ')}
              </p>
            )}

            {/* DOI link */}
            {paper.doi && (
              <a
                href={`https://doi.org/${paper.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline break-all focus:outline-none focus:underline"
                aria-label={`DOI: ${paper.doi}`}
              >
                DOI: {paper.doi}
              </a>
            )}

            {/* Abstract */}
            {paper.abstract && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Abstract
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {paper.abstract}
                </p>
              </section>
            )}

            {/* Tags */}
            {paper.tags && paper.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {paper.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Action bar */}
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100 flex-wrap">
              {/* Bookmark toggle */}
              <button
                onClick={handleBookmarkToggle}
                aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark paper'}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                  bookmarked
                    ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg
                  className="h-4 w-4"
                  fill={bookmarked ? 'currentColor' : 'none'}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
                {bookmarked ? 'Saved' : 'Save'}
              </button>

              {/* PDF download button */}
              {paper.pdfUrl && (
                <a
                  href={paper.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Download PDF"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                    />
                  </svg>
                  PDF
                </a>
              )}

              {/* Thumbs up */}
              <button
                onClick={() => handleFeedback('up')}
                aria-label="Mark as relevant"
                aria-pressed={feedback === 'up'}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 ${
                  feedback === 'up'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
                }`}
              >
                <svg
                  className="h-4 w-4"
                  fill={feedback === 'up' ? 'currentColor' : 'none'}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21H5a2 2 0 01-2-2v-7a2 2 0 012-2h2.924l3.5-7A1 1 0 0113 3h1v7z"
                  />
                </svg>
                Relevant
              </button>

              {/* Thumbs down */}
              <button
                onClick={() => handleFeedback('down')}
                aria-label="Mark as not relevant"
                aria-pressed={feedback === 'down'}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 ${
                  feedback === 'down'
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-600 hover:bg-red-50 hover:text-red-600'
                }`}
              >
                <svg
                  className="h-4 w-4"
                  fill={feedback === 'down' ? 'currentColor' : 'none'}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3H19a2 2 0 012 2v7a2 2 0 01-2 2h-2.924l-3.5 7A1 1 0 0111 21h-1v-7z"
                  />
                </svg>
                Not relevant
              </button>
            </div>
          </article>
        )}
      </div>
    </Layout>
  )
}
