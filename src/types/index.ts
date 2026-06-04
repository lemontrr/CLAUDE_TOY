export interface Paper {
  id: string
  title: string
  authors: string[]
  abstract: string
  publishedDate: string
  source: 'arxiv' | 'semanticscholar' | 'openalex'
  url: string
  pdfUrl?: string
  doi?: string
  tags?: string[]
  citationCount?: number
}
export interface ReadHistoryEntry {
  paper: Paper
  readAt: string
}
export interface FeedbackEntry {
  paperId: string
  vote: 'up' | 'down'
  timestamp: string
}
export interface EnabledSources {
  arxiv: boolean
  semanticscholar: boolean
  openalex: boolean
}
