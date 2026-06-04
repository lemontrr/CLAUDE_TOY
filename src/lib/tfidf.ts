// Pure TypeScript TF-IDF engine — no external imports

export const STOPWORDS: Set<string> = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "as", "is", "was", "are", "were", "be",
  "been", "being", "have", "has", "had", "do", "does", "did", "will",
  "would", "could", "should", "may", "might", "shall", "can", "need",
  "dare", "ought", "used", "it", "its", "this", "that", "these", "those",
  "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you",
  "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself",
  "she", "her", "hers", "herself", "they", "them", "their", "theirs",
  "themselves", "what", "which", "who", "whom", "when", "where", "why",
  "how", "all", "each", "every", "both", "few", "more", "most", "other",
  "some", "such", "no", "not", "only", "same", "so", "than", "too",
  "very", "just", "about", "above", "after", "again", "against", "also",
  "because", "before", "between", "during", "here", "if", "into",
  "through", "under", "until", "up", "while", "then", "there", "any",
  "over", "own", "s", "t", "don", "ain", "aren", "couldn", "didn",
  "doesn", "hadn", "hasn", "haven", "isn", "ma", "mightn", "mustn",
  "needn", "shan", "shouldn", "wasn", "weren", "won", "wouldn",
])

/**
 * Tokenize text into lowercase alphabetic tokens, filtering out stopwords
 * and tokens shorter than 2 characters.
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((token) => token.length >= 2 && !STOPWORDS.has(token))
}

/**
 * Compute term frequency for a list of tokens.
 * Returns a map of term -> relative frequency (count / total tokens).
 */
export function computeTF(tokens: string[]): Record<string, number> {
  if (tokens.length === 0) return {}
  const counts: Record<string, number> = {}
  for (const token of tokens) {
    counts[token] = (counts[token] ?? 0) + 1
  }
  const total = tokens.length
  const tf: Record<string, number> = {}
  for (const term in counts) {
    tf[term] = counts[term] / total
  }
  return tf
}

/**
 * Compute smoothed inverse document frequency across a corpus of tokenized documents.
 * Uses: IDF(t) = log((1 + N) / (1 + df(t))) + 1
 */
export function computeIDF(docs: string[][]): Record<string, number> {
  const N = docs.length
  const df: Record<string, number> = {}
  for (const tokens of docs) {
    const seen = new Set<string>()
    for (const token of tokens) {
      if (!seen.has(token)) {
        df[token] = (df[token] ?? 0) + 1
        seen.add(token)
      }
    }
  }
  const idf: Record<string, number> = {}
  for (const term in df) {
    idf[term] = Math.log((1 + N) / (1 + df[term])) + 1
  }
  return idf
}

/**
 * Multiply TF and IDF maps to produce a TF-IDF vector.
 */
export function computeTFIDF(
  tf: Record<string, number>,
  idf: Record<string, number>,
): Record<string, number> {
  const tfidf: Record<string, number> = {}
  for (const term in tf) {
    if (idf[term] !== undefined) {
      tfidf[term] = tf[term] * idf[term]
    } else {
      // term not in IDF (unseen in corpus): assign a small default weight
      tfidf[term] = tf[term]
    }
  }
  return tfidf
}

/**
 * Compute cosine similarity between two TF-IDF (or any numeric) vectors.
 * Returns a value in [0, 1]. Returns 0 if either vector is zero-magnitude.
 */
export function cosineSimilarity(
  a: Record<string, number>,
  b: Record<string, number>,
): number {
  let dot = 0
  let magA = 0
  let magB = 0

  for (const term in a) {
    magA += a[term] * a[term]
    if (b[term] !== undefined) {
      dot += a[term] * b[term]
    }
  }
  for (const term in b) {
    magB += b[term] * b[term]
  }

  const denom = Math.sqrt(magA) * Math.sqrt(magB)
  if (denom === 0) return 0
  return dot / denom
}

/**
 * Convert a paper's title and abstract into a token list.
 * Title tokens are included twice to give them higher weight.
 */
export function paperToTokens(paper: { title: string; abstract: string }): string[] {
  const titleTokens = tokenize(paper.title)
  const abstractTokens = tokenize(paper.abstract)
  return [...titleTokens, ...titleTokens, ...abstractTokens]
}
