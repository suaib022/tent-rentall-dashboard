const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://oakdale.framer.website/');
  await page.waitForLoadState('networkidle');

  const tokens = await page.evaluate(() => {
    const getComputedStyleValue = (el, prop) => window.getComputedStyle(el).getPropertyValue(prop);
    
    // Attempt to extract some general tokens
    const body = document.body;
    const h1 = document.querySelector('h1') || body;
    const button = document.querySelector('button, a[style*="border-radius"], a[style*="background"]') || body;
    const card = document.querySelector('div[style*="box-shadow"], div[style*="border-radius"]') || body;

    return {
      colors: {
        background: getComputedStyleValue(body, 'background-color'),
        text: getComputedStyleValue(body, 'color'),
        primary: getComputedStyleValue(button, 'background-color'),
        primaryText: getComputedStyleValue(button, 'color')
      },
      fonts: {
        body: getComputedStyleValue(body, 'font-family'),
        heading: getComputedStyleValue(h1, 'font-family')
      },
      typography: {
        h1Size: getComputedStyleValue(h1, 'font-size'),
        h1Weight: getComputedStyleValue(h1, 'font-weight'),
        bodySize: getComputedStyleValue(body, 'font-size'),
        bodyWeight: getComputedStyleValue(body, 'font-weight')
      },
      radius: {
        button: getComputedStyleValue(button, 'border-radius'),
        card: getComputedStyleValue(card, 'border-radius')
      }
    };
  });

  fs.mkdirSync(path.join(__dirname, '..', 'docs'), { recursive: true });
  fs.writeFileSync(
    path.join(__dirname, '..', 'docs', 'design-tokens.json'),
    JSON.stringify(tokens, null, 2)
  );

  await browser.close();
  console.log('Tokens extracted.');
})();
