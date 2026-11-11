import type { FollowUp, IntakeRun } from "../types/intake";

export const scopeLabels: Record<string, string> = {
  TED: "ข้อมูลร่วม TED IDEA / POC",
  TED_IDEA: "TED IDEA",
  TED_POC: "TED POC",
  TED_POC_FUNDING: "เงินสมทบ TED POC · ตรวจแยกจากประเภท",
  DEVELOPMENT: "การพัฒนาโครงการ",
};

export function groupFollowUps(items: FollowUp[]) {
  const groups = new Map<string, FollowUp[]>();
  for (const item of items) {
    const key = scopeLabels[item.scope] ? item.scope : "OTHER";
    const group = groups.get(key) ?? [];
    if (!group.some((i) => i.question.trim() === item.question.trim())) group.push(item);
    groups.set(key, group);
  }
  return [...groups].map(([scope, questions]) => ({
    scope, label: scopeLabels[scope] ?? "ประเด็นเพิ่มเติมจากผลเดิม", questions,
  }));
}

// Coverage describes extraction/selection only, never completeness or eligibility.
export function readingGaps(run: Pick<IntakeRun, "coverage">) {
  return (run.coverage?.topics ?? []).filter((t) => t.selected === 0).map((t) => ({
    topic: t.topic,
    label: t.label,
    status: t.available > 0
      ? "พบข้อความในเอกสาร แต่ยังไม่ได้เลือกส่งวิเคราะห์ในรอบนี้"
      : "ยังไม่พบคำตอบที่ตัวอ่านไฟล์แยกได้ในหัวข้อนี้",
  }));
}
