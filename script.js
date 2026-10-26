/* ==========================================================================
   MIA & Milo's Garden Learning Adventure — Logic, Navigation & Animation
   Accessible, predictable, responsive, neurodivergent-friendly interaction
   ========================================================================== */

// --- 1. APPLICATION STATE & PERSISTENCE ---
const DEFAULT_STATE = {
  currentView: 'viewHome',
  childProfile: {
    name: 'Milo',
    age: 10,
    language: 'English',
    learningFocus: 'Emotions & Patience',
    isConfigured: true // Initial profile available as shown in PDF
  },
  selectedCharacter: 'mira', // 'mira' | 'piper' | 'kai' | 'leo'
  unlockedLevels: [1],
  completedLevels: [],
  gardenStars: 2,
  sessionsCompleted: 1,
  settings: {
    voiceNarration: true,
    soundEffects: true,
    theme: 'warm',
    stimulation: 'gentle',
    sessionLength: 10
  }
};

let appState = (() => {
  try {
    const saved = localStorage.getItem('mia_adventure_state');
    if (saved) {
      return { ...DEFAULT_STATE, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('LocalStorage unavailable, using in-memory state.', e);
  }
  return { ...DEFAULT_STATE };
})();

function saveState() {
  try {
    localStorage.setItem('mia_adventure_state', JSON.stringify(appState));
  } catch (e) {
    // Ignore quota or memory storage errors
  }
}

// --- 2. AUDIO SYNTHESIZER (Gentle Web Audio Chimes) ---
class GentleAudio {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  playPop() {
    if (!appState.settings.soundEffects) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) { }
  }

  playChime() {
    if (!appState.settings.soundEffects) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.06, this.ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + i * 0.08);
        osc.stop(this.ctx.currentTime + i * 0.08 + 0.35);
      });
    } catch (e) { }
  }

  playWaterTrickle() {
    if (!appState.settings.soundEffects) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      for (let i = 0; i < 5; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600 + Math.random() * 400, this.ctx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.12 + 0.14);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + i * 0.12);
        osc.stop(this.ctx.currentTime + i * 0.12 + 0.14);
      }
    } catch (e) { }
  }

  playFanfare() {
    if (!appState.settings.soundEffects) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const chord = [392.00, 523.25, 659.25, 783.99, 1046.50]; // G4, C5, E5, G5, C6
      chord.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.09, this.ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.1 + 0.7);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.1);
        osc.stop(this.ctx.currentTime + idx * 0.1 + 0.7);
      });
    } catch (e) { }
  }
}
const sound = new GentleAudio();

// Optional Speech Synthesis
function speakLine(text) {
  if (!appState.settings.voiceNarration) return;
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Calm, gentle pace for children
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch (e) { }
  }
}

// Helper: Shorthand getElementById
const $ = (id) => document.getElementById(id);

// --- 3. CHARACTER DEFINITIONS (PDF Page 4) ---
const CHARACTERS = {
  mira: {
    id: 'mira',
    name: 'Mira',
    title: '💖 MIRA 💖',
    tag: 'Gentle & Thoughtful',
    bio: 'Ties her hair in sweet buns with pink bows and carries a little bunny friend.',
    avatar: 'assets/avatar_mira.jpg',
    figure: 'assets/char_mira.png'
  },
  piper: {
    id: 'piper',
    name: 'Piper',
    title: '🌸 PIPER 🌸',
    tag: 'Curious & Creative',
    bio: 'Wears a sweet blue beret and denim overalls, eager to discover every flower.',
    avatar: 'assets/avatar_piper.jpg',
    figure: 'assets/char_piper.png'
  },
  kai: {
    id: 'kai',
    name: 'Kai',
    title: '⭐ KAI ⭐',
    tag: 'Playful & Friendly',
    bio: 'Loves cool casual outfits, high-fives, and cheering on every tiny seed that grows.',
    avatar: 'assets/avatar_kai.jpg',
    figure: 'assets/char_kai.png'
  },
  leo: {
    id: 'leo',
    name: 'Leo',
    title: '🍃 LEO 🍃',
    tag: 'Adventurous & Patient',
    bio: 'Ready with his warm yellow hoodie and explorer backpack to explore the path.',
    avatar: 'assets/avatar_leo.jpg',
    figure: 'assets/char_leo.png'
  }
};

// --- 4. NAVIGATION & SCREEN VIEW MANAGER ---
function switchView(viewId) {
  // Clear any active dialogue timers when switching away from story
  clearDialogueTimers();

  const views = document.querySelectorAll('.screen-view');
  views.forEach((v) => v.classList.remove('active'));

  const target = $(viewId);
  if (target) {
    target.classList.add('active');
    appState.currentView = viewId;
    saveState();
  }

  // Update view-specific elements
  updateAllCharacterPresentations();
  updateLevelMapMarkers();
  updateCaregiverDashboard();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showToast(message) {
  const toast = $('gentleToast');
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  sound.playPop();
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.hidden = true;
  }, 3200);
}

