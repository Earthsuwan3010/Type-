import React, { useState, useMemo } from 'react';
import { 
  Home, 
  Search, 
  UserPlus, 
  Check, 
  MapPin, 
  Phone, 
  Heart, 
  HelpCircle, 
  Edit3, 
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Upload,
  UserCheck,
  Users
} from 'lucide-react';
import { Person, PopulationType } from '../types/survey';
import { generateTemplateExcel, exportSurveyResultsExcel } from '../utils/excelUtils';

interface VolunteerSurveyViewProps {
  people: Person[];
  onUpdatePerson: (person: Person) => void;
  onQuickUpdateType: (personId: string, newType: PopulationType, surveyorName: string) => void;
  onOpenEditModal: (person: Person | null, villageNo: number, houseNo?: string) => void;
  onOpenGuide: () => void;
  onOpenImport: () => void;
  onLoadDemoData?: () => void;
  activeSurveyor: string;
  onSurveyorChange: (name: string) => void;
  hospitalName: string;
  preselectedOsm?: string;
}

export const VolunteerSurveyView: React.FC<VolunteerSurveyViewProps> = ({
  people,
  onUpdatePerson,
  onQuickUpdateType,
  onOpenEditModal,
  onOpenGuide,
  onOpenImport,
  onLoadDemoData,
  activeSurveyor,
  onSurveyorChange,
  hospitalName,
  preselectedOsm,
}) => {
  const [selectedVillageNo, setSelectedVillageNo] = useState<number | 'all'>('all');
  const [selectedOsm, setSelectedOsm] = useState<string>(preselectedOsm || 'all');
  const [osmSearchQuery, setOsmSearchQuery] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'surveyed' | 'type1' | 'type2' | 'type3'>('all');
  const [gpsLoadingHouse, setGpsLoadingHouse] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Distinct list of assigned volunteers from Excel data
  const distinctOsmList = useMemo(() => {
    const list = Array.from(new Set(people.map(p => (p.assignedOsm || '').trim()).filter(Boolean)));
    list.sort((a, b) => a.localeCompare('th'));
    return list;
  }, [people]);

  // Per-OSM summary statistics for quick volunteer switcher
  const osmSummaryList = useMemo(() => {
    return distinctOsmList.map(osm => {
      const osmPeople = people.filter(p => (p.assignedOsm || '').trim() === osm);
      const totalCount = osmPeople.length;
      const surveyedCount = osmPeople.filter(p => p.isSurveyed).length;
      const houses = new Set(osmPeople.map(p => `${p.villageNo}-${p.houseNo}`)).size;
      const pct = totalCount > 0 ? Math.round((surveyedCount / totalCount) * 100) : 0;
      return {
        name: osm,
        total: totalCount,
        surveyed: surveyedCount,
        houses,
        pct,
      };
    });
  }, [distinctOsmList, people]);

  // Filtered OSM list based on osmSearchQuery for quick volunteer search
  const filteredOsmSummaryList = useMemo(() => {
    if (!osmSearchQuery.trim()) return osmSummaryList;
    const q = osmSearchQuery.toLowerCase().trim();
    return osmSummaryList.filter(o => o.name.toLowerCase().includes(q));
  }, [osmSummaryList, osmSearchQuery]);

  // Distinct list of villages
  const availableVillages = useMemo(() => {
    const numbers = Array.from(new Set(people.map(p => p.villageNo)))
      .filter(v => typeof v === 'number' && !isNaN(v))
      .sort((a, b) => a - b);

    if (numbers.length === 0) {
      return [1, 2, 3, 4].map(no => ({ no, name: `หมู่ ${no}` }));
    }
    return numbers.map(no => ({ no, name: `หมู่ ${no}` }));
  }, [people]);

  // When selectedOsm changes, if it's a specific volunteer, update activeSurveyor automatically
  const handleSelectOsm = (osmName: string) => {
    setSelectedOsm(osmName);
    if (osmName !== 'all' && osmName !== 'unassigned') {
      onSurveyorChange(osmName);
    }
  };

  // Filtered pool of people by selected OSM and Village
  const scopedPeople = useMemo(() => {
    return people.filter(p => {
      // Filter by OSM (Separated by responsible volunteer from Excel)
      if (selectedOsm === 'unassigned') {
        if (p.assignedOsm && p.assignedOsm.trim() !== '') return false;
      } else if (selectedOsm !== 'all') {
        if ((p.assignedOsm || '').trim() !== selectedOsm) return false;
      }

      // Filter by Village
      if (selectedVillageNo !== 'all') {
        if (p.villageNo !== selectedVillageNo) return false;
      }

      return true;
    });
  }, [people, selectedOsm, selectedVillageNo]);

  // Filtered by Search & Status (Strictly House Number and Full Name)
  const filteredPeople = useMemo(() => {
    return scopedPeople.filter(p => {
      // Search only by House Number (บ้านเลขที่) and Full name (ชื่อ-นามสกุล)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const fullName = `${p.prefix || ''}${p.firstName} ${p.lastName}`.toLowerCase();
        const houseMatch = (p.houseNo || '').toLowerCase().includes(query);
        const nameMatch = fullName.includes(query);
        if (!houseMatch && !nameMatch) return false;
      }

      // Filter status
      if (filterStatus === 'pending') return !p.isSurveyed;
      if (filterStatus === 'surveyed') return p.isSurveyed;
      if (filterStatus === 'type1') return p.currentType === 1;
      if (filterStatus === 'type2') return p.currentType === 2;
      if (filterStatus === 'type3') return p.currentType === 3;

      return true;
    });
  }, [scopedPeople, searchQuery, filterStatus]);

  // Group by house key (villageNo + houseNo)
  const housesMap = useMemo(() => {
    const map = new Map<string, { villageNo: number; houseNo: string; members: Person[] }>();
    filteredPeople.forEach(p => {
      const key = `${p.villageNo}-${p.houseNo || 'ไม่ระบุ'}`;
      const existing = map.get(key) || { villageNo: p.villageNo, houseNo: p.houseNo || 'ไม่ระบุ', members: [] };
      existing.members.push(p);
      map.set(key, existing);
    });

    return Array.from(map.values()).sort((a, b) => {
      if (a.villageNo !== b.villageNo) return a.villageNo - b.villageNo;
      const numA = parseFloat(a.houseNo.replace(/[^0-9.]/g, '')) || 0;
      const numB = parseFloat(b.houseNo.replace(/[^0-9.]/g, '')) || 0;
      return numA - numB;
    });
  }, [filteredPeople]);

  // Progress stats for current scope
  const totalScoped = scopedPeople.length;
  const surveyedScoped = scopedPeople.filter(p => p.isSurveyed).length;
  const percentComplete = totalScoped > 0 ? Math.round((surveyedScoped / totalScoped) * 100) : 0;

  // Total unique houses in current scope
  const uniqueHousesCount = useMemo(() => {
    const set = new Set(scopedPeople.map(p => `${p.villageNo}-${p.houseNo}`));
    return set.size;
  }, [scopedPeople]);

  const handleCaptureGps = (villageNo: number, houseNo: string) => {
    if (!navigator.geolocation) {
      showToast('อุปกรณ์ของคุณไม่รองรับการจับพิกัด GPS');
      return;
    }

    const houseKey = `${villageNo}-${houseNo}`;
    setGpsLoadingHouse(houseKey);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const houseMembers = people.filter(p => p.villageNo === villageNo && p.houseNo === houseNo);
        houseMembers.forEach(m => {
          onUpdatePerson({
            ...m,
            latitude,
            longitude,
          });
        });
        setGpsLoadingHouse(null);
        showToast(`บันทึกพิกัดบ้านเลขที่ ${houseNo} เรียบร้อยแล้ว`);
      },
      () => {
        setGpsLoadingHouse(null);
        showToast('ไม่สามารถระบุตำแหน่ง GPS ได้ กรุณาเปิดสิทธิ์เข้าถึงพิกัด');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleExportExcel = () => {
    if (people.length === 0) {
      showToast('ยังไม่มีข้อมูลสำหรับส่งออก');
      return;
    }

    if (selectedOsm !== 'all' && selectedOsm !== 'unassigned') {
      exportSurveyResultsExcel(scopedPeople, hospitalName, selectedOsm);
      showToast(`ส่งออกผลสำรวจของ ${selectedOsm} เรียบร้อยแล้ว`);
    } else {
      exportSurveyResultsExcel(people, hospitalName);
      showToast('ส่งออกผลสำรวจประชากรทั้งหมดเรียบร้อยแล้ว');
    }
  };

  // IF NO DATA IN SYSTEM YET: Display the prominent waiting for Excel screen
  if (people.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-800 mx-auto flex items-center justify-center shadow-xs">
            <FileSpreadsheet className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              รอนำเข้าข้อมูลจากไฟล์ Excel
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              ยินดีต้อนรับสู่ระบบสำรวจ <strong>{hospitalName}</strong><br />
              ระบบพร้อมสำหรับการนำเข้าไฟล์ Excel (.xlsx, .xls หรือ .csv) ที่มีคอลัมน์ <strong className="text-purple-800">&quot;อสม. ผู้รับผิดชอบ&quot;</strong> เพื่อแยกหลังคาเรือนให้ อสม. แต่ละคนลงสำรวจ Type 1, 2, 3 ได้สะดวกรวดเร็ว
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenImport}
              className="w-full sm:w-auto px-6 py-3.5 bg-purple-700 text-white rounded-xl font-semibold text-sm hover:bg-purple-800 transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer shadow-purple-700/20"
            >
              <Upload className="w-4 h-4" />
              <span>นำเข้าไฟล์ Excel ตอนนี้</span>
            </button>

            <button
              onClick={generateTemplateExcel}
              className="w-full sm:w-auto px-5 py-3.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50 transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-purple-700" />
              <span>ดาวน์โหลดไฟล์ตัวอย่าง (.xlsx)</span>
            </button>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <button
              onClick={() => onOpenEditModal(null, 1)}
              className="hover:text-purple-700 font-medium cursor-pointer"
            >
              + หรือเพิ่มประชากรคนแรกด้วยตนเอง
            </button>

            {onLoadDemoData && (
              <button
                onClick={onLoadDemoData}
                className="hover:text-slate-800 underline cursor-pointer"
              >
                ทดลองโหลดข้อมูลตัวอย่างสำหรับทดสอบระบบ
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-5 space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-purple-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner: Select Assigned OSM & Village */}
      <div className="bg-white rounded-2xl p-4.5 border border-purple-100 shadow-xs space-y-3.5">
        
        {/* Volunteer Selector (แยกตาม อสม. ผู้รับผิดชอบในไฟล์ Excel) */}
        <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-purple-700" />
              <span>ระบบแยกตาม อสม. ผู้รับผิดชอบ (จากไฟล์ Excel):</span>
            </label>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {selectedOsm !== 'all' && (
                <button
                  type="button"
                  onClick={() => handleSelectOsm('all')}
                  className="text-xs text-purple-800 hover:text-purple-950 font-semibold underline"
                >
                  ดูบ้านของ อสม. ทุกคน
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <div className="sm:col-span-8">
              <select
                value={selectedOsm}
                onChange={(e) => handleSelectOsm(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-purple-300 rounded-lg text-slate-800 font-medium focus:outline-purple-600 shadow-xs"
              >
                <option value="all">-- แสดงบ้านของ อสม. ทุกคน (ทั้งหมด {people.length} คน) --</option>
                {osmSummaryList.map(osm => (
                  <option key={osm.name} value={osm.name}>
                    {osm.name} (ดูแล {osm.houses} หลัง · {osm.total} คน · สำรวจแล้ว {osm.pct}%)
                  </option>
                ))}
                {people.some(p => !p.assignedOsm || p.assignedOsm.trim() === '') && (
                  <option value="unassigned">-- บ้านที่ยังไม่ได้ระบุ อสม. ผู้รับผิดชอบ --</option>
                )}
              </select>
            </div>

            <div className="sm:col-span-4 flex items-center">
              <input
                type="text"
                value={activeSurveyor}
                onChange={(e) => onSurveyorChange(e.target.value)}
                placeholder="ชื่อ อสม. ที่กำลังบันทึก"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-purple-600"
                title="ชื่อ อสม. ผู้ลงสำรวจจริง (จะถูกบันทึกเมื่อกดสำรวจ)"
              />
            </div>
          </div>

          {/* Quick Clickable OSM Chips for Field Volunteers & Search */}
          {distinctOsmList.length > 0 && (
            <div className="pt-1 space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <span className="text-[11px] font-medium text-purple-950 block">
                  แตะเพื่อสลับชื่อ อสม. ทันที:
                </span>
                {/* Search OSM by name */}
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-purple-700" />
                  <input
                    type="text"
                    value={osmSearchQuery}
                    onChange={(e) => setOsmSearchQuery(e.target.value)}
                    placeholder="พิมพ์ค้นหาชื่อ อสม. ..."
                    className="w-full pl-7 pr-6 py-1 text-xs bg-white border border-purple-300 rounded-lg text-slate-800 placeholder:text-purple-800/40 focus:outline-purple-600 shadow-2xs"
                  />
                  {osmSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setOsmSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-slate-600 px-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto no-scrollbar py-0.5">
                <button
                  type="button"
                  onClick={() => handleSelectOsm('all')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer select-none active:scale-95 ${
                    selectedOsm === 'all'
                      ? 'bg-purple-700 text-white shadow-xs shadow-purple-700/20'
                      : 'bg-white border border-purple-200 text-purple-900 hover:bg-purple-100/60'
                  }`}
                >
                  ทั้งหมด ({distinctOsmList.length} อสม.)
                </button>
                {filteredOsmSummaryList.map(item => {
                  const isSelected = selectedOsm === item.name;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => handleSelectOsm(item.name)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer select-none active:scale-95 ${
                        isSelected
                          ? 'bg-purple-700 text-white shadow-xs ring-2 ring-purple-500/20 shadow-purple-700/20'
                          : 'bg-white border border-purple-200 text-purple-900 hover:bg-purple-100/60'
                      }`}
                    >
                      <span>{item.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold tabular-nums ${
                        isSelected ? 'bg-purple-900 text-purple-100' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {item.pct}%
                      </span>
                    </button>
                  );
                })}
                {filteredOsmSummaryList.length === 0 && (
                  <span className="text-xs text-slate-500 py-1">ไม่พบชื่อ อสม. ที่ตรงกับ &ldquo;{osmSearchQuery}&rdquo;</span>
                )}
              </div>
            </div>
          )}

          {/* Active Volunteer Personalized Tag */}
          {selectedOsm !== 'all' && (
            <div className="pt-1 flex items-center justify-between text-xs text-purple-950 font-medium border-t border-purple-200/60">
              <span className="flex items-center gap-1">
                <span>📌 กำลังแสดงเฉพาะหลังคาเรือนของ:</span>
                <strong className="underline text-purple-900">
                  {selectedOsm === 'unassigned' ? 'บ้านที่ยังไม่ระบุ อสม.' : selectedOsm}
                </strong>
              </span>
              <span className="font-semibold tabular-nums text-purple-800">
                {uniqueHousesCount} หลังคาเรือน ({totalScoped} คน)
              </span>
            </div>
          )}
        </div>

        {/* Village Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-semibold text-slate-600 mr-1">หมู่บ้าน:</span>
          <button
            onClick={() => setSelectedVillageNo('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              selectedVillageNo === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ทุกหมู่
          </button>
          {availableVillages.map(v => (
            <button
              key={v.no}
              onClick={() => setSelectedVillageNo(v.no)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedVillageNo === v.no
                  ? 'bg-purple-700 text-white shadow-xs shadow-purple-700/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {v.name}
            </button>
          ))}
        </div>

        {/* Progress Bar for Current Selection */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-2 font-medium text-slate-700">
              <span>ความคืบหน้าการสำรวจ {selectedOsm !== 'all' ? `(${selectedOsm})` : selectedVillageNo !== 'all' ? `(หมู่ ${selectedVillageNo})` : ''}</span>
              <span className="text-slate-400">·</span>
              <span className="font-semibold text-purple-700">
                {surveyedScoped} / {totalScoped} คน
              </span>
            </div>
            <span className="font-bold text-slate-800 tabular-nums">
              {percentComplete}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter, Search Bar & Quick Export */}
      <div className="space-y-2">
        <div className="flex gap-2">
          {/* Search: Strictly House Number & Full Name */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาด้วย บ้านเลขที่ หรือ ชื่อ-นามสกุล..."
              className="w-full pl-9 pr-14 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-800 shadow-xs focus:outline-purple-600 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1 py-0.5 cursor-pointer"
              >
                ล้าง
              </button>
            )}
          </div>

          {/* Quick Export Excel Button directly on Survey Screen */}
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-purple-700/20"
            title={selectedOsm !== 'all' ? `ส่งออก Excel ผลสำรวจของ ${selectedOsm}` : "ส่งออก Excel ผลสำรวจทั้งหมด"}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">
              {selectedOsm !== 'all' ? 'ส่งออก Excel (อสม. นี้)' : 'ส่งออก Excel'}
            </span>
            <span className="sm:hidden">Excel</span>
          </button>

          {/* Add person/house */}
          <button
            onClick={() => onOpenEditModal(null, typeof selectedVillageNo === 'number' ? selectedVillageNo : 1)}
            className="px-3.5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-purple-50/50 rounded-xl text-xs sm:text-sm font-medium transition-colors shadow-xs flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-purple-700" />
            <span className="hidden sm:inline">+ เพิ่มคน/บ้าน</span>
            <span className="sm:hidden">+ เพิ่ม</span>
          </button>
        </div>

        {/* Clear Search Criteria Indicator */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span>🔍 ค้นหาเฉพาะ: <strong>บ้านเลขที่</strong> และ <strong>ชื่อ-นามสกุล</strong> เท่านั้น</span>
          {searchQuery && (
            <span className="text-purple-700 font-medium">พบ {filteredPeople.length} คน จากการค้นหา</span>
          )}
        </div>

        {/* Filter Tabs (Interactive Segmented Buttons) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer select-none active:scale-95 ${
              filterStatus === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            ทั้งหมด ({scopedPeople.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer select-none active:scale-95 ${
              filterStatus === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            ยังไม่ได้สำรวจ ({scopedPeople.filter(p => !p.isSurveyed).length})
          </button>
          <button
            onClick={() => setFilterStatus('surveyed')}
            className={`px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer select-none active:scale-95 ${
              filterStatus === 'surveyed'
                ? 'bg-purple-700 text-white shadow-xs shadow-purple-700/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            สำรวจแล้ว ({scopedPeople.filter(p => p.isSurveyed).length})
          </button>
          <button
            onClick={() => setFilterStatus('type1')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filterStatus === 'type1'
                ? 'bg-purple-800 text-white shadow-xs shadow-purple-800/20'
                : 'bg-white border border-purple-200 text-purple-900 hover:bg-purple-50'
            }`}
          >
            Type 1 อยู่จริง ({scopedPeople.filter(p => p.currentType === 1).length})
          </button>
          <button
            onClick={() => setFilterStatus('type2')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filterStatus === 'type2'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            Type 2 ไม่อยู่จริง ({scopedPeople.filter(p => p.currentType === 2).length})
          </button>
          <button
            onClick={() => setFilterStatus('type3')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filterStatus === 'type3'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            Type 3 ย้ายมาอยู่ ({scopedPeople.filter(p => p.currentType === 3).length})
          </button>
        </div>
      </div>

      {/* House List */}
      <div className="space-y-4">
        {housesMap.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 text-slate-500">
            <Home className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700 text-base">ไม่พบรายชื่อบ้านหรือบุคคลตามเงื่อนไขที่ค้นหา</p>
            <p className="text-xs text-slate-400 mt-1">
              {selectedOsm !== 'all' ? `ลองเปลี่ยนตัวเลือก อสม. หรือเลือกดูบ้านของทุกคน` : 'ลองเปลี่ยนคำค้นหา (บ้านเลขที่ หรือ ชื่อ-นามสกุล) หรือกดปุ่ม "+ เพิ่มคน/บ้าน"'}
            </p>
          </div>
        ) : (
          housesMap.map(({ villageNo, houseNo, members }) => {
            const hasGps = members.some(m => m.latitude && m.longitude);
            const allSurveyed = members.every(m => m.isSurveyed);
            const firstMember = members[0];
            const houseOsm = firstMember.assignedOsm;
            const houseKey = `${villageNo}-${houseNo}`;

            return (
              <div 
                key={houseKey} 
                className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                  allSurveyed ? 'border-purple-200 shadow-xs' : 'border-slate-200 shadow-xs'
                }`}
              >
                {/* House Card Header */}
                <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm">
                      <Home className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">
                          บ้านเลขที่ {houseNo}
                        </span>
                        <span className="text-xs text-slate-500">
                          (หมู่ {villageNo})
                        </span>

                        {houseOsm && (
                          <span className="text-[11px] font-medium text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-purple-700" />
                            <span>{houseOsm}</span>
                          </span>
                        )}

                        {allSurveyed && (
                          <span className="text-xs text-purple-700 font-medium flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> สำรวจครบแล้ว
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">
                        สมาชิก {members.length} คน
                      </span>
                    </div>
                  </div>

                  {/* Actions for this house */}
                  <div className="flex items-center gap-1.5">
                    {/* GPS Button */}
                    <button
                      type="button"
                      onClick={() => handleCaptureGps(villageNo, houseNo)}
                      disabled={gpsLoadingHouse === houseKey}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                        hasGps
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-purple-50/50'
                      }`}
                      title={hasGps ? `พิกัด: ${firstMember?.latitude?.toFixed(4)}, ${firstMember?.longitude?.toFixed(4)}` : "กดเพื่อบันทึกพิกัด GPS บ้าน"}
                    >
                      <MapPin className="w-3.5 h-3.5 text-purple-700" />
                      <span>{gpsLoadingHouse === houseKey ? 'กำลังค้นหา...' : hasGps ? 'มีพิกัดแล้ว' : 'บันทึก GPS'}</span>
                    </button>

                    {/* Add member to this house */}
                    <button
                      type="button"
                      onClick={() => onOpenEditModal(null, villageNo, houseNo)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-purple-800 hover:bg-purple-50 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-purple-700" />
                      <span>+ เพิ่มคนในบ้าน</span>
                    </button>
                  </div>
                </div>

                {/* Family Members List */}
                <div className="divide-y divide-slate-100">
                  {members.map(person => {
                    const isType1 = person.currentType === 1;
                    const isType2 = person.currentType === 2;
                    const isType3 = person.currentType === 3;

                    return (
                      <div 
                        key={person.id}
                        className={`p-4 transition-colors ${
                          person.isSurveyed ? 'bg-white' : 'bg-purple-50/20'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* Person Info */}
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-slate-900 text-sm sm:text-base">
                                {person.prefix}{person.firstName} {person.lastName}
                              </span>

                              {person.relationWithHead && (
                                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                  {person.relationWithHead}
                                </span>
                              )}

                              {person.age && (
                                <span className="text-xs text-slate-500">
                                  อายุ {person.age} ปี
                                </span>
                              )}

                              {person.isDeceased && (
                                <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                  เสียชีวิตแล้ว
                                </span>
                              )}

                              {person.healthStatus === 'bedridden' && (
                                <span className="text-xs font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                                  <Heart className="w-3 h-3 fill-rose-500" /> ติดเตียง
                                </span>
                              )}

                              {person.healthStatus === 'homebound' && (
                                <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  ติดบ้าน
                                </span>
                              )}

                              {person.healthStatus === 'chronic' && (
                                <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                  โรคเรื้อรัง
                                </span>
                              )}

                              {person.healthStatus === 'pregnant' && (
                                <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                  หญิงตั้งครรภ์
                                </span>
                              )}
                            </div>

                            {/* CID & Phone & Notes & Surveyor */}
                            <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                              {person.cid && (
                                <span className="font-mono text-[11px] text-slate-600">
                                  บัตร: {person.cid}
                                </span>
                              )}

                              {person.phone && (
                                <a 
                                  href={`tel:${person.phone}`}
                                  className="text-purple-700 hover:underline flex items-center gap-1"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>{person.phone}</span>
                                </a>
                              )}

                              {person.assignedOsm && (
                                <span className="text-purple-800 font-medium">
                                  · อสม. ผู้รับผิดชอบ: {person.assignedOsm}
                                </span>
                              )}

                              {person.isSurveyed && person.surveyorName && (
                                <span className="text-slate-400">
                                  · สำรวจโดย {person.surveyorName}
                                </span>
                              )}
                            </div>

                            {person.notes && (
                              <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                                <strong className="text-slate-700">หมายเหตุ:</strong> {person.notes}
                              </p>
                            )}
                          </div>

                          {/* 1-Tap Quick Survey Buttons for อสม. */}
                          <div className="flex items-center gap-1.5 w-full sm:w-auto mt-2 sm:mt-0 shrink-0">
                            {/* Type 1 */}
                            <button
                              type="button"
                              onClick={() => {
                                const surveyor = activeSurveyor || person.assignedOsm || 'อสม. ผู้สำรวจ';
                                onQuickUpdateType(person.id, 1, surveyor);
                                showToast(`ปรับปรุง ${person.firstName} เป็น Type 1 (อยู่จริง) สำเร็จ`);
                              }}
                              className={`flex-1 sm:flex-initial min-h-[46px] px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center cursor-pointer select-none active:scale-95 ${
                                isType1 && person.isSurveyed
                                  ? 'bg-purple-700 text-white shadow-xs ring-2 ring-purple-500/20 shadow-purple-700/20'
                                  : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
                              }`}
                              title="Type 1: มีชื่อในทะเบียนบ้าน และอาศัยอยู่จริง"
                            >
                              <span className="font-bold">Type 1</span>
                              <span className="text-[10px] font-normal leading-tight">อยู่จริง</span>
                            </button>

                            {/* Type 2 */}
                            <button
                              type="button"
                              onClick={() => {
                                const surveyor = activeSurveyor || person.assignedOsm || 'อสม. ผู้สำรวจ';
                                onQuickUpdateType(person.id, 2, surveyor);
                                showToast(`ปรับปรุง ${person.firstName} เป็น Type 2 (ไม่อยู่จริง) สำเร็จ`);
                              }}
                              className={`flex-1 sm:flex-initial min-h-[46px] px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center cursor-pointer select-none active:scale-95 ${
                                isType2 && person.isSurveyed
                                  ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-500/20'
                                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                              }`}
                              title="Type 2: มีชื่อในทะเบียนบ้าน แต่ตัวไปทำงาน/เรียนที่อื่น"
                            >
                              <span className="font-bold">Type 2</span>
                              <span className="text-[10px] font-normal leading-tight">ไม่อยู่</span>
                            </button>

                            {/* Type 3 */}
                            <button
                              type="button"
                              onClick={() => {
                                const surveyor = activeSurveyor || person.assignedOsm || 'อสม. ผู้สำรวจ';
                                onQuickUpdateType(person.id, 3, surveyor);
                                showToast(`ปรับปรุง ${person.firstName} เป็น Type 3 (ย้ายมาอยู่) สำเร็จ`);
                              }}
                              className={`flex-1 sm:flex-initial min-h-[46px] px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center cursor-pointer select-none active:scale-95 ${
                                isType3 && person.isSurveyed
                                  ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-500/20'
                                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                              }`}
                              title="Type 3: ไม่มีชื่อในทะเบียนบ้าน แต่มาอยู่จริง (ประชากรแฝง)"
                            >
                              <span className="font-bold">Type 3</span>
                              <span className="text-[10px] font-normal leading-tight">ย้ายมาอยู่</span>
                            </button>

                            {/* Edit Detail Button */}
                            <button
                              type="button"
                              onClick={() => onOpenEditModal(person, villageNo, houseNo)}
                              className="min-h-[46px] w-10 sm:w-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:text-purple-900 hover:bg-purple-50 transition-colors cursor-pointer select-none active:scale-95 shrink-0"
                              title="แก้ไขรายละเอียดเพิ่มเติม (เบอร์โทร, ติดเตียง, หมายเหตุ, อสม. รับผิดชอบ)"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating help link */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={onOpenGuide}
          className="text-xs text-slate-500 hover:text-purple-800 flex items-center gap-1.5 underline cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-purple-700" />
          <span>ไม่แน่ใจเกณฑ์จำแนก Type 1, 2, 3? คลิกเพื่ออ่านคำอธิบายพร้อมตัวอย่าง</span>
        </button>
      </div>
    </div>
  );
};
