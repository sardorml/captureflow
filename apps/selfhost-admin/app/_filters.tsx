"use client";

import { useRef } from "react";
import { Button, Input, Select } from "./_ui";

type Option = { value: string; label: string };

// A GET form: the URL carries the filters, so the page can be reloaded or shared.
export function Filters({
  search,
  placeholder,
  selects = [],
}: {
  search: string;
  placeholder: string;
  selects?: { name: string; value: string; options: Option[] }[];
}) {
  const form = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={form}
      method="get"
      className="flex flex-wrap gap-2"
      role="search"
    >
      <Input
        name="q"
        type="search"
        defaultValue={search}
        placeholder={placeholder}
        aria-label="Search"
        className="w-full max-w-xs"
      />
      {selects.map((select) => (
        <Select
          key={select.name}
          name={select.name}
          defaultValue={select.value}
          aria-label={select.name}
          onChange={() => form.current?.requestSubmit()}
        >
          {select.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      ))}
      <Button type="submit" variant="secondary">
        Search
      </Button>
    </form>
  );
}
