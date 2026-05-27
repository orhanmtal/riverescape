import os
import re

def replace_in_file(filepath, pattern, replacement, encoding='utf-8'):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    with open(filepath, 'r', encoding=encoding) as f:
        content = f.read()
    
    new_content = re.sub(pattern, replacement, content)
    
    if new_content != content:
        with open(filepath, 'w', encoding=encoding) as f:
            f.write(new_content)
        print(f"Updated {filepath}")
    else:
        print(f"No changes in {filepath}")

# 1. index.html
replace_in_file('www/index.html', r'v=v1\.99\.\d+\.\d+', 'v=v1.90.77.33', encoding='utf-8')

# 2. game_unbeatable_v3.js (detect encoding)
try:
    with open('www/game_unbeatable_v3.js', 'r', encoding='utf-16') as f:
        f.read()
    enc = 'utf-16'
except:
    enc = 'utf-8'

replace_in_file('www/game_unbeatable_v3.js', r'VERSION = "v1\.99\.\d+\.\d+"', 'VERSION = "v1.90.77.33"', encoding=enc)
replace_in_file('www/game_unbeatable_v3.js', r'VERSION_CODE = \d+', 'VERSION_CODE = 19077033', encoding=enc)

# 3. build.gradle
replace_in_file('android/app/build.gradle', r'versionCode \d+', 'versionCode 19077033', encoding='utf-8')
replace_in_file('android/app/build.gradle', r'versionName "[^"]+"', 'versionName "1.90.77.33"', encoding='utf-8')

# 4. create_pro_zip.py
replace_in_file('create_pro_zip.py', r'RiverEscapeElite_Yandex_v1\.99\.\d+\.\d+_FINAL_PRO\.zip', 'RiverEscapeElite_Yandex_v1.90.77.33_FINAL_PRO.zip', encoding='utf-8')

print("All version string replacements executed.")
