/* ==========================================================================
   MILO: Your Learning Adventure — Logic, Navigation & Story Progression
   Storybook flow, responsive pacing & animated companion interactions
   ========================================================================== */

// --- 1. APPLICATION STATE & PERSISTENCE ---
const DEFAULT_STATE = {
  currentView: 'viewHome',
  childProfile: {
    name: 'Chutki',
    age: 5,
    hasProfile: true
  },
  selectedCharacter: 'chutki', // 'chutki' | 'mia' | 'levi' | 'ash'
  unlockedLevels: [1],
  completedLevels: [],
  gardenStars: 2,
  sessionsCompleted: 1,
  settings: {
    sound: 'soft',
    visual: 'minimal',
    sessionLength: 5,
    learningStyle: 'both'
  }
};

let appState = (() => {
  try {
    const saved = localStorage.getItem('milo_learning_state_v2');
    if (saved) {
      return { ...DEFAULT_STATE, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('LocalStorage unavailable, using default state.', e);
  }
  return { ...DEFAULT_STATE };
})();

function saveState() {
  try {
    localStorage.setItem('milo_learning_state_v2', JSON.stringify(appState));
  } catch (e) { }
}

// --- 2. GENTLE WEB AUDIO SYNTHESIZER ---
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
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch (e) { }
  }

  playWater() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      for (let i = 0; i < 4; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600 + Math.random() * 300, this.ctx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.06, this.ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.12 + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + i * 0.12);
        osc.stop(this.ctx.currentTime + i * 0.12 + 0.12);
      }
    } catch (e) { }
  }

  playFanfare() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const chord = [392.00, 523.25, 659.25, 783.99, 1046.50]; // G4, C5, E5, G5, C6
      chord.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.09);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.09 + 0.6);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.09);
        osc.stop(this.ctx.currentTime + idx * 0.09 + 0.6);
      });
    } catch (e) { }
  }

  playChime() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + i * 0.08);
        osc.stop(this.ctx.currentTime + i * 0.08 + 0.3);
      });
    } catch (e) { }
  }
}
const sound = new GentleAudio();

const $ = (id) => document.getElementById(id);

// --- 3. CHARACTER DEFINITIONS: CHUTKI, MIA, LEVI, ASH ---
const CHARACTERS = {
  chutki: {
    id: 'chutki',
    name: 'Chutki',
    tag: 'Curious & Nature Lover',
    bio: 'Wears her blue beret & overalls, loves tucking seeds into warm soil.',
    figure: 'assets/char_chutki.png',
    avatar: 'assets/char_chutki.png'
  },
  mia: {
    id: 'mia',
    name: 'Mia',
    tag: 'Gentle & Creative',
    bio: 'Cozy lavender sweater with bunny pouch, loves sunny colors and kindness.',
    figure: 'assets/char_mia.png',
    avatar: 'assets/char_mia.png'
  },
  levi: {
    id: 'levi',
    name: 'Levi',
    tag: 'Energetic Explorer',
    bio: 'Sunny yellow hoodie and bright smile, eager to explore every secret garden path.',
    figure: 'assets/char_levi.png',
    avatar: 'assets/char_levi.png'
  },
  ash: {
    id: 'ash',
    name: 'Ash',
    tag: 'Clever & Patient',
    bio: 'Comfy casual style, loves solving puzzles, listening to birds, and steady steps.',
    figure: 'assets/char_ash.png',
    avatar: 'assets/char_ash.png'
  }
};

// --- 4. TOAST NOTIFICATION ---
function showToast(message) {
  const toast = $('gentleToast');
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  sound.playPop();
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.hidden = true;
  }, 2800);
}

// --- 5. VIEW NAVIGATION ---
function switchView(viewId) {
  const views = document.querySelectorAll('.screen-view');
  views.forEach((v) => v.classList.remove('active'));

  const target = $(viewId);
  if (target) {
    target.classList.add('active');
    appState.currentView = viewId;
    saveState();
  }

  // Update synchronized components
  updateCharacterPresentations();
  updateMapMarkers();
  updateCaregiverDashboard();
}

