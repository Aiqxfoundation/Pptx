export type TransitionKind = 'fade' | 'push' | 'wipe' | 'cover' | 'split';

export interface SlideCard {
  title: string;
  body: string;
  accent: 'blue' | 'cyan' | 'amber' | 'emerald' | 'crimson' | 'slate';
  tag?: string;
}

export interface SlideCallout {
  label: string;
  text: string;
  accent: 'blue' | 'cyan' | 'amber' | 'emerald' | 'crimson';
}

export interface SlideEquation {
  formula: string;
  caption?: string;
  variables?: { symbol: string; meaning: string }[];
}

export interface SlideFlowStep {
  title: string;
  subtitle?: string;
  accent: 'blue' | 'cyan' | 'amber' | 'emerald';
}

export interface SlideTableRow {
  application: string;
  keyProcess: string;
  mainOutcome: string;
}

export interface SlideReference {
  citation: string;
  category: 'Textbook' | 'IUPAC Standard' | 'Review' | 'Primary Paper';
}

export interface SlideDefinition {
  id: number;
  kicker: string;
  title: string;
  subtitle?: string;
  layout:
    | 'title'
    | 'points-cards-diagram'
    | 'flow-points-diagram'
    | 'equation-scale'
    | 'points-diagram'
    | 'states-schematic'
    | 'diagram-points'
    | 'grid-6'
    | 'cards-3-diagram'
    | 'table-summary'
    | 'references';
  durationSec: number;
  transition: TransitionKind;
  presenterNote: string;
  points?: string[];
  equation?: SlideEquation;
  secondaryEquation?: SlideEquation;
  cards?: SlideCard[];
  callout?: SlideCallout;
  flowSteps?: SlideFlowStep[];
  tableRows?: SlideTableRow[];
  references?: SlideReference[];
  diagramTitle?: string;
  diagramCaption?: string;
  metadata?: {
    course: string;
    presenter: string;
    rollNo: string;
    supervisor: string;
    department: string;
  };
}

