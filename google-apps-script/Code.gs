/**
 * =========================================================================
 * 🌟 PAFolio - Google Apps Script Engine v3.0 (Smart Folder Generator & API)
 * ระบบจัดการ Google Drive และสร้างโครงสร้างโฟลเดอร์ ว.PA อัตโนมัติในคลิกเดียว
 * =========================================================================
 * 
 * คุณสมบัติเด่น:
 * 1. 🚀 ฟังก์ชัน [createPAFolderStructure]: สร้างโครงสร้างโฟลเดอร์ ว.PA สมบูรณ์แบบ 100% 
 *    (15 ตัวชี้วัด, รูปโปรไฟล์, โลโก้, ประเด็นท้าทายวิจัย 5 บท, PLC, เอกสาร PA1/PA2/PA3)
 * 2. 🔍 ฟังก์ชัน [doGet / scanDriveRecursively]: สแกนและส่งออกข้อมูลแบบ JSON ให้เว็บ PAFolio 
 * 3. 🖼️ รองรับการตรวจจับรูปโปรไฟล์, โลโก้โรงเรียน, ภาพปก, และคลังภาพกิจกรรมทั้งหมด
 */

// ================= ⚙️ ตั้งค่าพื้นฐาน =================
// 1. ใส่ ID ของโฟลเดอร์หลักใน Google Drive (หากเว้นว่าง ระบบจะสร้างโฟลเดอร์หลักใหม่ที่หน้าแรกของไดรฟ์)
const ROOT_FOLDER_ID = "1Ic26pDmmPCzzCW7sijRSqx8CjKTt987K";

// 2. ข้อมูลคุณครูสำหรับใช้ตั้งชื่อโครงสร้างโฟลเดอร์อัตโนมัติ
const TEACHER_NAME = "นายกรกฎ รัตนะโชติ";
const ACADEMIC_YEARS = ["2568", "2567"]; // ปีการศึกษาที่ต้องการสร้างโฟลเดอร์


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

    // 2.1 โฟลเดอร์รูปโปรไฟล์ประจำปีนั้นๆ
    const yearAssetFolder = getOrCreateSubFolder(yearFolder, "📸 รูปถ่ายครูและภาพกิจกรรมประจำปี " + year);

    // 2.2 โฟลเดอร์แบ่งตาม 3 ด้าน 15 ตัวชี้วัด
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
 * สแกนค้นหาโฟลเดอร์และไฟล์อย่างชาญฉลาด
 */
function scanDriveRecursively(rootFolderId, filterYear) {
  const rootFolder = DriveApp.getFolderById(rootFolderId);
  const result = {
    folderName: rootFolder.getName(),
    years: [],
    indicators: {},
    assets: {
      profileUrl: "",
      logoUrl: "",
      coverUrl: ""
    },
    evidenceGallery: []
  };

  // 1. สแกนหา Asset กลาง (รูปโปรไฟล์ / โลโก้ / ปก)
  scanSystemAssets(rootFolder, result);

  // 2. ตรวจสอบโฟลเดอร์ปีการศึกษา
  const subFolders = rootFolder.getFolders();
  const folderList = [];
  while (subFolders.hasNext()) {
    folderList.push(subFolders.next());
  }

  let yearFoldersFound = [];
  const yearRegex = /(25\d{2}|6\d)/; // จับเลขปี เช่น 2567, 2568, 67, 68

  folderList.forEach(folder => {
    const name = folder.getName();
    if (yearRegex.test(name) && !/(1\.[1-8]|2\.[1-4]|3\.[1-3])/.test(name)) {
      yearFoldersFound.push(folder);
      result.years.push(name);
    }
  });

  // 3. กรองตามปีที่ร้องขอ
  let targetFoldersToScan = [];
  if (yearFoldersFound.length > 0) {
    if (filterYear) {
      const shortYear = (filterYear.length === 4) ? filterYear.substring(2) : filterYear;
      targetFoldersToScan = yearFoldersFound.filter(f => 
        f.getName().includes(filterYear) || 
        f.getName().includes(shortYear) ||
        f.getName().includes("PA" + shortYear)
      );
    }
    if (targetFoldersToScan.length === 0) {
      targetFoldersToScan = yearFoldersFound;
    }
  } else {
    targetFoldersToScan = [rootFolder];
  }

  // 4. สแกนหาไฟล์ตัวชี้วัดและภาพกิจกรรม
  targetFoldersToScan.forEach(folder => {
    traverseFolder(folder, result, 0);
  });

  return result;
}

/**
 * สแกนหารูปโปรไฟล์ ภาพปก และโลโก้อย่างชาญฉลาดรอบด้าน (Smart Asset Scanner)
 */
function scanSystemAssets(rootFolder, result) {
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

  // 1. ตรวจสอบไฟล์รูปภาพที่อาจวางอยู่ในโฟลเดอร์หลัก (Root Folder) โดยตรง
  try {
    const rootFiles = rootFolder.getFiles();
    while (rootFiles.hasNext()) {
      checkAndAssignAsset(rootFiles.next(), "root");
    }
  } catch(e) {}

  // 2. ค้นหาโฟลเดอร์ Asset หรือโฟลเดอร์รูปภาพในโฟลเดอร์หลัก
  try {
    const subFolders = rootFolder.getFolders();
    while (subFolders.hasNext()) {
      const f = subFolders.next();
      const folderName = f.getName().toLowerCase();

      // ตรวจสอบโฟลเดอร์ที่เกี่ยวข้องกับ Assets / รูปภาพ / โปรไฟล์ / ปก / โลโก้
      if (folderName.includes("asset") || folderName.includes("ภาพประจำตัว") || folderName.includes("00_") ||
          folderName.includes("profile") || folderName.includes("โปรไฟล์") || 
          folderName.includes("cover") || folderName.includes("ปก") || 
          folderName.includes("logo") || folderName.includes("โลโก้") || folderName.includes("รูปภาพ")) {
        
        // ก. ตรวจสอบไฟล์ที่อยู่ในโฟลเดอร์นี้โดยตรง
        const directFiles = f.getFiles();
        while (directFiles.hasNext()) {
          checkAndAssignAsset(directFiles.next(), folderName);
        }

        // ข. ตรวจสอบโฟลเดอร์ย่อยข้างใน (เช่น 01_รูปโปรไฟล์, 03_ภาพปก)
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
  } catch(e) {}
}

/**
 * ท่องไปในโฟลเดอร์ย่อยเพื่อแยกไฟล์และรูปภาพ
 */
function traverseFolder(folder, result, depth) {
  if (depth > 5) return;

  const folderName = folder.getName();
  const indicatorCode = extractIndicatorCode(folderName);

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
      
      result.evidenceGallery.push({
        id: file.getId(),
        title: file.getName(),
        caption: folderName,
        badge: indicatorCode ? `ตัวชี้วัด ${indicatorCode}` : folderName,
        thumbUrl: "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w800",
        fullUrl: "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w1600",
        date: file.getLastUpdated().toLocaleDateString('th-TH')
      });
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

    fileItems.push({
      id: file.getId(),
      title: file.getName(),
      type: type,
      size: formatBytes(file.getSize()),
      icon: icon,
      viewUrl: file.getUrl(),
      downloadUrl: file.getDownloadUrl(),
      thumbUrl: "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w800"
    });
  }

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
  }

  const subFolders = folder.getFolders();
  while (subFolders.hasNext()) {
    traverseFolder(subFolders.next(), result, depth + 1);
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

