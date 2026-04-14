// ── Traductions françaises — langue par défaut ────────────────────────────────
const fr = {
  // Navbar
  navbar: {
    account: 'Mon compte',
    login: 'Connexion',
  },

  // Footer
  footer: {
    privacy: 'Confidentialité',
    terms: 'Conditions',
    contact: 'Contact',
  },

  // Hero
  hero: {
    badge: 'analyses aujourd\'hui',
    title1: 'Maximise',
    title2: 'ton potentiel',
    title3: 'avec l\'IA.',
    subtitle: 'Analyse ton visage et découvre des conseils personnalisés pour révéler ton potentiel.',
    cta: 'Analyser mon visage',
    stats: [
      { value: '+12 000', label: 'analyses' },
      { value: '4.9/5',   label: 'note' },
      { value: '97%',     label: 'satisfaction' },
      { value: '+68',     label: 'points analysés' },
    ],
    scroll: 'Découvrir',
  },

  // WhyNow
  whyNow: {
    badge: 'Pourquoi maintenant',
    title1: 'Enfin une IA qui',
    title2: 'te comprend, toi.',
    p1: 'Les outils existants ont été conçus pour les hommes — algorithmes biaisés, conseils inadaptés, expérience pensée sans nous.',
    p2: 'Shemaxx change ça.',
    p2b: ' Une IA entraînée sur des visages féminins, dans toute leur diversité.',
    p3: 'Des insights qui célèbrent tes forces et révèlent ce qui te rend unique.',
    stats: [
      { value: 94, suffix: '%', label: 'des femmes se sentent mal représentées par les apps d\'attractivité existantes' },
      { value: 3,  suffix: 'x', label: 'plus de précision grâce à des algorithmes entraînés sur des visages féminins' },
      { value: 0,  suffix: '',  label: 'jugement. Seulement des insights basés sur les standards de la beauté dorée' },
    ],
  },

  // HowItWorks
  howItWorks: {
    badge: 'Comment ça marche',
    title1: 'Tout ce qu\'il te faut pour devenir',
    title2: 'la meilleure version de toi-même.',
    steps: [
      { title: 'Prends ou télécharge ta photo',    desc: 'Un selfie en bonne lumière suffit. Ton visage naturel est parfait.',                                                        detail: '30 sec'     },
      { title: 'L\'IA analyse ton visage',          desc: 'Notre algorithme examine plus de 68 points de référence faciaux en temps réel.',                                           detail: '< 30 sec'   },
      { title: 'Découvre ton rapport',              desc: 'Symétrie, proportions, structure — des insights actionnables et bienveillants.',                                           detail: 'Instantané' },
      { title: 'Accède à tes conseils',             desc: 'Coiffures, maquillage, skincare — des recommandations ciblées pour toi.',                                                  detail: 'Sur-mesure' },
    ],
  },

  // Reveal
  reveal: {
    badge: 'Analyse IA',
    title1: 'Découvre ce que ton visage',
    title2: 'révèle vraiment.',
    subtitle: 'Notre IA analyse +68 points de référence pour te donner une lecture précise et personnalisée de ton visage.',
    points: [
      { label: 'Symétrie faciale',    desc: 'Mesure l\'équilibre entre les deux côtés de ton visage.' },
      { label: 'Proportions dorées',  desc: 'Analyse tes traits selon les ratios de la divine proportion.' },
      { label: 'Structure osseuse',   desc: 'Évalue la définition de ta mâchoire et de tes pommettes.' },
      { label: 'Harmonie des traits', desc: 'Comprend comment tes traits interagissent ensemble.' },
    ],
  },

  // FinalCTA
  finalCta: {
    badge: 'Rejoins les +12 000 femmes',
    title1: 'Prête à mog',
    title2: 'toutes tes copines ?',
    subtitle: 'Lance ta première analyse et découvre ton potentiel beauté.',
    cta: 'Analyser mon visage gratuitement',
    confidential: '100% confidentiel',
    results: 'Résultats en 30 sec',
  },

  // AuthModal
  auth: {
    signup: 'S\'inscrire',
    signin: 'Se connecter',
    email: 'Email',
    password: 'Mot de passe',
    emailPlaceholder: 'ton@email.com',
    passwordPlaceholder: '••••••••',
    loading: 'Chargement…',
    createAccount: 'Créer mon compte',
    noAccount: 'Pas encore de compte ?',
    errors: {
      invalidCredentials: 'Email ou mot de passe incorrect.',
      alreadyRegistered:  'Cet email est déjà utilisé. Connecte-toi.',
      weakPassword:       'Le mot de passe doit contenir au moins 6 caractères.',
    },
  },

  // App banner invitation
  app: {
    inviteBanner: 'Une amie t\'a invitée sur Shemaxx !',
    inviteAnalyze: 'Analyser',
  },

  // Onboarding header
  onboarding: {
    close: 'Fermer',
  },

  // Step1
  step1: {
    title: 'Où en es-tu dans le looksmaxxing ?',
    cta: 'Continuer',
    options: [
      { label: 'Curieuse',    desc: 'Je commence à m\'intéresser à mon potentiel et à mon apparence.' },
      { label: 'En progression', desc: 'Je connais déjà quelques techniques et je veux aller plus loin.' },
      { label: 'Déterminée',  desc: 'Je veux atteindre mon plein potentiel et optimiser chaque détail.' },
    ],
  },

  // Step2
  step2: {
    title: 'Quel âge as-tu ?',
    cta: 'Continuer',
    unit: 'ans',
  },

  // Step3
  step3: {
    title: 'Quelles zones veux-tu améliorer ?',
    subtitle: 'Tu peux sélectionner plusieurs options',
    cta: 'Continuer',
    zones: [
      { label: 'Ligne de mâchoire' },
      { label: 'Pommettes'         },
      { label: 'Yeux'              },
      { label: 'Nez'               },
      { label: 'Tout améliorer'    },
      { label: 'Autre'             },
    ],
    otherPlaceholder: 'Décris ce que tu souhaites améliorer...',
  },

  // Step4
  step4: {
    title: 'Quel type de résultat aimerais-tu atteindre ?',
    cta: 'Continuer',
    options: [
      { label: 'Naturel',        desc: 'Améliorer légèrement ton apparence.' },
      { label: 'Glow up',        desc: 'Optimiser tes traits et ton style.' },
      { label: 'Transformation', desc: 'Révéler ton plein potentiel esthétique.' },
      { label: 'Elite',          desc: 'Atteindre un niveau d\'attractivité exceptionnel.' },
    ],
  },

  // Step5 (Potential)
  step5: {
    cta: 'Voir mon analyse complète',
    discovering: 'Découverte de ton potentiel...',
    yourPotential: 'Ton potentiel',
    currentScore: 'Score actuel',
    maxScore: 'Score maximal',
    gainLabel: 'points de progression potentiels',
    unlockHint: 'Débloquer l\'analyse complète pour obtenir tes conseils personnalisés',
    metrics: [
      'Symétrie faciale',
      'Proportions dorées',
      'Structure osseuse',
      'Qualité de peau',
      'Photogénie',
    ],
  },

  // Step6 (Graph)
  step6: {
    title: 'Accélère ta progression',
    subtitle: 'Vois à quelle vitesse tu peux évoluer avec les bonnes techniques.',
    cta: 'Continuer',
    withShemaxx: 'Avec Shemaxx',
    withoutGuide: 'Sans guide',
    onlineTutos: 'Tutos en ligne',
    weeks: ['Semaine 1', 'Semaine 2', 'Semaine 3'],
    stat: 'plus de résultats visibles en 3 semaines avec l\'analyse IA Shemaxx',
  },

  // Step7 (Pseudo)
  step7: {
    title: 'Comment veux-tu qu\'on t\'appelle ?',
    cta: 'Continuer',
    label: 'Entre ton pseudo',
    placeholder: 'Ex: Sarah, Léa, Alex...',
    confirm: (name) => `Parfait, ${name} ! Appuie sur Entrée ou "Continuer" ↓`,
  },

  // Step8Photos
  step8Photos: {
    title: 'Analysons\nton visage',
    subtitle: 'Notre IA va scanner ton visage en temps réel.\nSuivez les instructions ci-dessous.',
    instructions: [
      { title: 'Prends ton selfie', desc: 'Appuie sur le bouton ou télécharge une photo. Bonne lumière, visage centré.' },
      { title: 'Fais un cercle avec ta tête', desc: 'Lentement, fais tourner ta tête en cercle complet pour que l\'IA capture tous les angles.' },
      { title: 'Reste dans le cadre', desc: 'Si ton visage sort du cadre, l\'analyse se met en pause.' },
    ],
    privacy: '🔒 Tes données ne sont jamais stockées ni partagées',
    cta: 'Commencer l\'analyse',
  },

  // Step9Loading
  step9Loading: {
    metrics: ['Symétrie faciale', 'Proportions dorées', 'Harmonie des traits', 'Structure osseuse', 'Potentiel global'],
    analyzing: 'Analyse en cours',
    almostDone: 'Finalisation...',
    complete: 'Analyse terminée !',
    yourScore: 'Ton score',
  },

  // Step9AnalyzingIA
  step9Analyzing: {
    title: 'Analyse IA',
    subtitle: 'Notre intelligence artificielle interprète ton scan facial\npour préparer ton rapport personnalisé.',
    nextStep: 'Étape suivante : traitement détaillé de ton visage',
    steps: ['Symétrie faciale', 'Proportions dorées', 'Structure osseuse', 'Qualité de peau'],
    popup: {
      title: 'Analyse en cours',
      desc1: 'L\'analyse dure entre ',
      duration: '1 à 2 minutes',
      desc2: '.\nVeuillez patienter.',
      ok: 'OK',
    },
    errors: {
      configTitle: 'Configuration manquante',
      configDetail: 'La clé API n\'est pas configurée. Contacte le support Shemaxx.',
      analysisTitle: 'Analyse échouée',
      retryBtn: 'Réessayer quand même',
      rescanBtn: '📸 Refaire le scan',
      timeoutDetail: 'L\'analyse a pris trop de temps. Assure-toi d\'avoir une bonne connexion Wi-Fi.',
      networkDetail: 'Erreur inattendue. Réessaie en gardant le visage bien centré dans le cercle.',
      authDetail: 'Problème de connexion au serveur. Vérifie ta connexion internet.',
      badLighting: { title: 'Éclairage insuffisant', detail: 'L\'IA ne peut pas voir tes traits clairement. Place-toi face à une source de lumière (fenêtre ou lampe devant toi), évite la lumière dans le dos.', tips: ['Mets-toi face à une fenêtre ou une lampe', 'Évite la lumière dans le dos', 'Préfère la lumière naturelle du jour'] },
      blurry:      { title: 'Image trop floue',     detail: 'L\'image est trop floue pour analyser ton visage. Nettoie l\'objectif de ta caméra et reste bien immobile pendant le scan.', tips: ['Nettoie l\'objectif de ta caméra', 'Reste immobile pendant le scan', 'Rapproche-toi un peu de l\'écran'] },
      badAngle:    { title: 'Angle incorrect',       detail: 'Ton visage est trop de côté ou trop incliné. Regarde droit dans la caméra, tête bien droite, visage centré dans le cercle.',    tips: ['Regarde droit dans la caméra', 'Tête bien droite, pas inclinée', 'Visage centré dans le cercle'] },
      noFace:      { title: 'Visage non détecté',    detail: 'Aucun visage clairement visible dans l\'image. Assure-toi que ton visage est bien éclairé et centré dans le cadre.',               tips: ['Regarde droit dans la caméra', 'Tête bien droite, pas inclinée', 'Visage centré dans le cercle'] },
      howToFix: 'Comment corriger',
    },
  },

  // Step9Reveal
  step9Reveal: {
    badge: 'Analyse complète',
    improvementsDetected: 'améliorations',
    detected: 'détectées',
    aiAnalyzed: 'Notre IA a analysé ton visage en détail.',
    locked: 'Les conseils sont verrouillés — débloque-les avec Pro.',
    moreImprovements: 'Et bien plus encore…',
    aiDetected: 'Notre IA a détecté',
    totalLabel: '+ améliorations au total',
    onlyVisible: '— seules',
    areVisible: 'sont visibles ici.',
    unlockFull: 'Débloque l\'analyse complète pour tout voir.',
    fomoTitle: (pseudo) => pseudo ? `${pseudo}, tes conseils personnalisés t'attendent 🔒` : 'Tes conseils personnalisés t\'attendent 🔒',
    fomoSub1: 'Chaque conseil est basé sur ton analyse réelle.',
    fomoSub2: 'Débloque-les maintenant pour commencer à progresser.',
    cta: 'Voir ce que l\'IA a trouvé →',
    impact: { high: 'Impact fort', medium: 'Impact moyen', low: 'À corriger' },
  },

  // Step10 Paywall
  paywall: {
    cta: 'Payer et s\'abonner',
    processing: 'Traitement...',
    priceLabel: '/semaine',
    perDay: 'par jour',
    cancelAnytime: 'Annulable à tout moment',
    secure: 'Paiement sécurisé',
    slides: ['Ta carte résultats', 'En apprendre sur toi', 'Commence à progresser'],
    signupTitle: 'Crée ton compte',
    signupSubtitle: 'Pour accéder à tes résultats',
    alreadyMember: 'Déjà membre ?',
    signin: 'Se connecter',
    unlockTitle: 'Débloque tes résultats',
    unlockSub: 'Accès immédiat à ton analyse complète',
    features: [
      'Analyse complète de ton visage',
      'Conseils personnalisés détaillés',
      'Score et classement détaillés',
      'Accès à toutes les fonctionnalités',
    ],
    ranking: 'Classement global',
    total: 'TOTAL',
  },

  // Step11 Results — onglets
  results: {
    tabs: { results: 'Résultats', analysis: 'Analyse', extras: 'Extras IA' },
    card: {
      globalRanking: 'Classement global',
      total: 'TOTAL',
      beautyScore: 'Score beauté',
      addPhoto: 'Ajouter ta photo',
      metrics: ['Symétrie', 'Proportions', 'Impact du regard', 'Structure du visage', 'Qualité de peau', 'Photogénie'],
    },
    scan: {
      newScan: 'Nouvelle analyse',
      rescan: 'Refaire l\'analyse',
      freeScanUsed: 'Analyse hebdomadaire utilisée',
      freeAvailable: '1 analyse gratuite disponible !',
      scanAgain: 'Relancer l\'analyse',
      payScan: 'Analyser (3,99€)',
    },
    history: {
      title: 'Historique',
      noHistory: 'Aucune analyse',
      noHistoryDesc: 'Lance ta première analyse pour voir tes résultats ici.',
      scanDate: 'Analyse du',
    },
    detail: {
      save: 'Enregistrer',
      share: 'Partager',
      saving: 'Enregistrement...',
      sharing: 'Partage...',
      personalizedAdvice: 'Conseils personnalisés',
      zoneAnalysis: 'Analyse par zone',
      tapToSeeScore: 'Touche un point pour voir ta note',
    },
    extras: {
      title: 'Extras IA',
      subtitle: '3,99€ par utilisation — résultat unique généré par IA.',
      tools: [
        { title: 'Qui est la plus hot ?',      desc: 'Envoie une photo de groupe — l\'IA note chaque fille selon les critères looksmaxxing (mâchoire, pommettes, tilt canthal…).' },
        { title: 'Transformation de style',    desc: 'Athlète, Old Money, Plage, Goth, Streetwear... Vois-toi dans le style de ton choix.' },
        { title: 'Version 10/10',              desc: 'L\'IA génère ta version idéalisée — symétrie parfaite, proportions dorées, looksmaxx total.' },
      ],
      payBtn: 'Débloquer (3,99€)',
      paying: 'Redirection...',
      groupRanking: {
        title: 'Qui est la plus hot ?',
        import: 'Importer une photo de groupe',
        change: 'Changer la photo',
        analyze: 'Commencer l\'analyse',
        analyzing: 'L\'IA analyse les visages...',
        analyzing2: 'Détection et notation en cours',
        ranking: 'Classement Looksmaxxing — de la plus hot à la moins hot',
        noFace: 'Aucun visage détecté. Utilise une photo nette avec les visages bien visibles.',
        winner: ['La plus hot 🔥', '2e place', '3e place'],
        restart: 'Recommencer avec une autre photo',
        winReason: 'Pourquoi elle gagne',
      },
      styleTransform: {
        title: 'Transformation de style',
        yourPhoto: 'Ta photo',
        addPhoto: 'Ajoute ta photo (visage de face)',
        chooseStyle: 'Choisis ton style',
        generate: 'Débloque ta transformation',
        generating: 'Intégration en cours...',
        before: 'AVANT',
        after: 'APRÈS',
        restart: 'Recommencer',
        save: 'Enregistrer ↓',
      },
      tenOutOfTen: {
        title: 'Version 10/10',
        import: 'Importer ta photo',
        change: 'Changer la photo',
        generate: 'Générer ma version 10/10',
        generating: 'Amélioration en cours (30–60 sec)...',
        generated: 'Version 10/10 générée 🏆',
        desc: 'Symétrie parfaite • Proportions dorées • Éclat maximal',
        restart: 'Recommencer',
        save: 'Enregistrer ↓',
        before: 'AVANT',
        after: 'APRÈS 🔥',
      },
    },
    settings: {
      title: 'Mon compte',
      signout: 'Se déconnecter',
      subscription: 'Abonnement actif',
      manage: 'Gérer mon abonnement',
    },
    shareTitle: 'Mon analyse Shemaxx',
    shareMsg: (total) => `Score total : ${total}/100`,
    shareTitle2: 'Mon analyse Shemaxx 🔥',
    shareMsg2: (total) => `J\'ai obtenu ${total}/100 sur Shemaxx !`,
  },
}

export default fr
