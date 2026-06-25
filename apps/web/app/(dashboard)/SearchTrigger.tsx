"use client";

import { useEffect, useState } from "react";
import { Camera, Search, Video } from "lucide-react";
import { Empty, Input, List, Modal, Spin, Tag } from "antd";
import type { SearchHit } from "@/app/api/search/route";

export function SearchTrigger() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}`,
          {
            signal: ctrl.signal,
          },
        );
        const data = (await res.json()) as { hits: SearchHit[] };
        setResults(data.hits ?? []);
      } catch (err) {
        if ((err as { name?: string })?.name !== "AbortError") {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query, open]);

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery("");
      setResults([]);
      setLoading(false);
    }
  }, [open]);

  const trimmed = query.trim();

  return (
    <>
      <Input
        readOnly
        onClick={() => setOpen(true)}
        prefix={<Search size={16} />}
        suffix={<span style={{ fontSize: 11, opacity: 0.55 }}>⌘K</span>}
        placeholder="Search your shares and snaps"
        style={{ maxWidth: 576, cursor: "pointer" }}
      />
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={640}
        title="Search"
      >
        <Input
          autoFocus
          allowClear
          prefix={<Search size={16} />}
          placeholder="Search your shares and snaps"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div style={{ marginTop: 16, maxHeight: 384, overflowY: "auto" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 24 }}>
              <Spin />
            </div>
          ) : results.length === 0 ? (
            <Empty
              description={
                trimmed.length < 2
                  ? "Search your recordings and screenshots by title."
                  : "No matches"
              }
            />
          ) : (
            <List
              dataSource={results}
              renderItem={(hit) => (
                <List.Item style={{ paddingInline: 0 }}>
                  <a
                    href={hit.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      width: "100%",
                    }}
                  >
                    {hit.kind === "share" ? (
                      <Video size={16} />
                    ) : (
                      <Camera size={16} />
                    )}
                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {hit.title}
                    </span>
                    <Tag style={{ marginInlineEnd: 0 }}>{hit.kind}</Tag>
                  </a>
                </List.Item>
              )}
            />
          )}
        </div>
      </Modal>
    </>
  );
}
