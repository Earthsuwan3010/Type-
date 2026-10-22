import React from 'react';
import { X, CheckCircle2, AlertCircle, HelpCircle, Users, ArrowRight } from 'lucide-react';

interface TypeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TypeGuideModal: React.FC<TypeGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-purple-100 flex items-center justify-between bg-purple-800 text-white">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-6 h-6 text-purple-200" />
            <div>
              <h2 id="guide-title" className="text-lg font-bold leading-tight">คู่มือการจำแนก Type ประชากร</h2>
              <p className="text-xs text-purple-100 font-light">เกณฑ์มาตรฐานกระทรวงสาธารณสุข (HDC / JHCIS สำหรับ อสม.)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-purple-100 hover:text-white hover:bg-purple-700 transition-colors cursor-pointer"
            aria-label="ปิดคู่มือ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Quick Decision Rule */}
          <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-4">
            <h3 className="font-semibold text-purple-950 text-base mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-purple-700 shrink-0" />
              สูตรจำง่ายๆ ในการถามประชากร (2 คำถามหลัก)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 mt-3">
              <div className="bg-white p-3 rounded-lg border border-purple-100 shadow-xs">
                <span className="font-bold text-purple-900 block mb-1">คำถามที่ 1: มีชื่อในทะเบียนบ้านไหม?</span>
                <p>ตรวจสอบว่าชื่อของบุคคลนี้ มีอยู่ในเล่มทะเบียนบ้านในเขต รพ.สต. หรือไม่</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-purple-100 shadow-xs">
                <span className="font-bold text-purple-900 block mb-1">คำถามที่ 2: ปัจจุบันตัวอาศัยอยู่จริงไหม?</span>
                <p>กิน นอน หลับ นอนพักในพื้นที่ รพ.สต. เป็นประจำ (ไม่รวมคนไปทำงานที่อื่นเกิน 6 เดือน)</p>
              </div>
            </div>
          </div>

          {/* Types Detail */}
          <div className="space-y-4">
            {/* Type 1 */}
            <div className="border border-purple-300 bg-white rounded-xl p-4.5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-purple-700 text-white font-bold flex items-center justify-center text-sm shadow-xs shadow-purple-700/20">
                    1
                  </span>
                  <span className="font-bold text-slate-900 text-base">Type 1: มีชื่ออยู่ และ ตัวอยู่จริง</span>
                </div>
                <span className="text-xs text-purple-700 font-medium">เป้าหมายบริการหลัก รพ.สต.</span>
              </div>
              <p className="text-slate-600 mb-2.5">
                มีชื่ออยู่ในทะเบียนบ้านในเขตรับผิดชอบ และตัวอาศัยอยู่จริงในพื้นที่เป็นประจำ กินนอนที่บ้านหลังนี้
              </p>
              <div className="bg-slate-50 rounded-lg p-2.5 text-xs text-slate-600 space-y-1">
                <strong className="text-slate-800 block">ตัวอย่าง:</strong>
                <p>• คุณตาคุณยายที่อยู่บ้าน ทำไร่ทำนาในหมู่บ้าน</p>
                <p>• เด็กนักเรียนที่เรียนโรงเรียนในตำบล กลับมานอนบ้านทุกวัน</p>
                <p>• ข้าราชการ/พนักงานที่เดินทางไป-กลับทำงานในละแวกใกล้เคียง</p>
              </div>
            </div>

            {/* Type 2 */}
            <div className="border border-amber-300 bg-white rounded-xl p-4.5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-600 text-white font-bold flex items-center justify-center text-sm">
                    2
                  </span>
                  <span className="font-bold text-slate-900 text-base">Type 2: มีชื่ออยู่ แต่ ตัวไม่อยู่จริง</span>
                </div>
                <span className="text-xs text-amber-700 font-medium">ตัดออกจากตัวหารผลงาน</span>
              </div>
              <p className="text-slate-600 mb-2.5">
                มีชื่ออยู่ในทะเบียนบ้านในเขต แต่ตัวไม่อยู่จริง ออกไปอยู่นอกพื้นที่ติดต่อกันเกิน 6 เดือน (เช่น ไปทำงานต่างจังหวัด ไปเรียน)
              </p>
              <div className="bg-slate-50 rounded-lg p-2.5 text-xs text-slate-600 space-y-1">
                <strong className="text-slate-800 block">ตัวอย่าง:</strong>
                <p>• ลูกหลานไปทำงานโรงงานที่ระยอง ชลบุรี หรือกรุงเทพฯ กลับบ้านเฉพาะปีใหม่/สงกรานต์</p>
                <p>• นักเรียน/นักศึกษาไปเรียนระดับมหาวิทยาลัยพักหอพักต่างจังหวัด</p>
                <p>• ไปทำงานต่างประเทศ หรือถูกเกณฑ์ทหาร</p>
              </div>
            </div>

            {/* Type 3 */}
            <div className="border border-blue-300 bg-white rounded-xl p-4.5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                    3
                  </span>
                  <span className="font-bold text-slate-900 text-base">Type 3: ตัวอยู่จริง แต่ ไม่มีชื่อในทะเบียนบ้าน</span>
                </div>
                <span className="text-xs text-blue-700 font-medium">ประชากรแฝงในพื้นที่</span>
              </div>
              <p className="text-slate-600 mb-2.5">
                ทะเบียนบ้านอยู่ที่อื่น แต่ย้ายเข้ามาพักอาศัยและทำงานในเขต รพ.สต. ติดต่อกันเกิน 6 เดือน (ต้องให้บริการสาธารณสุขและฉีดวัคซีน)
              </p>
              <div className="bg-slate-50 rounded-lg p-2.5 text-xs text-slate-600 space-y-1">
                <strong className="text-slate-800 block">ตัวอย่าง:</strong>
                <p>• แรงงานหรือพนักงานเช่าห้อง/บ้านพัก ทำงานในเขตตำบล</p>
                <p>• คู่สมรสที่แต่งงานย้ายเข้ามาอยู่ด้วย แต่ยังไม่ได้ย้ายชื่อเข้าทะเบียนบ้าน</p>
                <p>• หลานที่พ่อแม่ส่งมาให้ตายายเลี้ยงในหมู่บ้าน</p>
              </div>
            </div>

            {/* Type 4 */}
            <div className="border border-slate-200 bg-white rounded-xl p-4.5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-slate-600 text-white font-bold flex items-center justify-center text-sm">
                    4
                  </span>
                  <span className="font-bold text-slate-900 text-base">Type 4: คนนอกเขตมารับบริการ</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">ไม่มีชื่อ & ไม่อยู่</span>
              </div>
              <p className="text-slate-600 text-xs">
                ไม่มีชื่อในทะเบียนบ้านและไม่ได้อาศัยในเขต แต่แวะมารับบริการที่ รพ.สต. เป็นครั้งคราว (เช่น ผ่านทางมา เกิดอุบัติเหตุ หรือมาเยี่มญาติแล้วป่วย)
              </p>
            </div>
          </div>

          {/* Table summary */}
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-2.5 font-semibold">ประเภท Type</th>
                  <th className="p-2.5 font-semibold">ชื่อในทะเบียนบ้าน</th>
                  <th className="p-2.5 font-semibold">ตัวอยู่จริงในพื้นที่</th>
                  <th className="p-2.5 font-semibold">ผลกระทบต่องาน รพ.สต.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-600">
                <tr className="hover:bg-slate-50">
                  <td className="p-2.5 font-bold text-purple-900">Type 1</td>
                  <td className="p-2.5 text-purple-700 font-semibold">มีชื่อ</td>
                  <td className="p-2.5 text-purple-700 font-semibold">อยู่จริง</td>
                  <td className="p-2.5">เป็นตัวตั้งและตัวหารในทุกตัวชี้วัด (HDC)</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-2.5 font-bold text-amber-800">Type 2</td>
                  <td className="p-2.5 text-amber-700">มีชื่อ</td>
                  <td className="p-2.5 text-rose-700">ไม่อยู่จริง</td>
                  <td className="p-2.5">ตัดออกจากตัวหารคัดกรองเบาหวาน ความดัน มะเร็ง</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-2.5 font-bold text-blue-800">Type 3</td>
                  <td className="p-2.5 text-rose-700">ไม่มีชื่อ</td>
                  <td className="p-2.5 text-blue-700">อยู่จริง</td>
                  <td className="p-2.5">ต้องดูแลสุขภาพ ฉีดวัคซีน คุมโรคไข้เลือดออก</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-white bg-purple-700 rounded-lg hover:bg-purple-800 transition-colors shadow-xs shadow-purple-700/20 cursor-pointer"
          >
            เข้าใจแล้ว ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
