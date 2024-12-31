const puppeteer = require('puppeteer');

// Custom sleep function
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  const TOTAL_RUNNERS = 10; // Total number of concurrent runners
  const FRONTEND_URL = 'http://34.172.125.200'; // Replace with your actual frontend URL
  const WATCH_TIME = 10000; // Watch time in milliseconds (10 seconds)

  const runWorker = async (workerId) => {
    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();

      console.log(`[Worker ${workerId}] Visiting page...`);
      await page.goto(FRONTEND_URL, { waitUntil: 'load' });

      // Locate the username and password input fields
      const username = await page.$('input');
      const allIns = await page.$$('input');
      const password = allIns[1];

      console.log(`[Worker ${workerId}] Entering credentials...`);
      await username.click();
      await username.type('amunim');

      // Wait 250ms between username and password input
      await sleep(250);

      await password.click();
      await password.type('password');

      // Click the login button
      const loginButton = await page.$('button[class="MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-containedPrimary MuiButton-sizeMedium MuiButton-containedSizeMedium MuiButton-colorPrimary MuiButton-fullWidth MuiButton-root MuiButton-contained MuiButton-containedPrimary MuiButton-sizeMedium MuiButton-containedSizeMedium MuiButton-colorPrimary MuiButton-fullWidth css-1gh2gcr"]');
      await loginButton.click();

      // Wait for the video card to appear
      console.log(`[Worker ${workerId}] Waiting for video card...`);
      await page.waitForSelector('img[src="/placeholder.svg"]', { timeout: 0 });

      const videoCard = await page.$(`img[src="/placeholder.svg"]`);
      if (!videoCard) {
        console.log(`[Worker ${workerId}] Video not found!`);
        await browser.close();
        return;
      }

      console.log(`[Worker ${workerId}] Clicking on video...`);
      await videoCard.click();

      // Simulate watching the video using the custom sleep function
      console.log(`[Worker ${workerId}] Watching video...`);
      await sleep(WATCH_TIME);

      console.log(`[Worker ${workerId}] Done watching. Closing browser.`);
      await browser.close();
    } catch (error) {
      console.error(`[Worker ${workerId}] Error:`, error);
    }
  };

  // Create and start all runners
  const runners = [];
  for (let i = 0; i < TOTAL_RUNNERS; i++) {
    runners.push(runWorker(i + 1));
  }

  await Promise.all(runners);
  console.log('All workers have finished.');
})();
