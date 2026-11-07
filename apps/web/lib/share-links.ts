export type SocialNetwork =
  | "x"
  | "linkedin"
  | "facebook"
  | "reddit"
  | "whatsapp"
  | "email";

export const SOCIAL_NETWORKS: readonly SocialNetwork[] = [
  "x",
  "linkedin",
  "facebook",
  "reddit",
  "whatsapp",
  "email",
];

const enc = encodeURIComponent;

const HOSTNAME = /\b(?:[a-z0-9-]+\.)+[a-z]{2,}\b/gi;

// A word joiner after each dot keeps a hostname in the text (a title like
// "figma.com rebuilt by agents") from becoming the post's first link, which
// X and WhatsApp would turn into the preview card instead of ours.
export function unlinkHostnames(text: string): string {
  return text.replace(HOSTNAME, (host) => host.replaceAll(".", ".\u2060"));
}

// LinkedIn and Facebook take only the link and build the post from its preview card.
export function socialShareUrl(
  network: SocialNetwork,
  link: { url: string; title: string; message: string },
): string {
  const { url, title } = link;
  const message = unlinkHostnames(link.message);
  switch (network) {
    case "x":
      return `https://x.com/intent/post?text=${enc(message)}&url=${enc(url)}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`;
    case "reddit":
      return `https://www.reddit.com/submit?url=${enc(url)}&title=${enc(title)}`;
    case "whatsapp":
      return `https://wa.me/?text=${enc(`${message} ${url}`)}`;
    case "email":
      return `mailto:?subject=${enc(title)}&body=${enc(`${message}\n\n${url}`)}`;
  }
}
