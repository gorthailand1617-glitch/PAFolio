/**
 * PAFolio - Application Controller
 * รองรับการสลับปีการศึกษา, สลับครูผู้สอน, และการซิงก์ Google Drive
 */

// Active State Management (ตั้งค่าเริ่มต้นเป็นปี 2569 ล่าสุด)
let currentTeacherId = localStorage.getItem('pafolio_active_teacher') || 'teacher-korakot';
let currentAcademicYear = localStorage.getItem('pafolio_active_year') || '2569';

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
  // 📲 ตรวจจับพารามิเตอร์ URL (เช่น เปิดจาก QR Code บนแท็บเล็ต/มือถือ เพื่อเชื่อมต่อ Google Drive อัตโนมัติ)
  if (typeof DriveSync !== 'undefined' && typeof DriveSync.checkUrlParams === 'function') {
    DriveSync.checkUrlParams();
  }

  // ✨ Cache-Busting & Smart Version Migration: ตั้งค่าปีเริ่มต้นเป็น 2569 อัตโนมัติ และรักษาโปรไฟล์ของครูไว้
  const CURRENT_APP_VERSION = (typeof window !== 'undefined' && window.PAFOLIO_CONFIG && window.PAFOLIO_CONFIG.APP_VERSION) || '2569.8.5';
  const localVersion = localStorage.getItem('pafolio_app_version');
  if (localVersion !== CURRENT_APP_VERSION) {
    localStorage.setItem('pafolio_active_year', '2569');
    localStorage.setItem('pafolio_active_theme', 'gold');
    localStorage.setItem('pafolio_app_version', CURRENT_APP_VERSION);
    currentAcademicYear = '2569';

    // 🧹 ล้างแคชข้อมูลเก่าและเกียรติบัตรปีเพี้ยน (2503, 2505, 2507) ที่เคยค้างในเบราว์เซอร์
    try {
      localStorage.removeItem('pafolio_synced_data');
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('pafolio_synced_data_') || key.startsWith('pafolio_cached_'))) {
          localStorage.removeItem(key);
        }
      }
      const cached = localStorage.getItem('pafolio_custom_teachers');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && parsed['teacher-korakot']) {
            parsed['teacher-korakot'].name = 'นายกรกฎ รัตนะโช';
            parsed['teacher-korakot'].avatarUrl = 'https://drive.google.com/thumbnail?id=1Xr2DlVf1ypx7sH1owj1DwteOW2_JljGP&sz=w800';
            if (parsed['teacher-korakot'].years && parsed['teacher-korakot'].years['2569']) {
              parsed['teacher-korakot'].years['2569'].avatarUrl = 'https://drive.google.com/thumbnail?id=1Xr2DlVf1ypx7sH1owj1DwteOW2_JljGP&sz=w800';
            }
            localStorage.setItem('pafolio_custom_teachers', JSON.stringify(parsed));
          }
        } catch (err) {
          localStorage.removeItem('pafolio_custom_teachers');
        }
      }
    } catch (e) {}
  }

  // ✨ AI Auto-Heal: ตรวจสอบและแก้ไข Google Drive Folder ID อัตโนมัติ (Zero-Config)
  // หากพบ ID ที่เป็นโฟลเดอร์สคริปต์ (19mPdGDZ...) หรือค่าว่าง ให้ AI สลับเป็นโฟลเดอร์ ว.PA จริงทันที
  const badFolderIds = ['19mPdGDZ0QUD7Eem3w-f8WV6xaCRZUYVZ', 'YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE'];
  const trueRootFolderId = (typeof window !== 'undefined' && window.PAFOLIO_CONFIG && window.PAFOLIO_CONFIG.ROOT_FOLDER_ID) || '1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K';
  const savedFolderId = (localStorage.getItem('pafolio_drive_folder_id') || '').trim();
  if (!savedFolderId || badFolderIds.includes(savedFolderId)) {
    localStorage.setItem('pafolio_drive_folder_id', trueRootFolderId);
    if (typeof DriveSync !== 'undefined' && DriveSync.config) {
      DriveSync.config.folderId = trueRootFolderId;
    }
  }

  // Load custom teachers from localStorage if any
  loadStoredTeachers();
  
  // โหลดแคชข้อมูล Google Drive ที่เคยซิงก์ไว้ทันทีเพื่อไม่ให้ข้อมูลหายเมื่อรีเฟรชหน้าเว็บ
  if (typeof DriveSync !== 'undefined' && typeof DriveSync.loadCachedData === 'function') {
    DriveSync.loadCachedData(currentAcademicYear);
  }

  renderApp();
  setupEventListeners();
  DriveSync.updateStatusUI();

  // Auto-sync ข้อมูลสดจาก Google Drive เมื่อเปิดหน้าเว็บ (ถ้ามีการตั้งค่าไว้)
  if (DriveSync.config.appsScriptUrl) {
    // 1. ดึง Universal Cloud State ด่วนพิเศษทันที (< 0.2 วินาที) เพื่อให้อุปกรณ์ทั่วโลกแสดงค่าตรงกัน 100%
    if (typeof DriveSync.fetchCloudState === 'function') {
      DriveSync.fetchCloudState().then(res => {
        if (res) {
          const cState = res.cloudState || (res.theme ? res : null);
          const lProfile = res.liveProfile || null;
          DriveSync.applyCloudState(cState, lProfile, true);
          if (typeof DriveSync.updateStatusUI === 'function') {
            DriveSync.updateStatusUI(true);
          }
        }
      }).catch(err => console.warn('fetchCloudState error:', err));
    }
    // 2. สแกนและซิงก์โฟลเดอร์เต็มรูปแบบในพื้นหลัง
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
  teacher = teacher || (typeof getActiveTeacher === 'function' ? getActiveTeacher() : null);
  if (!teacher) return;
  yearData = yearData || (typeof getActiveYearData === 'function' ? getActiveYearData() : (teacher.years ? teacher.years[currentAcademicYear] : {}));
  expectedLevel = expectedLevel || (typeof getExpectedLevel === 'function' ? getExpectedLevel(teacher.academicStanding) : "ริเริ่ม พัฒนา");

  // Brand Header
  document.querySelectorAll('.teacher-name-label').forEach(el => el.innerText = teacher.name);
  document.querySelectorAll('.teacher-standing-label').forEach(el => el.innerText = teacher.academicStanding);
  document.querySelectorAll('.teacher-school-label').forEach(el => el.innerText = teacher.school);
  document.querySelectorAll('.teacher-dept-label').forEach(el => el.innerText = teacher.learningArea);

  // อัปเดตรูปโปรไฟล์ครู (ดึงภาพเฉพาะของปีการศึกษาที่เลือกก่อน หากไม่มีค่อยใช้รูปหลัก)
  let activeAvatar = (yearData && yearData.avatarUrl) ? yearData.avatarUrl : teacher.avatarUrl;
  const badFolderIds = ['1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K', '19mPdGDZ0QUD7Eem3w-f8WV6xaCRZUYVZ', '1Dyu3SQW'];
  if (!activeAvatar || badFolderIds.some(badId => activeAvatar.includes(badId))) {
    activeAvatar = (window.PAFOLIO_CONFIG && window.PAFOLIO_CONFIG.DEFAULT_AVATAR_URL) || 'https://drive.google.com/thumbnail?id=1Xr2DlVf1ypx7sH1owj1DwteOW2_JljGP&sz=w800';
    if (yearData) yearData.avatarUrl = activeAvatar;
    if (teacher) teacher.avatarUrl = activeAvatar;
  }
  if (activeAvatar && !activeAvatar.includes('/drive/folders/')) {
    const avatarSrc = convertToGoogleDriveThumbnailUrl(activeAvatar, 'w800');
    document.querySelectorAll('.teacher-avatar-img').forEach(el => el.src = avatarSrc);
  }

  // อัปเดตภาพปกแบนเนอร์ Hero (ดึงภาพปกเฉพาะของปีการศึกษาที่เลือกก่อน หากไม่มีค่อยใช้ภาพหลัก)
  let activeCover = (yearData && yearData.coverUrl) ? yearData.coverUrl : teacher.coverUrl;
  if (!activeCover || badFolderIds.some(badId => activeCover.includes(badId))) {
    activeCover = (window.PAFOLIO_CONFIG && window.PAFOLIO_CONFIG.DEFAULT_COVER_URL) || 'https://drive.google.com/thumbnail?id=1noPkaJIRiMIyg0InLRPMnEu4Bi8DNb8I&sz=w1920';
    if (yearData) yearData.coverUrl = activeCover;
    if (teacher) teacher.coverUrl = activeCover;
  }
  if (activeCover && !activeCover.includes('/drive/folders/')) {
    const coverSrc = convertToGoogleDriveThumbnailUrl(activeCover, 'w1920');
    document.querySelectorAll('.hero-cover-img, #hero-cover-img').forEach(el => el.src = coverSrc);
  }

  document.querySelectorAll('.expected-level-badge').forEach(el => el.innerText = expectedLevel);
  document.querySelectorAll('.current-year-label').forEach(el => el.innerText = `ปีงบประมาณ ${currentAcademicYear}`);

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
      <button onclick="openNewYearModal()" title="เพิ่มรอบปีงบประมาณใหม่" class="ml-1 w-5 h-5 rounded-md bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center text-[10px] shadow-sm">
        <i class="fa-solid fa-plus"></i>
      </button>
    </div>
  `;
}

// Switch Academic Year
function switchAcademicYear(year) {
  currentAcademicYear = year;
  localStorage.setItem('pafolio_active_year', year);

  // ส่งต่อการเปลี่ยนปีการศึกษาขึ้น Google Drive (Debounced) เพื่อให้อุปกรณ์อื่นแสดงปีเดียวกัน
  if (typeof DriveSync !== 'undefined' && typeof DriveSync.syncYearToCloud === 'function') {
    DriveSync.syncYearToCloud(year);
  }

  // โหลดแคชข้อมูล Google Drive ของปีที่เลือก
  if (typeof DriveSync !== 'undefined' && typeof DriveSync.loadCachedData === 'function') {
    DriveSync.loadCachedData(year);
  }

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
      const media = (typeof getIndicatorFilesAndMedia === 'function') 
        ? getIndicatorFilesAndMedia(ind.code, currentAcademicYear)
        : { images: [], docs: [], isLiveFromDrive: false, folderUrl: getIndicatorDriveUrl(ind.code) };

      const card = document.createElement('div');
      card.className = 'bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 hover-lift flex flex-col justify-between cursor-pointer group overflow-hidden transition duration-300';
      card.onclick = () => openIndicatorModal(ind, teacher, expectedLevel, domain);

      let tagBg = domain.color === 'teal' ? 'bg-teal-50 text-teal-700 border-teal-200' : (domain.color === 'indigo' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-amber-50 text-amber-800 border-amber-200');

      const primaryImg = (media.images && media.images.length > 0) ? media.images[0] : null;
      const primaryImgUrl = primaryImg ? (primaryImg.url || primaryImg.thumbUrl) : 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80';
      const imgCount = media.images ? media.images.length : 0;
      const filesCount = media.docs ? media.docs.length : 0;

      const liveBadge = media.isLiveFromDrive
        ? `<span class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-emerald-950/85 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold backdrop-blur-md shadow-sm flex items-center gap-1"><i class="fa-brands fa-google-drive"></i> ไดรฟ์สด</span>`
        : '';
      const photoBadge = imgCount > 1
        ? `<span class="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full bg-slate-950/70 text-white text-[10px] font-semibold backdrop-blur-md flex items-center gap-1 shadow"><i class="fa-solid fa-images"></i> ${imgCount} ภาพ</span>`
        : '';

      const indDriveUrl = media.folderUrl || getIndicatorDriveUrl(ind.code);
      const isDirectFolder = isIndicatorFolderDirect(ind.code);
      const synth = (yearData && yearData.indicatorSyntheses && yearData.indicatorSyntheses[ind.code]) ? yearData.indicatorSyntheses[ind.code] : null;

      card.innerHTML = `
        <div>
          <!-- 🖼️ ภาพตัวอย่างจากโฟลเดอร์ภาพตัวชี้วัดในไดรฟ์ (ฟิตขอบครบทุกด้าน) -->
          <div class="relative w-full aspect-[16/10] rounded-xl overflow-hidden mb-3.5 bg-slate-950 flex items-center justify-center shadow-inner group/img">
            <!-- Soft ambient blurred backdrop -->
            <img src="${primaryImgUrl}" alt="" class="absolute inset-0 w-full h-full object-cover filter blur-lg opacity-35 scale-110 pointer-events-none" aria-hidden="true">
            <!-- Main uncropped fitted image showing all edges -->
            <img src="${primaryImgUrl}" alt="${ind.title}" class="relative z-10 max-w-full max-h-full w-auto h-auto object-contain p-1 group-hover:scale-105 transition duration-500 drop-shadow-md" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80'">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none z-10"></div>
            <span class="absolute top-2.5 left-2.5 text-[11px] font-bold px-2.5 py-1 rounded-md border shadow-sm ${tagBg} z-20 flex items-center gap-1.5">
              ตัวชี้วัด ${ind.code}
              ${synth ? '<span class="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-bold shadow-xs"><i class="fa-solid fa-sparkles text-[8px]"></i> AI</span>' : ''}
            </span>
            <div class="z-20">${liveBadge}</div>
            <div class="z-20">${photoBadge}</div>
            <div class="absolute bottom-2 left-2.5 right-14 text-white/95 text-[11px] font-medium truncate drop-shadow z-20">
              ${primaryImg ? (primaryImg.title || ind.title) : ind.title}
            </div>
          </div>

          <h4 class="font-heading font-bold text-slate-900 text-base mb-2 group-hover:text-teal-700 transition leading-snug line-clamp-2">
            ${ind.title}
          </h4>
          <p class="text-xs text-slate-600 leading-relaxed line-clamp-2" title="${synth ? synth.task : ind.shortDesc}">
            ${synth ? synth.task : ind.shortDesc}
          </p>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-[11px] text-slate-500 flex items-center gap-1.5">
            ${media.isLiveFromDrive ? '<i class="fa-solid fa-cloud-arrow-down text-emerald-600"></i>' : '<i class="fa-solid fa-folder-open text-teal-600"></i>'}
            <span>${filesCount > 0 ? filesCount + ' เอกสาร' : 'โฟลเดอร์ไดรฟ์'}</span>
          </span>
          <div class="flex items-center gap-2">
            <a href="${indDriveUrl}" target="_blank" onclick="event.stopPropagation();" 
               class="text-[11px] font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 hover:underline" 
               title="เปิดโฟลเดอร์ Google Drive ของตัวชี้วัด ${ind.code}">
              <i class="fa-brands fa-google-drive"></i> เปิดไดรฟ์ <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
            </a>
            <span class="text-[11px] font-semibold text-slate-600 group-hover:text-teal-700 flex items-center gap-0.5">
              ดูสไลด์ <i class="fa-solid fa-chevron-right text-[9px]"></i>
            </span>
          </div>
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

// ================= 🎥 ระบบเครื่องเล่นวิดีโอ ว.PA (Video Player Studio) =================
let currentPlayingVideoData = null;

function isVideoItem(item) {
  if (!item) return false;
  if (item.type === 'video') return true;
  const target = (item.title || '') + ' ' + (item.fullUrl || '') + ' ' + (item.previewUrl || '') + ' ' + (item.thumbUrl || '');
  return /\.(mp4|webm|mov|m4v|avi|mkv)($|\?)/i.test(target) || target.includes('/preview');
}

function openVideoPlayer(videoData) {
  if (!videoData) return;
  currentPlayingVideoData = videoData;

  const modal = document.getElementById('video-player-modal');
  if (!modal) return;

  const titleEl = document.getElementById('video-player-title');
  const captionEl = document.getElementById('video-player-caption');
  const badgeEl = document.getElementById('video-player-badge');
  const dateEl = document.getElementById('video-player-date');
  const driveBtn = document.getElementById('video-player-drive-btn');
  const extBtn = document.getElementById('video-player-external-btn');

  if (titleEl) titleEl.innerText = videoData.title || 'วิดีโอคลิปการสอน ว.PA';
  if (captionEl) captionEl.innerText = videoData.caption || 'คลิปวิดีโอบันทึกการจัดการเรียนรู้และผลลัพธ์การเรียนรู้ของผู้เรียน';
  if (badgeEl) badgeEl.innerText = videoData.badge || 'วิดีโอการสอน ว.PA';
  if (dateEl) dateEl.innerHTML = `<i class="fa-regular fa-calendar-check mr-1 text-teal-400"></i> ${videoData.date || 'ปีงบประมาณ ' + currentAcademicYear}`;

  const previewUrl = videoData.previewUrl || videoData.fullUrl || videoData.url || '';
  const viewUrl = videoData.viewUrl || previewUrl;

  if (driveBtn) {
    if (viewUrl) {
      driveBtn.href = viewUrl;
      driveBtn.classList.remove('hidden');
    } else {
      driveBtn.classList.add('hidden');
    }
  }

  if (extBtn) {
    extBtn.href = previewUrl || viewUrl || '#';
  }

  const html5Video = document.getElementById('video-player-html5');
  const videoSource = document.getElementById('video-player-source');
  const iframe = document.getElementById('video-player-iframe');
  const loader = document.getElementById('video-player-loader');

  if (loader) loader.classList.remove('hidden', 'opacity-0');

  const isDirectVideo = /\.(mp4|webm|mov|m4v|ogg)($|\?)/i.test(previewUrl);

  if (isDirectVideo) {
    if (iframe) {
      iframe.src = '';
      iframe.classList.add('hidden');
    }
    if (html5Video && videoSource) {
      videoSource.src = previewUrl;
      html5Video.load();
      html5Video.classList.remove('hidden');
      html5Video.oncanplay = () => {
        if (loader) loader.classList.add('opacity-0', 'hidden');
      };
      html5Video.play().catch(() => {});
    }
  } else {
    if (html5Video) {
      html5Video.pause();
      html5Video.classList.add('hidden');
    }
    if (iframe) {
      iframe.src = previewUrl;
      iframe.classList.remove('hidden');
      iframe.onload = () => {
        if (loader) loader.classList.add('opacity-0', 'hidden');
      };
    }
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

function closeVideoPlayer() {
  const modal = document.getElementById('video-player-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }

  const html5Video = document.getElementById('video-player-html5');
  if (html5Video) {
    html5Video.pause();
    html5Video.src = '';
  }

  const iframe = document.getElementById('video-player-iframe');
  if (iframe) {
    iframe.src = '';
  }

  currentPlayingVideoData = null;

  const indModal = document.getElementById('indicator-modal');
  if (indModal && !indModal.classList.contains('hidden')) {
    document.body.style.overflow = 'hidden';
  } else if (typeof PresentationDeck !== 'undefined' && PresentationDeck.isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }
}

function copyCurrentVideoLink() {
  if (!currentPlayingVideoData) return;
  const link = currentPlayingVideoData.viewUrl || currentPlayingVideoData.previewUrl || currentPlayingVideoData.fullUrl || window.location.href;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(link).then(() => {
      if (typeof DriveSync !== 'undefined' && DriveSync.showToast) {
        DriveSync.showToast('📋 คัดลอกลิงก์วิดีโอเรียบร้อยแล้ว!', 'success');
      } else {
        alert('คัดลอกลิงก์เรียบร้อยแล้ว');
      }
    });
  }
}

// Render Evidence Gallery (รองรับคลังภาพถ่ายและคลิปวิดีโอการสอน)
function renderGallery(filter = 'all') {
  const container = document.getElementById('gallery-container');
  if (!container) return;

  const sampleGallery = [
    { 
      type: "video", 
      title: "คลิปวิดีโอบันทึกการจัดกิจกรรม Active Learning 60 นาที", 
      caption: "การบันทึกบรรยากาศการจัดการเรียนรู้เชิงรุก เรื่อง โครงงานนวัตกรรมอาชีพ AFS ตามเกณฑ์ ว9/2564", 
      badge: "ด้านที่ 1 (วิดีโอ 1080p)", 
      thumbUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80", 
      fullUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", 
      previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", 
      date: "กรกฎาคม" 
    },
    { 
      type: "image",
      title: "การจัดทำระบบสารสนเทศรายวิชาและโครงสร้างหลักสูตร", 
      caption: "การชี้แจงโครงสร้างหน่วยการเรียนรู้และระบบสารสนเทศแก่นักเรียน", 
      badge: "ด้านที่ 1 & 2", 
      thumbUrl: "https://drive.google.com/thumbnail?id=1q0IFGBeO9johw1cmn9diWLuSXmt_CLZn&sz=w800", 
      fullUrl: "https://drive.google.com/thumbnail?id=1q0IFGBeO9johw1cmn9diWLuSXmt_CLZn&sz=w1600", 
      date: "มิถุนายน" 
    },
    { 
      type: "image",
      title: "บรรยากาศการจัดกิจกรรมการเรียนรู้ Active Learning", 
      caption: "นักเรียนลงมือปฏิบัติกิจกรรมการแก้ปัญหาในสถานการณ์จำลอง", 
      badge: "ด้านที่ 1", 
      thumbUrl: "https://drive.google.com/thumbnail?id=1sdnONlo5QD71M6R-UnHXhM55RyF5esrP&sz=w800", 
      fullUrl: "https://drive.google.com/thumbnail?id=1sdnONlo5QD71M6R-UnHXhM55RyF5esrP&sz=w1600", 
      date: "กรกฎาคม" 
    },
    { 
      type: "video", 
      title: "คลิปผลลัพธ์การเรียนรู้ของผู้เรียนและการสะท้อนคิด (Thinking Whiteboard)", 
      caption: "การนำเสนอผลงานโครงงานอาชีพและการสะท้อนคิดหลังการเรียนรู้ของนักเรียนกลุ่มตัวอย่าง", 
      badge: "ประเด็นท้าทาย (วิดีโอ 1080p)", 
      thumbUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80", 
      fullUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", 
      previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", 
      date: "สิงหาคม" 
    },
    { 
      type: "image",
      title: "การระดมความคิดด้วย Thinking Whiteboard", 
      caption: "นักเรียนร่วมกันวาดผังความคิดขั้นตอนการแก้ปัญหาเป็นทีม", 
      badge: "ประเด็นท้าทาย", 
      thumbUrl: "https://drive.google.com/thumbnail?id=1mCq2P2UvCAdAXivXcNS49wpM-x5LHS9e&sz=w800", 
      fullUrl: "https://drive.google.com/thumbnail?id=1mCq2P2UvCAdAXivXcNS49wpM-x5LHS9e&sz=w1600", 
      date: "สิงหาคม" 
    },
    { 
      type: "image",
      title: "การวัดและประเมินผลตามสภาพจริง (Authentic Assessment)", 
      caption: "ครูตรวจประเมินชิ้นงานและทักษะการปฏิบัติงานร่วมกับเกณฑ์รูบริกส์", 
      badge: "ด้านที่ 1", 
      thumbUrl: "https://drive.google.com/thumbnail?id=1VXtUko-oQv6bN7ws27GNsk2FKmW5nlSh&sz=w800", 
      fullUrl: "https://drive.google.com/thumbnail?id=1VXtUko-oQv6bN7ws27GNsk2FKmW5nlSh&sz=w1600", 
      date: "กันยายน" 
    },
    { 
      type: "image",
      title: "ระบบดูแลช่วยเหลือผู้เรียน Students Support System (SSS)", 
      caption: "การคัดกรอง SDQ และการประสานงานช่วยเหลือผู้เรียนร่วมกับผู้ปกครอง", 
      badge: "ด้านที่ 2", 
      thumbUrl: "https://drive.google.com/thumbnail?id=1bYywqjS4jbW3U5vMgT9lrCYS8c3Nt3wG&sz=w800", 
      fullUrl: "https://drive.google.com/thumbnail?id=1bYywqjS4jbW3U5vMgT9lrCYS8c3Nt3wG&sz=w1600", 
      date: "ตุลาคม" 
    },
    { 
      type: "video", 
      title: "คลิปการเผยแพร่นวัตกรรมและการเป็นวิทยากรขยายผล", 
      caption: "การบันทึกการจัดอบรมเชิงปฏิบัติการขยายผลโมเดลการสอนให้แก่ครูในกลุ่มสาระและโรงเรียนเครือข่าย", 
      badge: "ด้านที่ 3 (วิดีโอ 1080p)", 
      thumbUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80", 
      fullUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", 
      previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", 
      date: "พฤศจิกายน" 
    },
    { 
      type: "image",
      title: "การขับเคลื่อนชุมชนแห่งการเรียนรู้ทางวิชาชีพ (PLC)", 
      caption: "การประชุมแลกเปลี่ยนเรียนรู้กับคณะครูกลุ่มสาระการเรียนรู้และฝ่ายวิชาการ", 
      badge: "ด้านที่ 3", 
      thumbUrl: "https://drive.google.com/thumbnail?id=1TbStAJqtw3b4gQe5X-mk9pKwL6JI4OqP&sz=w800", 
      fullUrl: "https://drive.google.com/thumbnail?id=1TbStAJqtw3b4gQe5X-mk9pKwL6JI4OqP&sz=w1600", 
      date: "พฤศจิกายน" 
    }
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

  // อัปเดตตัวเลขนับจำนวนสื่อ
  const countAll = galleryList.length;
  const countVideos = galleryList.filter(item => isVideoItem(item)).length;
  const countImages = galleryList.filter(item => !isVideoItem(item)).length;

  if (document.getElementById('gallery-count-all')) document.getElementById('gallery-count-all').innerText = countAll;
  if (document.getElementById('gallery-count-images')) document.getElementById('gallery-count-images').innerText = countImages;
  if (document.getElementById('gallery-count-videos')) document.getElementById('gallery-count-videos').innerText = countVideos;

  // กรองตามประเภท
  let filteredList = galleryList;
  if (filter === 'videos') {
    filteredList = galleryList.filter(item => isVideoItem(item));
  } else if (filter === 'images') {
    filteredList = galleryList.filter(item => !isVideoItem(item));
  }

  // อัปเดตปุ่มแท็บกรอง
  ['all', 'images', 'videos'].forEach(tab => {
    const btn = document.getElementById(`gallery-tab-${tab}`);
    if (btn) {
      if (tab === filter) {
        btn.className = 'gallery-filter-btn px-4 py-2 rounded-xl text-xs font-bold font-heading transition flex items-center gap-1.5 shadow-sm bg-teal-600 text-white active';
      } else {
        btn.className = 'gallery-filter-btn px-4 py-2 rounded-xl text-xs font-bold font-heading transition flex items-center gap-1.5 shadow-sm bg-slate-100 hover:bg-slate-200 text-slate-700';
      }
    }
  });

  container.innerHTML = '';

  if (filteredList.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-400">
        <div class="w-16 h-16 mx-auto mb-3 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl text-slate-400">
          <i class="fa-regular fa-folder-open"></i>
        </div>
        <p class="text-sm font-medium">ยังไม่พบรายการสื่อในหมวดหมู่นี้</p>
      </div>
    `;
    return;
  }

  filteredList.forEach(item => {
    const isVideo = isVideoItem(item);
    const card = document.createElement('div');
    card.className = 'group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 hover-lift flex flex-col cursor-pointer transition';
    
    if (isVideo) {
      card.onclick = () => openVideoPlayer(item);
    } else {
      card.onclick = () => openLightbox(item.fullUrl, item.title, item.caption);
    }

    card.innerHTML = `
      <div class="relative overflow-hidden aspect-[4/3] bg-slate-900">
        <img src="${item.thumbUrl}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" onerror="this.src='https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80'">
        <div class="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/10 transition"></div>
        
        <!-- Badge -->
        <span class="absolute top-3 left-3 ${isVideo ? 'bg-rose-600' : 'bg-teal-700'} text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 z-10">
          ${isLiveDrive ? '<i class="fa-brands fa-google-drive text-[10px]"></i>' : (isVideo ? '<i class="fa-solid fa-play text-[9px]"></i>' : '')} ${item.badge || (isVideo ? 'วิดีโอคลิป' : 'ภาพหลักฐาน')}
        </span>

        ${isVideo ? `
          <!-- Center Video Play Icon Button -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div class="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-rose-600/90 text-white flex items-center justify-center text-xl shadow-2xl ring-4 ring-white/30 group-hover:scale-110 group-hover:bg-rose-500 transition duration-300">
              <i class="fa-solid fa-play ml-1"></i>
            </div>
          </div>
          <!-- 1080p Tag -->
          <span class="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/75 text-white text-[10px] font-bold tracking-wider backdrop-blur-sm z-10">
            HD 1080p
          </span>
        ` : ''}
      </div>
      <div class="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h4 class="font-heading font-bold text-slate-900 text-sm leading-snug group-hover:${isVideo ? 'text-rose-600' : 'text-teal-700'} transition line-clamp-1">${item.title}</h4>
          <p class="text-xs text-slate-500 mt-1 line-clamp-2">${item.caption || 'หลักฐานประกอบการประเมิน ว.PA'}</p>
        </div>
        <div class="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span><i class="fa-regular fa-calendar-check mr-1"></i> ${item.date || 'ปี'} ${currentAcademicYear}</span>
          <span class="${isVideo ? 'text-rose-600' : 'text-teal-600'} font-semibold flex items-center gap-1">
            <i class="fa-solid ${isVideo ? 'fa-play text-[10px]' : 'fa-magnifying-glass-plus text-[11px]'}"></i> 
            ${isVideo ? 'คลิกเปิดเล่นวิดีโอ' : 'คลิกดูภาพขยาย'}
          </span>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// ================= คลังภาพและเอกสารมาตรฐาน 15 ตัวชี้วัด ว9/2564 (ภาพจริงจาก Google Drive ครูกรกฎ) =================
const INDICATOR_CURATED_MEDIA = {
  "1.1": {
    images: [
      { title: "การพัฒนาโครงสร้างหลักสูตรและรายวิชาการงานอาชีพ", url: "https://drive.google.com/thumbnail?id=1e9hefnGj95LS0xD0t3YYLy6MvsQXZ2EJ&sz=w800", fullUrl: "https://drive.google.com/thumbnail?id=1e9hefnGj95LS0xD0t3YYLy6MvsQXZ2EJ&sz=w1600", caption: "การวิเคราะห์มาตรฐานการเรียนรู้ ตัวชี้วัด และการบูรณาการกระบวนการนวัตกรรม AFS" },
      { title: "ผังมโนทัศน์หน่วยการเรียนรู้และโครงสร้างรายวิชา", url: "images/ai_thai_teacher_classroom.jpg", fullUrl: "images/ai_thai_teacher_classroom.jpg", caption: "การออกแบบโครงสร้างหน่วยการเรียนรู้และสมรรถนะสำคัญของผู้เรียน" }
    ],
    sampleDocs: [
      { title: "หลักสูตรกลุ่มสาระการเรียนรู้การงานอาชีพและคำอธิบายรายวิชา.pdf", type: "pdf", icon: "fa-file-pdf", size: "2.8 MB", viewUrl: "https://drive.google.com/drive/folders/1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K" },
      { title: "โครงสร้างหน่วยการเรียนรู้และกำหนดการจัดการเรียนรู้ 2569.pdf", type: "pdf", icon: "fa-file-pdf", size: "1.9 MB", viewUrl: "https://drive.google.com/drive/folders/1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K" }
    ]
  },
  "1.2": {
    images: [
      { title: "การออกแบบแผนการจัดการเรียนรู้เชิงรุก (Active Learning)", url: "https://drive.google.com/thumbnail?id=1pebgAgPRx_AA8St_hrfGGf4RMbiaafP0&sz=w800", fullUrl: "https://drive.google.com/thumbnail?id=1pebgAgPRx_AA8St_hrfGGf4RMbiaafP0&sz=w1600", caption: "แผนการจัดการเรียนรู้ตามรูปแบบการเรียนการสอนโครงงานร่วมกับนวัตกรรม AFS" },
      { title: "บันทึกหลังการจัดการเรียนรู้และสะท้อนคิด", url: "https://drive.google.com/thumbnail?id=1e9hefnGj95LS0xD0t3YYLy6MvsQXZ2EJ&sz=w800", fullUrl: "https://drive.google.com/thumbnail?id=1e9hefnGj95LS0xD0t3YYLy6MvsQXZ2EJ&sz=w1600", caption: "การบันทึกผลการจัดกิจกรรมและการปรับแผนตามความพร้อมของผู้เรียน" }
    ],
    sampleDocs: [
      { title: "แผนการจัดการเรียนรู้ Active Learning โครงงานนวัตกรรม AFS ม.3.pdf", type: "pdf", icon: "fa-file-pdf", size: "4.2 MB", viewUrl: "https://drive.google.com/drive/folders/1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K" },
      { title: "บันทึกสะท้อนคิดหลังการจัดการเรียนรู้และแนวทางพัฒนา.pdf", type: "pdf", icon: "fa-file-pdf", size: "1.5 MB", viewUrl: "https://drive.google.com/drive/folders/1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K" }
    ]
  },
  "1.3": {
    images: [
      { title: "บรรยากาศการจัดกิจกรรม Active Learning ในชั้นเรียน", url: "https://drive.google.com/thumbnail?id=10XtsW5rzTG1bwu6PoOTnt7JMuhJ7Eu5&sz=w800", fullUrl: "https://drive.google.com/thumbnail?id=10XtsW5rzTG1bwu6PoOTnt7JMuhJ7Eu5&sz=w1600", caption: "นักเรียนชั้น ม.3 ลงมือปฏิบัติกิจกรรมกลุ่มและการสร้างสรรค์โครงงานอาชีพ" },
      { title: "การลงมือปฏิบัติโครงงานและการแก้ปัญหาเป็นทีม", url: "https://drive.google.com/thumbnail?id=1qpBFS7zcsxVnOIm7YiA2KfnFP-BZLOEm&sz=w800", fullUrl: "https://drive.google.com/thumbnail?id=1qpBFS7zcsxVnOIm7YiA2KfnFP-BZLOEm&sz=w1600", caption: "นักเรียนร่วมกันวางแผน จัดการ และสร้างสรรค์ชิ้นงานด้วยตนเอง" }
    ],
    sampleDocs: [
      { title: "ใบกิจกรรมการเรียนรู้แบบโครงงานและแบบบันทึกงานกลุ่ม.pdf", type: "pdf", icon: "fa-file-pdf", size: "2.1 MB", viewUrl: "https://drive.google.com/drive/folders/1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K" },
      { title: "รายงานประเมินทักษะการเรียนรู้แบบนำตนเอง (SDL Report).pdf", type: "pdf", icon: "fa-file-pdf", size: "3.4 MB", viewUrl: "https://drive.google.com/drive/folders/1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K" }
    ]
  },
  "1.4": {
    images: [
      { title: "สื่อนวัตกรรมดิจิทัลและชุดเครื่องมือ Scaffolding Toolkit", url: "https://drive.google.com/thumbnail?id=159xFHNfT7f2V1KnbEXpnGZdMgSP79s6x&sz=w800", fullUrl: "https://drive.google.com/thumbnail?id=159xFHNfT7f2V1KnbEXpnGZdMgSP79s6x&sz=w1600", caption: "การประยุกต์ใช้แพลตฟอร์มดิจิทัลและเครื่องมือสนับสนุนการเรียนรู้" },
      { title: "ห้องเรียนออนไลน์และสื่อมัลติมีเดียเสริมการเรียนรู้", url: "images/ai_thai_teacher_innovation.jpg", fullUrl: "images/ai_thai_teacher_innovation.jpg", caption: "แหล่งเรียนรู้ดิจิทัลและบทเรียนแบบ Anywhere Anytime" }
    ],
    sampleDocs: [
      { title: "รายงานการสร้างและพัฒนาสื่อนวัตกรรมการจัดการเรียนรู้ AFS.pdf", type: "pdf", icon: "fa-file-pdf", size: "3.8 MB", viewUrl: "https://drive.google.com/drive/folders/1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K" },
      { title: "คู่มือการใช้สื่อนวัตกรรมดิจิทัลและลิงก์เข้าสู่บทเรียน.pdf", type: "pdf", icon: "fa-file-pdf", size: "1.8 MB", viewUrl: "https://drive.google.com/drive/folders/1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K" }
    ]
  },
  "1.5": {
    images: [
      { title: "การวัดและประเมินผลตามสภาพจริง (Authentic Assessment)", url: "https://drive.google.com/thumbnail?id=1qpBFS7zcsxVnOIm7YiA2KfnFP-BZLOEm&sz=w800", fullUrl: "https://drive.google.com/thumbnail?id=1qpBFS7zcsxVnOIm7YiA2KfnFP-BZLOEm&sz=w1600", caption: "การตรวจประเมินชิ้นงานโครงงานและทักษะการปฏิบัติงานด้วยเกณฑ์รูบริกส์" },
      { title: "การประเมินตนเองและสะท้อนผลการเรียนรู้ของผู้เรียน", url: "https://drive.google.com/thumbnail?id=10XtsW5rzTG1bwu6PoOTnt7JMuhJ7Eu5&sz=w800", fullUrl: "https://drive.google.com/thumbnail?id=10XtsW5rzTG1bwu6PoOTnt7JMuhJ7Eu5&sz=w1600", caption: "นักเรียนสะท้อนคิดประเมินความก้าวหน้าและการแก้ปัญหาโครงงาน" }
    ],
    sampleDocs: [
      { title: "เครื่องมือวัดผลประเมินผลและเกณฑ์การให้คะแนนรูบริกส์ (Rubrics).pdf", type: "pdf", icon: "fa-file-pdf", size: "2.4 MB", viewUrl: "https://drive.google.com/drive/folders/1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K" },
      { title: "ตารางวิเคราะห์ผลการประเมินและค่าความเที่ยงตรง IOC.pdf", type: "pdf", icon: "fa-file-pdf", size: "1.7 MB", viewUrl: "https://drive.google.com/drive/folders/1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K" }
    ]
  },
  "1.6": {
    images: [
      { title: "การวิจัยในชั้นเรียนเพื่อพัฒนาทักษะการเรียนรู้แบบนำตนเอง", url: "https://drive.google.com/thumbnail?id=1e9hefnGj95LS0xD0t3YYLy6MvsQXZ2EJ&sz=w800", fullUrl: "https://drive.google.com/thumbnail?id=1e9hefnGj95LS0xD0t3YYLy6MvsQXZ2EJ&sz=w1600", caption: "การศึกษา วิเคราะห์ สังเคราะห์ผลการใช้นวัตกรรม AFS" },
      { title: "เอกสารรายงานผลการวิจัยและ Best Practice", url: "https://drive.google.com/thumbnail?id=1FJVTnnmBxxz5bw6OXTWhGAbfAhwOEg9z&sz=w800", fullUrl: "https://drive.google.com/thumbnail?id=1FJVTnnmBxxz5bw6OXTWhGAbfAhwOEg9z&sz=w1600", caption: "รายงานผลการพัฒนานวัตกรรมการจัดการเรียนรู้ฉบับสมบูรณ์" }
    ],
    sampleDocs: [
      { title: "รายงานการวิจัยในชั้นเรียน 5 บท ฉบับสมบูรณ์ ปีงบประมาณ 2569.pdf", type: "pdf", icon: "fa-file-pdf", size: "5.4 MB", viewUrl: "https://drive.google.com/drive/folders/1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K" },
      { title: "บทคัดย่อและเอกสารสังเคราะห์ผลการพัฒนาผู้เรียน.pdf", type: "pdf", icon: "fa-file-pdf", size: "1.3 MB", viewUrl: "https://drive.google.com/drive/folders/1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K" }
    ]
  },
  "1.7": {
    images: [
      { title: "การจัดสภาพแวดล้อมและบรรยากาศห้องเรียนส่งเสริมการเรียนรู้", url: "https://drive.google.com/thumbnail?id=1Xr6bAFRKn4CDjsOApz7x3GxeIfF-vGd9&sz=w800", fullUrl: "https://drive.google.com/thumbnail?id=1Xr6bAFRKn4CDjsOApz7x3GxeIfF-vGd9&sz=w1600", caption: "การจัดห้องปฏิบัติการเรียนรู้ให้ปลอดภัย สะอาด เอื้อต่อการคิดริเริ่มสร้างสรรค์" },
      { title: "บรรยากาศการเรียนรู้เชิงบวกและการมีส่วนร่วม", url: "https://drive.google.com/thumbnail?id=10XtsW5rzTG1bwu6PoOTnt7JMuhJ7Eu5&sz=w800", fullUrl: "https://drive.google.com/thumbnail?id=10XtsW5rzTG1bwu6PoOTnt7JMuhJ7Eu5&sz=w1600", caption: "สร้างความอบอุ่น เป็นกันเอง กระตุ้นให้นักเรียนกล้าซักถามและทดลองสิ่งใหม่" }
    ],
    sampleDocs: [
      { title: "บันทึกการจัดสภาพแวดล้อมและมุมส่งเสริมการเรียนรู้ห้องปฏิบัติการ.pdf", type: "pdf", icon: "fa-file-pdf", size: "2.2 MB", viewUrl: "https://drive.google.com/drive/folders/1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K" },
      { title: "ผลการประเมินความพึงพอใจต่อบรรยากาศการเรียนรู้.pdf", type: "pdf", icon: "fa-file-pdf", size: "1.4 MB", viewUrl: "https://drive.google.com/drive/folders/1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K" }
    ]
  },
  "1.8": {
    images: [
      { title: "กิจกรรมโฮมรูมและการปลูกฝังคุณธรรม จริยธรรม", url: "https://drive.google.com/thumbnail?id=1nm8lWXsaMlMLGitXaZVtiZNiAEsB2En4&sz=w800", fullUrl: "https://drive.google.com/thumbnail?id=1nm8lWXsaMlMLGitXaZVtiZNiAEsB2En4&sz=w1600", caption: "การอบรมคุณลักษณะอันพึงประสงค์ วินัย ความรับผิดชอบ และจรรยาบรรณดิจิทัล" },
      { title: "การให้คำปรึกษาและการแนะแนวผู้เรียนรายบุคคล", url: "images/ai_thai_teacher_guidance.jpg", fullUrl: "images/ai_thai_teacher_guidance.jpg", caption: "การส่งเสริมให้นักเรียนเป็นคนดี มีจิตสาธารณะ และมีเป้าหมายในชีวิต" }
    ],
    sampleDocs: [
      { title: "แบบประเมินคุณลักษณะอันพึงประสงค์ 8 ประการ ปี 2569.pdf", type: "pdf", icon: "fa-file-pdf", size: "2.1 MB", viewUrl: "https://drive.google.com/drive/folders/1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K" },
      { title: "บันทึกกิจกรรมโฮมรูมและกิจกรรมเสริมสร้างคุณธรรมจริยธรรม.pdf", type: "pdf", icon: "fa-file-pdf", size: "1.9 MB", viewUrl: "https://drive.google.com/drive/folders/1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K" }
    ]
  },
  "2.1": {
    images: [
      { title: "ระบบสารสนเทศนักเรียนและ ปพ.5 ดิจิทัล", url: "https://drive.google.com/thumbnail?id=1gQXs_llNXOWTXJ_pu_bNOUcJhwKoOrs4&sz=w800", fullUrl: "https://drive.google.com/thumbnail?id=1gQXs_llNXOWTXJ_pu_bNOUcJhwKoOrs4&sz=w1600", caption: "การจัดทำฐานข้อมูลผลการเรียน สถิติการมาเรียน และสารสนเทศรายวิชาอย่างเป็นระบบ" },
      { title: "การรายงานข้อมูลสารสนเทศแก่ผู้บริหารและผู้เกี่ยวข้อง", url: "https://drive.google.com/thumbnail?id=1Dyu3SQW--LpIPxO0x5weLb1C8ZhU5Hjv&sz=w800", fullUrl: "https://drive.google.com/thumbnail?id=1Dyu3SQW--LpIPxO0x5weLb1C8ZhU5Hjv&sz=w1600", caption: "การนำสารสนเทศไปใช้วางแผนพัฒนาคุณภาพการจัดการเรียนรู้" }
    ],
    sampleDocs: [
      { title: "แบบบันทึกผลการพัฒนาคุณภาพผู้เรียน (ปพ.5) ดิจิทัล 2569.pdf", type: "pdf", icon: "fa-file-pdf", size: "3.5 MB", viewUrl: "https://drive.google.com/drive/folders/1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K" },
      { title: "รายงานสารสนเทศรายวิชาและสถิติการเข้าเรียนออนไลน์.pdf", type: "pdf", icon: "fa-file-pdf", size: "1.8 MB", viewUrl: "https://drive.google.com/drive/folders/1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K" }
    ]
  },
  "2.2": {
    images: [
      { title: "ระบบดูแลช่วยเหลือผู้เรียนและการคัดกรอง SDQ", url: "https://drive.google.com/thumbnail?id=1nm8lWXsaMlMLGitXaZVtiZNiAEsB2En4&sz=w800", fullUrl: "https://drive.google.com/thumbnail?id=1nm8lWXsaMlMLGitXaZVtiZNiAEsB2En4&sz=w1600", caption: "การประเมินพฤติกรรม SDQ คัดกรองรายบุคคล และการเยี่ยมบ้านนักเรียน" },
      { title: "การให้คำปรึกษาและติดตามช่วยเหลือนักเรียนกลุ่มเสี่ยง", url: "images/ai_thai_teacher_guidance.jpg", fullUrl: "images/ai_thai_teacher_guidance.jpg", caption: "การประสานความร่วมมือเพื่อช่วยเหลือนักเรียนให้ได้รับการสนับสนุนตรงจุด" }
    ],
    sampleDocs: [
      { title: "สรุปผลการคัดกรองแบบประเมิน SDQ และการเยี่ยมบ้าน 100%.pdf", type: "pdf", icon: "fa-file-pdf", size: "2.9 MB", viewUrl: "https://drive.google.com/drive/folders/1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K" },
      { title: "รายงานการดำเนินงานระบบดูแลช่วยเหลือนักเรียน (SSS).pdf", type: "pdf", icon: "fa-file-pdf", size: "2.1 MB", viewUrl: "https://drive.google.com/drive/folders/1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K" }
    ]
  },
  "2.3": {
    images: [
      { title: "การปฏิบัติงานฝ่ายบริหารงานวิชาการและงานสถานศึกษา", url: "https://drive.google.com/thumbnail?id=173amy74R1ujDfrvZF5sDmua4jVP_f-M&sz=w800", fullUrl: "https://drive.google.com/thumbnail?id=173amy74R1ujDfrvZF5sDmua4jVP_f-M&sz=w1600", caption: "การดำเนินงานตามคำสั่งมอบหมายหน้าที่ราชการ งานวิชาการ และกิจกรรมสำคัญของโรงเรียน" },
      { title: "รายงานการประเมินตนเองของสถานศึกษา (SAR)", url: "https://drive.google.com/thumbnail?id=1FJVTnnmBxxz5bw6OXTWhGAbfAhwOEg9z&sz=w800", fullUrl: "https://drive.google.com/thumbnail?id=1FJVTnnmBxxz5bw6OXTWhGAbfAhwOEg9z&sz=w1600", caption: "การจัดทำรายงานคุณภาพการศึกษาและการประกันคุณภาพภายใน" }
    ],
    sampleDocs: [
      { title: "คำสั่งแต่งตั้งและมอบหมายหน้าที่ราชการฝ่ายบริหารงานวิชาการ.pdf", type: "pdf", icon: "fa-file-pdf", size: "2.2 MB", viewUrl: "https://drive.google.com/drive/folders/1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K" },
      { title: "รายงานสรุปผลการปฏิบัติหน้าที่ราชการและฝ่ายวิชาการ 2569.pdf", type: "pdf", icon: "fa-file-pdf", size: "3.1 MB", viewUrl: "https://drive.google.com/drive/folders/1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K" }
    ]
  },
  "2.4": {
    images: [
      { title: "การประชุมผู้ปกครองชั้นเรียน (Classroom Meeting)", url: "https://drive.google.com/thumbnail?id=1bYywqjS4jbW3U5vMgT9lrCYS8c3Nt3wG&sz=w800", fullUrl: "https://drive.google.com/thumbnail?id=1bYywqjS4jbW3U5vMgT9lrCYS8c3Nt3wG&sz=w1600", caption: "การสร้างความเข้าใจและร่วมมือกับผู้ปกครองในการพัฒนาการเรียนรู้และพฤติกรรม" },
      { title: "การประสานภาคีเครือข่ายและแหล่งเรียนรู้ในชุมชน", url: "https://drive.google.com/thumbnail?id=173amy74R1ujDfrvZF5sDmua4jVP_f-M&sz=w800", fullUrl: "https://drive.google.com/thumbnail?id=173amy74R1ujDfrvZF5sDmua4jVP_f-M&sz=w1600", caption: "การเชื่อมโยงความร่วมมือกับชุมชนในการสนับสนุนการจัดการเรียนรู้ของผู้เรียน" }
    ],
    sampleDocs: [
      { title: "บันทึกการประชุมผู้ปกครองชั้นเรียนและผลสะท้อนคิด.pdf", type: "pdf", icon: "fa-file-pdf", size: "2.3 MB", viewUrl: "https://drive.google.com/drive/folders/1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K" },
      { title: "บันทึกความร่วมมือและภาพกิจกรรมเครือข่ายชุมชน.pdf", type: "pdf", icon: "fa-file-pdf", size: "1.9 MB", viewUrl: "https://drive.google.com/drive/folders/1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K" }
    ]
  },
  "3.1": {
    images: [
      { title: "การพัฒนาตนเองอย่างต่อเนื่องและรวมวุฒิบัตรการอบรม", url: "https://drive.google.com/thumbnail?id=1fe80GrNslBXCle27EQb8HXivJu-veka1&sz=w800", fullUrl: "https://drive.google.com/thumbnail?id=1fe80GrNslBXCle27EQb8HXivJu-veka1&sz=w1600", caption: "การเข้าร่วมอบรมเชิงปฏิบัติการ การใช้เทคโนโลยี AI และการพัฒนาวิชาชีพครู" },
      { title: "ภาพการเข้าร่วมกิจกรรมพัฒนาวิชาชีพและสัมมนาวิชาการ", url: "https://drive.google.com/thumbnail?id=1fIMtnTSqOvFVhEwnvcR_UWxjHV_Msmi5&sz=w800", fullUrl: "https://drive.google.com/thumbnail?id=1fIMtnTSqOvFVhEwnvcR_UWxjHV_Msmi5&sz=w1600", caption: "การแลกเปลี่ยนเรียนรู้และเพิ่มพูนสมรรถนะการจัดการเรียนรู้ยุคดิจิทัล" }
    ],
    sampleDocs: [
      { title: "แผนพัฒนาตนเองรายบุคคล (ID Plan) ประจำปีงบประมาณ 2569.pdf", type: "pdf", icon: "fa-file-pdf", size: "3.2 MB", viewUrl: "https://drive.google.com/drive/folders/1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K" },
      { title: "รวมวุฒิบัตรและเกียรติบัตรการพัฒนาวิชาชีพครู 2569.pdf", type: "pdf", icon: "fa-file-pdf", size: "5.8 MB", viewUrl: "https://drive.google.com/drive/folders/1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K" }
    ]
  },
  "3.2": {
    images: [
      { title: "การขับเคลื่อนชุมชนการเรียนรู้ทางวิชาชีพ (PLC นวัตกรรม AFS)", url: "https://drive.google.com/thumbnail?id=1TbStAJqtw3b4gQe5X-mk9pKwL6JI4OqP&sz=w800", fullUrl: "https://drive.google.com/thumbnail?id=1TbStAJqtw3b4gQe5X-mk9pKwL6JI4OqP&sz=w1600", caption: "การประชุม PLC เพื่อสะท้อนคิด แลกเปลี่ยนปัญหา และออกแบบการจัดการเรียนรู้ร่วมกัน" },
      { title: "ภาพการประชุม PLC และการวิพากษ์แผนการสอน", url: "https://drive.google.com/thumbnail?id=1fIMtnTSqOvFVhEwnvcR_UWxjHV_Msmi5&sz=w800", fullUrl: "https://drive.google.com/thumbnail?id=1fIMtnTSqOvFVhEwnvcR_UWxjHV_Msmi5&sz=w1600", caption: "การร่วมมือระหว่างเพื่อนครูกลุ่มสาระการงานอาชีพและฝ่ายวิชาการ" }
    ],
    sampleDocs: [
      { title: "บันทึกชุมชนแห่งการเรียนรู้ทางวิชาชีพ (PLC Logbook) 2569.pdf", type: "pdf", icon: "fa-file-pdf", size: "4.1 MB", viewUrl: "https://drive.google.com/drive/folders/1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K" },
      { title: "แบบสรุปผลการแก้ปัญหาการเรียนรู้จากกระบวนการ PLC.pdf", type: "pdf", icon: "fa-file-pdf", size: "1.8 MB", viewUrl: "https://drive.google.com/drive/folders/1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K" }
    ]
  },
  "3.3": {
    images: [
      { title: "การนำผลการพัฒนามาสร้างสรรค์นวัตกรรม AFS และ Best Practice", url: "https://drive.google.com/thumbnail?id=1FJVTnnmBxxz5bw6OXTWhGAbfAhwOEg9z&sz=w800", fullUrl: "https://drive.google.com/thumbnail?id=1FJVTnnmBxxz5bw6OXTWhGAbfAhwOEg9z&sz=w1600", caption: "การสังเคราะห์เป็นแนวปฏิบัติที่ดีและนำมาพัฒนาผู้เรียนอย่างเป็นรูปธรรม" },
      { title: "การเผยแพร่นวัตกรรมและขยายผลสู่เพื่อนครู", url: "images/ai_thai_teacher_plc.jpg", fullUrl: "images/ai_thai_teacher_plc.jpg", caption: "การเป็นวิทยากรและแบ่งปันองค์ความรู้การจัดกิจกรรม Active Learning" }
    ],
    sampleDocs: [
      { title: "รายงานวิธีปฏิบัติที่เป็นเลิศ (Best Practice) นวัตกรรม AFS 2569.pdf", type: "pdf", icon: "fa-file-pdf", size: "4.6 MB", viewUrl: "https://drive.google.com/drive/folders/1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K" },
      { title: "เอกสารสรุปการเผยแพร่ผลงานและการขยายผลสู่เพื่อนครู.pdf", type: "pdf", icon: "fa-file-pdf", size: "2.5 MB", viewUrl: "https://drive.google.com/drive/folders/1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K" }
    ]
  }
};

/**
 * 📦 ดึงภาพถ่ายและไฟล์เอกสารของตัวชี้วัดจาก Google Drive (หรือ Fallback Curated Data)
 */
function getIndicatorFilesAndMedia(indicatorCode, academicYear = null) {
  const code = String(indicatorCode || '').trim();
  const year = academicYear || (typeof currentAcademicYear !== 'undefined' ? currentAcademicYear : '2568');
  let driveImages = [];
  let driveDocs = [];
  let isLiveFromDrive = false;
  let folderUrl = getIndicatorDriveUrl(code, year);

  // 1. ตรวจสอบใน DriveSync.syncedData.indicators
  if (typeof DriveSync !== 'undefined' && DriveSync.syncedData && DriveSync.syncedData.indicators) {
    const matchingKey = Object.keys(DriveSync.syncedData.indicators).find(key => 
      key === code || key.startsWith(code + ' ') || key.startsWith(code + '.') || key.includes(code)
    );
    if (matchingKey && DriveSync.syncedData.indicators[matchingKey]) {
      const indData = DriveSync.syncedData.indicators[matchingKey];
      if (indData.folderUrl) folderUrl = indData.folderUrl;
      if (indData.folderId) folderUrl = `https://drive.google.com/drive/folders/${indData.folderId}`;

      if (Array.isArray(indData.files)) {
        indData.files.forEach(f => {
          const isImg = f.type === 'image' || (f.mime && f.mime.includes('image')) || /\.(jpe?g|png|webp|gif)$/i.test(f.title);
          const isVid = f.type === 'video' || (f.mime && f.mime.includes('video')) || /\.(mp4|webm|mov|m4v|avi|mkv)$/i.test(f.title);
          if (isImg) {
            driveImages.push({
              title: f.title,
              url: f.thumbUrl || f.viewUrl,
              fullUrl: f.thumbUrl ? f.thumbUrl.replace('w800', 'w1600') : f.viewUrl,
              type: 'image',
              caption: `ภาพหลักฐานจาก Google Drive (${indData.folderName || 'ตัวชี้วัด ' + code})`
            });
          } else if (isVid) {
            const vidObj = {
              title: f.title,
              url: f.thumbUrl || "https://drive.google.com/thumbnail?id=" + f.id + "&sz=w800",
              fullUrl: f.previewUrl || "https://drive.google.com/file/d/" + f.id + "/preview",
              previewUrl: f.previewUrl || "https://drive.google.com/file/d/" + f.id + "/preview",
              viewUrl: f.viewUrl,
              type: 'video',
              caption: `คลิปวิดีโอหลักฐานจาก Google Drive (${indData.folderName || 'ตัวชี้วัด ' + code})`
            };
            driveImages.push(vidObj);
            driveDocs.push({
              title: f.title,
              size: f.size || '15 MB',
              icon: 'fa-file-video',
              viewUrl: f.viewUrl,
              previewUrl: f.previewUrl || "https://drive.google.com/file/d/" + f.id + "/preview",
              type: 'video'
            });
          } else {
            driveDocs.push({
              title: f.title,
              size: f.size || '1.5 MB',
              icon: f.icon || 'fa-file-lines',
              viewUrl: f.viewUrl,
              type: f.type || 'doc'
            });
          }
        });
      }
    }
  }

  // 2. ตรวจสอบใน DriveSync.syncedData.evidenceGallery
  if (typeof DriveSync !== 'undefined' && DriveSync.syncedData && Array.isArray(DriveSync.syncedData.evidenceGallery)) {
    DriveSync.syncedData.evidenceGallery.forEach(item => {
      const txt = (item.badge + ' ' + item.title + ' ' + (item.caption || '')).toLowerCase();
      if (txt.includes(code)) {
        driveImages.push({
          title: item.title,
          url: item.thumbUrl,
          fullUrl: item.fullUrl,
          caption: item.caption || item.title
        });
      }
    });
  }

  // ถ้ามีภาพจริงจาก Drive
  if (driveImages.length > 0) {
    isLiveFromDrive = true;
  }

  // 3. Fallback Images
  let finalImages = driveImages;
  if (finalImages.length === 0) {
    const curated = INDICATOR_CURATED_MEDIA[code];
    if (curated && curated.images && curated.images.length > 0) {
      finalImages = curated.images;
    } else {
      finalImages = [
        { title: `ภาพหลักฐานตัวชี้วัด ${code}`, url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80", fullUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&auto=format&fit=crop&q=80", caption: `กิจกรรมการจัดการเรียนรู้ประกอบตัวชี้วัด ${code}` }
      ];
    }
  }

  // 4. Fallback Docs
  let finalDocs = driveDocs;
  if (finalDocs.length === 0) {
    const curated = INDICATOR_CURATED_MEDIA[code];
    if (curated && curated.sampleDocs) {
      finalDocs = curated.sampleDocs;
    }
  }

  return {
    images: finalImages,
    docs: finalDocs,
    isLiveFromDrive: isLiveFromDrive,
    folderUrl: folderUrl
  };
}

