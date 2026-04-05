"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

type EvidenceType =
  | "MANUFACTURER_INFO"
  | "INGREDIENT_COMPARISON"
  | "PHOTO"
  | "VIDEO_LINK"
  | "OTHER";

const EVIDENCE_TYPE_OPTIONS: { value: EvidenceType; label: string }[] = [
  { value: "MANUFACTURER_INFO", label: "Manufacturer Info" },
  { value: "INGREDIENT_COMPARISON", label: "Ingredient Comparison" },
  { value: "PHOTO", label: "Photo" },
  { value: "VIDEO_LINK", label: "Video Link" },
  { value: "OTHER", label: "Other" },
];

interface EvidenceFormProps {
  comparisonId: string;
  onEvidenceAdded?: () => void;
}

export function EvidenceForm({ comparisonId, onEvidenceAdded }: EvidenceFormProps) {
  const { data: session, status } = useSession();

  const [type, setType] = useState<EvidenceType>("MANUFACTURER_INFO");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (status === "loading" || status === "unauthenticated" || !session) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-white font-semibold text-base mb-3">Add Evidence</h2>
        <p className="text-gray-400 text-sm">
          <a href="/api/auth/signin" className="text-emerald-400 hover:underline">
            Sign in to contribute evidence
          </a>{" "}
          on this comparison.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comparisonId, type, title, content, url }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMessage(data.error ?? "Failed to submit evidence. Please try again.");
        return;
      }

      // Success — clear form and show message
      setType("MANUFACTURER_INFO");
      setTitle("");
      setContent("");
      setUrl("");
      setSuccessMessage("Evidence submitted!");
      onEvidenceAdded?.();
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h2 className="text-white font-semibold text-base mb-4">Add Evidence</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type */}
        <div>
          <label htmlFor="evidence-type" className="block text-gray-300 text-sm font-medium mb-1">
            Type
          </label>
          <select
            id="evidence-type"
            value={type}
            onChange={(e) => setType(e.target.value as EvidenceType)}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          >
            {EVIDENCE_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="evidence-title" className="block text-gray-300 text-sm font-medium mb-1">
            Title
          </label>
          <input
            id="evidence-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            placeholder="Brief description of evidence"
          />
        </div>

        {/* Content */}
        <div>
          <label htmlFor="evidence-content" className="block text-gray-300 text-sm font-medium mb-1">
            Content
          </label>
          <textarea
            id="evidence-content"
            required
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 resize-vertical"
            placeholder="Describe your evidence in detail..."
          />
        </div>

        {/* URL */}
        <div>
          <label htmlFor="evidence-url" className="block text-gray-300 text-sm font-medium mb-1">
            URL <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <input
            id="evidence-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            placeholder="Link to source, video, etc."
          />
        </div>

        {/* Messages */}
        {successMessage && (
          <p className="text-emerald-400 text-sm font-medium">{successMessage}</p>
        )}
        {errorMessage && (
          <p className="text-red-400 text-sm" role="alert">
            {errorMessage}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition-colors"
        >
          {isSubmitting ? "Submitting..." : "Submit Evidence"}
        </button>
      </form>
    </div>
  );
}
