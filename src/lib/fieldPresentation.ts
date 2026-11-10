import type { Catalog } from '../types/index.ts';
import { tedStageLabels } from './tedPresentation.ts';
type Fields = Pick<Catalog, 'fields'>;
export function fieldLabel(ref: string, catalog: Fields): string {
  return (
    catalog.fields.find((field) => field.id === ref)?.label ??
    'หลักฐานจากเอกสาร'
  );
}
export function referenceLabels(refs: string[], catalog: Fields): string[] {
  return [...new Set(refs.map((ref) => fieldLabel(ref, catalog)))];
}
export function readableAnalysisText(text: string, catalog: Fields): string {
  const names: Record<string, string> = {
    ...tedStageLabels,
    TED_IDEA: 'TED IDEA',
    TED_POC: 'TED POC',
    INSUFFICIENT_DATA: 'ข้อมูลยังไม่พอแยกประเภท',
    ...Object.fromEntries(
      catalog.fields.map((field) => [field.id, field.label]),
    ),
  };
  const keys = Object.keys(names)
    .sort((a, b) => b.length - a.length)
    .map((key) => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return text.replace(
    new RegExp(`(?<![A-Za-z0-9_])(?:${keys.join('|')})(?![A-Za-z0-9_])`, 'g'),
    (ref) => names[ref]!,
  );
}