// --- 6. SYNCHRONIZE CHARACTER PRESENTATIONS ---
function updateCharacterPresentations() {
  const char = CHARACTERS[appState.selectedCharacter] || CHARACTERS.chutki;
  const childName = appState.childProfile.name || char.name;

  // Homepage
  if ($('homeChildTitle')) {
    $('homeChildTitle').textContent = appState.childProfile.hasProfile
      ? 'Continue adventure'
      : 'Start adventure';
  }
  if ($('homeChildDesc')) {
    $('homeChildDesc').textContent = appState.childProfile.hasProfile
      ? `Ready to explore, ${childName}!`
      : 'Choose your character and explore';
  }
  if ($('homeChildIconWrap')) {
    if (appState.childProfile.hasProfile) {
      $('homeChildIconWrap').innerHTML = `<img src="${char.avatar}" alt="${char.name}" class="home-tile-avatar-pic">`;
    } else {
      $('homeChildIconWrap').innerHTML = `<span class="tile-icon">🌻</span>`;
    }
  }

  // Caregiver Dashboard
  if ($('dashChildAvatarImg')) $('dashChildAvatarImg').src = char.avatar;
  if ($('dashChildName')) $('dashChildName').textContent = childName;
  if ($('dashCompanionName')) $('dashCompanionName').textContent = `${char.name} & Milo`;
  if ($('dashChildMeta')) {
    $('dashChildMeta').innerHTML = `Age ${appState.childProfile.age} · Little Explorer · Companion: <strong>${char.name} & Milo</strong>`;
  }
  if ($('caregiverInputName')) $('caregiverInputName').value = childName;
  if ($('caregiverInputAge')) $('caregiverInputAge').value = String(appState.childProfile.age);

  // Sync mini companion pills in caregiver form
  document.querySelectorAll('.mini-char-pill').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.char === appState.selectedCharacter);
  });

  // Character Selection Screen
  if ($('charPlayerBadgeName')) $('charPlayerBadgeName').textContent = childName;
  document.querySelectorAll('.char-card-compact').forEach((card) => {
    const isSel = card.dataset.char === appState.selectedCharacter;
    card.classList.toggle('active', isSel);
    const pill = card.querySelector('.btn-select-pill');
    if (pill) {
      pill.textContent = isSel ? 'Selected ✓' : `Choose ${CHARACTERS[card.dataset.char].name}`;
      pill.className = `btn-select-pill ${isSel ? 'selected' : ''}`;
    }
  });

  // Level Map
  if ($('mapNavCharImg')) $('mapNavCharImg').src = char.avatar;
  if ($('mapNavTitleText')) $('mapNavTitleText').textContent = `${char.name} & Milo`;
  if ($('markerHeroImg')) $('markerHeroImg').src = char.figure;
  if ($('mapStarCounter')) $('mapStarCounter').textContent = `${appState.gardenStars} Stars`;

  // Story Level 1
  if ($('storyHeaderCharAvatar')) $('storyHeaderCharAvatar').src = char.avatar;
  if ($('storyHeaderTeamName')) $('storyHeaderTeamName').textContent = `${char.name} & Milo`;
  if ($('stageChildImg')) $('stageChildImg').src = char.figure;
  if ($('stageChildLabel')) $('stageChildLabel').textContent = char.name;
  if ($('childBubbleSpeaker')) $('childBubbleSpeaker').textContent = char.name;
  if ($('unlockModalCharFigure')) $('unlockModalCharFigure').src = char.figure;

  // Story Level 2
  if ($('l2HeaderCharAvatar')) $('l2HeaderCharAvatar').src = char.avatar;
  if ($('l2HeaderTeamName')) $('l2HeaderTeamName').textContent = `${char.name} & Milo`;
  if ($('l2ChildImg')) $('l2ChildImg').src = char.figure;
  if ($('l2ChildLabel')) $('l2ChildLabel').textContent = char.name;
}

