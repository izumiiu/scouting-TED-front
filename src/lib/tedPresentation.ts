import type { DevelopmentStageCode } from '../types/index.ts';

export const tedStageLabels: Record<DevelopmentStageCode, string> = {
  CONCEPT: 'แนวคิด',
  MOCKUP: 'แบบจำลอง / Mock-up',
  EARLY_EVIDENCE: 'ผลวิจัย / หลักฐานเริ่มต้น',
  WORKING_PROTOTYPE: 'ต้นแบบที่มีหลักฐานว่าทำงานได้',
  MARKET_PRODUCT: 'ผลิตภัณฑ์ที่ขายหรือให้บริการจริง',
  UNCLEAR: 'ระยะพัฒนายังไม่ชัดเจน',
};
