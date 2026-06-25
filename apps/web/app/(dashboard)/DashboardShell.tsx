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

  return (
    <Layout style={{ minHeight: "100vh" }} hasSider>
      <Sider
        width={240}
        breakpoint="md"
        collapsedWidth={0}
        style={{
          background: colorBgContainer,
          borderInlineEnd: `1px solid ${colorBorderSecondary}`,
          position: "sticky",
          insetBlockStart: 0,
          blockSize: "100vh",
          overflow: "auto",
        }}
      >
        {sidebar}
      </Sider>
      <Layout>
        <Header
          style={{
            position: "sticky",
            insetBlockStart: 0,
            zIndex: 30,
            display: "flex",
            alignItems: "center",
            paddingInline: 24,
            background: colorBgContainer,
            borderBlockEnd: `1px solid ${colorBorderSecondary}`,
          }}
        >
          {header}
        </Header>
        <Content>
          <div style={{ maxWidth: 1152, margin: "0 auto", padding: 32 }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
