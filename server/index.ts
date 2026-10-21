/**
 * EcoWaste Navigator - Backend Express Server
 * Handles:
 * - POST /api/identify : Validated Gemini AI e-waste classification with demo fallback
 * - GET /api/facilities : Serves the fictional facility dataset
 * - GET /api/health : Server status and Gemini configuration check (no secrets leaked)
 * - Static file serving for single-port LAN classroom demonstrations
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import os from 'os';
import dotenv from 'dotenv';
import { identifyWaste } from './gemini';
import { validateIdentifyRequest } from './validation';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);
const isLanMode = process.env.LAN_MODE === 'true' || process.argv.includes('--lan');
const BIND_HOST = isLanMode ? '0.0.0.0' : '127.0.0.1';

// Middleware
app.use(cors());
// Set body limits to accommodate base64 image data up to 10 MB
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Facility Dataset
const facilitiesPath = path.resolve(__dirname, '../src/data/facilities.json');
let fictionalFacilities: any[] = [];
try {
  const fileData = fs.readFileSync(facilitiesPath, 'utf-8');
  fictionalFacilities = JSON.parse(fileData);
} catch (err) {
  console.warn('Could not read facilities.json, using in-memory fallback:', err);
}

// 1. Health & Configuration Endpoint (Strictly no secrets returned)
app.get('/api/health', (_req: Request, res: Response) => {
  const hasGeminiKey = Boolean(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE'
  );

  res.json({
    status: 'ok',
    app: 'EcoWaste Navigator',
    version: '1.0.0',
    mode: isLanMode ? 'LAN_DEMO' : 'LOCAL_DEV',
    aiConfigured: hasGeminiKey,
    modelName: process.env.GEMINI_MODEL || 'gemini-flash-latest',
    facilityCount: fictionalFacilities.length,
    timestamp: new Date().toISOString()
  });
});

// 2. Fictional Facilities Endpoint
app.get('/api/facilities', (_req: Request, res: Response) => {
  res.json({
    success: true,
    isDemoDataset: true,
    count: fictionalFacilities.length,
    data: fictionalFacilities
  });
});

// 3. E-Waste Identification Endpoint
app.post('/api/identify', async (req: Request, res: Response) => {
  try {
    const validation = validateIdentifyRequest(req.body);
    if (!validation.isValid || !validation.data) {
      return res.status(400).json({
        success: false,
        error: validation.error || 'Invalid request payload.'
      });
    }

    const aiResult = await identifyWaste(validation.data);

    return res.json({
      success: true,
      result: aiResult,
      isFallbackDemo: Boolean(aiResult.isFallbackDemo)
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown internal error';
    console.error('Identification processing error:', message);
    return res.status(500).json({
      success: false,
      error: 'Failed to process waste classification. Please select category manually.'
    });
  }
});

// Serve frontend build if dist directory exists (for production & LAN classroom demo)
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // Single-page application fallback
  app.get('*', (req: Request, res: Response, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Helper to list local LAN IPv4 addresses
function getLocalIpAddresses(): string[] {
  const interfaces = os.networkInterfaces();
  const addresses: string[] = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  return addresses;
}

// Start Server
app.listen(PORT, BIND_HOST, () => {
  console.log(`====================================================`);
  console.log(`🌱 EcoWaste Navigator Server Running`);
  console.log(`----------------------------------------------------`);
  console.log(`Mode:       ${isLanMode ? '🌐 LAN Demonstration Mode (0.0.0.0)' : '💻 Local Development Mode (127.0.0.1)'}`);
  console.log(`Port:       ${PORT}`);
  console.log(`Local URL:  http://localhost:${PORT}`);

  if (isLanMode) {
    const ips = getLocalIpAddresses();
    console.log(`----------------------------------------------------`);
    console.log(`Classroom / Second Laptop Access URLs:`);
    if (ips.length > 0) {
      ips.forEach((ip) => {
        console.log(`👉 http://${ip}:${PORT}`);
      });
    } else {
      console.log(`   (No active non-loopback network interface detected)`);
    }
    console.log(`Ensure both devices are on the same Wi-Fi and host firewall permits port ${PORT}.`);
  }
  console.log(`====================================================`);
});
