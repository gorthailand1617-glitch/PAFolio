/**
 * PAFolio - Application Controller
 * รองรับการสลับปีการศึกษา, สลับครูผู้สอน, และการซิงก์ Google Drive
 */

// Active State Management
let currentTeacherId = localStorage.getItem('pafolio_active_teacher') || 'teacher-korakot';
let currentAcademicYear = localStorage.getItem('pafolio_active_year') || '2568';

// Fallback Indicator Templates
const BASE_INDICATOR_TEMPLATES = [
  { id: "1.1", code: "1.1", domainId: "domain-1", title: "สร้างและหรือพัฒนาหลักสูตร", shortDesc: "ริเริ่มพัฒนาหลักสูตรรายวิชาให้สอดคล้องกับบริบทและสมรรถนะผู้เรียน" },
  { id: "1.2", code: "1.2", domainId: "domain-1", title: "ออกแบบการจัดการเรียนรู้", shortDesc: "เน้นผู้เรียนเป็นสำคัญ ออกแบบแผนการจัดการเรียนรู้เชิงรุก (Active Learning)" },
  { id: "1.3", code: "1.3", domainId: "domain-1", title: "จัดกิจกรรมการเรียนรู้", shortDesc: "จัดกิจกรรมการเรียนรู้ที่อำนวยความสะดวกและส่งเสริมการมีส่วนร่วม" },
  { id: "1.4", code: "1.4", domainId: "domain-1", title: "สร้าง/พัฒนาสื่อ นวัตกรรม เทคโนโลยี", shortDesc: "สร้างสื่อดิจิทัล นวัตกรรม และแหล่งเรียนรู้ที่ผู้เรียนเข้าถึงได้ทุกที่" },
  { id: "1.5", code: "1.5", domainId: "domain-1", title: "วัดและประเมินผลการเรียนรู้", shortDesc: "ประเมินผลตามสภาพจริงด้วยเครื่องมือที่หลากหลายและเกณฑ์รูบริกส์" },
  { id: "1.6", code: "1.6", domainId: "domain-1", title: "ศึกษา วิเคราะห์ สังเคราะห์ เพื่อแก้ปัญหา", shortDesc: "ทำวิจัยในชั้นเรียนเพื่อพัฒนาการเรียนรู้และแก้ไขปัญหาอย่างเป็นระบบ" },
  { id: "1.7", code: "1.7", domainId: "domain-1", title: "จัดบรรยากาศที่ส่งเสริมและพัฒนาผู้เรียน", shortDesc: "สร้างสภาพแวดล้อมเชิงบวก ปลอดภัย และเอื้อต่อการคิดสร้างสรรค์" },
  { id: "1.8", code: "1.8", domainId: "domain-1", title: "อบรมและพัฒนาคุณลักษณะที่ดีของผู้เรียน", shortDesc: "ปลูกฝังวินัย คุณธรรม จริยธรรม และค่านิยมความเป็นไทย" },
  { id: "2.1", code: "2.1", domainId: "domain-2", title: "จัดทำข้อมูลสารสนเทศของผู้เรียนและรายวิชา", shortDesc: "จัดทำระบบสารสนเทศดิจิทัล ปพ.5 และติดตามพัฒนาการรายบุคคล" },
  { id: "2.2", code: "2.2", domainId: "domain-2", title: "ดำเนินการตามระบบดูแลช่วยเหลือผู้เรียน", shortDesc: "คัดกรอง SDQ เยี่ยมบ้าน และประสานความช่วยเหลืออย่างทันท่วงที" },
  { id: "2.3", code: "2.3", domainId: "domain-2", title: "ปฏิบัติงานวิชาการ และงานอื่นๆ", shortDesc: "ปฏิบัติหน้าที่บริหารงานวิชาการ งานประกันคุณภาพ และงานตามแผน" },
  { id: "2.4", code: "2.4", domainId: "domain-2", title: "ประสานความร่วมมือกับผู้ปกครอง/เครือข่าย", shortDesc: "สร้างเครือข่ายผู้ปกครอง ประชุมชั้นเรียน และร่วมมือกับชุมชน" },
  { id: "3.1", code: "3.1", domainId: "domain-3", title: "พัฒนาตนเองอย่างเป็นระบบและต่อเนื่อง", shortDesc: "เข้าร่วมการอบรมเชิงปฏิบัติการและเทคโนโลยีดิจิทัล/AI ต่อเนื่อง" },
  { id: "3.2", code: "3.2", domainId: "domain-3", title: "มีส่วนร่วมและเป็นผู้นำในชุมชน PLC", shortDesc: "เป็นผู้นำและสมาชิกร่วมแลกเปลี่ยนเรียนรู้เพื่อพัฒนาการสอน" },
  { id: "3.3", code: "3.3", domainId: "domain-3", title: "นำความรู้ ทักษะ มาใช้พัฒนานวัตกรรม", shortDesc: "นำองค์ความรู้และ PLC มาสร้างสรรค์นวัตกรรมที่ส่งผลต่อคุณภาพผู้เรียน" }
];

document.addEventListener('DOMContentLoaded', () => {
  // Load custom teachers from localStorage if any
  loadStoredTeachers();
  renderApp();
  setupEventListeners();
  DriveSync.updateStatusUI();

  // Auto-sync ข้อมูลสดจาก Google Drive เมื่อเปิดหน้าเว็บ (ถ้ามีการตั้งค่าไว้)
  if (DriveSync.config.appsScriptUrl) {
    DriveSync.syncAndApply(currentAcademicYear, false);
  }
});

function getActiveTeacher() {
  return PAFOLIO_DATABASE[currentTeacherId] || PAFOLIO_DATABASE['teacher-korakot'];
}

function getActiveYearData() {
  const teacher = getActiveTeacher();
  if (teacher.years && teacher.years[currentAcademicYear]) {
    return teacher.years[currentAcademicYear];
  }
  // Fallback to first available year
  const availableYears = Object.keys(teacher.years || {});
  if (availableYears.length > 0) {
    currentAcademicYear = availableYears[0];
    return teacher.years[currentAcademicYear];
  }
  return {};
}

function getExpectedLevel(academicStanding) {
  return ACADEMIC_LEVELS[academicStanding] || "ริเริ่ม พัฒนา (Initiating & Developing)";
}

// Master Render Function
function renderApp() {
  const teacher = getActiveTeacher();
  const yearData = getActiveYearData();
  const expectedLevel = getExpectedLevel(teacher.academicStanding);

  // 1. Update Navigation & Teacher Profile in DOM
  updateHeaderAndProfile(teacher, yearData, expectedLevel);

  // 2. Render Year Switcher dropdowns
  renderYearSwitcher(teacher);

  // 3. Render Teacher Selector dropdown
  renderTeacherSelector();

  // 4. Render 15 Indicators
  renderIndicators('all', '');

  // 5. Render Challenge Issue Section
  renderChallengeSection(teacher, yearData);

  // 6. Render Evidence Gallery
  renderGallery();

  // 7. Update Charts
  updateChartsForCurrentContext();

  // 8. Update Committee Scoring
  loadScoresForYear(yearData);

  // 9. Render e-Certificate Vault
  if (typeof CertificateVault !== 'undefined') {
    CertificateVault.renderVaultUI();
  }

  // 10. Update Theme UI
  if (typeof ThemeEngine !== 'undefined') {
    ThemeEngine.updateThemeUI();
  }
}

