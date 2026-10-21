/**
 * Safety Rules Engine for E-Waste Handling
 * Detects hazardous conditions (swollen/leaking batteries, smoke, exposed wiring, etc.)
 * Provides mandatory warnings and certified handling guidelines.
 */

export interface SafetyCheckResult {
  isHazardous: boolean;
  warnings: string[];
  handlingProtocols: string[];
  hazardType?: 'swollen_battery' | 'leaking_chemical' | 'exposed_wiring' | 'smoke_heat' | 'damaged_screen' | 'general_hazard';
}

const HAZARD_PATTERNS = [
  {
    type: 'swollen_battery' as const,
    regex: /(swoll|bulg|puffy|bloated|expand|popped).*(battery|power\s*bank|cell|pack)|(battery|power\s*bank|cell|pack).*(swoll|bulg|puffy|bloated|expand|popped)/i,
    warnings: [
      'CRITICAL: Swollen battery detected! This indicates internal chemical breakdown and risk of fire or thermal runaway.'
    ],
    protocols: [
      'DO NOT attempt to puncture, press, drop, or charge this battery.',
      'DO NOT throw this item into regular household trash.',
      'Place the item in a non-flammable container filled with sand or cat litter if available, away from combustible materials.',
      'Take it immediately to a specialized hazardous e-waste facility or certified recycler with battery containment.'
    ]
  },
  {
    type: 'leaking_chemical' as const,
    regex: /(leak|acid|corros|liquid|residue|white powder|crust).*(battery|power\s*bank|cell|pack)|(battery|power\s*bank|cell|pack).*(leak|acid|corros|liquid|residue)/i,
    warnings: [
      'DANGER: Chemical leakage detected. Battery electrolyte may be corrosive or toxic.'
    ],
    protocols: [
      'Do not touch leaking substances with bare hands. Use non-reactive gloves (nitrile/latex).',
      'Wash any skin contact area immediately with plenty of running water.',
      'Store in a sealed, labeled plastic or glass container away from direct sunlight.',
      'Hand over to an authorized hazardous waste reclamation center.'
    ]
  },
  {
    type: 'smoke_heat' as const,
    regex: /(smok|burn|heat|overheat|hot to touch|spark|flame|singe)/i,
    warnings: [
      'EMERGENCY RISK: Device emitting smoke, extreme heat, or sparks.'
    ],
    protocols: [
      'Immediately disconnect power and move the device outdoors onto a non-combustible surface if safe to do so.',
      'Do not inhale any vapors or smoke.',
      'Keep a Class ABC fire extinguisher or water/sand bucket nearby depending on device type.',
      'Allow to cool completely and notify emergency services if active fire starts.'
    ]
  },
  {
    type: 'exposed_wiring' as const,
    regex: /(exposed wire|frayed cable|bare copper|live wire|cut cable|chewed cord)/i,
    warnings: [
      'ELECTRICAL HAZARD: Exposed or frayed wiring detected.'
    ],
    protocols: [
      'Do not plug this cable or charger into any wall outlet.',
      'Do not touch bare metal wires while connected to an electrical source.',
      'Tape exposed ends with insulating electrical tape before transport to prevent short circuits.'
    ]
  },
  {
    type: 'damaged_screen' as const,
    regex: /(shattered glass|cracked screen|broken display|glass shards)/i,
    warnings: [
      'PHYSICAL INJURY HAZARD: Shattered glass or sharp broken casing.'
    ],
    protocols: [
      'Handle with protective gloves to avoid deep cuts from tempered glass or sharp shards.',
      'Cover cracked surface with clear packing tape to contain glass fragments.',
      'Transport in a sturdy cardboard box.'
    ]
  }
];

/**
 * Evaluates an input text description against built-in hazard safety rules.
 */
export function evaluateSafetyRules(text: string): SafetyCheckResult {
  if (!text || typeof text !== 'string') {
    return {
      isHazardous: false,
      warnings: [],
      handlingProtocols: [
        'Always handle obsolete electronics with care and keep away from moisture.',
        'Back up and erase personal data before handing over computers or phones.'
      ]
    };
  }

  const collectedWarnings: string[] = [];
  const collectedProtocols: string[] = [];
  let primaryHazard: SafetyCheckResult['hazardType'];

  for (const pattern of HAZARD_PATTERNS) {
    if (pattern.regex.test(text)) {
      if (!primaryHazard) primaryHazard = pattern.type;
      collectedWarnings.push(...pattern.warnings);
      collectedProtocols.push(...pattern.protocols);
    }
  }

  if (collectedWarnings.length > 0) {
    return {
      isHazardous: true,
      hazardType: primaryHazard,
      warnings: Array.from(new Set(collectedWarnings)),
      handlingProtocols: Array.from(new Set(collectedProtocols))
    };
  }

  return {
    isHazardous: false,
    warnings: [],
    handlingProtocols: [
      'Ensure the device is powered off and disconnected from mains before transport.',
      'Wrap rechargeable batteries separately to prevent terminal contact.',
      'Wipe private personal accounts and perform factory resets if the device turns on.'
    ]
  };
}
