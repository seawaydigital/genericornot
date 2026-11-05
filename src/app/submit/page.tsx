"use client";

import { useState, useEffect, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  CircleAlert,
  CircleCheck,
  Lightbulb,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { CategoryTile } from "@/components/ui/CategoryIcon";
import { SavingsTag } from "@/components/ui/SavingsTag";
import { inputClass, labelClass, helpClass, errorClass } from "@/components/ui/form";
import { computeSavings, savingsAreUnitBased } from "@/lib/verdict";
import { formatUnitPrice } from "@/lib/units";
import { formatCAD, formatCADPrecise } from "@/lib/format";
import { LIMITS } from "@/lib/validation";

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
  genericSize: string;
  nameBrandProductName: string;
  nameBrand: string;
  nameBrandPrice: string;
  nameBrandSize: string;
  categoryId: string;
  evidenceTitle: string;
  evidenceContent: string;
}

const INITIAL_FORM: FormData = {
  genericProductName: "",
  genericBrand: "",
  genericStore: "",
  genericPrice: "",
  genericSize: "",
  nameBrandProductName: "",
  nameBrand: "",
  nameBrandPrice: "",
  nameBrandSize: "",
  categoryId: "",
  evidenceTitle: "",
  evidenceContent: "",
};

// Visual order of the fields, used to focus the first one the server rejects.
const FIELD_ORDER: (keyof FormData)[] = [
  "nameBrandProductName",
  "nameBrand",
  "nameBrandPrice",
  "nameBrandSize",
  "genericProductName",
  "genericBrand",
  "genericStore",
  "genericPrice",
  "genericSize",
  "categoryId",
  "evidenceTitle",
  "evidenceContent",
];

const primaryLink =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-brand-600";

