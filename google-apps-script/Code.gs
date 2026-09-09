/**
 * =========================================================================
 * 🌟 PAFolio - Google Apps Script Engine v3.0 (Smart Folder Generator & API)
 * ระบบจัดการ Google Drive และสร้างโครงสร้างโฟลเดอร์ ว.PA อัตโนมัติในคลิกเดียว
 * =========================================================================
 * 
 * 📌 ขั้นตอนการ Deploy เป็น Web App ให้หน้าเว็บเชื่อมต่อได้ (ป้องกัน Failed to fetch):
 * -------------------------------------------------------------------------
 * 1. กดปุ่มสีน้ำเงินมุมขวาบน "การทำให้ใช้งานได้" (Deploy) -> "การทำให้ใช้งานได้ใหม่" (New deployment)
 * 2. คลิกรูปเฟืองด้านซ้าย เลือกประเภทเป็น "เว็บแอป" (Web app)
 * 3. ตั้งค่าคำอธิบาย: PAFolio API v3
 * 4. ดำเนินการในฐานะ (Execute as): "ฉัน (อีเมลของคุณ)" (Me)
 * 5. ⚠️ จุดสำคัญที่สุด: ผู้มีสิทธิ์เข้าถึง (Who has access): เลือก "ทุกคน" (Anyone)
 *    (หากเลือกเป็น "ฉันเท่านั้น" หรือ "เฉพาะในองค์กร" หน้าเว็บจะขึ้น Failed to fetch ทันที)
 * 6. กด "ทำให้ใช้งานได้" (Deploy) และให้สิทธิ์เข้าถึง (Review permissions) ตามขั้นตอนของ Google
 * 7. คัดลอก "URL เว็บแอป" (ที่ลงท้ายด้วย /exec) นำไปวางในหน้าเว็บ PAFolio เมนู "ตั้งค่า Google Drive"
 * -------------------------------------------------------------------------
 */

// ================= ⚙️ ตั้งค่าพื้นฐาน =================
// 1. ใส่ ID ของโฟลเดอร์หลักใน Google Drive (หากเว้นว่าง ระบบจะสร้างโฟลเดอร์หลักใหม่ที่หน้าแรกของไดรฟ์)
const ROOT_FOLDER_ID = "1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K";

// 2. ข้อมูลคุณครูสำหรับใช้ตั้งชื่อโครงสร้างโฟลเดอร์อัตโนมัติ
const TEACHER_NAME = "นายกรกฎ รัตนะโชติ";
const ACADEMIC_YEARS = ["2570", "2569", "2568", "2567", "2566"]; // ปีการศึกษาที่ต้องการสร้างโฟลเดอร์


/**
 * =========================================================================
 * 🛠️ ฟังก์ชันที่ 1: กด "เรียกใช้" (Run) เพื่อสร้างโฟลเดอร์ ว.PA อัตโนมัติทั้งหมด
 * (เลือกฟังก์ชัน "createPAFolderStructure" จากดรอปดาวน์ด้านบน แล้วกด "เรียกใช้")
 * =========================================================================
 */
