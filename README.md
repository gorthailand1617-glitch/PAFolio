# 🌟 PAFolio — Executive Portfolio & Evaluation System (ว.PA)

ระบบเว็บไซต์ประเมินผลการพัฒนางานตามข้อตกลง (ว.PA) มาตรฐาน ก.ค.ศ. ว9/2564 สำหรับข้าราชการครูและบุคลากรทางการศึกษา

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-4.0.0-emerald.svg)
![Video](https://img.shields.io/badge/Video%20Studio-1080p-rose.svg)

---

## ✨ จุดเด่นและฟีเจอร์สำคัญ (Core Features)

1. **🎨 11 ธีมพรีเมียม (Theme & Style Engine)**:
   - ปรับเปลี่ยนชุดสีหน้าเว็บและสไลด์นำเสนอได้ในคลิกเดียว (Executive Emerald, Royal Navy & Gold, Luxury Imperial Gold, Cyber Glassmorphism, Modern Violet, Crimson Ruby, Sunset Amber, Forest Mint, Rose Quartz, Midnight Obsidian, Minimal Slate)

2. **🎬 AI Smart Video Showcase Generator (สตูดิโอสร้างวิดีโอ 8-10 นาที)**:
   - สร้างคลิปวิดีโอนำเสนอผลงานความยาว 8-10 นาที มาตรฐาน ก.ค.ศ. ว9/2564
   - ภาพเคลื่อนไหวระดับ Cinematic ด้วย **Ken Burns Effect (Pan & Zoom)**
   - กราฟิกสถิติดิ้นได้ (Dynamic Live Data: กราฟแท่ง Pre/Post test $+28.5\%$ และเกจวัดคะแนน $96/100$)
   - เสียงพากย์ภาษาไทยธรรมชาติ 100% (Google Thai Natural Audio HD + ระบบอัดเสียงไมค์ / อัปโหลดเสียงครูเอง)
   - ดนตรีประกอบ Ambient Chords พร้อมระบบ **Audio Ducking** อัตโนมัติ
   - ส่งออกไฟล์วิดีโอ **Full HD 1080p (.mp4 / .webm)** ตรงจากเบราว์เซอร์

3. **📊 ระบบส่งออกเอกสารครบวงจร (Multi-Format Export Engine)**:
   - **PowerPoint (.PPTX / .PPT)**: ส่งออกชุดสไลด์นำเสนอ 26 สไลด์ พร้อมฝังรูปภาพหลักฐานและจัดชุดสีตามธีม
   - **Excel (.xlsx)**: ส่งออกตารางคะแนน 15 ตัวชี้วัด, ประเด็นท้าทาย, และสถิติวิจัย
   - **Word (.doc)**: ส่งออกเล่มรายงานแบบฟอร์มราชการ ว.PA 1 / ว.PA 2 ครบถ้วน

4. **☁️ การเชื่อมต่อ Google Drive อัจฉริยะ (Smart Drive Sync)**:
   - ดึงไฟล์หลักฐาน ภาพกิจกรรม และเอกสาร PDF จาก Google Drive แบบเรียลไทม์
   - รองรับการดาวน์โหลดโครงสร้างโฟลเดอร์ ว.PA สำหรับนำไปอัปโหลดขึ้น Google Drive ได้ทันที
   - อัปโหลดวิดีโอและไฟล์รายงานตรงสู่ Google Drive

5. **🏆 คลังเกียรติบัตรและผลงานดีเด่น (e-Certificate Vault)**:
   - จัดหมวดหมู่ 4 ระดับ (ระดับชาติ, ระดับภูมิภาค, ระดับเขตพื้นที่, ระดับสถานศึกษา)
   - ค้นหาแบบเรียลไทม์ และเปิดดูภาพความละเอียดสูงด้วย Lightbox HD

6. **✏️ ตัวแก้ไขข้อมูลภาพและโปรไฟล์ (No-Code Visual Profile Editor)**:
   - แก้ไขข้อมูลครู วิทยฐานะ สังกัด โรงเรียน รูปโปรไฟล์ และหัวข้อประเด็นท้าทายได้โดยตรงผ่านหน้าเว็บ ไม่ต้องแตะต้องโค้ด

---

## 🚀 วิธีการติดตั้งและเปิดใช้งาน (Getting Started)

### วิธีที่ 1: เปิดผ่านไฟล์ Batch (แนะนำสำหรับ Windows)
ดับเบิลคลิกที่ไฟล์:
```bat
START_PAFOLIO.bat
```
ระบบจะเปิดเว็บเซิร์ฟเวอร์จำลองและเปิดหน้าเว็บที่ `http://localhost:8080` ให้โดยอัตโนมัติ

### วิธีที่ 2: รันผ่านคำสั่ง Terminal
```bash
# รันผ่าน Python
python -m http.server 8080

# หรือรันผ่าน Node.js
npx http-server -p 8080 -c-1
```
แล้วเปิดเบราว์เซอร์ไปที่: `http://localhost:8080`

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```
PAFolio/
├── index.html                   # หน้าเว็บหลักพร้อมระบบ UI ทุกโมดูล
├── START_PAFOLIO.bat            # สคริปต์เปิดเว็บเซิร์ฟเวอร์แบบคลิกเดียว
├── สร้างโฟลเดอร์_PA_Template.bat  # สคริปต์สร้างโครงสร้างโฟลเดอร์ ว.PA
├── css/
│   └── styles.css               # สไตล์ CSS และการตั้งค่า Dynamic Theme Tokens
├── js/
│   ├── data.js                  # ข้อมูลครู, 15 ตัวชี้วัด, ประเด็นท้าทาย และเกณฑ์ประเมิน
│   ├── themes.js                # กลไกจัดการ 11 ธีมพรีเมียม
│   ├── video-engine.js          # กลไกเรนเดอร์วิดีโอ 1080p, Ken Burns, กราฟิก และเสียงพากย์ไทย
│   ├── video-studio-ui.js       # หน้าต่างควบคุม Studio Preview และตัดต่อสคริปต์
│   ├── presentation.js          # โหมดนำเสนอ 26 สไลด์ และส่งออก PowerPoint (.PPTX)
│   ├── certificate-vault.js     # ระบบคลังเกียรติบัตรและค้นหารางวัล
│   ├── export-engine.js         # ระบบส่งออก Word (.doc) และ Excel (.xlsx)
│   ├── drive-sync.js            # ระบบซิงก์ข้อมูล Google Drive แบบเรียลไทม์
│   ├── chart-config.js          # กราฟเรดาร์และชาร์ตสมรรถนะ
│   ├── ai-assistant.js          # ระบบ AI ช่วยเขียนประเด็นท้าทาย
│   └── app.js                   # ตัวควบคุมหลักของระบบ
└── google-apps-script/
    └── Code.gs                  # สคริปต์ Google Apps Script สำหรับเชื่อมโยง Google Drive
```

---

## 📄 ใบอนุญาต (License)
โครงการนี้เผยแพร่ภายใต้ใบอนุญาต **MIT License** — สามารถนำไปพัฒนา ปรับแต่ง และใช้งานเพื่อการศึกษาและพัฒนาวิชาชีพครูได้
