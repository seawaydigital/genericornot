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

const inputClasses =
  "w-full bg-white border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#0d1b4a]/30 focus:ring-2 focus:ring-[#0d1b4a]/10 transition-all duration-200";

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
      <div className="glass rounded-2xl p-6">
        <h2 className="text-gray-900 font-semibold text-base mb-3">Add Evidence</h2>
        <p className="text-gray-500 text-sm">
          <a href="/auth/signin" className="text-[#0d1b4a] hover:underline font-medium">
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
    <div className="glass rounded-2xl p-6">
      <h2 className="text-gray-900 font-semibold text-base mb-4">Add Evidence</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="evidence-type" className="block text-gray-600 text-sm font-medium mb-1.5">
            Type
          </label>
          <select id="evidence-type" value={type} onChange={(e) => setType(e.target.value as EvidenceType)} className={inputClasses}>
            {EVIDENCE_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="evidence-title" className="block text-gray-600 text-sm font-medium mb-1.5">Title</label>
          <input id="evidence-title" type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClasses} placeholder="Brief description of evidence" />
        </div>

        <div>
          <label htmlFor="evidence-content" className="block text-gray-600 text-sm font-medium mb-1.5">Content</label>
          <textarea id="evidence-content" required rows={4} value={content} onChange={(e) => setContent(e.target.value)} className={`${inputClasses} resize-vertical`} placeholder="Describe your evidence in detail..." />
        </div>

        <div>
          <label htmlFor="evidence-url" className="block text-gray-600 text-sm font-medium mb-1.5">
            URL <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input id="evidence-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} className={inputClasses} placeholder="Link to source, video, etc." />
        </div>

        {successMessage && <p className="text-emerald-700 text-sm font-medium">{successMessage}</p>}
        {errorMessage && <p className="text-red-600 text-sm" role="alert">{errorMessage}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-b from-[#0d1b4a] to-[#162d6b] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-all duration-200 hover:shadow-md hover:brightness-110"
        >
          {isSubmitting ? "Submitting..." : "Submit Evidence"}
        </button>
      </form>
    </div>
  );
}
