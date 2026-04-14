import os

def fix_files():
    # File Paths
    assets_path = 'www/assets.js'
    game_path = 'www/game_v3.js'
    
    # 1. Fix assets.js (Log mapping for lagoon)
    if os.path.exists(assets_path):
        with open(assets_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace the problematic log source
        # Targeting: 'assets/balloon_elite.png' -> 'assets/Kutuk.png'
        new_content = content.replace("'assets/balloon_elite.png'", "'assets/Kutuk.png'")
        
        if new_content != content:
            with open(assets_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"SUCCESS: {assets_path} updated.")
        else:
            print(f"NOTICE: No change needed for {assets_path} (or string not found).")
    
    # 2. Fix game_v3.js (pKey for Level 7)
    if os.path.exists(game_path):
        with open(game_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace the boat key
        # Targeting: pKey: "nostalji" -> pKey: "ilkbahar"
        # Note: We use double quotes as seen in view_file
        new_content = content.replace('pKey: "nostalji"', 'pKey: "ilkbahar"')
        
        if new_content != content:
            with open(game_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"SUCCESS: {game_path} updated.")
        else:
            print(f"NOTICE: No change needed for {game_path} (or string not found).")

if __name__ == "__main__":
    fix_files()