// Update all references to child avatar, name, and companion
function updateAllCharacterPresentations() {
  const char = CHARACTERS[appState.selectedCharacter] || CHARACTERS.mira;
  const childName = appState.childProfile.name || 'Milo';

  // Homepage
  if ($('homeChildAvatar')) $('homeChildAvatar').src = char.avatar;
  if ($('homeChildTile')) {
    if (appState.childProfile.isConfigured) {
      $('homeChildTile').classList.remove('locked');
      $('homeChildTile').classList.add('unlocked');
      if ($('homeChildHint')) $('homeChildHint').textContent = 'Jump into your adventure ➔';
    } else {
      $('homeChildTile').classList.add('locked');
      $('homeChildTile').classList.remove('unlocked');
      if ($('homeChildHint')) $('homeChildHint').textContent = 'Caretaker unlocks this';
    }
  }

  // Caregiver Dashboard
  if ($('caregiverChildAvatar')) $('caregiverChildAvatar').src = char.avatar;
  if ($('caregiverChildName')) $('caregiverChildName').textContent = childName;
  if ($('caregiverChildMeta')) {
    const highestLevel = Math.max(...appState.unlockedLevels);
    $('caregiverChildMeta').textContent = `Age ${appState.childProfile.age} • Level ${highestLevel}`;
  }
  if ($('profileCharThumb')) $('profileCharThumb').src = char.figure;
  if ($('profileCharName')) $('profileCharName').textContent = char.name;
  if ($('profileCharDesc')) $('profileCharDesc').textContent = char.bio;

  // Character Selection Screen
  if ($('charSelectPlayerName')) $('charSelectPlayerName').textContent = childName;
  document.querySelectorAll('.char-card').forEach((card) => {
    const cardChar = card.dataset.char;
    const isSel = cardChar === appState.selectedCharacter;
    card.classList.toggle('active', isSel);
    const btn = card.querySelector('.btn-select-char');
    if (btn) {
      btn.textContent = isSel ? 'Selected ✓' : `Select ${CHARACTERS[cardChar].name}`;
      btn.className = `btn btn-select-char ${isSel ? 'btn-primary' : 'btn-soft'}`;
    }
  });

  // Level Map Nav & Marker
  if ($('mapNavCharAvatar')) $('mapNavCharAvatar').src = char.avatar;
  if ($('mapNavPlayerName')) $('mapNavPlayerName').textContent = `${char.name} & Milo`;
  if ($('mapStarsCounter')) $('mapStarsCounter').textContent = `${appState.gardenStars} Stars`;
  if ($('markerCharImg')) $('markerCharImg').src = char.figure;

  // Story Topbar & Scene
  if ($('storyCharAvatar')) $('storyCharAvatar').src = char.avatar;
  if ($('storyCompanionLabel')) $('storyCompanionLabel').textContent = `${char.name} & Milo`;
  if ($('girlBadgeImg')) $('girlBadgeImg').src = char.avatar;
  if ($('girlDialogueAvatar')) $('girlDialogueAvatar').src = char.avatar;
  if ($('girlDialogueName')) $('girlDialogueName').textContent = char.name;
  if ($('girlNameTag')) $('girlNameTag').textContent = char.name;
}

// --- 5. LEVEL MAP INTERACTION (PDF Page 5 & 6) ---
// Coordinates corresponding to stone nodes on garden_map.jpg
const LEVEL_COORDINATES = {
  1: { top: '16.2%', left: '49.5%', markerLeft: '68%' },
  2: { top: '19.3%', left: '45.5%', markerLeft: '64%' },
  3: { top: '22.4%', left: '40.5%', markerLeft: '58%' },
  4: { top: '24.5%', left: '51.5%', markerLeft: '69%' },
  5: { top: '25.2%', left: '61.2%', markerLeft: '78%' },
  6: { top: '27.5%', left: '68.5%', markerLeft: '84%' },
  7: { top: '30.5%', left: '63.8%', markerLeft: '80%' },
  8: { top: '39.5%', left: '32.5%', markerLeft: '50%' },
  9: { top: '43.5%', left: '30.5%', markerLeft: '48%' },
  10: { top: '45.8%', left: '40.2%', markerLeft: '58%' }
};

