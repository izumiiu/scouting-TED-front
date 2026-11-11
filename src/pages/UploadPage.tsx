import { useRef, useState } from "react";
import type { Catalog } from "../types";
import { api, errorMessage } from "../lib/api";
import { Feedback } from "../components/Feedback";
export function UploadPage({ catalog }: { catalog: Catalog }) {
  const [title, setTitle] = useState(""),
    [permission, setPermission] = useState(""),
    [allowed, setAllowed] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    fileRef = useRef<HTMLInputElement>(null);
  async function upload(file: File | undefined) {
    if (!file || busy) return;
    if (!title.trim() || !permission.trim() || !allowed) {
      setError("ระบุชื่อ ที่มาของสิทธิ์ และยืนยันการใช้เอกสารก่อน");
      return;
    }
    if (file.size > 20 * 1024 * 1024 || !/\.(pdf|docx)$/i.test(file.name)) {
      setError("เลือก PDF หรือ DOCX ขนาดไม่เกิน 20 MB");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = new FormData();
      data.set("title", title.trim());
      data.set("permissionReference", permission.trim());
      data.set("allowAi", "true");
      data.set("file", file);
      const result = await api<{ id: string }>("/cases", {
        method: "POST",
        body: data,
        headers: { "Idempotency-Key": crypto.randomUUID() },
      });
      window.location.hash = `/cases/${result.id}`;
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }
  const ready =
    !!title.trim() &&
    !!permission.trim() &&
    allowed &&
    catalog.aiConfigured &&
    !busy;
  return (
    <>
      <div className="section-kicker">DOCUMENT INTAKE</div>
      <h1>รับเอกสารโครงการ</h1>
      <p>
        กรอกข้อมูลด้านล่าง แล้วเลือกหรือวางไฟล์ ระบบจะอัปโหลด อ่านข้อความ
        และวิเคราะห์ต่อให้อัตโนมัติ
      </p>
      <section className="card ted-card">
        <label>
          ชื่อโครงการ
          <input
            maxLength={200}
            value={title}
            disabled={busy}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label>
          ที่มาของสิทธิ์ในการใช้เอกสารและส่งข้อมูลให้ Groq
          <textarea
            maxLength={500}
            value={permission}
            disabled={busy}
            onChange={(e) => setPermission(e.target.value)}
            placeholder="เช่น ผู้รับผิดชอบอนุญาตตามเอกสาร/อีเมลวันที่…"
          />
        </label>
        <label className="ted-checkbox">
          <input
            type="checkbox"
            checked={allowed}
            disabled={busy}
            onChange={(e) => setAllowed(e.target.checked)}
          />
          <span>
            ตรวจแล้วว่าได้รับอนุญาตให้ใช้เอกสารนี้และส่งข้อความบางส่วนไปวิเคราะห์ด้วย
            Groq
          </span>
        </label>
        {!catalog.aiConfigured && (
          <p className="notice error">
            ยังไม่ได้ตั้งค่า AI หรือ worker กรุณาให้ผู้ดูแลตั้งค่าก่อน
          </p>
        )}
        <div
          className={`ted-drop ${ready ? "ready" : ""}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (!ready) {
              setError("กรอกข้อมูลและยืนยันสิทธิ์ก่อนวางไฟล์");
              return;
            }
            if (e.dataTransfer.files.length !== 1) {
              setError("รับครั้งละหนึ่งไฟล์");
              return;
            }
            void upload(e.dataTransfer.files[0]);
          }}
        >
          <p>
            PDF ที่เลือกข้อความได้ หรือ DOCX · ครั้งละหนึ่งไฟล์ ไม่เกิน 20 MB
          </p>
          <p className="muted">
            PDF ไม่เกิน 100 หน้า · ยังไม่รองรับภาพสแกน/OCR ·
            เอกสารยาวจะใช้ข้อความที่คัดเลือกและแจ้งขอบเขตในผล
          </p>
          <input
            ref={fileRef}
            className="sr-only"
            type="file"
            accept=".pdf,.docx"
            disabled={!ready}
            onChange={(e) => void upload(e.target.files?.[0])}
          />
          <button
            type="button"
            className="button primary"
            disabled={!ready}
            onClick={() => fileRef.current?.click()}
          >
            {busy ? "กำลังอัปโหลด…" : "เลือกไฟล์เพื่อเริ่มอัตโนมัติ"}
          </button>
        </div>
        <Feedback
          error={error}
          message={busy ? "กำลังส่งเอกสาร โปรดรอจนเปิดหน้าโครงการ" : ""}
        />
      </section>
    </>
  );
}
