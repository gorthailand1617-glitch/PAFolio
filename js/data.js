/**
 * PAFolio - Multi-Teacher & Multi-Year Data Store
 * รองรับการสลับปีการศึกษา, การสลับโปรไฟล์ครู, และการเชื่อมต่อ Google Drive
 */

const ACADEMIC_LEVELS = {
  "ครูผู้ช่วย": "ปรับประยุกต์ (Applying & Adapting)",
  "ครู (คศ.1)": "ปรับประยุกต์ (Applying & Adapting)",
  "ครูชำนาญการ": "ริเริ่ม พัฒนา (Initiating & Developing)",
  "ครูชำนาญการพิเศษ": "ริเริ่ม พัฒนา (Initiating & Developing)",
  "ครูเชี่ยวชาญ": "คิดค้น ปรับเปลี่ยน (Inventing & Transforming)",
  "ครูเชี่ยวชาญพิเศษ": "สร้างการเปลี่ยนแปลง (Creating an Impact)"
};

const PAFOLIO_DATABASE = {
  // ครูท่านที่ 1: ครูกรกฎ รัตนะโชติ (โปรไฟล์เริ่มต้น)
  "teacher-korakot": {
    id: "teacher-korakot",
    name: "นายกรกฎ รัตนะโชติ",
    position: "ครู",
    academicStanding: "ครูชำนาญการพิเศษ",
    school: "โรงเรียนเปรมติณสูลานนท์",
    affiliation: "สำนักงานเขตพื้นที่การศึกษามัธยมศึกษาขอนแก่น",
    learningArea: "กลุ่มสาระการเรียนรู้การงานอาชีพ",
    avatarUrl: "https://drive.google.com/thumbnail?id=1Dyu3SQW--LpIPxO0x5weLb1C8ZhU5Hjv&sz=w600",
    coverUrl: "https://drive.google.com/thumbnail?id=1Dyu3SQW--LpIPxO0x5weLb1C8ZhU5Hjv&sz=w1920",
    driveFolderId: "1Dyu3SQW--LpIPxO0x5weLb1C8ZhU5Hjv",
    appsScriptUrl: "",
    selectedYear: "2568",
    years: {
      "2568": {
        year: "2568",
        status: "รอบการประเมินปัจจุบัน (2567-2568)",
        roles: [
          "หัวหน้าฝ่ายบริหารงานวิชาการ",
          "ผู้ดูแลระบบ Students Support System (SSS)",
          "หัวหน้างานประกันคุณภาพภายในสถานศึกษา",
          "ครูที่ปรึกษาระดับชั้นมัธยมศึกษาปีที่ 6"
        ],
        teachingLoad: [
          { subject: "การงานอาชีพ (ง33101)", grade: "ม.6", hours: "4 คาบ/สัปดาห์", type: "วิชาพื้นฐาน" },
          { subject: "ผลิตภัณฑ์งานช่าง (ง22201)", grade: "ม.2", hours: "4 คาบ/สัปดาห์", type: "วิชาเพิ่มเติม" },
          { subject: "งานออกแบบและเทคโนโลยี (ง23201)", grade: "ม.3", hours: "4 คาบ/สัปดาห์", type: "วิชาเพิ่มเติม" },
          { subject: "กิจกรรมแนะแนว / ลูกเสือ-เนตรนารี", grade: "ม.2-6", hours: "3 คาบ/สัปดาห์", type: "กิจกรรมพัฒนาผู้เรียน" },
          { subject: "กิจกรรมชุมนุมนักประดิษฐ์และนวัตกร", grade: "ม.ปลาย", hours: "2 คาบ/สัปดาห์", type: "กิจกรรมพัฒนาผู้เรียน" },
          { subject: "งานสนับสนุนการจัดการเรียนรู้ / PLC", grade: "ทุกระดับ", hours: "5 คาบ/สัปดาห์", type: "งานสนับสนุน" }
        ],
        totalHours: "22 คาบ/สัปดาห์",
        challengeIssue: {
          topic: "รูปแบบการจัดการเรียนรู้ PREM Model ร่วมกับ Thinking Whiteboard",
          subject: "รายวิชาการงานอาชีพ (ง33101) เรื่อง “ทักษะการจัดการในการทำงาน”",
          targetGroup: "นักเรียนชั้นมัธยมศึกษาปีที่ 6 โรงเรียนเปรมติณสูลานนท์ ภาคเรียนที่ 1-2 ปีการศึกษา 2567-2568",
          coreObjective: "เพื่อส่งเสริมทักษะการเรียนรู้แบบนำตนเอง (Self-Directed Learning) และยกระดับผลสัมฤทธิ์ทางการเรียน",
          steps: [
            { letter: "P", title: "Problem Situation", nameThai: "สถานการณ์ปัญหาในชีวิตจริง", color: "teal", description: "จัดสถานการณ์ปัญหาจริงในชุมชนหรือชีวิตประจำวัน กระตุ้นความอยากรู้ ท้าทายความคิด และนำไปสู่การตั้งคำถามหลัก" },
            { letter: "R", title: "Real Experience", nameThai: "ประสบการณ์ตรงและการสืบค้น", color: "cyan", description: "เปิดโอกาสให้ผู้เรียนสืบค้นข้อมูลจากแหล่งเรียนรู้หลากหลาย รวบรวมข้อมูล ทดลอง และเชื่อมโยงสู่แนวคิดใหม่" },
            { letter: "E", title: "Engaged Project", nameThai: "การลงมือปฏิบัติโครงงานผ่าน Thinking Whiteboard", color: "amber", description: "ผู้เรียนร่วมกันวางแผน จัดการ และสร้างสรรค์ชิ้นงาน โดยใช้กระดาน Thinking Whiteboard แสดงผังความคิดขั้นตอนการทำงาน" },
            { letter: "M", title: "Metacognitive Reflection", nameThai: "การสะท้อนคิดและประเมินตนเอง", color: "emerald", description: "สะท้อนคิดสิ่งที่ได้เรียนรู้ ปัญหา อุปสรรค และแนวทางแก้ไข ประเมินตนเองและเพื่อน รู้เท่าทันกระบวนการคิด" }
          ],
          metrics: {
            quantitative: { target: "ร้อยละ 80", actual: "ร้อยละ 89.4", details: "นักเรียนชั้น ม.6 ไม่น้อยกว่าร้อยละ 80 มีทักษะการนำตนเองและผลสัมฤทธิ์ผ่านเกณฑ์ (ผลลัพธ์จริง: 89.4%)" },
            qualitative: { target: "ระดับดีขึ้นไป", actual: "ระดับดีเยี่ยม (94.2%)", details: "ผู้เรียนมีทักษะการทำงานเป็นทีม การคิดวิเคราะห์ การแก้ปัญหาเฉพาะหน้า และคุณลักษณะอันพึงประสงค์ระดับดีเยี่ยม" }
          },
          sdlComparison: {
            labels: ["การกำหนดเป้าหมาย", "การวางแผนการทำงาน", "การแสวงหาแหล่งเรียนรู้", "การแก้ปัญหาด้วยตนเอง", "การสะท้อนคิดประเมินผล"],
            preTest: [62, 58, 65, 55, 60],
            postTest: [88, 91, 93, 86, 92]
          }
        },
        scores: { domain1: 38, domain2: 19, domain3: 20, challenge: 19, total: 96 }
      },
      "2567": {
        year: "2567",
        status: "รอบการประเมิน 2566-2567 (ผ่านเกณฑ์ดีเยี่ยม 95.5 คะแนน)",
        roles: [
          "หัวหน้าฝ่ายบริหารงานวิชาการ",
          "หัวหน้างานหลักสูตรสถานศึกษา",
          "ครูที่ปรึกษาระดับชั้นมัธยมศึกษาปีที่ 5"
        ],
        teachingLoad: [
          { subject: "การงานอาชีพ (ง32101)", grade: "ม.5", hours: "4 คาบ/สัปดาห์", type: "วิชาพื้นฐาน" },
          { subject: "งานช่างพื้นฐาน (ง21201)", grade: "ม.1", hours: "4 คาบ/สัปดาห์", type: "วิชาเพิ่มเติม" },
          { subject: "กิจกรรมพัฒนาผู้เรียน / ลูกเสือ", grade: "ม.1-5", hours: "3 คาบ/สัปดาห์", type: "กิจกรรมพัฒนาผู้เรียน" },
          { subject: "งานสนับสนุนและ PLC", grade: "ทุกระดับ", hours: "5 คาบ/สัปดาห์", type: "งานสนับสนุน" }
        ],
        totalHours: "20 คาบ/สัปดาห์",
        challengeIssue: {
          topic: "การพัฒนาชุดการสอนแบบโครงงานเป็นฐาน (PBL) ในงานประดิษฐ์ผลิตภัณฑ์ท้องถิ่น",
          subject: "รายวิชาการงานอาชีพ (ง32101) ม.5",
          targetGroup: "นักเรียนชั้นมัธยมศึกษาปีที่ 5 ภาคเรียนที่ 1-2 ปีการศึกษา 2566-2567",
          coreObjective: "เพื่อพัฒนาความคิดสร้างสรรค์และทักษะการแปรรูปผลิตภัณฑ์ท้องถิ่น",
          steps: [
            { letter: "P", title: "Problem Finding", nameThai: "การค้นหาปัญหาชุมชน", color: "teal", description: "สำรวจวัตถุดิบและภูมิปัญญาท้องถิ่นในอำเภอน้ำพอง" },
            { letter: "B", title: "Brainstorming Design", nameThai: "การระดมสมองออกแบบ", color: "cyan", description: "ออกแบบต้นแบบผลิตภัณฑ์ร่วมกันในกลุ่ม" },
            { letter: "L", title: "Learning by Doing", nameThai: "การลงมือผลิตและจำหน่าย", color: "amber", description: "สร้างชิ้นงานจริงและทดลองนำเสนอผ่านออนไลน์" },
            { letter: "S", title: "Sharing & Showcase", nameThai: "การจัดนิทรรศการสะท้อนคิด", color: "emerald", description: "จัดแสดงผลงานและประเมินความพึงพอใจ" }
          ],
          metrics: {
            quantitative: { target: "ร้อยละ 75", actual: "ร้อยละ 86.2", details: "ผู้เรียนร้อยละ 86.2 มีผลงานผ่านเกณฑ์มาตรฐานการประเมินโครงงาน" },
            qualitative: { target: "ระดับดี", actual: "ระดับดีเยี่ยม (92.0%)", details: "ชิ้นงานโครงงานได้รับรางวัลชนะเลิศระดับเขตพื้นที่การศึกษา" }
          },
          sdlComparison: {
            labels: ["การออกแบบ", "การวางแผน", "ทักษะงานช่าง", "การตลาดออนไลน์", "การแก้ปัญหา"],
            preTest: [55, 52, 60, 48, 56],
            postTest: [85, 88, 90, 84, 87]
          }
        },
        scores: { domain1: 37, domain2: 19, domain3: 19.5, challenge: 20, total: 95.5 }
      }
    }
  },

  // ครูท่านที่ 2 (ตัวอย่างสำหรับเพื่อนครูนำไปโคลน/สลับดู)
  "teacher-piyaporn": {
    id: "teacher-piyaporn",
    name: "นางสาวปิยะพร วงศ์สุวรรณ",
    position: "ครู",
    academicStanding: "ครูชำนาญการ",
    school: "โรงเรียนเปรมติณสูลานนท์",
    affiliation: "สำนักงานเขตพื้นที่การศึกษามัธยมศึกษาขอนแก่น",
    learningArea: "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80",
    coverUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&auto=format&fit=crop&q=80",
    driveFolderId: "",
    appsScriptUrl: "",
    selectedYear: "2568",
    years: {
      "2568": {
        year: "2568",
        status: "รอบการประเมิน 2567-2568",
        roles: [
          "หัวหน้างานห้องปฏิบัติการวิทยาศาสตร์",
          "ครูผู้สอนสะเต็มศึกษา (STEM Education)",
          "ครูที่ปรึกษาระดับชั้นมัธยมศึกษาปีที่ 3"
        ],
        teachingLoad: [
          { subject: "วิทยาศาสตร์กายภาพ (ว31101)", grade: "ม.4", hours: "6 คาบ/สัปดาห์", type: "วิชาพื้นฐาน" },
          { subject: "โครงงานสะเต็มศึกษา (ว23201)", grade: "ม.3", hours: "4 คาบ/สัปดาห์", type: "วิชาเพิ่มเติม" },
          { subject: "กิจกรรมพัฒนาผู้เรียน", grade: "ม.3-4", hours: "3 คาบ/สัปดาห์", type: "กิจกรรมพัฒนาผู้เรียน" },
          { subject: "งานสนับสนุนและ PLC", grade: "ทุกระดับ", hours: "5 คาบ/สัปดาห์", type: "งานสนับสนุน" }
        ],
        totalHours: "20 คาบ/สัปดาห์",
        challengeIssue: {
          topic: "การจัดการเรียนรู้แบบ STEM 5E ร่วมกับบอร์ดจำลองสมองกล Micro:bit",
          subject: "รายวิชาวิทยาการคำนวณและสะเต็ม ม.3",
          targetGroup: "นักเรียนชั้นมัธยมศึกษาปีที่ 3 โรงเรียนเปรมติณสูลานนท์",
          coreObjective: "เพื่อพัฒนาทักษะการคิดเชิงคำนวณและการแก้ปัญหาเชิงวิทยาศาสตร์",
          steps: [
            { letter: "E1", title: "Engagement", nameThai: "กระตุ้นความสนใจด้วยสิ่งประดิษฐ์ IoT", color: "teal", description: "สาธิตการทำงานของ Smart Farm และระบบเซ็นเซอร์" },
            { letter: "E2", title: "Exploration", nameThai: "สำรวจและทดลองเขียนโค้ด", color: "cyan", description: "ทดลองเชื่อมต่อบอร์ด Micro:bit กับเซ็นเซอร์วัดความชื้น" },
            { letter: "E3", title: "Explanation", nameThai: "อธิบายหลักการทางฟิสิกส์และตรรกะ", color: "amber", description: "เชื่อมโยงความรู้เรื่องวงจรไฟฟ้าและคำสั่ง Loop/Condition" },
            { letter: "E4", title: "Elaboration", nameThai: "ต่อยอดสร้างสรรค์โครงงานต้นแบบ", color: "emerald", description: "สร้างโครงงานรดน้ำต้นไม้อัตโนมัติในโรงเรียน" }
          ],
          metrics: {
            quantitative: { target: "ร้อยละ 80", actual: "ร้อยละ 88.0", details: "ผู้เรียนร้อยละ 88 มีทักษะการเขียนโค้ดและผ่านเกณฑ์การประเมินสะเต็ม" },
            qualitative: { target: "ระดับดี", actual: "ระดับดีเยี่ยม (93.5%)", details: "นักเรียนสามารถอธิบายตรรกะและประยุกต์ใช้อุปกรณ์ได้อย่างชำนาญ" }
          },
          sdlComparison: {
            labels: ["การคิดเชิงคำนวณ", "การต่อวงจร", "การเขียนโปรแกรม", "การทำงานกลุ่ม", "ความคิดสร้างสรรค์"],
            preTest: [50, 45, 40, 60, 55],
            postTest: [86, 90, 85, 92, 89]
          }
        },
        scores: { domain1: 36, domain2: 19, domain3: 19, challenge: 19, total: 93 }
      }
    }
  }
};
