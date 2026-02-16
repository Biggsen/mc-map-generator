# MC Map Generator Service - Technical Specification

## 🎯 Project Overview

A standalone microservice that generates high-quality Minecraft biome maps from seeds using Puppeteer automation. Takes seed + dimension as input, returns generated map image URLs. 

**MVP Focus**: Basic functionality with 2k–16k world sizes, ephemeral storage, and Railway deployment.

## 📋 Outstanding Tasks (see task files)

| Task | File | Status |
|------|------|--------|
| Testing suite | [../testing/testing.md](../testing/testing.md) | Not started |
| Performance & monitoring | [../enhancements/performance-monitoring.md](../enhancements/performance-monitoring.md) | Future |
| Future enhancements | [../enhancements/future-enhancements.md](../enhancements/future-enhancements.md) | Future |

## 📁 Repository Structure ✅ IMPLEMENTED

```
mc-map-generator/
├── src/
│   ├── server.js              # ✅ Express API server
│   ├── screenshot.js          # ✅ Puppeteer map generation
│   ├── storage.js             # ✅ Image storage abstraction
│   └── utils.js                # ✅ Helper functions
├── generated-maps/             # ✅ Local image storage
├── tests/                      # ❌ Not implemented (future enhancement)
│   ├── api.test.js            # API endpoint tests
│   └── screenshot.test.js     # Screenshot generation tests
├── docs/                       # ✅ Partial
│   ├── API.md                 # ✅ Complete API documentation
│   └── DEPLOYMENT.md          # ❌ Not yet (future enhancement)
├── package.json               # ✅ Complete
├── railway.json               # ✅ Railway deployment config
├── .env.example              # ✅ Environment variables template (exists but Cursor not aware)
├── .gitignore                 # ✅ Complete
└── README.md                  # ✅ Complete
```

## 🛠 Core Dependencies

```json
{
  "name": "mc-map-generator",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "express": "^4.18.0",
    "puppeteer": "^24.0.0",
    "sharp": "^0.33.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "supertest": "^7.1.3"
  },
  "scripts": {
    "start": "node src/server.js",
    "dev": "node --watch src/server.js",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

## 🔌 API Specification

### Base URLs
- **Production:** `https://mc-map-generator-production.up.railway.app`
- **Local:** `http://localhost:3001`

### Endpoints

#### 1. Generate Map
```http
POST /api/generate
Content-Type: application/json

{
  "seed": "12345",
  "dimension": "overworld",
  "size": 8,
  "debug": false
}
```

**Parameters:**
- `seed` (required): Minecraft seed (string or number)
- `dimension` (optional): `"overworld"`, `"nether"`, or `"end"` (default: `"overworld"`)
- `size` (optional): 2-16 for 2k-16k world (default: `8`)
- `debug` (optional): Save original screenshot before crop (default: `false`)

**Success Response (200):**
```json
{
  "success": true,
  "jobId": "seed-12345-overworld-1703123456789",
  "status": "processing",
  "estimatedTime": "30-60 seconds"
}
```

**Error Responses:** 400 (INVALID_SEED, INVALID_DIMENSION, INVALID_SIZE), 429 (TOO_MANY_JOBS), 500 (SERVER_ERROR)

#### 2. Check Status
```http
GET /api/status/{jobId}
```

**Response (Processing):**
```json
{
  "success": true,
  "jobId": "seed-12345-overworld-1703123456789",
  "status": "processing",
  "progress": "Taking screenshot..."
}
```

**Response (Ready):**
```json
{
  "success": true,
  "jobId": "seed-12345-overworld-1703123456789",
  "status": "ready",
  "imageUrl": "https://mc-map-generator-production.up.railway.app/generated-maps/seed-12345-overworld-8k-1703123456789.png",
  "metadata": {
    "seed": "12345",
    "dimension": "overworld",
    "size": "8k",
    "generatedAt": "2023-12-21T10:30:45Z",
    "fileSize": "245KB",
    "dimensions": "1000x1000"
  }
}
```

When `debug: true` was used in the generate request, the ready response also includes `originalImageUrl` and `originalFilename`.

