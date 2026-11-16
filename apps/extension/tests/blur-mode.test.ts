import { describe, expect, it } from "vitest";
import { blurTarget } from "@/lib/overlay/blur-mode";

type El = {
  tagName: string;
  parentElement: El | null;
  blurred?: boolean;
  own?: boolean;
  background?: boolean;
  box?: string;
  hidden?: El[];
};

const el = (tagName: string, parentElement: El | null, extra = {}): El => ({
  tagName,
  parentElement,
  ...extra,
});

const pick = (...stack: El[]) =>
  blurTarget(
    stack,
    (e) => e.blurred === true,
    (e) => e.own === true,
    (e) => e.background === true,
    (a, b) => a.box !== undefined && a.box === b.box,
    (e) => e.hidden ?? [],
  );

describe("blurTarget", () => {
  const html = el("HTML", null);
  const body = el("BODY", html);

  it("blurs the element under the pointer", () => {
    const card = el("DIV", body);
    const email = el("SPAN", card);
    expect(pick(email)).toBe(email);
  });

  it("returns the blurred ancestor, so a second click clears it", () => {
    const card = el("DIV", body, { blurred: true });
    const email = el("SPAN", card);
    expect(pick(email)).toBe(card);
  });

  it("never blurs the page root", () => {
    expect(pick(body)).toBeNull();
    expect(pick(html)).toBeNull();
  });

  it("ignores the extension's own elements", () => {
    const bar = el("DIV", body, { own: true });
    expect(pick(el("BUTTON", bar))).toBeNull();
  });

  it("returns nothing when there is no element", () => {
    expect(pick()).toBeNull();
  });

  it("reaches the image under an empty layer of the same size", () => {
    const card = el("DIV", body, { box: "card" });
    const image = el("IMG", card, { box: "photo" });
    const cover = el("DIV", card, { box: "photo" });
    expect(pick(cover, image, card, body, html)).toBe(image);
  });

  it("counts a background image as an image", () => {
    const frame = el("DIV", body, { box: "photo" });
    const photo = el("DIV", frame, { box: "photo", background: true });
    const cover = el("A", frame, { box: "photo" });
    expect(pick(cover, photo, frame, body)).toBe(frame);
  });

  it("takes the whole picture when a transparent copy covers it", () => {
    const card = el("DIV", body, { box: "card" });
    const frame = el("DIV", card, { box: "photo" });
    el("DIV", frame, { box: "photo", background: true });
    const copy = el("IMG", frame, { box: "photo" });
    expect(pick(copy, frame, card, body)).toBe(frame);
  });

  it("clears a blurred image even under a layer", () => {
    const frame = el("DIV", body, { box: "photo", blurred: true });
    const image = el("IMG", frame, { box: "photo" });
    const cover = el("DIV", frame, { box: "photo" });
    expect(pick(cover, image, frame)).toBe(frame);
  });

  it("blurs an avatar without touching the banner under it", () => {
    const header = el("DIV", body, { box: "header" });
    const banner = el("DIV", header, { box: "banner", background: true });
    const avatar = el("DIV", header, { box: "avatar" });
    const face = el("DIV", avatar, { box: "avatar", background: true });
    const link = el("A", avatar, { box: "avatar" });
    expect(pick(link, face, avatar, banner, header, body)).toBe(avatar);
  });

  it("leaves a blurred banner alone when the avatar over it is clicked", () => {
    const header = el("DIV", body, { box: "header" });
    const banner = el("DIV", header, { box: "banner", blurred: true });
    const avatar = el("DIV", header, { box: "avatar" });
    const link = el("A", avatar, { box: "avatar" });
    expect(pick(link, avatar, banner, header, body)).toBe(link);
  });

  it("finds a picture the pointer can't hit under a sibling layer", () => {
    const avatar = el("DIV", body, { box: "ring" });
    const circle = el("DIV", avatar, { box: "photo" });
    const face = el("DIV", circle, { box: "photo", background: true });
    const ring = el("A", avatar, { box: "ring" });
    avatar.hidden = [face];
    expect(pick(ring, avatar, body)).toBe(circle);
  });
});
