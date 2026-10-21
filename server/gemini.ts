/**
 * Server-side Gemini AI Integration & Transparent Demo Fallback
 * Official Google Gemini REST API integration with structured output validation.
 * Secrets remain strictly server-side.
 */

import {
  ALL_WASTE_CATEGORIES,
  AIIdentificationResult,
  IdentifyRequestPayload,
  WasteCategory
} from '../src/types/waste';
import { evaluateSafetyRules } from '../src/utils/safetyRules';
import { validateAndNormalizeAIResult } from './validation';

const SYSTEM_INSTRUCTION = `
You are the AI engine for EcoWaste Navigator, an educational e-waste classification platform.
Your task is to classify electronic items into EXACTLY ONE of the following 10 canonical waste categories:
1. "Phones and tablets"
2. "Computers and laptops"
3. "Batteries"
4. "Cables and chargers"
5. "Audio and video electronics"
6. "Household electronic appliances"
7. "Lighting and electronic devices"
8. "Circuit boards and components"
9. "Printers and peripherals"
10. "Other or uncertain e-waste"

Rules:
- Be cautious with certainty. If an item is blurry, partial, or ambiguous, mark certainty as "Low" or "Uncertain" and ask a relevant follow-up question.
- Never invent certainty. Do not assume hidden internal components are visible.
- Always check for hazards (swelling, smoke, scorch marks, leaks, exposed live wires).
- Return clear, practical safety guidance (e.g. insulating terminals, not puncturing swollen cells).
`;

/**
 * Predetermined smart fallback responses when GEMINI_API_KEY is not configured or network/quota error occurs.
 * These are ALWAYS explicitly labeled as demo fallbacks.
 */
export function generateDemoFallbackResponse(
  payload: IdentifyRequestPayload,
  reason: 'missing_key' | 'quota_exceeded' | 'network_error' | 'api_error'
): AIIdentificationResult {
  const text = (payload.description || '').toLowerCase();
  const hint = payload.userCategoryHint;

  let category: WasteCategory = hint || WasteCategory.OTHER_UNCERTAIN;
  let itemName = 'Demonstration Electronic Item';
  let explanation = 'Generated via EcoWaste local demonstration fallback.';
  let certainty: AIIdentificationResult['certainty'] = 'Medium';

  if (payload.imageBase64 && !payload.description) {
    itemName = 'Sample Electronic Device (Image Uploaded)';
    category = hint || WasteCategory.COMPUTERS_LAPTOPS;
    explanation = 'Detected image upload in offline/demo mode. Categorized as general IT equipment for demonstration.';
  } else if (/phone|iphone|android|samsung|pixel|tablet|ipad/i.test(text)) {
    itemName = 'Mobile Phone / Tablet Device';
    category = WasteCategory.PHONES_TABLETS;
    explanation = 'Identified smartphone or tablet device based on description keyword match.';
  } else if (/laptop|desktop|macbook|pc|thinkpad|monitor|ram|hard drive|ssd/i.test(text)) {
    itemName = 'Personal Computer / Laptop';
    category = WasteCategory.COMPUTERS_LAPTOPS;
    explanation = 'Identified computing hardware based on keywords.';
  } else if (/battery|power\s*bank|cell|pack|lithium|li-ion|aaa|aa\b/i.test(text)) {
    itemName = 'Battery Unit / Power Cell';
    category = WasteCategory.BATTERIES;
    explanation = 'Identified standalone or auxiliary battery unit.';
  } else if (/cable|charger|adapter|wire|cord|usb|hdmi/i.test(text)) {
    itemName = 'Power Adapter / Connector Cable';
    category = WasteCategory.CABLES_CHARGERS;
    explanation = 'Identified electrical cabling or power transmission accessory.';
  } else if (/tv|television|speaker|headphone|earphone|radio|camera|soundbar|mic/i.test(text)) {
    itemName = 'Audiovisual Electronic Device';
    category = WasteCategory.AUDIO_VIDEO;
    explanation = 'Identified sound or display electronic hardware.';
  } else if (/fridge|microwave|toaster|blender|vacuum|iron|washing|fan/i.test(text)) {
    itemName = 'Small Household Electronic Appliance';
    category = WasteCategory.HOUSEHOLD_APPLIANCES;
    explanation = 'Identified domestic electrical appliance.';
  } else if (/bulb|led|fluorescent|lamp|tube light|fixture/i.test(text)) {
    itemName = 'Lighting Fixture / Electronic Bulb';
    category = WasteCategory.LIGHTING_DEVICES;
    explanation = 'Identified electronic lighting device or tube.';
  } else if (/circuit|pcb|motherboard|microcontroller|resistor|soldering|chip/i.test(text)) {
    itemName = 'Printed Circuit Board / Electronic Subassembly';
    category = WasteCategory.CIRCUIT_BOARDS;
    explanation = 'Identified modular circuit board or discrete components.';
  } else if (/printer|scanner|keyboard|mouse|webcam|cartridge/i.test(text)) {
    itemName = 'Computer Peripheral / Printer';
    category = WasteCategory.PRINTERS_PERIPHERALS;
    explanation = 'Identified external computing peripheral or imaging device.';
  } else if (hint) {
    itemName = `Demonstration item for ${hint}`;
    category = hint;
    explanation = `Preserved user-chosen category '${hint}' in demonstration mode.`;
  }

  // Evaluate safety rules locally
  const safetyCheck = evaluateSafetyRules(text);

  let statusNote = '';
  if (reason === 'missing_key') {
    statusNote = '[Offline Mode: Pre-configured rule-based result.]';
  } else if (reason === 'quota_exceeded') {
    statusNote = '[Offline Mode: AI capacity limit reached. Pre-configured result.]';
  } else {
    statusNote = '[Offline Mode: Service temporarily unreachable. Showing result.]';
  }

  return {
    itemName,
    category,
    explanation: `${statusNote} ${explanation}`,
    certainty: safetyCheck.isHazardous ? 'High' : certainty,
    safetyGuidance: safetyCheck.isHazardous
      ? [...safetyCheck.warnings, ...safetyCheck.handlingProtocols]
      : safetyCheck.handlingProtocols,
    followUpQuestion: 'Does this category match your electronic item? You can manually select another category below.',
    isHazardous: safetyCheck.isHazardous,
    isFallbackDemo: true
  };
}

