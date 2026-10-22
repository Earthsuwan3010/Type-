import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, Download, Check, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { parseExcelFile, autoDetectMapping, convertRawRowsToPeople, generateTemplateExcel, ColumnMapping } from '../utils/excelUtils';
import { Person } from '../types/survey';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedPeople: Person[], mode: 'replace' | 'append') => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, unknown>[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    cidKey: '',
    nameKey: '',
    prefixKey: '',
    firstNameKey: '',
    lastNameKey: '',
    houseNoKey: '',
    villageNoKey: '',
    typeKey: '',
    phoneKey: '',
    relationKey: '',
    notesKey: '',
    healthKey: '',
    osmKey: '',
  });
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [previewStep, setPreviewStep] = useState<'upload' | 'map' | 'preview'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (selectedFile: File) => {
    try {
      setLoading(true);
      setError(null);
      setFile(selectedFile);

      const { headers: parsedHeaders, rawRows: rows } = await parseExcelFile(selectedFile);

      if (rows.length === 0) {
        setError('ไม่พบแถวข้อมูลในไฟล์ Excel นี้ กรุณาตรวจสอบไฟล์');
        setLoading(false);
        return;
      }

      setHeaders(parsedHeaders);
      setRawRows(rows);

      // Auto detect columns
      const detected = autoDetectMapping(parsedHeaders);
      setMapping(detected);
      setPreviewStep('map');
    } catch (err) {
      console.error(err);
      setError('ไม่สามารถอ่านไฟล์ Excel ได้ กรุณาตรวจสอบว่าเป็นไฟล์ .xlsx, .xls หรือ .csv ที่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = () => {
    try {
      const converted = convertRawRowsToPeople(rawRows, mapping);
      if (converted.length === 0) {
        setError('ไม่มีข้อมูลที่สามารถแปลงได้');
        return;
      }
      onImportSuccess(converted, importMode);
      onClose();
    } catch (err) {
      console.error(err);
      setError('เกิดข้อผิดพลาดในการแปลงข้อมูล');
    }
  };

  const previewConverted = convertRawRowsToPeople(rawRows.slice(0, 5), mapping);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-purple-100 flex items-center justify-between bg-purple-800 text-white">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-purple-200" />
            <div>
              <h2 className="text-lg font-bold leading-tight">นำเข้าไฟล์ Excel ข้อมูลประชากร รพ.สต.</h2>
              <p className="text-xs text-purple-100 font-light">รองรับไฟล์ .xlsx, .xls และ .csv จากระบบ JHCIS, HosXP หรือไฟล์ที่พิมพ์เอง</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-purple-100 hover:text-white hover:bg-purple-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Upload or Download Template */}
          {previewStep === 'upload' && (
            <div className="space-y-5">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) {
                    handleFileChange(e.dataTransfer.files[0]);
                  }
                }}
                className="border-2 border-dashed border-purple-300 hover:border-purple-500 rounded-2xl p-8 text-center bg-purple-50/40 hover:bg-purple-50/70 transition-all cursor-pointer flex flex-col items-center justify-center gap-3"
              >
                <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-base">คลิกเพื่อเลือกไฟล์ หรือ ลากไฟล์ Excel มาวางที่นี่</p>
                  <p className="text-xs text-slate-500 mt-1">รองรับไฟล์ .xlsx, .xls, .csv ขนาดไม่เกิน 20MB</p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                />
              </div>

              {/* Template Download Card */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">ยังไม่มีไฟล์ หรือไม่แน่ใจหัวตาราง?</h4>
                  <p className="text-xs text-slate-500 mt-0.5">ดาวน์โหลดไฟล์แม่แบบตัวอย่าง (.xlsx) ที่มีตัวอย่างครบทั้ง Type 1, 2, 3</p>
                </div>
                <button
                  type="button"
                  onClick={generateTemplateExcel}
                  className="px-3.5 py-2 text-xs font-semibold text-purple-800 bg-white border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-purple-700" />
                  โหลดไฟล์ตัวอย่าง
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Column Mapping & Preview */}
          {previewStep !== 'upload' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-purple-700" />
                  <span className="font-medium text-slate-800 text-xs">ไฟล์: {file?.name}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-xs text-slate-600 font-mono">{rawRows.length} แถวข้อมูล</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewStep('upload');
                    setFile(null);
                    setRawRows([]);
                    setHeaders([]);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  เปลี่ยนไฟล์
                </button>
              </div>

              {/* Mapping Grid */}
              <div>
                <h4 className="font-semibold text-slate-800 text-sm mb-1">จับคู่คอลัมน์จากไฟล์ Excel ของคุณ</h4>
                <p className="text-xs text-slate-500 mb-3">ระบบตรวจจับให้อัตโนมัติ หากหัวตารางไม่ตรง สามารถเปลี่ยนเลือกคอลัมน์ได้</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      บ้านเลขที่ <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={mapping.houseNoKey}
                      onChange={e => setMapping(prev => ({ ...prev, houseNoKey: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-purple-600"
                    >
                      <option value="">-- เลือกคอลัมน์ --</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      หมู่ที่ <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={mapping.villageNoKey}
                      onChange={e => setMapping(prev => ({ ...prev, villageNoKey: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-purple-600"
                    >
                      <option value="">-- เลือกคอลัมน์ (หรือค่าเริ่มต้น) --</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      ชื่อ (หรือ ชื่อ-สกุล รวม) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={mapping.firstNameKey || mapping.nameKey}
                      onChange={e => setMapping(prev => ({ ...prev, firstNameKey: e.target.value, nameKey: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-purple-600"
                    >
                      <option value="">-- เลือกคอลัมน์ --</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      นามสกุล
                    </label>
                    <select
                      value={mapping.lastNameKey}
                      onChange={e => setMapping(prev => ({ ...prev, lastNameKey: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-purple-600"
                    >
                      <option value="">-- ไม่ระบุ (รวมในช่องชื่อแล้ว) --</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      คำนำหน้า
                    </label>
                    <select
                      value={mapping.prefixKey}
                      onChange={e => setMapping(prev => ({ ...prev, prefixKey: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-purple-600"
                    >
                      <option value="">-- ตรวจจับอัตโนมัติจากชื่อ --</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      เลขบัตรประชาชน (CID)
                    </label>
                    <select
                      value={mapping.cidKey}
                      onChange={e => setMapping(prev => ({ ...prev, cidKey: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-purple-600"
                    >
                      <option value="">-- เลือกคอลัมน์ --</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      ประเภทประชากร (Type)
                    </label>
                    <select
                      value={mapping.typeKey}
                      onChange={e => setMapping(prev => ({ ...prev, typeKey: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-purple-600"
                    >
                      <option value="">-- เริ่มต้นเป็น Type 1 --</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      เบอร์โทรศัพท์
                    </label>
                    <select
                      value={mapping.phoneKey}
                      onChange={e => setMapping(prev => ({ ...prev, phoneKey: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-purple-600"
                    >
                      <option value="">-- ไม่ระบุ --</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      หมายเหตุ
                    </label>
                    <select
                      value={mapping.notesKey}
                      onChange={e => setMapping(prev => ({ ...prev, notesKey: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-purple-600"
                    >
                      <option value="">-- ไม่ระบุ --</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-purple-900 mb-1">
                      อสม. ผู้รับผิดชอบ
                    </label>
                    <select
                      value={mapping.osmKey}
                      onChange={e => setMapping(prev => ({ ...prev, osmKey: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs bg-purple-50/50 border border-purple-300 rounded-lg focus:bg-white focus:outline-purple-600 text-purple-950 font-medium"
                    >
                      <option value="">-- ไม่ระบุ (มอบหมายภายหลัง) --</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Data Preview */}
              <div>
                <h4 className="font-semibold text-slate-800 text-xs mb-1.5">
                  ตัวอย่างข้อมูลที่จะนำเข้า (5 รายการแรก):
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-44 text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="p-2">บ้านเลขที่</th>
                        <th className="p-2">หมู่</th>
                        <th className="p-2">ชื่อ - สกุล</th>
                        <th className="p-2">อสม. ผู้รับผิดชอบ</th>
                        <th className="p-2">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {previewConverted.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 font-medium">{item.houseNo}</td>
                          <td className="p-2">ม.{item.villageNo}</td>
                          <td className="p-2">{item.prefix}{item.firstName} {item.lastName}</td>
                          <td className="p-2 text-purple-900 font-medium">{item.assignedOsm || '-'}</td>
                          <td className="p-2">
                            <span className="font-semibold text-purple-800">Type {item.currentType}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Import Options */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-semibold text-slate-800 block">รูปแบบการนำเข้า:</span>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-purple-700 focus:ring-purple-500"
                    />
                    <span><strong>แทนที่ทั้งหมด</strong> (ล้างข้อมูลเก่าแล้วใช้ไฟล์นี้)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="text-purple-700 focus:ring-purple-500"
                    />
                    <span><strong>รวมกับของเดิม</strong> (เพิ่มต่อท้ายประชากรปัจจุบัน)</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            ยกเลิก
          </button>

          {previewStep !== 'upload' && (
            <button
              type="button"
              onClick={handleConfirmImport}
              className="px-5 py-2.5 text-xs font-medium text-white bg-purple-700 hover:bg-purple-800 rounded-lg transition-colors shadow-xs shadow-purple-700/20 flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              ยืนยันนำเข้าข้อมูล ({rawRows.length} คน)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
