# 🌱 EcoWaste Navigator

> **Student-level sustainability web application for electronic waste classification and demonstration facility discovery in Mumbai.**  
> Developed for coursework and classroom presentation under **UN Sustainable Development Goal 12: Responsible Consumption and Production**.

---

## 📌 Demonstration & Academic Notice

> [!IMPORTANT]
> **All facility records, street addresses, opening hours, and geographic coordinates featured in this application are purely fictional synthetic sample records.**
> They were generated solely for coursework demonstration to showcase waste-stream filtering and straight-line spatial distance algorithms. This application is **not** an active recycling directory and must never be represented as real businesses.

---

## 🚀 Key Features

1. **E-Waste Identification (Three Independent Methods)**
   - **Manual Category Selection:** Instant direct selection across 10 canonical e-waste categories without calling any external API. Features an optional button to ask Gemini AI to review the selection.
   - **Plain Text Description:** Describe damaged gadgets, obsolete items, or faults in natural language (e.g., *"My old laptop does not turn on and battery is bulging"*). Explicit "Identify with AI" button avoids keystroke spam.
   - **Photo Upload:** Select or drag-and-drop gadget photos (JPG, PNG, WebP up to 5 MB) for Gemini multimodal visual inspection. Fully in-memory processing; uploaded photos are never persisted to disk.
   - **Built-in Safety Engine:** Identifies hazards (swollen/leaking batteries, chemical discharge, smoke, exposed wiring) with prominent non-puncture handling warnings.
   - **User Confirmation & Overrides:** Results are never silently applied; users can confirm or manually correct any category before facility discovery.