// แปลง Google Drive URL เป็น Thumbnail Image URL ที่เบราว์เซอร์แสดงผลได้ 100%
function convertToGoogleDriveThumbnailUrl(url, size = 'w1000') {
  if (!url) return '';
  let clean = url.trim();

  // หากเป็น Thumbnail URL อยู่แล้ว หรือเป็น direct image file
  if (clean.includes('thumbnail?id=') || clean.match(/\.(jpeg|jpg|png|webp|gif|bmp)(\?.*)?$/i)) {
    return clean;
  }

  // หากเป็นลิงก์โฟลเดอร์ Google Drive (ไม่สามารถแสดงผลเป็นรูปภาพได้)
  if (clean.includes('/drive/folders/')) {
    return clean;
  }

  // ตรวจจับ Google Drive file sharing link เช่น:
  // https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // https://drive.google.com/open?id=FILE_ID
  // https://drive.google.com/uc?id=FILE_ID
  const fileMatch = clean.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || clean.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (fileMatch && fileMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${fileMatch[1]}&sz=${size}`;
  }

  return clean;
}

// Update Header & Profile Section
function updateHeaderAndProfile(teacher, yearData, expectedLevel) {
  // Brand Header
  document.querySelectorAll('.teacher-name-label').forEach(el => el.innerText = teacher.name);
  document.querySelectorAll('.teacher-standing-label').forEach(el => el.innerText = teacher.academicStanding);
  document.querySelectorAll('.teacher-school-label').forEach(el => el.innerText = teacher.school);
  document.querySelectorAll('.teacher-dept-label').forEach(el => el.innerText = teacher.learningArea);

  // อัปเดตรูปโปรไฟล์ครู (ดึงภาพเฉพาะของปีการศึกษาที่เลือกก่อน หากไม่มีค่อยใช้รูปหลัก)
  const activeAvatar = (yearData && yearData.avatarUrl) ? yearData.avatarUrl : teacher.avatarUrl;
  if (activeAvatar && !activeAvatar.includes('/drive/folders/')) {
    const avatarSrc = convertToGoogleDriveThumbnailUrl(activeAvatar, 'w800');
    document.querySelectorAll('.teacher-avatar-img').forEach(el => el.src = avatarSrc);
  }

  // อัปเดตภาพปกแบนเนอร์ Hero (ดึงภาพปกเฉพาะของปีการศึกษาที่เลือกก่อน หากไม่มีค่อยใช้ภาพหลัก)
  const activeCover = (yearData && yearData.coverUrl) ? yearData.coverUrl : teacher.coverUrl;
  if (activeCover && !activeCover.includes('/drive/folders/')) {
    const coverSrc = convertToGoogleDriveThumbnailUrl(activeCover, 'w1920');
    document.querySelectorAll('.hero-cover-img, #hero-cover-img').forEach(el => el.src = coverSrc);
  }

  document.querySelectorAll('.expected-level-badge').forEach(el => el.innerText = expectedLevel);
  document.querySelectorAll('.current-year-label').forEach(el => el.innerText = `ปีการศึกษา ${currentAcademicYear}`);

  // Teaching Load
  const teachingLoadList = document.getElementById('teaching-load-list');
  if (teachingLoadList && yearData.teachingLoad) {
    teachingLoadList.innerHTML = '';
    yearData.teachingLoad.forEach(load => {
      const li = document.createElement('li');
      li.className = 'flex justify-between items-center py-1 border-b border-slate-100 last:border-0';
      li.innerHTML = `
        <span class="text-xs sm:text-sm text-slate-700">• ${load.subject} (${load.grade})</span>
        <span class="text-xs font-semibold text-slate-900">${load.hours}</span>
      `;
      teachingLoadList.appendChild(li);
    });
  }

  // Teacher Roles
  const rolesList = document.getElementById('teacher-roles-list');
  if (rolesList && yearData.roles) {
    rolesList.innerHTML = '';
    yearData.roles.forEach(role => {
      const div = document.createElement('div');
      div.className = 'flex items-center gap-3 p-2 rounded-xl bg-slate-50 text-xs sm:text-sm text-slate-700 font-medium';
      div.innerHTML = `<i class="fa-solid fa-circle-check text-teal-600"></i> <span>${role}</span>`;
      rolesList.appendChild(div);
    });
  }

  // Total teaching hours
  if (document.getElementById('total-teaching-hours')) {
    document.getElementById('total-teaching-hours').innerText = yearData.totalHours || '20 คาบ/สัปดาห์';
  }
}

// Render Year Switcher Dropdown
function renderYearSwitcher(teacher) {
  const container = document.getElementById('year-switcher-container');
  if (!container) return;

  const years = Object.keys(teacher.years || {}).sort().reverse();
  container.innerHTML = `
    <div class="flex items-center gap-1.5 bg-teal-50/80 px-2.5 py-1 rounded-xl border border-teal-200 text-xs font-heading">
      <i class="fa-regular fa-calendar-check text-teal-700"></i>
      <span class="font-bold text-teal-900">รอบปี:</span>
      <select id="year-select-input" onchange="switchAcademicYear(this.value)" class="bg-transparent font-bold text-teal-800 focus:outline-none cursor-pointer">
        ${years.map(y => `<option value="${y}" ${y === currentAcademicYear ? 'selected' : ''}>ปี ${y}</option>`).join('')}
      </select>
      <button onclick="openNewYearModal()" title="เพิ่มรอบปีการศึกษาใหม่" class="ml-1 w-5 h-5 rounded-md bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center text-[10px] shadow-sm">
        <i class="fa-solid fa-plus"></i>
      </button>
    </div>
  `;
}

// Switch Academic Year
function switchAcademicYear(year) {
  currentAcademicYear = year;
  localStorage.setItem('pafolio_active_year', year);
  renderApp();

  // ซิงก์ข้อมูล Google Drive สำหรับปีที่เลือกใหม่ทันที
  if (DriveSync.config.appsScriptUrl && DriveSync.config.autoSync) {
    DriveSync.syncAndApply(year, false);
  }
}

// Render Teacher Selector Dropdown
function renderTeacherSelector() {
  const container = document.getElementById('teacher-switcher-container');
  if (!container) return;

  const teachers = Object.values(PAFOLIO_DATABASE);
  container.innerHTML = `
    <div class="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200 text-xs font-heading">
      <i class="fa-solid fa-user-tie text-teal-700"></i>
      <select id="teacher-select-input" onchange="switchTeacherProfile(this.value)" class="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer max-w-[140px] truncate">
        ${teachers.map(t => `<option value="${t.id}" ${t.id === currentTeacherId ? 'selected' : ''}>${t.name}</option>`).join('')}
      </select>
      <button onclick="openTeacherCloneModal()" title="สร้างหรือโคลนโปรไฟล์ครูท่านใหม่" class="ml-1 px-1.5 py-0.5 rounded bg-teal-100 hover:bg-teal-200 text-teal-800 text-[10px] font-bold">
        + ครูใหม่
      </button>
    </div>
  `;
}

// Switch Teacher Profile
function switchTeacherProfile(teacherId) {
  currentTeacherId = teacherId;
  localStorage.setItem('pafolio_active_teacher', teacherId);
  const teacher = getActiveTeacher();
  const availableYears = Object.keys(teacher.years || {});
  if (availableYears.length > 0) {
    currentAcademicYear = availableYears[0];
  }
  renderApp();
}

// Render 15 Indicators
function renderIndicators(filter = 'all', searchQuery = '') {
  const container = document.getElementById('indicators-container');
  if (!container) return;

  container.innerHTML = '';
  const teacher = getActiveTeacher();
  const yearData = getActiveYearData();
  const expectedLevel = getExpectedLevel(teacher.academicStanding);

  const domains = [
    { id: 'domain-1', number: 1, title: 'ด้านที่ 1: ด้านการจัดการเรียนรู้', subtitle: 'การสร้างและพัฒนาหลักสูตร การออกแบบกิจกรรม สื่อ นวัตกรรม และการวัดผล', color: 'teal', total: 8 },
    { id: 'domain-2', number: 2, title: 'ด้านที่ 2: ด้านการส่งเสริมและสนับสนุนการจัดการเรียนรู้', subtitle: 'การจัดทำสารสนเทศ ระบบดูแลช่วยเหลือนักเรียน งานวิชาการ และการประสานภาคีเครือข่าย', color: 'indigo', total: 4 },
    { id: 'domain-3', number: 3, title: 'ด้านที่ 3: ด้านการพัฒนาตนเองและวิชาชีพ', subtitle: 'การพัฒนาตนเองอย่างเป็นระบบ การขับเคลื่อน PLC และการนำความรู้มาสร้างนวัตกรรม', color: 'amber', total: 3 }
  ];

  domains.forEach(domain => {
    if (filter !== 'all' && domain.id !== filter) return;

    const indicators = BASE_INDICATOR_TEMPLATES.filter(ind => ind.domainId === domain.id && (
      !searchQuery || 
      ind.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      ind.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
      ind.shortDesc.toLowerCase().includes(searchQuery.toLowerCase())
    ));

    if (indicators.length === 0) return;

    let headerBgClass = domain.color === 'teal' ? 'bg-teal-900' : (domain.color === 'indigo' ? 'bg-indigo-900' : 'bg-slate-900');
    let badgeClass = domain.color === 'teal' ? 'bg-teal-500 text-slate-950' : (domain.color === 'indigo' ? 'bg-indigo-500 text-white' : 'bg-amber-500 text-slate-950');

    const domainSection = document.createElement('div');
    domainSection.className = 'domain-section mb-12';
    domainSection.innerHTML = `
      <div class="flex items-center justify-between p-4 sm:p-5 ${headerBgClass} text-white rounded-2xl shadow-sm mb-6">
        <div class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl ${badgeClass} flex items-center justify-center font-heading font-bold text-lg shadow-sm">
            ${domain.number}
          </div>
          <div>
            <h3 class="font-heading font-bold text-base sm:text-lg">${domain.title} (${indicators.length} ตัวชี้วัด)</h3>
            <p class="text-xs text-slate-300">${domain.subtitle}</p>
          </div>
        </div>
        <div class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 text-xs font-medium border border-white/15">
          <i class="fa-solid fa-crosshairs text-amber-300"></i> ${expectedLevel}
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="grid-${domain.id}"></div>
    `;

    container.appendChild(domainSection);
    const grid = domainSection.querySelector(`#grid-${domain.id}`);

    indicators.forEach(ind => {
      const card = document.createElement('div');
      card.className = 'bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 hover-lift flex flex-col justify-between cursor-pointer group';
      card.onclick = () => openIndicatorModal(ind, teacher, expectedLevel);

      let tagBg = domain.color === 'teal' ? 'bg-teal-50 text-teal-700 border-teal-100' : (domain.color === 'indigo' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-amber-50 text-amber-800 border-amber-200');

      // ตรวจสอบจำนวนไฟล์จริงจาก Google Drive
      let fileCountText = `<i class="fa-solid fa-folder-open text-teal-600"></i> โฟลเดอร์ Drive ${ind.code}`;
      let fileBadge = '';
      if (DriveSync.syncedData && DriveSync.syncedData.indicators) {
        const matchingKey = Object.keys(DriveSync.syncedData.indicators).find(key => 
          key === ind.code || key.startsWith(ind.code + ' ') || key.startsWith(ind.code + '.') || key.includes(ind.code)
        );
        if (matchingKey && DriveSync.syncedData.indicators[matchingKey].files) {
          const count = DriveSync.syncedData.indicators[matchingKey].files.length;
          if (count > 0) {
            fileBadge = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300"><i class="fa-brands fa-google-drive"></i> ${count} ไฟล์</span>`;
            fileCountText = `<i class="fa-solid fa-file-circle-check text-emerald-600"></i> ซิงก์แล้ว ${count} รายการ`;
          }
        }
      }

      card.innerHTML = `
        <div>
          <div class="flex justify-between items-start mb-3 gap-1">
            <span class="text-xs font-bold px-2.5 py-1 rounded-md border ${tagBg}">
              ตัวชี้วัด ${ind.code}
            </span>
            <div class="flex items-center gap-1.5">
              ${fileBadge}
              <span class="text-xs font-medium text-slate-400 group-hover:text-teal-600 transition">
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
              </span>
            </div>
          </div>
          <h4 class="font-heading font-bold text-slate-900 text-base mb-2 group-hover:text-teal-700 transition leading-snug">
            ${ind.title}
          </h4>
          <p class="text-xs text-slate-600 leading-relaxed line-clamp-3">
            ${ind.shortDesc}
          </p>
        </div>

        <div class="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-[11px] text-slate-500 flex items-center gap-1.5">
            ${fileCountText}
          </span>
          <span class="text-[11px] font-semibold text-teal-700 group-hover:underline flex items-center gap-1">
            ดูหลักฐาน <i class="fa-solid fa-angle-right"></i>
          </span>
        </div>
      `;

      grid.appendChild(card);
    });
  });
}

