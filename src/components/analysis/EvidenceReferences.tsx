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
              document
                .getElementById(`source-${ref}`)
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
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
