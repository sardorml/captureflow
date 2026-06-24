// Static placeholders for Phase 0 — camera/mic enumeration and capture land in
// Phase 2. Rendered disabled so the popup shows its intended shape.
export function DevicePickers() {
  return (
    <section className="cf-section cf-pickers">
      <div className="cf-picker">
        <span className="cf-picker-icon" aria-hidden>
          ◎
        </span>
        <select className="cf-select" disabled defaultValue="none">
          <option value="none">No camera</option>
        </select>
      </div>
      <div className="cf-picker">
        <span className="cf-picker-icon" aria-hidden>
          ⏺
        </span>
        <select className="cf-select" disabled defaultValue="none">
          <option value="none">No microphone</option>
        </select>
      </div>
    </section>
  );
}
