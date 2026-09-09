/**
 * PAFolio - e-Certificate & Awards Vault v5.0
 * ระบบคลังเกียรติบัตร โล่รางวัล และผลงานยกย่องเชิดชูเกียรติอัจฉริยะ
 */

const CertificateVault = {
  activeCategory: 'all',
  searchQuery: '',

  // ฐานข้อมูลเกียรติบัตรและรางวัลมาตรฐาน (Mock Baseline Data)
  sampleCertificates: [
    {
      id: 'cert-1',
      title: 'รางวัลชนะเลิศเหรียญทอง OBEC AWARDS (ครูผู้สอนยอดเยี่ยม)',
      category: 'national',
      categoryThai: 'ระดับชาติ / นานาชาติ',
      levelBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      badgeIcon: 'fa-trophy text-amber-400',
      issuer: 'สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.)',
      year: '2568',
      date: '15 สิงหาคม 2568',
      imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      description: 'รางวัลทรงคุณค่า สพฐ. (OBEC AWARDS) ด้านนวัตกรรมการจัดการเรียนรู้เชิงรุก (Active Learning) ระดับมัธยมศึกษาตอนปลาย',
      docUrl: '#'
    },
    {
      id: 'cert-2',
      title: 'รางวัลคุรุชนคนคุณธรรม "ดีเด่น" ระดับประเทศ',
      category: 'national',
      categoryThai: 'ระดับชาติ / นานาชาติ',
      levelBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      badgeIcon: 'fa-award text-amber-400',
      issuer: 'สำนักงานเลขาธิการคุรุสภา',
      year: '2567',
      date: '16 มกราคม 2567',
      imageUrl: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=800&q=80',
      description: 'โครงการโรงเรียนคุณธรรม สพฐ. เพื่อยกย่องผู้ประพฤติปฏิบัติตนตามมาตรฐานวิชาชีพและจรรยาบรรณวิชาชีพครู',
      docUrl: '#'
    },
    {
      id: 'cert-3',
      title: 'รางวัลนวัตกรรมการจัดการเรียนรู้ยอดเยี่ยม ระดับภาค',
      category: 'regional',
      categoryThai: 'ระดับภาค / เขตตรวจ',
      levelBadge: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
      badgeIcon: 'fa-medal text-teal-400',
      issuer: 'ศูนย์ขับเคลื่อนนวัตกรรมการศึกษา ภาคตะวันออกเฉียงเหนือ',
      year: '2568',
      date: '20 กรกฎาคม 2568',
      imageUrl: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=800&q=80',
      description: 'การพัฒนารูปแบบการสอน PREM Model ร่วมกับ Thinking Whiteboard เพื่อส่งเสริมทักษะการเรียนรู้เชิงรุก',
      docUrl: '#'
    },
    {
      id: 'cert-4',
      title: 'รางวัล "ครูดีในดวงใจ" ระดับเขตพื้นที่การศึกษา',
      category: 'district',
      categoryThai: 'ระดับเขตพื้นที่การศึกษา',
      levelBadge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      badgeIcon: 'fa-star text-blue-400',
      issuer: 'สำนักงานเขตพื้นที่การศึกษามัธยมศึกษาขอนแก่น (สพม.ขอนแก่น)',
      year: '2568',
      date: '16 มกราคม 2568',
      imageUrl: 'https://images.unsplash.com/photo-1579389083078-4e7018379f7e?auto=format&fit=crop&w=800&q=80',
      description: 'ครูผู้มีจิตวิญญาณความเป็นครู ทุ่มเทเสียสละ และเป็นแบบอย่างที่ดีในการจัดการศึกษา',
      docUrl: '#'
    },
    {
      id: 'cert-5',
      title: 'รางวัล "หนึ่งโรงเรียน หนึ่งนวัตกรรม" (ระดับเหรียญทอง)',
      category: 'district',
      categoryThai: 'ระดับเขตพื้นที่การศึกษา',
      levelBadge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      badgeIcon: 'fa-lightbulb text-blue-400',
      issuer: 'สพม.ขอนแก่น ร่วมกับคุรุสภา',
      year: '2567',
      date: '10 กันยายน 2567',
      imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      description: 'นวัตกรรมสื่อการสอนชุด Thinking Whiteboard เพื่อการแก้ปัญหาผลสัมฤทธิ์ทางการเรียนในศตวรรษที่ 21',
      docUrl: '#'
    },
    {
      id: 'cert-6',
      title: 'รางวัลครูผู้มีผลงานการปฏิบัติหน้าที่ดีเด่น ประจำปี 2568',
      category: 'school',
      categoryThai: 'ระดับสถานศึกษา',
      levelBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      badgeIcon: 'fa-certificate text-emerald-400',
      issuer: 'โรงเรียนเปรมติณสูลานนท์',
      year: '2568',
      date: '28 กุมภาพันธ์ 2568',
      imageUrl: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=800&q=80',
      description: 'การปฏิบัติงานวิชาการ การดูแลช่วยเหลือนักเรียน และการสร้างชื่อเสียงให้แก่สถานศึกษา',
      docUrl: '#'
    }
  ],

  // ดึงรายการเกียรติบัตรทั้งหมด (ดึงรูปภาพจริงจากโฟลเดอร์เกียรติบัตรใน Google Drive เป็นอันดับแรก)
  getAllCertificates() {
    let driveCerts = [];
    const seenIds = new Set();

    // 1. ดึงข้อมูลตรงจาก DriveSync.syncedData.certificates ที่สแกนได้จาก Google Drive
    if (typeof DriveSync !== 'undefined' && DriveSync.syncedData) {
      if (Array.isArray(DriveSync.syncedData.certificates) && DriveSync.syncedData.certificates.length > 0) {
        DriveSync.syncedData.certificates.forEach(c => {
          if (!seenIds.has(c.id)) {
            seenIds.add(c.id);
            driveCerts.push(c);
          }
        });
      }

      // 2. ตรวจสอบเพิ่มเติมในตัวชี้วัดทั้งหมด เผื่อมีโฟลเดอร์หรือไฟล์เกียรติบัตรแทรกอยู่
      if (DriveSync.syncedData.indicators) {
        Object.values(DriveSync.syncedData.indicators).forEach(ind => {
          const isCertFolder = ind.folderName && (
            ind.folderName.includes('เกียรติบัตร') || 
            ind.folderName.includes('Certificates') || 
            ind.folderName.includes('รางวัล') || 
            ind.folderName.includes('วุฒิบัตร')
          );
          
          if (ind.files && ind.files.length > 0) {
            ind.files.forEach((file, fIdx) => {
              const fileName = (file.title || '').toLowerCase();
              const isCertFile = isCertFolder || 
                                fileName.includes('เกียรติบัตร') || 
                                fileName.includes('วุฒิบัตร') || 
                                fileName.includes('รางวัล') || 
                                fileName.includes('cert');

              if (isCertFile && (file.type === 'image' || file.type === 'pdf')) {
                const cId = `drive-cert-${file.id || fIdx}`;
                if (!seenIds.has(cId)) {
                  seenIds.add(cId);
                  
                  // วิเคราะห์ระดับรางวัลจากชื่อ
                  let cat = 'national';
                  let catThai = 'ระดับชาติ / นานาชาติ';
                  let badge = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                  let icon = 'fa-trophy text-amber-400';

                  const fullText = (ind.folderName + ' ' + file.title).toLowerCase();
                  if (fullText.includes('ภาค') || fullText.includes('จังหวัด')) {
                    cat = 'regional'; catThai = 'ระดับภาค / จังหวัด';
                    badge = 'bg-teal-500/20 text-teal-300 border-teal-500/40';
                    icon = 'fa-medal text-teal-400';
                  } else if (fullText.includes('เขต') || fullText.includes('สพม') || fullText.includes('สพป')) {
                    cat = 'district'; catThai = 'ระดับเขตพื้นที่การศึกษา';
                    badge = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
                    icon = 'fa-star text-blue-400';
                  } else if (fullText.includes('โรงเรียน') || fullText.includes('สถานศึกษา')) {
                    cat = 'school'; catThai = 'ระดับสถานศึกษา';
                    badge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                    icon = 'fa-certificate text-emerald-400';
                  }

                  driveCerts.push({
                    id: cId,
                    title: file.title.replace(/\.[^/.]+$/, ""),
                    category: cat,
                    categoryThai: catThai,
                    levelBadge: badge,
                    badgeIcon: icon,
                    issuer: `Google Drive (${ind.folderName || 'โฟลเดอร์เกียรติบัตร'})`,
                    year: (typeof currentAcademicYear !== 'undefined' ? currentAcademicYear : '2569'),
                    date: 'ซิงก์สดจากไดรฟ์',
                    imageUrl: file.thumbUrl || `https://drive.google.com/thumbnail?id=${file.id}&sz=w1200`,
                    description: `ไฟล์ภาพเกียรติบัตรจริงจาก Google Drive โฟลเดอร์ [${ind.folderName}]`,
                    docUrl: file.viewUrl
                  });
                }
              }
            });
          }
        });
      }
    }

    // หากพบรูปเกียรติบัตรจริงจาก Google Drive ให้แสดงรูปจริงจากไดรฟ์เป็นหลัก 100%!
    if (driveCerts.length > 0) {
      return driveCerts;
    }

    // หากยังไม่ได้เชื่อมต่อไดรฟ์ ให้แสดง Baseline ตัวอย่าง
    return [...this.sampleCertificates];
  },

  // กรองเกียรติบัตรตามหมวดหมู่และคำค้นหา
  getFilteredCertificates() {
    let list = this.getAllCertificates();

    if (this.activeCategory !== 'all') {
      list = list.filter(item => item.category === this.activeCategory);
    }

    if (this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(item => 
        item.title.toLowerCase().includes(q) ||
        item.issuer.toLowerCase().includes(q) ||
        item.year.includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }

    return list;
  },

  // เรนเดอร์การ์ดเกียรติบัตรลงใน Container
  renderVaultUI() {
    const container = document.getElementById('certificate-vault-container');
    if (!container) return;

    const certs = this.getFilteredCertificates();
    const countEl = document.getElementById('cert-count-badge');
    if (countEl) countEl.innerText = `${certs.length} รายการ`;

    if (certs.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-16 p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-400">
          <i class="fa-solid fa-award text-4xl text-slate-600 mb-3"></i>
          <h4 class="font-heading font-bold text-slate-300 text-base">ไม่พบรายการเกียรติบัตรที่ค้นหา</h4>
          <p class="text-xs text-slate-500 mt-1">ลองเปลี่ยนคำค้นหา หรือเลือกตัวกรองหมวดหมู่อื่น</p>
        </div>
      `;
      return;
    }

    container.innerHTML = certs.map(c => `
      <div class="group relative bg-slate-900/90 rounded-3xl overflow-hidden border border-slate-800 hover:border-teal-500/50 transition-all duration-300 hover:-translate-y-1.5 shadow-xl flex flex-col justify-between">
        
        <!-- Image Preview & Overlay -->
        <div class="relative aspect-[16/10] overflow-hidden bg-slate-950 cursor-pointer" onclick="openLightbox('${c.imageUrl}', '${c.title}', '${c.issuer} (${c.year})')">
          <img src="${c.imageUrl}" alt="${c.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
          
          <!-- Category Badge -->
          <div class="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md border ${c.levelBadge} flex items-center gap-1.5 shadow-md">
            <i class="fa-solid ${c.badgeIcon}"></i>
            <span>${c.categoryThai}</span>
          </div>

          <!-- Year Tag -->
          <div class="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-slate-900/80 text-teal-300 border border-teal-500/30 text-[11px] font-bold backdrop-blur-md shadow-sm">
            ปี ${c.year}
          </div>

          <!-- Quick Zoom Icon -->
          <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-slate-950/40 backdrop-blur-[2px]">
            <div class="w-10 h-10 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center text-sm font-bold shadow-lg">
              <i class="fa-solid fa-magnifying-glass-plus"></i>
            </div>
          </div>
        </div>

        <!-- Content Details -->
        <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <h4 class="font-heading font-bold text-white text-sm sm:text-base leading-snug group-hover:text-teal-300 transition line-clamp-2">
              ${c.title}
            </h4>
            <div class="text-xs text-amber-400/90 font-medium flex items-center gap-1.5 mt-1.5">
              <i class="fa-solid fa-building-columns text-[10px]"></i>
              <span class="truncate">${c.issuer}</span>
            </div>
            <p class="text-xs text-slate-400 leading-relaxed line-clamp-2 mt-2 font-light">
              ${c.description}
            </p>
          </div>

          <!-- Bottom Footer -->
          <div class="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span class="text-[11px]"><i class="fa-regular fa-calendar text-teal-400 mr-1"></i>${c.date}</span>
            <div class="flex items-center gap-2">
              <button onclick="openLightbox('${c.imageUrl}', '${c.title}', '${c.issuer}')" class="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] font-semibold transition flex items-center gap-1">
                <i class="fa-solid fa-expand"></i> ขยาย
              </button>
              ${c.docUrl && c.docUrl !== '#' ? `
                <a href="${c.docUrl}" target="_blank" class="px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-[11px] font-semibold transition flex items-center gap-1">
                  <i class="fa-brands fa-google-drive"></i> เปิดไดรฟ์
                </a>
              ` : ''}
            </div>
          </div>
        </div>

      </div>
    `).join('');
  },

  // ตั้งค่าตัวกรองหมวดหมู่
  setCategory(cat, btnElement = null) {
    this.activeCategory = cat;
    document.querySelectorAll('.cert-filter-btn').forEach(b => {
      b.classList.remove('active', 'bg-teal-600', 'text-white', 'shadow-md');
      b.classList.add('bg-slate-800', 'text-slate-300');
    });

    if (btnElement) {
      btnElement.classList.add('active', 'bg-teal-600', 'text-white', 'shadow-md');
      btnElement.classList.remove('bg-slate-800', 'text-slate-300');
    }

    this.renderVaultUI();
  },

  // ตั้งค่าคำค้นหา
  setSearch(query) {
    this.searchQuery = query;
    this.renderVaultUI();
  },

  // เปิดโฟลเดอร์เกียรติบัตรใน Google Drive
  openDriveFolder() {
    let folderUrl = '';
    if (typeof DriveSync !== 'undefined' && DriveSync.syncedData && DriveSync.syncedData.certificateFolderUrl) {
      folderUrl = DriveSync.syncedData.certificateFolderUrl;
    }
    if (!folderUrl) {
      const rootId = (typeof DriveSync !== 'undefined' && DriveSync.config && DriveSync.config.folderId) ? DriveSync.config.folderId : '1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K';
      folderUrl = `https://drive.google.com/drive/search?q='${rootId}'+in+parents+name+contains+'${encodeURIComponent("เกียรติบัตร")}'`;
    }
    window.open(folderUrl, '_blank');
  }
};
