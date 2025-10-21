import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateMap } from './screenshot.js';
import { getImageStats, imageExists } from './storage.js';
import { 
  generateJobId, 
  isValidSeed, 
  isValidDimension, 
  normalizeDimension,
  createErrorResponse,
  createSuccessResponse,
  logInfo,
  logError
} from './utils.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MAX_CONCURRENT_JOBS = parseInt(process.env.MAX_CONCURRENT_JOBS) || 3;

// Middleware
app.use(cors());
app.use(express.json());

// Job tracking (in-memory for MVP)
const jobs = new Map();
let activeJobs = 0;

// Serve generated images as static files
app.use('/generated-maps', express.static('./generated-maps'));

/**
 * Generate a new map
 */
app.post('/api/generate', async (req, res) => {
  try {
    const { seed, dimension = 'overworld' } = req.body;
    
    // Validate input
    if (!isValidSeed(seed)) {
      return res.status(400).json(
        createErrorResponse('INVALID_SEED', 'Seed is required and must be a valid string or number')
      );
    }
    
    if (!isValidDimension(dimension)) {
      return res.status(400).json(
        createErrorResponse('INVALID_DIMENSION', 'Dimension must be one of: overworld, nether, end')
      );
    }
    
    // Check concurrent job limit
    if (activeJobs >= MAX_CONCURRENT_JOBS) {
      return res.status(429).json(
        createErrorResponse('TOO_MANY_JOBS', `Maximum ${MAX_CONCURRENT_JOBS} concurrent jobs allowed`)
      );
    }
    
    const normalizedDimension = normalizeDimension(dimension);
    const jobId = generateJobId(seed, normalizedDimension);
    
    // Initialize job status
    jobs.set(jobId, {
      status: 'processing',
      seed,
      dimension: normalizedDimension,
      createdAt: new Date().toISOString(),
      progress: 'Starting map generation...'
    });
    
    activeJobs++;
    
    logInfo('Map generation job started', {
      jobId,
      seed,
      dimension: normalizedDimension,
      activeJobs
    });
    
    // Start map generation in background
    generateMap(seed, normalizedDimension, jobId)
      .then(result => {
        jobs.set(jobId, {
          ...jobs.get(jobId),
          ...result,
          completedAt: new Date().toISOString()
        });
        activeJobs--;
        
        logInfo('Map generation job completed', {
          jobId,
          status: result.success ? 'success' : 'failed',
          activeJobs
        });
      })
      .catch(error => {
        jobs.set(jobId, {
          ...jobs.get(jobId),
          status: 'failed',
          error: 'GENERATION_FAILED',
          message: error.message,
          completedAt: new Date().toISOString()
        });
        activeJobs--;
        
        logError('Map generation job failed', {
          jobId,
          error: error.message,
          activeJobs
        });
      });
    
    // Return job status immediately
    res.json(createSuccessResponse({
      jobId,
      status: 'processing',
      estimatedTime: '30-60 seconds'
    }));
    
  } catch (error) {
    logError('Error in generate endpoint', { error: error.message });
    res.status(500).json(
      createErrorResponse('SERVER_ERROR', 'Internal server error')
    );
  }
});

/**
 * Check job status
 */
app.get('/api/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = jobs.get(jobId);
    
    if (!job) {
      return res.status(404).json(
        createErrorResponse('JOB_NOT_FOUND', 'Job not found')
      );
    }
    
    // If job is ready, check if image exists and get metadata
    if (job.status === 'ready' && job.filename) {
      const exists = await imageExists(job.filename);
      if (exists) {
        const stats = await getImageStats(job.filename);
        if (stats) {
          job.metadata = {
            ...job.metadata,
            fileSize: stats.sizeFormatted,
            created: stats.created
          };
        }
      }
    }
    
    res.json(createSuccessResponse({
      jobId,
      status: job.status,
      ...(job.status === 'ready' && {
        imageUrl: job.imageUrl,
        metadata: job.metadata
      }),
      ...(job.status === 'processing' && {
        progress: job.progress
      }),
      ...(job.status === 'failed' && {
        error: job.error,
        message: job.message,
        retryable: job.retryable
      })
    }));
    
  } catch (error) {
    logError('Error in status endpoint', { error: error.message });
    res.status(500).json(
      createErrorResponse('SERVER_ERROR', 'Internal server error')
    );
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json(createSuccessResponse({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    activeJobs,
    maxConcurrentJobs: MAX_CONCURRENT_JOBS
  }));
});

/**
 * Get service statistics
 */
app.get('/api/stats', async (req, res) => {
  try {
    const totalJobs = jobs.size;
    const completedJobs = Array.from(jobs.values()).filter(job => job.status === 'ready').length;
    const failedJobs = Array.from(jobs.values()).filter(job => job.status === 'failed').length;
    const processingJobs = Array.from(jobs.values()).filter(job => job.status === 'processing').length;
    
    res.json(createSuccessResponse({
      totalJobs,
      completedJobs,
      failedJobs,
      processingJobs,
      activeJobs,
      maxConcurrentJobs: MAX_CONCURRENT_JOBS
    }));
    
  } catch (error) {
    logError('Error in stats endpoint', { error: error.message });
    res.status(500).json(
      createErrorResponse('SERVER_ERROR', 'Internal server error')
    );
  }
});

/**
 * Clean up old jobs (optional maintenance endpoint)
 */
app.post('/api/cleanup', (req, res) => {
  try {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    let cleanedCount = 0;
    for (const [jobId, job] of jobs.entries()) {
      const jobAge = now - new Date(job.createdAt).getTime();
      if (jobAge > maxAge && (job.status === 'ready' || job.status === 'failed')) {
        jobs.delete(jobId);
        cleanedCount++;
      }
    }
    
    logInfo('Job cleanup completed', { cleanedCount, remainingJobs: jobs.size });
    
    res.json(createSuccessResponse({
      message: 'Cleanup completed',
      cleanedCount,
      remainingJobs: jobs.size
    }));
    
  } catch (error) {
    logError('Error in cleanup endpoint', { error: error.message });
    res.status(500).json(
      createErrorResponse('SERVER_ERROR', 'Internal server error')
    );
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  logError('Unhandled error', { error: error.message, stack: error.stack });
  res.status(500).json(
    createErrorResponse('SERVER_ERROR', 'Internal server error')
  );
});

// 404 handler
app.use((req, res) => {
  res.status(404).json(
    createErrorResponse('NOT_FOUND', 'Endpoint not found')
  );
});

// Start server
app.listen(PORT, () => {
  logInfo('MC Map Generator service started', {
    port: PORT,
    maxConcurrentJobs: MAX_CONCURRENT_JOBS,
    environment: process.env.NODE_ENV || 'development'
  });
});

export default app;
