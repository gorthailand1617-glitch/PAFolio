/**
 * PAFolio - e-Certificate & Awards Vault v5.0
 * ระบบคลังเกียรติบัตร โล่รางวัล และผลงานยกย่องเชิดชูเกียรติอัจฉริยะ
 * ผูกตรงกับรอบปีการศึกษาที่ประเมิน (currentAcademicYear) และคัดกรองเฉพาะปีที่ถูกต้อง (พ.ศ. 2560 - 2579)
 */

const CertificateVault = {
  activeCategory: 'all',
  searchQuery: '',

  // ตรวจสอบความถูกต้องของปีการศึกษา ว.PA (ต้องเป็น พ.ศ. 2560 - 2579 เท่านั้น)
  // เพื่อป้องกันตัวเลขวันที่ เช่น 25/03 กลายเป็น 2503 หรือ 2505, 2507
  isValidAcademicYear(yr) {
    if (!yr) return false;
    const str = String(yr).trim();
    if (!/^\d{4}$/.test(str)) return false;
    const num = parseInt(str, 10);
    return num >= 2560 && num <= 2579;
  },

  // สกัดและคำนวณรอบปีการศึกษาที่แท้จริงจากชื่อไฟล์ ข้อความ หรือข้อมูลภาพ
  // ป้องกันภาพถ่ายกล้องมือถือ เช่น IMG_20250718_... หรือ IMG_20250524_... ไม่ให้กลายเป็นปี 2507, 2505, 2503
  // และแปลงปี ค.ศ. (2023-2029) เป็นปี พ.ศ. (2566-2572) ให้ตรงกับรอบปีการศึกษา
  extractAcademicYear(text, defaultYear = null) {
    if (!text) return defaultYear ? String(defaultYear) : null;
    const str = String(text);

    // 1. ตรวจจับชื่อไฟล์จากกล้องมือถือ เช่น IMG_20250718_150422, 20250524_084944, 2025-07-18
    const cameraMatch = str.match(/(?:IMG_)?(202[3-9])[-_]?(0[1-9]|1[0-2])[-_]?([0-3]\d)/i);
    if (cameraMatch) {
      const ceYear = parseInt(cameraMatch[1], 10);
      const month = parseInt(cameraMatch[2], 10);
      const beYear = ceYear + 543;
      // รอบปีการศึกษา/งบประมาณไทย: พฤษภาคม (เดือน 5) ถึง เมษายน (เดือน 4) ของปีถัดไป
      const academicYear = (month >= 5) ? beYear : (beYear - 1);
      return String(academicYear);
    }

    // 2. ตรวจจับ พ.ศ. 4 หลักตรงๆ เช่น 2566, 2567, 2568, 2569, 2570 (ไม่ติดกับตัวเลขอื่น)
    const beMatch = str.match(/(?<!\d)(25[6-7]\d)(?!\d)/);
    if (beMatch && this.isValidAcademicYear(beMatch[1])) {
      return beMatch[1];
    }

    // 3. ตรวจจับคำนำหน้า เช่น ปี 68, PA68, พ.ศ. 68, ปีการศึกษา 2568, ปีงบประมาณ 2569
    const prefixMatch = str.match(/(?:PA|ปี|พ\.ศ\.|ปีการศึกษา|ปีงบประมาณ)\s*[:.]?\s*([6-7]\d)\b/i);
    if (prefixMatch) {
      return "25" + prefixMatch[1];
    }

    // 4. ถ้ามี defaultYear ที่ถูกต้อง
    if (defaultYear && this.isValidAcademicYear(defaultYear)) {
      return String(defaultYear);
    }

    return null;
  },

  // ทำความสะอาดและแปลงปีให้อยู่ในกรอบปีการศึกษาที่ประเมิน
  sanitizeYear(yr, fallbackYear = '2569') {
    const extracted = this.extractAcademicYear(yr, fallbackYear);
    return extracted || String(fallbackYear);
  },

  // ฐานข้อมูลเกียรติบัตรและรางวัลมาตรฐาน แยกตามรอบปีการศึกษาโดยเฉพาะ (ไม่ปะปนกัน)
  sampleCertificatesByYear: {
    '2570': [
      {
        id: 'cert-70-1',
        title: 'รางวัลชนะเลิศเหรียญทอง OBEC AWARDS (ครูผู้สอนยอดเยี่ยม)',
        category: 'national',
        categoryThai: 'ระดับชาติ / นานาชาติ',
        levelBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        badgeIcon: 'fa-trophy text-amber-400',
        issuer: 'สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.)',
        year: '2570',
        date: '15 สิงหาคม 2570',
        imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
        description: 'รางวัลทรงคุณค่า สพฐ. (OBEC AWARDS) ด้านนวัตกรรมการจัดการเรียนรู้เชิงรุก (Active Learning) ประจำปีการศึกษา 2570',
        docUrl: '#'
      },
      {
        id: 'cert-70-2',
        title: 'รางวัลคุรุชนคนคุณธรรม "ดีเด่นระดับประเทศ" ประจำปี 2570',
        category: 'national',
        categoryThai: 'ระดับชาติ / นานาชาติ',
        levelBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        badgeIcon: 'fa-award text-amber-400',
        issuer: 'สำนักงานเลขาธิการคุรุสภา',
        year: '2570',
        date: '16 มกราคม 2570',
        imageUrl: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=800&q=80',
        description: 'โครงการโรงเรียนคุณธรรม สพฐ. ยกย่องผู้ประพฤติปฏิบัติตนตามมาตรฐานวิชาชีพและจรรยาบรรณวิชาชีพครู',
        docUrl: '#'
      }
    ],
    '2569': [
      {
        id: 'cert-69-1',
        title: 'รางวัลชนะเลิศเหรียญทอง OBEC AWARDS (ครูผู้สอนยอดเยี่ยม ด้านวิชาการ)',
        category: 'national',
        categoryThai: 'ระดับชาติ / นานาชาติ',
        levelBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        badgeIcon: 'fa-trophy text-amber-400',
        issuer: 'สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.)',
        year: '2569',
        date: '15 สิงหาคม 2569',
        imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
        description: 'รางวัลทรงคุณค่า สพฐ. (OBEC AWARDS) ด้านนวัตกรรมการจัดการเรียนรู้เชิงรุก (Active Learning) ประจำปีการศึกษา 2569',
        docUrl: '#'
      },
      {
        id: 'cert-69-2',
        title: 'รางวัลคุรุชนคนคุณธรรม "ดีเด่นระดับประเทศ" ประจำปี 2569',
        category: 'national',
        categoryThai: 'ระดับชาติ / นานาชาติ',
        levelBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        badgeIcon: 'fa-award text-amber-400',
        issuer: 'สำนักงานเลขาธิการคุรุสภา',
        year: '2569',
        date: '16 มกราคม 2569',
        imageUrl: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=800&q=80',
        description: 'โครงการโรงเรียนคุณธรรม สพฐ. ยกย่องผู้ประพฤติปฏิบัติตนตามมาตรฐานวิชาชีพและจรรยาบรรณวิชาชีพครู',
        docUrl: '#'
      },
      {
        id: 'cert-69-3',
        title: 'รางวัลนวัตกรรมการจัดการเรียนรู้ยอดเยี่ยม ระดับภาค',
        category: 'regional',
        categoryThai: 'ระดับภาค / เขตตรวจ',
        levelBadge: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
        badgeIcon: 'fa-medal text-teal-400',
        issuer: 'ศูนย์ขับเคลื่อนนวัตกรรมการศึกษา ภาคตะวันออกเฉียงเหนือ',
        year: '2569',
        date: '20 กรกฎาคม 2569',
        imageUrl: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=800&q=80',
        description: 'การพัฒนารูปแบบการสอน PREM Model ร่วมกับ Thinking Whiteboard เพื่อส่งเสริมทักษะการเรียนรู้เชิงรุก',
        docUrl: '#'
      },
      {
        id: 'cert-69-4',
        title: 'รางวัล "ครูดีในดวงใจ" ระดับเขตพื้นที่การศึกษา',
        category: 'district',
        categoryThai: 'ระดับเขตพื้นที่การศึกษา',
        levelBadge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        badgeIcon: 'fa-star text-blue-400',
        issuer: 'สำนักงานเขตพื้นที่การศึกษามัธยมศึกษาขอนแก่น (สพม.ขอนแก่น)',
        year: '2569',
        date: '16 มกราคม 2569',
        imageUrl: 'https://images.unsplash.com/photo-1579389083078-4e7018379f7e?auto=format&fit=crop&w=800&q=80',
        description: 'ครูผู้มีจิตวิญญาณความเป็นครู ทุ่มเทเสียสละ และเป็นแบบอย่างที่ดีในการจัดการศึกษา',
        docUrl: '#'
      },
      {
        id: 'cert-69-5',
        title: 'รางวัล "หนึ่งโรงเรียน หนึ่งนวัตกรรม" (ระดับเหรียญทอง)',
        category: 'district',
        categoryThai: 'ระดับเขตพื้นที่การศึกษา',
        levelBadge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        badgeIcon: 'fa-lightbulb text-blue-400',
        issuer: 'สพม.ขอนแก่น ร่วมกับคุรุสภา',
        year: '2569',
        date: '10 กันยายน 2569',
        imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
        description: 'นวัตกรรมสื่อการสอนชุด Thinking Whiteboard เพื่อการแก้ปัญหาผลสัมฤทธิ์ทางการเรียนในศตวรรษที่ 21',
        docUrl: '#'
      },
      {
        id: 'cert-69-6',
        title: 'รางวัลครูผู้มีผลงานการปฏิบัติหน้าที่ดีเด่น ประจำปี 2569',
        category: 'school',
        categoryThai: 'ระดับสถานศึกษา',
        levelBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        badgeIcon: 'fa-certificate text-emerald-400',
        issuer: 'โรงเรียนเปรมติณสูลานนท์',
        year: '2569',
        date: '28 กุมภาพันธ์ 2569',
        imageUrl: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=800&q=80',
        description: 'การปฏิบัติงานวิชาการ การดูแลช่วยเหลือนักเรียน และการสร้างชื่อเสียงให้แก่สถานศึกษา',
        docUrl: '#'
      }
    ],
    '2568': [
      {
        id: 'cert-68-1',
        title: 'รางวัลชนะเลิศเหรียญทอง OBEC AWARDS (ครูผู้สอนยอดเยี่ยม ด้านการจัดการเรียนรู้)',
        category: 'national',
        categoryThai: 'ระดับชาติ / นานาชาติ',
        levelBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        badgeIcon: 'fa-trophy text-amber-400',
        issuer: 'สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.)',
        year: '2568',
        date: '15 สิงหาคม 2568',
        imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
        description: 'รางวัลทรงคุณค่า สพฐ. (OBEC AWARDS) ระดับชาติ ด้านนวัตกรรมการจัดการเรียนรู้เชิงรุก ประจำปี 2568',
        docUrl: '#'
      },
      {
        id: 'cert-68-2',
        title: 'รางวัลนวัตกรรมการจัดการเรียนรู้ยอดเยี่ยม ระดับภาค ประจำปี 2568',
        category: 'regional',
        categoryThai: 'ระดับภาค / เขตตรวจ',
        levelBadge: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
        badgeIcon: 'fa-medal text-teal-400',
        issuer: 'ศูนย์ขับเคลื่อนนวัตกรรมการศึกษา ภาคตะวันออกเฉียงเหนือ',
        year: '2568',
        date: '20 กรกฎาคม 2568',
        imageUrl: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=800&q=80',
        description: 'การพัฒนารูปแบบการสอน PREM Model ร่วมกับ Thinking Whiteboard ประจำปีการศึกษา 2568',
        docUrl: '#'
      },
      {
        id: 'cert-68-3',
        title: 'รางวัล "ครูดีในดวงใจ" ระดับเขตพื้นที่การศึกษา ประจำปี 2568',
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
        id: 'cert-68-4',
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
    '2567': [
      {
        id: 'cert-67-1',
        title: 'รางวัลคุรุชนคนคุณธรรม "ดีเด่น" ระดับประเทศ ประจำปี 2567',
        category: 'national',
        categoryThai: 'ระดับชาติ / นานาชาติ',
        levelBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        badgeIcon: 'fa-award text-amber-400',
        issuer: 'สำนักงานเลขาธิการคุรุสภา',
        year: '2567',
        date: '16 มกราคม 2567',
        imageUrl: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=800&q=80',
        description: 'โครงการโรงเรียนคุณธรรม สพฐ. เพื่อยกย่องผู้ประพฤติปฏิบัติตนตามมาตรฐานวิชาชีพครู ประจำปี 2567',
        docUrl: '#'
      },
      {
        id: 'cert-67-2',
        title: 'รางวัล "หนึ่งโรงเรียน หนึ่งนวัตกรรม" (ระดับเหรียญทอง) ประจำปี 2567',
        category: 'district',
        categoryThai: 'ระดับเขตพื้นที่การศึกษา',
        levelBadge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        badgeIcon: 'fa-lightbulb text-blue-400',
        issuer: 'สพม.ขอนแก่น ร่วมกับคุรุสภา',
        year: '2567',
        date: '10 กันยายน 2567',
        imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
        description: 'นวัตกรรมสื่อการสอนชุด Thinking Whiteboard เพื่อการแก้ปัญหาผลสัมฤทธิ์ทางการเรียน',
        docUrl: '#'
      }
    ],
    '2566': [
      {
        id: 'cert-66-1',
        title: 'รางวัลครูผู้สอนดีเด่น กลุ่มสาระการเรียนรู้การงานอาชีพ ประจำปี 2566',
        category: 'school',
        categoryThai: 'ระดับสถานศึกษา',
        levelBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        badgeIcon: 'fa-certificate text-emerald-400',
        issuer: 'โรงเรียนเปรมติณสูลานนท์',
        year: '2566',
        date: '20 กุมภาพันธ์ 2566',
        imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
        description: 'ผลการปฏิบัติหน้าที่ด้านการจัดการเรียนรู้ยอดเยี่ยม ประจำปีการศึกษา 2566',
        docUrl: '#'
      }
    ]
  },

  // ดึงรายการเกียรติบัตรที่สัมพันธ์กับ "รอบปีที่ประเมิน" (currentAcademicYear) เท่านั้น ไม่ปะปนกับปีอื่น
  getAllCertificates(targetYear = null) {
    const activeYear = String(targetYear || (typeof currentAcademicYear !== 'undefined' ? currentAcademicYear : '2569'));
    let driveCerts = [];
    const seenIds = new Set();

    // 1. ดึงข้อมูลตรงจาก DriveSync.syncedData.certificates ที่สแกนได้จาก Google Drive
    if (typeof DriveSync !== 'undefined' && DriveSync.syncedData) {
      if (Array.isArray(DriveSync.syncedData.certificates) && DriveSync.syncedData.certificates.length > 0) {
        DriveSync.syncedData.certificates.forEach(c => {
          // ดึงปีที่แท้จริงจากชื่อไฟล์ โฟลเดอร์ หรือคำอธิบาย (เช่น IMG_2025... แปลงเป็น 2568)
          const fullInfo = `${c.title || ''} ${c.issuer || ''} ${c.description || ''}`;
          let itemYear = this.extractAcademicYear(fullInfo);
          if (!itemYear && c.year && this.isValidAcademicYear(c.year)) {
            itemYear = String(c.year);
          }

          // ⚠️ จุดสำคัญที่สุด: ต้องตรงกับรอบปีที่กำลังประเมิน (activeYear) เท่านั้น ไม่เอาของปีอื่นมาแสดง
          if (itemYear === activeYear) {
            c.year = activeYear;
            if (!seenIds.has(c.id)) {
              seenIds.add(c.id);
              driveCerts.push(c);
            }
          }
        });
      }

      // 2. ตรวจสอบเพิ่มเติมในตัวชี้วัดเฉพาะของปีที่เลือก เผื่อมีโฟลเดอร์หรือไฟล์เกียรติบัตรแทรกอยู่
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
                  // วิเคราะห์ปีของไฟล์นี้
                  const fullText = (ind.folderName || '') + ' ' + (file.title || '');
                  const fileYear = this.extractAcademicYear(fullText, activeYear);
                  
                  // ตรวจสอบว่าตรงกับปีที่กำลังประเมินหรือไม่
                  if (fileYear !== activeYear) return;

                  seenIds.add(cId);
                  
                  // วิเคราะห์ระดับรางวัลจากชื่อ
                  let cat = 'national';
                  let catThai = 'ระดับชาติ / นานาชาติ';
                  let badge = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                  let icon = 'fa-trophy text-amber-400';

                  const textLow = fullText.toLowerCase();
                  if (textLow.includes('ภาค') || textLow.includes('จังหวัด')) {
                    cat = 'regional'; catThai = 'ระดับภาค / จังหวัด';
                    badge = 'bg-teal-500/20 text-teal-300 border-teal-500/40';
                    icon = 'fa-medal text-teal-400';
                  } else if (textLow.includes('เขต') || textLow.includes('สพม') || textLow.includes('สพป')) {
                    cat = 'district'; catThai = 'ระดับเขตพื้นที่การศึกษา';
                    badge = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
                    icon = 'fa-star text-blue-400';
                  } else if (textLow.includes('โรงเรียน') || textLow.includes('สถานศึกษา')) {
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
                    year: activeYear,
                    date: 'รอบปีงบประมาณ ' + activeYear,
                    imageUrl: file.thumbUrl || `https://drive.google.com/thumbnail?id=${file.id}&sz=w1200`,
                    description: `ไฟล์ภาพเกียรติบัตรจริงจาก Google Drive ประจำรอบปี ${activeYear}`,
                    docUrl: file.viewUrl
                  });
                }
              }
            });
          }
        });
      }
    }

    // หากพบรูปเกียรติบัตรจริงจาก Google Drive ของปีนั้น ให้แสดงรูปจริงจากไดรฟ์เป็นหลัก 100%!
    if (driveCerts.length > 0) {
      return driveCerts;
    }

    // หากยังไม่มีไฟล์ในไดรฟ์ ให้ดึงเกียรติบัตรมาตรฐานเฉพาะของ "รอบปีที่เลือก" (activeYear)
    if (this.sampleCertificatesByYear[activeYear]) {
      return [...this.sampleCertificatesByYear[activeYear]];
    }

    // Fallback สำหรับปีอื่นๆ ที่ไม่มีข้อมูลจำเพาะ ให้สร้างชุดข้อมูลของปีนั้นโดยตรง
    return [
      {
        id: `cert-${activeYear}-1`,
        title: `รางวัลชนะเลิศเหรียญทอง OBEC AWARDS ประจำปีการศึกษา ${activeYear}`,
        category: 'national',
        categoryThai: 'ระดับชาติ / นานาชาติ',
        levelBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        badgeIcon: 'fa-trophy text-amber-400',
        issuer: 'สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.)',
        year: activeYear,
        date: `รอบปีการศึกษา ${activeYear}`,
        imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
        description: `รางวัลทรงคุณค่า สพฐ. ด้านนวัตกรรมการจัดการเรียนรู้เชิงรุก ประจำรอบปี ${activeYear}`,
        docUrl: '#'
      },
      {
        id: `cert-${activeYear}-2`,
        title: `รางวัลครูผู้สอนดีเด่น ประจำปีการศึกษา ${activeYear}`,
        category: 'school',
        categoryThai: 'ระดับสถานศึกษา',
        levelBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        badgeIcon: 'fa-certificate text-emerald-400',
        issuer: 'โรงเรียนเปรมติณสูลานนท์',
        year: activeYear,
        date: `รอบปีการศึกษา ${activeYear}`,
        imageUrl: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=800&q=80',
        description: `การปฏิบัติงานวิชาการ การพัฒนาผู้เรียน และการสร้างชื่อเสียงให้แก่สถานศึกษา รอบปี ${activeYear}`,
        docUrl: '#'
      }
    ];
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

    const activeYear = String((typeof currentAcademicYear !== 'undefined' && currentAcademicYear) ? currentAcademicYear : '2569');
    const certs = this.getFilteredCertificates();
    const countEl = document.getElementById('cert-count-badge');
    if (countEl) countEl.innerText = `${certs.length} รายการ (รอบปี ${activeYear})`;

    document.querySelectorAll('.cert-active-year-label').forEach(el => {
      el.innerText = activeYear;
    });

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
