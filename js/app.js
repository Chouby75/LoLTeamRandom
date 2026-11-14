/**
 * ============================================================================
 * LOGIQUE PRINCIPALE — CREATE TEAM LOL (HEXTECH TEAM BUILDER)
 * ============================================================================
 */

const STORAGE_KEY_ROSTER = "lol_team_builder_roster_v2";
const STORAGE_KEY_LOBBY = "lol_team_builder_lobby_v2";

const state = {
  // Mode : 'versus' (2 équipes jusqu'à 5v5) ou 'squad5' (1 équipe de 5 en Draft avec rôles)
  mode: "versus",

  // Liste complète des pseudos connus (initialisée depuis DEFAULT_PLAYERS dans data.js)
  allPlayers: [],

  // Pseudos actuellement glissés dans le "Fourre-Tout"
  lobbyPlayers: [],

  // Options "Pimenter la partie"
  options: {
    randomRoles: true,        // Randomiser Top / Jungle / Mid / Bot / Support
    themeComp: false,         // Activer les Compos à Thème (Full Tank, Full Yordle, etc.)
    mirrorTheme: false,       // true = même thème pour les 2 équipes, false = 1 thème par équipe
    themeCategory: "all",     // 'all' | 'region' | 'class' | 'synergy'
    suggestChampions: true,   // Attribuer un champion aléatoire par joueur
    extraChallenge: false,    // Tirer une règle/gage spécial de partie
    pickCaptains: true        // Désigner un capitaine par équipe
  },

  // Résultat actuel des équipes (5 slots par équipe)
  blueTeam: {
    slots: [null, null, null, null, null],
    theme: null
  },
  redTeam: {
    slots: [null, null, null, null, null],
    theme: null
  },
  activeChallenge: null,

  // État Drag & Drop
  dragData: null,
  isRolling: false
};

// Champion pool générique si aucun thème n'est actif mais que "Champion aléatoire" est coché
const ALL_CHAMPIONS_POOL = Array.from(
  new Set(TEAM_THEMES.flatMap((t) => t.champions))
).sort();

/* ============================================================================
   INITIALISATION
   ============================================================================ */
document.addEventListener("DOMContentLoaded", () => {
  loadSavedRoster();
  bindUIEvents();
  renderAll();
  renderThemesCatalog();
});

function loadSavedRoster() {
  try {
    const savedRoster = localStorage.getItem(STORAGE_KEY_ROSTER);
    const savedLobby = localStorage.getItem(STORAGE_KEY_LOBBY);

    if (savedRoster) {
      const parsed = JSON.parse(savedRoster);
      if (Array.isArray(parsed) && parsed.length > 0) {
        state.allPlayers = parsed;
      } else {
        state.allPlayers = [...DEFAULT_PLAYERS];
      }
    } else {
      state.allPlayers = [...DEFAULT_PLAYERS];
    }

    if (savedLobby) {
      const parsedLobby = JSON.parse(savedLobby);
      if (Array.isArray(parsedLobby)) {
        state.lobbyPlayers = parsedLobby.filter((p) => state.allPlayers.includes(p));
      }
    }
  } catch (e) {
    state.allPlayers = [...DEFAULT_PLAYERS];
    state.lobbyPlayers = [];
  }
}

function saveRosterState() {
  try {
    localStorage.setItem(STORAGE_KEY_ROSTER, JSON.stringify(state.allPlayers));
    localStorage.setItem(STORAGE_KEY_LOBBY, JSON.stringify(state.lobbyPlayers));
  } catch (e) {}
}

/* ============================================================================
   UTILITAIRES ALÉATOIRES (FISHER-YATES)
   ============================================================================ */
