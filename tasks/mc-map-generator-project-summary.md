<!-- PROJECT-MANIFEST:START -->
```json
{
  "schemaVersion": 1,
  "projectId": "mc-map-generator",
  "name": "MC Map Generator",
  "repo": "Biggsen/mc-map-generator",
  "visibility": "public",
  "status": "active",
  "domain": "minecraft",
  "type": "microservice",
  "lastUpdated": "2025-10-25",
  "links": {
    "prod": "https://mc-map-generator-production.up.railway.app",
    "staging": null
  },
  "tags": ["microservice", "nodejs", "express", "puppeteer", "minecraft", "automation"]
}
```
<!-- PROJECT-MANIFEST:END -->

# MC Map Generator - Project Summary

## Project Overview

**MC Map Generator** is a standalone microservice that generates high-quality Minecraft biome maps from seeds using Puppeteer automation. The service automates the process of taking screenshots from mcseedmap.net and processes them into optimized PNG images.

The service accepts a Minecraft seed and dimension as input, then:
1. Launches a headless Puppeteer browser
2. Navigates to mcseedmap.net with the specified seed/dimension
3. Handles UI interactions (cookie banners, sidebar toggles)
4. Takes a full-page screenshot
5. Crops and resizes the image to the requested world size
6. Returns a public URL to the generated map image

### Key Features

- Generate biome maps from any valid Minecraft seed
- Support for all three dimensions (overworld, nether, end)
- Configurable world sizes (2k-16k)
- Concurrent job processing (max 3 simultaneous)
- High-quality 1000x1000 pixel PNG output
- Async job processing with status polling

**Generation Time**: 30-60 seconds per map  
**Image Format**: PNG, 1000x1000 pixels (final output)  
**File Size**: ~200-500KB typical

---

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Automation**: Puppeteer
- **Image Processing**: Sharp
- **Module System**: ES Modules
- **Deployment**: Railway
- **Testing**: Jest, Supertest (dependencies installed, tests not yet written)

### Key Dependencies

- express: ^4.18.0
- puppeteer: ^24.0.0
- sharp: ^0.33.0
- cors: ^2.8.5
- dotenv: ^16.0.0

### Core Components

```
src/
├── server.js          # Express API server with job management
├── screenshot.js      # Puppeteer automation and image processing
├── storage.js          # File storage utilities
└── utils.js           # Helper functions (validation, logging, etc.)
```

---

## Current Focus

Currently focused on maintaining production stability and preparing for enhancements. The MVP is complete and deployed to Railway. Next priorities include implementing a comprehensive test suite and creating deployment documentation.

---

## Features (Done)

- [x] Express API server with full endpoint implementation
- [x] Puppeteer automation for map generation
- [x] Image processing (crop, resize) with Sharp
- [x] Support for all 3 dimensions (overworld, nether, end)
- [x] Configurable world sizes (2k-16k)
- [x] Concurrent job handling (max 3 simultaneous)
- [x] Job status tracking (in-memory Map)
- [x] Error handling and logging
- [x] Health check and monitoring endpoints
- [x] Railway deployment configuration
- [x] CORS support
- [x] Input validation
- [x] Structured logging
- [x] Static file serving for generated images
- [x] Ephemeral file storage (local filesystem)
- [x] README.md - Quick start and overview
- [x] docs/API.md - Complete API documentation
- [x] spec/mc-map-generator-service-spec.md - Technical specification

### Detailed Completed Features

#### Core Map Generation Service
- Full Express API server with 5 endpoints
- Async job processing with status polling
- Puppeteer browser automation with UI interaction handling
- Image processing pipeline (screenshot → crop → resize)
- Support for all Minecraft dimensions and world sizes
- Concurrent job management with resource limits

#### API Endpoints
- **POST** `/api/generate` - Creates async map generation job
- **GET** `/api/status/:jobId` - Poll endpoint for job completion
- **GET** `/api/health` - Service health status
- **GET** `/api/stats` - Service statistics
- **POST** `/api/cleanup` - Manual cleanup of old completed jobs

#### Documentation
- Complete README with quick start guide
- Comprehensive API documentation with examples
- Technical specification document

---

## Enhancements

- [ ] Persistent Storage - Move from ephemeral local storage to AWS S3
- [ ] Automated File Cleanup - Scheduled cleanup job instead of manual endpoint
- [ ] Advanced Monitoring - Metrics collection, performance monitoring, memory tracking
- [ ] Caching Strategies - Cache frequently requested seeds to reduce redundant generations
- [ ] Performance Optimization - Load testing, memory usage optimization, browser resource management improvements
- [ ] Enhanced Error Recovery - Automatic retry mechanisms, better error categorization

### High Priority Enhancements

#### Persistent Storage (AWS S3)
- **Status**: Currently using ephemeral local storage
- **Required**: AWS S3 integration
  - Upload generated images to S3
  - Serve images from S3 URLs
  - Handle S3 credentials and configuration
- **Impact**: Images lost on Railway deployments
- **Current Workaround**: Ephemeral storage acceptable for MVP

#### Automated File Cleanup
- **Status**: Manual cleanup endpoint exists, no automation
- **Required**:
  - Scheduled cleanup job (cron or interval)
  - Configurable retention period
  - Automatic deletion of old files
- **Impact**: Storage may fill up over time
- **Current**: Manual `/api/cleanup` endpoint available

#### Advanced Monitoring
- **Status**: Basic logging exists, structured format
- **Required**:
  - Metrics collection (request rates, success/failure rates)
  - Performance monitoring (generation times)
  - Memory usage tracking
  - Integration with monitoring services
- **Impact**: Limited visibility into production performance

### Medium Priority Enhancements

