import type { Paper } from "../types/index"

function reconstructAbstract(idx: Record<string, number[]> | null | undefined): string {
  if (!idx) return ""
  const words: string[] = []
  for (const [word, positions] of Object.entries(idx)) {
    for (const pos of positions) {
      words[pos] = word
    }
  }
  return words.filter(Boolean).join(" ")
}

function mapWork(work: any): Paper {
  const doi = work.doi
    ? work.doi.replace(/^https?:\/\/doi\.org\//, "")
    : undefined

  const authors: string[] = (work.authorships ?? []).map(
    (a: any) => a?.author?.display_name ?? ""
  ).filter(Boolean)

  const url: string =
    work.primary_location?.landing_page_url ?? work.id ?? ""

  const pdfUrl: string | undefined =
    work.primary_location?.pdf_url ?? undefined

  const tags: string[] | undefined =
    work.concepts
      ? work.concepts.slice(0, 5).map((c: any) => c?.display_name).filter(Boolean)
      : undefined

  return {
    id: "oa:" + work.id,
    title: work.title ?? "",
    authors,
    abstract: reconstructAbstract(work.abstract_inverted_index),
    publishedDate: work.publication_date ?? "",
    source: "openalex",
    url,
    pdfUrl,
    doi,
    citationCount: work.cited_by_count ?? undefined,
    tags,
  }
}

export async function searchOpenAlex(query: string, perPage = 20): Promise<Paper[]> {
  try {
    const encoded = encodeURIComponent(query)
    const url =
      `https://api.openalex.org/works?search=${encoded}&per-page=${perPage}&sort=publication_date:desc&mailto=idealtop18@gmail.com`
    const response = await fetch(url)
    if (!response.ok) return []
    const data = await response.json()
    const results: any[] = data?.results ?? []
    return results.map(mapWork)
  } catch {
    return []
  }
}

export async function fetchOpenAlexPaper(workId: string): Promise<Paper | null> {
  try {
    const url = `https://api.openalex.org/works/${workId}?mailto=idealtop18@gmail.com`
    const response = await fetch(url)
    if (!response.ok) return null
    const work = await response.json()
    return mapWork(work)
  } catch {
    return null
  }
}
