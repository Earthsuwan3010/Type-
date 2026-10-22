/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Person, PopulationType } from './types/survey';
import { 
  loadSavedPeople, 
  savePeople, 
  loadHospitalName, 
  saveHospitalName, 
  loadActiveSurveyor, 
  saveActiveSurveyor,
  clearAllData,
  loadSampleDemoData 
} from './utils/storage';
import { Header, AppView } from './components/Header';
import { VolunteerSurveyView } from './components/VolunteerSurveyView';
import { StaffDashboardView } from './components/StaffDashboardView';
import { DataTableManagement } from './components/DataTableManagement';
import { TypeGuideModal } from './components/TypeGuideModal';
import { PersonEditModal } from './components/PersonEditModal';
import { ExcelImportModal } from './components/ExcelImportModal';
import { MobileBottomNav } from './components/MobileBottomNav';

export default function App() {
  const [people, setPeople] = useState<Person[]>([]);
  const [hospitalName, setHospitalName] = useState<string>('รพ.สต.บ้านคลองเสาเหนือ');
  const [activeSurveyor, setActiveSurveyor] = useState<string>('อสม. ผู้สำรวจ');
  const [currentView, setCurrentView] = useState<AppView>('survey');
  const [preselectedOsm, setPreselectedOsm] = useState<string>('all');

  // Modals state
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [modalVillageNo, setModalVillageNo] = useState<number>(1);
  const [modalHouseNo, setModalHouseNo] = useState<string>('');

  // Initial load: starts clean, empty, awaiting Excel import
  useEffect(() => {
    const saved = loadSavedPeople();
    setPeople(saved);
    setHospitalName(loadHospitalName());
    setActiveSurveyor(loadActiveSurveyor());
  }, []);

  // Update & persist people
  const updatePeopleState = useCallback((newPeople: Person[]) => {
    setPeople(newPeople);
    savePeople(newPeople);
  }, []);

  const handleUpdateHospitalName = (name: string) => {
    setHospitalName(name);
    saveHospitalName(name);
  };

  const handleSurveyorChange = (name: string) => {
    setActiveSurveyor(name);
    saveActiveSurveyor(name);
  };

  // Quick 1-tap update type from volunteer view
  const handleQuickUpdateType = (personId: string, newType: PopulationType, surveyor: string) => {
    const updated = people.map(p => {
      if (p.id === personId) {
        return {
          ...p,
          currentType: newType,
          isSurveyed: true,
          surveyedAt: new Date().toISOString(),
          surveyorName: surveyor || p.surveyorName || 'อสม. ผู้สำรวจ',
        };
      }
      return p;
    });
    updatePeopleState(updated);
  };

  // Single person save (edit or new)
  const handleSavePerson = (personToSave: Person) => {
    const exists = people.some(p => p.id === personToSave.id);
    let nextList: Person[];
    if (exists) {
      nextList = people.map(p => p.id === personToSave.id ? personToSave : p);
    } else {
      nextList = [personToSave, ...people];
    }
    updatePeopleState(nextList);
  };

  // Delete person
  const handleDeletePerson = (id: string) => {
    const nextList = people.filter(p => p.id !== id);
    updatePeopleState(nextList);
  };

  // Batch update Type
  const handleBatchUpdateType = (ids: string[], newType: PopulationType) => {
    const idSet = new Set(ids);
    const updated = people.map(p => {
      if (idSet.has(p.id)) {
        return {
          ...p,
          currentType: newType,
          isSurveyed: true,
          surveyedAt: new Date().toISOString(),
          surveyorName: activeSurveyor || p.surveyorName,
        };
      }
      return p;
    });
    updatePeopleState(updated);
  };

  // Batch delete
  const handleBatchDelete = (ids: string[]) => {
    const idSet = new Set(ids);
    const nextList = people.filter(p => !idSet.has(p.id));
    updatePeopleState(nextList);
  };

  // Batch assign OSM
  const handleBatchAssignOsm = (ids: string[], osmName: string) => {
    const idSet = new Set(ids);
    const updated = people.map(p => {
      if (idSet.has(p.id)) {
        return {
          ...p,
          assignedOsm: osmName,
        };
      }
      return p;
    });
    updatePeopleState(updated);
  };

  // Excel import success
  const handleImportSuccess = (imported: Person[], mode: 'replace' | 'append') => {
    if (mode === 'replace') {
      updatePeopleState(imported);
    } else {
      updatePeopleState([...people, ...imported]);
    }
  };

  // Clear all data to empty state
  const handleClearAllData = () => {
    const empty = clearAllData();
    setPeople(empty);
  };

  // Optional: load demo data
  const handleLoadDemoData = () => {
    const sample = loadSampleDemoData();
    setPeople(sample);
  };

  // Open edit modal
  const handleOpenEditModal = (person: Person | null, villageNo: number = 1, houseNo: string = '') => {
    setEditingPerson(person);
    setModalVillageNo(villageNo);
    setModalHouseNo(houseNo);
    setIsEditOpen(true);
  };

  const handleSelectOsmForSurvey = (osmName: string) => {
    setPreselectedOsm(osmName);
    if (osmName && osmName !== 'all' && osmName !== 'unassigned') {
      setActiveSurveyor(osmName);
    }
    setCurrentView('survey');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Prompt',sans-serif]">
      {/* 3-zone Top Bar */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        hospitalName={hospitalName}
      />

      {/* Main View Container with bottom padding for mobile bar */}
      <main className="flex-1 pb-24 md:pb-16">
        {currentView === 'survey' && (
          <VolunteerSurveyView
            people={people}
            onUpdatePerson={handleSavePerson}
            onQuickUpdateType={handleQuickUpdateType}
            onOpenEditModal={handleOpenEditModal}
            onOpenGuide={() => setIsGuideOpen(true)}
            onOpenImport={() => setIsImportOpen(true)}
            onLoadDemoData={handleLoadDemoData}
            activeSurveyor={activeSurveyor}
            onSurveyorChange={handleSurveyorChange}
            hospitalName={hospitalName}
            preselectedOsm={preselectedOsm}
          />
        )}

        {currentView === 'dashboard' && (
          <StaffDashboardView
            people={people}
            hospitalName={hospitalName}
            onUpdateHospitalName={handleUpdateHospitalName}
            onClearData={handleClearAllData}
            onLoadDemoData={handleLoadDemoData}
            onOpenImport={() => setIsImportOpen(true)}
            onOpenGuide={() => setIsGuideOpen(true)}
            onSelectOsmForSurvey={handleSelectOsmForSurvey}
          />
        )}

        {currentView === 'table' && (
          <DataTableManagement
            people={people}
            onUpdatePerson={handleSavePerson}
            onDeletePerson={handleDeletePerson}
            onBatchUpdateType={handleBatchUpdateType}
            onBatchDelete={handleBatchDelete}
            onBatchAssignOsm={handleBatchAssignOsm}
            onOpenEditModal={handleOpenEditModal}
            onOpenImport={() => setIsImportOpen(true)}
            hospitalName={hospitalName}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <MobileBottomNav
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
      />

      {/* Desktop Footer (hidden on mobile to make room for bottom nav bar) */}
      <footer className="hidden md:block bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <p>
          ระบบสำรวจสถานะบุคคล (Type 1-3) แฟ้ม PERSON · ออกแบบสำหรับ อสม. และเจ้าหน้าที่สาธารณสุข รพ.สต.
        </p>
      </footer>

      {/* Modals */}
      <TypeGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <ExcelImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      <PersonEditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        person={editingPerson}
        onSave={handleSavePerson}
        defaultVillageNo={modalVillageNo}
        defaultHouseNo={modalHouseNo}
        isNewPerson={editingPerson === null}
      />
    </div>
  );
}
