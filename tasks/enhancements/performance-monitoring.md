# Performance & Monitoring Enhancements

## Overview
Post-MVP improvements: performance tuning, load testing, and production monitoring.

## Tasks

### 1. Performance Tuning
- [ ] Profile map generation (identify bottlenecks)
- [ ] Optimize Puppeteer launch args for Railway
- [ ] Consider browser instance pooling vs per-request launch
- [ ] Review Sharp crop/resize parameters
- [ ] Verify generation time stays 30–60s at 8k

### 2. Load Testing
- [ ] Tool selection (k6, artillery, or Node script)
- [ ] Test 3+ concurrent /api/generate requests
- [ ] Measure memory usage across multiple generations
- [ ] Verify browser cleanup (no leak)
- [ ] Document findings and any limits

### 3. Production Monitoring
- [ ] **Key metrics** (from spec):
  - [ ] Request count per minute
  - [ ] Average generation time
  - [ ] Success/failure rates
  - [ ] Storage usage (if applicable)
  - [ ] Memory consumption
- [ ] Instrumentation options:
  - [ ] Structured logging (jobId, duration, fileSize) – partially done
  - [ ] Metrics endpoint or export (e.g. /api/stats expanded)
  - [ ] External APM (e.g. Datadog, New Relic) – optional

### 4. Structured Logging
- [ ] Align logging with spec format:
```json
{
  "timestamp": "2023-12-21T10:30:45Z",
  "level": "info",
  "service": "mc-map-generator",
  "jobId": "seed-12345-overworld-1703123456789",
  "message": "Map generation completed",
  "duration": 45000,
  "fileSize": 245760
}
```

## Success Criteria
- [ ] Load tests pass without memory leaks
- [ ] Monitoring provides visibility into throughput and failures
- [ ] Logs are parseable and useful for debugging

## Notes
- Optional post-MVP; deploy and stabilize first
- Railway provides basic metrics; advanced metrics may need custom instrumentation
