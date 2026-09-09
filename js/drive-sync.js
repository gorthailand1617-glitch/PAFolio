/**
 * PAFolio - Google Drive Sync Engine & Live Refresh Controller
 * จัดการการเชื่อมต่อ Google Apps Script Web App และ Google Drive แบบ Real-time
 */

const DriveSync = {
  // ข้อมูลที่ซิงก์ล่าสุดจาก Google Drive
  syncedData: null,
  isSyncing: false,
  lastAutoSyncTimestamp: 0,

  // ค่าตั้งค่าการเชื่อมต่อปัจจุบัน (พร้อม AI Auto-Heal ป้องกันปัญหา Folder ID ผิดพลาด)
  config: {
    folderId: (function() {
      const badIds = ['19mPdGDZ0QUD7Eem3w-f8WV6xaCRZUYVZ', 'YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE'];
      const trueId = '1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K';
      const saved = (localStorage.getItem('pafolio_drive_folder_id') || '').trim();
      if (!saved || badIds.includes(saved)) {
        localStorage.setItem('pafolio_drive_folder_id', trueId);
        return trueId;
      }
      return saved;
    })(),
    appsScriptUrl: localStorage.getItem('pafolio_apps_script_url') || '',
    autoSync: localStorage.getItem('pafolio_auto_sync') !== 'false', // ค่าเริ่มต้นเปิด auto sync
    lastSyncTime: localStorage.getItem('pafolio_last_sync_time') || null
  },

  // ✨ ให้ AI ตั้งค่าและตรวจสอบโฟลเดอร์ ว.PA อัตโนมัติในคลิกเดียว (Zero-Config)
  aiAutoConfigure() {
    const trueId = '1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K';
    this.config.folderId = trueId;
    localStorage.setItem('pafolio_drive_folder_id', trueId);
    this.updateStatusUI();
    const input = document.getElementById('drive-folder-id-input');
    if (input) input.value = trueId;
    this.showToast('✨ AI กำหนดโฟลเดอร์ ว.PA ของครูเรียบร้อยแล้ว!', 'success', 3500);
    return trueId;
  },

  // บันทึกการตั้งค่า
  saveConfig(folderId, appsScriptUrl, autoSync = true) {
    this.config.folderId = folderId.trim();
    this.config.appsScriptUrl = appsScriptUrl.trim();
    this.config.autoSync = autoSync;

    localStorage.setItem('pafolio_drive_folder_id', this.config.folderId);
    localStorage.setItem('pafolio_apps_script_url', this.config.appsScriptUrl);
    localStorage.setItem('pafolio_auto_sync', autoSync);

    this.updateStatusUI();
  },

  // ดึงข้อมูลสดจาก Google Drive ผ่าน Apps Script Web App
  async syncFromDrive(year = null) {
    if (!this.config.appsScriptUrl) {
      console.warn('[DriveSync] No Apps Script URL provided. Using local structured data.');
      return { status: 'offline', message: 'ยังไม่ได้ตั้งค่า Web App URL ของ Google Apps Script' };
    }

    try {
      let fetchUrl = this.config.appsScriptUrl.trim();
      
      // ตรวจสอบเบื้องต้นกรณีผู้ใช้เผลอวาง URL หน้าแก้ไขสคริปต์
      if (fetchUrl.includes('/edit')) {
        console.warn('[DriveSync] URL appears to be an editor URL instead of Web App execution URL.');
      }

      const params = new URLSearchParams();
      if (this.config.folderId) params.append('folderId', this.config.folderId.trim());
      if (year) params.append('year', year);

      if (fetchUrl.includes('?')) {
        fetchUrl += '&' + params.toString();
      } else {
        fetchUrl += '?' + params.toString();
      }

      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      if (result.status === 'success') {
        this.config.lastSyncTime = new Date().toISOString();
        localStorage.setItem('pafolio_last_sync_time', this.config.lastSyncTime);
        this.syncedData = result.data;

        // บันทึกแคชข้อมูล Google Drive ลงใน localStorage เพื่อให้คงอยู่แม้รีเฟรชหน้าเว็บ
        try {
          const targetYear = year || (typeof currentAcademicYear !== 'undefined' ? currentAcademicYear : '2568');
          localStorage.setItem('pafolio_synced_data_' + targetYear, JSON.stringify(result.data));
          localStorage.setItem('pafolio_synced_data', JSON.stringify(result.data));

          // จัดเก็บลิงก์โฟลเดอร์ของแต่ละตัวชี้วัด
          const customMapKey = 'pafolio_indicator_folders_' + targetYear;
          let customMap = {};
          try { customMap = JSON.parse(localStorage.getItem(customMapKey) || '{}'); } catch(e) {}

          if (result.data.indicatorFolders) {
            Object.entries(result.data.indicatorFolders).forEach(([code, obj]) => {
              if (obj && obj.folderUrl) customMap[code] = obj.folderUrl;
              else if (obj && obj.folderId) customMap[code] = `https://drive.google.com/drive/folders/${obj.folderId}`;
              else if (typeof obj === 'string') customMap[code] = obj;
            });
          }
          if (result.data.indicators) {
            Object.entries(result.data.indicators).forEach(([key, obj]) => {
              const code = obj.indicatorCode || key;
              if (code && obj.folderUrl) customMap[code] = obj.folderUrl;
              else if (code && obj.folderId) customMap[code] = `https://drive.google.com/drive/folders/${obj.folderId}`;
            });
          }
          localStorage.setItem(customMapKey, JSON.stringify(customMap));
        } catch(cacheErr) {
          console.warn('[DriveSync] Failed to cache Drive data to localStorage', cacheErr);
        }

        this.updateStatusUI(true);
        return { status: 'success', data: result.data };
      } else {
        throw new Error(result.message || 'Apps Script ส่งสถานะ Error กลับมา');
      }
    } catch (err) {
      console.error('[DriveSync Error]', err);
      let friendlyMessage = err.message || '';
      if (err.name === 'TypeError' || friendlyMessage.toLowerCase().includes('failed to fetch')) {
        friendlyMessage = 'Failed to fetch (สาเหตุหลัก: Apps Script ยังไม่ได้ตั้งค่า "Who has access / ผู้มีสิทธิ์เข้าถึง: Anyone / ทุกคน" หรือยังไม่ได้ใช้ URL ที่ลงท้ายด้วย /exec)';
      }
      this.updateStatusUI(false, friendlyMessage);
      return { status: 'error', message: friendlyMessage, rawError: err };
    }
  },

  // ทดสอบการเชื่อมต่อ Apps Script และ Google Drive พร้อมระบุปัญหาแบบละเอียด
  async testConnection(folderId, scriptUrl) {
    const cleanUrl = (scriptUrl || '').trim();
    const cleanFolderId = (folderId || '').trim();

    if (!cleanUrl) {
      return { ok: false, message: 'กรุณากรอก Google Apps Script Web App URL ก่อนทดสอบ' };
    }

    if (cleanUrl.includes('/macros/library/')) {
      return {
        ok: false,
        message: '❌ ตรวจพบ URL ของ "คลัง (Library)" ซึ่งเบราว์เซอร์ไม่สามารถเรียกใช้งานได้!\n\n👉 วิธีแก้ไขใน Google Apps Script:\n1. กดปุ่มสีน้ำเงินมุมขวาบน "การทำให้ใช้งานได้" (Deploy) ➔ "การทำให้ใช้งานได้ใหม่" (New deployment)\n2. คลิกรูปฟันเฟือง ⚙️ ด้านซ้าย เลือกประเภทเป็น "เว็บแอป" (Web app) (ห้ามเลือก "คลัง")\n3. ดำเนินการในฐานะ: "ฉัน (Me)"\n4. ผู้มีสิทธิ์เข้าถึง (Who has access): ต้องเลือกเป็น "ทุกคน" (Anyone)\n5. กด Deploy แล้วคัดลอก URL เว็บแอป (ขึ้นต้นด้วย macros/s/... และลงท้ายด้วย /exec) มาวางครับ'
      };
    }

    if (!cleanUrl.startsWith('https://script.google.com/macros/s/')) {
      return { 
        ok: false, 
        message: 'รูปแบบ URL ไม่ถูกต้อง: URL Web App ต้องขึ้นต้นด้วย https://script.google.com/macros/s/... (ไม่ใช่ URL หน้าแก้ไขสคริปต์ หรือ URL คลังไลบรารี)' 
      };
    }

    if (!cleanUrl.endsWith('/exec') && !cleanUrl.includes('/exec?')) {
      return {
        ok: false,
        message: 'URL ต้องลงท้ายด้วย /exec (หากลงท้ายด้วย /edit หรือ /dev เบราว์เซอร์จะไม่สามารถเชื่อมต่อได้)'
      };
    }

    try {
      let testUrl = cleanUrl;
      const params = new URLSearchParams();
      if (cleanFolderId) params.append('folderId', cleanFolderId);
      testUrl += (testUrl.includes('?') ? '&' : '?') + params.toString();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(testUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        return { ok: false, message: `เซิร์ฟเวอร์ตอบกลับสถานะ HTTP ${res.status}: ${res.statusText}` };
      }

      const json = await res.json();
      if (json.status === 'success') {
        const folderName = json.data?.folderName || 'โฟลเดอร์หลัก';
        const yearsCount = json.data?.years?.length || 0;
        return { 
          ok: true, 
          message: `เชื่อมต่อสำเร็จ 100%! พบโฟลเดอร์ "${folderName}" (ข้อมูลปีการศึกษา: ${yearsCount} รอบ)`,
          data: json.data 
        };
      } else {
        return { ok: false, message: json.message || 'Apps Script ส่งข้อผิดพลาดกลับมา' };
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        return { ok: false, message: 'การเชื่อมต่อหมดเวลา (Timeout 15 วินาที) กรุณาตรวจสอบอินเทอร์เน็ตหรือ Apps Script' };
      }
      if (err.name === 'TypeError' || (err.message && err.message.toLowerCase().includes('failed to fetch'))) {
        return {
          ok: false,
          isCorsError: true,
          message: 'เกิดข้อผิดพลาด "Failed to fetch" (CORS Policy Blocked)\n\nวิธีแก้ไขด่วน:\n1. ไปที่ Google Apps Script ของคุณ\n2. คลิก "การทำให้ใช้งานได้" (Deploy) > "การทำให้ใช้งานได้ใหม่" (New deployment)\n3. ตรง "ผู้มีสิทธิ์เข้าถึง" (Who has access) ต้องเลือกเป็น "ทุกคน" (Anyone) เท่านั้น!\n4. กด Deploy แล้วคัดลอก URL ที่ลงท้ายด้วย /exec มาใหม่อีกครั้ง'
        };
      }
      return { ok: false, message: `เกิดข้อผิดพลาด: ${err.message}` };
    }
  },

  // ซิงก์และรีเฟรชข้อมูลบนหน้าเว็บทันทีพร้อมแสดง Toast แจ้งเตือน
  async syncAndApply(year = null, showToast = true) {
    if (this.isSyncing) return;
    this.isSyncing = true;

    // หมุนไอคอนซิงก์
    this.setSpinningIcon(true);

    if (showToast) {
      this.showToast('กำลังเชื่อมต่อและดึงไฟล์ล่าสุดจาก Google Drive...', 'info', 2500);
    }

    const targetYear = year || (typeof currentAcademicYear !== 'undefined' ? currentAcademicYear : null);
    const result = await this.syncFromDrive(targetYear);

    this.setSpinningIcon(false);
    this.isSyncing = false;
    this.lastAutoSyncTimestamp = Date.now();

    if (result.status === 'success') {
      const data = result.data;
      let totalFiles = 0;
      if (data.indicators) {
        Object.values(data.indicators).forEach(ind => {
          if (ind.files) totalFiles += ind.files.length;
        });
      }
      const totalImages = data.evidenceGallery ? data.evidenceGallery.length : 0;

      // อัปเดตข้อมูลโปรไฟล์ครูสดจาก Cloud (liveProfile)
      if (data.liveProfile) {
        const teacher = typeof getActiveTeacher === 'function' ? getActiveTeacher() : null;
        if (teacher) {
          if (data.liveProfile.name) teacher.name = data.liveProfile.name;
          if (data.liveProfile.position) teacher.position = data.liveProfile.position;
          if (data.liveProfile.academicStanding) teacher.academicStanding = data.liveProfile.academicStanding;
          if (data.liveProfile.avatarUrl) {
            teacher.avatarUrl = data.liveProfile.avatarUrl;
            teacher._hasCustomProfile = true;
            document.querySelectorAll('.teacher-avatar-img').forEach(el => el.src = data.liveProfile.avatarUrl);
          }
          if (data.liveProfile.coverUrl) {
            teacher.coverUrl = data.liveProfile.coverUrl;
            teacher._hasCustomProfile = true;
            document.querySelectorAll('.hero-cover-img, #hero-cover-img').forEach(el => el.src = data.liveProfile.coverUrl);
          }
          if (typeof updateHeaderAndProfile === 'function') updateHeaderAndProfile();
        }
      }

      // อัปเดตรูปโปรไฟล์, ภาพปก และโลโก้จาก Google Drive (เฉพาะกรณีที่ยังไม่ได้เลือกรูปเอง ป้องกันรูปเด้งกลับ)
      if (data.assets) {
        const teacher = typeof getActiveTeacher === 'function' ? getActiveTeacher() : null;
        let updatedAsset = false;

        // ไม่ให้ assets เขียนทับรูปที่ครูเลือกปรับแต่งเองเด็ดขาด
        if (data.assets.profileUrl && teacher && !teacher._hasCustomProfile && (!teacher.avatarUrl || teacher.avatarUrl.includes('unsplash'))) {
          document.querySelectorAll('.teacher-avatar-img').forEach(el => el.src = data.assets.profileUrl);
          teacher.avatarUrl = data.assets.profileUrl;
          updatedAsset = true;
        }

        if (data.assets.coverUrl && teacher && !teacher._hasCustomProfile && (!teacher.coverUrl || teacher.coverUrl.includes('unsplash'))) {
          document.querySelectorAll('.hero-cover-img, #hero-cover-img').forEach(el => el.src = data.assets.coverUrl);
          teacher.coverUrl = data.assets.coverUrl;
          updatedAsset = true;
        }

        if (updatedAsset && typeof saveStoredTeachers === 'function') {
          saveStoredTeachers();
        }
      }

      // รีเฟรชส่วนการแสดงผลบนหน้าเว็บ
      if (typeof renderGallery === 'function') renderGallery();
      if (typeof renderIndicators === 'function') renderIndicators('all', '');
      if (typeof CertificateVault !== 'undefined' && typeof CertificateVault.renderVaultUI === 'function') {
        CertificateVault.renderVaultUI();
      }

      if (showToast) {
        this.showToast(`ซิงก์ข้อมูลจาก Google Drive เรียบร้อยแล้ว (พบ ${totalFiles} ไฟล์, ${totalImages} ภาพ)`, 'success', 4000);
      }
      return true;
    } else if (result.status === 'error') {
      if (showToast) {
        this.showToast(`เกิดข้อผิดพลาดในการเชื่อมต่อ Google Drive: ${result.message}`, 'error', 6000);
      }
      return false;
    }
  },

  // ควบคุม Animation ของไอคอนซิงก์
  setSpinningIcon(spinning) {
    const icons = document.querySelectorAll('.drive-sync-spin-icon, #quick-sync-icon');
    icons.forEach(icon => {
      if (spinning) {
        icon.classList.add('fa-spin');
      } else {
        icon.classList.remove('fa-spin');
      }
    });
  },

  // อัปเดตสถานะการเชื่อมต่อบน Navbar และหน้าต่างตั้งค่า
  updateStatusUI(isConnected = false, errorMsg = '') {
    const badge = document.getElementById('drive-sync-badge');
    const syncStatusText = document.getElementById('drive-sync-status-text');

    if (badge) {
      if (this.config.appsScriptUrl) {
        if (isConnected || this.config.lastSyncTime) {
          badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/80 transition';
          badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> <i class="fa-brands fa-google-drive"></i> Google Drive ซิงก์สด';
        } else {
          badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/40 hover:bg-amber-900/80 transition';
          badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-400"></span> <i class="fa-brands fa-google-drive"></i> ไดรฟ์ออฟไลน์';
        }
      } else {
        badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition';
        badge.innerHTML = '<i class="fa-brands fa-google-drive text-teal-400 mr-0.5"></i> ตั้งค่า Google Drive';
      }
    }

    if (syncStatusText) {
      if (this.config.lastSyncTime) {
        const timeStr = new Date(this.config.lastSyncTime).toLocaleTimeString('th-TH');
        syncStatusText.innerText = `ซิงก์ล่าสุด: วันนี้เวลา ${timeStr}`;
      } else {
        syncStatusText.innerText = 'ยังไม่ได้เชื่อมต่อ Google Drive';
      }
    }
  },

  // แสดง Toast Notification สวยงามที่มุมขวาล่าง
  showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('pafolio-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'pafolio-toast-container';
      container.className = 'fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'pointer-events-auto flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl shadow-xl border text-xs sm:text-sm font-medium backdrop-blur-md transform transition-all duration-300 translate-y-3 opacity-0';

    let iconHtml = '<i class="fa-solid fa-circle-info text-teal-500 text-base"></i>';
    if (type === 'success') {
      toast.classList.add('bg-emerald-950/90', 'border-emerald-500/40', 'text-emerald-100');
      iconHtml = '<i class="fa-solid fa-circle-check text-emerald-400 text-lg flex-shrink-0"></i>';
    } else if (type === 'error') {
      toast.classList.add('bg-rose-950/90', 'border-rose-500/40', 'text-rose-100');
      iconHtml = '<i class="fa-solid fa-circle-exclamation text-rose-400 text-lg flex-shrink-0"></i>';
    } else {
      toast.classList.add('bg-slate-900/90', 'border-teal-500/40', 'text-slate-100');
      iconHtml = '<i class="fa-solid fa-arrows-rotate fa-spin text-teal-400 text-lg flex-shrink-0"></i>';
    }

    toast.innerHTML = `
      ${iconHtml}
      <div class="flex-1 leading-snug">${message}</div>
      <button class="text-slate-400 hover:text-white transition ml-1" onclick="this.parentElement.remove()">
        <i class="fa-solid fa-xmark text-sm"></i>
      </button>
    `;

    container.appendChild(toast);

    // Fade in animation
    setTimeout(() => {
      toast.classList.remove('translate-y-3', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    }, 10);

    // Auto dismiss
    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-3', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // เริ่มต้นระบบ Event Listeners สำหรับ Auto-Sync
  initAutoSyncListeners() {
    // 1. ซิงก์อัตโนมัติเมื่อผู้ใช้สลับกลับมาที่แท็บเว็บนี้ (Tab Focus)
    window.addEventListener('focus', () => {
      const now = Date.now();
      // ป้องกันการยิงซ้ำถี่เกินไป (ต้องห่างกันอย่างน้อย 15 วินาที)
      if (this.config.appsScriptUrl && this.config.autoSync && (now - this.lastAutoSyncTimestamp > 15000)) {
        console.log('[DriveSync] Tab focused, auto-refreshing Drive data...');
        this.syncAndApply(typeof currentAcademicYear !== 'undefined' ? currentAcademicYear : null, false);
      }
    });

    // 2. ซิงก์อัตโนมัติทุกๆ 45 วินาทีเมื่อเปิดหน้าเว็บทิ้งไว้ (Real-time Background Polling)
    setInterval(() => {
      if (document.visibilityState === 'visible' && this.config.appsScriptUrl && this.config.autoSync && !this.isSyncing) {
        console.log('[DriveSync] Periodic real-time sync check...');
        this.syncAndApply(typeof currentAcademicYear !== 'undefined' ? currentAcademicYear : null, false);
      }
    }, 45 * 1000);
  },

  // =========================================================================
  // 📦 สร้างและดาวน์โหลดไฟล์ ZIP โครงสร้างโฟลเดอร์ ว.PA สำหรับอัปโหลดขึ้น Google Drive
  // =========================================================================
  async downloadFolderTemplateZip(teacherNameInput = null, yearInput = null) {
    if (typeof JSZip === 'undefined') {
      alert('กำลังโหลดไลบรารี JSZip กรุณาลองใหม่อีกครั้งใน 2-3 วินาที');
      return;
    }

    const teacher = (typeof getActiveTeacher === 'function' ? getActiveTeacher() : null);
    const teacherName = teacherNameInput || (teacher ? teacher.name : 'นายกรกฎ รัตนะโชติ');
    const year = yearInput || (typeof currentAcademicYear !== 'undefined' ? currentAcademicYear : '2568');
    const shortYear = (year.length === 4) ? year.substring(2) : year;

    const zip = new JSZip();
    const rootFolderName = `PAFolio - แฟ้มสะสมงาน ว.PA (${teacherName})`;
    const root = zip.folder(rootFolderName);

    // 1. Assets ส่วนกลาง
    const assets = root.folder("🖼️ 00_Assets_ภาพประจำตัวและโลโก้");
    assets.folder("01_รูปโปรไฟล์ครู (Profile Photos)").file("คำแนะนำ_รูปโปรไฟล์.txt", "วางไฟล์รูปภาพประจำตัวครู (JPG/PNG) ที่นี่ เพื่อให้ระบบดึงไปแสดงผลเป็นรูปโปรไฟล์");
    assets.folder("02_โลโก้โรงเรียนและตราสัญลักษณ์ (Logos)").file("คำแนะนำ_โลโก้.txt", "วางไฟล์ภาพตราสัญลักษณ์หรือโลโก้โรงเรียน (PNG โปร่งใส แนะนำ)");
    assets.folder("03_ภาพปกและภาพหัวเรื่อง (Banners & Covers)").file("คำแนะนำ_ภาพปก.txt", "วางไฟล์ภาพหัวเรื่อง ภาพแบนเนอร์ หรือภาพกิจกรรมสำคัญสำหรับใช้เป็นปก");
    assets.folder("04_เกียรติบัตรและโล่รางวัลรวม (Certificates)").file("คำแนะนำ_เกียรติบัตร.txt", "วางไฟล์เกียรติบัตร โล่รางวัล หรือเอกสารยกย่องเชิดชูเกียรติ");

    // 2. โฟลเดอร์ประจำปีการศึกษา
    const yearFolderName = `PA${shortYear} ผลการประเมิน ว.PA ปีการศึกษา ${year}`;
    const yearFolder = root.folder(yearFolderName);

    yearFolder.folder(`📸 รูปถ่ายครูและภาพกิจกรรมประจำปี ${year}`).file("คำแนะนำ.txt", `วางภาพถ่ายกิจกรรมการเรียนการสอนและกิจกรรมต่างๆ ในปีการศึกษา ${year}`);

    // ด้านที่ 1 (8 ตัวชี้วัด)
    const d1 = yearFolder.folder("ด้านที่ 1 ด้านการจัดการเรียนรู้ (8 ตัวชี้วัด)");
    const indList1 = [
      { code: "1.1", name: "1.1 สร้างและหรือพัฒนาหลักสูตร", guide: "วางหลักสูตรสถานศึกษา แผนผังโครงสร้างรายวิชา และคำอธิบายรายวิชา" },
      { code: "1.2", name: "1.2 ออกแบบการจัดการเรียนรู้", guide: "วางหน่วยการเรียนรู้ แผนการจัดการเรียนรู้ และกำหนดการสอน" },
      { code: "1.3", name: "1.3 จัดกิจกรรมการเรียนรู้ (Active Learning)", guide: "วางภาพถ่ายการจัดกิจกรรมเชิงรุก ใบกิจกรรม และบันทึกหลังแผนการสอน" },
      { code: "1.4", name: "1.4 สร้างและหรือพัฒนาสื่อ นวัตกรรม เทคโนโลยี", guide: "วางสื่อการสอน ใบความรู้ สื่อดิจิทัล ลิงก์คลิป หรือนวัตกรรมที่พัฒนาขึ้น" },
      { code: "1.5", name: "1.5 วัดและประเมินผลการเรียนรู้", guide: "วางเครื่องมือวัดผล แบบทดสอบ เกณฑ์รูบริกส์ (Rubrics) และตารางวิเคราะห์ผล" },
      { code: "1.6", name: "1.6 ศึกษา วิเคราะห์ สังเคราะห์ เพื่อแก้ไขปัญหา", guide: "วางรายงานวิจัยในชั้นเรียน บันทึกการแก้ปัญหานักเรียน หรือบทความวิชาการ" },
      { code: "1.7", name: "1.7 จัดบรรยากาศที่ส่งเสริมและพัฒนาผู้เรียน", guide: "วางภาพถ่ายบรรยากาศห้องเรียน ป้ายนิเทศ มุมส่งเสริมการเรียนรู้" },
      { code: "1.8", name: "1.8 อบรมและพัฒนาคุณลักษณะที่ดีของผู้เรียน", guide: "วางบันทึกโฮมรูม บันทึกคุณลักษณะอันพึงประสงค์ และภาพการอบรมคุณธรรม" }
    ];
    indList1.forEach(ind => {
      const folder = d1.folder(ind.name);
      folder.folder(`🖼️ รูปภาพประกอบตัวชี้วัด ${ind.code}`).file("วางรูปภาพที่นี่.txt", `วางไฟล์รูปภาพ JPG/PNG กิจกรรมที่เกี่ยวข้องกับ ${ind.name}`);
      folder.folder("📄 เอกสารและหลักฐาน PDF").file("คำแนะนำเอกสาร.txt", `${ind.guide}\n(วางไฟล์ PDF, Word หรือบันทึกข้อความที่นี่)`);
    });

    // ด้านที่ 2 (4 ตัวชี้วัด)
    const d2 = yearFolder.folder("ด้านที่ 2 ด้านการส่งเสริมและสนับสนุน (4 ตัวชี้วัด)");
    const indList2 = [
      { code: "2.1", name: "2.1 จัดทำข้อมูลสารสนเทศของผู้เรียนและรายวิชา", guide: "วาง ปพ.5 รายงานผลสัมฤทธิ์ สถิติการเข้าเรียน สารสนเทศชั้นเรียน" },
      { code: "2.2", name: "2.2 ดำเนินการตามระบบดูแลช่วยเหลือผู้เรียน (SDQ)", guide: "วางแบบคัดกรอง SDQ, แบบประเมิน EQ, บันทึกการเยี่ยมบ้าน, แบบบันทึกการส่งต่อ" },
      { code: "2.3", name: "2.3 ปฏิบัติงานวิชาการ และงานอื่นๆ ของสถานศึกษา", guide: "วางคำสั่งปฏิบัติหน้าที่ คำสั่งกลุ่มบริหารวิชาการ/บริหารทั่วไป และรายงานผลการปฏิบัติงาน" },
      { code: "2.4", name: "2.4 ประสานความร่วมมือกับผู้ปกครองและภาคีเครือข่าย", guide: "วางบันทึกการประชุมผู้ปกครอง บันทึกการติดต่อกลุ่มไลน์ และภาพความร่วมมือชุมชน" }
    ];
    indList2.forEach(ind => {
      const folder = d2.folder(ind.name);
      folder.folder(`🖼️ รูปภาพประกอบตัวชี้วัด ${ind.code}`).file("วางรูปภาพที่นี่.txt", `วางไฟล์รูปภาพ JPG/PNG ที่เกี่ยวข้องกับ ${ind.name}`);
      folder.folder("📄 เอกสารและหลักฐาน PDF").file("คำแนะนำเอกสาร.txt", `${ind.guide}\n(วางไฟล์ PDF หรือเอกสารหลักฐาน)`);
    });

    // ด้านที่ 3 (3 ตัวชี้วัด)
    const d3 = yearFolder.folder("ด้านที่ 3 ด้านการพัฒนาตนเองและวิชาชีพ (3 ตัวชี้วัด)");
    const indList3 = [
      { code: "3.1", name: "3.1 พัฒนาตนเองอย่างเป็นระบบและต่อเนื่อง (อบรม/สัมมนา)", guide: "วางเกียรติบัตรการอบรม บันทึกรายงานผลการอบรม สัมมนาทางวิชาการ (ID Plan)" },
      { code: "3.2", name: "3.2 มีส่วนร่วมและเป็นผู้นำในการแลกเปลี่ยนเรียนรู้ทางวิชาชีพ (PLC)", guide: "วางบันทึกการประชุม PLC, บันทึก Logbook ชุมชนแห่งการเรียนรู้ทางวิชาชีพ, ภาพถ่าย PLC" },
      { code: "3.3", name: "3.3 นำความรู้ ทักษะ มาใช้ในการพัฒนาการจัดการเรียนรู้", guide: "วางรายงานการนำผลการอบรม/PLC มาปรับใช้สร้างนวัตกรรมและเผยแพร่แก่เพื่อนครู" }
    ];
    indList3.forEach(ind => {
      const folder = d3.folder(ind.name);
      folder.folder(`🖼️ รูปภาพประกอบตัวชี้วัด ${ind.code}`).file("วางรูปภาพที่นี่.txt", `วางไฟล์รูปภาพ JPG/PNG ที่เกี่ยวข้องกับ ${ind.name}`);
      folder.folder("📄 เอกสารและหลักฐาน PDF").file("คำแนะนำเอกสาร.txt", `${ind.guide}\n(วางไฟล์ PDF หรือเอกสารหลักฐาน)`);
    });

    // ประเด็นท้าทาย (5 บท)
    const ch = yearFolder.folder("🎯 ส่วนที่ 2 ข้อตกลงประเด็นท้าทาย (นวัตกรรมและงานวิจัย 5 บท)");
    ch.folder("01_แผนการสอนและกระบวนการจัดการเรียนรู้นวัตกรรม").file("คำแนะนำ.txt", "วางแผนการสอนนวัตกรรม / กระบวนการจัดกิจกรรมที่ใช้เป็นประเด็นท้าทาย");
    ch.folder("02_เครื่องมือวิจัย_แบบทดสอบ_แบบประเมินและเกณฑ์IOC").file("คำแนะนำ.txt", "วางแบบทดสอบ แบบสอบถาม เกณฑ์ประเมิน IOC และเอกสารการหาคุณภาพเครื่องมือ");
    ch.folder("03_ภาพกิจกรรมการเรียนรู้_ภาพการใช้ThinkingWhiteboard_ชิ้นงานนักเรียน").file("คำแนะนำ.txt", "วางภาพบรรยากาศการจัดกิจกรรม ภาพชิ้นงาน ผลงานนักเรียน หรือสื่อการสอน");
    ch.folder("04_รายงานผลการวิเคราะห์ข้อมูลและเล่มวิจัยในชั้นเรียน 5 บท").file("คำแนะนำ.txt", "วางเล่มรายงานวิจัยในชั้นเรียน 5 บท และบทสรุปผู้บริหาร");
    ch.folder("05_การเผยแพร่นวัตกรรมและบันทึกชุมชนPLC").file("คำแนะนำ.txt", "วางหลักฐานการเผยแพร่นวัตกรรม บันทึกการขยายผล และการสะท้อนคิด PLC");

    // เอกสารประเมินทางการ
    const docs = yearFolder.folder("📋 เอกสารแบบประเมิน ว.PA และ SAR");
    docs.folder("01_แบบข้อตกลงในการพัฒนางาน (PA 1-ส)").file("คำแนะนำ.txt", "วางไฟล์เอกสาร PA 1/ส (แบบข้อตกลงในการพัฒนางานตามมาตรฐานตำแหน่งและวิทยฐานะ)");
    docs.folder("02_แบบประเมินผลการพัฒนางาน (PA 2-ส)").file("คำแนะนำ.txt", "วางไฟล์เอกสาร PA 2/ส (แบบประเมินผลการพัฒนางานตามข้อตกลง)");
    docs.folder("03_แบบสรุปผลการประเมิน (PA 3-ส)").file("คำแนะนำ.txt", "วางไฟล์เอกสาร PA 3/ส (แบบสรุปผลการประเมินการพัฒนางาน)");
    docs.folder("04_รายงานผลการประเมินตนเองของสถานศึกษา (SAR)").file("คำแนะนำ.txt", "วางไฟล์รายงานประเมินตนเองรายบุคคล (Self-Assessment Report: SAR)");

    // ไฟล์คำแนะนำรวมที่ root
    root.file("README_คำแนะนำการใช้งาน.txt", 
`========================================================================
🌟 PAFolio - โครงสร้างโฟลเดอร์ ว.PA สำหรับ Google Drive (มาตรฐาน ว9/2564)
ครูผู้สอน: ${teacherName}
รอบการประเมิน: ปีการศึกษา ${year}
========================================================================

📌 ขั้นตอนการนำไปใช้งานบน Google Drive:
1. แตกไฟล์ ZIP นี้ (Extract Here) บนเครื่องคอมพิวเตอร์ของคุณ
2. เข้าสู่ Google Drive (drive.google.com)
3. ลากโฟลเดอร์ "${rootFolderName}" อัปโหลดขึ้น Google Drive
4. คลิกขวาที่โฟลเดอร์หลัก -> เลือก "แชร์" (Share) -> ตั้งค่าเป็น "ทุกคนที่มีลิงก์มีสิทธิ์อ่าน" (Anyone with the link can view)
5. คัดลอก ID ของโฟลเดอร์ (ตัวอักษรและตัวเลขท้าย URL)
6. นำ ID ไปใส่ในเว็บ PAFolio ที่เมนู "ตั้งค่า Google Drive"

📁 โครงสร้างโฟลเดอร์แบ่งออกเป็น:
- 🖼️ 00_Assets_ภาพประจำตัวและโลโก้: สำหรับใส่รูปโปรไฟล์ โลโก้โรงเรียน ภาพปก
- PA${shortYear} ผลการประเมิน ว.PA ปีการศึกษา ${year}: โครงสร้าง 3 ด้าน 15 ตัวชี้วัด, ประเด็นท้าทาย 5 บท และเอกสารประเมิน PA 1-3
- หากต้องการเพิ่มปีการศึกษาใหม่ (เช่น 2569) ให้ Copy โฟลเดอร์ "${yearFolderName}" แล้วเปลี่ยนชื่อเป็น "PA69 ผลการประเมิน ว.PA ปีการศึกษา 2569" ได้ทันที!
`);

    this.showToast('กำลังบีบอัดและสร้างไฟล์ ZIP โครงสร้างโฟลเดอร์ ว.PA...', 'info', 3000);
    try {
      const content = await zip.generateAsync({ type: 'blob' });
      const safeName = teacherName.replace(/[\/\\:*?"<>|]/g, '_').replace(/\s+/g, '_');
      const fileName = `PAFolio_Folder_Template_${year}_${safeName}.zip`;
      if (typeof saveAs === 'function') {
        saveAs(content, fileName);
      } else {
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      this.showToast(`ดาวน์โหลด ${fileName} สำเร็จแล้ว!`, 'success', 5000);
    } catch (err) {
      console.error(err);
      this.showToast('เกิดข้อผิดพลาดในการสร้างไฟล์ ZIP: ' + err.message, 'error', 5000);
    }
  },

  // =========================================================================
  // 🎬 อัปโหลดไฟล์วิดีโอการสอน/นำเสนอ (.webm/.mp4) ตรงสู่ Google Drive
  // =========================================================================
  async uploadVideoFile(videoBlob, fileName) {
    if (!this.isConfigured()) {
      this.showToast('กรุณาตั้งค่า Google Apps Script Web App URL ก่อนอัปโหลด', 'error', 4000);
      return false;
    }

    this.showToast(`🚀 กำลังอัปโหลดวิดีโอ ${fileName} สู่ Google Drive...`, 'info', 15000);

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result.split(',')[1];
          const payload = {
            action: 'uploadFile',
            fileName: fileName,
            mimeType: videoBlob.type || 'video/webm',
            fileBase64: base64Data,
            targetSubfolder: '05_วิดีโอการสอนและคลิปนำเสนอ (Teaching Videos)'
          };

          const response = await fetch(this.config.appsScriptUrl, {
            method: 'POST',
            body: JSON.stringify(payload)
          });

          const resJson = await response.json();
          if (resJson.status === 'success') {
            this.showToast(`🎉 อัปโหลดวิดีโอ ${fileName} สู่ Google Drive สำเร็จ!`, 'success', 6000);
            resolve(resJson);
          } else {
            throw new Error(resJson.message || 'เกิดข้อผิดพลาดในการอัปโหลด');
          }
        } catch (err) {
          console.error('[DriveSync] Upload video error:', err);
          this.showToast(`เกิดข้อผิดพลาด: ${err.message}`, 'error', 6000);
          reject(err);
        }
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(videoBlob);
    });
  },

  // ☁️ ส่งข้อมูลโปรไฟล์ครูไปบันทึกลง Google Drive ทันที (Real-time Cloud Sync)
  async saveProfileToCloud(profile) {
    if (!this.config.appsScriptUrl) {
      console.log('[DriveSync] No Apps Script URL configured. Saved locally.');
      this.showToast('💾 บันทึกรูปและโปรไฟล์ในเครื่องเรียบร้อยแล้ว!\n(💡 เพื่อให้บันทึกบน Google Drive โดยตรงและเปิดเครื่องไหนก็ตรงกัน กรุณาใส่ URL เว็บแอปที่เมนู "ตั้งค่า Google Drive")', 'info', 6000);
      return { status: 'offline', message: 'ยังไม่ได้เชื่อมต่อ Apps Script URL เพื่อซิงก์ข้ามเครื่อง' };
    }

    try {
      this.showToast('☁️ กำลังเชื่อมต่อและบันทึกไฟล์โปรไฟล์บน Google Drive...', 'info', 2000);
      const payload = {
        action: 'saveProfile',
        folderId: this.config.folderId || '1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K',
        profile: profile
      };

      const res = await fetch(this.config.appsScriptUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.status === 'success') {
        this.showToast('☁️ บันทึกโปรไฟล์ขึ้น Google Drive คลาวด์สำเร็จ! (ทุกเครื่องจะอัปเดตตรงกันทันที)', 'success', 3500);
      } else {
        this.showToast(`⚠️ Google Drive ตอบกลับ: ${json.message || 'บันทึกไม่สำเร็จ'}`, 'warning', 4000);
      }
      return json;
    } catch (err) {
      console.warn('[DriveSync] Error syncing profile to cloud:', err);
      this.showToast('⚠️ บันทึกในเครื่องแล้ว แต่ยังส่งไป Google Drive ไม่สำเร็จ กรุณาตรวจสอบสิทธิ์ Apps Script Web App', 'warning', 4500);
      return { status: 'error', message: err.toString() };
    }
  },

  // โหลดข้อมูล Google Drive ที่เคยซิงก์และแคชไว้ในเครื่อง
  loadCachedData(year = null) {
    try {
      const targetYear = year || (typeof currentAcademicYear !== 'undefined' ? currentAcademicYear : '2568');
      const cachedStr = localStorage.getItem('pafolio_synced_data_' + targetYear) || localStorage.getItem('pafolio_synced_data');
      if (cachedStr) {
        this.syncedData = JSON.parse(cachedStr);
        console.log('[DriveSync] Loaded cached Google Drive data for year:', targetYear);
      }
    } catch (e) {
      console.warn('[DriveSync] Could not parse cached data:', e);
    }
  }
};

// โหลดแคชข้อมูลเดิมทันที และเริ่มต้น Auto-sync listeners
DriveSync.loadCachedData();
DriveSync.initAutoSyncListeners();

