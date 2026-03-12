// app.js — Spiritual Skills PWA

// ══════════════════════════════════════════
// Router & Navigation
// ══════════════════════════════════════════

let currentPage = 'home';
let subPage = null;
let subPageData = null;

function navigate(page, sub = null, data = null) {
  currentPage = page;
  subPage = sub;
  subPageData = data;
  render();
  window.scrollTo(0, 0);
}

// ══════════════════════════════════════════
// SVG Icons (inline, no dependencies)
// ══════════════════════════════════════════

const ICONS = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>`,
  quote: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.76-2.02-2-2H4c-1.25 0-2 .76-2 2v6c0 1.25.76 2 2 2h4"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.76-2.02-2-2h-4c-1.25 0-2 .76-2 2v6c0 1.25.76 2 2 2h4"/></svg>`,
  practice: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
  skills: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
  journal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>`,
  archive: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
};

// ══════════════════════════════════════════
// Rendering Engine
// ══════════════════════════════════════════

let _appEl = null;
let _navEl = null;
const app = () => _appEl || (_appEl = document.getElementById('app'));
const nav = () => _navEl || (_navEl = document.getElementById('nav'));

async function render() {
  try {
    // Render navigation
    nav().innerHTML = renderNav();

    // Render current page
    let html = '';
    switch (currentPage) {
      case 'home': html = await renderHome(); break;
      case 'quotes': html = subPage === 'add' ? renderQuoteForm() :
                            subPage === 'view' ? await renderQuoteView(subPageData) :
                            await renderQuotes(); break;
      case 'practice': html = subPage === 'meditation' ? await renderMeditationForm(subPageData) :
                              subPage === 'affirmation-log' ? await renderAffirmationLogForm(subPageData) :
                              subPage === 'add-affirmation' ? renderAffirmationForm() :
                              await renderPractice(); break;
      case 'skills': html = subPage === 'detail' ? await renderSkillDetail(subPageData) :
                            subPage === 'add' ? renderSkillForm() :
                            await renderSkills(); break;
      case 'settings': html = await renderSettings(); break;
      default: html = await renderHome();
    }
    app().innerHTML = html;
    attachEventListeners();
  } catch (err) {
    console.error('Render error:', err);
    app().innerHTML = `
      <div class="empty-state">
        <p style="color:var(--danger)">Something went wrong loading this page.</p>
        <button class="btn btn-outline btn-sm" onclick="navigate('home')">Go Home</button>
      </div>
    `;
  }
}

function renderNav() {
  const items = [
    { id: 'home', icon: ICONS.home, label: 'Home' },
    { id: 'quotes', icon: ICONS.quote, label: 'Quotes' },
    { id: 'practice', icon: ICONS.practice, label: 'Practice' },
    { id: 'skills', icon: ICONS.skills, label: 'Skills' },
    { id: 'settings', icon: ICONS.settings, label: 'Settings' },
  ];
  return items.map(i => `
    <button class="nav-item ${currentPage === i.id ? 'active' : ''}" data-nav="${i.id}">
      ${i.icon}
      <span>${i.label}</span>
    </button>
  `).join('');
}

// ══════════════════════════════════════════
// HOME / DASHBOARD
// ══════════════════════════════════════════

async function renderHome() {
  const today = getToday();
  const todayFormatted = new Date(today + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  });

  // Load all data
  const [morningMed, eveningMed, activeQuotes, skillsList, skillCheckins, activeAffs, affLogs, userName] = await Promise.all([
    getMeditation(today, 'morning'),
    getMeditation(today, 'evening'),
    getActiveQuotes(),
    getAllSkills(),
    getSkillCheckinsByDate(today),
    getActiveAffirmations(),
    getAffirmationLogsByDate(today),
    getSetting('userName', ''),
  ]);

  const displayName = userName ? `, ${escHtml(userName)}` : '';

  let html = `
    <div class="greeting">${getGreeting()}${displayName}</div>
    <div class="greeting-date">${todayFormatted}</div>
  `;

  // Active Quotes
  if (activeQuotes.length > 0) {
    html += `<div class="section-label">Contemplations</div>`;
    activeQuotes.slice(0, 3).forEach(q => {
      const days = daysBetween(q.addedDate, today) + 1;
      const preview = q.text.length > 80 ? q.text.substring(0, 80) + '...' : q.text;
      html += `
        <div class="quote-card" data-action="viewQuote" data-id="${q.id}">
          <div class="quote-text">"${escHtml(preview)}"</div>
          <div class="quote-source">${escHtml(q.source || '')}</div>
          <div class="quote-days">Day ${days}</div>
        </div>
      `;
    });
  }

  // Today's Meditation
  html += `<div class="section-label">Meditation</div>`;
  html += renderMeditationCard('Morning', morningMed, 'morning');
  html += renderMeditationCard('Evening', eveningMed, 'evening');

  // Affirmations summary
  if (activeAffs.length > 0) {
    html += `<div class="section-label">Affirmations</div>`;
    for (const aff of activeAffs) {
      const stats = await getAffirmationStats(aff.id);
      const loggedToday = affLogs.find(l => l.affirmationId === aff.id);
      html += `
        <div class="card" data-action="logAffirmation" data-id="${aff.id}" style="cursor:pointer">
          <div class="card-row">
            <div>
              <div class="card-title" style="font-style:italic;font-size:14px">"${escHtml(aff.text.substring(0, 50))}${aff.text.length > 50 ? '...' : ''}"</div>
              <div class="card-subtitle">Day ${stats.currentStreak} streak ${loggedToday ? ' — Practiced today' : ''}</div>
            </div>
            <div class="toggle-box ${loggedToday ? 'checked' : ''}" style="pointer-events:none"></div>
          </div>
        </div>
      `;
    }
  }

  // Spiritual Skills
  if (skillsList.length > 0) {
    html += `<div class="section-label">Spiritual Skills</div>`;
    html += `<div class="skills-grid">`;
    for (const skill of skillsList) {
      const stats = await getSkillStats(skill.id);
      const checkedToday = skillCheckins.find(c => c.skillId === skill.id && c.practiced);
      const circumference = 2 * Math.PI * 22;
      // Progress ring: fraction of last 30 days practiced
      const last30 = Math.min(stats.totalDays / 30, 1);
      const dashoffset = circumference * (1 - last30);
      html += `
        <div class="skill-card" data-action="viewSkill" data-id="${skill.id}">
          <div class="skill-ring">
            <svg viewBox="0 0 56 56">
              <circle class="ring-bg" cx="28" cy="28" r="22"/>
              <circle class="ring-fill" cx="28" cy="28" r="22"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${dashoffset}"
                style="stroke:${skill.color || 'var(--gold)'}"/>
            </svg>
            <div class="ring-text">${stats.totalDays}</div>
          </div>
          <div class="skill-name">${escHtml(skill.name)}</div>
          <div class="skill-streak">${checkedToday ? 'Tended today' : stats.currentStreak > 0 ? stats.currentStreak + ' day streak' : 'Not yet today'}</div>
        </div>
      `;
    }
    html += `</div>`;
  }

  return html;
}

function renderMeditationCard(label, data, session) {
  const techniques = [
    { key: 'energization', name: 'Energization' },
    { key: 'hongSau', name: 'Hong-Sau' },
    { key: 'aum', name: 'AUM' },
  ];
  const hasTech = data && data.techniques;
  return `
    <div class="meditation-card" data-action="editMeditation" data-session="${session}">
      <div class="session-label">${label} Meditation</div>
      ${techniques.map(t => `
        <div class="technique-row">
          <div class="technique-check ${hasTech && data.techniques[t.key] ? 'done' : ''}"></div>
          <span class="technique-name">${t.name}</span>
        </div>
      `).join('')}
      ${data && data.durationMinutes ? `<div class="meditation-duration">${data.durationMinutes} minutes</div>` : ''}
      ${data && data.journal ? `<div class="meditation-journal-preview">${escHtml(data.journal)}</div>` : ''}
    </div>
  `;
}

// ══════════════════════════════════════════
// MEDITATION FORM
// ══════════════════════════════════════════

async function renderMeditationForm(session) {
  const today = getToday();
  const existing = await getMeditation(today, session);
  const label = session === 'morning' ? 'Morning' : 'Evening';
  const techniques = [
    { key: 'energization', name: 'Energization Exercises' },
    { key: 'hongSau', name: 'Hong-Sau Technique' },
    { key: 'aum', name: 'AUM Technique' },
  ];

  return `
    <div class="app-header">
      <button class="back-btn" data-action="back">&larr; Back</button>
      <h1>${label} Meditation</h1>
      <div style="width:48px"></div>
    </div>
    <div style="padding:16px 0">
      <div class="card">
        <div class="form-label" style="margin-bottom:8px">Techniques practiced</div>
        ${techniques.map(t => `
          <div class="toggle-row" data-action="toggleTech" data-key="${t.key}">
            <span class="toggle-label">${t.name}</span>
            <div class="toggle-box ${existing && existing.techniques && existing.techniques[t.key] ? 'checked' : ''}" id="tech-${t.key}"></div>
          </div>
        `).join('')}
      </div>

      <div class="form-group mt-16">
        <label class="form-label">Duration (minutes)</label>
        <input type="number" class="form-input form-input-small" id="med-duration"
          value="${existing && existing.durationMinutes ? existing.durationMinutes : ''}"
          placeholder="30" inputmode="numeric">
      </div>

      <div class="form-group">
        <label class="form-label">How was your meditation?</label>
        <textarea class="form-textarea" id="med-journal"
          placeholder="Any insights, experiences, or observations...">${existing && existing.journal ? escHtml(existing.journal) : ''}</textarea>
      </div>

      <button class="btn btn-primary" data-action="saveMeditation" data-session="${session}">Save</button>
    </div>
  `;
}

// ══════════════════════════════════════════
// QUOTES
// ══════════════════════════════════════════

async function renderQuotes() {
  const activeQuotes = await getActiveQuotes();
  const archivedQuotes = await getArchivedQuotes();
  const today = getToday();

  let html = `
    <div class="app-header">
      <h1>Contemplations</h1>
      <button class="action-btn" data-action="addQuote" title="Add quote">+</button>
    </div>
  `;

  if (activeQuotes.length === 0 && archivedQuotes.length === 0) {
    html += `
      <div class="empty-state">
        <div class="empty-icon">${ICONS.quote}</div>
        <p>Add quotes from Yogananda's teachings<br>to carry with you as contemplations.</p>
        <button class="btn btn-outline btn-sm" data-action="addQuote">Add your first quote</button>
      </div>
    `;
    return html;
  }

  if (activeQuotes.length > 0) {
    html += `<div class="section-label">Active</div>`;
    activeQuotes.forEach(q => {
      const days = daysBetween(q.addedDate, today) + 1;
      html += `
        <div class="quote-card" data-action="viewQuote" data-id="${q.id}">
          <div class="quote-text">"${escHtml(q.text)}"</div>
          ${q.source ? `<div class="quote-source">— ${escHtml(q.source)}</div>` : ''}
          <div class="quote-days">Contemplating for ${days} day${days > 1 ? 's' : ''}</div>
        </div>
      `;
    });
  }

  if (archivedQuotes.length > 0) {
    html += `<div class="section-label">Archived</div>`;
    archivedQuotes.forEach(q => {
      html += `
        <div class="quote-card" data-action="viewQuote" data-id="${q.id}" style="opacity:0.7;border-left-color:var(--warm-gray)">
          <div class="quote-text">"${escHtml(q.text.substring(0, 100))}${q.text.length > 100 ? '...' : ''}"</div>
          ${q.source ? `<div class="quote-source">— ${escHtml(q.source)}</div>` : ''}
        </div>
      `;
    });
  }

  return html;
}

async function renderQuoteView(quoteId) {
  const quote = await dbGet('quotes', quoteId);
  if (!quote) return renderQuotes();
  const today = getToday();
  const days = daysBetween(quote.addedDate, today) + 1;
  const isActive = quote.status === 'active';

  return `
    <div class="app-header">
      <button class="back-btn" data-action="navQuotes">&larr; Back</button>
      <h1>Contemplation</h1>
      <div style="width:48px"></div>
    </div>
    <div class="quote-large">
      <div class="quote-text">"${escHtml(quote.text)}"</div>
      ${quote.source ? `<div class="quote-source">— ${escHtml(quote.source)}</div>` : ''}
      <div class="quote-days">${isActive ? `Contemplating for ${days} day${days > 1 ? 's' : ''}` : `Archived on ${formatDate(quote.archivedDate)}`}</div>
    </div>
    <div class="quote-actions">
      ${isActive
        ? `<button class="btn btn-outline btn-sm" data-action="archiveQuote" data-id="${quote.id}">Archive</button>`
        : `<button class="btn btn-outline btn-sm" data-action="restoreQuote" data-id="${quote.id}">Restore</button>`
      }
      <button class="btn btn-danger btn-sm" data-action="deleteQuote" data-id="${quote.id}">Delete</button>
    </div>
  `;
}

function renderQuoteForm() {
  return `
    <div class="app-header">
      <button class="back-btn" data-action="navQuotes">&larr; Back</button>
      <h1>Add Quote</h1>
      <div style="width:48px"></div>
    </div>
    <div style="padding:16px 0">
      <div class="form-group">
        <label class="form-label">Quote text</label>
        <textarea class="form-textarea" id="quote-text" placeholder="Enter the quote..." style="min-height:120px" maxlength="2000"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Source (optional)</label>
        <input type="text" class="form-input" id="quote-source" placeholder="e.g., Autobiography of a Yogi" maxlength="200">
      </div>
      <button class="btn btn-primary" data-action="saveQuote">Add Contemplation</button>
    </div>
  `;
}

// ══════════════════════════════════════════
// PRACTICE (Meditation + Affirmations)
// ══════════════════════════════════════════

async function renderPractice() {
  const today = getToday();
  const [morningMed, eveningMed, activeAffs, affLogs, allMeditations] = await Promise.all([
    getMeditation(today, 'morning'),
    getMeditation(today, 'evening'),
    getActiveAffirmations(),
    getAffirmationLogsByDate(today),
    getAllMeditations(),
  ]);

  // Calculate meditation stats
  const medDates = new Set(allMeditations.map(m => m.date));
  const totalMedDays = medDates.size;

  let html = `
    <div class="app-header">
      <h1>Practice</h1>
      <div style="width:48px"></div>
    </div>
  `;

  // Meditation Section
  html += `<div class="section-label">Today's Meditation</div>`;
  html += renderMeditationCard('Morning', morningMed, 'morning');
  html += renderMeditationCard('Evening', eveningMed, 'evening');

  if (totalMedDays > 0) {
    html += `<div class="text-center text-sm text-muted mt-8">${totalMedDays} total meditation days logged</div>`;
  }

  // Affirmation Section
  html += `
    <div class="flex-between mt-24">
      <div class="section-label" style="margin:0">Affirmations</div>
      <button class="action-btn" data-action="addAffirmation" title="Add affirmation" style="color:var(--gold);font-size:22px;background:none;border:none;cursor:pointer">+</button>
    </div>
  `;

  if (activeAffs.length === 0) {
    html += `
      <div class="empty-state">
        <p>Add affirmations you're practicing to track your consistency.</p>
        <button class="btn btn-outline btn-sm" data-action="addAffirmation">Add affirmation</button>
      </div>
    `;
  } else {
    for (const aff of activeAffs) {
      const stats = await getAffirmationStats(aff.id);
      const loggedToday = affLogs.find(l => l.affirmationId === aff.id);
      html += `
        <div class="affirmation-card" data-action="logAffirmation" data-id="${aff.id}" style="cursor:pointer">
          <div class="affirmation-text">"${escHtml(aff.text)}"</div>
          <div class="affirmation-streak">
            ${loggedToday
              ? `Practiced today — Day ${stats.currentStreak}`
              : stats.currentStreak > 0
                ? `${stats.currentStreak} day streak — tap to log today`
                : `Tap to log today's practice`
            }
          </div>
          <div class="affirmation-meta">
            ${stats.totalDays} total days &middot; Longest streak: ${stats.longestStreak} days
          </div>
        </div>
      `;
    }
  }

  return html;
}

function renderAffirmationForm() {
  return `
    <div class="app-header">
      <button class="back-btn" data-action="navPractice">&larr; Back</button>
      <h1>Add Affirmation</h1>
      <div style="width:48px"></div>
    </div>
    <div style="padding:16px 0">
      <div class="form-group">
        <label class="form-label">Affirmation text</label>
        <textarea class="form-textarea" id="aff-text" placeholder="Enter your affirmation..." maxlength="500"></textarea>
      </div>
      <button class="btn btn-primary" data-action="saveAffirmation">Add Affirmation</button>
    </div>
  `;
}

async function renderAffirmationLogForm(affId) {
  const aff = await dbGet('affirmations', affId);
  if (!aff) return renderPractice();
  const today = getToday();
  const existing = (await getAffirmationLogsByDate(today)).find(l => l.affirmationId === affId);

  return `
    <div class="app-header">
      <button class="back-btn" data-action="navPractice">&larr; Back</button>
      <h1>Log Practice</h1>
      <div style="width:48px"></div>
    </div>
    <div style="padding:16px 0">
      <div class="affirmation-card" style="cursor:default">
        <div class="affirmation-text">"${escHtml(aff.text)}"</div>
      </div>
      <div class="form-group mt-16">
        <label class="form-label">Duration (minutes, optional)</label>
        <input type="number" class="form-input form-input-small" id="aff-duration"
          value="${existing && existing.durationMinutes ? existing.durationMinutes : ''}"
          placeholder="5" inputmode="numeric">
      </div>
      <button class="btn btn-primary" data-action="saveAffirmationLog" data-id="${affId}">
        ${existing ? 'Update' : 'Log Practice'}
      </button>
    </div>
  `;
}

// ══════════════════════════════════════════
// SKILLS
// ══════════════════════════════════════════

async function renderSkills() {
  const skills = await getAllSkills();
  const today = getToday();
  const checkins = await getSkillCheckinsByDate(today);

  let html = `
    <div class="app-header">
      <h1>Spiritual Skills</h1>
      <button class="action-btn" data-action="addSkill" title="Add skill">+</button>
    </div>
  `;

  if (skills.length === 0) {
    html += `
      <div class="empty-state">
        <div class="empty-icon">${ICONS.skills}</div>
        <p>Define spiritual qualities you want to cultivate through daily practice.</p>
        <button class="btn btn-outline btn-sm" data-action="addSkill">Add your first skill</button>
      </div>
    `;
    return html;
  }

  // Today's check-in
  html += `<div class="section-label">Today's check-in</div>`;
  for (const skill of skills) {
    const checkin = checkins.find(c => c.skillId === skill.id);
    const practiced = checkin && checkin.practiced;
    html += `
      <div class="card" style="cursor:pointer;margin-bottom:8px" data-action="quickCheckin" data-id="${skill.id}">
        <div class="card-row">
          <div>
            <div class="card-title">${escHtml(skill.name)}</div>
            ${checkin && checkin.note ? `<div class="card-subtitle">${escHtml(checkin.note)}</div>` : ''}
          </div>
          <div class="toggle-box ${practiced ? 'checked' : ''}"></div>
        </div>
      </div>
    `;
  }

  // Progress overview
  html += `<div class="section-label mt-24">Progress</div>`;
  html += `<div class="skills-grid">`;
  for (const skill of skills) {
    const stats = await getSkillStats(skill.id);
    const circumference = 2 * Math.PI * 22;
    const last30 = Math.min(stats.totalDays / 30, 1);
    const dashoffset = circumference * (1 - last30);
    html += `
      <div class="skill-card" data-action="viewSkill" data-id="${skill.id}">
        <div class="skill-ring">
          <svg viewBox="0 0 56 56">
            <circle class="ring-bg" cx="28" cy="28" r="22"/>
            <circle class="ring-fill" cx="28" cy="28" r="22"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${dashoffset}"
              style="stroke:${skill.color || 'var(--gold)'}"/>
          </svg>
          <div class="ring-text">${stats.totalDays}</div>
        </div>
        <div class="skill-name">${escHtml(skill.name)}</div>
        <div class="skill-streak">${stats.currentStreak > 0 ? stats.currentStreak + ' day streak' : 'Start today'}</div>
      </div>
    `;
  }
  html += `</div>`;

  return html;
}