// --- 7. CAREGIVER DASHBOARD SYNC ---
function updateCaregiverDashboard() {
  const highestLevel = Math.max(...appState.unlockedLevels);
  const isL1Done = appState.completedLevels.includes(1);
  const isL2Unlocked = appState.unlockedLevels.includes(2);

  if ($('dashProgressFill')) {
    const pct = isL1Done ? (isL2Unlocked ? 65 : 45) : 25;
    $('dashProgressFill').style.width = `${pct}%`;
  }
  if ($('dashLevelStatusText')) {
    $('dashLevelStatusText').textContent = isL1Done
      ? 'Level 1 Completed • Level 2 Unlocked'
      : 'Level 1: The Little Seed in progress';
  }
  if ($('dashStarsBadge')) {
    $('dashStarsBadge').textContent = `⭐ ${appState.gardenStars} Garden Stars`;
  }

  // Milestone badges
  if ($('statBadgeL1')) {
    $('statBadgeL1').className = isL1Done ? 'stat-badge completed' : 'stat-badge in-progress';
    $('statBadgeL1').textContent = isL1Done ? 'Completed ⭐' : 'In Progress ⏳';
  }
  if ($('statBadgeL2')) {
    $('statBadgeL2').className = isL2Unlocked ? 'stat-badge unlocked' : 'stat-badge locked';
    $('statBadgeL2').textContent = isL2Unlocked ? 'Unlocked ➔' : 'Locked 🔒';
  }
}

// --- 8. MAP NODES & MARKER POSITIONING ---
function updateMapMarkers() {
  const highestUnlocked = Math.max(...appState.unlockedLevels);

  for (let i = 1; i <= 10; i++) {
    const node = $(`mapNode${i}`);
    if (!node) continue;
    const isUnlocked = appState.unlockedLevels.includes(i);
    const isCurrent = (i === highestUnlocked);

    node.classList.toggle('unlocked', isUnlocked);
    node.classList.toggle('locked', !isUnlocked);
    node.classList.toggle('current', isCurrent);
  }

  // Move walking duo marker to the active level node
  const currentNode = $(`mapNode${highestUnlocked}`);
  const marker = $('mapTravelMarker');
  if (currentNode && marker) {
    const topPct = parseFloat(currentNode.style.top) || 17;
    const leftPct = parseFloat(currentNode.style.left) || 49.5;
    marker.style.top = `${topPct}%`;
    marker.style.left = `${leftPct + 16}%`;
  }
}

// --- 9. STORY SCENE LEVEL 1 LOGIC ---
const STORY_STEPS = [
  {
    step: 1,
    progress: '25%',
    progressText: 'Step 1 of 4',
    eyebrow: 'CHAPTER 01 • A NEW BEGINNING',
    headline: 'A tiny seed, a big hope',
    paragraph: 'One bright morning, you held a tiny seed in your hand. Puppy Milo sniffed the warm garden soil with curious little barks! “Will our little seed grow today, Grandpa?” you wondered softly.',
    childText: 'Will my little seed grow today, Grandpa?',
    grandpaText: 'Let\'s give it time, dear. First, let\'s tuck it safely in the soil.',
    miloText: 'Woof! Sniff sniff! Good garden soil! 🌱',
    stage: 0,
    hasChoice: false
  },
  {
    step: 2,
    progress: '50%',
    progressText: 'Step 2 of 4',
    eyebrow: 'CHAPTER 01 • RESTING IN THE EARTH',
    headline: 'Tucked gently into the soil',
    paragraph: 'You gently pressed the seed down and covered it with a blanket of soft earth. Milo sat faithfully beside you, wagging his tail. Grandpa smiled warmly: “Now comes the gentle part — patience.”',
    childText: 'I tucked it in gently so it stays cozy!',
    grandpaText: 'Wonderful. Seeds sleep quietly beneath the earth before they wake.',
    miloText: 'Woof! I\'ll sit right here and watch over it! 🐾',
    stage: 0,
    hasChoice: false
  },
  {
    step: 3,
    progress: '75%',
    progressText: 'Step 3 of 4',
    eyebrow: 'CHAPTER 01 • WHAT A SEED NEEDS',
    headline: 'What should we do next?',
    paragraph: 'There is no rush and no countdown timer. Look closely at the resting seed. Think about what a tiny living thing needs to feel loved and begin stretching upward.',
    childText: 'What should we give our little seed next?',
    grandpaText: 'Think about what plants love most: water, sunshine, and gentle care.',
    miloText: 'Woof! My nose says it might be thirsty! 💧',
    stage: 0,
    hasChoice: true
  }
];

