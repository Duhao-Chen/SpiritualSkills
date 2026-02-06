// db.js — IndexedDB storage layer for Spiritual Skills

const DB_NAME = 'SpiritualSkillsDB';
const DB_VERSION = 1;

const STORES = {
  meditations: 'meditations',
  skills: 'skills',
  skillCheckins: 'skillCheckins',
  quotes: 'quotes',
  affirmations: 'affirmations',
  affirmationLogs: 'affirmationLogs',
  settings: 'settings'
};

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;

      // Meditation logs: keyed by "date-session" e.g. "2026-02-06-morning"
      if (!db.objectStoreNames.contains(STORES.meditations)) {
        const store = db.createObjectStore(STORES.meditations, { keyPath: 'id' });
        store.createIndex('date', 'date', { unique: false });
      }

      // Skill definitions
      if (!db.objectStoreNames.contains(STORES.skills)) {
        db.createObjectStore(STORES.skills, { keyPath: 'id' });
      }

      // Daily skill check-ins: keyed by "date-skillId"
      if (!db.objectStoreNames.contains(STORES.skillCheckins)) {
        const store = db.createObjectStore(STORES.skillCheckins, { keyPath: 'id' });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('skillId', 'skillId', { unique: false });
      }

      // Quotes
      if (!db.objectStoreNames.contains(STORES.quotes)) {
        const store = db.createObjectStore(STORES.quotes, { keyPath: 'id' });
        store.createIndex('status', 'status', { unique: false });
      }

      // Affirmation definitions
      if (!db.objectStoreNames.contains(STORES.affirmations)) {
        db.createObjectStore(STORES.affirmations, { keyPath: 'id' });
      }

      // Affirmation daily logs
      if (!db.objectStoreNames.contains(STORES.affirmationLogs)) {
        const store = db.createObjectStore(STORES.affirmationLogs, { keyPath: 'id' });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('affirmationId', 'affirmationId', { unique: false });
      }

      // App settings
      if (!db.objectStoreNames.contains(STORES.settings)) {
        db.createObjectStore(STORES.settings, { keyPath: 'key' });
      }
    };
  });
}

// Generic CRUD helpers