async function renderSkillDetail(skillId) {
  const skill = await dbGet('skills', skillId);
  if (!skill) return renderSkills();
  const stats = await getSkillStats(skill.id);
  const today = getToday();
  const todayCheckin = await getSkillCheckin(today, skillId);
  const weekDates = getWeekDates();
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Month heatmap
  const now = new Date();
  const monthDates = getMonthDates(now.getFullYear(), now.getMonth());
  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const firstDayOfWeek = new Date(monthDates[0] + 'T12:00:00').getDay();
  const practicedDates = new Set(stats.checkins.map(c => c.date));

  // Circumference for large ring
  const circumference = 2 * Math.PI * 48;
  const progress = Math.min(stats.totalDays / 30, 1);
  const dashoffset = circumference * (1 - progress);

  // Recent notes
  const allCheckins = await getSkillCheckinsBySkill(skillId);
  const recentNotes = allCheckins.filter(c => c.note).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  let html = `
    <div class="app-header">
      <button class="back-btn" data-action="navSkills">&larr; Back</button>
      <h1>${escHtml(skill.name)}</h1>
      <div style="width:48px"></div>
    </div>

    <div class="skill-detail-ring">
      <svg viewBox="0 0 120 120">
        <circle class="ring-bg" cx="60" cy="60" r="48"/>
        <circle class="ring-fill" cx="60" cy="60" r="48"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${dashoffset}"
          style="stroke:${skill.color || 'var(--gold)'}"/>
      </svg>
      <div class="ring-text">
        <span class="ring-number">${stats.totalDays}</span>
        <span class="ring-label">days tended</span>
      </div>
    </div>

    <div class="flex-center gap-12 text-sm text-muted mb-16">
      <span>${stats.currentStreak} day streak</span>
      <span>&middot;</span>
      <span>Best: ${stats.longestStreak} days</span>
    </div>

    <!-- Week dots -->
    <div class="week-dots">
      ${weekDates.map((d, i) => `
        <div class="week-dot-item">
          <span class="week-dot-label">${dayLabels[i]}</span>
          <div class="week-dot ${practicedDates.has(d) ? 'filled' : ''} ${d === today ? 'today' : ''}"></div>
        </div>
      `).join('')}
    </div>

    <!-- Month heatmap -->
    <div class="heatmap">
      <div class="heatmap-title">${monthName}</div>
      <div class="heatmap-grid">
        ${dayLabels.map(d => `<div class="heatmap-header">${d}</div>`).join('')}
        ${Array(firstDayOfWeek).fill('<div class="heatmap-cell empty"></div>').join('')}
        ${monthDates.map(d => `
          <div class="heatmap-cell ${practicedDates.has(d) ? 'practiced' : ''} ${d === today ? 'today' : ''}"></div>
        `).join('')}
      </div>
    </div>

    <!-- Today's check-in -->
    <div class="card mt-16">
      <div class="form-label mb-8">Today's check-in</div>
      <div class="toggle-row" data-action="toggleSkillToday" data-id="${skillId}">
        <span class="toggle-label">Did you practice ${escHtml(skill.name.toLowerCase())} today?</span>
        <div class="toggle-box ${todayCheckin && todayCheckin.practiced ? 'checked' : ''}" id="skill-today-toggle"></div>
      </div>
      <div class="form-group mt-8">
        <textarea class="form-textarea" id="skill-note" placeholder="Optional: what happened today?"
          style="min-height:60px">${todayCheckin && todayCheckin.note ? escHtml(todayCheckin.note) : ''}</textarea>
      </div>
      <button class="btn btn-primary btn-sm" data-action="saveSkillCheckin" data-id="${skillId}">Save</button>
    </div>
  `;

  // Recent notes
  if (recentNotes.length > 0) {
    html += `<div class="section-label mt-24">Recent notes</div><div class="card">`;
    recentNotes.forEach(n => {
      html += `
        <div class="note-item">
          <div class="note-date">${formatDate(n.date)}</div>
          <div class="note-text">${escHtml(n.note)}</div>
        </div>
      `;
    });
    html += `</div>`;
  }

  // Delete skill
  html += `
    <div class="mt-24 text-center">
      <button class="btn btn-danger btn-sm" data-action="deleteSkill" data-id="${skillId}">Delete this skill</button>
    </div>
  `;

  return html;
}