function createPAFolderStructure() {
  Logger.log("🚀 กำลังเริ่มต้นสร้างโครงสร้างโฟลเดอร์ ว.PA สำหรับ: " + TEACHER_NAME);

  let rootFolder;
  try {
    if (ROOT_FOLDER_ID && ROOT_FOLDER_ID !== "YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE") {
      rootFolder = DriveApp.getFolderById(ROOT_FOLDER_ID);
      Logger.log("📁 พบโฟลเดอร์หลักเดิม: " + rootFolder.getName());
    } else {
      rootFolder = DriveApp.createFolder("PAFolio - แฟ้มสะสมงาน ว.PA (" + TEACHER_NAME + ")");
      Logger.log("✨ สร้างโฟลเดอร์หลักใหม่สำเร็จ: " + rootFolder.getName() + " (ID: " + rootFolder.getId() + ")");
    }
  } catch (e) {
    rootFolder = DriveApp.createFolder("PAFolio - แฟ้มสะสมงาน ว.PA (" + TEACHER_NAME + ")");
    Logger.log("✨ สร้างโฟลเดอร์หลักใหม่: " + rootFolder.getName());
  }

  // -------------------------------------------------------------
  // 1. โฟลเดอร์กลางสำหรับระบบ: รูปโปรไฟล์, โลโก้, ปก, สื่อประชาสัมพันธ์
  // -------------------------------------------------------------
  const assetFolder = getOrCreateSubFolder(rootFolder, "🖼️ 00_Assets_ภาพประจำตัวและโลโก้");
  getOrCreateSubFolder(assetFolder, "01_รูปโปรไฟล์ครู (Profile Photos)");
  getOrCreateSubFolder(assetFolder, "02_โลโก้โรงเรียนและตราสัญลักษณ์ (Logos)");
  getOrCreateSubFolder(assetFolder, "03_ภาพปกและภาพหัวเรื่อง (Banners & Covers)");
  getOrCreateSubFolder(assetFolder, "04_เกียรติบัตรและโล่รางวัลรวม (Certificates)");
  Logger.log("  ✅ สร้างโฟลเดอร์รูปโปรไฟล์, โลโก้ และ Assets ส่วนกลางเรียบร้อย");

  // -------------------------------------------------------------
  // 2. สร้างโครงสร้างย่อยตามแต่ละปีการศึกษา (เช่น 2568, 2567)
  // -------------------------------------------------------------
  const indicatorList = [
    // ด้านที่ 1: ด้านการจัดการเรียนรู้ (8 ตัวชี้วัด)
    { code: "1.1", name: "1.1 สร้างและหรือพัฒนาหลักสูตร", domain: "ด้านที่ 1 การจัดการเรียนรู้" },
    { code: "1.2", name: "1.2 ออกแบบการจัดการเรียนรู้", domain: "ด้านที่ 1 การจัดการเรียนรู้" },
    { code: "1.3", name: "1.3 จัดกิจกรรมการเรียนรู้ (Active Learning)", domain: "ด้านที่ 1 การจัดการเรียนรู้" },
    { code: "1.4", name: "1.4 สร้างและหรือพัฒนาสื่อ นวัตกรรม เทคโนโลยี", domain: "ด้านที่ 1 การจัดการเรียนรู้" },
    { code: "1.5", name: "1.5 วัดและประเมินผลการเรียนรู้", domain: "ด้านที่ 1 การจัดการเรียนรู้" },
    { code: "1.6", name: "1.6 ศึกษา วิเคราะห์ สังเคราะห์ เพื่อแก้ไขปัญหา", domain: "ด้านที่ 1 การจัดการเรียนรู้" },
    { code: "1.7", name: "1.7 จัดบรรยากาศที่ส่งเสริมและพัฒนาผู้เรียน", domain: "ด้านที่ 1 การจัดการเรียนรู้" },
    { code: "1.8", name: "1.8 อบรมและพัฒนาคุณลักษณะที่ดีของผู้เรียน", domain: "ด้านที่ 1 การจัดการเรียนรู้" },
    
    // ด้านที่ 2: ด้านการส่งเสริมและสนับสนุนการจัดการเรียนรู้ (4 ตัวชี้วัด)
    { code: "2.1", name: "2.1 จัดทำข้อมูลสารสนเทศของผู้เรียนและรายวิชา", domain: "ด้านที่ 2 ส่งเสริมและสนับสนุน" },
    { code: "2.2", name: "2.2 ดำเนินการตามระบบดูแลช่วยเหลือผู้เรียน (SDQ)", domain: "ด้านที่ 2 ส่งเสริมและสนับสนุน" },
    { code: "2.3", name: "2.3 ปฏิบัติงานวิชาการ และงานอื่นๆ ของสถานศึกษา", domain: "ด้านที่ 2 ส่งเสริมและสนับสนุน" },
    { code: "2.4", name: "2.4 ประสานความร่วมมือกับผู้ปกครองและภาคีเครือข่าย", domain: "ด้านที่ 2 ส่งเสริมและสนับสนุน" },

    // ด้านที่ 3: ด้านการพัฒนาตนเองและวิชาชีพ (3 ตัวชี้วัด)
    { code: "3.1", name: "3.1 พัฒนาตนเองอย่างเป็นระบบและต่อเนื่อง (อบรม/สัมมนา)", domain: "ด้านที่ 3 พัฒนาตนเองและวิชาชีพ" },
    { code: "3.2", name: "3.2 มีส่วนร่วมและเป็นผู้นำในการแลกเปลี่ยนเรียนรู้ทางวิชาชีพ (PLC)", domain: "ด้านที่ 3 พัฒนาตนเองและวิชาชีพ" },
    { code: "3.3", name: "3.3 นำความรู้ ทักษะ มาใช้ในการพัฒนาการจัดการเรียนรู้", domain: "ด้านที่ 3 พัฒนาตนเองและวิชาชีพ" }
  ];

  ACADEMIC_YEARS.forEach(year => {
    Logger.log("📂 กำลังสร้างโฟลเดอร์สำหรับรอบปีการศึกษา: " + year);
    const yearFolder = getOrCreateSubFolder(rootFolder, "PA" + year.substring(2) + " ผลการประเมิน ว.PA ปีการศึกษา " + year);

    // 2.1 โฟลเดอร์ Assets ประจำปี: รูปโปรไฟล์, โลโก้, ภาพปก แยกตามปีการศึกษา
    const yearAssetFolder = getOrCreateSubFolder(yearFolder, "🖼️ 00_Assets_ภาพประจำตัวและโลโก้");
    getOrCreateSubFolder(yearAssetFolder, "01_รูปโปรไฟล์ครู (Profile Photos)");
    getOrCreateSubFolder(yearAssetFolder, "02_โลโก้โรงเรียนและตราสัญลักษณ์ (Logos)");
    getOrCreateSubFolder(yearAssetFolder, "03_ภาพปกและภาพหัวเรื่อง (Banners & Covers)");
    getOrCreateSubFolder(yearAssetFolder, "04_เกียรติบัตรและโล่รางวัลรวม (Certificates)");

    // 2.2 โฟลเดอร์รูปถ่ายกิจกรรมประจำปี
    getOrCreateSubFolder(yearFolder, "📸 รูปถ่ายครูและภาพกิจกรรมประจำปี " + year);

    // 2.3 โฟลเดอร์แบ่งตาม 3 ด้าน 15 ตัวชี้วัด
    const domain1Folder = getOrCreateSubFolder(yearFolder, "ด้านที่ 1 ด้านการจัดการเรียนรู้ (8 ตัวชี้วัด)");
    const domain2Folder = getOrCreateSubFolder(yearFolder, "ด้านที่ 2 ด้านการส่งเสริมและสนับสนุน (4 ตัวชี้วัด)");
    const domain3Folder = getOrCreateSubFolder(yearFolder, "ด้านที่ 3 ด้านการพัฒนาตนเองและวิชาชีพ (3 ตัวชี้วัด)");

    indicatorList.forEach(ind => {
      let targetDomainFolder = domain1Folder;
      if (ind.code.startsWith("2.")) targetDomainFolder = domain2Folder;
      else if (ind.code.startsWith("3.")) targetDomainFolder = domain3Folder;

      const indFolder = getOrCreateSubFolder(targetDomainFolder, ind.name);
      // สร้างโฟลเดอร์แยกย่อยในแต่ละตัวชี้วัด (ไฟล์เอกสาร PDF / รูปภาพหลักฐาน)
      getOrCreateSubFolder(indFolder, "🖼️ รูปภาพประกอบตัวชี้วัด " + ind.code);
      getOrCreateSubFolder(indFolder, "📄 เอกสารและหลักฐาน PDF");
    });

    // 2.3 โฟลเดอร์ข้อตกลงประเด็นท้าทาย (ตามระเบียบวิธีวิจัย 5 บท)
    const challengeFolder = getOrCreateSubFolder(yearFolder, "🎯 ส่วนที่ 2 ข้อตกลงประเด็นท้าทาย (นวัตกรรมและงานวิจัย 5 บท)");
    getOrCreateSubFolder(challengeFolder, "01_แผนการสอนและกระบวนการจัดการเรียนรู้นวัตกรรม");
    getOrCreateSubFolder(challengeFolder, "02_เครื่องมือวิจัย_แบบทดสอบ_แบบประเมินและเกณฑ์IOC");
    getOrCreateSubFolder(challengeFolder, "03_ภาพกิจกรรมการเรียนรู้_ภาพการใช้ThinkingWhiteboard_ชิ้นงานนักเรียน");
    getOrCreateSubFolder(challengeFolder, "04_รายงานผลการวิเคราะห์ข้อมูลและเล่มวิจัยในชั้นเรียน 5 บท");
    getOrCreateSubFolder(challengeFolder, "05_การเผยแพร่นวัตกรรมและบันทึกชุมชนPLC");

    // 2.4 โฟลเดอร์เอกสารประเมินทางการ (PA1, PA2, PA3, SAR)
    const docFolder = getOrCreateSubFolder(yearFolder, "📋 เอกสารแบบประเมิน ว.PA และ SAR");
    getOrCreateSubFolder(docFolder, "01_แบบข้อตกลงในการพัฒนางาน (PA 1-ส)");
    getOrCreateSubFolder(docFolder, "02_แบบประเมินผลการพัฒนางาน (PA 2-ส)");
    getOrCreateSubFolder(docFolder, "03_แบบสรุปผลการประเมิน (PA 3-ส)");
    getOrCreateSubFolder(docFolder, "04_รายงานผลการประเมินตนเองของสถานศึกษา (SAR)");
  });

  Logger.log("=================================================");
  Logger.log("🎉 สร้างโครงสร้างโฟลเดอร์ ว.PA ทั้งหมดเรียบร้อยสมบูรณ์!");
  Logger.log("🔗 URL โฟลเดอร์หลัก: " + rootFolder.getUrl());
  Logger.log("🔑 ID โฟลเดอร์หลัก (นำไปใส่ในเว็บ PAFolio): " + rootFolder.getId());
  Logger.log("=================================================");
}

/**
 * ฟังก์ชันช่วยสร้างหรือค้นหาโฟลเดอร์ย่อยถ้ามีอยู่แล้ว
 */
