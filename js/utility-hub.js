/**
 * PAFolio - Utility & Innovation Hub Engine v1.0
 * ศูนย์รวมเครื่องมือ นวัตกรรมการจัดการเรียนรู้ และเว็บแอปพลิเคชันส่วนบุคคล
 * รองรับทั้งแบบ Single-file HTML Embed (Isolated Sandbox) และ Cloud Hosted URLs (Vercel / Render / GitHub Pages)
 */

const UtilityHub = {
  storageKey: 'pafolio_custom_utilities',
  activeCategory: 'all',
  searchQuery: '',
  activeViewport: 'desktop',
  currentRunningAppId: null,

  // คลังแอปพลิเคชันเริ่มต้น (พร้อมใช้งานทันที ไม่ต้องต่อเน็ตสำหรับแอปแบบ Code)
  presets: [
    {
      id: 'preset_student_picker',
      title: '🎯 Smart Student Picker & Group Randomizer',
      description: 'วงล้อและระบบสุ่มชื่อนักเรียนอัจฉริยะ พร้อมระบบจัดกลุ่มอัตโนมัติและเอฟเฟกต์เสียงสังเคราะห์ (Web Audio API)',
      category: 'teaching',
      type: 'code',
      badge: 'Single-file HTML',
      icon: 'fa-solid fa-dice',
      color: 'from-amber-500 to-rose-500',
      openTarget: 'modal',
      createdAt: '2569-10-26',
      isPreset: true,
      content: `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smart Student Picker</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap');
    body { font-family: 'Sarabun', sans-serif; }
    .animate-bounce-short { animation: bounceShort 0.5s ease-in-out infinite alternate; }
    @keyframes bounceShort { from { transform: translateY(0); } to { transform: translateY(-8px); } }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-4 sm:p-6 flex flex-col items-center justify-center">
  <div class="max-w-xl w-full bg-slate-800/90 backdrop-blur border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
    
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold mb-3 border border-amber-500/30">
      <i class="fa-solid fa-wand-magic-sparkles"></i> สื่อช่วยสอนดิจิทัล
    </div>
    
    <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">🎯 สุ่มชื่อนักเรียน & แบ่งกลุ่ม</h1>
    <p class="text-xs sm:text-sm text-slate-400 mb-6">สร้างปฏิสัมพันธ์เชิงบวกและกิจกรรมท้าทายในชั้นเรียน</p>

    <!-- Display Box -->
    <div class="relative bg-slate-950 border-2 border-dashed border-amber-500/40 rounded-2xl p-8 mb-6 overflow-hidden min-h-[140px] flex flex-col items-center justify-center">
      <div id="result-badge" class="text-xs uppercase tracking-wider text-amber-400 font-bold mb-1 hidden">ผู้โชคดีคือ</div>
      <div id="picker-display" class="text-3xl sm:text-4xl font-extrabold text-amber-300 transition-all duration-100">
        กดปุ่มสุ่มเพื่อเริ่ม
      </div>
      <div id="winner-tag" class="text-xs text-slate-400 mt-2 hidden">
        🎉 ยินดีด้วยครับ! ตอบคำถามข้อต่อไปได้เลย
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-wrap items-center justify-center gap-3 mb-6">
      <button onclick="pickStudent()" id="btn-pick" class="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-base shadow-lg hover:scale-105 active:scale-95 transition flex items-center gap-2">
        <i class="fa-solid fa-play"></i> สุ่มชื่อเดี่ยว
      </button>
      <button onclick="createGroups()" class="px-5 py-3 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm shadow hover:scale-105 transition flex items-center gap-2">
        <i class="fa-solid fa-users"></i> สุ่มแบ่ง 4 กลุ่ม
      </button>
      <button onclick="toggleSettings()" class="p-3 rounded-2xl bg-slate-750 hover:bg-slate-700 text-slate-300 hover:text-white transition" title="จัดการรายชื่อ">
        <i class="fa-solid fa-gear"></i>
      </button>
    </div>

    <!-- Settings Box (Collapsible) -->
    <div id="settings-box" class="hidden text-left bg-slate-900/80 rounded-2xl p-4 border border-slate-700 mb-4">
      <label class="block text-xs font-semibold text-slate-300 mb-2">รายชื่อนักเรียน (แยกด้วยเครื่องหมายจุลภาค , หรือบรรทัดใหม่):</label>
      <textarea id="students-input" rows="4" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500">เด็กชายธีรเดช, เด็กหญิงกานดา, เด็กชายกิตติ, เด็กหญิงชลธิชา, เด็กชายปัณณวิชญ์, เด็กหญิงนันท์นภัส, เด็กชายพงศธร, เด็กหญิงศศิธร, เด็กชายวรเมธ, เด็กหญิงธัญชนก, เด็กชายภูริณัฐ, เด็กหญิงปิยพร</textarea>
      <div class="flex justify-between items-center mt-2">
        <span class="text-[11px] text-slate-400" id="student-count">รวม 12 คน</span>
        <button onclick="updateList()" class="px-3 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold rounded-lg border border-amber-500/30">
          บันทึกรายชื่อ
        </button>
      </div>
    </div>

    <!-- Group Results Modal/Box -->
    <div id="group-results" class="hidden text-left bg-slate-950/90 rounded-2xl p-5 border border-amber-500/30 mt-4">
      <h3 class="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
        <i class="fa-solid fa-users-rectangle"></i> ผลการสุ่มแบ่งกลุ่ม (4 กลุ่ม)
      </h3>
      <div id="group-grid" class="grid grid-cols-2 gap-3 text-xs"></div>
    </div>

  </div>

  <script>
    // Web Audio Sound Synthesizer (No external sound files required)
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playBeep(freq = 440, duration = 0.05, type = 'sine') {
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      } catch (e) {}
    }

    function playFanfare() {
      try {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          setTimeout(() => playBeep(freq, 0.25, 'triangle'), idx * 100);
        });
      } catch (e) {}
    }

    let students = [];
    function getList() {
      const val = document.getElementById('students-input').value;
      return val.split(/[,\\n]/).map(s => s.trim()).filter(s => s.length > 0);
    }
    students = getList();

    function updateList() {
      students = getList();
      document.getElementById('student-count').textContent = 'รวม ' + students.length + ' คน';
      document.getElementById('settings-box').classList.add('hidden');
      alert('บันทึกรายชื่อเรียบร้อย (' + students.length + ' คน)');
    }

    function toggleSettings() {
      const box = document.getElementById('settings-box');
      box.classList.toggle('hidden');
    }

    let isPicking = false;
    function pickStudent() {
      if (isPicking) return;
      students = getList();
      if (!students.length) {
        alert('กรุณากรอกรายชื่อนักเรียนก่อนครับ');
        return;
      }
      isPicking = true;
      document.getElementById('group-results').classList.add('hidden');
      document.getElementById('result-badge').classList.add('hidden');
      document.getElementById('winner-tag').classList.add('hidden');
      
      const display = document.getElementById('picker-display');
      display.classList.remove('text-amber-300', 'animate-bounce-short');
      display.classList.add('text-slate-400');

      let counter = 0;
      const speed = 60;
      const totalRounds = 25;
      
      const interval = setInterval(() => {
        const randomIdx = Math.floor(Math.random() * students.length);
        display.textContent = students[randomIdx];
        playBeep(350 + (counter * 15), 0.04);
        counter++;
        if (counter >= totalRounds) {
          clearInterval(interval);
          const winnerIdx = Math.floor(Math.random() * students.length);
          display.textContent = students[winnerIdx];
          display.classList.remove('text-slate-400');
          display.classList.add('text-amber-300', 'animate-bounce-short');
          document.getElementById('result-badge').classList.remove('hidden');
          document.getElementById('winner-tag').classList.remove('hidden');
          playFanfare();
          isPicking = false;
        }
      }, speed);
    }

    function createGroups() {
      students = getList();
      if (students.length < 4) {
        alert('ต้องมีนักเรียนอย่างน้อย 4 คนขึ้นไปครับ');
        return;
      }
      const shuffled = [...students].sort(() => Math.random() - 0.5);
      const groupCount = 4;
      const groups = Array.from({ length: groupCount }, () => []);
      shuffled.forEach((name, i) => {
        groups[i % groupCount].push(name);
      });

      const grid = document.getElementById('group-grid');
      grid.innerHTML = '';
      const colors = ['border-blue-500/40 bg-blue-950/40 text-blue-300', 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300', 'border-purple-500/40 bg-purple-950/40 text-purple-300', 'border-amber-500/40 bg-amber-950/40 text-amber-300'];
      
      groups.forEach((grp, idx) => {
        const box = document.createElement('div');
        box.className = 'p-3 rounded-xl border ' + colors[idx] + ' flex flex-col gap-1';
        box.innerHTML = '<div class="font-bold text-xs">กลุ่มที่ ' + (idx + 1) + ' (' + grp.length + ' คน)</div>' +
          '<div class="text-[11px] text-slate-300">' + grp.join(', ') + '</div>';
        grid.appendChild(box);
      });

      document.getElementById('group-results').classList.remove('hidden');
      playFanfare();
    }
  </script>
</body>
</html>`
    },
    {
      id: 'preset_classroom_timer',
      title: '⏱️ Classroom Focus & Activity Timer',
      description: 'นาฬิกาจับเวลากิจกรรมการเรียนรู้ พร้อมวงแหวน Progress Bar อัจฉริยะ ปุ่มลัดตั้งเวลา 1-15 นาที และเสียงกระดิ่งหมดเวลา',
      category: 'teaching',
      type: 'code',
      badge: 'Single-file HTML',
      icon: 'fa-solid fa-stopwatch-20',
      color: 'from-blue-500 to-teal-500',
      openTarget: 'modal',
      createdAt: '2569-10-26',
      isPreset: true,
      content: `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Classroom Focus Timer</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap');
    body { font-family: 'Sarabun', sans-serif; }
    .circle-progress { transform: rotate(-90deg); transform-origin: 50% 50%; transition: stroke-dashoffset 0.3s ease; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-4 sm:p-6 flex flex-col items-center justify-center">
  <div class="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center flex flex-col items-center">
    
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold mb-4 border border-blue-500/30">
      <i class="fa-solid fa-stopwatch"></i> ตัวจับเวลากิจกรรมกลุ่ม
    </div>

    <h1 class="text-2xl font-bold text-white mb-1">นาฬิกาจับเวลาชั้นเรียน</h1>
    <p class="text-xs text-slate-400 mb-6" id="status-label">พร้อมเริ่มกิจกรรม</p>

    <!-- SVG Circular Countdown -->
    <div class="relative w-64 h-64 mb-6 flex items-center justify-center">
      <svg class="w-full h-full" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="44" stroke="#1e293b" stroke-width="6" fill="transparent"/>
        <circle id="progress-ring" cx="50" cy="50" r="44" stroke="#38bdf8" stroke-width="6" stroke-linecap="round" fill="transparent"
                stroke-dasharray="276.46" stroke-dashoffset="0" class="circle-progress"/>
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <div id="time-display" class="text-5xl font-extrabold tracking-wider text-white font-mono">05:00</div>
        <div id="activity-name" class="text-xs text-cyan-400 font-semibold mt-1">ใบงานกลุ่ม 5 นาที</div>
      </div>
    </div>

    <!-- Quick Presets -->
    <div class="grid grid-cols-4 gap-2 w-full mb-6 text-xs">
      <button onclick="setTimer(60, 'กิจกรรมคิดเดี่ยว 1 นาที')" class="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700">1 นาที</button>
      <button onclick="setTimer(180, 'แลกเปลี่ยนคู่ 3 นาที')" class="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700">3 นาที</button>
      <button onclick="setTimer(300, 'ระดมสมองกลุ่ม 5 นาที')" class="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700">5 นาที</button>
      <button onclick="setTimer(600, 'ทำใบงานใหญ่ 10 นาที')" class="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700">10 นาที</button>
    </div>

    <!-- Controls -->
    <div class="flex items-center gap-3">
      <button id="btn-toggle" onclick="toggleTimer()" class="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-slate-950 font-bold text-base shadow-lg transition flex items-center gap-2">
        <i class="fa-solid fa-play" id="btn-icon"></i> <span id="btn-text">เริ่มจับเวลา</span>
      </button>
      <button onclick="resetTimer()" class="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition" title="รีเซ็ต">
        <i class="fa-solid fa-rotate-right"></i>
      </button>
    </div>

  </div>

  <script>
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playChime() {
      try {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          setTimeout(() => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.6);
          }, idx * 160);
        });
      } catch (e) {}
    }

    let totalSeconds = 300;
    let remainingSeconds = 300;
    let timerInterval = null;
    let isRunning = false;
    const circumference = 2 * Math.PI * 44;

    function updateDisplay() {
      const min = Math.floor(remainingSeconds / 60);
      const sec = remainingSeconds % 60;
      document.getElementById('time-display').textContent = 
        String(min).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
      
      const fraction = remainingSeconds / totalSeconds;
      const offset = circumference * (1 - fraction);
      document.getElementById('progress-ring').style.strokeDashoffset = offset;
    }

    function setTimer(sec, label) {
      if (isRunning) toggleTimer();
      totalSeconds = sec;
      remainingSeconds = sec;
      document.getElementById('activity-name').textContent = label;
      document.getElementById('status-label').textContent = 'พร้อมเริ่ม ' + label;
      document.getElementById('progress-ring').setAttribute('stroke', '#38bdf8');
      updateDisplay();
    }

    function toggleTimer() {
      if (isRunning) {
        clearInterval(timerInterval);
        isRunning = false;
        document.getElementById('btn-icon').className = 'fa-solid fa-play';
        document.getElementById('btn-text').textContent = 'จับเวลาต่อ';
        document.getElementById('status-label').textContent = 'พักเวลาชั่วคราว';
      } else {
        if (remainingSeconds <= 0) remainingSeconds = totalSeconds;
        isRunning = true;
        document.getElementById('btn-icon').className = 'fa-solid fa-pause';
        document.getElementById('btn-text').textContent = 'หยุดชั่วคราว';
        document.getElementById('status-label').textContent = 'กำลังจับเวลา...';
        
        timerInterval = setInterval(() => {
          remainingSeconds--;
          updateDisplay();
          if (remainingSeconds <= 10) {
            document.getElementById('progress-ring').setAttribute('stroke', '#f43f5e');
          }
          if (remainingSeconds <= 0) {
            clearInterval(timerInterval);
            isRunning = false;
            document.getElementById('btn-icon').className = 'fa-solid fa-rotate-right';
            document.getElementById('btn-text').textContent = 'เริ่มใหม่';
            document.getElementById('status-label').textContent = '🔔 หมดเวลาแล้วครับ!';
            playChime();
          }
        }, 1000);
      }
    }

    function resetTimer() {
      if (isRunning) clearInterval(timerInterval);
      isRunning = false;
      remainingSeconds = totalSeconds;
      document.getElementById('btn-icon').className = 'fa-solid fa-play';
      document.getElementById('btn-text').textContent = 'เริ่มจับเวลา';
      document.getElementById('status-label').textContent = 'รีเซ็ตเรียบร้อย';
      document.getElementById('progress-ring').setAttribute('stroke', '#38bdf8');
      updateDisplay();
    }

    updateDisplay();
  </script>
</body>
</html>`
    },
    {
      id: 'preset_grade_calculator',
      title: '📊 Grade & Evaluation Score Calculator',
      description: 'โปรแกรมคำนวณตัดเกรด 8 ระดับ (0 - 4.0) อัตโนมัติ พร้อมสถิติค่าเฉลี่ย ส่วนเบี่ยงเบนมาตรฐาน (S.D.) และกราฟแท่งสรุปผล',
      category: 'eval',
      type: 'code',
      badge: 'Single-file HTML',
      icon: 'fa-solid fa-chart-simple',
      color: 'from-emerald-500 to-teal-600',
      openTarget: 'modal',
      createdAt: '2569-10-26',
      isPreset: true,
      content: `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Grade & Stats Calculator</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap');
    body { font-family: 'Sarabun', sans-serif; }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-4 sm:p-6 flex flex-col items-center">
  <div class="max-w-2xl w-full bg-slate-800/90 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl">
    
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3 border border-emerald-500/30">
      <i class="fa-solid fa-calculator"></i> ระบบวัดและประเมินผล
    </div>

    <h1 class="text-2xl font-bold text-white mb-1">📊 เครื่องคำนวณตัดเกรด & สถิติคะแนน</h1>
    <p class="text-xs text-slate-400 mb-6">วางคะแนนนักเรียนเพื่อตัดเกรด 8 ระดับและคำนวณ X̄, S.D. อัตโนมัติ</p>

    <!-- Score Input -->
    <div class="mb-5">
      <label class="block text-xs font-semibold text-slate-300 mb-2">ใส่คะแนนดิบนักเรียน (แยกด้วยเครื่องหมายจุลภาค , หรือเว้นวรรค หรือบรรทัดใหม่):</label>
      <textarea id="scores-input" rows="3" class="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="ตัวอย่าง: 85, 78, 92, 65, 54, 88, 70, 95, 48, 82, 75, 60">85, 78, 92, 65, 54, 88, 70, 95, 48, 82, 75, 60, 68, 89, 73</textarea>
    </div>

    <div class="flex gap-3 mb-6">
      <button onclick="calculate()" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-xs shadow-lg transition flex items-center gap-2">
        <i class="fa-solid fa-wand-magic-sparkles"></i> คำนวณผลลัพธ์
      </button>
      <button onclick="loadSample()" class="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition">
        ใส่ตัวอย่าง 30 คน
      </button>
    </div>

    <!-- Summary Stats Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-center">
      <div class="p-3 bg-slate-950 rounded-2xl border border-slate-700">
        <div class="text-[10px] text-slate-400">จำนวนนักเรียน</div>
        <div id="stat-count" class="text-xl font-bold text-white mt-0.5">0 คน</div>
      </div>
      <div class="p-3 bg-slate-950 rounded-2xl border border-slate-700">
        <div class="text-[10px] text-slate-400">คะแนนเฉลี่ย (X̄)</div>
        <div id="stat-mean" class="text-xl font-bold text-emerald-400 mt-0.5">0.00</div>
      </div>
      <div class="p-3 bg-slate-950 rounded-2xl border border-slate-700">
        <div class="text-[10px] text-slate-400">ส่วนเบี่ยงเบน (S.D.)</div>
        <div id="stat-sd" class="text-xl font-bold text-cyan-400 mt-0.5">0.00</div>
      </div>
      <div class="p-3 bg-slate-950 rounded-2xl border border-slate-700">
        <div class="text-[10px] text-slate-400">สูงสุด / ต่ำสุด</div>
        <div id="stat-range" class="text-xl font-bold text-amber-400 mt-0.5">0 / 0</div>
      </div>
    </div>

    <!-- Grade Distribution Breakdown -->
    <div class="bg-slate-950 rounded-2xl p-5 border border-slate-700">
      <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center justify-between">
        <span>การกระจายตัวของเกรด (8 ระดับ)</span>
        <span class="text-[11px] text-emerald-400" id="stat-pass-rate">ผ่านเกณฑ์ 100%</span>
      </h3>
      <div id="grade-bars" class="space-y-2 text-xs"></div>
    </div>

  </div>

  <script>
    function calculate() {
      const raw = document.getElementById('scores-input').value;
      const scores = raw.split(/[,\\s\\n]/).map(s => parseFloat(s)).filter(s => !isNaN(s) && s >= 0 && s <= 100);
      
      if (!scores.length) {
        alert('กรุณากรอกคะแนน 0-100 ให้ถูกต้องครับ');
        return;
      }

      const n = scores.length;
      const sum = scores.reduce((a, b) => a + b, 0);
      const mean = sum / n;
      const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n > 1 ? n - 1 : 1);
      const sd = Math.sqrt(variance);
      const max = Math.max(...scores);
      const min = Math.min(...scores);

      document.getElementById('stat-count').textContent = n + ' คน';
      document.getElementById('stat-mean').textContent = mean.toFixed(2);
      document.getElementById('stat-sd').textContent = sd.toFixed(2);
      document.getElementById('stat-range').textContent = max + ' / ' + min;

      // Grade Cuts (Standard 8 levels)
      const grades = {
        '4.0 (80-100)': 0,
        '3.5 (75-79)': 0,
        '3.0 (70-74)': 0,
        '2.5 (65-69)': 0,
        '2.0 (60-64)': 0,
        '1.5 (55-59)': 0,
        '1.0 (50-54)': 0,
        '0.0 (0-49)': 0,
      };

      scores.forEach(s => {
        if (s >= 80) grades['4.0 (80-100)']++;
        else if (s >= 75) grades['3.5 (75-79)']++;
        else if (s >= 70) grades['3.0 (70-74)']++;
        else if (s >= 65) grades['2.5 (65-69)']++;
        else if (s >= 60) grades['2.0 (60-64)']++;
        else if (s >= 55) grades['1.5 (55-59)']++;
        else if (s >= 50) grades['1.0 (50-54)']++;
        else grades['0.0 (0-49)']++;
      });

      const passCount = n - grades['0.0 (0-49)'];
      const passRate = ((passCount / n) * 100).toFixed(1);
      document.getElementById('stat-pass-rate').textContent = 'ผ่านเกณฑ์ ' + passRate + '% (' + passCount + '/' + n + ' คน)';

      const container = document.getElementById('grade-bars');
      container.innerHTML = '';
      const colors = ['bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500', 'bg-amber-500', 'bg-orange-500', 'bg-rose-500'];
      
      Object.keys(grades).forEach((gradeName, idx) => {
        const count = grades[gradeName];
        const pct = n > 0 ? ((count / n) * 100).toFixed(1) : 0;
        const row = document.createElement('div');
        row.className = 'flex items-center gap-2';
        row.innerHTML = 
          '<div class="w-24 text-[11px] font-semibold text-slate-300 truncate">' + gradeName.split(' ')[0] + '</div>' +
          '<div class="flex-1 bg-slate-800 rounded-full h-3.5 overflow-hidden p-0.5">' +
            '<div class="' + colors[idx] + ' h-full rounded-full transition-all duration-500" style="width: ' + pct + '%"></div>' +
          '</div>' +
          '<div class="w-16 text-right text-[11px] font-mono text-slate-400">' + count + ' คน (' + Math.round(pct) + '%)</div>';
        container.appendChild(row);
      });
    }

    function loadSample() {
      const sample = [88, 75, 92, 64, 58, 81, 70, 95, 49, 83, 76, 61, 69, 89, 74, 85, 78, 90, 67, 55, 82, 71, 96, 45, 84, 77, 63, 70, 91, 75];
      document.getElementById('scores-input').value = sample.join(', ');
      calculate();
    }

    calculate();
  </script>
</body>
</html>`
    },
    {
      id: 'preset_curriculum_hub',
      title: '🌐 Interactive Science & Math Simulations',
      description: 'ระบบจำลองสื่อการสอนฟิสิกส์ เคมี ชีวะ และคณิตศาสตร์แบบอินเทอร์แอคทีฟ (PhET Simulations)',
      category: 'teaching',
      type: 'url',
      url: 'https://phet.colorado.edu/th/simulations/browse',
      badge: 'External Web App',
      icon: 'fa-solid fa-atom',
      color: 'from-violet-500 to-indigo-600',
      openTarget: 'modal',
      createdAt: '2569-10-26',
      isPreset: true
    }
  ],

  init() {
    this.renderGrid();
    this.updateStats();
  },

  getAllApps() {
    let customApps = [];
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        customApps = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse custom utilities from localStorage', e);
    }
    // รวม Presets เข้ากับ Custom Apps
    return [...this.presets, ...customApps];
  },

  getCustomAppsOnly() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  },

  saveCustomApps(apps) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(apps));
      this.renderGrid();
      this.updateStats();
    } catch (e) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล (อาจเกิดจากขนาดโค้ดเกินขีดจำกัดของเบราว์เซอร์)');
    }
  },

  updateStats() {
    const apps = this.getAllApps();
    const totalEl = document.getElementById('util-stat-total');
    const codeEl = document.getElementById('util-stat-code');
    const urlEl = document.getElementById('util-stat-url');
    
    if (totalEl) totalEl.textContent = apps.length;
    if (codeEl) codeEl.textContent = apps.filter(a => a.type === 'code').length;
    if (urlEl) urlEl.textContent = apps.filter(a => a.type === 'url').length;
  },

  setCategory(category) {
    this.activeCategory = category;
    
    // Update category pill styles
    document.querySelectorAll('.util-cat-btn').forEach(btn => {
      const cat = btn.getAttribute('data-cat');
      if (cat === category) {
        btn.className = 'util-cat-btn px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5';
      } else {
        btn.className = 'util-cat-btn px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition flex items-center gap-1.5';
      }
    });

    this.renderGrid();
  },

  setSearch(q) {
    this.searchQuery = (q || '').trim().toLowerCase();
    this.renderGrid();
  },

  renderGrid() {
    const container = document.getElementById('utility-hub-grid');
    if (!container) return;

    let apps = this.getAllApps();

    // กรองตามหมวดหมู่
    if (this.activeCategory !== 'all') {
      apps = apps.filter(a => a.category === this.activeCategory);
    }

    // กรองตามคำค้นหา
    if (this.searchQuery) {
      apps = apps.filter(a => 
        (a.title && a.title.toLowerCase().includes(this.searchQuery)) ||
        (a.description && a.description.toLowerCase().includes(this.searchQuery)) ||
        (a.badge && a.badge.toLowerCase().includes(this.searchQuery))
      );
    }

    if (apps.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center bg-slate-900/50 rounded-3xl border border-slate-800">
          <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 text-2xl">
            <i class="fa-solid fa-cube"></i>
          </div>
          <h3 class="text-base font-bold text-slate-300">ไม่พบเว็บแอปหรือยูทิลิตี้</h3>
          <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            ${this.searchQuery ? 'ลองค้นหาด้วยคำสำคัญอื่น หรือเปลี่ยนตัวกรองหมวดหมู่' : 'คุณสามารถกดปุ่ม "+ เพิ่มเว็บแอปใหม่" ด้านบนเพื่อเริ่มฝังโค้ด HTML หรือใส่ลิงก์เว็บแอปได้ทันที'}
          </p>
          <button onclick="UtilityHub.openEditor()" class="mt-4 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition inline-flex items-center gap-1.5">
            <i class="fa-solid fa-plus"></i> เพิ่มเว็บแอปแรกของคุณ
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = apps.map(app => {
      const isCode = app.type === 'code';
      const typeBadge = isCode
        ? `<span class="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-semibold flex items-center gap-1"><i class="fa-solid fa-code"></i> HTML Embed</span>`
        : `<span class="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-semibold flex items-center gap-1"><i class="fa-solid fa-globe"></i> Cloud App</span>`;

      const categoryLabels = {
        teaching: 'นวัตกรรมการสอน',
        eval: 'การวัดประเมินผล',
        general: 'เครื่องมือทั่วไป',
        game: 'กิจกรรม & เกม'
      };
      const catLabel = categoryLabels[app.category] || 'ทั่วไป';

      const accentGradient = app.color || (isCode ? 'from-amber-500 to-rose-500' : 'from-violet-500 to-indigo-600');

      return `
        <div class="group relative bg-slate-900/90 hover:bg-slate-850 rounded-3xl p-5 border border-slate-800 hover:border-amber-500/40 shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
          
          <!-- Card Top Accent & Badges -->
          <div>
            <div class="flex items-start justify-between gap-3 mb-4">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br ${accentGradient} text-white flex items-center justify-center text-xl shadow-lg flex-shrink-0 group-hover:scale-105 transition">
                <i class="${app.icon || 'fa-solid fa-cubes'}"></i>
              </div>
              <div class="flex flex-wrap gap-1.5 justify-end">
                ${typeBadge}
                <span class="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-medium">
                  ${catLabel}
                </span>
              </div>
            </div>

            <!-- Title & Description -->
            <h3 class="font-heading font-bold text-base text-white group-hover:text-amber-300 transition line-clamp-1 mb-1.5">
              ${this.escapeHtml(app.title)}
            </h3>
            <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
              ${this.escapeHtml(app.description || 'ไม่มีคำอธิบาย')}
            </p>
          </div>

          <!-- Bottom Actions -->
          <div class="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
            
            <!-- Launch Button (Primary) -->
            <button onclick="UtilityHub.openRunner('${app.id}')" 
                    class="flex-1 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 hover:border-transparent font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm group/btn">
              <i class="fa-solid fa-play text-[11px] group-hover/btn:scale-110 transition"></i>
              <span>เปิดใช้งาน</span>
            </button>

            <!-- External / Blank Launch -->
            ${!isCode ? `
              <a href="${this.escapeHtml(app.url)}" target="_blank" rel="noopener noreferrer" 
                 class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition" 
                 title="เปิดในแท็บใหม่โดยตรง">
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
              </a>
            ` : ''}

            <!-- Edit/Delete Action for Custom Apps -->
            ${!app.isPreset ? `
              <button onclick="UtilityHub.openEditor('${app.id}')" 
                      class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700 text-xs transition" 
                      title="แก้ไขข้อมูล/โค้ด">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button onclick="UtilityHub.deleteApp('${app.id}')" 
                      class="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-xs transition" 
                      title="ลบแอปนี้">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            ` : `
              <span class="text-[10px] text-slate-500 px-1 font-mono" title="แอปมาตรฐานประจำระบบ ว.PA">
                <i class="fa-solid fa-shield-halved text-amber-500/60"></i>
              </span>
            `}

          </div>
        </div>
      `;
    }).join('');
  },

  // เปิดใช้งานแอปพลิเคชัน
  openRunner(id) {
    const apps = this.getAllApps();
    const app = apps.find(a => a.id === id);
    if (!app) return;

    // ถ้าเป็นแอปแบบ URL และตั้งค่าว่าให้เปิดแท็บใหม่เสมอ
    if (app.type === 'url' && app.openTarget === 'blank') {
      window.open(app.url, '_blank');
      return;
    }

    this.currentRunningAppId = id;
    const modal = document.getElementById('utility-runner-modal');
    const iframe = document.getElementById('utility-runner-frame');
    const titleEl = document.getElementById('utility-runner-title');
    const badgeEl = document.getElementById('utility-runner-badge');
    const externalBtn = document.getElementById('utility-runner-external-btn');

    if (!modal || !iframe) return;

    if (titleEl) titleEl.textContent = app.title;
    if (badgeEl) {
      badgeEl.textContent = app.type === 'code' ? 'HTML Embed (Sandbox)' : 'Cloud URL';
      badgeEl.className = app.type === 'code'
        ? 'px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-semibold'
        : 'px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-semibold';
    }

    // จัดการปุ่มเปิดแท็บใหม่
    if (externalBtn) {
      if (app.type === 'url') {
        externalBtn.classList.remove('hidden');
        externalBtn.onclick = () => window.open(app.url, '_blank');
      } else {
        externalBtn.classList.add('hidden');
      }
    }

    // Reset Viewport to Desktop
    this.setViewport('desktop');

    // Run in Iframe with clean Sandbox isolation
    if (app.type === 'code') {
      iframe.removeAttribute('src');
      iframe.srcdoc = app.content || '<div style="padding:20px;color:#fff;">ไม่มีโค้ด HTML</div>';
    } else {
      iframe.removeAttribute('srcdoc');
      iframe.src = app.url;
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  },

  closeRunner() {
    const modal = document.getElementById('utility-runner-modal');
    const iframe = document.getElementById('utility-runner-frame');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    if (iframe) {
      // Clear iframe to terminate any audio or background script
      iframe.srcdoc = '';
      iframe.src = 'about:blank';
    }
    this.currentRunningAppId = null;
    document.body.style.overflow = '';
  },

  reloadRunner() {
    if (this.currentRunningAppId) {
      this.openRunner(this.currentRunningAppId);
    }
  },

  setViewport(size) {
    this.activeViewport = size;
    const frameContainer = document.getElementById('utility-runner-viewport-wrapper');
    if (!frameContainer) return;

    const btnDesktop = document.getElementById('util-vp-desktop');
    const btnTablet = document.getElementById('util-vp-tablet');
    const btnMobile = document.getElementById('util-vp-mobile');

    [btnDesktop, btnTablet, btnMobile].forEach(btn => {
      if (btn) btn.classList.remove('bg-amber-500', 'text-slate-950', 'font-bold');
      if (btn) btn.classList.add('bg-slate-800', 'text-slate-300');
    });

    if (size === 'mobile') {
      frameContainer.style.width = '390px';
      frameContainer.style.maxWidth = '100%';
      if (btnMobile) {
        btnMobile.classList.add('bg-amber-500', 'text-slate-950', 'font-bold');
        btnMobile.classList.remove('bg-slate-800', 'text-slate-300');
      }
    } else if (size === 'tablet') {
      frameContainer.style.width = '768px';
      frameContainer.style.maxWidth = '100%';
      if (btnTablet) {
        btnTablet.classList.add('bg-amber-500', 'text-slate-950', 'font-bold');
        btnTablet.classList.remove('bg-slate-800', 'text-slate-300');
      }
    } else {
      // Desktop
      frameContainer.style.width = '100%';
      frameContainer.style.maxWidth = '100%';
      if (btnDesktop) {
        btnDesktop.classList.add('bg-amber-500', 'text-slate-950', 'font-bold');
        btnDesktop.classList.remove('bg-slate-800', 'text-slate-300');
      }
    }
  },

  // Modal จัดการเพิ่ม/แก้ไขแอป
  openEditor(id = null) {
    const modal = document.getElementById('utility-editor-modal');
    if (!modal) return;

    const titleInput = document.getElementById('util-edit-title');
    const descInput = document.getElementById('util-edit-desc');
    const catSelect = document.getElementById('util-edit-category');
    const iconInput = document.getElementById('util-edit-icon');
    const colorSelect = document.getElementById('util-edit-color');
    const targetSelect = document.getElementById('util-edit-target');
    const codeTextarea = document.getElementById('util-edit-code');
    const urlInput = document.getElementById('util-edit-url');
    const idInput = document.getElementById('util-edit-id');
    const headerTitle = document.getElementById('util-editor-header-title');

    if (id) {
      const apps = this.getAllApps();
      const app = apps.find(a => a.id === id);
      if (!app) return;

      if (idInput) idInput.value = app.id;
      if (titleInput) titleInput.value = app.title || '';
      if (descInput) descInput.value = app.description || '';
      if (catSelect) catSelect.value = app.category || 'general';
      if (iconInput) iconInput.value = app.icon || 'fa-solid fa-cubes';
      if (colorSelect) colorSelect.value = app.color || 'from-amber-500 to-rose-500';
      if (targetSelect) targetSelect.value = app.openTarget || 'modal';
      if (codeTextarea) codeTextarea.value = app.content || '';
      if (urlInput) urlInput.value = app.url || '';
      if (headerTitle) headerTitle.textContent = '✏️ แก้ไขเว็บแอป / ยูทิลิตี้';

      this.switchEditorType(app.type || 'code');
    } else {
      // New App
      if (idInput) idInput.value = '';
      if (titleInput) titleInput.value = '';
      if (descInput) descInput.value = '';
      if (catSelect) catSelect.value = 'teaching';
      if (iconInput) iconInput.value = 'fa-solid fa-code';
      if (colorSelect) colorSelect.value = 'from-indigo-500 to-purple-600';
      if (targetSelect) targetSelect.value = 'modal';
      if (codeTextarea) codeTextarea.value = '<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <title>My Utility</title>\n  <script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body class="bg-slate-900 text-white p-6 font-sans flex flex-col items-center justify-center min-h-screen">\n  <h1 class="text-2xl font-bold text-amber-400">✨ ยูทิลิตี้ใหม่ของฉัน</h1>\n  <p class="text-slate-400 mt-2 text-sm">เขียนโค้ด HTML/CSS/JS ตามต้องการที่นี่ได้เลย</p>\n</body>\n</html>';
      if (urlInput) urlInput.value = '';
      if (headerTitle) headerTitle.textContent = '➕ เพิ่มเว็บแอปพลิเคชันใหม่';

      this.switchEditorType('code');
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  },

  closeEditor() {
    const modal = document.getElementById('utility-editor-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    document.body.style.overflow = '';
  },

  switchEditorType(type) {
    const tabCode = document.getElementById('util-tab-code');
    const tabUrl = document.getElementById('util-tab-url');
    const sectionCode = document.getElementById('util-section-code');
    const sectionUrl = document.getElementById('util-section-url');
    const typeInput = document.getElementById('util-edit-type');

    if (typeInput) typeInput.value = type;

    if (type === 'code') {
      if (tabCode) {
        tabCode.className = 'px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow transition';
      }
      if (tabUrl) {
        tabUrl.className = 'px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition';
      }
      if (sectionCode) sectionCode.classList.remove('hidden');
      if (sectionUrl) sectionUrl.classList.add('hidden');
    } else {
      if (tabUrl) {
        tabUrl.className = 'px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow transition';
      }
      if (tabCode) {
        tabCode.className = 'px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition';
      }
      if (sectionUrl) sectionUrl.classList.remove('hidden');
      if (sectionCode) sectionCode.classList.add('hidden');
    }
  },

  saveAppFromEditor() {
    const idInput = document.getElementById('util-edit-id');
    const typeInput = document.getElementById('util-edit-type');
    const titleInput = document.getElementById('util-edit-title');
    const descInput = document.getElementById('util-edit-desc');
    const catSelect = document.getElementById('util-edit-category');
    const iconInput = document.getElementById('util-edit-icon');
    const colorSelect = document.getElementById('util-edit-color');
    const targetSelect = document.getElementById('util-edit-target');
    const codeTextarea = document.getElementById('util-edit-code');
    const urlInput = document.getElementById('util-edit-url');

    const title = (titleInput?.value || '').trim();
    if (!title) {
      alert('กรุณากรอกชื่อเว็บแอปพลิเคชัน');
      titleInput?.focus();
      return;
    }

    const type = typeInput?.value || 'code';
    let content = '';
    let url = '';

    if (type === 'code') {
      content = (codeTextarea?.value || '').trim();
      if (!content) {
        alert('กรุณากรอกโค้ด HTML');
        codeTextarea?.focus();
        return;
      }
    } else {
      url = (urlInput?.value || '').trim();
      if (!url) {
        alert('กรุณากรอก URL เว็บแอปพลิเคชัน เช่น https://my-app.vercel.app');
        urlInput?.focus();
        return;
      }
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }
    }

    const customApps = this.getCustomAppsOnly();
    const existingId = idInput?.value;

    const appData = {
      id: existingId || ('util_' + Date.now()),
      title: title,
      description: (descInput?.value || '').trim(),
      category: catSelect?.value || 'general',
      type: type,
      badge: type === 'code' ? 'Single-file HTML' : 'Cloud App',
      icon: (iconInput?.value || '').trim() || (type === 'code' ? 'fa-solid fa-code' : 'fa-solid fa-globe'),
      color: colorSelect?.value || 'from-indigo-500 to-purple-600',
      openTarget: targetSelect?.value || 'modal',
      content: content,
      url: url,
      createdAt: new Date().toISOString().split('T')[0],
      isPreset: false
    };

    if (existingId) {
      const idx = customApps.findIndex(a => a.id === existingId);
      if (idx !== -1) {
        customApps[idx] = appData;
      } else {
        customApps.unshift(appData);
      }
    } else {
      customApps.unshift(appData);
    }

    this.saveCustomApps(customApps);
    this.closeEditor();

    // แสดงแจ้งเตือนสำเร็จ
    this.showToast('✅ บันทึกเว็บแอปพลิเคชันสำเร็จ!');
  },

  deleteApp(id) {
    if (!confirm('คุณต้องการลบเว็บแอปนี้ออกจากระบบใช่หรือไม่?')) return;
    const customApps = this.getCustomAppsOnly().filter(a => a.id !== id);
    this.saveCustomApps(customApps);
    this.showToast('🗑️ ลบเว็บแอปเรียบร้อยแล้ว');
  },

  exportJSON() {
    const customApps = this.getCustomAppsOnly();
    if (customApps.length === 0) {
      alert('ยังไม่มีเว็บแอปที่คุณสร้างเองในระบบ (มีเฉพาะแอปเริ่มต้น Presets)');
      return;
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(customApps, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `pafolio-utilities-backup-${new Date().toISOString().split('T')[0]}.json`);
    dlAnchor.click();
    dlAnchor.remove();
    this.showToast('📥 ส่งออกไฟล์สำรองข้อมูล JSON เรียบร้อย');
  },

  importJSON() {
    const input = document.getElementById('util-import-file-input');
    if (!input) return;
    input.value = '';
    input.click();
  },

  handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (!Array.isArray(imported)) {
          alert('รูปแบบไฟล์ JSON ไม่ถูกต้อง');
          return;
        }

        const existing = this.getCustomAppsOnly();
        // Merge without duplicate IDs
        const existingMap = new Map(existing.map(a => [a.id, a]));
        imported.forEach(item => {
          if (item && item.id && item.title) {
            existingMap.set(item.id, item);
          }
        });

        const merged = Array.from(existingMap.values());
        this.saveCustomApps(merged);
        this.showToast(`🎉 นำเข้าข้อมูลสำเร็จ (${imported.length} รายการ)`);
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์ JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  },

  showToast(message) {
    let toast = document.getElementById('util-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'util-toast';
      toast.className = 'fixed bottom-6 right-6 z-[200] px-4 py-3 rounded-2xl bg-slate-900/95 text-amber-300 border border-amber-500/40 shadow-2xl text-xs font-bold flex items-center gap-2 transform transition-all duration-300 translate-y-20 opacity-0';
      document.body.appendChild(toast);
    }
    toast.innerHTML = message;
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
      toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  UtilityHub.init();
});