**Response (Failed):**
```json
{
  "success": true,
  "jobId": "seed-12345-overworld-1703123456789",
  "status": "failed",
  "error": "GENERATION_FAILED",
  "message": "Failed to generate map: Network timeout",
  "retryable": true
}
```

**404 - Job Not Found:** `JOB_NOT_FOUND`

#### 3. Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2023-12-21T10:30:45Z",
  "version": "1.0.0",
  "activeJobs": 2,
  "maxConcurrentJobs": 3
}
```

#### 4. Service Statistics
```http
GET /api/stats
```

**Response:**
```json
{
  "success": true,
  "totalJobs": 15,
  "completedJobs": 12,
  "failedJobs": 1,
  "processingJobs": 2,
  "activeJobs": 2,
  "maxConcurrentJobs": 3
}
```

#### 5. Cleanup Old Jobs
```http
POST /api/cleanup
```

Removes completed/failed jobs older than 24 hours from in-memory tracking. Does not delete image files (ephemeral storage).

**Response:**
```json
{
  "success": true,
  "message": "Cleanup completed",
  "cleanedCount": 5,
  "remainingJobs": 10
}
```

## 🖼 Image Generation Process

### Screenshot Workflow
1. Launch Puppeteer browser (headless, sandbox-disabled for Railway)
2. Navigate to `https://mcseedmap.net/1.21.5-Java/{seed}/{dimension}` (overworld/end use `#l=-3` hash)
3. Handle cookie banner (Manage options → Confirm choices)
4. Toggle sidebar for clean view
5. Configure markers: open Markers tab, enable Village markers
6. Wait for map to load (~10s)
7. Take full-page screenshot (3840×2160)
8. Optionally save original if `debug: true`
9. Crop to map area: `left = 720 + (16-size)×62.5`, `top = 120 + (16-size)×62.5`, `width/height = size×125`
10. Resize to final dimensions (crop size = output size)
11. Save to storage, return image URL

### Supported Dimensions
- `overworld` (default)
- `nether`
- `end`

### Supported Sizes
- Integer from 2 to 16 (representing 2k to 16k world size)
- Default: 8 (8k world size)
- Each increment represents 1k blocks

### Job ID Format
`seed-{seed}-{dimension}-{timestamp}` (e.g. `seed-12345-overworld-1703123456789`)

### Image Specifications (MVP)
- **Format**: PNG
- **Dimensions**: `size × 125` pixels (e.g. 2k→250×250, 8k→1000×1000, 16k→2000×2000)
- **Quality**: High (lossless)
- **File Size**: ~200-500KB typical
- **Storage**: Ephemeral (lost on deployment)

## 💾 Storage Strategy (MVP)

### Ephemeral Storage
- Save to `./generated-maps/` directory
- Serve via Express static middleware
- **No cleanup needed** - files lost on deployment (acceptable for MVP)
- **No persistent storage** - images are one-time use

### Future Enhancements
- AWS S3 integration for persistent storage
- File cleanup and lifecycle management
- Caching strategies

## 🚀 Deployment Configuration