let currentStoryStep = 0;

function renderStoryStep(index) {
  currentStoryStep = index;
  const s = STORY_STEPS[index];
  if (!s) return;

  if ($('storyProgressBar')) $('storyProgressBar').style.width = s.progress;
  if ($('storyStepText')) $('storyStepText').textContent = s.progressText;
  if ($('storyChapterEyebrow')) $('storyChapterEyebrow').textContent = s.eyebrow;
  if ($('storyHeadline')) $('storyHeadline').textContent = s.headline;
  if ($('storyParagraph')) $('storyParagraph').textContent = s.paragraph;

  if ($('childBubbleText')) $('childBubbleText').textContent = s.childText;
  if ($('grandpaBubbleText')) $('grandpaBubbleText').textContent = s.grandpaText;
  if ($('miloBubbleText')) $('miloBubbleText').textContent = s.miloText;

  // Milo animation
  const miloImg = $('stageMiloImg');
  if (miloImg) {
    miloImg.classList.remove('happy');
    if (index === 2) miloImg.classList.add('happy');
  }

  if (s.hasChoice) {
    if ($('storyContinueBtn')) $('storyContinueBtn').hidden = true;
    if ($('storyChoicePanel')) $('storyChoicePanel').hidden = false;
    if ($('choiceFeedbackText')) $('choiceFeedbackText').textContent = '';
  } else {
    if ($('storyContinueBtn')) {
      $('storyContinueBtn').hidden = false;
      $('storyContinueBtn').textContent = 'Continue story →';
    }
    if ($('storyChoicePanel')) $('storyChoicePanel').hidden = true;
  }
}

function handleWaterChoice() {
  sound.playWater();
  const feedback = $('choiceFeedbackText');
  if (feedback) {
    feedback.textContent = 'Wonderful caring choice! Gentle water awakens the sleeping seed! 💧';
  }

  // Animate watering can pouring water
  const can = $('wateringCanAnim');
  const stream = $('rainStream');
  if (can) can.classList.add('pouring');
  if (stream) stream.classList.add('active');

  // Disable choice buttons during animation
  ['choiceWaterBtn', 'choiceDigBtn', 'choiceWaitBtn'].forEach(id => {
    if ($(id)) $(id).disabled = true;
  });

  // Stage 1: Sprout emerges after 1.2s
  setTimeout(() => {
    if ($('plantGrowthSystem')) $('plantGrowthSystem').dataset.stage = '1';
    if ($('goldenSeed')) $('goldenSeed').style.opacity = '0';
    if ($('miloBubbleText')) $('miloBubbleText').textContent = 'Woof! Look, a tiny green sprout! 🌱';
    sound.playPop();
  }, 1200);

  // Stage 2: Small stem & leaves after 2.4s
  setTimeout(() => {
    if ($('plantGrowthSystem')) $('plantGrowthSystem').dataset.stage = '2';
    if ($('grandpaBubbleText')) $('grandpaBubbleText').textContent = 'It loves your water! It\'s growing strong!';
    sound.playPop();
  }, 2400);

  // Stage 3: Growing taller after 3.6s
  setTimeout(() => {
    if (can) can.classList.remove('pouring');
    if (stream) stream.classList.remove('active');
    if ($('plantGrowthSystem')) $('plantGrowthSystem').dataset.stage = '3';
    sound.playPop();
  }, 3600);

  // Stage 4: Sunflower Blooms & Celebration Modal triggers after 4.8s
  setTimeout(() => {
    if ($('plantGrowthSystem')) $('plantGrowthSystem').dataset.stage = '4';
    if ($('stageMilo')) $('stageMilo').classList.add('happy');
    if ($('miloBubbleText')) $('miloBubbleText').textContent = 'Bark bark! The sunflower bloomed! 🌻✨';
    if ($('childBubbleText')) $('childBubbleText').textContent = 'We did it, Milo! It\'s beautiful!';
    sound.playFanfare();

    // Mark Level 1 Complete and Level 2 Unlocked
    if (!appState.completedLevels.includes(1)) appState.completedLevels.push(1);
    if (!appState.unlockedLevels.includes(2)) appState.unlockedLevels.push(2);
    appState.gardenStars += 3;
    appState.sessionsCompleted += 1;
    saveState();

    updateCaregiverDashboard();
    updateMapMarkers();

    // Story-based level unlock tile card popup!
    setTimeout(() => {
      openLevelUnlockModal();
    }, 1200);
  }, 4800);
}

