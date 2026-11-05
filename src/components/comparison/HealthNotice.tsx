interface HealthNoticeProps {
  categorySlug: string | null | undefined;
}

/**
 * Plain-language safety note for medicine and baby comparisons. Community
 * votes are opinions; for health decisions a pharmacist beats a poll.
 */
export function HealthNotice({ categorySlug }: HealthNoticeProps) {
  if (categorySlug === "health-otc") {
    return (
      <aside className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 text-sm text-blue-950 leading-relaxed">
        <p className="font-semibold">Not medical advice</p>
        <p className="mt-1">
          Health Canada requires a generic medicine to contain the same medicinal ingredients, at the same strength, as
          the brand-name product it copies, and to work the same way in the body. Non-medicinal ingredients — fillers,
          dyes, flavours, coatings — can differ. If you have allergies, take other medications, or are buying for a
          child, check the label and ask your pharmacist.
        </p>
      </aside>
    );
  }

  if (categorySlug === "baby-kids") {
    return (
      <aside className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 text-sm text-blue-950 leading-relaxed">
        <p className="font-semibold">A note for parents</p>
        <p className="mt-1">
          Infant formula sold in Canada must meet Health Canada&apos;s composition and safety requirements, but
          formulations still differ. Talk to your doctor or pharmacist before switching formula for a baby with
          allergies, reflux or other medical needs.
        </p>
      </aside>
    );
  }

  return null;
}
