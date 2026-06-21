'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Icon } from '@/components/ui/icon';
import { SectionHeader } from './section-header';
import { DemoStage } from './demo-stage';
import { useMessages } from './i18n-provider';

// Sharing + teams, folded into one CapCut-style accordion. Each numbered row
// is a category (recordings / screenshots / workspaces). The open row paints a
// soft card, lists its sub-features, and shows a live mockup on the right.
// Clicking a sub-feature title swaps both its description and the mockup —
// exactly the CapCut "01 Image → Background Remover / Image Enhancer" rhythm.
// Only one category is open at a time; the open one never collapses to empty,
// it's replaced when another row is clicked.

type ShareKey = 'editor' | 'viewer' | 'dashboard';
type SnapKey = 'markup' | 'capture' | 'share';
type VisibilityKey = 'public' | 'workspace' | 'private';

type Feature = {
  key: string;
  title: string;
  // The description renders as: <linkText (underlined)> + " " + body — the
  // leading phrase reads as a CapCut-style inline link.
  linkText: string;
  body: string;
};

type Category = {
  id: string; // anchor target (kept so nav #share / #snap still land here)
  num: string;
  kind: 'share' | 'snap' | 'workspaces';
  title: string;
  features: Feature[];
};

const SHARE_URLS: Record<ShareKey, string> = {
  editor: 'captureflow.xyz/s/8kx2pnq4',
  viewer: 'captureflow.xyz/s/8kx2pnq4',
  dashboard: 'captureflow.xyz',
};

const SNAP_URLS: Record<SnapKey, string> = {
  markup: 'captureflow.xyz/snaps/8kx2pnq4/edit',
  capture: 'capture overlay',
  share: 'captureflow.xyz',
};

const CATEGORIES: Category[] = [
  {
    id: 'share',
    num: '01',
    kind: 'share',
    title: 'Shareable recordings',
    features: [
      {
        key: 'editor',
        title: 'React and comment on the web',
        linkText: 'Drop reactions and threaded comments',
        body: '— feedback lands right on the recording, no re-record.',
      },
      {
        key: 'viewer',
        title: 'Stop recording, link is ready',
        linkText: 'The URL hits your clipboard the moment you stop',
        body: '— it uploads while you record, no render wait.',
      },
      {
        key: 'dashboard',
        title: 'Your shares, your dashboard',
        linkText: 'Track views, search your library, revoke access',
        body: '— every link organized in one place.',
      },
    ],
  },
  {
    id: 'snap',
    num: '02',
    kind: 'snap',
    title: 'Snap screenshots',
    features: [
      {
        key: 'markup',
        title: 'Annotate before you share',
        linkText: 'Add arrows, text, or blur',
        body: 'over any capture — every annotation stays on the Snap.',
      },
      {
        key: 'capture',
        title: 'Region, window, or full screen',
        linkText: 'One shortcut, three ways to grab',
        body: '— drag a region, click a window, or take the whole display.',
      },
      {
        key: 'share',
        title: 'One link, ready to share',
        linkText: 'The link hits your clipboard',
        body: '— Snaps and recordings together in one dashboard.',
      },
    ],
  },
  {
    id: 'workspaces',
    num: '03',
    kind: 'workspaces',
    title: 'Team workspaces',
    features: [
      {
        key: 'workspace',
        title: 'Share with your team',
        linkText: 'Keep links inside your workspace',
        body: 'so only teammates can open them — private by default.',
      },
      {
        key: 'public',
        title: 'Public when you want',
        linkText: 'Flip a share public',
        body: 'and anyone with the link can watch — great for changelogs and demos.',
      },
      {
        key: 'private',
        title: 'Keep it to yourself',
        linkText: 'Lock a share to just you',
        body: 'while you draft, then share it the moment it’s ready.',
      },
    ],
  },
];

