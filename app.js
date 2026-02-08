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
};

// ══════════════════════════════════════════
// Rendering Engine
// ══════════════════════════════════════════

const app = () => document.getElementById('app');
const nav = () => document.getElementById('nav');

async function render() {
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
    default: html = await renderHome();
  }
  app().innerHTML = html;
  attachEventListeners();
}

function renderNav() {
  const items = [
    { id: 'home', icon: ICONS.home, label: 'Home' },
    { id: 'quotes', icon: ICONS.quote, label: 'Quotes' },
    { id: 'practice', icon: ICONS.practice, label: 'Practice' },
    { id: 'skills', icon: ICONS.skills, label: 'Skills' },
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
  const [morningMed, eveningMed, activeQuotes, skillsList, skillCheckins, activeAffs, affLogs] = await Promise.all([
    getMeditation(today, 'morning'),
    getMeditation(today, 'evening'),
    getActiveQuotes(),
    getAllSkills(),
    getSkillCheckinsByDate(today),
    getActiveAffirmations(),
    getAffirmationLogsByDate(today),
  ]);

  let html = `
    <div class="greeting">${getGreeting()}, David</div>
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
        <textarea class="form-textarea" id="quote-text" placeholder="Enter the quote..." style="min-height:120px"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Source (optional)</label>
        <input type="text" class="form-input" id="quote-source" placeholder="e.g., Autobiography of a Yogi">
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
        <textarea class="form-textarea" id="aff-text" placeholder="Enter your affirmation..."></textarea>
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
        <input type="text" class="form-input" id="skill-name" placeholder="e.g., Patience">
      </div>
      <div class="form-group">
        <label class="form-label">Description (optional)</label>
        <input type="text" class="form-input" id="skill-desc" placeholder="What does this skill mean to you?">
      </div>
      <button class="btn btn-primary" data-action="saveSkill">Add Skill</button>
    </div>
  `;
}

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

let _skillTodayState = null;

async function handleAction(action, data, e) {
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
      if (!text) return;
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
      if (!text) return;
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
      _skillTodayState = toggle.classList.contains('checked');
      break;
    }

    case 'saveSkillCheckin': {
      const toggle = document.getElementById('skill-today-toggle');
      const practiced = toggle.classList.contains('checked');
      const note = document.getElementById('skill-note').value.trim();
      await saveSkillCheckin(today, data.id, practiced, note);
      navigate('skills', 'detail', data.id);
      break;
    }

    case 'deleteSkill': {
      if (confirm('Delete this skill and all its check-in history?')) {
        // Delete all check-ins for this skill
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
      if (!name) return;
      const id = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      await saveSkill({ id, name, description: desc || null, color: '#C9A96E' });
      navigate('skills');
      break;
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
