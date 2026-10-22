import { Person } from '../types/survey';
import { SAMPLE_PEOPLE, INITIAL_HOSPITAL_NAME } from '../data/sampleData';

const STORAGE_KEY_PEOPLE = 'osm_survey_people_v5';
const STORAGE_KEY_HOSPITAL = 'osm_survey_hospital_name_v5';
const STORAGE_KEY_ACTIVE_OSM = 'osm_active_surveyor_v5';

// Clear previous storage keys from prior versions so old sample data does not linger
try {
  localStorage.removeItem('osm_survey_people_v4');
  localStorage.removeItem('osm_survey_people_v3');
  localStorage.removeItem('osm_survey_people_v2');
  localStorage.removeItem('osm_survey_people_v1');
  localStorage.removeItem('osm_survey_hospital_name_v4');
  localStorage.removeItem('osm_survey_hospital_name_v3');
  localStorage.removeItem('osm_survey_hospital_name_v2');
  localStorage.removeItem('osm_active_surveyor_v3');
  localStorage.removeItem('osm_active_surveyor_v4');
} catch (e) {
  // ignore
}

export function loadSavedPeople(): Person[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PEOPLE);
    if (!raw) {
      // Clean default: empty list, waiting for Excel import only
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load people from localStorage:', e);
    return [];
  }
}

export function savePeople(people: Person[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PEOPLE, JSON.stringify(people));
  } catch (e) {
    console.error('Failed to save people to localStorage:', e);
  }
}

export function clearAllData(): Person[] {
  try {
    localStorage.removeItem(STORAGE_KEY_PEOPLE);
  } catch (e) {
    console.error('Failed to clear data:', e);
  }
  return [];
}

export function loadHospitalName(): string {
  try {
    const val = localStorage.getItem(STORAGE_KEY_HOSPITAL);
    if (!val || val === 'รพ.สต.' || val.includes('หนองดอนสุขใจ')) {
      saveHospitalName(INITIAL_HOSPITAL_NAME);
      return INITIAL_HOSPITAL_NAME;
    }
    return val;
  } catch {
    return INITIAL_HOSPITAL_NAME;
  }
}

export function saveHospitalName(name: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_HOSPITAL, name);
  } catch (e) {
    console.error('Failed to save hospital name:', e);
  }
}

export function loadActiveSurveyor(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_OSM) || "อสม. ผู้สำรวจ";
  } catch {
    return "อสม. ผู้สำรวจ";
  }
}

export function saveActiveSurveyor(name: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_OSM, name);
  } catch (e) {
    console.error('Failed to save active surveyor:', e);
  }
}

export function loadSampleDemoData(): Person[] {
  savePeople(SAMPLE_PEOPLE);
  return SAMPLE_PEOPLE;
}
