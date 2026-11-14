/**
 * ============================================================================
 * TABLEAU PRÉFAIT DES PSEUDOS DE TON GROUPE DE POTES
 * ============================================================================
 * Tu peux modifier cette liste directement ici dans le code, OU ajouter/supprimer
 * des pseudos directement depuis l'interface (sauvegardé automatiquement).
 */
const DEFAULT_PLAYERS = [
  "tvxouu",
  "Player II",
  "Otag",
  "Drakos",
  "Arta",
  "Chouby",
  "Haiito",
  "Sundross",
  "Mitikx",
  "Bitoune",
  "Merlubrifiant"
];

/**
 * RÔLES OFFICIELS LEAGUE OF LEGENDS
 * Avec icônes SVG inspirées du client Hextech officiel
 */
const LOL_ROLES = [
  {
    id: "TOP",
    name: "Top",
    fullName: "Voie du Haut (Top)",
    color: "#E8A838",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h13l-3 3H7v7l-3 3V4zm16 16H7l3-3h7v-7l3-3v13zm-9.5-9.5h3v3h-3v-3z"/></svg>`
  },
  {
    id: "JUNGLE",
    name: "Jungle",
    fullName: "Jungle",
    color: "#4CAF50",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C9.5 6 7 9.5 7 13.5 7 17.5 10 21 12 22c2-1 5-4.5 5-8.5C17 9.5 14.5 6 12 2zm-6.5 7c.5 2.5 1.8 4.8 3.2 6.5-2.8-.6-4.7-3-4.7-6 0-.2 0-.3 1.5-.5zm13 0c1.5.2 1.5.3 1.5.5 0 3-1.9 5.4-4.7 6 1.4-1.7 2.7-4 3.2-6.5z"/></svg>`
  },
  {
    id: "MID",
    name: "Mid",
    fullName: "Voie du Milieu (Mid)",
    color: "#0AC8B9",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h7L8.5 6.5H6.5v2L4 11V4zm16 16h-7l2.5-2.5h2v-2L20 13v7zM18.5 3.5L20.5 5.5 5.5 20.5 3.5 18.5 18.5 3.5z"/></svg>`
  },
  {
    id: "BOT",
    name: "Bot (ADC)",
    fullName: "Voie du Bas (Bot / ADC)",
    color: "#E84057",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 20H7l3-3h7v-7l3-3v13zM4 4h13l-3 3H7v7l-3 3V4zm6.5 6.5h3v3h-3v-3z"/></svg>`
  },
  {
    id: "SUPPORT",
    name: "Support",
    fullName: "Support",
    color: "#A882FF",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l3 4.5h5l-4 4 1.5 5.5L12 14l-5.5 3L8 11.5 4 7.5h5L12 3zm0 4.2L10.3 10H7.5l2.3 2.2-.8 3 3-1.7 3 1.7-.8-3 2.3-2.2h-2.8L12 7.2z"/></svg>`
  }
];

/**
 * ============================================================================
 * POOL DE CHAMPIONS PAR RÔLE (META / VRAIS POSTES)
 * ============================================================================
 * Garantit qu'un joueur TOP reçoit un vrai Top laner (jamais Janna ou Soraka),
 * qu'un JUNGLE reçoit un vrai Jungler, etc.
 */
