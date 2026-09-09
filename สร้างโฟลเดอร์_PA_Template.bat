@echo off
title PAFolio - PA Folder Structure Generator

echo =======================================================================
echo   PAFolio - PA Folder Structure Generator (Google Drive Template)
echo =======================================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$teacher = Read-Host 'ระบุชื่อคุณครู (เช่น นายกรกฎ รัตนะโชติ) [Enter = นายกรกฎ รัตนะโชติ]';" ^
  "if ([string]::IsNullOrWhiteSpace($teacher)) { $teacher = 'นายกรกฎ รัตนะโชติ' };" ^
  "$year = Read-Host 'ระบุปีการศึกษา (พ.ศ. 4 หลัก เช่น 2568) [Enter = 2568]';" ^
  "if ([string]::IsNullOrWhiteSpace($year)) { $year = '2568' };" ^
  "$shortYear = if ($year.Length -eq 4) { $year.Substring(2) } else { $year };" ^
  "$rootName = \"PAFolio - แฟ้มสะสมงาน ว.PA ($teacher)\";" ^
  "$yearName = \"PA$shortYear ผลการประเมิน ว.PA ปีการศึกษา $year\";" ^
  "Write-Host \"`nกำลังสร้างโครงสร้างโฟลเดอร์: $rootName ...\" -ForegroundColor Cyan;" ^
  "New-Item -ItemType Directory -Force -Path \"$rootName/$yearName/🖼️ 00_Assets_ภาพประจำตัวและโลโก้/01_รูปโปรไฟล์ครู (Profile Photos)\" | Out-Null;" ^
  "New-Item -ItemType Directory -Force -Path \"$rootName/$yearName/🖼️ 00_Assets_ภาพประจำตัวและโลโก้/02_โลโก้โรงเรียนและตราสัญลักษณ์ (Logos)\" | Out-Null;" ^
  "New-Item -ItemType Directory -Force -Path \"$rootName/$yearName/🖼️ 00_Assets_ภาพประจำตัวและโลโก้/03_ภาพปกและภาพหัวเรื่อง (Banners & Covers)\" | Out-Null;" ^
  "New-Item -ItemType Directory -Force -Path \"$rootName/$yearName/🖼️ 00_Assets_ภาพประจำตัวและโลโก้/04_เกียรติบัตรและโล่รางวัลรวม (Certificates)\" | Out-Null;" ^
  "New-Item -ItemType Directory -Force -Path \"$rootName/$yearName/📸 รูปถ่ายครูและภาพกิจกรรมประจำปี $year\" | Out-Null;" ^
  "$indicators = @('1.1 สร้างและหรือพัฒนาหลักสูตร', '1.2 ออกแบบการจัดการเรียนรู้', '1.3 จัดกิจกรรมการเรียนรู้ (Active Learning)', '1.4 สร้างและหรือพัฒนาสื่อ นวัตกรรม เทคโนโลยี', '1.5 วัดและประเมินผลการเรียนรู้', '1.6 ศึกษา วิเคราะห์ สังเคราะห์ เพื่อแก้ไขปัญหา', '1.7 จัดบรรยากาศที่ส่งเสริมและพัฒนาผู้เรียน', '1.8 อบรมและพัฒนาคุณลักษณะที่ดีของผู้เรียน');" ^
  "foreach ($ind in $indicators) { $code = $ind.Substring(0, 3); New-Item -ItemType Directory -Force -Path \"$rootName/$yearName/ด้านที่ 1 ด้านการจัดการเรียนรู้ (8 ตัวชี้วัด)/$ind/🖼️ รูปภาพประกอบตัวชี้วัด $code\" | Out-Null; New-Item -ItemType Directory -Force -Path \"$rootName/$yearName/ด้านที่ 1 ด้านการจัดการเรียนรู้ (8 ตัวชี้วัด)/$ind/📄 เอกสารและหลักฐาน PDF\" | Out-Null; };" ^
  "$indicators2 = @('2.1 จัดทำข้อมูลสารสนเทศของผู้เรียนและรายวิชา', '2.2 ดำเนินการตามระบบดูแลช่วยเหลือผู้เรียน (SDQ)', '2.3 ปฏิบัติงานวิชาการ และงานอื่นๆ ของสถานศึกษา', '2.4 ประสานความร่วมมือกับผู้ปกครองและภาคีเครือข่าย');" ^
  "foreach ($ind in $indicators2) { $code = $ind.Substring(0, 3); New-Item -ItemType Directory -Force -Path \"$rootName/$yearName/ด้านที่ 2 ด้านการส่งเสริมและสนับสนุน (4 ตัวชี้วัด)/$ind/🖼️ รูปภาพประกอบตัวชี้วัด $code\" | Out-Null; New-Item -ItemType Directory -Force -Path \"$rootName/$yearName/ด้านที่ 2 ด้านการส่งเสริมและสนับสนุน (4 ตัวชี้วัด)/$ind/📄 เอกสารและหลักฐาน PDF\" | Out-Null; };" ^
  "$indicators3 = @('3.1 พัฒนาตนเองอย่างเป็นระบบและต่อเนื่อง (อบรม/สัมมนา)', '3.2 มีส่วนร่วมและเป็นผู้นำในการแลกเปลี่ยนเรียนรู้ทางวิชาชีพ (PLC)', '3.3 นำความรู้ ทักษะ มาใช้ในการพัฒนาการจัดการเรียนรู้');" ^
  "foreach ($ind in $indicators3) { $code = $ind.Substring(0, 3); New-Item -ItemType Directory -Force -Path \"$rootName/$yearName/ด้านที่ 3 ด้านการพัฒนาตนเองและวิชาชีพ (3 ตัวชี้วัด)/$ind/🖼️ รูปภาพประกอบตัวชี้วัด $code\" | Out-Null; New-Item -ItemType Directory -Force -Path \"$rootName/$yearName/ด้านที่ 3 ด้านการพัฒนาตนเองและวิชาชีพ (3 ตัวชี้วัด)/$ind/📄 เอกสารและหลักฐาน PDF\" | Out-Null; };" ^
  "New-Item -ItemType Directory -Force -Path \"$rootName/$yearName/🎯 ส่วนที่ 2 ข้อตกลงประเด็นท้าทาย (นวัตกรรมและงานวิจัย 5 บท)/01_แผนการสอนและกระบวนการจัดการเรียนรู้นวัตกรรม\" | Out-Null;" ^
  "New-Item -ItemType Directory -Force -Path \"$rootName/$yearName/🎯 ส่วนที่ 2 ข้อตกลงประเด็นท้าทาย (นวัตกรรมและงานวิจัย 5 บท)/02_เครื่องมือวิจัย_แบบทดสอบ_แบบประเมินและเกณฑ์IOC\" | Out-Null;" ^
  "New-Item -ItemType Directory -Force -Path \"$rootName/$yearName/🎯 ส่วนที่ 2 ข้อตกลงประเด็นท้าทาย (นวัตกรรมและงานวิจัย 5 บท)/03_ภาพกิจกรรมการเรียนรู้_ภาพการใช้ThinkingWhiteboard_ชิ้นงานนักเรียน\" | Out-Null;" ^
  "New-Item -ItemType Directory -Force -Path \"$rootName/$yearName/🎯 ส่วนที่ 2 ข้อตกลงประเด็นท้าทาย (นวัตกรรมและงานวิจัย 5 บท)/04_รายงานผลการวิเคราะห์ข้อมูลและเล่มวิจัยในชั้นเรียน 5 บท\" | Out-Null;" ^
  "New-Item -ItemType Directory -Force -Path \"$rootName/$yearName/🎯 ส่วนที่ 2 ข้อตกลงประเด็นท้าทาย (นวัตกรรมและงานวิจัย 5 บท)/05_การเผยแพร่นวัตกรรมและบันทึกชุมชนPLC\" | Out-Null;" ^
  "New-Item -ItemType Directory -Force -Path \"$rootName/$yearName/📋 เอกสารแบบประเมิน ว.PA และ SAR/01_แบบข้อตกลงในการพัฒนางาน (PA 1-ส)\" | Out-Null;" ^
  "New-Item -ItemType Directory -Force -Path \"$rootName/$yearName/📋 เอกสารแบบประเมิน ว.PA และ SAR/02_แบบประเมินผลการพัฒนางาน (PA 2-ส)\" | Out-Null;" ^
  "New-Item -ItemType Directory -Force -Path \"$rootName/$yearName/📋 เอกสารแบบประเมิน ว.PA และ SAR/03_แบบสรุปผลการประเมิน (PA 3-ส)\" | Out-Null;" ^
  "New-Item -ItemType Directory -Force -Path \"$rootName/$yearName/📋 เอกสารแบบประเมิน ว.PA และ SAR/04_รายงานผลการประเมินตนเองของสถานศึกษา (SAR)\" | Out-Null;" ^
  "New-Item -ItemType Directory -Force -Path \"$rootName/$yearName/ด้านที่ 1 ด้านการจัดการเรียนรู้ (8 ตัวชี้วัด)/1.3 จัดกิจกรรมการเรียนรู้ (Active Learning)/🎥 วิดีโอบันทึกการสอน Active Learning (60 นาที)\" | Out-Null;" ^
  "New-Item -ItemType Directory -Force -Path \"$rootName/$yearName/ด้านที่ 1 ด้านการจัดการเรียนรู้ (8 ตัวชี้วัด)/1.4 สร้างและหรือพัฒนาสื่อ นวัตกรรม เทคโนโลยี/🎥 วิดีโอคลิปนวัตกรรมและเทคโนโลยี\" | Out-Null;" ^
  "New-Item -ItemType Directory -Force -Path \"$rootName/$yearName/🎥 05_คลิปวิดีโอการสอนและคลิปผลลัพธ์ (Teaching Videos)/01_คลิปการสอนตามเกณฑ์_ว.PA_60นาที\" | Out-Null;" ^
  "New-Item -ItemType Directory -Force -Path \"$rootName/$yearName/🎥 05_คลิปวิดีโอการสอนและคลิปผลลัพธ์ (Teaching Videos)/02_คลิปแรงบันดาลใจและสะท้อนคิด_10ถึง15นาที\" | Out-Null;" ^
  "Set-Content -Path \"$rootName/README_คำแนะนำ.txt\" -Value 'ลากโฟลเดอร์นี้อัปโหลดขึ้น Google Drive แล้วนำ Folder ID มาใส่ในเว็บ PAFolio (รองรับทั้งไฟล์รูปภาพ เอกสาร PDF และไฟล์วิดีโอ .mp4/.webm)' -Encoding UTF8;" ^
  "Write-Host \"`n[SUCCESS] สร้างโครงสร้างโฟลเดอร์ ว.PA สำเร็จสมบูรณ์ 100%! (รองรับภาพ เอกสาร และวิดีโอ)\" -ForegroundColor Green;" ^
  "Write-Host \"สามารถลากโฟลเดอร์ '$rootName' อัปโหลดขึ้น Google Drive ได้ทันที`n\" -ForegroundColor Yellow;"

echo.
pause