/**
 * Main identification coordinator.
 * Calls Google Gemini REST generateContent API with full image/text multimodal support,
 * and falls back safely if unavailable.
 */
export async function identifyWaste(
  payload: IdentifyRequestPayload
): Promise<AIIdentificationResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const configuredModel = process.env.GEMINI_MODEL?.trim() || 'gemini-3.8-flash';

  // 1. Transparent Fallback if no key is configured
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return generateDemoFallbackResponse(payload, 'missing_key');
  }

  try {
    // Build prompt instructions
    let promptText = SYSTEM_INSTRUCTION;
    promptText += '\nAnalyze this electronic waste item:\n';

    if (payload.description) {
      promptText += `User description: "${payload.description}"\n`;
    }
    if (payload.userCategoryHint) {
      promptText += `User suggests category may be: "${payload.userCategoryHint}"\n`;
    }

    promptText += `
Please respond strictly with a valid JSON object matching this schema:
{
  "itemName": "Specific or likely name of the item",
  "category": "Exact match to one of the 10 canonical categories",
  "explanation": "Clear 2-sentence rationale for this categorization",
  "certainty": "High" | "Medium" | "Low" | "Uncertain",
  "safetyGuidance": ["List of safety warnings or handling steps"],
  "followUpQuestion": "Optional follow-up question if item details are ambiguous",
  "isHazardous": true | false
}
`;

    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
      { text: promptText }
    ];

    if (payload.imageBase64 && payload.imageMimeType) {
      parts.push({
        inlineData: {
          mimeType: payload.imageMimeType,
          data: payload.imageBase64
        }
      });
    }

    const requestBody = {
      contents: [{ parts }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    };

    // Candidate models to try in sequence if one experiences demand spikes
    const candidateModels = [
      configuredModel,
      'gemini-3.8-flash',
      'gemini-3.5-flash-lite',
      'gemini-flash-latest'
    ];
    const uniqueModels = Array.from(new Set(candidateModels));

    let responseData: any = null;
    let lastError: string | null = null;

    for (const model of uniqueModels) {
      const cleanModelName = model.replace(/^models\//, '');
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModelName}:generateContent?key=${apiKey}`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const data = await response.json();

        if (data.error) {
          lastError = data.error.message || `API error code ${data.error.code}`;
          continue;
        }

        if (data.candidates && data.candidates[0]?.content?.parts) {
          responseData = data;
          break; // Succeeded!
        }
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }

    if (!responseData) {
      throw new Error(lastError || 'No response candidates returned from Gemini API.');
    }

    // Extract text from parts (filtering out any non-text parts)
    const contentParts = responseData.candidates[0]?.content?.parts || [];
    let responseText = '';
    for (const part of contentParts) {
      if (typeof part.text === 'string' && part.text.trim()) {
        responseText = part.text.trim();
        break;
      }
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // Clean markdown fences if present
      const cleaned = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      parsed = JSON.parse(cleaned);
    }

    const normalized = validateAndNormalizeAIResult(parsed, payload.userCategoryHint);

    // Apply safety rule overlay: If user description contains severe hazards, guarantee hazard flags
    const localSafety = evaluateSafetyRules(payload.description || '');
    if (localSafety.isHazardous) {
      normalized.isHazardous = true;
      normalized.safetyGuidance = Array.from(
        new Set([...localSafety.warnings, ...localSafety.handlingProtocols, ...normalized.safetyGuidance])
      );
    }

    normalized.isFallbackDemo = false;
    return normalized;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Gemini API call failed, falling back to local demo logic:', errorMsg);

    let reason: 'quota_exceeded' | 'network_error' | 'api_error' = 'api_error';
    if (errorMsg.includes('429') || /quota|resource_exhausted/i.test(errorMsg)) {
      reason = 'quota_exceeded';
    } else if (/econnrefused|enotfound|fetch failed|timeout|abort/i.test(errorMsg)) {
      reason = 'network_error';
    }

    return generateDemoFallbackResponse(payload, reason);
  }
}
