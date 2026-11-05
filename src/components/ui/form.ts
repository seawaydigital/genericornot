// Shared form-field styles so every input, select and textarea matches.
// min-h-11 keeps fields at the 44px touch-target minimum.

export const inputClass =
  "block w-full min-h-11 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[15px] text-ink placeholder:text-subtle shadow-sm transition-[border-color,box-shadow] focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 disabled:opacity-60";

export const labelClass = "mb-1.5 block text-sm font-semibold text-ink";

export const helpClass = "mt-1.5 text-xs text-muted";

export const errorClass = "mt-1.5 text-xs font-medium text-bad";
