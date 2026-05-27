import os
import re

def global_replace(dir_path):
    for root, dirs, files in os.walk(dir_path):
        for file in files:
            filepath = os.path.join(root, file)
            # Skip media and zips
            if file.endswith(('.png', '.jpg', '.mp3', '.wav', '.zip')):
                continue
            
            # Detect encoding
            encodings = ['utf-8', 'utf-16', 'windows-1254']
            content = None
            used_enc = None
            for enc in encodings:
                try:
                    with open(filepath, 'r', encoding=enc) as f:
                        content = f.read()
                    used_enc = enc
                    break
                except:
                    continue
            
            if content is None:
                continue
            
            new_content = content
            # Replace all variations of old versions
            patterns = [
                (r'1\.99\.70\.12', '1.99.70.22'),
                (r'1\.99\.70\.01', '1.99.70.22'),
                (r'1\.99\.70\.00', '1.99.70.22'),
                (r'1\.99\.64\.66', '1.99.70.22')
            ]
            
            for p, r in patterns:
                new_content = re.sub(p, r, new_content)
                
            if new_content != content:
                with open(filepath, 'w', encoding=used_enc) as f:
                    f.write(new_content)
                print(f"Updated {filepath} (encoding: {used_enc})")

global_replace('www')
global_replace('android/app')
print("Deep version update complete.")
