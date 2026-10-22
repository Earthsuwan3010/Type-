import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Check, 
  Heart, 
  FileSpreadsheet, 
  UserCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Users
} from 'lucide-react';
import { Person, PopulationType } from '../types/survey';
import { exportSurveyResultsExcel } from '../utils/excelUtils';

interface DataTableManagementProps {
  people: Person[];
  onUpdatePerson: (person: Person) => void;
  onDeletePerson: (id: string) => void;
  onBatchUpdateType: (ids: string[], newType: PopulationType) => void;
  onBatchDelete: (ids: string[]) => void;
  onBatchAssignOsm?: (ids: string[], osmName: string) => void;
  onOpenEditModal: (person: Person | null, villageNo: number, houseNo?: string) => void;
  onOpenImport?: () => void;
  hospitalName: string;
}

export const DataTableManagement: React.FC<DataTableManagementProps> = ({
  people,
  onDeletePerson,
  onBatchUpdateType,
  onBatchDelete,
  onBatchAssignOsm,
  onOpenEditModal,
  onOpenImport,
  hospitalName,
}) => {
  const [search, setSearch] = useState<string>('');
  const [selectedVillage, setSelectedVillage] = useState<number | 'all'>('all');
  const [selectedOsm, setSelectedOsm] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<number | 'all'>('all');
  const [surveyFilter, setSurveyFilter] = useState<'all' | 'surveyed' | 'pending'>('all');
  const [healthFilter, setHealthFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Pagination for high performance with 8,000+ items
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(100);

  // Export state & Toast notification
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Distinct villages
  const availableVillages = useMemo(() => {
    const nums = Array.from(new Set(people.map(p => p.villageNo)))
      .filter(v => typeof v === 'number' && !isNaN(v))
      .sort((a, b) => a - b);
    return nums.length > 0 ? nums : [1, 2, 3, 4];
  }, [people]);

  // Distinct OSM list
  const distinctOsmList = useMemo(() => {
    const list = Array.from(new Set(people.map(p => (p.assignedOsm || '').trim()).filter(Boolean)));
    list.sort((a, b) => a.localeCompare('th'));
    return list;
  }, [people]);

  // Filter
  const filtered = useMemo(() => {
    return people.filter(p => {
      if (selectedVillage !== 'all' && p.villageNo !== selectedVillage) return false;
      if (selectedOsm === 'unassigned') {
        if (p.assignedOsm && p.assignedOsm.trim() !== '') return false;
      } else if (selectedOsm !== 'all') {
        if ((p.assignedOsm || '').trim() !== selectedOsm) return false;
      }
      if (selectedType !== 'all' && p.currentType !== selectedType) return false;
      if (surveyFilter === 'surveyed' && !p.isSurveyed) return false;
      if (surveyFilter === 'pending' && p.isSurveyed) return false;
      if (healthFilter !== 'all' && p.healthStatus !== healthFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const full = `${p.prefix || ''}${p.firstName} ${p.lastName}`.toLowerCase();
        const house = (p.houseNo || '').toLowerCase();
        const osm = (p.assignedOsm || '').toLowerCase();
        if (!full.includes(q) && !house.includes(q) && !osm.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [people, selectedVillage, selectedOsm, selectedType, surveyFilter, healthFilter, search]);

  // Reset to page 1 when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedVillage, selectedOsm, selectedType, surveyFilter, healthFilter]);

  // Paginated items
  const totalPages = pageSize === -1 ? 1 : Math.ceil(filtered.length / pageSize) || 1;
  const paginatedPeople = useMemo(() => {
    if (pageSize === -1) return filtered;
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const handleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(p => p.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleApplyBatchType = (type: PopulationType) => {
    if (selectedIds.size === 0) return;
    onBatchUpdateType(Array.from(selectedIds), type);
    setSelectedIds(new Set());
    showToast(`ปรับปรุง Type ${type} ให้กับ ${selectedIds.size} รายการเรียบร้อย`);
  };

  const handleApplyBatchDelete = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบประชากรที่เลือกจำนวน ${selectedIds.size} รายการ?`)) {
      onBatchDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
      showToast(`ลบข้อมูลที่เลือกจำนวน ${selectedIds.size} รายการเรียบร้อย`);
    }
  };

  const handleApplyBatchAssignOsm = () => {
    if (selectedIds.size === 0) return;
    const targetOsm = window.prompt(`ระบุชื่อ อสม. ที่ต้องการมอบหมายให้กับ ${selectedIds.size} รายการที่เลือก:`, distinctOsmList[0] || 'อสม. ');
    if (targetOsm && targetOsm.trim() && onBatchAssignOsm) {
      onBatchAssignOsm(Array.from(selectedIds), targetOsm.trim());
      setSelectedIds(new Set());
      showToast(`มอบหมาย ${selectedIds.size} รายการให้ "${targetOsm.trim()}" เรียบร้อย`);
    }
  };

  // Main Export Handler
  const handleExport = (dataToExport: Person[], labelSubtitle?: string) => {
    if (dataToExport.length === 0) {
      alert('ไม่มีข้อมูลสำหรับส่งออก');
      return;
    }
    setIsExporting(true);
    // Use timeout to allow UI to update loading state before heavy XLSX generation
    setTimeout(() => {
      try {
        let sub = labelSubtitle || '';
        if (!sub) {
          if (selectedOsm !== 'all') sub = `อสม_${selectedOsm}`;
          else if (selectedVillage !== 'all') sub = `หมู่${selectedVillage}`;
        }
        exportSurveyResultsExcel(dataToExport, hospitalName, sub);
        showToast(`ส่งออกไฟล์ Excel ข้อมูลประชากร ${dataToExport.length.toLocaleString()} รายการ สำเร็จแล้ว!`);
      } catch (err) {
        console.error('Export Excel failed:', err);
        alert('เกิดข้อผิดพลาดในการสร้างไฟล์ Excel กรุณาลองใหม่อีกครั้ง');
      } finally {
        setIsExporting(false);
      }
    }, 50);
  };

  const startIndex = (currentPage - 1) * (pageSize === -1 ? filtered.length : pageSize);
  const endIndex = pageSize === -1 ? filtered.length : Math.min(startIndex + pageSize, filtered.length);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="bg-purple-700 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between text-xs sm:text-sm animate-fade-in font-medium shadow-purple-700/20">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-purple-200 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-purple-200 hover:text-white px-2 py-0.5 rounded-lg hover:bg-purple-600 text-xs transition-colors cursor-pointer"
          >
            ปิด
          </button>
        </div>
      )}

      {/* Top Header & Search Tools */}
      <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                ตารางบริหารจัดการข้อมูลประชากร
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                {people.length.toLocaleString()} คนในระบบ
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ค้นหา กรองตาม อสม. ผู้รับผิดชอบ ปรับปรุงข้อมูลรายบุคคล ส่งออกเป็นไฟล์ Excel หรือแก้ไข Type ทีละหลายรายการ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onOpenEditModal(null, selectedVillage === 'all' ? 1 : selectedVillage)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-purple-50/50 border border-slate-200 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-purple-700" />
              <span>เพิ่มประชากร</span>
            </button>

            {/* Primary Excel Export Button */}
            <button
              onClick={() => handleExport(filtered, filtered.length === people.length ? 'ทั้งหมด' : 'ตามตัวกรอง')}
              disabled={filtered.length === 0 || isExporting}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 ${
                filtered.length > 0 && !isExporting
                  ? 'text-white bg-purple-700 hover:bg-purple-800 active:bg-purple-900 cursor-pointer shadow-purple-700/20'
                  : 'text-slate-400 bg-slate-100 cursor-not-allowed border border-slate-200'
              }`}
              title="ส่งออกตารางข้อมูลประชากรหน้านี้เป็นไฟล์ Excel ทันที"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังสร้างไฟล์ Excel...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4 text-purple-200" />
                  <Download className="w-4 h-4" />
                  <span>ส่งออก Excel ({filtered.length.toLocaleString()} รายการ)</span>
                </>
              )}
            </button>

            {/* If filtered subset, allow quick one-click export of ALL data too */}
            {filtered.length < people.length && people.length > 0 && (
              <button
                onClick={() => handleExport(people, 'ประชากรทั้งหมด')}
                disabled={isExporting}
                className="px-3 py-2 text-xs font-medium text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                title="ส่งออกประชากรทั้งหมดในระบบ (ไม่ต้องผ่านตัวกรอง)"
              >
                <Download className="w-3.5 h-3.5 text-purple-700" />
                <span>ส่งออกทั้งหมด ({people.length.toLocaleString()})</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหาด้วย บ้านเลขที่, ชื่อ หรือ อสม..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-purple-600"
            />
          </div>

          {/* OSM Filter */}
          <div>
            <select
              value={selectedOsm}
              onChange={e => setSelectedOsm(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-purple-600 font-medium"
            >
              <option value="all">อสม. ทั้งหมด ({distinctOsmList.length} ท่าน)</option>
              <option value="unassigned">⚠️ ยังไม่ระบุ อสม.</option>
              {distinctOsmList.map(osm => (
                <option key={osm} value={osm}>อสม. {osm}</option>
              ))}
            </select>
          </div>

          {/* Village */}
          <div>
            <select
              value={selectedVillage}
              onChange={e => setSelectedVillage(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-purple-600"
            >
              <option value="all">ทุกหมู่บ้าน (ทั้งหมด)</option>
              {availableVillages.map(vNo => (
                <option key={vNo} value={vNo}>หมู่ {vNo}</option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-purple-600"
            >
              <option value="all">ทุก Type ประชากร</option>
              <option value={1}>Type 1: มีชื่อ & อยู่จริง</option>
              <option value={2}>Type 2: มีชื่อ แต่ไม่อยู่</option>
              <option value={3}>Type 3: อยู่จริง ไม่มีชื่อ</option>
            </select>
          </div>

          {/* Survey status */}
          <div>
            <select
              value={surveyFilter}
              onChange={e => setSurveyFilter(e.target.value as 'all' | 'surveyed' | 'pending')}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-purple-600"
            >
              <option value="all">สถานะสำรวจ: ทั้งหมด</option>
              <option value="surveyed">สำรวจแล้ว</option>
              <option value="pending">ยังไม่สำรวจ</option>
            </select>
          </div>

          {/* Health */}
          <div>
            <select
              value={healthFilter}
              onChange={e => setHealthFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-purple-600"
            >
              <option value="all">สุขภาพ: ทั้งหมด</option>
              <option value="bedridden">ผู้ป่วยติดเตียง</option>
              <option value="homebound">ผู้ป่วยติดบ้าน</option>
              <option value="chronic">โรคเรื้อรัง</option>
              <option value="elderly">ผู้สูงอายุ</option>
              <option value="pregnant">หญิงตั้งครรภ์</option>
            </select>
          </div>
        </div>

        {/* Batch Action Bar if items selected */}
        {selectedIds.size > 0 && (
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-medium text-purple-950">
              <span className="font-bold bg-purple-700 text-white px-2 py-0.5 rounded-md shadow-2xs">
                {selectedIds.size}
              </span>
              <span>รายการที่เลือก</span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Batch Export selected */}
              <button
                onClick={() => {
                  const selectedPeople = people.filter(p => selectedIds.has(p.id));
                  handleExport(selectedPeople, `เฉพาะที่เลือก_${selectedPeople.length}_คน`);
                }}
                disabled={isExporting}
                className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-medium flex items-center gap-1 shadow-xs cursor-pointer shadow-purple-700/20"
                title="ส่งออกเฉพาะรายการที่เลือกเป็นไฟล์ Excel"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ส่งออกที่เลือกเป็น Excel ({selectedIds.size})</span>
              </button>

              <span className="text-slate-400 mx-1">|</span>
              <span className="text-slate-600 mr-1">เปลี่ยนเป็น:</span>
              <button
                onClick={() => handleApplyBatchType(1)}
                className="px-2.5 py-1 bg-white border border-purple-300 text-purple-800 rounded-lg hover:bg-purple-100 font-medium cursor-pointer"
              >
                Type 1 (อยู่จริง)
              </button>
              <button
                onClick={() => handleApplyBatchType(2)}
                className="px-2.5 py-1 bg-white border border-amber-300 text-amber-800 rounded-lg hover:bg-amber-100 font-medium cursor-pointer"
              >
                Type 2 (ไม่อยู่)
              </button>
              <button
                onClick={() => handleApplyBatchType(3)}
                className="px-2.5 py-1 bg-white border border-blue-300 text-blue-800 rounded-lg hover:bg-blue-100 font-medium cursor-pointer"
              >
                Type 3 (แฝง)
              </button>
              {onBatchAssignOsm && (
                <button
                  onClick={handleApplyBatchAssignOsm}
                  className="px-2.5 py-1 bg-white border border-purple-300 text-purple-950 rounded-lg hover:bg-purple-100 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-purple-700" />
                  <span>มอบหมาย อสม.</span>
                </button>
              )}
              <button
                onClick={handleApplyBatchDelete}
                className="px-2.5 py-1 bg-rose-50 border border-rose-300 text-rose-700 rounded-lg hover:bg-rose-100 font-medium ml-2 cursor-pointer"
              >
                ลบที่เลือก
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl border border-purple-100 shadow-xs overflow-hidden">
        {/* Table Top Controls: Total info + Page Size Selector */}
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>แสดงข้อมูล</span>
            <span className="font-semibold text-slate-900">
              {filtered.length === 0 ? 0 : startIndex + 1} - {endIndex}
            </span>
            <span>จากทั้งหมด</span>
            <span className="font-semibold text-purple-800">{filtered.length.toLocaleString()} รายการ</span>
            {filtered.length < people.length && (
              <span className="text-slate-400 text-xs">
                (กรองจากทั้งหมด {people.length.toLocaleString()} คน)
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span>แสดงต่อหน้า:</span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-purple-600"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
                <option value={-1}>แสดงทั้งหมด ({filtered.length.toLocaleString()})</option>
              </select>
            </div>

            {/* Quick Export in table toolbar */}
            <button
              onClick={() => handleExport(filtered)}
              disabled={filtered.length === 0 || isExporting}
              className="px-2.5 py-1 bg-white border border-purple-300 text-purple-800 hover:bg-purple-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-purple-700" />
              <span>ส่งออก Excel หน้านี้</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 text-xs">
              <tr>
                <th className="py-3 px-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-purple-700 focus:ring-purple-500 border-slate-300"
                  />
                </th>
                <th className="py-3 px-3 font-semibold">บ้านเลขที่</th>
                <th className="py-3 px-2 font-semibold">หมู่</th>
                <th className="py-3 px-3 font-semibold">ชื่อ - นามสกุล</th>
                <th className="py-3 px-3 font-semibold">อสม. ผู้รับผิดชอบ</th>
                <th className="py-3 px-3 font-semibold">เลขบัตร (CID)</th>
                <th className="py-3 px-3 font-semibold">ความสัมพันธ์</th>
                <th className="py-3 px-3 font-semibold">สถานะ Type</th>
                <th className="py-3 px-3 font-semibold">สถานะสุขภาพ</th>
                <th className="py-3 px-3 font-semibold">ผลสำรวจ</th>
                <th className="py-3 px-3 font-semibold text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    {people.length === 0 ? (
                      <div className="space-y-3 max-w-sm mx-auto">
                        <p className="font-semibold text-slate-700 text-sm">ยังไม่มีข้อมูลประชากรในระบบ (รอนำเข้าจาก Excel)</p>
                        <p className="text-xs text-slate-400">กรุณานำเข้าไฟล์ Excel รายชื่อประชากรเพื่อเริ่มต้นใช้งาน</p>
                        {onOpenImport && (
                          <button
                            type="button"
                            onClick={onOpenImport}
                            className="px-4 py-2 bg-purple-700 text-white rounded-xl text-xs font-semibold hover:bg-purple-800 transition-colors shadow-xs shadow-purple-700/20 inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <FileSpreadsheet className="w-4 h-4" />
                            <span>นำเข้าไฟล์ Excel ตอนนี้</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <span>ไม่พบข้อมูลที่ตรงกับตัวกรอง</span>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedPeople.map((person) => {
                  const isSelected = selectedIds.has(person.id);

                  let typeBg = "bg-purple-50 text-purple-900 border-purple-200";
                  if (person.currentType === 2) typeBg = "bg-amber-50 text-amber-800 border-amber-200";
                  else if (person.currentType === 3) typeBg = "bg-blue-50 text-blue-800 border-blue-200";

                  return (
                    <tr 
                      key={person.id}
                      className={`hover:bg-purple-50/20 transition-colors ${
                        isSelected ? 'bg-purple-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(person.id)}
                          className="w-4 h-4 rounded text-purple-700 focus:ring-purple-500 border-slate-300"
                        />
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {person.houseNo}
                      </td>
                      <td className="py-3 px-2 text-slate-600">
                        ม.{person.villageNo}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-900">
                        {person.prefix}{person.firstName} {person.lastName}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {person.assignedOsm ? (
                          <span className="inline-flex items-center gap-1 text-purple-900 bg-purple-50 px-2 py-0.5 rounded-md font-medium text-xs border border-purple-100">
                            <Users className="w-3 h-3 text-purple-700 shrink-0" />
                            {person.assignedOsm}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">ไม่ระบุ</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-slate-600">
                        {person.cid || '-'}
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-500">
                        {person.relationWithHead || '-'}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${typeBg}`}>
                          Type {person.currentType}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs">
                        {person.healthStatus === 'bedridden' ? (
                          <span className="text-rose-700 font-semibold flex items-center gap-1">
                            <Heart className="w-3 h-3 fill-rose-500" /> ติดเตียง
                          </span>
                        ) : person.healthStatus === 'chronic' ? (
                          <span className="text-blue-700">โรคเรื้อรัง</span>
                        ) : person.healthStatus === 'homebound' ? (
                          <span className="text-amber-700">ติดบ้าน</span>
                        ) : person.healthStatus === 'pregnant' ? (
                          <span className="text-purple-700">ตั้งครรภ์</span>
                        ) : (
                          <span className="text-slate-400">ปกติ</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-xs">
                        {person.isSurveyed ? (
                          <div className="text-purple-700 font-medium flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>สำรวจแล้ว</span>
                          </div>
                        ) : (
                          <span className="text-amber-600 font-medium">รอสำรวจ</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenEditModal(person, person.villageNo, person.houseNo)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
                            title="แก้ไขข้อมูล"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`ต้องการลบรายชื่อ ${person.firstName} ${person.lastName} หรือไม่?`)) {
                                onDeletePerson(person.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="ลบรายชื่อ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Bottom Summary Bar */}
        {filtered.length > 0 && (
          <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span>แสดง {filtered.length === 0 ? 0 : startIndex + 1} - {endIndex} จากทั้งหมด {filtered.length.toLocaleString()} รายการ</span>
              {pageSize !== -1 && totalPages > 1 && (
                <span className="text-slate-400">(หน้า {currentPage} จาก {totalPages})</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Pagination controls if multiple pages */}
              {pageSize !== -1 && totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="หน้าก่อนหน้า"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1 px-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = i + 1;
                      if (totalPages > 5 && currentPage > 3) {
                        pageNum = Math.min(currentPage - 2 + i, totalPages - 4 + i);
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            currentPage === pageNum
                              ? 'bg-purple-700 text-white shadow-2xs shadow-purple-700/20'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-purple-50/50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="หน้าถัดไป"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Bottom Export Button */}
              <button
                onClick={() => handleExport(filtered)}
                disabled={filtered.length === 0 || isExporting}
                className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shadow-purple-700/20 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ส่งออกไฟล์ Excel หน้านี้ ({filtered.length.toLocaleString()} รายการ)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
