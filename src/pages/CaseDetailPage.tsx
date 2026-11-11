import { useCallback, useEffect, useState } from "react";
import type { Catalog } from "../types";
import type { Detail } from "../types/intake";
import { dateLabel, statusLabels } from "../types/intake";
import { api, base, mutation, errorMessage } from "../lib/api";
import { Feedback } from "../components/Feedback";
import { TedAssessmentPanel } from "../components/analysis/TedAssessmentPanel";
import { SourcePanel } from "../components/analysis/SourcePanel";
import { ExtractedFields } from "../components/analysis/ExtractedFields";
import { ReviewPanel } from "../components/analysis/ReviewPanel";
const scopeLabels: Record<string, string> = {
  TED: "ข้อมูลร่วม TED IDEA / POC",
  TED_IDEA: "TED IDEA",
  TED_POC: "TED POC",
  TED_POC_FUNDING: "เงินสมทบ TED POC",
  DEVELOPMENT: "ระยะพัฒนาโครงการ",
};
const actions: Record<string, string> = {
  uploaded: "รับเอกสาร",
  updated_and_queued: "แก้ข้อมูลและเริ่มวิเคราะห์ใหม่",
  retry_requested: "เริ่มวิเคราะห์รอบใหม่",
  reviewed: "ยืนยันผลพิจารณา",
};
export function CaseDetailPage({
  id,
  catalog,
}: {
  id: string;
  catalog: Catalog;
}) {
  const [data, setData] = useState<Detail | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [historyId, setHistoryId] = useState("");
  const reload = useCallback(async () => {
    const result = await api<Detail>(`/cases/${id}`);
    setData(result);
    setError("");
  }, [id]);
  useEffect(() => {
    let live = true;
    const load = () => {
      api<Detail>(`/cases/${id}`)
        .then((v) => {
          if (live) {
            setData(v);
            setError("");
          }
        })
        .catch((e) => {
          if (live) setError(errorMessage(e));
        });
    };
    load();
    const timer = setInterval(load, 4000);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, [id]);
  async function retry() {
    if (!data) return;
    setBusy(true);
    setError("");
    setHistoryId("");
    try {
      await api(
        `/cases/${id}/retry`,
        mutation("POST", { revision: data.case.revision }),
      );
      await reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  if (!data)
    return (
      <>
        <Feedback error={error} />
        <p>กำลังโหลดโครงการ…</p>
      </>
    );
  const current =
    data.runs.find((r) => r._id === data.case.activeAnalysisId) ||
    data.runs.find((r) => r._id === data.case.latestAnalysisId) ||
    data.runs[0];
  const run = historyId
    ? (data.runs.find((r) => r._id === historyId) ?? current)
    : current;
  const historical = run ? run._id !== current?._id : false;
  const sourceCatalog = {
    ...catalog,
    fields: run?.sources.map((s) => ({ id: s.id, label: s.locator })) ?? [],
  };
  const confirmed = data.reviews.some(
    (r) =>
      r.analysisId === current?._id &&
      r.revision === data.case.revision &&
      r.decisionVersion === data.case.decisionVersion,
  );
  const currentCriteria =
    run?.criteria.version === catalog.tedCriteria.version &&
    run?.promptVersion === catalog.analysisVersion;
  const canReview =
    !historical &&
    !data.case.activeAnalysisId &&
    run?.status === "succeeded" &&
    run.processingMode !== "DOCUMENT_CHECK" &&
    run.revision === data.case.revision &&
    currentCriteria;
  return (
    <>
      <a href="#/">← กลับรายการโครงการ</a>
      <div className="page-heading">
        <div>
          <div className="section-kicker">
            TED PROJECT · รุ่นข้อมูล {data.case.revision}
          </div>
          <h1>{data.case.title}</h1>
          <p>
            {data.case.fileName} ·{" "}
            <a className="ted-link" href={`${base}/api/cases/${id}/file`}>
              ดาวน์โหลดต้นฉบับ
            </a>
          </p>
        </div>
        <button
          className="button"
          disabled={
            !!data.case.activeAnalysisId || busy || !catalog.aiConfigured
          }
          onClick={() => void retry()}
        >
          วิเคราะห์ใหม่ตามเกณฑ์ล่าสุด
        </button>
      </div>
      <Feedback error={error} />
      {current && (
        <p className="notice info" role="status">
          {confirmed
            ? "เจ้าหน้าที่ยืนยันผลพิจารณาแล้ว"
            : current.processingMode === "DOCUMENT_CHECK"
              ? "รอข้อมูลโครงการเพิ่มเติม · ยังไม่ได้เรียก AI"
              : statusLabels[current.status]}
          {current.status === "queued"
            ? ` · รอโควตา AI ถึงประมาณ ${dateLabel(current.availableAt)}`
            : ""}
          {current.error && ` · ${current.error}`}
        </p>
      )}
      <section className="card ted-card">
        <h2>ขอบเขตเอกสารและสิทธิ์</h2>
        <p>{data.case.permissionReference}</p>
        {data.case.documentInfo && (
          <>
            <p className="muted">
              {data.case.documentInfo.pageCount
                ? `${data.case.documentInfo.pageCount} หน้า · `
                : ""}
              {data.case.documentInfo.units} ส่วนข้อความ
            </p>
            {data.case.documentInfo.warnings.map((w, i) => (
              <p className="notice info" key={i}>
                {w}
              </p>
            ))}
          </>
        )}
        <label>
          รอบวิเคราะห์ (10 รอบล่าสุด)
          <select
            value={historyId}
            onChange={(e) => setHistoryId(e.target.value)}
          >
            <option value="">รอบปัจจุบัน</option>
            {data.runs.map((r) => (
              <option key={r._id} value={r._id}>
                {dateLabel(r.createdAt)} · รุ่น {r.revision} ·{" "}
                {r.processingMode === "DOCUMENT_CHECK"
                  ? "รอข้อมูล · ยังไม่ได้เรียก AI"
                  : statusLabels[r.status]}
              </option>
            ))}
          </select>
        </label>
      </section>
      {run && (
        <>
          {historical && (
            <p className="notice info">กำลังดูประวัติ ผลนี้ไม่ใช่รอบปัจจุบัน</p>
          )}
          {!currentCriteria && (
            <p className="notice info">
              ผลนี้อิงเกณฑ์หรือวิธีอ่านเอกสารรุ่นก่อน
              กรุณาวิเคราะห์ใหม่ก่อนยืนยัน
            </p>
          )}
          {run.error && historical && (
            <p className="notice error">{run.error}</p>
          )}
          {run.result && (
            <section className="card ted-card">
              <h2>
                {run.processingMode === "DOCUMENT_CHECK"
                  ? "ผลตรวจความพร้อมของเอกสาร · ยังไม่ได้เรียก AI"
                  : "สรุปผลวิเคราะห์เบื้องต้น"}
              </h2>
              <p>{run.result.summary}</p>
              <TedAssessmentPanel
                assessment={run.result.tedAssessment}
                localCheck={run.processingMode === "DOCUMENT_CHECK"}
                catalog={sourceCatalog}
              />
              <div className="missing-info">
                <h3>ข้อมูลที่ควรถามหรือตรวจเพิ่มเติม</h3>
                {Object.entries(scopeLabels).map(([scope, label]) => {
                  const items = run.result!.missingInformation.filter(
                    (m) => m.scope === scope,
                  );
                  return items.length ? (
                    <div key={scope}>
                      <h4>{label}</h4>
                      <ul>
                        {items.map((m, i) => (
                          <li key={i}>{m.question}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null;
                })}
                {!run.result.missingInformation.length && (
                  <p>
                    AI ไม่ได้ระบุคำถามเพิ่มเติม เจ้าหน้าที่ยังต้องตรวจต้นฉบับ
                  </p>
                )}
              </div>
            </section>
          )}
          {!historical && (
            <ExtractedFields
              key={`${data.case.revision}-${run._id}`}
              data={data}
              run={run}
              catalog={sourceCatalog}
              reload={reload}
            />
          )}{" "}
          {canReview && run.result && (
            <ReviewPanel
              key={`${run._id}-${data.case.decisionVersion}`}
              data={data}
              run={run}
              reload={reload}
            />
          )}{" "}
          {(!!run.sources.length || run.documentAssessment) && (
            <SourcePanel run={run} />
          )}
          <p className="muted">
            เกณฑ์ {run.criteria.version} · คำสั่ง AI {run.promptVersion} ·{" "}
            {run.processingMode === "DOCUMENT_CHECK"
              ? "ตรวจเอกสารในระบบ ไม่ได้เรียกผู้ให้บริการ AI"
              : `${run.provider} / ${run.model}`}{" "}
            · {dateLabel(run.createdAt)}
          </p>
        </>
      )}
      <section className="card ted-card">
        <h2>ประวัติผลพิจารณาของเจ้าหน้าที่</h2>
        {data.reviews.length ? (
          data.reviews.map((r) => (
            <article className="ted-source" key={r._id}>
              <strong>
                {r.destination?.replace("_", " ") ?? "รอข้อมูลเพิ่มเติม"} ·
                รุ่นข้อมูล {r.revision}
              </strong>
              <p>{r.notes}</p>
              <small>
                {r.reviewerName} · {dateLabel(r.createdAt)}
                {r.decisionVersion !== data.case.decisionVersion
                  ? " · ประวัติเดิม"
                  : ""}
              </small>
            </article>
          ))
        ) : (
          <p>ยังไม่ได้ยืนยันผล</p>
        )}
        <details>
          <summary>ประวัติการทำรายการ (30 รายการล่าสุด)</summary>
          <ul>
            {data.events.map((e) => (
              <li key={e._id}>
                {dateLabel(e.createdAt)} · {e.actorName} ·{" "}
                {actions[e.action] ?? "ทำรายการ"}
              </li>
            ))}
          </ul>
        </details>
      </section>
    </>
  );
}