// Render Challenge Section
function renderChallengeSection(teacher, yearData) {
  const challenge = yearData.challengeIssue;
  if (!challenge) return;

  if (document.getElementById('challenge-topic-text')) document.getElementById('challenge-topic-text').innerText = challenge.topic;
  if (document.getElementById('challenge-subject-text')) document.getElementById('challenge-subject-text').innerText = `${challenge.subject} · ${challenge.targetGroup}`;

  // Steps
  const stepsContainer = document.getElementById('challenge-steps-container');
  if (stepsContainer && challenge.steps) {
    stepsContainer.innerHTML = '';
    challenge.steps.forEach((step, idx) => {
      const card = document.createElement('div');
      card.className = 'step-card bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:border-teal-400/50 transition';
      card.innerHTML = `
        <div class="w-11 h-11 rounded-2xl bg-teal-400 text-slate-950 font-bold font-heading flex items-center justify-center text-lg mb-3 shadow-md">
          ${step.letter}
        </div>
        <div class="text-xs text-teal-300 font-semibold uppercase tracking-wider">Step ${idx + 1}</div>
        <h4 class="font-heading font-bold text-white text-sm sm:text-base mt-1">${step.title}</h4>
        <div class="text-xs text-amber-200 mt-0.5">${step.nameThai}</div>
        <p class="text-xs text-slate-300 mt-2 leading-relaxed font-light">${step.description}</p>
      `;
      stepsContainer.appendChild(card);
    });
  }

  // Metrics
  if (challenge.metrics) {
    if (document.getElementById('metric-quant-actual')) document.getElementById('metric-quant-actual').innerText = `บรรลุผลจริง: ${challenge.metrics.quantitative.actual} (เป้าหมาย: ${challenge.metrics.quantitative.target})`;
    if (document.getElementById('metric-quant-detail')) document.getElementById('metric-quant-detail').innerText = challenge.metrics.quantitative.details;
    if (document.getElementById('metric-qual-actual')) document.getElementById('metric-qual-actual').innerText = challenge.metrics.qualitative.actual;
    if (document.getElementById('metric-qual-detail')) document.getElementById('metric-qual-detail').innerText = challenge.metrics.qualitative.details;
  }
}