export const SLIDES: SlideDefinition[] = [
  {
    id: 1,
    kicker: 'Advanced Physical Chemistry',
    title: 'Energetics of Photochemical Reactions',
    subtitle: 'MPhil Physical Chemistry',
    layout: 'title',
    durationSec: 6.5,
    transition: 'fade',
    presenterNote:
      'Opening title slide introducing the MPhil Physical Chemistry seminar on photochemical energetics, from quantized photon absorption to solar energy conversion.',
    callout: {
      label: 'Scope',
      text: 'From photon absorption and excited states to energy conversion and photochemical applications',
      accent: 'cyan',
    },
    metadata: {
      course: 'MPhil Physical Chemistry',
      presenter: 'Saba Noor',
      rollNo: 'CHEM71F26S088',
      supervisor: 'Sir Touqeer Ahmad',
      department: 'Academic Presentation',
    },
  },
  {
    id: 2,
    kicker: 'Conceptual Foundation',
    title: 'Introduction to Photochemical Reactions',
    layout: 'points-cards-diagram',
    durationSec: 9.0,
    transition: 'push',
    presenterNote:
      'Distinguishes thermal activation on the ground-state potential-energy surface from photochemical activation via photon absorption into electronically excited states.',
    points: [
      'Photochemistry studies chemical and physical changes initiated when a molecule or material absorbs electromagnetic radiation.',
      'Absorption of a photon promotes the absorbing species from a lower-energy state to an electronically excited state.',
      'The excited state may emit light, dissipate energy, transfer energy or an electron, or undergo chemical transformation.',
      'Photochemical pathways can differ from thermal pathways because excitation changes the electronic configuration and potential-energy landscape.',
    ],
    cards: [
      {
        title: 'Thermal activation',
        tag: 'Ground-State Surface (S₀)',
        body: 'Energy is supplied mainly through molecular collisions and heat (kBT); the reaction proceeds on the ground-state surface.',
        accent: 'blue',
      },
      {
        title: 'Photochemical activation',
        tag: 'Excited-State Surface (S₁ / T₁)',
        body: 'Energy is supplied by absorbed photons (hν); a new excited-state pathway may become accessible.',
        accent: 'cyan',
      },
    ],
    callout: {
      label: 'Central Idea',
      text: 'Absorbed light energy is first stored as electronic excitation. Its subsequent fate determines whether chemistry occurs.',
      accent: 'amber',
    },
    diagramTitle: 'Thermal vs. Photochemical Energy Profiles',
    diagramCaption: 'Photon absorption accesses an excited surface, bypassing the ground-state thermal barrier.',
  },
  {
    id: 3,
    kicker: 'The Sequence from Light to Chemical Change',
    title: 'Fundamental Principles of Photochemistry',
    layout: 'flow-points-diagram',
    durationSec: 8.5,
    transition: 'wipe',
    presenterNote:
      'Outlines the Grotthuss–Draper absorption requirement and the kinetic competition governing quantum efficiency after excitation.',
    flowSteps: [
      { title: 'Photon absorption', subtitle: 'hν capture', accent: 'blue' },
      { title: 'Electronic excitation', subtitle: 'S₀ → Sₙ*', accent: 'cyan' },
      { title: 'Excited-state relaxation', subtitle: 'VR / IC / ISC', accent: 'amber' },
      { title: 'Energy / electron transfer', subtitle: 'Quenching / ET', accent: 'blue' },
      { title: 'Chemical transformation', subtitle: 'Photoproducts', accent: 'emerald' },
    ],
    points: [
      'A molecule can only be directly excited by radiation that it absorbs (Grotthuss–Draper principle).',
      'The absorption spectrum reflects allowed transitions and the distribution of molecular energy levels.',
      'After excitation, several competing pathways determine the quantum efficiency of the process.',
    ],
    callout: {
      label: 'Photochemical Principle',
      text: 'Absorption is necessary for direct photochemistry, but absorption alone does not guarantee reaction.',
      accent: 'cyan',
    },
    diagramTitle: 'Molecular Absorption Spectrum & Vibronic Bands',
    diagramCaption: 'Allowed transitions depend on spectral overlap and transition dipole selection rules.',
  },
  {
    id: 4,
    kicker: 'Quantized Electromagnetic Radiation',
    title: 'Nature and Energy of Photons',
    layout: 'equation-scale',
    durationSec: 8.5,
    transition: 'push',
    presenterNote:
      'Connects the Planck–Einstein relation for a single photon to molar photon energy (one einstein) across the UV, visible, and IR spectrum.',
    equation: {
      formula: 'E = hν = hc / λ',
      caption: 'Single-photon energy relation',
      variables: [
        { symbol: 'h', meaning: 'Planck constant (6.626 × 10⁻³⁴ J·s)' },
        { symbol: 'ν', meaning: 'frequency (s⁻¹)' },
        { symbol: 'c', meaning: 'speed of light (2.998 × 10⁸ m·s⁻¹)' },
        { symbol: 'λ', meaning: 'wavelength (m or nm)' },
      ],
    },
    secondaryEquation: {
      formula: 'Eₘ = Nₐhc / λ',
      caption: 'For molar photon energy (1 Einstein = 1 mol photons)',
    },
    callout: {
      label: 'Key Relationship',
      text: 'Photon energy increases with frequency and decreases with wavelength.',
      accent: 'amber',
    },
    diagramTitle: 'Relative Photon Energy Across Electromagnetic Spectrum',
    diagramCaption: 'Increasing frequency (ν) → Increasing photon energy (E) · Shorter λ → Higher chemical driving force.',
  },
  {
    id: 5,
    kicker: 'Franck–Condon Picture',
    title: 'Energy Absorption and Electronic Excitation',
    layout: 'points-diagram',
    durationSec: 9.0,
    transition: 'fade',
    presenterNote:
      'Explains why electronic transitions occur vertically on a potential-energy diagram (~10⁻¹⁵ s) prior to nuclear relaxation (~10⁻¹³ s).',
    points: [
      'Electronic absorption is extremely rapid (~10⁻¹⁵ s) compared with nuclear motion (~10⁻¹³ s).',
      'The nuclei are therefore approximately fixed during the transition: the Franck–Condon principle.',
      'Absorption is represented as a vertical transition on a potential-energy diagram.',
      'The molecule is commonly formed in a vibrationally excited level of the electronic excited state.',
      'Vibrational relaxation then redistributes excess vibrational energy to the surroundings.',
    ],
    diagramTitle: 'Franck–Condon Potential-Energy Well Diagram',
    diagramCaption: 'Vertical S₀ (v=0) → S₁* (v′=2) excitation followed by rapid vibrational relaxation to v′=0.',
  },
  {
    id: 6,
    kicker: 'Singlet and Triplet Manifolds',
    title: 'Molecular Electronic Energy States',
    layout: 'states-schematic',
    durationSec: 9.0,
    transition: 'push',
    presenterNote:
      'Defines spin multiplicity in closed-shell ground singlets (S₀), excited singlets (S₁, S₂), and Hund-stabilized triplet states (T₁).',
    cards: [
      {
        title: 'Ground singlet state (S₀)',
        tag: 'S = 0, Multiplicity = 1',
        body: 'The lowest-energy electronic state; electrons are paired (↑↓) in the usual closed-shell case.',
        accent: 'blue',
      },
      {
        title: 'Excited singlet states (S₁, S₂)',
        tag: 'Spin-Allowed Excitation',
        body: 'Excited states with the same overall spin multiplicity as S₀; commonly populated by allowed absorption.',
        accent: 'cyan',
      },
      {
        title: 'Triplet state (T₁)',
        tag: 'S = 1, Multiplicity = 3',
        body: 'An excited state with two unpaired electron spins aligned (↑↑); often longer-lived than singlet states.',
        accent: 'amber',
      },
    ],
    callout: {
      label: 'Interpretation',
      text: 'State ordering and energy gaps depend on molecular structure, solvent, and environment.',
      accent: 'cyan',
    },
    diagramTitle: 'Singlet & Triplet Manifolds with Spin Pairing',
    diagramCaption: 'Exchange stabilization typically places T₁ below S₁ (Hund’s rule).',
  },
  {
    id: 7,
    kicker: 'Photophysical Pathways',
    title: 'Jablonski Diagram and Its Interpretation',
    layout: 'diagram-points',
    durationSec: 10.0,
    transition: 'split',
    presenterNote:
      'Maps all radiative and non-radiative transitions between S₀, S₁, S₂, and T₁ and connects their competition to reaction quantum yield.',
    points: [
      'Absorption promotes S₀ to an excited singlet state.',
      'Vibrational relaxation and internal conversion dissipate excess energy without photon emission.',
      'Intersystem crossing transfers population from a singlet to a triplet state.',
      'Fluorescence and phosphorescence are radiative pathways; their competition with chemistry affects quantum yield.',
    ],
    callout: {
      label: 'Diagram Note',
      text: 'Arrows are schematic; actual rates and state ordering are molecule-dependent.',
      accent: 'amber',
    },
    diagramTitle: 'Jablonski Photophysical Energy-Level Diagram',
    diagramCaption: 'Solid vertical arrows indicate radiative processes; dashed/wavy arrows denote non-radiative relaxation.',
  },
  {
    id: 8,
    kicker: 'How Excited Molecules Lose or Transfer Energy',
    title: 'Photophysical Processes',
    layout: 'grid-6',
    durationSec: 9.5,
    transition: 'wipe',
    presenterNote:
      'Summarizes the six primary photophysical deactivation and transfer channels that compete directly with productive photochemistry.',
    cards: [
      {
        title: 'Vibrational relaxation',
        tag: 'Non-radiative · ~10⁻¹² s',
        body: 'Loss of excess vibrational energy within the same electronic state.',
        accent: 'blue',
      },
      {
        title: 'Internal conversion',
        tag: 'ΔS = 0 · ~10⁻¹²–10⁻¹¹ s',
        body: 'Non-radiative transition between electronic states of the same spin multiplicity.',
        accent: 'cyan',
      },
      {
        title: 'Intersystem crossing',
        tag: 'ΔS ≠ 0 · ~10⁻¹⁰–10⁻⁶ s',
        body: 'Non-radiative transition between states of different spin multiplicity.',
        accent: 'amber',
      },
      {
        title: 'Fluorescence',
        tag: 'S₁ → S₀ · ~10⁻⁹–10⁻⁷ s',
        body: 'Photon emission, commonly S₁ → S₀; typically fast.',
        accent: 'blue',
      },
      {
        title: 'Phosphorescence',
        tag: 'T₁ → S₀ · ~10⁻³–10⁰ s',
        body: 'Emission involving a triplet-to-singlet transition; often slower.',
        accent: 'crimson',
      },
      {
        title: 'Quenching / transfer',
        tag: 'Bimolecular · kq[Q]',
        body: 'Deactivation by collision, energy transfer, or electron transfer to another species.',
        accent: 'emerald',
      },
    ],
    callout: {
      label: 'Why It Matters',
      text: 'Photochemical efficiency depends on the fraction of excited molecules that reach a reactive state rather than deactivate.',
      accent: 'cyan',
    },
  },
  {
    id: 9,
    kicker: 'Why Excited States Can Change Reactivity',
    title: 'Excited-State Energy and Reaction Pathways',
    layout: 'flow-points-diagram',
    durationSec: 9.5,
    transition: 'push',
    presenterNote:
      'Shows how orbital redistribution alters bond orders, geometries, pKa, and redox potentials, enabling photoisomerization and photodissociation.',
    flowSteps: [
      { title: 'Absorbed photon', subtitle: 'hν input', accent: 'blue' },
      { title: 'Excited molecule', subtitle: 'New MO occupancy', accent: 'cyan' },
      { title: 'Reactive configuration', subtitle: 'Altered geometry', accent: 'amber' },
      { title: 'Product formation', subtitle: 'New chemical bonds', accent: 'emerald' },
    ],
    points: [
      'Electronic excitation changes electron distribution and may weaken or strengthen particular bonds.',
      'Excited states can have different geometries, dipole moments, acid–base properties, and redox potentials from the ground state.',
      'A molecule may undergo isomerization, bond cleavage, cycloaddition, rearrangement, or electron transfer.',
      'Reaction outcomes depend on excited-state lifetime, energy, geometry, solvent, and the availability of competing pathways.',
    ],
    cards: [
      {
        title: 'Example: photoisomerization',
        body: 'Light can convert a molecular isomer into another isomer through an excited-state pathway.',
        accent: 'cyan',
      },
      {
        title: 'Example: photodissociation',
        body: 'Excitation can populate a state with reduced bond order, allowing bond cleavage.',
        accent: 'amber',
      },
    ],
    diagramTitle: 'Photoisomerization & Bond-Order Reduction',
    diagramCaption: 'π → π* excitation lowers rotational barrier; σ → σ* excitation reduces bond order to zero.',
  },
  {
    id: 10,
    kicker: 'Energy Input, Relaxation, and Chemical Change',
    title: 'Energetics of Photochemical Reactions',
    layout: 'cards-3-diagram',
    durationSec: 9.0,
    transition: 'cover',
    presenterNote:
      'Quantifies the excitation energy ΔE and illustrates why relaxation reduces the energy available to chemistry relative to the absorbed photon.',
    equation: {
      formula: 'ΔE = E(excited) − E(ground)',
      caption: 'Electronic excitation energy balance',
    },
    points: [
      'The absorbed photon supplies the energy required for an electronic transition.',
      'The initially excited molecule often relaxes before reacting; therefore, the energy available to chemistry may be lower than the photon energy.',
      'Photochemical activation can bypass a high ground-state thermal barrier by accessing a different potential-energy surface.',
      'The reaction may still be limited by excited-state barriers, spin restrictions, or rapid deactivation.',
    ],
    cards: [
      {
        title: 'Photon energy',
        body: 'Sets the initial excitation energy and depends on wavelength.',
        accent: 'amber',
      },
      {
        title: 'Excited-state landscape',
        body: 'Determines accessible geometries, intermediates, and reaction pathways.',
        accent: 'cyan',
      },
      {
        title: 'Energy dissipation',
        body: 'Radiative and non-radiative processes compete with productive chemistry.',
        accent: 'blue',
      },
    ],
    diagramTitle: 'Photochemical Energy Budget',
    diagramCaption: 'Relaxation losses (VR/IC/ISC) leave a thermally equilibrated excited state to drive chemistry.',
  },
  {
    id: 11,
    kicker: 'Ground- and Excited-State Pathways',
    title: 'Potential-Energy Surfaces and Reaction Coordinates',
    layout: 'points-diagram',
    durationSec: 9.0,
    transition: 'fade',
    presenterNote:
      'Introduces multidimensional potential-energy surfaces, excited-state minima, barriers, and conical intersections as ultrafast non-radiative funnels.',
    points: [
      'A potential-energy surface (PES) describes how molecular energy varies with nuclear coordinates.',
      'Photochemical excitation transfers the system from the ground-state surface to an excited-state surface.',
      'The excited-state surface may contain minima, barriers, and crossing regions that guide reaction dynamics.',
      'Conical intersections can provide efficient non-radiative pathways between electronic states.',
      'A simplified one-dimensional reaction coordinate is useful for teaching, but real molecular PESs are multidimensional.',
    ],
    diagramTitle: 'Schematic PES with Conical Intersection (CI)',
    diagramCaption: 'Photoexcitation accesses S₁; a conical intersection funnels population back to S₀ or forward to product.',
  },
  {
    id: 12,
    kicker: 'A Measure of Photochemical Efficiency',
    title: 'Quantum Yield and Its Significance',
    layout: 'points-cards-diagram',
    durationSec: 9.5,
    transition: 'wipe',
    presenterNote:
      'Defines photochemical quantum yield Φ, distinguishes Φ < 1 deactivation from Φ > 1 chain propagation, and highlights proper actinometry.',
    equation: {
      formula: 'Φ = (number of defined events) / (number of photons absorbed)',
      caption: 'For a reaction: Φᵣ = molecules reacted / photons absorbed',
    },
    points: [
      'For a reaction, Φᵣ = molecules reacted / photons absorbed.',
      'The event must be defined clearly: reaction, product formation, fluorescence, or another process.',
      'Φ < 1 often indicates that some excited molecules deactivate without the measured event.',
      'Φ > 1 is possible in chain reactions, where one initiating photon leads to multiple reaction events.',
    ],
    cards: [
      {
        title: 'Low quantum yield (Φ < 1)',
        body: 'Non-productive relaxation, quenching, or competing pathways reduce the number of reaction events.',
        accent: 'crimson',
      },
      {
        title: 'High quantum yield (Φ ≥ 1)',
        body: 'Efficient productive pathways, or chain propagation, can increase the number of events per absorbed photon.',
        accent: 'emerald',
      },
    ],
    callout: {
      label: 'Measurement Caution',
      text: 'Use absorbed photons, not simply incident photons, in the denominator.',
      accent: 'amber',
    },
    diagramTitle: 'Kinetic Branching & Quantum Yield Regimes',
    diagramCaption: 'Φᵣ = kᵣ / (kᵣ + k_f + k_ic + k_isc + k_q[Q])',
  },
  {
    id: 13,
    kicker: 'Molecular and Experimental Controls',
    title: 'Factors Affecting Photochemical Energetics',
    layout: 'grid-6',
    durationSec: 9.0,
    transition: 'push',
    presenterNote:
      'Details the six experimental and molecular levers that tune photochemical energetics, selectivity, and yield.',
    cards: [
      {
        title: 'Wavelength',
        tag: 'Spectral Control',
        body: 'Determines photon energy and which electronic transitions can be accessed.',
        accent: 'blue',
      },
      {
        title: 'Light intensity',
        tag: 'Photon Flux',
        body: 'Controls photon flux; reaction rate also depends on absorption and kinetic regime.',
        accent: 'cyan',
      },
      {
        title: 'Molecular structure',
        tag: 'Electronic Tuning',
        body: 'Controls absorption bands, state energies, spin–orbit coupling, and reactivity.',
        accent: 'amber',
      },
      {
        title: 'Solvent environment',
        tag: 'Medium Effects',
        body: 'Polarity, viscosity, and hydrogen bonding can shift state energies and alter rates.',
        accent: 'blue',
      },
      {
        title: 'Temperature',
        tag: 'Thermal Coupling',
        body: 'Influences thermal relaxation, diffusion, and activated steps.',
        accent: 'cyan',
      },
      {
        title: 'Oxygen / quenchers',
        tag: 'Triplet Sensitivity',
        body: 'Can deactivate excited states or participate in energy- and electron-transfer pathways.',
        accent: 'crimson',
      },
    ],
    callout: {
      label: 'Design Principle',
      text: 'Optimizing a photochemical system requires matching the light source, absorber, reaction medium, and desired excited-state pathway.',
      accent: 'cyan',
    },
  },
  {
    id: 14,
    kicker: 'Natural Conversion of Solar Energy into Chemical Energy',
    title: 'Advanced Application I: Photosynthesis',
    layout: 'flow-points-diagram',
    durationSec: 10.0,
    transition: 'wipe',
    presenterNote:
      'Connects antenna excitation transfer, PSII water splitting, proton-motive ATP synthesis, and PSI NADPH generation via the Z-scheme.',
    flowSteps: [
      { title: 'Light + PSII', subtitle: 'P680 excitation', accent: 'blue' },
      { title: 'Water oxidation', subtitle: 'O₂ + 4 H⁺ + 4 e⁻', accent: 'cyan' },
      { title: 'ETC + proton gradient', subtitle: 'Proton-motive force', accent: 'amber' },
      { title: 'Light + PSI', subtitle: 'P700 excitation', accent: 'blue' },
      { title: 'NADP⁺ reduction', subtitle: 'NADPH formed', accent: 'emerald' },
    ],
    points: [
      'Chlorophyll and accessory pigments absorb photons in the light-harvesting antenna.',
      'Excitation energy is transferred to reaction-centre chlorophyll, where charge separation initiates electron transport.',
      'In oxygenic photosynthesis, Photosystem II extracts electrons from water, releasing O₂ and protons.',
      'Electron transport contributes to a proton-motive force used by ATP synthase; Photosystem I supports the formation of NADPH.',
      'ATP and NADPH provide chemical energy and reducing power for carbon fixation.',
    ],
    equation: {
      formula: '2 H₂O → O₂ + 4 H⁺ + 4 e⁻',
      caption: 'Oxygenic water oxidation at PSII',
    },
    cards: [
      {
        title: 'ATP',
        body: 'Made using the proton gradient across the thylakoid membrane.',
        accent: 'cyan',
      },
      {
        title: 'NADPH',
        body: 'Provides reducing equivalents for carbon fixation.',
        accent: 'amber',
      },
    ],
    callout: {
      label: 'Energetic Significance',
      text: 'Light-driven charge separation stores solar energy in electrochemical and chemical form.',
      accent: 'emerald',
    },
    diagramTitle: 'Photosynthetic Z-Scheme Redox Profile',
    diagramCaption: 'Dual photoexcitation at PSII and PSI elevates electrons from H₂O/O₂ (+0.82 V) to NADP⁺/NADPH (−0.32 V).',
  },
  {
    id: 15,
    kicker: 'Semiconductor Excitation and Surface Redox Chemistry',
    title: 'Advanced Application II: Photocatalysis',
    layout: 'points-diagram',
    durationSec: 9.0,
    transition: 'push',
    presenterNote:
      'Explains semiconductor band-gap excitation (hν ≥ Eg), electron/hole redox catalysis, and recombination losses.',
    points: [
      'A semiconductor absorbs photons with energy equal to or greater than its band gap (hν ≥ E_g).',
      'An electron is promoted from the valence band (VB) to the conduction band (CB), leaving a hole (h⁺) in the VB.',
      'Conduction-band electrons can drive reduction reactions; valence-band holes can drive oxidation reactions.',
      'Charge recombination competes with surface chemistry and reduces photocatalytic efficiency.',
      'Performance depends on band-edge positions, light harvesting, surface area, cocatalysts, and charge-carrier lifetime.',
    ],
    callout: {
      label: 'Applications',
      text: 'Pollutant degradation, water treatment, air purification, and solar-fuel research.',
      accent: 'amber',
    },
    diagramTitle: 'Semiconductor Band-Gap Excitation & Redox Model',
    diagramCaption: 'hν ≥ E_g generates CB electrons (e⁻) for reduction and VB holes (h⁺) for oxidation.',
  },
  {
    id: 16,
    kicker: 'Photovoltaic Generation of Electrical Power',
    title: 'Advanced Application III: Solar Energy Conversion',
    layout: 'flow-points-diagram',
    durationSec: 9.5,
    transition: 'cover',
    presenterNote:
      'Covers photovoltaic carrier generation, charge separation across built-in fields, Shockley–Queisser loss channels, and band-gap trade-offs.',
    flowSteps: [
      { title: 'Sunlight (hν)', subtitle: 'Solar spectrum', accent: 'amber' },
      { title: 'Absorber excitation', subtitle: 'e⁻/h⁺ generation', accent: 'cyan' },
      { title: 'Charge separation', subtitle: 'Built-in E-field', accent: 'blue' },
      { title: 'Contacts collect charge', subtitle: 'Selective layers', accent: 'cyan' },
      { title: 'External circuit', subtitle: 'Electrical work', accent: 'emerald' },
    ],
    points: [
      'A photovoltaic absorber captures photons and generates electron–hole pairs.',
      'A built-in electric field or selective charge-transport layers help separate the carriers.',
      'Electrons and holes are collected at different contacts, creating a usable photovoltage and current.',
      'Energy losses include reflection, transmission, thermalization of excess photon energy, and charge recombination.',
      'The absorber band gap governs the spectral range absorbed and constrains the voltage–current trade-off.',
    ],
    cards: [
      {
        title: 'Useful output',
        body: 'Electrical power delivered to an external load.',
        accent: 'cyan',
      },
      {
        title: 'Main losses',
        body: 'Recombination and incomplete use of the solar spectrum.',
        accent: 'crimson',
      },
    ],
    callout: {
      label: 'Energetic Significance',
      text: 'Efficient solar conversion requires both absorption of suitable photons and selective collection of separated charges.',
      accent: 'amber',
    },
    diagramTitle: 'Photovoltaic p–n Junction & Loss Channels',
    diagramCaption: 'Thermalization (hν > E_g) and transmission (hν < E_g) limit single-junction efficiency.',
  },
  {
    id: 17,
    kicker: 'Using Excited States to Access New Reaction Pathways',
    title: 'Advanced Application IV: Photochemical Synthesis',
    layout: 'flow-points-diagram',
    durationSec: 9.0,
    transition: 'push',
    presenterNote:
      'Demonstrates synthetic orthogonality of excited-state reactivity (photocycloadditions, photoredox catalysis) and photoreactor engineering parameters.',
    flowSteps: [
      { title: 'Reactant + light', subtitle: 'Direct or sensitizer', accent: 'blue' },
      { title: 'Excited intermediate', subtitle: 'S₁* / T₁* / radical ion', accent: 'cyan' },
      { title: 'Bond / electron reorganization', subtitle: 'New selectivity', accent: 'amber' },
      { title: 'Product', subtitle: 'Strained / chiral targets', accent: 'emerald' },
    ],
    points: [
      'Photochemical synthesis uses light to generate reactive excited states from selected substrates or photosensitizers.',
      'Excited molecules may undergo bond cleavage, cycloaddition, rearrangement, isomerization, or photoinduced electron transfer.',
      'Because excited-state electronic structures differ from ground states, light can enable selectivity or transformations not readily achieved thermally.',
      'Wavelength, solvent, concentration, sensitizer, oxygen content, and reactor geometry influence conversion and product distribution.',
    ],
    cards: [
      {
        title: 'Representative transformations',
        body: 'Photoisomerization • photocycloaddition • photochemical rearrangement • photoredox reactions',
        accent: 'amber',
      },
    ],
    callout: {
      label: 'Process Design',
      text: 'Photoreactors control photon delivery, optical path length, mixing, and heat removal.',
      accent: 'cyan',
    },
    diagramTitle: 'Excited-State [2+2] Cycloaddition & Photoredox Pathway',
    diagramCaption: 'Accesses thermally forbidden ring closures and mild single-electron transfer.',
  },
  {
    id: 18,
    kicker: 'Sunlight-Driven Atmospheric and Aquatic Chemistry',
    title: 'Advanced Application V: Environmental Photochemistry',
    layout: 'points-cards-diagram',
    durationSec: 9.0,
    transition: 'wipe',
    presenterNote:
      'Explains tropospheric NO₂ photolysis, third-body ozone formation, and aquatic direct/indirect pollutant phototransformation.',
    points: [
      'Solar radiation initiates photolysis of atmospheric molecules and dissolved contaminants.',
      'Photolysis of nitrogen dioxide generates nitric oxide and atomic oxygen.',
      'Atomic oxygen can react with molecular oxygen to form ozone; further radical chemistry controls ozone production and loss.',
      'In natural waters, direct photolysis and indirect reactions involving reactive intermediates can transform organic pollutants.',
      'Photochemical rates depend on sunlight spectrum, absorption cross-sections, quantum yields, and environmental composition.',
    ],
    cards: [
      {
        title: 'Step 1: Photolysis',
        tag: 'λ < 420 nm',
        body: 'NO₂ + hν → NO + O',
        accent: 'amber',
      },
      {
        title: 'Step 2: Ozone formation',
        tag: 'M = third body (N₂ / O₂)',
        body: 'O + O₂ + M → O₃ + M',
        accent: 'cyan',
      },
    ],
    callout: {
      label: 'Environmental Relevance',
      text: 'Photochemical reaction networks influence air quality, smog, and pollutant persistence.',
      accent: 'blue',
    },
    diagramTitle: 'Tropospheric NO₂–O₃ Cycle & Aquatic Photolysis',
    diagramCaption: 'Third body M carries away excess vibrational energy to stabilize newly formed O₃.',
  },
  {
    id: 19,
    kicker: 'Photosensitized Generation of Reactive Oxygen Species',
    title: 'Advanced Application VI: Photodynamic Therapy',
    layout: 'flow-points-diagram',
    durationSec: 9.5,
    transition: 'fade',
    presenterNote:
      'Illustrates clinical PDT mechanisms: photosensitizer excitation, intersystem crossing to ³PS*, and Type I radical vs. Type II singlet-oxygen pathways.',
    flowSteps: [
      { title: 'PS + hν', subtitle: 'Light absorption', accent: 'blue' },
      { title: '¹PS*', subtitle: 'Singlet state', accent: 'cyan' },
      { title: 'ISC', subtitle: 'Spin flip', accent: 'amber' },
      { title: '³PS*', subtitle: 'Long-lived triplet', accent: 'blue' },
      { title: 'ROS', subtitle: '¹O₂ / Radicals', accent: 'emerald' },
    ],
    points: [
      'Photodynamic therapy combines a photosensitizer, suitable light, and molecular oxygen.',
      'Light absorption produces an excited singlet photosensitizer; intersystem crossing may populate a longer-lived triplet state.',
      'The triplet state can react by Type I electron-transfer pathways or Type II energy transfer to oxygen.',
      'Type II energy transfer can produce singlet oxygen (¹O₂); Type I pathways can generate radical species.',
      'The localized photochemistry can damage targeted cells or tissue; clinical use requires controlled light delivery and medical supervision.',
    ],
    equation: {
      formula: 'Type II: ³PS* + ³O₂ → PS + ¹O₂',
      caption: 'Triplet–triplet energy transfer generating cytotoxic singlet oxygen',
    },
    cards: [
      {
        title: 'Type I',
        body: 'Electron / hydrogen transfer produces radical intermediates.',
        accent: 'blue',
      },
      {
        title: 'Type II',
        body: 'Energy transfer produces singlet oxygen.',
        accent: 'cyan',
      },
    ],
    callout: {
      label: 'Energetic Significance',
      text: 'Triplet-state yield and lifetime influence the efficiency of oxygen sensitization.',
      accent: 'amber',
    },
    diagramTitle: 'Type I & Type II Photosensitization Pathways',
    diagramCaption: 'Long-lived ³PS* enables efficient collisional energy or electron transfer to O₂.',
  },
  {
    id: 20,
    kicker: 'Solar-to-Chemical Fuel Conversion',
    title: 'Advanced Application VII: Photochemical Water Splitting',
    layout: 'points-cards-diagram',
    durationSec: 9.5,
    transition: 'push',
    presenterNote:
      'Covers photoelectrochemical water oxidation and proton reduction half-reactions, thermodynamic driving force (1.23 V), and kinetic overpotentials.',
    points: [
      'Photo-driven water splitting aims to store solar energy in the chemical bonds of hydrogen.',
      'A photoabsorber generates electrons and holes after absorbing photons of sufficient energy.',
      'Photogenerated holes drive water oxidation; electrons drive proton reduction to hydrogen.',
      'The ideal overall reaction is 2 H₂O → 2 H₂ + O₂.',
      'Real systems require suitable band-edge positions, catalysts, charge separation, stability, and additional driving force to overcome kinetic overpotentials.',
    ],
    cards: [
      {
        title: 'Oxidation at photoanode',
        body: '2 H₂O → O₂ + 4 H⁺ + 4 e⁻',
        accent: 'cyan',
      },
      {
        title: 'Reduction at photocathode',
        body: '4 H⁺ + 4 e⁻ → 2 H₂',
        accent: 'blue',
      },
      {
        title: 'Overall reaction',
        body: '2 H₂O → 2 H₂ + O₂',
        accent: 'amber',
      },
    ],
    callout: {
      label: 'Energy Requirement',
      text: 'The system must provide sufficient thermodynamic driving force (ΔE° = 1.23 V) plus kinetic overpotential.',
      accent: 'emerald',
    },
    diagramTitle: 'Photoelectrochemical (PEC) Water-Splitting Cell',
    diagramCaption: 'CB edge above H⁺/H₂ (0 V) and VB edge below O₂/H₂O (+1.23 V vs. NHE).',
  },
  {
    id: 21,
    kicker: 'One Principle, Multiple Energy-Conversion Outcomes',
    title: 'Comparative Analysis and Key Conclusions',
    layout: 'table-summary',
    durationSec: 10.0,
    transition: 'wipe',
    presenterNote:
      'Synthesizes all seven photochemical applications to show how one core energetic principle drives chemical, electrical, environmental, and biomedical outcomes.',
    tableRows: [
      {
        application: 'Photosynthesis',
        keyProcess: 'Pigment excitation + charge separation',
        mainOutcome: 'Chemical energy',
      },
      {
        application: 'Photocatalysis',
        keyProcess: 'Semiconductor e⁻/h⁺ generation',
        mainOutcome: 'Chemical conversion',
      },
      {
        application: 'Solar cells',
        keyProcess: 'Charge separation and collection',
        mainOutcome: 'Electrical energy',
      },
      {
        application: 'Photochemical synthesis',
        keyProcess: 'Excited-state bond / electron reorganization',
        mainOutcome: 'Molecular products',
      },
      {
        application: 'Environment',
        keyProcess: 'Photolysis and radical reaction networks',
        mainOutcome: 'Pollutant / atmospheric transformation',
      },
      {
        application: 'Photodynamic therapy',
        keyProcess: 'Triplet sensitization and ROS formation',
        mainOutcome: 'Localized photochemical effect',
      },
      {
        application: 'Water splitting',
        keyProcess: 'Photoinduced oxidation and reduction',
        mainOutcome: 'Hydrogen fuel',
      },
    ],
    callout: {
      label: 'Take-Home Message',
      text: 'Photochemical energetics links photon absorption to excited-state dynamics and explains how light can be converted into chemical, electrical, and biological work.',
      accent: 'cyan',
    },
  },
  {
    id: 22,
    kicker: 'Textbooks and Foundational Literature',
    title: 'Selected References',
    layout: 'references',
    durationSec: 8.5,
    transition: 'fade',
    presenterNote:
      'Provides the complete MPhil bibliography spanning physical chemistry textbooks, IUPAC photochemical nomenclature, and landmark papers.',
    references: [
      {
        category: 'Textbook',
        citation: 'Atkins, P., de Paula, J., & Keeler, J. (2018). Atkins’ Physical Chemistry (11th ed.). Oxford University Press.',
      },
      {
        category: 'Textbook',
        citation: 'Turro, N. J., Ramamurthy, V., & Scaiano, J. C. (2010). Modern Molecular Photochemistry of Organic Molecules. University Science Books.',
      },
      {
        category: 'Textbook',
        citation: 'Lakowicz, J. R. (2006). Principles of Fluorescence Spectroscopy (3rd ed.). Springer.',
      },
      {
        category: 'IUPAC Standard',
        citation: 'Braslavsky, S. E. (2007). Glossary of terms used in photochemistry (3rd edition). Pure and Applied Chemistry, 79(3), 293–465.',
      },
      {
        category: 'Review',
        citation: 'Schneider, J., et al. (2014). Understanding TiO₂ photocatalysis: mechanisms and materials. Chemical Reviews, 114(19), 9919–9986.',
      },
      {
        category: 'Primary Paper',
        citation: 'Fujishima, A., & Honda, K. (1972). Electrochemical photolysis of water at a semiconductor electrode. Nature, 238, 37–38.',
      },
      {
        category: 'Review',
        citation: 'Agostinis, P., et al. (2011). Photodynamic therapy of cancer: an update. CA: A Cancer Journal for Clinicians, 61(4), 250–281.',
      },
    ],
    callout: {
      label: 'Academic Note',
      text: 'Check the required citation style and verify bibliographic details against your university library before final submission.',
      accent: 'amber',
    },
  },
];
