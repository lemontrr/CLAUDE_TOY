import React from 'react'
import { Paper } from '../types'

interface SourceBadgeProps {
  source: Paper['source']
}

const sourceStyles: Record<Paper['source'], string> = {
  arxiv: 'bg-amber-500',
  semanticscholar: 'bg-blue-500',
  openalex: 'bg-emerald-500',
}

const sourceLabels: Record<Paper['source'], string> = {
  arxiv: 'arXiv',
  semanticscholar: 'Semantic Scholar',
  openalex: 'OpenAlex',
}

export default function SourceBadge({ source }: SourceBadgeProps) {
  return (
    <span
      className={`${sourceStyles[source]} text-white rounded-full text-xs px-2 py-0.5 font-medium`}
    >
      {sourceLabels[source]}
    </span>
  )
}
