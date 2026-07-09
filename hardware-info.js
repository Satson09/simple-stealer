// hardware-info.js — Small, clean hardware & system info (adapted from your doc)

const os = require('os');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

module.exports = async () => {
    console.log("[HARDWARE] Collecting system information...");

    const info = {
        hostname: os.hostname(),
        username: process.env.USERNAME || os.userInfo().username,
        cpu: os.cpus()[0].model,
        cpuCores: os.cpus().length,
        ramTotal: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + " GB",
        ramFree: (os.freemem() / 1024 / 1024 / 1024).toFixed(2) + " GB",
        platform: os.platform(),
        arch: os.arch(),
        uptime: (os.uptime() / 3600).toFixed(2) + " hours",
        disks: []
    };

    // Get disk info (Windows only)
    try {
        const { stdout } = await execAsync('wmic logicaldisk get caption,size,freespace', { windowsHide: true });
        const lines = stdout.trim().split('\n').slice(1);

        for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            if (parts.length < 3) continue;
            const caption = parts[0];
            const size = parseInt(parts[1]) || 0;
            const free = parseInt(parts[2]) || 0;

            if (size > 0) {
                info.disks.push({
                    drive: caption,
                    total: (size / 1024 / 1024 / 1024).toFixed(2) + " GB",
                    free: (free / 1024 / 1024 / 1024).toFixed(2) + " GB",
                    used: ((size - free) / 1024 / 1024 / 1024).toFixed(2) + " GB"
                });
            }
        }
    } catch (e) {
        // Silent fallback
    }

    console.log("[HARDWARE] System info collected");
    return info;
};
