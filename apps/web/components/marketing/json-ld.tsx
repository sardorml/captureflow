// Renders one or more schema.org JSON-LD blobs as <script type="application/
// ld+json"> tags. Server component — emits raw structured HTML, so it runs
// before hydration and adds no client JS. Replaces the hand-rolled inline
// <script dangerouslySetInnerHTML> blocks (see app/page.tsx) with one shared,
// typed helper used across the marketing pages.
export function JsonLd({
  data,
}: {
  data: object | object[];
}): React.JSX.Element {
  const blobs = Array.isArray(data) ? data : [data];
  return (
    <>
      {blobs.map((blob, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blob) }}
        />
      ))}
    </>
  );
}
