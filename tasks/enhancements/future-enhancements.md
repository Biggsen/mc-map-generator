# Future Enhancements

## Overview
Advanced features deferred beyond MVP. Extracted from the service spec Phase 4 and storage "Future Enhancements."

## Tasks (Future)

### 1. AWS S3 Persistent Storage
- [ ] Add S3 SDK dependency
- [ ] Implement storage abstraction for S3 backend
- [ ] Configure bucket, region, credentials via env
- [ ] Return S3 URLs instead of local `/generated-maps/` URLs
- [ ] Optional: Keep ephemeral as fallback

### 2. File Cleanup & Lifecycle
- [ ] Implement automatic cleanup of old image files
- [ ] Configurable retention (e.g. MAX_FILE_AGE_DAYS)
- [ ] Cron or scheduled job for cleanup
- [ ] Integrate with S3 lifecycle policies if using S3

### 3. Caching Strategies
- [ ] Cache maps by seed+dimension+size to avoid regeneration
- [ ] Cache headers on image responses
- [ ] Optional: Redis or in-memory cache for job status

### 4. Advanced Monitoring
- [ ] APM integration (Datadog, New Relic, etc.)
- [ ] Alerting on failure rate, latency
- [ ] Dashboards for key metrics

## Success Criteria
- [ ] Each item is a clear, implementable enhancement
- [ ] Dependencies and env vars documented when implemented

## Notes
- Explicitly *future*; no immediate implementation expected
- Prioritize based on usage and pain points after performance-monitoring work
