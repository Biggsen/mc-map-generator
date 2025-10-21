import puppeteer from 'puppeteer';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { saveImage, getImageUrl } from './storage.js';
import { generateJobId, logInfo, logError, logWarn } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generate a Minecraft map screenshot using Puppeteer
 * @param {string} seed - The Minecraft seed
 * @param {string} dimension - The dimension (overworld, nether, end)
 * @param {string} jobId - Unique job identifier
 * @returns {Promise<Object>} Job result with status and image URL
 */
export async function generateMap(seed, dimension, jobId) {
  let browser;
  
  try {
    logInfo('Starting map generation', { seed, dimension, jobId });
    
    // Launch browser with optimized settings
    logInfo('Launching browser...', { jobId });
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set viewport for consistent screenshot size
    await page.setViewport({ width: 3840, height: 2160 });
    
    // Build URL with dimension in the path
    const url = dimension === 'nether' 
      ? `https://mcseedmap.net/1.21.5-Java/${seed}/${dimension}`
      : `https://mcseedmap.net/1.21.5-Java/${seed}/${dimension}#l=-3`;
    
    logInfo('Navigating to mcseedmap.net', { jobId, url });
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Handle cookie banner
    await handleCookieBanner(page, jobId);
    
    // Toggle sidebar for clean view
    await toggleSidebar(page, jobId);
    
    // Configure markers for better map display
    await configureMarkers(page, jobId);
    
    // Wait for map to fully load
    logInfo('Waiting for map to load...', { jobId });
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Take screenshot
    logInfo('Taking screenshot...', { jobId });
    const screenshotBuffer = await page.screenshot({
      fullPage: true,
      type: 'png'
    });
    
    // Process and save the image
    const processedImage = await processImage(screenshotBuffer, dimension, jobId);
    const filename = `seed-${seed}-${dimension}-${Date.now()}.png`;
    const filePath = await saveImage(processedImage, filename);
    const imageUrl = getImageUrl(filename);
    
    logInfo('Map generation completed successfully', {
      jobId,
      filename,
      imageUrl,
      fileSize: processedImage.length
    });
    
    return {
      success: true,
      jobId,
      status: 'ready',
      imageUrl,
      filename,
      metadata: {
        seed,
        dimension,
        generatedAt: new Date().toISOString(),
        fileSize: `${Math.round(processedImage.length / 1024)}KB`,
        dimensions: '1000x1000'
      }
    };
    
  } catch (error) {
    logError('Map generation failed', {
      jobId,
      seed,
      dimension,
      error: error.message
    });
    
    return {
      success: false,
      jobId,
      status: 'failed',
      error: 'GENERATION_FAILED',
      message: `Failed to generate map: ${error.message}`,
      retryable: true
    };
    
  } finally {
    if (browser) {
      try {
        await browser.close();
        logInfo('Browser closed', { jobId });
      } catch (error) {
        logWarn('Error closing browser', { jobId, error: error.message });
      }
    }
  }
}

/**
 * Handle cookie banner on the page
 * @param {Object} page - Puppeteer page object
 * @param {string} jobId - Job identifier for logging
 */
async function handleCookieBanner(page, jobId) {
  try {
    logInfo('Checking for cookie banner...', { jobId });
    
    // Click "Manage options" button
    await page.click('button.fc-cta-manage-options');
    logInfo('Clicked "Manage options"', { jobId });
    
    // Wait for the options to appear
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Click "Confirm choices" button
    await page.click('button.fc-confirm-choices');
    logInfo('Clicked "Confirm choices"', { jobId });
    
    // Wait for banner to disappear
    await new Promise(resolve => setTimeout(resolve, 1000));
    
  } catch (error) {
    logWarn('Cookie banner not found or already handled', { jobId, error: error.message });
  }
}

/**
 * Toggle sidebar for clean view
 * @param {Object} page - Puppeteer page object
 * @param {string} jobId - Job identifier for logging
 */
async function toggleSidebar(page, jobId) {
  try {
    logInfo('Looking for toggle sidebar button...', { jobId });
    await page.click('button[title="Toggle sidebar"]');
    logInfo('Clicked toggle sidebar button', { jobId });
    
    // Wait for sidebar to toggle
    await new Promise(resolve => setTimeout(resolve, 1000));
    
  } catch (error) {
    logWarn('Toggle sidebar button not found', { jobId, error: error.message });
  }
}

/**
 * Configure markers for better map display
 * @param {Object} page - Puppeteer page object
 * @param {string} jobId - Job identifier for logging
 */
async function configureMarkers(page, jobId) {
  try {
    // Click on the Markers tab
    logInfo('Looking for Markers tab...', { jobId });
    await page.click('button[title="Markers"]');
    logInfo('Clicked Markers tab', { jobId });
    
    // Wait for markers panel to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Click on the Village button
    logInfo('Looking for Village button...', { jobId });
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const villageButton = buttons.find(btn => btn.textContent.includes('Village'));
      if (villageButton) {
        villageButton.click();
        return true;
      }
      return false;
    });
    logInfo('Clicked Village button', { jobId });
    
    // Wait for village markers to appear
    await new Promise(resolve => setTimeout(resolve, 2000));
    
  } catch (error) {
    logWarn('Marker configuration failed', { jobId, error: error.message });
  }
}

/**
 * Process the screenshot image (crop and resize)
 * @param {Buffer} screenshotBuffer - Raw screenshot buffer
 * @param {string} dimension - The dimension type
 * @param {string} jobId - Job identifier for logging
 * @returns {Promise<Buffer>} Processed image buffer
 */
async function processImage(screenshotBuffer, dimension, jobId) {
  try {
    logInfo('Processing image...', { jobId, dimension });
    
    // Set crop parameters and final size based on dimension
    let cropParams, finalSize;
    
    if (dimension === 'nether') {
      // Nether crop parameters
      cropParams = {
        left: 720,
        top: 120,
        width: 2000,
        height: 2000
      };
      finalSize = 1000;
    } else {
      // Overworld/End crop parameters (8k world size for MVP)
      cropParams = {
        left: 1220,
        top: 620,
        width: 1000,
        height: 1000
      };
      finalSize = 1000;
    }
    
    logInfo('Cropping and resizing image', {
      jobId,
      dimension,
      cropParams,
      finalSize
    });
    
    // Process the image with Sharp
    const processedBuffer = await sharp(screenshotBuffer)
      .extract(cropParams)
      .resize(finalSize, finalSize)
      .png()
      .toBuffer();
    
    logInfo('Image processing completed', {
      jobId,
      originalSize: screenshotBuffer.length,
      processedSize: processedBuffer.length
    });
    
    return processedBuffer;
    
  } catch (error) {
    logError('Image processing failed', {
      jobId,
      dimension,
      error: error.message
    });
    throw error;
  }
}
