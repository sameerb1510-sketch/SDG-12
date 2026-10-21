/**
 * Input and Output Validation for Backend E-Waste Identification
 */

import {
  ALL_WASTE_CATEGORIES,
  AIIdentificationResult,
  CertaintyLevel,
  IdentifyRequestPayload,
  WasteCategory
} from '../src/types/waste';

const MAX_TEXT_LENGTH = 2000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif'
]);

export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  error?: string;
}

/**
 * Validates incoming identify request payload.
 */
export function validateIdentifyRequest(body: unknown): ValidationResult<IdentifyRequestPayload> {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: 'Request body must be a valid JSON object.' };
  }

  const payload = body as Partial<IdentifyRequestPayload>;
  const { description, imageBase64, imageMimeType, userCategoryHint } = payload;

  const hasDescription = typeof description === 'string' && description.trim().length > 0;
  const hasImage = typeof imageBase64 === 'string' && imageBase64.trim().length > 0;

  if (!hasDescription && !hasImage && !userCategoryHint) {
    return {
      isValid: false,
      error: 'Please provide either a text description, an image, or a category hint.'
    };
  }

  if (hasDescription && description.length > MAX_TEXT_LENGTH) {
    return {
      isValid: false,
      error: `Description exceeds maximum allowed length of ${MAX_TEXT_LENGTH} characters.`
    };
  }

  if (hasImage) {
    if (!imageMimeType || !ALLOWED_MIME_TYPES.has(imageMimeType.toLowerCase())) {
      return {
        isValid: false,
        error: `Unsupported image type '${imageMimeType}'. Allowed types: JPG, PNG, WEBP, HEIC.`
      };
    }

    // Estimate base64 decoded byte length
    const cleanedBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
    const estimatedBytes = Math.ceil((cleanedBase64.length * 3) / 4);

    if (estimatedBytes > MAX_IMAGE_BYTES) {
      return {
        isValid: false,
        error: `Uploaded image size (${(estimatedBytes / (1024 * 1024)).toFixed(1)} MB) exceeds the 5 MB limit.`
      };
    }
  }

  if (userCategoryHint && !ALL_WASTE_CATEGORIES.includes(userCategoryHint as WasteCategory)) {
    return {
      isValid: false,
      error: `Unknown category hint: '${userCategoryHint}'.`
    };
  }

  return {
    isValid: true,
    data: {
      description: hasDescription ? description.trim() : undefined,
      imageBase64: hasImage ? imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '') : undefined,
      imageMimeType: hasImage ? imageMimeType?.toLowerCase() : undefined,
      userCategoryHint: userCategoryHint as WasteCategory | undefined
    }
  };
}

/**
 * Validates and normalizes structured AI output before returning to client.
 */
export function validateAndNormalizeAIResult(
  raw: unknown,
  fallbackCategory?: WasteCategory
): AIIdentificationResult {
  const safeFallbackCategory = fallbackCategory && ALL_WASTE_CATEGORIES.includes(fallbackCategory)
    ? fallbackCategory
    : WasteCategory.OTHER_UNCERTAIN;

  if (!raw || typeof raw !== 'object') {
    return {
      itemName: 'Unidentified Electronic Item',
      category: safeFallbackCategory,
      explanation: 'Could not reliably parse the AI response. Please verify category manually.',
      certainty: 'Uncertain',
      safetyGuidance: [
        'Handle with care.',
        'Disconnect any power source before transport.'
      ],
      isHazardous: false
    };
  }

  const r = raw as Record<string, unknown>;

  // Validate or coerce Item Name
  const itemName = typeof r.itemName === 'string' && r.itemName.trim() !== ''
    ? r.itemName.trim()
    : 'Unknown Electronic Device';

  // Validate or coerce Category to one of the 10 Canonical Enums
  let category: WasteCategory = safeFallbackCategory;
  if (typeof r.category === 'string') {
    const matchedCategory = ALL_WASTE_CATEGORIES.find(
      (c) => c.toLowerCase() === (r.category as string).toLowerCase().trim()
    );
    if (matchedCategory) {
      category = matchedCategory;
    }
  }

  // Validate Explanation
  const explanation = typeof r.explanation === 'string' && r.explanation.trim() !== ''
    ? r.explanation.trim()
    : 'Identified based on user description and visual characteristics.';

  // Validate Certainty
  const validCertainties: CertaintyLevel[] = ['High', 'Medium', 'Low', 'Uncertain'];
  let certainty: CertaintyLevel = 'Medium';
  if (typeof r.certainty === 'string') {
    const c = r.certainty.trim();
    if (validCertainties.includes(c as CertaintyLevel)) {
      certainty = c as CertaintyLevel;
    }
  }

  // Validate Safety Guidance
  let safetyGuidance: string[] = [];
  if (Array.isArray(r.safetyGuidance)) {
    safetyGuidance = r.safetyGuidance
      .filter((g) => typeof g === 'string' && g.trim().length > 0)
      .map((g) => (g as string).trim());
  }
  if (safetyGuidance.length === 0) {
    safetyGuidance = [
      'Ensure the device is powered down before transport.',
      'Protect terminals of batteries with insulating tape.'
    ];
  }

  // Validate followUpQuestion
  const followUpQuestion = typeof r.followUpQuestion === 'string' && r.followUpQuestion.trim().length > 0
    ? r.followUpQuestion.trim()
    : undefined;

  // Validate isHazardous
  const isHazardous = typeof r.isHazardous === 'boolean' ? r.isHazardous : false;

  return {
    itemName,
    category,
    explanation,
    certainty,
    safetyGuidance,
    followUpQuestion,
    isHazardous
  };
}
