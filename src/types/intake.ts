import type { TedAssessment, TedCriteria } from "./index";
export interface User {
  id: string;
  name: string;
  email: string;
}
export const topics = [
  "problem",
  "solution",
  "technology",
  "market",
  "revenue",
  "team",
  "plan",
  "funding",
  "ip",
] as const;
export type Topic = (typeof topics)[number];
export const topicLabels: Record<Topic, string> = {
  problem: "ปัญหาและผู้ใช้",
  solution: "ผลิตภัณฑ์และคุณค่าที่เสนอ",
  technology: "เทคโนโลยีและต้นแบบ",
  market: "ตลาดและผลทดสอบกับผู้ใช้",
  revenue: "รูปแบบรายได้และลูกค้าที่จ่ายจริง",
  team: "ทีมและบทบาท",
  plan: "แผนพัฒนาและหมุดหมาย",
  funding: "เงินทุนและเงินสมทบ",
  ip: "สิทธิในเทคโนโลยีและทรัพย์สินทางปัญญา",
};
export interface SourceUnit {
  id: string;
  locator: string;
  text: string;
  kind: "document" | "officer";
  section?: string;
  context?: string;
  topics?: Topic[];
  claimType?: "reported" | "forecast" | "selection_unverified";
}
export interface FollowUp {
  scope: string;
  question: string;
  // Historical runs contain only scope and question.
  topic?: string;
  impact?: string;
}
export interface Result {
  summary: string;
  fields: { key: Topic; value: string | null; evidenceRefs: string[] }[];
  tedAssessment: TedAssessment;
  missingInformation: FollowUp[];
}
export interface IntakeRun {
  _id: string;
  revision: number;
  status: "queued" | "extracting" | "analyzing" | "succeeded" | "failed";
  availableAt: string;
  createdAt: string;
  finishedAt: string | null;
  provider: string;
  model: string;
  promptVersion: string;
  criteria: TedCriteria;
  sources: SourceUnit[];
  processingMode?: "AI" | "DOCUMENT_CHECK";
  extractorVersion?: string | null;
  documentAssessment?: DocumentAssessment | null;
  coverage: {
    selected: number;
    total: number;
    selectedChars: number;
    totalChars: number;
    topics?: {
      topic: Topic;
      label: string;
      available: number;
      selected: number;
    }[];
  } | null;
  result: Result | null;
  error: string | null;
}
export interface CaseItem {
  _id: string;
  title: string;
  fileName: string;
  revision: number;
  decisionVersion: number;
  activeAnalysisId: string | null;
  latestAnalysisId: string | null;
  createdAt: string;
}
export interface Detail {
  case: CaseItem & {
    permissionReference: string;
    overrides: Partial<Record<Topic, string>>;
    documentInfo: {
      warnings: string[];
      pageCount: number | null;
      units: number;
      extractorVersion: string;
      assessment?: DocumentAssessment | null;
    } | null;
  };
  runs: IntakeRun[];
  reviews: {
    _id: string;
    revision: number;
    analysisId: string;
    decisionVersion: number;
    destination: string | null;
    notes: string;
    reviewerName: string;
    createdAt: string;
  }[];
  events: {
    _id: string;
    actorName: string;
    action: string;
    createdAt: string;
  }[];
}
export const statusLabels: Record<IntakeRun["status"], string> = {
  queued: "รอคิววิเคราะห์",
  extracting: "กำลังอ่านข้อความ",
  analyzing: "กำลังวิเคราะห์ด้วย AI",
  succeeded: "วิเคราะห์แล้ว รอเจ้าหน้าที่ตรวจ",
  failed: "ประมวลผลไม่สำเร็จ",
};
export const dateLabel = (date: string) =>
  new Date(date).toLocaleString("th-TH");

export interface DocumentAssessment {
  templateProgram: "TED_IDEA" | "TED_POC" | "UNKNOWN";
  templateVersion: string | null;
  responseUnits: number;
  ignoredTemplateUnits: number;
  uncertainSelections: number;
  quality: "HAS_RESPONSES" | "NO_PROJECT_DATA";
  sectionCoverage: { topic: Topic; label: string; responseUnits: number }[];
}
