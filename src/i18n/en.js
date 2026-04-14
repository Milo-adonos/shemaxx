// ── English translations ──────────────────────────────────────────────────────
const en = {
  // Navbar
  navbar: {
    account: 'My account',
    login: 'Sign in',
  },

  // Footer
  footer: {
    privacy: 'Privacy',
    terms: 'Terms',
    contact: 'Contact',
  },

  // Hero
  hero: {
    badge: 'analyses today',
    title1: 'Maximize',
    title2: 'your potential',
    title3: 'with AI.',
    subtitle: 'Analyze your face and get personalized advice to unlock your full potential.',
    cta: 'Analyze my face',
    stats: [
      { value: '+12,000', label: 'analyses' },
      { value: '4.9/5',   label: 'rating' },
      { value: '97%',     label: 'satisfaction' },
      { value: '+68',     label: 'points analyzed' },
    ],
    scroll: 'Discover',
  },

  // WhyNow
  whyNow: {
    badge: 'Why now',
    title1: 'Finally an AI that',
    title2: 'truly gets you.',
    p1: 'Existing tools were built for men — biased algorithms, irrelevant advice, experiences designed without us.',
    p2: 'Shemaxx changes that.',
    p2b: ' An AI trained on female faces, in all their diversity.',
    p3: 'Insights that celebrate your strengths and reveal what makes you unique.',
    stats: [
      { value: 94, suffix: '%', label: 'of women feel poorly represented by existing attractiveness apps' },
      { value: 3,  suffix: 'x', label: 'more accuracy thanks to algorithms trained on female faces' },
      { value: 0,  suffix: '',  label: 'judgment. Only insights based on golden beauty standards' },
    ],
  },

  // HowItWorks
  howItWorks: {
    badge: 'How it works',
    title1: 'Everything you need to become',
    title2: 'the best version of yourself.',
    steps: [
      { title: 'Take or upload your photo',  desc: 'A selfie in good lighting is enough. Your natural face is perfect.',                                              detail: '30 sec'       },
      { title: 'AI analyzes your face',      desc: 'Our algorithm examines over 68 facial reference points in real time.',                                            detail: '< 30 sec'     },
      { title: 'Discover your report',       desc: 'Symmetry, proportions, structure — actionable and caring insights.',                                              detail: 'Instant'      },
      { title: 'Access your advice',         desc: 'Hairstyles, makeup, skincare — targeted recommendations just for you.',                                           detail: 'Personalized' },
    ],
  },

  // Reveal
  reveal: {
    badge: 'AI Analysis',
    title1: 'Discover what your face',
    title2: 'really reveals.',
    subtitle: 'Our AI analyzes 68+ reference points to give you a precise, personalized reading of your face.',
    points: [
      { label: 'Facial symmetry',   desc: 'Measures the balance between both sides of your face.' },
      { label: 'Golden proportions', desc: 'Analyzes your features according to divine proportion ratios.' },
      { label: 'Bone structure',    desc: 'Evaluates the definition of your jaw and cheekbones.' },
      { label: 'Facial harmony',    desc: 'Understands how your features interact together.' },
    ],
  },

  // FinalCTA
  finalCta: {
    badge: 'Join 12,000+ women',
    title1: 'Ready to glow up',
    title2: 'your squad?',
    subtitle: 'Start your first analysis and discover your beauty potential.',
    cta: 'Analyze my face for free',
    confidential: '100% confidential',
    results: 'Results in 30 sec',
  },

  // AuthModal
  auth: {
    signup: 'Sign up',
    signin: 'Sign in',
    email: 'Email',
    password: 'Password',
    emailPlaceholder: 'your@email.com',
    passwordPlaceholder: '••••••••',
    loading: 'Loading…',
    createAccount: 'Create my account',
    noAccount: 'Don\'t have an account?',
    errors: {
      invalidCredentials: 'Invalid email or password.',
      alreadyRegistered:  'This email is already in use. Sign in instead.',
      weakPassword:       'Password must be at least 6 characters long.',
    },
  },

  // App banner
  app: {
    inviteBanner: 'A friend invited you to Shemaxx!',
    inviteAnalyze: 'Analyze',
  },

  // Onboarding header
  onboarding: {
    close: 'Close',
  },

  // Step1
  step1: {
    title: 'Where are you in your looksmaxxing journey?',
    cta: 'Continue',
    options: [
      { label: 'Curious',       desc: 'I\'m starting to explore my potential and appearance.' },
      { label: 'Progressing',   desc: 'I already know some techniques and want to go further.' },
      { label: 'Determined',    desc: 'I want to reach my full potential and optimize every detail.' },
    ],
  },

  // Step2
  step2: {
    title: 'How old are you?',
    cta: 'Continue',
    unit: 'years old',
  },

  // Step3
  step3: {
    title: 'Which areas do you want to improve?',
    subtitle: 'You can select multiple options',
    cta: 'Continue',
    zones: [
      { label: 'Jawline'         },
      { label: 'Cheekbones'      },
      { label: 'Eyes'            },
      { label: 'Nose'            },
      { label: 'Improve everything' },
      { label: 'Other'           },
    ],
    otherPlaceholder: 'Describe what you want to improve...',
  },

  // Step4
  step4: {
    title: 'What type of result would you like to achieve?',
    cta: 'Continue',
    options: [
      { label: 'Natural',        desc: 'Slightly improve your appearance.' },
      { label: 'Glow up',        desc: 'Optimize your features and style.' },
      { label: 'Transformation', desc: 'Unlock your full aesthetic potential.' },
      { label: 'Elite',          desc: 'Reach an exceptional level of attractiveness.' },
    ],
  },

  // Step5
  step5: {
    cta: 'See my full analysis',
    discovering: 'Discovering your potential...',
    yourPotential: 'Your potential',
    currentScore: 'Current score',
    maxScore: 'Maximum score',
    gainLabel: 'potential progression points',
    unlockHint: 'Unlock full analysis to get your personalized advice',
    metrics: [
      'Facial symmetry',
      'Golden proportions',
      'Bone structure',
      'Skin quality',
      'Photogeny',
    ],
  },

  // Step6
  step6: {
    title: 'Accelerate your progress',
    subtitle: 'See how fast you can improve with the right techniques.',
    cta: 'Continue',
    withShemaxx: 'With Shemaxx',
    withoutGuide: 'Without guide',
    onlineTutos: 'Online tutorials',
    weeks: ['Week 1', 'Week 2', 'Week 3'],
    stat: 'more visible results in 3 weeks with Shemaxx AI analysis',
  },

  // Step7
  step7: {
    title: 'What should we call you?',
    cta: 'Continue',
    label: 'Enter your name',
    placeholder: 'E.g.: Sarah, Léa, Alex...',
    confirm: (name) => `Perfect, ${name}! Press Enter or "Continue" ↓`,
  },

  // Step8Photos
  step8Photos: {
    title: 'Let\'s analyze\nyour face',
    subtitle: 'Our AI will scan your face in real time.\nFollow the instructions below.',
    instructions: [
      { title: 'Take your selfie',         desc: 'Tap the button or upload a photo. Good lighting, face centered.' },
      { title: 'Make a circle with your head', desc: 'Slowly rotate your head in a full circle so the AI captures all angles.' },
      { title: 'Stay in frame',            desc: 'If your face leaves the frame, the analysis will pause.' },
    ],
    privacy: '🔒 Your data is never stored or shared',
    cta: 'Start the analysis',
  },

  // Step9Loading
  step9Loading: {
    metrics: ['Facial symmetry', 'Golden proportions', 'Facial harmony', 'Bone structure', 'Overall potential'],
    analyzing: 'Analyzing',
    almostDone: 'Finalizing...',
    complete: 'Analysis complete!',
    yourScore: 'Your score',
  },

  // Step9AnalyzingIA
  step9Analyzing: {
    title: 'AI Analysis',
    subtitle: 'Our artificial intelligence is interpreting your facial scan\nto prepare your personalized report.',
    nextStep: 'Next step: detailed processing of your face',
    steps: ['Facial symmetry', 'Golden proportions', 'Bone structure', 'Skin quality'],
    popup: {
      title: 'Analysis in progress',
      desc1: 'The analysis takes between ',
      duration: '1 to 2 minutes',
      desc2: '.\nPlease wait.',
      ok: 'OK',
    },
    errors: {
      configTitle: 'Missing configuration',
      configDetail: 'API key is not configured. Contact Shemaxx support.',
      analysisTitle: 'Analysis failed',
      retryBtn: 'Retry anyway',
      rescanBtn: '📸 Redo the scan',
      timeoutDetail: 'The analysis took too long. Make sure you have a good Wi-Fi connection.',
      networkDetail: 'Unexpected error. Try again with your face well centered in the circle.',
      authDetail: 'Server connection issue. Check your internet connection.',
      badLighting: { title: 'Insufficient lighting', detail: 'The AI can\'t see your features clearly. Face a light source (window or lamp in front of you), avoid backlighting.', tips: ['Face a window or lamp', 'Avoid backlight', 'Prefer natural daylight'] },
      blurry:      { title: 'Image too blurry',     detail: 'The image is too blurry to analyze your face. Clean your camera lens and hold still during the scan.', tips: ['Clean your camera lens', 'Stay still during the scan', 'Move a little closer to the screen'] },
      badAngle:    { title: 'Incorrect angle',       detail: 'Your face is too sideways or tilted. Look straight into the camera, head straight, face centered in the circle.', tips: ['Look straight into the camera', 'Head straight, not tilted', 'Face centered in the circle'] },
      noFace:      { title: 'No face detected',      detail: 'No clearly visible face in the image. Make sure your face is well lit and centered in the frame.', tips: ['Look straight into the camera', 'Head straight, not tilted', 'Face centered in the circle'] },
      howToFix: 'How to fix',
    },
  },

  // Step9Reveal
  step9Reveal: {
    badge: 'Full analysis',
    improvementsDetected: 'improvements',
    detected: 'detected',
    aiAnalyzed: 'Our AI analyzed your face in detail.',
    locked: 'Advice is locked — unlock it with Pro.',
    moreImprovements: 'And much more…',
    aiDetected: 'Our AI detected',
    totalLabel: '+ improvements in total',
    onlyVisible: '— only',
    areVisible: 'are visible here.',
    unlockFull: 'Unlock the full analysis to see everything.',
    fomoTitle: (pseudo) => pseudo ? `${pseudo}, your personalized advice is waiting 🔒` : 'Your personalized advice is waiting 🔒',
    fomoSub1: 'Each piece of advice is based on your real analysis.',
    fomoSub2: 'Unlock them now to start progressing.',
    cta: 'See what the AI found →',
    impact: { high: 'High impact', medium: 'Medium impact', low: 'To fix' },
  },

  // Step10 Paywall
  paywall: {
    cta: 'Pay & subscribe',
    processing: 'Processing...',
    priceLabel: '/week',
    perDay: 'per day',
    cancelAnytime: 'Cancel anytime',
    secure: 'Secure payment',
    slides: ['Your results card', 'Learn about yourself', 'Start progressing'],
    signupTitle: 'Create your account',
    signupSubtitle: 'To access your results',
    alreadyMember: 'Already a member?',
    signin: 'Sign in',
    unlockTitle: 'Unlock your results',
    unlockSub: 'Immediate access to your full analysis',
    features: [
      'Full facial analysis',
      'Detailed personalized advice',
      'Score and detailed ranking',
      'Access to all features',
    ],
    ranking: 'Global ranking',
    total: 'TOTAL',
  },

  // Step11 Results
  results: {
    tabs: { results: 'Results', analysis: 'Analysis', extras: 'AI Extras' },
    card: {
      globalRanking: 'Global ranking',
      total: 'TOTAL',
      beautyScore: 'Beauty score',
      addPhoto: 'Add your photo',
      metrics: ['Symmetry', 'Proportions', 'Eye impact', 'Face structure', 'Skin quality', 'Photogeny'],
    },
    scan: {
      newScan: 'New analysis',
      rescan: 'Redo analysis',
      freeScanUsed: 'Weekly analysis used',
      freeAvailable: '1 free analysis available!',
      scanAgain: 'Restart analysis',
      payScan: 'Analyze (€3.99)',
    },
    history: {
      title: 'History',
      noHistory: 'No analysis yet',
      noHistoryDesc: 'Start your first analysis to see your results here.',
      scanDate: 'Analysis from',
    },
    detail: {
      save: 'Save',
      share: 'Share',
      saving: 'Saving...',
      sharing: 'Sharing...',
      personalizedAdvice: 'Personalized advice',
      zoneAnalysis: 'Analysis by zone',
      tapToSeeScore: 'Tap a point to see your score',
    },
    extras: {
      title: 'AI Extras',
      subtitle: '€3.99 per use — unique AI-generated result.',
      tools: [
        { title: 'Who\'s the hottest?',        desc: 'Send a group photo — AI rates each girl based on looksmaxxing criteria (jaw, cheekbones, canthal tilt…).' },
        { title: 'Style transformation',       desc: 'Athlete, Old Money, Beach, Goth, Streetwear... See yourself in the style of your choice.' },
        { title: '10/10 version',              desc: 'AI generates your idealized version — perfect symmetry, golden proportions, full looksmaxx.' },
      ],
      payBtn: 'Unlock (€3.99)',
      paying: 'Redirecting...',
      groupRanking: {
        title: 'Who\'s the hottest?',
        import: 'Import a group photo',
        change: 'Change photo',
        analyze: 'Start analysis',
        analyzing: 'AI is analyzing faces...',
        analyzing2: 'Detection and scoring in progress',
        ranking: 'Looksmaxxing Ranking — hottest to least hot',
        noFace: 'No faces detected. Use a clear photo with faces clearly visible.',
        winner: ['Hottest 🔥', '2nd place', '3rd place'],
        restart: 'Start over with another photo',
        winReason: 'Why she wins',
      },
      styleTransform: {
        title: 'Style transformation',
        yourPhoto: 'Your photo',
        addPhoto: 'Add your photo (face forward)',
        chooseStyle: 'Choose your style',
        generate: 'Unlock your transformation',
        generating: 'Integration in progress...',
        before: 'BEFORE',
        after: 'AFTER',
        restart: 'Start over',
        save: 'Save ↓',
      },
      tenOutOfTen: {
        title: '10/10 version',
        import: 'Import your photo',
        change: 'Change photo',
        generate: 'Generate my 10/10 version',
        generating: 'Enhancement in progress (30–60 sec)...',
        generated: '10/10 version generated 🏆',
        desc: 'Perfect symmetry • Golden proportions • Maximum glow',
        restart: 'Start over',
        save: 'Save ↓',
        before: 'BEFORE',
        after: 'AFTER 🔥',
      },
    },
    settings: {
      title: 'My account',
      signout: 'Sign out',
      subscription: 'Active subscription',
      manage: 'Manage my subscription',
    },
    shareTitle: 'My Shemaxx analysis',
    shareMsg: (total) => `Total score: ${total}/100`,
    shareTitle2: 'My Shemaxx analysis 🔥',
    shareMsg2: (total) => `I scored ${total}/100 on Shemaxx!`,
  },
}

export default en
