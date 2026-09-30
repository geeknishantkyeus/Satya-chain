const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\234afcca-5aef-49ce-b7b4-40e4f1f263da\\screenshots';

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

// Injected Web3 Provider that bridges to localhost:8545 Hardhat node
const providerScript = `
(function() {
  const HARDHAT_RPC = 'http://127.0.0.1:8545';
  const ACCOUNT = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
  const CHAIN_ID = '0x7a69'; // 31337

  window.ethereum = {
    isMetaMask: true,
    isConnected: () => true,
    selectedAddress: ACCOUNT,
    networkVersion: '31337',
    chainId: CHAIN_ID,
    _events: {},
    on: function(event, handler) {
      if (!this._events[event]) this._events[event] = [];
      this._events[event].push(handler);
    },
    removeListener: function(event, handler) {
      if (this._events[event]) {
        this._events[event] = this._events[event].filter(h => h !== handler);
      }
    },
    request: async function({ method, params = [] }) {
      if (method === 'eth_accounts' || method === 'eth_requestAccounts') {
        return [ACCOUNT];
      }
      if (method === 'eth_chainId') {
        return CHAIN_ID;
      }
      if (method === 'net_version') {
        return '31337';
      }
      if (method === 'wallet_switchEthereumChain' || method === 'wallet_requestPermissions') {
        return null;
      }
      // Forward to local hardhat node
      try {
        const res = await fetch(HARDHAT_RPC, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: Date.now(),
            method: method,
            params: params
          })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message || 'RPC Error');
        return data.result;
      } catch (err) {
        console.error('RPC call error:', method, err);
        throw err;
      }
    },
    send: function(method, params) {
      return this.request({ method, params });
    }
  };
})();
`;

async function run() {
  console.log('Launching headless Chrome from:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--window-size=1440,960'
    ],
    defaultViewport: {
      width: 1440,
      height: 960,
      deviceScaleFactor: 1
    }
  });

  const page = await browser.newPage();
  await page.evaluateOnNewDocument(providerScript);

  async function snap(name, delay = 1500) {
    await new Promise(r => setTimeout(r, delay));
    const filePath = path.join(ARTIFACT_DIR, name);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`Saved screenshot: ${name}`);
    return filePath;
  }

  try {
    // 1. Landing Page
    console.log('Navigating to Home...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
    await snap('01_landing_page.png', 2000);

    // 2. Dashboard
    console.log('Navigating to Dashboard...');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
    await snap('02_dashboard.png', 2000);

    // 3. Education Portal
    console.log('Navigating to Education Portal...');
    await page.goto('http://localhost:3000/education', { waitUntil: 'networkidle2' });
    await snap('03_education_portal.png', 2000);

    // 4. Government Portal
    console.log('Navigating to Government Portal...');
    await page.goto('http://localhost:3000/government', { waitUntil: 'networkidle2' });
    await snap('04_government_portal.png', 2000);

    // 5. Land Registry Portal
    console.log('Navigating to Land Portal...');
    await page.goto('http://localhost:3000/land', { waitUntil: 'networkidle2' });
    await snap('05_land_portal.png', 2000);

    // 6. Healthcare Portal
    console.log('Navigating to Healthcare Portal...');
    await page.goto('http://localhost:3000/healthcare', { waitUntil: 'networkidle2' });
    await snap('06_healthcare_portal.png', 2000);

    // 7. Verify Search
    console.log('Navigating to Verify Hub...');
    await page.goto('http://localhost:3000/verify', { waitUntil: 'networkidle2' });
    await snap('07_verify_hub.png', 2000);

    // 8. Open QR Scanner Modal
    console.log('Opening QR Scanner Modal...');
    const scanBtn = await page.$('button[title="Scan QR Code via Camera or File"]');
    if (scanBtn) {
      await scanBtn.click();
      await snap('08_qr_scanner_modal.png', 1500);
      // Close modal
      const closeBtn = await page.$('.fixed button');
      if (closeBtn) await closeBtn.click();
      await new Promise(r => setTimeout(r, 500));
    }

    // 9. Verify a record (e.g. 2024-001)
    console.log('Verifying certificate 2024-001...');
    await page.goto('http://localhost:3000/verify/2024-001?sector=education', { waitUntil: 'networkidle2' });
    await snap('09_verify_record_verified.png', 3000);

    // 10. Open QR Code Modal
    console.log('Opening QR Code Modal...');
    const buttons = await page.$$('button');
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes('Share / View QR')) {
        await b.click();
        break;
      }
    }
    await snap('10_qr_code_modal.png', 1500);

    // 11. Citizen Vault (Student)
    console.log('Navigating to Citizen Vault (/student)...');
    await page.goto('http://localhost:3000/student', { waitUntil: 'networkidle2' });
    await snap('11_citizen_vault.png', 3000);

    console.log('All screenshots captured successfully!');
  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    await browser.close();
  }
}

run();
