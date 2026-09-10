/**
 * PAFolio - YouTube Video Showcase & DPA Evidence Module v1.0
 * ระบบพื้นที่จัดแสดงและจัดการคลิปวิดีโอนำเสนอผลงาน ว.PA (บันทึกการสอน 60 นาที, คลิปแรงบันดาลใจ 10 นาที ฯลฯ)
 * รองรับการเพิ่มลิงก์ YouTube ได้เองจากหน้าเพจ, พรีวิวภาพย่ออัตโนมัติ, บันทึกคงทนใน localStorage
 */

const YouTubeShowcase = {
  storageKey: 'pafolio_youtube_videos',
  activeVideoId: null,
  activeCategory: 'all',
  searchQuery: '',

  // รายการคลิปเริ่มต้นตามบริบท ว.PA (กรณีผู้ใช้ยังไม่ได้เพิ่มคลิปของตนเอง)
  defaultVideos: [
    {
      id: 'yt-default-1',
      youtubeUrl: 'https://www.youtube.com/watch?v=kYJydZ90dC4',
      videoId: 'kYJydZ90dC4',
      title: 'คลิปบันทึกการจัดกิจกรรมการเรียนรู้เชิงรุก (Active Learning) 60 นาที',
      category: 'teaching',
      categoryThai: 'คลิปจัดการเรียนรู้ 60 นาที',
      categoryBadge: 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/30',
      duration: '58:20 นาที',
      date: 'ภาคเรียนที่ 1 ปีการศึกษา 2568',
      indicator: 'ด้านที่ 1 การจัดการเรียนรู้ (ตัวชี้วัด 1.1 - 1.8)',
      description: 'บันทึกการจัดกระบวนการเรียนรู้ตามแผนการจัดการเรียนรู้รายวิชาการงานอาชีพ เรื่อง กระบวนการ AI-Driven PREM Model สู่การสร้างมูลค่าเพิ่มทางเศรษฐกิจสร้างสรรค์ (คลิปเต็มต่อเนื่อง ไม่ตัดต่อ ตามเกณฑ์ ว9/2564)',
      isCustom: false
    },
    {
      id: 'yt-default-2',
      youtubeUrl: 'https://www.youtube.com/watch?v=7wtfhZwyrcc',
      videoId: '7wtfhZwyrcc',
      title: 'คลิปสภาพปัญหา ที่มา หรือแรงบันดาลใจในการจัดการเรียนรู้ 10 นาที',
      category: 'inspiration',
      categoryThai: 'คลิปสภาพปัญหา/แรงบันดาลใจ 10 นาที',
      categoryBadge: 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30',
      duration: '09:45 นาที',
      date: 'ภาคเรียนที่ 1 ปีการศึกษา 2568',
      indicator: 'ส่วนที่ 2 ข้อตกลงในการพัฒนางาน (ประเด็นท้าทาย)',
      description: 'การนำเสนอสภาพปัญหาของผู้เรียน การวิเคราะห์บริบทสภาพแวดล้อม และแรงบันดาลใจในการออกแบบรูปแบบการสอน Active Learning ผสานเทคโนโลยี เพื่อแก้ปัญหาทักษะการคิดเชิงนวัตกรรม',
      isCustom: false
    },
    {
      id: 'yt-default-3',
      youtubeUrl: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
      videoId: 'LXb3EKWsInQ',
      title: 'คลิปการนำเสนอผลงานและผลลัพธ์การเรียนรู้ของผู้เรียน (Student Outcomes)',
      category: 'outcome',
      categoryThai: 'ผลลัพธ์การเรียนรู้ของผู้เรียน',
      categoryBadge: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
      duration: '12:30 นาที',
      date: 'ภาคเรียนที่ 2 ปีการศึกษา 2568',
      indicator: 'ด้านที่ 2 ผลลัพธ์การเรียนรู้ของผู้เรียน (ตัวชี้วัด 2.1 - 2.4)',
      description: 'หลักฐานเชิงประจักษ์การแสดงออกของนักเรียน การนำเสนอชิ้นงานนวัตกรรม Eco-Product และการสะท้อนคิด (Reflection) ของผู้เรียนรายกลุ่มและรายบุคคล',
      isCustom: false
    },
    {
      id: 'yt-default-4',
      youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
      videoId: 'kJQP7kiw5Fk',
      title: 'คลิปสาธิตสื่อและนวัตกรรมการเรียนรู้ดิจิทัล (Smart Eco-Vocation)',
      category: 'innovation',
      categoryThai: 'สื่อนวัตกรรมการจัดการเรียนรู้',
      categoryBadge: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border-indigo-500/30',
      duration: '15:10 นาที',
      date: 'ปีการศึกษา 2568',
      indicator: 'ตัวชี้วัด 1.4 การสร้างและหรือพัฒนาสื่อ นวัตกรรม',
      description: 'การสาธิตการใช้ Thinking Whiteboard ชุดฝึกทักษะวิชาชีพ และการประยุกต์ใช้ปัญญาประดิษฐ์ (AI) ในการออกแบบชิ้นงานของนักเรียน',
      isCustom: false
    }
  ],

  // ดึง Video ID จาก URL รูปแบบต่างๆ ของ YouTube
  extractYouTubeId(url) {
    if (!url) return null;
    const str = url.trim();
    // ถ้าใส่เป็น ID 11 ตัวอักษรมาตรงๆ
    if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
      return str;
    }
    // ดึงจาก URL รูปแบบต่างๆ: watch?v=, youtu.be/, embed/, shorts/
    const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/i;
    const match = str.match(regExp);
    return match ? match[1] : null;
  },

  // ดึงรายการวิดีโอทั้งหมดจาก localStorage หรือ config หรือ fallback เป็น default
  getAllVideos() {
    // 1. ตรวจสอบว่าใน window.PAFOLIO_CONFIG มี DEFAULT_YOUTUBE_VIDEOS กำหนดไว้หรือไม่
    const configVideos = (typeof window !== 'undefined' && window.PAFOLIO_CONFIG && Array.isArray(window.PAFOLIO_CONFIG.DEFAULT_YOUTUBE_VIDEOS))
      ? window.PAFOLIO_CONFIG.DEFAULT_YOUTUBE_VIDEOS
      : null;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[YouTubeShowcase] Error reading localStorage:', e);
    }
    return (configVideos && configVideos.length > 0) ? configVideos : [...this.defaultVideos];
  },

  // บันทึกลง localStorage พร้อมซิงก์ขึ้น Google Drive ทันที
  saveVideos(videos, syncToCloud = true) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(videos));
    } catch (e) {
      console.error('[YouTubeShowcase] Failed to save to localStorage:', e);
    }

    // ซิงก์ขึ้น Google Drive ทันทีเพื่อให้ทุกอุปกรณ์เห็นคลิปตรงกัน 100%
    if (syncToCloud && typeof DriveSync !== 'undefined' && typeof DriveSync.saveCloudState === 'function') {
      DriveSync.saveCloudState({ youtubeVideos: videos }).then(res => {
        if (res) console.log('[YouTubeShowcase] Auto-synced videos to Google Drive Cloud State successfully');
      }).catch(err => {
        console.warn('[YouTubeShowcase] Cloud sync background warning:', err);
      });
    }
  },

  // ดึงวิดีโอที่กำลังถูกเลือกในโรงละคร (Active Video)
  getActiveVideo() {
    const videos = this.getAllVideos();
    if (!this.activeVideoId && videos.length > 0) {
      this.activeVideoId = videos[0].id;
    }
    return videos.find(v => v.id === this.activeVideoId) || videos[0] || null;
  },

  // สลับวิดีโอที่กำลังเล่น
  selectVideo(id, shouldScroll = false) {
    this.activeVideoId = id;
    this.renderShowcaseUI();

    if (shouldScroll) {
      const section = document.getElementById('video-showcase');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  },

  // ตั้งค่าตัวกรองหมวดหมู่
  setCategory(cat, btnEl) {
    this.activeCategory = cat;
    
    // อัปเดตสถานะปุ่ม Tab
    const buttons = document.querySelectorAll('.yt-filter-btn');
    buttons.forEach(b => {
      b.classList.remove('active', 'bg-rose-600', 'text-white', 'shadow-md');
      b.classList.add('bg-slate-100', 'text-slate-700', 'hover:bg-slate-200');
    });
    if (btnEl) {
      btnEl.classList.remove('bg-slate-100', 'text-slate-700', 'hover:bg-slate-200');
      btnEl.classList.add('active', 'bg-rose-600', 'text-white', 'shadow-md');
    }

    this.renderCardsGrid();
  },

  // ค้นหา
  setSearch(query) {
    this.searchQuery = (query || '').trim().toLowerCase();
    this.renderCardsGrid();
  },

  // เรนเดอร์หน้าจอพื้นที่นำเสนอคลิปวิดีโอทั้งหมด
  renderShowcaseUI() {
    const container = document.getElementById('video-showcase-container');
    if (!container) return;

    const allVideos = this.getAllVideos();
    const activeVideo = this.getActiveVideo();

    if (!activeVideo) {
      container.innerHTML = `
        <div class="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
          <i class="fa-brands fa-youtube text-5xl text-rose-500 mb-4 animate-bounce"></i>
          <h3 class="text-lg font-bold text-slate-800">ยังไม่มีคลิปวิดีโอในระบบ</h3>
          <p class="text-xs text-slate-500 mt-1 mb-4">คลิกปุ่มด้านบนเพื่อเพิ่มลิงก์คลิปวิดีโอ YouTube ของคุณ</p>
          <button onclick="YouTubeShowcase.openAddModal()" class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-md">
            <i class="fa-solid fa-plus mr-1.5"></i> เพิ่มคลิป YouTube แรก
          </button>
        </div>
      `;
      return;
    }

    // อัปเดตป้ายจำนวนคลิปทั้งหมด
    const countBadge = document.getElementById('yt-total-badge');
    if (countBadge) {
      countBadge.innerText = `${allVideos.length} คลิป`;
    }

    // เรนเดอร์ Theater Player + Info Panel ด้านบน
    const theaterEl = document.getElementById('yt-theater-screen');
    if (theaterEl) {
      theaterEl.innerHTML = `
        <div class="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-black border border-slate-800 group">
          <iframe 
            id="yt-active-iframe"
            class="w-full h-full"
            src="https://www.youtube-nocookie.com/embed/${activeVideo.videoId}?rel=0&modestbranding=1&enablejsapi=1" 
            title="${activeVideo.title}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen>
          </iframe>
        </div>

        <!-- รายละเอียดคลิปวิดีโอหลัก -->
        <div class="mt-5 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div class="space-y-2.5 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-3 py-1 rounded-full text-xs font-bold border ${activeVideo.categoryBadge || 'bg-rose-500/20 text-rose-600 border-rose-500/30'}">
                <i class="fa-brands fa-youtube mr-1 text-red-600"></i> ${activeVideo.categoryThai}
              </span>
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                <i class="fa-regular fa-clock mr-1 text-slate-500"></i> ${activeVideo.duration || 'ไม่ระบุเวลา'}
              </span>
              ${activeVideo.indicator ? `
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                  <i class="fa-solid fa-list-check mr-1 text-teal-600"></i> ${activeVideo.indicator}
                </span>
              ` : ''}
              ${activeVideo.isCustom ? `
                <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  <i class="fa-solid fa-user-pen mr-1"></i> ผู้ใช้เพิ่มเอง
                </span>
              ` : ''}
            </div>

            <h3 class="text-xl sm:text-2xl font-bold font-heading text-slate-900 leading-snug">
              ${activeVideo.title}
            </h3>

            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
              ${activeVideo.description || 'ไม่มีคำอธิบายเพิ่มเติม'}
            </p>

            <div class="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span><i class="fa-regular fa-calendar mr-1"></i> ${activeVideo.date || 'ปีการศึกษา 2568'}</span>
              <span>•</span>
              <span class="font-mono text-[11px] text-slate-500">Video ID: ${activeVideo.videoId}</span>
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div class="flex items-center md:flex-col gap-2 flex-shrink-0 pt-2 md:pt-0">
            <a href="https://www.youtube.com/watch?v=${activeVideo.videoId}" target="_blank" rel="noopener noreferrer" 
               class="flex-1 md:w-full px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-heading transition flex items-center justify-center gap-1.5 shadow-sm shadow-red-500/20"
               title="เปิดดูบนเว็บไซต์ YouTube ในแท็บใหม่">
              <i class="fa-brands fa-youtube text-base"></i>
              <span>ดูบน YouTube</span>
            </a>
            
            <button onclick="PresentationDeck.open('pres-youtube')" 
                    class="flex-1 md:w-full px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-400/40 text-xs font-semibold font-heading transition flex items-center justify-center gap-1.5"
                    title="เปิดคลิปนี้ในโหมดนำเสนอสไลด์เต็มจอ">
              <i class="fa-solid fa-tv text-amber-400"></i>
              <span>โหมดนำเสนอ</span>
            </button>

            ${activeVideo.isCustom ? `
              <button onclick="YouTubeShowcase.deleteVideo('${activeVideo.id}')" 
                      class="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition flex items-center justify-center gap-1"
                      title="ลบคลิปวิดีโอนี้ออกจากระบบ">
                <i class="fa-regular fa-trash-can"></i>
                <span class="hidden sm:inline">ลบคลิป</span>
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }

    // เรนเดอร์การ์ดคลิปอื่นๆ ด้านล่าง
    this.renderCardsGrid();
  },

  // เรนเดอร์รายการการ์ดวิดีโอ (ตามหมวดหมู่และการค้นหา)
  renderCardsGrid() {
    const gridEl = document.getElementById('yt-cards-grid');
    if (!gridEl) return;

    const allVideos = this.getAllVideos();
    const activeVideo = this.getActiveVideo();

    // กรองตามหมวดหมู่
    let filtered = allVideos;
    if (this.activeCategory !== 'all') {
      filtered = filtered.filter(v => v.category === this.activeCategory);
    }

    // กรองตามคำค้นหา
    if (this.searchQuery) {
      filtered = filtered.filter(v => 
        (v.title && v.title.toLowerCase().includes(this.searchQuery)) ||
        (v.description && v.description.toLowerCase().includes(this.searchQuery)) ||
        (v.indicator && v.indicator.toLowerCase().includes(this.searchQuery)) ||
        (v.categoryThai && v.categoryThai.toLowerCase().includes(this.searchQuery))
      );
    }

    // อัปเดตตัวเลขผลลัพธ์
    const countSpan = document.getElementById('yt-filter-count');
    if (countSpan) {
      countSpan.innerText = `${filtered.length} รายการ`;
    }

    if (filtered.length === 0) {
      gridEl.innerHTML = `
        <div class="col-span-full py-12 text-center text-slate-400 bg-slate-50/80 rounded-2xl border border-slate-200">
          <i class="fa-solid fa-video-slash text-3xl mb-2 text-slate-300"></i>
          <p class="text-xs font-semibold">ไม่พบคลิปวิดีโอที่ตรงกับเงื่อนไขการค้นหา</p>
          <button onclick="YouTubeShowcase.setCategory('all'); document.getElementById('yt-search-input').value='';" class="mt-2 text-xs text-rose-600 underline hover:text-rose-700">
            ล้างตัวกรองและแสดงทั้งหมด
          </button>
        </div>
      `;
      return;
    }

    gridEl.innerHTML = filtered.map(v => {
      const isActive = activeVideo && activeVideo.id === v.id;
      const thumbUrl = `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`;

      return `
        <div class="group relative bg-white rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer ${
          isActive 
            ? 'border-rose-500 ring-2 ring-rose-500/30 shadow-lg shadow-rose-500/10 -translate-y-1' 
            : 'border-slate-200 hover:border-rose-300 hover:shadow-md hover:-translate-y-0.5'
        }" onclick="YouTubeShowcase.selectVideo('${v.id}', true)">
          
          <!-- Video Thumbnail with Play Overlay -->
          <div class="relative aspect-video w-full overflow-hidden bg-slate-900">
            <img src="${thumbUrl}" 
                 alt="${v.title}" 
                 class="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500">
            
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-between p-3">
              <span class="px-2 py-0.5 rounded-md text-[11px] font-bold bg-black/75 text-white backdrop-blur-sm">
                <i class="fa-regular fa-clock mr-1 text-slate-300"></i>${v.duration || 'วิดีโอ'}
              </span>
              
              ${isActive ? `
                <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-600 text-white flex items-center gap-1 shadow">
                  <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span> กำลังเล่น
                </span>
              ` : ''}
            </div>

            <!-- Play Button Hover Icon -->
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 transition duration-300">
              <div class="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition duration-200">
                <i class="fa-solid fa-play text-base ml-1"></i>
              </div>
            </div>
          </div>

          <!-- Video Card Content -->
          <div class="p-4 flex flex-col justify-between h-[160px]">
            <div>
              <div class="flex items-center justify-between gap-1 mb-1.5">
                <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${v.categoryBadge || 'bg-rose-50 text-rose-700'} truncate">
                  ${v.categoryThai}
                </span>
                ${v.isCustom ? `
                  <button onclick="event.stopPropagation(); YouTubeShowcase.deleteVideo('${v.id}')" 
                          class="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition"
                          title="ลบคลิปนี้">
                    <i class="fa-regular fa-trash-can text-xs"></i>
                  </button>
                ` : ''}
              </div>

              <h4 class="font-heading font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-rose-600 transition">
                ${v.title}
              </h4>

              <p class="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                ${v.description || 'ไม่มีคำอธิบาย'}
              </p>
            </div>

            <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <span class="truncate max-w-[140px]"><i class="fa-solid fa-tag text-teal-600 mr-1"></i>${v.indicator || 'ว.PA'}</span>
              <span class="text-rose-600 font-bold group-hover:underline flex items-center gap-0.5">
                คลิกรับชม <i class="fa-solid fa-chevron-right text-[9px]"></i>
              </span>
            </div>
          </div>

        </div>
      `;
    }).join('');
  },

  // ================= 📝 ADD YOUTUBE LINK MODAL CONTROLLER =================

  // เปิด Modal เพิ่มลิงก์วิดีโอ
  openAddModal() {
    const modal = document.getElementById('youtube-add-modal');
    if (!modal) return;

    // รีเซ็ตฟอร์ม
    const form = document.getElementById('youtube-add-form');
    if (form) form.reset();

    const previewBox = document.getElementById('yt-preview-box');
    if (previewBox) {
      previewBox.classList.add('hidden');
      previewBox.innerHTML = '';
    }

    const errorEl = document.getElementById('yt-url-error');
    if (errorEl) errorEl.classList.add('hidden');

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';

    // Focus input
    setTimeout(() => {
      const urlInput = document.getElementById('youtube-input-url');
      if (urlInput) urlInput.focus();
    }, 100);
  },

  // ปิด Modal เพิ่มลิงก์วิดีโอ
  closeAddModal() {
    const modal = document.getElementById('youtube-add-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
  },

  // ตรวจจับเมื่อผู้ใช้พิมพ์หรือวาง URL เพื่อแสดง Thumbnail ทันที
  onUrlInput(url) {
    const errorEl = document.getElementById('yt-url-error');
    const previewBox = document.getElementById('yt-preview-box');
    const titleInput = document.getElementById('youtube-input-title');

    const videoId = this.extractYouTubeId(url);

    if (!videoId) {
      if (url.trim().length > 5) {
        if (errorEl) {
          errorEl.innerText = '⚠️ รูปแบบลิงก์ YouTube ไม่ถูกต้อง (รองรับ youtube.com, youtu.be, shorts)';
          errorEl.classList.remove('hidden');
        }
      } else {
        if (errorEl) errorEl.classList.add('hidden');
      }
      if (previewBox) {
        previewBox.classList.add('hidden');
        previewBox.innerHTML = '';
      }
      return;
    }

    // ลิงก์ถูกต้อง
    if (errorEl) errorEl.classList.add('hidden');

    if (previewBox) {
      previewBox.classList.remove('hidden');
      previewBox.innerHTML = `
        <div class="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <div class="relative w-24 aspect-video rounded-lg overflow-hidden bg-black flex-shrink-0 shadow-sm">
            <img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="Preview" class="w-full h-full object-cover">
            <div class="absolute inset-0 flex items-center justify-center bg-black/20">
              <i class="fa-brands fa-youtube text-red-600 text-lg"></i>
            </div>
          </div>
          <div class="text-xs space-y-0.5 truncate">
            <div class="font-bold text-emerald-800 flex items-center gap-1">
              <i class="fa-solid fa-circle-check text-emerald-600"></i> พบวิดีโอ YouTube แล้ว
            </div>
            <div class="text-slate-600 font-mono text-[11px]">Video ID: ${videoId}</div>
            <div class="text-[10px] text-slate-400">ภาพขนาดย่อและตัวอย่างพร้อมแสดงผล</div>
          </div>
        </div>
      `;
    }

    // ถ้าผู้ใช้ยังไม่ได้กรอกชื่อคลิป ให้เสนอชื่อเริ่มต้นตามหมวด
    if (titleInput && !titleInput.value.trim()) {
      const categorySelect = document.getElementById('youtube-input-category');
      const catText = categorySelect ? categorySelect.options[categorySelect.selectedIndex].text : '';
      titleInput.placeholder = `เช่น ${catText} รายวิชา...`;
    }
  },

  // บันทึกคลิปวิดีโอใหม่
  saveNewVideo(event) {
    if (event) event.preventDefault();

    const urlInput = document.getElementById('youtube-input-url');
    const titleInput = document.getElementById('youtube-input-title');
    const categorySelect = document.getElementById('youtube-input-category');
    const durationInput = document.getElementById('youtube-input-duration');
    const indicatorInput = document.getElementById('youtube-input-indicator');
    const descInput = document.getElementById('youtube-input-desc');
    const dateInput = document.getElementById('youtube-input-date');

    const url = urlInput ? urlInput.value.trim() : '';
    const videoId = this.extractYouTubeId(url);

    if (!videoId) {
      alert('กรุณากรอกลิงก์ YouTube ที่ถูกต้อง เช่น https://www.youtube.com/watch?v=...');
      if (urlInput) urlInput.focus();
      return false;
    }

    const category = categorySelect ? categorySelect.value : 'other';
    const categoryTextMap = {
      teaching: { thai: 'คลิปจัดการเรียนรู้ 60 นาที', badge: 'bg-rose-500/20 text-rose-600 border-rose-500/30' },
      inspiration: { thai: 'คลิปสภาพปัญหา/แรงบันดาลใจ 10 นาที', badge: 'bg-amber-500/20 text-amber-600 border-amber-500/30' },
      outcome: { thai: 'ผลลัพธ์การเรียนรู้ของผู้เรียน', badge: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30' },
      innovation: { thai: 'สื่อนวัตกรรมการจัดการเรียนรู้', badge: 'bg-indigo-500/20 text-indigo-600 border-indigo-500/30' },
      other: { thai: 'คลิปนำเสนอผลงาน ว.PA', badge: 'bg-teal-500/20 text-teal-600 border-teal-500/30' }
    };

    const catMeta = categoryTextMap[category] || categoryTextMap.other;
    const title = (titleInput && titleInput.value.trim()) || `คลิป${catMeta.thai}`;
    const duration = (durationInput && durationInput.value.trim()) || 'ไม่ระบุ';
    const indicator = (indicatorInput && indicatorInput.value.trim()) || '';
    const description = (descInput && descInput.value.trim()) || '';
    const date = (dateInput && dateInput.value.trim()) || `ปีการศึกษา 2568`;

    const newVideo = {
      id: 'yt-custom-' + Date.now(),
      youtubeUrl: url,
      videoId: videoId,
      title: title,
      category: category,
      categoryThai: catMeta.thai,
      categoryBadge: catMeta.badge,
      duration: duration,
      date: date,
      indicator: indicator,
      description: description,
      isCustom: true
    };

    const currentVideos = this.getAllVideos();
    // เพิ่มไว้ที่ลำดับแรกสุด
    currentVideos.unshift(newVideo);
    this.saveVideos(currentVideos, true);

    // สลับไปเล่นคลิปใหม่ทันที
    this.activeVideoId = newVideo.id;
    this.closeAddModal();
    this.renderShowcaseUI();

    // แสดงการแจ้งเตือนความสำเร็จพร้อมยืนยันการซิงก์ Cloud
    if (typeof DriveSync !== 'undefined' && typeof DriveSync.showToast === 'function') {
      DriveSync.showToast(`✅ บันทึกคลิป "${title}" และซิงก์ขึ้น Google Drive แล้ว! (ทุกอุปกรณ์จะเห็นตรงกัน)`, 'success', 4500);
    } else {
      alert(`บันทึกคลิปวิดีโอ YouTube "${title}" สำเร็จ!`);
    }

    // เลื่อนหน้าจอมายังส่วนจัดแสดงคลิป
    const section = document.getElementById('video-showcase');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    return false;
  },

  // ลบคลิปวิดีโอ
  deleteVideo(id) {
    const allVideos = this.getAllVideos();
    const target = allVideos.find(v => v.id === id);
    if (!target) return;

    if (!confirm(`คุณต้องการลบคลิป "${target.title}" ออกจากระบบพอร์ตโฟลิโอใช่หรือไม่?`)) {
      return;
    }

    const updated = allVideos.filter(v => v.id !== id);
    this.saveVideos(updated, true);

    if (this.activeVideoId === id) {
      this.activeVideoId = updated.length > 0 ? updated[0].id : null;
    }

    this.renderShowcaseUI();

    if (typeof DriveSync !== 'undefined' && typeof DriveSync.showToast === 'function') {
      DriveSync.showToast('ลบคลิปวิดีโอและซิงก์สถานะล่าสุดแล้ว', 'info', 3000);
    }
  },

  // รีเซ็ตกลับเป็นคลิปตัวอย่างมาตรฐาน
  resetToDefaults() {
    if (!confirm('ต้องการคืนค่ารายการคลิปวิดีโอเป็นคลิปตัวอย่างมาตรฐาน ว.PA ใช่หรือไม่? (คลิปที่คุณเพิ่มเองจะถูกลบออก)')) {
      return;
    }
    localStorage.removeItem(this.storageKey);
    const defaults = [...this.defaultVideos];
    this.saveVideos(defaults, true);
    this.activeVideoId = defaults[0].id;
    this.renderShowcaseUI();

    if (typeof DriveSync !== 'undefined' && typeof DriveSync.showToast === 'function') {
      DriveSync.showToast('คืนค่าคลิปตัวอย่างมาตรฐานเรียบร้อยแล้ว', 'success', 3000);
    }
  },

  // ☁️ บังคับซิงก์ข้อมูลคลิปวิดีโอล่าสุดจาก Google Drive ศูนย์กลางทันที
  async syncWithGoogleDrive() {
    if (typeof DriveSync === 'undefined' || !DriveSync.config || !DriveSync.config.appsScriptUrl) {
      alert('ยังไม่ได้ระบุ Google Apps Script URL ในระบบ ไม่สามารถดึงข้อมูลจาก Cloud ได้');
      return;
    }

    if (typeof DriveSync.showToast === 'function') {
      DriveSync.showToast('⏳ กำลังดึงรายการคลิปวิดีโอจาก Google Drive...', 'info', 2000);
    }

    try {
      const res = await DriveSync.fetchCloudState();
      if (res && res.cloudState && Array.isArray(res.cloudState.youtubeVideos) && res.cloudState.youtubeVideos.length > 0) {
        localStorage.setItem(this.storageKey, JSON.stringify(res.cloudState.youtubeVideos));
        this.activeVideoId = res.cloudState.youtubeVideos[0].id;
        this.renderShowcaseUI();
        if (typeof DriveSync.showToast === 'function') {
          DriveSync.showToast(`✅ ซิงก์คลิปวิดีโอสำเร็จ! พบ ${res.cloudState.youtubeVideos.length} คลิปจาก Google Drive`, 'success', 4000);
        }
      } else {
        if (typeof DriveSync.showToast === 'function') {
          DriveSync.showToast('ℹ️ ไม่พบข้อมูลคลิปสำรองบน Google Drive (หรือยังไม่เคยมีการซิงก์)', 'info', 3500);
        }
      }
    } catch(err) {
      console.error('syncWithGoogleDrive error:', err);
      if (typeof DriveSync.showToast === 'function') {
        DriveSync.showToast('⚠️ เกิดข้อผิดพลาดในการเชื่อมต่อ Google Drive', 'error', 3500);
      }
    }
  },

  // 📥 ดาวน์โหลดไฟล์สำรองรายการคลิปเป็น JSON
  exportVideosJson() {
    const videos = this.getAllVideos();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(videos, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pafolio_youtube_videos_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    if (typeof DriveSync !== 'undefined' && typeof DriveSync.showToast === 'function') {
      DriveSync.showToast('📥 ดาวน์โหลดไฟล์สำรองรายการคลิปวิดีโอเรียบร้อยแล้ว', 'success', 3000);
    }
  },

  // 📤 นำเข้ารายการคลิปจากไฟล์ JSON
  importVideosJson(event) {
    const file = event && event.target && event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.saveVideos(parsed, true);
          this.activeVideoId = parsed[0].id;
          this.renderShowcaseUI();
          if (typeof DriveSync !== 'undefined' && typeof DriveSync.showToast === 'function') {
            DriveSync.showToast(`✅ นำเข้ารายการคลิปสำเร็จ (${parsed.length} คลิป) พร้อมซิงก์ขึ้น Google Drive แล้ว!`, 'success', 4500);
          }
        } else {
          alert('รูปแบบข้อมูลในไฟล์ JSON ไม่ถูกต้อง');
        }
      } catch(err) {
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์ JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }
};
