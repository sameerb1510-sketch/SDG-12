import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  validateIdentifyRequest,
  validateAndNormalizeAIResult
} from '../server/validation';
import { generateDemoFallbackResponse } from '../server/gemini';
import { ALL_WASTE_CATEGORIES, WasteCategory } from '../src/types/waste';

describe('Backend API Validation, Demo Fallback & Security Audit', () => {
  describe('Input Validation (validateIdentifyRequest)', () => {
    it('accepts valid text description', () => {
      const res = validateIdentifyRequest({
        description: 'Old wireless router with power cord'
      });
      expect(res.isValid).toBe(true);
      expect(res.data?.description).toBe('Old wireless router with power cord');
    });

    it('rejects empty payloads', () => {
      expect(validateIdentifyRequest({}).isValid).toBe(false);
      expect(validateIdentifyRequest(null).isValid).toBe(false);
      expect(validateIdentifyRequest({ description: '   ' }).isValid).toBe(false);
    });

    it('rejects descriptions exceeding 2000 characters', () => {
      const longText = 'a'.repeat(2001);
      const res = validateIdentifyRequest({ description: longText });
      expect(res.isValid).toBe(false);
      expect(res.error).toMatch(/maximum allowed length/i);
    });

    it('accepts supported image MIME types and rejects unsupported ones', () => {
      const validJpg = validateIdentifyRequest({
        imageBase64: 'dGVzdA==',
        imageMimeType: 'image/jpeg'
      });
      expect(validJpg.isValid).toBe(true);

      const invalidGif = validateIdentifyRequest({
        imageBase64: 'dGVzdA==',
        imageMimeType: 'image/gif'
      });
      expect(invalidGif.isValid).toBe(false);
      expect(invalidGif.error).toMatch(/unsupported image type/i);
    });

    it('rejects base64 images exceeding 5 MB limit', () => {
      // 5 MB = 5 * 1024 * 1024 bytes. In base64, ~7 million characters.
      // 8 million characters exceeds 5MB
      const hugeBase64 = 'A'.repeat(8 * 1024 * 1024);
      const res = validateIdentifyRequest({
        imageBase64: hugeBase64,
        imageMimeType: 'image/png'
      });
      expect(res.isValid).toBe(false);
      expect(res.error).toMatch(/exceeds the 5 MB limit/i);
    });
  });

  describe('AI Response Normalization (validateAndNormalizeAIResult)', () => {
    it('normalizes valid raw AI response into canonical category', () => {
      const raw = {
        itemName: 'Samsung Galaxy S9',
        category: 'Phones and tablets',
        explanation: 'Smartphone with touch screen.',
        certainty: 'High',
        safetyGuidance: ['Discharge battery to below 30% before transit.'],
        isHazardous: false
      };

      const result = validateAndNormalizeAIResult(raw);
      expect(result.itemName).toBe('Samsung Galaxy S9');
      expect(result.category).toBe(WasteCategory.PHONES_TABLETS);
      expect(result.certainty).toBe('High');
      expect(result.isHazardous).toBe(false);
    });

    it('safely handles malformed categories by falling back to safe fallback or Other', () => {
      const rawMalformed = {
        itemName: 'Strange Widget',
        category: 'Non-existent Category 1234',
        explanation: 'Unknown.',
        certainty: 'Uncertain'
      };

      const result = validateAndNormalizeAIResult(rawMalformed, WasteCategory.COMPUTERS_LAPTOPS);
      expect(result.category).toBe(WasteCategory.COMPUTERS_LAPTOPS);
    });

    it('safely handles non-object or null input from LLM', () => {
      const result = validateAndNormalizeAIResult(null);
      expect(result.itemName).toBe('Unidentified Electronic Item');
      expect(result.category).toBe(WasteCategory.OTHER_UNCERTAIN);
      expect(result.certainty).toBe('Uncertain');
    });
  });

  describe('Demo Fallback Generator (Offline Mode)', () => {
    it('returns explicitly labeled demonstration result when GEMINI_API_KEY is missing', () => {
      const result = generateDemoFallbackResponse(
        { description: 'Broken iPhone screen' },
        'missing_key'
      );

      expect(result.isFallbackDemo).toBe(true);
      expect(result.category).toBe(WasteCategory.PHONES_TABLETS);
      expect(result.explanation).toMatch(/DEMO FALLBACK/i);
    });

    it('identifies batteries and triggers hazard rules in fallback mode', () => {
      const result = generateDemoFallbackResponse(
        { description: 'Swollen lithium-ion power bank' },
        'missing_key'
      );

      expect(result.isFallbackDemo).toBe(true);
      expect(result.category).toBe(WasteCategory.BATTERIES);
      expect(result.isHazardous).toBe(true);
      expect(result.safetyGuidance.some((g) => /swollen/i.test(g))).toBe(true);
    });
  });

  describe('Security Audit: Zero Secret Leaks', () => {
    it('ensures no secret keys or passwords exist in frontend sources or JSON dataset', () => {
      const filesToCheck = [
        path.resolve(__dirname, '../src/data/facilities.json'),
        path.resolve(__dirname, '../src/services/api.ts'),
        path.resolve(__dirname, '../src/App.tsx'),
        path.resolve(__dirname, '../src/types/waste.ts'),
        path.resolve(__dirname, '../index.html')
      ];

      const forbiddenPatterns = [
        /AIzaSy[0-9a-zA-Z_-]{30,}/, // Typical Google API key pattern
        /sk-[0-9a-zA-Z]{20,}/,
        /password\s*=\s*['"][^'"]+['"]/i
      ];

      for (const filePath of filesToCheck) {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          for (const pattern of forbiddenPatterns) {
            expect(content).not.toMatch(pattern);
          }
        }
      }
    });

    it('verifies .env.example contains only placeholders, not actual secrets', () => {
      const envExamplePath = path.resolve(__dirname, '../.env.example');
      expect(fs.existsSync(envExamplePath)).toBe(true);
      const envContent = fs.readFileSync(envExamplePath, 'utf-8');
      expect(envContent).toContain('YOUR_GEMINI_API_KEY_HERE');
      expect(envContent).not.toMatch(/AIzaSy[0-9a-zA-Z_-]{30,}/);
    });
  });
});
