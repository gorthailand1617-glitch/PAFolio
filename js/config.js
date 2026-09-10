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
  APP_VERSION: "2569.9.9",

  // 📄 ชื่อไฟล์จัดเก็บสถานะระบบศูนย์กลางบน Google Drive
  CLOUD_STATE_FILE: "pafolio_cloud_state.json",

  // 🖼️ ภาพประจำตัวชุดสูทขาวและภาพปกมาตรฐานสากล
  DEFAULT_AVATAR_URL: "https://drive.google.com/thumbnail?id=1Xr2DlVf1ypx7sH1owj1DwteOW2_JljGP&sz=w800",
  DEFAULT_COVER_URL: "https://drive.google.com/thumbnail?id=1noPkaJIRiMIyg0InLRPMnEu4Bi8DNb8I&sz=w1920"
};

// Export เข้า Window object สำหรับเบราว์เซอร์
if (typeof window !== 'undefined') {
  window.PAFOLIO_CONFIG = PAFOLIO_CONFIG;
}
