"use client";

import {
  Check,
  ChevronRight,
  Code2,
  Download,
  Scissors,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { useAppMessages } from "@/components/app-i18n-provider";
import { RECORDING_SITE_URL } from "@/lib/site";
import Link from "next/link";

type Props = {
  slug: string;
  editUrl: string;
};

// The owner's Tools tab in the viewer sidebar: the editor, the file and the embed.
export function EditPanel({ slug, editUrl }: Props) {
  const m = useAppMessages();
  const copy = m.viewer.editPanel;
  const [copied, setCopied] = useState(false);
  const embedCode = `<iframe src="${RECORDING_SITE_URL}/embed/${slug}" width="100%" style="aspect-ratio: 16 / 9; border: 0;" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;

  const copyEmbed = (): void => {
    void navigator.clipboard
      .writeText(embedCode)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => setCopied(false));
  };

  return (
    <div data-split="edit-panel" className="flex flex-col">
      <ActionRow
        href={editUrl}
        icon={Scissors}
        title={copy.editTitle}
        description={copy.editDescription}
      />
      <ActionRow
        href={`/api/r/download?slug=${encodeURIComponent(slug)}`}
        icon={Download}
        title={copy.downloadTitle}
        description={copy.downloadDescription}
      />
      <ActionRow
        onPress={copyEmbed}
        icon={copied ? Check : Code2}
        title={copied ? copy.embedCopied : copy.copyEmbed}
        description={copy.embedDescription}
      />
    </div>
  );
}

function ActionRow({
  href,
  onPress,
  icon: Icon,
  title,
  description,
}: {
  href?: string;
  onPress?: () => void;
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  const body = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-tint text-fg">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-fg">{title}</span>
        <span className="block text-xs leading-snug text-fg-muted">
          {description}
        </span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-fg-subtle" />
    </>
  );
  const className =
    "flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-tint";
  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onPress} className={className}>
      {body}
    </button>
  );
}
