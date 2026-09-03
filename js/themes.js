/**
 * PAFolio - Design System & Theme Engine v5.0
 * จัดการ 11 ธีมพรีเมียมสำหรับหน้าเว็บและสไลด์นำเสนอ (Presentation Deck)
 */

const ThemeEngine = {
  activeThemeId: localStorage.getItem('pafolio_active_theme') || 'emerald',

  // รายการ 11 ธีมพรีเมียม
  themes: {
    emerald: {
      id: 'emerald',
      name: 'Executive Emerald',
      nameThai: 'เขียวมรกต & นกยูงทอง (ค่าเริ่มต้น)',
      badge: 'มรกตหรูหรา',
      description: 'เขียวมรกตสุขุม ทรงคุณค่า ตัดสีทองคำ เหมาะสำหรับผู้บริหารและงานวิชาการ',
      primaryHex: '#0f766e',
      secondaryHex: '#14b8a6',
      accentHex: '#f59e0b',
      bgDarkHex: '#042f2e',
      cardBgHex: '#134e4a',
      gradient: 'from-teal-900 via-slate-900 to-slate-950',
      slideBg: 'radial-gradient(circle at 50% 20%, #134e4a 0%, #0f172a 60%, #020617 100%)',
      previewBg: 'bg-gradient-to-r from-teal-700 to-emerald-600',
      tagColor: 'teal'
    },
    navy: {
      id: 'navy',
      name: 'Royal Navy & Gold',
      nameThai: 'กรมท่าราชการ & ทองคำแท้',
      badge: 'ราชการภูมิฐาน',
      description: 'น้ำเงินกรมท่าเข้มตัดเส้นขอบทองคำแท้ ภูมิฐาน น่าเชื่อถือ สูงส่ง',
      primaryHex: '#1e3a8a',
      secondaryHex: '#3b82f6',
      accentHex: '#fbbf24',
      bgDarkHex: '#0f172a',
      cardBgHex: '#1e293b',
      gradient: 'from-blue-950 via-slate-900 to-slate-950',
      slideBg: 'radial-gradient(circle at 50% 20%, #1e3a8a 0%, #0f172a 60%, #020617 100%)',
      previewBg: 'bg-gradient-to-r from-blue-900 to-indigo-700',
      tagColor: 'blue'
    },
    gold: {
      id: 'gold',
      name: 'Luxury Imperial Gold',
      nameThai: 'ทองคำจักรพรรดิ & หินชนวนดำ',
      badge: 'พรีเมียมระดับผู้นำ',
      description: 'ทองคำแชมเปญตัดพื้นหลังหินชนวนดำ พรีเมียมระดับรางวัลชนะเลิศ',
      primaryHex: '#d97706',
      secondaryHex: '#fbbf24',
      accentHex: '#fef08a',
      bgDarkHex: '#18181b',
      cardBgHex: '#27272a',
      gradient: 'from-amber-950 via-stone-900 to-zinc-950',
      slideBg: 'radial-gradient(circle at 50% 20%, #78350f 0%, #18181b 60%, #09090b 100%)',
      previewBg: 'bg-gradient-to-r from-amber-600 to-yellow-500',
      tagColor: 'amber'
    },
    cyber: {
      id: 'cyber',
      name: 'Cyber Glassmorphism',
      nameThai: 'ไซเบอร์นีออน & กระจกฝ้าล้ำยุค',
      badge: 'ดิจิทัลแห่งอนาคต',
      description: 'สีฟ้าเทอร์ควอยซ์และนีออนไซเบอร์ ล้ำสมัยด้วยเอฟเฟกต์กระจกฝ้า',
      primaryHex: '#0284c7',
      secondaryHex: '#06b6d4',
      accentHex: '#a855f7',
      bgDarkHex: '#030712',
      cardBgHex: '#0f172a',
      gradient: 'from-cyan-950 via-slate-900 to-black',
      slideBg: 'radial-gradient(circle at 50% 20%, #0369a1 0%, #020617 60%, #000000 100%)',
      previewBg: 'bg-gradient-to-r from-cyan-600 to-blue-600',
      tagColor: 'cyan'
    },
    indigo: {
      id: 'indigo',
      name: 'Modern Violet & Indigo',
      nameThai: 'ม่วงไวโอเล็ต & นวัตกรรมดิจิทัล',
      badge: 'สายนวัตกรรม',
      description: 'ม่วงครามและครามเข้ม สำหรับสายนวัตกรรม งานวิจัย และไอที',
      primaryHex: '#4f46e5',
      secondaryHex: '#8b5cf6',
      accentHex: '#ec4899',
      bgDarkHex: '#1e1b4b',
      cardBgHex: '#312e81',
      gradient: 'from-indigo-950 via-slate-900 to-slate-950',
      slideBg: 'radial-gradient(circle at 50% 20%, #3730a3 0%, #0f172a 60%, #020617 100%)',
      previewBg: 'bg-gradient-to-r from-indigo-700 to-purple-600',
      tagColor: 'indigo'
    },
    crimson: {
      id: 'crimson',
      name: 'Crimson Ruby & Rose',
      nameThai: 'แดงทับทิม & คริปโซ่หรูหรา',
      badge: 'วิชาการเข้มข้น',
      description: 'แดงทับทิมหรูหรา สำหรับผู้บริหารและงานวิชาการเข้มข้น มีพลังน่าเกรงขาม',
      primaryHex: '#be123c',
      secondaryHex: '#f43f5e',
      accentHex: '#fbbf24',
      bgDarkHex: '#4c0519',
      cardBgHex: '#881337',
      gradient: 'from-rose-950 via-slate-900 to-slate-950',
      slideBg: 'radial-gradient(circle at 50% 20%, #881337 0%, #1e1b4b 60%, #020617 100%)',
      previewBg: 'bg-gradient-to-r from-rose-800 to-red-600',
      tagColor: 'rose'
    },
    amber: {
      id: 'amber',
      name: 'Sunset Amber & Bronze',
      nameThai: 'ส้มอำพัน & บรอนซ์ทองอบอุ่น',
      badge: 'อบอุ่นมีพลัง',
      description: 'ส้มอำพันและบรอนซ์ทอง อบอุ่น ทรงพลัง ส่งเสริมความคิดสร้างสรรค์',
      primaryHex: '#c2410c',
      secondaryHex: '#f97316',
      accentHex: '#facc15',
      bgDarkHex: '#431407',
      cardBgHex: '#7c2d12',
      gradient: 'from-orange-950 via-slate-900 to-slate-950',
      slideBg: 'radial-gradient(circle at 50% 20%, #7c2d12 0%, #18181b 60%, #09090b 100%)',
      previewBg: 'bg-gradient-to-r from-orange-700 to-amber-500',
      tagColor: 'orange'
    },
    mint: {
      id: 'mint',
      name: 'Forest Mint & Leaf',
      nameThai: 'เขียวมิ้นต์ & ธรรมชาติสดชื่น',
      badge: 'สดใสสบายตา',
      description: 'เขียวมิ้นต์ธรรมชาติและขาวคลีน สดใส สบายตา ดูเป็นมิตรและกระตือรือร้น',
      primaryHex: '#059669',
      secondaryHex: '#10b981',
      accentHex: '#34d399',
      bgDarkHex: '#064e3b',
      cardBgHex: '#065f46',
      gradient: 'from-emerald-950 via-slate-900 to-slate-950',
      slideBg: 'radial-gradient(circle at 50% 20%, #065f46 0%, #0f172a 60%, #020617 100%)',
      previewBg: 'bg-gradient-to-r from-emerald-600 to-teal-500',
      tagColor: 'emerald'
    },
    rose: {
      id: 'rose',
      name: 'Rose Quartz & Peach',
      nameThai: 'ชมพูโรสควอตซ์ & พีชสุภาพ',
      badge: 'อ่อนโยนสร้างสรรค์',
      description: 'ชมพูพาสเทลและพีชสุภาพ อ่อนโยน สำหรับสายปฐมวัย ประถมศึกษา และศิลปะ',
      primaryHex: '#db2777',
      secondaryHex: '#f472b6',
      accentHex: '#fb7185',
      bgDarkHex: '#500724',
      cardBgHex: '#831843',
      gradient: 'from-pink-950 via-slate-900 to-slate-950',
      slideBg: 'radial-gradient(circle at 50% 20%, #831843 0%, #0f172a 60%, #020617 100%)',
      previewBg: 'bg-gradient-to-r from-pink-600 to-rose-400',
      tagColor: 'pink'
    },
    obsidian: {
      id: 'obsidian',
      name: 'Midnight Obsidian Dark',
      nameThai: 'มิดไนท์ดำสนิท & นีออนบลู',
      badge: 'Ultra Dark ถนอมสายตา',
      description: 'สีดำสนิทและเทาเข้ม ตัดแสงไฟนีออน ลุ่มลึก คมชัด ถนอมสายตา 100%',
      primaryHex: '#64748b',
      secondaryHex: '#38bdf8',
      accentHex: '#38bdf8',
      bgDarkHex: '#020617',
      cardBgHex: '#0f172a',
      gradient: 'from-slate-950 via-black to-slate-950',
      slideBg: 'radial-gradient(circle at 50% 20%, #0f172a 0%, #020617 60%, #000000 100%)',
      previewBg: 'bg-gradient-to-r from-slate-800 to-zinc-900',
      tagColor: 'slate'
    },
    minimal: {
      id: 'minimal',
      name: 'Minimal Academic Slate',
      nameThai: 'มินิมอลวิชาการ & ขาวคลีน',
      badge: 'วารสารสากล',
      description: 'สีขาว-เทาคลีน มินิมอล เรียบง่าย สไตล์วารสารวิชาการมาตรฐานสากล',
      primaryHex: '#334155',
      secondaryHex: '#64748b',
      accentHex: '#0f766e',
      bgDarkHex: '#1e293b',
      cardBgHex: '#334155',
      gradient: 'from-slate-900 via-gray-900 to-slate-950',
      slideBg: 'radial-gradient(circle at 50% 20%, #334155 0%, #0f172a 60%, #020617 100%)',
      previewBg: 'bg-gradient-to-r from-slate-600 to-gray-500',
      tagColor: 'gray'
    }
  },

  // ดึงข้อมูลธีมปัจจุบัน
  getCurrentTheme() {
    return this.themes[this.activeThemeId] || this.themes['emerald'];
  },

  // ตั้งค่าธีมและปรับใช้ทั่วทั้งระบบ (Web UI & Presentation Slide Deck)
  setTheme(themeId, showToast = true) {
    if (!this.themes[themeId]) themeId = 'emerald';
    this.activeThemeId = themeId;
    localStorage.setItem('pafolio_active_theme', themeId);

    const theme = this.themes[themeId];
    document.documentElement.setAttribute('data-theme', themeId);

    // ปรับ CSS Variables
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.primaryHex);
    root.style.setProperty('--theme-secondary', theme.secondaryHex);
    root.style.setProperty('--theme-accent', theme.accentHex);
    root.style.setProperty('--theme-bg-dark', theme.bgDarkHex);
    root.style.setProperty('--theme-card-bg', theme.cardBgHex);
    root.style.setProperty('--theme-slide-bg', theme.slideBg);

    // ปรับพื้นหลังสไลด์นำเสนอถ้าเปิดอยู่
    const presStage = document.getElementById('presentation-deck-modal');
    if (presStage) {
      presStage.style.background = theme.slideBg;
    }

    // อัปเดต UI Dropdown/Buttons
    this.updateThemeUI();

    // รีเฟรชสไลด์นำเสนอถ้าเปิดอยู่
    if (typeof PresentationDeck !== 'undefined' && PresentationDeck.isOpen) {
      PresentationDeck.renderSlideContent();
    }

    // อัปเดตชาร์ตถ้ามี
    if (typeof updateChartsTheme === 'function') {
      updateChartsTheme(theme);
    }

    if (showToast && typeof DriveSync !== 'undefined' && DriveSync.showToast) {
      DriveSync.showToast(`เปลี่ยนธีมเป็น "${theme.nameThai}" เรียบร้อยแล้ว`, 'success', 3000);
    }
  },

  // อัปเดตสถานะปุ่มและตัวเลือกใน UI
  updateThemeUI() {
    const current = this.getCurrentTheme();
    
    // อัปเดตข้อความปุ่มใน Navbar / Topbar
    document.querySelectorAll('.current-theme-name-label').forEach(el => {
      el.innerText = current.nameThai.split(' ')[0];
    });

    // อัปเดตสถานะ Active ใน Modal เลือกธีม
    document.querySelectorAll('.theme-select-card').forEach(card => {
      const tid = card.getAttribute('data-theme-id');
      if (tid === this.activeThemeId) {
        card.classList.add('ring-2', 'ring-teal-400', 'border-teal-500', 'bg-teal-50/20');
        const check = card.querySelector('.theme-check-icon');
        if (check) check.classList.remove('hidden');
      } else {
        card.classList.remove('ring-2', 'ring-teal-400', 'border-teal-500', 'bg-teal-50/20');
        const check = card.querySelector('.theme-check-icon');
        if (check) check.classList.add('hidden');
      }
    });
  },

  // สร้าง HTML สำหรับรายการเลือกธีมใน Modal
  renderThemeCardsHTML() {
    return Object.values(this.themes).map(t => {
      const isCurrent = t.id === this.activeThemeId;
      return `
        <div onclick="ThemeEngine.setTheme('${t.id}')" data-theme-id="${t.id}"
             class="theme-select-card group relative p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer bg-slate-900/60 hover:bg-slate-800/80 border-slate-700/80 hover:border-teal-400/80 hover:scale-[1.02] shadow-sm ${isCurrent ? 'ring-2 ring-teal-400 border-teal-500 bg-teal-950/40' : ''}">
          
          <div class="flex items-center gap-3 mb-2.5">
            <!-- Theme Color Swatch Preview -->
            <div class="w-10 h-10 rounded-xl ${t.previewBg} shadow-md flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ring-2 ring-white/10">
              <span class="opacity-90">PA</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-heading font-bold text-slate-100 text-xs sm:text-sm truncate flex items-center gap-1.5">
                <span>${t.name}</span>
                <span class="theme-check-icon text-teal-400 text-xs ${isCurrent ? '' : 'hidden'}"><i class="fa-solid fa-circle-check"></i></span>
              </div>
              <div class="text-[11px] text-teal-400 font-medium truncate">${t.nameThai}</div>
            </div>
          </div>

          <p class="text-[11px] text-slate-400 leading-snug line-clamp-2 mb-2">${t.description}</p>

          <div class="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px]">
            <span class="px-2 py-0.5 rounded-md bg-white/10 text-slate-300 font-sans">${t.badge}</span>
            <div class="flex gap-1">
              <span class="w-3 h-3 rounded-full border border-black/20" style="background-color: ${t.primaryHex};"></span>
              <span class="w-3 h-3 rounded-full border border-black/20" style="background-color: ${t.secondaryHex};"></span>
              <span class="w-3 h-3 rounded-full border border-black/20" style="background-color: ${t.accentHex};"></span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  // เริ่มต้นระบบ Theme เมื่อโหลดหน้าเว็บ
  init() {
    this.setTheme(this.activeThemeId, false);
  }
};

// เริ่มต้นทันที
ThemeEngine.init();
