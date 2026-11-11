import { useEffect, useState } from "react";
import { api, errorMessage } from "../lib/api";
import type { CaseItem } from "../types/intake";
import { dateLabel } from "../types/intake";
import { Feedback } from "../components/Feedback";
export function CaseListPage() {
  const [items, setItems] = useState<CaseItem[] | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    api<{ cases: CaseItem[] }>("/cases")
      .then((data) => {
        if (live) setItems(data.cases);
      })
      .catch((e) => {
        if (live) setError(errorMessage(e));
      });
    return () => {
      live = false;
    };
  }, []);
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="section-kicker">PROJECTS</div>
          <h1>โครงการ TED</h1>
          <p>แสดง 100 รายการล่าสุด · ผล AI ต้องผ่านการตรวจของเจ้าหน้าที่</p>
        </div>
        <a className="button primary" href="#/new">
          + รับเอกสารใหม่
        </a>
      </div>
      <Feedback error={error} />
      <section className="card ted-card">
        {!items && !error ? (
          <p>กำลังโหลด…</p>
        ) : items?.length === 0 ? (
          <p>ยังไม่มีโครงการ เริ่มจากรับเอกสารใหม่</p>
        ) : (
          items?.map((c) => (
            <a className="ted-case-row" href={`#/cases/${c._id}`} key={c._id}>
              <div>
                <strong>{c.title}</strong>
                <p className="muted">
                  {c.fileName} · {dateLabel(c.createdAt)}
                </p>
              </div>
              <span>
                {c.activeAnalysisId
                  ? "กำลังประมวลผล…"
                  : c.latestAnalysisId
                    ? "เปิดผลและประวัติ"
                    : "รอประมวลผล"}{" "}
                →
              </span>
            </a>
          ))
        )}
      </section>
    </>
  );
}