function handleDigChoice() {
  sound.playPop();
  const feedback = $('choiceFeedbackText');
  if (feedback) {
    feedback.textContent = 'It\'s natural to be curious! But digging can hurt delicate little roots. Let\'s give it gentle water instead!';
  }
}

function handleWaitChoice() {
  sound.playPop();
  const feedback = $('choiceFeedbackText');
  if (feedback) {
    feedback.textContent = 'Patience is wonderful, but every sprout gets thirsty! Let\'s give it some fresh water!';
  }
}

function restartLevel1() {
  ['choiceWaterBtn', 'choiceDigBtn', 'choiceWaitBtn'].forEach(id => {
    if ($(id)) $(id).disabled = false;
  });
  if ($('plantGrowthSystem')) $('plantGrowthSystem').dataset.stage = '0';
  if ($('goldenSeed')) $('goldenSeed').style.opacity = '1';
  if ($('wateringCanAnim')) $('wateringCanAnim').classList.remove('pouring');
  if ($('rainStream')) $('rainStream').classList.remove('active');
  if ($('stageMilo')) $('stageMilo').classList.remove('happy');
  renderStoryStep(0);
}

// --- 10. STORY UNLOCK MODAL (Level 2 Tile Card Unlocked) ---
function openLevelUnlockModal() {
  const modal = $('storyUnlockModal');
  if (!modal) return;
  modal.hidden = false;
  sound.playFanfare();
}

function closeLevelUnlockModal() {
  const modal = $('storyUnlockModal');
  if (modal) modal.hidden = true;
}

// --- 11. LEVEL 2 INTERACTION (Gentle Rain & Meadow Butterflies) ---
let l2ButterfliesLanded = 0;
let l2DewdropsCollected = 0;

function resetLevel2() {
  l2ButterfliesLanded = 0;
  l2DewdropsCollected = 0;

  ['butterfly1', 'butterfly2', 'butterfly3'].forEach(id => {
    const el = $(id);
    if (el) el.classList.remove('landed');
  });

  ['dewdrop1', 'dewdrop2'].forEach(id => {
    const el = $(id);
    if (el) el.classList.remove('collected');
  });

  if ($('taskBfCheck')) $('taskBfCheck').textContent = '⬜';
  if ($('taskBfText')) $('taskBfText').textContent = 'Guide 3 butterflies to flowers (0/3)';
  if ($('taskDewCheck')) $('taskDewCheck').textContent = '⬜';
  if ($('taskDewText')) $('taskDewText').textContent = 'Collect morning dewdrops (0/2)';
  if ($('l2CompleteBtn')) $('l2CompleteBtn').hidden = true;
  if ($('l2MiloSpeech')) $('l2MiloSpeech').textContent = '"Woof! Look at the butterflies dancing in the rain! Tap them to guide them to flowers!"';
}