function updateLevelMapMarkers() {
  const highestLevel = Math.max(...appState.unlockedLevels);

  // Update level nodes styling
  for (let lvl = 1; lvl <= 10; lvl++) {
    const node = $(`levelNode${lvl}`);
    if (!node) continue;
    const isUnlocked = appState.unlockedLevels.includes(lvl);
    node.classList.toggle('node-unlocked', isUnlocked);
    node.classList.toggle('node-locked', !isUnlocked);
    node.classList.toggle('current', lvl === highestLevel);
  }

  // Update Character & Puppy Milo marker position (PDF Page 6)
  const coords = LEVEL_COORDINATES[highestLevel] || LEVEL_COORDINATES[1];
  const marker = $('mapPlayerMarker');
  if (marker) {
    marker.style.top = coords.top;
    marker.style.left = coords.markerLeft;
  }

  if ($('mapNavLevelStatus')) {
    if (highestLevel === 1) {
      $('mapNavLevelStatus').textContent = 'Level 1 • The Little Seed';
    } else if (highestLevel === 2) {
      $('mapNavLevelStatus').textContent = 'Level 2 • The Gentle Rain (Unlocked!)';
    } else {
      $('mapNavLevelStatus').textContent = `Level ${highestLevel} • In Progress`;
    }
  }
}

// Bind level click events
function setupLevelMapEvents() {
  for (let lvl = 1; lvl <= 10; lvl++) {
    const node = $(`levelNode${lvl}`);
    if (!node) continue;
    node.addEventListener('click', () => {
      sound.playPop();
      if (appState.unlockedLevels.includes(lvl)) {
        if (lvl === 1) {
          switchView('viewStory');
          restartStory();
        } else if (lvl === 2) {
          showToast('🌱 Level 2: The Gentle Rain is unlocked! You can replay Level 1 anytime to review patience.');
        } else {
          showToast(`Level ${lvl} is ready!`);
        }
      } else {
        showToast('🔒 Complete Level 1: The Little Seed first to unlock this gentle path!');
      }
    });
  }

  if ($('mapBackToCharBtn')) {
    $('mapBackToCharBtn').addEventListener('click', () => {
      sound.playPop();
      switchView('viewCharacterSelect');
    });
  }
  if ($('mapToCaregiverBtn')) {
    $('mapToCaregiverBtn').addEventListener('click', () => {
      sound.playPop();
      switchView('viewCaregiver');
    });
  }
}

// --- 6. CAREGIVER DASHBOARD LOGIC (PDF Page 1, 2, 3) ---
function updateCaregiverDashboard() {
  const isLevel1Done = appState.completedLevels.includes(1);
  if ($('caregiverProgressPercent')) {
    $('caregiverProgressPercent').textContent = isLevel1Done ? '100% (Completed)' : '25%';
  }
  if ($('caregiverProgressFill')) {
    $('caregiverProgressFill').style.width = isLevel1Done ? '100%' : '25%';
  }
  if ($('dashSessionsCount')) {
    $('dashSessionsCount').textContent = String(appState.sessionsCompleted);
  }
  if ($('dashStarsCount')) {
    $('dashStarsCount').textContent = String(appState.gardenStars);
  }
  if ($('activitySeedStatus')) {
    $('activitySeedStatus').textContent = isLevel1Done ? 'Completed with Care ⭐' : 'Explored with care';
  }
  if ($('unlockedLevelsCount')) {
    $('unlockedLevelsCount').textContent = `${appState.unlockedLevels.length} of 10`;
  }
}

