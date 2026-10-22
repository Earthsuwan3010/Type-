import * as XLSX from 'xlsx';
import { Person, PopulationType, HealthStatus } from '../types/survey';

export interface ColumnMapping {
  cidKey: string;
  nameKey: string;
  prefixKey: string;
  firstNameKey: string;
  lastNameKey: string;
  houseNoKey: string;
  villageNoKey: string;
  typeKey: string;
  phoneKey: string;
  relationKey: string;
  notesKey: string;
  healthKey: string;
  osmKey: string;
}

export function generateTemplateExcel(): void {
  const templateData = [
    {
      "เลขประจำตัวประชาชน (13 หลัก)": "3400100123456",
      "คำนำหน้า": "นาย",
      "ชื่อ": "สมชาย",
      "นามสกุล": "ใจมั่น",
      "บ้านเลขที่": "15",
      "หมู่ที่": 1,
      "อสม. ผู้รับผิดชอบ": "อสม. สมจิต ดวงแก้ว",
      "ความสัมพันธ์กับเจ้าบ้าน": "เจ้าบ้าน",
      "ประเภทประชากร (Type 1, 2 หรือ 3)": 1,
      "เบอร์โทรศัพท์": "0812345678",
      "สถานะสุขภาพ (ปกติ/เรื้อรัง/ติดบ้าน/ติดเตียง)": "ปกติ",
      "หมายเหตุ": "อยู่บ้านตลอด",
    },
    {
      "เลขประจำตัวประชาชน (13 หลัก)": "3400100123457",
      "คำนำหน้า": "นาง",
      "ชื่อ": "สมศรี",
      "นามสกุล": "ใจมั่น",
      "บ้านเลขที่": "15",
      "หมู่ที่": 1,
      "อสม. ผู้รับผิดชอบ": "อสม. สมจิต ดวงแก้ว",
      "ความสัมพันธ์กับเจ้าบ้าน": "คู่สมรส",
      "ประเภทประชากร (Type 1, 2 หรือ 3)": 1,
      "เบอร์โทรศัพท์": "0897654321",
      "สถานะสุขภาพ (ปกติ/เรื้อรัง/ติดบ้าน/ติดเตียง)": "เรื้อรัง",
      "หมายเหตุ": "เบาหวาน ความดัน",
    },
    {
      "เลขประจำตัวประชาชน (13 หลัก)": "3400100123458",
      "คำนำหน้า": "นาย",
      "ชื่อ": "อนุชา",
      "นามสกุล": "ใจมั่น",
      "บ้านเลขที่": "15",
      "หมู่ที่": 1,
      "อสม. ผู้รับผิดชอบ": "อสม. สมจิต ดวงแก้ว",
      "ความสัมพันธ์กับเจ้าบ้าน": "บุตร",
      "ประเภทประชากร (Type 1, 2 หรือ 3)": 2,
      "เบอร์โทรศัพท์": "",
      "สถานะสุขภาพ (ปกติ/เรื้อรัง/ติดบ้าน/ติดเตียง)": "ปกติ",
      "หมายเหตุ": "ไปทำงานโรงงานที่สมุทรปราการ",
    },
    {
      "เลขประจำตัวประชาชน (13 หลัก)": "3100500987654",
      "คำนำหน้า": "นาย",
      "ชื่อ": "วิรัตน์",
      "นามสกุล": "พูนผล",
      "บ้านเลขที่": "28/1",
      "หมู่ที่": 1,
      "อสม. ผู้รับผิดชอบ": "อสม. บุญมี ขันทอง",
      "ความสัมพันธ์กับเจ้าบ้าน": "ผู้เช่าอาศัย",
      "ประเภทประชากร (Type 1, 2 หรือ 3)": 3,
      "เบอร์โทรศัพท์": "0823344556",
      "สถานะสุขภาพ (ปกติ/เรื้อรัง/ติดบ้าน/ติดเตียง)": "ปกติ",
      "หมายเหตุ": "ประชากรแฝง ย้ายมาทำงานในพื้นที่เกิน 6 เดือน",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);

  // Set column widths
  ws['!cols'] = [
    { wch: 25 }, // cid
    { wch: 10 }, // prefix
    { wch: 16 }, // first name
    { wch: 16 }, // last name
    { wch: 12 }, // house no
    { wch: 8 },  // village
    { wch: 24 }, // assigned osm
    { wch: 22 }, // relation
    { wch: 30 }, // type
    { wch: 16 }, // phone
    { wch: 25 }, // health
    { wch: 30 }, // notes
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "รายชื่อสำรวจประชากร");

  // Instruction sheet
  const instructionData = [
    { "คำอธิบายรหัส Type ประชากร": "Type 1", "ความหมาย": "มีชื่ออยู่ในทะเบียนบ้านในเขต และตัวอยู่จริง" },
    { "คำอธิบายรหัส Type ประชากร": "Type 2", "ความหมาย": "มีชื่ออยู่ในทะเบียนบ้านในเขต แต่ตัวไม่อยู่จริง (ไปทำงาน/เรียนที่อื่น)" },
    { "คำอธิบายรหัส Type ประชากร": "Type 3", "ความหมาย": "ไม่มีชื่อในทะเบียนบ้านในเขต แต่ตัวมาอาศัยอยู่จริง (ประชากรแฝง เช่าอยู่ ย้ายมาทำงาน)" },
    { "คำอธิบายรหัส Type ประชากร": "Type 4", "ความหมาย": "บุคคลนอกเขตที่มารับบริการ" },
    { "คำอธิบายรหัส Type ประชากร": "คอลัมน์ อสม.", "ความหมาย": "ระบุชื่อ อสม. ที่รับผิดชอบหลังคาเรือนนั้นๆ เพื่อให้ อสม. ดูเฉพาะบ้านตัวเองได้" },
  ];
  const wsGuide = XLSX.utils.json_to_sheet(instructionData);
  XLSX.utils.book_append_sheet(wb, wsGuide, "คำอธิบาย Type");

  XLSX.writeFile(wb, "แบบฟอร์มสำรวจประชากร_รพสต_Template.xlsx");
}

export function exportSurveyResultsExcel(
  people: Person[], 
  hospitalName: string, 
  customSubtitle?: string
): void {
  const exportRows = people.map((p, idx) => {
    let typeName = `Type ${p.currentType}`;
    if (p.currentType === 1) typeName = "Type 1: มีชื่อและอยู่จริง";
    else if (p.currentType === 2) typeName = "Type 2: มีชื่อแต่ไม่อยู่จริง";
    else if (p.currentType === 3) typeName = "Type 3: ตัวอยู่จริงแต่ไม่มีชื่อ";
    else if (p.currentType === 4) typeName = "Type 4: คนนอกเขต";

    let healthLabel = "ปกติ";
    if (p.healthStatus === 'bedridden') healthLabel = "ผู้ป่วยติดเตียง";
    else if (p.healthStatus === 'homebound') healthLabel = "ผู้ป่วยติดบ้าน";
    else if (p.healthStatus === 'chronic') healthLabel = "โรคเรื้อรัง";
    else if (p.healthStatus === 'elderly') healthLabel = "ผู้สูงอายุ";
    else if (p.healthStatus === 'pregnant') healthLabel = "หญิงตั้งครรภ์";

    return {
      "ลำดับ": idx + 1,
      "บ้านเลขที่": p.houseNo || "-",
      "หมู่ที่": p.villageNo ? `หมู่ ${p.villageNo}` : "-",
      "ชื่อ - นามสกุล": `${p.prefix || ''}${p.firstName} ${p.lastName}`.trim(),
      "คำนำหน้า": p.prefix || "",
      "ชื่อ": p.firstName || "",
      "นามสกุล": p.lastName || "",
      "อสม. ผู้รับผิดชอบ": p.assignedOsm || "-",
      "เลขประจำตัวประชาชน": p.cid ? String(p.cid).trim() : "-",
      "ความสัมพันธ์": p.relationWithHead || "-",
      "สถานะ Type ปัจจุบัน": typeName,
      "รหัส Type": p.currentType,
      "Type เดิม": p.originalType ? `Type ${p.originalType}` : "-",
      "สถานะสุขภาพ": healthLabel,
      "สถานะการสำรวจ": p.isSurveyed ? "สำรวจแล้ว" : "รอดำเนินการ",
      "อสม. ผู้สำรวจ": p.surveyorName || "-",
      "วันที่สำรวจ": p.surveyedAt ? new Date(p.surveyedAt).toLocaleDateString('th-TH') : "-",
      "เบอร์โทรศัพท์": p.phone || "-",
      "สถานะการมีชีวิต": p.isDeceased ? "เสียชีวิตแล้ว" : "มีชีวิตอยู่",
      "หมายเหตุ": p.notes || "",
    };
  });

  const ws = XLSX.utils.json_to_sheet(exportRows);

  // Group summary by village
  const villageMap = new Map<number, {
    total: number;
    surveyed: number;
    type1: number;
    type2: number;
    type3: number;
    bedridden: number;
  }>();

  people.forEach(p => {
    const v = p.villageNo || 1;
    const current = villageMap.get(v) || { total: 0, surveyed: 0, type1: 0, type2: 0, type3: 0, bedridden: 0 };
    current.total += 1;
    if (p.isSurveyed) current.surveyed += 1;
    if (p.currentType === 1) current.type1 += 1;
    if (p.currentType === 2) current.type2 += 1;
    if (p.currentType === 3) current.type3 += 1;
    if (p.healthStatus === 'bedridden') current.bedridden += 1;
    villageMap.set(v, current);
  });

  const summaryRows = Array.from(villageMap.entries()).sort((a, b) => a[0] - b[0]).map(([villageNo, data]) => ({
    "หมู่ที่": `หมู่ ${villageNo}`,
    "ประชากรทั้งหมด": data.total,
    "สำรวจแล้ว (คน)": data.surveyed,
    "ร้อยละที่สำรวจ": data.total > 0 ? `${((data.surveyed / data.total) * 100).toFixed(1)}%` : '0%',
    "Type 1 (อยู่จริง)": data.type1,
    "Type 2 (ไม่อยู่จริง)": data.type2,
    "Type 3 (ประชากรแฝง)": data.type3,
    "ผู้ป่วยติดเตียง": data.bedridden,
  }));

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);

  // Group summary by assigned OSM
  const osmMap = new Map<string, {
    total: number;
    surveyed: number;
    houses: Set<string>;
    type1: number;
    type2: number;
    type3: number;
    bedridden: number;
  }>();

  people.forEach(p => {
    const osmName = (p.assignedOsm || "ไม่ระบุ อสม.").trim();
    const current = osmMap.get(osmName) || {
      total: 0,
      surveyed: 0,
      houses: new Set<string>(),
      type1: 0,
      type2: 0,
      type3: 0,
      bedridden: 0,
    };
    current.total += 1;
    current.houses.add(`${p.villageNo}-${p.houseNo}`);
    if (p.isSurveyed) current.surveyed += 1;
    if (p.currentType === 1) current.type1 += 1;
    if (p.currentType === 2) current.type2 += 1;
    if (p.currentType === 3) current.type3 += 1;
    if (p.healthStatus === 'bedridden') current.bedridden += 1;
    osmMap.set(osmName, current);
  });

  const osmSummaryRows = Array.from(osmMap.entries()).sort((a, b) => b[1].total - a[1].total).map(([name, data]) => ({
    "ชื่อ อสม. ผู้รับผิดชอบ": name,
    "จำนวนหลังคาเรือน (หลัง)": data.houses.size,
    "ประชากรทั้งหมด (คน)": data.total,
    "สำรวจแล้ว (คน)": data.surveyed,
    "คงเหลือ (คน)": data.total - data.surveyed,
    "ร้อยละความสำเร็จ": data.total > 0 ? `${((data.surveyed / data.total) * 100).toFixed(1)}%` : '0%',
    "Type 1 (อยู่จริง)": data.type1,
    "Type 2 (ไม่อยู่จริง)": data.type2,
    "Type 3 (ประชากรแฝง)": data.type3,
    "ผู้ป่วยติดเตียง": data.bedridden,
  }));

  const wsOsmSummary = XLSX.utils.json_to_sheet(osmSummaryRows);

  const wb = XLSX.utils.book_new();
  // Ensure ws has explicit column widths for beautiful presentation
  ws['!cols'] = [
    { wch: 8 },  // ลำดับ
    { wch: 12 }, // บ้านเลขที่
    { wch: 10 }, // หมู่ที่
    { wch: 24 }, // ชื่อ - นามสกุล
    { wch: 10 }, // คำนำหน้า
    { wch: 16 }, // ชื่อ
    { wch: 18 }, // นามสกุล
    { wch: 24 }, // อสม. ผู้รับผิดชอบ
    { wch: 20 }, // เลขบัตรประชาชน (CID)
    { wch: 16 }, // ความสัมพันธ์
    { wch: 26 }, // สถานะ Type ปัจจุบัน
    { wch: 10 }, // รหัส Type
    { wch: 12 }, // Type เดิม
    { wch: 16 }, // สถานะสุขภาพ
    { wch: 16 }, // สถานะการสำรวจ
    { wch: 22 }, // อสม. ผู้สำรวจ
    { wch: 14 }, // วันที่สำรวจ
    { wch: 16 }, // เบอร์โทรศัพท์
    { wch: 15 }, // สถานะการมีชีวิต
    { wch: 25 }, // หมายเหตุ
  ];

  wsOsmSummary['!cols'] = [
    { wch: 26 }, // ชื่อ อสม. ผู้รับผิดชอบ
    { wch: 22 }, // จำนวนหลังคาเรือน (หลัง)
    { wch: 20 }, // ประชากรทั้งหมด (คน)
    { wch: 16 }, // สำรวจแล้ว (คน)
    { wch: 16 }, // คงเหลือ (คน)
    { wch: 16 }, // ร้อยละความสำเร็จ
    { wch: 18 }, // Type 1 (อยู่จริง)
    { wch: 20 }, // Type 2 (ไม่อยู่จริง)
    { wch: 20 }, // Type 3 (ประชากรแฝง)
    { wch: 16 }, // ผู้ป่วยติดเตียง
  ];

  wsSummary['!cols'] = [
    { wch: 14 }, // หมู่ที่
    { wch: 18 }, // ประชากรทั้งหมด
    { wch: 16 }, // สำรวจแล้ว (คน)
    { wch: 16 }, // ร้อยละที่สำรวจ
    { wch: 18 }, // Type 1 (อยู่จริง)
    { wch: 20 }, // Type 2 (ไม่อยู่จริง)
    { wch: 20 }, // Type 3 (ประชากรแฝง)
    { wch: 16 }, // ผู้ป่วยติดเตียง
  ];

  // Append population data table FIRST so when opened in Excel, the user sees this page's data immediately!
  XLSX.utils.book_append_sheet(wb, ws, "ตารางข้อมูลประชากร");
  XLSX.utils.book_append_sheet(wb, wsOsmSummary, "สรุปผลงานราย_อสม");
  XLSX.utils.book_append_sheet(wb, wsSummary, "สรุปยอดรายหมู่บ้าน");

  const todayStr = new Date().toISOString().slice(0, 10);
  const cleanHospitalName = (hospitalName || 'รพ.สต.บ้านคลองเสาเหนือ').replace(/[/\\?%*:|"<>]/g, '_').trim();
  const cleanSubtitle = customSubtitle ? `_${customSubtitle.replace(/[/\\?%*:|"<>]/g, '_').trim()}` : '';
  XLSX.writeFile(wb, `ตารางข้อมูลประชากร_${cleanHospitalName}${cleanSubtitle}_${todayStr}.xlsx`);
}

export async function parseExcelFile(file: File): Promise<{
  headers: string[];
  rawRows: Record<string, unknown>[];
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: "" });

        if (rawJson.length === 0) {
          resolve({ headers: [], rawRows: [] });
          return;
        }

        const headers = Object.keys(rawJson[0]);
        resolve({ headers, rawRows: rawJson });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
}

