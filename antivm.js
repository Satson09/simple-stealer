// antivm.js - Smarter & Less Aggressive
const os = require('os');
const { exec } = require('child_process');

module.exports = async () => {
    console.log("[ANTIVM] Running anti-VM checks...");

    try {
        const checks = await Promise.all([
            checkUsername(),
            checkHostname(),
            checkRAM(),
            checkVirtualHardware()
        ]);

        const isVM = checks.some(result => result === true);

        if (isVM) {
            console.log("[ANTIVM] VM / Sandbox detected — exiting silently");
            process.exit(0);
        } else {
            console.log("[ANTIVM] Clean environment — continuing");
        }
    } catch (e) {
        console.log("[ANTIVM] Check failed, continuing anyway...");
    }
};

const checkUsername = () => {
    const username = os.userInfo().username.toLowerCase();
    const badUsers = ['wdagutilityaccount', 'test', 'sandbox', 'virus', 'malware', 'honey'];
    return badUsers.some(u => username.includes(u));
};

const checkHostname = () => {
    const hostname = os.hostname().toLowerCase();
    const badHosts = ['vm-', 'vbox', 'sandbox', 'virtual', 'qemu', 'xen', 'test'];
    return badHosts.some(h => hostname.includes(h));
};

const checkRAM = () => {
    const ramGB = os.totalmem() / 1024 / 1024 / 1024;
    return ramGB < 2.5;        // Only flag very low RAM
};

const checkVirtualHardware = async () => {
    return new Promise((resolve) => {
        exec('wmic path win32_videocontroller get name', { windowsHide: true }, (err, stdout) => {
            if (err) return resolve(false);

            const str = (stdout || '').toLowerCase();
            if (str.includes('vmware') || str.includes('virtualbox') ||
                str.includes('vbox') || str.includes('qemu') || str.includes('hyper-v')) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
};

// antivm.js — Testing version (disabled for now)

module.exports = async () => {
    console.log("[ANTIVM] Anti-VM check skipped for testing");
    console.log("[ANTIVM] Running in test mode - continuing...");
    // No exit - we bypass detection during development
};


