/**
 * PAFolio - Central Configuration & Cloud Sync Baseline
 * กำหนดค่ามาตรฐานสากลเพื่อให้ทุกอุปกรณ์ทั่วโลก (คอมพิวเตอร์, แท็บเล็ต, สมาร์ตโฟน)
 * แสดงผลและซิงก์ข้อมูลจาก Google Drive ตรงกัน 100% แบบ Zero-Config
 */

const PAFOLIO_CONFIG = {
  // 📁 รหัสโฟลเดอร์หลัก ว.PA บน Google Drive (โฟลเดอร์ วPAครูกรกฎ รัตนะโช)
  ROOT_FOLDER_ID: "1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K",

  // 📅 รอบปีการศึกษาเริ่มต้นสากล
  DEFAULT_YEAR: "2569",

  // 🎨 รหัสธีมเริ่มต้นสากล (ทองคำจักรพรรดิ - Imperial Gold)
  DEFAULT_THEME: "gold",

  // 🌐 Google Apps Script Web App URL สากล (ตัวเชื่อมต่อ Google Drive แบบสด)
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycby7k7vKoFG6uugmoqGenVCdWPVXVAfkcWuw7mKcPm8qJSaUmwtOFW_yaEmVAwUlma_Miw/exec",

  // 🔖 เลขเวอร์ชันระบบสำหรับจัดการ Cache สากล
  APP_VERSION: "2569.9.16",

  // 📄 ชื่อไฟล์จัดเก็บสถานะระบบศูนย์กลางบน Google Drive
  CLOUD_STATE_FILE: "pafolio_cloud_state.json",

  // 🖼️ ภาพประจำตัวชุดสูทขาวและภาพปกมาตรฐานสากล
  DEFAULT_AVATAR_URL: "https://drive.google.com/thumbnail?id=1Xr2DlVf1ypx7sH1owj1DwteOW2_JljGP&sz=w800",
  DEFAULT_COVER_URL: "https://drive.google.com/thumbnail?id=1A8UF9r9sP3PpB6KEHidfGon8-UExNGYa&sz=w1920",

  // 🎥 รายการคลิปวิดีโอ ว.PA เริ่มต้น 11 รายการ (แสดงผลทันทีทุกเครื่องทั่วโลกแบบ Zero-Config)
  DEFAULT_YOUTUBE_VIDEOS: [
    {
      "id": "yt-custom-1789044696258",
      "youtubeUrl": "https://youtube.com/shorts/ToTl7L4yX6c",
      "videoId": "ToTl7L4yX6c",
      "title": "เรียนเล่นเพลิน",
      "category": "inspiration",
      "categoryThai": "คลิปสภาพปัญหา/แรงบันดาลใจ 10 นาที",
      "categoryBadge": "bg-amber-500/20 text-amber-600 border-amber-500/30",
      "duration": "ไม่ระบุ",
      "date": "ปีการศึกษา 2568",
      "indicator": "",
      "description": "",
      "isCustom": true
    },
    {
      "id": "yt-custom-1789044543874",
      "youtubeUrl": "https://youtube.com/shorts/rynx8HWQTJ4",
      "videoId": "rynx8HWQTJ4",
      "title": "การใช้ระบบดูแลช่วยเหลือผู้เรียน SSS",
      "category": "outcome",
      "categoryThai": "ผลลัพธ์การเรียนรู้ของผู้เรียน",
      "categoryBadge": "bg-emerald-500/20 text-emerald-600 border-emerald-500/30",
      "duration": "ไม่ระบุ",
      "date": "ปีการศึกษา 2568",
      "indicator": "",
      "description": "",
      "isCustom": true
    },
    {
      "id": "yt-custom-1789044393200",
      "youtubeUrl": "https://youtube.com/shorts/MZlwO5kw0cw",
      "videoId": "MZlwO5kw0cw",
      "title": "การเขียนเพลงด้วย AI",
      "category": "innovation",
      "categoryThai": "สื่อนวัตกรรมการจัดการเรียนรู้",
      "categoryBadge": "bg-indigo-500/20 text-indigo-600 border-indigo-500/30",
      "duration": "ไม่ระบุ",
      "date": "ปีการศึกษา 2568",
      "indicator": "",
      "description": "",
      "isCustom": true
    },
    {
      "id": "yt-custom-1789044241938",
      "youtubeUrl": "https://youtu.be/OP1t6MdEChk",
      "videoId": "OP1t6MdEChk",
      "title": "ใบงานมัลติมิเตอร์",
      "category": "innovation",
      "categoryThai": "สื่อนวัตกรรมการจัดการเรียนรู้",
      "categoryBadge": "bg-indigo-500/20 text-indigo-600 border-indigo-500/30",
      "duration": "ไม่ระบุ",
      "date": "ปีการศึกษา 2568",
      "indicator": "",
      "description": "",
      "isCustom": true
    },
    {
      "id": "yt-custom-1789044146936",
      "youtubeUrl": "https://youtu.be/wsxII2q6lvE?si=tTZ1iH8oYck6EktP",
      "videoId": "wsxII2q6lvE",
      "title": "adaptive Learnning",
      "category": "innovation",
      "categoryThai": "สื่อนวัตกรรมการจัดการเรียนรู้",
      "categoryBadge": "bg-indigo-500/20 text-indigo-600 border-indigo-500/30",
      "duration": "ไม่ระบุ",
      "date": "ปีการศึกษา 2568",
      "indicator": "",
      "description": "",
      "isCustom": true
    },
    {
      "id": "yt-custom-1789043676633",
      "youtubeUrl": "https://youtu.be/2uPpm3kqSIU",
      "videoId": "2uPpm3kqSIU",
      "title": "แข่งหุ่นยนต์นานาชาติ2569",
      "category": "outcome",
      "categoryThai": "ผลลัพธ์การเรียนรู้ของผู้เรียน",
      "categoryBadge": "bg-emerald-500/20 text-emerald-600 border-emerald-500/30",
      "duration": "ไม่ระบุ",
      "date": "ปีการศึกษา 2568",
      "indicator": "",
      "description": "",
      "isCustom": true
    },
    {
      "id": "yt-custom-1789039336440",
      "youtubeUrl": "https://youtu.be/0394XTVyg5E?si=i0DHdA6qab4YHYZ5",
      "videoId": "0394XTVyg5E",
      "title": "นำเสนอผลการประเมินตนเอง 2569",
      "category": "teaching",
      "categoryThai": "คลิปจัดการเรียนรู้ 60 นาที",
      "categoryBadge": "bg-rose-500/20 text-rose-600 border-rose-500/30",
      "duration": "ไม่ระบุ",
      "date": "ปีการศึกษา 2568",
      "indicator": "",
      "description": "",
      "isCustom": true
    },
    {
      "id": "yt-default-1",
      "youtubeUrl": "https://www.youtube.com/watch?v=kYJydZ90dC4",
      "videoId": "kYJydZ90dC4",
      "title": "คลิปบันทึกการจัดกิจกรรมการเรียนรู้เชิงรุก (Active Learning) 60 นาที",
      "category": "teaching",
      "categoryThai": "คลิปจัดการเรียนรู้ 60 นาที",
      "categoryBadge": "bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/30",
      "duration": "58:20 นาที",
      "date": "ภาคเรียนที่ 1 ปีการศึกษา 2568",
      "indicator": "ด้านที่ 1 การจัดการเรียนรู้ (ตัวชี้วัด 1.1 - 1.8)",
      "description": "บันทึกการจัดกระบวนการเรียนรู้ตามแผนการจัดการเรียนรู้รายวิชาการงานอาชีพ เรื่อง กระบวนการ AI-Driven PREM Model สู่การสร้างมูลค่าเพิ่มทางเศรษฐกิจสร้างสรรค์ (คลิปเต็มต่อเนื่อง ไม่ตัดต่อ ตามเกณฑ์ ว9/2564)",
      "isCustom": false
    },
    {
      "id": "yt-default-2",
      "youtubeUrl": "https://www.youtube.com/watch?v=7wtfhZwyrcc",
      "videoId": "7wtfhZwyrcc",
      "title": "คลิปสภาพปัญหา ที่มา หรือแรงบันดาลใจในการจัดการเรียนรู้ 10 นาที",
      "category": "inspiration",
      "categoryThai": "คลิปสภาพปัญหา/แรงบันดาลใจ 10 นาที",
      "categoryBadge": "bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30",
      "duration": "09:45 นาที",
      "date": "ภาคเรียนที่ 1 ปีการศึกษา 2568",
      "indicator": "ส่วนที่ 2 ข้อตกลงในการพัฒนางาน (ประเด็นท้าทาย)",
      "description": "การนำเสนอสภาพปัญหาของผู้เรียน การวิเคราะห์บริบทสภาพแวดล้อม และแรงบันดาลใจในการออกแบบรูปแบบการสอน Active Learning ผสานเทคโนโลยี เพื่อแก้ปัญหาทักษะการคิดเชิงนวัตกรรม",
      "isCustom": false
    },
    {
      "id": "yt-default-3",
      "youtubeUrl": "https://www.youtube.com/watch?v=LXb3EKWsInQ",
      "videoId": "LXb3EKWsInQ",
      "title": "คลิปการนำเสนอผลงานและผลลัพธ์การเรียนรู้ของผู้เรียน (Student Outcomes)",
      "category": "outcome",
      "categoryThai": "ผลลัพธ์การเรียนรู้ของผู้เรียน",
      "categoryBadge": "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
      "duration": "12:30 นาที",
      "date": "ภาคเรียนที่ 2 ปีการศึกษา 2568",
      "indicator": "ด้านที่ 2 ผลลัพธ์การเรียนรู้ของผู้เรียน (ตัวชี้วัด 2.1 - 2.4)",
      "description": "หลักฐานเชิงประจักษ์การแสดงออกของนักเรียน การนำเสนอชิ้นงานนวัตกรรม Eco-Product และการสะท้อนคิด (Reflection) ของผู้เรียนรายกลุ่มและรายบุคคล",
      "isCustom": false
    },
    {
      "id": "yt-default-4",
      "youtubeUrl": "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
      "videoId": "kJQP7kiw5Fk",
      "title": "คลิปสาธิตสื่อและนวัตกรรมการเรียนรู้ดิจิทัล (Smart Eco-Vocation)",
      "category": "innovation",
      "categoryThai": "สื่อนวัตกรรมการจัดการเรียนรู้",
      "categoryBadge": "bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border-indigo-500/30",
      "duration": "15:10 นาที",
      "date": "ปีการศึกษา 2568",
      "indicator": "ตัวชี้วัด 1.4 การสร้างและหรือพัฒนาสื่อ นวัตกรรม",
      "description": "การสาธิตการใช้ Thinking Whiteboard ชุดฝึกทักษะวิชาชีพ และการประยุกต์ใช้ปัญญาประดิษฐ์ (AI) ในการออกแบบชิ้นงานของนักเรียน",
      "isCustom": false
    }
  ]
};

// Export เข้า Window object สำหรับเบราว์เซอร์
if (typeof window !== 'undefined') {
  window.PAFOLIO_CONFIG = PAFOLIO_CONFIG;
}
