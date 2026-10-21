import { describe, it, expect } from 'vitest';
import { evaluateSafetyRules } from '../src/utils/safetyRules';

describe('Safety Rules Engine', () => {
  it('detects swollen or bulging batteries as critical fire risks', () => {
    const input = 'My old phone has a swollen battery pushing the back cover out.';
    const result = evaluateSafetyRules(input);

    expect(result.isHazardous).toBe(true);
    expect(result.hazardType).toBe('swollen_battery');
    expect(result.warnings.some((w) => /swollen battery/i.test(w))).toBe(true);
    expect(result.handlingProtocols.some((p) => /DO NOT attempt to puncture/i.test(p))).toBe(true);
  });

  it('detects chemical leakage and instructs non-contact protocols', () => {
    const input = 'Old remote control with corroded acid leaking out of the AA battery compartment.';
    const result = evaluateSafetyRules(input);

    expect(result.isHazardous).toBe(true);
    expect(result.hazardType).toBe('leaking_chemical');
    expect(result.warnings.some((w) => /chemical leakage/i.test(w))).toBe(true);
    expect(result.handlingProtocols.some((p) => /gloves/i.test(p))).toBe(true);
  });

  it('detects overheating or smoke hazards', () => {
    const input = 'The charger got hot to touch and started smoking when plugged in.';
    const result = evaluateSafetyRules(input);

    expect(result.isHazardous).toBe(true);
    expect(result.hazardType).toBe('smoke_heat');
    expect(result.warnings.some((w) => /smoke|heat|sparks/i.test(w))).toBe(true);
  });

  it('detects exposed live wires and shock risk', () => {
    const input = 'Power cable with frayed cable and exposed copper wire.';
    const result = evaluateSafetyRules(input);

    expect(result.isHazardous).toBe(true);
    expect(result.hazardType).toBe('exposed_wiring');
    expect(result.warnings.some((w) => /electrical hazard/i.test(w))).toBe(true);
  });

  it('returns standard non-hazardous handling protocols for normal electronics', () => {
    const input = 'Working Dell laptop with cracked hinge, needs recycling.';
    const result = evaluateSafetyRules(input);

    expect(result.isHazardous).toBe(false);
    expect(result.warnings.length).toBe(0);
    expect(result.handlingProtocols.length).toBeGreaterThan(0);
  });
});
