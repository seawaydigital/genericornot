import { Baby, Stethoscope } from "lucide-react";

interface HealthNoticeProps {
  categorySlug: string | null | undefined;
  className?: string;
}

/**
 * Plain-language safety note for medicine and baby comparisons. Community
 * votes are opinions; for health decisions a pharmacist beats a poll.
 */
export function HealthNotice({ categorySlug, className = "" }: HealthNoticeProps) {
  const content =
    categorySlug === "health-otc"
      ? {
          Icon: Stethoscope,
          title: "Not medical advice",
          body: "Health Canada requires a generic medicine to contain the same medicinal ingredients, at the same strength, as the brand-name product it copies, and to work the same way in the body. Non-medicinal ingredients — fillers, dyes, flavours, coatings — can differ. If you have allergies, take other medications, or are buying for a child, check the label and ask your pharmacist.",
        }
      : categorySlug === "baby-kids"
        ? {
            Icon: Baby,
            title: "A note for parents",
            body: "Infant formula sold in Canada must meet Health Canada's composition and safety requirements, but formulations still differ. Talk to your doctor or pharmacist before switching formula for a baby with allergies, reflux or other medical needs.",
          }
        : null;

  if (!content) return null;

  return (
    <aside className={`flex gap-4 rounded-[1.25rem] border border-sky-200 bg-sky-50 p-5 sm:p-6 ${className}`}>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-100 text-sky-900">
        <content.Icon aria-hidden="true" className="h-5 w-5" />
      </span>
      <div className="text-[15px] leading-relaxed text-sky-950">
        <p className="font-semibold">{content.title}</p>
        <p className="mt-1">{content.body}</p>
      </div>
    </aside>
  );
}
