// FakeCheck — Content Script
// Injected on demand by background.js
// Creates Shadow DOM isolated overlay with verification checklist

(function () {
  'use strict';

  // ─── Theme System ─────────────────────────────────────────
  const THEME_STORAGE_KEY = 'fakecheck_theme';

  function getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function getSavedTheme() {
    return new Promise((resolve) => {
      chrome.storage.local.get(THEME_STORAGE_KEY, (result) => {
        const saved = result[THEME_STORAGE_KEY];
        resolve(saved || null);
      });
    });
  }

  // Prevent double-injection
  if (window.__fakecheck_injected) {
    return;
  }
  window.__fakecheck_injected = true;

  // ─── Configuration ─────────────────────────────────────────
  const STEPS = [
    {
      id: 'step-1',
      label: 'Zidentyfikuj konkretne twierdzenia',
      desc: `Zanim zaczniesz sprawdzać — wypisz dokładnie, co jest twierdzone. Oddziel fakty od opinii. Zadaj sobie pytanie: <strong>Co dokładnie jest stwierdzane? Kto to mówi? Kiedy i gdzie?</strong> Im precyzyjniej zidentyfikujesz twierdzenie, tym łatwiej je zweryfikujesz.`
    },
    {
      id: 'step-2',
      label: 'Znajdź pierwotne źródło informacji',
      desc: `Szukaj oryginalnego źródła — raportu, badania, oświadczenia. Pytaj: <strong>Skąd pochodzi ta informacja? Czy to cytat z drugiej ręki?</strong> Często fake newsy to przekręcone cytaty z prawdziwych źródeł. Cofnij się do źródła pierwotnego.`
    },
    {
      id: 'step-3',
      label: 'Oceń wiarygodność źródła',
      desc: `Sprawdź: <strong>Kto stoi za tym źródłem? Jakie ma intencje? Czy ma historię rzetelności?</strong> Zweryfikuj datę publikacji, autorstwo, czy strona nie jest satyryczna lub parodyjna. Użyj metody <strong>SIFT</strong>: Stop → Investigate → Find better coverage → Trace claims.`
    },
    {
      id: 'step-4',
      label: 'Poszukaj potwierdzenia w innych źródłach',
      desc: `Prawdziwa informacja pojawi się w wielu niezależnych źródłach. Skorzystaj z:
        <ul>
          <li><strong>Fact Check Tools API</strong> — <a href="https://toolbox.google.com/factcheck/explorer" target="_blank" rel="noopener">Google Fact Check Tools</a> — baza zweryfikowanych twierdzeń</li>
          <li><strong>Google Dorks</strong> — zaawansowane wyszukiwanie: użyj fraz typu <code>"nazwa twierdzenia" site:reuters.com</code> lub <code>"fake" OR "fałsz" "nazwa tematu"</code> aby dotrzeć do weryfikacji</li>
        </ul>`
    },
    {
      id: 'step-5',
      label: 'Skonsultuj się z ekspertami',
      desc: `Sprawdź, co mówią eksperci w danej dziedzinie — naukowcy, instytucje, think-tanki. Szukaj stanowisk organizacji branżowych, uczelni, agencji rządowych. Uważaj na "ekspertów" bez weryfikowalnych kwalifikacji lub z konfliktami interesów.`
    },
    {
      id: 'step-6',
      label: 'Oceń kontekst publikacji',
      desc: `Zadaj pytanie: <strong>Dlaczego ta informacja pojawiła się właśnie teraz?</strong> Sprawdź, czy zdjęcia/wideo nie są wyrwane z kontekstu (reverse image search). Oceń, czy narracja nie jest nakierowana na wywołanie emocji zamiast informowania. Sprawdź datę — stare newsy często wracają jako "nowe".`
    }
  ];

  const FACES = {
    sad: chrome.runtime.getURL('faces/face_sad.png'),
    neutral: chrome.runtime.getURL('faces/face_neutral.png'),
    happy: chrome.runtime.getURL('faces/face_happy.png')
  };

  const CURRENT_URL = location.href;

  // ─── Storage helpers ───────────────────────────────────────

  function storageKey() {
    return 'fc_state_' + CURRENT_URL;
  }

  function loadState(callback) {
    chrome.storage.local.get([storageKey()], (result) => {
      const state = result[storageKey()] || {};
      callback(state);
    });
  }

  function saveState(state) {
    chrome.storage.local.set({ [storageKey()]: state });
  }

  // ─── Score → Face mapping ─────────────────────────────────

  function getFaceForScore(score) {
    if (score <= 2) return 'sad';
    if (score <= 4) return 'neutral';
    return 'happy';
  }

  function getGlowClass(score) {
    if (score <= 2) return 'fc-glow-red';
    if (score <= 4) return 'fc-glow-yellow';
    return 'fc-glow-green';
  }

  function getProgressColor(score) {
    if (score <= 2) return '#e74c3c';
    if (score <= 4) return '#f39c12';
    return '#27ae60';
  }

  // ─── DOM Construction ──────────────────────────────────────

  // Host container
  const host = document.createElement('div');
  host.id = 'fakecheck-host';
  host.style.cssText = 'all:initial; position:fixed; z-index:2147483647; top:0; left:0; width:0; height:0;';
  document.body.appendChild(host);

  // Shadow DOM
  const shadow = host.attachShadow({ mode: 'closed' });

  // Load styles into shadow
  const styleLink = document.createElement('link');
  styleLink.rel = 'stylesheet';
  styleLink.href = chrome.runtime.getURL('overlay.css');
  shadow.appendChild(styleLink);

  // ─── Face Button ───────────────────────────────────────────

  const faceBtn = document.createElement('button');
  faceBtn.className = 'fc-face-btn fc-glow-red';
  faceBtn.setAttribute('aria-label', 'FakeCheck — sprawdź wiarygodność');

  const faceImg = document.createElement('img');
  faceImg.src = FACES.sad;
  faceImg.alt = 'FakeCheck';
  faceImg.draggable = false;
  faceBtn.appendChild(faceImg);
  shadow.appendChild(faceBtn);

  // ─── Overlay Panel ────────────────────────────────────────

  const overlay = document.createElement('div');
  overlay.className = 'fc-overlay fc-hidden';

  overlay.innerHTML = `
    <button class="fc-close-btn" aria-label="Zamknij">✕</button>

    <div class="fc-header">
      <div class="fc-brand">
        <span class="fc-brand-icon">🔍</span>
        <span class="fc-brand-name">FakeCheck</span>
      </div>
      <div class="fc-subtitle">Zweryfikuj informację krok po kroku</div>
      <div class="fc-progress-wrap">
        <div class="fc-progress-bar-bg">
          <div class="fc-progress-bar-fill"></div>
        </div>
        <div class="fc-progress-label">
          <span>Postęp weryfikacji</span>
          <span class="fc-progress-score">0 / 6</span>
        </div>
      </div>
    </div>

    <div class="fc-steps">
      ${STEPS.map((s, i) => `
        <div class="fc-step" data-step-id="${s.id}">
          <div class="fc-step-header">
            <label class="fc-checkbox-wrap">
              <input type="checkbox" data-id="${s.id}">
              <span class="fc-checkmark">
                <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 7L6 10L11 4" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </label>
            <span class="fc-step-label">${i + 1}. ${s.label}</span>
            <button class="fc-expand-btn" aria-label="Rozwiń opis">▼</button>
          </div>
          <div class="fc-step-content">
            <div class="fc-step-desc">${s.desc}</div>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="fc-links-section">
      <div class="fc-links-title">Dowiedz się więcej</div>
      <a class="fc-link-card" href="https://naukasprawdza.uw.edu.pl/vademecum/#4Metody" target="_blank" rel="noopener">
        <span class="fc-link-icon">📚</span>
        Vademecum weryfikacji — Metody
      </a>
      <a class="fc-link-card" href="https://naukasprawdza.uw.edu.pl/vademecum/#MetodySIFT" target="_blank" rel="noopener">
        <span class="fc-link-icon">🔍</span>
        Metoda SIFT — Nauka Sprawdza
      </a>
    </div>

    <div class="fc-footer">
      <button class="fc-reset-btn">🔄 Resetuj wszystko</button>
      <div class="fc-footer-separator"></div>
      <div class="fc-theme-toggle-wrapper">
        <label class="fc-theme-toggle-label" title="Przełącz motyw jasny/ciemny">
          <span class="fc-theme-toggle-icon" id="fc-theme-icon">☀️</span>
          <input
            type="checkbox"
            id="fc-theme-toggle"
            class="fc-theme-toggle-input"
            aria-label="Przełącz motyw jasny/ciemny"
          />
          <span class="fc-theme-toggle-switch"></span>
        </label>
      </div>
    </div>
  `;

  shadow.appendChild(overlay);

  // ─── References ────────────────────────────────────────────

  const closeBtn = overlay.querySelector('.fc-close-btn');
  const progressFill = overlay.querySelector('.fc-progress-bar-fill');
  const progressScore = overlay.querySelector('.fc-progress-score');
  const resetBtn = overlay.querySelector('.fc-reset-btn');
  const checkboxes = overlay.querySelectorAll('.fc-step input[type="checkbox"]');
  const steps = overlay.querySelectorAll('.fc-step');
  const themeToggle = overlay.querySelector('#fc-theme-toggle');
  const themeIcon = overlay.querySelector('#fc-theme-icon');

  // ─── State ─────────────────────────────────────────────────

  let overlayVisible = false;
  let checkedState = {};
  let userSetTheme = false; // tracks if user manually chose a theme

  // ─── Theme Functions ──────────────────────────────────────

  function setTheme(theme) {
    host.setAttribute('data-theme', theme);

    if (themeToggle) {
      themeToggle.checked = (theme === 'dark');
    }
    if (themeIcon) {
      themeIcon.textContent = (theme === 'dark') ? '🌙' : '☀️';
    }
  }

  async function initializeTheme() {
    const saved = await getSavedTheme();
    if (saved) {
      userSetTheme = true;
      setTheme(saved);
    } else {
      setTheme(getSystemTheme());
    }
  }

  function observeSystemThemeChanges() {
    if (!window.matchMedia) return;
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeQuery.addEventListener('change', (e) => {
      if (!userSetTheme) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  // ─── UI Update Logic ──────────────────────────────────────

  function updateUI() {
    const score = Object.values(checkedState).filter(Boolean).length;

    // Progress bar
    const pct = (score / 6) * 100;
    progressFill.style.width = pct + '%';
    progressFill.style.backgroundColor = getProgressColor(score);
    progressScore.textContent = score + ' / 6';
    progressScore.style.color = getProgressColor(score);

    // Face image
    const faceType = getFaceForScore(score);
    const newSrc = FACES[faceType];
    if (faceImg.src !== newSrc) {
      faceImg.style.transition = 'opacity 0.25s ease';
      faceImg.style.opacity = '0';
      setTimeout(() => {
        faceImg.src = newSrc;
        faceImg.style.opacity = '1';
      }, 250);
    }

    // Glow class
    faceBtn.classList.remove('fc-glow-red', 'fc-glow-yellow', 'fc-glow-green');
    faceBtn.classList.add(getGlowClass(score));

    // Step checked states
    steps.forEach((step) => {
      const cb = step.querySelector('input[type="checkbox"]');
      if (cb.checked) {
        step.classList.add('fc-step-checked');
      } else {
        step.classList.remove('fc-step-checked');
      }
    });

    // All 6 complete → celebration!
    if (score === 6) {
      celebrateFace();
      spawnConfetti();
    }
  }

  function celebrateFace() {
    faceBtn.classList.remove('fc-celebrate');
    // Force reflow to restart animation
    void faceBtn.offsetWidth;
    faceBtn.classList.add('fc-celebrate');
    setTimeout(() => faceBtn.classList.remove('fc-celebrate'), 700);
  }

  function spawnConfetti() {
    const colors = ['#22c55e', '#2563eb', '#f59e0b', '#ef4444', '#a855f7', '#ec4899'];
    const container = document.createElement('div');
    container.className = 'fc-confetti';
    container.style.cssText = 'position:fixed; bottom:48px; right:48px; width:0; height:0;';

    for (let i = 0; i < 24; i++) {
      const piece = document.createElement('div');
      piece.className = 'fc-confetti-piece';
      const angle = (Math.PI * 2 * i) / 24;
      const dist = 40 + Math.random() * 60;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      piece.style.cssText = `
        background: ${colors[i % colors.length]};
        left: 0; top: 0;
        animation: none;
      `;
      // Custom per-piece animation
      piece.animate([
        { transform: 'translate(0, 0) rotate(0deg) scale(1)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) rotate(${360 + Math.random() * 360}deg) scale(0)`, opacity: 0 }
      ], {
        duration: 800 + Math.random() * 400,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        fill: 'forwards'
      });
      container.appendChild(piece);
    }

    shadow.appendChild(container);
    setTimeout(() => container.remove(), 1500);
  }

  // ─── Toggle Overlay ────────────────────────────────────────

  function toggleOverlay() {
    overlayVisible = !overlayVisible;
    if (overlayVisible) {
      overlay.classList.remove('fc-hidden');
      overlay.classList.add('fc-visible');
    } else {
      overlay.classList.remove('fc-visible');
      overlay.classList.add('fc-hidden');
    }
  }

  function closeOverlay() {
    overlayVisible = false;
    overlay.classList.remove('fc-visible');
    overlay.classList.add('fc-hidden');
  }

  // ─── Accordion Toggle ─────────────────────────────────────

  function toggleAccordion(stepEl) {
    const content = stepEl.querySelector('.fc-step-content');
    const expandBtn = stepEl.querySelector('.fc-expand-btn');
    const isOpen = content.style.maxHeight && content.style.maxHeight !== '0px';

    if (isOpen) {
      content.style.maxHeight = '0px';
      expandBtn.classList.remove('fc-expanded');
    } else {
      content.style.maxHeight = content.scrollHeight + 'px';
      expandBtn.classList.add('fc-expanded');
    }
  }

  // ─── Event Listeners ──────────────────────────────────────

  faceBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleOverlay();
  });

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeOverlay();
  });

  // Checkbox changes
  checkboxes.forEach((cb) => {
    cb.addEventListener('change', (e) => {
      e.stopPropagation();
      checkedState[cb.dataset.id] = cb.checked;
      saveState(checkedState);
      updateUI();
    });

    // Prevent label click from toggling accordion
    cb.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  });

  // Step header clicks for accordion (on label and expand button)
  steps.forEach((step) => {
    const expandBtn = step.querySelector('.fc-expand-btn');
    const label = step.querySelector('.fc-step-label');

    expandBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleAccordion(step);
    });

    label.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleAccordion(step);
    });
  });

  // Reset
  resetBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    checkedState = {};
    checkboxes.forEach((cb) => { cb.checked = false; });
    // Collapse all accordions
    steps.forEach((step) => {
      const content = step.querySelector('.fc-step-content');
      const expandBtn = step.querySelector('.fc-expand-btn');
      content.style.maxHeight = '0px';
      expandBtn.classList.remove('fc-expanded');
    });
    saveState(checkedState);
    updateUI();
  });

  // Theme toggle
  if (themeToggle) {
    themeToggle.addEventListener('change', (e) => {
      e.stopPropagation();
      const newTheme = e.target.checked ? 'dark' : 'light';
      userSetTheme = true;
      setTheme(newTheme);
      chrome.storage.local.set({ [THEME_STORAGE_KEY]: newTheme });
    });
  }

  // Listen for toggle messages from background
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'toggle') {
      toggleOverlay();
    }
  });

  // ─── Initialize ────────────────────────────────────────────

  // Initialize theme first so overlay renders with correct colors
  initializeTheme();
  observeSystemThemeChanges();

  loadState((state) => {
    checkedState = state;
    checkboxes.forEach((cb) => {
      if (checkedState[cb.dataset.id]) {
        cb.checked = true;
      }
    });
    updateUI();
  });

})();
