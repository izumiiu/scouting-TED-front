import type { IntakeRun } from "../../types/intake";
import { groupFollowUps, readingGaps } from "../../lib/followUpPresentation";

export function FollowUpPanel({ run, canEdit = true }: { run: IntakeRun; canEdit?: boolean }) {
  const groups = groupFollowUps(run.result?.missingInformation ?? []);
  const gaps = readingGaps(run);
  return (
    <section className="card ted-card ted-followups" aria-labelledby="followups-title">
      <div className="section-kicker">ข้อมูลที่ต้องตรวจต่อ</div>
      <h2 id="followups-title">ยังขาดข้อมูลด้านใด และต้องถามอะไรเพิ่ม</h2>
      <p className="muted">อิงข้อความที่ใช้วิเคราะห์รอบนี้ ข้อมูลที่ไม่พบอาจอยู่ในส่วนอื่นของต้นฉบับ และไม่ได้หมายถึงไม่ผ่านเกณฑ์</p>
      {groups.map((group) => (
        <section className="ted-followup-group" key={group.scope}>
          <h3>{group.label}</h3>
          <ul className="ted-question-list">
            {group.questions.map((item, i) => (
              <li key={i}>
                <h4>{item.topic ? `ด้านที่ต้องตรวจเพิ่ม: ${item.topic}` : "คำถามเพิ่มเติมจากผลวิเคราะห์เดิม"}</h4>
                <p><strong>ข้อมูลที่ต้องขอเพิ่ม: </strong>{item.question}</p>
                {item.impact ? <p className="ted-impact"><strong>ผลต่อการพิจารณา: </strong>{item.impact}</p>
                  : <p className="muted">ผลเดิมยังไม่ได้อธิบายผลต่อการพิจารณารายข้อ วิเคราะห์ใหม่เพื่อรับรายละเอียดตามรูปแบบล่าสุด</p>}
              </li>
            ))}
          </ul>
        </section>
      ))}
      {!groups.length && <p>ผลรอบนี้ไม่ได้ระบุคำถามเพิ่มเติม ไม่ใช่การยืนยันว่าข้อมูลครบหรือผ่านเกณฑ์ เจ้าหน้าที่ยังต้องตรวจต้นฉบับ</p>}
      {gaps.length > 0 && run.processingMode !== "DOCUMENT_CHECK" && (
        <details className="ted-reading-gaps" open>
          <summary>ข้อจำกัดจากการอ่านและเลือกข้อความ · {gaps.length} หัวข้อ</summary>
          <ul>{gaps.map((gap) => <li key={gap.topic}><strong>{gap.label}: </strong>{gap.status}</li>)}</ul>
          <p className="muted">ควรตรวจต้นฉบับก่อนขอข้อมูลซ้ำ หากมีข้อมูลอยู่แล้ว สามารถเติมข้อความในหมวดด้านล่างเพื่อวิเคราะห์ใหม่</p>
        </details>
      )}
      {canEdit && <a className="ted-link" href="#extracted-fields" onClick={(event) => {
        event.preventDefault();
        const target = document.getElementById("extracted-fields");
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
        target?.focus({ preventScroll: true });
      }}>ดูข้อมูลที่อ่านได้และเติมข้อมูลเพิ่มเติม ↓</a>}
    </section>
  );
}
