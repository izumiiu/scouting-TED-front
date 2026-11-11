import { useRef, useState, type SubmitEvent } from "react";
import type { Detail, IntakeRun } from "../../types/intake";
import { api, mutation, errorMessage } from "../../lib/api";
import { Feedback } from "../Feedback";
export function ReviewPanel({
  data,
  run,
  reload,
}: {
  data: Detail;
  run: IntakeRun;
  reload: () => Promise<void>;
}) {
  const [destination, setDestination] = useState(""),
    [notes, setNotes] = useState(""),
    [checked, setChecked] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const key = useRef<string | null>(null);
  const review = data.reviews.find(
    (r) =>
      r.analysisId === run._id &&
      r.revision === data.case.revision &&
      r.decisionVersion === data.case.decisionVersion,
  );
  async function submit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    if (!key.current) key.current = crypto.randomUUID();
    try {
      await api(
        `/cases/${data.case._id}/reviews`,
        mutation(
          "POST",
          {
            analysisId: run._id,
            revision: data.case.revision,
            decisionVersion: data.case.decisionVersion,
            destination: destination === "DEFER" ? null : destination,
            notes,
            acknowledged: checked,
          },
          key.current,
        ),
      );
      await reload();
      setMessage("บันทึกผลตรวจของเจ้าหน้าที่แล้ว");
      key.current = null;
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="card ted-card">
      <h2>เจ้าหน้าที่ตรวจและยืนยันผล</h2>
      {review ? (
        <div className="notice info">
          <p>
            <strong>
              ผลที่ยืนยัน:{" "}
              {review.destination?.replace("_", " ") ?? "รอข้อมูลเพิ่มเติม"}
            </strong>
          </p>
          <p>{review.notes}</p>
          <small>
            โดย {review.reviewerName} ·
            สามารถเปิดรอบใหม่จากปุ่มวิเคราะห์ใหม่เมื่อมีข้อมูลหรือเกณฑ์เปลี่ยน
          </small>
        </div>
      ) : (
        <form onSubmit={submit}>
          <p>
            เจ้าหน้าที่เลือกต่างจาก AI ได้ โดยต้องบันทึกเหตุผล
            ผลนี้เป็นการพิจารณาเบื้องต้น ไม่ใช่การอนุมัติทุนหรือส่งแจ้ง PM
          </p>
          <label>
            ผลพิจารณา
            <select
              required
              value={destination}
              disabled={busy}
              onChange={(e) => {
                key.current = null;
                setDestination(e.target.value);
              }}
            >
              <option value="">เลือกผลพิจารณา</option>
              <option value="TED_IDEA">TED IDEA</option>
              <option value="TED_POC">TED POC</option>
              <option value="DEFER">รอข้อมูลเพิ่มเติม / ยังไม่จำแนก</option>
            </select>
          </label>
          <label>
            เหตุผลของเจ้าหน้าที่
            <textarea
              required
              maxLength={2000}
              disabled={busy}
              value={notes}
              onChange={(e) => {
                key.current = null;
                setNotes(e.target.value);
              }}
            />
          </label>
          <label className="ted-checkbox">
            <input
              type="checkbox"
              required
              checked={checked}
              disabled={busy}
              onChange={(e) => setChecked(e.target.checked)}
            />
            <span>
              ตรวจข้อมูลที่ AI ใช้เทียบกับเอกสารต้นฉบับ
              และรับทราบข้อจำกัดของผลวิเคราะห์แล้ว
            </span>
          </label>
          <button className="button primary" disabled={busy}>
            {busy ? "กำลังบันทึก…" : "ยืนยันผลพิจารณา"}
          </button>
        </form>
      )}
      <Feedback error={error} message={message} />
    </section>
  );
}
