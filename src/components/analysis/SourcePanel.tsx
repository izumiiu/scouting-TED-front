import type { IntakeRun } from "../../types/intake";
export function SourcePanel({ run }: { run: IntakeRun }) {
  const d = run.documentAssessment;
  return (
    <section className="card ted-card">
      <h2>
        {run.processingMode === "DOCUMENT_CHECK"
          ? "การตรวจข้อมูลก่อนส่ง AI"
          : "ข้อความที่ส่งให้ AI วิเคราะห์"}
      </h2>
      {d && (
        <>
          <p>
            <strong>
              แบบฟอร์มที่ตรวจพบ:{" "}
              {d.templateProgram === "UNKNOWN"
                ? "ยังระบุแบบฟอร์มไม่ได้"
                : d.templateProgram.replace("_", " ")}
            </strong>{" "}
            · เป็นชนิดเอกสาร ไม่ใช่ผลแนะนำโครงการ
          </p>
          <p className="muted">
            แยกข้อความต้นแบบ/คำแนะนำออก {d.ignoredTemplateUnits} ส่วน ·
            คำตอบที่อ่านได้ {d.responseUnits} ส่วน
          </p>
          {d.quality === "NO_PROJECT_DATA" && (
            <p className="notice info">
              ยังแยกคำตอบโครงการออกจากต้นแบบไม่ได้
              กรุณาใช้ไฟล์ที่กรอกแล้วหรือเติมข้อมูลโดยเจ้าหน้าที่
            </p>
          )}
        </>
      )}
      {run.coverage && run.processingMode !== "DOCUMENT_CHECK" && (
        <>
          <p className="notice info">
            ใช้คำตอบเอกสาร {run.coverage.selected} จาก {run.coverage.total} ส่วน
            ({run.coverage.selectedChars.toLocaleString()} จาก{" "}
            {run.coverage.totalChars.toLocaleString()} ตัวอักษร)
            ร่วมกับบันทึกเจ้าหน้าที่{" "}
            {run.coverage.selected < run.coverage.total &&
              "· ยังไม่ได้ส่งคำตอบทั้งหมดให้ AI กรุณาตรวจต้นฉบับ"}
          </p>
          {run.coverage.topics && (
            <div className="ted-coverage">
              <h3>ความครอบคลุมรายหัวข้อ</h3>
              <ul>
                {run.coverage.topics.map((t) => (
                  <li key={t.topic}>
                    <strong>{t.label}:</strong>{" "}
                    {t.selected
                      ? `มีข้อความที่ส่งวิเคราะห์ ${t.selected} ส่วน`
                      : t.available
                        ? "พบคำตอบแต่ยังไม่ได้เลือกส่งในรอบนี้"
                        : "ยังไม่พบคำตอบที่อ่านได้ในหัวข้อนี้"}
                  </li>
                ))}
              </ul>
              <p className="muted">
                จำนวนส่วนสะท้อนการอ่านข้อความ
                ไม่ใช่คะแนนความพร้อมหรือความถูกต้องของข้อมูล
              </p>
            </div>
          )}
        </>
      )}
      <p className="muted">
        อ้างอิงแสดงข้อความที่ใช้ประกอบเหตุผล
        ข้อความจากผู้สมัครและช่องเลือกยังต้องตรวจหลักฐานจริง
      </p>
      <details className="ted-source-list">
        <summary>เปิดข้อความอ้างอิงที่ใช้วิเคราะห์ · {run.sources.length} ส่วน</summary>
        {run.sources.map((s) => (
          <article className="ted-source" id={`source-${s.id}`} key={s.id} tabIndex={-1}>
            <strong>
              {s.locator}
              {s.kind === "officer" ? " · บันทึกเจ้าหน้าที่" : ""}
            </strong>
            {s.section && <p className="muted">{s.section}</p>}
            {s.context && <p className="muted">{s.context}</p>}
            {s.claimType === "forecast" && (
              <small>ข้อมูลแผน/ประมาณการ ไม่ใช่ผลดำเนินงานจริง</small>
            )}
            {s.claimType === "selection_unverified" && (
              <small>ค่าหรือช่องเลือกที่รายงาน ยังไม่ได้ตรวจยืนยัน</small>
            )}
            <p>{s.text}</p>
          </article>
        ))}
      </details>
    </section>
  );
}
