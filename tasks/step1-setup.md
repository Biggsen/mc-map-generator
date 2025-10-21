# Step 1: Project Setup Tasks

## Overview
Set up the foundational project structure and core files for the MC Map Generator service.

## Tasks

### 1. Create package.json
- [ ] Create package.json with dependencies from spec (express, puppeteer, sharp, cors, dotenv, jest, supertest)
- [ ] Set up scripts for start, dev, test, and test:watch
- [ ] Configure as ES module with "type": "module"

### 2. Create src/ directory structure
- [ ] Create src/ directory for the main application files
- [ ] Set up the core module structure

### 3. Create generated-maps/ directory
- [ ] Create generated-maps/ directory for image storage
- [ ] Ensure proper permissions for file writing

### 4. Create .env.example
- [ ] Create .env.example with required environment variables:
  - PORT=3000
  - NODE_ENV=production
  - MAX_CONCURRENT_JOBS=3
  - CLEANUP_INTERVAL_HOURS=24
  - MAX_FILE_AGE_DAYS=7

### 5. Create .gitignore
- [ ] Create .gitignore to exclude:
  - generated images
  - node_modules
  - .env files
  - build artifacts
  - logs

### 6. Create src/server.js
- [ ] Create src/server.js with Express server setup
- [ ] Add CORS middleware
- [ ] Add JSON parsing middleware
- [ ] Set up basic route structure
- [ ] Add static file serving for generated-maps

### 7. Create src/screenshot.js
- [ ] Create src/screenshot.js by refactoring Puppeteer logic
- [ ] Adapt from reference/screenshot-mcseedmap.js
- [ ] Convert to async function that returns job status
- [ ] Remove child process spawning logic
- [ ] Add proper error handling

### 8. Create src/storage.js
- [ ] Create src/storage.js with image storage utilities
- [ ] Implement saveImage function
- [ ] Implement getImageUrl function
- [ ] Implement cleanupOldFiles function
- [ ] Add file management helpers

### 9. Create src/utils.js
- [ ] Create src/utils.js with helper functions
- [ ] Add job ID generation
- [ ] Add input validation functions
- [ ] Add error handling utilities
- [ ] Add logging helpers

## Success Criteria
- [ ] All core files created and properly structured
- [ ] Dependencies installed and working
- [ ] Basic server can start without errors
- [ ] Directory structure matches spec requirements
- [ ] Environment configuration ready for deployment

## Notes
- This step focuses on setting up the foundation
- The actual API endpoints and job processing will be implemented in Step 2
- Reference the existing code in reference/ folder for Puppeteer logic
- Follow the spec requirements for file structure and dependencies
