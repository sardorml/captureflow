'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Sparkle } from 'lucide-react';
import { Icon } from '@/components/ui/icon';
import { SectionHeader } from './section-header';
import { DemoStage } from './demo-stage';
import { useMessages } from './i18n-provider';

type ShareKey = 'editor' | 'viewer' | 'dashboard';
type SnapKey = 'markup' | 'capture' | 'share';
type VisibilityKey = 'public' | 'workspace' | 'private';

type Feature = {
  key: string;
  title: string;
  linkText: string;
  body: string;
};

type Category = {
  id: string; // anchor target — nav #share / #snap land here
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
        title: 'Edit recording',
        linkText: 'Recolor and choose who can react',
        body: '— polish your share on the web, no re-record.',
      },
      {
        key: 'viewer',
        title: 'Share, react and comment',
        linkText: 'Drop reactions and threaded comments',
        body: '— feedback lands right on the recording, no re-record.',
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
        key: 'capture',
        title: 'Region, window, or full screen',
        linkText: 'One shortcut, three ways to grab',
        body: '— drag a region, click a window, or take the whole display.',
      },
      {
        key: 'markup',
        title: 'Annotate before you share',
        linkText: 'Add arrows, text, or blur',
        body: 'over any capture — every annotation stays on the Snap.',
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

  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash.replace('#', '');
      const idx = CATEGORIES.findIndex((c) => c.id === hash);
      if (idx < 0) return;
      setActiveCat(idx);
      /*
       * The target row drifts upward as the previously-open row collapses (0.45s
       * animation), so follow it each frame instead of a single scroll that
       * would overshoot or read as a scroll-back.
       */
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
      <div className="mx-auto max-w-7xl px-5 sm:px-10">
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
              // Suppress the divider when the active card sits directly below,
              // else it paints across the card's rounded top edge.
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
  const [featureKey, setFeatureKey] = useState(cat.features[0].key);
  const panelId = `${cat.id}-panel`;

  const numberClass =
    'max-sm:hidden w-8 shrink-0 font-heading text-2xl font-semibold tabular-nums tracking-tight text-neutral-900 sm:w-9 sm:text-[26px]';
  const titleClass =
    'font-heading text-2xl font-semibold tracking-tight text-neutral-900 sm:text-[26px]';

  return (
    <div
      id={cat.id}
      className={`scroll-mt-28 overflow-hidden transition-colors duration-300 ${
        isActive ? 'rounded-[2rem] bg-blue-100' : ''
      }`}
    >
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
              <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-12">
                <div className="flex min-w-0 flex-col gap-y-10">
                  {/* Still a real disclosure toggle: the collapsed <button>
                      unmounts while open, so AT always finds one whose
                      aria-expanded reflects state. */}
                  <button
                    type="button"
                    onClick={onActivate}
                    aria-expanded={isActive}
                    aria-controls={panelId}
                    className="flex items-center gap-16 text-left sm:gap-60"
                  >
                    <span className={numberClass}>{cat.num}</span>
                    <span className={`max-sm:ms-6 ${titleClass}`}>{catTitle}</span>
                  </button>
                  <FeatureList
                    cat={cat}
                    featureKey={featureKey}
                    setFeatureKey={setFeatureKey}
                  />
                </div>

                <div className="w-full min-w-0 self-start">
                  <ScaledMockup>
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
                  </ScaledMockup>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
  const featureCopy = m.collaboration.categories[cat.kind].features as Record<
    string,
    { title: string; linkText: string; body: string }
  >;
  return (
    <ul className="flex flex-col gap-4 sm:ps-[15.75rem]">
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
              {/* Reserved gutter so titles stay aligned with or without the sparkle. */}
              <span
                className="flex w-4 shrink-0 justify-center"
                aria-hidden="true"
              >
                {on && (
                  <Sparkle
                    size={16}
                    fill="currentColor"
                    strokeWidth={0}
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

// Mockups are authored at one reference size and uniformly scaled to fit the
// column, so phone and desktop show the identical mockup. All three frames are
// 11:8, so one reference box fits them all.
const REF_WIDTH = 440;
const REF_HEIGHT = (REF_WIDTH * 8) / 11;

// Scales the child down to the measured column width (capped at 1). Pure-CSS
// scaling can't divide length-by-length, so the factor comes from a
// ResizeObserver; aspect-ratio reserves the height to avoid layout shift.
function ScaledMockup({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / REF_WIDTH));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full max-w-[440px] overflow-hidden"
      style={{ aspectRatio: '11 / 8' }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{
          width: REF_WIDTH,
          height: REF_HEIGHT,
          transform: `scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

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

function ViewerBody() {
  const reduceMotion = useReducedMotion();
  const [emojiIndex, setEmojiIndex] = useState(0);
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
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <div className={`absolute inset-0 ${EDITOR_BACKGROUNDS[0]}`} />
          <div className="absolute inset-[8%] overflow-hidden rounded-lg bg-black shadow-xl ring-1 ring-black/10">
            <DemoStage />
            <motion.div
              key={emojiIndex}
              initial={reduceMotion ? false : { scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              className="absolute bottom-[6%] right-[6%] flex size-9 items-center justify-center rounded-full bg-white text-lg shadow-lg ring-2 ring-white"
            >
              {FEEDBACK_EMOJI[emojiIndex]}
            </motion.div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-center gap-2 border-t border-black/[0.06] bg-neutral-50 px-3 py-2.5">
          {FEEDBACK_EMOJI.map((emoji, i) => {
            const selected = emojiIndex === i;
            return (
              <button
                key={emoji}
                type="button"
                aria-label={`React with ${emoji}`}
                aria-pressed={selected}
                onClick={() => setEmojiIndex(i)}
                className={`flex size-8 cursor-pointer items-center justify-center rounded-full text-sm transition ${
                  selected
                    ? 'bg-blue-500/20 ring-1 ring-inset ring-blue-500'
                    : 'bg-black/[0.04] hover:bg-black/10'
                }`}
              >
                <span className="leading-none">{emoji}</span>
              </button>
            );
          })}
        </div>
      </div>
      <aside className="flex w-[26%] shrink-0 flex-col gap-3.5 border-l border-black/[0.06] bg-neutral-50 p-3.5">
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

const FEEDBACK_EMOJI = ['👍', '🎉', '🔥', '❤️', '👏', '😮'];

function FeedbackBody() {
  const m = useMessages();
  const em = m.collaboration.editorMockup;
  const reduceMotion = useReducedMotion();
  const [bgIndex, setBgIndex] = useState(0);
  const [emojiIndex, setEmojiIndex] = useState(0);
  const [commentsOn, setCommentsOn] = useState(true);
  const [reactionsOn, setReactionsOn] = useState(true);

  const permissions: Array<{
    label: string;
    on: boolean;
    set: React.Dispatch<React.SetStateAction<boolean>>;
  }> = [
    { label: em.micLabel, on: commentsOn, set: setCommentsOn },
    { label: em.systemLabel, on: reactionsOn, set: setReactionsOn },
  ];

  return (
    <div className="flex h-full w-full">
      <div className="flex min-w-0 flex-1 flex-col border-r border-black/[0.06]">
        <div className="relative min-h-0 flex-1 overflow-hidden">
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
            <motion.div
              key={emojiIndex}
              initial={reduceMotion ? false : { scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              className="absolute bottom-[6%] right-[6%] flex size-9 items-center justify-center rounded-full bg-white text-lg shadow-lg ring-2 ring-white"
            >
              {FEEDBACK_EMOJI[emojiIndex]}
            </motion.div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-center gap-2 border-t border-black/[0.06] bg-neutral-50 px-3 py-2.5">
          {FEEDBACK_EMOJI.map((emoji, i) => {
            const selected = emojiIndex === i;
            return (
              <button
                key={emoji}
                type="button"
                aria-label={`React with ${emoji}`}
                aria-pressed={selected}
                onClick={() => setEmojiIndex(i)}
                className={`flex size-8 cursor-pointer items-center justify-center rounded-full text-sm transition ${
                  selected
                    ? 'bg-blue-500/20 ring-1 ring-inset ring-blue-500'
                    : 'bg-black/[0.04] hover:bg-black/10'
                }`}
              >
                <span className="leading-none">{emoji}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex w-[28%] flex-col gap-4 bg-neutral-50 p-4">
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

function DashboardBody({ cards }: { cards: Array<{ titleW: number }> }) {
  return (
    <div className="flex h-full w-full bg-white">
      <div className="flex w-[18%] shrink-0 flex-col gap-2 border-r border-black/[0.06] bg-black/[0.02] p-2">
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

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
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

function CaptureBody() {
  const m = useMessages();
  const cm = m.collaboration.captureMockup;
  return (
    <div
      className="relative h-full w-full overflow-hidden bg-neutral-800 bg-cover bg-center"
      style={{ backgroundImage: "url('/capture-wallpaper.webp')" }}
    >
      <div className="absolute inset-0 bg-black/40" />

      <div className="absolute inset-x-0 top-[7%] bottom-[24%] flex justify-center">
        <div className="relative h-full w-[58%]">
          <div className="absolute inset-0 flex flex-col overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-black/10">
            <div className="flex shrink-0 items-center gap-1.5 bg-neutral-100 px-3 py-2">
              <span className="size-2 rounded-full bg-[#ff5f57]" />
              <span className="size-2 rounded-full bg-[#febc2e]" />
              <span className="size-2 rounded-full bg-[#28c840]" />
              <div className="ml-2 h-2 w-20 rounded-full bg-black/10" />
            </div>
            <div className="flex min-h-0 flex-1 gap-3 p-4">
              <div className="flex w-1/4 flex-col gap-2">
                <div className="h-2 w-3/4 rounded-full bg-black/10" />
                <div className="h-2 w-1/2 rounded-full bg-black/[0.06]" />
                <div className="h-2 w-2/3 rounded-full bg-black/[0.06]" />
                <div className="h-2 w-1/2 rounded-full bg-black/[0.06]" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="h-3 w-1/2 rounded-full bg-black/15" />
                <div className="h-2 w-full rounded-full bg-black/[0.06]" />
                <div className="h-2 w-[88%] rounded-full bg-black/[0.06]" />
                <div className="mt-1 min-h-0 flex-1 rounded-md bg-gradient-to-br from-blue-400 to-indigo-500" />
              </div>
            </div>
          </div>

          <div className="absolute -inset-[4%] rounded-sm ring-[1.5px] ring-white">
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
                className={`absolute size-2 rounded-full bg-white shadow-sm ring-1 ring-black/20 ${cls}`}
              />
            ))}
            <div className="absolute -bottom-7 right-0 rounded-sm bg-black/80 px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-neutral-200">
              {cm.dimensions}
            </div>
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

function MarkupBody() {
  return (
    <div className="relative h-full w-full bg-neutral-100">
      <div className="absolute inset-0 flex items-center justify-center pt-[6%]">
        <div className="aspect-square h-[64%] overflow-hidden rounded-xl bg-gradient-to-br from-blue-400 via-sky-500 to-blue-600 p-[4%] shadow-lg ring-1 ring-inset ring-black/10">
          <div className="flex h-full w-full overflow-hidden rounded-md bg-neutral-100 ring-1 ring-inset ring-white/20">
            <div className="flex w-[10%] flex-col items-center gap-2 bg-neutral-200/70 py-3">
              <div className="size-2 rounded-sm bg-neutral-400" />
              <div className="size-2 rounded-sm bg-neutral-300" />
            </div>
            <div className="flex-1 px-4 py-4">
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

function WorkspaceCard({
  visibility,
  onVisibilityChange,
}: {
  visibility: VisibilityKey;
  onVisibilityChange: (key: VisibilityKey) => void;
}) {
  const m = useMessages();
  const wm = m.collaboration.workspaceMockup;
  const reduceMotion = useReducedMotion();
  const activeDescription = wm.visibility[visibility]?.description ?? '';
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
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-black/[0.04] px-6 py-3">
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

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-6 py-3">
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

      <div className="shrink-0 border-t border-black/[0.04] bg-black/[0.02] px-6 py-3">
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