export function autoDetectMapping(headers: string[]): ColumnMapping {
  const findMatch = (candidates: string[]) => {
    return headers.find(h => {
      const lower = h.toLowerCase().trim().replace(/[\s_-]+/g, '');
      return candidates.some(c => lower.includes(c.toLowerCase().replace(/[\s_-]+/g, '')));
    }) || "";
  };

  return {
    cidKey: findMatch(["เลขบัตร", "cid", "nationalid", "เลขประชาชน", "บัตรประชาชน", "idcard", "pid"]),
    nameKey: findMatch(["ชื่อสกุล", "ชื่อ-สกุล", "fullname", "ชื่อและนามสกุล"]),
    prefixKey: findMatch(["คำนำ", "คำนำหน้า", "prefix", "title"]),
    firstNameKey: findMatch(["ชื่อ", "firstname", "first_name", "fname"]),
    lastNameKey: findMatch(["นามสกุล", "lastname", "last_name", "lname"]),
    houseNoKey: findMatch(["บ้านเลขที่", "เลขที่บ้าน", "เลขที่", "houseno", "address", "house"]),
    villageNoKey: findMatch(["หมู่ที่", "หมู่", "villageno", "village", "moo"]),
    typeKey: findMatch(["type", "ประเภท", "ประเภทประชากร", "สถานะบุคคล", "typetext", "poptype"]),
    phoneKey: findMatch(["โทร", "เบอร์โทร", "มือถือ", "phone", "mobile", "tel"]),
    relationKey: findMatch(["ความสัมพันธ์", "เจ้าบ้าน", "relation", "status"]),
    notesKey: findMatch(["หมายเหตุ", "remark", "note", "notes"]),
    healthKey: findMatch(["สุขภาพ", "โรค", "health", "ความดัน", "ติดเตียง", "status"]),
    osmKey: findMatch(["อสม", "อสม.", "ผู้รับผิดชอบ", "ชื่ออสม", "ชื่อ อสม", "อสมรับผิดชอบ", "อสม_รับผิดชอบ", "อสม.ผู้รับผิดชอบ", "อสม. ผู้รับผิดชอบ", "ผู้รับผิดชอบ(อสม)", "ผู้รับผิดชอบ (อสม)", "osm", "volunteer", "caregiver", "vhv", "จนท.อสม"]),
  };
}

