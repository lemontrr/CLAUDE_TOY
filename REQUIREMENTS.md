# Research Paper Finder — Requirements

## 1. Project Overview

A web application for **discovering and recommending academic papers** based on user interests and reading history.  
Uses only **free, open APIs** with **no login required** — all personalization is powered by localStorage.

---

## 2. Target Users

- Researchers and graduate students who want to quickly survey recent papers on a topic
- Users who want to start immediately without creating an account

---

## 3. Data Sources (all free, no API key required)

Google Scholar is excluded — no official API exists and third-party wrappers are paid.  
Instead, three free open APIs are combined for equal or greater coverage.

| Source | Papers | API Key | Cost | Strength |
|--------|--------|---------|------|----------|
| **arXiv** | ~2.3M | None | $0 | Latest preprints, direct PDF access |
| **Semantic Scholar** | 200M+ | None | $0 | AI/ML/CS coverage, citation graph |
| **OpenAlex** | 250M+ | None | $0 | All-field metadata, 100K req/day |

Duplicate papers are deduplicated by DOI or title similarity before display.

---

## 4. Functional Requirements

### 4.1 Interest Setup (no login)
- Onboarding screen on first visit to select interest tags
- Tags can be added, removed, and edited at any time
- All settings stored in **localStorage** — no server account needed

### 4.2 Recommendation Feed
- Recommendations generated from interest tags + reading history
- Ranking priority:
  1. Interest tag match score
  2. TF-IDF cosine similarity to recently viewed papers (client-side)
  3. Recency (newer papers ranked higher)
- "Today's Picks" section: top N papers, refreshed daily

### 4.3 Paper Detail View
- Title, authors, publication date, abstract, source badge
- **PDF download button**
  - arXiv: direct PDF URL (`arxiv.org/pdf/{id}`)
  - Semantic Scholar / OpenAlex: open access PDF URL or source link
- Similar Papers side panel

### 4.4 Bookmarks & Reading History
- Save (bookmark) papers and mark as read — stored in **localStorage**
- Saved list page with tag filter and date sort

### 4.5 Feedback Loop
- Thumbs up / thumbs down on each paper card
- Feedback updates a localStorage weight vector applied to future recommendations

---

## 5. Recommendation Engine (client-side, pure JS)

All computation runs in the browser — no server ML, no external libraries.

```
[API response papers]
        │
        ▼
[Client Recommendation Engine (JavaScript)]
   ├─ TF-IDF similarity (title + abstract)
   ├─ Interest tag match score
   ├─ Reading history weights (localStorage)
   └─ Feedback weights (localStorage)
        │
        ▼
[Ranked recommendation list]
```

---

## 6. System Architecture

No backend proxy needed — all three APIs allow direct browser calls (CORS enabled).

```
[Browser]
  ├─ Recommendation Engine (TF-IDF, pure JS)
  ├─ State (localStorage)
  └─ UI (React + TailwindCSS)
        │ direct calls (CORS allowed)
        ├─ api.semanticscholar.org
        ├─ api.openalex.org
        └─ export.arxiv.org
```

No backend server → hosting cost is $0 (Vercel free tier).

---

## 7. Non-Functional Requirements

| Item | Target |
|------|--------|
| **Cost** | $0 — all APIs free, serverless frontend |
| **Performance** | Initial recommendation load ≤ 2 seconds |
| **Responsiveness** | Mobile and desktop responsive layout |
| **Availability** | Graceful degradation to localStorage cache on API failure |
| **Privacy** | No user data sent to any server |
| **Accessibility** | WCAG 2.1 AA (keyboard navigation, screen reader support) |

---

## 8. Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + TypeScript, TailwindCSS |
| Recommendation | Pure JS (TF-IDF, cosine similarity) |
| State | localStorage |
| Backend | **None** — APIs called directly from the browser |
| Deployment | Vercel free tier |

---

## 9. Screens

1. **Onboarding** — initial interest tag setup
2. **Home / Feed** — recommended paper cards (infinite scroll)
3. **Paper Detail** — abstract, PDF download, related papers
4. **Bookmarks** — saved paper management
5. **Settings** — edit interest tags, toggle data sources, clear localStorage

---

## 10. Milestones

| Phase | Scope | Target |
|-------|-------|--------|
| M1 | arXiv API + basic UI + PDF download | 2 weeks |
| M2 | Semantic Scholar + OpenAlex + deduplication | 1 week |
| M3 | Client-side recommendation engine v1 + bookmarks | 2 weeks |
| M4 | Feedback loop + recommendation weight tuning | 1 week |
| M5 | Performance, responsive UI, Vercel deploy | 1 week |

---

## 11. Key Decisions

| Item | Decision |
|------|----------|
| Total cost | **$0** |
| Data sources | arXiv + Semantic Scholar + OpenAlex |
| Google Scholar | Excluded — no official API |
| User accounts | None — localStorage only |
| Backend server | None — frontend-only |
| Recommendation engine | Client-side TF-IDF (pure JS) |
| Paper access | PDF download supported |
| Deployment | Vercel free tier |
