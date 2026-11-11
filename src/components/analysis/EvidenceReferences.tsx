import type { Catalog } from "../../types";
export function EvidenceReferences({
  refs,
  catalog,
}: {
  refs: string[];
  catalog: Catalog;
}) {
  return refs.length ? (
    <small className="muted ted-refs">
      หลักฐาน:{" "}
      {refs.map((ref, i) => (
        <span key={ref}>
          {i > 0 ? " · " : ""}
          <a
            href={`#source-${ref}`}
            onClick={(e) => {
              e.preventDefault();
              const target = document.getElementById(`source-${ref}`);
              for (let parent = target?.parentElement; parent; parent = parent.parentElement) {
                if (parent instanceof HTMLDetailsElement) parent.open = true;
              }
              target?.scrollIntoView({ behavior: "smooth", block: "center" });
              target?.focus({ preventScroll: true });
            }}
          >
            {catalog.fields.find((f) => f.id === ref)?.label ??
              "ข้อความอ้างอิง"}
          </a>
        </span>
      ))}
    </small>
  ) : null;
}
