import { Language } from '../types/simulation';

export interface TranslationDict {
  studioTitle: string;
  studioSubtitle: string;
  institutionBadge: string;
  langToggleLabel: string;
  reset: string;
  tabs: {
    m1Short: string;
    m1Full: string;
    m2Short: string;
    m2Full: string;
    m3Short: string;
    m3Full: string;
  };
  controls: {
    parametersHeading: string;
    playbackHeading: string;
    projectionAxis: string;
    axisVertical: string;
    axisHorizontal: string;
    axisDual: string;
    springOverlay: string;
    springOverlayDesc: string;
    amplitude: string;
    angularVelocity: string;
    initialPhase: string;
    phasePresets: string;
    presetEquilibrium: string;
    presetPosExtreme: string;
    presetNegEquilibrium: string;
    presetNegExtreme: string;
    secondParticle: string;
    secondParticleDesc: string;
    phaseTwo: string;
    phaseDiffPresets: string;
    inPhase: string;
    quadrature: string;
    outOfPhase: string;
    vectorLayers: string;
    displacementVec: string;
    velocityVec: string;
    accelerationVec: string;
    circlePhasors: string;
    quickInspect: string;
    jumpEquilibrium: string;
    jumpPosExtreme: string;
    play: string;
    pause: string;
    step15: string;
    slowMotion: string;
    dragHint: string;
  };
  units: {
    meter: string;
    radPerSec: string;
    meterPerSec: string;
    meterPerSecSq: string;
    rad: string;
    deg: string;
    sec: string;
    hz: string;
  };
  canvas: {
    referenceCircle: string;
    projectionTrack: string;
    springOscillator: string;
    lissajousSynthesis: string;
    waveformTrail: string;
    phasorDiagram: string;
    equilibriumBadge: string;
    posExtremeBadge: string;
    negExtremeBadge: string;
    particle1: string;
    particle2: string;
    shadow: string;
    phaseDiff: string;
    timeAxis: string;
    dragToInspect: string;
  };
  telemetry: {
    liveEquations: string;
    kinematicReadouts: string;
    phaseSummary: string;
    timeElapsed: string;
    periodAndFreq: string;
    totalPhase: string;
    displacement: string;
    velocity: string;
    acceleration: string;
    maxVelocity: string;
    maxAcceleration: string;
    diffEqLabel: string;
    generalSolution: string;
    simplifiedForm: string;
    phaseDifferenceLabel: string;
    inPhaseStatus: string;
    quadratureStatus: string;
    outOfPhaseStatus: string;
    generalDiffStatus: string;
    leadVelDisp: string;
    leadAccVel: string;
    leadAccDisp: string;
    m1ProofNote: string;
    m2ProofNote: string;
    m3ProofNote: string;
    atEquilibrium: string;
    atExtreme: string;
    inMotion: string;
    stateIndicator: string;
  };
}