function setupCaregiverEvents() {
  // Sidebar tabs
  const tabButtons = document.querySelectorAll('.caregiver-sidebar .nav-item');
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      sound.playPop();
      tabButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const targetTabId = btn.dataset.tab;
      document.querySelectorAll('.caregiver-tab-content').forEach((tc) => {
        tc.classList.toggle('active', tc.id === targetTabId);
      });
    });
  });

  // Top Return Home
  if ($('caregiverReturnHomeBtn')) {
    $('caregiverReturnHomeBtn').addEventListener('click', () => {
      sound.playPop();
      switchView('viewHome');
    });
  }

  // Open Child Mode Header Button
  if ($('openChildModeBtn')) {
    $('openChildModeBtn').addEventListener('click', () => {
      sound.playChime();
      switchView('viewCharacterSelect');
    });
  }

  // Save Child Profile Form
  if ($('saveProfileBtn')) {
    $('saveProfileBtn').addEventListener('click', () => {
      sound.playChime();
      const nameInput = $('inputChildName');
      const ageInput = $('inputChildAge');
      const langInput = $('inputChildLanguage');
      const focusInput = $('inputProfileFocus');

      appState.childProfile.name = (nameInput && nameInput.value.trim()) || 'Milo';
      appState.childProfile.age = (ageInput && parseInt(ageInput.value, 10)) || 10;
      appState.childProfile.language = langInput ? langInput.value : 'English';
      appState.childProfile.learningFocus = focusInput ? focusInput.value : 'Emotions & Patience';
      appState.childProfile.isConfigured = true;

      saveState();
      updateAllCharacterPresentations();

      const successMsg = $('saveSuccessMsg');
      if (successMsg) {
        successMsg.hidden = false;
        setTimeout(() => { successMsg.hidden = true; }, 3500);
      }
      showToast('✓ Profile updated! Child mode is ready on the homepage.');
    });
  }

  // Quick Action Buttons
  if ($('jumpToMapBtn')) {
    $('jumpToMapBtn').addEventListener('click', () => {
      sound.playPop();
      switchView('viewLevelMap');
    });
  }
  if ($('switchCharQuickBtn') || $('profileChangeCharBtn')) {
    const handleSwitchChar = () => {
      sound.playPop();
      switchView('viewCharacterSelect');
    };
    if ($('switchCharQuickBtn')) $('switchCharQuickBtn').addEventListener('click', handleSwitchChar);
    if ($('profileChangeCharBtn')) $('profileChangeCharBtn').addEventListener('click', handleSwitchChar);
  }
  if ($('editProfileQuickBtn')) {
    $('editProfileQuickBtn').addEventListener('click', () => {
      sound.playPop();
      if ($('navTabProfile')) $('navTabProfile').click();
    });
  }
  if ($('addChildBtn')) {
    $('addChildBtn').addEventListener('click', () => {
      sound.playPop();
      if ($('navTabProfile')) $('navTabProfile').click();
      if ($('inputChildName')) {
        $('inputChildName').value = '';
        $('inputChildName').focus();
      }
    });
  }
  if ($('recReplayStoryBtn')) {
    $('recReplayStoryBtn').addEventListener('click', () => {
      sound.playPop();
      switchView('viewStory');
      restartStory();
    });
  }
  if ($('recOpenMapBtn')) {
    $('recOpenMapBtn').addEventListener('click', () => {
      sound.playPop();
      switchView('viewLevelMap');
    });
  }
  if ($('testChimeBtn')) {
    $('testChimeBtn').addEventListener('click', () => {
      sound.playFanfare();
    });
  }
  if ($('resetProgressBtn')) {
    $('resetProgressBtn').addEventListener('click', () => {
      if (confirm('Reset your adventure stars and level progress?')) {
        appState.unlockedLevels = [1];
        appState.completedLevels = [];
        appState.gardenStars = 2;
        appState.sessionsCompleted = 1;
        saveState();
        updateLevelMapMarkers();
        updateCaregiverDashboard();
        showToast('Progress reset to Level 1.');
      }
    });
  }

  // Settings Toggles
  if ($('settingVoiceNarration')) {
    $('settingVoiceNarration').addEventListener('change', (e) => {
      appState.settings.voiceNarration = e.target.checked;
      saveState();
    });
  }
  if ($('settingSoundEffects')) {
    $('settingSoundEffects').addEventListener('change', (e) => {
      appState.settings.soundEffects = e.target.checked;
      saveState();
    });
  }
}

// --- 7. CHARACTER SELECTION LOGIC (PDF Page 4) ---
function setupCharacterSelectEvents() {
  const cards = document.querySelectorAll('.char-card');
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const charId = card.dataset.char;
      if (CHARACTERS[charId]) {
        appState.selectedCharacter = charId;
        saveState();
        sound.playPop();
        updateAllCharacterPresentations();
      }
    });
  });

  if ($('confirmCharProceedBtn')) {
    $('confirmCharProceedBtn').addEventListener('click', () => {
      sound.playChime();
      switchView('viewLevelMap');
    });
  }
  if ($('charBackToHomeBtn')) {
    $('charBackToHomeBtn').addEventListener('click', () => {
      sound.playPop();
      switchView('viewHome');
    });
  }
  if ($('charToMapDirectBtn')) {
    $('charToMapDirectBtn').addEventListener('click', () => {
      sound.playPop();
      switchView('viewLevelMap');
    });
  }
}

// --- 8. HOMEPAGE TILES LOGIC (PDF Page 1) ---
function setupHomepageEvents() {
  if ($('homeChildTile')) {
    $('homeChildTile').addEventListener('click', () => {
      sound.playPop();
      if (!appState.childProfile.isConfigured) {
        showToast('Please open Caretaker login first to set up the child profile.');
        switchView('viewCaregiver');
      } else {
        switchView('viewCharacterSelect');
      }
    });
  }

  if ($('homeCaregiverTile')) {
    $('homeCaregiverTile').addEventListener('click', () => {
      sound.playPop();
      switchView('viewCaregiver');
    });
  }

  if ($('homeThemeBtn')) {
    $('homeThemeBtn').addEventListener('click', () => {
      sound.playPop();
      document.body.classList.toggle('theme-calm');
      const isCalm = document.body.classList.contains('theme-calm');
      $('homeThemeLabel').textContent = isCalm ? 'Calm Pastel' : 'Warm Light';
    });
  }
}

