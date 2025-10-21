# Step 1: Project Setup Tasks (MVP)

## Overview
Set up the foundational project structure and core files for the MC Map Generator service. This MVP focuses on basic functionality with 8k world size only, ephemeral storage, and Railway deployment.

## Tasks

### 1. Create package.json
- [ ] Create package.json with dependencies from spec (express, puppeteer, sharp, cors, dotenv, jest, supertest)
- [ ] Set up scripts for start, dev, test, and test:watch
- [ ] Configure as ES module with "type": "module"

### 2. Create src/ directory structure
- [ ] Create src/ directory for the main application files
- [ ] Set up the core module structure

### 3. Create generated-maps/ directory
- [ ] Create generated-maps/ directory for ephemeral image storage
- [ ] Note: Files will be lost on Railway deployments (acceptable for MVP)

### 4. Create .env.example
- [ ] Create .env.example with required environment variables:
  - PORT=3000
  - NODE_ENV=production
  - MAX_CONCURRENT_JOBS=3
  - (Remove cleanup variables - not needed for ephemeral storage)

### 5. Create .gitignore
- [ ] Create .gitignore to exclude:
  - generated images
  - node_modules
  - .env files
  - build artifacts
  - logs

### 6. Create railway.json
- [ ] Create railway.json with Railway deployment configuration
- [ ] Set Node.js version and build settings
- [ ] Configure health check path

### 7. Create src/server.js
- [ ] Create src/server.js with Express server setup
- [ ] Add CORS middleware
- [ ] Add JSON parsing middleware
- [ ] Set up basic route structure
- [ ] Add static file serving for generated-maps

### 8. Create src/screenshot.js
- [ ] Create src/screenshot.js by refactoring Puppeteer logic
- [ ] Adapt from reference/screenshot-mcseedmap.js
- [ ] Convert to async function that returns job status
- [ ] Remove child process spawning logic
- [ ] Add proper error handling
- [ ] MVP: Use 8k world size defaults only (no 16k option yet)

### 9. Create src/storage.js
- [ ] Create src/storage.js with simplified image storage utilities
- [ ] Implement saveImage function
- [ ] Implement getImageUrl function
- [ ] Remove cleanup functions (not needed for ephemeral storage)
- [ ] Add basic file management helpers

### 10. Create src/utils.js
- [ ] Create src/utils.js with helper functions
- [ ] Add job ID generation
- [ ] Add input validation functions
- [ ] Add error handling utilities
- [ ] Add logging helpers

## Success Criteria
- [ ] All core files created and properly structured
- [ ] Dependencies installed and working
- [ ] Basic server can start without errors
- [ ] Railway configuration ready for deployment
- [ ] MVP functionality: seed + dimension → image generation

## Notes
- **MVP Focus**: Basic functionality with 8k world size only
- **Ephemeral Storage**: Accept that images are lost on deployment
- **Railway Ready**: Configuration optimized for Railway deployment
- **Simplified**: No cleanup, no 16k options, no persistent storage
- **Reference**: Use existing code in reference/ folder for Puppeteer logic
- **Future**: 16k world size and advanced features can be added later
