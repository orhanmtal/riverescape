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

def run_update():
    print("Updating version names to 1.90.77.33 and codes to 19077033...")
    
    # 1. www/version.js
    replace_in_file('www/version.js', r'1\.99\.70\.22', '1.90.77.33')
    replace_in_file('www/version.js', r'19970012', '19077033')
    
    # 2. www/index.html
    replace_in_file('www/index.html', r'1\.99\.70\.22', '1.90.77.33')
    replace_in_file('www/index.html', r'19970012', '19077033')
    
    # 3. www/translations.js
    replace_in_file('www/translations.js', r'1\.99\.70\.22', '1.90.77.33')
    replace_in_file('www/translations.js', r'19970012', '19077033')
    
    # 4. www/game_unbeatable_v3.js (detect encoding)
    try:
        with open('www/game_unbeatable_v3.js', 'r', encoding='utf-16') as f:
            f.read()
        enc = 'utf-16'
    except:
        enc = 'utf-8'
        
    replace_in_file('www/game_unbeatable_v3.js', r'1\.99\.70\.22', '1.90.77.33', encoding=enc)
    replace_in_file('www/game_unbeatable_v3.js', r'19970022', '19077033', encoding=enc)
    
    # 5. android/app/build.gradle
    replace_in_file('android/app/build.gradle', r'1\.99\.70\.22', '1.90.77.33')
    replace_in_file('android/app/build.gradle', r'19970022', '19077033')
    
    # 6. create_pro_zip.py
    replace_in_file('create_pro_zip.py', r'1\.99\.70\.22', '1.90.77.33')
    
    # 7. package.json
    replace_in_file('package.json', r'1\.99\.64', '1.90.77.33')
    
    # 8. update_versions.py
    replace_in_file('update_versions.py', r'1\.99\.70\.22', '1.90.77.33')
    replace_in_file('update_versions.py', r'19970022', '19077033')
    
    print("Done! Version strings updated.")

if __name__ == "__main__":
    run_update()
