import type { Paper, ReadHistoryEntry, FeedbackEntry, EnabledSources } from "../types/index";

const KEYS = {
  interestTags: "rpf:interestTags",
  bookmarks: "rpf:bookmarks",
  readHistory: "rpf:readHistory",
  feedback: "rpf:feedback",
  feedbackWeights: "rpf:feedbackWeights",
  enabledSources: "rpf:enabledSources",
} as const;

const MAX_READ_HISTORY = 200;

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function set<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silently ignore storage errors (e.g. quota exceeded)
  }
}

// Interest Tags

export function getInterestTags(): string[] {
  return get<string[]>(KEYS.interestTags, []);
}

export function setInterestTags(tags: string[]): void {
  set(KEYS.interestTags, tags);
}

// Bookmarks

export function getBookmarks(): Paper[] {
  return get<Paper[]>(KEYS.bookmarks, []);
}

export function addBookmark(paper: Paper): void {
  const bookmarks = getBookmarks();
  if (bookmarks.some((b) => b.id === paper.id)) return;
  set(KEYS.bookmarks, [...bookmarks, paper]);
}

export function removeBookmark(paperId: string): void {
  const bookmarks = getBookmarks().filter((b) => b.id !== paperId);
  set(KEYS.bookmarks, bookmarks);
}

export function isBookmarked(paperId: string): boolean {
  return getBookmarks().some((b) => b.id === paperId);
}

// Read History

export function getReadHistory(): ReadHistoryEntry[] {
  return get<ReadHistoryEntry[]>(KEYS.readHistory, []);
}

export function addToReadHistory(paper: Paper): void {
  const history = getReadHistory().filter((e) => e.paper.id !== paper.id);
  const entry: ReadHistoryEntry = { paper, readAt: new Date().toISOString() };
  const updated = [entry, ...history].slice(0, MAX_READ_HISTORY);
  set(KEYS.readHistory, updated);
}

// Feedback

export function getFeedback(): FeedbackEntry[] {
  return get<FeedbackEntry[]>(KEYS.feedback, []);
}

export function addFeedback(paperId: string, vote: "up" | "down"): void {
  const feedback = getFeedback().filter((f) => f.paperId !== paperId);
  const entry: FeedbackEntry = { paperId, vote, timestamp: new Date().toISOString() };
  set(KEYS.feedback, [...feedback, entry]);
}

// Feedback Weights

export function getFeedbackWeights(): Record<string, number> {
  return get<Record<string, number>>(KEYS.feedbackWeights, {});
}

export function updateFeedbackWeight(paperId: string, delta: number): void {
  const weights = getFeedbackWeights();
  weights[paperId] = (weights[paperId] ?? 0) + delta;
  set(KEYS.feedbackWeights, weights);
}

// Enabled Sources

export function getEnabledSources(): EnabledSources {
  const defaults: EnabledSources = { arxiv: true, semanticscholar: true, openalex: true };
  return get<EnabledSources>(KEYS.enabledSources, defaults);
}

export function setEnabledSources(sources: EnabledSources): void {
  set(KEYS.enabledSources, sources);
}

// Clear All Data

export function clearAllData(): void {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}

// Onboarding

export function hasCompletedOnboarding(): boolean {
  return getInterestTags().length > 0;
}