2. **Fictional Facility Finder & Interactive Map**
   - **Local Synthetic Dataset:** ~20 fictional facilities distributed across Mumbai, Thane, and Navi Mumbai, each tagged with supported canonical categories, hours, and an explicit `isDemo: true` flag.
   - **Strict Stream Filtering:** Only facilities accepting the confirmed category are considered. Incompatible facilities are never recommended.
   - **Haversine Distance Sorting:** Computes straight-line spherical distance between user coordinates and each compatible facility, ranking them from nearest (#1) to farthest.
   - **Top 3 Compatible Results:** Returns the 3 nearest compatible demo centers (or fewer if fewer exist). Distances match identically between the list view and map popups.
   - **Interactive Leaflet Map:** OpenStreetMap tiles with required attribution, custom ranked pins, demo popups, and click-to-relocate functionality.
   - **Flexible Location Setting:** Click anywhere on the map, use optional browser geolocation, or input manual latitude/longitude with one-click reset to Mumbai center.

3. **Zero Budget (₹0) & Offline Resiliency**
   - Built entirely on free and open-source libraries.
   - **Transparent Demo Fallback:** If `GEMINI_API_KEY` is omitted, the API quota is reached, or the network is offline, the app seamlessly runs using rule-based sample results clearly labeled `[DEMO FALLBACK]`.

4. **Classroom Wi-Fi Demonstration Mode**
   - Host personal computer serves both the built frontend and backend API on a single port bound to `0.0.0.0`.
   - A second classroom laptop on the same local Wi-Fi opens `http://<HOST-IP>:5000` without installing Node.js, repository files, or exposing the Gemini API key.

---

## 🛠️ Technology Stack & Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (Browser)                    │
│   React 18 + TypeScript + Vite                              │
│   Leaflet + OpenStreetMap (Interactive Map)                 │
│   Lucide React Icons                                        │
└──────────────────────────────┬──────────────────────────────┘
                               │ Same-origin /api requests
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Server (Node.js)                 │
│   Express API (POST /api/identify, GET /api/facilities)     │
│   Validation & Safety Rules Engine                          │
│   Static Single-Port File Serving (/dist)                   │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      Google Gen AI SDK       │ │   Local JSON Demo Data     │
│   Gemini 2.5 Flash           │ │   (20 Fictional Mumbai     │
│   (Server-side secret key)   │ │    Facility Records)       │
└──────────────────────────────┘ └────────────────────────────┘
```

- **Frontend:** React 18, TypeScript, Vite, Leaflet, Lucide Icons.
- **Backend:** Node.js (v18+ / v20+ / v24+), Express, `@google/genai` (current official Google Gen AI SDK), `cors`, `dotenv`.
- **Testing:** Vitest (unit & integration tests for Haversine, filtering, safety rules, API validation, and secrets audit).
- **Security:** `GEMINI_API_KEY` is strictly confined to the backend server process. No secrets are bundled into client-side JavaScript, emitted in HTTP responses, or committed to Git.

---

## 📋 The 10 Canonical Waste Categories

Shared strictly across UI, AI prompts, dataset, and algorithm:
1. `Phones and tablets`
2. `Computers and laptops`
3. `Batteries`
4. `Cables and chargers`
5. `Audio and video electronics`
6. `Household electronic appliances`
7. `Lighting and electronic devices`
8. `Circuit boards and components`
9. `Printers and peripherals`
10. `Other or uncertain e-waste`

---

## 💻 Prerequisites

- **Node.js:** v18.0.0 or later (Node 20 LTS or Node 24 LTS recommended).
- **npm:** v9.0.0 or later.
- **Modern Web Browser:** Chrome, Edge, Firefox, or Safari with JavaScript enabled.
- **Internet Access:** Required for downloading OpenStreetMap tiles and calling live Gemini AI (not required for manual selection or local demo fallback).

---

## ⚙️ Installation & Setup

### Windows

1. Clone or extract the repository:
   ```cmd
   git clone <YOUR-GITHUB-REPO-URL>
   cd SDG
   ```
2. Install dependencies:
   ```cmd
   npm install
   ```
3. Set up your local environment file:
   ```cmd
   copy .env.example .env
   ```

### Ubuntu / Linux / macOS

1. Clone or extract the repository:
   ```bash
   git clone <YOUR-GITHUB-REPO-URL>
   cd SDG
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your local environment file:
   ```bash
   cp .env.example .env
   ```

---

## 🔑 How to Configure Gemini API Key Safely

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google Account and click **"Create API Key"**.
3. Copy your key string (e.g., `AIzaSy...`).
4. Open your local `.env` file in any text editor and update:
   ```env
   PORT=5000
   GEMINI_API_KEY=AIzaSyYourActualKeyHere
   GEMINI_MODEL=gemini-2.5-flash
   LAN_MODE=false
   ```
5. Save the file.

> [!WARNING]
> **Free Tier Caution:** Google AI Studio offers a free usage tier for Gemini models subject to per-minute rate limits. Usage allowances can change over time. **Do not link a credit card or enable pay-as-you-go billing if you intend to maintain a strict ₹0 budget.**
> If your API key hits rate limits or is omitted, EcoWaste Navigator automatically engages its local demonstration fallback.

---

## 🏃 Running the Application

### Option A: Local Development Mode (Frontend & Backend Hot-Reload)

Runs the Express backend on port `5000` and Vite dev server on port `5173`:
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

*(Alternatively, run them in separate terminals with `npm run dev:server` and `npm run dev:frontend`)*

### Option B: Production Single-Port Mode

Builds the frontend and serves everything via Express on port `5000`:
```bash
npm run build
npm start
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser.

---

## 🧪 Running Automated Tests

Run the full Vitest suite (31 tests covering Haversine distance, boundary conditions, safety rules, category matching, and secrets prevention):
```bash
npm test
```

Test coverage includes:
- **`haversine.test.ts`**: Known coordinate distances (Mumbai to Pune, equatorial distances, zero distance, latitude/longitude bounds checking).
- **`facilityMatcher.test.ts`**: Category filtering, strict exclusion of incompatible facilities, ascending distance ranking, top-3 limit, handling 0 and <3 matches, duplicate facility deduplication.
- **`safetyRules.test.ts`**: Detection of swollen lithium cells, acid/chemical leakage, smoke/overheating, frayed live wires, and default safety handling.
- **`apiValidation.test.ts`**: Payload validation, 5MB image limit, canonical category coercion, offline demo fallback generation, and automated scan ensuring zero API keys exist in client-side code or JSON data.

---

## 🌐 Classroom Wi-Fi Demonstration Guide

To allow a classmate or instructor on a second laptop to interact with your running app without installing anything on their machine:

### 1. Connect Both Laptops to the Same Local Network
Make sure your personal host computer and the second laptop are connected to the same Wi-Fi network (or a phone mobile hotspot).

### 2. Start LAN Demonstration Mode on Your Personal Laptop
Run the dedicated demonstration script:
```bash
npm run demo:network
```
This builds the frontend bundle, binds Express to `0.0.0.0`, and prints your personal computer's local IP address:
```
====================================================
🌱 EcoWaste Navigator Server Running
----------------------------------------------------
Mode:       🌐 LAN Demonstration Mode (0.0.0.0)
Port:       5000
Local URL:  http://localhost:5000
----------------------------------------------------
Classroom / Second Laptop Access URLs:
👉 http://192.168.1.45:5000
👉 http://10.31.41.192:5000
Ensure both devices are on the same Wi-Fi and host firewall permits port 5000.
====================================================
```

### 3. Finding Your Local LAN IP Manually

- **Windows:** Open Command Prompt or PowerShell and type `ipconfig`. Look for **IPv4 Address** under `Wireless LAN adapter Wi-Fi` (e.g. `192.168.1.45`).
- **Ubuntu / Linux:** Open terminal and run `ip addr show` or `hostname -I`. Look for the `192.168.x.x` or `10.x.x.x` address.

### 4. Open from the Second Laptop
On the second laptop's browser, navigate to:
```
http://<YOUR-HOST-IP>:5000
```
(Example: `http://192.168.1.45:5000`)

### 5. Troubleshooting Campus Wi-Fi & Firewalls
- **Same-Origin API:** The frontend makes relative requests (`/api/identify`), so the second laptop never tries to reach its own `localhost`.
- **API Secret Security:** Your `GEMINI_API_KEY` stays exclusively on your personal host laptop.
- **Campus Client Isolation:** Some university Wi-Fi networks block peer-to-peer laptop communication (client isolation). If the second laptop cannot connect:
  1. Turn on a mobile hotspot from your phone and connect both laptops to it, or
  2. Check Windows Defender Firewall on the host laptop to ensure inbound connections on port 5000 are permitted for Private networks, or
  3. Present directly on the host laptop using `http://localhost:5000`.

---

## 🧮 How the Matching Algorithm Works

1. **Category Acquisition:** User selects manually, describes defects in text, or uploads an image. After AI evaluation (or manual selection), the user confirms or overrides the canonical category.
2. **Strict Category Filtering:** The algorithm iterates through `facilities.json` and selects only records where `facility.acceptedCategories.includes(confirmedCategory)`.
3. **Haversine Distance Calculation:** For every compatible facility, straight-line distance is computed:
   $$\Delta\text{lat} = \text{lat}_2 - \text{lat}_1, \quad \Delta\text{lon} = \text{lon}_2 - \text{lon}_1$$
   $$a = \sin^2\left(\frac{\Delta\text{lat}}{2}\right) + \cos(\text{lat}_1)\cos(\text{lat}_2)\sin^2\left(\frac{\Delta\text{lon}}{2}\right)$$
   $$c = 2 \cdot \text{atan2}(\sqrt{a}, \sqrt{1 - a}), \quad d = R \cdot c \quad (R = 6371.0088\text{ km})$$
4. **Sorting & Slicing:** Compatible facilities are sorted in ascending order of $d$ (nearest first). The top 3 results are returned and displayed on the interactive map.

---

## ⚠️ Known Limitations

- **Fictional Demonstration Facilities:** All facilities and addresses in Mumbai are simulated. They do not represent physical businesses.
- **Straight-Line vs Driving Distance:** Distance calculations use spherical straight-line geodesics (Haversine formula). Real road route driving or walking distances will vary based on bridges, traffic, and road layout.
- **Internet Connectivity:** Interactive map tiles (OpenStreetMap) and live Gemini AI calls require active internet connectivity.

---

## 📤 Pushing to GitHub Without Exposing Secrets

1. Verify `.gitignore` contains `.env`:
   ```bash
   git status
   ```
   Ensure `.env` is **never** listed under untracked files. Only `.env.example` should be tracked.
2. Stage and commit your code:
   ```bash
   git add .
   git commit -m "feat: complete EcoWaste Navigator e-waste classification and facility finder"
   ```
3. Push to your GitHub repository:
   ```bash
   git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
   git branch -M main
   git push -u origin main
   ```
4. Confirm on the GitHub website that your secret key is not in any commit.

---

## 📜 License & Credits

- Developed for academic demonstration. Free and open source under the MIT License.
- Map tiles & cartography &copy; [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.
- Multimodal AI assistance powered by [Google Gemini](https://ai.google.dev/).