### Railway Configuration
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health"
  }
}
```

### Environment Variables (MVP)
```bash
PORT=3001
NODE_ENV=production
MAX_CONCURRENT_JOBS=3
BASE_URL=https://mc-map-generator-production.up.railway.app  # or localhost for dev
```

## 🧪 Testing Strategy

See **[testing/testing.md](../testing/testing.md)** for detailed test spec:
- Unit tests (API, storage, utils)
- Integration tests (screenshot flow)
- Load testing approach

## 🔒 Error Handling

### Common Error Scenarios
- Invalid seed format
- Network timeouts
- Puppeteer crashes
- Storage failures
- Concurrent job limits

### Error Response Format
```json
{
  "success": false,
  "error": "GENERATION_FAILED",
  "message": "Failed to generate map: Network timeout",
  "jobId": "seed-12345-overworld-1703123456789",
  "retryable": true
}
```

## 🎯 Success Criteria

### MVP Requirements ✅ ALL COMPLETED
- ✅ Generate maps from any valid seed
- ✅ Support all three dimensions
- ✅ Return high-quality images (size×125 pixels, e.g. 1000×1000 for 8k)
- ✅ Handle 3+ concurrent requests
- ✅ Deploy to Railway successfully
- ✅ 95%+ uptime
- ✅ <60 second generation time

### Performance Targets
- **Response Time**: <2 seconds for status checks
- **Generation Time**: 30-60 seconds per map
- **Concurrent Jobs**: 3 simultaneous generations
- **Uptime**: 99%+ availability
- **Error Rate**: <5% failure rate

## 📚 Documentation Requirements

### README.md ✅
- Quick start guide, API examples, local dev setup

### API.md ✅
- Endpoint docs, request/response examples, error codes, rate limiting

### DEPLOYMENT.md
- Railway deployment steps, environment configuration, troubleshooting (deployed)

## 🔄 Development Phases

### Phase 1: Core MVP (Week 1) ✅ COMPLETED
- ✅ Basic Express server
- ✅ Puppeteer screenshot generation (2k–16k world sizes)
- ✅ Ephemeral file storage
- ✅ Simple API endpoints
- ✅ Railway deployment

### Phase 2: Production Ready (Week 2) ✅ COMPLETED
- ✅ Error handling & logging
- ✅ Health checks
- ✅ Basic monitoring
- ✅ Documentation (README.md)

### Phase 3: Enhancements (Week 3+)
See **[enhancements/performance-monitoring.md](../enhancements/performance-monitoring.md)**.

### Phase 4: Advanced Features (Future)
See **[enhancements/future-enhancements.md](../enhancements/future-enhancements.md)**.

## 🏗 Implementation Details

### Core Files to Create

#### 1. `src/server.js`
```javascript
import express from 'express';
import cors from 'cors';
import { generateMap } from './screenshot.js';
import { saveImage, getImageUrl } from './storage.js';

const app = express();
app.use(cors());
app.use(express.json());

// Job tracking
const jobs = new Map();

// API endpoints
app.post('/api/generate', async (req, res) => {
  // Implementation here
});

app.get('/api/status/:jobId', (req, res) => {
  // Implementation here
});

app.get('/api/health', (req, res) => { /* ... */ });
app.get('/api/stats', async (req, res) => { /* ... */ });
app.post('/api/cleanup', (req, res) => { /* ... */ });

// Serve generated images
app.use('/generated-maps', express.static('./generated-maps'));

export default app;
```

#### 2. `src/screenshot.js`
```javascript
import puppeteer from 'puppeteer';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function generateMap(seed, dimension, jobId, size = 8, debug = false) {
  // Puppeteer → mcseedmap.net → cookie/sidebar/markers → screenshot → sharp crop/resize → storage
}
```

#### 3. `src/storage.js`
```javascript
export async function saveImage(buffer, filename) { /* ... */ }
export function getImageUrl(filename) { /* Uses BASE_URL env */ }
export function getImagePath(filename) { /* ... */ }
export async function imageExists(filename) { /* ... */ }
export async function getImageStats(filename) { /* size, sizeFormatted, created */ }
export async function deleteImage(filename) { /* ... */ }
export async function listImages() { /* ... */ }
export async function getStorageInfo() { /* ... */ }
```

No automatic file cleanup (ephemeral storage). Job cleanup via `POST /api/cleanup` removes in-memory job entries only.

### Key Implementation Notes

1. **Job Management**: In-memory Map tracks job status; `POST /api/cleanup` prunes jobs older than 24h
2. **Async Processing**: Generate maps in background, return job ID immediately
3. **Error Recovery**: Puppeteer crashes return `status: 'failed'` with `retryable: true`
4. **Resource Cleanup**: Browser closed in `finally` block
5. **Response Wrapper**: All responses use `createSuccessResponse` / `createErrorResponse` (includes `success` field)

### Implementation Status

The service is implemented in `src/` with the above structure. All API endpoints, screenshot workflow, and storage logic are in place and deployed to Railway.

---

This specification provides everything needed to create a production-ready MC Map Generator service that can be deployed independently and consumed by any frontend application.
