/**
 * PAFolio - Multi-Format Export Engine v5.0
 * จัดการการส่งออกเอกสาร Word (.docx/.doc), Excel/Google Sheets (.xlsx), PowerPoint (.pptx), และ PDF
 */

const ExportEngine = {
  // =========================================================================
  // 1. ส่งออกเป็นไฟล์ Microsoft Excel (.xlsx) สรุป 15 ตัวชี้วัด และ SAR
  // =========================================================================
  exportToExcel() {
    if (typeof XLSX === 'undefined') {
      alert('กำลังโหลดไลบรารี SheetJS กรุณารอ 2 วินาทีแล้วลองใหม่อีกครั้ง');
      return;
    }

    const teacher = (typeof getActiveTeacher === 'function' ? getActiveTeacher() : null) || { name: 'ครูผู้รับการประเมิน', school: 'โรงเรียน' };
    const yearData = (typeof getActiveYearData === 'function' ? getActiveYearData() : null) || {};
    const indicators = (typeof BASE_INDICATOR_TEMPLATES !== 'undefined') ? BASE_INDICATOR_TEMPLATES : [];
    const year = typeof currentAcademicYear !== 'undefined' ? currentAcademicYear : '2568';

    const wb = XLSX.utils.book_new();

    // Sheet 1: ข้อมูลทั่วไปและประวัติ
    const profileData = [
      ['ระบบรายงานผลการประเมินผลการพัฒนางานตามข้อตกลง (ว.PA) — PAFolio'],
      ['รอบการประเมินปีงบประมาณ:', year],
      [''],
      ['ข้อมูลผู้รับการประเมิน'],
      ['ชื่อ - นามสกุล:', teacher.name],
      ['ตำแหน่ง:', teacher.position || 'ครู'],
      ['วิทยฐานะ:', teacher.academicStanding || 'ครูชำนาญการพิเศษ'],
      ['กลุ่มสาระการเรียนรู้:', teacher.learningArea || 'การงานอาชีพ'],
      ['สถานศึกษา:', teacher.school || 'โรงเรียนเปรมติณสูลานนท์'],
      ['สังกัด:', teacher.affiliation || 'องค์การบริหารส่วนจังหวัดขอนแก่น'],
      ['ภาระงานสอน:', yearData.totalHours || '22 คาบ/สัปดาห์'],
      ['สถานะรอบการประเมิน:', yearData.status || 'สมบูรณ์ครบถ้วน 100%']
    ];
    const wsProfile = XLSX.utils.aoa_to_sheet(profileData);
    XLSX.utils.book_append_sheet(wb, wsProfile, 'ข้อมูลทั่วไป');

    // Sheet 2: ผลการประเมิน 15 ตัวชี้วัด
    const indRows = [
      ['รหัส', 'ด้านการประเมิน', 'ชื่อตัวชี้วัด', 'ระดับที่คาดหวัง', 'คะแนนเต็ม', 'คะแนนประเมินตนเอง', 'ผลการประเมิน']
    ];

    indicators.forEach(ind => {
      let domainName = 'ด้านที่ 1 การจัดการเรียนรู้';
      if (ind.code.startsWith('2.')) domainName = 'ด้านที่ 2 การส่งเสริมและสนับสนุน';
      else if (ind.code.startsWith('3.')) domainName = 'ด้านที่ 3 การพัฒนาตนเองและวิชาชีพ';

      indRows.push([
        ind.code,
        domainName,
        ind.title,
        typeof getExpectedLevel === 'function' ? getExpectedLevel(teacher.academicStanding) : 'ริเริ่ม พัฒนา',
        4.0,
        4.0,
        'ผ่านเกณฑ์ระดับดีเยี่ยม (100%)'
      ]);
    });

    const wsInd = XLSX.utils.aoa_to_sheet(indRows);
    XLSX.utils.book_append_sheet(wb, wsInd, 'สรุป 15 ตัวชี้วัด ว.PA');

    // Sheet 3: ประเด็นท้าทาย (วิจัย 5 บท)
    const ch = yearData.challengeIssue || {};
    const challengeData = [
      ['สรุปข้อตกลงประเด็นท้าทายในการพัฒนาผลลัพธ์การเรียนรู้ของผู้เรียน (นวัตกรรมและวิจัย 5 บท)'],
      [''],
      ['หัวข้อประเด็นท้าทาย:', ch.topic || 'รูปแบบการจัดการเรียนรู้ PREM Model ร่วมกับ Thinking Whiteboard'],
      ['กลุ่มเป้าหมาย:', ch.targetGroup || 'นักเรียนชั้นมัธยมศึกษาปีที่ 6'],
      ['รายวิชา:', ch.subject || 'การงานอาชีพ (ง33101)'],
      ['สภาพปัญหา:', 'ผู้เรียนขาดทักษะกระบวนการคิดวิเคราะห์และการสร้างสรรค์ชิ้นงานนวัตกรรม'],
      ['ผลลัพธ์เชิงปริมาณ:', 'ผู้เรียนผ่านเกณฑ์ประเมินทักษะและผลสัมฤทธิ์เกินเป้าหมายร้อยละ 89.4'],
      ['ผลลัพธ์เชิงคุณภาพ:', 'ผู้เรียนมีทักษะการทำงานเป็นทีม ความคิดสร้างสรรค์ และมีเจตคติที่ดีต่อวิชาชีพ']
    ];
    const wsChallenge = XLSX.utils.aoa_to_sheet(challengeData);
    XLSX.utils.book_append_sheet(wb, wsChallenge, 'ข้อตกลงประเด็นท้าทาย');

    // Sheet 4: คลังเกียรติบัตร
    if (typeof CertificateVault !== 'undefined') {
      const certs = CertificateVault.getAllCertificates();
      const certRows = [
        ['ลำดับ', 'ชื่อเกียรติบัตร / รางวัล', 'ระดับรางวัล', 'หน่วยงานที่มอบ', 'ปี พ.ศ.', 'วันที่ได้รับ']
      ];
      certs.forEach((c, idx) => {
        certRows.push([
          idx + 1,
          c.title,
          c.categoryThai,
          c.issuer,
          c.year,
          c.date
        ]);
      });
      const wsCert = XLSX.utils.aoa_to_sheet(certRows);
      XLSX.utils.book_append_sheet(wb, wsCert, 'รายการเกียรติบัตร');
    }

    const safeName = teacher.name.replace(/\s+/g, '_');
    const fileName = `วPA_สรุปผลการประเมิน_${year}_${safeName}.xlsx`;
    XLSX.writeFile(wb, fileName);

    if (typeof DriveSync !== 'undefined' && DriveSync.showToast) {
      DriveSync.showToast(`ส่งออกไฟล์ Excel: ${fileName} เรียบร้อยแล้ว!`, 'success', 4000);
    }
  },

  // =========================================================================
  // 2. ส่งออกเป็นไฟล์ Microsoft Word (.doc/.docx) รูปเล่มรายงาน ว.PA / SAR
  // =========================================================================
  exportToWord() {
    const teacher = (typeof getActiveTeacher === 'function' ? getActiveTeacher() : null) || { name: 'ครูผู้รับการประเมิน', school: 'โรงเรียน' };
    const yearData = (typeof getActiveYearData === 'function' ? getActiveYearData() : null) || {};
    const indicators = (typeof BASE_INDICATOR_TEMPLATES !== 'undefined') ? BASE_INDICATOR_TEMPLATES : [];
    const year = typeof currentAcademicYear !== 'undefined' ? currentAcademicYear : '2568';
    const expectedLevel = typeof getExpectedLevel === 'function' ? getExpectedLevel(teacher.academicStanding) : 'ริเริ่ม พัฒนา';

    const wordContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>รายงานผลการพัฒนางานตามข้อตกลง ว.PA (${teacher.name})</title>
        <style>
          body { font-family: 'TH Sarabun PSK', 'TH Sarabun New', 'Sarabun', Tahoma, sans-serif; font-size: 16pt; line-height: 1.3; }
          h1 { font-size: 20pt; text-align: center; font-weight: bold; margin-bottom: 5px; }
          h2 { font-size: 18pt; text-align: center; font-weight: bold; margin-bottom: 15px; }
          h3 { font-size: 16pt; font-weight: bold; margin-top: 15px; margin-bottom: 5px; color: #0f766e; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 15px; font-size: 14pt; }
          th, td { border: 1px solid #333; padding: 6px 8px; vertical-align: top; }
          th { background-color: #f1f5f9; font-weight: bold; text-align: center; }
          .center { text-align: center; }
          .header-box { border: 2px solid #0f766e; padding: 15px; border-radius: 8px; margin-bottom: 20px; background-color: #f0fdfa; }
        </style>
      </head>
      <body>
        <div class="header-box">
          <h1>แบบรายงานผลการพัฒนางานตามข้อตกลงในการพัฒนางาน (PA)</h1>
          <h2>สำหรับข้าราชการครูและบุคลากรทางการศึกษา ตำแหน่งครู วิทยฐานะ${teacher.academicStanding}</h2>
          <p class="center"><strong>รอบการประเมิน:</strong> ปีงบประมาณ ${year} (ระหว่างวันที่ 1 ตุลาคม ถึง 30 กันยายน)</p>
          <p class="center"><strong>ผู้รับการประเมิน:</strong> ${teacher.name} | <strong>ตำแหน่ง:</strong> ${teacher.position} | <strong>สถานศึกษา:</strong> ${teacher.school}</p>
        </div>

        <h3>ส่วนที่ 1: ผลการปฏิบัติตามมาตรฐานตำแหน่งครู (3 ด้าน 15 ตัวชี้วัด)</h3>
        <p><strong>ระดับการปฏิบัติที่คาดหวังตามวิทยฐานะ:</strong> ${expectedLevel}</p>

        <table>
          <thead>
            <tr>
              <th style="width: 10%;">ตัวชี้วัด</th>
              <th style="width: 45%;">รายละเอียดการปฏิบัติงานตามเกณฑ์</th>
              <th style="width: 30%;">ผลลัพธ์ที่เกิดขึ้นกับผู้เรียน</th>
              <th style="width: 15%;">ผลประเมิน</th>
            </tr>
          </thead>
          <tbody>
            ${indicators.map(ind => `
              <tr>
                <td class="center"><strong>${ind.code}</strong></td>
                <td><strong>${ind.title}</strong><br>${ind.shortDesc || ''}</td>
                <td>ผู้เรียนได้รับการพัฒนาทักษะและสมรรถนะตรงตามหลักสูตร มีผลสัมฤทธิ์ทางการเรียนผ่านเกณฑ์ร้อยละ 85 ขึ้นไป</td>
                <td class="center">ระดับดีเยี่ยม<br>(4.00)</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3>ส่วนที่ 2: ข้อตกลงในการพัฒนางานที่เป็นประเด็นท้าทาย (นวัตกรรมและวิจัย 5 บท)</h3>
        <p><strong>หัวข้อประเด็นท้าทาย:</strong> ${(yearData.challengeIssue && yearData.challengeIssue.topic) || 'รูปแบบการจัดการเรียนรู้ PREM Model ร่วมกับ Thinking Whiteboard'}</p>
        <p><strong>กลุ่มเป้าหมาย:</strong> ${(yearData.challengeIssue && yearData.challengeIssue.targetGroup) || 'นักเรียนระดับชั้นมัธยมศึกษาปีที่ 6'}</p>
        <p><strong>ผลการวิเคราะห์ข้อมูล:</strong> ผลสัมฤทธิ์ทางการเรียนหลังเรียนสูงกว่าก่อนเรียนอย่างมีนัยสำคัญทางสถิติที่ระดับ .05 และทักษะการปฏิบัติงานของผู้เรียนอยู่ในระดับดีเยี่ยม</p>

        <br><br>
        <table style="border: none; margin-top: 30px;">
          <tr style="border: none;">
            <td style="border: none; width: 50%; text-align: center;">
              ลงชื่อ............................................................<br>
              (${teacher.name})<br>
              ตำแหน่ง ${teacher.position} วิทยฐานะ${teacher.academicStanding}<br>
              ผู้รับการประเมิน
            </td>
            <td style="border: none; width: 50%; text-align: center;">
              ลงชื่อ............................................................<br>
              (............................................................)<br>
              ผู้อำนวยการ${teacher.school}<br>
              ประธานกรรมการประเมิน
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + wordContent], { type: 'application/msword' });
    const safeName = teacher.name.replace(/\s+/g, '_');
    const fileName = `วPA_เล่มรายงานข้อตกลง_${year}_${safeName}.doc`;

    if (typeof saveAs === 'function') {
      saveAs(blob, fileName);
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    if (typeof DriveSync !== 'undefined' && DriveSync.showToast) {
      DriveSync.showToast(`ส่งออกไฟล์ Word: ${fileName} เรียบร้อยแล้ว!`, 'success', 4000);
    }
  }
};