function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickRandom(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ============================================================================
   GESTION DES JOUEURS (RÉSERVE <-> FOURRE-TOUT)
   ============================================================================ */
function getBenchPlayers() {
  return state.allPlayers.filter((p) => !state.lobbyPlayers.includes(p));
}

function moveToLobby(playerName) {
  if (!state.lobbyPlayers.includes(playerName)) {
    const maxAllowed = state.mode === "squad5" ? 5 : 10;
    if (state.lobbyPlayers.length >= maxAllowed) {
      showToast(`⚠️ Maximum ${maxAllowed} joueurs dans ce mode (${state.mode === "squad5" ? "Draft 5" : "5v5"}) !`);
      return;
    }
    state.lobbyPlayers.push(playerName);
    hexAudio.playDrop(true);
    saveRosterState();
    renderStagingAreas();
  }
}

function moveToBench(playerName) {
  const idx = state.lobbyPlayers.indexOf(playerName);
  if (idx !== -1) {
    state.lobbyPlayers.splice(idx, 1);
    hexAudio.playDrop(false);
    saveRosterState();
    renderStagingAreas();
  }
}

function addNewPlayerToRoster(rawName) {
  const name = rawName.trim();
  if (!name) return;

  const exists = state.allPlayers.some((p) => p.toLowerCase() === name.toLowerCase());
  if (exists) {
    showToast("⚠️ Ce pseudo est déjà dans la liste !");
    return;
  }

  state.allPlayers.push(name);
  // Si il y a de la place dans le fourre-tout, on peut le laisser dans la réserve ou l'ajouter
  hexAudio.playClick();
  saveRosterState();
  renderStagingAreas();
  showToast(`✅ "${name}" ajouté au tableau de pseudos !`);
}

function deletePlayerFromRoster(playerName, event) {
  if (event) event.stopPropagation();
  state.allPlayers = state.allPlayers.filter((p) => p !== playerName);
  state.lobbyPlayers = state.lobbyPlayers.filter((p) => p !== playerName);
  hexAudio.playDrop(false);
  saveRosterState();
  renderStagingAreas();
}

function resetDefaultRoster() {
  state.allPlayers = [...DEFAULT_PLAYERS];
  state.lobbyPlayers = [];
  hexAudio.playClick();
  saveRosterState();
  renderStagingAreas();
  showToast("🔄 Liste de pseudos réinitialisée par défaut.");
}

/* ============================================================================
   ALGORITHME DE CRÉATION D'ÉQUIPES & OPTIONS PIMENTÉES
   ============================================================================ */
function getFilteredThemes() {
  if (state.options.themeCategory === "all") {
    return TEAM_THEMES;
  }
  return TEAM_THEMES.filter((t) => t.category === state.options.themeCategory);
}

function pickRandomThemesForMatch() {
  const pool = getFilteredThemes();
  const shuffled = shuffleArray(pool.length > 0 ? pool : TEAM_THEMES);
  const blueTheme = shuffled[0];
  const redTheme = state.options.mirrorTheme
    ? blueTheme
    : shuffled[1] || shuffled[0];
  return { blueTheme, redTheme };
}

/**
 * Choisit un champion adapté au rôle du joueur (et au thème éventuel)
 * Sans jamais proposer un support enchanteur (ex: Janna) en Top !
 */
function pickChampionForSlot(roleObj, theme, usedChampions = []) {
  const roleId = roleObj ? roleObj.id : null;
  const roleMetaPool = roleId && CHAMPIONS_BY_ROLE[roleId] ? CHAMPIONS_BY_ROLE[roleId] : ALL_CHAMPIONS_POOL;
  const roleFlexPool = roleId && THEME_FLEX_BY_ROLE[roleId] ? THEME_FLEX_BY_ROLE[roleId] : [];

  // Cas 1 : Aucun thème actif -> on pioche STRICTEMENT dans les vrais champions du rôle !
  if (!theme) {
    const unusedInRole = roleMetaPool.filter((c) => !usedChampions.includes(c));
    return pickRandom(unusedInRole.length > 0 ? unusedInRole : roleMetaPool);
  }

  // Cas 2 : Une Compo à Thème est active -> on croise les champions du thème avec le rôle
  const themeChamps = theme.champions || [];
  if (!roleId) {
    const unusedTheme = themeChamps.filter((c) => !usedChampions.includes(c));
    return pickRandom(unusedTheme.length > 0 ? unusedTheme : themeChamps);
  }

  // Priorité 1 : Champions du thème qui jouent nativement à ce poste (ex: Garen/Fiora en Top pour Demacia)
  const strictMatches = themeChamps.filter(
    (c) => roleMetaPool.includes(c) && !usedChampions.includes(c)
  );
  if (strictMatches.length > 0) {
    return pickRandom(strictMatches);
  }

  // Priorité 2 : Champions du thème jouables en flex sur ce poste (ex: en Full Tank ou Full Yordle)
  const flexMatches = themeChamps.filter(
    (c) => roleFlexPool.includes(c) && !usedChampions.includes(c)
  );
  if (flexMatches.length > 0) {
    return pickRandom(flexMatches);
  }

  // Priorité 3 : S'il ne reste plus de non-utilisés dans ce rôle précis, on garde le rôle avant tout ou le reste du thème
  const unusedFallback = themeChamps.filter((c) => !usedChampions.includes(c));
  return pickRandom(unusedFallback.length > 0 ? unusedFallback : themeChamps);
}

function assignRoleAwareChampionsToSlots(slots, theme) {
  const usedChampions = [];
  slots.forEach((slot) => {
    if (!slot) return;
    if (state.options.suggestChampions) {
      const champ = pickChampionForSlot(slot.role, theme, usedChampions);
      slot.champion = champ;
      if (champ) usedChampions.push(champ);
    } else {
      slot.champion = null;
    }
  });
}

function buildTeamSlots(playersForTeam, theme) {
  // Crée toujours un tableau de 5 emplacements (null si vide)
  const slots = [null, null, null, null, null];
  const count = Math.min(playersForTeam.length, 5);
  if (count === 0) return slots;

  // Rôles à attribuer
  // Si 5 joueurs et randomRoles actif -> les 5 rôles officiels dans l'ordre Top, Jgl, Mid, Bot, Supp
  // Si moins de 5 joueurs (ex: 3v3 ou 4v4) et randomRoles actif -> on tire N rôles distincts
  const rolesOrder = state.options.randomRoles
    ? count === 5
      ? [...LOL_ROLES]
      : shuffleArray(LOL_ROLES).slice(0, count)
    : [];

  // Choix aléatoire du capitaine parmi les joueurs présents
  const captainIndex = state.options.pickCaptains
    ? Math.floor(Math.random() * count)
    : -1;

  for (let i = 0; i < count; i++) {
    slots[i] = {
      player: playersForTeam[i],
      role: state.options.randomRoles ? rolesOrder[i] : null,
      isCaptain: i === captainIndex,
      champion: null
    };
  }

  assignRoleAwareChampionsToSlots(slots, theme);

  return slots;
}

function generateTeamsWithAnimation() {
  if (state.isRolling) return;

  const n = state.lobbyPlayers.length;
  if (n < 2 && state.mode === "versus") {
    showToast("⚠️ Glisse au moins 2 pseudos dans le Fourre-Tout pour créer les équipes !");
    return;
  }
  if (n < 1 && state.mode === "squad5") {
    showToast("⚠️ Glisse entre 1 et 5 pseudos dans le Fourre-Tout pour lancer la Draft !");
    return;
  }

  state.isRolling = true;
  const btn = document.getElementById("btn-forge-teams");
  if (btn) btn.classList.add("rolling");

  let ticks = 0;
  const maxTicks = 6;
  const interval = setInterval(() => {
    hexAudio.playTick();
    ticks++;
    if (ticks >= maxTicks) {
      clearInterval(interval);
      executeTeamGeneration();
      state.isRolling = false;
      if (btn) btn.classList.remove("rolling");
      hexAudio.playForgeReveal();
    }
  }, 65);
}

function executeTeamGeneration() {
  const shuffledPlayers = shuffleArray(state.lobbyPlayers);

  // Thèmes éventuels
  let blueTheme = null;
  let redTheme = null;
  if (state.options.themeComp) {
    const picked = pickRandomThemesForMatch();
    blueTheme = picked.blueTheme;
    redTheme = picked.redTheme;
  }

  // Défi spécial éventuel
  state.activeChallenge = state.options.extraChallenge
    ? pickRandom(SPICE_CHALLENGES)
    : null;

  if (state.mode === "squad5") {
    // Mode 1 seule équipe (jusqu'à 5 joueurs) pour la Draft entre potes
    const squadPlayers = shuffledPlayers.slice(0, 5);
    state.blueTeam.theme = blueTheme;
    state.blueTeam.slots = buildTeamSlots(squadPlayers, blueTheme);
    state.redTeam.theme = null;
    state.redTeam.slots = [null, null, null, null, null];
  } else {
    // Mode Versus 2 équipes (ex: 6 joueurs -> 3v3, 8 -> 4v4, 10 -> 5v5)
    // Si nombre impair (ex: 7 joueurs -> 4v3), on choisit aléatoirement quelle équipe a 1 joueur de plus
    const half = Math.floor(shuffledPlayers.length / 2);
    const remainder = shuffledPlayers.length % 2;
    const blueGetsExtra = Math.random() < 0.5;
    const blueCount = Math.min(5, half + (remainder && blueGetsExtra ? 1 : 0));

    const bluePlayers = shuffledPlayers.slice(0, blueCount);
    const redPlayers = shuffledPlayers.slice(blueCount, blueCount + 5);

    state.blueTeam.theme = blueTheme;
    state.blueTeam.slots = buildTeamSlots(bluePlayers, blueTheme);

    state.redTeam.theme = redTheme;
    state.redTeam.slots = buildTeamSlots(redPlayers, redTheme);
  }

  renderArena();
}

/* Relancer uniquement les rôles sans changer les équipes */
function rerollOnlyRoles() {
  const hasBlue = state.blueTeam.slots.some(Boolean);
  const hasRed = state.redTeam.slots.some(Boolean);
  if (!hasBlue && !hasRed) {
    generateTeamsWithAnimation();
    return;
  }

  state.options.randomRoles = true;
  updateSpiceCardsUI();

  ["blueTeam", "redTeam"].forEach((teamKey) => {
    const activeSlots = state[teamKey].slots.filter(Boolean);
    if (activeSlots.length === 0) return;

    const shuffledPlayers = shuffleArray(activeSlots.map((s) => s.player));
    state[teamKey].slots = buildTeamSlots(shuffledPlayers, state[teamKey].theme);
  });

  hexAudio.playForgeReveal();
  renderArena();
  showToast("🎲 Rôles redistribués aléatoirement !");
}

/* Relancer uniquement le thème d'une équipe (ou des deux) */
function rerollTeamTheme(side) {
  const pool = getFilteredThemes();
  const newTheme = pickRandom(pool.length > 0 ? pool : TEAM_THEMES);
  if (!newTheme) return;

  const targetTeam = side === "blue" ? state.blueTeam : state.redTeam;
  targetTeam.theme = newTheme;

  // Met à jour les champions suggérés en fonction du rôle de chaque joueur ET du nouveau thème
  assignRoleAwareChampionsToSlots(targetTeam.slots, newTheme);

  hexAudio.playClick();
  renderArena();
}

/* Relancer le champion d'un seul joueur (en respectant son rôle !) */
function rerollSingleChampion(side, slotIndex) {
  const targetTeam = side === "blue" ? state.blueTeam : state.redTeam;
  const slot = targetTeam.slots[slotIndex];
  if (!slot) return;

  const usedChamps = targetTeam.slots
    .filter((s, idx) => s && idx !== slotIndex)
    .map((s) => s.champion)
    .filter(Boolean);

  // On exclut aussi le champion actuel pour forcer un nouveau tirage sur ce rôle
  if (slot.champion) usedChamps.push(slot.champion);

  slot.champion = pickChampionForSlot(slot.role, targetTeam.theme, usedChamps);

  hexAudio.playClick();
  renderArena();
}

/* ============================================================================
   RENDU DOM
   ============================================================================ */
function renderAll() {
  updateModeUI();
  renderStagingAreas();
  updateSpiceCardsUI();
  renderArena();
}

function updateModeUI() {
  document.querySelectorAll(".mode-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.mode === state.mode);
  });

  const arenaGrid = document.getElementById("arena-grid");
  const redPanel = document.getElementById("red-team-panel");
  const vsDivider = document.getElementById("vs-divider");
  const blueTitle = document.getElementById("blue-team-title");
  const blueSub = document.getElementById("blue-team-sub");

  if (state.mode === "squad5") {
    arenaGrid.classList.add("single-squad-mode");
    redPanel.style.display = "none";
    vsDivider.style.display = "none";
    blueTitle.textContent = "Escouade Draft (5 Joueurs)";
    blueSub.textContent = "Répartition aléatoire des rôles & compo à thème";
  } else {
    arenaGrid.classList.remove("single-squad-mode");
    redPanel.style.display = "";
    vsDivider.style.display = "";
    blueTitle.textContent = "Équipe Bleue";
    blueSub.textContent = "Blue Side • Faille de l'Invocateur";
  }
}

