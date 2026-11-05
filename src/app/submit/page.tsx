"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";

interface Category { id: string; name: string; icon: string; slug: string; }

interface FormData {
  genericProductName: string; genericBrand: string; genericStore: string; genericPrice: string; genericSize: string;
  nameBrandProductName: string; nameBrand: string; nameBrandPrice: string; nameBrandSize: string;
  categoryId: string; evidenceTitle: string; evidenceContent: string;
}

const INITIAL_FORM: FormData = {
  genericProductName: "", genericBrand: "", genericStore: "", genericPrice: "", genericSize: "",
  nameBrandProductName: "", nameBrand: "", nameBrandPrice: "", nameBrandSize: "",
  categoryId: "", evidenceTitle: "", evidenceContent: "",
};

// Kept in sync with LIMITS in src/lib/validation.ts (server enforces them).
const MAX = { product: 120, brand: 60, store: 60, size: 40, title: 120, content: 2000 };

const inputClasses =
  "w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-[#0d1b4a]/30 focus:ring-2 focus:ring-[#0d1b4a]/10 transition-all duration-200";

export default function SubmitPage() {
  const { data: session, status } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [duplicate, setDuplicate] = useState<{ slug: string | null } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then((data) => setCategories(data.categories ?? [])).catch(() => {});
  }, []);

  if (status === "loading") {
    return (<div className="mx-auto max-w-2xl px-4 md:px-6 py-20 text-center"><p className="text-gray-500">Loading...</p></div>);
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-2xl px-4 md:px-6 py-20 text-center space-y-4">
        <div className="text-4xl mb-4 opacity-20" aria-hidden="true">&#128274;</div>
        <h1 className="text-2xl font-bold text-gray-900">Sign in to submit a comparison</h1>
        <p className="text-gray-500">You need to be signed in to contribute comparisons to GenericOrNot.</p>
        <Link
          href="/auth/signin?callbackUrl=%2Fsubmit"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-[#0d1b4a] to-[#162d6b] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:brightness-110"
        >
          Sign in to continue
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 md:px-6 py-20 text-center space-y-4">
        <div className="text-4xl mb-4 text-emerald-600" aria-hidden="true">&#10003;</div>
        <h1 className="text-2xl font-bold text-gray-900">Submitted for review</h1>
        <p className="text-gray-500">Thanks! A moderator will check it shortly — it goes live once approved. You can see its status on your profile.</p>
        <Button variant="secondary" onClick={() => { setForm(INITIAL_FORM); setSubmitted(false); setDuplicate(null); setErrors({}); }}>Submit another</Button>
      </div>
    );
  }

  function setField(field: keyof FormData, value: string) { setForm((prev) => ({ ...prev, [field]: value })); }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setSubmitting(true); setErrors({}); setDuplicate(null);
    const body = {
      genericProductName: form.genericProductName.trim(), genericBrand: form.genericBrand.trim(),
      genericStore: form.genericStore.trim(), genericPrice: form.genericPrice ? parseFloat(form.genericPrice) : null,
      genericSize: form.genericSize.trim(),
      nameBrandProductName: form.nameBrandProductName.trim(), nameBrand: form.nameBrand.trim(),
      nameBrandPrice: form.nameBrandPrice ? parseFloat(form.nameBrandPrice) : null,
      nameBrandSize: form.nameBrandSize.trim(),
      categoryId: form.categoryId,
      evidenceTitle: form.evidenceTitle.trim(), evidenceContent: form.evidenceContent.trim(),
    };
    try {
      const res = await fetch("/api/comparisons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409 || data.duplicate) { setDuplicate({ slug: data.existingSlug ?? null }); return; }
      if (!res.ok) { setErrors(data.errors ?? { _: data.error ?? "Something went wrong" }); return; }
      setSubmitted(true);
    } catch { setErrors({ _: "Network error. Please try again." }); } finally { setSubmitting(false); }
  }

  const fieldError = (field: string) => errors[field] ? <p className="text-red-600 text-xs mt-1">{errors[field]}</p> : null;

  return (
    <div className="mx-auto max-w-2xl px-4 md:px-6 py-12">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">Submit a Comparison</h1>
        <p className="text-gray-500 text-sm">Add a store-brand vs name-brand pair you&apos;ve seen in a Canadian store. Every submission is reviewed before it goes live.</p>
      </div>

      {duplicate && (
        <div className="mb-6 bg-amber-50 rounded-2xl p-4 text-amber-800 text-sm">
          <strong>Already here:</strong> this comparison has already been submitted.{" "}
          {duplicate.slug ? (
            <Link href={`/compare/${duplicate.slug}`} className="underline font-medium">View it and vote &rarr;</Link>
          ) : (
            "It's waiting for review."
          )}
        </div>
      )}
      {errors._ && (<div className="mb-6 bg-red-50 rounded-2xl p-4 text-red-600 text-sm" role="alert">{errors._}</div>)}

      <form onSubmit={handleSubmit} className="space-y-8">
        <fieldset className="glass rounded-2xl p-6 space-y-4">
          <legend className="text-gray-900 font-semibold px-1">Store Brand / Generic</legend>
          <div>
            <label htmlFor="genericProductName" className="block text-sm text-gray-600 mb-1.5">Product Name <span className="text-red-500">*</span></label>
            <input id="genericProductName" type="text" maxLength={MAX.product} value={form.genericProductName} onChange={(e) => setField("genericProductName", e.target.value)} placeholder="e.g. Life Brand Ibuprofen 200 mg" className={inputClasses} required />
            {fieldError("genericProductName")}
          </div>
          <div>
            <label htmlFor="genericBrand" className="block text-sm text-gray-600 mb-1.5">Brand <span className="text-red-500">*</span></label>
            <input id="genericBrand" type="text" maxLength={MAX.brand} value={form.genericBrand} onChange={(e) => setField("genericBrand", e.target.value)} placeholder="e.g. No Name, President's Choice, Great Value, Kirkland Signature" className={inputClasses} required />
            {fieldError("genericBrand")}
          </div>
          <div>
            <label htmlFor="genericStore" className="block text-sm text-gray-600 mb-1.5">Store <span className="text-red-500">*</span></label>
            <input id="genericStore" type="text" maxLength={MAX.store} value={form.genericStore} onChange={(e) => setField("genericStore", e.target.value)} placeholder="e.g. Loblaws, No Frills, Walmart, Costco, Shoppers Drug Mart" className={inputClasses} required />
            {fieldError("genericStore")}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="genericPrice" className="block text-sm text-gray-600 mb-1.5">Price in CAD (optional)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input id="genericPrice" type="number" min="0" max="10000" step="0.01" inputMode="decimal" value={form.genericPrice} onChange={(e) => setField("genericPrice", e.target.value)} placeholder="0.00" className={`${inputClasses} pl-7`} />
              </div>
              {fieldError("genericPrice")}
            </div>
            <div>
              <label htmlFor="genericSize" className="block text-sm text-gray-600 mb-1.5">Package size (optional)</label>
              <input id="genericSize" type="text" maxLength={MAX.size} value={form.genericSize} onChange={(e) => setField("genericSize", e.target.value)} placeholder="e.g. 100 tablets, 1 kg, 2 L" className={inputClasses} />
              {fieldError("genericSize")}
            </div>
          </div>
        </fieldset>

        <fieldset className="glass rounded-2xl p-6 space-y-4">
          <legend className="text-gray-900 font-semibold px-1">Name Brand</legend>
          <div>
            <label htmlFor="nameBrandProductName" className="block text-sm text-gray-600 mb-1.5">Product Name <span className="text-red-500">*</span></label>
            <input id="nameBrandProductName" type="text" maxLength={MAX.product} value={form.nameBrandProductName} onChange={(e) => setField("nameBrandProductName", e.target.value)} placeholder="e.g. Advil Ibuprofen 200 mg Tablets" className={inputClasses} required />
            {fieldError("nameBrandProductName")}
          </div>
          <div>
            <label htmlFor="nameBrand" className="block text-sm text-gray-600 mb-1.5">Brand <span className="text-red-500">*</span></label>
            <input id="nameBrand" type="text" maxLength={MAX.brand} value={form.nameBrand} onChange={(e) => setField("nameBrand", e.target.value)} placeholder="e.g. Advil, Tylenol, Kraft, Heinz" className={inputClasses} required />
            {fieldError("nameBrand")}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="nameBrandPrice" className="block text-sm text-gray-600 mb-1.5">Price in CAD (optional)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input id="nameBrandPrice" type="number" min="0" max="10000" step="0.01" inputMode="decimal" value={form.nameBrandPrice} onChange={(e) => setField("nameBrandPrice", e.target.value)} placeholder="0.00" className={`${inputClasses} pl-7`} />
              </div>
              {fieldError("nameBrandPrice")}
            </div>
            <div>
              <label htmlFor="nameBrandSize" className="block text-sm text-gray-600 mb-1.5">Package size (optional)</label>
              <input id="nameBrandSize" type="text" maxLength={MAX.size} value={form.nameBrandSize} onChange={(e) => setField("nameBrandSize", e.target.value)} placeholder="e.g. 100 tablets, 1 kg, 2 L" className={inputClasses} />
              {fieldError("nameBrandSize")}
            </div>
          </div>
        </fieldset>

        <div className="glass rounded-2xl p-6">
          <label htmlFor="categoryId" className="block text-sm text-gray-600 mb-1.5">Category <span className="text-red-500">*</span></label>
          <select id="categoryId" value={form.categoryId} onChange={(e) => setField("categoryId", e.target.value)} required className={inputClasses}>
            <option value="">Select a category...</option>
            {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>))}
          </select>
          {fieldError("categoryId")}
        </div>

        <fieldset className="glass rounded-2xl p-6 space-y-4">
          <legend className="text-gray-900 font-semibold px-1">Initial Evidence <span className="text-gray-400 font-normal text-sm">(optional)</span></legend>
          <p className="text-gray-500 text-sm">Why do you think the store brand is or isn&apos;t equivalent? Facts and your own experience only, please.</p>
          <div>
            <label htmlFor="evidenceTitle" className="block text-sm text-gray-600 mb-1.5">Title</label>
            <input id="evidenceTitle" type="text" maxLength={MAX.title} value={form.evidenceTitle} onChange={(e) => setField("evidenceTitle", e.target.value)} placeholder="e.g. Same medicinal ingredient and strength" className={inputClasses} />
            {fieldError("evidenceTitle")}
          </div>
          <div>
            <label htmlFor="evidenceContent" className="block text-sm text-gray-600 mb-1.5">Details</label>
            <textarea id="evidenceContent" maxLength={MAX.content} value={form.evidenceContent} onChange={(e) => setField("evidenceContent", e.target.value)} placeholder="Describe your evidence or experience..." rows={4} className={`${inputClasses} resize-y`} />
            {fieldError("evidenceContent")}
          </div>
        </fieldset>

        <div className="flex justify-end">
          <Button type="submit" size="lg" loading={submitting}>Submit for Review</Button>
        </div>
      </form>
    </div>
  );
}