function handleButterflyClick(btn) {
  if (btn.classList.contains('landed')) return;
  sound.playChime();
  btn.classList.add('landed');
  l2ButterfliesLanded++;

  if ($('taskBfText')) $('taskBfText').textContent = `Guide 3 butterflies to flowers (${l2ButterfliesLanded}/3)`;

  if ($('l2MiloSpeech')) {
    const lines = [
      '"Woof! The blue butterfly found a sunny blossom!" 🦋',
      '"High-paw! Another gentle butterfly is safe and dry!" 🌸',
      '"Amazing! All meadow butterflies are happily resting!" 🌻✨'
    ];
    $('l2MiloSpeech').textContent = lines[l2ButterfliesLanded - 1] || lines[0];
  }

  if (l2ButterfliesLanded >= 3) {
    if ($('taskBfCheck')) $('taskBfCheck').textContent = '✅';
    checkLevel2Completion();
  }
}

function handleDewdropClick(btn) {
  if (btn.classList.contains('collected')) return;
  sound.playPop();
  btn.classList.add('collected');
  l2DewdropsCollected++;

  if ($('taskDewText')) $('taskDewText').textContent = `Collect morning dewdrops (${l2DewdropsCollected}/2)`;

  if (l2DewdropsCollected >= 2) {
    if ($('taskDewCheck')) $('taskDewCheck').textContent = '✅';
    checkLevel2Completion();
  }
}

function checkLevel2Completion() {
  if (l2ButterfliesLanded >= 3 && l2DewdropsCollected >= 2) {
    if ($('l2CompleteBtn')) $('l2CompleteBtn').hidden = false;
    sound.playFanfare();
    showToast('🌟 Chapter 2 Complete! You unlocked Level 3 on the Map!');

    if (!appState.completedLevels.includes(2)) appState.completedLevels.push(2);
    if (!appState.unlockedLevels.includes(3)) appState.unlockedLevels.push(3);
    appState.gardenStars += 3;
    saveState();
    updateMapMarkers();
    updateCaregiverDashboard();
  }
}