function renderStagingAreas() {
  const benchContainer = document.getElementById("bench-zone");
  const lobbyContainer = document.getElementById("fourre-tout-zone");
  const benchCountEl = document.getElementById("bench-count");
  const lobbyCountEl = document.getElementById("lobby-count");
  const formatPreviewEl = document.getElementById("matchup-format-preview");

  const benchPlayers = getBenchPlayers();
  benchCountEl.textContent = `${benchPlayers.length} dispo`;
  lobbyCountEl.textContent = `${state.lobbyPlayers.length} / ${state.mode === "squad5" ? 5 : 10}`;

  // Calcul de l'aperçu du format (ex: 6 pseudos -> 3 contre 3, 10 -> 5 contre 5)
  const n = state.lobbyPlayers.length;
  if (state.mode === "squad5") {
    formatPreviewEl.textContent =
      n === 0
        ? "En attente de joueurs (jusqu'à 5)"
        : `Format : Escouade de ${Math.min(n, 5)} joueur${n > 1 ? "s" : ""} (Draft Rôles)`;
  } else {
    if (n === 0) {
      formatPreviewEl.textContent = "Glisse des pseudos ici (ex: 6 = 3v3, 8 = 4v4, 10 = 5v5)";
    } else if (n === 1) {
      formatPreviewEl.textContent = "1 joueur sélectionné (ajoute au moins un 2e joueur)";
    } else {
      const b = Math.ceil(n / 2);
      const r = Math.floor(n / 2);
      formatPreviewEl.textContent =
        b === r
          ? `⚔️ Format automatique : ${b} contre ${r} (${n} joueurs)`
          : `⚔️ Format asymétrique : ${b} contre ${r} (${n} joueurs)`;
    }
  }

  // Rendu de la Réserve de Pseudos
  benchContainer.innerHTML = "";
  if (benchPlayers.length === 0) {
    benchContainer.innerHTML = `
      <div class="drop-empty-hint">
        <strong>Tous les pseudos sont dans le Fourre-Tout !</strong>
        <span>Tu peux en ajouter un nouveau ci-dessus ou en retirer du Fourre-Tout.</span>
      </div>
    `;
  } else {
    benchPlayers.forEach((player) => {
      const chip = createPlayerChip(player, "bench");
      benchContainer.appendChild(chip);
    });
  }

  // Rendu du Fourre-Tout
  lobbyContainer.innerHTML = "";
  if (state.lobbyPlayers.length === 0) {
    lobbyContainer.innerHTML = `
      <div class="drop-empty-hint">
        <strong>Le Fourre-Tout est vide</strong>
        <span>Glisse-dépose (ou clique sur) les pseudos disponibles à gauche pour composer la session !</span>
      </div>
    `;
  } else {
    state.lobbyPlayers.forEach((player) => {
      const chip = createPlayerChip(player, "lobby");
      lobbyContainer.appendChild(chip);
    });
  }
}

