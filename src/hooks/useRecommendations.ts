import { useState, useCallback, useEffect } from "react"
import type { Paper } from "../types/index"
import { searchArxiv } from "../api/arxiv"
import { searchOpenAlex } from "../api/openAlex"
import {
  getInterestTags,
  getEnabledSources,
  getReadHistory,
  getFeedbackWeights,
} from "../lib/localStorage"
import { deduplicatePapers, rankPapers } from "../lib/recommendation"

const RESULTS_PER_TAG = 15

interface RecommendationsState {
  papers: Paper[]
  loading: boolean
  error: string | null
}

interface UseRecommendationsResult extends RecommendationsState {
  refresh: () => void
}

export function useRecommendations(): UseRecommendationsResult {
  const [state, setState] = useState<RecommendationsState>({
    papers: [],
    loading: false,
    error: null,
  })

  const refresh = useCallback(async () => {
    const tags = getInterestTags()

    if (tags.length === 0) {
      setState({ papers: [], loading: false, error: null })
      return
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const sources = getEnabledSources()
      // Use up to 3 tags for fetching
      const activeTags = tags.slice(0, 3)

      // Build one promise per (tag, source) combination
      const fetchPromises: Promise<Paper[]>[] = []

      for (const tag of activeTags) {
        if (sources.arxiv) {
          fetchPromises.push(searchArxiv(tag, RESULTS_PER_TAG))
        }
        if (sources.openalex) {
          fetchPromises.push(searchOpenAlex(tag, RESULTS_PER_TAG))
        }
        // semanticscholar: no API module present — skipped
      }

      const results = await Promise.allSettled(fetchPromises)

      const allPapers: Paper[] = results
        .filter(
          (r): r is PromiseFulfilledResult<Paper[]> => r.status === "fulfilled",
        )
        .flatMap((r) => r.value)

      const deduplicated = deduplicatePapers(allPapers)

      const readHistory = getReadHistory()
      const feedbackWeights = getFeedbackWeights()
      const ranked = rankPapers(deduplicated, tags, readHistory, feedbackWeights)

      setState({ papers: ranked, loading: false, error: null })
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch recommendations",
      }))
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { ...state, refresh }
}
