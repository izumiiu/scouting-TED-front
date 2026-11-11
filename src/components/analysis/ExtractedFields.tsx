import { useState, type SubmitEvent } from "react";
import type { Catalog } from "../../types";
import type { Detail, IntakeRun, Topic } from "../../types/intake";
import { topics, topicLabels } from "../../types/intake";
import { api, mutation, errorMessage } from "../../lib/api";
import { Feedback } from "../Feedback";
import { EvidenceReferences } from "./EvidenceReferences";
export function ExtractedFields({
  data,
  run,
  catalog,
  reload,
}: {
  data: Detail;
  run: IntakeRun;
  catalog: Catalog;
  reload: () => Promise<void>;
}) {
  const [values, setValues] = useState<Partial<Record<Topic, string>>>({
      ...data.case.overrides,
    }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const disabled = !!data.case.activeAnalysisId || busy;
  async function save(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api(
        `/cases/${data.case._id}/overrides`,
        mutation("PUT", { revision: data.case.revision, overrides: values }),
      );
      await reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="card ted-card" id="extracted-fields" tabIndex={-1}>
      <h2>ข้อมูลจากเอกสารและข้อมูลเพิ่มเติม</h2>
      <p>
        ตรวจเทียบต้นฉบับ แล้วเติมหรือแก้เฉพาะเรื่องที่จำเป็น
        ข้อความของเจ้าหน้าที่จะเก็บแยกจากเอกสาร เมื่อบันทึก
        ระบบจะวิเคราะห์ใหม่อัตโนมัติและรอการยืนยันใหม่
      </p>
      <form onSubmit={save}>
        <div className="ted-fields">
          {topics.map((topic) => {
            const field = run.result?.fields.find((f) => f.key === topic);
            return (
              <div key={topic} className={field?.value ? "ted-field-present" : "ted-field-unreported"}>
                <h3>{topicLabels[topic]}</h3>
                <span className="ted-data-status">{field?.value ? "มีข้อมูลที่สกัดได้ · ยังต้องตรวจต้นฉบับ" : "ยังไม่พบในข้อความที่วิเคราะห์"}</span>
                <p>{field?.value ?? "ยังไม่พบในข้อความที่วิเคราะห์"}</p>
                {field && (
                  <EvidenceReferences
                    refs={field.evidenceRefs}
                    catalog={catalog}
                  />
                )}
                <label>
                  ข้อมูลเพิ่มเติมโดยเจ้าหน้าที่: {topicLabels[topic]}
                  <textarea
                    maxLength={1200}
                    value={values[topic] ?? ""}
                    disabled={disabled}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [topic]: e.target.value }))
                    }
                  />
                </label>
              </div>
            );
          })}
        </div>
        <p className="muted">
          ข้อมูลเพิ่มเติมรวมไม่เกิน 4,000 ตัวอักษร ·
          เว้นว่างเพื่อลบบันทึกเพิ่มเติมของหัวข้อนั้น
        </p>
        <Feedback error={error} />
        <button className="button" disabled={disabled}>
          {busy ? "กำลังบันทึก…" : "บันทึกและวิเคราะห์ใหม่อัตโนมัติ"}
        </button>
      </form>
    </section>
  );
}