// --- 12. EVENT LISTENERS & SETUP ---
document.addEventListener('DOMContentLoaded', () => {

  // --- BRAND / HOMEPAGE NAVIGATION ---
  if ($('brandHomeBtn')) $('brandHomeBtn').addEventListener('click', () => switchView('viewHome'));
  if ($('caregiverBrandHomeBtn')) $('caregiverBrandHomeBtn').addEventListener('click', () => switchView('viewHome'));
  if ($('caregiverReturnHomeBtn')) $('caregiverReturnHomeBtn').addEventListener('click', () => switchView('viewHome'));

  // HOMEPAGE TILES
  if ($('homeChildTile')) {
    $('homeChildTile').addEventListener('click', () => {
      sound.playPop();
      if (appState.childProfile.hasProfile) {
        switchView('viewCharacterSelect');
      } else {
        if ($('profileModalBackdrop')) $('profileModalBackdrop').hidden = false;
      }
    });
  }

  if ($('homeCaregiverTile')) {
    $('homeCaregiverTile').addEventListener('click', () => {
      sound.playPop();
      switchView('viewCaregiver');
    });
  }

  // PROFILE MODAL
  if ($('closeProfileModalBtn')) {
    $('closeProfileModalBtn').addEventListener('click', () => {
      if ($('profileModalBackdrop')) $('profileModalBackdrop').hidden = true;
    });
  }

  if ($('homeProfileForm')) {
    $('homeProfileForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('homeChildNameInput').value.trim() || 'Chutki';
      const age = parseInt($('homeChildAgeSelect').value, 10) || 5;

      appState.childProfile.name = name;
      appState.childProfile.age = age;
      appState.childProfile.hasProfile = true;
      saveState();

      if ($('profileModalBackdrop')) $('profileModalBackdrop').hidden = true;
      showToast(`Welcome, ${name}! Now pick your character friend.`);
      switchView('viewCharacterSelect');
    });
  }

  // CAREGIVER SIDEBAR TABS
  document.querySelectorAll('.sidebar-link[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      sound.playPop();
      document.querySelectorAll('.sidebar-link').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const targetTab = btn.dataset.tab;
      document.querySelectorAll('.caregiver-tab-panel').forEach((panel) => {
        panel.classList.toggle('active', panel.id === targetTab);
      });
    });
  });

  if ($('caregiverLaunchGameBtn')) {
    $('caregiverLaunchGameBtn').addEventListener('click', () => {
      sound.playPop();
      switchView('viewLevelMap');
    });
  }

  if ($('caregiverAddChildBtn')) {
    $('caregiverAddChildBtn').addEventListener('click', () => {
      if ($('profileModalBackdrop')) $('profileModalBackdrop').hidden = false;
    });
  }

  if ($('dashEditProfileBtn')) {
    $('dashEditProfileBtn').addEventListener('click', () => {
      const profileTabBtn = $('sideNavProfile');
      if (profileTabBtn) profileTabBtn.click();
    });
  }

  if ($('dashPlayDirectBtn')) {
    $('dashPlayDirectBtn').addEventListener('click', () => {
      switchView('viewLevelMap');
    });
  }

  // Mini character picker in caregiver profile tab
  document.querySelectorAll('.mini-char-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      sound.playPop();
      const charKey = pill.dataset.char;
      if (CHARACTERS[charKey]) {
        appState.selectedCharacter = charKey;
        saveState();
        updateCharacterPresentations();
      }
    });
  });

  if ($('saveCaregiverProfileBtn')) {
    $('saveCaregiverProfileBtn').addEventListener('click', () => {
      const name = $('caregiverInputName').value.trim() || 'Chutki';
      const age = parseInt($('caregiverInputAge').value, 10) || 5;
      appState.childProfile.name = name;
      appState.childProfile.age = age;
      saveState();
      updateCharacterPresentations();
      showToast('✓ Profile updated successfully!');
    });
  }

  if ($('chooseCharFromProfileBtn')) {
    $('chooseCharFromProfileBtn').addEventListener('click', () => {
      switchView('viewCharacterSelect');
    });
  }

  // CHARACTER SELECTION PAGE (Chutki, Mia, Levi, Ash)
  if ($('charBackToHomeBtn')) $('charBackToHomeBtn').addEventListener('click', () => switchView('viewHome'));
  if ($('charDirectToMapBtn')) $('charDirectToMapBtn').addEventListener('click', () => switchView('viewLevelMap'));
  if ($('confirmCharToMapBtn')) $('confirmCharToMapBtn').addEventListener('click', () => switchView('viewLevelMap'));

  document.querySelectorAll('.char-card-compact').forEach((card) => {
    card.addEventListener('click', () => {
      const charKey = card.dataset.char;
      if (CHARACTERS[charKey]) {
        appState.selectedCharacter = charKey;
        saveState();
        sound.playPop();
        updateCharacterPresentations();

        // Milo speech feedback
        const speech = $('miloCharSpeech');
        if (speech) {
          const miloRemarks = {
            chutki: '"Woof! Chutki is so kind and loves planting seeds! Let\'s go explore!" 🌸',
            mia: '"Woof! Mia has the softest heart and the cutest bunny pouch! I\'m ready!" 💖',
            levi: '"Woof! Levi is so fast and cheerful! Let\'s run through the garden path!" ☀️',
            ash: '"Woof! Ash is steady and super clever with nature puzzles! Let\'s solve them!" ⭐'
          };
          speech.textContent = miloRemarks[charKey] || '"Woof! Great choice! I will stay right by your side!"';
        }
      }
    });
  });

  // MAP SCREEN
  if ($('mapBackToCharsBtn')) $('mapBackToCharsBtn').addEventListener('click', () => switchView('viewCharacterSelect'));
  if ($('mapToCaregiverBtn')) $('mapToCaregiverBtn').addEventListener('click', () => switchView('viewCaregiver'));

  if ($('mapNode1')) {
    $('mapNode1').addEventListener('click', () => {
      sound.playPop();
      restartLevel1();
      switchView('viewStory');
    });
  }

  if ($('mapNode2')) {
    $('mapNode2').addEventListener('click', () => {
      if (appState.unlockedLevels.includes(2)) {
        sound.playPop();
        resetLevel2();
        switchView('viewLevel2');
      } else {
        showToast('🔒 Complete Level 1 to unlock Chapter 2!');
      }
    });
  }

  for (let i = 3; i <= 10; i++) {
    const node = $(`mapNode${i}`);
    if (node) {
      node.addEventListener('click', () => {
        showToast(`🔒 Level ${i} is locked. Keep playing through the story!`);
      });
    }
  }

  // LEVEL 1 STORY CONTROLS
  if ($('storyBackToMapBtn')) $('storyBackToMapBtn').addEventListener('click', () => switchView('viewLevelMap'));

  if ($('storyContinueBtn')) {
    $('storyContinueBtn').addEventListener('click', () => {
      sound.playPop();
      if (currentStoryStep < STORY_STEPS.length - 1) {
        renderStoryStep(currentStoryStep + 1);
      }
    });
  }

  if ($('storyReplayBtn')) $('storyReplayBtn').addEventListener('click', () => {
    sound.playPop();
    restartLevel1();
  });

  // Level 1 Caring Choices
  if ($('choiceWaterBtn')) $('choiceWaterBtn').addEventListener('click', handleWaterChoice);
  if ($('choiceDigBtn')) $('choiceDigBtn').addEventListener('click', handleDigChoice);
  if ($('choiceWaitBtn')) $('choiceWaitBtn').addEventListener('click', handleWaitChoice);

  // Milo click reaction in Level 1
  if ($('stageMilo')) {
    $('stageMilo').addEventListener('click', () => {
      sound.playPop();
      const bubble = $('miloBubble');
      if (bubble) {
        bubble.hidden = !bubble.hidden;
      }
    });
  }

  // LEVEL UNLOCKED MODAL ACTIONS
  if ($('unlockPlayLevel2Btn')) {
    $('unlockPlayLevel2Btn').addEventListener('click', () => {
      closeLevelUnlockModal();
      sound.playFanfare();
      resetLevel2();
      switchView('viewLevel2');
    });
  }

  if ($('unlockBackToMapLink')) {
    $('unlockBackToMapLink').addEventListener('click', () => {
      closeLevelUnlockModal();
      switchView('viewLevelMap');
    });
  }

  // LEVEL 2 MEADOW BUTTERFLIES CONTROLS
  if ($('l2BackToMapBtn')) $('l2BackToMapBtn').addEventListener('click', () => switchView('viewLevelMap'));
  if ($('l2MapBtn')) $('l2MapBtn').addEventListener('click', () => switchView('viewLevelMap'));

  ['butterfly1', 'butterfly2', 'butterfly3'].forEach(id => {
    const b = $(id);
    if (b) b.addEventListener('click', () => handleButterflyClick(b));
  });

  ['dewdrop1', 'dewdrop2'].forEach(id => {
    const d = $(id);
    if (d) d.addEventListener('click', () => handleDewdropClick(d));
  });

  if ($('l2CompleteBtn')) {
    $('l2CompleteBtn').addEventListener('click', () => {
      sound.playFanfare();
      showToast('🎉 You completed Chapter 2! Returning to Story Map.');
      switchView('viewLevelMap');
    });
  }

  // INITIALIZE FIRST RENDER
  renderStoryStep(0);
  switchView(appState.currentView || 'viewHome');
});
