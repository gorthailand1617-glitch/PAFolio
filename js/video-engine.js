/**
 * PAFolio - AI Smart Video Showcase Generator Engine v1.0
 * เครื่องมือสร้างวิดีโอนำเสนอผลงาน ว.PA 8-10 นาที ระดับพรีเมียม (1080p Full HD)
 * - การจัดโครงเรื่อง 10 ฉากมาตรฐานตามเกณฑ์ ก.ค.ศ. ว9/2564
 * - ภาพเคลื่อนไหว Ken Burns Pan & Zoom + กราฟิกสถิติดิ้นได้
 * - ระบบเสียงพากย์ภาษาไทย (Web Speech + อัดเสียงไมค์ + อัปโหลด)
 * - ระบบดนตรีสังเคราะห์ Ambient BGM พร้อมระบบ Audio Ducking อัตโนมัติ
 * - ส่งออกไฟล์วิดีโอ Full HD (.webm / .mp4) ตรงจากเบราว์เซอร์
 */

const VideoEngine = {
  canvas: null,
  ctx: null,
  audioCtx: null,
  bgmGainNode: null,
  speechGainNode: null,
  mediaDestNode: null,
  bgmOscillators: [],
  bgmTimer: null,
  
  // สถานะการเล่น / เรนเดอร์
  isPlaying: false,
  isRecording: false,
  currentSceneIdx: 0,
  sceneElapsedTime: 0,
  totalElapsedTime: 0,
  animFrameId: null,
  mode: 'full', // 'full' (8-10 นาที) หรือ 'short' (3 นาที)
  
  // การตั้งค่าเสียง
  voiceMode: 'tts', // 'tts', 'mic', 'upload', 'mute'
  voiceType: 'google_thai', // 'google_thai' (เสียงธรรมชาติ HD ภาษาไทย 100%) หรือ 'system' (เสียงระบบ)
  selectedVoice: null,
  voicePitch: 1.0,
  voiceRate: 1.0,
  bgmVolume: 0.35,
  bgmStyle: 'inspirational', // 'inspirational', 'academic', 'dynamic', 'none'
  isDucked: false,
  currentUtterance: null,
  currentVoiceAudio: null,
  
  // ข้อมูลแคชรูปภาพ (Preloaded Images)
  loadedImages: {},

  // รายการ 10 ฉากมาตรฐาน (สร้างสดตามข้อมูลครู)
  scenes: [],

  // เริ่มต้นการทำงาน
  init() {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.width = 1920;
      this.canvas.height = 1080;
      this.ctx = this.canvas.getContext('2d', { alpha: false });
    }
    this.buildScenes();
    this.preloadSceneImages();
    this.initVoices();
  },

  // สร้าง 10 ฉากมาตรฐานร้อยเรียงตามข้อมูลจริงของครู
  buildScenes() {
    const teacher = (typeof getActiveTeacher === 'function') ? getActiveTeacher() : {
      name: "นายกรกฎ รัตนะโชติ",
      position: "ครู",
      academicStanding: "ชำนาญการพิเศษ",
      school: "โรงเรียนเปรมติณสูลานนท์",
      affiliation: "สพม.ขอนแก่น",
      department: "กลุ่มสาระการเรียนรู้การงานอาชีพ",
      avatarUrl: "images/profile.jpg"
    };

    const yearData = (typeof getActiveYearData === 'function') ? getActiveYearData() : {};
    const challenge = yearData.challengeIssue || {};
    const scores = yearData.scores || { total: 96 };
    const curYear = (typeof currentAcademicYear !== 'undefined') ? currentAcademicYear : "2568";

    // ดึงรูปภาพหลักฐานจากตัวชี้วัด
    const evidenceImages = [];
    if (yearData.indicators && Array.isArray(yearData.indicators)) {
      yearData.indicators.forEach(ind => {
        if (ind.files && Array.isArray(ind.files)) {
          ind.files.forEach(f => {
            if (f.url && f.url.startsWith('http') || (f.thumbnailUrl && f.thumbnailUrl.startsWith('http'))) {
              evidenceImages.push(f.thumbnailUrl || f.url);
            }
          });
        }
      });
    }

    // รูปสำรองหากยังไม่ได้ซิงก์ Drive
    const defaultCover = teacher.coverBannerUrl || "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1920&q=80";
    const defaultSchool = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80";
    const defaultClass = "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1920&q=80";
    const defaultLab = "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=1920&q=80";
    const defaultAward = "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=1920&q=80";

    this.scenes = [
      {
        id: 1,
        type: 'intro',
        title: 'หน้าปกและแนะนำตัวครูผู้รับการประเมิน',
        subtitle: `การพัฒนางานตามข้อตกลง ว.PA ประจำปีงบประมาณ ${curYear}`,
        durationFull: 48,
        durationShort: 18,
        bgImage: teacher.coverBannerUrl || defaultCover,
        avatar: teacher.avatarUrl || "images/profile.jpg",
        script: `กราบเรียนท่านประธานและคณะกรรมการผู้ทรงคุณวุฒิทุกท่าน ดิฉัน/กระผม ${teacher.name} ตำแหน่ง ${teacher.position} วิทยฐานะ ${teacher.academicStanding} สังกัด ${teacher.school} ${teacher.affiliation} ขอรายงานผลการพัฒนางานตามข้อตกลงในการพัฒนางาน ว.PA ประจำปีงบประมาณ ${curYear} ครับ`,
        keyPoints: [
          `วิทยฐานะ: ${teacher.academicStanding}`,
          `สถานศึกษา: ${teacher.school}`,
          `กลุ่มสาระฯ: ${teacher.department}`,
          `รอบการประเมิน: ปีงบประมาณ ${curYear}`
        ]
      },
      {
        id: 2,
        type: 'school',
        title: 'บริบทสถานศึกษาและภาระงานสอน',
        subtitle: `${teacher.school} · ${teacher.affiliation}`,
        durationFull: 45,
        durationShort: 16,
        bgImage: defaultSchool,
        script: `สถานศึกษาของเรามุ่งเน้นการจัดการเรียนรู้เพื่อพัฒนาทักษะอาชีพและทักษะแห่งศตวรรษที่ 21 ภายใต้การบริหารจัดการที่เน้นผู้เรียนเป็นสำคัญ โดยข้าพเจ้ามีภาระงานสอนตามมาตรฐานและงานสนับสนุนการจัดการศึกษาครบถ้วนตามเกณฑ์ ก.ค.ศ. กำหนด`,
        keyPoints: [
          "การจัดการเรียนรู้เชิงรุก (Active Learning)",
          "บูรณาการเทคโนโลยีดิจิทัลสู่ห้องเรียน",
          "มุ่งเน้นทักษะชีวิต ทักษะอาชีพ และคุณธรรมจริยธรรม"
        ]
      },
      {
        id: 3,
        type: 'indicators_1',
        title: 'ด้านที่ 1: การจัดการเรียนรู้ (การออกแบบ & นวัตกรรม)',
        subtitle: 'ตัวชี้วัดที่ 1.1 - 1.4: สร้างหลักสูตร, แผน Active Learning, สื่อดิจิทัล',
        durationFull: 60,
        durationShort: 20,
        bgImage: evidenceImages[0] || defaultClass,
        script: `ด้านที่หนึ่ง การจัดการเรียนรู้ ข้าพเจ้าได้พัฒนาหลักสูตรรายวิชาและจัดทำหน่วยการเรียนรู้แบบ Active Learning ออกแบบกิจกรรมการเรียนรู้ที่เน้นการลงมือปฏิบัติจริง พร้อมผลิตสื่อและนวัตกรรมการเรียนรู้ดิจิทัลเพื่อส่งเสริมศักยภาพของผู้เรียนเป็นรายบุคคล`,
        keyPoints: [
          "1.1 การสร้างและหรือพัฒนาหลักสูตร",
          "1.2 ออกแบบการจัดการเรียนรู้เน้นผู้เรียนเป็นสำคัญ",
          "1.3 จัดกิจกรรมการเรียนรู้ท้าทายความคิด",
          "1.4 สร้างและหรือพัฒนาสื่อ นวัตกรรม เทคโนโลยี"
        ]
      },
      {
        id: 4,
        type: 'indicators_2',
        title: 'ด้านที่ 1: การจัดการเรียนรู้ (การวัดผล & วิจัย)',
        subtitle: 'ตัวชี้วัดที่ 1.5 - 1.8: การวัดประเมินผล, วิจัยแก้ปัญหา, อบรมบ่มนิสัย',
        durationFull: 55,
        durationShort: 18,
        bgImage: evidenceImages[1] || defaultLab,
        script: `ข้าพเจ้าได้ดำเนินการวัดและประเมินผลการเรียนรู้ด้วยเครื่องมือที่หลากหลายตามสภาพจริง ดำเนินการศึกษา วิจัย และแก้ปัญหาเพื่อพัฒนาการจัดการเรียนรู้ พร้อมทั้งอบรมบ่มนิสัยให้ผู้เรียนมีคุณลักษณะอันพึงประสงค์และสมรรถนะสำคัญตามหลักสูตร`,
        keyPoints: [
          "1.5 การวัดและประเมินผลการเรียนรู้ตามสภาพจริง",
          "1.6 ศึกษา วิเคราะห์ และสังเคราะห์เพื่อแก้ปัญหาหรือพัฒนา",
          "1.7 จัดบรรยากาศที่ส่งเสริมและพัฒนาผู้เรียน",
          "1.8 อบรมและพัฒนาคุณลักษณะที่ดีของผู้เรียน"
        ]
      },
      {
        id: 5,
        type: 'support',
        title: 'ด้านที่ 2: การส่งเสริมและสนับสนุนการจัดการเรียนรู้',
        subtitle: 'ตัวชี้วัดที่ 2.1 - 2.4: สารสนเทศชั้นเรียน, ระบบดูแลช่วยเหลือนักเรียน',
        durationFull: 50,
        durationShort: 18,
        bgImage: evidenceImages[2] || defaultClass,
        script: `ด้านที่สอง การส่งเสริมและสนับสนุนการจัดการเรียนรู้ ข้าพเจ้าจัดทำข้อมูลสารสนเทศของผู้เรียนและรายวิชาอย่างเป็นระบบ ดำเนินงานตามระบบดูแลช่วยเหลือนักเรียน เยี่ยมบ้านนักเรียนครบ 100% ประสานความร่วมมือกับผู้ปกครองเพื่อร่วมกันส่งเสริมและแก้ไขปัญหา`,
        keyPoints: [
          "2.1 จัดทำข้อมูลสารสนเทศของผู้เรียนและรายวิชา",
          "2.2 ดำเนินการตามระบบดูแลช่วยเหลือนักเรียน",
          "2.3 ปฏิบัติงานวิชาการและงานอื่นของสถานศึกษา",
          "2.4 ประสานความร่วมมือกับผู้ปกครองและภาคีเครือข่าย"
        ]
      },
      {
        id: 6,
        type: 'development',
        title: 'ด้านที่ 3: การพัฒนาตนเองและวิชาชีพ',
        subtitle: 'ตัวชี้วัดที่ 3.1 - 3.3: การอบรมสมรรถนะวิชาชีพ, ชุมชนแห่งการเรียนรู้ (PLC)',
        durationFull: 50,
        durationShort: 16,
        bgImage: evidenceImages[3] || defaultSchool,
        script: `ด้านที่สาม การพัฒนาตนเองและวิชาชีพ ข้าพเจ้าเข้ารับการอบรมพัฒนาตนเองอย่างต่อเนื่องเพื่อนำความรู้มาพัฒนานวัตกรรม และมีส่วนร่วมในการเป็นผู้นำชุมชนการเรียนรู้ทางวิชาชีพ หรือ PLC แลกเปลี่ยนเรียนรู้กับเพื่อนครูเพื่อยกระดับคุณภาพการจัดการศึกษา`,
        keyPoints: [
          "3.1 พัฒนาตนเองอย่างเป็นระบบและต่อเนื่อง",
          "3.2 มีส่วนร่วมและเป็นผู้นำในการแลกเปลี่ยนเรียนรู้ทางวิชาชีพ (PLC)",
          "3.3 นำความรู้ความสามารถมาใช้ในการพัฒนานวัตกรรม"
        ]
      },
      {
        id: 7,
        type: 'certificates',
        title: 'คลังเกียรติบัตรและโล่รางวัลแห่งความภาคภูมิใจ',
        subtitle: 'ผลงานดีเด่นระดับชาติ ระดับภูมิภาค และระดับเขตพื้นที่การศึกษา',
        durationFull: 48,
        durationShort: 16,
        bgImage: defaultAward,
        script: `จากความมุ่งมั่นทุ่มเท ส่งผลให้ข้าพเจ้าได้รับเกียรติบัตรและรางวัลเชิดชูเกียรติทั้งในระดับชาติและระดับเขตพื้นที่การศึกษา รวมทั้งนักเรียนได้รับรางวัลจากการแข่งขันทางวิชาการและทักษะอาชีพ เป็นเครื่องการันตีคุณภาพการจัดการศึกษา`,
        keyPoints: [
          "รางวัลข้าราชการครูและบุคลากรทางการศึกษาดีเด่น",
          "รางวัลนวัตกรรมการจัดการเรียนรู้ยอดเยี่ยม",
          "นักเรียนได้รับรางวัลการแข่งขันทักษะวิชาชีพ"
        ]
      },
      {
        id: 8,
        type: 'challenge_problem',
        title: 'ไฮไลต์: ข้อตกลงในการพัฒนางานที่เป็นประเด็นท้าทาย',
        subtitle: challenge.title || "การพัฒนารูปแบบการจัดการเรียนรู้ Active Learning",
        durationFull: 65,
        durationShort: 22,
        bgImage: evidenceImages[4] || defaultClass,
        script: `สำหรับประเด็นท้าทายในการพัฒนาผลลัพธ์การเรียนรู้ของผู้เรียน ข้าพเจ้าได้ศึกษาปัญหาเรื่อง ${challenge.title || 'การยกระดับผลสัมฤทธิ์และทักษะการปฏิบัติงาน'} โดยใช้วงจรวิจัย ADDIE Model พัฒนานวัตกรรมการจัดการเรียนรู้เพื่อแก้ปัญหาและยกระดับศักยภาพนักเรียนอย่างยั่งยืน`,
        keyPoints: [
          `ประเด็นวิจัย: ${challenge.title || 'การพัฒนานวัตกรรมการจัดการเรียนรู้'}`,
          "กลุ่มเป้าหมาย: นักเรียนระดับชั้นที่สอน 100%",
          "วิธีดำเนินการ: กระบวนการวิจัยเชิงปฏิบัติการในชั้นเรียน"
        ]
      },
      {
        id: 9,
        type: 'challenge_results',
        title: 'ผลลัพธ์การเรียนรู้เชิงประจักษ์จากประเด็นท้าทาย',
        subtitle: 'การเปรียบเทียบผลสัมฤทธิ์ Pre-test / Post-test และความพึงพอใจ',
        durationFull: 60,
        durationShort: 20,
        bgImage: defaultLab,
        script: `ผลการนำนวัตกรรมไปใช้ พบว่าผลสัมฤทธิ์ทางการเรียนหลังเรียนสูงกว่าก่อนเรียนอย่างมีนัยสำคัญทางสถิติ โดยมีคะแนนเฉลี่ยเพิ่มขึ้นร้อยละ 28.5 และนักเรียนมีความพึงพอใจในระดับมากที่สุด สอดคล้องกับข้อตกลงที่ให้ไว้กับผู้อำนวยการสถานศึกษา`,
        preTest: 56.4,
        postTest: 84.9,
        diffPercent: 28.5,
        satisfaction: "4.85 / 5.00"
      },
      {
        id: 10,
        type: 'conclusion',
        title: 'บทสรุปผลการประเมินตนเองและคำขอบคุณ',
        subtitle: `คะแนนประเมินตนเอง: ${scores.total || 96} / 100 คะแนน (ระดับดีเยี่ยม)`,
        durationFull: 45,
        durationShort: 16,
        bgImage: defaultCover,
        avatar: teacher.avatarUrl || "images/profile.jpg",
        script: `สรุปผลการประเมินตนเองตามมาตรฐานตำแหน่งและวิทยฐานะ ข้าพเจ้ามีผลการประเมินรวม ${scores.total || 96} คะแนน อยู่ในระดับดีเยี่ยม ข้าพเจ้าขอกราบขอบพระคุณคณะกรรมการทุกท่านที่ให้เกียรติมาประเมินและให้ข้อเสนอแนะเพื่อการพัฒนายิ่งๆ ขึ้นไปครับ`,
        score: scores.total || 96,
        verdict: "ผ่านเกณฑ์ตามมาตรฐานตำแหน่งและวิทยฐานะ ว9/2564"
      }
    ];
  },

  // พรีโหลดรูปภาพล่วงหน้า เพื่อการเรนเดอร์ Canvas ที่ลื่นไหล 60fps
  preloadSceneImages() {
    this.scenes.forEach(scene => {
      [scene.bgImage, scene.avatar].forEach(url => {
        if (url && !this.loadedImages[url]) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => { this.loadedImages[url] = img; };
          img.onerror = () => { console.warn('VideoEngine: Failed to load image', url); };
          img.src = url;
        }
      });
    });
  },

  // ดึงรายการเสียงพากย์ภาษาไทยจากระบบ
  initVoices() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        const thaiVoices = voices.filter(v => v.lang.includes('th') || v.name.includes('Thai') || v.name.includes('Premwadee') || v.name.includes('Niwat'));
        if (thaiVoices.length > 0) {
          this.selectedVoice = thaiVoices[0];
        }
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  },

  // ================= 🎵 WEB AUDIO SYNTHESIZER & AUDIO DUCKING =================
  initAudio() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
      
      this.bgmGainNode = this.audioCtx.createGain();
      this.bgmGainNode.gain.value = this.bgmVolume;

      this.speechGainNode = this.audioCtx.createGain();
      this.speechGainNode.gain.value = 1.0;

      // Master destination node สำหรับ MediaRecorder
      this.mediaDestNode = this.audioCtx.createMediaStreamDestination();

      this.bgmGainNode.connect(this.audioCtx.destination);
      this.bgmGainNode.connect(this.mediaDestNode);

      this.speechGainNode.connect(this.audioCtx.destination);
      this.speechGainNode.connect(this.mediaDestNode);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  },

  // เล่นเพลง BGM สังเคราะห์สดแบบ Ambient Chords (Inspirational Chord Progression)
  startBGM() {
    if (this.bgmStyle === 'none') return;
    this.initAudio();
    this.stopBGM();

    // คอร์ดสร้างแรงบันดาลใจ: Cmaj7 -> Am9 -> Fmaj7 -> Gsus4
    const chordProgression = [
      [261.63, 329.63, 392.00, 493.88], // C, E, G, B
      [220.00, 261.63, 329.63, 392.00], // A, C, E, G
      [174.61, 261.63, 329.63, 349.23], // F, C, E, F
      [196.00, 261.63, 293.66, 392.00]  // G, C, D, G
    ];

    let chordIdx = 0;
    const playChord = () => {
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      const freqs = chordProgression[chordIdx % chordProgression.length];
      chordIdx++;

      freqs.forEach(f => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const filter = this.audioCtx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 1.5);
        gain.gain.linearRampToValueAtTime(0, now + 5.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGainNode);

        osc.start(now);
        osc.stop(now + 6.0);
        this.bgmOscillators.push(osc);
      });
    };

    playChord();
    this.bgmTimer = setInterval(playChord, 5000);
  },

  stopBGM() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    this.bgmOscillators.forEach(osc => {
      try { osc.stop(); } catch (e) {}
    });
    this.bgmOscillators = [];
  },

  // ระบบ Audio Ducking: หรี่เสียงดนตรีลงอัตโนมัติเมื่อมีเสียงบรรยาย
  duckBGM(shouldDuck) {
    if (!this.bgmGainNode || !this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    const targetVol = shouldDuck ? (this.bgmVolume * 0.25) : this.bgmVolume;
    this.bgmGainNode.gain.cancelScheduledValues(now);
    this.bgmGainNode.gain.linearRampToValueAtTime(targetVol, now + 0.4);
    this.isDucked = shouldDuck;
  },

  // ================= 🎙️ THAI NARRATION ENGINE =================
  // ฟังก์ชันแยกข้อความภาษาไทยออกเป็นประโยคย่อยเพื่อเล่นเสียงผ่าน Google Thai HD อย่างต่อเนื่องเป็นธรรมชาติ
  splitThaiText(text, maxLen = 140) {
    if (!text) return [];
    // แยกตามเครื่องหมายวรรคตอน ย่อหน้า หรือช่องว่าง
    const rawParts = text.split(/([,.\n\r\t]+|\s{2,})/);
    const chunks = [];
    let cur = '';

    for (let p of rawParts) {
      if (!p) continue;
      if ((cur + p).length <= maxLen) {
        cur += p;
      } else {
        if (cur.trim()) chunks.push(cur.trim());
        if (p.length > maxLen) {
          for (let i = 0; i < p.length; i += maxLen) {
            const sub = p.substring(i, i + maxLen).trim();
            if (sub) chunks.push(sub);
          }
          cur = '';
        } else {
          cur = p;
        }
      }
    }
    if (cur.trim()) chunks.push(cur.trim());
    return chunks.filter(c => c.length > 0);
  },

  // เล่นเสียงพากย์ภาษาไทยธรรมชาติ 100% ผ่าน Google Natural Thai Audio
  playThaiGoogleAudio(text, onStart, onEnd) {
    this.stopSpeaking();
    const chunks = this.splitThaiText(text, 140);
    if (chunks.length === 0) {
      if (onEnd) onEnd();
      return;
    }

    let chunkIdx = 0;
    this.duckBGM(true);
    if (onStart) onStart();

    const playNextChunk = () => {
      if (!this.isPlaying) {
        this.duckBGM(false);
        return;
      }
      if (chunkIdx >= chunks.length) {
        this.duckBGM(false);
        if (onEnd) onEnd();
        return;
      }

      const chunk = chunks[chunkIdx++];
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=th&client=tw-ob&q=${encodeURIComponent(chunk)}`;
      const audio = new Audio(url);
      this.currentVoiceAudio = audio;

      audio.onended = () => {
        playNextChunk();
      };

      audio.onerror = (e) => {
        console.warn('Google Thai Audio error, trying next chunk:', e);
        playNextChunk();
      };

      audio.play().catch(err => {
        console.warn('Google Thai Audio play blocked:', err);
        playNextChunk();
      });
    };

    playNextChunk();
  },

  speakScene(scene, onComplete) {
    if (this.voiceMode === 'mute') {
      if (onComplete) setTimeout(onComplete, 1000);
      return;
    }

    // 1. หากมีไฟล์เสียงที่อัดหรืออัปโหลดไว้เฉพาะฉากนี้
    if (scene.customVoiceAudio) {
      this.stopSpeaking();
      this.duckBGM(true);
      scene.customVoiceAudio.currentTime = 0;
      scene.customVoiceAudio.play();
      scene.customVoiceAudio.onended = () => {
        this.duckBGM(false);
        if (onComplete) onComplete();
      };
      return;
    }

    // 2. หากเลือกเสียงธรรมชาติ Google Thai HD หรือไม่มีเสียงไทยในระบบ (ป้องกันการพูดภาษาอังกฤษ 100%!)
    if (this.voiceType === 'google_thai' || !this.selectedVoice) {
      this.playThaiGoogleAudio(scene.script, () => {
        this.duckBGM(true);
      }, () => {
        this.duckBGM(false);
        if (onComplete) onComplete();
      });
      return;
    }

    // 3. ใช้ Web Speech เมื่อมีเสียงภาษาไทยในเครื่องจริงเท่านั้น
    if (typeof window !== 'undefined' && window.speechSynthesis && this.selectedVoice) {
      this.stopSpeaking();
      const utterance = new SpeechSynthesisUtterance(scene.script);
      utterance.lang = this.selectedVoice.lang || 'th-TH';
      utterance.voice = this.selectedVoice;
      utterance.pitch = this.voicePitch;
      utterance.rate = this.voiceRate;

      utterance.onstart = () => this.duckBGM(true);
      utterance.onend = () => {
        this.duckBGM(false);
        this.currentUtterance = null;
        if (onComplete) onComplete();
      };
      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        this.duckBGM(false);
        this.currentUtterance = null;
        if (onComplete) onComplete();
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      if (onComplete) onComplete();
    }
  },

  stopSpeaking() {
    if (this.currentVoiceAudio) {
      try {
        this.currentVoiceAudio.pause();
        this.currentVoiceAudio.currentTime = 0;
      } catch (e) {}
      this.currentVoiceAudio = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.scenes.forEach(s => {
      if (s.customVoiceAudio) {
        s.customVoiceAudio.pause();
        s.customVoiceAudio.currentTime = 0;
      }
    });
    this.duckBGM(false);
  },

  // ================= 🎨 CANVAS RENDERER & MOTION GRAPHICS =================
  renderFrame(scene, sceneProgress, totalProgress) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // 1. พื้นหลังสีดำเข้ม
    ctx.fillStyle = "#090D16";
    ctx.fillRect(0, 0, w, h);

    // 2. Ken Burns Pan & Zoom บนภาพพื้นหลัง
    const bgImg = this.loadedImages[scene.bgImage];
    if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
      ctx.save();
      // คำนวณ Scale จาก 1.0 -> 1.14 อย่างนุ่มนวล
      const scale = 1.0 + (sceneProgress * 0.14);
      const panX = Math.sin(sceneProgress * Math.PI) * (w * 0.02);
      const panY = (sceneProgress - 0.5) * (h * 0.02);

      ctx.translate(w / 2 + panX, h / 2 + panY);
      ctx.scale(scale, scale);

      // วาดภาพให้อยู่กึ่งกลางแบบ cover
      const imgRatio = bgImg.naturalWidth / bgImg.naturalHeight;
      const canvasRatio = w / h;
      let drawW = w;
      let drawH = h;
      if (imgRatio > canvasRatio) {
        drawW = h * imgRatio;
      } else {
        drawH = w / imgRatio;
      }

      ctx.drawImage(bgImg, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    }

    // 3. Cinematic Dark Vignette & Gradient Overlays
    // Radial Vignette
    const radialGrad = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, w * 0.75);
    radialGrad.addColorStop(0, "rgba(5, 10, 20, 0.25)");
    radialGrad.addColorStop(1, "rgba(2, 6, 15, 0.88)");
    ctx.fillStyle = radialGrad;
    ctx.fillRect(0, 0, w, h);

    // Bottom Dark Gradient สำหรับ Lower-Thirds
    const bottomGrad = ctx.createLinearGradient(0, h * 0.45, 0, h);
    bottomGrad.addColorStop(0, "rgba(5, 10, 20, 0.7)");
    bottomGrad.addColorStop(1, "rgba(3, 7, 18, 0.96)");
    ctx.fillStyle = bottomGrad;
    ctx.fillRect(0, h * 0.45, w, h * 0.55);

    // 4. Floating Particles / Bokeh Effects
    this.drawParticles(ctx, w, h, sceneProgress);

    // 5. Broadcast Lower-Thirds & Information Card
    this.drawLowerThird(ctx, w, h, scene, sceneProgress);

    // 6. Dynamic Motion Components ตามประเภทฉาก
    if (scene.type === 'intro' || scene.type === 'conclusion') {
      this.drawAvatarProfile(ctx, w, h, scene, sceneProgress);
    } else if (scene.type === 'challenge_results') {
      this.drawComparisonBarChart(ctx, w, h, scene, sceneProgress);
    } else if (scene.type === 'conclusion') {
      this.drawScoreDial(ctx, w, h, scene, sceneProgress);
    } else if (scene.keyPoints) {
      this.drawKeyPointBadges(ctx, w, h, scene.keyPoints, sceneProgress);
    }

    // 7. Top Header Bar (สถานะการนำเสนอ & เวลา)
    this.drawTopBar(ctx, w, h, scene, totalProgress);

    // 8. Sound Wave Visualizer มุมล่างขวา
    this.drawAudioVisualizer(ctx, w, h);
  },

  // ละอองแสงลอยตัว (Floating Bokeh Particles)
  drawParticles(ctx, w, h, progress) {
    ctx.save();
    for (let i = 0; i < 16; i++) {
      const x = ((i * 137.5 + progress * 80) % w);
      const y = ((i * 92.3 - progress * 60) % (h * 0.8)) + h * 0.1;
      const radius = 2 + (i % 4) * 2.5;
      const alpha = 0.15 + Math.sin(progress * Math.PI * 2 + i) * 0.1;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(45, 212, 191, ${alpha})`; // Teal Glow
      ctx.fill();
    }
    ctx.restore();
  },

  // ป้าย Lower-Thirds สไตล์สถานีข่าวโทรทัศน์
  drawLowerThird(ctx, w, h, scene, progress) {
    ctx.save();
    const boxY = h - 260;
    const boxH = 190;
    const boxW = w - 160;
    const boxX = 80;

    // การเลื่อนเข้าอย่างนุ่มนวล (Slide-Up)
    const animIn = Math.min(1, progress * 8);
    const easeY = (1 - animIn) * 30;

    // พื้นหลังกระจก Glassmorphic
    ctx.fillStyle = "rgba(15, 23, 42, 0.78)";
    ctx.strokeStyle = "rgba(45, 212, 191, 0.4)";
    ctx.lineWidth = 2;
    this.roundRect(ctx, boxX, boxY + easeY, boxW, boxH, 24, true, true);

    // แถบ Accent Color ด้านซ้าย
    ctx.fillStyle = "#14B8A6"; // Teal Emerald
    this.roundRect(ctx, boxX + 6, boxY + easeY + 6, 8, boxH - 12, 4, true, false);

    // ป้ายหมวดหมู่ / รหัสตัวชี้วัด (Badge)
    ctx.fillStyle = "rgba(20, 184, 166, 0.25)";
    ctx.strokeStyle = "#2DD4BF";
    ctx.lineWidth = 1;
    this.roundRect(ctx, boxX + 32, boxY + easeY + 22, 280, 34, 8, true, true);

    ctx.fillStyle = "#2DD4BF";
    ctx.font = "bold 18px 'Prompt', Sarabun, sans-serif";
    ctx.fillText("ว.PA ก.ค.ศ. · นำเสนอผลงาน", boxX + 48, boxY + easeY + 45);

    // หัวข้อหลักของฉาก (Scene Title)
    ctx.fillStyle = "#F8FAFC";
    ctx.font = "bold 38px 'Prompt', Sarabun, sans-serif";
    ctx.fillText(scene.title, boxX + 32, boxY + easeY + 98);

    // คำบรรยายรอง (Subtitle)
    ctx.fillStyle = "#94A3B8";
    ctx.font = "500 24px 'Sarabun', sans-serif";
    ctx.fillText(scene.subtitle || '', boxX + 32, boxY + easeY + 142);

    ctx.restore();
  },

  // กรอบรูปโปรไฟล์ครูทรงกลมพร้อมวงแหวนนีออน
  drawAvatarProfile(ctx, w, h, scene, progress) {
    const avatarImg = this.loadedImages[scene.avatar];
    if (!avatarImg || !avatarImg.complete) return;

    ctx.save();
    const centerX = w / 2;
    const centerY = h * 0.36;
    const radius = 135;

    // วงแหวนเรืองแสงหมุนเบาๆ
    const ringRadius = radius + 8 + Math.sin(progress * Math.PI * 4) * 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(45, 212, 191, 0.7)";
    ctx.lineWidth = 4;
    ctx.stroke();

    // วาดรูปทรงกลม
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(avatarImg, centerX - radius, centerY - radius, radius * 2, radius * 2);
    ctx.restore();
  },

  // กราฟแท่งเปรียบเทียบ Pre-test vs Post-test ยืดตัวสูงขึ้นสดๆ
  drawComparisonBarChart(ctx, w, h, scene, progress) {
    ctx.save();
    const chartX = w / 2 - 340;
    const chartY = h * 0.28;
    const chartW = 680;
    const chartH = 260;

    // ตลับการ์ดพื้นหลังกราฟ
    ctx.fillStyle = "rgba(10, 18, 35, 0.85)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, chartX, chartY, chartW, chartH, 20, true, true);

    const animProgress = Math.min(1, Math.max(0, (progress - 0.1) * 2.5));

    // แท่ง Pre-test
    const preH = (scene.preTest / 100) * 160 * animProgress;
    ctx.fillStyle = "#64748B";
    this.roundRect(ctx, chartX + 100, chartY + chartH - 50 - preH, 140, preH, 10, true, false);

    ctx.fillStyle = "#CBD5E1";
    ctx.font = "bold 22px 'Prompt', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`Pre-test: ${(scene.preTest * animProgress).toFixed(1)}%`, chartX + 170, chartY + chartH - 60 - preH);

    // แท่ง Post-test (สีทองเขียว)
    const postH = (scene.postTest / 100) * 160 * animProgress;
    const grad = ctx.createLinearGradient(0, chartY, 0, chartY + chartH);
    grad.addColorStop(0, "#10B981");
    grad.addColorStop(1, "#047857");
    ctx.fillStyle = grad;
    this.roundRect(ctx, chartX + 440, chartY + chartH - 50 - postH, 140, postH, 10, true, false);

    ctx.fillStyle = "#34D399";
    ctx.font = "bold 24px 'Prompt', sans-serif";
    ctx.fillText(`Post-test: ${(scene.postTest * animProgress).toFixed(1)}%`, chartX + 510, chartY + chartH - 60 - postH);

    // ป้ายแสดงความต่าง +28.5%
    if (animProgress > 0.6) {
      ctx.fillStyle = "rgba(251, 191, 36, 0.2)";
      ctx.strokeStyle = "#FBBF24";
      this.roundRect(ctx, chartX + 270, chartY + 40, 140, 50, 25, true, true);

      ctx.fillStyle = "#FBBF24";
      ctx.font = "bold 22px 'Prompt', sans-serif";
      ctx.fillText(`+${scene.diffPercent}%`, chartX + 340, chartY + 73);
    }

    ctx.textAlign = "left";
    ctx.restore();
  },

  // เกจวัดคะแนนรวม 96/100 วิ่งขึ้น
  drawScoreDial(ctx, w, h, scene, progress) {
    ctx.save();
    const centerX = w / 2;
    const centerY = h * 0.35;
    const radius = 120;

    const animProgress = Math.min(1, Math.max(0, (progress - 0.1) * 2));
    const currentScore = Math.floor(scene.score * animProgress);

    // วงกลมรางหลัง
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 16;
    ctx.stroke();

    // วงกลมความคืบหน้าคะแนน
    const endAngle = -Math.PI / 2 + (animProgress * (scene.score / 100) * Math.PI * 2);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, endAngle);
    ctx.strokeStyle = "#10B981";
    ctx.lineWidth = 16;
    ctx.lineCap = "round";
    ctx.stroke();

    // ตัวเลขคะแนนตรงกลาง
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 64px 'Prompt', sans-serif";
    ctx.fillText(`${currentScore}`, centerX, centerY + 10);

    ctx.fillStyle = "#34D399";
    ctx.font = "bold 20px 'Prompt', sans-serif";
    ctx.fillText("เต็ม 100 คะแนน", centerX, centerY + 45);

    ctx.textAlign = "left";
    ctx.restore();
  },

  // ป้ายรายการหลักฐาน 3-4 ป้ายลอยตัว
  drawKeyPointBadges(ctx, w, h, keyPoints, progress) {
    ctx.save();
    const startX = 120;
    const startY = h * 0.32;

    keyPoints.forEach((point, idx) => {
      const animPoint = Math.min(1, Math.max(0, (progress - (idx * 0.15)) * 4));
      if (animPoint <= 0) return;

      const y = startY + (idx * 68);
      const slideX = (1 - animPoint) * 50;

      ctx.fillStyle = "rgba(15, 23, 42, 0.82)";
      ctx.strokeStyle = "rgba(45, 212, 191, 0.35)";
      ctx.lineWidth = 1.5;
      this.roundRect(ctx, startX + slideX, y, 760, 52, 12, true, true);

      // Icon Check
      ctx.fillStyle = "#10B981";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("✓", startX + slideX + 20, y + 33);

      // ข้อความ
      ctx.fillStyle = "#E2E8F0";
      ctx.font = "600 21px 'Sarabun', sans-serif";
      ctx.fillText(point, startX + slideX + 54, y + 34);
    });

    ctx.restore();
  },

  // แถบสถานะด้านบนสุด
  drawTopBar(ctx, w, h, scene, totalProgress) {
    ctx.save();
    // แถบพื้นหลังดำโปร่ง
    ctx.fillStyle = "rgba(3, 7, 18, 0.85)";
    ctx.fillRect(0, 0, w, 70);

    // โลโก้ PA
    ctx.fillStyle = "#10B981";
    ctx.font = "bold 22px 'Prompt', sans-serif";
    ctx.fillText("PAFolio AI Studio", 50, 44);

    // แสดงลำดับฉากปัจจุบัน
    ctx.fillStyle = "#94A3B8";
    ctx.font = "500 18px 'Prompt', sans-serif";
    ctx.fillText(`ฉากที่ ${scene.id} / ${this.scenes.length} : ${scene.title}`, 280, 44);

    // เวลาที่ผ่านไป
    const totalSec = this.getTotalDuration();
    const curSec = Math.floor(totalProgress * totalSec);
    const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
    
    ctx.textAlign = "right";
    ctx.fillStyle = "#2DD4BF";
    ctx.font = "bold 18px 'Prompt', monospace";
    ctx.fillText(`${formatTime(curSec)} / ${formatTime(totalSec)}`, w - 50, 44);

    // แถบหลอดความคืบหน้ารวมใต้ Top bar
    ctx.fillStyle = "#1E293B";
    ctx.fillRect(0, 68, w, 4);

    const progGrad = ctx.createLinearGradient(0, 0, w, 0);
    progGrad.addColorStop(0, "#2DD4BF");
    progGrad.addColorStop(1, "#F59E0B");
    ctx.fillStyle = progGrad;
    ctx.fillRect(0, 68, w * totalProgress, 4);

    ctx.textAlign = "left";
    ctx.restore();
  },

  // คลื่นเสียงเต้นเบาๆ มุมล่างขวา
  drawAudioVisualizer(ctx, w, h) {
    ctx.save();
    const vizX = w - 180;
    const vizY = h - 90;

    for (let i = 0; i < 7; i++) {
      const waveH = this.isDucked ? (12 + Math.sin(Date.now() * 0.015 + i) * 16) : 6;
      ctx.fillStyle = this.isDucked ? "#2DD4BF" : "#475569";
      this.roundRect(ctx, vizX + (i * 14), vizY - waveH / 2, 6, waveH, 3, true, false);
    }
    ctx.restore();
  },

  // ฟังก์ชันช่วยวาดสี่เหลี่ยมมุมโค้ง
  roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof radius === 'undefined') radius = 5;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  },

  // ================= ⏱️ TIMELINE & PLAYBACK CONTROLLER =================
  getSceneDuration(scene) {
    return (this.mode === 'short') ? scene.durationShort : scene.durationFull;
  },

  getTotalDuration() {
    return this.scenes.reduce((acc, s) => acc + this.getSceneDuration(s), 0);
  },

  play() {
    this.init();
    this.initAudio();
    this.isPlaying = true;
    this.startBGM();

    const scene = this.scenes[this.currentSceneIdx];
    this.speakScene(scene);

    let lastTime = performance.now();
    const loop = (now) => {
      if (!this.isPlaying) return;
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      this.sceneElapsedTime += dt;
      this.totalElapsedTime += dt;

      const curScene = this.scenes[this.currentSceneIdx];
      const curDur = this.getSceneDuration(curScene);
      const sceneProgress = Math.min(1, this.sceneElapsedTime / curDur);
      const totalProgress = Math.min(1, this.totalElapsedTime / this.getTotalDuration());

      this.renderFrame(curScene, sceneProgress, totalProgress);

      // เรียก callback อัปเดต UI พรีวิว
      if (this.onPlaybackTick) {
        this.onPlaybackTick(this.currentSceneIdx, sceneProgress, totalProgress);
      }

      // หากจบฉากปัจจุบัน ให้ขยับไปฉากถัดไป
      if (this.sceneElapsedTime >= curDur) {
        this.nextScene();
      }

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  },

  pause() {
    this.isPlaying = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.stopSpeaking();
    this.stopBGM();
  },

  nextScene() {
    if (this.currentSceneIdx < this.scenes.length - 1) {
      this.currentSceneIdx++;
      this.sceneElapsedTime = 0;
      const nextS = this.scenes[this.currentSceneIdx];
      this.speakScene(nextS);
    } else {
      // จบทั้งวิดีโอ
      this.pause();
      this.currentSceneIdx = 0;
      this.sceneElapsedTime = 0;
      this.totalElapsedTime = 0;
      if (this.onPlaybackComplete) this.onPlaybackComplete();
    }
  },

  prevScene() {
    if (this.currentSceneIdx > 0) {
      this.currentSceneIdx--;
      this.sceneElapsedTime = 0;
      const prevS = this.scenes[this.currentSceneIdx];
      this.speakScene(prevS);
    }
  },

  seekScene(idx) {
    if (idx >= 0 && idx < this.scenes.length) {
      this.currentSceneIdx = idx;
      this.sceneElapsedTime = 0;
      let elapsed = 0;
      for (let i = 0; i < idx; i++) {
        elapsed += this.getSceneDuration(this.scenes[i]);
      }
      this.totalElapsedTime = elapsed;
      const curS = this.scenes[this.currentSceneIdx];
      if (this.isPlaying) {
        this.speakScene(curS);
      } else {
        this.renderFrame(curS, 0, this.totalElapsedTime / this.getTotalDuration());
      }
    }
  },

  // ================= 📹 EXPORT FULL HD VIDEO RECORDER =================
  // บันทึกและส่งออกวิดีโอ 1080p Full HD ด้วย Canvas Capture + MediaRecorder
  async exportVideo(onProgress) {
    this.init();
    this.initAudio();
    this.pause();

    const canvasStream = this.canvas.captureStream(30); // 30 fps
    const audioStream = this.mediaDestNode.stream;

    // รวมสตรีมภาพและเสียงเข้าด้วยกัน
    const combinedTracks = [...canvasStream.getVideoTracks(), ...audioStream.getAudioTracks()];
    const combinedStream = new MediaStream(combinedTracks);

    // กำหนดรูปแบบ Codec
    let mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/mp4';
      }
    }

    const recordedChunks = [];
    const mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: mimeType,
      videoBitsPerSecond: 6000000 // 6 Mbps สำหรับ Full HD
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    return new Promise((resolve, reject) => {
      mediaRecorder.onstop = () => {
        this.isRecording = false;
        this.pause();
        const blob = new Blob(recordedChunks, { type: mimeType });
        resolve(blob);
      };

      mediaRecorder.onerror = (err) => {
        this.isRecording = false;
        reject(err);
      };

      this.isRecording = true;
      this.currentSceneIdx = 0;
      this.sceneElapsedTime = 0;
      this.totalElapsedTime = 0;
      mediaRecorder.start(500); // chunk ทุก 500ms

      this.isPlaying = true;
      this.startBGM();

      const curS = this.scenes[this.currentSceneIdx];
      this.speakScene(curS);

      let lastTime = performance.now();
      const exportLoop = (now) => {
        if (!this.isRecording) return;
        const dt = (now - lastTime) / 1000;
        lastTime = now;

        this.sceneElapsedTime += dt;
        this.totalElapsedTime += dt;

        const scene = this.scenes[this.currentSceneIdx];
        const dur = this.getSceneDuration(scene);
        const sceneProgress = Math.min(1, this.sceneElapsedTime / dur);
        const totalProgress = Math.min(1, this.totalElapsedTime / this.getTotalDuration());

        this.renderFrame(scene, sceneProgress, totalProgress);

        if (onProgress) {
          onProgress(Math.floor(totalProgress * 100), this.currentSceneIdx + 1, this.scenes.length);
        }

        if (this.sceneElapsedTime >= dur) {
          if (this.currentSceneIdx < this.scenes.length - 1) {
            this.currentSceneIdx++;
            this.sceneElapsedTime = 0;
            const nextS = this.scenes[this.currentSceneIdx];
            this.speakScene(nextS);
          } else {
            // บันทึกครบทุกฉาก
            mediaRecorder.stop();
            return;
          }
        }

        requestAnimationFrame(exportLoop);
      };

      requestAnimationFrame(exportLoop);
    });
  }
};

window.VideoEngine = VideoEngine;