async function dbPut(storeName, data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(data);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function dbGet(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbGetAll(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbDelete(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function dbGetByIndex(storeName, indexName, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const idx = tx.objectStore(storeName).index(indexName);
    const req = idx.getAll(value);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ── Meditation API ──

async function saveMeditation(date, session, techniques, durationMinutes, journal) {
  const id = `${date}-${session}`;
  await dbPut(STORES.meditations, {
    id, date, session, techniques, durationMinutes, journal,
    updatedAt: new Date().toISOString()
  });
}

async function getMeditation(date, session) {
  return dbGet(STORES.meditations, `${date}-${session}`);
}

async function getMeditationsByDate(date) {
  return dbGetByIndex(STORES.meditations, 'date', date);
}

async function getAllMeditations() {
  return dbGetAll(STORES.meditations);
}

// ── Skills API ──

const DEFAULT_SKILLS = [
  { id: 'patience', name: 'Patience', description: 'Remaining calm and even-minded in all circumstances', color: '#C9A96E' },
  { id: 'concentration', name: 'Concentration', description: 'One-pointed focus in meditation and daily tasks', color: '#7B9EA8' },
  { id: 'devotion', name: 'Devotion', description: 'Deepening love for God and Guru', color: '#A67B9E' },
  { id: 'evenmindedness', name: 'Even-mindedness', description: 'Equanimity through all dualities of life', color: '#8BA67B' },
];

async function initDefaultSkills() {
  const existing = await dbGetAll(STORES.skills);
  if (existing.length === 0) {
    for (const skill of DEFAULT_SKILLS) {
      await dbPut(STORES.skills, skill);
    }
  }
}

async function getAllSkills() {
  return dbGetAll(STORES.skills);
}

async function saveSkill(skill) {
  await dbPut(STORES.skills, skill);
}

async function deleteSkill(id) {
  await dbDelete(STORES.skills, id);
}

async function saveSkillCheckin(date, skillId, practiced, note) {
  const id = `${date}-${skillId}`;
  await dbPut(STORES.skillCheckins, {
    id, date, skillId, practiced, note,
    updatedAt: new Date().toISOString()
  });
}

async function getSkillCheckin(date, skillId) {
  return dbGet(STORES.skillCheckins, `${date}-${skillId}`);
}

async function getSkillCheckinsByDate(date) {
  return dbGetByIndex(STORES.skillCheckins, 'date', date);
}

async function getSkillCheckinsBySkill(skillId) {
  return dbGetByIndex(STORES.skillCheckins, 'skillId', skillId);
}

async function getAllSkillCheckins() {
  return dbGetAll(STORES.skillCheckins);
}

// ── Skill Stats ──

async function getSkillStats(skillId) {
  const checkins = await getSkillCheckinsBySkill(skillId);
  const practiced = checkins.filter(c => c.practiced).sort((a, b) => a.date.localeCompare(b.date));
  const totalDays = practiced.length;

  // Current streak
  let currentStreak = 0;
  const today = getToday();
  let checkDate = today;
  while (true) {
    const found = practiced.find(c => c.date === checkDate);
    if (found) {
      currentStreak++;
      checkDate = offsetDate(checkDate, -1);
    } else {
      break;
    }
  }

  // Longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate = null;
  for (const c of practiced) {
    if (prevDate && daysBetween(prevDate, c.date) === 1) {
      tempStreak++;
    } else {
      tempStreak = 1;
    }
    longestStreak = Math.max(longestStreak, tempStreak);
    prevDate = c.date;
  }

  return { totalDays, currentStreak, longestStreak, checkins: practiced };
}

// ── Quotes API ──

async function saveQuote(quote) {
  if (!quote.id) quote.id = 'q-' + Date.now();
  if (!quote.addedDate) quote.addedDate = getToday();
  if (!quote.status) quote.status = 'active';
  await dbPut(STORES.quotes, quote);
  return quote;
}

async function getActiveQuotes() {
  return dbGetByIndex(STORES.quotes, 'status', 'active');
}

async function getArchivedQuotes() {
  return dbGetByIndex(STORES.quotes, 'status', 'archived');
}

async function archiveQuote(id) {
  const quote = await dbGet(STORES.quotes, id);
  if (quote) {
    quote.status = 'archived';
    quote.archivedDate = getToday();
    await dbPut(STORES.quotes, quote);
  }
}

async function restoreQuote(id) {
  const quote = await dbGet(STORES.quotes, id);
  if (quote) {
    quote.status = 'active';
    quote.archivedDate = null;
    await dbPut(STORES.quotes, quote);
  }
}

async function deleteQuote(id) {
  await dbDelete(STORES.quotes, id);
}

// ── Affirmations API ──

async function saveAffirmation(aff) {
  if (!aff.id) aff.id = 'aff-' + Date.now();
  if (!aff.addedDate) aff.addedDate = getToday();
  if (aff.active === undefined) aff.active = true;
  await dbPut(STORES.affirmations, aff);
  return aff;
}

async function getAllAffirmations() {
  return dbGetAll(STORES.affirmations);
}

async function getActiveAffirmations() {
  const all = await dbGetAll(STORES.affirmations);
  return all.filter(a => a.active);
}

async function saveAffirmationLog(date, affirmationId, durationMinutes) {
  const id = `${date}-${affirmationId}`;
  await dbPut(STORES.affirmationLogs, {
    id, date, affirmationId, practiced: true, durationMinutes,
    updatedAt: new Date().toISOString()
  });
}

async function getAffirmationLogsByDate(date) {
  return dbGetByIndex(STORES.affirmationLogs, 'date', date);
}

async function getAffirmationLogsByAffirmation(affirmationId) {
  return dbGetByIndex(STORES.affirmationLogs, 'affirmationId', affirmationId);
}

async function getAffirmationStats(affirmationId) {
  const logs = await getAffirmationLogsByAffirmation(affirmationId);
  const practiced = logs.filter(l => l.practiced).sort((a, b) => a.date.localeCompare(b.date));
  const totalDays = practiced.length;

  let currentStreak = 0;
  let checkDate = getToday();
  while (true) {
    if (practiced.find(l => l.date === checkDate)) {
      currentStreak++;
      checkDate = offsetDate(checkDate, -1);
    } else break;
  }

  let longestStreak = 0, tempStreak = 0, prevDate = null;
  for (const l of practiced) {
    if (prevDate && daysBetween(prevDate, l.date) === 1) {
      tempStreak++;
    } else {
      tempStreak = 1;
    }
    longestStreak = Math.max(longestStreak, tempStreak);
    prevDate = l.date;
  }

  return { totalDays, currentStreak, longestStreak, logs: practiced };
}

// ── Settings API ──

async function getSetting(key, defaultValue) {
  const result = await dbGet(STORES.settings, key);
  return result ? result.value : defaultValue;
}

async function setSetting(key, value) {
  await dbPut(STORES.settings, { key, value });
}

// ── Date Utilities ──

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function offsetDate(dateStr, days) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function daysBetween(date1, date2) {
  const d1 = new Date(date1 + 'T12:00:00');
  const d2 = new Date(date2 + 'T12:00:00');
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getWeekDates() {
  const today = getToday();
  const d = new Date(today + 'T12:00:00');
  const dayOfWeek = d.getDay(); // 0 = Sunday
  const dates = [];
  for (let i = 0; i < 7; i++) {
    dates.push(offsetDate(today, i - dayOfWeek));
  }
  return dates;
}

function getMonthDates(year, month) {
  const dates = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    dates.push(d.toISOString().split('T')[0]);
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
