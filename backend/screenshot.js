const screenshot = require('screenshot-desktop');

async function takeScreenshot() {
    console.log("[DEBUG] Taking screenshot...");
    try {
        const img = await screenshot({ format: 'png' });
        console.log("[SUCCESS] Screenshot taken");
        return img.toString('base64');
    } catch (e) {
        console.error("[ERROR] Screenshot failed:", e.message);
        return null;
    }
}

module.exports = { takeScreenshot };
