'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { ROADMAP_GROUPS } from '@/lib/marketing/constants';
import { useLocalizedHref, useMessages } from './i18n-provider';

const CATEGORY_META: Record<
  string,
  { label: string; icon: string; dotClass: string }
> = {
  Core: { label: 'Core', icon: 'auto_awesome', dotClass: 'bg-blue-500' },
  Record: { label: 'Record', icon: 'videocam', dotClass: 'bg-amber-500' },
  Share: { label: 'Share', icon: 'link', dotClass: 'bg-rose-500' },
};

// A flattened ticket plus the column context it belongs to. Captured on click
// so the detail card can morph open from it via a shared layoutId.
type SelectedTicket = {
  id: string;
  label: string;
  description: string;
  status: string;
  category: string;
  markerIcon: string;
  markerClass: string;
};

// Maps the English `category` string from the constant to its catalog key,
// so the localized label can be looked up via m.roadmap.categories.
const CATEGORY_KEY: Record<string, 'ai' | 'studio' | 'share'> = {
  Core: 'ai',
  Record: 'studio',
  Share: 'share',
};

export function RoadmapSection() {
  const [selected, setSelected] = useState<SelectedTicket | null>(null);
  const m = useMessages();
  const lh = useLocalizedHref();
  const reduceMotion = useReducedMotion();
  const layoutTransition = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 320, damping: 32 };

  // Escape closes the open detail card.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  return (
    <section id="roadmap" className="relative py-12 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-[28px] font-semibold leading-[1.1] tracking-tight sm:text-[32px] lg:text-[40px]">
              {m.roadmap.heading}
            </h2>
            <p className="mt-3 text-base font-normal leading-[1.4] tracking-[-0.01em] text-[#090c14]">
              {m.roadmap.subtitle}
            </p>
          </div>
          <Link
            href={lh('/suggest-feature')}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-black/10 bg-black/[0.02] px-5 py-2.5 text-base text-neutral-600 transition-colors hover:border-black/10 hover:text-foreground"
          >
            <Icon name="add_comment" size={16} />
            {m.roadmap.suggestFeature}
          </Link>
        </div>

        {/* Each group is a column; tiles show the title only and, on click,
            morph open into a detail card via a shared layoutId. */}
        <div className="mt-16 grid gap-4 lg:grid-cols-3">
          {ROADMAP_GROUPS.map((group, groupIndex) => {
            const inProgress = group.badgeLabel === 'In progress';
            const groupTitle = m.roadmap.groups[groupIndex].title;
            return (
              <div
                key={group.title}
                id={`roadmap-${group.title.toLowerCase().replace(/\s+/g, '-')}`}
                className={`scroll-mt-24 rounded-sm p-3 ${
                  inProgress ? 'bg-neutral-200/60' : 'bg-neutral-100/70'
                }`}
              >
                {/* Column header: status dot, name, ticket count. */}
                <div className="flex items-center gap-2 px-1.5 pb-3 pt-1">
                  <span className={group.badgeClass}>
                    <span
                      aria-hidden
                      className="block size-1.5 rounded-full bg-current"
                    />
                  </span>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                    {groupTitle}
                  </h3>
                  <span className="ms-auto font-mono text-[11px] font-medium text-neutral-400">
                    {group.items.length}
                  </span>
                </div>

                {/* Ticket tiles — click to open the detail card. */}
                <div className="space-y-2.5">
                  {group.items.map((item, itemIndex) => {
                    const category = CATEGORY_META[item.category];
                    const localizedItem =
                      m.roadmap.groups[groupIndex].items[itemIndex];
                    const categoryLabel =
                      m.roadmap.categories[CATEGORY_KEY[item.category]];
                    const id = `roadmap-ticket-${group.title}-${itemIndex}`;
                    return (
                      <motion.button
                        key={item.label}
                        type="button"
                        layoutId={id}
                        transition={layoutTransition}
                        onClick={() =>
                          setSelected({
                            id,
                            label: localizedItem.label,
                            description: localizedItem.description,
                            status: groupTitle,
                            category: item.category,
                            markerIcon: group.markerIcon,
                            markerClass: group.markerClass,
                          })
                        }
                        className="flex w-full cursor-pointer flex-col gap-5 rounded-sm bg-white p-3 text-left shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                      >
                        <span className="text-sm font-normal text-foreground">
                          {localizedItem.label}
                        </span>
                        {/* Footer: category label + matching coloured dot. */}
                        <span className="flex items-center justify-end gap-2">
                          <span className="text-sm font-medium text-neutral-500">
                            {categoryLabel}
                          </span>
                          <span
                            aria-hidden
                            className={`block size-2.5 rounded-full ${category.dotClass}`}
                          />
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail card — morphs open from the clicked ticket via the shared
          layoutId. Click-outside or Escape closes it. */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="roadmap-detail-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6 backdrop-blur-sm"
          >
            <motion.div
              layoutId={selected.id}
              transition={layoutTransition}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={selected.label}
              className="relative w-full max-w-md cursor-default rounded-2xl border border-black/[0.06] bg-white p-6 text-left shadow-2xl shadow-black/10"
            >
              <button
                type="button"
                aria-label={m.roadmap.closeAria}
                onClick={() => setSelected(null)}
                className="absolute right-4 top-4 flex size-7 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-black/5 hover:text-neutral-700"
              >
                <Icon name="close" size={16} />
              </button>
              <div className="flex items-start gap-4">
                <span
                  className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-neutral-100 ${selected.markerClass}`}
                >
                  <Icon name={selected.markerIcon} size={22} />
                </span>
                <div className="min-w-0 pr-6">
                  <motion.h3
                    layout="position"
                    className="font-heading text-lg font-semibold leading-snug tracking-tight text-neutral-900"
                  >
                    {selected.label}
                  </motion.h3>
                  <p className="mt-0.5 text-sm text-neutral-500">
                    {selected.status} ·{' '}
                    {m.roadmap.categories[CATEGORY_KEY[selected.category]]}
                  </p>
                </div>
              </div>
              <motion.p
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.05 }}
                className="mt-4 text-base leading-relaxed text-neutral-600"
              >
                {selected.description}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
