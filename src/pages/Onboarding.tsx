import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { TagInput } from "../components/TagInput"
import { setInterestTags } from "../lib/localStorage"

const POPULAR_TOPICS = [
  "machine learning",
  "NLP",
  "biology",
  "physics",
  "climate change",
  "economics",
  "medicine",
  "math",
  "neuroscience",
  "robotics",
]

export default function Onboarding() {
  const [tags, setTags] = useState<string[]>([])
  const navigate = useNavigate()

  function toggleTopic(topic: string) {
    if (tags.includes(topic)) {
      setTags(tags.filter((t) => t !== topic))
    } else {
      setTags([...tags, topic])
    }
  }

  function handleSubmit() {
    if (tags.length === 0) return
    setInterestTags(tags)
    navigate("/home")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8 md:p-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-indigo-700 tracking-tight mb-2">
            Discover Research Papers
          </h1>
          <p className="text-gray-500 text-base">
            Tell us what topics you care about and we'll surface the most
            relevant papers for you — personalized every time you visit.
          </p>
        </div>

        {/* Tag input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your interests
          </label>
          <TagInput
            tags={tags}
            onChange={setTags}
            placeholder="e.g. deep learning, genomics…"
          />
        </div>

        {/* Popular topics */}
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-600 mb-3">
            Popular topics — click to add
          </p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_TOPICS.map((topic) => {
              const selected = tags.includes(topic)
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => toggleTopic(topic)}
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                    selected
                      ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 hover:border-indigo-700"
                      : "bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-50"
                  }`}
                >
                  {selected ? (
                    <svg
                      className="mr-1 h-3.5 w-3.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span className="mr-1 text-indigo-400">+</span>
                  )}
                  {topic}
                </button>
              )
            })}
          </div>
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={tags.length === 0}
          className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Get Started
        </button>

        {tags.length === 0 && (
          <p className="mt-3 text-center text-xs text-gray-400">
            Add at least one interest to continue
          </p>
        )}
      </div>
    </div>
  )
}
