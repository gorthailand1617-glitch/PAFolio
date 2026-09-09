/**
 * PAFolio - Video Studio UI Controller v1.0
 * แผงควบคุมสตูดิโอสร้างวิดีโอนำเสนอผลงาน ว.PA 8-10 นาที
 * - ควบคุมหน้าจอพรีวิวสดแบบเรียลไทม์
 * - แก้ไขสคริปต์พากย์ 10 ฉาก
 * - อัดเสียงไมโครโฟน / อัปโหลดไฟล์เสียงพากย์รายฉาก
 * - เรนเดอร์และดาวน์โหลด Full HD 1080p (.mp4 / .webm) หรือส่งตรงขึ้น Google Drive
 */

const VideoStudioUI = {
  isOpen: false,
  previewCanvas: null,
  previewCtx: null,
  mediaRecorder: null,
  audioChunks: [],
  isRecordingMic: false,

  open() {
    this.isOpen = true;
    const modal = document.getElementById('video-studio-modal');
    if (!modal) return;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';

    VideoEngine.init();
    this.setupPreviewCanvas();
    this.renderSceneList();
    this.loadActiveSceneData();
    this.populateVoiceOptions();

    // วาดเฟรมแรกของฉากแรกทันที
    VideoEngine.seekScene(0);
    this.renderPreviewFrame();
  },

  close() {
    this.isOpen = false;
    VideoEngine.pause();
    const modal = document.getElementById('video-studio-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    document.body.style.overflow = 'auto';
  },

  setupPreviewCanvas() {
    const container = document.getElementById('video-preview-container');
    if (!container) return;

    if (!this.previewCanvas) {
      this.previewCanvas = document.getElementById('video-preview-canvas');
      if (this.previewCanvas) {
        this.previewCtx = this.previewCanvas.getContext('2d');
      }
    }

    // ผูก Callback เพื่อซิงก์ภาพจาก VideoEngine.canvas ไปยัง Preview Canvas บนจอ
    VideoEngine.onPlaybackTick = (sceneIdx, sceneProgress, totalProgress) => {
      this.renderPreviewFrame();
      this.updatePlaybackControls(sceneIdx, sceneProgress, totalProgress);
    };

    VideoEngine.onPlaybackComplete = () => {
      const playBtn = document.getElementById('btn-studio-play');
      if (playBtn) {
        playBtn.innerHTML = `<i class="fa-solid fa-play"></i> <span>เล่นพรีวิว</span>`;
      }
    };
  },

  renderPreviewFrame() {
    if (this.previewCtx && VideoEngine.canvas) {
      this.previewCtx.drawImage(VideoEngine.canvas, 0, 0, this.previewCanvas.width, this.previewCanvas.height);
    }
  },

  // แสดงแท็บ 10 ฉาก
  renderSceneList() {
    const listContainer = document.getElementById('studio-scenes-list');
    if (!listContainer) return;

    listContainer.innerHTML = VideoEngine.scenes.map((s, idx) => {
      const isActive = idx === VideoEngine.currentSceneIdx;
      return `
        <button onclick="VideoStudioUI.selectScene(${idx})" 
                class="w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between gap-2 text-xs ${isActive ? 'bg-teal-500/20 border-teal-500/60 text-white shadow-sm' : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'}">
          <div class="truncate">
            <span class="font-bold text-teal-400 mr-1.5">ฉาก ${s.id}</span>
            <span class="font-medium">${s.title}</span>
          </div>
          <span class="text-[11px] opacity-75 font-mono">${VideoEngine.getSceneDuration(s)}s</span>
        </button>
      `;
    }).join('');
  },

  selectScene(idx) {
    VideoEngine.seekScene(idx);
    this.renderSceneList();
    this.loadActiveSceneData();
    this.renderPreviewFrame();
  },

  // ดึงข้อมูลฉากปัจจุบันมาใส่ในแผงแก้ไขสคริปต์
  loadActiveSceneData() {
    const curScene = VideoEngine.scenes[VideoEngine.currentSceneIdx];
    if (!curScene) return;

    const titleEl = document.getElementById('studio-active-scene-title');
    const scriptEl = document.getElementById('studio-active-scene-script');
    const durationEl = document.getElementById('studio-active-scene-duration');
    const voiceStatusEl = document.getElementById('studio-active-scene-voice-status');

    if (titleEl) titleEl.innerText = `ฉากที่ ${curScene.id}: ${curScene.title}`;
    if (scriptEl) scriptEl.value = curScene.script || '';
    if (durationEl) durationEl.innerText = `${VideoEngine.getSceneDuration(curScene)} วินาที`;

    if (voiceStatusEl) {
      if (curScene.customVoiceAudio) {
        voiceStatusEl.innerHTML = `<span class="text-amber-400"><i class="fa-solid fa-microphone mr-1"></i> ใช้เสียงอัดเฉพาะฉากนี้</span>`;
      } else if (VideoEngine.voiceType === 'google_thai' || !VideoEngine.selectedVoice) {
        voiceStatusEl.innerHTML = `<span class="text-teal-400"><i class="fa-solid fa-volume-high mr-1"></i> เสียงภาษาไทยธรรมชาติ (Google Thai HD)</span>`;
      } else {
        voiceStatusEl.innerHTML = `<span class="text-indigo-300"><i class="fa-solid fa-robot mr-1"></i> เสียงระบบ (${VideoEngine.selectedVoice.name})</span>`;
      }
    }
  },

  // บันทึกสคริปต์ที่แก้ไข
  saveActiveSceneScript() {
    const scriptEl = document.getElementById('studio-active-scene-script');
    const curScene = VideoEngine.scenes[VideoEngine.currentSceneIdx];
    if (curScene && scriptEl) {
      curScene.script = scriptEl.value.trim();
      if (typeof DriveSync !== 'undefined' && DriveSync.showToast) {
        DriveSync.showToast('✅ บันทึกสคริปต์ฉากนี้เรียบร้อยแล้ว!', 'success', 2500);
      }
    }
  },

  // สลับการเล่น / หยุดชั่วคราว
  togglePlay() {
    const playBtn = document.getElementById('btn-studio-play');
    if (VideoEngine.isPlaying) {
      VideoEngine.pause();
      if (playBtn) playBtn.innerHTML = `<i class="fa-solid fa-play"></i> <span>เล่นพรีวิว</span>`;
    } else {
      VideoEngine.play();
      if (playBtn) playBtn.innerHTML = `<i class="fa-solid fa-pause"></i> <span>หยุดชั่วคราว</span>`;
    }
  },

  updatePlaybackControls(sceneIdx, sceneProgress, totalProgress) {
    this.renderSceneList();
    this.loadActiveSceneData();

    // อัปเดต Seekbar
    const seekbar = document.getElementById('studio-seekbar-progress');
    if (seekbar) {
      seekbar.style.width = `${totalProgress * 100}%`;
    }

    const timeLabel = document.getElementById('studio-time-indicator');
    if (timeLabel) {
      const totalSec = VideoEngine.getTotalDuration();
      const curSec = Math.floor(totalProgress * totalSec);
      const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
      timeLabel.innerText = `${formatTime(curSec)} / ${formatTime(totalSec)}`;
    }
  },

  // ตั้งค่าตัวเลือกเสียงพากย์ภาษาไทย (ให้ Google Thai HD เป็นตัวเลือกแรกและค่าเริ่มต้น)
  populateVoiceOptions() {
    const selectEl = document.getElementById('studio-voice-select');
    if (!selectEl) return;

    selectEl.innerHTML = `
      <option value="google_thai">🇹🇭 เสียงภาษาไทยธรรมชาติ (Google Thai HD - แนะนำ)</option>
    `;

    const voices = (typeof window !== 'undefined' && window.speechSynthesis) ? window.speechSynthesis.getVoices() : [];
    const thaiVoices = voices.filter(v => v.lang.includes('th') || v.name.includes('Thai') || v.name.includes('Premwadee') || v.name.includes('Niwat') || v.name.includes('ไทย'));

    thaiVoices.forEach((v, i) => {
      const opt = document.createElement('option');
      opt.value = `system_${i}`;
      opt.innerText = `🎙️ ${v.name} (เสียงระบบเครื่อง)`;
      if (VideoEngine.voiceType === 'system' && VideoEngine.selectedVoice && VideoEngine.selectedVoice.name === v.name) {
        opt.selected = true;
      }
      selectEl.appendChild(opt);
    });

    if (VideoEngine.voiceType === 'google_thai') {
      selectEl.value = 'google_thai';
    }

    selectEl.onchange = (e) => {
      const val = e.target.value;
      if (val === 'google_thai') {
        VideoEngine.voiceType = 'google_thai';
        VideoEngine.selectedVoice = null;
      } else if (val.startsWith('system_')) {
        const idx = parseInt(val.replace('system_', ''));
        if (!isNaN(idx) && thaiVoices[idx]) {
          VideoEngine.voiceType = 'system';
          VideoEngine.selectedVoice = thaiVoices[idx];
        }
      }
      this.loadActiveSceneData();
    };
  },

  // สลับโหมดความยาว: Full (8-10 นาที) หรือ Short (3 นาที)
  setDurationMode(mode) {
    VideoEngine.mode = mode;
    const btnFull = document.getElementById('btn-mode-full');
    const btnShort = document.getElementById('btn-mode-short');

    if (mode === 'full') {
      btnFull?.classList.add('bg-teal-500', 'text-slate-950', 'font-bold');
      btnFull?.classList.remove('bg-slate-800', 'text-slate-300');
      btnShort?.classList.remove('bg-teal-500', 'text-slate-950', 'font-bold');
      btnShort?.classList.add('bg-slate-800', 'text-slate-300');
    } else {
      btnShort?.classList.add('bg-teal-500', 'text-slate-950', 'font-bold');
      btnShort?.classList.remove('bg-slate-800', 'text-slate-300');
      btnFull?.classList.remove('bg-teal-500', 'text-slate-950', 'font-bold');
      btnFull?.classList.add('bg-slate-800', 'text-slate-300');
    }

    this.renderSceneList();
    this.loadActiveSceneData();
    VideoEngine.seekScene(VideoEngine.currentSceneIdx);
  },

  // ระบบอัดเสียงไมโครโฟนสำหรับฉากปัจจุบัน
  async toggleMicRecording() {
    const micBtn = document.getElementById('btn-record-mic');
    if (!micBtn) return;

    if (!this.isRecordingMic) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream);
        this.audioChunks = [];

        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) this.audioChunks.push(e.data);
        };

        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          const curScene = VideoEngine.scenes[VideoEngine.currentSceneIdx];
          curScene.customVoiceAudio = new Audio(audioUrl);
          this.loadActiveSceneData();
          if (typeof DriveSync !== 'undefined' && DriveSync.showToast) {
            DriveSync.showToast('🎙️ บันทึกเสียงพากย์ของครูในฉากนี้สำเร็จ!', 'success', 3000);
          }
        };

        this.mediaRecorder.start();
        this.isRecordingMic = true;
        micBtn.innerHTML = `<i class="fa-solid fa-circle-stop text-rose-500 animate-pulse"></i> <span>หยุดอัดเสียง</span>`;
        micBtn.classList.add('bg-rose-500/20', 'border-rose-500');
      } catch (err) {
        alert('ไม่สามารถเข้าถึงไมโครโฟนได้: ' + err.message);
      }
    } else {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }
      this.isRecordingMic = false;
      micBtn.innerHTML = `<i class="fa-solid fa-microphone text-rose-400"></i> <span>อัดเสียงใหม่</span>`;
      micBtn.classList.remove('bg-rose-500/20', 'border-rose-500');
    }
  },

  // อัปโหลดไฟล์เสียงสำหรับฉากปัจจุบัน
  handleAudioUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const audioUrl = URL.createObjectURL(file);
    const curScene = VideoEngine.scenes[VideoEngine.currentSceneIdx];
    curScene.customVoiceAudio = new Audio(audioUrl);
    this.loadActiveSceneData();
    if (typeof DriveSync !== 'undefined' && DriveSync.showToast) {
      DriveSync.showToast(`📁 นำเข้าไฟล์เสียง ${file.name} เรียบร้อยแล้ว`, 'success', 3000);
    }
  },

  // ล้างไฟล์เสียงที่อัดหรืออัปโหลด กลับไปใช้ TTS ระบบ
  resetSceneVoice() {
    const curScene = VideoEngine.scenes[VideoEngine.currentSceneIdx];
    if (curScene) {
      curScene.customVoiceAudio = null;
      this.loadActiveSceneData();
    }
  },

  // ================= 🎬 RENDER & EXPORT VIDEO 1080P =================
  async startExportVideo() {
    const exportBtn = document.getElementById('btn-studio-export');
    const progressModal = document.getElementById('studio-render-progress-modal');
    const progressBar = document.getElementById('studio-render-progress-bar');
    const progressPercent = document.getElementById('studio-render-progress-percent');
    const progressStatus = document.getElementById('studio-render-progress-status');

    if (progressModal) {
      progressModal.classList.remove('hidden');
      progressModal.classList.add('flex');
    }

    try {
      const videoBlob = await VideoEngine.exportVideo((percent, curScene, totalScenes) => {
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (progressPercent) progressPercent.innerText = `${percent}%`;
        if (progressStatus) progressStatus.innerText = `กำลังเรนเดอร์ภาพเคลื่อนไหวฉากที่ ${curScene} / ${totalScenes}...`;
      });

      if (progressStatus) progressStatus.innerText = '🎉 เรนเดอร์วิดีโอ 1080p สำเร็จ กำลังเริ่มดาวน์โหลด...';

      // ดาวน์โหลดไฟล์วิดีโอลงเครื่อง
      const teacher = (typeof getActiveTeacher === 'function') ? getActiveTeacher() : { name: "ครู" };
      const curYear = (typeof currentAcademicYear !== 'undefined') ? currentAcademicYear : "2568";
      const filename = `วPA_คลิปนำเสนอ_${teacher.name}_ปีงบประมาณ${curYear}.webm`;

      const downloadUrl = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      setTimeout(() => {
        if (progressModal) progressModal.classList.add('hidden');
        if (typeof DriveSync !== 'undefined' && DriveSync.showToast) {
          DriveSync.showToast('📥 ดาวน์โหลดไฟล์วิดีโอนำเสนอ 1080p เรียบร้อยแล้ว!', 'success', 6000);
        }
      }, 1500);

    } catch (err) {
      console.error('Export video error:', err);
      alert('เกิดข้อผิดพลาดในการสร้างวิดีโอ: ' + err.message);
      if (progressModal) progressModal.classList.add('hidden');
    }
  },

  // ส่งไฟล์วิดีโอตรงเข้า Google Drive
  async uploadVideoToDrive() {
    if (typeof DriveSync === 'undefined' || !DriveSync.isConfigured()) {
      alert('กรุณาตั้งค่า Google Apps Script Web App URL ก่อนจึงจะสามารถส่งไฟล์เข้า Google Drive ได้ครับ');
      return;
    }

    if (confirm('ระบบจะทำการเรนเดอร์วิดีโอ Full HD และอัปโหลดตรงเข้าสู่โฟลเดอร์ 05_วิดีโอการสอนและคลิปนำเสนอ บน Google Drive ของคุณครู ดำเนินการต่อหรือไม่?')) {
      DriveSync.showToast('🚀 กำลังเรนเดอร์และเตรียมอัปโหลดวิดีโอเข้า Google Drive...', 'info', 10000);
      try {
        const videoBlob = await VideoEngine.exportVideo();
        const teacher = getActiveTeacher();
        const curYear = (typeof currentAcademicYear !== 'undefined') ? currentAcademicYear : "2568";
        const filename = `วPA_คลิปนำเสนอ_${teacher.name}_ปีงบประมาณ${curYear}.webm`;

        await DriveSync.uploadVideoFile(videoBlob, filename);
      } catch (err) {
        alert('อัปโหลดล้มเหลว: ' + err.message);
      }
    }
  }
};

window.VideoStudioUI = VideoStudioUI;
