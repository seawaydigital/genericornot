"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";

interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
}

interface FormData {
  genericProductName: string;
  genericBrand: string;
  genericStore: string;
  genericPrice: string;
  nameBrandProductName: string;
  nameBrand: string;
  nameBrandPrice: string;
  categoryId: string;
  evidenceTitle: string;
  evidenceContent: string;
}

const INITIAL_FORM: FormData = {
  genericProductName: "",
  genericBrand: "",
  genericStore: "",
  genericPrice: "",
  nameBrandProductName: "",
  nameBrand: "",
  nameBrandPrice: "",
  categoryId: "",
  evidenceTitle: "",
  evidenceContent: "",
};

export default function SubmitPage() {
  const { data: session, status } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [duplicate, setDuplicate] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => {});
  }, []);

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-2xl px-4 md:px-6 py-16 text-center">
        <p className="text-gray-400">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-2xl px-4 md:px-6 py-16 text-center space-y-4">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-white">Sign in to submit a comparison</h1>
        <p className="text-gray-400">
          You need to be signed in to contribute comparisons to GenericOrNot.
        </p>
        <Button onClick={() => signIn("google")} size="lg">
          Sign in with Google
        </Button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 md:px-6 py-16 text-center space-y-4">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-white">Submitted for review</h1>
        <p className="text-gray-400">
          Your comparison has been submitted and will appear once an admin approves it.
          Thank you for contributing!
        </p>
        <Button
          variant="secondary"
          onClick={() => {
            setForm(INITIAL_FORM);
            setSubmitted(false);
            setDuplicate(false);
            setErrors({});
          }}
        >
          Submit another
        </Button>
      </div>
    );
  }

  function setField(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setDuplicate(false);

    const body: Record<string, string | number | null> = {
      genericProductName: form.genericProductName.trim(),
      genericBrand: form.genericBrand.trim(),
      genericStore: form.genericStore.trim(),
      genericPrice: form.genericPrice ? parseFloat(form.genericPrice) : null,
      nameBrandProductName: form.nameBrandProductName.trim(),
      nameBrand: form.nameBrand.trim(),
      nameBrandPrice: form.nameBrandPrice ? parseFloat(form.nameBrandPrice) : null,
      categoryId: form.categoryId,
    };

    try {
      const res = await fetch("/api/comparisons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.status === 409 || data.duplicate) {
        setDuplicate(true);
        setSubmitting(false);
        return;
      }

      if (!res.ok) {
        setErrors(data.errors ?? { _: data.error ?? "Something went wrong" });
        setSubmitting(false);
        return;
      }

      // If evidence was provided, submit it too
      if (form.evidenceTitle.trim() && form.evidenceContent.trim() && data.comparison?.id) {
        await fetch("/api/evidence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            comparisonId: data.comparison.id,
            type: "OTHER",
            title: form.evidenceTitle.trim(),
            content: form.evidenceContent.trim(),
          }),
        }).catch(() => {});
      }

      setSubmitted(true);
    } catch {
      setErrors({ _: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 md:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Submit a Comparison</h1>
        <p className="text-gray-400 text-sm">
          Help the community by adding a generic vs. name brand comparison.
          All submissions are reviewed before going live.
        </p>
      </div>

      {duplicate && (
        <div className="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-amber-400 text-sm">
          <strong>Possible duplicate:</strong> A similar comparison may already exist. Please search first.
        </div>
      )}

      {errors._ && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          {errors._}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Generic product */}
        <fieldset className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <legend className="text-white font-semibold px-1">Generic / Store Brand</legend>

          <div>
            <label htmlFor="genericProductName" className="block text-sm text-gray-300 mb-1">
              Product Name <span className="text-red-400">*</span>
            </label>
            <input
              id="genericProductName"
              type="text"
              value={form.genericProductName}
              onChange={(e) => setField("genericProductName", e.target.value)}
              placeholder="e.g. Ibuprofen 200mg"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              required
            />
            {errors.genericProductName && (
              <p className="text-red-400 text-xs mt-1">{errors.genericProductName}</p>
            )}
          </div>

          <div>
            <label htmlFor="genericBrand" className="block text-sm text-gray-300 mb-1">
              Brand <span className="text-red-400">*</span>
            </label>
            <input
              id="genericBrand"
              type="text"
              value={form.genericBrand}
              onChange={(e) => setField("genericBrand", e.target.value)}
              placeholder="e.g. Kirkland, Up&Up, Equate"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              required
            />
            {errors.genericBrand && (
              <p className="text-red-400 text-xs mt-1">{errors.genericBrand}</p>
            )}
          </div>

          <div>
            <label htmlFor="genericStore" className="block text-sm text-gray-300 mb-1">
              Store <span className="text-red-400">*</span>
            </label>
            <input
              id="genericStore"
              type="text"
              value={form.genericStore}
              onChange={(e) => setField("genericStore", e.target.value)}
              placeholder="e.g. Costco, Target, Walmart"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              required
            />
            {errors.genericStore && (
              <p className="text-red-400 text-xs mt-1">{errors.genericStore}</p>
            )}
          </div>

          <div>
            <label htmlFor="genericPrice" className="block text-sm text-gray-300 mb-1">
              Price (optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
              <input
                id="genericPrice"
                type="number"
                min="0"
                step="0.01"
                value={form.genericPrice}
                onChange={(e) => setField("genericPrice", e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>
        </fieldset>

        {/* Name brand product */}
        <fieldset className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <legend className="text-white font-semibold px-1">Name Brand</legend>

          <div>
            <label htmlFor="nameBrandProductName" className="block text-sm text-gray-300 mb-1">
              Product Name <span className="text-red-400">*</span>
            </label>
            <input
              id="nameBrandProductName"
              type="text"
              value={form.nameBrandProductName}
              onChange={(e) => setField("nameBrandProductName", e.target.value)}
              placeholder="e.g. Advil Ibuprofen 200mg"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              required
            />
            {errors.nameBrandProductName && (
              <p className="text-red-400 text-xs mt-1">{errors.nameBrandProductName}</p>
            )}
          </div>

          <div>
            <label htmlFor="nameBrand" className="block text-sm text-gray-300 mb-1">
              Brand <span className="text-red-400">*</span>
            </label>
            <input
              id="nameBrand"
              type="text"
              value={form.nameBrand}
              onChange={(e) => setField("nameBrand", e.target.value)}
              placeholder="e.g. Advil, Tylenol, Heinz"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              required
            />
            {errors.nameBrand && (
              <p className="text-red-400 text-xs mt-1">{errors.nameBrand}</p>
            )}
          </div>

          <div>
            <label htmlFor="nameBrandPrice" className="block text-sm text-gray-300 mb-1">
              Price (optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
              <input
                id="nameBrandPrice"
                type="number"
                min="0"
                step="0.01"
                value={form.nameBrandPrice}
                onChange={(e) => setField("nameBrandPrice", e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>
        </fieldset>

        {/* Category */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <label htmlFor="categoryId" className="block text-sm text-gray-300 mb-1">
            Category <span className="text-red-400">*</span>
          </label>
          <select
            id="categoryId"
            value={form.categoryId}
            onChange={(e) => setField("categoryId", e.target.value)}
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="">Select a category…</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-red-400 text-xs mt-1">{errors.categoryId}</p>
          )}
        </div>

        {/* Optional evidence */}
        <fieldset className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <legend className="text-white font-semibold px-1">
            Initial Evidence{" "}
            <span className="text-gray-500 font-normal text-sm">(optional)</span>
          </legend>
          <p className="text-gray-400 text-sm">
            Add a note about why you think the generic is or isn&apos;t equivalent.
          </p>

          <div>
            <label htmlFor="evidenceTitle" className="block text-sm text-gray-300 mb-1">
              Title
            </label>
            <input
              id="evidenceTitle"
              type="text"
              value={form.evidenceTitle}
              onChange={(e) => setField("evidenceTitle", e.target.value)}
              placeholder="e.g. Same active ingredients"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div>
            <label htmlFor="evidenceContent" className="block text-sm text-gray-300 mb-1">
              Details
            </label>
            <textarea
              id="evidenceContent"
              value={form.evidenceContent}
              onChange={(e) => setField("evidenceContent", e.target.value)}
              placeholder="Describe your evidence or experience…"
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-y"
            />
          </div>
        </fieldset>

        <div className="flex justify-end">
          <Button type="submit" size="lg" loading={submitting}>
            Submit for Review
          </Button>
        </div>
      </form>
    </div>
  );
}
