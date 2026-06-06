/* ============================================================
   PulmoAgent — Main Application Logic
   ============================================================ */

(function () {
  'use strict';

  // ───── State ─────
  let currentMode = 'student'; // 'student' | 'medical'
  let currentTab = 'atlas';
  let selectedLobe = null;
  let selectedPathogenId = null;
  let activeCaseIndex = 0;
  let caseResults = {}; // { caseId: 'correct' | 'incorrect' }
  let audioCtx = null;
  let activeAudioNodes = [];
  let isPlaying = false;

  // ───── DOM Refs ─────
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ───── Init ─────
  document.addEventListener('DOMContentLoaded', () => {
    initModeToggle();
    initNavTabs();
    initLungAtlas();
    initDrugMatcher();
    initCaseSimulator();
    initVideoAcademy();
  });

  // ============================================================
  // MODE TOGGLE
  // ============================================================
  function initModeToggle() {
    const toggle = $('#modeToggle');
    toggle.addEventListener('click', (e) => {
      const label = e.target.closest('.mode-toggle__label');
      if (!label) return;
      const mode = label.dataset.mode;
      if (mode === currentMode) return;
      currentMode = mode;
      toggle.querySelectorAll('.mode-toggle__label').forEach(l => l.classList.remove('active'));
      label.classList.add('active');
      // Re-render current views
      if (selectedLobe) renderAtlasDetail(selectedLobe);
      if (selectedPathogenId) renderMatcherDetail(selectedPathogenId);
      renderActiveCase();
    });
  }

  // ============================================================
  // NAV TABS
  // ============================================================
  function initNavTabs() {
    const tabs = $$('.nav-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const tabId = tab.dataset.tab;
        currentTab = tabId;
        $$('.section-panel').forEach(p => p.classList.remove('active'));
        $(`#panel-${tabId}`).classList.add('active');
        stopAllAudio();
      });
    });
  }

  // ============================================================
  // LUNG ATLAS
  // ============================================================
  const lobePathogenMap = {
    'left-upper': ['m_tuberculosis', 's_pneumoniae'],
    'left-lower': ['s_pneumoniae', 'l_pneumophila', 'p_jirovecii'],
    'right-upper': ['m_tuberculosis', 'k_pneumoniae'],
    'right-middle': ['s_pneumoniae', 'm_pneumoniae'],
    'right-lower': ['s_pneumoniae', 'l_pneumophila', 'k_pneumoniae']
  };

  function initLungAtlas() {
    const lobes = $$('.lung-lobe');
    lobes.forEach(lobe => {
      lobe.addEventListener('click', () => {
        const lobeId = lobe.dataset.lobe;
        lobes.forEach(l => l.classList.remove('selected'));
        lobe.classList.add('selected');
        selectedLobe = lobeId;
        renderAtlasDetail(lobeId);
      });

      lobe.addEventListener('mouseenter', () => {
        if (!lobe.classList.contains('selected')) {
          lobe.style.fill = 'rgba(0,242,254,0.18)';
        }
      });
      lobe.addEventListener('mouseleave', () => {
        if (!lobe.classList.contains('selected')) {
          lobe.style.fill = '';
        }
      });
    });
  }

  function renderAtlasDetail(lobeId) {
    const placeholder = $('#atlasPlaceholder');
    const content = $('#atlasContent');
    placeholder.classList.add('hidden');
    content.classList.remove('hidden');

    const lobeName = $(`.lung-lobe[data-lobe="${lobeId}"]`).dataset.label;
    const pathogenIds = lobePathogenMap[lobeId] || [];
    const pathogens = pathogenIds.map(id => PULMO_DATA.pathogens.find(p => p.id === id)).filter(Boolean);

    let html = `
      <div class="detail-header">
        <div>
          <div class="detail-name">${lobeName}</div>
          <div class="detail-scientific">${pathogenIds.length} associated pathogen(s)</div>
        </div>
      </div>
    `;

    if (pathogens.length === 0) {
      html += `<div class="detail-text" style="color:var(--text-muted);">No specific pathogens mapped to this lobe.</div>`;
    } else {
      pathogens.forEach(p => {
        const badgeClass = getBadgeClass(p.type);
        const desc = currentMode === 'student' ? p.studentSummary : p.medSummary;
        html += `
          <div class="virulence-item" style="border-left: 3px solid ${getTypeColor(p.type)};">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
              <span class="detail-badge ${badgeClass}">${p.type}</span>
              <strong style="color:var(--text-primary); font-size:14px;">${p.name}</strong>
            </div>
            <p style="font-style:italic; color:var(--text-muted); font-size:11px; margin-bottom:6px;">${p.scientificName}</p>
            <p>${desc}</p>
            <div style="margin-top:8px;">
              <span class="detail-section-label" style="font-size:9px; border:none; padding:0;">Auscultation</span>
              <p style="font-size:11px; color:var(--text-muted); margin-top:2px;">${p.auscultation}</p>
            </div>
            ${currentMode === 'medical' ? renderVirulenceFactors(p.virulenceFactors) : ''}
          </div>
        `;
      });
    }

    content.innerHTML = html;
    content.style.animation = 'none';
    content.offsetHeight; // reflow
    content.style.animation = 'panelFadeIn 0.3s ease-out';
  }

  function renderVirulenceFactors(factors) {
    if (!factors || factors.length === 0) return '';
    let html = '<div style="margin-top:10px;"><span class="detail-section-label" style="font-size:9px; border:none; padding:0;">Virulence Factors</span>';
    factors.forEach(f => {
      html += `<div style="margin-top:4px; padding:6px 10px; background:var(--bg-elevated); border-radius:4px;">
        <strong style="color:var(--accent-coral); font-size:11px;">${f.name}</strong>
        <p style="font-size:10.5px; color:var(--text-dim); margin-top:2px;">${f.desc}</p>
      </div>`;
    });
    html += '</div>';
    return html;
  }

  // ============================================================
  // PATHOGEN ↔ DRUG MATCHER
  // ============================================================
  function initDrugMatcher() {
    const list = $('#matcherPathogenList');
    PULMO_DATA.pathogens.forEach(p => {
      const card = document.createElement('div');
      card.className = 'matcher-card';
      card.dataset.pathogenId = p.id;
      card.innerHTML = `
        <div class="matcher-card__icon matcher-card__icon--pathogen">${getPathogenEmoji(p.type)}</div>
        <div>
          <div class="matcher-card__name">${p.name}</div>
          <div class="matcher-card__class">${p.type} &bull; ${p.gramStain.substring(0, 40)}...</div>
        </div>
      `;
      card.addEventListener('click', () => {
        $$('.matcher-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedPathogenId = p.id;
        renderMatcherDetail(p.id);
      });
      list.appendChild(card);
    });
  }

  function renderMatcherDetail(pathogenId) {
    const placeholder = $('#matcherPlaceholder');
    const content = $('#matcherContent');
    placeholder.classList.add('hidden');
    content.classList.remove('hidden');

    const pathogen = PULMO_DATA.pathogens.find(p => p.id === pathogenId);
    const matchingDrugs = PULMO_DATA.drugs.filter(d => d.targets.includes(pathogenId));
    const bronchodilators = PULMO_DATA.drugs.filter(d => d.targets.length === 0);

    let html = `
      <div class="detail-header">
        <div>
          <span class="detail-badge ${getBadgeClass(pathogen.type)}">${pathogen.type}</span>
          <div class="detail-name" style="margin-top:6px;">${pathogen.name}</div>
          <div class="detail-scientific">${pathogen.scientificName}</div>
        </div>
      </div>
      <div class="detail-section-label">Description</div>
      <div class="detail-text">${currentMode === 'student' ? pathogen.studentSummary : pathogen.medSummary}</div>
      <div class="detail-section-label">Key Symptoms</div>
      <ul class="detail-list">
        ${pathogen.symptoms.map(s => `<li>${s}</li>`).join('')}
      </ul>
    `;

    if (matchingDrugs.length > 0) {
      html += `<div class="match-line"></div>`;
      html += `<div class="detail-section-label">🎯 Targeted Drug Therapy</div>`;
      matchingDrugs.forEach(d => {
        const desc = currentMode === 'student' ? d.studentDesc : d.medDesc;
        html += `
          <div class="virulence-item" style="border-left: 3px solid var(--accent-green);">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
              <div class="matcher-card__icon matcher-card__icon--drug" style="width:28px; height:28px; font-size:14px;">💊</div>
              <div>
                <strong style="color:var(--accent-green); font-size:13px;">${d.name}</strong>
                <div style="font-family:var(--font-mono); font-size:9px; color:var(--text-muted);">${d.class}</div>
              </div>
            </div>
            <p style="margin-top:6px;">${desc}</p>
            ${currentMode === 'medical' ? `<div style="margin-top:6px; padding:6px 10px; background:var(--bg-deep); border-radius:4px;">
              <span style="font-family:var(--font-mono); font-size:9px; color:var(--primary); letter-spacing:1px;">MECHANISM</span>
              <p style="font-size:11px; color:var(--text-muted); margin-top:3px;">${d.mechanism}</p>
            </div>` : ''}
          </div>
        `;
      });
    }

    if (bronchodilators.length > 0) {
      html += `<div style="margin-top:12px; font-family:var(--font-mono); font-size:9px; color:var(--text-dim); letter-spacing:1px;">SUPPORTIVE THERAPY (SYMPTOMATIC)</div>`;
      bronchodilators.forEach(d => {
        html += `<div style="margin-top:6px; padding:8px 12px; background:var(--bg-elevated); border-radius:6px; border: 1px solid var(--border-subtle);">
          <strong style="color:var(--text-muted); font-size:12px;">${d.name}</strong>
          <p style="font-size:11px; color:var(--text-dim); margin-top:3px;">${currentMode === 'student' ? d.studentDesc : d.medDesc}</p>
        </div>`;
      });
    }

    content.innerHTML = html;
    content.style.animation = 'none';
    content.offsetHeight;
    content.style.animation = 'panelFadeIn 0.3s ease-out';
  }

  // ============================================================
  // CLINICAL CASE SIMULATOR
  // ============================================================
  function initCaseSimulator() {
    const selector = $('#caseSelector');
    PULMO_DATA.cases.forEach((c, i) => {
      const btn = document.createElement('button');
      btn.className = 'case-btn' + (i === 0 ? ' active' : '');
      btn.textContent = `Case ${i + 1}`;
      btn.dataset.index = i;
      btn.addEventListener('click', () => {
        activeCaseIndex = i;
        $$('.case-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Restore correct/incorrect classes
        updateCaseBtnStyles();
        stopAllAudio();
        renderActiveCase();
      });
      selector.appendChild(btn);
    });
    renderActiveCase();
  }

  function updateCaseBtnStyles() {
    $$('.case-btn').forEach((btn, i) => {
      const c = PULMO_DATA.cases[i];
      if (caseResults[c.id] === 'correct') btn.classList.add('correct');
      else btn.classList.remove('correct');
      if (caseResults[c.id] === 'incorrect') btn.classList.add('incorrect');
      else btn.classList.remove('incorrect');
    });
  }

  function renderActiveCase() {
    const c = PULMO_DATA.cases[activeCaseIndex];
    if (!c) return;
    const container = $('#caseContent');
    const alreadyAnswered = caseResults[c.id];

    const vitalsHTML = Object.entries(c.vitals).map(([key, val]) => {
      const isAlert = (key === 'spo2' && parseInt(val) < 93) || (key === 'temp' && parseFloat(val) > 38.5) || (key === 'rr' && parseInt(val) > 22);
      return `<div class="vital-item ${isAlert ? 'vital-item--alert' : ''}">
        <div class="vital-item__label">${key.toUpperCase()}</div>
        <div class="vital-item__value">${val}</div>
      </div>`;
    }).join('');

    let html = `
      <div class="glass-card mb-4">
        <div class="detail-header">
          <div>
            <div class="detail-name">📋 ${c.title}</div>
            <div class="detail-scientific">Clinical Scenario ${activeCaseIndex + 1} of ${PULMO_DATA.cases.length}</div>
          </div>
        </div>
      </div>

      <div class="case-grid">
        <!-- Patient History -->
        <div class="case-subcard">
          <div class="case-subcard__label"><span class="icon">📝</span> Patient History</div>
          <div class="case-text">${c.history}</div>
        </div>

        <!-- Vitals -->
        <div class="case-subcard">
          <div class="case-subcard__label"><span class="icon">❤️</span> Vital Signs</div>
          <div class="vitals-grid">${vitalsHTML}</div>
        </div>

        <!-- Physical Exam -->
        <div class="case-subcard">
          <div class="case-subcard__label"><span class="icon">🩺</span> Physical Examination</div>
          <div class="case-text">${c.physicalExam}</div>
          <button class="stethoscope-btn" id="stethBtn" onclick="PulmoApp.playAuscultation('${c.auscultationSound}')">
            🔊 Listen to Lung Sounds
          </button>
          <div class="audio-visualizer" id="audioViz">
            ${Array.from({length: 16}, () => '<div class="bar" style="height:4px;"></div>').join('')}
          </div>
        </div>

        <!-- Gram Stain -->
        <div class="case-subcard">
          <div class="case-subcard__label"><span class="icon">🔬</span> ${currentMode === 'medical' ? 'Gram Stain / Special Stain' : 'Lab Findings'}</div>
          <div class="case-text">${c.gramStainDesc}</div>
          <div class="gram-stain-display mt-4">
            <canvas id="gramCanvas" width="400" height="300"></canvas>
          </div>
        </div>

        <!-- X-Ray -->
        <div class="case-subcard" style="grid-column: 1 / -1;">
          <div class="case-subcard__label"><span class="icon">🩻</span> Chest X-Ray</div>
          <div class="case-text" style="margin-bottom:12px;">${c.xrayDesc}</div>
          <div class="xray-display">
            <canvas id="xrayCanvas" width="400" height="400"></canvas>
          </div>
        </div>
      </div>

      <!-- Diagnosis Form -->
      <div class="glass-card diagnosis-form">
        <div class="detail-section-label">🧠 Your Diagnosis</div>
        <div class="form-row">
          <div class="form-group">
            <label for="selectPathogen">Causative Pathogen</label>
            <select class="form-select" id="selectPathogen" ${alreadyAnswered ? 'disabled' : ''}>
              <option value="">— Select pathogen —</option>
              ${PULMO_DATA.pathogens.map(p => `<option value="${p.id}" ${alreadyAnswered && p.id === c.correctPathogenId ? 'selected' : ''}>${p.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="selectDrug">Recommended Treatment</label>
            <select class="form-select" id="selectDrug" ${alreadyAnswered ? 'disabled' : ''}>
              <option value="">— Select drug —</option>
              ${PULMO_DATA.drugs.map(d => `<option value="${d.id}" ${alreadyAnswered && d.id === c.correctDrugId ? 'selected' : ''}>${d.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <button class="submit-btn" id="submitDiagBtn" ${alreadyAnswered ? 'disabled' : ''}>
          ${alreadyAnswered ? '✓ SUBMITTED' : 'SUBMIT DIAGNOSIS'}
        </button>
        <div id="feedbackArea"></div>
      </div>
    `;

    container.innerHTML = html;

    // Render canvases
    setTimeout(() => {
      drawGramStain(c.gramStainPattern);
      drawXray(c.xrayPattern);
    }, 50);

    // Submit handler
    if (!alreadyAnswered) {
      $('#submitDiagBtn').addEventListener('click', () => submitDiagnosis(c));
    } else {
      showFeedback(c, alreadyAnswered === 'correct');
    }

    updateScoreDisplay();
  }

  function submitDiagnosis(caseData) {
    const selectedPathogen = $('#selectPathogen').value;
    const selectedDrug = $('#selectDrug').value;
    if (!selectedPathogen || !selectedDrug) {
      alert('Please select both a pathogen and a treatment.');
      return;
    }

    const pathogenCorrect = selectedPathogen === caseData.correctPathogenId;
    const drugCorrect = selectedDrug === caseData.correctDrugId;
    const isCorrect = pathogenCorrect && drugCorrect;

    caseResults[caseData.id] = isCorrect ? 'correct' : 'incorrect';
    updateCaseBtnStyles();
    updateScoreDisplay();

    $('#selectPathogen').disabled = true;
    $('#selectDrug').disabled = true;
    $('#submitDiagBtn').disabled = true;
    $('#submitDiagBtn').textContent = '✓ SUBMITTED';

    showFeedback(caseData, isCorrect);
  }

  function showFeedback(caseData, isCorrect) {
    const area = $('#feedbackArea');
    const correctPathogen = PULMO_DATA.pathogens.find(p => p.id === caseData.correctPathogenId);
    const correctDrug = PULMO_DATA.drugs.find(d => d.id === caseData.correctDrugId);

    area.innerHTML = `
      <div class="feedback-box ${isCorrect ? 'correct' : 'incorrect'}">
        <strong>${isCorrect ? '✅ Correct Diagnosis!' : '❌ Incorrect Diagnosis'}</strong>
        <br/>
        <span style="font-size:12px;">
          Pathogen: <strong>${correctPathogen.name}</strong> &bull;
          Treatment: <strong>${correctDrug.name}</strong>
        </span>
        <div class="explanation">${caseData.explanation}</div>
      </div>
    `;
  }

  function updateScoreDisplay() {
    const total = Object.keys(caseResults).length;
    const correct = Object.values(caseResults).filter(r => r === 'correct').length;
    $('#scoreDisplay').textContent = `${correct} / ${total}`;
  }

  // ============================================================
  // GRAM STAIN CANVAS RENDERER
  // ============================================================
  function drawGramStain(pattern) {
    const canvas = document.getElementById('gramCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;

    // Background - pale purple/blue tint of Gram stain
    ctx.fillStyle = '#e8dff0';
    ctx.fillRect(0, 0, w, h);

    // Add some noise
    for (let i = 0; i < 800; i++) {
      ctx.fillStyle = `rgba(${150 + Math.random()*50}, ${130 + Math.random()*50}, ${170 + Math.random()*50}, ${0.15 + Math.random()*0.15})`;
      ctx.fillRect(Math.random()*w, Math.random()*h, 1 + Math.random()*2, 1 + Math.random()*2);
    }

    // Neutrophils (larger cells scattered)
    for (let i = 0; i < 12; i++) {
      const x = 40 + Math.random() * (w - 80);
      const y = 30 + Math.random() * (h - 60);
      drawNeutrophil(ctx, x, y);
    }

    switch (pattern) {
      case 'gpos_diplococci':
        // Draw Gram-positive lancet-shaped diplococci (dark purple pairs)
        for (let i = 0; i < 35; i++) {
          const x = 30 + Math.random() * (w - 60);
          const y = 20 + Math.random() * (h - 40);
          drawDiplococci(ctx, x, y);
        }
        break;

      case 'no_organisms':
      case 'no_organisms_bcye':
        // Only neutrophils, no visible organisms
        ctx.font = '11px var(--font-mono)';
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.textAlign = 'center';
        ctx.fillText('No organisms visible', w/2, h - 15);
        break;

      case 'gneg_encapsulated':
        // Draw Gram-negative encapsulated rods (pink/red with halo)
        for (let i = 0; i < 28; i++) {
          const x = 30 + Math.random() * (w - 60);
          const y = 20 + Math.random() * (h - 40);
          drawEncapsulatedRod(ctx, x, y);
        }
        break;

      case 'acid_fast':
        // Acid-fast red rods on blue background
        ctx.fillStyle = '#d0e0f0';
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 20; i++) {
          const x = 30 + Math.random() * (w - 60);
          const y = 20 + Math.random() * (h - 40);
          drawAcidFastRod(ctx, x, y);
        }
        break;

      case 'silver_cysts':
        // Silver-stained (dark brown/black) crushed ping-pong ball cysts on amber background
        ctx.fillStyle = '#f0e8d0';
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 15; i++) {
          const x = 50 + Math.random() * (w - 100);
          const y = 30 + Math.random() * (h - 60);
          drawSilverCyst(ctx, x, y);
        }
        break;
    }

    // Microscope vignette
    const gradient = ctx.createRadialGradient(w/2, h/2, Math.min(w,h)*0.3, w/2, h/2, Math.min(w,h)*0.55);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }

  function drawNeutrophil(ctx, x, y) {
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(x, y, 12 + Math.random()*4, 0, Math.PI*2);
    ctx.fillStyle = '#c8b8d8';
    ctx.fill();
    // Multi-lobed nucleus
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(x - 4 + i*5, y - 2 + Math.random()*4, 3 + Math.random()*2, 0, Math.PI*2);
      ctx.fillStyle = '#6a4c8a';
      ctx.fill();
    }
    ctx.restore();
  }

  function drawDiplococci(ctx, x, y) {
    ctx.save();
    const angle = Math.random() * Math.PI;
    ctx.translate(x, y);
    ctx.rotate(angle);
    // Lancet-shaped pair (dark purple = Gram-positive)
    ctx.fillStyle = '#3a1080';
    ctx.beginPath();
    ctx.ellipse(-3, 0, 3, 4.5, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(3, 0, 3, 4.5, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  function drawEncapsulatedRod(ctx, x, y) {
    ctx.save();
    const angle = Math.random() * Math.PI;
    ctx.translate(x, y);
    ctx.rotate(angle);
    // Capsule halo (clear)
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 6, 0, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(180,160,200,0.4)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    // Rod (pink/red = Gram-negative)
    ctx.beginPath();
    ctx.ellipse(0, 0, 6, 3, 0, 0, Math.PI*2);
    ctx.fillStyle = '#d04060';
    ctx.fill();
    ctx.restore();
  }

  function drawAcidFastRod(ctx, x, y) {
    ctx.save();
    const angle = Math.random() * Math.PI;
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = '#e02020';
    ctx.beginPath();
    ctx.roundRect(-8, -2, 16, 4, 2);
    ctx.fill();
    ctx.restore();
  }

  function drawSilverCyst(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    const r = 8 + Math.random()*5;
    // Cup/crescent shape
    ctx.beginPath();
    ctx.arc(0, 0, r, 0.3, Math.PI * 1.7);
    ctx.strokeStyle = '#302010';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    // Inner "crushed" line
    ctx.beginPath();
    ctx.moveTo(-r*0.4, r*0.2);
    ctx.quadraticCurveTo(0, -r*0.3, r*0.4, r*0.2);
    ctx.strokeStyle = '#503820';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  // ============================================================
  // CHEST X-RAY CANVAS RENDERER
  // ============================================================
  function drawXray(pattern) {
    const canvas = document.getElementById('xrayCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;

    // Black background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    // Rib cage silhouette
    drawRibcage(ctx, w, h);

    // Draw lung fields (normal = dark gray)
    drawLungFields(ctx, w, h);

    // Heart silhouette
    ctx.beginPath();
    ctx.ellipse(w*0.48, h*0.58, w*0.1, h*0.14, -0.1, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(180,180,180,0.3)';
    ctx.fill();

    // Pathology overlays
    switch (pattern) {
      case 'right_lower_lobar':
        drawConsolidation(ctx, w*0.65, h*0.65, w*0.18, h*0.2, 0.6);
        break;
      case 'diffuse_patchy':
        for (let i = 0; i < 20; i++) {
          const side = Math.random() > 0.5 ? 0.3 : 0.7;
          drawConsolidation(ctx, w * (side + (Math.random()-0.5)*0.2), h * (0.35 + Math.random()*0.35), w*0.06, h*0.06, 0.25 + Math.random()*0.15);
        }
        break;
      case 'right_upper_bulging':
        drawConsolidation(ctx, w*0.65, h*0.32, w*0.17, h*0.16, 0.7);
        // Bulging fissure line
        ctx.beginPath();
        ctx.moveTo(w*0.55, h*0.42);
        ctx.quadraticCurveTo(w*0.65, h*0.48, w*0.78, h*0.42);
        ctx.strokeStyle = 'rgba(200,200,200,0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        break;
      case 'lower_patchy':
        drawConsolidation(ctx, w*0.35, h*0.65, w*0.14, h*0.14, 0.4);
        drawConsolidation(ctx, w*0.65, h*0.6, w*0.12, h*0.12, 0.35);
        drawConsolidation(ctx, w*0.6, h*0.7, w*0.1, h*0.1, 0.3);
        break;
      case 'upper_cavitary':
        // Upper lobe opacities with cavitary lesions
        drawConsolidation(ctx, w*0.32, h*0.3, w*0.12, h*0.12, 0.5);
        drawConsolidation(ctx, w*0.68, h*0.3, w*0.12, h*0.12, 0.5);
        // Cavities (dark circles within opacities)
        drawCavity(ctx, w*0.32, h*0.3, w*0.04);
        drawCavity(ctx, w*0.68, h*0.3, w*0.035);
        break;
      case 'bilateral_ground_glass':
        // Diffuse ground-glass from hilum
        const gg = ctx.createRadialGradient(w*0.48, h*0.45, w*0.05, w*0.48, h*0.45, w*0.38);
        gg.addColorStop(0, 'rgba(200,200,200,0.35)');
        gg.addColorStop(0.5, 'rgba(180,180,180,0.2)');
        gg.addColorStop(1, 'rgba(150,150,150,0.05)');
        ctx.fillStyle = gg;
        ctx.fillRect(0, 0, w, h);
        break;
    }

    // Film border and label
    ctx.strokeStyle = 'rgba(100,100,100,0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, w-4, h-4);
    ctx.font = '10px monospace';
    ctx.fillStyle = 'rgba(200,200,200,0.5)';
    ctx.fillText('PA VIEW', 10, 16);
    ctx.fillText('PULMOAGENT', w - 90, 16);
  }

  function drawRibcage(ctx, w, h) {
    ctx.strokeStyle = 'rgba(140,140,140,0.15)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 10; i++) {
      const y = h * 0.2 + i * h * 0.065;
      ctx.beginPath();
      ctx.moveTo(w * 0.2, y);
      ctx.quadraticCurveTo(w * 0.35, y + 8, w * 0.48, y + 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w * 0.8, y);
      ctx.quadraticCurveTo(w * 0.65, y + 8, w * 0.52, y + 3);
      ctx.stroke();
    }
    // Spine
    ctx.fillStyle = 'rgba(140,140,140,0.08)';
    ctx.fillRect(w*0.46, h*0.15, w*0.08, h*0.7);
  }

  function drawLungFields(ctx, w, h) {
    // Left lung field
    ctx.beginPath();
    ctx.ellipse(w*0.32, h*0.48, w*0.17, h*0.28, 0, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(30,30,30,0.8)';
    ctx.fill();
    // Right lung field
    ctx.beginPath();
    ctx.ellipse(w*0.68, h*0.48, w*0.17, h*0.28, 0, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(30,30,30,0.8)';
    ctx.fill();
  }

  function drawConsolidation(ctx, x, y, rx, ry, opacity) {
    ctx.save();
    ctx.globalAlpha = opacity;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry));
    grad.addColorStop(0, 'rgba(200,200,200,1)');
    grad.addColorStop(1, 'rgba(160,160,160,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  function drawCavity(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(10,10,10,0.8)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(180,180,180,0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // ============================================================
  // WEB AUDIO — STETHOSCOPIC LUNG SOUND SYNTHESIZER
  // ============================================================
  async function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }
    return audioCtx;
  }

  function stopAllAudio() {
    activeAudioNodes.forEach(node => {
      try { node.stop ? node.stop() : node.disconnect(); } catch(e) {}
    });
    activeAudioNodes = [];
    isPlaying = false;
    const viz = document.getElementById('audioViz');
    if (viz) viz.classList.remove('playing');
    const btn = document.getElementById('stethBtn');
    if (btn) {
      btn.classList.remove('playing');
      btn.innerHTML = '🔊 Listen to Lung Sounds';
    }
  }

  async function playAuscultation(type) {
    if (isPlaying) {
      stopAllAudio();
      return;
    }

    const ctx = await getAudioContext();
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.3;
    masterGain.connect(ctx.destination);
    activeAudioNodes.push(masterGain);

    isPlaying = true;
    const viz = document.getElementById('audioViz');
    if (viz) viz.classList.add('playing');
    const btn = document.getElementById('stethBtn');
    if (btn) {
      btn.classList.add('playing');
      btn.innerHTML = '⏹ Stop Playback';
    }

    const duration = 5; // seconds

    switch (type) {
      case 'crackles':
        synthesizeCrackles(ctx, masterGain, duration);
        synthesizeBaseBreathing(ctx, masterGain, duration);
        break;
      case 'wheeze':
        synthesizeWheeze(ctx, masterGain, duration);
        synthesizeBaseBreathing(ctx, masterGain, duration);
        break;
      case 'decreased':
        synthesizeBaseBreathing(ctx, masterGain, duration, 0.15);
        break;
      case 'normal':
      default:
        synthesizeBaseBreathing(ctx, masterGain, duration, 0.6);
        break;
    }

    // Auto-stop
    setTimeout(() => {
      stopAllAudio();
      if (btn) btn.innerHTML = '🔊 Listen to Lung Sounds';
    }, duration * 1000);
  }

  function synthesizeBaseBreathing(ctx, dest, duration, volume = 0.4) {
    // White noise shaped by band-pass for vesicular breathing
    const bufferSize = ctx.sampleRate * duration;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    // Band-pass filter (200-800 Hz range for vesicular sounds)
    const bpf = ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.value = 400;
    bpf.Q.value = 0.8;

    // Breathing envelope (cyclic volume)
    const envGain = ctx.createGain();
    envGain.gain.setValueAtTime(0, ctx.currentTime);
    const now = ctx.currentTime;
    const breathCycle = 3; // 3 seconds per breath
    for (let t = 0; t < duration; t += breathCycle) {
      const startTime = now + t;
      envGain.gain.setValueAtTime(0, startTime);
      envGain.gain.linearRampToValueAtTime(volume, startTime + breathCycle * 0.35);
      envGain.gain.linearRampToValueAtTime(volume * 0.7, startTime + breathCycle * 0.5);
      envGain.gain.linearRampToValueAtTime(volume * 0.4, startTime + breathCycle * 0.65);
      envGain.gain.linearRampToValueAtTime(0.02, startTime + breathCycle * 0.95);
    }

    noise.connect(bpf);
    bpf.connect(envGain);
    envGain.connect(dest);
    noise.start();
    activeAudioNodes.push(noise, bpf, envGain);
  }

  function synthesizeCrackles(ctx, dest, duration) {
    // Crackles = short burst impulses (random clicks)
    const now = ctx.currentTime;
    const crackleRate = 12; // crackles per second
    const totalCrackles = crackleRate * duration;

    for (let i = 0; i < totalCrackles; i++) {
      const time = now + (i / crackleRate) + (Math.random() * 0.06);
      const crackleLen = 0.003 + Math.random() * 0.008;
      const crackleBuffer = ctx.createBuffer(1, ctx.sampleRate * crackleLen, ctx.sampleRate);
      const data = crackleBuffer.getChannelData(0);
      for (let j = 0; j < data.length; j++) {
        data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (data.length * 0.2));
      }

      const src = ctx.createBufferSource();
      src.buffer = crackleBuffer;

      const hpf = ctx.createBiquadFilter();
      hpf.type = 'highpass';
      hpf.frequency.value = 600 + Math.random() * 800;

      const gain = ctx.createGain();
      gain.gain.value = 0.15 + Math.random() * 0.2;

      src.connect(hpf);
      hpf.connect(gain);
      gain.connect(dest);
      src.start(time);
      activeAudioNodes.push(src);
    }
  }

  function synthesizeWheeze(ctx, dest, duration) {
    // Wheeze = narrow-band tonal sound (oscillator sweep)
    const now = ctx.currentTime;
    const breathCycle = 3;

    for (let t = 0; t < duration; t += breathCycle) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      
      const startFreq = 300 + Math.random() * 100;
      osc.frequency.setValueAtTime(startFreq, now + t);
      osc.frequency.linearRampToValueAtTime(startFreq + 50 + Math.random()*50, now + t + breathCycle * 0.5);
      osc.frequency.linearRampToValueAtTime(startFreq - 20 + Math.random()*40, now + t + breathCycle);

      const wheezeGain = ctx.createGain();
      wheezeGain.gain.setValueAtTime(0, now + t);
      wheezeGain.gain.linearRampToValueAtTime(0.08, now + t + breathCycle * 0.2);
      wheezeGain.gain.linearRampToValueAtTime(0.12, now + t + breathCycle * 0.5);
      wheezeGain.gain.linearRampToValueAtTime(0.02, now + t + breathCycle * 0.9);
      wheezeGain.gain.linearRampToValueAtTime(0, now + t + breathCycle);

      osc.connect(wheezeGain);
      wheezeGain.connect(dest);
      osc.start(now + t);
      osc.stop(now + t + breathCycle);
      activeAudioNodes.push(osc, wheezeGain);
    }
  }

  // ============================================================
  // HELPERS
  // ============================================================
  function getBadgeClass(type) {
    const map = {
      'Bacteria': 'detail-badge--bacteria',
      'Atypical Bacteria': 'detail-badge--atypical',
      'Acid-Fast Bacteria': 'detail-badge--acid-fast',
      'Fungi': 'detail-badge--fungi'
    };
    return map[type] || '';
  }

  function getTypeColor(type) {
    const map = {
      'Bacteria': 'var(--accent-coral)',
      'Atypical Bacteria': 'var(--accent-amber)',
      'Acid-Fast Bacteria': 'var(--accent-pink)',
      'Fungi': '#b780ff'
    };
    return map[type] || 'var(--primary)';
  }

  function getPathogenEmoji(type) {
    const map = {
      'Bacteria': '🦠',
      'Atypical Bacteria': '🧬',
      'Acid-Fast Bacteria': '🔴',
      'Fungi': '🍄'
    };
    return map[type] || '🦠';
  }

  // ============================================================
  // VIDEO ACADEMY — Timeline-based animated player
  // ============================================================

  const VIDEO_TOTAL_DURATION = 36; // seconds
  const VIDEO_SPEED_OPTIONS = [0.5, 1, 1.5, 2];

  // Chapter definitions
  const VIDEO_CHAPTERS = [
    {
      id: 'ch1',
      title: 'The Thoracic Cavity',
      start: 0,
      end: 6,
      img: 1, // videoImg1 (lungs_3d.jpg)
      kb: 'kb-zoom-in',
      scanLine: true,
      markers: [],
      highlightMarkers: [],
      sound: 'normal',
      subtitles: [
        { at: 0, text: '🫁 Welcome to the Pulmonary Academy. Let\'s begin with an overview of the thoracic cavity.' },
        { at: 2, text: 'The lungs occupy most of the thoracic cavity, flanking the mediastinum.' },
        { at: 4, text: 'The right lung has 3 lobes; the left has 2 lobes to accommodate the heart.' }
      ]
    },
    {
      id: 'ch2',
      title: 'Lung Anatomy & Lobes',
      start: 6,
      end: 12,
      img: 2, // videoImg2 (lobes_anatomy.jpg)
      kb: 'kb-zoom-out',
      scanLine: false,
      markers: ['marker-rul', 'marker-rml', 'marker-rll', 'marker-lul', 'marker-lll'],
      highlightMarkers: [],
      sound: null,
      subtitles: [
        { at: 6, text: '🔬 The right lung: Superior (RUL), Middle (RML), and Inferior (RLL) lobes.' },
        { at: 8, text: 'The left lung: Superior (LUL) and Inferior (LLL) lobes. The horizontal fissure is unique to the right lung.' },
        { at: 10, text: 'Each lobe is a common site for specific pulmonary pathogens.' }
      ]
    },
    {
      id: 'ch3',
      title: 'Bacterial Pneumonia Sites',
      start: 12,
      end: 18,
      img: 2,
      kb: 'kb-pan-right',
      scanLine: false,
      markers: ['marker-rul', 'marker-rml', 'marker-rll', 'marker-lul', 'marker-lll'],
      highlightMarkers: ['marker-rll', 'marker-rul'],
      sound: 'crackles',
      subtitles: [
        { at: 12, text: '🦠 S. pneumoniae — the #1 cause of CAP — classically causes lobar consolidation, often in the RLL.' },
        { at: 14, text: '🔊 Listen: Coarse crackles (rales), bronchial breath sounds, and increased tactile fremitus.' },
        { at: 16, text: '🦠 K. pneumoniae targets the RUL in alcoholics, causing the "bulging fissure" sign and currant-jelly sputum.' }
      ]
    },
    {
      id: 'ch4',
      title: 'Atypical Pathogens',
      start: 18,
      end: 24,
      img: 1,
      kb: 'kb-pan-left',
      scanLine: true,
      markers: [],
      highlightMarkers: [],
      sound: 'wheeze',
      subtitles: [
        { at: 18, text: '🧬 Mycoplasma pneumoniae — "walking pneumonia" — lacks a cell wall → invisible on Gram stain.' },
        { at: 20, text: '🔊 Listen: Scattered wheezes and rhonchi. Chest sounds surprisingly clear despite diffuse infiltrates.' },
        { at: 22, text: '🧬 Legionella pneumophila — from contaminated water. GI symptoms + confusion + hyponatremia.' }
      ]
    },
    {
      id: 'ch5',
      title: 'TB & Opportunistic Fungi',
      start: 24,
      end: 30,
      img: 2,
      kb: 'kb-zoom-in',
      scanLine: false,
      markers: ['marker-rul', 'marker-rml', 'marker-rll', 'marker-lul', 'marker-lll'],
      highlightMarkers: ['marker-lul', 'marker-rul'],
      sound: 'crackles',
      subtitles: [
        { at: 24, text: '🔴 M. tuberculosis — acid-fast bacillus. Reactivation TB targets the upper lobes (high O₂ tension).' },
        { at: 26, text: '🔊 Listen: Post-tussive apical crackles — crackles heard in the upper lobes after coughing.' },
        { at: 28, text: '🍄 Pneumocystis jirovecii — in HIV (CD4<200). Bilateral ground-glass opacities, "bat-wing" pattern.' }
      ]
    },
    {
      id: 'ch6',
      title: 'Pharmacological Targets',
      start: 30,
      end: 36,
      img: 1,
      kb: 'kb-zoom-out',
      scanLine: true,
      markers: [],
      highlightMarkers: [],
      sound: null,
      subtitles: [
        { at: 30, text: '💊 Ceftriaxone (β-lactam) → cell wall. Azithromycin (macrolide) → 50S ribosome. Levofloxacin → DNA gyrase.' },
        { at: 32, text: '💊 TB: RIPE therapy — Rifampin (RNA polymerase), Isoniazid (mycolic acid), Pyrazinamide, Ethambutol (eyes!).' },
        { at: 34, text: '💊 PJP: TMP-SMX blocks folate synthesis. Supportive: Albuterol (β₂-agonist) + Fluticasone (ICS).' }
      ]
    }
  ];

  let videoState = {
    playing: false,
    currentTime: 0,
    speed: 1,
    speedIndex: 1,
    intervalId: null,
    currentChapterIndex: -1,
    currentSoundType: null,
    muted: false
  };

  function initVideoAcademy() {
    buildChapterCards();
    buildChapterTicks();
    bindVideoControls();
    updateVideoUI(0);
  }

  function buildChapterCards() {
    const row = document.getElementById('videoChaptersRow');
    if (!row) return;
    VIDEO_CHAPTERS.forEach((ch, i) => {
      const card = document.createElement('div');
      card.className = 'video-chapter-card' + (i === 0 ? ' active' : '');
      card.dataset.index = i;
      card.innerHTML = `
        <div class="video-chapter-card__num">CH ${i + 1}</div>
        <div class="video-chapter-card__title">${ch.title}</div>
      `;
      card.addEventListener('click', () => seekToChapter(i));
      row.appendChild(card);
    });
  }

  function buildChapterTicks() {
    const container = document.getElementById('videoChapterTicks');
    if (!container) return;
    VIDEO_CHAPTERS.forEach(ch => {
      if (ch.start === 0) return;
      const pct = (ch.start / VIDEO_TOTAL_DURATION) * 100;
      const tick = document.createElement('div');
      tick.className = 'video-chapter-tick';
      tick.style.left = pct + '%';
      container.appendChild(tick);
    });
  }

  function bindVideoControls() {
    const playBtn = document.getElementById('videoPlayBtn');
    const progressWrap = document.getElementById('videoProgressWrap');
    const speedBtn = document.getElementById('videoSpeedBtn');
    const volBtn = document.getElementById('videoVolBtn');

    if (playBtn) playBtn.addEventListener('click', toggleVideoPlayback);
    if (progressWrap) {
      progressWrap.addEventListener('click', (e) => {
        const rect = progressWrap.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        seekToTime(pct * VIDEO_TOTAL_DURATION);
      });
    }
    if (speedBtn) speedBtn.addEventListener('click', cycleSpeed);
    if (volBtn) volBtn.addEventListener('click', toggleMute);
  }

  function toggleVideoPlayback() {
    if (videoState.playing) {
      pauseVideo();
    } else {
      if (videoState.currentTime >= VIDEO_TOTAL_DURATION) {
        videoState.currentTime = 0;
      }
      playVideo();
    }
  }

  function playVideo() {
    videoState.playing = true;
    const playIcon = document.getElementById('playIcon');
    if (playIcon) playIcon.textContent = '⏸';

    const TICK_MS = 100;
    videoState.intervalId = setInterval(() => {
      videoState.currentTime += (TICK_MS / 1000) * videoState.speed;
      if (videoState.currentTime >= VIDEO_TOTAL_DURATION) {
        videoState.currentTime = VIDEO_TOTAL_DURATION;
        pauseVideo();
      }
      updateVideoUI(videoState.currentTime);
    }, TICK_MS);
  }

  function pauseVideo() {
    videoState.playing = false;
    clearInterval(videoState.intervalId);
    const playIcon = document.getElementById('playIcon');
    if (playIcon) playIcon.textContent = '▶';
    stopVideoAudio();
  }

  function seekToTime(t) {
    videoState.currentTime = Math.max(0, Math.min(t, VIDEO_TOTAL_DURATION));
    stopVideoAudio();
    updateVideoUI(videoState.currentTime);
    if (videoState.playing) {
      triggerChapterSound(getChapterAtTime(videoState.currentTime));
    }
  }

  function seekToChapter(index) {
    const ch = VIDEO_CHAPTERS[index];
    if (!ch) return;
    seekToTime(ch.start);
    if (!videoState.playing) {
      playVideo();
    }
  }

  function cycleSpeed() {
    videoState.speedIndex = (videoState.speedIndex + 1) % VIDEO_SPEED_OPTIONS.length;
    videoState.speed = VIDEO_SPEED_OPTIONS[videoState.speedIndex];
    const btn = document.getElementById('videoSpeedBtn');
    if (btn) btn.textContent = videoState.speed + '×';
  }

  function toggleMute() {
    videoState.muted = !videoState.muted;
    const btn = document.getElementById('videoVolBtn');
    if (btn) btn.textContent = videoState.muted ? '🔇' : '🔊';
    if (videoState.muted) {
      stopVideoAudio();
    } else if (videoState.playing) {
      const ch = getChapterAtTime(videoState.currentTime);
      if (ch) triggerChapterSound(ch);
    }
  }

  function getChapterAtTime(t) {
    return VIDEO_CHAPTERS.find(ch => t >= ch.start && t < ch.end) || null;
  }

  function formatVideoTime(s) {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return mins + ':' + String(secs).padStart(2, '0');
  }

  // ---- Main UI update driven by currentTime ----
  function updateVideoUI(t) {
    const pct = (t / VIDEO_TOTAL_DURATION) * 100;

    // Progress bar
    const fill = document.getElementById('videoProgressFill');
    const thumb = document.getElementById('videoProgressThumb');
    const elapsedEl = document.getElementById('videoTimeElapsed');
    if (fill) fill.style.width = pct + '%';
    if (thumb) thumb.style.left = pct + '%';
    if (elapsedEl) elapsedEl.textContent = formatVideoTime(t);

    // Determine active chapter
    const ch = getChapterAtTime(t);
    if (!ch) return;
    const chIdx = VIDEO_CHAPTERS.indexOf(ch);

    // Chapter change
    if (chIdx !== videoState.currentChapterIndex) {
      videoState.currentChapterIndex = chIdx;
      applyChapterVisuals(ch);
      if (videoState.playing && !videoState.muted) {
        triggerChapterSound(ch);
      }
    }

    // Update subtitle
    updateSubtitle(ch, t);

    // Update chapter cards
    document.querySelectorAll('.video-chapter-card').forEach((card, i) => {
      card.classList.toggle('active', i === chIdx);
    });
  }

  function applyChapterVisuals(ch) {
    const img1 = document.getElementById('videoImg1');
    const img2 = document.getElementById('videoImg2');
    const scanLine = document.getElementById('scanLine');
    const chTitle = document.getElementById('videoChapterTitle');

    // Images
    if (img1 && img2) {
      // Remove all KB classes
      img1.className = 'video-img';
      img2.className = 'video-img';

      if (ch.img === 1) {
        img1.classList.add('active', ch.kb);
        // img2 stays hidden
      } else {
        img2.classList.add('active', ch.kb);
      }
    }

    // Scan line
    if (scanLine) {
      scanLine.classList.toggle('active', !!ch.scanLine);
    }

    // Chapter title
    if (chTitle) {
      chTitle.textContent = ch.title;
      chTitle.classList.remove('visible');
      // Small delay for re-trigger animation
      setTimeout(() => chTitle.classList.add('visible'), 50);
    }

    // Lobe markers
    const allMarkers = document.querySelectorAll('.lobe-marker');
    allMarkers.forEach(m => {
      m.classList.remove('visible', 'highlight');
    });
    ch.markers.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('visible');
    });
    ch.highlightMarkers.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('highlight');
    });
  }

  function updateSubtitle(ch, t) {
    const subEl = document.getElementById('videoSubtitleText');
    if (!subEl) return;
    // Find the latest subtitle that has fired
    let activeSub = null;
    for (let i = ch.subtitles.length - 1; i >= 0; i--) {
      if (t >= ch.subtitles[i].at) {
        activeSub = ch.subtitles[i];
        break;
      }
    }
    if (activeSub && subEl.textContent !== activeSub.text) {
      subEl.style.opacity = '0';
      setTimeout(() => {
        subEl.textContent = activeSub.text;
        subEl.style.opacity = '1';
      }, 200);
    }
  }

  // ---- Video audio (reuses the stethoscope synthesizers) ----
  let videoAudioNodes = [];
  let videoAudioCtx = null;

  function stopVideoAudio() {
    videoAudioNodes.forEach(node => {
      try { node.stop ? node.stop() : node.disconnect(); } catch(e) {}
    });
    videoAudioNodes = [];
    videoState.currentSoundType = null;
  }

  async function triggerChapterSound(ch) {
    if (!ch || !ch.sound || videoState.muted) {
      stopVideoAudio();
      return;
    }
    // Don't re-trigger if same sound is already playing
    if (videoState.currentSoundType === ch.sound) return;
    stopVideoAudio();
    videoState.currentSoundType = ch.sound;

    const ctx = await getAudioContext();
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.25;
    masterGain.connect(ctx.destination);
    videoAudioNodes.push(masterGain);

    const soundDuration = ch.end - ch.start;
    switch (ch.sound) {
      case 'crackles':
        synthesizeCrackles(ctx, masterGain, soundDuration);
        synthesizeBaseBreathing(ctx, masterGain, soundDuration);
        break;
      case 'wheeze':
        synthesizeWheeze(ctx, masterGain, soundDuration);
        synthesizeBaseBreathing(ctx, masterGain, soundDuration);
        break;
      case 'decreased':
        synthesizeBaseBreathing(ctx, masterGain, soundDuration, 0.15);
        break;
      case 'normal':
        synthesizeBaseBreathing(ctx, masterGain, soundDuration, 0.5);
        break;
    }

    // Auto-stop after the sound duration
    setTimeout(() => {
      if (videoState.currentSoundType === ch.sound) {
        stopVideoAudio();
      }
    }, soundDuration * 1000);
  }

  // Expose public API for inline onclick handlers
  window.PulmoApp = {
    playAuscultation
  };

})();
