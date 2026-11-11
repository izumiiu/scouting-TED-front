import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

// Uses Vite's TSX loader; no API, database, credentials or live AI calls.
const server = await createServer({ server: { middlewareMode: true }, appType: "custom" });
try {
  const { FollowUpPanel } = await server.ssrLoadModule("/src/components/analysis/FollowUpPanel.tsx");
  const { TedAssessmentPanel } = await server.ssrLoadModule("/src/components/analysis/TedAssessmentPanel.tsx");
  const { SourcePanel } = await server.ssrLoadModule("/src/components/analysis/SourcePanel.tsx");
  const { groupFollowUps, readingGaps } = await server.ssrLoadModule("/src/lib/followUpPresentation.ts");
  const question = {scope: "TED_POC", topic: "หลักฐานการทดสอบต้นแบบ", question: "มีรายงานทดสอบกับผู้ใช้จริงหรือไม่ และได้ผลอย่างไร?", impact: "ยังยืนยันการทำงานของต้นแบบและความพร้อมสำหรับ POC ไม่ได้"};
  const run = {
    processingMode: "AI",
    result: { missingInformation: [question] },
    coverage: {selected: 5, total: 12, selectedChars: 1000, totalChars: 4000, topics: [
      {topic: "technology", label: "เทคโนโลยีและต้นแบบ", selected: 2, available: 3},
      {topic: "revenue", label: "รายได้จริง", selected: 0, available: 2},
      {topic: "ip", label: "สิทธิในเทคโนโลยี", selected: 0, available: 0},
    ]},
    sources: [{ id: "B1", locator: "ย่อหน้า 12", text: "โครงการรายงานว่ามีต้นแบบ แต่ยังไม่แนบผลทดลอง", kind: "document" }],
  };
  const html = renderToStaticMarkup(h(FollowUpPanel, {run}));
  assert.ok(html.includes(question.topic) && html.includes(question.impact));
  assert.ok(html.includes("เงินสมทบ") === false);
  assert.ok(html.includes("พบข้อความในเอกสาร แต่ยังไม่ได้เลือกส่ง"));
  assert.ok(html.includes("ยังไม่พบคำตอบที่ตัวอ่านไฟล์แยกได้"));
  assert.equal(readingGaps(run).length, 2);
  assert.equal(groupFollowUps([question, question])[0].questions.length, 1);
  const old = renderToStaticMarkup(h(FollowUpPanel, { run: {...run, coverage: null, result: {missingInformation: [{scope: "UNKNOWN", question: "คำถามเก่า"}]}} }));
  assert.ok(old.includes("คำถามเก่า") && old.includes("ผลเดิมยังไม่ได้อธิบาย"));
  const empty = renderToStaticMarkup(h(FollowUpPanel, {run: {...run, result: {missingInformation: []}}}));
  assert.ok(empty.includes("ไม่ใช่การยืนยันว่าข้อมูลครบ"));
  const escaped = renderToStaticMarkup(h(FollowUpPanel, {run: {...run, result: {missingInformation: [{...question, question: "<script>alert(1)</script>"}]}}}));
  assert.ok(!escaped.includes("<script>"));
  const catalog = {programs: [{code: "TED_POC", label: "TED POC"}], fields: [{id: "B1", label: "ย่อหน้า 12"}]};
  const assessment = {classification: "TED_POC", reason: "มีต้นแบบเบื้องต้นตามข้อมูลที่ได้รับ แต่ยังต้องตรวจหลักฐานการทำงาน", alternativeReason: "มีการพัฒนาเกินแนวคิด จึงมีข้อมูลสนับสนุน POC มากกว่า IDEA", evidenceRefs: ["B1"], uncertainties: ["ยังไม่ได้ตรวจผลทดลองจริง"], developmentStage: {stage: "WORKING_PROTOTYPE", reason: "ผู้เสนอรายงานว่ามีต้นแบบ", evidenceRefs: ["B1"]}, fundingReadiness: {status: "NEEDS_VERIFICATION", reason: "ต้องยืนยันแหล่งเงินและฐานคำนวณก่อนรับรองเงินสมทบ", evidenceRefs: []}};
  const historical = renderToStaticMarkup(h(FollowUpPanel, {run, canEdit: false}));
  assert.ok(!historical.includes('href="#extracted-fields"'));
  const local = renderToStaticMarkup(h(FollowUpPanel, {run: {...run, processingMode: "DOCUMENT_CHECK"}}));
  assert.ok(!local.includes("ข้อจำกัดจากการอ่านและเลือกข้อความ"));
  const source = renderToStaticMarkup(h(SourcePanel, {run}));
  assert.ok(source.includes('id="source-B1"') && source.includes("<details"));
  if (process.env.TED_PREVIEW_PATH) {
    const css = ["src/index.css", "src/ted.css"].map(p => readFileSync(p, "utf8")).join("\n");
    writeFileSync(process.env.TED_PREVIEW_PATH, `<!doctype html><html lang="th"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>TED Result Preview</title><style>${css}</style><body><main class="ted-shell"><h1>ตัวอย่างโครงการ TED · ข้อมูลสมมติ</h1><section class="card ted-card ted-result-card"><h2>สรุปผลวิเคราะห์เบื้องต้น</h2><p>พัฒนาชุดตรวจสำหรับใช้ที่บ้าน มีต้นแบบเบื้องต้นและแผนทดสอบตลาด โดยยังต้องตรวจหลักฐานการทำงานจริง</p>${renderToStaticMarkup(h(TedAssessmentPanel, {assessment, catalog}))}</section>${html}${source}</main></body></html>`);
  }
  console.log("Analysis UI checks passed: detailed/legacy/empty results, reading coverage, deduplication, escaping and sources.");
} finally { await server.close(); }