const CHAMPIONS_BY_ROLE = {
  TOP: [
    "Aatrox", "Ambessa", "Camille", "Cho'Gath", "Darius", "Dr. Mundo", "Fiora",
    "Gangplank", "Garen", "Gnar", "Gragas", "Gwen", "Illaoi", "Irelia", "Jax",
    "Jayce", "K'Sante", "Kayle", "Kennen", "Kled", "Malphite", "Mordekaiser",
    "Nasus", "Olaf", "Ornn", "Pantheon", "Poppy", "Quinn", "Renekton", "Riven",
    "Rumble", "Sett", "Shen", "Singed", "Sion", "Tahm Kench", "Teemo", "Trundle",
    "Tryndamere", "Urgot", "Volibear", "Warwick", "Wukong", "Yasuo", "Yone", "Yorick", "Zac"
  ],
  JUNGLE: [
    "Amumu", "Bel'Veth", "Briar", "Diana", "Ekko", "Elise", "Evelynn", "Fiddlesticks",
    "Gragas", "Graves", "Hecarim", "Ivern", "Jarvan IV", "Karthus", "Kayn", "Kha'Zix",
    "Kindred", "Lee Sin", "Lillia", "Maokai", "Master Yi", "Nidalee", "Nocturne",
    "Nunu & Willump", "Olaf", "Poppy", "Rammus", "Rek'Sai", "Rengar", "Sejuani",
    "Shaco", "Shyvana", "Skarner", "Taliyah", "Trundle", "Udyr", "Vi", "Viego",
    "Volibear", "Warwick", "Wukong", "Xin Zhao", "Zac"
  ],
  MID: [
    "Ahri", "Akali", "Akshan", "Anivia", "Annie", "Aurelion Sol", "Aurora", "Azir",
    "Cassiopeia", "Corki", "Diana", "Ekko", "Fizz", "Galio", "Heimerdinger", "Hwei",
    "Irelia", "Jayce", "Kassadin", "Katarina", "LeBlanc", "Lissandra", "Lux",
    "Malzahar", "Naafiri", "Neeko", "Orianna", "Qiyana", "Ryze", "Sylas", "Syndra",
    "Taliyah", "Talon", "Twisted Fate", "Veigar", "Vel'Koz", "Vex", "Viktor",
    "Vladimir", "Xerath", "Yasuo", "Yone", "Zed", "Ziggs", "Zoe"
  ],
  BOT: [
    "Aphelios", "Ashe", "Caitlyn", "Corki", "Draven", "Ezreal", "Jhin", "Jinx",
    "Kai'Sa", "Kalista", "Kog'Maw", "Lucian", "Miss Fortune", "Nilah", "Samira",
    "Senna", "Sivir", "Smolder", "Tristana", "Twitch", "Varus", "Vayne", "Xayah",
    "Zeri", "Ziggs"
  ],
  SUPPORT: [
    "Alistar", "Bardo", "Blitzcrank", "Brand", "Braum", "Janna", "Karma", "Leona",
    "Lulu", "Lux", "Maokai", "Milio", "Morgana", "Nami", "Nautilus", "Neeko",
    "Pantheon", "Poppy", "Pyke", "Rakan", "Rell", "Renata Glasc", "Senna",
    "Seraphine", "Sona", "Soraka", "Swain", "Tahm Kench", "Taric", "Thresh",
    "Vel'Koz", "Xerath", "Yuumi", "Zilean", "Zyra"
  ]
};

/**
 * RÔLES FLEX SECONDAIRES (Utilisés uniquement quand une Compo à Thème
 * impose une classe ou région spécifique qui manque d'un rôle classique)
 */