export function convertRawRowsToPeople(
  rawRows: Record<string, unknown>[],
  mapping: ColumnMapping,
  defaultVillage: number = 1
): Person[] {
  return rawRows.map((row, index) => {
    const cid = String(row[mapping.cidKey] || "").trim().replace(/[^0-9]/g, '');
    let prefix = String(row[mapping.prefixKey] || "").trim();
    let firstName = String(row[mapping.firstNameKey] || "").trim();
    let lastName = String(row[mapping.lastNameKey] || "").trim();

    // If there is a combined Name key (e.g. "นายสมชาย ใจดี" or "สมชาย ใจดี")
    if ((!firstName || firstName === "") && mapping.nameKey && row[mapping.nameKey]) {
      const full = String(row[mapping.nameKey]).trim();
      const parts = full.split(/\s+/);
      if (parts.length >= 2) {
        firstName = parts[0];
        lastName = parts.slice(1).join(" ");
      } else {
        firstName = full;
        lastName = "";
      }
    }

    // Auto extract prefix if attached to first name
    const commonPrefixes = ["นาย", "นางสาว", "นาง", "ด.ช.", "ด.ญ.", "เด็กชาย", "เด็กหญิง", "พระ", "สามเณร"];
    for (const p of commonPrefixes) {
      if (firstName.startsWith(p)) {
        if (!prefix) prefix = p;
        firstName = firstName.slice(p.length).trim();
        break;
      }
    }

    const houseNo = String(row[mapping.houseNoKey] || "1").trim();
    const rawVillage = String(row[mapping.villageNoKey] || defaultVillage).replace(/[^0-9]/g, '');
    const villageNo = parseInt(rawVillage, 10) || defaultVillage;

    // Parse Type
    let currentType: PopulationType = 1;
    const rawType = String(row[mapping.typeKey] || "").trim();
    if (rawType.includes('2')) currentType = 2;
    else if (rawType.includes('3')) currentType = 3;
    else if (rawType.includes('4')) currentType = 4;
    else if (rawType.includes('5')) currentType = 5;
    else if (rawType.includes('1')) currentType = 1;

    // Parse Health
    let healthStatus: HealthStatus = 'normal';
    const rawHealth = String(row[mapping.healthKey] || "").toLowerCase();
    if (rawHealth.includes('ติดเตียง') || rawHealth.includes('bedridden')) {
      healthStatus = 'bedridden';
    } else if (rawHealth.includes('ติดบ้าน') || rawHealth.includes('homebound')) {
      healthStatus = 'homebound';
    } else if (rawHealth.includes('เรื้อรัง') || rawHealth.includes('ความดัน') || rawHealth.includes('เบาหวาน') || rawHealth.includes('chronic')) {
      healthStatus = 'chronic';
    } else if (rawHealth.includes('สูงอายุ') || rawHealth.includes('elderly')) {
      healthStatus = 'elderly';
    } else if (rawHealth.includes('ครรภ์') || rawHealth.includes('pregnant')) {
      healthStatus = 'pregnant';
    }

    const phone = String(row[mapping.phoneKey] || "").trim();
    const notes = String(row[mapping.notesKey] || "").trim();
    const relationWithHead = String(row[mapping.relationKey] || "").trim();
    const assignedOsm = mapping.osmKey && row[mapping.osmKey] ? String(row[mapping.osmKey]).trim() : undefined;

    return {
      id: cid ? `cid-${cid}` : `row-${Date.now()}-${index}`,
      cid,
      prefix,
      firstName: firstName || `ประชากร ${index + 1}`,
      lastName,
      houseNo: houseNo || "-",
      villageNo,
      originalType: currentType,
      currentType,
      isSurveyed: false,
      phone,
      relationWithHead,
      healthStatus,
      assignedOsm,
      notes,
      gender: prefix === "นาง" || prefix === "นางสาว" || prefix === "ด.ญ." ? "female" : "male",
    };
  });
}
