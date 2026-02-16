# Testing Suite

## Overview
Implement automated tests for the MC Map Generator service. Jest and Supertest are already installed; this task creates the `tests/` structure and implements unit, integration, and load tests per the service spec.

## Prerequisites
- [x] Jest ^29.0.0 and Supertest ^7.1.3 in package.json
- [x] `npm test` and `npm run test:watch` scripts configured

## Tasks

### 1. Jest Configuration
- [ ] Add `jest.config.js` (or configure in package.json) for ES modules
- [ ] Set `testEnvironment: 'node'`
- [ ] Configure test match pattern: `tests/**/*.test.js`

### 2. Unit Tests – API Endpoints (`tests/api.test.js`)
- [ ] **POST /api/generate**
  - [ ] Valid request returns jobId, status: processing
  - [ ] Invalid seed → 400 INVALID_SEED
  - [ ] Invalid dimension → 400 INVALID_DIMENSION
  - [ ] Invalid size → 400 INVALID_SIZE
  - [ ] Concurrent job limit → 429 TOO_MANY_JOBS
- [ ] **GET /api/status/:jobId**
  - [ ] Job not found → 404 JOB_NOT_FOUND
  - [ ] Processing job returns progress
  - [ ] Ready job returns imageUrl, metadata
  - [ ] Failed job returns error, message, retryable
- [ ] **GET /api/health**
  - [ ] Returns status: healthy, version, activeJobs, maxConcurrentJobs
- [ ] **GET /api/stats**
  - [ ] Returns totalJobs, completedJobs, failedJobs, processingJobs, activeJobs
- [ ] **POST /api/cleanup**
  - [ ] Returns cleanedCount, remainingJobs

### 3. Unit Tests – Storage (`tests/storage.test.js`)
- [ ] saveImage saves buffer to generated-maps
- [ ] getImageUrl returns correct URL (respects BASE_URL)
- [ ] imageExists returns true/false correctly
- [ ] getImageStats returns size, sizeFormatted, created
- [ ] deleteImage removes file

### 4. Unit Tests – Utils (`tests/utils.test.js`)
- [ ] generateJobId format: `seed-{seed}-{dimension}-{timestamp}`
- [ ] isValidSeed accepts valid string/number, rejects invalid
- [ ] isValidDimension accepts overworld/nether/end
- [ ] isValidSize accepts 2–16, rejects out of range
- [ ] normalizeDimension lowercases dimension

### 5. Integration Tests – Screenshot (`tests/screenshot.test.js`)
- [ ] generateMap with mocked Puppeteer returns expected shape
- [ ] Error handling returns status: failed, retryable: true
- [ ] Option: E2E test against real mcseedmap.net (skip in CI, run manually)

### 6. Load Testing
- [ ] Document load-test approach (e.g. k6, artillery, or simple script)
- [ ] Test 3+ simultaneous /api/generate requests
- [ ] Verify memory doesn't leak across generations
- [ ] Verify browser instances are closed

## Success Criteria
- [ ] `npm test` runs all tests
- [ ] Unit tests pass without starting Puppeteer (mock where needed)
- [ ] API tests use supertest against Express app
- [ ] Integration tests cover screenshot flow (mocked or optional E2E)

## Notes
- Screenshot tests are expensive; prefer mocking Puppeteer for CI
- Ephemeral storage: no file cleanup tests needed for MVP
- Concurrent job limit: test by spawning N requests and asserting 429 on overflow
