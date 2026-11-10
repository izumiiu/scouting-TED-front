import type { Catalog } from '../../types';
import { referenceLabels } from '../../lib/fieldPresentation';

export function EvidenceReferences({
  refs,
  catalog,
}: {
  refs: string[];
  catalog: Catalog;
}) {
  const labels = referenceLabels(refs, catalog);
  return labels.length ? (
    <small className="muted">ข้อมูลที่ใช้พิจารณา: {labels.join(' · ')}</small>
  ) : null;
}