function createPlayerChip(playerName, zone) {
  const chip = document.createElement("div");
  chip.className = "player-chip";
  chip.draggable = true;
  chip.dataset.player = playerName;
  chip.dataset.zone = zone;

  const initials = playerName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  chip.innerHTML = `
    <span class="chip-avatar">${escapeHtml(initials)}</span>
    <span class="chip-name">${escapeHtml(playerName)}</span>
    ${
      zone === "bench"
        ? `<button type="button" class="chip-remove-db" title="Supprimer définitivement du tableau">✕</button>`
        : `<span class="chip-remove-db" title="Retirer du Fourre-Tout">↩</span>`
    }
  `;

  // Clic rapide : bascule entre Réserve et Fourre-Tout
  chip.addEventListener("click", (e) => {
    if (e.target.classList.contains("chip-remove-db") && zone === "bench") {
      deletePlayerFromRoster(playerName, e);
      return;
    }
    if (zone === "bench") {
      moveToLobby(playerName);
    } else {
      moveToBench(playerName);
    }
  });

  // Événements Drag & Drop HTML5
  chip.addEventListener("dragstart", (e) => {
    state.dragData = { type: "pool", player: playerName, from: zone };
    chip.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", playerName);
  });

  chip.addEventListener("dragend", () => {
    chip.classList.remove("dragging");
    state.dragData = null;
  });

  return chip;
}

