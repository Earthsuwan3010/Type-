export type PopulationType = 1 | 2 | 3 | 4 | 5;

export type HealthStatus = 'normal' | 'chronic' | 'homebound' | 'bedridden' | 'elderly' | 'pregnant' | 'child';

export interface Person {
  id: string; // unique ID or CID
  cid: string; // 13-digit Thai national ID (or empty if unknown)
  prefix: string; // นาย, นาง, นางสาว, ด.ช., ด.ญ.
  firstName: string;
  lastName: string;
  houseNo: string; // บ้านเลขที่ เช่น 45, 12/1
  villageNo: number; // หมู่ที่ เช่น 1, 2, 3
  subdistrict?: string; // ตำบล
  district?: string; // อำเภอ
  province?: string; // จังหวัด
  birthDate?: string; // YYYY-MM-DD
  age?: number;
  gender: 'male' | 'female' | 'other';
  phone?: string;
  relationWithHead?: string; // เจ้าบ้าน, คู่สมรส, บุตร, บิดา/มารดา, ผู้อาศัย
  originalType?: PopulationType; // Type เดิมก่อนสำรวจ
  currentType: PopulationType; // Type ปัจจุบันที่สำรวจได้ (1, 2, 3...)
  isSurveyed: boolean; // สำรวจแล้วหรือยัง
  surveyedAt?: string; // วันเวลาที่สำรวจ
  surveyorName?: string; // ชื่อ อสม. ผู้สำรวจ
  assignedOsm?: string; // ชื่อ อสม. ผู้รับผิดชอบหลังคาเรือน/บุคคลนี้ (จากไฟล์ Excel)
  healthStatus: HealthStatus;
  notes?: string; // บันทึกเพิ่มเติม เช่น ไปทำงาน กทม., ย้ายมาทำงานโรงงาน
  isDeceased?: boolean; // เสียชีวิตแล้วหรือไม่
  latitude?: number;
  longitude?: number;
}

export interface VillageSummary {
  villageNo: number;
  villageName: string;
  totalPopulation: number;
  surveyedCount: number;
  type1Count: number;
  type2Count: number;
  type3Count: number;
  bedriddenCount: number;
  chronicCount: number;
}

export interface SurveyStats {
  total: number;
  surveyed: number;
  pending: number;
  type1: number;
  type2: number;
  type3: number;
  type4: number;
  type5: number;
  bedridden: number;
  completionPercent: number;
}
