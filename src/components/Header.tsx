import React from 'react';
import { FileSpreadsheet, BookOpen, BarChart3, ClipboardCheck, Table } from 'lucide-react';

export type AppView = 'survey' | 'dashboard' | 'table';

interface HeaderProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  onOpenImport: () => void;
  onOpenGuide: () => void;
  hospitalName: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  onOpenImport,
  onOpenGuide,
  hospitalName,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-purple-100 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
        
        {/* Brand & Hospital Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div 
            onClick={() => onViewChange('survey')}
            className="w-9 h-9 rounded-xl bg-purple-700 text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer active:scale-95 transition-transform shadow-purple-700/20"
          >
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div 
            onClick={() => onViewChange('survey')}
            className="cursor-pointer min-w-0"
          >
            <div className="text-sm sm:text-base font-bold tracking-tight text-purple-950 truncate leading-tight">
              ระบบสำรวจ Type ประชากร
            </div>
            <div className="text-[11px] sm:text-xs text-slate-500 truncate leading-tight mt-0.5">
              {hospitalName || 'รพ.สต.บ้านคลองเสาเหนือ'}
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links (Hidden on mobile to eliminate cramped layout and ugly scrollbars) */}
        <nav className="hidden md:flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600">
          <button
            onClick={() => onViewChange('survey')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentView === 'survey'
                ? 'text-purple-800 bg-purple-50 font-semibold ring-1 ring-purple-600/20'
                : 'hover:text-purple-900 hover:bg-purple-50/50'
            }`}
          >
            <ClipboardCheck className="w-4 h-4 text-purple-700" />
            <span>โหมดสำรวจ (อสม.)</span>
          </button>

          <button
            onClick={() => onViewChange('dashboard')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentView === 'dashboard'
                ? 'text-purple-800 bg-purple-50 font-semibold ring-1 ring-purple-600/20'
                : 'hover:text-purple-900 hover:bg-purple-50/50'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-slate-500" />
            <span>แดชบอร์ดสรุปผล</span>
          </button>

          <button
            onClick={() => onViewChange('table')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentView === 'table'
                ? 'text-purple-800 bg-purple-50 font-semibold ring-1 ring-purple-600/20'
                : 'hover:text-purple-900 hover:bg-purple-50/50'
            }`}
          >
            <Table className="w-4 h-4 text-slate-500" />
            <span>ตารางข้อมูลประชากร</span>
          </button>

          <button
            onClick={onOpenGuide}
            className="px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 text-slate-600 hover:text-purple-900 hover:bg-purple-50/50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>คู่มือเกณฑ์ Type 1-3</span>
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Guide Button for Mobile */}
          <button
            onClick={onOpenGuide}
            className="md:hidden p-2 text-slate-600 hover:text-purple-800 hover:bg-purple-50 rounded-xl transition-colors active:scale-95"
            title="คู่มือเกณฑ์ Type 1-3"
            aria-label="คู่มือเกณฑ์ Type 1-3"
          >
            <BookOpen className="w-5 h-5 text-amber-600" />
          </button>

          {/* Excel File Management Button */}
          <button
            onClick={onOpenImport}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 active:bg-purple-900 rounded-xl transition-all whitespace-nowrap shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-purple-700/20"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">จัดการไฟล์ Excel</span>
            <span className="sm:hidden">ไฟล์ Excel</span>
          </button>
        </div>

      </div>
    </header>
  );
};