#### Caching Strategies
- Cache frequently requested seeds
- Reduce redundant map generations
- **Status**: Not implemented

#### Performance Optimization
- Load testing
- Memory usage optimization
- Browser resource management improvements
- **Status**: Basic implementation complete, optimization needed

#### Enhanced Error Recovery
- Automatic retry mechanisms
- Better error categorization
- **Status**: Basic error handling exists

---

## Outstanding Tasks

### High Priority

- [ ] Testing Suite - Jest and Supertest dependencies exist, but no tests written
  - Unit tests for API endpoints (`tests/api.test.js`)
  - Integration tests for screenshot generation (`tests/screenshot.test.js`)
  - Error handling tests
  - Input validation tests
  - **Impact**: No automated testing, potential for regressions

- [ ] Deployment Documentation - Referenced in spec but file doesn't exist
  - Create `docs/DEPLOYMENT.md`
  - Railway deployment steps
  - Environment configuration guide
  - Monitoring setup
  - Troubleshooting guide
  - **Impact**: Deployment knowledge not documented

---

## Project Status

**Overall Status**: Active - MVP Complete, Production Ready  
**Completion**: ~85% (MVP complete, enhancements pending)  
**Last Major Update**: October 2025

### Metrics

- **Code Coverage**: 0% (no tests implemented)
- **API Endpoints**: 5
- **Supported Dimensions**: 3 (overworld, nether, end)
- **Supported World Sizes**: 15 (2k-16k)
- **Concurrent Jobs**: 3 maximum
- **Generation Time**: 30-60 seconds
- **Uptime Target**: 99%+ availability

### Deployment Status

**Production**:
- **Platform**: Railway
- **Status**: ✅ Deployed
- **URL**: `https://mc-map-generator-production.up.railway.app`
- **Health Check**: `/api/health`
- **Configuration**: `railway.json`

**Local Development**: `http://localhost:3001`

### Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (production/development)
- `MAX_CONCURRENT_JOBS` - Max simultaneous jobs (default: 3)
- `BASE_URL` - Base URL for image URLs (optional)

### MVP Requirements Status

- ✅ Generate maps from any valid seed
- ✅ Support all three dimensions
- ✅ Return high-quality 1000x1000 images
- ✅ Handle 3+ concurrent requests
- ✅ Deploy to Railway successfully
- ✅ 95%+ uptime target
- ✅ <60 second generation time

### Performance Targets

- **Response Time**: <2 seconds for status checks ✅
- **Generation Time**: 30-60 seconds per map ✅
- **Concurrent Jobs**: 3 simultaneous generations ✅
- **Uptime**: 99%+ availability (target)
- **Error Rate**: <5% failure rate (target)

---

## Next Steps

### Immediate (Next 1-2 weeks)

1. **Write Test Suite** - Critical for maintaining code quality
   - Unit tests for API endpoints
   - Integration tests for screenshot generation
   - Error handling and validation tests

2. **Create Deployment Guide** - Document deployment process
   - Railway deployment steps
   - Environment configuration
   - Monitoring and troubleshooting

### Short-term (Next 1-3 months)

1. **Implement Persistent Storage** - Move to S3 for production reliability
   - AWS S3 integration
   - Image upload and serving from S3
   - Configuration management

2. **Add Automated Cleanup** - Prevent storage issues
   - Scheduled cleanup job
   - Configurable retention period

3. **Enhance Monitoring** - Better production visibility
   - Metrics collection
   - Performance monitoring
   - Memory tracking

### Long-term (3+ months)

1. **Caching Strategies** - Reduce redundant generations
2. **Performance Optimization** - Load testing and optimization
3. **Advanced Features** - Rate limiting, authentication if needed

---

## Notes

### Design Decisions

1. **Ephemeral Storage**: Chosen for MVP simplicity, acceptable trade-off for initial deployment
2. **In-Memory Job Tracking**: Simple for MVP, may need Redis for scale
3. **Puppeteer**: Reliable but resource-intensive, requires careful management
4. **Async Job Processing**: Returns immediately, improves UX

### Technical Challenges

- Puppeteer browser management and resource cleanup
- Image processing and cropping accuracy
- Handling dynamic web page interactions
- Concurrent job resource management

### Future Considerations

- Consider Redis for job tracking at scale
- Database for job history and analytics
- CDN for image delivery
- Rate limiting per user/IP
- Authentication/authorization if needed

### Code Quality

**Strengths**:
- Clean, modular architecture
- Comprehensive error handling
- Structured logging
- Input validation
- Well-documented API
- ES6+ modern JavaScript

**Areas for Improvement**:
- No automated tests
- Missing deployment documentation
- Ephemeral storage (acceptable for MVP)
- No automated cleanup
- Limited monitoring/metrics

### Development Phases

**✅ Phase 1: Core MVP (Week 1) - COMPLETE**
- Basic Express server
- Puppeteer screenshot generation
- Ephemeral file storage
- Simple API endpoints
- Railway deployment

**✅ Phase 2: Production Ready (Week 2) - COMPLETE**
- Error handling & logging
- Health checks
- Basic monitoring
- Documentation (README.md, API.md)

**🔄 Phase 3: Enhancements (Week 3+) - PENDING**
- 16k world size optimization
- Performance tuning
- Load testing
- Production monitoring improvements

**🔄 Phase 4: Advanced Features (Future) - PENDING**
- AWS S3 persistent storage
- Automated file cleanup processes
- Caching strategies
- Advanced monitoring

---

## Related Documentation

- **README.md** - Quick start and overview
- **docs/API.md** - Complete API documentation with examples
- **spec/mc-map-generator-service-spec.md** - Technical specification
- **tasks/step1-setup.md** - Setup task completion log