function updateSpiceCardsUI() {
  document.querySelectorAll(".spice-toggle-card").forEach((card) => {
    const optKey = card.dataset.option;
    if (optKey && optKey in state.options) {
      card.classList.toggle("active", Boolean(state.options[optKey]));
    }
  });

  const themeSub = document.getElementById("theme-subsettings");
  if (themeSub) {
    themeSub.classList.toggle("hidden", !state.options.themeComp);
  }

  document.querySelectorAll("[data-theme-cat]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.themeCat === state.options.themeCategory);
  });

  const mirrorBtn = document.getElementById("btn-toggle-mirror-theme");
  if (mirrorBtn) {
    mirrorBtn.classList.toggle("active", state.options.mirrorTheme);
    mirrorBtn.textContent = state.options.mirrorTheme
      ? "Mode : Même thème (Miroir)"
      : "Mode : 1 Thème différent par équipe";
  }
}

/* ============================================================================
   RENDU DE L'ARÈNE (2 ÉQUIPES DE 5 SLOTS + THÈMES + DÉFIS)
   ============================================================================ */
function renderArena() {
  // Bannière défi spécial
  const challengeBanner = document.getElementById("global-challenge-banner");
  if (state.activeChallenge) {
    challengeBanner.classList.remove("hidden");
    document.getElementById("challenge-title").textContent = `🔥 RÈGLE PIMENTÉE : ${state.activeChallenge.title}`;
    document.getElementById("challenge-desc").textContent = state.activeChallenge.desc;
  } else {
    challengeBanner.classList.add("hidden");
  }

  // Rendu Équipe Bleue & Équipe Rouge
  renderTeamSide("blue", state.blueTeam);
  renderTeamSide("red", state.redTeam);
}