export function CollaborationSection() {
  const m = useMessages();
  const [activeCat, setActiveCat] = useState(0);

  // Let nav anchors (#share / #snap / #workspaces) open the matching row when
  // jumped to, so the deep-link lands on an expanded category rather than a
  // collapsed header.
  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash.replace('#', '');
      const idx = CATEGORIES.findIndex((c) => c.id === hash);
      if (idx < 0) return;
      setActiveCat(idx);
      // Expanding the target row collapses the previously-open one (a 0.45s
      // height animation); if that row sat above the target, the target drifts
      // upward as it shrinks. A single scroll would either overshoot (done
      // before the collapse) or read as a scroll-back (done after). Instead
      // FOLLOW the row each frame for the animation's duration so it stays
      // pinned to the top — the viewport lands on it at once and tracks it to
      // rest, no overshoot or scroll-back. scroll-mt-28 supplies the nav offset.
      const el = document.getElementById(hash);
      if (!el) return;
      const startTs = performance.now();
      const follow = () => {
        el.scrollIntoView({ block: 'start' });
        if (performance.now() - startTs < 520) requestAnimationFrame(follow);
      };
      requestAnimationFrame(follow);
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  return (
    <section
      id="collaboration"
      className="relative scroll-mt-24 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-10">
        <SectionHeader
          textClassName="sm:max-w-xl"
          title={
            <span className="sm:whitespace-nowrap">
              {m.collaboration.header.title}
            </span>
          }
        >
          {m.collaboration.header.subtitle}
        </SectionHeader>

        <div className="mt-12 flex flex-col sm:mt-14">
          {CATEGORIES.map((cat, i) => (
            <AccordionRow
              key={cat.id}
              cat={cat}
              isActive={i === activeCat}
              // Suppress this row's bottom divider when the active card sits
              // directly below it — otherwise the line paints across the
              // card's rounded top edge.
              nextActive={i + 1 === activeCat}
              onActivate={() => setActiveCat(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function AccordionRow({
  cat,
  isActive,
  nextActive,
  onActivate,
}: {
  cat: Category;
  isActive: boolean;
  nextActive: boolean;
  onActivate: () => void;
}) {
  const m = useMessages();
  const catTitle = m.collaboration.categories[cat.kind].title;
  // State lives here (not in the expanded body) so it survives across
  // collapses and so the title + features + mockup can share it.
  const [featureKey, setFeatureKey] = useState(cat.features[0].key);
  // Disclosure panel id — both header buttons (collapsed + expanded) point
  // their aria-controls here.
  const panelId = `${cat.id}-panel`;

  const numberClass =
    'w-8 shrink-0 font-heading text-2xl font-semibold tabular-nums tracking-tight text-neutral-900 sm:w-9 sm:text-[26px]';
  const titleClass =
    'font-heading text-2xl font-semibold tracking-tight text-neutral-900 sm:text-[26px]';

  return (
    <div
      id={cat.id}
      className={`scroll-mt-28 overflow-hidden transition-colors duration-300 ${
        isActive ? 'rounded-[2rem] bg-blue-100' : ''
      }`}
    >
      {/* Collapsed header — number + title + "+". Clicking opens the row; the
          open row drops this header and renders the title inside its body, so
          the mockup beside it can stretch up to the title line. */}
      {!isActive && (
        <button
          type="button"
          onClick={onActivate}
          aria-expanded={isActive}
          aria-controls={panelId}
          className={`flex w-full cursor-pointer items-center gap-16 px-5 py-6 text-left transition-opacity hover:opacity-60 sm:gap-60 sm:px-9 sm:py-7 ${
            nextActive ? '' : 'border-b border-black/[0.08]'
          }`}
        >
          <span className={numberClass}>{cat.num}</span>
          <span className={`flex-1 ${titleClass}`}>{catTitle}</span>
          <Icon
            name="add"
            size={28}
            weight={600}
            className="shrink-0 text-neutral-900"
          />
        </button>
      )}

      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            key="content"
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 py-6 sm:px-9 sm:py-9">
              {/* Two columns: the left (title + features) stretches to the
                  mockup's height and uses justify-between so the title pins to
                  the top and the feature list spreads down beside the mockup. */}
              <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-12">
                <div className="flex min-w-0 flex-col gap-y-10">
                  {/* Expanded header — still a real disclosure toggle (the
                      collapsed <button> unmounts while open), so AT always
                      finds a button whose aria-expanded reflects the row's
                      state. Re-clicking keeps it open by design: one category
                      is always expanded, rows swap rather than collapse. */}
                  <button
                    type="button"
                    onClick={onActivate}
                    aria-expanded={isActive}
                    aria-controls={panelId}
                    className="flex items-center gap-16 text-left sm:gap-60"
                  >
                    <span className={numberClass}>{cat.num}</span>
                    <span className={titleClass}>{catTitle}</span>
                  </button>
                  {/* pl aligns the feature text under the title (number width +
                      gap, minus the sub-feature sparkle gutter). */}
                  <FeatureList
                    cat={cat}
                    featureKey={featureKey}
                    setFeatureKey={setFeatureKey}
                  />
                </div>

                <div className="w-full min-w-0 self-start">
                  {cat.kind === 'share' && (
                    <ShareFrame activeKey={featureKey as ShareKey} />
                  )}
                  {cat.kind === 'snap' && (
                    <SnapFrame activeKey={featureKey as SnapKey} />
                  )}
                  {cat.kind === 'workspaces' && (
                    <WorkspaceCard
                      visibility={featureKey as VisibilityKey}
                      onVisibilityChange={setFeatureKey}
                    />
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-feature list — all titles visible; the active one carries a sparkle and
// expands its description. Indented so the feature text lines up under the
// category title (the sparkle hangs in the gutter to its left).
function FeatureList({
  cat,
  featureKey,
  setFeatureKey,
}: {
  cat: Category;
  featureKey: string;
  setFeatureKey: (key: string) => void;
}) {
  const m = useMessages();
  // Localized copy for this category's sub-features, keyed by feature `key`
  // (which matches the catalog's per-category feature keys exactly).
  const featureCopy = m.collaboration.categories[cat.kind].features as Record<
    string,
    { title: string; linkText: string; body: string }
  >;
  return (
    <ul className="flex flex-col gap-4 ps-[4.5rem] sm:ps-[15.75rem]">
      {cat.features.map((f) => {
        const on = f.key === featureKey;
        const copy = featureCopy[f.key];
        return (
          <li key={f.key}>
            <button
              type="button"
              onClick={() => setFeatureKey(f.key)}
              aria-pressed={on}
              className="group flex w-full cursor-pointer items-center gap-2 text-left"
            >
              {/* Reserved gutter — keeps every title's text aligned whether or
                  not the active sparkle is showing. */}
              <span
                className="flex w-4 shrink-0 justify-center"
                aria-hidden="true"
              >
                {on && (
                  <Icon
                    name="auto_awesome"
                    size={16}
                    className="text-neutral-900"
                  />
                )}
              </span>
              <span
                className={`text-sm font-semibold tracking-[-0.01em] transition-colors ${
                  on
                    ? 'text-neutral-900 underline decoration-neutral-900 underline-offset-[3px]'
                    : 'text-neutral-900/80 group-hover:text-neutral-900'
                }`}
              >
                {copy.title}
              </span>
            </button>

            <AnimatePresence initial={false}>
              {on && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  {/* ml-6 = gutter (w-4) + gap-2, so the body lines up under the
                      title text, not the sparkle. pb adds separation from the
                      next feature title below the expanded description. */}
                  <p className="ms-6 mt-1.5 max-w-md pb-8 text-sm leading-relaxed text-muted-foreground">
                    <span className="text-neutral-900">{copy.linkText}</span>{' '}
                    {copy.body}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}

const FADE = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
};

// ─────────────────────────────────────────────────────────────────────────
// Share mockup — Safari chrome + a body slot that swaps between the share
// viewer with its activity rail, the recipient's viewer, and the dashboard.
// ─────────────────────────────────────────────────────────────────────────
function ShareFrame({ activeKey }: { activeKey: ShareKey }) {
  const url = SHARE_URLS[activeKey];
  return (
    <BrowserChrome url={url}>
      <AnimatePresence mode="wait" initial={false}>
        {activeKey === 'viewer' && (
          <motion.div key="viewer" {...FADE} className="absolute inset-0">
            <ViewerBody />
          </motion.div>
        )}
        {activeKey === 'editor' && (
          <motion.div key="editor" {...FADE} className="absolute inset-0">
            <FeedbackBody />
          </motion.div>
        )}
        {activeKey === 'dashboard' && (
          <motion.div key="dashboard" {...FADE} className="absolute inset-0">
            <DashboardBody cards={[{ titleW: 82 }, { titleW: 70 }]} />
          </motion.div>
        )}
      </AnimatePresence>
    </BrowserChrome>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Snap mockup — same chrome, body swaps between the capture overlay, the
// markup editor, and the dashboard. The capture step shows a status string
// in the URL pill (no hosted URL yet).
// ─────────────────────────────────────────────────────────────────────────
function SnapFrame({ activeKey }: { activeKey: SnapKey }) {
  const url = SNAP_URLS[activeKey];
  const isOverlay = activeKey === 'capture';
  return (
    <BrowserChrome url={url} overlay={isOverlay}>
      <AnimatePresence mode="wait" initial={false}>
        {activeKey === 'capture' && (
          <motion.div key="capture" {...FADE} className="absolute inset-0">
            <CaptureBody />
          </motion.div>
        )}
        {activeKey === 'markup' && (
          <motion.div key="markup" {...FADE} className="absolute inset-0">
            <MarkupBody />
          </motion.div>
        )}
        {activeKey === 'share' && (
          <motion.div key="share" {...FADE} className="absolute inset-0">
            <DashboardBody cards={[{ titleW: 80 }, { titleW: 88 }]} />
          </motion.div>
        )}
      </AnimatePresence>
    </BrowserChrome>
  );
}

// Shared Safari chrome: traffic lights + nav icons + a URL pill that
// cross-fades when the path changes. `overlay` swaps the lock glyph for a
// crop icon and paints the URL as a plain status string (capture step).
function BrowserChrome({
  url,
  overlay = false,
  children,
}: {
  url: string;
  overlay?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex aspect-[11/8] w-full max-w-[440px] flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-black/10">
      <div className="flex shrink-0 items-center gap-3 border-b border-black/[0.06] bg-neutral-50 px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-black/10" />
          <span className="size-3 rounded-full bg-black/10" />
        </div>
        <div className="flex items-center gap-0.5 text-neutral-500">
          <span className="flex size-6 items-center justify-center">
            <Icon name="chevron_left" size={16} />
          </span>
          <span className="flex size-6 items-center justify-center">
            <Icon name="chevron_right" size={16} />
          </span>
          <span className="flex size-6 items-center justify-center">
            <Icon name="refresh" size={14} />
          </span>
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2 truncate rounded-md bg-black/[0.04] px-3 py-1 font-mono text-[11px] text-neutral-600">
          <Icon
            name={overlay ? 'crop_free' : 'lock'}
            size={11}
            className="text-neutral-500"
          />
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={url}
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="min-w-0 truncate"
            >
              {overlay ? (
                <span className="text-neutral-500">{url}</span>
              ) : url.includes('/') ? (
                (() => {
                  const [host, ...rest] = url.split('/');
                  return (
                    <>
                      {host}
                      <span className="text-blue-600">/{rest.join('/')}</span>
                    </>
                  );
                })()
              ) : (
                url
              )}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
        {children}
      </div>
    </div>
  );
}

// Viewer body — what the share recipient sees: the recording on the left, an
// activity rail (reactions + comments) on the right.
function ViewerBody() {
  // prefers-reduced-motion: don't auto-run the looping demo video — the
  // poster frame carries the mockup just fine.
  const reduceMotion = useReducedMotion();
  const REACTIONS = [
    { emoji: '👍', count: 12 },
    { emoji: '🎉', count: 7 },
    { emoji: '🔥', count: 3 },
    { emoji: '❤️', count: 2 },
  ];
  const COMMENTS = [
    { initial: 'A', tint: 'bg-black/15', nameW: 36, lineWs: [88, 62] },
    { initial: 'S', tint: 'bg-black/10', nameW: 28, lineWs: [70] },
    { initial: 'M', tint: 'bg-black/15', nameW: 44, lineWs: [82, 54] },
  ];
  return (
    <div className="flex h-full w-full">
      <div className="relative flex-1 overflow-hidden">
        <div className={`absolute inset-0 ${EDITOR_BACKGROUNDS[0]}`} />
        <div className="absolute inset-[8%] overflow-hidden rounded-lg bg-black shadow-xl ring-1 ring-black/10">
          <DemoStage />
        </div>
      </div>
      <aside className="flex w-[26%] shrink-0 flex-col gap-3 border-l border-black/[0.06] bg-neutral-50 p-3 sm:gap-3.5 sm:p-3.5">
        <div>
          <div className="mb-1.5 h-1.5 w-12 rounded-full bg-black/10" />
          <div className="flex flex-wrap gap-1">
            {REACTIONS.map((r) => (
              <span
                key={r.emoji}
                className="inline-flex items-center gap-0.5 rounded-full bg-black/[0.04] px-1.5 py-0.5 text-[10px] leading-none ring-1 ring-inset ring-black/[0.08]"
              >
                <span>{r.emoji}</span>
                <span className="font-mono text-[8px] tabular-nums text-neutral-500">
                  {r.count}
                </span>
              </span>
            ))}
            <span className="inline-flex size-[18px] items-center justify-center rounded-full bg-black/[0.03] ring-1 ring-inset ring-black/[0.08]">
              <span className="text-[9px] text-neutral-400">+</span>
            </span>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="h-1.5 w-14 rounded-full bg-black/10" />
          <div className="flex flex-col gap-2">
            {COMMENTS.map((c, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <div
                  className={`flex size-4 shrink-0 items-center justify-center rounded-full ${c.tint} text-[8px] font-semibold text-neutral-600`}
                >
                  {c.initial}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div
                    className="h-1.5 rounded-full bg-black/15"
                    style={{ width: `${c.nameW}%` }}
                  />
                  {c.lineWs.map((w, j) => (
                    <div
                      key={j}
                      className="h-1 rounded-full bg-black/[0.06]"
                      style={{ width: `${w}%` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-md bg-black/[0.03] px-1.5 py-1 ring-1 ring-inset ring-black/[0.06]">
          <div className="h-1.5 flex-1 rounded-full bg-black/[0.06]" />
          <div className="flex size-3.5 items-center justify-center rounded-full bg-blue-500">
            <Icon name="arrow_upward" size={8} className="text-white" />
          </div>
        </div>
      </aside>
    </div>
  );
}

const EDITOR_BACKGROUNDS = [
  'bg-gradient-to-br from-blue-500 to-indigo-500',
  'bg-gradient-to-br from-sky-500 to-emerald-400',
  'bg-gradient-to-br from-amber-400 to-rose-500',
  'bg-neutral-200',
];

const REACTION_POSITIONS = [
  { top: 16, left: 12 },
  { top: 16, left: 50 },
  { top: 16, left: 88 },
  { top: 84, left: 12 },
  { top: 84, left: 50 },
  { top: 84, left: 88 },
];

const FEEDBACK_EMOJI = ['👍', '🎉', '🔥', '❤️', '👏', '😮'];

// Feedback body — interactive share-viewer surface: the recording plays on the
// left while a reaction emoji floats over it; the right rail lets you pick the
// reaction emoji and toggle who can react/comment. Click a swatch to recolor
// the viewer's accent, a reaction tile to move the floating emoji, or a switch
// to flip the comment/reaction permissions. (Reinterpreted from Framely's
// background/camera/audio editor — same scaffolding, retargeted to CaptureFlow's
// "react and comment on the web" story so the mockup matches the copy.)
function FeedbackBody() {
  const m = useMessages();
  const em = m.collaboration.editorMockup;
  // prefers-reduced-motion: keep the looping demo video on its poster frame.
  const reduceMotion = useReducedMotion();
  const [bgIndex, setBgIndex] = useState(0);
  const [reactionPos, setReactionPos] = useState(5);
  const [emojiIndex, setEmojiIndex] = useState(0);
  const [commentsOn, setCommentsOn] = useState(true);
  const [reactionsOn, setReactionsOn] = useState(true);

  const reaction = REACTION_POSITIONS[reactionPos];
  const permissions: Array<{
    label: string;
    on: boolean;
    set: React.Dispatch<React.SetStateAction<boolean>>;
    icon: string;
    off: string;
  }> = [
    {
      label: em.micLabel,
      on: commentsOn,
      set: setCommentsOn,
      icon: 'chat_bubble',
      off: 'chat_bubble_outline',
    },
    {
      label: em.systemLabel,
      on: reactionsOn,
      set: setReactionsOn,
      icon: 'favorite',
      off: 'favorite_border',
    },
  ];

  return (
    <div className="flex h-full w-full">
      <div className="relative flex-1 overflow-hidden border-r border-black/[0.06]">
        <div
          className={`absolute inset-0 transition-colors duration-300 ${EDITOR_BACKGROUNDS[bgIndex]}`}
        />
        <div
          className={`absolute overflow-hidden bg-black transition-[inset] duration-300 ${
            bgIndex === 3
              ? 'inset-0'
              : 'inset-[8%] rounded-lg shadow-xl ring-1 ring-black/10'
          }`}
        >
          <DemoStage />
          <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1">
            {permissions.map((p) => (
              <span
                key={p.label}
                className={`flex size-4 items-center justify-center rounded-full ring-1 ring-inset transition-colors ${
                  p.on
                    ? 'bg-black/55 text-white ring-white/20'
                    : 'bg-black/40 text-white/45 ring-white/10'
                }`}
              >
                <Icon name={p.on ? p.icon : p.off} size={9} />
              </span>
            ))}
          </div>
          <div
            className="absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-base shadow-lg ring-2 ring-white transition-[top,left] duration-300 ease-out sm:size-9 sm:text-lg"
            style={{ top: `${reaction.top}%`, left: `${reaction.left}%` }}
          >
            {/* Floating reaction bubble — drops onto the recording where a
                viewer tapped, matching the real viewer's react-in-place feel. */}
            {FEEDBACK_EMOJI[emojiIndex]}
          </div>
        </div>
      </div>

      <div className="flex w-[28%] flex-col gap-3 bg-neutral-50 p-3 sm:gap-4 sm:p-4">
        <div>
          <div className="mb-2 h-2 w-16 rounded-full bg-black/10" />
          <div className="grid grid-cols-4 gap-1.5">
            {EDITOR_BACKGROUNDS.map((bg, i) => (
              <button
                key={i}
                type="button"
                aria-label={em.backgroundAria.replace('{n}', String(i + 1))}
                aria-pressed={bgIndex === i}
                onClick={() => setBgIndex(i)}
                className={`aspect-square cursor-pointer rounded-sm transition ${
                  i === 3 ? 'bg-black/[0.06]' : bg
                } ${
                  bgIndex === i
                    ? 'ring-2 ring-blue-500 ring-offset-1 ring-offset-neutral-50'
                    : i === 3
                      ? 'ring-1 ring-inset ring-black/15 hover:opacity-80'
                      : 'hover:opacity-80'
                }`}
              />
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 h-2 w-20 rounded-full bg-black/10" />
          <div className="grid grid-cols-3 gap-1.5">
            {REACTION_POSITIONS.map((_, i) => {
              const colAlign = [
                'justify-start',
                'justify-center',
                'justify-end',
              ][i % 3];
              const rowAlign = i < 3 ? 'items-start' : 'items-end';
              const selected = reactionPos === i;
              return (
                <button
                  key={i}
                  type="button"
                  aria-label={em.cameraPositionAria.replace(
                    '{n}',
                    String(i + 1),
                  )}
                  aria-pressed={selected}
                  onClick={() => {
                    setReactionPos(i);
                    setEmojiIndex(i);
                  }}
                  className={`flex aspect-[4/3] cursor-pointer rounded-sm p-1 ${colAlign} ${rowAlign} ${
                    selected
                      ? 'bg-blue-500/20 ring-1 ring-inset ring-blue-500'
                      : 'bg-black/[0.06] hover:bg-black/10'
                  }`}
                >
                  <span className="text-[9px] leading-none">
                    {FEEDBACK_EMOJI[i]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="space-y-2">
          {permissions.map((t) => (
            <div key={t.label} className="flex items-center justify-between">
              <div className="h-2 w-12 rounded-full bg-black/10" />
              <button
                type="button"
                role="switch"
                aria-checked={t.on}
                aria-label={em.audioToggleAria.replace('{label}', t.label)}
                onClick={() => t.set((v) => !v)}
                className={`flex h-3.5 w-7 cursor-pointer items-center rounded-full p-0.5 transition-colors ${
                  t.on ? 'bg-blue-500' : 'bg-black/20'
                }`}
              >
                <span
                  className={`size-2.5 rounded-full bg-white transition-transform ${
                    t.on ? 'translate-x-3' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Dashboard body — mirrors the app-web dashboard shape: left rail (workspace
// switcher + member stack + nav) and a card grid. Shared by the recordings
// dashboard and the screenshots dashboard (only the card title widths differ).
function DashboardBody({ cards }: { cards: Array<{ titleW: number }> }) {
  return (
    <div className="flex h-full w-full bg-white">
      <div className="hidden w-[18%] shrink-0 flex-col gap-2 border-r border-black/[0.06] bg-black/[0.02] p-2 sm:flex">
        <div className="rounded-md border border-black/[0.06] bg-black/[0.04] p-1.5">
          <div className="flex items-center gap-1.5">
            <div className="size-3 rounded-sm bg-black/15" />
            <div className="h-1.5 flex-1 rounded-full bg-black/10" />
            <div className="size-2 rounded-sm bg-black/10" />
          </div>
        </div>
        <div className="flex items-center gap-0.5 px-1">
          <div className="size-3 rounded-full bg-black/15 ring-2 ring-white" />
          <div className="-ml-1 size-3 rounded-full bg-black/10 ring-2 ring-white" />
          <div className="-ml-1 size-3 rounded-full border border-dashed border-black/30 bg-black/[0.04] ring-2 ring-white" />
        </div>
        <div className="mt-1 space-y-1">
          <div className="flex items-center gap-1.5 rounded-md bg-blue-500/15 px-1.5 py-1">
            <div className="size-2 rounded-sm bg-blue-500" />
            <div className="h-1.5 w-10 rounded-full bg-blue-500/80" />
          </div>
          <div className="flex items-center gap-1.5 px-1.5 py-1">
            <div className="size-2 rounded-sm bg-black/15" />
            <div className="h-1.5 w-8 rounded-full bg-black/10" />
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-1.5 w-12 rounded-full bg-black/10" />
            <div className="h-2.5 w-20 rounded-full bg-black/20" />
          </div>
          <div className="flex h-5 w-20 items-center gap-1 rounded-md bg-blue-500 px-1.5">
            <div className="size-1.5 rounded-sm bg-white/90" />
            <div className="h-1 flex-1 rounded-full bg-white/80" />
          </div>
        </div>

        <div className="mt-1 grid grid-cols-4 items-start gap-2">
          {cards.map((c, i) => (
            <div
              key={i}
              className="flex flex-col gap-1.5 overflow-hidden rounded-md border border-black/5 bg-black/[0.03] p-1.5 shadow-sm"
            >
              <div className="aspect-video rounded-sm bg-black/10" />
              <div className="flex items-center gap-1">
                <div className="size-2 rounded-full bg-black/20" />
                <div className="h-1 w-6 rounded-full bg-black/10" />
              </div>
              <div
                className="h-1.5 rounded-full bg-black/15"
                style={{ width: `${c.titleW}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Capture body — dim desktop with a lit selection rectangle + the floating
// CaptureFlow toolbar (Snap mode selected).
function CaptureBody() {
  const m = useMessages();
  const cm = m.collaboration.captureMockup;
  return (
    <div className="relative h-full w-full bg-neutral-100">
      <div className="absolute inset-0 bg-black/40" />

      <div className="absolute inset-0 flex items-center justify-center pb-[18%]">
        <div className="relative h-[80%] w-[52%] rounded-sm ring-1 ring-white">
          {[
            'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
            'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
            'top-0 right-0 translate-x-1/2 -translate-y-1/2',
            'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2',
            'top-1/2 right-0 translate-x-1/2 -translate-y-1/2',
            'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
            'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
            'bottom-0 right-0 translate-x-1/2 translate-y-1/2',
          ].map((cls) => (
            <span
              key={cls}
              className={`absolute size-1.5 rounded-sm bg-white ring-1 ring-neutral-950 ${cls}`}
            />
          ))}
          <div className="absolute -bottom-7 right-0 rounded-sm bg-black/80 px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-neutral-200">
            {cm.dimensions}
          </div>
        </div>
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-1 rounded-full border border-white/5 bg-neutral-900/95 p-1 shadow-2xl shadow-black/60 backdrop-blur-sm">
          {[
            { label: cm.toolbar.share, icon: 'link', active: false },
            {
              label: cm.toolbar.screenshot,
              icon: 'screenshot_keyboard',
              active: true,
            },
          ].map((mode) => (
            <div
              key={mode.icon}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-medium ${
                mode.active
                  ? 'bg-white text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.4)]'
                  : 'text-neutral-400'
              }`}
            >
              <Icon name={mode.icon} size={12} />
              {mode.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Markup body — Background tab selected; the chosen background paints inside
// the editor canvas (not the whole window) with the captured screenshot framed.
function MarkupBody() {
  return (
    <div className="relative h-full w-full bg-neutral-100">
      <div className="absolute inset-x-[12%] bottom-[6%] top-[16%] overflow-hidden rounded-md ring-1 ring-inset ring-black/10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-sky-500 to-blue-600" />

        <div className="absolute inset-x-[10%] bottom-[10%] top-[14%] flex overflow-hidden rounded-md bg-neutral-100 ring-1 ring-inset ring-white/20">
          <div className="flex w-[8%] flex-col items-center gap-2 bg-neutral-200/70 py-3">
            <div className="size-2 rounded-sm bg-neutral-400" />
            <div className="size-2 rounded-sm bg-neutral-300" />
          </div>
          <div className="flex-1 px-4 py-3 sm:px-6 sm:py-4">
            <div className="h-2.5 w-1/3 rounded-full bg-neutral-400" />
            <div className="mt-3 space-y-1.5">
              <div className="h-1.5 w-full rounded-full bg-neutral-300" />
              <div className="h-1.5 w-[92%] rounded-full bg-neutral-300" />
              <div className="h-1.5 w-[76%] rounded-full bg-neutral-300" />
            </div>
            <div className="mt-3 h-2 w-1/4 rounded-full bg-neutral-400" />
            <div className="mt-2 space-y-1.5">
              <div className="h-1.5 w-[88%] rounded-full bg-neutral-300" />
              <div className="h-1.5 w-[70%] rounded-full bg-neutral-300" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute left-1/2 top-2.5 flex -translate-x-1/2 items-center gap-1 rounded-md bg-white/90 p-1 shadow-sm ring-1 ring-inset ring-black/10 backdrop-blur-sm">
        {['wallpaper', 'north_east', 'rectangle', 'title', 'blur_on'].map(
          (icon, i) => (
            <span
              key={icon}
              className={`flex size-6 items-center justify-center rounded ${
                i === 0
                  ? 'bg-black/[0.06] text-neutral-900 ring-1 ring-inset ring-black/10'
                  : 'text-neutral-500'
              }`}
            >
              <Icon name={icon} size={14} />
            </span>
          ),
        )}
      </div>
    </div>
  );
}

const VIS_OPTIONS: Array<{
  key: VisibilityKey;
  label: string;
  icon: string;
  description: string;
}> = [
  {
    key: 'public',
    label: 'Public',
    icon: 'public',
    description: 'Anyone with the link can open this share',
  },
  {
    key: 'workspace',
    label: 'Workspace',
    icon: 'groups',
    description: 'Only teammates can open this share',
  },
  {
    key: 'private',
    label: 'Private',
    icon: 'lock',
    description: 'Only you can open this share',
  },
];

// Workspace mockup — workspace header, member roster, and a visibility picker
// driven by the accordion's active sub-feature (and vice-versa: clicking a
// pill swaps the active sub-feature too).
function WorkspaceCard({
  visibility,
  onVisibilityChange,
}: {
  visibility: VisibilityKey;
  onVisibilityChange: (key: VisibilityKey) => void;
}) {
  const m = useMessages();
  const wm = m.collaboration.workspaceMockup;
  // prefers-reduced-motion: skip the scroll-driven member-row slide-in.
  const reduceMotion = useReducedMotion();
  const activeDescription = wm.visibility[visibility]?.description ?? '';
  // Person names stay hardcoded; only the role labels are localized.
  const MEMBERS: Array<{
    initial: string;
    name: string;
    role: 'Admin' | 'Member';
    roleLabel: string;
    tint: string;
  }> = [
    {
      initial: 'C',
      name: 'Casey',
      role: 'Admin',
      roleLabel: wm.roleAdmin,
      tint: 'bg-blue-500/70',
    },
    {
      initial: 'A',
      name: 'Aiden',
      role: 'Member',
      roleLabel: wm.roleMember,
      tint: 'bg-black/10',
    },
  ];
  return (
    <div className="mx-auto flex aspect-[11/8] w-full max-w-[440px] flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-black/10">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-black/[0.04] px-5 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 font-heading text-sm font-bold tracking-tight text-white">
            Cf
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-foreground">
              {wm.teamName}
            </div>
            <div className="text-[11px] uppercase tracking-wider text-neutral-500">
              {wm.teamMeta.replace('{count}', String(MEMBERS.length))}
            </div>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex cursor-default items-center gap-1.5 rounded-full bg-blue-500 px-3 py-1.5 text-xs font-medium text-white"
        >
          <Icon name="add" size={14} />
          {wm.inviteButton}
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 py-3 sm:px-6">
        <div className="shrink-0 text-[11px] uppercase tracking-wider text-neutral-500">
          {wm.membersLabel}
        </div>
        <ul className="mt-3 flex flex-1 flex-col gap-3">
          {MEMBERS.map((member, i) => (
            <motion.li
              key={member.initial}
              {...(reduceMotion
                ? {}
                : {
                    initial: { opacity: 0, x: -8 },
                    whileInView: { opacity: 1, x: 0 },
                    viewport: { once: true, margin: '-80px' },
                    transition: {
                      duration: 0.45,
                      delay: i * 0.08,
                      ease: [0.22, 1, 0.36, 1] as const,
                    },
                  })}
              className="flex items-center gap-3"
            >
              <div
                className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${member.tint}`}
              >
                {member.initial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-foreground">{member.name}</div>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                  member.role === 'Admin'
                    ? 'bg-blue-500/15 text-blue-700 ring-1 ring-inset ring-blue-400/30'
                    : 'bg-black/[0.06] text-muted-foreground ring-1 ring-inset ring-black/10'
                }`}
              >
                {member.roleLabel}
              </span>
            </motion.li>
          ))}
        </ul>
      </div>

      <div className="shrink-0 border-t border-black/[0.04] bg-black/[0.02] px-5 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-neutral-500">
              {wm.linkVisibilityLabel}
            </div>
            <div className="mt-1 text-sm text-foreground">
              {activeDescription}
            </div>
          </div>
        </div>
        <div className="mt-2.5 grid grid-cols-3 gap-1.5 rounded-full bg-black/[0.04] p-1">
          {VIS_OPTIONS.map((v) => {
            const active = v.key === visibility;
            return (
              <button
                key={v.key}
                type="button"
                onClick={() => onVisibilityChange(v.key)}
                className={`relative flex cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? 'text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="workspace-visibility-pill"
                    className="absolute inset-0 rounded-full bg-neutral-900"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon name={v.icon} size={14} />
                  {wm.visibility[v.key].label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