// ================= ระบบภาพสไลด์ CAROUSEL / SLIDER ใน MODAL =================
let currentViewingIndicatorCode = '1.1';
let currentIndicatorSlides = [];
let currentIndicatorSlideIdx = 0;

function initIndicatorSlider(images, isLiveDrive = false) {
  currentIndicatorSlides = (Array.isArray(images) && images.length > 0) ? images : [
    { title: 'ภาพหลักฐานกิจกรรม', url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80', fullUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&auto=format&fit=crop&q=80', caption: 'ภาพถ่ายกิจกรรมการจัดการเรียนรู้ประกอบตัวชี้วัด' }
  ];
  currentIndicatorSlideIdx = 0;

  const badgeEl = document.getElementById('modal-slider-badge');
  if (badgeEl) {
    badgeEl.innerHTML = isLiveDrive 
      ? '<i class="fa-brands fa-google-drive"></i> ภาพสดจากโฟลเดอร์ไดรฟ์' 
      : '<i class="fa-solid fa-camera"></i> ภาพหลักฐานตัวชี้วัด';
  }

  updateIndicatorSliderView();
}

function updateIndicatorSliderView() {
  const slide = currentIndicatorSlides[currentIndicatorSlideIdx];
  if (!slide) return;

  const imgEl = document.getElementById('modal-slider-img');
  const bgEl = document.getElementById('modal-slider-bg');
  const imgSrc = slide.url || slide.thumbUrl || slide.fullUrl;
  if (imgEl) {
    imgEl.src = imgSrc;
    imgEl.alt = slide.title || 'ภาพหลักฐานตัวชี้วัด';
  }
  if (bgEl) {
    bgEl.src = imgSrc;
  }

  const counterEl = document.getElementById('modal-slider-counter');
  if (counterEl) {
    counterEl.innerText = `${currentIndicatorSlideIdx + 1} / ${currentIndicatorSlides.length}`;
  }

  const captionEl = document.getElementById('modal-slider-caption');
  if (captionEl) {
    captionEl.innerHTML = `<span class="font-bold text-teal-300 mr-1">${slide.title || ''}</span> ${slide.caption ? '· ' + slide.caption : ''}`;
  }

  // Dots
  const dotsEl = document.getElementById('modal-slider-dots');
  if (dotsEl) {
    if (currentIndicatorSlides.length <= 1) {
      dotsEl.classList.add('hidden');
    } else {
      dotsEl.classList.remove('hidden');
      dotsEl.innerHTML = '';
      currentIndicatorSlides.forEach((s, idx) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = idx === currentIndicatorSlideIdx 
          ? 'w-7 h-2 rounded-full bg-teal-400 transition-all shadow-sm' 
          : 'w-2 h-2 rounded-full bg-slate-600 hover:bg-slate-400 transition-all';
        dot.onclick = (e) => { e.stopPropagation(); goToIndicatorSlide(idx); };
        dotsEl.appendChild(dot);
      });
    }
  }

  // Prev / Next arrows visibility
  const prevBtn = document.getElementById('modal-slider-prev');
  const nextBtn = document.getElementById('modal-slider-next');
  if (prevBtn && nextBtn) {
    if (currentIndicatorSlides.length <= 1) {
      prevBtn.classList.add('hidden');
      nextBtn.classList.add('hidden');
    } else {
      prevBtn.classList.remove('hidden');
      nextBtn.classList.remove('hidden');
    }
  }
}

