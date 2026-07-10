"use client";

import type { ReactNode } from "react";
import { Layout, theme } from "antd";

const { Sider, Header, Content } = Layout;

export function DashboardShell({
  sidebar,
  header,
  children,
}: {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
}) {
  const {
    token: { colorBgContainer, colorBorderSecondary },
  } = theme.useToken();

  // The shell owns scrolling (fixed-height layout, Content scrolls) instead of
  // sticky-in-document-scroll: modals scroll-lock <body>, which turns it into a
  // scroll container and un-sticks sticky children mid-scroll.
  return (
    <Layout style={{ height: "100vh" }} hasSider>
      <Sider
        width={240}
        breakpoint="md"
        collapsedWidth={0}
        style={{
          background: colorBgContainer,
          borderInlineEnd: `1px solid ${colorBorderSecondary}`,
          blockSize: "100vh",
          overflow: "hidden",
        }}
      >
        {sidebar}
      </Sider>
      <Layout style={{ minWidth: 0 }}>
        <Header
          style={{
            display: "flex",
            alignItems: "center",
            paddingInline: 24,
            background: colorBgContainer,
            borderBlockEnd: `1px solid ${colorBorderSecondary}`,
          }}
        >
          {header}
        </Header>
        <Content style={{ overflowY: "auto" }}>
          <div style={{ maxWidth: 1152, margin: "0 auto", padding: 32 }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
