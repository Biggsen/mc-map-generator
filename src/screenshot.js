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
 * @param {number} size - The size (2-16, representing 2k-16k)
 * @param {boolean} debug - Whether to save the original screenshot
 * @returns {Promise<Object>} Job result with status and image URL
 */
export async function generateMap(seed, dimension, jobId, size = 8, debug = false) {
  let browser;
  
  try {
    logInfo('Starting map generation', { seed, dimension, jobId, size, debug });
    
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
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Take screenshot
    logInfo('Taking screenshot...', { jobId });
    const screenshotBuffer = await page.screenshot({
      fullPage: true,
      type: 'png'
    });
    
    // Save the original screenshot if debug mode is enabled
    let originalFilename, originalFilePath, originalImageUrl;
    if (debug) {
      originalFilename = `seed-${seed}-${dimension}-${size}k-original-${Date.now()}.png`;
      originalFilePath = await saveImage(screenshotBuffer, originalFilename);
      originalImageUrl = getImageUrl(originalFilename);
      logInfo('Original screenshot saved (debug mode)', { jobId, originalFilename });
    }
    
    // Process and save the cropped image
    const processedImage = await processImage(screenshotBuffer, dimension, jobId, size);
    const filename = `seed-${seed}-${dimension}-${size}k-${Date.now()}.png`;
    const filePath = await saveImage(processedImage, filename);
    const imageUrl = getImageUrl(filename);
    
    logInfo('Map generation completed successfully', {
      jobId,
      filename,
      imageUrl,
      ...(debug && {
        originalFilename,
        originalImageUrl,
        originalFileSize: screenshotBuffer.length
      }),
      fileSize: processedImage.length
    });
    
    return {
      success: true,
      jobId,
      status: 'ready',
      imageUrl,
      filename,
      ...(debug && {
        originalImageUrl,
        originalFilename
      }),
      metadata: {
        seed,
        dimension,
        size: `${size}k`,
        generatedAt: new Date().toISOString(),
        fileSize: `${Math.round(processedImage.length / 1024)}KB`,
        ...(debug && {
          originalFileSize: `${Math.round(screenshotBuffer.length / 1024)}KB`
        }),
        dimensions: `${Math.round(size * 125)}x${Math.round(size * 125)}`
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
 * @param {number} size - The size (2-16, representing 2k-16k)
 * @returns {Promise<Buffer>} Processed image buffer
 */
async function processImage(screenshotBuffer, dimension, jobId, size = 8) {
  try {
    logInfo('Processing image...', { jobId, dimension, size });
    
    // Calculate crop parameters using the correct formula
    // Base coordinates for 16k: left: 720, top: 120
    // For each k reduction: add 62.5px to left/top (half of 125px)
    // Size is simply k × 125
    const left = Math.round(720 + (16 - size) * 62.5);
    const top = Math.round(120 + (16 - size) * 62.5);
    const width = Math.round(size * 125);
    const height = Math.round(size * 125);
    
    const cropParams = {
      left,
      top,
      width,
      height
    };
    
    // Final size matches the crop dimensions
    const finalSize = width;
    
    logInfo('Cropping and resizing image', {
      jobId,
      dimension,
      size,
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
      size,
      error: error.message
    });
    throw error;
  }
}
