from PIL import Image
import os

base_dir = r'C:\Users\Admin\.gemini\antigravity\brain\f7a612bb-2faa-4614-8544-d41f49f36cab'
cover_path = os.path.join(base_dir, 'river_escape_elite_cover_1778527705995.png')
out_path = os.path.join(base_dir, 'river_escape_cover_800x470_final.png')

target_w, target_h = 800, 470

if os.path.exists(cover_path):
    img = Image.open(cover_path)
    img_w, img_h = img.size
    
    # Calculate ratio to cover target (Fill/Crop)
    ratio = max(target_w / img_w, target_h / img_h)
    new_w = int(img_w * ratio)
    new_h = int(img_h * ratio)
    
    # Resize
    img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Center crop
    left = (new_w - target_w) / 2
    top = (new_h - target_h) / 2
    right = (new_w + target_w) / 2
    bottom = (new_h + target_h) / 2
    
    img = img.crop((left, top, right, bottom))
    img.save(out_path)
    print(f'Saved Cover: {out_path}')
else:
    print("Cover not found")