function renderSkillForm() {
  return `
    <div class="app-header">
      <button class="back-btn" data-action="navSkills">&larr; Back</button>
      <h1>Add Skill</h1>
      <div style="width:48px"></div>
    </div>
    <div style="padding:16px 0">
      <div class="form-group">
        <label class="form-label">Skill name</label>
        <input type="text" class="form-input" id="skill-name" placeholder="e.g., Patience" maxlength="50">
      </div>
      <div class="form-group">
        <label class="form-label">Description (optional)</label>
        <input type="text" class="form-input" id="skill-desc" placeholder="What does this skill mean to you?" maxlength="200">
      </div>
      <button class="btn btn-primary" data-action="saveSkill">Add Skill</button>
    </div>
  `;
}

// ══════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════

async function renderSettings() {
  const userName = await getSetting('userName', '');

  return `
    <div class="app-header">
      <h1>Settings</h1>
      <div style="width:48px"></div>
    </div>
    <div style="padding:16px 0">
      <div class="section-label">Profile</div>
      <div class="card">
        <div class="form-group" style="margin-bottom:0">
          <label class="form-label">Your name</label>
          <input type="text" class="form-input" id="settings-name"
            value="${escHtml(userName)}" placeholder="Enter your name"
            maxlength="50">
        </div>
      </div>
      <button class="btn btn-primary mt-16" data-action="saveSettings">Save Settings</button>

      <div class="section-label mt-24">Data Management</div>
      <div class="card">
        <p class="text-sm" style="color:var(--text-secondary);margin-bottom:12px">
          All your data is stored locally in this browser. Export a backup to keep it safe.
        </p>
        <div style="display:flex;gap:10px">
          <button class="btn btn-outline btn-sm" data-action="exportData" style="flex:1">
            ${ICONS.download} &nbsp;Export
          </button>
          <button class="btn btn-outline btn-sm" data-action="importData" style="flex:1">
            ${ICONS.upload} &nbsp;Import
          </button>
        </div>
        <input type="file" id="import-file" accept=".json" style="display:none">
      </div>
    </div>
  `;
}

