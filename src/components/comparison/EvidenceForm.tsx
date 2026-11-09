"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { LIMITS } from "@/lib/validation";
import { inputClass, labelClass } from "@/components/ui/form";
import { MessageSquarePlus } from "lucide-react";

type EvidenceType =
  | "MANUFACTURER_INFO"
  | "INGREDIENT_COMPARISON"
  | "PHOTO"
  | "VIDEO_LINK"
  | "OTHER";

const EVIDENCE_TYPE_OPTIONS: { value: EvidenceType; label: string }[] = [
  { value: "OTHER", label: "Personal experience" },
  { value: "INGREDIENT_COMPARISON", label: "Ingredient Comparison" },
  { value: "MANUFACTURER_INFO", label: "Manufacturer Info" },
  { value: "VIDEO_LINK", label: "Video Link" },
  { value: "PHOTO", label: "Photo (link)" },
];

interface EvidenceFormProps {
  comparisonId: string;
  /** Used to send signed-out visitors back here after they sign in. */
  slug?: string;
  onEvidenceAdded?: () => void;
}

const inputClasses = inputClass;

export function EvidenceForm({ comparisonId, slug, onEvidenceAdded }: EvidenceFormProps) {
  const { data: session, status } = useSession();

  const [type, setType] = useState<EvidenceType>("OTHER");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (status === "loading" || status === "unauthenticated" || !session) {
    const signInHref = slug
      ? `/auth/signin?callbackUrl=${encodeURIComponent(`/compare/${slug}`)}`
      : "/auth/signin";
    return (
      <section className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:p-8">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand">
          <MessageSquarePlus aria-hidden="true" className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-ink">Add Evidence</h2>
          <p className="mt-0.5 text-sm text-muted">
            <Link href={signInHref} className="font-semibold text-brand-500 hover:underline">
              Sign in to contribute evidence
            </Link>{" "}
            on this comparison.
          </p>
        </div>
      </section>
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

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMessage(data.error ?? "Failed to submit evidence. Please try again.");
        return;
      }

      setType("OTHER");
      setTitle("");
      setContent("");
      setUrl("");
      setSuccessMessage(data.message ?? "Thanks! Your evidence will appear once a moderator reviews it.");
      onEvidenceAdded?.();
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="card p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-ink">Add Evidence</h2>
      <p className="mb-6 mt-1 text-sm leading-relaxed text-muted">
        Share what you know: ingredient labels, who makes it, or how it held up for you. Stick to facts and your own
        experience — submissions are reviewed before they appear.
      </p>

      <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="evidence-type" className={labelClass}>
            Type
          </label>
          <select id="evidence-type" value={type} onChange={(e) => setType(e.target.value as EvidenceType)} className={inputClasses}>
            {EVIDENCE_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="evidence-title" className={labelClass}>Title</label>
          <input
            id="evidence-title"
            type="text"
            required
            maxLength={LIMITS.evidenceTitle}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClasses}
            placeholder="e.g. Same medicinal ingredient and strength"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="evidence-content" className={labelClass}>Content</label>
          <textarea
            id="evidence-content"
            required
            rows={4}
            maxLength={LIMITS.evidenceContent}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`${inputClasses} resize-y`}
            placeholder="Describe your evidence in detail..."
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="evidence-url" className={labelClass}>
            URL <span className="font-normal text-subtle">{type === "VIDEO_LINK" ? "(required)" : "(optional)"}</span>
          </label>
          <input
            id="evidence-url"
            type="url"
            maxLength={LIMITS.url}
            required={type === "VIDEO_LINK"}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={inputClasses}
            placeholder="https://… link to a source, label photo or video"
          />
        </div>

        {successMessage && <p className="sm:col-span-2 rounded-xl bg-good-bg px-3 py-2 text-sm font-medium text-good" role="status">{successMessage}</p>}
        {errorMessage && <p className="sm:col-span-2 rounded-xl bg-bad-bg px-3 py-2 text-sm font-medium text-bad" role="alert">{errorMessage}</p>}

        <div className="sm:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isSubmitting ? "Submitting..." : "Submit Evidence"}
          </button>
        </div>
      </form>
    </section>
  );
}