const THEME_FLEX_BY_ROLE = {
  TOP: [
    "Vayne", "Akshan", "Sylas", "Vladimir", "Swain", "Heimerdinger", "Lulu",
    "Karma", "Taric", "Nautilus", "Leona", "Maokai", "Sejuani", "Amumu",
    "Rengar", "Kha'Zix", "Akali", "Zed", "Kassadin", "Ryze", "Cassiopeia", "Graves", "Kindred"
  ],
  JUNGLE: [
    "Morgana", "Brand", "Zyra", "Teemo", "Sion", "Cho'Gath", "Dr. Mundo", "Malphite",
    "Ornn", "Shen", "Nautilus", "Mordekaiser", "Darius", "Garen", "Sett", "Jax",
    "Camille", "Gwen", "Sylas", "Qiyana", "Talon", "Zed", "Naafiri", "Twitch",
    "Kai'Sa", "Quinn", "Vayne", "Taric", "Rumble", "Singed", "Yorick", "Urgot"
  ],
  MID: [
    "Lucian", "Tristana", "Ezreal", "Varus", "Kai'Sa", "Caitlyn", "Jhin", "Smolder",
    "Quinn", "Graves", "Kindred", "Cho'Gath", "Sion", "Malphite", "Ornn", "Zac",
    "Sett", "Garen", "Renekton", "Mordekaiser", "Aatrox", "Pantheon", "Kled",
    "Singed", "Nunu & Willump", "Kha'Zix", "Pyke", "Karma", "Lulu", "Seraphine",
    "Zilean", "Soraka", "Morgana", "Brand", "Zyra", "Swain", "Kog'Maw", "locke"
  ],
  BOT: [
    "Yasuo", "Yone", "Swain", "Seraphine", "Veigar", "Karthus", "Hwei", "Viktor",
    "Syndra", "Cassiopeia", "Taliyah", "Heimerdinger", "Lux", "Xerath", "Vel'Koz",
    "Brand", "Zyra", "Morgana", "Annie", "Malzahar", "Orianna", "Zoe", "Anivia",
    "Tahm Kench", "Cho'Gath", "Sion", "Ornn", "Dr. Mundo", "Garen", "Darius",
    "Sett", "Mordekaiser", "Wukong", "Pantheon", "Irelia", "Lee Sin", "Rengar",
    "Pyke", "Katarina", "Akali", "Sona", "Soraka", "Karma", "Lulu", "Taric"
  ],
  SUPPORT: [
    "Galio", "Shen", "Ornn", "Sion", "Malphite", "Cho'Gath", "Zac", "Amumu",
    "Sejuani", "Jarvan IV", "Trundle", "Gragas", "Sett", "Camille", "Sion",
    "Shaco", "Fiddlesticks", "Elise", "Ivern", "Annie", "Veigar", "Anivia",
    "Lissandra", "Orianna", "Hwei", "Ziggs", "Heimerdinger", "Teemo", "Ashe",
    "Miss Fortune", "Twitch", "Varus", "Jhin", "Caitlyn", "Kalista", "LeBlanc",
    "Qiyana", "Sylas", "Kled", "Darius", "Singed", "Skarner"
  ]
};

/**
 * ============================================================================
 * COMPOSITIONS À THÈME ("PIMENTER LA PARTIE")
 * ============================================================================
 * Catégories :
 * - "region"   : Régions de Runeterra (Demacia, Noxus, Néant, Yordle, etc.)
 * - "class"    : Classes & Rôles extrêmes (Full Tank, Full ADC, Full Assassin...)
 * - "synergy"  : Mécaniques & Défis fun (Full Grab, Wombo Knock-up, Global, Invisibilité...)
 */