export const TRANSLATIONS: Record<Language, TranslationDict> = {
  bn: {
    studioTitle: 'বৃত্তাকার গতির অভিক্ষেপ, দশা ও সরল ছন্দিত গতি ল্যাব',
    studioSubtitle: 'ইন্টারঅ্যাক্টিভ জ্যামিতিক ও কাইনেমেটিক সিমুলেশন',
    institutionBadge: 'উদ্ভাস',
    langToggleLabel: 'English',
    reset: 'রিসেট',
    tabs: {
      m1Short: 'মডিউল ১: লম্ব অভিক্ষেপ',
      m1Full: 'মডিউল ১: বৃত্তাকার গতির লম্ব অভিক্ষেপ',
      m2Short: 'মডিউল ২: আদি দশা ও সমীকরণ',
      m2Full: 'মডিউল ২: আদি দশা ও সমীকরণের রূপান্তর',
      m3Short: 'মডিউল ৩: বেগ, ত্বরণ ও ফেজর',
      m3Full: 'মডিউল ৩: বেগ, ত্বরণ ও ফেজর সম্পর্ক',
    },
    controls: {
      parametersHeading: 'গতির প্যারামিটার নিয়ন্ত্রণ',
      playbackHeading: 'প্লেব্যাক ও ধাপ নিয়ন্ত্রণ',
      projectionAxis: 'অভিক্ষেপ অক্ষ নির্বাচন',
      axisVertical: 'উল্লম্ব ব্যাস (Y-অক্ষ)',
      axisHorizontal: 'অনুভূমিক ব্যাস (X-অক্ষ)',
      axisDual: 'দ্বৈত অভিক্ষেপ (X ও Y)',
      springOverlay: 'স্প্রিং-ভর তুলনা প্রদর্শন',
      springOverlayDesc: 'ছায়া কণার সাথে সমলয় স্প্রিং দোলক দেখুন',
      amplitude: 'বিস্তার / ব্যাসার্ধ (A)',
      angularVelocity: 'কৌণিক বেগ (ω)',
      initialPhase: 'আদি দশা (δ)',
      phasePresets: 'আদি দশা প্রিসেট (t = 0)',
      presetEquilibrium: 'δ = 0° (সাম্যাবস্থা)',
      presetPosExtreme: 'δ = 90° (+A প্রান্ত)',
      presetNegEquilibrium: 'δ = 180° (সাম্যাবস্থা ↓)',
      presetNegExtreme: 'δ = 270° (-A প্রান্ত)',
      secondParticle: 'দ্বিতীয় কণা (P₂) তুলনা',
      secondParticleDesc: 'দশা পার্থক্য Δφ পর্যবেক্ষণের জন্য চালু করুন',
      phaseTwo: 'দ্বিতীয় কণার আদি দশা (δ₂)',
      phaseDiffPresets: 'দশা পার্থক্য প্রিসেট (Δφ)',
      inPhase: 'সমদশা (0°)',
      quadrature: 'সমকোণী (90°)',
      outOfPhase: 'বিপরীত দশা (180°)',
      vectorLayers: 'ভেক্টর ও ফেজর স্তর',
      displacementVec: 'সরণ ভেক্টর (x / y)',
      velocityVec: 'বেগ ভেক্টর (v)',
      accelerationVec: 'ত্বরণ ভেক্টর (a)',
      circlePhasors: 'বৃত্তাকার স্পর্শক ও কেন্দ্রমুখী ভেক্টর',
      quickInspect: 'বিশেষ অবস্থান পরিদর্শন',
      jumpEquilibrium: 'সাম্যাবস্থায় যান (x = 0)',
      jumpPosExtreme: 'প্রান্তবিন্দুতে যান (x = +A)',
      play: 'চালান',
      pause: 'থামান',
      step15: '+১৫° ধাপ',
      slowMotion: 'ধীর গতি (০.২৫×)',
      dragHint: 'যেকোনো কোণ দেখতে নির্দেশক বৃত্তের কণাটি মাউস বা টাচ দিয়ে টানুন।',
    },
    units: {
      meter: 'm',
      radPerSec: 'rad/s',
      meterPerSec: 'm/s',
      meterPerSecSq: 'm/s²',
      rad: 'rad',
      deg: '°',
      sec: 's',
      hz: 'Hz',
    },
    canvas: {
      referenceCircle: 'নির্দেশক বৃত্ত (Reference Circle)',
      projectionTrack: 'অভিক্ষেপ অক্ষ (SHM Track)',
      springOscillator: 'সমলয় স্প্রিং-ভর',
      lissajousSynthesis: 'দ্বৈত লিসাজাস সংশ্লেষণ (x² + y² = A²)',
      waveformTrail: 'তাৎক্ষণিক তরঙ্গ লেখচিত্র',
      phasorDiagram: 'ঘূর্ণায়মান ফেজর চিত্র',
      equilibriumBadge: 'সাম্যাবস্থা: x = 0 | বেগ সর্বোচ্চ | ত্বরণ শূন্য',
      posExtremeBadge: 'ধনাত্মক প্রান্ত (+A): বেগ শূন্য | ত্বরণ সর্বোচ্চ (-ω²A)',
      negExtremeBadge: 'ঋণাত্মক প্রান্ত (-A): বেগ শূন্য | ত্বরণ সর্বোচ্চ (+ω²A)',
      particle1: 'P₁',
      particle2: 'P₂',
      shadow: "P'",
      phaseDiff: 'Δφ',
      timeAxis: 'সময় / দশা',
      dragToInspect: 'কণা টেনে কোণ পরিবর্তন করুন',
    },
    telemetry: {
      liveEquations: 'লাইভ সমীকরণ বিশ্লেষণ',
      kinematicReadouts: 'তাৎক্ষণিক কাইনেমেটিক মান',
      phaseSummary: 'দশা ও ফেজর সম্পর্ক',
      timeElapsed: 'অতিবাহিত সময় (t)',
      periodAndFreq: 'পর্যায়কাল (T) ও কম্পাঙ্ক (f)',
      totalPhase: 'মোট দশা (θ = ωt + δ)',
      displacement: 'তাৎক্ষণিক সরণ',
      velocity: 'তাৎক্ষণিক বেগ',
      acceleration: 'তাৎক্ষণিক ত্বরণ',
      maxVelocity: 'সর্বোচ্চ বেগ (v_max = ωA)',
      maxAcceleration: 'সর্বোচ্চ ত্বরণ (a_max = ω²A)',
      diffEqLabel: 'সরল ছন্দিত গতির ব্যবকলনীয় সমীকরণ',
      generalSolution: 'সাধারণ সমাধান (মান বসানো রূপ)',
      simplifiedForm: 'সরলীকৃত ত্রিকোণমিতিক রূপ',
      phaseDifferenceLabel: 'দুই কণার দশা পার্থক্য (Δφ)',
      inPhaseStatus: 'সমদশা (একসাথে একই দিকে দোলন)',
      quadratureStatus: '৯০° দশা পার্থক্য (একটি সাম্যাবস্থায়, অন্যটি প্রান্তে)',
      outOfPhaseStatus: 'বিপরীত দশা (সর্বদা পরস্পর বিপরীতমুখী)',
      generalDiffStatus: 'নির্দিষ্ট কৌণিক ব্যবধানে দোলনরত',
      leadVelDisp: 'বেগ (v) সরণ (x)-এর চেয়ে π/2 বা 90° দশায় এগিয়ে থাকে।',
      leadAccVel: 'ত্বরণ (a) বেগ (v)-এর চেয়ে π/2 বা 90° দশায় এগিয়ে থাকে।',
      leadAccDisp: 'ত্বরণ (a) সরণ (x)-এর চেয়ে π বা 180° বিপরীত দশায় থাকে (a = -ω²x)।',
      m1ProofNote: 'সুষম বৃত্তাকার গতিতে ঘূর্ণায়মান কণা P-এর ব্যাসের ওপর লম্ব অভিক্ষেপ P′ সর্বদা সরল ছন্দিত গতিতে (SHM) স্পন্দিত হয়।',
      m2ProofNote: 't = 0 সময়ে কণাটির প্রাথমিক অবস্থান আদি দশা δ নির্ধারণ করে, যা তরঙ্গকে ডানে বা বামে স্থানান্তরিত করে।',
      m3ProofNote: 'বৃত্তাকার গতির স্পর্শকীয় বেগ ωA এবং কেন্দ্রমুখী ত্বরণ ω²A-এর অক্ষ বরাবর উপাংশই সরল ছন্দিত গতির বেগ ও ত্বরণ দেয়।',
      atEquilibrium: 'সাম্যাবস্থা (Equilibrium)',
      atExtreme: 'প্রান্তবিন্দু (Extreme)',
      inMotion: 'দোলনরত (Oscillating)',
      stateIndicator: 'বর্তমান অবস্থা',
    },
  },
  en: {
    studioTitle: 'Circular Motion Projection, Phase & SHM Kinematics Studio',
    studioSubtitle: 'Interactive Geometric & Kinematic Visualization',
    institutionBadge: 'উদ্ভাস',
    langToggleLabel: 'বাংলা',
    reset: 'Reset',
    tabs: {
      m1Short: 'Module 1: Orthogonal Projection',
      m1Full: 'Module 1: Uniform Circular Motion Projection',
      m2Short: 'Module 2: Initial Phase & Equation',
      m2Full: 'Module 2: Initial Phase & Equation Solution',
      m3Short: 'Module 3: Velocity, Accel & Phasors',
      m3Full: 'Module 3: Velocity, Acceleration & Phasor Vectors',
    },
    controls: {
      parametersHeading: 'Motion Parameters',
      playbackHeading: 'Playback & Inspection',
      projectionAxis: 'Projection Axis',
      axisVertical: 'Vertical Diameter (Y-axis)',
      axisHorizontal: 'Horizontal Diameter (X-axis)',
      axisDual: 'Dual Projection (X & Y)',
      springOverlay: 'Synchronized Mass-Spring Overlay',
      springOverlayDesc: 'Compare shadow P′ with a physical spring oscillator',
      amplitude: 'Amplitude / Radius (A)',
      angularVelocity: 'Angular Velocity (ω)',
      initialPhase: 'Initial Phase (δ)',
      phasePresets: 'Initial Phase Presets (t = 0)',
      presetEquilibrium: 'δ = 0° (Equilibrium)',
      presetPosExtreme: 'δ = 90° (+A Extreme)',
      presetNegEquilibrium: 'δ = 180° (Equilibrium ↓)',
      presetNegExtreme: 'δ = 270° (-A Extreme)',
      secondParticle: 'Second Particle (P₂) Comparator',
      secondParticleDesc: 'Enable to inspect phase difference Δφ',
      phaseTwo: 'Particle 2 Initial Phase (δ₂)',
      phaseDiffPresets: 'Phase Difference Presets (Δφ)',
      inPhase: 'In-Phase (0°)',
      quadrature: 'Quadrature (90°)',
      outOfPhase: 'Out-of-Phase (180°)',
      vectorLayers: 'Phasor & Vector Layers',
      displacementVec: 'Displacement Vector (x / y)',
      velocityVec: 'Velocity Vector (v)',
      accelerationVec: 'Acceleration Vector (a)',
      circlePhasors: 'Tangential & Centripetal Vectors',
      quickInspect: 'Landmark Inspection',
      jumpEquilibrium: 'Equilibrium (x = 0)',
      jumpPosExtreme: 'Extreme (+A)',
      play: 'Play',
      pause: 'Pause',
      step15: 'Step +15°',
      slowMotion: 'Slow Motion (0.25×)',
      dragHint: 'Drag particle P directly on the reference circle to inspect any angle.',
    },
    units: {
      meter: 'm',
      radPerSec: 'rad/s',
      meterPerSec: 'm/s',
      meterPerSecSq: 'm/s²',
      rad: 'rad',
      deg: '°',
      sec: 's',
      hz: 'Hz',
    },
    canvas: {
      referenceCircle: 'Reference Circle',
      projectionTrack: 'Projection Track (SHM)',
      springOscillator: 'Mass-Spring',
      lissajousSynthesis: 'Dual Synthesis (x² + y² = A²)',
      waveformTrail: 'Live Harmonic Waveform',
      phasorDiagram: 'Rotating Phasor Diagram',
      equilibriumBadge: 'Equilibrium: x = 0 | |v| = v_max | a = 0',
      posExtremeBadge: 'Positive Extreme (+A): v = 0 | a = -ω²A',
      negExtremeBadge: 'Negative Extreme (-A): v = 0 | a = +ω²A',
      particle1: 'P₁',
      particle2: 'P₂',
      shadow: "P'",
      phaseDiff: 'Δφ',
      timeAxis: 'Time / Phase',
      dragToInspect: 'Drag particle to inspect angle',
    },
    telemetry: {
      liveEquations: 'Live Equation Solver',
      kinematicReadouts: 'Instantaneous Kinematics',
      phaseSummary: 'Phase Relationships',
      timeElapsed: 'Elapsed Time (t)',
      periodAndFreq: 'Period (T) & Frequency (f)',
      totalPhase: 'Total Phase (θ = ωt + δ)',
      displacement: 'Instantaneous Displacement',
      velocity: 'Instantaneous Velocity',
      acceleration: 'Instantaneous Acceleration',
      maxVelocity: 'Peak Velocity (v_max = ωA)',
      maxAcceleration: 'Peak Acceleration (a_max = ω²A)',
      diffEqLabel: 'SHM Differential Equation',
      generalSolution: 'Substituted General Solution',
      simplifiedForm: 'Simplified Trigonometric Form',
      phaseDifferenceLabel: 'Phase Difference (Δφ)',
      inPhaseStatus: 'In-Phase (Oscillating in unison)',
      quadratureStatus: 'Quadrature (90° phase offset)',
      outOfPhaseStatus: 'Out-of-Phase (180° opposite motion)',
      generalDiffStatus: 'Constant phase offset oscillation',
      leadVelDisp: 'Velocity (v) leads Displacement (x) by π/2 rad (90°).',
      leadAccVel: 'Acceleration (a) leads Velocity (v) by π/2 rad (90°).',
      leadAccDisp: 'Acceleration (a) leads Displacement (x) by π rad (180°): a = -ω²x.',
      m1ProofNote: 'The orthogonal shadow P′ of particle P in uniform circular motion executes exact Simple Harmonic Motion along the diameter.',
      m2ProofNote: 'Initial condition at t = 0 determines initial phase δ, horizontally shifting the harmonic wave.',
      m3ProofNote: 'Projecting circular tangential speed ωA and centripetal acceleration ω²A onto the axis yields SHM velocity and acceleration.',
      atEquilibrium: 'At Equilibrium',
      atExtreme: 'At Turning Point',
      inMotion: 'Oscillating',
      stateIndicator: 'Dynamic State',
    },
  },
};