// ══════════════════════════════════════════
// Data Export / Import
// ══════════════════════════════════════════

async function exportAllData() {
  try {
    const [meditations, skills, skillCheckins, quotes, affirmations, affirmationLogs, settings] = await Promise.all([
      dbGetAll(STORES.meditations),
      dbGetAll(STORES.skills),
      dbGetAll(STORES.skillCheckins),
      dbGetAll(STORES.quotes),
      dbGetAll(STORES.affirmations),
      dbGetAll(STORES.affirmationLogs),
      dbGetAll(STORES.settings),
    ]);

    const data = {
      exportDate: new Date().toISOString(),
      version: 1,
      meditations, skills, skillCheckins, quotes, affirmations, affirmationLogs, settings,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spiritual-skills-backup-${getToday()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup exported successfully');
  } catch (err) {
    showToast('Export failed: ' + err.message, true);
  }
}

async function importData(file) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!data.version || !data.exportDate) {
      showToast('Invalid backup file', true);
      return;
    }

    if (!confirm('This will replace all current data with the imported backup. Continue?')) return;

    const storeNames = ['meditations', 'skills', 'skillCheckins', 'quotes', 'affirmations', 'affirmationLogs', 'settings'];
    for (const name of storeNames) {
      if (data[name] && Array.isArray(data[name])) {
        for (const item of data[name]) {
          await dbPut(STORES[name], item);
        }
      }
    }

    showToast('Data imported successfully');
    render();
  } catch (err) {
    showToast('Import failed: ' + err.message, true);
  }
}