// --- 9. LEVEL 1 STORY ANIMATION & DIALOGUE (Sections 3, 4, 5, 6, 7) ---

// Story Chapters Content
const story = [
  {
    eyebrow: "CHAPTER 01 • A NEW BEGINNING",
    title: "A tiny seed, a big hope",
    text: "One bright morning, the girl knelt beside Grandpa in the garden soil. With gentle hands, she placed a tiny seed into the earth. Milo sniffed the soil curiously. “Will it grow today?” she wondered.",
    caption: "A tiny beginning 🌱",
    stage: 0,
    mood: "morning",
    button: "Continue the story"
  },
  {
    eyebrow: "CHAPTER 01 • THE NEXT MORNING",
    title: "Why hasn't it grown?",
    text: "The next morning, the soil looked just the same. No sprout had appeared yet. The girl looked curious and impatient, wondering if she should dig up the soil to see what was happening. Grandpa gently invited her to pause.",
    caption: "Waiting can feel tricky 💭",
    stage: 0,
    mood: "morning",
    button: "Hear Grandpa's advice"
  },
  {
    eyebrow: "CHAPTER 01 • A HELPFUL IDEA",
    title: "Growing takes care and time",
    text: "Grandpa turned gently toward the girl and explained that seeds need care, water, sunlight, and time. “We can care for it without disturbing the earth,” he said. Milo sat quietly, listening beside them.",
    caption: "Care + patience = growth 🌱",
    stage: 0,
    mood: "day",
    button: "Help the little seed"
  }
];

// Dialogue scenes synchronized with story moments
const dialogueScenes = [
  // Scene 1: Planting the seed
  [
    {
      speaker: "girl",
      text: "Will my little seed grow today, Grandpa?"
    },
    {
      speaker: "grandpa",
      text: "Growing takes time, dear. First, let's tuck it safely in the soil."
    },
    {
      speaker: "girl",
      text: "I tucked it in! Now we wait."
    }
  ],
  // Scene 2: Waiting for growth
  [
    {
      speaker: "girl",
      text: "Good morning! Grandpa, why hasn't my seed grown yet?"
    },
    {
      speaker: "girl",
      text: "The soil looks empty... Should I dig it up to see what's happening?"
    },
    {
      speaker: "grandpa",
      text: "Waiting can feel tricky, but let's give it gentle patience."
    }
  ],
  // Scene 3: Grandpa explains
  [
    {
      speaker: "grandpa",
      text: "Seeds are asleep under the warm earth. They need four things to wake up."
    },
    {
      speaker: "grandpa",
      text: "Warm sunlight, fresh water, nourishing soil, and plenty of patience."
    },
    {
      speaker: "girl",
      text: "So even when I can't see it, my seed is working hard?"
    },
    {
      speaker: "grandpa",
      text: "That's right! Growth happens quietly. Let's help it grow together."
    }
  ],
  // Scene 4: Caring for the seed (After watering choice)
  [
    {
      speaker: "girl",
      text: "Here is a gentle drink of water for you, little seed!"
    },
    {
      speaker: "grandpa",
      text: "Look at that! With care and patience, your little seed blossomed!"
    },
    {
      speaker: "girl",
      text: "Patience really worked! Thank you, Grandpa and Milo!"
    }
  ]
];

let sceneIndex = 0;
let completed = false;
let wateringCount = 0;

// Dialogue Timers & State
let dialogueTimer = null;
let dialogueRunId = 0;
let isDialoguePaused = false;
let currentDialogueSceneNumber = 0;
let currentDialogueLineIndex = 0;

function clearDialogueTimers() {
  clearTimeout(dialogueTimer);
  dialogueRunId++;
  hideDialogue();
  isDialoguePaused = false;
  if ($('diagPauseLabel')) $('diagPauseLabel').textContent = 'Pause';
  if ($('diagPauseIcon')) $('diagPauseIcon').textContent = '⏸️';
}

function hideDialogue() {
  const gBubble = $('girlDialogue');
  const gpBubble = $('grandpaDialogue');
  const mBubble = $('miloDialogue');
  if (gBubble) gBubble.classList.remove('speaking');
  if (gpBubble) gpBubble.classList.remove('speaking');
  if (mBubble) mBubble.classList.remove('speaking');
}

