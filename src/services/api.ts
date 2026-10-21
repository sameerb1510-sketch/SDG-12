/**
 * EcoWaste Navigator - Frontend API Client
 * Calls the backend /api/identify endpoint. Never includes API secrets in the browser.
 * Provides transparent fallback if backend is unreachable.
 */

import {
  AIIdentificationResult,
  IdentifyRequestPayload,
  IdentifyResponsePayload,
  WasteCategory
} from '../types/waste';
import { evaluateSafetyRules } from '../utils/safetyRules';

export interface ServerHealth {
  status: string;
  app: string;
  mode: string;
  aiConfigured: boolean;
  modelName: string;
  facilityCount: number;
}

/**
 * Checks server health and Gemini configuration status.
 */
export async function checkServerHealth(): Promise<ServerHealth | null> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Sends text or image payload to backend for Gemini classification.
 */
export async function identifyWasteItem(
  payload: IdentifyRequestPayload
): Promise<AIIdentificationResult> {
  try {
    const response = await fetch('/api/identify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with HTTP status ${response.status}`);
    }

    const data: IdentifyResponsePayload = await response.json();
    if (!data.success || !data.result) {
      throw new Error(data.error || 'Server did not return a valid identification result.');
    }

    return data.result;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn('API call failed; triggering client-side transparent demo fallback:', msg);

    // Client-side emergency fallback so the app continues to function seamlessly
    const text = payload.description || '';
    const safetyCheck = evaluateSafetyRules(text);

    return {
      itemName: payload.userCategoryHint ? `Sample Item (${payload.userCategoryHint})` : 'Electronic Item (Offline Demo)',
      category: payload.userCategoryHint || WasteCategory.OTHER_UNCERTAIN,
      explanation: `[OFFLINE DEMO FALLBACK] The server API was unreachable (${msg}). Using client-side demonstration rules.`,
      certainty: 'Low',
      safetyGuidance: safetyCheck.isHazardous
        ? [...safetyCheck.warnings, ...safetyCheck.handlingProtocols]
        : ['Handle with care and keep away from liquid and extreme heat.'],
      followUpQuestion: 'Would you like to select your category manually below?',
      isHazardous: safetyCheck.isHazardous,
      isFallbackDemo: true
    };
  }
}
