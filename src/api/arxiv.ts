import type { Paper } from "../types/index"

function parseEntries(xmlText: string): Paper[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlText, "application/xml")
  const entries = Array.from(doc.querySelectorAll("entry"))

  return entries.map((entry) => {
    // Extract numeric ID from URL like https://arxiv.org/abs/2312.12345v2
    const rawId = entry.querySelector("id")?.textContent?.trim() ?? ""
    const idMatch = rawId.match(/abs\/([^v]+)/)
    const numericId = idMatch ? idMatch[1] : rawId

    const title = entry.querySelector("title")?.textContent?.trim() ?? ""

    const authors = Array.from(entry.querySelectorAll("author name")).map(
      (n) => n.textContent?.trim() ?? ""
    )

    const abstract = entry.querySelector("summary")?.textContent?.trim() ?? ""

    const updated = entry.querySelector("updated")?.textContent?.trim()
    const published = entry.querySelector("published")?.textContent?.trim()
    const publishedDate = updated ?? published ?? ""

    const linkEl = entry.querySelector('link[rel="alternate"]')
    const url = linkEl?.getAttribute("href") ?? `https://arxiv.org/abs/${numericId}`

    const pdfUrl = `https://arxiv.org/pdf/${numericId}`

    const tags = Array.from(entry.querySelectorAll("category")).map(
      (c) => c.getAttribute("term") ?? ""
    ).filter(Boolean)

    const paper: Paper = {
      id: `arxiv:${numericId}`,
      title,
      authors,
      abstract,
      publishedDate,
      source: "arxiv",
      url,
      pdfUrl,
      tags,
    }

    return paper
  })
}

export async function searchArxiv(query: string, maxResults = 20): Promise<Paper[]> {
  try {
    const encoded = encodeURIComponent(query)
    const url =
      `https://export.arxiv.org/api/query?search_query=all:${encoded}&max_results=${maxResults}&sortBy=lastUpdatedDate&sortOrder=descending`
    const response = await fetch(url)
    if (!response.ok) return []
    const text = await response.text()
    return parseEntries(text)
  } catch {
    return []
  }
}

export async function fetchArxivPaper(arxivId: string): Promise<Paper | null> {
  try {
    const url = `https://export.arxiv.org/api/query?id_list=${encodeURIComponent(arxivId)}`
    const response = await fetch(url)
    if (!response.ok) return null
    const text = await response.text()
    const papers = parseEntries(text)
    return papers[0] ?? null
  } catch {
    return null
  }
}