const TEAM_THEMES = [
  // ================= RÉGIONS & FACTIONS =================
  {
    id: "full_demacia",
    name: "Full Demacia",
    category: "region",
    badge: "RÉGION",
    icon: "🦅",
    color: "#E8C267",
    description: "Pour l'honneur et la justice ! Aucune magie sombre tolérée (ou presque).",
    rule: "Uniquement des champions originaires ou affiliés à Demacia.",
    champions: ["Garen", "Jarvan IV", "Lux", "Vayne", "Fiora", "Galio", "Xin Zhao", "Lucian", "Poppy", "Kayle", "Morgana", "Sylas", "Shyvana", "Quinn", "Sona"]
  },
  {
    id: "full_noxus",
    name: "Full Noxus",
    category: "region",
    badge: "RÉGION",
    icon: "🪓",
    color: "#D9383A",
    description: "La force avant tout. On dive niveau 2, on ne recule jamais.",
    rule: "Uniquement des champions de l'Empire de Noxus.",
    champions: ["Darius", "Draven", "Katarina", "Swain", "Sion", "Mordekaiser", "Ambessa", "Briar", "Vladimir", "Samira", "Kled", "Talon", "LeBlanc", "Cassiopeia", "Riven", "Rell", "Karthus"]
  },
  {
    id: "full_yordle",
    name: "Full Yordle (Bandle)",
    category: "region",
    badge: "RÉGION",
    icon: "🍄",
    color: "#8CE063",
    description: "Taille maximum : 1 mètre. Tilter l'équipe adverse : 100% garanti.",
    rule: "Uniquement des Yordles de Bandle City !",
    champions: ["Teemo", "Tristana", "Veigar", "Lulu", "Poppy", "Kennen", "Gnar", "Rumble", "Kled", "Heimerdinger", "Ziggs", "Fizz", "Vex", "Corki", "Amumu", "Yuumi"]
  },
  {
    id: "full_void",
    name: "Full Néant (Void)",
    category: "region",
    badge: "RÉGION",
    icon: "👁️",
    color: "#9B4DFF",
    description: "Consommez la Faille. Évolutions, dégâts bruts et monstres cauchemardesques.",
    rule: "Uniquement des créatures ou corrompus du Néant.",
    champions: ["Cho'Gath", "Kha'Zix", "Kai'Sa", "Kassadin", "Malzahar", "Vel'Koz", "Rek'Sai", "Kog'Maw", "Bel'Veth", "Jax"]
  },
  {
    id: "full_ionia",
    name: "Full Ionia",
    category: "region",
    badge: "RÉGION",
    icon: "🌸",
    color: "#FF78B9",
    description: "500 dashes par minute, écrans de fumée et montage YouTube obligatoire.",
    rule: "Uniquement des champions des Terres Premières d'Ionia.",
    champions: ["Yasuo", "Yone", "Ahri", "Akali", "Irelia", "Lee Sin", "Zed", "Shen", "Jhin", "Kayn", "Sett", "Xayah", "Rakan", "Karma", "Wukong", "Kennen", "Master Yi", "Hwei", "Lillia", "Ivern", "Syndra", "Varus"]
  },
  {
    id: "full_freljord",
    name: "Full Freljord",
    category: "region",
    badge: "RÉGION",
    icon: "❄️",
    color: "#52D1FF",
    description: "L'hiver vient. Ralentissements infinis, stuns de glace et gros frontliners.",
    rule: "Uniquement des champions des terres glacées de Freljord.",
    champions: ["Ashe", "Sejuani", "Lissandra", "Braum", "Ornn", "Volibear", "Anivia", "Trundle", "Tryndamere", "Gragas", "Nunu & Willump", "Olaf", "Udyr", "Aurora"]
  },
  {
    id: "full_piltover_zaun",
    name: "Arcane : Piltover & Zaun",
    category: "region",
    badge: "RÉGION",
    icon: "⚙️",
    color: "#00E5FF",
    description: "Technologie Hextech contre Chimie Techno-Punk. Différence de budget garantie.",
    rule: "Uniquement des champions de Piltover ou de Zaun.",
    champions: ["Jinx", "Vi", "Caitlyn", "Jayce", "Viktor", "Ekko", "Warwick", "Camille", "Ezreal", "Urgot", "Zac", "Twitch", "Blitzcrank", "Dr. Mundo", "Singed", "Zeri", "Renata Glasc", "Heimerdinger", "Orianna", "Seraphine", "Janna", "Ziggs"]
  },
  {
    id: "full_shurima",
    name: "Empire de Shurima",
    category: "region",
    badge: "RÉGION",
    icon: "☀️",
    color: "#FFB830",
    description: "SHURIMA ! Votre empereur est de retour. Disques solaires et Transfigurés.",
    rule: "Uniquement des champions du désert de Shurima.",
    champions: ["Azir", "Nasus", "Renekton", "Sivir", "Taliyah", "K'Sante", "Xerath", "Rammus", "Amumu", "Akshan", "Naafiri", "Skarner", "Zilean", "Cassiopeia"]
  },
  {
    id: "full_shadow_isles",
    name: "Full Îles Obscures",
    category: "region",
    badge: "RÉGION",
    icon: "💀",
    color: "#22E3B6",
    description: "La Brume Noire envahit la Faille. Âmes, résurrections et terreur nocturne.",
    rule: "Uniquement des champions liés aux Îles Obscures et à la Ruine.",
    champions: ["Thresh", "Viego", "Hecarim", "Kalista", "Karthus", "Yorick", "Maokai", "Gwen", "Senna", "Elise", "Vex", "Fiddlesticks", "Nocturne"]
  },
  {
    id: "full_bilgewater",
    name: "Pirates de Bilgewater",
    category: "region",
    badge: "RÉGION",
    icon: "🏴‍☠️",
    color: "#E06D3B",
    description: "Du rhum, de la poudre à canon, des pièces d'or bonus et des monstres marins.",
    rule: "Uniquement des champions de Bilgewater et des mers.",
    champions: ["Gangplank", "Miss Fortune", "Pyke", "Nautilus", "Graves", "Twisted Fate", "Illaoi", "Tahm Kench", "Fizz", "Nilah"]
  },

  // ================= CLASSES & ARCHÉTYPES =================
  {
    id: "full_tank",
    name: "Full Tank (30 000 PV)",
    category: "class",
    badge: "CLASSE",
    icon: "🛡️",
    color: "#5CC88A",
    description: "5 Cœurs d'Acier (Heartsteel). Le bruit 'BONK' toutes les 3 secondes en teamfight.",
    rule: "5 Tanks lourds obligatoires. Bonus : Tout le monde achète Cœur d'Acier ou Égide Solaire !",
    champions: ["Malphite", "Ornn", "Sion", "Cho'Gath", "Dr. Mundo", "Tahm Kench", "Zac", "Maokai", "Sejuani", "Rammus", "Shen", "Amumu", "Leona", "Nautilus", "K'Sante", "Poppy"]
  },
  {
    id: "full_adc",
    name: "Full ADC (Pluie de Balles)",
    category: "class",
    badge: "CLASSE",
    icon: "🏹",
    color: "#FF5964",
    description: "Zéro tanking, 100% kiting. Si un Rammus ou un Malphite est en face, priez.",
    rule: "Uniquement des Tireurs (Marksmen) sur les 5 rôles !",
    champions: ["Caitlyn", "Vayne", "Jinx", "Ezreal", "Lucian", "Tristana", "Ashe", "Jhin", "Kai'Sa", "Quinn", "Kindred", "Graves", "Akshan", "Senna", "Twitch", "Varus", "Draven", "Samira", "Smolder"]
  },
  {
    id: "full_assassin",
    name: "Full Assassins (One-Shot)",
    category: "class",
    badge: "CLASSE",
    icon: "🗡️",
    color: "#E63946",
    description: "La partie se termine à 20 minutes, dans un sens ou dans l'autre. Interdit de grouper.",
    rule: "Uniquement des Assassins AD ou AP sur les 5 postes.",
    champions: ["Zed", "Katarina", "Talon", "Akali", "Fizz", "Kha'Zix", "Rengar", "Evelynn", "Pyke", "Qiyana", "LeBlanc", "Shaco", "Ekko", "Naafiri", "Nocturne", "Kayn", "Kassadin"]
  },
  {
    id: "full_mage",
    name: "Full Mages Artillerie",
    category: "class",
    badge: "CLASSE",
    icon: "🔮",
    color: "#6C8EFF",
    description: "Personne n'a le droit d'approcher à moins de 1000 unités de portée.",
    rule: "5 Mages AP (idéalement longue portée / burst). Interdiction de jouer AD !",
    champions: ["Lux", "Xerath", "Vel'Koz", "Ziggs", "Hwei", "Viktor", "Syndra", "Veigar", "Brand", "Karthus", "Anivia", "Orianna", "Zoe", "Seraphine", "Taliyah", "Malzahar"]
  },
  {
    id: "full_support",
    name: "Full Supports (Hôpital)",
    category: "class",
    badge: "CLASSE",
    icon: "💚",
    color: "#4AE396",
    description: "4000 de boucliers, 5 Rédemptions et un seul carry intouchable.",
    rule: "Uniquement des champions habituellement joués Support (Enchanteurs / Wardens).",
    champions: ["Lulu", "Karma", "Soraka", "Janna", "Ivern", "Taric", "Seraphine", "Zilean", "Bardo", "Thresh", "Nami", "Sona", "Renata Glasc", "Milio", "Braum", "Tahm Kench"]
  },
  {
    id: "full_bruiser",
    name: "Full Bagarre (Juggernauts)",
    category: "class",
    badge: "CLASSE",
    icon: "🥊",
    color: "#F48C06",
    description: "Des baffes, du vol de vie et des 1v3 dans le pit du Baron.",
    rule: "Uniquement des Combattants / Colisses corps-à-corps.",
    champions: ["Darius", "Sett", "Aatrox", "Illaoi", "Mordekaiser", "Olaf", "Renekton", "Jax", "Camille", "Irelia", "Briar", "Volibear", "Trundle", "Garen", "Udyr", "Warwick", "Vi"]
  },

  // ================= SYNERGIES & MÉCANIQUES FUN =================
  {
    id: "full_hook",
    name: "Pêche au Gros (Full Grab)",
    category: "synergy",
    badge: "SYNERGIE",
    icon: "🪝",
    color: "#0AC8B9",
    description: "Un ennemi touché traverse 3 écrans de la Fontaine jusqu'à votre tour.",
    rule: "Chaque champion doit posséder un Grab, Hook ou déplacement forcé d'ennemi.",
    champions: ["Blitzcrank", "Thresh", "Nautilus", "Pyke", "Darius", "Mordekaiser", "Swain", "Skarner", "Singed", "Urgot", "Sylas", "Renata Glasc", "Kled"]
  },
  {
    id: "full_knockup",
    name: "Yasuo Dream Team (Knock-Up)",
    category: "synergy",
    badge: "SYNERGIE",
    icon: "🌪️",
    color: "#4CC9F0",
    description: "L'équipe adverse passe 80% du teamfight dans les airs sans pouvoir jouer.",
    rule: "Yasuo + 4 champions avec de gros Knock-Ups de zone !",
    champions: ["Yasuo", "Malphite", "Diana", "Yone", "Zac", "Wukong", "Ornn", "Alistar", "Cho'Gath", "Jarvan IV", "Rakan", "Nautilus", "Gragas", "Zyra", "Vi"]
  },
  {
    id: "full_global",
    name: "Parachutage Mondial (Full Global)",
    category: "synergy",
    badge: "SYNERGIE",
    icon: "🛰️",
    color: "#FFD166",
    description: "Un duel 1v1 en botlane se transforme en 5v1 en moins de 2 secondes.",
    rule: "Uniquement des champions avec un Ultime Global ou Semi-Global.",
    champions: ["Shen", "Karthus", "Twisted Fate", "Nocturne", "Pantheon", "Galio", "Gangplank", "Ezreal", "Ashe", "Jinx", "Senna", "Soraka", "Taliyah", "Kled", "Ryze", "Briar", "Vex"]
  },
  {
    id: "full_stealth",
    name: "Fantômes de la Faille (Invisibilité)",
    category: "synergy",
    badge: "SYNERGIE",
    icon: "👻",
    color: "#B5838D",
    description: "Les Pink Wards ne suffiront pas. Paranoïa totale chez l'ennemi.",
    rule: "Uniquement des champions possédant un Camouflage ou une Invisibilité.",
    champions: ["Evelynn", "Twitch", "Shaco", "Teemo", "Rengar", "Kha'Zix", "Pyke", "Akshan", "Viego", "Senna", "Akali", "Talon", "Vayne", "Qiyana", "Wukong", "Neeko"]
  },
  {
    id: "full_traps",
    name: "Champ de Mines (Full Pièges)",
    category: "synergy",
    badge: "SYNERGIE",
    icon: "💣",
    color: "#FF9F1C",
    description: "Interdiction pour l'équipe adverse de rentrer dans la jungle sans exploser.",
    rule: "Champions poseurs de pièges, tourelles ou boîtes.",
    champions: ["Teemo", "Shaco", "Caitlyn", "Jhin", "Nidalee", "Maokai", "Heimerdinger", "Zyra", "Ziggs", "Illaoi"]
  },
  {
    id: "full_zoo",
    name: "Le Zoo de la Faille (Invocations)",
    category: "synergy",
    badge: "SYNERGIE",
    icon: "🐾",
    color: "#90BE6D",
    description: "Pourquoi jouer à 5 quand on peut être 15 sur la carte avec Tibbers, Daisy et le Héraut ?",
    rule: "Champions qui invoquent des compagnons ou des armées.",
    champions: ["Yorick", "Ivern", "Annie", "Malzahar", "Naafiri", "Bel'Veth", "Elise", "Heimerdinger", "Zyra", "Azir", "Shaco", "Orianna"]
  },
  {
    id: "full_revive",
    name: "Zombieland (Immortels & Revive)",
    category: "synergy",
    badge: "SYNERGIE",
    icon: "⚰️",
    color: "#72EFDD",
    description: "Tuer votre équipe une fois ne suffit pas. Il faut les tuer trois fois.",
    rule: "Champions avec résurrection, invulnérabilité ou passif post-mortem.",
    champions: ["Zilean", "Kayle", "Tryndamere", "Anivia", "Zac", "Akshan", "Renata Glasc", "Sion", "Karthus", "Kog'Maw", "Taric", "Kindred", "Ekko"]
  },
  {
    id: "full_speed",
    name: "Fast & Furious (Vitesse Max)",
    category: "synergy",
    badge: "SYNERGIE",
    icon: "⚡",
    color: "#F72585",
    description: "800 de vitesse de déplacement. On traverse la map en 4 secondes.",
    rule: "Champions ultra-rapides ou donneurs de boost de vitesse.",
    champions: ["Hecarim", "Rammus", "Nunu & Willump", "Quinn", "Lillia", "Zilean", "Sivir", "Karma", "Janna", "Singed", "Master Yi", "Warwick", "Udyr", "Kled", "Yuumi"]
  },
  {
    id: "full_laser",
    name: "Rayon de la Mort (Full Laser)",
    category: "synergy",
    badge: "SYNERGIE",
    icon: "☄️",
    color: "#E0AAFF",
    description: "Spectacle son et lumière dans la Faille de l'Invocateur.",
    rule: "Champions avec des rayons lasers ou d'énergie géants.",
    champions: ["Lux", "Vel'Koz", "Viktor", "Aurelion Sol", "Senna", "Zeri", "Xerath", "Jayce", "Rumble"]
  },
  {
    id: "full_reset",
    name: "Pentakill Machine (Full Resets)",
    category: "synergy",
    badge: "SYNERGIE",
    icon: "🔥",
    color: "#FF4D6D",
    description: "Un seul kill suffit pour déclencher une réaction en chaîne dévastatrice.",
    rule: "Champions dont les sorts se réinitialisent sur élimination.",
    champions: ["Katarina", "Viego", "Master Yi", "Darius", "Pyke", "Jinx", "Tristana", "Kha'Zix", "Samira", "Vayne", "Aatrox", "Swain", "Ahri", "Akshan"]
  }
];