function playDialogue(sceneNumber, startLine = 0) {
  clearTimeout(dialogueTimer);
  const runId = ++dialogueRunId;
  hideDialogue();
  currentDialogueSceneNumber = sceneNumber;
  currentDialogueLineIndex = startLine;

  const lines = dialogueScenes[sceneNumber];
  if (!lines || lines.length === 0) return;

  function showNextLine() {
    if (runId !== dialogueRunId || currentDialogueLineIndex >= lines.length) {
      hideDialogue();
      return;
    }
    if (isDialoguePaused) return;

    hideDialogue();

    const line = lines[currentDialogueLineIndex];
    const isGirl = line.speaker === "girl";
    const bubble = $(isGirl ? "girlDialogue" : "grandpaDialogue");
    const textElem = $(isGirl ? "girlDialogueText" : "grandpaDialogueText");

    if (textElem) {
      textElem.textContent = line.text;
    } else if (bubble) {
      bubble.textContent = line.text;
    }

    if (bubble) {
      bubble.classList.add("speaking");
      sound.playPop();
      speakLine(line.text);
    }

    // Milo reaction based on dialogue
    const miloElem = $('milo');
    if (miloElem) {
      miloElem.classList.remove('curious', 'happy', 'listening');
      if (sceneNumber === 1) miloElem.classList.add('curious');
      else if (sceneNumber === 2) miloElem.classList.add('listening');
      else if (sceneNumber === 3) miloElem.classList.add('happy');
    }

    currentDialogueLineIndex++;
    // Comfortable reading interval for neurodivergent children (3.8 seconds)
    dialogueTimer = setTimeout(showNextLine, 3800);
  }

  showNextLine();
}

function pauseOrResumeDialogue() {
  isDialoguePaused = !isDialoguePaused;
  sound.playPop();
  if (isDialoguePaused) {
    clearTimeout(dialogueTimer);
    if ($('diagPauseLabel')) $('diagPauseLabel').textContent = 'Play';
    if ($('diagPauseIcon')) $('diagPauseIcon').textContent = '▶️';
  } else {
    if ($('diagPauseLabel')) $('diagPauseLabel').textContent = 'Pause';
    if ($('diagPauseIcon')) $('diagPauseIcon').textContent = '⏸️';
    playDialogue(currentDialogueSceneNumber, currentDialogueLineIndex);
  }
}

function replayCurrentDialogue() {
  sound.playPop();
  isDialoguePaused = false;
  if ($('diagPauseLabel')) $('diagPauseLabel').textContent = 'Pause';
  if ($('diagPauseIcon')) $('diagPauseIcon').textContent = '⏸️';
  playDialogue(currentDialogueSceneNumber, 0);
}

// Show Scene Function (Preserving all original IDs)
function showScene(index) {
  sceneIndex = index;
  const scene = story[index];

  const card = $("storyCard");
  if (card) {
    card.classList.remove("scene-change");
    void card.offsetWidth;
    card.classList.add("scene-change");
  }

  if ($("eyebrow")) $("eyebrow").textContent = scene.eyebrow;
  if ($("storyTitle")) $("storyTitle").textContent = scene.title;
  if ($("storyText")) $("storyText").textContent = scene.text;
  if ($("sceneCaption")) $("sceneCaption").textContent = scene.caption;
  if ($("plantStage")) $("plantStage").dataset.stage = String(scene.stage);

  // Environmental lighting
  const garden = $("garden");
  if (garden) {
    garden.classList.toggle("morning-glow", scene.mood === "morning");
    garden.classList.toggle("evening", scene.mood === "evening");
  }

  // Progress update
  const progressPercent = Math.round(((index + 1) / 4) * 100);
  if ($("progressFill")) $("progressFill").style.width = `${progressPercent}%`;
  if ($("progressLabel")) $("progressLabel").textContent = `Step ${index + 1} of 4`;

  // Buttons & Choice area
  if ($("nextButton")) {
    $("nextButton").textContent = scene.button;
    $("nextButton").hidden = false;
  }
  if ($("choicePanel")) $("choicePanel").hidden = true;
  if ($("feedback")) $("feedback").textContent = "";
  if ($("badge")) $("badge").hidden = true;
  if ($("waterCount")) $("waterCount").textContent = `${wateringCount} / 1`;

  // Milo state
  const milo = $("milo");
  if (milo) {
    milo.classList.remove("curious", "happy", "listening");
    if (index === 1) milo.classList.add("curious");
    else if (index === 2) milo.classList.add("listening");
  }

  // Seed state
  const seed = $("seed");
  if (seed) {
    seed.style.opacity = "1";
    seed.classList.toggle("planted", index >= 0);
  }

  // Synchronize dialogue
  playDialogue(index, 0);
}

function nextScene() {
  sound.playPop();
  if (completed) {
    restartStory();
    return;
  }
  if (sceneIndex < story.length - 1) {
    showScene(sceneIndex + 1);
  } else {
    showChoices();
  }
}

