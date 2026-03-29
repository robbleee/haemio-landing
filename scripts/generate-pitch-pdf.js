const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.argv[2] || 'http://localhost:3000';
const OUTPUT_PATH = path.join(__dirname, '../public/Haem.io-pitch.pdf');
const VIEWPORT = { width: 1620, height: 1080, deviceScaleFactor: 2 };

async function generatePitchPDF() {
  console.log(`Connecting to ${BASE_URL}/investors ...`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  // Dismiss cookie banner by setting consent in localStorage before navigating
  await page.goto(`${BASE_URL}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.evaluate(() => localStorage.setItem('cookie-consent', 'accepted'));

  // Navigate to the pitch deck
  await page.goto(`${BASE_URL}/investors`, {
    waitUntil: 'networkidle0',
    timeout: 30000,
  });

  // Wait for the slide to render
  await page.waitForSelector('[class*="slide"]', { timeout: 10000 });
  await sleep(1000);

  // Get total slide count BEFORE entering clean mode (which hides indicators)
  const totalSlides = await page.evaluate(() => {
    const indicators = document.querySelectorAll('[class*="indicator"]');
    return indicators.length || 13;
  });

  // Enter clean mode (hides navigation controls)
  await page.keyboard.press('c');
  await sleep(500);

  console.log(`Found ${totalSlides} slides`);

  // Screenshot each slide
  const screenshots = [];
  for (let i = 0; i < totalSlides; i++) {
    console.log(`  Capturing slide ${i + 1}/${totalSlides}...`);

    // Wait for any animations to settle
    await sleep(400);

    // Find and screenshot only the slide element
    const slideElement = await page.$('[class*="screenView"] [class*="slide"]');
    if (!slideElement) {
      console.warn(`  Could not find slide element for slide ${i + 1}, using full page`);
      screenshots.push(await page.screenshot({ type: 'png' }));
    } else {
      screenshots.push(await slideElement.screenshot({ type: 'png' }));
    }

    // Navigate to next slide (except on last)
    if (i < totalSlides - 1) {
      await page.keyboard.press('ArrowRight');
      await sleep(300);
    }
  }

  console.log('Assembling PDF...');

  // Create a new page to assemble the PDF from screenshots
  const pdfPage = await browser.newPage();

  // Build an HTML page with all slide images, each as a full page
  const imagesHtml = screenshots
    .map((buf, idx) => {
      const b64 = buf.toString('base64');
      return `
        <div class="page" ${idx < screenshots.length - 1 ? '' : ''}>
          <img src="data:image/png;base64,${b64}" />
        </div>`;
    })
    .join('\n');

  await pdfPage.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; }
        body { background: white; }
        .page {
          width: 1620px;
          height: 1080px;
          page-break-after: always;
          overflow: hidden;
        }
        .page:last-child {
          page-break-after: auto;
        }
        .page img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        @media print {
          .page { page-break-after: always; }
          .page:last-child { page-break-after: auto; }
        }
      </style>
    </head>
    <body>${imagesHtml}</body>
    </html>
  `, { waitUntil: 'networkidle0' });

  // Generate PDF with exact 16:9 dimensions
  await pdfPage.pdf({
    path: OUTPUT_PATH,
    width: '1620px',
    height: '1080px',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    preferCSSPageSize: true,
  });

  await browser.close();

  const stats = fs.statSync(OUTPUT_PATH);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`\nDone! PDF saved to: ${OUTPUT_PATH}`);
  console.log(`File size: ${sizeMB} MB`);
  console.log(`Slides: ${totalSlides}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

generatePitchPDF().catch((err) => {
  console.error('Failed to generate PDF:', err);
  process.exit(1);
});