/**
 * ============================================================================
 * DÉFIS & GAGES BONUS ("RÈGLES PIMENTÉES" OPTIONNELLES)
 * ============================================================================
 */
const SPICE_CHALLENGES = [
  {
    title: "Niveau 1 : Invade Obligatoire",
    desc: "Interdiction d'aller sur sa lane avant 1:25. Les 5 joueurs doivent envahir la jungle ennemie ensemble dès le début !"
  },
  {
    title: "Le Dictateur (Shotcaller Unique)",
    desc: "Le Capitaine désigné prend TOUTES les décisions macro (Nashor, Dragon, Dive). Si le Capitaine dit 'On dive', tout le monde dive sans discuter."
  },
  {
    title: "Flash Interdit (Ghost / TP / Ignite)",
    desc: "Interdiction de prendre le sort d'invocateur Saut Éclair (Flash) ! Place au Fantôme, Téléportation, Embrasement ou Fatigue."
  },
  {
    title: "Escouade Téléportation (5 TP)",
    desc: "Les 5 joueurs de l'équipe doivent prendre Téléportation (sauf le Jungler qui a Smite + TP)."
  },
  {
    title: "Protection du Président",
    desc: "Le joueur Bot (ADC) est le Président. S'il meurt plus de 5 fois, le Support et le Jungler lui doivent un gage."
  },
  {
    title: "Bagarre de Rivière (Carapateur sacré)",
    desc: "Le premier Carapateur à 3:30 doit être contesté comme si c'était un Elder Dragon à 45 minutes."
  },
  {
    title: "Item Signature Obligatoire",
    desc: "Chaque joueur de l'équipe doit acheter un Mejai (AP), un Cœur d'Acier (Tank) ou une Perceptrice (AD) en 1er ou 2ème item !"
  },
  {
    title: "Silence Radio en Teamfight",
    desc: "Pendant chaque Dragon/Baron, un seul mot est autorisé dans le vocal : le nom du champion à focus répété 10 fois."
  },
  {
    title: "Swap de Lane à 10 Minutes",
    desc: "À exactement 10:00 au chrono, la Top Lane et la Bot Lane doivent échanger leurs voies respectives."
  },
  {
    title: "Zéro Back avant 1500 PO",
    desc: "Interdiction de rappeler (touche B) à la base tant que vous n'avez pas au moins 1500 pièces d'or en poche (ou que vous êtes mort)."
  }
];