export default function SubmitPage() {
  const { data: session, status } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesFailed, setCategoriesFailed] = useState(false);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [duplicate, setDuplicate] = useState<{ slug: string | null } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => setCategoriesFailed(true));
  }, []);

  if (status === "loading") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-4">
        <p className="inline-flex items-center gap-2 text-muted">
          <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" />
          Loading…
        </p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-[70vh]">
        <PageHeader
          centered
          icon={
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-surface text-brand-500 shadow-card ring-1 ring-line">
              <LockKeyhole aria-hidden="true" className="h-7 w-7" />
            </span>
          }
          eyebrow="Contribute"
          title="Sign in to submit a comparison"
          description={<p>You need to be signed in to contribute comparisons to GenericOrNot.</p>}
        >
          <div className="flex flex-col items-center gap-8">
            <Link href="/auth/signin?callbackUrl=%2Fsubmit" className={primaryLink}>
              Sign in to continue
            </Link>
            <ul className="grid w-full gap-3 text-left sm:grid-cols-3">
              <Reason Icon={Users}>One account per person keeps votes honest.</Reason>
              <Reason Icon={UserRound}>Your profile shows a nickname, never your real name.</Reason>
              <Reason Icon={ShieldCheck}>A moderator reviews every submission.</Reason>
            </ul>
          </div>
        </PageHeader>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-[70vh]">
        <PageHeader
          centered
          icon={
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-good-bg text-good ring-1 ring-good-line">
              <CircleCheck aria-hidden="true" className="h-8 w-8" />
            </span>
          }
          eyebrow="Thank you"
          title="Submitted for review"
          description={
            <p>
              Thanks! A moderator will check it shortly — it goes live once approved. You can see its status on your
              profile.
            </p>
          }
        >
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                setForm(INITIAL_FORM);
                setSubmitted(false);
                setDuplicate(null);
                setErrors({});
              }}
            >
              Submit another
            </Button>
            <Link href={`/user/${session.user.username}`} className={primaryLink}>
              View your profile
            </Link>
          </div>
        </PageHeader>
      </div>
    );
  }

  function setField(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function focusFirstError(found: Record<string, string>) {
    const first = FIELD_ORDER.find((f) => found[f]);
    requestAnimationFrame(() => {
      const el: HTMLElement | null =
        first === "categoryId"
          ? document.querySelector<HTMLElement>('input[name="categoryId"]')
          : document.getElementById(first ?? "form-error");
      el?.focus();
      el?.scrollIntoView?.({ block: "center", behavior: "smooth" });
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setDuplicate(null);
    const body = {
      genericProductName: form.genericProductName.trim(),
      genericBrand: form.genericBrand.trim(),
      genericStore: form.genericStore.trim(),
      genericPrice: form.genericPrice ? parseFloat(form.genericPrice) : null,
      genericSize: form.genericSize.trim(),
      nameBrandProductName: form.nameBrandProductName.trim(),
      nameBrand: form.nameBrand.trim(),
      nameBrandPrice: form.nameBrandPrice ? parseFloat(form.nameBrandPrice) : null,
      nameBrandSize: form.nameBrandSize.trim(),
      categoryId: form.categoryId,
      evidenceTitle: form.evidenceTitle.trim(),
      evidenceContent: form.evidenceContent.trim(),
    };
    try {
      const res = await fetch("/api/comparisons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409 || data.duplicate) {
        setDuplicate({ slug: data.existingSlug ?? null });
        return;
      }
      if (!res.ok) {
        const found: Record<string, string> = data.errors ?? { _: data.error ?? "Something went wrong" };
        setErrors(found);
        focusFirstError(found);
        return;
      }
      setSubmitted(true);
      window.scrollTo?.({ top: 0 });
    } catch {
      setErrors({ _: "Network error. Please try again." });
      focusFirstError({ _: "network" });
    } finally {
      setSubmitting(false);
    }
  }

  /** Label, input and error wiring for one text-like field. */
  const field = (
    name: keyof FormData,
    label: string,
    opts: {
      required?: boolean;
      placeholder?: string;
      maxLength?: number;
      help?: string;
      price?: boolean;
      textarea?: boolean;
    } = {}
  ) => {
    const error = errors[name];
    const describedBy = error ? `${name}-error` : opts.help ? `${name}-help` : undefined;
    const common = {
      id: name,
      value: form[name],
      required: opts.required,
      placeholder: opts.placeholder,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": describedBy,
    };
    return (
      <div>
        <label htmlFor={name} className={labelClass}>
          {label}
          {opts.required ? (
            <span aria-hidden="true" className="text-bad">
              {" "}
              *
            </span>
          ) : (
            <span className="font-normal text-subtle"> (optional)</span>
          )}
        </label>
        {opts.textarea ? (
          <textarea
            {...common}
            rows={4}
            maxLength={opts.maxLength}
            onChange={(e) => setField(name, e.target.value)}
            className={`${inputClass} resize-y`}
          />
        ) : opts.price ? (
          <div className="relative">
            <span aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] text-subtle">
              $
            </span>
            <input
              {...common}
              type="number"
              min="0"
              max={LIMITS.maxPrice}
              step="0.01"
              inputMode="decimal"
              onChange={(e) => setField(name, e.target.value)}
              className={`${inputClass} pl-7 tabular-nums`}
            />
          </div>
        ) : (
          <input
            {...common}
            type="text"
            maxLength={opts.maxLength}
            onChange={(e) => setField(name, e.target.value)}
            className={inputClass}
          />
        )}
        {error ? (
          <p id={`${name}-error`} className={errorClass}>
            {error}
          </p>
        ) : opts.help ? (
          <p id={`${name}-help`} className={helpClass}>
            {opts.help}
          </p>
        ) : null}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Contribute"
        title="Submit a comparison"
        description={
          <p>
            Add a store-brand vs name-brand pair you&apos;ve seen in a Canadian store. Every submission is reviewed
            before it goes live.
          </p>
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-12 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <form onSubmit={handleSubmit} className="min-w-0 space-y-10">
            {duplicate && (
              <div className="flex gap-3 rounded-2xl border border-close-line bg-close-bg p-4 text-sm text-ink" role="status">
                <CircleAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-close" />
                <p>
                  <strong>Already here:</strong> this comparison has already been submitted.{" "}
                  {duplicate.slug ? (
                    <Link href={`/compare/${duplicate.slug}`} className="font-semibold text-brand-500 underline">
                      View it and vote &rarr;
                    </Link>
                  ) : (
                    "It's waiting for review."
                  )}
                </p>
              </div>
            )}
            {errors._ && (
              <div
                id="form-error"
                tabIndex={-1}
                className="flex gap-3 rounded-2xl border border-bad-line bg-bad-bg p-4 text-sm font-medium text-bad"
                role="alert"
              >
                <CircleAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
                {errors._}
              </div>
            )}

            {/* Step 1: the face-off */}
            <section aria-labelledby="step-products">
              <StepHeading
                n={1}
                id="step-products"
                title="The two products"
                description="Start with the name brand you know, then the store brand you'd buy instead."
              />
              <div className="relative mt-5 grid gap-4 md:grid-cols-2 md:gap-6">
                <fieldset className="card space-y-4 p-5 sm:p-6">
                  <legend className="sr-only">Name brand</legend>
                  <p aria-hidden="true" className="text-xs font-bold uppercase tracking-[0.14em] text-subtle">
                    Name brand
                  </p>
                  {field("nameBrandProductName", "Product name", {
                    required: true,
                    maxLength: LIMITS.productName,
                    placeholder: "e.g. Advil Ibuprofen 200 mg Tablets",
                  })}
                  {field("nameBrand", "Brand", {
                    required: true,
                    maxLength: LIMITS.brand,
                    placeholder: "e.g. Advil, Tylenol, Kraft, Heinz",
                  })}
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
                    {field("nameBrandPrice", "Price in CAD", { price: true, placeholder: "0.00" })}
                    {field("nameBrandSize", "Package size", {
                      maxLength: LIMITS.size,
                      placeholder: "e.g. 100 tablets, 1 kg",
                    })}
                  </div>
                </fieldset>

                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 z-10 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface font-display text-lg italic text-ink shadow-card md:grid"
                >
                  vs
                </span>

                <fieldset className="card space-y-4 border-good-line bg-good-bg/40 p-5 sm:p-6">
                  <legend className="sr-only">Store brand</legend>
                  <p aria-hidden="true" className="text-xs font-bold uppercase tracking-[0.14em] text-good">
                    Store brand alternative
                  </p>
                  {field("genericProductName", "Product name", {
                    required: true,
                    maxLength: LIMITS.productName,
                    placeholder: "e.g. Life Brand Ibuprofen 200 mg",
                  })}
                  {field("genericBrand", "Brand", {
                    required: true,
                    maxLength: LIMITS.brand,
                    placeholder: "e.g. No Name, President's Choice, Great Value, Kirkland Signature",
                  })}
                  {field("genericStore", "Store", {
                    required: true,
                    maxLength: LIMITS.store,
                    placeholder: "e.g. Loblaws, No Frills, Walmart, Costco, Shoppers Drug Mart",
                  })}
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
                    {field("genericPrice", "Price in CAD", { price: true, placeholder: "0.00" })}
                    {field("genericSize", "Package size", {
                      maxLength: LIMITS.size,
                      placeholder: "e.g. 100 tablets, 1 kg",
                    })}
                  </div>
                </fieldset>
              </div>

              <SavingsPreview form={form} />
            </section>

            {/* Step 2: category */}
            <section aria-labelledby="step-category">
              <StepHeading n={2} id="step-category" title="Category" description="Pick the aisle you'd find it in." />
              <fieldset aria-describedby={errors.categoryId ? "categoryId-error" : undefined} className="mt-5">
                <legend className="sr-only">Category</legend>
                {categories.length === 0 ? (
                  categoriesFailed ? (
                    <p className="rounded-2xl border border-bad-line bg-bad-bg p-4 text-sm text-bad" role="alert">
                      We couldn&apos;t load the categories. Refresh the page to try again.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-hidden="true">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-[4.25rem] animate-pulse rounded-2xl bg-paper-deep" />
                      ))}
                    </div>
                  )
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {categories.map((cat) => {
                      const checked = form.categoryId === cat.id;
                      return (
                        <label
                          key={cat.id}
                          className={`relative flex min-h-[4.25rem] cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-[border-color,box-shadow,background-color] has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand-500/25 ${
                            checked
                              ? "border-brand-500 bg-brand-50 shadow-sm ring-1 ring-brand-500"
                              : "border-line bg-surface hover:border-line-strong"
                          }`}
                        >
                          <input
                            type="radio"
                            name="categoryId"
                            value={cat.id}
                            checked={checked}
                            onChange={() => setField("categoryId", cat.id)}
                            required
                            className="sr-only"
                          />
                          <CategoryTile slug={cat.slug} size="sm" />
                          <span className="pr-4 text-sm font-semibold leading-snug text-ink">{cat.name}</span>
                          {checked && (
                            <CircleCheck aria-hidden="true" className="absolute right-2.5 top-2.5 h-4 w-4 text-brand-500" />
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}
              </fieldset>
              {errors.categoryId && (
                <p id="categoryId-error" className={errorClass}>
                  {errors.categoryId}
                </p>
              )}
            </section>

            {/* Step 3: evidence */}
            <section aria-labelledby="step-evidence">
              <StepHeading
                n={3}
                id="step-evidence"
                title="Why do you think so?"
                optional
                description="Why do you think the store brand is or isn't equivalent? Facts and your own experience only, please."
              />
              <div className="card mt-5 space-y-4 p-5 sm:p-6">
                {field("evidenceTitle", "Title", {
                  maxLength: LIMITS.evidenceTitle,
                  placeholder: "e.g. Same medicinal ingredient and strength",
                })}
                {field("evidenceContent", "Details", {
                  textarea: true,
                  maxLength: LIMITS.evidenceContent,
                  placeholder: "Describe your evidence or experience...",
                })}
              </div>
            </section>

            <div className="flex flex-col-reverse gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="inline-flex items-center gap-2 text-sm text-muted">
                <ShieldCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-good" />
                A moderator reviews it before it appears on the site.
              </p>
              <Button type="submit" size="lg" loading={submitting} className="w-full sm:w-auto">
                Submit for Review
              </Button>
            </div>
          </form>

          <aside className="hidden lg:sticky lg:top-24 lg:block" aria-label="Tips for a good submission">
            <Tips />
          </aside>
        </div>
      </div>
    </div>
  );
}

function Reason({ Icon, children }: { Icon: LucideIcon; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 rounded-2xl border border-line bg-surface/80 p-4 text-sm leading-relaxed text-muted">
      <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
      {children}
    </li>
  );
}

function StepHeading({
  n,
  id,
  title,
  description,
  optional = false,
}: {
  n: number;
  id: string;
  title: string;
  description?: string;
  optional?: boolean;
}) {
  return (
    <div className="flex items-start gap-3.5">
      <span
        aria-hidden="true"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand font-display text-xl leading-none text-tag"
      >
        {n}
      </span>
      <div>
        <h2 id={id} className="text-lg font-semibold leading-tight text-ink">
          <span className="sr-only">Step {n}: </span>
          {title}
          {optional && <span className="ml-2 text-sm font-normal text-subtle">Optional</span>}
        </h2>
        {description && <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>}
      </div>
    </div>
  );
}

/** Live check of what shoppers will see, once both prices are filled in. */
function SavingsPreview({ form }: { form: FormData }) {
  const brandPrice = parseFloat(form.nameBrandPrice);
  const genericPrice = parseFloat(form.genericPrice);
  const hasPrices = brandPrice > 0 && genericPrice >= 0 && form.genericPrice !== "";

  if (!hasPrices) {
    return (
      <p className="mt-4 flex items-center gap-2 rounded-2xl border border-dashed border-line-strong bg-surface-2 px-4 py-3 text-sm text-muted">
        <Lightbulb aria-hidden="true" className="h-4 w-4 shrink-0 text-tag-deep" />
        Add both prices and package sizes to preview the savings shoppers will see.
      </p>
    );
  }

  const brandSize = form.nameBrandSize.trim() || null;
  const genericSize = form.genericSize.trim() || null;
  const savings = computeSavings(genericPrice, brandPrice, genericSize, brandSize);
  const unitBased = savingsAreUnitBased(genericSize, brandSize);
  const brandUnit = formatUnitPrice(brandPrice, brandSize, formatCADPrecise);
  const genericUnit = formatUnitPrice(genericPrice, genericSize, formatCADPrecise);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-line-strong bg-surface-2 px-4 py-3">
      <p className="text-sm text-muted">
        <span className="font-semibold text-ink">Preview: </span>
        <span className="tabular-nums">
          {formatCAD(brandPrice)}
          {brandUnit ? ` (${brandUnit})` : ""} vs{" "}
          <span className="font-semibold text-good">{formatCAD(genericPrice)}</span>
          {genericUnit ? ` (${genericUnit})` : ""}
        </span>
        {!unitBased && <span className="block text-xs text-subtle">Add both package sizes to compare unit prices.</span>}
      </p>
      {savings !== null && savings > 0 && <SavingsTag percent={savings} size="md" suffix={unitBased ? "per unit" : undefined} />}
      {savings !== null && savings < 0 && (
        <span className="text-sm font-semibold text-bad">The store brand costs {Math.abs(savings)}% more</span>
      )}
      {savings === 0 && <span className="text-sm font-semibold text-muted">About the same price</span>}
    </div>
  );
}

function Tips() {
  const tips = [
    "Use the regular shelf price, not a sale price.",
    "Add package sizes to both — we compare unit prices, so a bulk pack isn't mistaken for the pricier one.",
    "Canadian stores only: Loblaws, No Frills, Walmart, Costco, Shoppers, Metro, Sobeys and the like.",
    "Stick to facts and your own experience; claims are checked before they go public.",
  ];
  return (
    <div className="card p-6">
      <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
        <Lightbulb aria-hidden="true" className="h-4 w-4 text-tag-deep" />
        Tips for a good submission
      </h2>
      <ul className="mt-4 space-y-3">
        {tips.map((tip) => (
          <li key={tip} className="flex gap-2.5 text-sm leading-relaxed text-muted">
            <CircleCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-good" />
            {tip}
          </li>
        ))}
      </ul>
      <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-subtle">
        Verdicts come only from votes and evidence.{" "}
        <Link href="/about#verdicts" className="font-semibold text-brand-500 hover:underline">
          How verdicts work
        </Link>
      </p>
    </div>
  );
}
