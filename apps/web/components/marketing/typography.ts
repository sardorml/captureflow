"use client";

import { Typography } from "antd";

// antd's compound components live as static properties on the Typography client
// reference, which read as `undefined` when accessed from a Server Component.
// Re-exporting each as a top-level export of this client module turns it into
// its own client reference, so server pages can render them directly.
export const Text = Typography.Text;
export const Title = Typography.Title;
export const Paragraph = Typography.Paragraph;
export const Link = Typography.Link;
