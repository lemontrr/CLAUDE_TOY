import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Paper } from '../types'
import SourceBadge from './SourceBadge'

interface PaperCardProps {
  paper: Paper
  onBookmark?: (paper: Paper) => void
  onFeedback?: (id: string, vote: 'up' | 'down') => void
  isBookmarked?: boolean
}

const ABSTRACT_LIMIT = 180

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function PaperCard({
  paper,
  onBookmark,
  onFeedback,
  isBookmarked = false,
}: PaperCardProps) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)

  const { id, title, authors, abstract, publishedDate, citationCount, pdfUrl } = paper

  const displayedAuthors =
    authors.length > 3
      ? `${authors.slice(0, 3).join(', ')} +${authors.length - 3} more`
      : authors.join(', ')

  const needsTruncation = abstract.length > ABSTRACT_LIMIT
  const displayedAbstract =
    expanded || !needsTruncation ? abstract : `${abstract.slice(0, ABSTRACT_LIMIT)}...`

  return (
    <article className="bg-white rounded-xl shadow-md p-5 flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-center gap-2 flex-wrap">
        <SourceBadge source={paper.source} />
        <span className="text-gray-400 text-xs">{formatDate(publishedDate)}</span>
        {citationCount !== undefined && (
          <span className="text-gray-400 text-xs ml-auto">
            {citationCount.toLocaleString()} citations
          </span>
        )}
      </div>

      {/* Title */}
      <button
        onClick={() => navigate(`/paper?id=${encodeURIComponent(id)}`)}
        className="text-left text-base font-semibold text-gray-900 hover:text-indigo-700 transition-colors leading-snug focus:outline-none focus:underline"
      >
        {title}
      </button>

      {/* Authors */}
      {authors.length > 0 && (
        <p className="text-sm text-gray-500 leading-tight">{displayedAuthors}</p>
      )}

      {/* Abstract */}
      <div className="text-sm text-gray-600 leading-relaxed">
        <span>{displayedAbstract}</span>
        {needsTruncation && (
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="ml-1 text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
        {/* Bookmark */}
        {onBookmark && (
          <button
            onClick={() => onBookmark(paper)}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark paper'}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
              isBookmarked
                ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <svg
              className="h-4 w-4"
              fill={isBookmarked ? 'currentColor' : 'none'}
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
            {isBookmarked ? 'Saved' : 'Save'}
          </button>
        )}

        {/* Thumbs up */}
        {onFeedback && (
          <button
            onClick={() => onFeedback(id, 'up')}
            aria-label="Thumbs up"
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-gray-500 hover:bg-green-50 hover:text-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21H5a2 2 0 01-2-2v-7a2 2 0 012-2h2.924l3.5-7A1 1 0 0113 3h1v7z" />
            </svg>
            Relevant
          </button>
        )}

        {/* Thumbs down */}
        {onFeedback && (
          <button
            onClick={() => onFeedback(id, 'down')}
            aria-label="Thumbs down"
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3H19a2 2 0 012 2v7a2 2 0 01-2 2h-2.924l-3.5 7A1 1 0 0111 21h-1v-7z" />
            </svg>
            Not relevant
          </button>
        )}

        {/* PDF link */}
        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
            aria-label="Open PDF"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            PDF
          </a>
        )}
      </div>
    </article>
  )
}