function showChoices() {
  clearDialogueTimers();

  if ($("eyebrow")) $("eyebrow").textContent = "YOUR TURN • GARDEN HELPER";
  if ($("storyTitle")) $("storyTitle").textContent = "What should we do to help the seed grow?";
  if ($("storyText")) $("storyText").textContent = "There isn't a timer to beat. Think about what a little seed needs to grow, then choose what you would try.";
  if ($("sceneCaption")) $("sceneCaption").textContent = "Choose what will help the seed flourish 🌱";

  if ($("nextButton")) $("nextButton").hidden = true;
  if ($("choicePanel")) $("choicePanel").hidden = false;
  if ($("progressFill")) $("progressFill").style.width = "75%";
  if ($("progressLabel")) $("progressLabel").textContent = "Your turn";
  if ($("feedback")) $("feedback").textContent = "";
  if ($("plantStage")) $("plantStage").dataset.stage = "0";

  // Enable all choice buttons
  ["waterChoice", "waitChoice", "digChoice"].forEach((id) => {
    const btn = $(id);
    if (btn) btn.disabled = false;
  });
}

// Choice 1: Water & Time (Correct Caring Choice)
function waterPlant() {
  wateringCount = 1;
  sound.playWaterTrickle();

  // Disable buttons while animating
  ["waterChoice", "waitChoice", "digChoice"].forEach((id) => {
    const btn = $(id);
    if (btn) btn.disabled = true;
  });

  if ($("feedback")) {
    $("feedback").textContent = "Nice caring choice! The seed needs water and gentle patience to grow.";
  }
  if ($("waterCount")) $("waterCount").textContent = "1 / 1";

  // 1. Tilt watering can & start water drops stream
  const wateringCan = $("wateringCan");
  const waterStream = $("waterStream");
  if (wateringCan) wateringCan.classList.add("active");
  if (waterStream) waterStream.classList.add("pouring");

  // Play Scene 4 dialogue
  playDialogue(3, 0);

  // 2. Stage 1: Sprout emerges
  window.setTimeout(() => {
    if ($("seed")) $("seed").style.opacity = "0";
    if ($("plantStage")) $("plantStage").dataset.stage = "1";
    if ($("sceneCaption")) $("sceneCaption").textContent = "A tiny green sprout pushes through the soil! 🌱";
    sound.playPop();
  }, 1200);

  // 3. Stage 2: Small leafy plant rises
  window.setTimeout(() => {
    if ($("plantStage")) $("plantStage").dataset.stage = "2";
    if ($("sceneCaption")) $("sceneCaption").textContent = "Leaves are stretching toward the warm sunshine! ☀️";
    sound.playPop();
  }, 2200);

  // 4. Stage 3: Bushy with bud
  window.setTimeout(() => {
    if (wateringCan) wateringCan.classList.remove("active");
    if (waterStream) waterStream.classList.remove("pouring");
    if ($("plantStage")) $("plantStage").dataset.stage = "3";
    sound.playPop();
  }, 3200);

  // 5. Stage 4: Radiant Golden Flower Bloom!
  window.setTimeout(() => {
    if ($("plantStage")) $("plantStage").dataset.stage = "4";
    if ($("garden")) $("garden").classList.add("evening");
    if ($("sceneCaption")) $("sceneCaption").textContent = "Look what patience and care helped grow! 🌻";

    // Milo celebrates!
    const milo = $("milo");
    if (milo) milo.classList.add("happy");
    if ($("miloMoodText")) $("miloMoodText").textContent = "Celebrating with you! 🐕";

    sound.playFanfare();

    if ($("storyTitle")) $("storyTitle").textContent = "You helped the garden grow!";
    if ($("storyText")) {
      $("storyText").textContent = "The girl watered the soil and waited patiently. Soon, the stem stretched tall and a radiant sunflower bloomed! Grandpa smiled, and Milo wagged his tail happily. Growing takes care, patience, and love.";
    }

    if ($("feedback")) {
      $("feedback").textContent = "Story complete! You earned the Kind Gardener badge and unlocked Level 2!";
    }

    if ($("badge")) $("badge").hidden = false;
    if ($("progressFill")) $("progressFill").style.width = "100%";
    if ($("progressLabel")) $("progressLabel").textContent = "Complete! ⭐";

    // UPDATE PROGRESSION SYSTEM
    completed = true;
    if (!appState.completedLevels.includes(1)) {
      appState.completedLevels.push(1);
    }
    if (!appState.unlockedLevels.includes(2)) {
      appState.unlockedLevels.push(2);
    }
    appState.gardenStars += 3;
    appState.sessionsCompleted += 1;
    saveState();

    updateLevelMapMarkers();
    updateCaregiverDashboard();

    if ($("nextButton")) {
      $("nextButton").hidden = false;
      $("nextButton").textContent = "Play story again";
    }
  }, 4400);
}