function prevIndicatorSlide() {
  if (currentIndicatorSlides.length <= 1) return;
  currentIndicatorSlideIdx = (currentIndicatorSlideIdx - 1 + currentIndicatorSlides.length) % currentIndicatorSlides.length;
  updateIndicatorSliderView();
}

function nextIndicatorSlide() {
  if (currentIndicatorSlides.length <= 1) return;
  currentIndicatorSlideIdx = (currentIndicatorSlideIdx + 1) % currentIndicatorSlides.length;
  updateIndicatorSliderView();
}

function goToIndicatorSlide(idx) {
  if (idx >= 0 && idx < currentIndicatorSlides.length) {
    currentIndicatorSlideIdx = idx;
    updateIndicatorSliderView();
  }
}

function openSliderImageLightbox() {
  const slide = currentIndicatorSlides[currentIndicatorSlideIdx];
  if (slide) {
    openLightbox(slide.fullUrl || slide.url, slide.title, slide.caption);
  }
}

// ================= MODAL: DETAILED INDICATOR =================
function openIndicatorModal(indicator, teacher, expectedLevel, domain = null) {
  const modal = document.getElementById('indicator-modal');
  if (!modal) return;

  currentViewingIndicatorCode = indicator.code;
  const yearData = getActiveYearData();
  const synth = (yearData && yearData.indicatorSyntheses && yearData.indicatorSyntheses[indicator.code])
    ? yearData.indicatorSyntheses[indicator.code]
    : null;

  // Header & Meta
  const domainEl = document.getElementById('modal-domain');
  if (domainEl) {
    domainEl.innerText = domain ? domain.title : 'ด้านการจัดการเรียนรู้';
  }
  document.getElementById('modal-code').innerText = `ตัวชี้วัด ${indicator.code}`;
  document.getElementById('modal-title').innerText = indicator.title;
  document.getElementById('modal-level').innerText = expectedLevel;

  // 1. Image Slider (ดึงภาพจากโฟลเดอร์ภาพตัวชี้วัดใน Google Drive)
  const media = getIndicatorFilesAndMedia(indicator.code, currentAcademicYear);
  initIndicatorSlider(media.images, media.isLiveFromDrive);

  // 2. Synthesized Performance Details (สังเคราะห์จากข้อตกลง ว.PA / แผน / วิจัย)
  if (synth) {
    document.getElementById('modal-details').innerText = synth.task;
    document.getElementById('modal-results').innerHTML = `
      <div class="space-y-2">
        <div class="flex items-start gap-2">
          <span class="px-2.5 py-0.5 rounded-md bg-emerald-200/90 text-emerald-950 font-bold text-xs flex-shrink-0">เชิงปริมาณ</span>
          <span class="text-xs sm:text-sm text-emerald-950">${synth.quant}</span>
        </div>
        <div class="flex items-start gap-2 pt-1.5 border-t border-emerald-200/60">
          <span class="px-2.5 py-0.5 rounded-md bg-teal-200/90 text-teal-950 font-bold text-xs flex-shrink-0">เชิงคุณภาพ</span>
          <span class="text-xs sm:text-sm text-emerald-950">${synth.qual}</span>
        </div>
      </div>
    `;
    const refEl = document.getElementById('modal-synthesized-refs');
    if (refEl) {
      refEl.innerText = synth.evidence || 'ข้อตกลง ว.PA (แบบ PA 1/ส), แผนการจัดการเรียนรู้, เล่มวิจัย 5 บท, บันทึก ปพ.5';
    }
  } else {
    document.getElementById('modal-details').innerText = `การดำเนินการตามตัวชี้วัด ${indicator.code} (${indicator.title}) ของ ${teacher.name} สอดรับกับระดับการปฏิบัติที่คาดหวังตามมาตรฐานตำแหน่งและวิทยฐานะ ${teacher.academicStanding} คือ "${expectedLevel}"`;
    document.getElementById('modal-results').innerText = `ผู้เรียนเกิดสมรรถนะการเรียนรู้ ทักษะการปฏิบัติงาน และมีคุณลักษณะอันพึงประสงค์ผ่านเกณฑ์มาตรฐานของกลุ่มสาระการเรียนรู้`;
    const refEl = document.getElementById('modal-synthesized-refs');
    if (refEl) {
      refEl.innerText = 'ข้อตกลง ว.PA (แบบ PA 1/ส), แผนการจัดการเรียนรู้, รายงานผลการประเมิน';
    }
  }

  // 3. Evidence Documents in Drive (รายการเอกสารพร้อมปุ่มเปิดเอกสาร)
  const listEl = document.getElementById('modal-evidence-list');
  const countBadge = document.getElementById('modal-files-count-badge');
  listEl.innerHTML = '';

  const docsToRender = (media.docs && media.docs.length > 0) ? media.docs : [];
  if (countBadge) {
    countBadge.innerText = `${docsToRender.length} ไฟล์เอกสาร`;
  }

  docsToRender.forEach(doc => {
    const isVideo = doc.type === 'video' || (doc.title && /\.(mp4|webm|mov|m4v|avi|mkv)$/i.test(doc.title));
    const docCard = document.createElement('div');
    docCard.className = isVideo 
      ? 'flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-rose-50/80 to-pink-50/70 border border-rose-200/80 hover:bg-rose-50 transition'
      : 'flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-teal-50/50 transition';
    
    const isLive = Boolean(doc.viewUrl);
    const viewUrl = doc.viewUrl || getIndicatorDriveUrl(indicator.code);
    const previewUrl = doc.previewUrl || viewUrl;
    const safeTitle = (doc.title || '').replace(/'/g, "\\'");

    docCard.innerHTML = `
      <div class="flex items-center gap-3 min-w-0 pr-2">
        <div class="w-9 h-9 rounded-lg ${isVideo ? 'bg-rose-100 text-rose-600' : 'bg-teal-100 text-teal-800'} flex items-center justify-center text-base flex-shrink-0">
          <i class="fa-solid ${isVideo ? 'fa-file-video' : (doc.icon || 'fa-file-pdf')}"></i>
        </div>
        <div class="min-w-0">
          <div class="font-heading font-semibold text-slate-900 text-xs sm:text-sm truncate" title="${doc.title}">${doc.title}</div>
          <div class="text-[11px] text-slate-500 flex items-center gap-2">
            <span>ขนาด ${doc.size || '1.5 MB'}</span>
            <span>•</span>
            <span class="${isVideo ? 'text-rose-600 font-semibold' : (isLive ? 'text-emerald-700 font-semibold' : 'text-teal-700 font-medium')}">
              ${isVideo ? '🎥 คลิปวิดีโอการสอน 1080p' : (isLive ? '<i class="fa-brands fa-google-drive"></i> ไฟล์จาก Google Drive' : 'เอกสารหลักฐานมาตรฐาน')}
            </span>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-1.5 flex-shrink-0">
        ${isVideo ? `
          <button onclick="openVideoPlayer({ previewUrl: '${previewUrl}', viewUrl: '${viewUrl}', title: '${safeTitle}', caption: 'คลิปวิดีโอหลักฐานการจัดการเรียนรู้ ตัวชี้วัด ${indicator.code}', badge: 'ตัวชี้วัด ${indicator.code}' })" class="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition shadow-sm flex items-center gap-1.5">
            <i class="fa-solid fa-play text-[10px]"></i> <span>เล่นวิดีโอ</span>
          </button>
        ` : `
          <a href="${viewUrl}" target="_blank" class="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition shadow-sm flex items-center gap-1.5">
            <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i> <span>เปิดดูเอกสาร</span>
          </a>
        `}
      </div>
    `;
    listEl.appendChild(docCard);
  });

  // Action Bar Buttons
  const folderBtn = document.getElementById('modal-open-drive-folder-btn');
  const folderLabel = document.getElementById('modal-open-drive-btn-label');
  if (folderBtn) {
    folderBtn.href = media.folderUrl;
  }
  if (folderLabel) {
    folderLabel.innerText = `เปิดโฟลเดอร์ตัวชี้วัด ${indicator.code} ใน Google Drive`;
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
    const docModal = document.getElementById('doc-modal');
    if (docModal && !docModal.classList.contains('hidden')) {
      document.body.style.overflow = 'hidden';
    } else if (typeof PresentationDeck !== 'undefined' && PresentationDeck.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }
}

// Lightbox Logic (อัปเกรดให้สามารถเปิด Video Player ได้หากเป็นไฟล์วิดีโอ)
function openLightbox(src, title, caption) {
  if (typeof src === 'string' && (src.match(/\.(mp4|webm|mov|m4v|avi)($|\?)/i) || src.includes('/preview'))) {
    openVideoPlayer({ previewUrl: src, title, caption, badge: 'วิดีโอคลิป' });
    return;
  }

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

// Document Viewer Modal & Drive Link Helper
let currentDocDriveUrl = 'https://drive.google.com/drive/my-drive';

function getIndicatorDriveUrl(indicatorCode = '', targetYear = null) {
  const code = String(indicatorCode || '').trim();
  const year = targetYear || (typeof currentAcademicYear !== 'undefined' ? currentAcademicYear : '2568');

  // 1. ตรวจสอบการตั้งค่าโฟลเดอร์เฉพาะตัวชี้วัดที่ผู้ใช้กำหนดเอง (Custom Folder Link)
  const directKey = `pafolio_ind_folder_${year}_${code}`;
  const directSaved = localStorage.getItem(directKey);
  if (directSaved) return directSaved.trim();

  try {
    const customMapKey = 'pafolio_indicator_folders_' + year;
    const savedMap = JSON.parse(localStorage.getItem(customMapKey) || '{}');
    if (code && savedMap[code]) {
      return savedMap[code].trim();
    }
  } catch(e) {}

  // 2. ตรวจสอบในข้อมูล yearData ของฐานข้อมูล
  const yearData = (typeof getActiveYearData === 'function') ? getActiveYearData() : null;
  if (yearData && yearData.indicatorFolders && yearData.indicatorFolders[code]) {
    return yearData.indicatorFolders[code].trim();
  }

  // 3. ตรวจสอบจากผลการซิงก์สดหรือแคชของ Google Drive (DriveSync.syncedData)
  if (code && typeof DriveSync !== 'undefined' && DriveSync.syncedData) {
    // 3.1 จาก indicatorFolders
    if (DriveSync.syncedData.indicatorFolders && DriveSync.syncedData.indicatorFolders[code]) {
      const item = DriveSync.syncedData.indicatorFolders[code];
      if (typeof item === 'string' && item) return item.trim();
      if (item && item.folderUrl) return item.folderUrl.trim();
      if (item && item.folderId) return `https://drive.google.com/drive/folders/${item.folderId}`;
    }

    // 3.2 จาก indicators ที่สแกนได้
    if (DriveSync.syncedData.indicators) {
      const matchingKey = Object.keys(DriveSync.syncedData.indicators).find(key => 
        key === code || key.startsWith(code + ' ') || key.startsWith(code + '.') || key.includes(code)
      );
      if (matchingKey && DriveSync.syncedData.indicators[matchingKey]) {
        const indData = DriveSync.syncedData.indicators[matchingKey];
        if (indData.folderUrl) return indData.folderUrl.trim();
        if (indData.folderId) return `https://drive.google.com/drive/folders/${indData.folderId}`;
        if (indData.files && indData.files.length > 0 && indData.files[0].viewUrl) {
          return indData.files[0].viewUrl.trim();
        }
      }
    }
  }

  // 4. กรณีที่ยังไม่มีโฟลเดอร์ตรง:
  // หากมีรหัสตัวชี้วัด (เช่น "1.1") -> ใช้ Smart Google Drive Search ค้นหาโฟลเดอร์ของตัวชี้วัดนั้นโดยตรง (แบบครอบคลุมทั้งไดรฟ์)
  // หมายเหตุ: ไม่ใช้ 'in parents' เพราะ Google Drive จะค้นหาเฉพาะชั้นลูกตรง (depth 1) แต่ตัวชี้วัดอยู่ลึก 3 ชั้น (วPA -> PA69 -> ด้านที่ 1 -> 1.1)
  if (code) {
    return `https://drive.google.com/drive/search?q=${encodeURIComponent(`type:folder name contains '${code}'`)}`;
  }

  let rootFolderId = '';
  if (typeof DriveSync !== 'undefined' && DriveSync.config && DriveSync.config.folderId) {
    rootFolderId = DriveSync.config.folderId.trim();
  }
  if (!rootFolderId || rootFolderId === '19mPdGDZ0QUD7Eem3w-f8WV6xaCRZUYVZ') {
    rootFolderId = '1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K';
  }

  let cleanId = rootFolderId;
  if (cleanId.includes('/folders/')) {
    cleanId = cleanId.split('/folders/')[1].split('?')[0].split('/')[0];
  }
  return `https://drive.google.com/drive/folders/${cleanId}`;
}

// ตรวจสอบว่าตัวชี้วัดนี้มีโฟลเดอร์ตรงโดยเฉพาะหรือไม่
function isIndicatorFolderDirect(indicatorCode = '', targetYear = null) {
  const code = String(indicatorCode || '').trim();
  const year = targetYear || (typeof currentAcademicYear !== 'undefined' ? currentAcademicYear : '2568');

  if (localStorage.getItem(`pafolio_ind_folder_${year}_${code}`)) return true;

  try {
    const map = JSON.parse(localStorage.getItem(`pafolio_indicator_folders_${year}`) || '{}');
    if (map[code]) return true;
  } catch(e) {}

  const yearData = (typeof getActiveYearData === 'function') ? getActiveYearData() : null;
  if (yearData && yearData.indicatorFolders && yearData.indicatorFolders[code]) return true;

  if (typeof DriveSync !== 'undefined' && DriveSync.syncedData) {
    if (DriveSync.syncedData.indicatorFolders && DriveSync.syncedData.indicatorFolders[code]) return true;
    if (DriveSync.syncedData.indicators) {
      const match = Object.keys(DriveSync.syncedData.indicators).find(k => 
        k === code || k.startsWith(code + ' ') || k.startsWith(code + '.') || k.includes(code)
      );
      if (match) {
        const item = DriveSync.syncedData.indicators[match];
        if (item && (item.folderUrl || item.folderId)) return true;
      }
    }
  }

  return false;
}

// ================= จัดการตั้งค่าลิงก์โฟลเดอร์เฉพาะตัวชี้วัด =================
let currentEditingIndicatorCode = '';

function openEditIndicatorFolderModal(indicatorCode) {
  currentEditingIndicatorCode = String(indicatorCode).trim();
  const modal = document.getElementById('indicator-folder-modal');
  if (!modal) return;

  const codeLabel = document.getElementById('edit-ind-code-label');
  if (codeLabel) codeLabel.innerText = currentEditingIndicatorCode;

  const currentUrl = getIndicatorDriveUrl(currentEditingIndicatorCode);
  const displayEl = document.getElementById('edit-ind-current-url-display');
  if (displayEl) displayEl.innerText = currentUrl;

  const inputEl = document.getElementById('edit-ind-folder-url');
  if (inputEl) {
    const directSaved = localStorage.getItem(`pafolio_ind_folder_${currentAcademicYear}_${currentEditingIndicatorCode}`);
    inputEl.value = directSaved || (isIndicatorFolderDirect(currentEditingIndicatorCode) ? currentUrl : '');
    setTimeout(() => inputEl.focus(), 100);
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

function closeEditIndicatorFolderModal() {
  const modal = document.getElementById('indicator-folder-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    const indModal = document.getElementById('indicator-modal');
    if (indModal && !indModal.classList.contains('hidden')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }
}

function saveIndicatorFolderLink() {
  if (!currentEditingIndicatorCode) return;
  const inputEl = document.getElementById('edit-ind-folder-url');
  let val = (inputEl ? inputEl.value : '').trim();

  if (!val) {
    alert('กรุณากรอก URL หรือ Folder ID ของ Google Drive');
    return;
  }

  // ปรับให้อยู่ในรูปแบบ URL ที่สมบูรณ์
  if (!val.startsWith('http://') && !val.startsWith('https://')) {
    val = `https://drive.google.com/drive/folders/${val}`;
  }

  const year = currentAcademicYear;
  const code = currentEditingIndicatorCode;

  // 1. บันทึกลง localStorage รายตัวชี้วัด
  const directKey = `pafolio_ind_folder_${year}_${code}`;
  localStorage.setItem(directKey, val);

  // 2. บันทึกลง map รวม
  const mapKey = `pafolio_indicator_folders_${year}`;
  try {
    const map = JSON.parse(localStorage.getItem(mapKey) || '{}');
    map[code] = val;
    localStorage.setItem(mapKey, JSON.stringify(map));
  } catch(e) {}

  // 3. บันทึกลง memory yearData
  const yearData = getActiveYearData();
  if (yearData) {
    if (!yearData.indicatorFolders) yearData.indicatorFolders = {};
    yearData.indicatorFolders[code] = val;
    if (typeof saveStoredTeachers === 'function') saveStoredTeachers();
  }

  closeEditIndicatorFolderModal();

  if (typeof DriveSync !== 'undefined' && typeof DriveSync.showToast === 'function') {
    DriveSync.showToast(`บันทึกลิงก์โฟลเดอร์ตัวชี้วัด ${code} สำเร็จแล้ว!`, 'success');
  }

  // อัปเดตหน้าจอทันที
  renderIndicators('all', '');

  // หากเปิดหน้าต่างตัวชี้วัดอยู่ ให้อัปเดตเนื้อหาในหน้าต่างด้วย
  const indModal = document.getElementById('indicator-modal');
  if (indModal && !indModal.classList.contains('hidden')) {
    const ind = BASE_INDICATOR_TEMPLATES.find(i => i.code === code);
    if (ind) {
      const teacher = getActiveTeacher();
      const expectedLevel = getExpectedLevel(teacher.academicStanding);
      openIndicatorModal(ind, teacher, expectedLevel);
    }
  }
}

function resetIndicatorFolderLink() {
  if (!currentEditingIndicatorCode) return;
  const year = currentAcademicYear;
  const code = currentEditingIndicatorCode;

  localStorage.removeItem(`pafolio_ind_folder_${year}_${code}`);

  const mapKey = `pafolio_indicator_folders_${year}`;
  try {
    const map = JSON.parse(localStorage.getItem(mapKey) || '{}');
    delete map[code];
    localStorage.setItem(mapKey, JSON.stringify(map));
  } catch(e) {}

  const yearData = getActiveYearData();
  if (yearData && yearData.indicatorFolders) {
    delete yearData.indicatorFolders[code];
    if (typeof saveStoredTeachers === 'function') saveStoredTeachers();
  }

  closeEditIndicatorFolderModal();

  if (typeof DriveSync !== 'undefined' && typeof DriveSync.showToast === 'function') {
    DriveSync.showToast(`คืนค่าเริ่มต้นโฟลเดอร์ตัวชี้วัด ${code} เรียบร้อยแล้ว`, 'info');
  }

  renderIndicators('all', '');

  const indModal = document.getElementById('indicator-modal');
  if (indModal && !indModal.classList.contains('hidden')) {
    const ind = BASE_INDICATOR_TEMPLATES.find(i => i.code === code);
    if (ind) {
      const teacher = getActiveTeacher();
      const expectedLevel = getExpectedLevel(teacher.academicStanding);
      openIndicatorModal(ind, teacher, expectedLevel);
    }
  }
}

function openDocViewer(title, type, indicatorCode = '') {
  const modal = document.getElementById('doc-modal');
  if (!modal) return;
  const teacher = getActiveTeacher();

  document.getElementById('doc-modal-title').innerText = title;
  document.getElementById('doc-modal-type').innerText = `ประเภทเอกสาร: ${type} · ปีงบประมาณ ${currentAcademicYear}`;
  document.getElementById('doc-modal-teacher-name').innerText = teacher.name;
  document.getElementById('doc-modal-school').innerText = `${teacher.learningArea} · ${teacher.school}`;

  const targetDriveUrl = getIndicatorDriveUrl(indicatorCode);
  currentDocDriveUrl = targetDriveUrl;

  const driveBtn = document.getElementById('doc-modal-drive-btn');
  if (driveBtn) {
    driveBtn.href = targetDriveUrl;
  }

  const driveStatus = document.getElementById('doc-modal-drive-status');
  if (driveStatus) {
    if (targetDriveUrl.includes('folders/')) {
      driveStatus.innerHTML = '<i class="fa-brands fa-google-drive text-teal-700"></i> โฟลเดอร์ Google Drive พร้อมเปิดดู';
    } else {
      driveStatus.innerHTML = '<i class="fa-brands fa-google-drive text-teal-700"></i> ลิงก์ไดรฟ์พร้อมใช้งาน';
    }
  }

  const descEl = document.getElementById('doc-modal-evidence-desc');
  if (descEl) {
    let evidenceText = '';
    if (indicatorCode && typeof indicatorSyntheses !== 'undefined' && indicatorSyntheses[indicatorCode]) {
      evidenceText = indicatorSyntheses[indicatorCode].evidence || '';
    }
    if (evidenceText) {
      descEl.innerHTML = `
        <div class="font-semibold text-teal-900 flex items-center gap-1.5 mb-1">
          <i class="fa-solid fa-list-check text-teal-600"></i> รายการร่องรอยหลักฐานที่กำหนดสำหรับตัวชี้วัดนี้:
        </div>
        <div class="text-teal-800 text-[11px] leading-relaxed pl-2 border-l-2 border-teal-300">
          ${evidenceText}
        </div>
      `;
      descEl.classList.remove('hidden');
    } else {
      descEl.innerHTML = '';
      descEl.classList.add('hidden');
    }
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

function closeDocViewer() {
  const modal = document.getElementById('doc-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    const indModal = document.getElementById('indicator-modal');
    if (indModal && !indModal.classList.contains('hidden')) {
      document.body.style.overflow = 'hidden';
    } else if (typeof PresentationDeck !== 'undefined' && PresentationDeck.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }
}

function copyDocDriveLink() {
  const urlToCopy = currentDocDriveUrl || getIndicatorDriveUrl();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(urlToCopy).then(() => {
      if (typeof DriveSync !== 'undefined' && DriveSync.showToast) {
        DriveSync.showToast('📋 คัดลอกลิงก์ Google Drive เรียบร้อยแล้ว!', 'success', 3000);
      } else {
        alert('คัดลอกลิงก์ Google Drive สำเร็จ: ' + urlToCopy);
      }
    }).catch(() => {
      fallbackCopyText(urlToCopy);
    });
  } else {
    fallbackCopyText(urlToCopy);
  }
}

function fallbackCopyText(text) {
  const tempInput = document.createElement('input');
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);
  if (typeof DriveSync !== 'undefined' && DriveSync.showToast) {
    DriveSync.showToast('📋 คัดลอกลิงก์ Google Drive เรียบร้อยแล้ว!', 'success', 3000);
  } else {
    alert('คัดลอกลิงก์ Google Drive สำเร็จ: ' + text);
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

  const currentFolderId = DriveSync.config.folderId || '1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K';
  document.getElementById('drive-folder-id-input').value = currentFolderId;
  document.getElementById('apps-script-url-input').value = DriveSync.config.appsScriptUrl;

  const feedbackEl = document.getElementById('drive-test-feedback');
  if (feedbackEl) {
    feedbackEl.classList.add('hidden');
    feedbackEl.innerHTML = '';
  }

  // 📲 อัปเดต QR Code และลิงก์สำหรับเปิดบนแท็บเล็ต/มือถือ
  const qrContainer = document.getElementById('tablet-qr-preview');
  const shareLinkInput = document.getElementById('tablet-share-link-input');
  if (shareLinkInput && typeof DriveSync !== 'undefined' && typeof DriveSync.getTabletShareUrl === 'function') {
    const shareUrl = DriveSync.getTabletShareUrl();
    shareLinkInput.value = shareUrl;
    if (qrContainer) {
      qrContainer.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(shareUrl)}`;
    }
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

// สลับการแสดงผลการ์ดสรุปข้อมูลหน้าปก (เพื่อเปิดดูภาพแบนเนอร์เต็มแผ่นโดยไม่มีตัวหนังสือบดบัง)
function toggleHeroCardVisibility() {
  const card = document.getElementById('hero-presentation-card');
  const label = document.getElementById('hero-toggle-label');
  const btn = document.getElementById('hero-toggle-btn');
  if (!card) return;

  const isHidden = card.classList.contains('opacity-0');
  if (isHidden) {
    card.classList.remove('opacity-0', 'pointer-events-none', 'scale-95');
    card.classList.add('opacity-100', 'scale-100');
    if (label) label.innerText = 'ดูภาพปกเต็ม';
    if (btn) btn.innerHTML = '<i class="fa-solid fa-eye text-amber-400"></i> <span id="hero-toggle-label">ดูภาพปกเต็ม</span>';
  } else {
    card.classList.remove('opacity-100', 'scale-100');
    card.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
    if (label) label.innerText = 'แสดงข้อมูลสรุป';
    if (btn) btn.innerHTML = '<i class="fa-solid fa-file-lines text-teal-400"></i> <span id="hero-toggle-label">แสดงข้อมูลสรุป</span>';
  }
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
  const folderId = document.getElementById('drive-folder-id-input').value.trim() || '1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K';
  let scriptUrl = document.getElementById('apps-script-url-input').value.trim();
  const feedbackEl = document.getElementById('drive-test-feedback');

  if (scriptUrl) {
    // ปรับแก้เบื้องต้นหากผู้ใช้เผลอวาง URL หน้า Editor
    if (scriptUrl.includes('/edit')) {
      scriptUrl = scriptUrl.replace(/\/edit.*$/, '/exec');
    }

    if (scriptUrl.includes('/macros/library/')) {
      if (feedbackEl) {
        feedbackEl.classList.remove('hidden');
        feedbackEl.className = 'mt-2 p-3.5 rounded-xl text-xs bg-rose-50 border border-rose-200 text-rose-950 space-y-1.5';
        feedbackEl.innerHTML = `
          <div class="font-bold flex items-center gap-1.5 text-rose-800">
            <i class="fa-solid fa-circle-xmark text-rose-600 text-base"></i> URL ไม่ถูกต้อง: คุณคัดลอก URL ของ "คลัง (Library)" มาใส่
          </div>
          <div class="text-[11px] leading-relaxed text-rose-900 font-sans space-y-1">
            <p>เบราว์เซอร์ไม่สามารถเชื่อมต่อกับ "คลัง" ได้ ต้องใช้ URL ของ <b>"เว็บแอป (Web app)"</b> เท่านั้น</p>
            <div class="bg-white/80 p-2.5 rounded-lg border border-rose-200 font-medium">
              <b>วิธีแก้ใน Apps Script:</b><br>
              1. กดปุ่มสีน้ำเงินมุมขวาบน <b>"การทำให้ใช้งานได้" (Deploy)</b> &rarr; <b>"การทำให้ใช้งานได้ใหม่" (New deployment)</b><br>
              2. คลิกรูปฟันเฟือง ⚙️ ด้านซ้าย เลือก <b>"เว็บแอป" (Web app)</b> (ห้ามเลือก "คลัง")<br>
              3. ผู้มีสิทธิ์เข้าถึง (Who has access): เลือก <b>"ทุกคน" (Anyone)</b> แล้วกด Deploy<br>
              4. คัดลอก URL ที่ขึ้นต้นด้วย <code class="bg-rose-100 px-1 rounded font-mono">macros/s/...</code> และลงท้ายด้วย <code class="bg-rose-100 px-1 rounded font-mono">/exec</code> มาวางครับ
            </div>
          </div>
        `;
      }
      alert('❌ URL ไม่ถูกต้องครับ!\n\nURL ที่นำมาวางเป็น URL ของ "คลัง (Library)" ซึ่งเบราว์เซอร์ไม่สามารถเข้าถึงได้\n\nวิธีแก้:\n1. ไปที่ Google Apps Script กด Deploy -> New deployment\n2. คลิกรูปฟันเฟือง ⚙️ ด้านซ้าย เลือกประเภทเป็น "เว็บแอป" (Web app)\n3. เลือก ผู้มีสิทธิ์เข้าถึง: "ทุกคน (Anyone)" แล้วกด Deploy\n4. จะได้ URL ที่ขึ้นต้นด้วย macros/s/... และลงท้ายด้วย /exec ครับ');
      return;
    }
  }

  DriveSync.saveConfig(folderId, scriptUrl, true);
  closeDriveSyncModal();
  DriveSync.syncAndApply(currentAcademicYear, true);
}

// ✨ ฟังก์ชันให้ AI ตั้งค่าโฟลเดอร์ ว.PA และแก้ไขปัญหาให้อัตโนมัติ (Zero manual config)
function aiAutoConfigureDrive() {
  const trueFolderId = '1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K';
  
  if (typeof DriveSync !== 'undefined') {
    DriveSync.config.folderId = trueFolderId;
    localStorage.setItem('pafolio_drive_folder_id', trueFolderId);
    DriveSync.updateStatusUI();
  }

  const folderInput = document.getElementById('drive-folder-id-input');
  if (folderInput) {
    folderInput.value = trueFolderId;
  }

  const feedbackEl = document.getElementById('drive-test-feedback');
  if (feedbackEl) {
    feedbackEl.classList.remove('hidden');
    feedbackEl.className = 'mt-2 p-3.5 rounded-xl text-xs bg-emerald-50 border border-emerald-200 text-emerald-900';
    feedbackEl.innerHTML = `
      <div class="font-bold flex items-center gap-1.5 text-emerald-800 mb-1">
        <i class="fa-solid fa-wand-magic-sparkles text-emerald-600"></i> AI ตั้งค่าโฟลเดอร์ ว.PA ให้สำเร็จ 100%!
      </div>
      <div class="text-[11px] text-emerald-800 leading-relaxed">
        กำหนดโฟลเดอร์หลัก: <b>🟢 วPAครูกรกฎ รัตนะโช โรงเรียนเปรมติณสูลานนท์</b><br>
        (Folder ID: <code class="font-mono bg-emerald-100 px-1 rounded font-bold">${trueFolderId}</code>)
      </div>
    `;
  }

  if (typeof DriveSync !== 'undefined' && DriveSync.showToast) {
    DriveSync.showToast('✨ AI ตั้งค่าโฟลเดอร์ ว.PA ของครูให้เรียบร้อยแล้ว!', 'success', 3500);
  }

  // รีเฟรชการแสดงผลปุ่มเปิดไดรฟ์บนการ์ดทั้งหมด
  if (typeof renderIndicators === 'function') {
    renderIndicators('all', '');
  }
}

// Folder Template Modal
function openFolderTemplateModal() {
  const modal = document.getElementById('folder-template-modal');
  if (!modal) return;

  const teacher = getActiveTeacher();
  const nameInput = document.getElementById('template-teacher-name-input');
  const yearInput = document.getElementById('template-year-input');

  if (nameInput) nameInput.value = teacher ? teacher.name : 'นายกรกฎ รัตนะโช';
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
  if (!newYearInput) return alert('กรุณาระบุปีงบประมาณ');

  const teacher = getActiveTeacher();
  if (!teacher.years) teacher.years = {};

  if (teacher.years[newYearInput]) {
    return alert(`ปีงบประมาณ ${newYearInput} มีอยู่ในระบบแล้ว`);
  }

  // Clone from current year as baseline
  const baseline = getActiveYearData();
  teacher.years[newYearInput] = JSON.parse(JSON.stringify(baseline));
  teacher.years[newYearInput].year = newYearInput;
  teacher.years[newYearInput].status = `รอบการประเมินปีงบประมาณ ${newYearInput}`;

  saveStoredTeachers();
  closeNewYearModal();
  switchAcademicYear(newYearInput);
  alert(`เริ่มต้นปีงบประมาณ ${newYearInput} สำเร็จแล้ว! คุณครูสามารถเพิ่มผลงานในรอบปีนี้ได้ทันที`);
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

let _cloudSyncDatabaseTimeout = null;
function debouncedSyncStoredTeachersToCloud() {
  if (typeof DriveSync === 'undefined' || !DriveSync.config || !DriveSync.config.appsScriptUrl) return;
  if (_cloudSyncDatabaseTimeout) clearTimeout(_cloudSyncDatabaseTimeout);
  _cloudSyncDatabaseTimeout = setTimeout(() => {
    const teacher = getActiveTeacher();
    if (teacher && typeof DriveSync.saveProfileToCloud === 'function') {
      DriveSync.saveProfileToCloud(teacher);
    }
  }, 2500);
}

// Local Storage for Teachers
function saveStoredTeachers() {
  try {
    localStorage.setItem('pafolio_custom_teachers', JSON.stringify(PAFOLIO_DATABASE));
  } catch (e) {
    console.error('Error saving teachers to localStorage', e);
  }
  debouncedSyncStoredTeachersToCloud();
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

        const oldBrownPhotoId = '1Dyu3SQW';
        const newWhiteSuitAvatar = (typeof PAFOLIO_CONFIG !== 'undefined' && PAFOLIO_CONFIG.DEFAULT_AVATAR_URL) || 'https://drive.google.com/thumbnail?id=1Xr2DlVf1ypx7sH1owj1DwteOW2_JljGP&sz=w800';
        const newGoldCover = (typeof PAFOLIO_CONFIG !== 'undefined' && PAFOLIO_CONFIG.DEFAULT_COVER_URL) || 'https://drive.google.com/thumbnail?id=1noPkaJIRiMIyg0InLRPMnEu4Bi8DNb8I&sz=w1920';

        if (stored.avatarUrl && (stored.avatarUrl.includes(oldBrownPhotoId) || stored.avatarUrl.includes('/drive/folders/'))) {
          stored.avatarUrl = newWhiteSuitAvatar;
        }
        if (stored.coverUrl && (stored.coverUrl.includes(oldBrownPhotoId) || stored.coverUrl.includes('/drive/folders/'))) {
          stored.coverUrl = newGoldCover;
        }
        if (!stored._hasCustomProfile) {
          stored.avatarUrl = baseline?.avatarUrl || (typeof PAFOLIO_CONFIG !== 'undefined' ? PAFOLIO_CONFIG.DEFAULT_AVATAR_URL : '');
          stored.coverUrl = baseline?.coverUrl || (typeof PAFOLIO_CONFIG !== 'undefined' ? PAFOLIO_CONFIG.DEFAULT_COVER_URL : '');
        }

        if (key === 'teacher-korakot') {
          stored.name = 'นายกรกฎ รัตนะโช';
          stored.avatarUrl = newWhiteSuitAvatar;
        }

        if (baseline && baseline.years) {
          if (!stored.years) stored.years = {};
          for (const y in baseline.years) {
            if (!stored.years[y]) {
              stored.years[y] = baseline.years[y];
            } else {
              if (stored.years[y].avatarUrl && stored.years[y].avatarUrl.includes(oldBrownPhotoId)) {
                stored.years[y].avatarUrl = newWhiteSuitAvatar;
              }
              if (stored.years[y].coverUrl && stored.years[y].coverUrl.includes(oldBrownPhotoId)) {
                stored.years[y].coverUrl = newGoldCover;
              }
              if (!stored.years[y].indicatorSyntheses && baseline.years[y].indicatorSyntheses) {
                stored.years[y].indicatorSyntheses = baseline.years[y].indicatorSyntheses;
              }
              if (!stored.years[y].gallery && baseline.years[y].gallery) {
                stored.years[y].gallery = baseline.years[y].gallery;
              }
              if (y === '2569') {
                stored.years[y].avatarUrl = newWhiteSuitAvatar;
                if (!stored.years[y].coverUrl) {
                  stored.years[y].coverUrl = baseline.years[y].coverUrl;
                }
              } else {
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
      if (typeof closeProfileEditorModal === 'function') closeProfileEditorModal();
      if (typeof closeFolderTemplateModal === 'function') closeFolderTemplateModal();
      if (typeof closeThemeModal === 'function') closeThemeModal();
      if (typeof VideoStudioUI !== 'undefined' && VideoStudioUI.close) VideoStudioUI.close();
      if (typeof CertificateVault !== 'undefined' && CertificateVault.close) CertificateVault.close();
      if (typeof PresentationDeck !== 'undefined' && PresentationDeck.isOpen) {
        PresentationDeck.close();
      }
      toggleFloatingMenu(false);
    }
  });

  // Click outside to close floating indicators menu
  document.addEventListener('click', (e) => {
    const floatingContainer = document.getElementById('floating-home-container');
    if (isFloatingMenuOpen && floatingContainer && !floatingContainer.contains(e.target)) {
      toggleFloatingMenu(false);
    }
  });

  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    mobileMenu.querySelectorAll('a, button').forEach(item => {
      item.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // Global Dropdown Handler for Tools & Export in Navbar
  window.toggleNavToolsDropdown = function(event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById('nav-tools-dropdown-menu');
    if (menu) menu.classList.toggle('hidden');
  };

  window.closeNavToolsDropdown = function() {
    const menu = document.getElementById('nav-tools-dropdown-menu');
    if (menu && !menu.classList.contains('hidden')) {
      menu.classList.add('hidden');
    }
  };

  document.addEventListener('click', (e) => {
    const container = document.getElementById('nav-tools-dropdown-container');
    if (container && !container.contains(e.target)) {
      if (typeof window.closeNavToolsDropdown === 'function') {
        window.closeNavToolsDropdown();
      }
    }
  });
  const floatingHomeContainer = document.getElementById('floating-home-container');
  const floatingHomeBtn = document.getElementById('floating-home-btn');
  let floatingMenuHoverTimer = null;

  if (floatingHomeContainer && floatingHomeBtn) {
    // 1. แสดงเมนูย่อยทันทีเมื่อเม้าส์อยู่เหนือ (Hover)
    floatingHomeContainer.addEventListener('mouseenter', () => {
      if (floatingMenuHoverTimer) {
        clearTimeout(floatingMenuHoverTimer);
        floatingMenuHoverTimer = null;
      }
      toggleFloatingMenu(true);
    });

    // 2. ซ่อนเมนูย่อยเมื่อเม้าส์เลื่อนออก (หน่วงเวลา 300ms เพื่อให้เลื่อนเข้าเมนูย่อยได้สะดวก)
    floatingHomeContainer.addEventListener('mouseleave', () => {
      if (floatingMenuHoverTimer) clearTimeout(floatingMenuHoverTimer);
      floatingMenuHoverTimer = setTimeout(() => {
        toggleFloatingMenu(false);
      }, 300);
    });

    // 3. แสดงเมนูย่อยทันทีเมื่อคลิก หรือหากเปิดอยู่แล้วคลิกซ้ำจะเลื่อนกลับสู่หน้าแรกสุด
    floatingHomeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (floatingMenuHoverTimer) {
        clearTimeout(floatingMenuHoverTimer);
        floatingMenuHoverTimer = null;
      }
      if (!isFloatingMenuOpen) {
        toggleFloatingMenu(true);
      } else {
        scrollToHomePage();
        toggleFloatingMenu(false);
      }
    });
  }

  const updateFloatingHomeVisibility = () => {
    if (!floatingHomeContainer) return;
    if (window.scrollY > 180) {
      floatingHomeContainer.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
      floatingHomeContainer.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0');
    } else {
      floatingHomeContainer.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0');
      floatingHomeContainer.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
      if (isFloatingMenuOpen) toggleFloatingMenu(false);
    }
  };

  window.addEventListener('scroll', updateFloatingHomeVisibility, { passive: true });
  updateFloatingHomeVisibility();
}

/**
 * Smoothly scrolls the window to the very top (Home / Hero)
 */
function scrollToHomePage() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// ================= FLOATING SPEED-DIAL 15 INDICATORS MENU =================
let isFloatingMenuOpen = false;

function toggleFloatingMenu(forceState) {
  const menu = document.getElementById('floating-indicators-menu');
  const icon = document.getElementById('floating-btn-icon');
  const btn = document.getElementById('floating-home-btn');
  if (!menu) return;

  isFloatingMenuOpen = (typeof forceState === 'boolean') ? forceState : !isFloatingMenuOpen;

  if (isFloatingMenuOpen) {
    renderFloatingIndicatorsMenu();
    menu.classList.remove('hidden');
    // small timeout for smooth CSS animation
    requestAnimationFrame(() => {
      menu.classList.remove('scale-95', 'opacity-0');
      menu.classList.add('scale-100', 'opacity-100');
    });
    if (icon) {
      icon.className = 'fa-solid fa-xmark text-lg sm:text-xl text-rose-200 group-hover:rotate-90 transition-transform duration-200';
    }
    if (btn) {
      btn.title = 'คลิกเพื่อเลื่อนกลับหน้าแรกสุด หรือปิดเมนูลัด';
    }
  } else {
    menu.classList.remove('scale-100', 'opacity-100');
    menu.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
      if (!isFloatingMenuOpen) menu.classList.add('hidden');
    }, 200);
    if (icon) {
      icon.className = 'fa-solid fa-house text-lg sm:text-xl group-hover:scale-110 transition-transform duration-200';
    }
    if (btn) {
      btn.title = 'หน้าแรก & ทางลัด 15 ตัวชี้วัด PA (วางเม้าส์หรือคลิกเพื่อดูเมนู)';
    }
  }
}

function renderFloatingIndicatorsMenu() {
  const container = document.getElementById('floating-indicators-list');
  if (!container) return;

  const domainStyles = {
    'domain-1': {
      title: 'ด้านที่ 1 ด้านการจัดการเรียนรู้ (8 ตัวชี้วัด)',
      dotColor: 'bg-teal-400',
      titleColor: 'text-teal-300',
      itemBg: 'bg-teal-950/40 hover:bg-teal-800/50',
      border: 'border-teal-500/30 hover:border-teal-400/60',
      badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40'
    },
    'domain-2': {
      title: 'ด้านที่ 2 การส่งเสริมและสนับสนุน (4 ตัวชี้วัด)',
      dotColor: 'bg-sky-400',
      titleColor: 'text-sky-300',
      itemBg: 'bg-sky-950/40 hover:bg-sky-800/50',
      border: 'border-sky-500/30 hover:border-sky-400/60',
      badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40'
    },
    'domain-3': {
      title: 'ด้านที่ 3 การพัฒนาตนเองและวิชาชีพ (3 ตัวชี้วัด)',
      dotColor: 'bg-indigo-400',
      titleColor: 'text-indigo-300',
      itemBg: 'bg-indigo-950/40 hover:bg-indigo-800/50',
      border: 'border-indigo-500/30 hover:border-indigo-400/60',
      badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
    }
  };

  let html = '';
  ['domain-1', 'domain-2', 'domain-3'].forEach(dId => {
    const list = BASE_INDICATOR_TEMPLATES.filter(i => i.domainId === dId);
    const style = domainStyles[dId];
    html += `
      <div class="mb-3">
        <div class="flex items-center gap-1.5 text-[11px] font-bold ${style.titleColor} mb-1.5 px-1">
          <span class="w-2 h-2 rounded-full ${style.dotColor}"></span>
          <span>${style.title}</span>
        </div>
        <div class="grid grid-cols-2 gap-1.5">
          ${list.map(ind => `
            <button type="button" 
                    onclick="openIndicatorModalByCode('${ind.code}')" 
                    title="${ind.code} ${ind.title}"
                    class="group text-left p-2 rounded-xl ${style.itemBg} border ${style.border} transition-all duration-200 flex items-center gap-2 hover:scale-[1.02] active:scale-95 cursor-pointer">
              <span class="px-1.5 py-0.5 rounded-md text-[10px] font-bold font-mono ${style.badge} border flex-shrink-0 group-hover:scale-105 transition-transform">
                ${ind.code}
              </span>
              <span class="text-[11px] text-slate-200 group-hover:text-white font-medium truncate leading-tight">
                ${ind.title}
              </span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function openIndicatorModalByCode(code) {
  toggleFloatingMenu(false);
  const ind = BASE_INDICATOR_TEMPLATES.find(i => i.code === code);
  if (ind) {
    const teacher = getActiveTeacher();
    const expectedLevel = getExpectedLevel(teacher.academicStanding);
    const domains = [
      { id: 'domain-1', number: 1, title: 'ด้านที่ 1: ด้านการจัดการเรียนรู้', subtitle: 'การสร้างและพัฒนาหลักสูตร การออกแบบกิจกรรม สื่อ นวัตกรรม และการวัดผล', color: 'teal', total: 8 },
      { id: 'domain-2', number: 2, title: 'ด้านที่ 2: ด้านการส่งเสริมและสนับสนุนการจัดการเรียนรู้', subtitle: 'การจัดทำข้อมูลสารสนเทศ ระบบดูแลช่วยเหลือผู้เรียน และงานพัฒนาสถานศึกษา', color: 'sky', total: 4 },
      { id: 'domain-3', number: 3, title: 'ด้านที่ 3: ด้านการพัฒนาตนเองและวิชาชีพ', subtitle: 'การพัฒนาตนเองทางวิชาชีพ การมีส่วนร่วมในชุมชน PLC และการขยายผลนวัตกรรม', color: 'indigo', total: 3 }
    ];
    const domain = domains.find(d => d.id === ind.domainId);
    openIndicatorModal(ind, teacher, expectedLevel, domain);
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

async function handleAIGenerateIndicator() {
  const code = document.getElementById('ai-indicator-select')?.value || '1.1';
  const subject = document.getElementById('ai-subject-select')?.value || 'การงานอาชีพ';
  const teacher = getActiveTeacher();
  const standing = teacher.academicStanding || 'ครูชำนาญการพิเศษ';

  const btn = document.getElementById('btn-ai-generate-indicator');
  const badge = document.getElementById('ai-indicator-status-badge');
  const outBox = document.getElementById('ai-indicator-output');

  // 1. Loading state with spinner
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-amber-300"></i> <span>AI กำลังวิเคราะห์และร่างข้อความ ว9/2564...</span>';
    btn.classList.add('opacity-80', 'cursor-not-allowed');
  }

  if (badge) {
    badge.className = 'p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2.5 transition-all shadow-sm';
    badge.innerHTML = `
      <i class="fa-solid fa-brain fa-fade text-amber-600 text-sm"></i>
      <div>
        <span class="font-bold">AI กำลังสังเคราะห์ข้อความตามมาตรฐานวิทยฐานะ:</span>
        <span class="text-amber-700 font-semibold">${standing} (${subject})</span>
      </div>
    `;
    badge.classList.remove('hidden');
  }

  // Visual simulation delay (450ms) for authentic AI processing feel
  await new Promise(r => setTimeout(r, 450));

  // 2. Generate content
  const res = AIAssistant.generateIndicatorContent(code, subject, 'มัธยมศึกษา', standing);
  currentAIIndicatorResult = res;

  const outWork = document.getElementById('ai-out-work');
  const outOutcome = document.getElementById('ai-out-outcome');

  if (outWork) outWork.innerText = res.workDescription;
  if (outOutcome) outOutcome.innerText = res.outcomeDescription;

  // 3. Success state badge
  if (badge) {
    badge.className = 'p-3 rounded-xl bg-emerald-50/90 border border-emerald-300 text-emerald-950 text-xs font-medium flex items-center justify-between transition-all shadow-sm';
    badge.innerHTML = `
      <div class="flex items-center gap-2">
        <i class="fa-solid fa-circle-check text-emerald-600 text-base"></i>
        <div>
          <span class="font-bold text-emerald-900">ร่างข้อความตัวชี้วัด ${code} สำเร็จแล้ว!</span>
          <span class="text-emerald-700 block text-[11px]">คลิก "นำไปใช้ในหน้าต่างตัวชี้วัดทันที" เพื่อบันทึกลงระบบ</span>
        </div>
      </div>
      <span class="px-2 py-0.5 rounded bg-emerald-200/70 text-emerald-900 font-bold text-[10px]">พร้อมบันทึก</span>
    `;
  }

  if (outBox) {
    outBox.classList.remove('hidden');
    outBox.classList.add('ring-2', 'ring-teal-400/60', 'transition-all');
    setTimeout(() => outBox.classList.remove('ring-2', 'ring-teal-400/60'), 1500);
  }

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-sparkles"></i> <span>ร่างข้อความตัวชี้วัดด้วย AI</span>';
    btn.classList.remove('opacity-80', 'cursor-not-allowed');
  }
}

async function applyAIToIndicatorModal() {
  if (!currentAIIndicatorResult) return;

  const btnApply = document.getElementById('btn-apply-ai-indicator');
  if (btnApply) {
    btnApply.disabled = true;
    btnApply.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>กำลังบันทึกลงระบบ...</span>';
  }

  const code = currentAIIndicatorResult.indicatorCode || document.getElementById('ai-indicator-select')?.value || '1.1';
  const yearData = getActiveYearData();
  if (!yearData.indicatorSyntheses) {
    yearData.indicatorSyntheses = {};
  }

  let quant = '';
  let qual = '';
  if (currentAIIndicatorResult.outcomeDescription) {
    const lines = currentAIIndicatorResult.outcomeDescription.split('\n');
    lines.forEach(line => {
      if (line.includes('เชิงปริมาณ')) quant = line.replace(/^.*เชิงปริมาณ:\s*/, '').trim();
      if (line.includes('เชิงคุณภาพ')) qual = line.replace(/^.*เชิงคุณภาพ:\s*/, '').trim();
    });
  }
  if (!quant) quant = currentAIIndicatorResult.outcomeDescription;
  if (!qual) qual = 'ผู้เรียนเกิดสมรรถนะการเรียนรู้ ทักษะการปฏิบัติงาน และมีคุณลักษณะอันพึงประสงค์ตามเกณฑ์มาตรฐาน';

  const evidence = (currentAIIndicatorResult.evidences && currentAIIndicatorResult.evidences.length > 0)
    ? currentAIIndicatorResult.evidences.join(', ')
    : 'ข้อตกลง ว.PA (แบบ PA 1/ส), แผนการจัดการเรียนรู้, เล่มวิจัย 5 บท, บันทึก ปพ.5';

  // 1. บันทึกลง yearData (Persistent Data Model)
  yearData.indicatorSyntheses[code] = {
    task: currentAIIndicatorResult.workDescription,
    quant: quant,
    qual: qual,
    evidence: evidence
  };

  // 2. บันทึกลง LocalStorage
  saveStoredTeachers();

  // 3. อัปเดตเนื้อหาใน Modal หากเปิดตัวชี้วัดนี้อยู่
  const modalCodeEl = document.getElementById('modal-code');
  if (modalCodeEl && modalCodeEl.innerText.includes(code)) {
    const modalDetails = document.getElementById('modal-details');
    const modalResults = document.getElementById('modal-results');
    const refEl = document.getElementById('modal-synthesized-refs');

    if (modalDetails) {
      modalDetails.innerText = currentAIIndicatorResult.workDescription;
      modalDetails.classList.add('transition-all', 'duration-500', 'bg-teal-50', 'p-2', 'rounded-lg');
      setTimeout(() => modalDetails.classList.remove('bg-teal-50', 'p-2', 'rounded-lg'), 2000);
    }
    if (modalResults) {
      modalResults.innerHTML = `
        <div class="space-y-2">
          <div class="flex items-start gap-2">
            <span class="px-2.5 py-0.5 rounded-md bg-emerald-200/90 text-emerald-950 font-bold text-xs flex-shrink-0">เชิงปริมาณ</span>
            <span class="text-xs sm:text-sm text-emerald-950">${quant}</span>
          </div>
          <div class="flex items-start gap-2 pt-1.5 border-t border-emerald-200/60">
            <span class="px-2.5 py-0.5 rounded-md bg-teal-200/90 text-teal-950 font-bold text-xs flex-shrink-0">เชิงคุณภาพ</span>
            <span class="text-xs sm:text-sm text-emerald-950">${qual}</span>
          </div>
        </div>
      `;
    }
    if (refEl) refEl.innerText = evidence;
  }

  // 4. รีเฟรชการแสดงผล 15 ตัวชี้วัดบนหน้าเว็บหลักทันที
  renderIndicators('all', '');

  if (btnApply) {
    btnApply.disabled = false;
    btnApply.innerHTML = '<i class="fa-solid fa-check-double mr-1"></i> <span>นำไปใช้ในหน้าต่างตัวชี้วัดทันที</span>';
  }

  closeAIAssistant();
  if (typeof DriveSync !== 'undefined' && DriveSync.showToast) {
    DriveSync.showToast(`✅ บันทึกข้อความ ว.PA ตัวชี้วัด ${code} ลงในระบบเรียบร้อยแล้ว!`, 'success', 3500);
  }
}

async function handleAIGenerateChallenge() {
  const topic = document.getElementById('ai-challenge-topic-input')?.value.trim() || 'ทักษะการเรียนรู้เชิงรุก Active Learning';
  const modelType = document.getElementById('ai-challenge-model-type')?.value || 'PREM';
  const grade = document.getElementById('ai-challenge-grade-input')?.value.trim() || 'มัธยมศึกษาปีที่ 6';
  const teacher = getActiveTeacher();

  const btn = document.getElementById('btn-ai-generate-challenge');
  const badge = document.getElementById('ai-challenge-status-badge');
  const outBox = document.getElementById('ai-challenge-output');

  // 1. Loading state
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-amber-300"></i> <span>AI กำลังออกแบบโมเดลและโครงสร้างวิจัย 5 บท...</span>';
    btn.classList.add('opacity-80', 'cursor-not-allowed');
  }

  if (badge) {
    badge.className = 'p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2.5 transition-all shadow-sm';
    badge.innerHTML = `
      <i class="fa-solid fa-brain fa-fade text-indigo-600 text-sm"></i>
      <div>
        <span class="font-bold">AI กำลังสังเคราะห์โมเดล ${modelType}:</span>
        <span class="text-indigo-700 font-semibold">กลุ่มสาระฯ ${teacher.learningArea || 'การงานอาชีพ'} (${grade})</span>
      </div>
    `;
    badge.classList.remove('hidden');
  }

  await new Promise(r => setTimeout(r, 450));

  // 2. Generate
  const res = AIAssistant.generateChallengeModel(topic, teacher.learningArea, grade, modelType);
  currentAIChallengeResult = res;

  const outTitle = document.getElementById('ai-out-challenge-title');
  if (outTitle) outTitle.innerText = res.topic;

  // 3. Success state
  if (badge) {
    badge.className = 'p-3 rounded-xl bg-emerald-50/90 border border-emerald-300 text-emerald-950 text-xs font-medium flex items-center justify-between transition-all shadow-sm';
    badge.innerHTML = `
      <div class="flex items-center gap-2">
        <i class="fa-solid fa-circle-check text-emerald-600 text-base"></i>
        <div>
          <span class="font-bold text-emerald-900">ออกแบบโมเดลประเด็นท้าทายสำเร็จ!</span>
          <span class="text-emerald-700 block text-[11px]">โมเดล ${modelType} พร้อมบันทึกลงหน้าเว็บ</span>
        </div>
      </div>
      <span class="px-2 py-0.5 rounded bg-emerald-200/70 text-emerald-900 font-bold text-[10px]">พร้อมบันทึก</span>
    `;
  }

  if (outBox) {
    outBox.classList.remove('hidden');
    outBox.classList.add('ring-2', 'ring-indigo-400/60', 'transition-all');
    setTimeout(() => outBox.classList.remove('ring-2', 'ring-indigo-400/60'), 1500);
  }

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> <span>ออกแบบโมเดลประเด็นท้าทายด้วย AI</span>';
    btn.classList.remove('opacity-80', 'cursor-not-allowed');
  }
}

function applyAIToChallengeSection() {
  if (!currentAIChallengeResult) return;
  const teacher = getActiveTeacher();
  const yearData = getActiveYearData();

  yearData.challengeIssue = currentAIChallengeResult;
  saveStoredTeachers();
  renderChallengeSection(teacher, yearData);

  // Flash highlight on topic
  const topicEl = document.getElementById('challenge-topic-text');
  if (topicEl) {
    topicEl.classList.add('text-amber-300', 'transition-all', 'duration-500');
    setTimeout(() => topicEl.classList.remove('text-amber-300'), 2000);
  }

  closeAIAssistant();
  if (typeof DriveSync !== 'undefined' && DriveSync.showToast) {
    DriveSync.showToast('✅ อัปเดตโมเดลประเด็นท้าทายลงในหน้าเว็บเรียบร้อยแล้ว!', 'success', 3500);
  }
}

// =========================================================================
// AI Auto Search & Synthesize Challenge Issue from Google Drive
// =========================================================================
async function autoSynthesizeChallengeFromDrive(inEditor = false) {
  const teacher = getActiveTeacher();
  const yearData = getActiveYearData();

  // Status Elements
  const statusEl = document.getElementById('editor-ai-challenge-status');
  const bannerEl = document.getElementById('challenge-ai-live-banner');
  const btnChallenge = document.getElementById('btn-ai-synthesize-challenge');
  const btnText = document.getElementById('btn-ai-synthesize-text');

  if (btnChallenge) {
    btnChallenge.disabled = true;
    btnChallenge.classList.add('opacity-80', 'cursor-not-allowed');
  }
  if (btnText) {
    btnText.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-amber-200 mr-1"></i> AI กำลังสแกนไฟล์ในไดรฟ์...';
  }

  if (inEditor && statusEl) {
    statusEl.className = 'mb-3 p-3 rounded-xl bg-teal-950/80 border border-teal-500/40 text-[11px] text-teal-200 flex items-center gap-2';
    statusEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-teal-400"></i> AI กำลังสแกนไฟล์เอกสารและวิเคราะห์เนื้อหาประเด็นท้าทายจาก Google Drive...';
    statusEl.classList.remove('hidden');
  }

  if (bannerEl) {
    bannerEl.className = 'mb-4 p-3.5 rounded-2xl bg-teal-950/90 border border-teal-500/50 text-xs text-teal-200 flex items-center gap-3 transition-all duration-300 shadow-md';
    bannerEl.innerHTML = `
      <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center flex-shrink-0">
        <i class="fa-solid fa-circle-notch fa-spin text-base"></i>
      </div>
      <div>
        <div class="font-bold text-amber-200 text-xs">AI กำลังสแกนและสังเคราะห์ประเด็นท้าทายจาก Google Drive...</div>
        <div class="text-[11px] text-teal-300/80">ระบบกำลังวิเคราะห์ข้อตกลง PA 1/ส และโครงสร้างวิจัย 5 บทตามเกณฑ์ ว9/2564</div>
      </div>
    `;
    bannerEl.classList.remove('hidden');
  }

  if (typeof DriveSync !== 'undefined' && DriveSync.showToast) {
    DriveSync.showToast('🔍 AI กำลังค้นหาไฟล์เอกสารข้อตกลง PA และเล่มวิจัยใน Google Drive...', 'info', 3000);
  }

  // ซิงก์ข้อมูลล่าสุดจาก Google Drive หากตั้งค่าไว้
  let synced = (typeof DriveSync !== 'undefined') ? DriveSync.syncedData : null;
  if (!synced && typeof DriveSync !== 'undefined' && DriveSync.config && DriveSync.config.appsScriptUrl) {
    const res = await DriveSync.syncFromDrive(currentAcademicYear);
    if (res && res.status === 'success') {
      synced = res.data;
    }
  }

  // Smooth authentic delay for UI
  await new Promise(r => setTimeout(r, 600));

  // เรียกใช้ Generative AI วิเคราะห์และสังเคราะห์เอกสารจาก Drive
  const result = AIAssistant.synthesizeChallengeFromDrive(synced, currentAcademicYear, teacher);

  // บันทึกลงใน yearData
  yearData.challengeIssue = result;
  saveStoredTeachers();

  // หากเปิดอยู่ในหน้าต่างแก้ไข No-Code Editor ให้อัปเดตค่าลงช่องฟอร์มทันที
  if (document.getElementById('edit-challenge-topic')) {
    document.getElementById('edit-challenge-topic').value = result.topic;
  }
  if (document.getElementById('edit-challenge-target')) {
    document.getElementById('edit-challenge-target').value = `${result.targetGroup} / ${result.subject}`;
  }

  const fileListHtml = (result.sourceFiles && result.sourceFiles.length > 0)
    ? result.sourceFiles.map(f => `<span class="inline-block px-2 py-0.5 rounded bg-teal-900/90 text-teal-300 border border-teal-500/30 text-[10px] mr-1 mb-1">📄 ${f}</span>`).join('')
    : '<span class="inline-block px-2 py-0.5 rounded bg-teal-900/90 text-teal-300 text-[10px]">📄 01_แบบข้อตกลงในการพัฒนางาน (PA 1-ส)</span>';

  // แสดงผลการวิเคราะห์ไฟล์ในหน้าต่าง Editor
  if (statusEl) {
    statusEl.className = 'mb-3 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-[11px] text-emerald-200 space-y-1.5';
    statusEl.innerHTML = `
      <div class="font-bold flex items-center gap-1.5 text-emerald-300">
        <i class="fa-solid fa-circle-check text-emerald-400"></i> AI ค้นหาและสังเคราะห์ประเด็นท้าทาย (วิจัย 5 บท) สำเร็จ!
      </div>
      <div class="text-[10px] text-slate-300">เอกสารที่นำมาวิเคราะห์และสกัดเนื้อหา:</div>
      <div class="pt-0.5">${fileListHtml}</div>
      <div class="text-[10px] text-emerald-400 pt-1 leading-relaxed">
        • ระบบได้สกัดหัวข้อ, กลุ่มเป้าหมาย, รายวิชา, สภาพปัญหา และสังเคราะห์ขั้นตอนวิจัย 5 บทให้ครบถ้วนแล้ว
      </div>
    `;
    statusEl.classList.remove('hidden');
  }

  // อัปเดต Live Banner บนหน้าเว็บหลัก
  if (bannerEl) {
    bannerEl.className = 'mb-4 p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-xs text-emerald-200 transition-all duration-300 shadow-lg';
    bannerEl.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
          <i class="fa-solid fa-circle-check text-base"></i>
        </div>
        <div class="min-w-0 flex-1">
          <div class="font-bold text-emerald-300 flex items-center justify-between">
            <span>AI สังเคราะห์ประเด็นท้าทาย (วิจัย 5 บท) สำเร็จแล้ว!</span>
            <span class="text-[10px] bg-emerald-900/80 px-2 py-0.5 rounded text-emerald-300 font-semibold border border-emerald-500/30">Google Drive Live</span>
          </div>
          <div class="text-[11px] text-slate-300 mt-1">เอกสารที่นำมาประมวลผล: ${fileListHtml}</div>
          <div class="text-[10px] text-emerald-400/90 mt-1">ระบบได้อัปเดตโมเดล ${result.modelType || 'PREM Model'} และขั้นตอนการดำเนินงาน 5 บทลงในหน้าเว็บทันที</div>
        </div>
      </div>
    `;
    bannerEl.classList.remove('hidden');
  }

  // อัปเดตส่วนแสดงผลบนหน้าเว็บหลัก
  renderChallengeSection(teacher, yearData);

  // Flash highlight on topic
  const topicEl = document.getElementById('challenge-topic-text');
  if (topicEl) {
    topicEl.classList.add('text-amber-300', 'transition-all', 'duration-500');
    setTimeout(() => topicEl.classList.remove('text-amber-300'), 2500);
  }

  // Restore button
  if (btnChallenge) {
    btnChallenge.disabled = false;
    btnChallenge.classList.remove('opacity-80', 'cursor-not-allowed');
  }
  if (btnText) {
    btnText.innerText = 'ให้ AI ค้นหาและสังเคราะห์จากไฟล์ในไดรฟ์';
  }

  if (typeof DriveSync !== 'undefined' && DriveSync.showToast) {
    DriveSync.showToast('✅ AI สังเคราะห์ประเด็นท้าทายและโมเดลวิจัย 5 บทจากเอกสารในไดรฟ์เรียบร้อยแล้ว!', 'success', 4500);
  }
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

  const statusEl = document.getElementById('editor-ai-challenge-status');
  if (statusEl) statusEl.classList.add('hidden');

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
    teacher._hasCustomProfile = true;
    if (yearData) {
      yearData.avatarUrl = convertedAvatar;
      yearData._hasCustomProfile = true;
    }
  }
  if (cover) {
    const convertedCover = convertToGoogleDriveThumbnailUrl(cover, 'w1920');
    teacher.coverUrl = convertedCover;
    teacher._hasCustomProfile = true;
    if (yearData) {
      yearData.coverUrl = convertedCover;
      yearData._hasCustomProfile = true;
    }
  }

  if (topic) {
    if (!yearData.challengeIssue) yearData.challengeIssue = {};
    yearData.challengeIssue.topic = topic;
  }
  if (target) {
    if (!yearData.challengeIssue) yearData.challengeIssue = {};
    if (target.includes(' / ')) {
      const parts = target.split(' / ');
      yearData.challengeIssue.targetGroup = parts[0].trim();
      yearData.challengeIssue.subject = parts.slice(1).join(' / ').trim();
    } else {
      yearData.challengeIssue.targetGroup = target;
    }
  }

  // Save to localStorage
  saveStoredTeachers();
  renderApp();
  closeProfileEditorModal();

  // ☁️ Real-time Cloud Sync: ส่งข้อมูลโปรไฟล์ไปบันทึกบน Google Drive ทันทีเป็นค่าเริ่มต้นสากล
  if (typeof DriveSync !== 'undefined' && typeof DriveSync.saveProfileToCloud === 'function') {
    if (_cloudSyncDatabaseTimeout) clearTimeout(_cloudSyncDatabaseTimeout);
    DriveSync.saveProfileToCloud(teacher);
  } else if (typeof DriveSync !== 'undefined' && DriveSync.showToast) {
    DriveSync.showToast('✅ บันทึกข้อมูลโปรไฟล์และอัปเดตหน้าเว็บเรียบร้อยแล้ว!', 'success', 3500);
  }
}

// Global Keydown Listener for Modals
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const videoModal = document.getElementById('video-player-modal');
    if (videoModal && !videoModal.classList.contains('hidden')) {
      closeVideoPlayer();
      return;
    }
    const lightbox = document.getElementById('lightbox');
    if (lightbox && !lightbox.classList.contains('hidden')) {
      closeLightbox();
      return;
    }
    const indModal = document.getElementById('indicator-modal');
    if (indModal && !indModal.classList.contains('hidden')) {
      closeIndicatorModal();
      return;
    }
    const docModal = document.getElementById('doc-modal');
    if (docModal && !docModal.classList.contains('hidden')) {
      closeDocViewer();
      return;
    }
  }
});
