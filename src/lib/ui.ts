export const inputClassName =
  "w-full border-0 border-b border-gold-light/70 bg-transparent px-0 py-3 text-sm text-charcoal outline-none transition placeholder:text-charcoal-muted/45 focus:border-b-2 focus:border-gold focus:pb-[calc(0.75rem-1px)]";

export const labelClassName =
  "mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-charcoal-muted";

export const selectClassName = inputClassName;

export const textareaClassName =
  "w-full resize-y rounded-[6px] border border-gold-light/60 bg-panel/40 px-4 py-3 text-sm text-charcoal outline-none transition placeholder:text-charcoal-muted/45 focus:border-gold focus:ring-1 focus:ring-gold/15";

export const fileInputClassName =
  "w-full rounded-[7px] border border-gold-light/60 bg-panel/50 px-4 py-3 text-sm text-charcoal file:mr-4 file:rounded-[7px] file:border-0 file:bg-burgundy file:px-4 file:py-2 file:text-sm file:font-medium file:tracking-wide file:text-cream hover:file:bg-burgundy-dark";

const btnBaseClassName =
  "inline-flex items-center justify-center rounded-[7px] px-6 py-2.5 text-sm font-medium tracking-[0.04em] transition duration-200 disabled:cursor-not-allowed disabled:opacity-50";

export const btnPrimaryClassName =
  `${btnBaseClassName} bg-burgundy text-cream shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_1px_3px_rgba(92,26,46,0.22)] hover:bg-burgundy-dark hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_6px_rgba(92,26,46,0.28)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]`;

export const btnSecondaryClassName =
  `${btnBaseClassName} border border-gold-light/70 bg-panel/60 text-charcoal hover:border-gold hover:bg-cream/40`;

export const btnGoldClassName =
  `${btnBaseClassName} border border-gold/60 bg-panel text-burgundy hover:border-gold hover:bg-gold-muted/50`;

export const btnDangerClassName =
  `${btnBaseClassName} border border-urgent/25 bg-panel/60 text-urgent hover:border-urgent/40 hover:bg-urgent-light/80`;

export const cardClassName =
  "heritage-card rounded-[6px] border border-gold-light/50 bg-panel shadow-[0_2px_10px_rgba(92,26,46,0.04)] transition duration-300 ease-out hover:-translate-y-0.5 hover:border-gold-light hover:shadow-[0_10px_28px_rgba(92,26,46,0.1)]";

export const formCardClassName = `${cardClassName} p-8 sm:p-10`;

export const plaqueClassName = "heritage-plaque rounded-[6px] px-7 py-8";

export const sectionTitleClassName =
  "text-lg font-serif font-medium tracking-tight text-charcoal";

export const sectionDividerClassName = "border-t border-gold-light/60";

export const mutedTextClassName = "text-sm leading-relaxed text-charcoal-muted";

export const tableHeaderClassName =
  "border-b border-gold-light/60 bg-ivory/80 text-xs font-medium uppercase tracking-[0.14em] text-charcoal-muted";

export const tableRowClassName = "border-b border-gold-light/40 last:border-0";

export const linkClassName =
  "text-sm font-medium tracking-wide text-burgundy transition hover:text-gold";

export const pageTitleClassName =
  "font-serif text-3xl font-medium tracking-tight text-charcoal sm:text-4xl";

export const pageTitleRuleClassName =
  "mt-5 h-px w-24 bg-gradient-to-r from-gold via-gold-light/70 to-transparent";

export const goldLabelClassName =
  "text-xs font-medium uppercase tracking-[0.14em] text-gold";
