import React, { useState, useMemo } from 'react';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  FileSpreadsheet, 
  Download, 
  RefreshCw, 
  Heart, 
  Building2, 
  Edit2, 
  Save, 
  Trash2,
  Upload,
  UserCheck,
  Check,
  ClipboardCheck
} from 'lucide-react';
import { Person } from '../types/survey';
import { exportSurveyResultsExcel, generateTemplateExcel } from '../utils/excelUtils';

interface StaffDashboardViewProps {
  people: Person[];
  hospitalName: string;
  onUpdateHospitalName: (name: string) => void;
  onClearData: () => void;
  onLoadDemoData?: () => void;
  onOpenImport: () => void;
  onOpenGuide: () => void;
  onSelectOsmForSurvey?: (osmName: string) => void;
}

export const StaffDashboardView: React.FC<StaffDashboardViewProps> = ({
  people,
  hospitalName,
  onUpdateHospitalName,
  onClearData,
  onLoadDemoData,
  onOpenImport,
  onOpenGuide,
  onSelectOsmForSurvey,
}) => {
  const [isEditingHospital, setIsEditingHospital] = useState<boolean>(false);
  const [tempHospitalName, setTempHospitalName] = useState<string>(hospitalName);
  const [tableTab, setTableTab] = useState<'osm' | 'village'>('osm');

  // Compute Overall Stats
  const total = people.length;
  const surveyed = people.filter(p => p.isSurveyed).length;
  const pending = total - surveyed;
  const type1 = people.filter(p => p.currentType === 1).length;
  const type2 = people.filter(p => p.currentType === 2).length;
  const type3 = people.filter(p => p.currentType === 3).length;
  const bedridden = people.filter(p => p.healthStatus === 'bedridden').length;
  const chronic = people.filter(p => p.healthStatus === 'chronic').length;
  const elderly = people.filter(p => p.healthStatus === 'elderly' || (p.age && p.age >= 60)).length;
  const completionPercent = total > 0 ? Math.round((surveyed / total) * 100) : 0;

  // Dynamic Village summary based on actual imported people
  const villageNumbers = useMemo(() => {
    const nums = Array.from(new Set(people.map(p => p.villageNo)))
      .filter(v => typeof v === 'number' && !isNaN(v))
      .sort((a, b) => a - b);
    return nums.length > 0 ? nums : [1, 2, 3, 4];
  }, [people]);

  const villageStats = useMemo(() => {
    return villageNumbers.map(vNo => {
      const vPeople = people.filter(p => p.villageNo === vNo);
      const vTotal = vPeople.length;
      const vSurveyed = vPeople.filter(p => p.isSurveyed).length;
      const vT1 = vPeople.filter(p => p.currentType === 1).length;
      const vT2 = vPeople.filter(p => p.currentType === 2).length;
      const vT3 = vPeople.filter(p => p.currentType === 3).length;
      const vBedridden = vPeople.filter(p => p.healthStatus === 'bedridden').length;
      const vPct = vTotal > 0 ? Math.round((vSurveyed / vTotal) * 100) : 0;

      return {
        no: vNo,
        name: `หมู่ ${vNo}`,
        total: vTotal,
        surveyed: vSurveyed,
        pending: vTotal - vSurveyed,
        pct: vPct,
        type1: vT1,
        type2: vT2,
        type3: vT3,
        bedridden: vBedridden,
      };
    });
  }, [villageNumbers, people]);

  // Dynamic OSM Volunteer Summary
  const osmStats = useMemo(() => {
    const map = new Map<string, {
      total: number;
      surveyed: number;
      houses: Set<string>;
      type1: number;
      type2: number;
      type3: number;
      bedridden: number;
    }>();

    people.forEach(p => {
      const osmName = (p.assignedOsm || "ยังไม่ระบุ อสม.").trim();
      const current = map.get(osmName) || {
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
      map.set(osmName, current);
    });

    return Array.from(map.entries()).map(([name, data]) => {
      const pct = data.total > 0 ? Math.round((data.surveyed / data.total) * 100) : 0;
      return {
        name,
        total: data.total,
        housesCount: data.houses.size,
        surveyed: data.surveyed,
        pending: data.total - data.surveyed,
        pct,
        type1: data.type1,
        type2: data.type2,
        type3: data.type3,
        bedridden: data.bedridden,
      };
    }).sort((a, b) => b.total - a.total);
  }, [people]);

  const handleSaveHospitalName = () => {
    if (tempHospitalName.trim()) {
      onUpdateHospitalName(tempHospitalName.trim());
    }
    setIsEditingHospital(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner / Hospital Info */}
      <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-700" />
            {isEditingHospital ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tempHospitalName}
                  onChange={(e) => setTempHospitalName(e.target.value)}
                  className="px-2.5 py-1 text-base font-bold bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
                />
                <button
                  onClick={handleSaveHospitalName}
                  className="p-1.5 bg-purple-700 text-white rounded-lg hover:bg-purple-800 cursor-pointer shadow-xs shadow-purple-700/20"
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {hospitalName}
                </h1>
                <button
                  onClick={() => setIsEditingHospital(true)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                  title="แก้ไขชื่อหน่วยบริการ"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500">
            ระบบติดตามผลการสำรวจสถานะประชากร Type 1, 2, 3 ตามแฟ้ม PERSON และติดตามงานราย อสม.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => exportSurveyResultsExcel(people, hospitalName)}
            disabled={total === 0}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer ${
              total > 0
                ? 'text-white bg-purple-700 hover:bg-purple-800 shadow-purple-700/20'
                : 'text-slate-400 bg-slate-100 cursor-not-allowed'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>ส่งออกผลสำรวจ Excel (.xlsx)</span>
          </button>

          <button
            onClick={onOpenImport}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-purple-50/50 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-purple-700" />
            <span>นำเข้าไฟล์ Excel</span>
          </button>

          <button
            onClick={generateTemplateExcel}
            className="px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
            title="ดาวน์โหลดไฟล์ตัวอย่างเปล่า"
          >
            แม่แบบ Excel
          </button>
        </div>
      </div>

      {/* If Empty, display banner */}
      {total === 0 && (
        <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-6 text-center space-y-3">
          <FileSpreadsheet className="w-10 h-10 text-purple-700 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">ระบบพร้อมสำหรับการนำเข้าไฟล์ Excel ของคุณ</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            ขณะนี้ยังไม่มีข้อมูลประชากรในระบบ คุณสามารถคลิกปุ่ม &quot;นำเข้าไฟล์ Excel&quot; ด้านบนเพื่ออัปโหลดรายชื่อจาก JHCIS, HosXP หรือไฟล์ที่มีคอลัมน์ อสม. ผู้รับผิดชอบ
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <button
              onClick={onOpenImport}
              className="px-4 py-2 bg-purple-700 text-white rounded-xl text-xs font-semibold hover:bg-purple-800 transition-colors flex items-center gap-1.5 shadow-xs shadow-purple-700/20 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>นำเข้าไฟล์ Excel ตอนนี้</span>
            </button>
          </div>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Population */}
        <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">ประชากรทั้งหมดในฐาน</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">{total}</span>
            <span className="text-xs text-slate-500">คน</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            สำรวจแล้ว {surveyed} · รอ {pending}
          </div>
        </div>

        {/* Type 1 อยู่จริง */}
        <div className="bg-white rounded-2xl p-4.5 border border-purple-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-purple-900">Type 1: อยู่จริง</span>
            <span className="text-[11px] text-purple-600 font-medium">ตัวหาร HDC</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-purple-900 tabular-nums">{type1}</span>
            <span className="text-xs text-purple-700 font-semibold">
              ({total > 0 ? ((type1 / total) * 100).toFixed(1) : 0}%)
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            มีชื่อในบ้าน + กินนอนในเขตจริง
          </div>
        </div>

        {/* Type 2 ไม่อยู่จริง */}
        <div className="bg-white rounded-2xl p-4.5 border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-amber-800">Type 2: ไม่อยู่จริง</span>
            <span className="text-[11px] text-amber-600 font-medium">ตัดออกจากตัวหาร</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-amber-800 tabular-nums">{type2}</span>
            <span className="text-xs text-amber-600">
              ({total > 0 ? ((type2 / total) * 100).toFixed(1) : 0}%)
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            มีชื่อ แต่ไปทำงาน/เรียนที่อื่น
          </div>
        </div>

        {/* Type 3 ประชากรแฝง */}
        <div className="bg-white rounded-2xl p-4.5 border border-blue-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-blue-800">Type 3: ประชากรแฝง</span>
            <span className="text-[11px] text-blue-600 font-medium">ดูแลสุขภาพ</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-blue-800 tabular-nums">{type3}</span>
            <span className="text-xs text-blue-600">
              ({total > 0 ? ((type3 / total) * 100).toFixed(1) : 0}%)
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            ไม่มีชื่อ แต่ย้ายมาอยู่จริงในเขต
          </div>
        </div>
      </div>

      {/* Progress & Vulnerable Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Survey Completion Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">ความคืบหน้ารวมทุกหมู่บ้าน</span>
              <span className="text-xs font-bold text-purple-700 tabular-nums">{completionPercent}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-3">
              <div 
                className="h-full bg-purple-600 rounded-full transition-all duration-300"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              อสม. สำรวจเสร็จสิ้นแล้ว {surveyed} คน จากประชากรทั้งหมด {total} คน
              (คงเหลือ {pending} คนที่ต้องลงสำรวจเพิ่มเติม)
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-500">อัปเดตล่าสุด: วันนี้</span>
            <button
              onClick={onOpenGuide}
              className="text-purple-700 hover:underline font-medium cursor-pointer"
            >
              ดูแนวทางการจัดกลุ่ม Type &rarr;
            </button>
          </div>
        </div>

        {/* Vulnerable Groups */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs md:col-span-2">
          <h3 className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-500" />
            ข้อมูลกลุ่มเปราะบางและผู้มีปัญหาสุขภาพในพื้นที่ (จากการสำรวจ)
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-100">
              <span className="text-xs font-medium text-rose-800 block mb-1">ผู้ป่วยติดเตียง</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-rose-900 tabular-nums">{bedridden}</span>
                <span className="text-xs text-rose-700">คน</span>
              </div>
              <span className="text-[11px] text-rose-600 mt-1 block">ต้องลงเยี่ยมบ้านสม่ำเสมอ</span>
            </div>

            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100">
              <span className="text-xs font-medium text-blue-800 block mb-1">โรคเรื้อรัง (เบาหวาน/ความดัน)</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-blue-900 tabular-nums">{chronic}</span>
                <span className="text-xs text-blue-700">คน</span>
              </div>
              <span className="text-[11px] text-blue-600 mt-1 block">ต้องรับยาต่อเนื่อง</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-medium text-slate-700 block mb-1">ผู้สูงอายุ (60 ปีขึ้นไป)</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-slate-900 tabular-nums">{elderly}</span>
                <span className="text-xs text-slate-500">คน</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">เป้าหมายคัดกรอง ADL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Breakdown Section with Tabs (ราย อสม. vs รายหมู่บ้าน) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              ตารางติดตามความก้าวหน้าการสำรวจ
            </h3>
            <p className="text-xs text-slate-500">
              ติดตามผลการสำรวจแยกตาม อสม. ผู้รับผิดชอบ (จากไฟล์ Excel) หรือแยกตามหมู่บ้าน
            </p>
          </div>

          {/* Segmented Tab Buttons */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-medium">
            <button
              onClick={() => setTableTab('osm')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                tableTab === 'osm'
                  ? 'bg-white text-purple-950 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-purple-700" />
              <span>สรุปราย อสม. ({osmStats.length} ท่าน)</span>
            </button>
            <button
              onClick={() => setTableTab('village')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                tableTab === 'village'
                  ? 'bg-white text-purple-950 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-slate-600" />
              <span>สรุปรายหมู่บ้าน ({villageStats.length} หมู่)</span>
            </button>
          </div>
        </div>

        {/* TAB 1: OSM Volunteer Summary Table */}
        {tableTab === 'osm' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 text-xs">
                <tr>
                  <th className="py-3 px-4 font-semibold">อสม. ผู้รับผิดชอบ</th>
                  <th className="py-3 px-3 font-semibold text-center">หลังคาเรือน</th>
                  <th className="py-3 px-3 font-semibold text-center">ประชากร</th>
                  <th className="py-3 px-3 font-semibold text-center">สำรวจแล้ว</th>
                  <th className="py-3 px-3 font-semibold text-center">คงเหลือ</th>
                  <th className="py-3 px-4 font-semibold text-center">ความคืบหน้า</th>
                  <th className="py-3 px-3 font-semibold text-center text-purple-900">Type 1</th>
                  <th className="py-3 px-3 font-semibold text-center text-amber-800">Type 2</th>
                  <th className="py-3 px-3 font-semibold text-center text-blue-800">Type 3</th>
                  <th className="py-3 px-3 font-semibold text-center text-rose-800">ติดเตียง</th>
                  <th className="py-3 px-3 font-semibold text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {osmStats.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-slate-400">
                      ยังไม่มีข้อมูล อสม. (สามารถระบุได้ในไฟล์ Excel คอลัมน์ &quot;อสม. ผู้รับผิดชอบ&quot;)
                    </td>
                  </tr>
                ) : (
                  osmStats.map((o) => (
                    <tr key={o.name} className="hover:bg-purple-50/20 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-purple-700 shrink-0" />
                        <span>{o.name}</span>
                      </td>
                      <td className="py-3 px-3 text-center tabular-nums">{o.housesCount} หลัง</td>
                      <td className="py-3 px-3 text-center tabular-nums font-mono">{o.total}</td>
                      <td className="py-3 px-3 text-center tabular-nums font-semibold text-purple-700">{o.surveyed}</td>
                      <td className="py-3 px-3 text-center tabular-nums text-slate-500">{o.pending}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-16 sm:w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all bg-purple-600"
                              style={{ width: `${o.pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold tabular-nums text-slate-700 w-8 text-right">
                            {o.pct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center tabular-nums font-semibold text-purple-700">{o.type1}</td>
                      <td className="py-3 px-3 text-center tabular-nums font-semibold text-amber-700">{o.type2}</td>
                      <td className="py-3 px-3 text-center tabular-nums font-semibold text-blue-700">{o.type3}</td>
                      <td className="py-3 px-3 text-center tabular-nums text-rose-700 font-medium">
                        {o.bedridden > 0 ? o.bedridden : '-'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {onSelectOsmForSurvey && o.name !== 'ยังไม่ระบุ อสม.' && (
                            <button
                              type="button"
                              onClick={() => onSelectOsmForSurvey(o.name)}
                              className="px-2.5 py-1 text-xs bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg transition-colors flex items-center gap-1 font-medium cursor-pointer"
                              title={`เปิดดูแบบฟอร์มสำรวจของ ${o.name}`}
                            >
                              <ClipboardCheck className="w-3.5 h-3.5 text-purple-700" />
                              <span className="hidden sm:inline">เปิดฟอร์ม</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const osmPeople = people.filter(p => (p.assignedOsm || 'ยังไม่ระบุ อสม.').trim() === o.name);
                              exportSurveyResultsExcel(osmPeople, hospitalName, o.name);
                            }}
                            className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                            title={`ส่งออก Excel ผลสำรวจของ ${o.name}`}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: Village Breakdown Table */}
        {tableTab === 'village' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 text-xs">
                <tr>
                  <th className="py-3 px-4 font-semibold">หมู่บ้าน</th>
                  <th className="py-3 px-3 font-semibold text-center">ประชากร</th>
                  <th className="py-3 px-3 font-semibold text-center">สำรวจแล้ว</th>
                  <th className="py-3 px-4 font-semibold text-center">ความคืบหน้า</th>
                  <th className="py-3 px-3 font-semibold text-center text-purple-900">Type 1 (อยู่จริง)</th>
                  <th className="py-3 px-3 font-semibold text-center text-amber-800">Type 2 (ไม่อยู่)</th>
                  <th className="py-3 px-3 font-semibold text-center text-blue-800">Type 3 (แฝง)</th>
                  <th className="py-3 px-3 font-semibold text-center text-rose-800">ติดเตียง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {villageStats.map((v) => (
                  <tr key={v.no} className="hover:bg-purple-50/20 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      หมู่ {v.no}
                    </td>
                    <td className="py-3 px-3 text-center tabular-nums font-mono">{v.total}</td>
                    <td className="py-3 px-3 text-center tabular-nums font-semibold text-purple-700">{v.surveyed}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-20 sm:w-28 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-600 rounded-full"
                            style={{ width: `${v.pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold tabular-nums text-slate-700 w-8 text-right">
                          {v.pct}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center tabular-nums font-semibold text-purple-700">{v.type1}</td>
                    <td className="py-3 px-3 text-center tabular-nums font-semibold text-amber-700">{v.type2}</td>
                    <td className="py-3 px-3 text-center tabular-nums font-semibold text-blue-700">{v.type3}</td>
                    <td className="py-3 px-3 text-center tabular-nums text-rose-700 font-medium">
                      {v.bedridden > 0 ? v.bedridden : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Database Maintenance / Reset */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div>
          <span className="font-semibold text-slate-800 block">จัดการข้อมูลในระบบ:</span>
          <p className="text-slate-500 mt-0.5">คุณสามารถล้างข้อมูลทั้งหมดเพื่อให้ระบบว่างเปล่า พร้อมสำหรับนำเข้าไฟล์ Excel ชุดใหม่</p>
        </div>
        <div className="flex items-center gap-2">
          {total > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('คุณต้องการล้างข้อมูลทั้งหมดเพื่อรอนำเข้าไฟล์ Excel ใหม่ใช่หรือไม่?')) {
                  onClearData();
                }
              }}
              className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1.5 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ล้างข้อมูลทั้งหมด</span>
            </button>
          )}

          {onLoadDemoData && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('คุณต้องการโหลดข้อมูลตัวอย่างสำหรับทดลองระบบหรือไม่?')) {
                  onLoadDemoData();
                }
              }}
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>โหลดข้อมูลตัวอย่าง</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
