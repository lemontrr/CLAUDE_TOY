import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { TagInput } from '../components/TagInput'
import {
  getInterestTags,
  setInterestTags,
  getEnabledSources,
  setEnabledSources,
  getBookmarks,
  getReadHistory,
  clearAllData,
} from '../lib/localStorage'
import type { EnabledSources } from '../types/index'

export default function Settings() {
  const navigate = useNavigate()

  // ── Section 1: Interest Tags ──────────────────────────────────────────────
  const [tags, setTags] = useState<string[]>(() => getInterestTags())
  const [showSaved, setShowSaved] = useState(false)

  function handleSaveTags() {
    setInterestTags(tags)
    setShowSaved(true)
  }

  useEffect(() => {
    if (!showSaved) return
    const id = setTimeout(() => setShowSaved(false), 2000)
    return () => clearTimeout(id)
  }, [showSaved])

  // ── Section 2: Data Sources ───────────────────────────────────────────────
  const [sources, setSources] = useState<EnabledSources>(() => getEnabledSources())

  function handleSourceChange(key: keyof EnabledSources, checked: boolean) {
    const next = { ...sources, [key]: checked }
    // At least one source must remain enabled
    const anyEnabled = Object.values(next).some(Boolean)
    if (!anyEnabled) return
    setSources(next)
    setEnabledSources(next)
  }

  // ── Section 3: Statistics ─────────────────────────────────────────────────
  const [bookmarkCount] = useState(() => getBookmarks().length)
  const [historyCount] = useState(() => getReadHistory().length)

  // ── Section 4: Danger Zone ────────────────────────────────────────────────
  const [confirmClear, setConfirmClear] = useState(false)

  function handleClearRequest() {
    setConfirmClear(true)
  }

  function handleClearConfirm() {
    clearAllData()
    navigate('/')
  }

  function handleClearCancel() {
    setConfirmClear(false)
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

        {/* ── Section 1: Interest Tags ── */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Interest Tags</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Papers are recommended based on these topics.
            </p>
          </div>

          <TagInput tags={tags} onChange={setTags} />

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveTags}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Save
            </button>
            {showSaved && (
              <span className="text-sm font-medium text-green-600 select-none">
                Saved!
              </span>
            )}
          </div>
        </section>

        {/* ── Section 2: Data Sources ── */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Data Sources</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              At least one source must remain enabled.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {(
              [
                { key: 'arxiv', label: 'arXiv' },
                { key: 'semanticscholar', label: 'Semantic Scholar' },
                { key: 'openalex', label: 'OpenAlex' },
              ] as { key: keyof EnabledSources; label: string }[]
            ).map(({ key, label }) => {
              const checked = sources[key]
              const enabledCount = Object.values(sources).filter(Boolean).length
              const disabledToggle = checked && enabledCount === 1

              return (
                <label
                  key={key}
                  className={`flex items-center gap-3 cursor-pointer select-none ${
                    disabledToggle ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabledToggle}
                    onChange={(e) => handleSourceChange(key, e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed"
                  />
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </label>
              )
            })}
          </div>
        </section>

        {/* ── Section 3: Statistics ── */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-gray-800">Statistics</h2>

          <dl className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Bookmarks
              </dt>
              <dd className="mt-1 text-2xl font-bold text-indigo-700">{bookmarkCount}</dd>
            </div>
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Papers Read
              </dt>
              <dd className="mt-1 text-2xl font-bold text-indigo-700">{historyCount}</dd>
            </div>
          </dl>
        </section>

        {/* ── Section 4: Danger Zone ── */}
        <section className="rounded-xl border-2 border-red-400 p-6 flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold text-red-700">Danger Zone</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Permanently removes all bookmarks, read history, tags, and preferences.
            </p>
          </div>

          {!confirmClear ? (
            <button
              type="button"
              onClick={handleClearRequest}
              className="self-start px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 active:bg-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Clear All Data
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-red-700">
                Are you sure? This cannot be undone.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClearConfirm}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 active:bg-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Yes, clear everything
                </button>
                <button
                  type="button"
                  onClick={handleClearCancel}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </Layout>
  )
}
