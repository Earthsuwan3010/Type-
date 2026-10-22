import React, { useState, useEffect } from 'react';
import { X, Save, User, Home, Phone, Heart, FileText, Check, AlertTriangle } from 'lucide-react';
import { Person, PopulationType, HealthStatus } from '../types/survey';

interface PersonEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | null;
  onSave: (updated: Person) => void;
  defaultVillageNo?: number;
  defaultHouseNo?: string;
  isNewPerson?: boolean;
}

export const PersonEditModal: React.FC<PersonEditModalProps> = ({
  isOpen,
  onClose,
  person,
  onSave,
  defaultVillageNo = 1,
  defaultHouseNo = '',
  isNewPerson = false,
}) => {
  const [formData, setFormData] = useState<Partial<Person>>({
    cid: '',
    prefix: 'นาย',
    firstName: '',
    lastName: '',
    houseNo: defaultHouseNo,
    villageNo: defaultVillageNo,
    currentType: 1,
    healthStatus: 'normal',
    phone: '',
    relationWithHead: 'ผู้อาศัย',
    notes: '',
    isDeceased: false,
    isSurveyed: true,
  });

  useEffect(() => {
    if (person) {
      setFormData({
        ...person,
      });
    } else {
      setFormData({
        id: `person-${Date.now()}`,
        cid: '',
        prefix: 'นาย',
        firstName: '',
        lastName: '',
        houseNo: defaultHouseNo || '',
        villageNo: defaultVillageNo,
        currentType: 1,
        healthStatus: 'normal',
        phone: '',
        relationWithHead: defaultHouseNo ? 'ผู้อาศัย' : 'เจ้าบ้าน',
        notes: '',
        isDeceased: false,
        isSurveyed: true,
        surveyedAt: new Date().toISOString(),
      });
    }
  }, [person, defaultVillageNo, defaultHouseNo, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName?.trim()) {
      return;
    }

    const finalPerson: Person = {
      id: person?.id || `p-${Date.now()}`,
      cid: formData.cid?.trim() || '',
      prefix: formData.prefix || '',
      firstName: formData.firstName.trim(),
      lastName: formData.lastName?.trim() || '',
      houseNo: formData.houseNo?.trim() || '1',
      villageNo: Number(formData.villageNo) || 1,
      gender: (formData.prefix === 'นาง' || formData.prefix === 'นางสาว' || formData.prefix === 'ด.ญ.') ? 'female' : 'male',
      age: formData.age ? Number(formData.age) : undefined,
      phone: formData.phone?.trim() || '',
      relationWithHead: formData.relationWithHead || '',
      originalType: person?.originalType || formData.currentType || 1,
      currentType: (formData.currentType as PopulationType) || 1,
      isSurveyed: true,
      surveyedAt: new Date().toISOString(),
      surveyorName: formData.surveyorName || person?.surveyorName || 'อสม. ผู้สำรวจ',
      assignedOsm: formData.assignedOsm?.trim() || undefined,
      healthStatus: (formData.healthStatus as HealthStatus) || 'normal',
      notes: formData.notes?.trim() || '',
      isDeceased: Boolean(formData.isDeceased),
    };

    onSave(finalPerson);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-purple-100 flex items-center justify-between bg-purple-50/50">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-purple-700" />
            <h3 className="font-bold text-slate-900 text-base">
              {isNewPerson ? 'เพิ่มรายชื่อประชากรใหม่' : `แก้ไขข้อมูล: ${formData.prefix || ''}${formData.firstName} ${formData.lastName}`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-sm flex-1">
          {/* Type Selection Big Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ประเภทประชากร (Population Type) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, currentType: 1 }))}
                className={`py-2.5 px-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer select-none ${
                  formData.currentType === 1
                    ? 'bg-purple-50 border-purple-500 text-purple-950 font-semibold ring-2 ring-purple-500/20 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <span className="text-base font-bold text-purple-700">Type 1</span>
                <span className="text-[11px] leading-tight mt-0.5">มีชื่อ & อยู่จริง</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, currentType: 2 }))}
                className={`py-2.5 px-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer select-none ${
                  formData.currentType === 2
                    ? 'bg-amber-50 border-amber-500 text-amber-900 font-semibold ring-2 ring-amber-500/20 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <span className="text-base font-bold text-amber-700">Type 2</span>
                <span className="text-[11px] leading-tight mt-0.5">มีชื่อ แต่ไม่อยู่</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, currentType: 3 }))}
                className={`py-2.5 px-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer select-none ${
                  formData.currentType === 3
                    ? 'bg-blue-50 border-blue-500 text-blue-900 font-semibold ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <span className="text-base font-bold text-blue-700">Type 3</span>
                <span className="text-[11px] leading-tight mt-0.5">อยู่จริง แต่ไม่มีชื่อ</span>
              </button>
            </div>
          </div>

          {/* House and Village */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                หมู่ที่ <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.villageNo || 1}
                onChange={e => setFormData(prev => ({ ...prev, villageNo: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-purple-600"
              >
                <option value={1}>หมู่ 1</option>
                <option value={2}>หมู่ 2</option>
                <option value={3}>หมู่ 3</option>
                <option value={4}>หมู่ 4</option>
                <option value={5}>หมู่ 5</option>
                <option value={6}>หมู่ 6</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                บ้านเลขที่ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.houseNo || ''}
                onChange={e => setFormData(prev => ({ ...prev, houseNo: e.target.value }))}
                placeholder="เช่น 15, 24/1"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-purple-600"
              />
            </div>
          </div>

          {/* Name & Prefix */}
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-4">
              <label className="block text-xs font-medium text-slate-700 mb-1">คำนำหน้า</label>
              <select
                value={formData.prefix || 'นาย'}
                onChange={e => setFormData(prev => ({ ...prev, prefix: e.target.value }))}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-purple-600 text-xs"
              >
                <option value="นาย">นาย</option>
                <option value="นาง">นาง</option>
                <option value="นางสาว">นางสาว</option>
                <option value="ด.ช.">ด.ช.</option>
                <option value="ด.ญ.">ด.ญ.</option>
                <option value="พระ">พระ</option>
              </select>
            </div>
            <div className="col-span-4">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                ชื่อ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.firstName || ''}
                onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="ชื่อจริง"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-purple-600"
              />
            </div>
            <div className="col-span-4">
              <label className="block text-xs font-medium text-slate-700 mb-1">นามสกุล</label>
              <input
                type="text"
                value={formData.lastName || ''}
                onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="นามสกุล"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-purple-600"
              />
            </div>
          </div>

          {/* CID and Relation */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                เลขบัตรประชาชน (13 หลัก)
              </label>
              <input
                type="text"
                maxLength={13}
                value={formData.cid || ''}
                onChange={e => setFormData(prev => ({ ...prev, cid: e.target.value.replace(/[^0-9]/g, '') }))}
                placeholder="3400100xxxxxx"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono text-xs focus:bg-white focus:outline-purple-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                ความสัมพันธ์กับเจ้าบ้าน
              </label>
              <select
                value={formData.relationWithHead || 'ผู้อาศัย'}
                onChange={e => setFormData(prev => ({ ...prev, relationWithHead: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-purple-600"
              >
                <option value="เจ้าบ้าน">เจ้าบ้าน</option>
                <option value="คู่สมรส">คู่สมรส</option>
                <option value="บุตร">บุตร</option>
                <option value="บิดา/มารดา">บิดา/มารดา</option>
                <option value="หลาน">หลาน</option>
                <option value="ผู้อาศัย">ผู้อาศัย / ผู้เช่า</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>
          </div>

          {/* Health Status & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                สถานะสุขภาพ (สำหรับ รพ.สต.)
              </label>
              <select
                value={formData.healthStatus || 'normal'}
                onChange={e => setFormData(prev => ({ ...prev, healthStatus: e.target.value as HealthStatus }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-purple-600"
              >
                <option value="normal">ปกติ / แข็งแรง</option>
                <option value="chronic">มีโรคเรื้อรัง (เบาหวาน/ความดัน)</option>
                <option value="homebound">ผู้ป่วยติดบ้าน (เคลื่อนไหวยาก)</option>
                <option value="bedridden">ผู้ป่วยติดเตียง (ช่วยเหลือตัวเองไม่ได้)</option>
                <option value="elderly">ผู้สูงอายุ (60 ปีขึ้นไป)</option>
                <option value="pregnant">หญิงตั้งครรภ์</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                เบอร์โทรศัพท์
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="เช่น 0812345678"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-purple-600"
              />
            </div>
          </div>

          {/* Assigned OSM */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              อสม. ผู้รับผิดชอบหลังคาเรือนนี้
            </label>
            <input
              type="text"
              value={formData.assignedOsm || ''}
              onChange={e => setFormData(prev => ({ ...prev, assignedOsm: e.target.value }))}
              placeholder="เช่น อสม. สมจิต ดวงแก้ว"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-purple-600 text-xs"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              หมายเหตุ / ข้อมูลเพิ่มเติม
            </label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="เช่น ไปทำงานโรงงานชลบุรี, ย้ายมาจาก อ.น้ำพอง, มีผู้ดูแลชื่อ..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-purple-600 text-xs resize-none"
            />
          </div>

          {/* Deceased Checkbox */}
          <div className="pt-1">
            <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(formData.isDeceased)}
                onChange={e => setFormData(prev => ({ ...prev, isDeceased: e.target.checked }))}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
              />
              <span className="text-xs text-slate-700 font-medium">
                บุคคลนี้เสียชีวิตแล้ว (แจ้งจำหน่ายออกจากทะเบียน รพ.สต.)
              </span>
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-purple-700 text-white rounded-xl font-medium text-sm hover:bg-purple-800 transition-colors shadow-xs shadow-purple-700/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              บันทึกข้อมูลการสำรวจ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