// ══════════════════════════════════════════
// Toast Notifications
// ══════════════════════════════════════════

function showToast(message, isError = false) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast' + (isError ? ' toast-error' : '');
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ══════════════════════════════════════════
// Input Validation
// ══════════════════════════════════════════

const MAX_LENGTHS = {
  quote: 2000,
  source: 200,
  affirmation: 500,
  skillName: 50,
  skillDesc: 200,
  journal: 5000,
  note: 1000,
};

function validateLength(value, field) {
  const max = MAX_LENGTHS[field];
  if (max && value.length > max) {
    showToast(`${field} must be under ${max} characters`, true);
    return false;
  }
  return true;
}

// ══════════════════════════════════════════
// Debounce Protection
// ══════════════════════════════════════════

let _actionInProgress = false;

// ══════════════════════════════════════════
// Event Handling
// ══════════════════════════════════════════

function attachEventListeners() {
  // Navigation
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.nav));
  });

  // Actions
  document.querySelectorAll('[data-action]').forEach(el => {
    el.addEventListener('click', (e) => handleAction(el.dataset.action, el.dataset, e));
  });
}

async function handleAction(action, data, e) {
  // Debounce: skip if a save/delete action is already in progress
  const isMutating = action.startsWith('save') || action.startsWith('delete') || action === 'exportData' || action === 'importData' || action === 'quickCheckin';
  if (isMutating) {
    if (_actionInProgress) return;
    _actionInProgress = true;
  }

  try {
    const today = getToday();

    switch (action) {
      // Navigation
      case 'back':
        if (subPage) navigate(currentPage);
        else navigate('home');
        break;
      case 'navQuotes': navigate('quotes'); break;
      case 'navPractice': navigate('practice'); break;
      case 'navSkills': navigate('skills'); break;

      // Meditation
      case 'editMeditation':
        navigate('practice', 'meditation', data.session);
        break;

      case 'toggleTech': {
        const box = document.getElementById(`tech-${data.key}`);
        box.classList.toggle('checked');
        break;
      }

      case 'saveMeditation': {
        const techniques = {};
        ['energization', 'hongSau', 'aum'].forEach(k => {
          techniques[k] = document.getElementById(`tech-${k}`).classList.contains('checked');
        });
        const duration = parseInt(document.getElementById('med-duration').value) || null;
        const journal = document.getElementById('med-journal').value.trim();
        if (journal && !validateLength(journal, 'journal')) break;
        await saveMeditation(today, data.session, techniques, duration, journal);
        navigate('practice');
        break;
      }

      // Quotes
      case 'addQuote': navigate('quotes', 'add'); break;

      case 'viewQuote':
        navigate('quotes', 'view', data.id);
        break;

      case 'saveQuote': {
        const text = document.getElementById('quote-text').value.trim();
        const source = document.getElementById('quote-source').value.trim();
        if (!text) { showToast('Quote text is required', true); break; }
        if (!validateLength(text, 'quote')) break;
        if (source && !validateLength(source, 'source')) break;
        await saveQuote({ text, source: source || null });
        navigate('quotes');
        break;
      }

      case 'archiveQuote':
        await archiveQuote(data.id);
        navigate('quotes');
        break;

      case 'restoreQuote':
        await restoreQuote(data.id);
        navigate('quotes');
        break;

      case 'deleteQuote':
        if (confirm('Delete this quote permanently?')) {
          await deleteQuote(data.id);
          navigate('quotes');
        }
        break;

      // Affirmations
      case 'addAffirmation': navigate('practice', 'add-affirmation'); break;

      case 'saveAffirmation': {
        const text = document.getElementById('aff-text').value.trim();
        if (!text) { showToast('Affirmation text is required', true); break; }
        if (!validateLength(text, 'affirmation')) break;
        await saveAffirmation({ text });
        navigate('practice');
        break;
      }

      case 'logAffirmation':
        navigate('practice', 'affirmation-log', data.id);
        break;

      case 'saveAffirmationLog': {
        const duration = parseInt(document.getElementById('aff-duration').value) || null;
        await saveAffirmationLog(today, data.id, duration);
        navigate('practice');
        break;
      }

      // Skills
      case 'addSkill': navigate('skills', 'add'); break;

      case 'viewSkill':
        navigate('skills', 'detail', data.id);
        break;

      case 'quickCheckin': {
        const existing = await getSkillCheckin(today, data.id);
        const nowPracticed = !(existing && existing.practiced);
        await saveSkillCheckin(today, data.id, nowPracticed, existing ? existing.note : '');
        render();
        break;
      }

      case 'toggleSkillToday': {
        const toggle = document.getElementById('skill-today-toggle');
        toggle.classList.toggle('checked');
        break;
      }

      case 'saveSkillCheckin': {
        const toggle = document.getElementById('skill-today-toggle');
        const practiced = toggle.classList.contains('checked');
        const note = document.getElementById('skill-note').value.trim();
        if (note && !validateLength(note, 'note')) break;
        await saveSkillCheckin(today, data.id, practiced, note);
        navigate('skills', 'detail', data.id);
        break;
      }

      case 'deleteSkill': {
        if (confirm('Delete this skill and all its check-in history?')) {
          const checkins = await getSkillCheckinsBySkill(data.id);
          for (const c of checkins) {
            await dbDelete('skillCheckins', c.id);
          }
          await deleteSkill(data.id);
          navigate('skills');
        }
        break;
      }

      case 'saveSkill': {
        const name = document.getElementById('skill-name').value.trim();
        const desc = document.getElementById('skill-desc').value.trim();
        if (!name) { showToast('Skill name is required', true); break; }
        if (!validateLength(name, 'skillName')) break;
        if (desc && !validateLength(desc, 'skillDesc')) break;
        const id = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        await saveSkill({ id, name, description: desc || null, color: '#C9A96E' });
        navigate('skills');
        break;
      }

      // Settings
      case 'saveSettings': {
        const name = document.getElementById('settings-name').value.trim();
        if (name && !validateLength(name, 'skillName')) break;
        await setSetting('userName', name);
        showToast('Settings saved');
        break;
      }

      case 'exportData':
        await exportAllData();
        break;

      case 'importData': {
        const fileInput = document.getElementById('import-file');
        fileInput.click();
        fileInput.onchange = async () => {
          if (fileInput.files.length > 0) {
            await importData(fileInput.files[0]);
          }
        };
        break;
      }
    }
  } catch (err) {
    showToast('Something went wrong: ' + err.message, true);
    console.error('Action error:', action, err);
  } finally {
    if (isMutating) {
      _actionInProgress = false;
    }
  }
}

// ══════════════════════════════════════════
// Utility
// ══════════════════════════════════════════

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ══════════════════════════════════════════
// Initialize
// ══════════════════════════════════════════

async function init() {
  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(console.error);
  }

  // Render
  await render();
}

// Boot
document.addEventListener('DOMContentLoaded', init);