// Choice 2: Leave without care (Supportive feedback)
function waitForGrowth() {
  sound.playPop();
  if ($("feedback")) {
    $("feedback").textContent = "Seeds need our loving attention! Just like us, a little seed gets thirsty and needs sunshine and water to grow strong. Let's try giving it gentle water!";
  }
  if ($("sceneCaption")) $("sceneCaption").textContent = "Every little seed needs water and love 💧";
}

// Choice 3: Dig up seed (Supportive non-shaming feedback)
function digSeed() {
  sound.playPop();
  if ($("feedback")) {
    $("feedback").textContent = "It's natural to be curious! But digging can hurt the delicate root before it even starts. Let's give it gentle water and time instead.";
  }
  if ($("sceneCaption")) $("sceneCaption").textContent = "Curiosity is wonderful — patience protects the seed 🌰";
}

function restartStory() {
  clearDialogueTimers();
  completed = false;
  wateringCount = 0;

  if ($("seed")) {
    $("seed").style.opacity = "1";
    $("seed").classList.remove("planted");
  }
  if ($("badge")) $("badge").hidden = true;
  if ($("garden")) $("garden").classList.remove("evening", "morning-glow");
  if ($("plantStage")) $("plantStage").dataset.stage = "0";

  const wateringCan = $("wateringCan");
  const waterStream = $("waterStream");
  if (wateringCan) wateringCan.classList.remove("active");
  if (waterStream) waterStream.classList.remove("pouring");

  const milo = $("milo");
  if (milo) milo.classList.remove("happy", "curious", "listening");
  if ($("miloMoodText")) $("miloMoodText").textContent = "Happy to be with you";

  showScene(0);
}

// Create decorative fireflies for evening atmosphere
function createFireflies() {
  const garden = $("garden");
  if (!garden) return;
  for (let i = 0; i < 8; i++) {
    const fly = document.createElement("span");
    fly.className = "firefly";
    fly.setAttribute("aria-hidden", "true");
    fly.style.left = `${12 + ((i * 13) % 76)}%`;
    fly.style.top = `${18 + ((i * 17) % 45)}%`;
    fly.style.animationDelay = `${i * -0.5}s`;
    garden.appendChild(fly);
  }
}

// --- 10. SETUP & INITIALIZATION ---
function setupStoryEvents() {
  if ($("nextButton")) $("nextButton").addEventListener("click", nextScene);
  if ($("restartButton")) $("restartButton").addEventListener("click", restartStory);
  if ($("waterChoice")) $("waterChoice").addEventListener("click", waterPlant);
  if ($("waitChoice")) $("waitChoice").addEventListener("click", waitForGrowth);
  if ($("digChoice")) $("digChoice").addEventListener("click", digSeed);

  if ($("storyBackToMapBtn")) {
    $("storyBackToMapBtn").addEventListener("click", () => {
      sound.playPop();
      switchView("viewLevelMap");
    });
  }
  if ($("storyMapReturnBtn")) {
    $("storyMapReturnBtn").addEventListener("click", () => {
      sound.playPop();
      switchView("viewLevelMap");
    });
  }
  if ($("badgeToMapBtn")) {
    $("badgeToMapBtn").addEventListener("click", () => {
      sound.playChime();
      switchView("viewLevelMap");
    });
  }

  // Dialogue Controls
  if ($("diagPauseBtn")) $("diagPauseBtn").addEventListener("click", pauseOrResumeDialogue);
  if ($("diagReplayBtn")) $("diagReplayBtn").addEventListener("click", replayCurrentDialogue);

  // Audio Toggle in Story Topbar
  if ($("storyAudioToggleBtn")) {
    $("storyAudioToggleBtn").addEventListener("click", () => {
      appState.settings.soundEffects = !appState.settings.soundEffects;
      appState.settings.voiceNarration = appState.settings.soundEffects;
      saveState();
      sound.playPop();
      const icon = $("storyAudioIcon");
      if (icon) icon.textContent = appState.settings.soundEffects ? '🔔' : '🔕';
      showToast(appState.settings.soundEffects ? 'Audio effects & narration enabled' : 'Audio muted');
    });
  }
}

// Document Ready Initialization
document.addEventListener("DOMContentLoaded", () => {
  setupHomepageEvents();
  setupCaregiverEvents();
  setupCharacterSelectEvents();
  setupLevelMapEvents();
  setupStoryEvents();
  createFireflies();

  // Initial presentation sync
  updateAllCharacterPresentations();
  updateLevelMapMarkers();
  updateCaregiverDashboard();

  // Initial view is Homepage
  switchView('viewHome');
  console.log("MIA & Milo's Garden Adventure ready.");
});