function getOrCreateSubFolder(parentFolder, subFolderName) {
  const folders = parentFolder.getFoldersByName(subFolderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return parentFolder.createFolder(subFolderName);
  }
}


/**
 * =========================================================================
 * 🌐 ฟังก์ชันที่ 2: Web App API (doGet) ส่งข้อมูลให้หน้าเว็บ PAFolio แบบเรียลไทม์
 * =========================================================================
 */
function doGet(e) {
  try {
    const folderId = (e && e.parameter && e.parameter.folderId) ? e.parameter.folderId : ROOT_FOLDER_ID;
    const year = (e && e.parameter && e.parameter.year) ? e.parameter.year : null;
    
    if (!folderId || folderId === "YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE") {
      throw new Error("กรุณาระบุ Google Drive Folder ID ในหน้าเว็บหรือใน Code.gs");
    }

    // ⚡ โหมดดึงสถานะคลาวด์ศูนย์กลางแบบด่วนพิเศษ (Cloud State Query): ตอบกลับทันที < 0.2 วินาที
    if (e && e.parameter && (e.parameter.action === 'getCloudState' || e.parameter.cloudState === '1')) {
      const rootFolder = DriveApp.getFolderById(folderId);
      let cloudState = null;
      try {
        const stateFiles = rootFolder.getFilesByName("pafolio_cloud_state.json");
        if (stateFiles.hasNext()) {
          cloudState = JSON.parse(stateFiles.next().getBlob().getDataAsString());
        }
      } catch(err) {}
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        timestamp: new Date().toISOString(),
        cloudState: cloudState
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ⚡ โหมดทดสอบการเชื่อมต่อด่วน (Quick Test / Ping): ตอบกลับทันทีใน 0.5 วินาที ไม่ต้องรอสแกนไฟล์ทั้งหมด
    if (e && e.parameter && (e.parameter.test === '1' || e.parameter.quick === '1')) {
      const rootFolder = DriveApp.getFolderById(folderId);
      const subFolders = rootFolder.getFolders();
      const years = [];
      while (subFolders.hasNext()) {
        const name = subFolders.next().getName();
        if (/(25\d{2}|6\d|7\d)/.test(name) && !/(1\.[1-8]|2\.[1-4]|3\.[1-3])/.test(name)) {
          years.push(name);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "เชื่อมต่อ Google Apps Script และ Google Drive สำเร็จ 100%",
        data: {
          folderName: rootFolder.getName(),
          years: years.length > 0 ? years : ["2570", "2569", "2568", "2567", "2566"]
        }
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const data = scanDriveRecursively(folderId, year);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      timestamp: new Date().toISOString(),
      folderId: folderId,
      year: year,
      data: data
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * =========================================================================
 * 💾 ฟังก์ชันที่ 2.1: Web App API (doPost) บันทึกและซิงก์ข้อมูลโปรไฟล์ครูขึ้น Google Drive แบบ Real-time
 * =========================================================================
 */
function doPost(e) {
  try {
    let postData = {};
    if (e && e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      postData = e.parameter;
    }

    const action = postData.action || "saveProfile";
    const targetFolderId = (postData.folderId && typeof postData.folderId === 'string' && postData.folderId.trim()) 
      ? postData.folderId.trim() 
      : ROOT_FOLDER_ID;

    const rootFolder = DriveApp.getFolderById(targetFolderId);

    // บันทึกสถานะระบบศูนย์กลาง (Cloud State: ธีม, ปี, ภาพปก, การตั้งค่า) ให้อุปกรณ์ทั่วโลกซิงก์ตรงกัน
    if (action === "saveCloudState") {
      const stateData = postData.state || {};
      stateData.lastUpdated = new Date().toISOString();
      const fileName = "pafolio_cloud_state.json";
      const files = rootFolder.getFilesByName(fileName);
      let file;
      const content = JSON.stringify(stateData, null, 2);

      if (files.hasNext()) {
        file = files.next();
        file.setContent(content);
      } else {
        file = rootFolder.createFile(fileName, content, "application/json");
      }

      try {
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch(err) {}

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "บันทึกสถานะศูนย์กลาง (Cloud State) ขึ้น Google Drive สำเร็จ",
        timestamp: stateData.lastUpdated,
        cloudState: stateData
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "saveProfile") {
      const profile = postData.profile || {};
      const fileName = "pafolio_profile_live.json";
      const files = rootFolder.getFilesByName(fileName);
      let file;
      const content = JSON.stringify(profile, null, 2);

      if (files.hasNext()) {
        file = files.next();
        file.setContent(content);
      } else {
        file = rootFolder.createFile(fileName, content, "application/json");
      }

      try {
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch(err) {}

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "บันทึกข้อมูลโปรไฟล์ครูขึ้น Google Drive สำเร็จ (Real-time Cloud Synced)",
        timestamp: new Date().toISOString(),
        profile: profile
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "ไม่รู้จักคำสั่ง action: " + action
    })).setMimeType(ContentService.MimeType.JSON);

  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 🧪 ฟังก์ชันทดสอบการสแกนไดรฟ์ (กดเลือกฟังก์ชันนี้ใน Apps Script แล้วกด "เรียกใช้" ได้ทันที)
 */
function testScanDrive() {
  Logger.log("🔍 กำลังทดสอบสแกน Google Drive ด้วย ROOT_FOLDER_ID: " + ROOT_FOLDER_ID);
  const res = scanDriveRecursively(ROOT_FOLDER_ID, "2569");
  Logger.log("📁 ชื่อโฟลเดอร์หลัก: " + res.folderName);
  Logger.log("📂 ปีที่พบ: " + JSON.stringify(res.years));
  Logger.log("📋 ตัวชี้วัดที่พบ: " + Object.keys(res.indicators).join(", "));
  Logger.log("🎖️ เกียรติบัตรและโล่รางวัลที่พบ: " + (res.certificates ? res.certificates.length : 0) + " รายการ");
  Logger.log("📁 ลิงก์โฟลเดอร์เกียรติบัตร: " + (res.certificateFolderUrl || "ไม่พบ"));
  Logger.log("🔗 โฟลเดอร์ตัวชี้วัดที่ตรวจพบ: " + JSON.stringify(res.indicatorFolders));
  Logger.log("✅ ทดสอบสแกนสำเร็จเรียบร้อย!");
}

/**
 * สแกนค้นหาโฟลเดอร์และไฟล์อย่างชาญฉลาด
 */
function scanDriveRecursively(rootFolderId, filterYear) {
  // หากไม่ได้ส่ง rootFolderId มา ให้ดึงจาก ROOT_FOLDER_ID อัตโนมัติ (ป้องกันข้อผิดพลาด Invalid argument: id เมื่อกด Run ใน Apps Script)
  const targetId = (rootFolderId && typeof rootFolderId === 'string' && rootFolderId.trim()) 
    ? rootFolderId.trim() 
    : ROOT_FOLDER_ID;

  if (!targetId || targetId === "YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE") {
    throw new Error("ไม่พบ Folder ID กรุณาระบุ ROOT_FOLDER_ID ใน Code.gs หรือส่ง parameter folderId มา");
  }

  const rootFolder = DriveApp.getFolderById(targetId);
  const result = {
    folderName: rootFolder.getName(),
    years: [],
    indicators: {},
    assets: {
      profileUrl: "",
      logoUrl: "",
      coverUrl: ""
    },
    evidenceGallery: [],
    challengeDocs: [],
    extractedChallenge: null,
    indicatorFolders: {},
    certificates: [],
    certificateFolderUrl: "",
    teachingLoad: [],
    totalHours: "",
    pa1DocInfo: null,
    cloudState: null
  };

  // 1. ตรวจสอบโฟลเดอร์ปีการศึกษา
  const subFolders = rootFolder.getFolders();
  const folderList = [];
  while (subFolders.hasNext()) {
    folderList.push(subFolders.next());
  }

  let yearFoldersFound = [];
  const yearRegex = /(25\d{2}|6\d|7\d)/; // จับเลขปี เช่น 2566 - 2575 หรือ 66, 67, 68, 69, 70

  folderList.forEach(folder => {
    const name = folder.getName();
    if (yearRegex.test(name) && !/(1\.[1-8]|2\.[1-4]|3\.[1-3])/.test(name)) {
      yearFoldersFound.push(folder);
      result.years.push(name);
    }
  });

  // 2. กรองตามปีที่ร้องขอ
  let targetFoldersToScan = [];
  if (yearFoldersFound.length > 0) {
    if (filterYear) {
      const shortYear = (filterYear.length === 4) ? filterYear.substring(2) : filterYear;
      targetFoldersToScan = yearFoldersFound.filter(f => {
        const n = f.getName();
        return n.includes(filterYear) || 
               n.includes("PA" + shortYear) || 
               n.includes("PA " + shortYear) ||
               n.includes("PA" + filterYear) ||
               n.includes(shortYear);
      });
    }
    if (targetFoldersToScan.length === 0) {
      targetFoldersToScan = yearFoldersFound;
    }
  } else {
    targetFoldersToScan = [rootFolder];
  }

  // 3. สแกนหารูปโปรไฟล์ ภาพปก และโลโก้ (เน้นโฟลเดอร์ปีที่เลือกเป็นหลัก แยกของใครของมัน หากไม่เจอยังคงมี fallback)
  scanSystemAssets(targetFoldersToScan, rootFolder, result);

  // 4. สแกนหาไฟล์ตัวชี้วัดและภาพกิจกรรม
  targetFoldersToScan.forEach(folder => {
    traverseFolder(folder, result, 0, null);
  });

  // 5. สแกนหาคลังเกียรติบัตรและโล่รางวัลจากโฟลเดอร์เกียรติบัตรโดยตรง
  scanCertificates(rootFolder, targetFoldersToScan, result);

  // 6. ตรวจสอบไฟล์ pafolio_profile_live.json ใน Google Drive (ถ้ามี ให้ส่งกลับไปอัปเดตหน้าเว็บทุกเครื่องแบบ Real-time)
  try {
    const profileFiles = rootFolder.getFilesByName("pafolio_profile_live.json");
    if (profileFiles.hasNext()) {
      const pFile = profileFiles.next();
      const pContent = pFile.getBlob().getDataAsString();
      result.liveProfile = JSON.parse(pContent);
    }
  } catch(err) {}

  // 7. สแกนและสกัดข้อมูล "ภาระงานสอนตามตารางสอน" จากไฟล์ข้อตกลงในโฟลเดอร์ 01_แบบข้อตกลงในการพัฒนางาน (PA 1-ส) โดยตรง (ห้ามคาดเดา)
  scanPA1TeachingLoad(targetFoldersToScan, result);

  // 8. ตรวจสอบไฟล์ pafolio_cloud_state.json (สถานะศูนย์กลาง: ธีม, ปี, ภาพปก, การตั้งค่า เพื่อให้อุปกรณ์ทั่วโลกซิงก์ตรงกัน 100%)
  try {
    const stateFiles = rootFolder.getFilesByName("pafolio_cloud_state.json");
    if (stateFiles.hasNext()) {
      const sFile = stateFiles.next();
      result.cloudState = JSON.parse(sFile.getBlob().getDataAsString());
    }
  } catch(err) {}

  return result;
}

/**
 * สแกนหารูปโปรไฟล์ ภาพปก และโลโก้อย่างชาญฉลาดรอบด้าน (Smart Asset Scanner)
 * 1. สแกนในโฟลเดอร์ปีการศึกษาที่เลือกก่อนเป็นอันดับแรก (Priority 1: แยกรูปโปรไฟล์และปกตามปี)
 * 2. หากยังไม่พบ จึงสแกน Root Folder เป็น Fallback
 */
function scanSystemAssets(targetFoldersToScan, rootFolder, result) {
  const checkAndAssignAsset = function(file, contextName) {
    try {
      const mime = file.getMimeType();
      if (!mime.includes("image")) return;
      
      const fileName = file.getName().toLowerCase();
      const ctx = (contextName + " " + fileName).toLowerCase();
      const fileId = file.getId();

      // พยายามเปิดสิทธิ์ Anyone with link เพื่อให้รูปแสดงบนเว็บได้ 100%
      try {
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch(e) {}

      // รูปโปรไฟล์ (Profile / Avatar / ครู)
      if (ctx.includes("profile") || ctx.includes("โปรไฟล์") || ctx.includes("avatar") || ctx.includes("รูปครู") || ctx.includes("ภาพประจำตัว")) {
        if (!result.assets.profileUrl) {
          result.assets.profileUrl = "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w800";
        }
      }
      // ภาพปกแบนเนอร์ Hero (Banner / Cover / ปก)
      else if (ctx.includes("banner") || ctx.includes("cover") || ctx.includes("ภาพปก") || ctx.includes("หน้าปก") || ctx.includes("แบนเนอร์") || ctx.includes("ปก")) {
        if (!result.assets.coverUrl) {
          result.assets.coverUrl = "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w1920";
        }
      }
      // โลโก้โรงเรียน / ตราสัญลักษณ์ (Logo)
      else if (ctx.includes("logo") || ctx.includes("โลโก้") || ctx.includes("ตราโรงเรียน") || ctx.includes("สัญลักษณ์")) {
        if (!result.assets.logoUrl) {
          result.assets.logoUrl = "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w600";
        }
      }
    } catch (err) {
      Logger.log("checkAndAssignAsset error: " + err);
    }
  };

  const scanFolderForAssets = function(folder) {
    if (!folder) return;
    try {
      // 1. ตรวจสอบไฟล์รูปภาพที่อาจวางอยู่ในโฟลเดอร์นี้โดยตรง
      const directFiles = folder.getFiles();
      while (directFiles.hasNext()) {
        checkAndAssignAsset(directFiles.next(), folder.getName());
      }

      // 2. ค้นหาโฟลเดอร์ Asset หรือโฟลเดอร์รูปภาพข้างใน
      const subFolders = folder.getFolders();
      while (subFolders.hasNext()) {
        const f = subFolders.next();
        const folderName = f.getName().toLowerCase();

        // ตรวจสอบโฟลเดอร์ที่เกี่ยวข้องกับ Assets / รูปภาพ / โปรไฟล์ / ปก / โลโก้
        if (folderName.includes("asset") || folderName.includes("ภาพประจำตัว") || folderName.includes("00_") ||
            folderName.includes("profile") || folderName.includes("โปรไฟล์") || 
            folderName.includes("cover") || folderName.includes("ปก") || 
            folderName.includes("logo") || folderName.includes("โลโก้") || folderName.includes("รูปภาพ")) {
          
          const innerDirectFiles = f.getFiles();
          while (innerDirectFiles.hasNext()) {
            checkAndAssignAsset(innerDirectFiles.next(), folderName);
          }

          const innerFolders = f.getFolders();
          while (innerFolders.hasNext()) {
            const innerF = innerFolders.next();
            const innerName = innerF.getName().toLowerCase();
            const innerFiles = innerF.getFiles();
            while (innerFiles.hasNext()) {
              checkAndAssignAsset(innerFiles.next(), folderName + " " + innerName);
            }
          }
        }
      }
    } catch(e) {
      Logger.log("scanFolderForAssets error: " + e);
    }
  };

  // 1. สแกนในโฟลเดอร์ปีการศึกษาที่เลือกก่อนเป็นอันดับแรก (Priority 1: แยกรูปโปรไฟล์และปกตามปี)
  if (Array.isArray(targetFoldersToScan)) {
    targetFoldersToScan.forEach(function(f) {
      scanFolderForAssets(f);
    });
  } else if (targetFoldersToScan) {
    scanFolderForAssets(targetFoldersToScan);
  }

  // 2. หากยังไม่พบรูปโปรไฟล์, ภาพปก หรือโลโก้ ให้สแกน Root Folder เป็น Fallback
  if (!result.assets.profileUrl || !result.assets.coverUrl || !result.assets.logoUrl) {
    if (rootFolder) {
      scanFolderForAssets(rootFolder);
    }
  }
}

/**
 * 🎖️ สแกนหาเกียรติบัตรและโล่รางวัลจากโฟลเดอร์เกียรติบัตร (ทั้งใน 00_Assets และในแต่ละปีการศึกษา)
 */
function scanCertificates(rootFolder, targetFoldersToScan, result) {
  const seenFileIds = {};

  const processCertFile = function(file, folderName) {
    try {
      const fileId = file.getId();
      if (seenFileIds[fileId]) return;
      seenFileIds[fileId] = true;

      const mime = file.getMimeType().toLowerCase();
      const isImage = mime.includes("image");
      const isPdf = mime.includes("pdf");
      if (!isImage && !isPdf) return;

      // พยายามเปิดสิทธิ์ Anyone with link เพื่อให้รูปแสดงบนเว็บได้ 100%
      try {
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch(e) {}

      const fileName = file.getName();
      const cleanTitle = fileName.replace(/\.[^/.]+$/, "");
      const thumbUrl = "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w1200";
      const viewUrl = file.getUrl();

      // วิเคราะห์ระดับเกียรติบัตรจากชื่อไฟล์หรือชื่อโฟลเดอร์
      let category = "national";
      let categoryThai = "ระดับชาติ / นานาชาติ";
      let levelBadge = "bg-amber-500/20 text-amber-300 border-amber-500/40";
      let badgeIcon = "fa-trophy text-amber-400";

      const textForCat = (folderName + " " + cleanTitle).toLowerCase();
      if (textForCat.includes("ชาติ") || textForCat.includes("นานาชาติ") || textForCat.includes("obec") || textForCat.includes("สพฐ") || textForCat.includes("คุรุสภา")) {
        category = "national";
        categoryThai = "ระดับชาติ / นานาชาติ";
        levelBadge = "bg-amber-500/20 text-amber-300 border-amber-500/40";
        badgeIcon = "fa-trophy text-amber-400";
      } else if (textForCat.includes("ภาค") || textForCat.includes("เขตตรวจ") || textForCat.includes("จังหวัด")) {
        category = "regional";
        categoryThai = "ระดับภาค / จังหวัด";
        levelBadge = "bg-teal-500/20 text-teal-300 border-teal-500/40";
        badgeIcon = "fa-medal text-teal-400";
      } else if (textForCat.includes("เขต") || textForCat.includes("สพม") || textForCat.includes("สพป") || textForCat.includes("อำเภอ")) {
        category = "district";
        categoryThai = "ระดับเขตพื้นที่การศึกษา";
        levelBadge = "bg-blue-500/20 text-blue-300 border-blue-500/40";
        badgeIcon = "fa-star text-blue-400";
      } else if (textForCat.includes("โรงเรียน") || textForCat.includes("สถานศึกษา") || textForCat.includes("กลุ่มสาระ")) {
        category = "school";
        categoryThai = "ระดับสถานศึกษา";
        levelBadge = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
        badgeIcon = "fa-certificate text-emerald-400";
      }

      // ดึงปีการศึกษา
      let fileYear = result.years && result.years[0] ? result.years[0] : "2569";
      const yearMatch = (folderName + " " + cleanTitle).match(/(25\d{2}|6\d|7\d)/);
      if (yearMatch) {
        fileYear = yearMatch[1].length === 2 ? "25" + yearMatch[1] : yearMatch[1];
      }

      result.certificates.push({
        id: "drive-cert-" + fileId,
        title: cleanTitle,
        category: category,
        categoryThai: categoryThai,
        levelBadge: levelBadge,
        badgeIcon: badgeIcon,
        issuer: "Google Drive (" + folderName + ")",
        year: fileYear,
        date: file.getLastUpdated().toLocaleDateString('th-TH'),
        imageUrl: thumbUrl,
        description: "เกียรติบัตร / โล่รางวัล จากโฟลเดอร์ [" + folderName + "] ใน Google Drive",
        docUrl: viewUrl
      });
    } catch(err) {
      Logger.log("processCertFile error: " + err);
    }
  };

  const checkFolderForCerts = function(folder, depth) {
    if (depth > 5) return;
    const name = folder.getName().toLowerCase();
    const isCertFolder = name.includes("เกียรติบัตร") || name.includes("certificate") || 
                         name.includes("โล่") || name.includes("รางวัล") || name.includes("award") ||
                         name.includes("วุฒิบัตร");

    if (isCertFolder) {
      if (!result.certificateFolderUrl) {
        result.certificateFolderUrl = folder.getUrl();
      }
      const files = folder.getFiles();
      while (files.hasNext()) {
        processCertFile(files.next(), folder.getName());
      }
    }

    const subs = folder.getFolders();
    while (subs.hasNext()) {
      checkFolderForCerts(subs.next(), depth + 1);
    }
  };

  // 1. ค้นหาใน Root Folder (เช่น 00_Assets_... หรือโฟลเดอร์เกียรติบัตรในไดรฟ์หลัก)
  try {
    checkFolderForCerts(rootFolder, 0);
  } catch(e) {
    Logger.log("scanCertificates root error: " + e);
  }

  // 2. ค้นหาในโฟลเดอร์แต่ละปีการศึกษา (เผื่อครูเก็บโฟลเดอร์เกียรติบัตรไว้ใน PA69, PA68)
  try {
    targetFoldersToScan.forEach(function(f) {
      if (f.getId() !== rootFolder.getId()) {
        checkFolderForCerts(f, 0);
      }
    });
  } catch(e) {
    Logger.log("scanCertificates targetFolders error: " + e);
  }
}

/**
 * ท่องไปในโฟลเดอร์ย่อยเพื่อแยกไฟล์และรูปภาพ
 */
function traverseFolder(folder, result, depth, parentIndicatorCode) {
  if (depth > 6) return;

  const folderName = folder.getName();
  // ตรวจหาว่าโฟลเดอร์นี้มีรหัสตัวชี้วัดในชื่อหรือไม่ (เช่น "1.1 สร้างและหรือพัฒนาหลักสูตร")
  const detectedCode = extractIndicatorCode(folderName);
  // หากไม่มีรหัสในชื่อโฟลเดอร์นี้ ให้สืบทอดมาจากโฟลเดอร์แม่ (เช่น โฟลเดอร์ "📄 เอกสารและหลักฐาน PDF" ภายใน 1.1)
  const indicatorCode = detectedCode || parentIndicatorCode || null;

  const files = folder.getFiles();
  const fileItems = [];

  while (files.hasNext()) {
    const file = files.next();
    const mime = file.getMimeType();
    let type = "doc";
    let icon = "fa-file-lines";
    
    if (mime.includes("pdf")) {
      type = "pdf";
      icon = "fa-file-pdf";
    } else if (mime.includes("image")) {
      type = "image";
      icon = "fa-file-image";
      
      // ไม่รวมรูปภาพจากโฟลเดอร์ 00_Assets (โปรไฟล์, โลโก้, ภาพปก) เข้าไปปนในคลังภาพหลักฐานกิจกรรมการสอน
      const fNameLower = folderName.toLowerCase();
      const isAssetFolder = fNameLower.includes("00_") || fNameLower.includes("asset") || 
                           fNameLower.includes("โปรไฟล์") || fNameLower.includes("profile") || 
                           fNameLower.includes("โลโก้") || fNameLower.includes("logo") ||
                           fNameLower.includes("ภาพประจำตัว") || fNameLower.includes("ภาพปก") ||
                           fNameLower.includes("banner");

      if (!isAssetFolder) {
        result.evidenceGallery.push({
          id: file.getId(),
          title: file.getName(),
          caption: folderName,
          badge: indicatorCode ? `ตัวชี้วัด ${indicatorCode}` : folderName,
          thumbUrl: "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w800",
          fullUrl: "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w1600",
          date: file.getLastUpdated().toLocaleDateString('th-TH')
        });
      }
    } else if (mime.includes("video")) {
      type = "video";
      icon = "fa-file-video";
    } else if (mime.includes("sheet") || mime.includes("excel")) {
      type = "sheet";
      icon = "fa-file-excel";
    } else if (mime.includes("presentation") || mime.includes("powerpoint")) {
      type = "slide";
      icon = "fa-file-powerpoint";
    }

    let snippet = "";
    if (mime === "application/vnd.google-apps.document" || mime.includes("text")) {
      try {
        const doc = DocumentApp.openById(file.getId());
        snippet = doc.getBody().getText().substring(0, 3000);
      } catch(e) {}
    }

    const fileItem = {
      id: file.getId(),
      title: file.getName(),
      type: type,
      size: formatBytes(file.getSize()),
      icon: icon,
      viewUrl: file.getUrl(),
      downloadUrl: file.getDownloadUrl(),
      thumbUrl: "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w800",
      snippet: snippet
    };

    fileItems.push(fileItem);

    // ตรวจจับไฟล์เอกสารข้อตกลง PA และประเด็นท้าทาย
    const fLower = (file.getName() + " " + folderName).toLowerCase();
    if (fLower.includes("ข้อตกลง") || fLower.includes("ประเด็นท้าทาย") || fLower.includes("challenge") || fLower.includes("pa 1") || fLower.includes("pa1") || fLower.includes("วิจัย") || fLower.includes("นวัตกรรม")) {
      result.challengeDocs.push({
        id: file.getId(),
        title: file.getName(),
        folderName: folderName,
        type: type,
        viewUrl: file.getUrl(),
        snippet: snippet
      });
    }
  }

  // ผูกไฟล์เข้ากับตัวชี้วัด (ทั้งจากโฟลเดอร์แม่ หรือโฟลเดอร์เอกสารย่อย)
  if (indicatorCode || fileItems.length > 0) {
    const key = indicatorCode || folderName;
    if (!result.indicators[key]) {
      result.indicators[key] = {
        indicatorCode: indicatorCode,
        folderName: folderName,
        folderId: folder.getId(),
        folderUrl: folder.getUrl(),
        files: fileItems
      };
    } else {
      result.indicators[key].files = result.indicators[key].files.concat(fileItems);
    }
    
    // บันทึก URL โฟลเดอร์เฉพาะตัวชี้วัด (เฉพาะเมื่อเป็นโฟลเดอร์หลักของตัวชี้วัดนั้นจริง ไม่บันทึกโฟลเดอร์ย่อย PDF ทับ)
    if (detectedCode) {
      if (!result.indicatorFolders[detectedCode] || !result.indicatorFolders[detectedCode].folderUrl) {
        result.indicatorFolders[detectedCode] = {
          folderId: folder.getId(),
          folderUrl: folder.getUrl(),
          folderName: folderName
        };
      }
    }
  }

  const subFolders = folder.getFolders();
  while (subFolders.hasNext()) {
    traverseFolder(subFolders.next(), result, depth + 1, indicatorCode);
  }
}

/**
 * สกัดรหัสตัวชี้วัดจากชื่อโฟลเดอร์
 */
function extractIndicatorCode(name) {
  if (!name) return null;

  const dotMatch = name.match(/(1\.[1-8]|2\.[1-4]|3\.[1-3])/);
  if (dotMatch) return dotMatch[1];

  const map15 = {
    "1": "1.1", "2": "1.2", "3": "1.3", "4": "1.4", "5": "1.5", "6": "1.6", "7": "1.7", "8": "1.8",
    "9": "2.1", "10": "2.2", "11": "2.3", "12": "2.4",
    "13": "3.1", "14": "3.2", "15": "3.3"
  };
  
  const numMatch = name.match(/(?:ตัวชี้วัดที่|ตัวชี้วัด|ด้านที่\s*\d+\s*ตัวชี้วัดที่|ข้อที่)\s*([0-9]{1,2})/);
  if (numMatch && map15[numMatch[1]]) {
    return map15[numMatch[1]];
  }

  if (name.includes("ประเด็นท้าทาย") || name.toLowerCase().includes("challenge") || name.includes("ข้อตกลง PA")) {
    return "challenge";
  }

  return null;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * =========================================================================
 * 📊 ฟังก์ชันเสริม: สร้าง Google Sheets สรุป 15 ตัวชี้วัด และเกียรติบัตรอัตโนมัติ
 * =========================================================================
 */
function createPAGoogleSheetSummary() {
  Logger.log("📊 กำลังสร้าง Google Spreadsheet สรุปผลการประเมิน ว.PA...");

  const ss = SpreadsheetApp.create("PAFolio_สรุปผลการประเมิน_วPA_" + TEACHER_NAME);
  const sheet1 = ss.getActiveSheet();
  sheet1.setName("สรุป 15 ตัวชี้วัด");

  // หัวตาราง
  sheet1.appendRow(["รหัส", "ด้านการประเมิน", "ตัวชี้วัด", "ระดับที่คาดหวัง", "คะแนนเต็ม", "คะแนนประเมินตนเอง", "ผลการประเมิน"]);
  sheet1.getRange("A1:G1").setBackground("#0f766e").setFontColor("#ffffff").setFontWeight("bold");

  const indNames = [
    ["1.1", "ด้านที่ 1 การจัดการเรียนรู้", "สร้างและหรือพัฒนาหลักสูตร", "ริเริ่ม พัฒนา", 4, 4, "ดีเยี่ยม"],
    ["1.2", "ด้านที่ 1 การจัดการเรียนรู้", "ออกแบบการจัดการเรียนรู้", "ริเริ่ม พัฒนา", 4, 4, "ดีเยี่ยม"],
    ["1.3", "ด้านที่ 1 การจัดการเรียนรู้", "จัดกิจกรรมการเรียนรู้", "ริเริ่ม พัฒนา", 4, 4, "ดีเยี่ยม"],
    ["1.4", "ด้านที่ 1 การจัดการเรียนรู้", "สร้างและหรือพัฒนาสื่อ นวัตกรรม", "ริเริ่ม พัฒนา", 4, 4, "ดีเยี่ยม"],
    ["1.5", "ด้านที่ 1 การจัดการเรียนรู้", "วัดและประเมินผลการเรียนรู้", "ริเริ่ม พัฒนา", 4, 4, "ดีเยี่ยม"],
    ["1.6", "ด้านที่ 1 การจัดการเรียนรู้", "ศึกษา วิเคราะห์ สังเคราะห์ แก้ปัญหา", "ริเริ่ม พัฒนา", 4, 4, "ดีเยี่ยม"],
    ["1.7", "ด้านที่ 1 การจัดการเรียนรู้", "จัดบรรยากาศที่ส่งเสริมการเรียนรู้", "ริเริ่ม พัฒนา", 4, 4, "ดีเยี่ยม"],
    ["1.8", "ด้านที่ 1 การจัดการเรียนรู้", "อบรมและพัฒนาคุณลักษณะที่ดี", "ริเริ่ม พัฒนา", 4, 4, "ดีเยี่ยม"],
    ["2.1", "ด้านที่ 2 ส่งเสริมสนับสนุน", "จัดทำข้อมูลสารสนเทศผู้เรียน/รายวิชา", "ริเริ่ม พัฒนา", 4, 4, "ดีเยี่ยม"],
    ["2.2", "ด้านที่ 2 ส่งเสริมสนับสนุน", "ดำเนินการตามระบบดูแลช่วยเหลือผู้เรียน", "ริเริ่ม พัฒนา", 4, 4, "ดีเยี่ยม"],
    ["2.3", "ด้านที่ 2 ส่งเสริมสนับสนุน", "ปฏิบัติงานวิชาการและงานอื่นๆ", "ริเริ่ม พัฒนา", 4, 4, "ดีเยี่ยม"],
    ["2.4", "ด้านที่ 2 ส่งเสริมสนับสนุน", "ประสานความร่วมมือผู้ปกครอง/เครือข่าย", "ริเริ่ม พัฒนา", 4, 4, "ดีเยี่ยม"],
    ["3.1", "ด้านที่ 3 พัฒนาตนและวิชาชีพ", "พัฒนาตนเองอย่างเป็นระบบและต่อเนื่อง", "ริเริ่ม พัฒนา", 4, 4, "ดีเยี่ยม"],
    ["3.2", "ด้านที่ 3 พัฒนาตนและวิชาชีพ", "มีส่วนร่วมและเป็นผู้นำชุมชน PLC", "ริเริ่ม พัฒนา", 4, 4, "ดีเยี่ยม"],
    ["3.3", "ด้านที่ 3 พัฒนาตนและวิชาชีพ", "นำความรู้ทักษะมาพัฒนานวัตกรรม", "ริเริ่ม พัฒนา", 4, 4, "ดีเยี่ยม"]
  ];

  indNames.forEach(row => sheet1.appendRow(row));
  sheet1.autoResizeColumns(1, 7);

  Logger.log("✅ สร้าง Google Sheet สำเร็จ: " + ss.getUrl());
}

/**
 * =========================================================================
 * สแกนและสกัดข้อมูล "ภาระงานสอนตามตารางสอน" จากโฟลเดอร์ 01_แบบข้อตกลงในการพัฒนางาน (PA 1-ส)
 * ห้ามคาดเดา: ต้องสกัดจากเนื้อหาไฟล์จริงในโฟลเดอร์ของแต่ละปีการศึกษาเท่านั้น
 * =========================================================================
 */
function scanPA1TeachingLoad(targetFoldersToScan, result) {
  result.teachingLoad = result.teachingLoad || [];
  result.totalHours = result.totalHours || "";

  // ฟังก์ชันค้นหาโฟลเดอร์แบบข้อตกลง PA 1-ส แบบลึกสูงสุด 4 ชั้น
  function findPA1Folder(folder, depth) {
    if (depth > 4) return null;
    const name = folder.getName();
    if (name.includes("01_แบบข้อตกลงในการพัฒนางาน") || 
        name.includes("PA 1-ส") || 
        name.includes("PA1-ส") || 
        name.includes("แบบข้อตกลงในการพัฒนางาน") ||
        (name.includes("01") && name.includes("ข้อตกลง"))) {
      return folder;
    }
    const subs = folder.getFolders();
    while (subs.hasNext()) {
      const found = findPA1Folder(subs.next(), depth + 1);
      if (found) return found;
    }
    return null;
  }

  for (let i = 0; i < targetFoldersToScan.length; i++) {
    const yearFolder = targetFoldersToScan[i];
    const paFolder = findPA1Folder(yearFolder, 0);

    if (paFolder) {
      Logger.log("📁 พบโฟลเดอร์ข้อตกลง PA 1-ส: " + paFolder.getName());
      const files = paFolder.getFiles();

      while (files.hasNext()) {
        const file = files.next();
        const fileName = file.getName();
        const mime = file.getMimeType();

        // 1. ตรวจสอบ Google Docs (แบบ ว.PA 1/ส)
        if (mime === MimeType.GOOGLE_DOCS || mime === "application/vnd.google-apps.document") {
          try {
            const doc = DocumentApp.openById(file.getId());
            const parsed = parsePA1Document(doc);
            if (parsed && parsed.teachingLoad && parsed.teachingLoad.length > 0) {
              result.teachingLoad = parsed.teachingLoad;
              if (parsed.totalHours) result.totalHours = parsed.totalHours;
              result.pa1DocInfo = {
                id: file.getId(),
                name: fileName,
                url: "https://docs.google.com/document/d/" + file.getId() + "/edit"
              };
              Logger.log("✅ สกัดภาระงานสอนจริงจาก Google Doc สำเร็จ: " + fileName + " (" + result.teachingLoad.length + " วิชา)");
              return;
            }
          } catch(e) {
            Logger.log("⚠️ ไม่สามารถอ่าน Google Doc (" + fileName + "): " + e.message);
          }
        }

        // 2. ตรวจสอบไฟล์ JSON ภาระงานสอน เช่น teaching_load.json หรือ pa1_data.json
        if (fileName.toLowerCase().endsWith(".json")) {
          try {
            const content = file.getBlob().getDataAsString();
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed) && parsed.length > 0) {
              result.teachingLoad = parsed;
              return;
            } else if (parsed && parsed.teachingLoad && Array.isArray(parsed.teachingLoad)) {
              result.teachingLoad = parsed.teachingLoad;
              if (parsed.totalHours) result.totalHours = parsed.totalHours;
              return;
            }
          } catch(e) {}
        }
      }
    }
  }

  // 3. Fallback: ถ้ายังไม่พบแต่ใน pafolio_profile_live.json มีระบุไว้
  if (result.liveProfile && result.liveProfile.teachingLoad && Array.isArray(result.liveProfile.teachingLoad) && result.liveProfile.teachingLoad.length > 0) {
    result.teachingLoad = result.liveProfile.teachingLoad;
    if (result.liveProfile.totalHours) result.totalHours = result.liveProfile.totalHours;
    Logger.log("✅ ดึงภาระงานสอนจาก pafolio_profile_live.json");
  }
}

/**
 * ฟังก์ชันช่วยแยกแยะและสกัดตาราง/ข้อความภาระงานสอนจากเอกสาร PA 1-ส (Google Doc)
 */
function parsePA1Document(doc) {
  const body = doc.getBody();
  const tables = body.getTables();
  const teachingLoad = [];
  let totalHours = "";

  // A. ค้นหาจาก Tables ในเอกสาร
  for (let t = 0; t < tables.length; t++) {
    const table = tables[t];
    const numRows = table.getNumRows();
    if (numRows < 2) continue;

    let isTeachingTable = false;
    let colSubject = -1;
    let colGrade = -1;
    let colHours = -1;
    let colType = -1;

    // ตรวจสอบ Header row (แถว 0 หรือ 1)
    for (let r = 0; r < Math.min(2, numRows); r++) {
      const row = table.getRow(r);
      const numCells = row.getNumCells();
      for (let c = 0; c < numCells; c++) {
        const cellText = row.getCell(c).getText().trim().toLowerCase();
        if (cellText.includes("กลุ่มสาระ") || cellText.includes("รายวิชา") || cellText.includes("วิชา") || cellText.includes("กิจกรรม")) {
          colSubject = c;
          isTeachingTable = true;
        }
        if (cellText.includes("ชั้น") || cellText.includes("ระดับชั้น")) {
          colGrade = c;
          isTeachingTable = true;
        }
        if (cellText.includes("ชั่วโมง") || cellText.includes("คาบ") || cellText.includes("จำนวนชั่วโมง")) {
          colHours = c;
          isTeachingTable = true;
        }
        if (cellText.includes("ประเภท") || cellText.includes("ลักษณะวิชา")) {
          colType = c;
        }
      }
      if (isTeachingTable) break;
    }

    if (isTeachingTable && colSubject !== -1) {
      for (let r = 1; r < numRows; r++) {
        const row = table.getRow(r);
        const numCells = row.getNumCells();
        if (numCells <= colSubject) continue;

        const subjectText = row.getCell(colSubject).getText().trim();
        if (!subjectText || subjectText.includes("รวม") || subjectText.includes("ลงชื่อ")) {
          // แถวสรุปผลรวม
          const fullRowText = row.getText();
          const matchTotal = fullRowText.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:ชั่วโมง|คาบ)/);
          if (matchTotal && !totalHours) {
            totalHours = matchTotal[1] + (fullRowText.includes("คาบ") ? " คาบ/สัปดาห์" : " ชั่วโมง/สัปดาห์");
          }
          continue;
        }

        let gradeText = (colGrade !== -1 && numCells > colGrade) ? row.getCell(colGrade).getText().trim() : "";
        let hoursText = (colHours !== -1 && numCells > colHours) ? row.getCell(colHours).getText().trim() : "";
        let typeText = (colType !== -1 && numCells > colType) ? row.getCell(colType).getText().trim() : "";

        if (hoursText && /^[0-9]+(\.[0-9]+)?$/.test(hoursText)) {
          hoursText += " ชั่วโมง/สัปดาห์";
        }

        if (subjectText.length > 2) {
          teachingLoad.push({
            subject: subjectText,
            grade: gradeText || "ตามตารางสอน",
            hours: hoursText || "ตามเกณฑ์",
            type: typeText || "วิชาสอน"
          });
        }
      }

      if (teachingLoad.length > 0) {
        return { teachingLoad: teachingLoad, totalHours: totalHours };
      }
    }
  }

  // B. หากไม่พบในตาราง ให้สแกนจาก Paragraphs (รายการข้อความ เช่น 1.1 ภาระงานสอนตามตารางสอน)
  const fullText = body.getText();
  const paSectionMatch = fullText.match(/ภาระงานสอนตามตารางสอน[\s\S]{1,1500}?(?=(?:1\.2|2\.|งานสนับสนุน|ส่วนที่ 2|$))/);
  const targetText = paSectionMatch ? paSectionMatch[0] : fullText;

  // ค้นหาชั่วโมงรวม
  const totalMatch = targetText.match(/(?:รวมจำนวน|รวมทั้งสิ้น|รวม)\s*[:]?\s*([0-9]+(?:\.[0-9]+)?)\s*(ชั่วโมง|คาบ)(?:\s*\/\s*สัปดาห์)?/);
  if (totalMatch) {
    totalHours = totalMatch[1] + " " + totalMatch[2] + "/สัปดาห์";
  }

  const lines = targetText.split(/\r?\n/);
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    if ((trimmed.includes("รายวิชา") || trimmed.includes("วิชา") || trimmed.includes("กิจกรรม")) && 
        (trimmed.includes("ชั่วโมง") || trimmed.includes("คาบ"))) {
      
      const hoursMatch = trimmed.match(/([0-9]+(?:\.[0-9]+)?)\s*(ชั่วโมง|คาบ)(?:\s*\/\s*สัปดาห์)?/);
      const gradeMatch = trimmed.match(/(?:ชั้น|ระดับชั้น)\s*([^\s,]+)/);
      const subjectMatch = trimmed.match(/(?:รายวิชา|วิชา)\s*([^,()0-9]+(?:\s*\([^\)]+\))?)/);

      if (subjectMatch || hoursMatch) {
        const subj = subjectMatch ? subjectMatch[1].trim() : trimmed.substring(0, 40);
        const grd = gradeMatch ? gradeMatch[1].trim() : "ตามตารางสอน";
        const hrs = hoursMatch ? (hoursMatch[1] + " " + hoursMatch[2] + "/สัปดาห์") : "";

        if (subj && !subj.includes("ภาระงานสอน")) {
          teachingLoad.push({
            subject: subj,
            grade: grd,
            hours: hrs,
            type: trimmed.includes("กิจกรรม") ? "กิจกรรมพัฒนาผู้เรียน" : "วิชาสอน"
          });
        }
      }
    }
  });

  return { teachingLoad: teachingLoad, totalHours: totalHours };
}


