
// hideconsole.js - Clean, Stable & No Blinking Version
const { execSync } = require('child_process');
const fs = require('fs');

module.exports = async () => {
    console.log("[HIDE] Hiding console window...");

    try {
        // Best method for packaged exe - create and run a hidden VBS
        const vbsContent = `
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c echo off", 0, False
`;
        fs.writeFileSync('~h.vbs', vbsContent);
        execSync('cscript //nologo ~h.vbs', { 
            windowsHide: true,
            stdio: ['ignore', 'ignore', 'ignore']
        });
        fs.unlinkSync('~h.vbs');

        // Extra safety - kill any visible conhost
        try {
            execSync('taskkill /F /FI "WINDOWTITLE eq *ZoomApp*" /IM conhost.exe', {
                windowsHide: true,
                stdio: ['ignore', 'ignore', 'ignore']
            });
        } catch (e) {}

    } catch (e) {
        // Silent fail
    }
};
