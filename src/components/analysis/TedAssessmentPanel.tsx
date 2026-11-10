import type { Catalog, TedAssessment } from '../../types';
import { readableAnalysisText } from '../../lib/fieldPresentation';
import { EvidenceReferences } from './EvidenceReferences';
import { tedStageLabels } from '../../lib/tedPresentation';

export function TedAssessmentPanel({
  assessment,
  catalog,
}: {
  assessment: TedAssessment;
  catalog: Catalog;
}) {
  const label =
    assessment.classification === 'INSUFFICIENT_DATA'
      ? 'ข้อมูลยังไม่พอแยก TED IDEA / TED POC'
      : `เบื้องต้นเหมาะกับ ${catalog.programs.find((p) => p.code === assessment.classification)?.label ?? assessment.classification}`;
  return (
    <section className="ted-assessment" aria-label="การจำแนก TED เบื้องต้น">
      <h3>การจำแนก TED เบื้องต้น · ไม่มีการให้คะแนน</h3>
      <p className="notice info">
        <strong>{label}</strong>
      </p>
      {assessment.developmentStage && (
        <div>
          <h4>
            ระยะพัฒนาจากข้อมูลที่บันทึก:{' '}
            {tedStageLabels[assessment.developmentStage.stage]}
          </h4>
          <p>
            {readableAnalysisText(assessment.developmentStage.reason, catalog)}
          </p>
          <EvidenceReferences
            refs={assessment.developmentStage.evidenceRefs}
            catalog={catalog}
          />
        </div>
      )}
      <h4>เหตุผลจากข้อมูลและเกณฑ์</h4>
      <p>{readableAnalysisText(assessment.reason, catalog)}</p>
      <EvidenceReferences refs={assessment.evidenceRefs} catalog={catalog} />
      <h4>เมื่อเทียบกับอีกประเภท</h4>
      <p>{readableAnalysisText(assessment.alternativeReason, catalog)}</p>
      {assessment.fundingReadiness && (
        <section
          className="notice info"
          aria-label="เงื่อนไขเงินสมทบแยกจากการจำแนก"
        >
          <h4>
            เงินสมทบ POC อย่างน้อย 10% ·{' '}
            {assessment.fundingReadiness.status === 'NEEDS_VERIFICATION'
              ? 'รอตรวจยืนยัน'
              : 'ยังไม่ประเมินในผลนี้'}
          </h4>
          <p>
            {readableAnalysisText(assessment.fundingReadiness.reason, catalog)}
          </p>
          <EvidenceReferences
            refs={assessment.fundingReadiness.evidenceRefs}
            catalog={catalog}
          />
        </section>
      )}
      {assessment.uncertainties.length > 0 && (
        <div className="missing-info">
          <h4>ข้อจำกัดและประเด็นที่ยังต้องตรวจสอบ</h4>
          <ul>
            {assessment.uncertainties.map((item, i) => (
              <li key={i}>{readableAnalysisText(item, catalog)}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="muted">
        เจ้าหน้าที่ต้องตรวจข้อมูลและยืนยันผลอีกครั้ง
        ผลนี้ไม่ใช่การรับรองสิทธิ์หรืออนุมัติทุน
      </p>
    </section>
  );
}
