import React from 'react';
import { ClipboardCheck, BarChart3, Table, BookOpen, FileSpreadsheet } from 'lucide-react';
import { AppView } from './Header';

interface MobileBottomNavProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  onOpenGuide: () => void;
  onOpenImport: () => void;
  totalSurveyedCount?: number;
  totalPeopleCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onViewChange,
  onOpenGuide,
  onOpenImport,
}) => {
  return (
    <nav 
      aria-label="เมนูหลักสำหรับมือถือ"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-purple-100 shadow-[0_-4px_16px_rgba(124,58,237,0.06)] px-1 pt-1.5 pb-safe pb-2"
    >
      <div className="grid grid-cols-5 items-center gap-0.5 max-w-md mx-auto">
        {/* Tab 1: Survey View */}
        <button
          type="button"
          onClick={() => onViewChange('survey')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer select-none active:scale-90 ${
            currentView === 'survey'
              ? 'text-purple-800 font-bold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <div className={`p-1 rounded-xl transition-colors ${
            currentView === 'survey' ? 'bg-purple-100/90 text-purple-800 shadow-2xs' : ''
          }`}>
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight truncate w-full text-center">
            สำรวจ อสม.
          </span>
        </button>

        {/* Tab 2: Dashboard View */}
        <button
          type="button"
          onClick={() => onViewChange('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer select-none active:scale-90 ${
            currentView === 'dashboard'
              ? 'text-purple-800 font-bold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <div className={`p-1 rounded-xl transition-colors ${
            currentView === 'dashboard' ? 'bg-purple-100/90 text-purple-800 shadow-2xs' : ''
          }`}>
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight truncate w-full text-center">
            แดชบอร์ด
          </span>
        </button>

        {/* Tab 3: Data Table View */}
        <button
          type="button"
          onClick={() => onViewChange('table')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer select-none active:scale-90 ${
            currentView === 'table'
              ? 'text-purple-800 font-bold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <div className={`p-1 rounded-xl transition-colors ${
            currentView === 'table' ? 'bg-purple-100/90 text-purple-800 shadow-2xs' : ''
          }`}>
            <Table className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight truncate w-full text-center">
            ตารางข้อมูล
          </span>
        </button>

        {/* Tab 4: Type Guide Modal */}
        <button
          type="button"
          onClick={onOpenGuide}
          className="flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer select-none text-slate-500 hover:text-amber-800 font-medium active:scale-90"
        >
          <div className="p-1 rounded-xl transition-colors hover:bg-amber-50">
            <BookOpen className="w-5 h-5 text-amber-600" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight truncate w-full text-center">
            คู่มือ Type
          </span>
        </button>

        {/* Tab 5: Excel Import Modal */}
        <button
          type="button"
          onClick={onOpenImport}
          className="flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer select-none text-slate-500 hover:text-purple-800 font-medium active:scale-90"
        >
          <div className="p-1 rounded-xl transition-colors hover:bg-purple-50">
            <FileSpreadsheet className="w-5 h-5 text-purple-700" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight truncate w-full text-center">
            ไฟล์ Excel
          </span>
        </button>
      </div>
    </nav>
  );
};
