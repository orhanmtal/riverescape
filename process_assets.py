import os
from PIL import Image

def process_assets():
    # File Paths
    brain_dir = r"C:\Users\Admin\.gemini\antigravity-ide\brain\9d0af0b4-2e63-4a60-bb94-40feeff2464a"
    workspace_dir = r"c:\Users\Admin\.gemini\antigravity\scratch\RiverEscapeWeb"
    
    cover_src = os.path.join(brain_dir, "river_escape_cover_1779898241697.png")
    icon_src = os.path.join(brain_dir, "river_escape_icon_1779898258030.png")
    
    # Outputs
    cover_dst = os.path.join(workspace_dir, "RiverEscape_Cover.png")
    icon_square_dst = os.path.join(workspace_dir, "RiverEscape_Icon_Square.png")
    icons_folder = os.path.join(workspace_dir, "www", "assets", "icons")
    
    print("[INFO] Starting image processing...")
    
    # 1. Process Cover (800x470)
    if os.path.exists(cover_src):
        img_cover = Image.open(cover_src)
        print(f"Loaded cover source: {img_cover.size}")
        
        # Crop to 800:470 aspect ratio from center
        target_ratio = 800 / 470
        src_w, src_h = img_cover.size
        src_ratio = src_w / src_h
        
        if src_ratio > target_ratio:
            # Source is too wide, crop left/right
            new_w = int(src_h * target_ratio)
            left = (src_w - new_w) // 2
            right = left + new_w
            crop_box = (left, 0, right, src_h)
        else:
            # Source is too tall, crop top/bottom
            new_h = int(src_w / target_ratio)
            top = (src_h - new_h) // 2
            bottom = top + new_h
            crop_box = (0, top, src_w, bottom)
            
        img_cover = img_cover.crop(crop_box)
        img_cover = img_cover.resize((800, 470), Image.Resampling.LANCZOS)
        img_cover.convert("RGB").save(cover_dst, "PNG")
        print(f"[SUCCESS] Cover generated and saved at: {cover_dst}")
    else:
        print(f"[ERROR] Cover source not found at: {cover_src}")

    # 2. Process Icon (512x512 Square)
    if os.path.exists(icon_src):
        img_icon = Image.open(icon_src)
        print(f"Loaded icon source: {img_icon.size}")
        
        # Ensure perfect square (center crop if not square)
        src_w, src_h = img_icon.size
        min_dim = min(src_w, src_h)
        left = (src_w - min_dim) // 2
        top = (src_h - min_dim) // 2
        crop_box = (left, top, left + min_dim, top + min_dim)
        img_icon = img_icon.crop(crop_box)
        
        # Save high-res square PNG to workspace root (for Yandex Console upload)
        img_icon_512 = img_icon.resize((512, 512), Image.Resampling.LANCZOS)
        img_icon_512.save(icon_square_dst, "PNG")
        print(f"[SUCCESS] Square high-res PNG icon saved at: {icon_square_dst}")
        
        # Generate WebP icons in the www/assets/icons/ directory
        if not os.path.exists(icons_folder):
            os.makedirs(icons_folder)
            
        icon_sizes = [512, 256, 192, 128, 96, 72, 48]
        for size in icon_sizes:
            resized_icon = img_icon.resize((size, size), Image.Resampling.LANCZOS)
            icon_path = os.path.join(icons_folder, f"icon-{size}.webp")
            resized_icon.save(icon_path, "WEBP")
            print(f"   Generated icon: icon-{size}.webp")
            
        print("[SUCCESS] Game icons generated successfully in WebP format.")
    else:
        print(f"[ERROR] Icon source not found at: {icon_src}")

if __name__ == "__main__":
    process_assets()
