import type { Paper, ReadHistoryEntry } from "../types/index"
import {
  tokenize,
  computeTF,
  computeIDF,
  computeTFIDF,
  cosineSimilarity,
  paperToTokens,
} from "./tfidf"

/**
 * Remove duplicate papers from an array.
 * Deduplication order: first by DOI (case-insensitive), then by normalized title
 * (lowercase, collapse whitespace, strip punctuation).
 */
export function deduplicatePapers(papers: Paper[]): Paper[] {
  const seenDois = new Set<string>()
  const seenTitles = new Set<string>()
  const result: Paper[] = []

  for (const paper of papers) {
    // DOI dedup
    if (paper.doi) {
      const normalizedDoi = paper.doi.trim().toLowerCase()
      if (seenDois.has(normalizedDoi)) continue
      seenDois.add(normalizedDoi)
    }

    // Title dedup
    const normalizedTitle = paper.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim()
    if (seenTitles.has(normalizedTitle)) continue
    seenTitles.add(normalizedTitle)

    result.push(paper)
  }

  return result
}

/**
 * Rank candidate papers by a weighted score composed of:
 *   0.35 * tagMatch  +  0.30 * tfidfSim  +  0.20 * recency  +  0.15 * (0.5 + feedbackBoost)
 *
 * @param candidates    Papers to score and rank.
 * @param interestTags  User interest tag strings.
 * @param readHistory   User's read history (most recent entries used for TF-IDF similarity).
 * @param feedbackWeights  Map of paper.id -> numeric boost (positive = liked, negative = disliked).
 */
export function rankPapers(
  candidates: Paper[],
  interestTags: string[],
  readHistory: ReadHistoryEntry[],
  feedbackWeights: Record<string, number>,
): Paper[] {
  // --- Tag token set (from interest tags) ---
  const tagTokens = new Set<string>(interestTags.flatMap((tag) => tokenize(tag)))

  // --- TF-IDF preparation using last 10 history papers ---
  const historyPapers = readHistory
    .slice()
    .sort((a, b) => new Date(b.readAt).getTime() - new Date(a.readAt).getTime())
    .slice(0, 10)
    .map((entry) => entry.paper)

  const historyTokenDocs: string[][] = historyPapers.map(paperToTokens)
  const candidateTokenDocs: string[][] = candidates.map(paperToTokens)

  // Build IDF over the union of history + candidate documents
  const allDocs = [...historyTokenDocs, ...candidateTokenDocs]
  const idf = allDocs.length > 0 ? computeIDF(allDocs) : {}

  // Compute TF-IDF vectors for history papers
  const historyVectors = historyTokenDocs.map((tokens) =>
    computeTFIDF(computeTF(tokens), idf),
  )

  // --- Recency: normalize within a 2-year window ---
  const now = new Date(new Date().toISOString()).getTime()
  const TWO_YEARS_MS = 2 * 365.25 * 24 * 60 * 60 * 1000

  // --- Score each candidate ---
  const scored = candidates.map((paper) => {
    // 1. tagMatch: fraction of tag tokens found in paper title+abstract text
    let tagMatch = 0
    if (tagTokens.size > 0) {
      const paperText = `${paper.title} ${paper.abstract}`.toLowerCase()
      let matched = 0
      for (const tagToken of tagTokens) {
        if (paperText.includes(tagToken)) matched++
      }
      tagMatch = matched / tagTokens.size
    }

    // 2. tfidfSim: average cosine similarity to last-10 history paper vectors
    let tfidfSim = 0
    if (historyVectors.length > 0) {
      const candidateTokens = paperToTokens(paper)
      const candidateVector = computeTFIDF(computeTF(candidateTokens), idf)
      const simSum = historyVectors.reduce(
        (sum, hVec) => sum + cosineSimilarity(candidateVector, hVec),
        0,
      )
      tfidfSim = simSum / historyVectors.length
    }

    // 3. recency: normalize published date within 2-year window
    let recency = 0
    if (paper.publishedDate) {
      const publishedMs = new Date(paper.publishedDate).getTime()
      if (!isNaN(publishedMs)) {
        const age = now - publishedMs
        recency = Math.max(0, Math.min(1, 1 - age / TWO_YEARS_MS))
      }
    }

    // 4. feedbackBoost
    const feedbackBoost = feedbackWeights[paper.id] ?? 0

    const score =
      0.35 * tagMatch +
      0.30 * tfidfSim +
      0.20 * recency +
      0.15 * (0.5 + feedbackBoost)

    return { paper, score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored.map((s) => s.paper)
}

/**
 * Return the top-n papers from an already-ranked list.
 * Intended to be called after rankPapers().
 */
export function getTodaysPicks(papers: Paper[], n = 5): Paper[] {
  return papers.slice(0, n)
}