// Render Evidence Gallery
function renderGallery(filter = 'all') {
  const container = document.getElementById('gallery-container');
  if (!container) return;

  const sampleGallery = [
    { title: "การจัดทำระบบสารสนเทศรายวิชาและโครงสร้างหลักสูตร", caption: "การชี้แจงโครงสร้างหน่วยการเรียนรู้และระบบสารสนเทศแก่นักเรียน", badge: "ด้านที่ 1 & 2", thumbUrl: "https://drive.google.com/thumbnail?id=1q0IFGBeO9johw1cmn9diWLuSXmt_CLZn&sz=w800", fullUrl: "https://drive.google.com/thumbnail?id=1q0IFGBeO9johw1cmn9diWLuSXmt_CLZn&sz=w1600", date: "มิถุนายน" },
    { title: "บรรยากาศการจัดกิจกรรมการเรียนรู้ Active Learning", caption: "นักเรียนลงมือปฏิบัติกิจกรรมการแก้ปัญหาในสถานการณ์จำลอง", badge: "ด้านที่ 1", thumbUrl: "https://drive.google.com/thumbnail?id=1sdnONlo5QD71M6R-UnHXhM55RyF5esrP&sz=w800", fullUrl: "https://drive.google.com/thumbnail?id=1sdnONlo5QD71M6R-UnHXhM55RyF5esrP&sz=w1600", date: "กรกฎาคม" },
    { title: "การระดมความคิดด้วย Thinking Whiteboard", caption: "นักเรียนร่วมกันวาดผังความคิดขั้นตอนการแก้ปัญหาเป็นทีม", badge: "ประเด็นท้าทาย", thumbUrl: "https://drive.google.com/thumbnail?id=1mCq2P2UvCAdAXivXcNS49wpM-x5LHS9e&sz=w800", fullUrl: "https://drive.google.com/thumbnail?id=1mCq2P2UvCAdAXivXcNS49wpM-x5LHS9e&sz=w1600", date: "สิงหาคม" },
    { title: "การวัดและประเมินผลตามสภาพจริง (Authentic Assessment)", caption: "ครูตรวจประเมินชิ้นงานและทักษะการปฏิบัติงานร่วมกับเกณฑ์รูบริกส์", badge: "ด้านที่ 1", thumbUrl: "https://drive.google.com/thumbnail?id=1VXtUko-oQv6bN7ws27GNsk2FKmW5nlSh&sz=w800", fullUrl: "https://drive.google.com/thumbnail?id=1VXtUko-oQv6bN7ws27GNsk2FKmW5nlSh&sz=w1600", date: "กันยายน" },
    { title: "ระบบดูแลช่วยเหลือผู้เรียน Students Support System (SSS)", caption: "การคัดกรอง SDQ และการประสานงานช่วยเหลือผู้เรียนร่วมกับผู้ปกครอง", badge: "ด้านที่ 2", thumbUrl: "https://drive.google.com/thumbnail?id=1bYywqjS4jbW3U5vMgT9lrCYS8c3Nt3wG&sz=w800", fullUrl: "https://drive.google.com/thumbnail?id=1bYywqjS4jbW3U5vMgT9lrCYS8c3Nt3wG&sz=w1600", date: "ตุลาคม" },
    { title: "การขับเคลื่อนชุมชนแห่งการเรียนรู้ทางวิชาชีพ (PLC)", caption: "การประชุมแลกเปลี่ยนเรียนรู้กับคณะครูกลุ่มสาระการเรียนรู้และฝ่ายวิชาการ", badge: "ด้านที่ 3", thumbUrl: "https://drive.google.com/thumbnail?id=1TbStAJqtw3b4gQe5X-mk9pKwL6JI4OqP&sz=w800", fullUrl: "https://drive.google.com/thumbnail?id=1TbStAJqtw3b4gQe5X-mk9pKwL6JI4OqP&sz=w1600", date: "พฤศจิกายน" }
  ];

  // ถ้ามีภาพจริงที่ซิงก์สดมาจาก Google Drive ให้แสดงภาพจาก Google Drive
  // หากไม่มี ให้ดึงภาพคลังหลักฐานเฉพาะของปีการศึกษานั้นๆ (yearData.gallery)
  const yearData = getActiveYearData();
  let galleryList = (yearData && yearData.gallery && yearData.gallery.length > 0) ? yearData.gallery : sampleGallery;
  let isLiveDrive = false;
  if (DriveSync.syncedData && DriveSync.syncedData.evidenceGallery && DriveSync.syncedData.evidenceGallery.length > 0) {
    galleryList = DriveSync.syncedData.evidenceGallery;
    isLiveDrive = true;
  }

  container.innerHTML = '';
  galleryList.forEach(item => {
    const card = document.createElement('div');
    card.className = 'group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 hover-lift flex flex-col cursor-pointer';
    card.onclick = () => openLightbox(item.fullUrl, item.title, item.caption);
    card.innerHTML = `
      <div class="relative overflow-hidden aspect-[4/3] bg-slate-100">
        <img src="${item.thumbUrl}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" onerror="this.src='https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80'">
        <div class="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/0 transition"></div>
        <span class="absolute top-3 left-3 bg-teal-700 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1">
          ${isLiveDrive ? '<i class="fa-brands fa-google-drive text-[10px]"></i>' : ''} ${item.badge}
        </span>
      </div>
      <div class="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h4 class="font-heading font-bold text-slate-900 text-sm leading-snug group-hover:text-teal-700 transition line-clamp-1">${item.title}</h4>
          <p class="text-xs text-slate-500 mt-1 line-clamp-2">${item.caption || 'ภาพหลักฐานประกอบการประเมิน PA'}</p>
        </div>
        <div class="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span><i class="fa-regular fa-calendar-check mr-1"></i> ${item.date || 'ปี'} ${currentAcademicYear}</span>
          <span class="text-teal-600 font-medium">คลิกดูภาพขยาย</span>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Indicator Modal
function openIndicatorModal(indicator, teacher, expectedLevel) {
  const modal = document.getElementById('indicator-modal');
  if (!modal) return;

  const yearData = getActiveYearData();
  const synth = (yearData && yearData.indicatorSyntheses && yearData.indicatorSyntheses[indicator.code])
    ? yearData.indicatorSyntheses[indicator.code]
    : null;

  document.getElementById('modal-code').innerText = `ตัวชี้วัด ${indicator.code}`;
  document.getElementById('modal-title').innerText = indicator.title;
  document.getElementById('modal-level').innerText = expectedLevel;

  if (synth) {
    document.getElementById('modal-details').innerText = synth.task;
    document.getElementById('modal-results').innerHTML = `
      <div class="space-y-2">
        <div class="flex items-start gap-2">
          <span class="px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-900 font-bold text-xs flex-shrink-0">เชิงปริมาณ</span>
          <span class="text-xs sm:text-sm text-emerald-950">${synth.quant}</span>
        </div>
        <div class="flex items-start gap-2 pt-1 border-t border-emerald-200/60">
          <span class="px-2 py-0.5 rounded bg-teal-200/80 text-teal-900 font-bold text-xs flex-shrink-0">เชิงคุณภาพ</span>
          <span class="text-xs sm:text-sm text-emerald-950">${synth.qual}</span>
        </div>
      </div>
    `;
  } else {
    document.getElementById('modal-details').innerText = `การดำเนินการตามตัวชี้วัด ${indicator.code} (${indicator.title}) ของ ${teacher.name} สอดรับกับระดับการปฏิบัติที่คาดหวังตามมาตรฐานตำแหน่งและวิทยฐานะ ${teacher.academicStanding} คือ "${expectedLevel}"`;
    document.getElementById('modal-results').innerText = `ผู้เรียนเกิดสมรรถนะการเรียนรู้ ทักษะการปฏิบัติงาน และมีคุณลักษณะอันพึงประสงค์ผ่านเกณฑ์มาตรฐานของกลุ่มสาระการเรียนรู้`;
  }

  // ตรวจสอบไฟล์จริงจาก Google Drive ที่ซิงก์มา
  const listEl = document.getElementById('modal-evidence-list');
  let driveFolderData = null;

  if (DriveSync.syncedData && DriveSync.syncedData.indicators) {
    // ค้นหาโฟลเดอร์ที่ชื่อขึ้นต้นหรือตรงกับรหัสตัวชี้วัด เช่น "1.1", "1.1 การสร้างและพัฒนาหลักสูตร"
    const matchingKey = Object.keys(DriveSync.syncedData.indicators).find(key => 
      key === indicator.code || key.startsWith(indicator.code + ' ') || key.startsWith(indicator.code + '.') || key.includes(indicator.code)
    );
    if (matchingKey) {
      driveFolderData = DriveSync.syncedData.indicators[matchingKey];
    }
  }

  if (driveFolderData && driveFolderData.files && driveFolderData.files.length > 0) {
    listEl.innerHTML = '';
    driveFolderData.files.forEach(file => {
      const fileCard = document.createElement('div');
      fileCard.className = 'flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-teal-50/60 transition';
      fileCard.innerHTML = `
        <div class="flex items-center gap-3 min-w-0 pr-2">
          <div class="w-9 h-9 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center text-base flex-shrink-0">
            <i class="fa-solid ${file.icon || 'fa-file-lines'}"></i>
          </div>
          <div class="min-w-0">
            <div class="font-heading font-semibold text-slate-900 text-xs sm:text-sm truncate" title="${file.title}">${file.title}</div>
            <div class="text-[11px] text-slate-500 flex items-center gap-2">
              <span>ขนาด ${file.size}</span>
              <span>•</span>
              <span class="text-teal-700 font-medium">Google Drive สด</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-1.5 flex-shrink-0">
          <a href="${file.viewUrl}" target="_blank" class="px-2.5 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition shadow-sm flex items-center gap-1">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> <span class="hidden sm:inline">เปิดดู</span>
          </a>
        </div>
      `;
      listEl.appendChild(fileCard);
    });

    if (driveFolderData.folderUrl) {
      const folderLink = document.createElement('div');
      folderLink.className = 'pt-2 text-right';
      folderLink.innerHTML = `
        <a href="${driveFolderData.folderUrl}" target="_blank" class="text-xs text-teal-700 hover:text-teal-900 font-semibold inline-flex items-center gap-1">
          <i class="fa-brands fa-google-drive"></i> เปิดดูโฟลเดอร์นี้ใน Google Drive <i class="fa-solid fa-chevron-right text-[10px]"></i>
        </a>
      `;
      listEl.appendChild(folderLink);
    }
  } else {
    // โหมดจำลอง / หรือยังไม่มีไฟล์ใน Google Drive
    listEl.innerHTML = `
      <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-teal-50/50 transition cursor-pointer" onclick="openDocViewer('เอกสารประกอบตัวชี้วัด ${indicator.code}', 'PDF')">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center text-base"><i class="fa-solid fa-file-pdf"></i></div>
          <div>
            <div class="font-heading font-semibold text-slate-900 text-xs sm:text-sm">เอกสารร่องรอยหลักฐาน ตัวชี้วัด ${indicator.code} (ปีการศึกษา ${currentAcademicYear})</div>
            <div class="text-[11px] text-teal-800 font-medium">${(synth && synth.evidence) ? '<i class="fa-solid fa-list-check mr-1 text-teal-600"></i> ' + synth.evidence : 'Google Drive Folder · ตัวชี้วัด ' + indicator.code}</div>
          </div>
        </div>
        <button class="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-teal-700 text-xs font-semibold hover:bg-teal-600 hover:text-white transition shadow-sm">
          <i class="fa-solid fa-eye mr-1"></i> เปิดดูตัวอย่าง
        </button>
      </div>
    `;
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

function closeIndicatorModal() {
  const modal = document.getElementById('indicator-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
  }
}

// Lightbox Logic
function openLightbox(src, title, caption) {
  const lightbox = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const cap = document.getElementById('lightbox-caption');
  const tit = document.getElementById('lightbox-title');
  if (!lightbox || !img) return;

  img.src = src;
  if (tit) tit.innerText = title || 'หลักฐานเชิงประจักษ์';
  if (cap) cap.innerText = caption || '';

  lightbox.classList.remove('hidden');
  lightbox.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    lightbox.classList.add('hidden');
    lightbox.classList.remove('flex');
    if (typeof PresentationDeck !== 'undefined' && PresentationDeck.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }
}

// Document Viewer Modal
function openDocViewer(title, type) {
  const modal = document.getElementById('doc-modal');
  if (!modal) return;
  const teacher = getActiveTeacher();

  document.getElementById('doc-modal-title').innerText = title;
  document.getElementById('doc-modal-type').innerText = `ประเภทเอกสาร: ${type} · ปีการศึกษา ${currentAcademicYear}`;
  document.getElementById('doc-modal-teacher-name').innerText = teacher.name;
  document.getElementById('doc-modal-school').innerText = `${teacher.learningArea} · ${teacher.school}`;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

function closeDocViewer() {
  const modal = document.getElementById('doc-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
  }
}

// Committee Score Calculator
function loadScoresForYear(yearData) {
  const scores = yearData.scores || { domain1: 38, domain2: 19, domain3: 20, challenge: 19 };
  if (document.getElementById('score-domain-1')) document.getElementById('score-domain-1').value = scores.domain1;
  if (document.getElementById('score-domain-2')) document.getElementById('score-domain-2').value = scores.domain2;
  if (document.getElementById('score-domain-3')) document.getElementById('score-domain-3').value = scores.domain3;
  if (document.getElementById('score-challenge')) document.getElementById('score-challenge').value = scores.challenge;
  calculateCommitteeScore();
}

function calculateCommitteeScore() {
  const s1 = parseFloat(document.getElementById('score-domain-1')?.value || 38);
  const s2 = parseFloat(document.getElementById('score-domain-2')?.value || 19);
  const s3 = parseFloat(document.getElementById('score-domain-3')?.value || 20);
  const s4 = parseFloat(document.getElementById('score-challenge')?.value || 19);

  if (document.getElementById('val-domain-1')) document.getElementById('val-domain-1').innerText = `${s1} / 40`;
  if (document.getElementById('val-domain-2')) document.getElementById('val-domain-2').innerText = `${s2} / 20`;
  if (document.getElementById('val-domain-3')) document.getElementById('val-domain-3').innerText = `${s3} / 20`;
  if (document.getElementById('val-domain-4')) document.getElementById('val-domain-4').innerText = `${s4} / 20`;

  const total = (s1 + s2 + s3 + s4).toFixed(1);
  if (document.getElementById('total-score-val')) document.getElementById('total-score-val').innerText = `${total} / 100`;

  const verdictEl = document.getElementById('evaluation-verdict');
  const teacher = getActiveTeacher();
  if (verdictEl) {
    if (total >= 80) {
      verdictEl.innerHTML = `<span class="text-emerald-400 font-bold"><i class="fa-solid fa-circle-check mr-1.5"></i> ผ่านเกณฑ์การประเมินวิทยฐานะ${teacher.academicStanding} (ระดับดีเยี่ยม)</span>`;
    } else if (total >= 70) {
      verdictEl.innerHTML = `<span class="text-teal-400 font-bold"><i class="fa-solid fa-circle-check mr-1.5"></i> ผ่านเกณฑ์การประเมิน (ระดับดี)</span>`;
    } else {
      verdictEl.innerHTML = `<span class="text-amber-400 font-bold"><i class="fa-solid fa-triangle-exclamation mr-1.5"></i> ต่ำกว่าเกณฑ์มาตรฐาน (ต้องปรับปรุง)</span>`;
    }
  }
}

// Drive Sync Modal
function openDriveSyncModal() {
  const modal = document.getElementById('drive-sync-modal');
  if (!modal) return;

  document.getElementById('drive-folder-id-input').value = DriveSync.config.folderId;
  document.getElementById('apps-script-url-input').value = DriveSync.config.appsScriptUrl;

  const feedbackEl = document.getElementById('drive-test-feedback');
  if (feedbackEl) {
    feedbackEl.classList.add('hidden');
    feedbackEl.innerHTML = '';
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

function closeDriveSyncModal() {
  const modal = document.getElementById('drive-sync-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
  }
}

async function testDriveSyncConnection() {
  const folderId = document.getElementById('drive-folder-id-input').value.trim();
  const scriptUrl = document.getElementById('apps-script-url-input').value.trim();
  const feedbackEl = document.getElementById('drive-test-feedback');
  const testBtn = document.getElementById('drive-test-btn');

  if (!feedbackEl) return;
  feedbackEl.classList.remove('hidden');

  if (!scriptUrl) {
    feedbackEl.className = 'mt-2 p-3 rounded-xl text-xs bg-rose-50 border border-rose-200 text-rose-800';
    feedbackEl.innerHTML = '<i class="fa-solid fa-circle-exclamation text-rose-500 mr-1.5"></i> กรุณากรอก Google Apps Script Web App URL ก่อนทดสอบ';
    return;
  }

  if (testBtn) {
    testBtn.disabled = true;
    testBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> กำลังทดสอบ...';
  }

  feedbackEl.className = 'mt-2 p-3 rounded-xl text-xs bg-sky-50 border border-sky-200 text-sky-800';
  feedbackEl.innerHTML = '<i class="fa-solid fa-arrows-rotate fa-spin text-sky-500 mr-1.5"></i> กำลังส่งคำขอทดสอบไปยัง Google Apps Script...';

  const result = await DriveSync.testConnection(folderId, scriptUrl);

  if (testBtn) {
    testBtn.disabled = false;
    testBtn.innerHTML = '<i class="fa-solid fa-bolt mr-1"></i> ทดสอบการเชื่อมต่อ';
  }

  if (result.ok) {
    feedbackEl.className = 'mt-2 p-3.5 rounded-xl text-xs bg-emerald-50 border border-emerald-200 text-emerald-900';
    feedbackEl.innerHTML = `
      <div class="font-bold flex items-center gap-1.5 text-emerald-800 mb-1">
        <i class="fa-solid fa-circle-check text-emerald-600 text-sm"></i> ${result.message}
      </div>
      <div class="text-[11px] text-emerald-700">ระบบพร้อมใช้งาน! คุณสามารถกดปุ่ม "บันทึกและซิงก์ข้อมูล" ด้านล่างได้เลย</div>
    `;
  } else {
    feedbackEl.className = 'mt-2 p-3.5 rounded-xl text-xs bg-rose-50 border border-rose-200 text-rose-950 space-y-1.5';
    let formattedMsg = (result.message || '').replace(/\n/g, '<br>');
    feedbackEl.innerHTML = `
      <div class="font-bold flex items-center gap-1.5 text-rose-800">
        <i class="fa-solid fa-triangle-exclamation text-rose-600 text-sm"></i> ทดสอบไม่สำเร็จ
      </div>
      <div class="text-[11px] leading-relaxed text-rose-900 font-sans">${formattedMsg}</div>
    `;
  }
}

function saveDriveSyncSettings() {
  const folderId = document.getElementById('drive-folder-id-input').value.trim();
  let scriptUrl = document.getElementById('apps-script-url-input').value.trim();

  // ปรับแก้เบื้องต้นหากผู้ใช้เผลอวาง URL หน้า Editor
  if (scriptUrl.includes('/edit')) {
    scriptUrl = scriptUrl.replace(/\/edit.*$/, '/exec');
  }

  DriveSync.saveConfig(folderId, scriptUrl, true);
  closeDriveSyncModal();
  DriveSync.syncAndApply(currentAcademicYear, true);
}

// Folder Template Modal
function openFolderTemplateModal() {
  const modal = document.getElementById('folder-template-modal');
  if (!modal) return;

  const teacher = getActiveTeacher();
  const nameInput = document.getElementById('template-teacher-name-input');
  const yearInput = document.getElementById('template-year-input');

  if (nameInput) nameInput.value = teacher ? teacher.name : 'นายกรกฎ รัตนะโชติ';
  if (yearInput) yearInput.value = currentAcademicYear || '2568';

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

function closeFolderTemplateModal() {
  const modal = document.getElementById('folder-template-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
  }
}

async function handleDownloadFolderTemplate() {
  const nameInput = document.getElementById('template-teacher-name-input');
  const yearInput = document.getElementById('template-year-input');
  
  const teacherName = nameInput ? nameInput.value.trim() : '';
  const year = yearInput ? yearInput.value.trim() : '';

  if (!teacherName) {
    alert('กรุณาระบุชื่อคุณครู');
    return;
  }
  if (!year) {
    alert('กรุณาระบุปีการศึกษา');
    return;
  }

  const btn = document.getElementById('btn-download-template-zip');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> กำลังสร้างไฟล์ ZIP...';
  }

  try {
    await DriveSync.downloadFolderTemplateZip(teacherName, year);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-file-zipper mr-1.5"></i> ดาวน์โหลดโครงสร้างโฟลเดอร์ (.ZIP)';
    }
  }
}

// New Year Modal
function openNewYearModal() {
  const modal = document.getElementById('new-year-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeNewYearModal() {
  const modal = document.getElementById('new-year-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function handleCreateNewYear() {
  const newYearInput = document.getElementById('new-year-input').value.trim();
  if (!newYearInput) return alert('กรุณาระบุปีการศึกษา');

  const teacher = getActiveTeacher();
  if (!teacher.years) teacher.years = {};

  if (teacher.years[newYearInput]) {
    return alert(`ปีการศึกษา ${newYearInput} มีอยู่ในระบบแล้ว`);
  }

  // Clone from current year as baseline
  const baseline = getActiveYearData();
  teacher.years[newYearInput] = JSON.parse(JSON.stringify(baseline));
  teacher.years[newYearInput].year = newYearInput;
  teacher.years[newYearInput].status = `รอบการประเมินปีการศึกษา ${newYearInput}`;

  saveStoredTeachers();
  closeNewYearModal();
  switchAcademicYear(newYearInput);
  alert(`เริ่มต้นปีการศึกษา ${newYearInput} สำเร็จแล้ว! คุณครูสามารถเพิ่มผลงานในรอบปีนี้ได้ทันที`);
}

// Teacher Clone / Onboarding Wizard
function openTeacherCloneModal() {
  const modal = document.getElementById('teacher-clone-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeTeacherCloneModal() {
  const modal = document.getElementById('teacher-clone-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function handleCreateNewTeacher() {
  const name = document.getElementById('new-teacher-name').value.trim();
  const standing = document.getElementById('new-teacher-standing').value;
  const school = document.getElementById('new-teacher-school').value.trim();
  const dept = document.getElementById('new-teacher-dept').value.trim();
  const challenge = document.getElementById('new-teacher-challenge').value.trim();

  if (!name || !school) return alert('กรุณากรอกชื่อ-สกุล และโรงเรียน');

  const newId = 'teacher-' + Date.now();
  PAFOLIO_DATABASE[newId] = {
    id: newId,
    name: name,
    position: "ครู",
    academicStanding: standing,
    school: school,
    affiliation: "สพม./สพป.",
    learningArea: dept || "กลุ่มสาระการเรียนรู้",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
    coverUrl: "https://drive.google.com/thumbnail?id=1Dyu3SQW--LpIPxO0x5weLb1C8ZhU5Hjv&sz=w1920",
    driveFolderId: "",
    appsScriptUrl: "",
    selectedYear: "2568",
    years: {
      "2568": {
        year: "2568",
        status: "รอบการประเมิน 2567-2568",
        roles: ["ครูผู้สอน", "ครูที่ปรึกษา"],
        teachingLoad: [
          { subject: "รายวิชาหลัก", grade: "มัธยมศึกษา", hours: "16 คาบ/สัปดาห์", type: "วิชาพื้นฐาน" },
          { subject: "งานสนับสนุนและ PLC", grade: "ทุกระดับ", hours: "4 คาบ/สัปดาห์", type: "งานสนับสนุน" }
        ],
        totalHours: "20 คาบ/สัปดาห์",
        challengeIssue: {
          topic: challenge || "การพัฒนาการจัดการเรียนรู้เชิงรุก (Active Learning)",
          subject: "กลุ่มสาระการเรียนรู้" + dept,
          targetGroup: "นักเรียนระดับชั้นมัธยมศึกษา",
          coreObjective: "เพื่อพัฒนาผลสัมฤทธิ์ทางการเรียนและสมรรถนะสำคัญของผู้เรียน",
          steps: [
            { letter: "P", title: "Plan", nameThai: "การวางแผนและวิเคราะห์ปัญหา", color: "teal", description: "วิเคราะห์สภาพปัญหาและออกแบบการเรียนรู้" },
            { letter: "D", title: "Do", nameThai: "การจัดกิจกรรม Active Learning", color: "cyan", description: "ลงมือจัดกิจกรรมและกระตุ้นการมีส่วนร่วม" },
            { letter: "C", title: "Check", nameThai: "การวัดและประเมินผล", color: "amber", description: "ประเมินผลตามสภาพจริงด้วยเกณฑ์รูบริกส์" },
            { letter: "A", title: "Act", nameThai: "การสะท้อนผลและขยายผล", color: "emerald", description: "ถอดบทเรียน PLC และปรับปรุงการสอน" }
          ],
          metrics: {
            quantitative: { target: "ร้อยละ 80", actual: "ร้อยละ 85.0", details: "ผู้เรียนร้อยละ 85 ผ่านเกณฑ์การประเมิน" },
            qualitative: { target: "ระดับดี", actual: "ระดับดีเยี่ยม", details: "ผู้เรียนมีทักษะและคุณลักษณะอันพึงประสงค์" }
          },
          sdlComparison: {
            labels: ["การวางแผน", "การปฏิบัติ", "การแก้ปัญหา", "การทำงานร่วมกัน", "การประเมินตนเอง"],
            preTest: [55, 50, 52, 60, 58],
            postTest: [85, 88, 86, 90, 89]
          }
        },
        scores: { domain1: 36, domain2: 18, domain3: 19, challenge: 18, total: 91 }
      }
    }
  };

  saveStoredTeachers();
  closeTeacherCloneModal();
  switchTeacherProfile(newId);
  alert(`สร้างโปรไฟล์ครู ${name} เรียบร้อยแล้ว! ระบบได้ปรับระดับความคาดหวังตามวิทยฐานะ "${standing}" ให้อัตโนมัติ`);
}

// Local Storage for Teachers
function saveStoredTeachers() {
  try {
    localStorage.setItem('pafolio_custom_teachers', JSON.stringify(PAFOLIO_DATABASE));
  } catch (e) {
    console.error('Error saving teachers to localStorage', e);
  }
}

function loadStoredTeachers() {
  try {
    const data = localStorage.getItem('pafolio_custom_teachers');
    if (data) {
      const parsed = JSON.parse(data);
      // ตรวจสอบและผสานข้อมูลอย่างปลอดภัย ป้องกันไม่ให้แคชเก่าลบปี 2567, 2566 หรือ indicatorSyntheses
      for (const key in parsed) {
        const stored = parsed[key];
        const baseline = PAFOLIO_DATABASE[key];

        if (stored.avatarUrl && stored.avatarUrl.includes('/drive/folders/')) {
          stored.avatarUrl = baseline?.avatarUrl || PAFOLIO_DATABASE['teacher-korakot']?.avatarUrl || '';
        }
        if (stored.coverUrl && stored.coverUrl.includes('/drive/folders/')) {
          stored.coverUrl = baseline?.coverUrl || PAFOLIO_DATABASE['teacher-korakot']?.coverUrl || '';
        }

        if (baseline && baseline.years) {
          if (!stored.years) stored.years = {};
          for (const y in baseline.years) {
            if (!stored.years[y]) {
              stored.years[y] = baseline.years[y];
            } else {
              if (!stored.years[y].indicatorSyntheses && baseline.years[y].indicatorSyntheses) {
                stored.years[y].indicatorSyntheses = baseline.years[y].indicatorSyntheses;
              }
              if (!stored.years[y].gallery && baseline.years[y].gallery) {
                stored.years[y].gallery = baseline.years[y].gallery;
              }
              if (!stored.years[y].avatarUrl && baseline.years[y].avatarUrl) {
                stored.years[y].avatarUrl = baseline.years[y].avatarUrl;
              }
              if (!stored.years[y].coverUrl && baseline.years[y].coverUrl) {
                stored.years[y].coverUrl = baseline.years[y].coverUrl;
              }
            }
          }
        }
      }
      Object.assign(PAFOLIO_DATABASE, parsed);
    }
  } catch (e) {
    console.error('Error loading teachers from localStorage', e);
  }
}

// Toggle Presentation Mode
function togglePresentationMode(target = 0) {
  if (typeof PresentationDeck !== 'undefined') {
    if (PresentationDeck.isOpen) {
      PresentationDeck.close();
    } else {
      PresentationDeck.open(target);
    }
  }
}

function printExecutiveSummary() {
  window.print();
}

function filterDomain(domainId, btnElement) {
  document.querySelectorAll('.domain-btn').forEach(btn => {
    btn.classList.remove('active', 'bg-teal-700', 'text-white', 'shadow-md');
    btn.classList.add('bg-white', 'text-slate-700');
  });

  if (btnElement) {
    btnElement.classList.add('active', 'bg-teal-700', 'text-white', 'shadow-md');
    btnElement.classList.remove('bg-white', 'text-slate-700');
  }

  const searchVal = document.getElementById('indicator-search')?.value || '';
  renderIndicators(domainId, searchVal);
}

function handleIndicatorSearch(event) {
  const query = event.target.value;
  const activeBtn = document.querySelector('.domain-btn.active');
  const currentDomain = activeBtn ? activeBtn.getAttribute('data-domain') : 'all';
  renderIndicators(currentDomain, query);
}

function setupEventListeners() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeIndicatorModal();
      closeLightbox();
      closeDocViewer();
      closeDriveSyncModal();
      closeNewYearModal();
      closeTeacherCloneModal();
      closeAIAssistant();
      if (typeof PresentationDeck !== 'undefined' && PresentationDeck.isOpen) {
        PresentationDeck.close();
      }
    }
  });

  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
}

// ================= AI ASSISTANT CONTROLLERS =================
let currentAIIndicatorResult = null;
let currentAIChallengeResult = null;

function openAIAssistant() {
  const modal = document.getElementById('ai-assistant-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

function openAIAssistantForIndicator() {
  const codeEl = document.getElementById('modal-code');
  if (codeEl) {
    const codeMatch = codeEl.innerText.match(/(1\.[1-8]|2\.[1-4]|3\.[1-3])/);
    if (codeMatch) {
      const selectEl = document.getElementById('ai-indicator-select');
      if (selectEl) selectEl.value = codeMatch[1];
    }
  }
  switchAITab('indicator');
  openAIAssistant();
  handleAIGenerateIndicator();
}

function closeAIAssistant() {
  const modal = document.getElementById('ai-assistant-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
  }
}

function switchAITab(tab) {
  const btnInd = document.getElementById('ai-tab-indicator');
  const btnCh = document.getElementById('ai-tab-challenge');
  const panelInd = document.getElementById('ai-panel-indicator');
  const panelCh = document.getElementById('ai-panel-challenge');

  if (tab === 'indicator') {
    btnInd.className = 'flex-1 py-2 rounded-xl bg-white text-teal-800 shadow-sm transition';
    btnCh.className = 'flex-1 py-2 rounded-xl text-slate-600 hover:text-slate-900 transition';
    panelInd.classList.remove('hidden');
    panelCh.classList.add('hidden');
  } else {
    btnCh.className = 'flex-1 py-2 rounded-xl bg-white text-indigo-800 shadow-sm transition';
    btnInd.className = 'flex-1 py-2 rounded-xl text-slate-600 hover:text-slate-900 transition';
    panelCh.classList.remove('hidden');
    panelInd.classList.add('hidden');
  }
}

function handleAIGenerateIndicator() {
  const code = document.getElementById('ai-indicator-select')?.value || '1.1';
  const subject = document.getElementById('ai-subject-select')?.value || 'การงานอาชีพ';
  const teacher = getActiveTeacher();
  const standing = teacher.academicStanding || 'ครูชำนาญการพิเศษ';

  const res = AIAssistant.generateIndicatorContent(code, subject, 'มัธยมศึกษา', standing);
  currentAIIndicatorResult = res;

  const outWork = document.getElementById('ai-out-work');
  const outOutcome = document.getElementById('ai-out-outcome');
  const outBox = document.getElementById('ai-indicator-output');

  if (outWork) outWork.innerText = res.workDescription;
  if (outOutcome) outOutcome.innerText = res.outcomeDescription;
  if (outBox) outBox.classList.remove('hidden');
}

function applyAIToIndicatorModal() {
  if (!currentAIIndicatorResult) return;
  const modalDetails = document.getElementById('modal-details');
  const modalResults = document.getElementById('modal-results');

  if (modalDetails) modalDetails.innerText = currentAIIndicatorResult.workDescription;
  if (modalResults) modalResults.innerText = currentAIIndicatorResult.outcomeDescription;

  closeAIAssistant();
  DriveSync.showToast('✅ อัปเดตข้อความจาก AI ลงในตัวชี้วัดเรียบร้อยแล้ว!', 'success', 3000);
}

function handleAIGenerateChallenge() {
  const topic = document.getElementById('ai-challenge-topic-input')?.value.trim() || 'ทักษะการเรียนรู้เชิงรุก Active Learning';
  const modelType = document.getElementById('ai-challenge-model-type')?.value || 'PREM';
  const grade = document.getElementById('ai-challenge-grade-input')?.value.trim() || 'มัธยมศึกษาปีที่ 6';
  const teacher = getActiveTeacher();

  const res = AIAssistant.generateChallengeModel(topic, teacher.learningArea, grade, modelType);
  currentAIChallengeResult = res;

  const outTitle = document.getElementById('ai-out-challenge-title');
  const outBox = document.getElementById('ai-challenge-output');

  if (outTitle) outTitle.innerText = res.topic;
  if (outBox) outBox.classList.remove('hidden');
}

function applyAIToChallengeSection() {
  if (!currentAIChallengeResult) return;
  const teacher = getActiveTeacher();
  const yearData = getActiveYearData();

  yearData.challengeIssue = currentAIChallengeResult;
  renderChallengeSection(teacher, yearData);
  saveStoredTeachers();

  closeAIAssistant();
  DriveSync.showToast('✅ อัปเดตโมเดลประเด็นท้าทายลงในหน้าเว็บเรียบร้อยแล้ว!', 'success', 3500);
}

function copyToClipboard(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const text = el.innerText || el.textContent;
  navigator.clipboard.writeText(text).then(() => {
    DriveSync.showToast('📋 คัดลอกข้อความลงคลิปบอร์ดแล้ว', 'info', 2500);
  }).catch(() => {
    alert('คัดลอกข้อความสำเร็จ: \n' + text);
  });
}

// =========================================================================
// Theme Modal Handlers (11 Premium Themes)
// =========================================================================
function openThemeModal() {
  const modal = document.getElementById('theme-modal');
  if (!modal) return;

  const container = document.getElementById('theme-grid-container');
  if (container && typeof ThemeEngine !== 'undefined') {
    container.innerHTML = ThemeEngine.renderThemeCardsHTML();
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeThemeModal() {
  const modal = document.getElementById('theme-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// =========================================================================
// Profile Editor Modal Handlers (No-Code Visual Editor)
// =========================================================================
function handleAvatarInputLive(val) {
  const preview = document.getElementById('edit-profile-avatar-preview');
  const feedback = document.getElementById('avatar-input-feedback');
  if (!preview || !feedback) return;

  const clean = (val || '').trim();
  if (!clean) {
    feedback.className = 'text-[11px] hidden';
    preview.src = PAFOLIO_DATABASE['teacher-korakot']?.avatarUrl || '';
    return;
  }

  feedback.classList.remove('hidden');

  if (clean.includes('/drive/folders/')) {
    feedback.className = 'text-[11px] text-amber-400 bg-amber-950/60 p-2 rounded-lg border border-amber-500/40 mt-1';
    feedback.innerHTML = '<i class="fa-solid fa-triangle-exclamation mr-1 text-amber-400"></i> <b>ตรวจพบลิงก์โฟลเดอร์:</b> เบราว์เซอร์ไม่สามารถแสดงโฟลเดอร์เป็นภาพได้ กรุณาเปิดโฟลเดอร์ คลิกขวาที่ <u>ไฟล์รูปภาพ</u> แล้วเลือก <b>แชร์ &gt; คัดลอกลิงก์</b> มาวางแทนครับ';
    preview.src = PAFOLIO_DATABASE['teacher-korakot']?.avatarUrl || '';
  } else {
    const converted = convertToGoogleDriveThumbnailUrl(clean, 'w800');
    if (clean.includes('/file/d/') || clean.includes('id=')) {
      feedback.className = 'text-[11px] text-emerald-400 bg-emerald-950/60 p-1.5 rounded-lg border border-emerald-500/40 mt-1';
      feedback.innerHTML = '<i class="fa-solid fa-circle-check mr-1 text-emerald-400"></i> ตรวจพบลิงก์ภาพ Google Drive เรียบร้อยแล้ว';
    } else {
      feedback.className = 'text-[11px] hidden';
    }
    preview.src = converted;
  }
}

function handleCoverInputLive(val) {
  const preview = document.getElementById('edit-profile-cover-preview');
  const feedback = document.getElementById('cover-input-feedback');
  if (!preview || !feedback) return;

  const clean = (val || '').trim();
  if (!clean) {
    feedback.className = 'text-[11px] hidden';
    preview.src = PAFOLIO_DATABASE['teacher-korakot']?.coverUrl || '';
    return;
  }

  feedback.classList.remove('hidden');

  if (clean.includes('/drive/folders/')) {
    feedback.className = 'text-[11px] text-amber-400 bg-amber-950/60 p-2 rounded-lg border border-amber-500/40 mt-1';
    feedback.innerHTML = '<i class="fa-solid fa-triangle-exclamation mr-1 text-amber-400"></i> <b>ตรวจพบลิงก์โฟลเดอร์:</b> เบราว์เซอร์ไม่สามารถแสดงโฟลเดอร์เป็นภาพได้ กรุณาเปิดโฟลเดอร์ คลิกขวาที่ <u>ไฟล์รูปภาพ</u> แล้วเลือก <b>แชร์ &gt; คัดลอกลิงก์</b> มาวางแทนครับ';
    preview.src = PAFOLIO_DATABASE['teacher-korakot']?.coverUrl || '';
  } else {
    const converted = convertToGoogleDriveThumbnailUrl(clean, 'w1920');
    if (clean.includes('/file/d/') || clean.includes('id=')) {
      feedback.className = 'text-[11px] text-emerald-400 bg-emerald-950/60 p-1.5 rounded-lg border border-emerald-500/40 mt-1';
      feedback.innerHTML = '<i class="fa-solid fa-circle-check mr-1 text-emerald-400"></i> ตรวจพบลิงก์ภาพ Google Drive เรียบร้อยแล้ว';
    } else {
      feedback.className = 'text-[11px] hidden';
    }
    preview.src = converted;
  }
}

function openProfileEditorModal() {
  const modal = document.getElementById('profile-editor-modal');
  if (!modal) return;

  const teacher = getActiveTeacher();
  const yearData = getActiveYearData();
  const challenge = yearData.challengeIssue || {};

  // Fill form inputs
  if (document.getElementById('edit-profile-name')) document.getElementById('edit-profile-name').value = teacher.name || '';
  if (document.getElementById('edit-profile-position')) document.getElementById('edit-profile-position').value = teacher.position || 'ครู';
  if (document.getElementById('edit-profile-standing')) document.getElementById('edit-profile-standing').value = teacher.academicStanding || 'ครูชำนาญการพิเศษ';
  if (document.getElementById('edit-profile-department')) document.getElementById('edit-profile-department').value = teacher.learningArea || teacher.department || '';
  if (document.getElementById('edit-profile-school')) document.getElementById('edit-profile-school').value = teacher.school || '';
  if (document.getElementById('edit-profile-affiliation')) document.getElementById('edit-profile-affiliation').value = teacher.affiliation || '';
  
  const currentAvatar = (yearData && yearData.avatarUrl) ? yearData.avatarUrl : (teacher.avatarUrl || '');
  const currentCover = (yearData && yearData.coverUrl) ? yearData.coverUrl : (teacher.coverUrl || '');
  if (document.getElementById('edit-profile-avatar')) document.getElementById('edit-profile-avatar').value = currentAvatar;
  if (document.getElementById('edit-profile-cover')) document.getElementById('edit-profile-cover').value = currentCover;

  handleAvatarInputLive(currentAvatar);
  handleCoverInputLive(currentCover);

  if (document.getElementById('edit-challenge-topic')) document.getElementById('edit-challenge-topic').value = challenge.topic || '';
  if (document.getElementById('edit-challenge-target')) document.getElementById('edit-challenge-target').value = (challenge.targetGroup ? challenge.targetGroup + ' / ' : '') + (challenge.subject || '');

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

function closeProfileEditorModal() {
  const modal = document.getElementById('profile-editor-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
  }
}

function handleSaveProfileEditor() {
  const teacher = getActiveTeacher();
  const yearData = getActiveYearData();

  const name = document.getElementById('edit-profile-name')?.value.trim();
  const position = document.getElementById('edit-profile-position')?.value.trim();
  const standing = document.getElementById('edit-profile-standing')?.value.trim();
  const dept = document.getElementById('edit-profile-department')?.value.trim();
  const school = document.getElementById('edit-profile-school')?.value.trim();
  const affiliation = document.getElementById('edit-profile-affiliation')?.value.trim();
  const avatar = document.getElementById('edit-profile-avatar')?.value.trim();
  const cover = document.getElementById('edit-profile-cover')?.value.trim();
  const topic = document.getElementById('edit-challenge-topic')?.value.trim();
  const target = document.getElementById('edit-challenge-target')?.value.trim();

  if (!name) {
    alert('กรุณากรอกชื่อ - นามสกุลครู');
    return;
  }

  // ป้องกันการใส่ลิงก์โฟลเดอร์ Google Drive
  if (avatar && avatar.includes('/drive/folders/')) {
    alert('⚠️ ช่อง "URL รูปโปรไฟล์ครู" ปัจจุบันเป็นลิงก์โฟลเดอร์ Google Drive (ไม่ใช่ไฟล์ภาพ)\n\nกรุณาเปิดเข้าไปในโฟลเดอร์นั้น แล้วคลิกขวาที่ "ไฟล์รูปภาพโปรไฟล์" > เลือก "แชร์" > "คัดลอกลิงก์" มาวางแทนครับ');
    return;
  }

  if (cover && cover.includes('/drive/folders/')) {
    alert('⚠️ ช่อง "URL ภาพปกแบนเนอร์ Hero" ปัจจุบันเป็นลิงก์โฟลเดอร์ Google Drive (ไม่ใช่ไฟล์ภาพ)\n\nกรุณาเปิดเข้าไปในโฟลเดอร์นั้น แล้วคลิกขวาที่ "ไฟล์รูปภาพหน้าปก" > เลือก "แชร์" > "คัดลอกลิงก์" มาวางแทนครับ');
    return;
  }

  // Update teacher object with converted URLs
  teacher.name = name;
  if (position) teacher.position = position;
  if (standing) teacher.academicStanding = standing;
  if (dept) { teacher.learningArea = dept; teacher.department = dept; }
  if (school) teacher.school = school;
  if (avatar) {
    const convertedAvatar = convertToGoogleDriveThumbnailUrl(avatar, 'w800');
    teacher.avatarUrl = convertedAvatar;
    if (yearData) yearData.avatarUrl = convertedAvatar;
  }
  if (cover) {
    const convertedCover = convertToGoogleDriveThumbnailUrl(cover, 'w1920');
    teacher.coverUrl = convertedCover;
    if (yearData) yearData.coverUrl = convertedCover;
  }

  if (topic) {
    if (!yearData.challengeIssue) yearData.challengeIssue = {};
    yearData.challengeIssue.topic = topic;
  }
  if (target) {
    if (!yearData.challengeIssue) yearData.challengeIssue = {};
    yearData.challengeIssue.targetGroup = target;
  }

  // Save to localStorage
  saveStoredTeachers();
  renderApp();
  closeProfileEditorModal();

  if (typeof DriveSync !== 'undefined' && DriveSync.showToast) {
    DriveSync.showToast('✅ บันทึกข้อมูลโปรไฟล์และอัปเดตหน้าเว็บเรียบร้อยแล้ว!', 'success', 3500);
  }
}