function renderTeamSide(side, teamData) {
  const slotsContainer = document.getElementById(`${side}-slots-container`);
  const themeBanner = document.getElementById(`${side}-theme-banner`);
  const countBadge = document.getElementById(`${side}-active-count`);

  const activeCount = teamData.slots.filter(Boolean).length;
  if (countBadge) {
    countBadge.textContent = `${activeCount} / 5 Joueurs`;
  }

  // Carte de Compo à Thème
  if (teamData.theme) {
    themeBanner.classList.remove("hidden");
    themeBanner.style.borderLeftColor = teamData.theme.color || "#c8aa6e";
    themeBanner.innerHTML = `
      <div class="theme-banner-top">
        <div class="theme-title-line">
          <span class="theme-icon-lg">${teamData.theme.icon}</span>
          <span class="theme-name-txt">${escapeHtml(teamData.theme.name)}</span>
          <span class="theme-cat-tag">${escapeHtml(teamData.theme.badge)}</span>
        </div>
        <button type="button" class="btn-hex-sm" onclick="rerollTeamTheme('${side}')" title="Tirage d'un autre thème pour cette équipe">
          🎲 Autre thème
        </button>
      </div>
      <p class="theme-desc-txt">${escapeHtml(teamData.theme.description)}</p>
      <div class="theme-champ-pool">
        ${teamData.theme.champions
          .slice(0, 12)
          .map((c) => `<span class="champ-mini-tag">${escapeHtml(c)}</span>`)
          .join("")}
        ${
          teamData.theme.champions.length > 12
            ? `<span class="champ-mini-tag">+${teamData.theme.champions.length - 12} autres</span>`
            : ""
        }
      </div>
    `;
  } else {
    themeBanner.classList.add("hidden");
    themeBanner.innerHTML = "";
  }

  // Les 5 emplacements (slots) de l'équipe
  slotsContainer.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const slotData = teamData.slots[i];
    const defaultRoleHint = LOL_ROLES[i];
    const slotEl = document.createElement("div");
    slotEl.className = `team-slot ${slotData ? "filled" : "empty"}`;
    slotEl.style.animationDelay = `${i * 45}ms`;
    slotEl.dataset.side = side;
    slotEl.dataset.slotIndex = String(i);

    if (slotData) {
      slotEl.draggable = true;
      const roleObj = slotData.role;

      slotEl.innerHTML = `
        <div class="slot-left">
          <div class="slot-role-badge" style="${roleObj ? `border-color:${roleObj.color}; color:${roleObj.color}` : ""}" title="${roleObj ? roleObj.fullName : `Joueur ${i + 1}`}">
            ${roleObj ? roleObj.svg : `<span class="slot-number-only">#${i + 1}</span>`}
          </div>
          <div class="slot-player-info">
            <div class="slot-player-name-row">
              <span class="slot-player-name">${escapeHtml(slotData.player)}</span>
              ${slotData.isCaptain ? `<span class="captain-crown" title="Capitaine / Shotcaller d'équipe">👑 Capitaine</span>` : ""}
            </div>
            <span class="slot-role-label">
              ${roleObj ? `${roleObj.fullName}` : `Poste Libre • Slot ${i + 1}`}
            </span>
          </div>
        </div>
        <div class="slot-right">
          ${
            slotData.champion
              ? `
                <div class="suggested-champ-pill" title="Champion suggéré">
                  <span>⚔️ ${escapeHtml(slotData.champion)}</span>
                </div>
                <button type="button" class="reroll-champ-btn" onclick="rerollSingleChampion('${side}', ${i})" title="Relancer ce champion">
                  🎲
                </button>
              `
              : ""
          }
        </div>
      `;

      // Permet d'échanger deux joueurs entre les slots par Drag & Drop !
      slotEl.addEventListener("dragstart", (e) => {
        state.dragData = { type: "slot", side, slotIndex: i };
        e.dataTransfer.effectAllowed = "move";
      });
    } else {
      // Slot vide (sur les 5 slots de l'équipe)
      slotEl.innerHTML = `
        <div class="slot-left">
          <div class="slot-role-badge" style="opacity:0.45">
            ${
              state.options.randomRoles
                ? defaultRoleHint.svg
                : `<span class="slot-number-only">#${i + 1}</span>`
            }
          </div>
          <div class="slot-player-info">
            <span class="slot-empty-label">Emplacement disponible (${i + 1}/5)</span>
            <span class="slot-role-label" style="opacity:0.5">
              ${state.options.randomRoles ? defaultRoleHint.name : "En attente d'invocateur"}
            </span>
          </div>
        </div>
      `;
    }

    // Réception d'un drop sur un slot d'équipe (depuis un autre slot ou depuis le pool)
    slotEl.addEventListener("dragover", (e) => {
      e.preventDefault();
      slotEl.classList.add("drag-over");
    });

    slotEl.addEventListener("dragleave", () => {
      slotEl.classList.remove("drag-over");
    });

    slotEl.addEventListener("drop", (e) => {
      e.preventDefault();
      slotEl.classList.remove("drag-over");
      handleDropOnTeamSlot(side, i);
    });

    slotsContainer.appendChild(slotEl);
  }
}

function handleDropOnTeamSlot(targetSide, targetIndex) {
  if (!state.dragData) return;

  const targetTeam = targetSide === "blue" ? state.blueTeam : state.redTeam;

  if (state.dragData.type === "slot") {
    // Échange entre deux slots d'équipes (conserve le rôle du slot si randomRoles est actif)
    const sourceTeam = state.dragData.side === "blue" ? state.blueTeam : state.redTeam;
    const sourceIndex = state.dragData.slotIndex;
    if (state.dragData.side === targetSide && sourceIndex === targetIndex) return;

    const sourceSlot = sourceTeam.slots[sourceIndex];
    const destSlot = targetTeam.slots[targetIndex];

    if (sourceSlot && destSlot) {
      // Échange les joueurs entre les deux postes (chaque poste garde son rôle et un champion adapté au rôle)
      const tmpPlayer = sourceSlot.player;
      sourceSlot.player = destSlot.player;
      destSlot.player = tmpPlayer;
    } else if (sourceSlot && !destSlot) {
      const newRole = state.options.randomRoles ? LOL_ROLES[targetIndex] : null;
      const usedChamps = targetTeam.slots
        .filter(Boolean)
        .map((s) => s.champion)
        .filter(Boolean);
      targetTeam.slots[targetIndex] = {
        ...sourceSlot,
        role: newRole,
        champion: state.options.suggestChampions
          ? pickChampionForSlot(newRole, targetTeam.theme, usedChamps)
          : null
      };
      sourceTeam.slots[sourceIndex] = null;
    }
    hexAudio.playDrop(true);
    renderArena();
  } else if (state.dragData.type === "pool") {
    // Un joueur glissé directement depuis la Réserve ou le Fourre-Tout vers un slot précis
    const player = state.dragData.player;
    moveToLobby(player);
    // Retire le joueur s'il était déjà dans un autre slot
    ["blueTeam", "redTeam"].forEach((tKey) => {
      state[tKey].slots.forEach((s, idx) => {
        if (s && s.player === player) state[tKey].slots[idx] = null;
      });
    });

    const newRole = state.options.randomRoles ? LOL_ROLES[targetIndex] : null;
    const usedChamps = targetTeam.slots
      .filter(Boolean)
      .map((s) => s.champion)
      .filter(Boolean);
    targetTeam.slots[targetIndex] = {
      player,
      role: newRole,
      isCaptain: false,
      champion: state.options.suggestChampions
        ? pickChampionForSlot(newRole, targetTeam.theme, usedChamps)
        : null
    };
    hexAudio.playDrop(true);
    renderArena();
  }
}

/* ============================================================================
   CATALOGUE COMPLET DES COMPOS À THÈME
   ============================================================================ */
function renderThemesCatalog() {
  const container = document.getElementById("themes-catalog-grid");
  if (!container) return;

  container.innerHTML = TEAM_THEMES.map(
    (t) => `
    <div class="catalog-theme-card" style="border-left: 3px solid ${t.color}">
      <div class="theme-banner-top">
        <div class="theme-title-line">
          <span>${t.icon}</span>
          <strong style="color:var(--gold-bright)">${escapeHtml(t.name)}</strong>
        </div>
        <span class="theme-cat-tag">${escapeHtml(t.badge)}</span>
      </div>
      <p style="font-size:0.8rem; color:var(--text-muted)">${escapeHtml(t.description)}</p>
      <div class="theme-champ-pool">
        ${t.champions
          .slice(0, 7)
          .map((c) => `<span class="champ-mini-tag">${escapeHtml(c)}</span>`)
          .join("")}
      </div>
      <div style="display:flex; gap:0.4rem; margin-top:auto; padding-top:0.4rem;">
        <button type="button" class="btn-hex-sm" style="flex:1; justify-content:center;" onclick="applySpecificTheme('blue', '${t.id}')">
          Forcer Équipe Bleue
        </button>
        <button type="button" class="btn-hex-sm" style="flex:1; justify-content:center;" onclick="applySpecificTheme('red', '${t.id}')">
          Forcer Équipe Rouge
        </button>
      </div>
    </div>
  `
  ).join("");
}

function applySpecificTheme(side, themeId) {
  const found = TEAM_THEMES.find((t) => t.id === themeId);
  if (!found) return;

  state.options.themeComp = true;
  const target = side === "blue" ? state.blueTeam : state.redTeam;
  target.theme = found;

  assignRoleAwareChampionsToSlots(target.slots, found);

  hexAudio.playClick();
  updateSpiceCardsUI();
  renderArena();
  showToast(`${found.icon} Thème "${found.name}" appliqué à l'équipe ${side === "blue" ? "Bleue" : "Rouge"} !`);
}

/* ============================================================================
   COPIER LE RÉSUMÉ POUR DISCORD
   ============================================================================ */
function copyMatchToDiscord() {
  const blueActive = state.blueTeam.slots.filter(Boolean);
  const redActive = state.redTeam.slots.filter(Boolean);

  if (blueActive.length === 0 && redActive.length === 0) {
    showToast("⚠️ Génère d'abord les équipes avant de copier pour Discord !");
    return;
  }

  const lines = [];
  lines.push("⚔️ **CRÉATION D'ÉQUIPE LEAGUE OF LEGENDS** ⚔️");
  if (state.activeChallenge) {
    lines.push(`🔥 **Défi Spécial :** *${state.activeChallenge.title}* — ${state.activeChallenge.desc}`);
  }
  lines.push("");

  const formatSlot = (s, idx) => {
    const roleTxt = s.role ? `[${s.role.name.toUpperCase()}] ` : `Slot ${idx + 1}: `;
    const capTxt = s.isCaptain ? " 👑" : "";
    const champTxt = s.champion ? ` *(Suggéré : ${s.champion})*` : "";
    return `• ${roleTxt}**${s.player}**${capTxt}${champTxt}`;
  };

  lines.push(`🔵 **${state.mode === "squad5" ? "ESCOUADE DRAFT (5 STACK)" : "ÉQUIPE BLEUE (BLUE SIDE)"}**`);
  if (state.blueTeam.theme) {
    lines.push(`> ${state.blueTeam.theme.icon} **Thème : ${state.blueTeam.theme.name}** — *${state.blueTeam.theme.rule}*`);
  }
  blueActive.forEach((s, i) => lines.push(formatSlot(s, i)));

  if (state.mode === "versus" && redActive.length > 0) {
    lines.push("");
    lines.push("🔴 **ÉQUIPE ROUGE (RED SIDE)**");
    if (state.redTeam.theme) {
      lines.push(`> ${state.redTeam.theme.icon} **Thème : ${state.redTeam.theme.name}** — *${state.redTeam.theme.rule}*`);
    }
    redActive.forEach((s, i) => lines.push(formatSlot(s, i)));
  }

  const text = lines.join("\n");
  navigator.clipboard
    .writeText(text)
    .then(() => {
      hexAudio.playClick();
      showToast("📋 Composition copiée ! Prête à coller sur Discord.");
    })
    .catch(() => {
      showToast("⚠️ Impossible de copier automatiquement.");
    });
}

/* ============================================================================
   ÉVÉNEMENTS UI & DRAG-AND-DROP
   ============================================================================ */
function bindUIEvents() {
  // Changement de mode (Versus 2 Teams / Draft 5-Stack)
  document.querySelectorAll(".mode-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      state.mode = tab.dataset.mode;
      if (state.mode === "squad5") {
        state.options.randomRoles = true;
        if (state.lobbyPlayers.length > 5) {
          state.lobbyPlayers = state.lobbyPlayers.slice(0, 5);
        }
      }
      hexAudio.playClick();
      renderAll();
    });
  });

  // Toggle Audio
  const soundBtn = document.getElementById("btn-toggle-sound");
  if (soundBtn) {
    soundBtn.addEventListener("click", () => {
      const enabled = hexAudio.toggle();
      soundBtn.textContent = enabled ? "🔊 Son Hextech : ON" : "🔇 Son : OFF";
    });
  }

  // Formulaire d'ajout de pseudo
  const addForm = document.getElementById("form-add-player");
  const inputPlayer = document.getElementById("input-new-player");
  if (addForm && inputPlayer) {
    addForm.addEventListener("submit", (e) => {
      e.preventDefault();
      addNewPlayerToRoster(inputPlayer.value);
      inputPlayer.value = "";
    });
  }

  // Boutons rapides de la Réserve & Fourre-Tout
  document.getElementById("btn-move-all-lobby")?.addEventListener("click", () => {
    const limit = state.mode === "squad5" ? 5 : 10;
    const bench = getBenchPlayers();
    for (const p of bench) {
      if (state.lobbyPlayers.length >= limit) break;
      state.lobbyPlayers.push(p);
    }
    hexAudio.playDrop(true);
    saveRosterState();
    renderStagingAreas();
  });

  document.getElementById("btn-pick-5-random")?.addEventListener("click", () => {
    state.lobbyPlayers = shuffleArray(state.allPlayers).slice(0, 5);
    hexAudio.playDrop(true);
    saveRosterState();
    renderStagingAreas();
  });

  document.getElementById("btn-clear-lobby")?.addEventListener("click", () => {
    state.lobbyPlayers = [];
    hexAudio.playDrop(false);
    saveRosterState();
    renderStagingAreas();
  });

  document.getElementById("btn-reset-roster")?.addEventListener("click", () => {
    resetDefaultRoster();
  });

  // Zones de Drag & Drop (Réserve & Fourre-Tout)
  const benchZone = document.getElementById("bench-zone");
  const lobbyZone = document.getElementById("fourre-tout-zone");

  setupDropZone(benchZone, (player) => moveToBench(player));
  setupDropZone(lobbyZone, (player) => moveToLobby(player));

  // Cartes d'options "Pimenter la partie"
  document.querySelectorAll(".spice-toggle-card").forEach((card) => {
    card.addEventListener("click", () => {
      const optKey = card.dataset.option;
      if (optKey && optKey in state.options) {
        state.options[optKey] = !state.options[optKey];
        hexAudio.playClick();
        updateSpiceCardsUI();
      }
    });
  });

  // Filtres de catégories de thème
  document.querySelectorAll("[data-theme-cat]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.options.themeCategory = btn.dataset.themeCat;
      hexAudio.playClick();
      updateSpiceCardsUI();
    });
  });

  // Bouton Thème Miroir vs Différent
  document.getElementById("btn-toggle-mirror-theme")?.addEventListener("click", () => {
    state.options.mirrorTheme = !state.options.mirrorTheme;
    hexAudio.playClick();
    updateSpiceCardsUI();
  });

  // Gros bouton "Lancer l'Aléatoire"
  document.getElementById("btn-forge-teams")?.addEventListener("click", () => {
    generateTeamsWithAnimation();
  });

  // Boutons secondaires (Relancer rôles seuls / Copier Discord)
  document.getElementById("btn-reroll-roles-only")?.addEventListener("click", () => {
    rerollOnlyRoles();
  });

  document.getElementById("btn-copy-discord")?.addEventListener("click", () => {
    copyMatchToDiscord();
  });

  // Tiroir du catalogue de tous les thèmes
  const drawerBtn = document.getElementById("btn-toggle-catalog");
  const catalogGrid = document.getElementById("themes-catalog-grid");
  if (drawerBtn && catalogGrid) {
    drawerBtn.addEventListener("click", () => {
      const isHidden = catalogGrid.classList.toggle("hidden");
      drawerBtn.querySelector(".drawer-arrow").textContent = isHidden ? "▼ Afficher" : "▲ Masquer";
      hexAudio.playClick();
    });
  }
}

function setupDropZone(zoneEl, onDropCallback) {
  if (!zoneEl) return;

  zoneEl.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    zoneEl.classList.add("drag-over");
  });

  zoneEl.addEventListener("dragleave", () => {
    zoneEl.classList.remove("drag-over");
  });

  zoneEl.addEventListener("drop", (e) => {
    e.preventDefault();
    zoneEl.classList.remove("drag-over");
    const player = state.dragData?.player || e.dataTransfer.getData("text/plain");
    if (player) {
      onDropCallback(player);
    }
  });
}

/* ============================================================================
   HELPERS DIVERS
   ============================================================================ */
let toastTimeout = null;
function showToast(message) {
  const toast = document.getElementById("hex-toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
