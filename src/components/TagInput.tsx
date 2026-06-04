import React, { useState, KeyboardEvent } from "react"

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
  suggestions?: string[]
}

export function TagInput({
  tags,
  onChange,
  placeholder = "Add a tag…",
  maxTags,
  suggestions = [],
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("")

  function addTag(raw: string) {
    const trimmed = raw.trim()
    if (!trimmed) return
    if (tags.includes(trimmed)) return
    if (maxTags !== undefined && tags.length >= maxTags) return
    onChange([...tags, trimmed])
  }

  function removeTag(index: number) {
    onChange(tags.filter((_, i) => i !== index))
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      // Split on comma to allow pasting comma-separated values
      const parts = inputValue.split(",")
      parts.forEach((part) => addTag(part))
      setInputValue("")
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value)
  }

  const visibleSuggestions = suggestions.filter((s) => !tags.includes(s))
  const atMax = maxTags !== undefined && tags.length >= maxTags

  return (
    <div className="flex flex-col gap-2">
      {/* Tag chips + input row */}
      <div className="flex flex-wrap gap-1.5 rounded-lg border border-gray-300 bg-white px-2 py-1.5 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
        {tags.map((tag, i) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-sm font-medium text-indigo-800"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              className="ml-0.5 rounded-full text-indigo-500 hover:bg-indigo-200 hover:text-indigo-700 focus:outline-none"
              aria-label={`Remove tag ${tag}`}
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </span>
        ))}

        {!atMax && (
          <input
            type="text"
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : ""}
            className="min-w-[120px] flex-1 border-none bg-transparent py-0.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
          />
        )}
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-400">
        Press Enter or comma to add a tag
        {maxTags !== undefined && (
          <span className="ml-1">({tags.length}/{maxTags})</span>
        )}
      </p>

      {/* Suggestion chips */}
      {visibleSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {visibleSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              disabled={atMax}
              className="inline-flex items-center rounded-full border border-indigo-300 bg-white px-2.5 py-0.5 text-sm text-indigo-700 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
