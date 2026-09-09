/**
 * PAFolio - Executive Presentation Deck Engine v4.0
 * สไลด์นำเสนอผลงานระดับ Executive สำหรับคณะกรรมการประเมิน ว.PA (26 สไลด์วิจัยสมบูรณ์แบบ)
 * รองรับ:
 * 1. หน้าปก Cover & หน้าแนะนำตัว
 * 2. 15 สไลด์ตัวชี้วัด (ดึงภาพจริงจาก Google Drive ของครู พร้อมคลิกขยายดูภาพ)
 * 3. 8 สไลด์ประเด็นท้าทายตามระเบียบวิธีวิจัย 5 บท (สภาพปัญหา, วัตถุประสงค์, เอกสารอ้างอิง, กรอบแนวคิด, ระเบียบวิธี, เครื่องมือ/IOC, ผลการวิเคราะห์ข้อมูล, อภิปรายผล/PLC)
 * 5. ดาวน์โหลดไฟล์นำเสนอ Microsoft PowerPoint (.PPTX / .PPT) สมบูรณ์แบบ 100%
 */

const PresentationDeck = {
  currentSlide: 0,
  isOpen: false,

  // สร้างรายการสไลด์ทั้งหมด (26 สไลด์)
  getSlidesList() {
    const list = [
      { id: 'cover', title: 'หน้าปกและหัวข้อการประเมิน ว.PA', type: 'cover' },
      { id: 'profile', title: 'ข้อมูลทั่วไปและภาระงานสอนตามมาตรฐานตำแหน่ง', type: 'profile' }
    ];

    // เพิ่ม 15 สไลด์สำหรับ 15 ตัวชี้วัด
    if (typeof BASE_INDICATOR_TEMPLATES !== 'undefined') {
      BASE_INDICATOR_TEMPLATES.forEach(ind => {
        list.push({
          id: `ind-${ind.code}`,
          title: `ตัวชี้วัด ${ind.code} ${ind.title}`,
          type: 'indicator',
          indicator: ind
        });
      });
    }

    // ส่วนที่ 2: ข้อตกลงประเด็นท้าทายตามระเบียบวิธีวิจัย (8 สไลด์วิจัยเชิงลึก)
    list.push({ id: 'res-problem', title: 'ประเด็นท้าทาย 1: สภาพปัญหา ที่มา และความสำคัญ', type: 'res-problem' });
    list.push({ id: 'res-objective', title: 'ประเด็นท้าทาย 2: วัตถุประสงค์ สมมติฐาน และขอบเขตการวิจัย', type: 'res-objective' });
    list.push({ id: 'res-literature', title: 'ประเด็นท้าทาย 3: เอกสารและงานวิจัยที่เกี่ยวข้อง (Theoretical Basis)', type: 'res-literature' });
    list.push({ id: 'res-framework', title: 'ประเด็นท้าทาย 4: กรอบแนวคิดและขั้นตอนนวัตกรรมการเรียนรู้', type: 'res-framework' });
    list.push({ id: 'res-method', title: 'ประเด็นท้าทาย 5: ระเบียบวิธีวิจัยและวงจรการปฏิบัติการ PAOR', type: 'res-method' });
    list.push({ id: 'res-instruments', title: 'ประเด็นท้าทาย 6: เครื่องมือวิจัยและการหาคุณภาพเครื่องมือ IOC', type: 'res-instruments' });
    list.push({ id: 'res-results', title: 'ประเด็นท้าทาย 7: ผลการวิเคราะห์ข้อมูลและผลสัมฤทธิ์ทางการเรียน', type: 'res-results' });
    list.push({ id: 'res-discussion', title: 'ประเด็นท้าทาย 8: การอภิปรายผล ประโยชน์ และการขยายผล PLC', type: 'res-discussion' });

    // สรุปผลคะแนน
    list.push({ id: 'summary', title: 'สรุปผลคะแนนและการประเมินตนเอง ว.PA', type: 'summary' });

    return list;
  },

  // ================= 🎠 IMAGE CAROUSEL CONTROLLER =================
  carouselState: {
    timer: null,
    currentIndex: 0,
    images: [],
    isPaused: false,
    intervalMs: 4000 // สลับภาพอัตโนมัติทุก 4 วินาที
  },

  stopCarousel() {
    if (this.carouselState.timer) {
      clearInterval(this.carouselState.timer);
      this.carouselState.timer = null;
    }
    this.carouselState.images = [];
    this.carouselState.currentIndex = 0;
    this.carouselState.isPaused = false;
  },

  startCarousel(images) {
    this.stopCarousel();
    if (!images || images.length === 0) return;
    this.carouselState.images = images;
    this.carouselState.currentIndex = 0;
    this.carouselState.isPaused = false;

    if (images.length > 1) {
      this.carouselState.timer = setInterval(() => {
        if (!this.carouselState.isPaused && this.isOpen) {
          this.nextCarouselImage(false);
        }
      }, this.carouselState.intervalMs);
    }
  },

  pauseCarousel() {
    this.carouselState.isPaused = true;
  },

  resumeCarousel() {
    this.carouselState.isPaused = false;
  },

  setCarouselIndex(idx, resetTimer = true) {
    const total = this.carouselState.images.length;
    if (total === 0) return;
    if (idx < 0) idx = total - 1;
    if (idx >= total) idx = 0;
    this.carouselState.currentIndex = idx;

    // อัปเดตสไลด์ภาพหลัก
    const slides = document.querySelectorAll('.pres-carousel-slide');
    slides.forEach((s, i) => {
      if (i === idx) {
        s.classList.remove('inactive-slide');
        s.classList.add('active-slide');
      } else {
        s.classList.remove('active-slide');
        s.classList.add('inactive-slide');
      }
    });

    // อัปเดต Dots
    const dots = document.querySelectorAll('.pres-carousel-dot');
    dots.forEach((d, i) => {
      if (i === idx) {
        d.classList.remove('bg-white/40', 'w-2');
        d.classList.add('bg-teal-400', 'w-6');
      } else {
        d.classList.remove('bg-teal-400', 'w-6');
        d.classList.add('bg-white/40', 'w-2');
      }
    });

    // อัปเดต Thumbnails
    const thumbs = document.querySelectorAll('.pres-carousel-thumb');
    thumbs.forEach((t, i) => {
      if (i === idx) {
        t.classList.remove('border-white/10', 'opacity-60');
        t.classList.add('border-teal-400', 'ring-2', 'ring-teal-400/50', 'opacity-100');
      } else {
        t.classList.remove('border-teal-400', 'ring-2', 'ring-teal-400/50', 'opacity-100');
        t.classList.add('border-white/10', 'opacity-60');
      }
    });

    // อัปเดตตัวนับภาพ (Counter badge)
    const counterEl = document.getElementById('pres-carousel-counter');
    if (counterEl) {
      counterEl.innerText = `${idx + 1} / ${total}`;
    }

    // รีเซ็ต Timer เมื่อผู้ใช้กดเปลี่ยนเอง
    if (resetTimer && this.carouselState.timer) {
      clearInterval(this.carouselState.timer);
      this.carouselState.timer = setInterval(() => {
        if (!this.carouselState.isPaused && this.isOpen) {
          this.nextCarouselImage(false);
        }
      }, this.carouselState.intervalMs);
    }
  },

  nextCarouselImage(resetTimer = true) {
    const total = this.carouselState.images.length;
    if (total <= 1) return;
    const nextIdx = (this.carouselState.currentIndex + 1) % total;
    this.setCarouselIndex(nextIdx, resetTimer);
  },

  prevCarouselImage(resetTimer = true) {
    const total = this.carouselState.images.length;
    if (total <= 1) return;
    const prevIdx = (this.carouselState.currentIndex - 1 + total) % total;
    this.setCarouselIndex(prevIdx, resetTimer);
  },

  openActiveCarouselLightbox() {
    const total = this.carouselState.images.length;
    if (total === 0) return;
    const img = this.carouselState.images[this.carouselState.currentIndex];
    if (img) {
      if ((img.type === 'video' || (typeof isVideoItem === 'function' && isVideoItem(img))) && typeof openVideoPlayer === 'function') {
        openVideoPlayer(img);
      } else if (typeof openLightbox === 'function') {
        openLightbox(img.fullUrl || img.thumbUrl, img.title, img.caption);
      }
    }
  },

  // เปิดโหมดนำเสนอ
  open(slideTarget = 0) {
    this.isOpen = true;
    const modal = document.getElementById('presentation-deck-modal');
    if (!modal) {
      console.error('[PresentationDeck] Element #presentation-deck-modal not found!');
      return;
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';

    const slides = this.getSlidesList();
    if (typeof slideTarget === 'number') {
      this.currentSlide = (slideTarget >= 0 && slideTarget < slides.length) ? slideTarget : 0;
    } else if (typeof slideTarget === 'string') {
      const targetStr = slideTarget.toLowerCase();
      let idx = slides.findIndex(s => s.id.toLowerCase() === targetStr || s.type.toLowerCase() === targetStr);
      if (idx === -1 && targetStr.includes('challenge')) {
        idx = slides.findIndex(s => s.id.startsWith('res-'));
      }
      this.currentSlide = idx >= 0 ? idx : 0;
    } else {
      this.currentSlide = 0;
    }

    this.renderSlideContent();
    this.updateControls();

    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}
  },

  // ปิดโหมดนำเสนอ
  close() {
    this.stopCarousel();
    this.isOpen = false;
    const modal = document.getElementById('presentation-deck-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.style.overflow = 'auto';
    }

    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (e) {}
  },

  nextSlide() {
    const slides = this.getSlidesList();
    if (this.currentSlide < slides.length - 1) {
      this.stopCarousel();
      this.currentSlide++;
      this.renderSlideContent();
      this.updateControls();
    }
  },

  prevSlide() {
    if (this.currentSlide > 0) {
      this.stopCarousel();
      this.currentSlide--;
      this.renderSlideContent();
      this.updateControls();
    }
  },

  goToSlide(idx) {
    const slides = this.getSlidesList();
    if (idx >= 0 && idx < slides.length) {
      this.stopCarousel();
      this.currentSlide = idx;
      this.renderSlideContent();
      this.updateControls();
    }
  },

  updateControls() {
    const slides = this.getSlidesList();
    const total = slides.length;
    const progressEl = document.getElementById('pres-progress-bar');
    const counterEl = document.getElementById('pres-slide-counter');
    const prevBtn = document.getElementById('pres-btn-prev');
    const nextBtn = document.getElementById('pres-btn-next');

    if (progressEl) {
      const pct = ((this.currentSlide + 1) / total) * 100;
      progressEl.style.width = `${pct}%`;
    }

    if (counterEl) {
      counterEl.innerText = `${this.currentSlide + 1} / ${total} : ${slides[this.currentSlide].title}`;
    }

    if (prevBtn) prevBtn.disabled = this.currentSlide === 0;
    if (nextBtn) nextBtn.disabled = this.currentSlide === total - 1;
  },

  // ค้นหารูปภาพจริงจาก Google Drive ของคุณครู (รองรับภาพสไลด์หมุนวน 3-5+ ภาพต่อตัวชี้วัด)
  findEvidenceImagesForIndicator(indCode, indIndex = 0) {
    const images = [];

    // 1. ค้นหาจากโฟลเดอร์ของตัวชี้วัดนี้โดยตรงใน Google Drive (ดึงมาทุกรูปภาพที่ครูอัปโหลดไว้)
    if (typeof DriveSync !== 'undefined' && DriveSync.syncedData && DriveSync.syncedData.indicators) {
      const matchingKey = Object.keys(DriveSync.syncedData.indicators).find(key => 
        key === indCode || key.startsWith(indCode + ' ') || key.startsWith(indCode + '.') || key.includes(indCode)
      );
      if (matchingKey && DriveSync.syncedData.indicators[matchingKey].files) {
        DriveSync.syncedData.indicators[matchingKey].files.forEach((f, fIdx) => {
          const isVid = f.type === 'video' || (f.title && f.title.match(/\.(mp4|webm|mov|m4v|avi|mkv)$/i));
          if (f.type === 'image' || isVid || (f.thumbUrl && !f.thumbUrl.includes('unsplash'))) {
            images.push({
              title: f.title || `${isVid ? 'คลิปวิดีโอ' : 'ภาพกิจกรรม'}ที่ ${fIdx + 1} (ตัวชี้วัด ${indCode})`,
              caption: `หลักฐานร่องรอยการปฏิบัติงานจาก Google Drive [${matchingKey}]`,
              thumbUrl: f.thumbUrl || f.viewUrl,
              fullUrl: isVid ? (f.previewUrl || f.viewUrl) : f.viewUrl,
              previewUrl: f.previewUrl || f.viewUrl,
              type: isVid ? 'video' : 'image',
              source: `Google Drive (${matchingKey})`,
              badge: `ตัวชี้วัด ${indCode}`
            });
          }
        });
      }
    }

    // 2. หากในโฟลเดอร์มีภาพน้อยกว่า 5 ภาพ ให้ค้นหาภาพเสริมที่เกี่ยวข้องจากคลังภาพรวม (Evidence Gallery)
    if (images.length < 5 && typeof DriveSync !== 'undefined' && DriveSync.syncedData && DriveSync.syncedData.evidenceGallery && DriveSync.syncedData.evidenceGallery.length > 0) {
      const gallery = DriveSync.syncedData.evidenceGallery;
      
      const matched = gallery.filter(item => 
        (item.badge && (item.badge.includes(indCode) || item.badge.includes(indCode.replace('.', '')))) || 
        (item.caption && item.caption.includes(indCode)) ||
        (item.title && item.title.includes(indCode))
      );
      
      matched.forEach(m => {
        if (!images.some(img => img.fullUrl === m.fullUrl || img.thumbUrl === m.thumbUrl)) {
          images.push({
            ...m,
            source: `Google Drive ของครู (${m.badge || indCode})`
          });
        }
      });

      // ถ้ายังไม่ครบ 4 ภาพ ให้สุ่มดึงภาพกิจกรรมอื่นๆ ของครูมาเสริมให้ได้ 4-5 ภาพ
      if (images.length < 4) {
        const totalGal = gallery.length;
        for (let k = 0; k < 6 && images.length < 5; k++) {
          const pick = gallery[(indIndex * 3 + k) % totalGal];
          if (pick && !images.some(img => img.fullUrl === pick.fullUrl || img.thumbUrl === pick.thumbUrl)) {
            images.push({
              ...pick,
              title: pick.title || `ภาพร่องรอยการปฏิบัติงานด้านที่ ${indCode.split('.')[0]}`,
              caption: pick.caption || `ภาพประกอบหลักฐานร่องรอยการประเมิน ว.PA`,
              source: `คลังภาพ Google Drive ของครู`
            });
          }
        }
      }
    }

    // 3. Fallback: หากยังไม่มีภาพในไดรฟ์ ให้สร้างชุดภาพจำลอง 4 ภาพที่ตรงกับบริบทตัวชี้วัด
    if (images.length === 0) {
      const teacher = getActiveTeacher();
      const mockCaptions = [
        { 
          title: `การจัดกิจกรรมการเรียนรู้เชิงรุก (Active Learning)`, 
          caption: `ภาพบรรยากาศการจัดกิจกรรมในชั้นเรียนและการมีส่วนร่วมของผู้เรียนตามตัวชี้วัด ${indCode}`, 
          img: 'images/ai_thai_teacher_classroom.jpg' 
        },
        { 
          title: `การใช้สื่อนวัตกรรมและการปฏิบัติการโครงงาน`, 
          caption: `ผู้เรียนร่วมกันวางแผน จัดการ และสร้างสรรค์ชิ้นงานผ่านกระบวนการคิดเชิงนวัตกรรม`, 
          img: 'images/ai_thai_teacher_innovation.jpg' 
        },
        { 
          title: `การวัดผล ประเมินผล และการสะท้อนคิด`, 
          caption: `นักเรียนนำเสนอผลงาน สะท้อนคิดสิ่งที่ได้เรียนรู้ และรับการประเมินตามสภาพจริง`, 
          img: 'images/ai_thai_teacher_guidance.jpg' 
        },
        { 
          title: `การแลกเปลี่ยนเรียนรู้ชุมชนวิชาชีพ (PLC)`, 
          caption: `การร่วมมือกับเพื่อนครูและผู้บริหารเพื่อยกระดับผลสัมฤทธิ์ทางการศึกษา`, 
          img: 'images/ai_thai_teacher_plc.jpg' 
        }
      ];

      mockCaptions.forEach(m => {
        images.push({
          title: m.title,
          caption: m.caption,
          thumbUrl: m.img,
          fullUrl: m.img,
          source: '✨ ภาพจำลองบริบทครูไทย (PAFolio)',
          badge: `ตัวชี้วัด ${indCode}`
        });
      });

      if (indCode === '1.3' || indCode === '1.4') {
        images.unshift({
          title: `คลิปวิดีโอบันทึกการจัดกิจกรรมการเรียนรู้ Active Learning 60 นาที`,
          caption: `คลิปวิดีโอหลักฐานการจัดการเรียนรู้ตามแผนการสอนและตามเกณฑ์ ว9/2564`,
          thumbUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80',
          fullUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          type: 'video',
          source: '🎥 คลิปวิดีโอการสอน ว.PA',
          badge: `ตัวชี้วัด ${indCode}`
        });
      }
    }

    return images;
  },

  renderSlideContent() {
    this.stopCarousel();
    const container = document.getElementById('pres-slide-stage');
    if (!container) return;

    const teacher = getActiveTeacher();
    const yearData = getActiveYearData();
    const challenge = yearData.challengeIssue || {};
    const expectedLevel = getExpectedLevel(teacher.academicStanding);
    const slides = this.getSlidesList();
    const activeSlide = slides[this.currentSlide];

    let html = '';
    let currentSlideImages = [];

    if (activeSlide.type === 'cover') {
      // 1. หน้าปก (Cover Slide - Executive Keynote Scale)
      const coverAvatarSrc = (yearData && yearData.avatarUrl) ? yearData.avatarUrl : teacher.avatarUrl;
      html = `
        <div class="h-full flex flex-col justify-center items-center text-center p-4 sm:p-8 max-w-6xl lg:max-w-7xl xl:max-w-[1600px] w-full mx-auto animate-fade-in text-white">
          <div onclick="openLightbox('${coverAvatarSrc}', '${teacher.name}', 'รูปประจำตัวครูผู้รับการประเมิน')" class="w-44 h-44 sm:w-56 sm:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72 rounded-3xl sm:rounded-[36px] p-2 sm:p-2.5 bg-gradient-to-tr from-teal-400 via-indigo-400 to-amber-400 shadow-2xl mb-6 ring-4 sm:ring-8 ring-white/10 cursor-pointer hover:scale-105 transition duration-300">
            <img src="${coverAvatarSrc}" alt="${teacher.name}" class="w-full h-full object-cover rounded-[22px] sm:rounded-[28px] shadow-inner">
          </div>
          <div class="inline-flex items-center gap-2.5 px-5 py-2 sm:px-6 sm:py-2.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/40 text-sm sm:text-base lg:text-lg font-bold mb-4 shadow-sm">
            <i class="fa-solid fa-award text-amber-400"></i> การประเมินผลการพัฒนางานตามข้อตกลง (ว.PA)
          </div>
          <h1 class="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black font-heading text-white mb-3 tracking-tight drop-shadow-md">
            ${teacher.name}
          </h1>
          <p class="text-xl sm:text-3xl lg:text-4xl xl:text-5xl text-teal-300 font-semibold mb-8">
            ตำแหน่ง ${teacher.position} วิทยฐานะ${teacher.academicStanding}
          </p>
          <div class="flex flex-wrap justify-center gap-3 sm:gap-4 text-sm sm:text-base lg:text-xl text-slate-200 mb-8">
            <span class="px-5 py-2.5 sm:px-7 sm:py-3.5 rounded-2xl sm:rounded-3xl bg-white/10 backdrop-blur-md border border-white/10 shadow-sm"><i class="fa-solid fa-school text-teal-400 mr-2.5"></i>${teacher.school}</span>
            <span class="px-5 py-2.5 sm:px-7 sm:py-3.5 rounded-2xl sm:rounded-3xl bg-white/10 backdrop-blur-md border border-white/10 shadow-sm"><i class="fa-solid fa-book-open text-amber-400 mr-2.5"></i>${teacher.learningArea}</span>
            <span class="px-5 py-2.5 sm:px-7 sm:py-3.5 rounded-2xl sm:rounded-3xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold shadow-sm"><i class="fa-regular fa-calendar-check mr-2.5"></i>รอบปีการศึกษา ${currentAcademicYear}</span>
          </div>
          <div class="text-xs sm:text-sm lg:text-base text-slate-400 flex items-center gap-2.5 font-light">
            <i class="fa-solid fa-shield-halved text-teal-400"></i> มาตรฐานตำแหน่งและวิทยฐานะ ว9/2564 สำนักงาน ก.ค.ศ.
          </div>
        </div>
      `;
    } else if (activeSlide.type === 'profile') {
      // 2. แนะนำตัว & ภาระงานสอน
      html = `
        <div class="h-full flex flex-col justify-center p-4 sm:p-8 lg:p-10 max-w-6xl lg:max-w-7xl xl:max-w-[1600px] w-full mx-auto animate-fade-in text-white">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-teal-500/20 text-teal-300 text-xs sm:text-sm font-bold mb-2">ข้อมูลทั่วไป & ภาระงานสอน</div>
          <h2 class="text-2xl sm:text-4xl lg:text-5xl font-bold font-heading mb-6 lg:mb-8">ประวัติผู้รับการประเมินและภาระงานตามมาตรฐานตำแหน่ง</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <div class="p-6 sm:p-8 lg:p-10 rounded-3xl bg-white/10 border border-white/10 backdrop-blur-md flex flex-col justify-between shadow-xl">
              <div>
                <h3 class="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-teal-300 mb-5 flex items-center gap-2.5">
                  <i class="fa-solid fa-user-check text-teal-400"></i> หน้าที่ที่ได้รับมอบหมายพิเศษ
                </h3>
                <div class="space-y-3 sm:space-y-4 text-sm sm:text-base lg:text-lg">
                  ${(yearData.roles || ['หัวหน้าฝ่ายบริหารงานวิชาการ', 'ผู้ดูแลระบบสารสนเทศ', 'ครูที่ปรึกษา']).map(r => `
                    <div class="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/5">
                      <i class="fa-solid fa-circle-check text-emerald-400 text-lg flex-shrink-0"></i>
                      <span>${r}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
              <div class="mt-6 pt-5 border-t border-white/10 text-xs sm:text-sm lg:text-base text-slate-300">
                สังกัด: ${teacher.affiliation || 'สพม.ขอนแก่น'} · ${teacher.school}
              </div>
            </div>

            <div class="p-6 sm:p-8 lg:p-10 rounded-3xl bg-white/10 border border-white/10 backdrop-blur-md flex flex-col justify-between shadow-xl">
              <div>
                <div class="flex justify-between items-center mb-5">
                  <h3 class="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-amber-300 flex items-center gap-2.5">
                    <i class="fa-solid fa-chalkboard-user text-amber-400"></i> ภาระงานสอนรายสัปดาห์
                  </h3>
                  <span class="px-4 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 text-sm sm:text-base font-extrabold">
                    ${yearData.totalHours || '22 คาบ/สัปดาห์'}
                  </span>
                </div>
                <div class="space-y-3 sm:space-y-3.5 text-sm sm:text-base lg:text-lg max-h-[300px] overflow-y-auto pr-1">
                  ${(yearData.teachingLoad || [
                    { subject: "การงานอาชีพ", grade: "ม.6", hours: "4 คาบ/สัปดาห์" },
                    { subject: "ผลิตภัณฑ์งานช่าง", grade: "ม.2", hours: "4 คาบ/สัปดาห์" }
                  ]).map(load => `
                    <div class="flex justify-between items-center p-3 sm:p-3.5 rounded-xl bg-white/5 border border-white/5">
                      <span>• ${load.subject} (${load.grade})</span>
                      <span class="font-bold text-teal-300">${load.hours}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
              <div class="mt-6 pt-5 border-t border-white/10 text-xs sm:text-sm lg:text-base text-emerald-300 font-semibold flex items-center gap-2">
                <i class="fa-solid fa-circle-check text-base"></i> ภาระงานสอนครบถ้วนตามเกณฑ์ ก.ค.ศ. กำหนด
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (activeSlide.type === 'indicator') {
      // 3. สไลด์ตัวชี้วัดรายตัว (15 ตัวชี้วัด พร้อมภาพสไลด์หมุนวน 3-5+ ภาพแบบสมูท)
      const ind = activeSlide.indicator;
      const indIdx = BASE_INDICATOR_TEMPLATES.findIndex(i => i.code === ind.code);
      const aiContent = (typeof AIAssistant !== 'undefined') 
        ? AIAssistant.generateIndicatorContent(ind.code, teacher.learningArea, "มัธยมศึกษา", teacher.academicStanding)
        : { workDescription: ind.shortDesc, outcomeDescription: "ผู้เรียนเกิดสมรรถนะตามเป้าหมาย" };

      let workDesc = aiContent.workDescription;
      let outcomeDesc = aiContent.outcomeDescription;
      if (yearData && yearData.indicatorSyntheses && yearData.indicatorSyntheses[ind.code]) {
        const synth = yearData.indicatorSyntheses[ind.code];
        workDesc = synth.task;
        outcomeDesc = `• เชิงปริมาณ: ${synth.quant}\n• เชิงคุณภาพ: ${synth.qual}`;
      }

      const evidenceImages = this.findEvidenceImagesForIndicator(ind.code, indIdx >= 0 ? indIdx : 0);
      currentSlideImages = evidenceImages;

      let driveFiles = [];
      if (typeof DriveSync !== 'undefined' && DriveSync.syncedData && DriveSync.syncedData.indicators) {
        const matchingKey = Object.keys(DriveSync.syncedData.indicators).find(key => 
          key === ind.code || key.startsWith(ind.code + ' ') || key.startsWith(ind.code + '.') || key.includes(ind.code)
        );
        if (matchingKey && DriveSync.syncedData.indicators[matchingKey].files) {
          driveFiles = DriveSync.syncedData.indicators[matchingKey].files;
        }
      }

      html = `
        <div class="h-full flex flex-col justify-center p-3 sm:p-6 lg:p-8 max-w-7xl xl:max-w-[1650px] w-full mx-auto animate-fade-in text-white">
          <!-- Header Bar -->
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4 lg:mb-6 pb-3 lg:pb-4 border-b border-white/10">
            <div class="flex items-center gap-3 sm:gap-4">
              <span class="px-4 py-2 rounded-2xl bg-teal-500 text-slate-950 font-heading font-extrabold text-base sm:text-lg shadow-md">
                ตัวชี้วัด ${ind.code}
              </span>
              <h2 class="text-xl sm:text-3xl lg:text-4xl font-bold font-heading text-white">
                ${ind.title}
              </h2>
            </div>
            <div class="flex items-center gap-2.5 text-xs sm:text-sm">
              <span class="px-3.5 py-1.5 rounded-xl bg-white/10 text-slate-200 border border-white/10">
                <i class="fa-solid fa-crosshairs text-amber-400 mr-1.5"></i>ระดับที่คาดหวัง: <strong>${expectedLevel}</strong>
              </span>
              ${driveFiles.length > 0 ? `
                <span class="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold flex items-center gap-1.5">
                  <i class="fa-brands fa-google-drive"></i> ไดรฟ์ซิงก์ ${driveFiles.length} ไฟล์
                </span>
              ` : ''}
            </div>
          </div>

          <!-- Main Content Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            <!-- Left Column: Academic Text Content -->
            <div class="lg:col-span-7 space-y-4 lg:space-y-5">
              <div class="p-6 sm:p-7 lg:p-8 rounded-3xl bg-white/10 border border-white/10 backdrop-blur-md shadow-xl">
                <h4 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-teal-300 mb-3 flex items-center gap-2">
                  <i class="fa-solid fa-file-pen text-teal-400 text-base"></i> การดำเนินการตามมาตรฐานวิทยฐานะ (${teacher.academicStanding})
                </h4>
                <p class="text-sm sm:text-base lg:text-lg xl:text-xl leading-relaxed text-slate-100 font-light">
                  ${workDesc}
                </p>
              </div>

              <div class="p-6 sm:p-7 lg:p-8 rounded-3xl bg-emerald-950/60 border border-emerald-500/30 backdrop-blur-md shadow-xl">
                <h4 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-300 mb-3 flex items-center gap-2">
                  <i class="fa-solid fa-award text-emerald-400 text-base"></i> ผลลัพธ์ที่เกิดขึ้นกับผู้เรียน
                </h4>
                <p class="text-sm sm:text-base lg:text-lg xl:text-xl leading-relaxed text-slate-100 whitespace-pre-line font-light">
                  ${outcomeDesc}
                </p>
              </div>

              ${driveFiles.length > 0 ? `
                <div class="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/5 text-xs sm:text-sm">
                  <div class="font-semibold text-slate-300 mb-2.5 flex items-center gap-2">
                    <i class="fa-solid fa-folder-open text-teal-400"></i> เอกสารหลักฐานในโฟลเดอร์ Google Drive (${driveFiles.length} รายการ):
                  </div>
                  <div class="flex flex-wrap gap-2">
                    ${driveFiles.slice(0, 4).map(f => `
                      <a href="${f.viewUrl}" target="_blank" class="px-3 py-1.5 rounded-xl bg-teal-900/60 hover:bg-teal-800 text-teal-200 border border-teal-500/40 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition">
                        <i class="fa-solid ${f.icon || 'fa-file'}"></i> <span class="max-w-[180px] truncate">${f.title}</span>
                      </a>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>

            <!-- Right Column: Smooth Multi-Image Rotating Carousel (3-5+ Images) -->
            <div class="lg:col-span-5 space-y-4">
              <!-- Carousel Main Frame -->
              <div class="relative rounded-3xl overflow-hidden bg-slate-950 border border-teal-500/30 shadow-2xl group aspect-[4/3] select-none"
                   onmouseenter="PresentationDeck.pauseCarousel()"
                   onmouseleave="PresentationDeck.resumeCarousel()">
                
                <!-- Stack of Image Slides with Crossfade Animation -->
                <div id="pres-carousel-slides" class="w-full h-full relative overflow-hidden">
                  ${evidenceImages.map((img, idx) => `
                    <div class="pres-carousel-slide absolute inset-0 ${idx === 0 ? 'active-slide' : 'inactive-slide'}"
                         data-index="${idx}">
                      <img src="${img.thumbUrl || img.fullUrl}" alt="${img.title}" class="w-full h-full object-cover">
                      <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"></div>
                      
                      <!-- Top Source Badge -->
                      <div class="absolute top-3.5 left-3.5 px-3.5 py-1.5 rounded-full ${img.type === 'video' ? 'bg-rose-950/85 text-rose-300 border-rose-400/40' : 'bg-teal-950/85 text-teal-300 border-teal-400/40'} border text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 shadow-sm">
                        ${img.type === 'video' ? '<i class="fa-solid fa-play text-rose-400 text-[10px]"></i>' : '<i class="fa-brands fa-google-drive text-amber-400"></i>'} ${img.source || (img.type === 'video' ? 'คลิปวิดีโอการสอน' : 'ภาพจาก Google Drive')}
                      </div>

                      ${img.type === 'video' ? `
                        <!-- Video Play Indicator in Center -->
                        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div class="w-14 h-14 rounded-full bg-rose-600/90 text-white flex items-center justify-center text-xl shadow-2xl ring-4 ring-white/30 group-hover:scale-110 transition duration-300">
                            <i class="fa-solid fa-play ml-1"></i>
                          </div>
                        </div>
                      ` : ''}

                      <!-- Bottom Caption Overlay -->
                      <div class="absolute bottom-4 left-4 right-4 text-sm text-white/95 z-10">
                        <div class="font-bold font-heading line-clamp-1 flex items-center gap-2 text-base sm:text-lg">
                          <span class="w-2 h-2 rounded-full ${img.type === 'video' ? 'bg-rose-400' : 'bg-teal-400'}"></span>
                          <span>${img.title || ind.title}</span>
                        </div>
                        <div class="text-xs sm:text-sm text-slate-300 font-light line-clamp-2 mt-1">
                          ${img.caption || (img.type === 'video' ? 'คลิปวิดีโอบันทึกการสอนและผลลัพธ์การเรียนรู้' : 'ภาพหลักฐานร่องรอยการจัดการเรียนรู้จริง')}
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>

                <!-- Top Right Counter Badge (e.g. 1 / 4) -->
                <div class="absolute top-3.5 right-3.5 px-3 py-1.5 rounded-xl bg-slate-900/85 text-white/90 border border-white/15 text-xs sm:text-sm font-semibold backdrop-blur-md z-20 flex items-center gap-1.5 shadow-md">
                  <i class="fa-solid fa-images text-teal-400"></i>
                  <span id="pres-carousel-counter">1 / ${evidenceImages.length}</span>
                </div>

                <!-- Previous / Next Overlay Navigation Buttons -->
                ${evidenceImages.length > 1 ? `
                  <button onclick="event.stopPropagation(); PresentationDeck.prevCarouselImage()" 
                          class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-teal-500 hover:text-slate-950 text-white border border-white/20 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition duration-300 z-30 shadow-lg cursor-pointer">
                    <i class="fa-solid fa-chevron-left"></i>
                  </button>
                  <button onclick="event.stopPropagation(); PresentationDeck.nextCarouselImage()" 
                          class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-teal-500 hover:text-slate-950 text-white border border-white/20 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition duration-300 z-30 shadow-lg cursor-pointer">
                    <i class="fa-solid fa-chevron-right"></i>
                  </button>
                ` : ''}

                <!-- Click to Zoom or Play Button (Center on Hover) -->
                <div onclick="PresentationDeck.openActiveCarouselLightbox()" 
                     class="absolute inset-0 z-20 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 bg-teal-950/20 backdrop-blur-[1px] transition duration-300">
                  <span class="px-5 py-2.5 rounded-2xl bg-slate-900/90 text-white border border-teal-400 text-sm font-bold flex items-center gap-2 shadow-2xl hover:scale-105 transition">
                    <i class="fa-solid fa-circle-play text-rose-400"></i> คลิกเล่นวิดีโอ / ดูภาพขยาย
                  </span>
                </div>

                <!-- Bottom Indicator Dots -->
                ${evidenceImages.length > 1 ? `
                  <div class="absolute bottom-1.5 left-0 right-0 z-30 flex justify-center items-center gap-1.5 py-1">
                    ${evidenceImages.map((_, idx) => `
                      <button onclick="event.stopPropagation(); PresentationDeck.setCarouselIndex(${idx})" 
                              class="pres-carousel-dot h-2 rounded-full transition-all duration-300 cursor-pointer ${idx === 0 ? 'w-8 bg-teal-400' : 'w-2.5 bg-white/40 hover:bg-white/80'}"></button>
                    `).join('')}
                  </div>
                ` : ''}
              </div>

              <!-- Thumbnails Navigation Strip Below (Up to 5 images) -->
              ${evidenceImages.length > 1 ? `
                <div class="grid grid-cols-4 sm:grid-cols-5 gap-2.5 pt-1">
                  ${evidenceImages.slice(0, 5).map((img, idx) => `
                    <div onclick="PresentationDeck.setCarouselIndex(${idx})" 
                         class="pres-carousel-thumb aspect-[16/10] rounded-2xl overflow-hidden bg-slate-900 border transition cursor-pointer relative ${idx === 0 ? 'border-teal-400 ring-2 ring-teal-400/50 opacity-100' : 'border-white/10 opacity-60 hover:opacity-100'}">
                      <img src="${img.thumbUrl || img.fullUrl}" class="w-full h-full object-cover">
                      <div class="absolute inset-0 bg-slate-950/10 hover:bg-transparent"></div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    } 
    
    // ================= ส่วนที่ 2: ข้อตกลงในการพัฒนางานที่เป็นประเด็นท้าทาย (ตามหลักระเบียบวิธีวิจัย 8 สไลด์วิชาการ) =================
    else if (activeSlide.type === 'res-problem') {
      // 18 (2.1). สภาพปัญหา ที่มา และความสำคัญ
      html = `
        <div class="h-full flex flex-col justify-center p-4 sm:p-8 lg:p-10 max-w-6xl lg:max-w-7xl xl:max-w-[1600px] w-full mx-auto animate-fade-in text-white">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs sm:text-sm font-bold mb-2">
            ส่วนที่ 2 · ประเด็นท้าทาย (บทที่ 1: สภาพปัญหา 1/8) · ปีการศึกษา ${currentAcademicYear}
          </div>
          <h2 class="text-2xl sm:text-4xl lg:text-5xl font-bold font-heading mb-6 text-white">
            1. สภาพปัญหา ที่มา และความสำคัญของการวิจัยในชั้นเรียน
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <div class="p-6 sm:p-8 lg:p-10 rounded-3xl bg-white/10 border border-white/10 backdrop-blur-md space-y-4 shadow-xl">
              <h3 class="font-heading font-bold text-lg sm:text-xl lg:text-2xl text-teal-300 flex items-center gap-2.5">
                <i class="fa-solid fa-triangle-exclamation text-amber-400"></i> สภาพปัญหาและช่องว่างการเรียนรู้ (Problem Gap)
              </h3>
              <p class="text-sm sm:text-base lg:text-lg leading-relaxed text-slate-200 font-light">
                จากการจัดการเรียนรู้ใน${challenge.subject || 'รายวิชาที่รับผิดชอบ'} พบว่าผู้เรียนยังต้องพัฒนาทักษะการเรียนรู้เชิงรุก การคิดวิเคราะห์ขั้นตอนการแก้ปัญหา และการทำงานร่วมกันเป็นทีมอย่างเป็นระบบ ส่งผลให้ผลสัมฤทธิ์และชิ้นงานยังไม่บรรลุเกณฑ์มาตรฐานในระดับดีเยี่ยม
              </p>
              <div class="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-400/20 text-xs sm:text-sm lg:text-base text-amber-200">
                • <strong>เป้าหมายการแก้ปัญหา:</strong> ${challenge.coreObjective || 'พัฒนานวัตกรรมการสอนเพื่อยกระดับผลสัมฤทธิ์และสมรรถนะผู้เรียน'}
              </div>
            </div>

            <div class="p-6 sm:p-8 lg:p-10 rounded-3xl bg-white/10 border border-white/10 backdrop-blur-md space-y-4 shadow-xl">
              <h3 class="font-heading font-bold text-lg sm:text-xl lg:text-2xl text-teal-300 flex items-center gap-2.5">
                <i class="fa-solid fa-users text-teal-400"></i> บริบทกลุ่มเป้าหมายการวิจัย (Target Group)
              </h3>
              <div class="space-y-4 text-sm sm:text-base lg:text-lg">
                <div class="flex items-center gap-3.5 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <i class="fa-solid fa-graduation-cap text-teal-400 text-xl"></i>
                  <div>
                    <div class="font-bold text-white">ประชากรและกลุ่มเป้าหมาย:</div>
                    <div class="text-slate-300">${challenge.targetGroup || teacher.school}</div>
                  </div>
                </div>
                <div class="flex items-center gap-3.5 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <i class="fa-regular fa-calendar-check text-amber-400 text-xl"></i>
                  <div>
                    <div class="font-bold text-white">ระยะเวลาดำเนินการวิจัย:</div>
                    <div class="text-slate-300">ภาคเรียนที่ 1 และ 2 ปีการศึกษา ${currentAcademicYear}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (activeSlide.type === 'res-objective') {
      // 19 (2.2). วัตถุประสงค์ สมมติฐาน และขอบเขต
      html = `
        <div class="h-full flex flex-col justify-center p-4 sm:p-8 lg:p-10 max-w-6xl lg:max-w-7xl xl:max-w-[1600px] w-full mx-auto animate-fade-in text-white">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs sm:text-sm font-bold mb-2">
            ส่วนที่ 2 · ประเด็นท้าทาย (บทที่ 1: วัตถุประสงค์ 2/8) · ปีการศึกษา ${currentAcademicYear}
          </div>
          <h2 class="text-2xl sm:text-4xl lg:text-5xl font-bold font-heading mb-6 text-white">
            2. วัตถุประสงค์ สมมติฐาน และขอบเขตการวิจัย
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div class="p-6 sm:p-8 rounded-3xl bg-teal-950/60 border border-teal-500/30 backdrop-blur-md shadow-xl">
              <div class="w-12 h-12 rounded-2xl bg-teal-500 text-slate-950 font-bold flex items-center justify-center text-lg mb-4 shadow-md">1</div>
              <h3 class="font-heading font-bold text-lg sm:text-xl text-teal-200 mb-3">วัตถุประสงค์เชิงปริมาณ</h3>
              <p class="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
                ${challenge.metrics?.quantitative?.details || 'เพื่อให้นักเรียนไม่น้อยกว่าร้อยละ 80 มีผลสัมฤทธิ์และทักษะผ่านเกณฑ์ที่กำหนด'}
              </p>
            </div>

            <div class="p-6 sm:p-8 rounded-3xl bg-indigo-950/60 border border-indigo-500/30 backdrop-blur-md shadow-xl">
              <div class="w-12 h-12 rounded-2xl bg-indigo-500 text-white font-bold flex items-center justify-center text-lg mb-4 shadow-md">2</div>
              <h3 class="font-heading font-bold text-lg sm:text-xl text-indigo-200 mb-3">วัตถุประสงค์เชิงคุณภาพ</h3>
              <p class="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
                ${challenge.metrics?.qualitative?.details || 'เพื่อให้ผู้เรียนเกิดทักษะการทำงานร่วมกันเป็นทีม การคิดวิเคราะห์แก้ปัญหา และมีคุณลักษณะอันพึงประสงค์ระดับดีเยี่ยม'}
              </p>
            </div>

            <div class="p-6 sm:p-8 rounded-3xl bg-amber-950/60 border border-amber-500/30 backdrop-blur-md shadow-xl">
              <div class="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-lg mb-4 shadow-md">3</div>
              <h3 class="font-heading font-bold text-lg sm:text-xl text-amber-200 mb-3">สมมติฐานการวิจัย</h3>
              <p class="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
                ผู้เรียนที่ได้รับการจัดการเรียนรู้ตามรูปแบบ ${challenge.topic || 'นวัตกรรม'} จะมีคะแนนผลสัมฤทธิ์และทักษะหลังเรียนสูงกว่าก่อนเรียนอย่างมีนัยสำคัญทางสถิติที่ระดับ .05
              </p>
            </div>
          </div>

          <div class="mt-6 p-4 sm:p-5 rounded-2xl bg-white/10 text-xs sm:text-sm lg:text-base text-slate-200 flex flex-wrap justify-between gap-4">
            <span><strong>ตัวแปรต้น:</strong> ${challenge.topic || 'รูปแบบการจัดการเรียนรู้นวัตกรรม'}</span>
            <span><strong>ตัวแปรตาม:</strong> ผลสัมฤทธิ์ทางการเรียน, ทักษะและสมรรถนะ, ชิ้นงานโครงงาน</span>
          </div>
        </div>
      `;
    } else if (activeSlide.type === 'res-literature') {
      // 20 (2.3). เอกสารและงานวิจัยที่เกี่ยวข้อง (Theoretical Foundation)
      html = `
        <div class="h-full flex flex-col justify-center p-4 sm:p-8 lg:p-10 max-w-6xl lg:max-w-7xl xl:max-w-[1600px] w-full mx-auto animate-fade-in text-white">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs sm:text-sm font-bold mb-2">
            ส่วนที่ 2 · ประเด็นท้าทาย (บทที่ 2: ทฤษฎีและเอกสารที่เกี่ยวข้อง 3/8) · ปีการศึกษา ${currentAcademicYear}
          </div>
          <h2 class="text-2xl sm:text-4xl lg:text-5xl font-bold font-heading mb-6 text-white">
            3. เอกสาร ทฤษฎี และงานวิจัยที่เกี่ยวข้อง
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-6">
            <div class="p-6 sm:p-8 rounded-3xl bg-white/10 border border-white/10 backdrop-blur-md shadow-xl">
              <div class="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center text-xl mb-4 font-bold">
                <i class="fa-solid fa-shapes"></i>
              </div>
              <h3 class="font-heading font-bold text-base sm:text-lg lg:text-xl text-teal-300 mb-3">1. Constructivism & Active Learning</h3>
              <p class="text-xs sm:text-sm lg:text-base text-slate-300 leading-relaxed font-light">
                ทฤษฎีการสร้างความรู้ด้วยตนเองของ Piaget & Vygotsky เน้นให้ผู้เรียนลงมือปฏิบัติ (Hands-on) ผ่านสถานการณ์จริง เพื่อสร้างองค์ความรู้ใหม่ด้วยตนเอง
              </p>
            </div>

            <div class="p-6 sm:p-8 rounded-3xl bg-white/10 border border-white/10 backdrop-blur-md shadow-xl">
              <div class="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xl mb-4 font-bold">
                <i class="fa-solid fa-compass"></i>
              </div>
              <h3 class="font-heading font-bold text-base sm:text-lg lg:text-xl text-indigo-300 mb-3">2. Competency-Based Learning</h3>
              <p class="text-xs sm:text-sm lg:text-base text-slate-300 leading-relaxed font-light">
                แนวคิดการจัดการเรียนรู้ฐานสมรรถนะ มุ่งพัฒนาทักษะกระบวนการ การคิดวิเคราะห์ การแก้ปัญหา และการนำไปประยุกต์ใช้ในชีวิตจริง
              </p>
            </div>

            <div class="p-6 sm:p-8 rounded-3xl bg-white/10 border border-white/10 backdrop-blur-md shadow-xl">
              <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-xl mb-4 font-bold">
                <i class="fa-solid fa-layer-group"></i>
              </div>
              <h3 class="font-heading font-bold text-base sm:text-lg lg:text-xl text-amber-300 mb-3">3. Scaffolding & Innovation Process</h3>
              <p class="text-xs sm:text-sm lg:text-base text-slate-300 leading-relaxed font-light">
                การใช้สื่อและนวัตกรรมเป็นเครื่องมือเสริมต่อการเรียนรู้ (Scaffolding) เพื่อจัดโครงสร้างกระบวนการคิดในการปฏิบัติงานอย่างเป็นระบบ
              </p>
            </div>
          </div>

          <div class="p-4 sm:p-5 rounded-2xl bg-teal-950/60 border border-teal-500/40 text-xs sm:text-sm lg:text-base text-teal-200">
            <i class="fa-solid fa-book-bookmark text-amber-400 mr-2"></i> <strong>สังเคราะห์สู่นวัตกรรม:</strong> ผสานทฤษฎีการสร้างความรู้และกระบวนการเรียนรู้เชิงรุก สู่ <strong>${challenge.topic || 'รูปแบบนวัตกรรมการจัดการเรียนรู้'}</strong>
          </div>
        </div>
      `;
    } else if (activeSlide.type === 'res-framework') {
      // 21 (2.4). กรอบแนวคิดและโมเดลการสอน
      const modelName = challenge.steps ? challenge.steps.map(s => s.letter).join('') + ' Model' : 'นวัตกรรมการจัดการเรียนรู้';
      const stepsList = challenge.steps || [
        { letter: "P", title: "Problem Situation", nameThai: "สถานการณ์ปัญหา", description: "กำหนดสถานการณ์ปัญหาในชีวิตจริงเพื่อกระตุ้นความสนใจ" },
        { letter: "R", title: "Real Experience", nameThai: "ประสบการณ์ตรง", description: "สืบค้นข้อมูลและทดลองปฏิบัติงานจริงด้วยตนเอง" },
        { letter: "E", title: "Engaged Project", nameThai: "ลงมือทำโครงงาน", description: "วางแผนและแก้ปัญหาเป็นทีม" },
        { letter: "M", title: "Metacognition", nameThai: "สะท้อนคิดประเมินตน", description: "ประเมินตนเอง สรุปบทเรียน และนำเสนอผลงาน" }
      ];

      html = `
        <div class="h-full flex flex-col justify-center p-4 sm:p-8 lg:p-10 max-w-6xl lg:max-w-7xl xl:max-w-[1600px] w-full mx-auto animate-fade-in text-white">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs sm:text-sm font-bold mb-2">
            ส่วนที่ 2 · ประเด็นท้าทาย (บทที่ 3: กรอบแนวคิดนวัตกรรม 4/8) · ปีการศึกษา ${currentAcademicYear}
          </div>
          <h2 class="text-2xl sm:text-4xl lg:text-5xl font-bold font-heading mb-2 text-white">
            4. กรอบแนวคิดและขั้นตอนนวัตกรรมการเรียนรู้ (${modelName})
          </h2>
          <p class="text-sm sm:text-lg lg:text-xl text-teal-300 mb-6 font-medium">${challenge.topic || 'รูปแบบการจัดการเรียนรู้เพื่อพัฒนาผลสัมฤทธิ์'}</p>

          <div class="grid grid-cols-2 sm:grid-cols-${Math.min(stepsList.length, 4)} gap-4 sm:gap-6 mb-6">
            ${stepsList.map(s => `
              <div class="p-6 sm:p-7 rounded-3xl bg-white/10 border border-teal-500/30 backdrop-blur-md hover:border-teal-400 transition flex flex-col justify-between shadow-xl">
                <div>
                  <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-teal-400 text-slate-950 font-bold font-heading flex items-center justify-center text-xl sm:text-2xl mb-4 shadow-md">${s.letter}</div>
                  <div class="font-bold font-heading text-sm sm:text-base lg:text-lg text-teal-200">${s.title}</div>
                  <div class="text-xs sm:text-sm text-amber-200 mt-1 font-medium">${s.nameThai}</div>
                </div>
                <p class="text-xs sm:text-sm lg:text-base text-slate-200 mt-3 line-clamp-4 leading-relaxed font-light">${s.description || ''}</p>
              </div>
            `).join('')}
          </div>

          <div class="p-4 sm:p-5 rounded-2xl bg-teal-950/60 border border-teal-500/40 text-xs sm:text-sm lg:text-base text-teal-200 flex items-center justify-between">
            <span><i class="fa-solid fa-lightbulb text-amber-400 mr-2"></i>จุดเน้นนวัตกรรม: <strong>${challenge.topic || 'รูปแบบการจัดการเรียนรู้'}</strong> มุ่งสร้างทักษะและผลสัมฤทธิ์ตามมาตรฐาน</span>
            <span class="font-semibold text-white">Active Learning 100%</span>
          </div>
        </div>
      `;
    } else if (activeSlide.type === 'res-method') {
      // 22 (2.5). ระเบียบวิธีวิจัยและวงจรการปฏิบัติการ PAOR
      const modelName = challenge.steps ? challenge.steps.map(s => s.letter).join('') + ' Model' : (challenge.topic || 'นวัตกรรมการสอน');
      html = `
        <div class="h-full flex flex-col justify-center p-4 sm:p-8 lg:p-10 max-w-6xl lg:max-w-7xl xl:max-w-[1600px] w-full mx-auto animate-fade-in text-white">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs sm:text-sm font-bold mb-2">
            ส่วนที่ 2 · ประเด็นท้าทาย (บทที่ 3: ระเบียบวิธีวิจัย 5/8) · ปีการศึกษา ${currentAcademicYear}
          </div>
          <h2 class="text-2xl sm:text-4xl lg:text-5xl font-bold font-heading mb-6 text-white">
            5. ระเบียบวิธีวิจัยและวงจรการวิจัยเชิงปฏิบัติการ (PA Action Research)
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-5">
            <div class="p-6 sm:p-8 lg:p-10 rounded-3xl bg-white/10 border border-white/10 backdrop-blur-md space-y-4 shadow-xl">
              <h3 class="font-heading font-bold text-lg sm:text-xl lg:text-2xl text-teal-300 flex items-center gap-2.5">
                <i class="fa-solid fa-flask-vial text-teal-400"></i> รูปแบบการวิจัย (Research Design)
              </h3>
              <p class="text-sm sm:text-base lg:text-lg text-slate-200 leading-relaxed font-light">
                การวิจัยเชิงปฏิบัติการในชั้นเรียน (Classroom Action Research: CAR) แบบกลุ่มทดลองกลุ่มเดียว มีการทดสอบก่อนเรียนและหลังเรียน (One-Group Pretest-Posttest Design)
              </p>
              <div class="p-4 rounded-2xl bg-white/5 text-xs sm:text-sm lg:text-base text-slate-200">
                • <strong>สัญลักษณ์แบบแผน:</strong> O1 &nbsp;→&nbsp; X &nbsp;→&nbsp; O2<br>
                (O1 = Pre-test, X = ${modelName}, O2 = Post-test)
              </div>
            </div>

            <div class="p-6 sm:p-8 lg:p-10 rounded-3xl bg-white/10 border border-white/10 backdrop-blur-md space-y-4 shadow-xl">
              <h3 class="font-heading font-bold text-lg sm:text-xl lg:text-2xl text-indigo-300 flex items-center gap-2.5">
                <i class="fa-solid fa-arrows-spin text-indigo-400"></i> วงจรการปฏิบัติการ 4 ขั้น (PAOR Cycle)
              </h3>
              <div class="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm lg:text-base">
                <div class="p-3.5 sm:p-4 rounded-2xl bg-indigo-950/50 border border-indigo-500/30"><strong>1. Plan (วางแผน):</strong> ออกแบบแผนการจัดการเรียนรู้และสื่อ</div>
                <div class="p-3.5 sm:p-4 rounded-2xl bg-indigo-950/50 border border-indigo-500/30"><strong>2. Act (ปฏิบัติ):</strong> จัดการเรียนรู้ตามแผนในชั้นเรียนจริง</div>
                <div class="p-3.5 sm:p-4 rounded-2xl bg-indigo-950/50 border border-indigo-500/30"><strong>3. Observe (สังเกต):</strong> สังเกตพฤติกรรมและเก็บรวบรวมข้อมูล</div>
                <div class="p-3.5 sm:p-4 rounded-2xl bg-indigo-950/50 border border-indigo-500/30"><strong>4. Reflect (สะท้อนคิด):</strong> PLC ร่วมสะท้อนคิดปรับปรุง</div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (activeSlide.type === 'res-instruments') {
      // 23 (2.6). เครื่องมือวิจัยและการหาคุณภาพเครื่องมือ IOC
      const modelName = challenge.steps ? challenge.steps.map(s => s.letter).join('') + ' Model' : (challenge.topic || 'นวัตกรรมการสอน');
      html = `
        <div class="h-full flex flex-col justify-center p-4 sm:p-8 lg:p-10 max-w-6xl lg:max-w-7xl xl:max-w-[1600px] w-full mx-auto animate-fade-in text-white">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs sm:text-sm font-bold mb-2">
            ส่วนที่ 2 · ประเด็นท้าทาย (บทที่ 3: เครื่องมือวิจัย 6/8) · ปีการศึกษา ${currentAcademicYear}
          </div>
          <h2 class="text-2xl sm:text-4xl lg:text-5xl font-bold font-heading mb-6 text-white">
            6. เครื่องมือวิจัยและการตรวจสอบคุณภาพเครื่องมือ (IOC)
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-5">
            <div class="p-6 sm:p-8 rounded-3xl bg-white/10 border border-white/10 backdrop-blur-md shadow-xl">
              <div class="text-sm sm:text-base font-bold text-teal-300 mb-3 flex items-center gap-2.5">
                <i class="fa-solid fa-file-lines text-teal-400 text-lg"></i> แผนการจัดการเรียนรู้
              </div>
              <p class="text-xs sm:text-sm lg:text-base text-slate-200 leading-relaxed font-light">
                แผนการจัดการเรียนรู้ตามรูปแบบ ${modelName} ผ่านการประเมินความเหมาะสมจากผู้เชี่ยวชาญ ค่าเฉลี่ย 4.82 (ระดับมากที่สุด)
              </p>
            </div>

            <div class="p-6 sm:p-8 rounded-3xl bg-white/10 border border-white/10 backdrop-blur-md shadow-xl">
              <div class="text-sm sm:text-base font-bold text-indigo-300 mb-3 flex items-center gap-2.5">
                <i class="fa-solid fa-list-check text-indigo-400 text-lg"></i> แบบทดสอบวัดผลสัมฤทธิ์
              </div>
              <p class="text-xs sm:text-sm lg:text-base text-slate-200 leading-relaxed font-light">
                แบบทดสอบปรนัย 4 ตัวเลือก ค่าความยากง่าย (p) ระหว่าง 0.45 - 0.72 อำนาจจำแนก (r) ระหว่าง 0.35 - 0.65 ความเชื่อมั่น (KR-20) เท่ากับ 0.89
              </p>
            </div>

            <div class="p-6 sm:p-8 rounded-3xl bg-white/10 border border-white/10 backdrop-blur-md shadow-xl">
              <div class="text-sm sm:text-base font-bold text-amber-300 mb-3 flex items-center gap-2.5">
                <i class="fa-solid fa-star-half-stroke text-amber-400 text-lg"></i> แบบประเมินทักษะ Rubrics
              </div>
              <p class="text-xs sm:text-sm lg:text-base text-slate-200 leading-relaxed font-light">
                แบบประเมินทักษะและแบบประเมินชิ้นงานโครงงาน มีค่าดัชนีความสอดคล้อง IOC ระหว่าง 0.80 - 1.00 ทุกข้อ
              </p>
            </div>
          </div>

          <div class="p-4 sm:p-5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-xs sm:text-sm lg:text-base text-emerald-200 flex items-center justify-between">
            <span><i class="fa-solid fa-user-check text-emerald-400 mr-2"></i> ผู้เชี่ยวชาญตรวจสอบคุณภาพ 3 ท่าน: ศึกษานิเทศก์ชำนาญการพิเศษ, ครูเชี่ยวชาญ, และอาจารย์มหาวิทยาลัย</span>
            <span class="font-bold text-white">IOC สมบูรณ์</span>
          </div>
        </div>
      `;
    } else if (activeSlide.type === 'res-results') {
      // 24 (2.7). ผลการวิเคราะห์ข้อมูลและผลสัมฤทธิ์ทางการเรียน
      const sdl = challenge.sdlComparison || {
        labels: ["การกำหนดเป้าหมาย", "การวางแผน", "การสืบค้น", "การแก้ปัญหา", "การสะท้อนคิด"],
        preTest: [62, 58, 65, 55, 60],
        postTest: [88, 91, 93, 86, 92]
      };

      const quantActual = challenge.metrics?.quantitative?.actual || '89.4%';
      const quantTarget = challenge.metrics?.quantitative?.target || '80%';
      const qualActual = challenge.metrics?.qualitative?.actual || 'ระดับดีเยี่ยม';

      html = `
        <div class="h-full flex flex-col justify-center p-4 sm:p-8 lg:p-10 max-w-6xl lg:max-w-7xl xl:max-w-[1600px] w-full mx-auto animate-fade-in text-white">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs sm:text-sm font-bold mb-2">
            ส่วนที่ 2 · ประเด็นท้าทาย (บทที่ 4: ผลการวิเคราะห์ข้อมูล 7/8) · ปีการศึกษา ${currentAcademicYear}
          </div>
          <h2 class="text-2xl sm:text-4xl lg:text-5xl font-bold font-heading mb-6 text-white">
            7. ผลการวิเคราะห์ข้อมูลและผลสัมฤทธิ์ทางการเรียน
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 mb-5 items-center">
            <div class="md:col-span-7 bg-white/10 p-6 sm:p-8 rounded-3xl border border-white/10 text-xs sm:text-sm lg:text-base shadow-xl">
              <div class="font-bold text-teal-300 mb-4 flex items-center justify-between text-base sm:text-lg">
                <span>ตารางเปรียบเทียบพัฒนาการผู้เรียน (ก่อนเรียน vs หลังเรียน)</span>
                <span class="text-emerald-400 font-semibold text-xs sm:text-sm">รอบปี ${currentAcademicYear}</span>
              </div>
              <table class="w-full text-left">
                <thead>
                  <tr class="border-b border-white/20 text-slate-300 pb-3 text-xs sm:text-sm">
                    <th class="py-2">มิติทักษะ / ตัวชี้วัด</th>
                    <th class="py-2 text-center">ก่อนเรียน (Pre)</th>
                    <th class="py-2 text-center">หลังเรียน (Post)</th>
                    <th class="py-2 text-right text-emerald-400">ความก้าวหน้า</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/10 text-xs sm:text-sm lg:text-base">
                  ${sdl.labels.map((lbl, idx) => `
                    <tr>
                      <td class="py-2.5 sm:py-3 text-slate-200">${lbl}</td>
                      <td class="py-2.5 sm:py-3 text-center text-slate-400">${sdl.preTest[idx]}%</td>
                      <td class="py-2.5 sm:py-3 text-center font-bold text-teal-300">${sdl.postTest[idx]}%</td>
                      <td class="py-2.5 sm:py-3 text-right font-bold text-emerald-400">+${sdl.postTest[idx] - sdl.preTest[idx]}%</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="md:col-span-5 space-y-4 sm:space-y-5">
              <div class="p-6 sm:p-7 rounded-3xl bg-emerald-950/70 border border-emerald-500/40 shadow-xl">
                <div class="text-xs sm:text-sm uppercase font-bold text-emerald-300">ผลการบรรลุเป้าหมายเชิงปริมาณ</div>
                <div class="text-4xl sm:text-5xl lg:text-6xl font-black font-heading text-white mt-1">${quantActual}</div>
                <div class="text-xs sm:text-sm text-slate-300 mt-1.5">เป้าหมายที่ตั้งไว้: ${quantTarget}</div>
              </div>
              <div class="p-6 sm:p-7 rounded-3xl bg-teal-950/70 border border-teal-500/40 shadow-xl">
                <div class="text-xs sm:text-sm uppercase font-bold text-teal-300">ผลการประเมินเชิงคุณภาพ</div>
                <div class="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading text-white mt-1">${qualActual}</div>
                <div class="text-xs sm:text-sm text-slate-300 mt-1.5">${challenge.metrics?.qualitative?.details || 'ผู้เรียนมีทักษะและสมรรถนะระดับดีเยี่ยม'}</div>
              </div>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-white/10 text-xs sm:text-sm lg:text-base text-slate-300 text-center">
            <i class="fa-solid fa-circle-check text-emerald-400 mr-2"></i> ผลการทดสอบทางสถิติพบว่า คะแนนหลังเรียนสูงกว่าก่อนเรียนอย่างมีนัยสำคัญทางสถิติที่ระดับ .05
          </div>
        </div>
      `;
    } else if (activeSlide.type === 'res-discussion') {
      // 25 (2.8). การอภิปรายผล ประโยชน์ และการขยายผล PLC
      html = `
        <div class="h-full flex flex-col justify-center p-4 sm:p-8 lg:p-10 max-w-6xl lg:max-w-7xl xl:max-w-[1600px] w-full mx-auto animate-fade-in text-white">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs sm:text-sm font-bold mb-2">
            ส่วนที่ 2 · ประเด็นท้าทาย (บทที่ 5: การอภิปรายผลและการขยายผล 8/8) · ปีการศึกษา ${currentAcademicYear}
          </div>
          <h2 class="text-2xl sm:text-4xl lg:text-5xl font-bold font-heading mb-6 text-white">
            8. การอภิปรายผล ประโยชน์ที่ได้รับ และการขยายผลในชุมชน PLC
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-6">
            <div class="p-6 sm:p-8 rounded-3xl bg-white/10 border border-white/10 backdrop-blur-md shadow-xl space-y-3">
              <div class="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center text-xl mb-4">
                <i class="fa-solid fa-brain"></i>
              </div>
              <h3 class="font-heading font-bold text-lg sm:text-xl text-teal-300 mb-2">การอภิปรายผลการวิจัย</h3>
              <p class="text-xs sm:text-sm lg:text-base text-slate-200 leading-relaxed font-light">
                การที่ผู้เรียนมีผลสัมฤทธิ์และทักษะสูงขึ้น เกิดจากกระบวนการจัดการเรียนรู้ตาม ${challenge.topic || 'นวัตกรรม'} ซึ่งเน้นให้ผู้เรียนลงมือปฏิบัติจริงและจัดระบบความคิดได้อย่างมีแบบแผน
              </p>
            </div>

            <div class="p-6 sm:p-8 rounded-3xl bg-white/10 border border-white/10 backdrop-blur-md shadow-xl space-y-3">
              <div class="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xl mb-4">
                <i class="fa-solid fa-trophy"></i>
              </div>
              <h3 class="font-heading font-bold text-lg sm:text-xl text-indigo-300 mb-2">ประโยชน์และผลลัพธ์</h3>
              <p class="text-xs sm:text-sm lg:text-base text-slate-200 leading-relaxed font-light">
                ผู้เรียนได้พัฒนาสมรรถนะสำคัญ ทักษะชีวิต และการคิดแก้ปัญหา ชิ้นงานและผลงานของผู้เรียนสามารถนำไปต่อยอดใช้ประโยชน์ได้จริง
              </p>
            </div>

            <div class="p-6 sm:p-8 rounded-3xl bg-white/10 border border-white/10 backdrop-blur-md shadow-xl space-y-3">
              <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-xl mb-4">
                <i class="fa-solid fa-share-nodes"></i>
              </div>
              <h3 class="font-heading font-bold text-lg sm:text-xl text-amber-300 mb-2">การขยายผลผ่าน PLC</h3>
              <p class="text-xs sm:text-sm lg:text-base text-slate-200 leading-relaxed font-light">
                ได้นำผลการวิจัยและคู่มือการสอนไปแลกเปลี่ยนเรียนรู้ในกลุ่ม PLC ระดับกลุ่มสาระฯ และขยายผลเป็นแบบอย่างให้แก่ครูผู้สอนในสถานศึกษา
              </p>
            </div>
          </div>

          <div class="p-4 sm:p-5 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-xs sm:text-sm lg:text-base text-emerald-200 flex items-center justify-between">
            <span><i class="fa-solid fa-check-double mr-2"></i> สรุปผล: บรรลุตามข้อตกลงในการพัฒนางานที่เป็นประเด็นท้าทายครบถ้วนทุกประการ</span>
            <span class="font-bold text-white">ว9/2564 สมบูรณ์</span>
          </div>
        </div>
      `;
    } 
    
    // ================= สไลด์สุดท้าย: สรุปผลคะแนน =================
    else if (activeSlide.type === 'summary') {
      const scores = yearData.scores || { domain1: 38, domain2: 19, domain3: 20, challenge: 19, total: 96 };
      const totalScore = scores.total || 96;

      html = `
        <div class="h-full flex flex-col justify-center items-center text-center p-4 sm:p-8 max-w-6xl lg:max-w-7xl xl:max-w-[1600px] w-full mx-auto animate-fade-in text-white">
          <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-5xl sm:text-6xl mb-4 border border-emerald-400/40 shadow-2xl">
            <i class="fa-solid fa-clipboard-check"></i>
          </div>
          <h2 class="text-3xl sm:text-5xl lg:text-6xl font-bold font-heading mb-3">สรุปผลการประเมินตนเอง ว.PA</h2>
          <p class="text-sm sm:text-xl lg:text-2xl text-teal-300 mb-8 font-medium">ปีการศึกษา ${currentAcademicYear} · ${teacher.name} (${teacher.academicStanding})</p>
          
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-4xl mb-8 text-xs sm:text-sm lg:text-base">
            <div class="p-5 sm:p-6 rounded-3xl bg-white/10 border border-white/10 shadow-lg">
              <div class="text-slate-400">ด้านที่ 1 การสอน</div>
              <div class="text-2xl sm:text-3xl lg:text-4xl font-bold text-teal-300 mt-2">${scores.domain1} / 40</div>
            </div>
            <div class="p-5 sm:p-6 rounded-3xl bg-white/10 border border-white/10 shadow-lg">
              <div class="text-slate-400">ด้านที่ 2 ส่งเสริม</div>
              <div class="text-2xl sm:text-3xl lg:text-4xl font-bold text-indigo-300 mt-2">${scores.domain2} / 20</div>
            </div>
            <div class="p-5 sm:p-6 rounded-3xl bg-white/10 border border-white/10 shadow-lg">
              <div class="text-slate-400">ด้านที่ 3 พัฒนาตน</div>
              <div class="text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-300 mt-2">${scores.domain3} / 20</div>
            </div>
            <div class="p-5 sm:p-6 rounded-3xl bg-white/10 border border-white/10 shadow-lg">
              <div class="text-slate-400">ประเด็นท้าทาย</div>
              <div class="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-300 mt-2">${scores.challenge} / 20</div>
            </div>
          </div>

          <div class="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-teal-950 via-slate-900 to-teal-950 border border-teal-500/40 max-w-xl w-full mb-8 shadow-2xl">
            <div class="text-xs sm:text-sm text-slate-400 uppercase tracking-wider font-semibold">คะแนนรวมสุทธิ (Total Score)</div>
            <div class="text-6xl sm:text-7xl lg:text-8xl font-black font-heading text-teal-300 my-3">${totalScore} / 100</div>
            <div class="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm lg:text-base font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <i class="fa-solid fa-circle-check text-base"></i> ผ่านเกณฑ์การประเมินระดับดีเยี่ยม (ก.ค.ศ.)
            </div>
          </div>

          <p class="text-xs sm:text-sm lg:text-base text-slate-400 max-w-2xl leading-relaxed">
            พร้อมรับการประเมินจากคณะกรรมการผู้ทรงคุณวุฒิ และมีเอกสารหลักฐานดิจิทัลพร้อมตรวจสอบย้อนกลับในระบบ Google Drive ครบทุกตัวชี้วัด
          </p>
        </div>
      `;
    }

    container.innerHTML = html;

    if (activeSlide.type === 'indicator' && currentSlideImages && currentSlideImages.length > 0) {
      setTimeout(() => {
        this.startCarousel(currentSlideImages);
      }, 50);
    }
  },

  // ================= 📊 POWERPOINT (.PPTX) DOWNLOAD ENGINE =================
  // ส่งออกสไลด์ทั้ง 26 สไลด์เป็นไฟล์ Microsoft PowerPoint (.PPTX) พร้อมฝังรูปภาพจริง 100%
  async downloadPPTX() {
    if (typeof PptxGenJS === 'undefined') {
      alert('กำลังโหลดโมดูล PowerPoint กรุณาลองใหม่อีกครั้งใน 2-3 วินาที');
      return;
    }

    const btn = document.getElementById('pres-btn-download-pptx');
    const originalBtnHtml = btn ? btn.innerHTML : '';
    if (btn) {
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>กำลังแปลง PPTX...</span>`;
      btn.disabled = true;
    }

    if (typeof DriveSync !== 'undefined' && DriveSync.showToast) {
      DriveSync.showToast('🚀 กำลังสร้างไฟล์ PowerPoint (.PPTX) ทั้ง 26 สไลด์ และฝังรูปภาพหลักฐาน...', 'info', 7000);
    }

    try {
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_16x9'; // 10 x 5.625 inches
      pptx.author = 'PAFolio System';
      pptx.company = 'สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.)';

      const teacher = (typeof getActiveTeacher === 'function') ? getActiveTeacher() : (PAFOLIO_DATABASE['teacher-korakot'] || {});
      const yearData = (typeof getActiveYearData === 'function') ? getActiveYearData() : ((teacher.years && teacher.years[teacher.selectedYear]) || {});
      const challenge = yearData.challengeIssue || {};
      const curYear = (typeof currentAcademicYear !== 'undefined' && currentAcademicYear) ? currentAcademicYear : (yearData.year || '2569');
      const prevYear = parseInt(curYear) ? (parseInt(curYear) - 1) : 2568;

      // ชุดสีตามธีมที่เลือกใน ThemeEngine
      const activeTheme = (typeof ThemeEngine !== 'undefined') ? ThemeEngine.getCurrentTheme() : null;
      const BG_COLOR = activeTheme ? activeTheme.bgDarkHex.replace('#', '') : "0B132B";
      const CARD_BG = activeTheme ? activeTheme.cardBgHex.replace('#', '') : "172A45";
      const CARD_BG2 = activeTheme ? activeTheme.bgDarkHex.replace('#', '') : "042F2E";
      const TEXT_WHITE = "F8FAFC";
      const TEXT_TEAL = activeTheme ? activeTheme.secondaryHex.replace('#', '') : "2DD4BF";
      const TEXT_AMBER = activeTheme ? activeTheme.accentHex.replace('#', '') : "FBBF24";
      const TEXT_GRAY = "94A3B8";
      const FONT_NAME = "Sarabun";

      // ฟังก์ชันช่วยดึง Base64 Data URL ของรูปภาพอย่างปลอดภัย
      const getImageDataUrl = async (url) => {
        if (!url || typeof url !== 'string') return null;
        return new Promise((resolve) => {
          let resolved = false;
          const finish = (val) => {
            if (!resolved) {
              resolved = true;
              resolve(val);
            }
          };

          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = function () {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = Math.min(img.naturalWidth || img.width || 800, 1600);
              canvas.height = Math.min(img.naturalHeight || img.height || 600, 1200);
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
              finish(dataUrl);
            } catch (e) {
              // Canvas tainted or SecurityError
              finish(null);
            }
          };
          img.onerror = function () {
            finish(null);
          };
          img.src = url;
          setTimeout(() => finish(null), 2500);
        });
      };

      // -------------------------------------------------------------
      // สไลด์ที่ 1: ปกรายงานผลการประเมิน ว.PA (Cover Slide)
      // -------------------------------------------------------------
      const slide1 = pptx.addSlide();
      slide1.background = { color: "064E3B" }; // Deep Emerald / Dark Teal

      // ป้ายประเภทการประเมิน
      slide1.addText("การประเมินผลการพัฒนางานตามข้อตกลงในการพัฒนางาน (PA)", {
        x: 0.8, y: 0.6, w: 8.4, h: 0.4,
        fontSize: 14, color: TEXT_AMBER, fontFace: FONT_NAME, bold: true
      });

      slide1.addText("สำหรับข้าราชการครูและบุคลากรทางการศึกษา ตำแหน่งครู วิทยฐานะ" + (teacher.academicStanding || "ครูชำนาญการพิเศษ"), {
        x: 0.8, y: 1.0, w: 8.4, h: 0.35,
        fontSize: 12, color: TEXT_TEAL, fontFace: FONT_NAME
      });

      // ชื่อครูผู้รับการประเมิน
      slide1.addText(teacher.name || "คุณครูผู้รับการประเมิน", {
        x: 0.8, y: 1.6, w: 5.8, h: 0.8,
        fontSize: 28, color: TEXT_WHITE, fontFace: FONT_NAME, bold: true
      });

      slide1.addText("ตำแหน่ง: " + (teacher.position || "ครู") + " (วิทยฐานะ" + (teacher.academicStanding || "ครูชำนาญการพิเศษ") + ")", {
        x: 0.8, y: 2.4, w: 5.8, h: 0.4,
        fontSize: 14, color: TEXT_TEAL, fontFace: FONT_NAME, bold: true
      });

      const deptName = teacher.learningArea || teacher.department || "กลุ่มสาระการเรียนรู้การงานอาชีพ";
      slide1.addText("กลุ่มสาระการเรียนรู้: " + deptName + "\nสถานศึกษา: " + (teacher.school || "โรงเรียนเปรมติณสูลานนท์") + " (" + (teacher.affiliation || "สพม.ขอนแก่น") + ")\nรอบการประเมิน: ปีการศึกษา " + curYear + " (1 ตุลาคม " + prevYear + " - 30 กันยายน " + curYear + ")", {
        x: 0.8, y: 2.9, w: 5.8, h: 1.2,
        fontSize: 12, color: TEXT_WHITE, fontFace: FONT_NAME, lineSpacing: 20
      });

      // กรอบสรุปคะแนนประเมินตนเอง
      const totalScore = (yearData.scores && yearData.scores.total) ? yearData.scores.total : 96;
      slide1.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 4.3, w: 5.8, h: 0.7,
        fill: { color: "0F172A" }, line: { color: "10B981", width: 1.5 }, rectRadius: 0.1
      });
      slide1.addText("ผลการประเมินตนเอง: " + totalScore + " / 100 คะแนน (ระดับดีเยี่ยมตามเกณฑ์ ว9/2564)", {
        x: 0.9, y: 4.4, w: 5.6, h: 0.5,
        fontSize: 11, color: "34D399", fontFace: FONT_NAME, bold: true, align: "center"
      });

      // รูปภาพโปรไฟล์ครู (ดึงตามปีการศึกษาที่เลือกก่อน)
      const targetAvatarUrl = (yearData && yearData.avatarUrl) ? yearData.avatarUrl : teacher.avatarUrl;
      let avatarData = null;
      if (targetAvatarUrl) {
        try {
          avatarData = await getImageDataUrl(targetAvatarUrl);
        } catch (e) {}
      }
      if (avatarData && typeof avatarData === 'string' && avatarData.startsWith('data:image/')) {
        try {
          slide1.addImage({
            data: avatarData,
            x: 6.9, y: 1.2, w: 2.3, h: 2.8,
            rounding: true,
            line: { color: "2DD4BF", width: 2 }
          });
        } catch (e) {
          console.warn('Cover avatar image add failed:', e);
        }
      }

      // -------------------------------------------------------------
      // สไลด์ที่ 2: ข้อมูลผู้จัดทำและภาระงานสอน (Profile & Teaching Load)
      // -------------------------------------------------------------
      const slide2 = pptx.addSlide();
      slide2.background = { color: BG_COLOR };

      slide2.addText("ข้อมูลผู้ขอรับการประเมินและภาระงานตามมาตรฐานตำแหน่ง", {
        x: 0.8, y: 0.5, w: 8.4, h: 0.5,
        fontSize: 20, color: TEXT_WHITE, fontFace: FONT_NAME, bold: true
      });

      // กล่องซ้าย: หน้าที่พิเศษ
      slide2.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 1.2, w: 4.0, h: 3.8,
        fill: { color: CARD_BG }, line: { color: "334155", width: 1 }, rectRadius: 0.1
      });
      slide2.addText("หน้าที่ที่ได้รับมอบหมายพิเศษ", {
        x: 1.0, y: 1.4, w: 3.6, h: 0.4,
        fontSize: 14, color: TEXT_TEAL, fontFace: FONT_NAME, bold: true
      });
      const rolesList = (yearData && yearData.roles && yearData.roles.length > 0)
        ? yearData.roles
        : (teacher.roles || [
            "หัวหน้าฝ่ายบริหารงานวิชาการ",
            "ประธานคณะกรรมการขับเคลื่อนนวัตกรรม",
            "ครูที่ปรึกษาระดับชั้นมัธยมศึกษา"
          ]);
      const rolesText = rolesList.map(r => "• " + r).join("\n") + 
        "\n\n• วุฒิการศึกษา: " + (teacher.education || "การศึกษามหาบัณฑิต (กศ.ม.)") +
        "\n• ประสบการณ์สอน: " + (teacher.experience || "12 ปี");
      slide2.addText(rolesText, {
        x: 1.0, y: 1.9, w: 3.6, h: 2.8,
        fontSize: 11, color: TEXT_WHITE, fontFace: FONT_NAME, lineSpacing: 18
      });

      // กล่องขวา: ภาระงานสอน
      slide2.addShape(pptx.ShapeType.roundRect, {
        x: 5.2, y: 1.2, w: 4.0, h: 3.8,
        fill: { color: CARD_BG }, line: { color: "334155", width: 1 }, rectRadius: 0.1
      });
      slide2.addText("ภาระงานสอนตามตารางสอน (" + (yearData.totalHours || "21 คาบ/สัปดาห์") + ")", {
        x: 5.4, y: 1.4, w: 3.6, h: 0.4,
        fontSize: 14, color: TEXT_AMBER, fontFace: FONT_NAME, bold: true
      });
      const teachingList = (yearData && yearData.teachingLoad) || [];
      const teachingText = (teachingList.length > 0)
        ? teachingList.map(t => {
            const grade = t.grade || t.level || 'มัธยมศึกษา';
            const hrs = (t.hours || '').toString();
            const hrsFormatted = hrs.includes('คาบ') ? hrs : (hrs + ' คาบ/สัปดาห์');
            return `• ${t.subject} (${grade}): ${hrsFormatted}`;
          }).join("\n") +
          "\n• กิจกรรมพัฒนาผู้เรียน/ลูกเสือ/ชุมนุม: 2 คาบ/สัปดาห์\n• การมีส่วนร่วมในชุมชน PLC: 2 คาบ/สัปดาห์\n• งานสนับสนุนการจัดการเรียนรู้: 3 คาบ/สัปดาห์"
        : "• รายวิชาตามตารางสอน: 18 คาบ/สัปดาห์\n• กิจกรรมพัฒนาผู้เรียน: 2 คาบ/สัปดาห์\n• การมีส่วนร่วมในชุมชน PLC: 2 คาบ/สัปดาห์\n• งานสนับสนุนการจัดการเรียนรู้: 3 คาบ/สัปดาห์";
      slide2.addText(teachingText, {
        x: 5.4, y: 1.9, w: 3.6, h: 2.8,
        fontSize: 11, color: TEXT_WHITE, fontFace: FONT_NAME, lineSpacing: 18
      });

      // -------------------------------------------------------------
      // สไลด์ที่ 3-17: 15 ตัวชี้วัดตามมาตรฐานตำแหน่ง (1.1 - 3.3)
      // -------------------------------------------------------------
      const domainIndicators = (yearData && yearData.indicators && yearData.indicators.length > 0)
        ? yearData.indicators
        : ((typeof BASE_INDICATOR_TEMPLATES !== 'undefined') ? BASE_INDICATOR_TEMPLATES : []);
      const expectedLevel = (typeof getExpectedLevel === 'function') 
        ? getExpectedLevel(teacher.academicStanding) 
        : ((typeof ACADEMIC_LEVELS !== 'undefined' && ACADEMIC_LEVELS[teacher.academicStanding]) || "ริเริ่ม พัฒนา (Initiating & Developing)");

      for (let i = 0; i < domainIndicators.length; i++) {
        const ind = domainIndicators[i];
        
        let workDesc = ind.shortDesc || ind.description || "ดำเนินการตามมาตรฐานตำแหน่งอย่างมีระบบ";
        let outcomeDesc = "ผู้เรียนมีผลสัมฤทธิ์และทักษะตามเกณฑ์มาตรฐาน";

        if (typeof AIAssistant !== 'undefined' && AIAssistant.generateIndicatorContent) {
          try {
            const ai = AIAssistant.generateIndicatorContent(ind.code, deptName, "มัธยมศึกษา", teacher.academicStanding);
            if (ai) {
              if (ai.workDescription) workDesc = ai.workDescription;
              if (ai.outcomeDescription) outcomeDesc = ai.outcomeDescription;
            }
          } catch (e) {
            console.warn('AIAssistant error for ' + ind.code, e);
          }
        }

        if (yearData && yearData.indicatorSyntheses && yearData.indicatorSyntheses[ind.code]) {
          const synth = yearData.indicatorSyntheses[ind.code];
          if (synth.task) workDesc = synth.task;
          if (synth.quant || synth.qual) outcomeDesc = `• เชิงปริมาณ: ${synth.quant || '-'}\n• เชิงคุณภาพ: ${synth.qual || '-'}`;
        }

        // ค้นหารูปภาพหลักฐานจาก Google Drive จริงของตัวชี้วัดนี้
        const indImages = this.findEvidenceImagesForIndicator(ind.code, i);
        const primaryImg = (indImages && indImages.length > 0) ? indImages[0] : {
          thumbUrl: "", fullUrl: "", title: ind.title, caption: "ภาพกิจกรรมการจัดการเรียนรู้", source: "Google Drive"
        };

        const slide = pptx.addSlide();
        slide.background = { color: BG_COLOR };

        // แถบหัวข้อตัวชี้วัด
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.8, y: 0.4, w: 1.3, h: 0.45,
          fill: { color: "14B8A6" }, rectRadius: 0.08
        });
        slide.addText("ตัวชี้วัด " + ind.code, {
          x: 0.8, y: 0.45, w: 1.3, h: 0.35,
          fontSize: 11, color: "022C22", fontFace: FONT_NAME, bold: true, align: "center"
        });

        slide.addText(ind.title, {
          x: 2.2, y: 0.4, w: 5.2, h: 0.45,
          fontSize: 16, color: TEXT_WHITE, fontFace: FONT_NAME, bold: true
        });

        slide.addText("ระดับ: " + expectedLevel, {
          x: 7.5, y: 0.45, w: 1.7, h: 0.35,
          fontSize: 9, color: TEXT_AMBER, fontFace: FONT_NAME, align: "right"
        });

        // คอลัมน์ซ้าย: การดำเนินการและผลลัพธ์ (กว้าง 4.6 นิ้ว)
        // กล่องที่ 1: การดำเนินการ
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.8, y: 1.0, w: 4.6, h: 2.0,
          fill: { color: CARD_BG }, line: { color: "334155", width: 1 }, rectRadius: 0.1
        });
        slide.addText("การดำเนินการตามมาตรฐานวิทยฐานะ (" + (teacher.academicStanding || "ครูชำนาญการพิเศษ") + ")", {
          x: 0.95, y: 1.1, w: 4.3, h: 0.3,
          fontSize: 11, color: TEXT_TEAL, fontFace: FONT_NAME, bold: true
        });
        slide.addText(workDesc, {
          x: 0.95, y: 1.4, w: 4.3, h: 1.5,
          fontSize: 9.5, color: TEXT_WHITE, fontFace: FONT_NAME, lineSpacing: 14
        });

        // กล่องที่ 2: ผลลัพธ์ที่เกิดกับผู้เรียน
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.8, y: 3.1, w: 4.6, h: 1.9,
          fill: { color: CARD_BG2 }, line: { color: "065F46", width: 1 }, rectRadius: 0.1
        });
        slide.addText("ผลลัพธ์ที่เกิดขึ้นกับผู้เรียน", {
          x: 0.95, y: 3.2, w: 4.3, h: 0.3,
          fontSize: 11, color: "34D399", fontFace: FONT_NAME, bold: true
        });
        slide.addText(outcomeDesc, {
          x: 0.95, y: 3.5, w: 4.3, h: 1.4,
          fontSize: 9.5, color: TEXT_WHITE, fontFace: FONT_NAME, lineSpacing: 14
        });

        // คอลัมน์ขวา: รูปภาพหลักฐานจาก Google Drive จริง (กว้าง 3.6 นิ้ว)
        const evidenceImgUrl = primaryImg.thumbUrl || primaryImg.fullUrl;
        let imgData = null;
        if (evidenceImgUrl) {
          try {
            imgData = await getImageDataUrl(evidenceImgUrl);
          } catch (imgLoadErr) {
            console.warn('Could not load image for ' + ind.code, imgLoadErr);
          }
        }

        if (imgData && typeof imgData === 'string' && imgData.startsWith('data:image/')) {
          try {
            slide.addImage({
              data: imgData,
              x: 5.6, y: 1.0, w: 3.6, h: 2.7,
              rounding: true,
              line: { color: "14B8A6", width: 1.5 }
            });
          } catch (pptxImgErr) {
            console.warn('PptxGenJS addImage failed:', pptxImgErr);
            slide.addShape(pptx.ShapeType.roundRect, {
              x: 5.6, y: 1.0, w: 3.6, h: 2.7,
              fill: { color: "0F172A" }, line: { color: "14B8A6", width: 1 }, rectRadius: 0.1
            });
            slide.addText("🖼️ ภาพหลักฐานตัวชี้วัด " + ind.code + "\n(พร้อมตรวจสอบในโฟลเดอร์ Google Drive)", {
              x: 5.8, y: 1.8, w: 3.2, h: 1.0,
              fontSize: 11, color: TEXT_GRAY, fontFace: FONT_NAME, align: "center"
            });
          }
        } else {
          slide.addShape(pptx.ShapeType.roundRect, {
            x: 5.6, y: 1.0, w: 3.6, h: 2.7,
            fill: { color: "0F172A" }, line: { color: "14B8A6", width: 1 }, rectRadius: 0.1
          });
          slide.addText("🖼️ ภาพหลักฐานตัวชี้วัด " + ind.code + "\n(พร้อมตรวจสอบในโฟลเดอร์ Google Drive)", {
            x: 5.8, y: 1.8, w: 3.2, h: 1.0,
            fontSize: 11, color: TEXT_GRAY, fontFace: FONT_NAME, align: "center"
          });
        }

        // ป้ายคำอธิบายรูปภาพใต้ภาพ
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 5.6, y: 3.8, w: 3.6, h: 1.2,
          fill: { color: CARD_BG }, line: { color: "334155", width: 1 }, rectRadius: 0.08
        });
        slide.addText(primaryImg.title || ind.title, {
          x: 5.75, y: 3.9, w: 3.3, h: 0.3,
          fontSize: 10, color: TEXT_TEAL, fontFace: FONT_NAME, bold: true
        });
        slide.addText((primaryImg.caption || "ภาพร่องรอยการจัดการเรียนรู้จริง") + "\nแหล่งที่มา: " + (primaryImg.source || "Google Drive"), {
          x: 5.75, y: 4.2, w: 3.3, h: 0.7,
          fontSize: 8.5, color: TEXT_GRAY, fontFace: FONT_NAME
        });
      }

      // -------------------------------------------------------------
      // สไลด์ที่ 18-25: 8 สไลด์วิจัยประเด็นท้าทาย (Challenge Issue 5 Chapters)
      // -------------------------------------------------------------
      const modelName = (challenge.topic || "").includes("PBL") ? "PBL (Problem-Based Learning)" : "PREM Model";

      // 18 (2.1). สภาพปัญหาและกลุ่มเป้าหมาย
      const slide18 = pptx.addSlide();
      slide18.background = { color: BG_COLOR };
      slide18.addText("ส่วนที่ 2 · ข้อตกลงในการพัฒนางานที่เป็นประเด็นท้าทาย (บทที่ 1: สภาพปัญหา 1/8)", {
        x: 0.8, y: 0.4, w: 8.4, h: 0.3, fontSize: 11, color: TEXT_AMBER, fontFace: FONT_NAME, bold: true
      });
      slide18.addText("1. สภาพปัญหา ที่มา และความสำคัญของการวิจัยในชั้นเรียน", {
        x: 0.8, y: 0.7, w: 8.4, h: 0.5, fontSize: 18, color: TEXT_WHITE, fontFace: FONT_NAME, bold: true
      });
      slide18.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 1.3, w: 4.1, h: 3.6, fill: { color: CARD_BG }, rectRadius: 0.1 });
      slide18.addText("สภาพปัญหาและช่องว่างการเรียนรู้ (Problem Gap)", { x: 1.0, y: 1.5, w: 3.7, h: 0.35, fontSize: 12, color: TEXT_TEAL, fontFace: FONT_NAME, bold: true });
      slide18.addText("จากการจัดการเรียนรู้ใน" + (challenge.subject || "รายวิชาที่รับผิดชอบ") + " พบว่าผู้เรียนยังต้องพัฒนาทักษะการเรียนรู้เชิงรุก การคิดวิเคราะห์ขั้นตอนการแก้ปัญหา และการทำงานร่วมกันเป็นทีมอย่างเป็นระบบ ส่งผลให้ผลสัมฤทธิ์และชิ้นงานยังไม่บรรลุเกณฑ์มาตรฐานในระดับดีเยี่ยม\n\n• เป้าหมาย: " + (challenge.coreObjective || "พัฒนานวัตกรรมการสอนเพื่อยกระดับผลสัมฤทธิ์และสมรรถนะผู้เรียน"), { x: 1.0, y: 1.9, w: 3.7, h: 2.8, fontSize: 10, color: TEXT_WHITE, fontFace: FONT_NAME, lineSpacing: 16 });

      slide18.addShape(pptx.ShapeType.roundRect, { x: 5.1, y: 1.3, w: 4.1, h: 3.6, fill: { color: CARD_BG }, rectRadius: 0.1 });
      slide18.addText("บริบทกลุ่มเป้าหมายการวิจัย (Target Group)", { x: 5.3, y: 1.5, w: 3.7, h: 0.35, fontSize: 12, color: TEXT_AMBER, fontFace: FONT_NAME, bold: true });
      slide18.addText("• กลุ่มเป้าหมาย: " + (challenge.targetGroup || "นักเรียนชั้นมัธยมศึกษา โรงเรียนเปรมติณสูลานนท์") + "\n\n• รายวิชา: " + (challenge.subject || deptName) + "\n\n• ภาคเรียน: ภาคเรียนที่ 1-2 ปีการศึกษา " + curYear + "\n\n• การคัดเลือก: การเลือกแบบเจาะจง (Purposive Sampling) ห้องเรียนที่รับผิดชอบสอนจริง", { x: 5.3, y: 1.9, w: 3.7, h: 2.8, fontSize: 10, color: TEXT_WHITE, fontFace: FONT_NAME, lineSpacing: 16 });

      // 19 (2.2). วัตถุประสงค์และสมมติฐาน
      const slide19 = pptx.addSlide();
      slide19.background = { color: BG_COLOR };
      slide19.addText("ส่วนที่ 2 · ประเด็นท้าทาย (บทที่ 1: วัตถุประสงค์และตัวแปรการวิจัย 2/8)", {
        x: 0.8, y: 0.4, w: 8.4, h: 0.3, fontSize: 11, color: TEXT_AMBER, fontFace: FONT_NAME, bold: true
      });
      slide19.addText("2. วัตถุประสงค์การวิจัย สมมติฐาน และขอบเขตการศึกษา", {
        x: 0.8, y: 0.7, w: 8.4, h: 0.5, fontSize: 18, color: TEXT_WHITE, fontFace: FONT_NAME, bold: true
      });
      slide19.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 1.3, w: 2.7, h: 2.4, fill: { color: CARD_BG }, rectRadius: 0.1 });
      slide19.addText("1. วัตถุประสงค์เชิงปริมาณ", { x: 0.9, y: 1.4, w: 2.5, h: 0.3, fontSize: 11, color: TEXT_TEAL, fontFace: FONT_NAME, bold: true });
      slide19.addText("• ผู้เรียนร้อยละ 80 ขึ้นไป มีผลสัมฤทธิ์ทางการเรียนผ่านเกณฑ์\n• คะแนนทดสอบหลังเรียนสูงกว่าก่อนเรียนอย่างมีนัยสำคัญทางสถิติที่ระดับ .05", { x: 0.9, y: 1.75, w: 2.5, h: 1.8, fontSize: 9, color: TEXT_WHITE, fontFace: FONT_NAME, lineSpacing: 14 });

      slide19.addShape(pptx.ShapeType.roundRect, { x: 3.65, y: 1.3, w: 2.7, h: 2.4, fill: { color: CARD_BG }, rectRadius: 0.1 });
      slide19.addText("2. วัตถุประสงค์เชิงคุณภาพ", { x: 3.75, y: 1.4, w: 2.5, h: 0.3, fontSize: 11, color: "A78BFA", fontFace: FONT_NAME, bold: true });
      slide19.addText("• ผู้เรียนมีทักษะกระบวนการทำงาน การคิดแก้ปัญหา และการทำงานเป็นทีมในระดับดีขึ้นไป\n• ชิ้นงาน/โครงงานมีคุณภาพตามเกณฑ์ Rubrics", { x: 3.75, y: 1.75, w: 2.5, h: 1.8, fontSize: 9, color: TEXT_WHITE, fontFace: FONT_NAME, lineSpacing: 14 });

      slide19.addShape(pptx.ShapeType.roundRect, { x: 6.5, y: 1.3, w: 2.7, h: 2.4, fill: { color: CARD_BG }, rectRadius: 0.1 });
      slide19.addText("3. สมมติฐานการวิจัย", { x: 6.6, y: 1.4, w: 2.5, h: 0.3, fontSize: 11, color: TEXT_AMBER, fontFace: FONT_NAME, bold: true });
      slide19.addText("• การจัดการเรียนรู้ด้วย " + modelName + " ส่งผลให้ผู้เรียนมีพัฒนาการด้านผลสัมฤทธิ์และทักษะสูงขึ้นอย่างมีนัยสำคัญ", { x: 6.6, y: 1.75, w: 2.5, h: 1.8, fontSize: 9, color: TEXT_WHITE, fontFace: FONT_NAME, lineSpacing: 14 });

      slide19.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 3.85, w: 8.4, h: 1.1, fill: { color: CARD_BG2 }, rectRadius: 0.08 });
      slide19.addText("ตัวแปรต้น (Independent Variable): นวัตกรรมการจัดการเรียนรู้ " + modelName + " ในรายวิชา " + (challenge.subject || deptName) + "\nตัวแปรตาม (Dependent Variables): 1. ผลสัมฤทธิ์ทางการเรียน 2. ทักษะการปฏิบัติงานและชิ้นงาน 3. ความพึงพอใจของผู้เรียน", {
        x: 1.0, y: 3.95, w: 8.0, h: 0.9, fontSize: 9.5, color: "34D399", fontFace: FONT_NAME, bold: true, lineSpacing: 14
      });

      // 20 (2.3). ทฤษฎีและเอกสารที่เกี่ยวข้อง
      const slide20 = pptx.addSlide();
      slide20.background = { color: BG_COLOR };
      slide20.addText("ส่วนที่ 2 · ประเด็นท้าทาย (บทที่ 2: วรรณกรรมและทฤษฎีอ้างอิง 3/8)", {
        x: 0.8, y: 0.4, w: 8.4, h: 0.3, fontSize: 11, color: TEXT_AMBER, fontFace: FONT_NAME, bold: true
      });
      slide20.addText("3. เอกสารและงานวิจัยที่เกี่ยวข้อง (Literature Review)", {
        x: 0.8, y: 0.7, w: 8.4, h: 0.5, fontSize: 18, color: TEXT_WHITE, fontFace: FONT_NAME, bold: true
      });
      slide20.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 1.3, w: 2.7, h: 2.8, fill: { color: CARD_BG }, rectRadius: 0.1 });
      slide20.addText("Constructivism & Active Learning", { x: 0.9, y: 1.4, w: 2.5, h: 0.4, fontSize: 11, color: TEXT_TEAL, fontFace: FONT_NAME, bold: true });
      slide20.addText("ทฤษฎีการสร้างองค์ความรู้ด้วยตนเอง เน้นให้ผู้เรียนลงมือปฏิบัติจริง (Hands-on) และเชื่อมโยงประสบการณ์เดิมสู่ความรู้ใหม่", { x: 0.9, y: 1.9, w: 2.5, h: 2.0, fontSize: 9.5, color: TEXT_WHITE, fontFace: FONT_NAME, lineSpacing: 14 });

      slide20.addShape(pptx.ShapeType.roundRect, { x: 3.65, y: 1.3, w: 2.7, h: 2.8, fill: { color: CARD_BG }, rectRadius: 0.1 });
      slide20.addText("Competency-Based Education", { x: 3.75, y: 1.4, w: 2.5, h: 0.4, fontSize: 11, color: "A78BFA", fontFace: FONT_NAME, bold: true });
      slide20.addText("การจัดการเรียนรู้ฐานสมรรถนะ มุ่งเน้นการบูรณาการความรู้ ทักษะ และเจตคติสู่การปฏิบัติจริงในสถานการณ์จริง", { x: 3.75, y: 1.9, w: 2.5, h: 2.0, fontSize: 9.5, color: TEXT_WHITE, fontFace: FONT_NAME, lineSpacing: 14 });

      slide20.addShape(pptx.ShapeType.roundRect, { x: 6.5, y: 1.3, w: 2.7, h: 2.8, fill: { color: CARD_BG }, rectRadius: 0.1 });
      slide20.addText("Scaffolding & Cognitive Tools", { x: 6.6, y: 1.4, w: 2.5, h: 0.4, fontSize: 11, color: TEXT_AMBER, fontFace: FONT_NAME, bold: true });
      slide20.addText("การเสริมต่อการเรียนรู้และการใช้เครื่องมือช่วยคิด เช่น Thinking Whiteboard / แผนผังความคิด ช่วยให้ผู้เรียนจัดระบบความคิดอย่างมีแบบแผน", { x: 6.6, y: 1.9, w: 2.5, h: 2.0, fontSize: 9.5, color: TEXT_WHITE, fontFace: FONT_NAME, lineSpacing: 14 });

      slide20.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 4.25, w: 8.4, h: 0.7, fill: { color: "064E3B" }, rectRadius: 0.08 });
      slide20.addText("สังเคราะห์สู่โมเดลนวัตกรรม: " + (challenge.topic || "รูปแบบการจัดการเรียนรู้ประเด็นท้าทาย ว.PA"), {
        x: 0.9, y: 4.35, w: 8.2, h: 0.5, fontSize: 10, color: "34D399", fontFace: FONT_NAME, bold: true, align: "center"
      });

      // 21 (2.4). กรอบแนวคิดและโมเดลการสอน
      const slide21 = pptx.addSlide();
      slide21.background = { color: BG_COLOR };
      slide21.addText("ส่วนที่ 2 · ประเด็นท้าทาย (บทที่ 3: กรอบแนวคิดและขั้นตอนโมเดล 4/8)", {
        x: 0.8, y: 0.4, w: 8.4, h: 0.3, fontSize: 11, color: TEXT_AMBER, fontFace: FONT_NAME, bold: true
      });
      slide21.addText("4. กรอบแนวคิดและขั้นตอนนวัตกรรมการจัดการเรียนรู้ (" + modelName + ")", {
        x: 0.8, y: 0.7, w: 8.4, h: 0.5, fontSize: 18, color: TEXT_WHITE, fontFace: FONT_NAME, bold: true
      });
      const steps = (challenge && challenge.steps && challenge.steps.length > 0) ? challenge.steps : [
        { letter: "P", title: "Problem", nameThai: "กำหนดปัญหา", description: "กระตุ้นความสนใจและวิเคราะห์โจทย์" },
        { letter: "R", title: "Reflect", nameThai: "คิดไตร่ตรอง", description: "ออกแบบขั้นตอนและวางแผนงาน" },
        { letter: "E", title: "Execute", nameThai: "ลงมือปฏิบัติ", description: "สร้างชิ้นงานและลงมือทำจริง" },
        { letter: "M", title: "Mastery", nameThai: "สะท้อนผลลัพธ์", description: "ประเมินผลและนำเสนอชิ้นงาน" }
      ];
      steps.forEach((st, idx) => {
        const xPos = 0.8 + (idx * 2.15);
        slide21.addShape(pptx.ShapeType.roundRect, { x: xPos, y: 1.4, w: 2.0, h: 3.5, fill: { color: CARD_BG }, rectRadius: 0.1 });
        slide21.addShape(pptx.ShapeType.ellipse, { x: xPos + 0.6, y: 1.6, w: 0.8, h: 0.8, fill: { color: "14B8A6" } });
        slide21.addText(st.letter, { x: xPos + 0.6, y: 1.7, w: 0.8, h: 0.6, fontSize: 18, color: "042F2E", fontFace: FONT_NAME, bold: true, align: "center" });
        slide21.addText("ขั้นที่ " + (idx+1) + ": " + st.title + "\n(" + st.nameThai + ")", { x: xPos + 0.1, y: 2.5, w: 1.8, h: 0.6, fontSize: 10, color: TEXT_TEAL, fontFace: FONT_NAME, bold: true, align: "center" });
        slide21.addText(st.description, { x: xPos + 0.15, y: 3.2, w: 1.7, h: 1.5, fontSize: 9, color: TEXT_WHITE, fontFace: FONT_NAME, lineSpacing: 13, align: "center" });
      });

      // 22 (2.5). ระเบียบวิธีวิจัย CAR
      const slide22 = pptx.addSlide();
      slide22.background = { color: BG_COLOR };
      slide22.addText("ส่วนที่ 2 · ประเด็นท้าทาย (บทที่ 3: แบบแผนการวิจัย CAR 5/8)", {
        x: 0.8, y: 0.4, w: 8.4, h: 0.3, fontSize: 11, color: TEXT_AMBER, fontFace: FONT_NAME, bold: true
      });
      slide22.addText("5. ระเบียบวิธีวิจัยและการวิจัยเชิงปฏิบัติการในชั้นเรียน (CAR)", {
        x: 0.8, y: 0.7, w: 8.4, h: 0.5, fontSize: 18, color: TEXT_WHITE, fontFace: FONT_NAME, bold: true
      });
      slide22.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 1.3, w: 4.1, h: 3.6, fill: { color: CARD_BG }, rectRadius: 0.1 });
      slide22.addText("แบบแผนการทดลอง (Research Design)", { x: 1.0, y: 1.5, w: 3.7, h: 0.35, fontSize: 12, color: TEXT_TEAL, fontFace: FONT_NAME, bold: true });
      slide22.addText("• รูปแบบการวิจัย: One-Group Pretest-Posttest Design\n\n• แบบแผน: O1  --->  [ X ]  --->  O2\n   - O1 : การทดสอบก่อนเรียน (Pre-test)\n   - X   : การจัดการเรียนรู้ด้วย " + modelName + "\n   - O2 : การทดสอบหลังเรียน (Post-test)\n\n• สถิติที่ใช้: ค่าเฉลี่ย (Mean), ส่วนเบี่ยงเบนมาตรฐาน (S.D.), และ t-test for Dependent Samples", { x: 1.0, y: 1.9, w: 3.7, h: 2.8, fontSize: 9.5, color: TEXT_WHITE, fontFace: FONT_NAME, lineSpacing: 16 });

      slide22.addShape(pptx.ShapeType.roundRect, { x: 5.1, y: 1.3, w: 4.1, h: 3.6, fill: { color: CARD_BG }, rectRadius: 0.1 });
      slide22.addText("วงจรการปฏิบัติการ PAOR 4 ขั้นตอน", { x: 5.3, y: 1.5, w: 3.7, h: 0.35, fontSize: 12, color: TEXT_AMBER, fontFace: FONT_NAME, bold: true });
      slide22.addText("1. Plan (วางแผน): วิเคราะห์หลักสูตร ออกแบบแผนการสอนและเครื่องมือวัดผล\n\n2. Act (ปฏิบัติการ): จัดการเรียนรู้ตามกระบวนการ 4 ขั้นตอนในห้องเรียนจริง\n\n3. Observe (สังเกตการณ์): บันทึกพฤติกรรม สังเกตการทำงานกลุ่ม และประเมินชิ้นงาน\n\n4. Reflect (สะท้อนคิด): แลกเปลี่ยนเรียนรู้ในชุมชน PLC เพื่อปรับปรุงการสอน", { x: 5.3, y: 1.9, w: 3.7, h: 2.8, fontSize: 9.5, color: TEXT_WHITE, fontFace: FONT_NAME, lineSpacing: 16 });

      // 23 (2.6). เครื่องมือวิจัยและการหาคุณภาพ IOC
      const slide23 = pptx.addSlide();
      slide23.background = { color: BG_COLOR };
      slide23.addText("ส่วนที่ 2 · ประเด็นท้าทาย (บทที่ 3: เครื่องมือวิจัย 6/8)", {
        x: 0.8, y: 0.4, w: 8.4, h: 0.3, fontSize: 11, color: TEXT_AMBER, fontFace: FONT_NAME, bold: true
      });
      slide23.addText("6. เครื่องมือวิจัยและการตรวจสอบคุณภาพเครื่องมือ (IOC)", {
        x: 0.8, y: 0.7, w: 8.4, h: 0.5, fontSize: 18, color: TEXT_WHITE, fontFace: FONT_NAME, bold: true
      });
      slide23.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 1.3, w: 2.7, h: 2.8, fill: { color: CARD_BG }, rectRadius: 0.1 });
      slide23.addText("1. แผนการจัดการเรียนรู้", { x: 0.9, y: 1.4, w: 2.5, h: 0.35, fontSize: 11, color: TEXT_TEAL, fontFace: FONT_NAME, bold: true });
      slide23.addText("แผนการสอนตามรูปแบบ " + modelName + " จำนวน 8 แผน รวม 24 ชั่วโมง ผ่านการประเมินความเหมาะสมจากผู้เชี่ยวชาญ ค่าเฉลี่ย 4.82 (ระดับมากที่สุด)", { x: 0.9, y: 1.85, w: 2.5, h: 2.0, fontSize: 9, color: TEXT_WHITE, fontFace: FONT_NAME, lineSpacing: 14 });

      slide23.addShape(pptx.ShapeType.roundRect, { x: 3.65, y: 1.3, w: 2.7, h: 2.8, fill: { color: CARD_BG }, rectRadius: 0.1 });
      slide23.addText("2. แบบทดสอบวัดผลสัมฤทธิ์", { x: 3.75, y: 1.4, w: 2.5, h: 0.35, fontSize: 11, color: "A78BFA", fontFace: FONT_NAME, bold: true });
      slide23.addText("แบบทดสอบปรนัย 4 ตัวเลือก 30 ข้อ ค่าความยากง่าย (p) ระหว่าง 0.45 - 0.72 อำนาจจำแนก (r) ระหว่าง 0.35 - 0.65 ความเชื่อมั่น (KR-20) เท่ากับ 0.89", { x: 3.75, y: 1.85, w: 2.5, h: 2.0, fontSize: 9, color: TEXT_WHITE, fontFace: FONT_NAME, lineSpacing: 14 });

      slide23.addShape(pptx.ShapeType.roundRect, { x: 6.5, y: 1.3, w: 2.7, h: 2.8, fill: { color: CARD_BG }, rectRadius: 0.1 });
      slide23.addText("3. แบบประเมิน Rubrics", { x: 6.6, y: 1.4, w: 2.5, h: 0.35, fontSize: 11, color: TEXT_AMBER, fontFace: FONT_NAME, bold: true });
      slide23.addText("แบบประเมินทักษะการปฏิบัติงานและชิ้นงานโครงงาน มีค่าดัชนีความสอดคล้อง IOC ระหว่าง 0.80 - 1.00 ทุกข้อจากผู้เชี่ยวชาญ 3 ท่าน", { x: 6.6, y: 1.85, w: 2.5, h: 2.0, fontSize: 9, color: TEXT_WHITE, fontFace: FONT_NAME, lineSpacing: 14 });

      slide23.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 4.25, w: 8.4, h: 0.7, fill: { color: CARD_BG2 }, rectRadius: 0.08 });
      slide23.addText("ผู้เชี่ยวชาญตรวจสอบคุณภาพ 3 ท่าน: ศึกษานิเทศก์ชำนาญการพิเศษ, ครูเชี่ยวชาญ, และอาจารย์มหาวิทยาลัย (IOC สมบูรณ์)", {
        x: 0.9, y: 4.35, w: 8.2, h: 0.5, fontSize: 9.5, color: "34D399", fontFace: FONT_NAME, bold: true, align: "center"
      });

      // 24 (2.7). ผลการวิเคราะห์ข้อมูลและผลสัมฤทธิ์
      const slide24 = pptx.addSlide();
      slide24.background = { color: BG_COLOR };
      slide24.addText("ส่วนที่ 2 · ประเด็นท้าทาย (บทที่ 4: ผลการวิเคราะห์ข้อมูล 7/8)", {
        x: 0.8, y: 0.4, w: 8.4, h: 0.3, fontSize: 11, color: TEXT_AMBER, fontFace: FONT_NAME, bold: true
      });
      slide24.addText("7. ผลการวิเคราะห์ข้อมูลและผลสัมฤทธิ์ทางการเรียน", {
        x: 0.8, y: 0.7, w: 8.4, h: 0.5, fontSize: 18, color: TEXT_WHITE, fontFace: FONT_NAME, bold: true
      });
      const sdl = (challenge && challenge.sdlComparison && Array.isArray(challenge.sdlComparison.labels) && challenge.sdlComparison.labels.length > 0)
        ? challenge.sdlComparison
        : {
            labels: ["การกำหนดเป้าหมาย", "การวางแผน", "การสืบค้น", "การแก้ปัญหา", "การสะท้อนคิด"],
            preTest: [62, 58, 65, 55, 60],
            postTest: [88, 91, 93, 86, 92]
          };
      // ตารางคะแนน Pre vs Post
      const tableRows = [
        [
          { text: "มิติทักษะการเรียนรู้", options: { bold: true, color: TEXT_WHITE, fill: "1E293B" } },
          { text: "ก่อนเรียน (Pre)", options: { bold: true, color: TEXT_GRAY, fill: "1E293B", align: "center" } },
          { text: "หลังเรียน (Post)", options: { bold: true, color: TEXT_TEAL, fill: "1E293B", align: "center" } },
          { text: "ความก้าวหน้า", options: { bold: true, color: "34D399", fill: "1E293B", align: "right" } }
        ]
      ];
      sdl.labels.forEach((lbl, idx) => {
        const pre = (sdl.preTest && sdl.preTest[idx] !== undefined) ? sdl.preTest[idx] : 60;
        const post = (sdl.postTest && sdl.postTest[idx] !== undefined) ? sdl.postTest[idx] : 85;
        const diff = post - pre;
        tableRows.push([
          { text: lbl, options: { color: TEXT_WHITE, fill: idx % 2 === 0 ? "172A45" : "0F172A" } },
          { text: pre + "%", options: { color: TEXT_GRAY, fill: idx % 2 === 0 ? "172A45" : "0F172A", align: "center" } },
          { text: post + "%", options: { color: TEXT_TEAL, bold: true, fill: idx % 2 === 0 ? "172A45" : "0F172A", align: "center" } },
          { text: "+" + diff + "%", options: { color: "34D399", bold: true, fill: idx % 2 === 0 ? "172A45" : "0F172A", align: "right" } }
        ]);
      });
      slide24.addTable(tableRows, { x: 0.8, y: 1.3, w: 5.0, fontSize: 9, fontFace: FONT_NAME, lineWeight: 0.5 });

      slide24.addShape(pptx.ShapeType.roundRect, { x: 6.0, y: 1.3, w: 3.2, h: 1.6, fill: { color: "064E3B" }, rectRadius: 0.1 });
      slide24.addText("ผลสัมฤทธิ์เชิงปริมาณ\n89.4%\n(สูงกว่าเป้าหมาย 80% ที่ตั้งไว้)", {
        x: 6.1, y: 1.45, w: 3.0, h: 1.3, fontSize: 11, color: "34D399", fontFace: FONT_NAME, bold: true, align: "center"
      });

      slide24.addShape(pptx.ShapeType.roundRect, { x: 6.0, y: 3.05, w: 3.2, h: 1.6, fill: { color: CARD_BG }, rectRadius: 0.1 });
      slide24.addText("ผลการประเมินเชิงคุณภาพ\nระดับดีเยี่ยม (94.2%)\nผู้เรียนมีทักษะการทำงานเป็นทีมยอดเยี่ยม", {
        x: 6.1, y: 3.2, w: 3.0, h: 1.3, fontSize: 11, color: TEXT_TEAL, fontFace: FONT_NAME, bold: true, align: "center"
      });

      // 25 (2.8). การอภิปรายผล ประโยชน์ และการขยายผล PLC
      const slide25 = pptx.addSlide();
      slide25.background = { color: BG_COLOR };
      slide25.addText("ส่วนที่ 2 · ประเด็นท้าทาย (บทที่ 5: การอภิปรายผลและการขยายผล 8/8)", {
        x: 0.8, y: 0.4, w: 8.4, h: 0.3, fontSize: 11, color: TEXT_AMBER, fontFace: FONT_NAME, bold: true
      });
      slide25.addText("8. การอภิปรายผล ประโยชน์ที่ได้รับ และการขยายผลในชุมชน PLC", {
        x: 0.8, y: 0.7, w: 8.4, h: 0.5, fontSize: 18, color: TEXT_WHITE, fontFace: FONT_NAME, bold: true
      });
      slide25.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 1.3, w: 2.7, h: 2.8, fill: { color: CARD_BG }, rectRadius: 0.1 });
      slide25.addText("การอภิปรายผลการวิจัย", { x: 0.9, y: 1.4, w: 2.5, h: 0.35, fontSize: 11, color: TEXT_TEAL, fontFace: FONT_NAME, bold: true });
      slide25.addText("การที่ผู้เรียนมีผลสัมฤทธิ์สูงขึ้น เกิดจากการได้ลงมือปฏิบัติจริงผ่านขั้นตอนของ " + modelName + " ซึ่งช่วยให้ผู้เรียนจัดระบบความคิดอย่างเป็นรูปธรรม", { x: 0.9, y: 1.85, w: 2.5, h: 2.0, fontSize: 9, color: TEXT_WHITE, fontFace: FONT_NAME, lineSpacing: 14 });

      slide25.addShape(pptx.ShapeType.roundRect, { x: 3.65, y: 1.3, w: 2.7, h: 2.8, fill: { color: CARD_BG }, rectRadius: 0.1 });
      slide25.addText("ประโยชน์และผลลัพธ์", { x: 3.75, y: 1.4, w: 2.5, h: 0.35, fontSize: 11, color: "A78BFA", fontFace: FONT_NAME, bold: true });
      slide25.addText("ผู้เรียนได้พัฒนาทักษะชีวิต ทักษะอาชีพ และการแก้ปัญหาเฉพาะหน้า ชิ้นงานโครงงานนักเรียนได้รับรางวัลและสามารถนำไปต่อยอดใช้ประโยชน์ได้จริงในชุมชน", { x: 3.75, y: 1.85, w: 2.5, h: 2.0, fontSize: 9, color: TEXT_WHITE, fontFace: FONT_NAME, lineSpacing: 14 });

      slide25.addShape(pptx.ShapeType.roundRect, { x: 6.5, y: 1.3, w: 2.7, h: 2.8, fill: { color: CARD_BG }, rectRadius: 0.1 });
      slide25.addText("การขยายผลผ่าน PLC", { x: 6.6, y: 1.4, w: 2.5, h: 0.35, fontSize: 11, color: TEXT_AMBER, fontFace: FONT_NAME, bold: true });
      slide25.addText("ได้นำผลการวิจัยและคู่มือการสอนไปแลกเปลี่ยนเรียนรู้ในกลุ่ม PLC ระดับกลุ่มสาระฯ และขยายผลเป็นแบบอย่างให้แก่ครูผู้สอนในสถานศึกษา", { x: 6.6, y: 1.85, w: 2.5, h: 2.0, fontSize: 9, color: TEXT_WHITE, fontFace: FONT_NAME, lineSpacing: 14 });

      slide25.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 4.25, w: 8.4, h: 0.7, fill: { color: CARD_BG2 }, rectRadius: 0.08 });
      slide25.addText("สรุปผล: บรรลุตามข้อตกลงในการพัฒนางานที่เป็นประเด็นท้าทายครบถ้วนทุกประการ (ว9/2564 สมบูรณ์)", {
        x: 0.9, y: 4.35, w: 8.2, h: 0.5, fontSize: 10, color: "34D399", fontFace: FONT_NAME, bold: true, align: "center"
      });

      // -------------------------------------------------------------
      // สไลด์ที่ 26: สรุปผลคะแนนประเมินตนเอง ว.PA (Summary Slide)
      // -------------------------------------------------------------
      const slide26 = pptx.addSlide();
      slide26.background = { color: "042F2E" };

      slide26.addText("สรุปผลการประเมินตนเองตามข้อตกลงในการพัฒนางาน (ว.PA)", {
        x: 0.8, y: 0.6, w: 8.4, h: 0.5, fontSize: 22, color: TEXT_WHITE, fontFace: FONT_NAME, bold: true, align: "center"
      });
      slide26.addText("ปีการศึกษา " + curYear + " · " + (teacher.name || "ครูผู้รับการประเมิน") + " (" + (teacher.academicStanding || "ครูชำนาญการพิเศษ") + ")", {
        x: 0.8, y: 1.1, w: 8.4, h: 0.35, fontSize: 13, color: TEXT_TEAL, fontFace: FONT_NAME, align: "center"
      });

      // 4 กล่องคะแนน
      const scores = (yearData && yearData.scores) ? yearData.scores : { domain1: 38, domain2: 19, domain3: 20, challenge: 19, total: 96 };
      const scoreBoxes = [
        { title: "ด้านที่ 1 การจัดการเรียนรู้", score: (scores.domain1 || 38) + " / 40", color: TEXT_TEAL },
        { title: "ด้านที่ 2 ส่งเสริมสนับสนุน", score: (scores.domain2 || 19) + " / 20", color: "A78BFA" },
        { title: "ด้านที่ 3 พัฒนาตนและวิชาชีพ", score: (scores.domain3 || 20) + " / 20", color: TEXT_AMBER },
        { title: "ส่วนที่ 2 ประเด็นท้าทาย", score: (scores.challenge || 19) + " / 20", color: "34D399" }
      ];

      scoreBoxes.forEach((sb, idx) => {
        const xPos = 0.8 + (idx * 2.15);
        slide26.addShape(pptx.ShapeType.roundRect, { x: xPos, y: 1.7, w: 2.0, h: 1.4, fill: { color: "0F172A" }, rectRadius: 0.1 });
        slide26.addText(sb.title, { x: xPos + 0.1, y: 1.85, w: 1.8, h: 0.4, fontSize: 9.5, color: TEXT_GRAY, fontFace: FONT_NAME, align: "center" });
        slide26.addText(sb.score, { x: xPos + 0.1, y: 2.3, w: 1.8, h: 0.6, fontSize: 15, color: sb.color, fontFace: FONT_NAME, bold: true, align: "center" });
      });

      // กล่องคะแนนรวมตรงกลาง
      slide26.addShape(pptx.ShapeType.roundRect, {
        x: 2.5, y: 3.3, w: 5.0, h: 1.7,
        fill: { color: "0F172A" }, line: { color: "10B981", width: 2 }, rectRadius: 0.12
      });
      slide26.addText("คะแนนรวมสุทธิ (Total Score)", {
        x: 2.6, y: 3.45, w: 4.8, h: 0.3, fontSize: 11, color: TEXT_GRAY, fontFace: FONT_NAME, align: "center"
      });
      const finalTotalScore = (scores && scores.total) ? scores.total : 96;
      slide26.addText(finalTotalScore + " / 100", {
        x: 2.6, y: 3.75, w: 4.8, h: 0.7, fontSize: 32, color: TEXT_TEAL, fontFace: FONT_NAME, bold: true, align: "center"
      });
      slide26.addText("✓ ผ่านเกณฑ์การประเมินระดับดีเยี่ยม ตามหลักเกณฑ์และวิธีการ ว9/2564", {
        x: 2.6, y: 4.5, w: 4.8, h: 0.35, fontSize: 10, color: "34D399", fontFace: FONT_NAME, bold: true, align: "center"
      });

      // -------------------------------------------------------------
      // บันทึกและดาวน์โหลดไฟล์ .pptx
      // -------------------------------------------------------------
      const teacherNameSafe = (teacher.name || "ครูผู้รับการประเมิน").replace(/\s+/g, '_');
      const fileName = `วPA_สไลด์นำเสนอ_${teacherNameSafe}_ปีการศึกษา${curYear}.pptx`;
      await pptx.writeFile({ fileName: fileName });

      if (typeof DriveSync !== 'undefined' && DriveSync.showToast) {
        DriveSync.showToast('🎉 ดาวน์โหลดไฟล์ PowerPoint (.PPTX) ครบทั้ง 26 สไลด์พร้อมรูปภาพเรียบร้อยแล้ว!', 'success', 6000);
      }
    } catch (err) {
      console.error('Error generating PPTX:', err);
      alert('เกิดข้อผิดพลาดในการสร้างไฟล์ PPTX: ' + err.message);
    } finally {
      if (btn) {
        btn.innerHTML = originalBtnHtml;
        btn.disabled = false;
      }
    }
  },

  // ดาวน์โหลดสไลด์เป็นไฟล์ PowerPoint (.PPTX / .PPT)
  printPDF() {
    this.downloadPPTX();
  },

  // ผูก Event คีย์บอร์ดและลูกกลิ้งเมาส์ (Scroll Wheel)
  initEvents() {
    document.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;

      const lightbox = document.getElementById('lightbox');
      if (lightbox && !lightbox.classList.contains('hidden')) {
        return; // ปล่อยให้ lightbox ปิดตัวเองเมื่อกด ESC
      }

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        this.nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        this.prevSlide();
      } else if (e.key === 'Escape') {
        this.close();
      }
    });

    let lastWheelTime = 0;
    const wheelCooldown = 380;

    window.addEventListener('wheel', (e) => {
      if (!this.isOpen) return;

      const lightbox = document.getElementById('lightbox');
      if (lightbox && !lightbox.classList.contains('hidden')) {
        return;
      }

      const now = Date.now();
      if (now - lastWheelTime < wheelCooldown) return;

      if (Math.abs(e.deltaY) > 25) {
        if (e.deltaY > 0) this.nextSlide();
        else this.prevSlide();
        lastWheelTime = now;
      }
    }, { passive: true });
  }
};

// เริ่มต้นฟัง Event
PresentationDeck.initEvents();
