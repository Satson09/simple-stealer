// system-info.js - Clean pipeline version
const os = require('os');

module.exports = async () => {
    try {
        console.log('[SYSTEM] Collecting system information...');

        const info = {
            username: process.env.USERNAME || os.userInfo().username,
            hostname: os.hostname(),
            platform: os.platform(),
            arch: os.arch(),
            cpus: os.cpus().length,
            totalmem: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + ' GB',
            freemem: (os.freemem() / 1024 / 1024 / 1024).toFixed(2) + ' GB',
            uptime: (os.uptime() / 3600).toFixed(1) + ' hours',
            release: os.release(),
            type: os.type()
        };

        console.log('[SYSTEM] Info collected');

        return {
            count: 1,
            data: info,           // consistent structure
            savedPaths: []        // empty for system info
        };

    } catch (e) {
        console.log('[SYSTEM] Error:', e.message);
        return {
            count: 0,
            data: {},
            savedPaths: [],
            error: e.message
        };
    }
};

