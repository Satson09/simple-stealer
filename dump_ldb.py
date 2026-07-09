# dump_ldb.py - NirSoft Style Output (Best Effort)
import os
import json
from pathlib import Path
from datetime import datetime

def dump_leveldb(folder_path):
    output = {
        "scan_time": datetime.now().isoformat(),
        "folder_scanned": folder_path,
        "total_files": 0,
        "entries": []
    }

    print(f"\n🔍 Scanning LevelDB files in: {folder_path}\n")

    for root, dirs, files in os.walk(folder_path):
        for file in files:
            if file.endswith(('.ldb', '.log')):
                full_path = os.path.join(root, file)
                output["total_files"] += 1

                print(f"📄 Processing: {file}")

                try:
                    with open(full_path, 'rb') as f:
                        content = f.read()

                    strings = []
                    current = ""
                    for byte in content:
                        if 32 <= byte <= 126 or byte in (9, 10, 13):
                            current += chr(byte)
                        else:
                            if len(current) > 15:   # Longer strings are more useful
                                strings.append(current.strip())
                            current = ""
                    if len(current) > 15:
                        strings.append(current.strip())

                    # Add each useful string as a separate entry (NirSoft style)
                    for s in strings[:100]:   # Limit to avoid huge output
                        if any(k in s.lower() for k in ['token', 'discord', 'session', 'auth', 'cookie', 'email', 'password', 'user', 'rtx', 'rx_']):
                            entry = {
                                "Host Name"   : "Unknown (LevelDB)",
                                "Path"        : "/",
                                "Name"        : file,
                                "Value"       : s[:500] + "..." if len(s) > 500 else s,   # Keep Value readable
                                "Secure"      : "Unknown",
                                "HTTP Only"   : "Unknown",
                                "Source File" : full_path
                            }
                            output["entries"].append(entry)

                except Exception as e:
                    print(f"   ❌ Error reading {file}: {e}")

    # Save to nicely formatted JSON
    json_path = "ldb_dump.json"
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Done! Results saved to: {json_path}")
    print(f"   Total .ldb/.log files : {output['total_files']}")
    print(f"   Useful entries found  : {len(output['entries'])}")

if __name__ == "__main__":
    folder = input("\nEnter the path of the extracted folder: ").strip() or "."
    dump_leveldb(folder)
    input("\nPress Enter to exit...")




# dump_ldb.py - Improved Version (Saves to JSON only)
#import os
#import json
#from pathlib import Path
#from datetime import datetime

#def dump_leveldb(folder_path):
#    output = {
#        "scan_time": datetime.now().isoformat(),
#        "folder_scanned": folder_path,
#        "files_found": 0,
#        "results": []
#    }

#    print(f"\n🔍 Scanning LevelDB files in: {folder_path}\n")

#    for root, dirs, files in os.walk(folder_path):
#        for file in files:
#            if file.endswith(('.ldb', '.log')):
#                full_path = os.path.join(root, file)
#                output["files_found"] += 1

#                print(f"📄 Processing: {file}")

#                try:
#                    with open(full_path, 'rb') as f:
#                        content = f.read()

#                    strings = []
#                    current = ""
#                    for byte in content:
#                        if 32 <= byte <= 126 or byte in (9, 10, 13):  # Printable chars
#                            current += chr(byte)
#                        else:
#                            if len(current) > 10:   # Only meaningful strings
#                                strings.append(current)
#                            current = ""
#                    if len(current) > 10:
#                        strings.append(current)

                    # Filter useful strings
#                    useful = [s for s in strings if any(k in s.lower() for k in
#                        ['token', 'discord', 'session', 'email', 'password', 'auth', 'user', 'cookie'])]

#                    result = {
#                        "filename": file,
#                        "path": full_path,
#                        "useful_strings_found": len(useful),
#                        "strings": useful[:50]  # Limit to first 50 useful strings
#                    }
#                    output["results"].append(result)

#                    if useful:
#                        print(f"   ✅ Found {len(useful)} useful strings")
#                    else:
#                        print(f"   ⚠️  No useful strings found")

#                except Exception as e:
#                    print(f"   ❌ Error reading file: {e}")

    # Save to JSON file
#    json_path = "ldb_dump.json"
#    with open(json_path, 'w', encoding='utf-8') as f:
#        json.dump(output, f, indent=2, ensure_ascii=False)

#    print(f"\n✅ Done! Results saved to: {json_path}")
#    print(f"   Total .ldb/.log files scanned: {output['files_found']}")
#    print(f"   Files with useful data: {len([r for r in output['results'] if r['useful_strings_found'] > 0])}")

#if __name__ == "__main__":
#    folder = input("\nEnter the path of the extracted folder: ").strip() or "."
#    dump_leveldb(folder)
#    input("\nPress Enter to exit...")
